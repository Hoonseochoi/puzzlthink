-- 기록실 챌린지 tab: one leaderboard per solo challenge, each player's best run, with today's rank move.
-- Boards: slither (boards owned), gyulhap10 / gyulhap5 (score), hexagon (challenge score), nemo_easy / nemo_normal / nemo_hard (30-minute correct answers).

create or replace function public.challenge_rows(p_board text)
returns table(user_id uuid, score integer, sub integer, rnk integer)
language sql stable security definer set search_path = public as $$
  with runs as (
    -- 결합 timed challenges: best score, then the shorter run.
    select r.user_id, (r.detail ->> 'score')::int as score, nullif(r.detail ->> 'durationMs', '')::int as sub, r.played_at
      from public.game_results r
     where p_board in ('gyulhap10', 'gyulhap5') and r.game = 'gyulhap' and r.mode = 'solo'
       and r.detail ->> 'mode' = case p_board when 'gyulhap10' then 'challenge10' else 'challenge5' end
       and (r.detail ->> 'score') ~ '^-?[0-9]+$'
    union all
    -- 헥사곤 challenge: best score.
    select r.user_id, (r.detail ->> 'score')::int, null, r.played_at
      from public.game_results r
     where p_board = 'hexagon' and r.game = 'hexagon' and r.mode = 'solo' and r.detail ->> 'mode' = 'challenge'
       and (r.detail ->> 'score') ~ '^-?[0-9]+$'
    union all
    -- 네모 세기 30-minute challenge: most correct, then the faster average.
    select r.user_id, (r.detail ->> 'correct')::int, nullif(r.detail ->> 'avgMs', '')::int, r.played_at
      from public.game_results r
     where p_board like 'nemo\_%' and r.game = 'nemo_count' and r.mode = 'solo'
       and r.detail ->> 'difficulty' = substr(p_board, 6) and (r.detail ->> 'correct') ~ '^[0-9]+$'
  ),
  best as (
    select distinct on (x.user_id) x.user_id, x.score, x.sub, x.played_at
      from runs x where x.score > 0
     order by x.user_id, x.score desc, x.sub asc nulls last, x.played_at
  ),
  ranked as (
    select b.user_id, b.score, b.sub, (row_number() over (order by b.score desc, b.sub asc nulls last, b.played_at))::int as rnk
      from best b join public.profiles p on p.id = b.user_id where p.show_in_hall
  )
  select * from ranked
  union all
  select o.user_id, o.maps, o.best_ms, o.rnk from public.slither_owner_rows() o where p_board = 'slither';
$$;
revoke all on function public.challenge_rows(text) from public, anon, authenticated;

create or replace function public.challenge_top(p_board text, p_limit integer default 3)
returns table(rank integer, nickname text, avatar_url text, score integer, sub integer, prev_rank integer)
language sql stable security definer set search_path = public as $$
  select c.rnk, coalesce(nullif(p.nickname, ''), 'Player'), p.avatar_url, c.score, c.sub, public.rank_prev('chal:' || p_board, c.user_id, c.rnk)
    from public.challenge_rows(p_board) c join public.profiles p on p.id = c.user_id
   where c.rnk <= least(greatest(p_limit, 1), 20)
   order by c.rnk, c.sub nulls last;
$$;
revoke all on function public.challenge_top(text, integer) from public;
grant execute on function public.challenge_top(text, integer) to anon, authenticated;

-- Daily snapshots now include the challenge boards.
create or replace function public.rank_snapshot_ensure()
returns void language plpgsql security definer set search_path = public as $$
declare d date := public.kst_today(); b text;
begin
  insert into public.rank_snapshot_days (day) values (d) on conflict do nothing;
  if not found then return; end if;
  insert into public.rank_snapshots (day, board, user_id, rank)
    select d, 'hall:' || h.game, h.user_id, h.rn from public.hall_ranking() h where h.rn <= 100
    on conflict do nothing;
  insert into public.rank_snapshots (day, board, user_id, rank)
    select d, 'open:' || g.game, r.user_id, r.rnk
      from (select distinct game from public.game_results where mode = 'friend' and detail ->> 'open' = 'true') g,
           lateral public.open_ranking_rows(g.game) r
     where r.rnk <= 100
    on conflict do nothing;
  insert into public.rank_snapshots (day, board, user_id, rank)
    select d, 'slither', o.user_id, o.rnk from public.slither_owner_rows() o where o.rnk <= 100
    on conflict do nothing;
  foreach b in array array['slither', 'gyulhap10', 'gyulhap5', 'hexagon', 'nemo_easy', 'nemo_normal', 'nemo_hard'] loop
    insert into public.rank_snapshots (day, board, user_id, rank)
      select d, 'chal:' || b, c.user_id, c.rnk from public.challenge_rows(b) c where c.rnk <= 100
      on conflict do nothing;
  end loop;
  delete from public.rank_snapshots where day < d - 7;
  delete from public.rank_snapshot_days where day < d - 7;
end; $$;
revoke all on function public.rank_snapshot_ensure() from public, anon, authenticated;

-- Today's snapshot was taken before these boards existed: add them now (ranks as of now = no move today).
insert into public.rank_snapshots (day, board, user_id, rank)
  select public.kst_today(), 'chal:' || b, c.user_id, c.rnk
    from unnest(array['slither', 'gyulhap10', 'gyulhap5', 'hexagon', 'nemo_easy', 'nemo_normal', 'nemo_hard']) b, lateral public.challenge_rows(b) c
   where c.rnk <= 100 and exists (select 1 from public.rank_snapshot_days where day = public.kst_today())
  on conflict do nothing;

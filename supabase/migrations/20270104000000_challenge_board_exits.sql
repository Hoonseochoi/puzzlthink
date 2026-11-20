-- Timed challenges (결!합!, 헥사곤, 네모 세기): a run whose player left the board 3+ times (another tab or app) is saved
-- with detail.voided = 'left_board' and stays off the challenge rankings.
create or replace function public.challenge_rows(p_board text)
returns table(user_id uuid, score integer, sub integer, rnk integer)
language sql stable security definer set search_path = public as $$
  with runs as (
    select r.user_id, (r.detail ->> 'score')::int as score, nullif(r.detail ->> 'durationMs', '')::int as sub, r.played_at
      from public.game_results r
     where p_board in ('gyulhap10', 'gyulhap5') and r.game = 'gyulhap' and r.mode = 'solo'
       and r.detail ->> 'mode' = case p_board when 'gyulhap10' then 'challenge10' else 'challenge5' end
       and (r.detail ->> 'score') ~ '^-?[0-9]+$' and not (r.detail ? 'voided')
    union all
    select r.user_id, (r.detail ->> 'score')::int, null, r.played_at
      from public.game_results r
     where p_board = 'hexagon' and r.game = 'hexagon' and r.mode = 'solo' and r.detail ->> 'mode' = 'challenge'
       and (r.detail ->> 'score') ~ '^-?[0-9]+$' and not (r.detail ? 'voided')
    union all
    select r.user_id, (r.detail ->> 'correct')::int, nullif(r.detail ->> 'avgMs', '')::int, r.played_at
      from public.game_results r
     where p_board like 'nemo\_%' and r.game = 'nemo_count' and r.mode = 'solo'
       and r.detail ->> 'difficulty' = substr(p_board, 6) and (r.detail ->> 'correct') ~ '^[0-9]+$' and not (r.detail ? 'voided')
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

create or replace function public.nemo_challenge_top(p_difficulty text, p_limit integer default 10)
returns table(rank integer, nickname text, correct integer, avg_ms integer)
language sql stable security definer set search_path = public as $$
  with best as (
    select distinct on (r.user_id) r.user_id, (r.detail ->> 'correct')::int as correct, nullif(r.detail ->> 'avgMs', '')::int as avg_ms, r.played_at
      from public.game_results r
     where r.game = 'nemo_count' and r.mode = 'solo' and r.detail ->> 'difficulty' = p_difficulty and (r.detail ->> 'correct') ~ '^[0-9]+$'
       and not (r.detail ? 'voided')
     order by r.user_id, (r.detail ->> 'correct')::int desc, nullif(r.detail ->> 'avgMs', '')::int asc nulls last, r.played_at
  )
  select (row_number() over (order by b.correct desc, b.avg_ms asc nulls last, b.played_at))::int, coalesce(nullif(p.nickname, ''), 'Player'), b.correct, b.avg_ms
    from best b join public.profiles p on p.id = b.user_id
   where p.show_in_hall and b.correct > 0
   order by 1 limit least(greatest(p_limit, 1), 20);
$$;

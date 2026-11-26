-- 수식의 탑: the 10-minute challenge is 어려움 only. Board 'eqtower' ranks 어려움 runs and every run from before
-- levels (no level saved); 보통 challenge runs from the day both levels had one are left out. Undoes the short-lived
-- board 'eqtower_hard' (20271126100000).
-- Generated from the live definitions on 2026-11-26; only the 수식의 탑 lines change.

CREATE OR REPLACE FUNCTION public.challenge_rows(p_board text)
 RETURNS TABLE(user_id uuid, score integer, sub integer, rnk integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    -- 수식 신호등 · 수식의 탑 10분 챌린지: equations solved / points. For 수식 신호등, sub = guesses used (fewer first on a tie).
    select r.user_id, (r.detail ->> 'score')::int,
           case when r.game = 'equation_signal' and (r.detail ->> 'guesses') ~ '^[0-9]{1,5}$' then (r.detail ->> 'guesses')::int end, r.played_at
      from public.game_results r
     where ((p_board = 'eqsignal' and r.game = 'equation_signal')
            or (p_board = 'eqtower' and r.game = 'equation_tower' and coalesce(r.detail ->> 'level', 'hard') = 'hard'))
       and r.mode = 'solo' and r.detail ->> 'mode' = 'challenge'
       and (r.detail ->> 'score') ~ '^[0-9]{1,4}$' and not (r.detail ? 'voided')
    union all
    -- sub = minus the run's biggest block: the ranking shows it as the player's picture, and on a tied score
    -- the bigger block goes first (sub sorts ascending).
    select r.user_id, (r.detail ->> 'score')::int,
           case when (r.detail ->> 'max') ~ '^[0-9]{1,6}$' then -((r.detail ->> 'max')::int) end, r.played_at
      from public.game_results r
     where p_board = 'merge2048' and r.game = 'merge2048' and r.mode = 'solo' and r.detail ->> 'mode' = 'endless'
       and (r.detail ->> 'score') ~ '^[0-9]+$' and (r.detail ->> 'moves') ~ '^[0-9]+$' and not (r.detail ? 'voided')
       -- A run spawns at most a 4 per move, so its blocks add up to at most 4·(moves + 2), and every point of
       -- score is one of those values merged again (at most 16 times on the way to 131072): drop runs past that.
       and (r.detail ->> 'score')::bigint <= 64 * ((r.detail ->> 'moves')::bigint + 2)
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
  select o.user_id, o.maps, o.best_ms, o.rnk from public.slither_owner_rows() o where p_board = 'slither'
  union all
  select l.user_id, l.maps, l.best_ms, l.rnk from public.logic_owner_rows(p_board) l where p_board in ('masyu', 'nonogram', 'starbattle', 'binairo', 'onestroke', 'colorlink', 'magicswap')
  union all
  select h.user_id, h.points, h.games, h.rnk from public.hw_rank_rows() h where p_board = 'hidden_word';
$function$;

CREATE OR REPLACE FUNCTION public.rank_snapshot_ensure()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  foreach b in array array['slither', 'gyulhap10', 'gyulhap5', 'hexagon', 'nemo_easy', 'nemo_normal', 'nemo_hard', 'masyu', 'nonogram', 'starbattle', 'binairo', 'onestroke', 'colorlink', 'magicswap', 'merge2048', 'eqsignal', 'eqtower', 'hidden_word'] loop
    insert into public.rank_snapshots (day, board, user_id, rank)
      select d, 'chal:' || b, c.user_id, c.rnk from public.challenge_rows(b) c where c.rnk <= 100
      on conflict do nothing;
  end loop;
  delete from public.rank_snapshots where day < d - 7;
  delete from public.rank_snapshot_days where day < d - 7;
end; $function$;

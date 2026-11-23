-- 2048 ranking pictures: the 'merge2048' challenge board carries each player's biggest block of their best run
-- (as sub = -max), so the ranking can draw that block character instead of the stone avatar.
-- Generated from the live definition on 2026-11-24.

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
  select l.user_id, l.maps, l.best_ms, l.rnk from public.logic_owner_rows(p_board) l where p_board in ('masyu', 'nonogram', 'starbattle', 'binairo', 'onestroke', 'colorlink', 'magicswap');
$function$;

-- Cached tops computed before this change have no block yet.
delete from public.rpc_cache where key like 'challenge_top:merge2048:%';

notify pgrst, 'reload schema';

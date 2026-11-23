-- 2048: the 10-minute challenge became 챌린지 도전 (one board until no move is left, no undo). The 'merge2048'
-- challenge board now ranks the best 챌린지 도전 score (detail.mode = 'endless'), with a plausibility cap on score
-- against moves (generated from the live definition on 2026-11-24), and challenge_place() for the result popup's rank.

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
    select r.user_id, (r.detail ->> 'score')::int, null, r.played_at
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

-- Where a score lands on a challenge board (for the 2048 result popup): the place this score would take,
-- how many players are ranked, and the caller's own rank and best (null when signed out or not ranked).
create or replace function public.challenge_place(p_board text, p_score integer)
 returns table(place integer, players integer, my_rank integer, my_best integer)
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  with rows as (select * from public.challenge_rows(p_board))
  select (1 + count(*) filter (where r.score > p_score and r.user_id is distinct from auth.uid()))::int,
         count(*)::int,
         (select x.rnk from rows x where x.user_id = auth.uid()),
         (select x.score from rows x where x.user_id = auth.uid())
    from rows r;
$function$;

revoke all on function public.challenge_place(text, integer) from public;
grant execute on function public.challenge_place(text, integer) to anon, authenticated;

notify pgrst, 'reload schema';

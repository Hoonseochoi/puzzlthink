-- 컬러 링크 joins AI 헬모드. Its former only AI is now '매우 어려움' (difficulty = 'hell'); 어려움 is a new, softer AI.
-- Hell wins in color_link_duel earn black pieces and a hell certificate from now on. Earlier wins were recorded as
-- difficulty = 'hard' and stay hard wins (they keep their 어려움 certificates and gold pieces).
-- Only the game list changes in the three functions below; everything else is the live definition as it was.
-- Apply by hand: docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 < this file

CREATE OR REPLACE FUNCTION public.is_hell_clear(p_game text, p_mode text, p_result text, p_detail jsonb)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  select p_result = 'win' and p_mode = 'ai'
     and coalesce(p_detail ->> 'difficulty', p_detail ->> 'level', '') = 'hell'
     and p_game in ('wallgo2', 'wallgo', 'janggi', 'russian_janggi', 'blind_gomoku', 'color_link_duel')
     and (p_game not in ('wallgo', 'wallgo2') or coalesce(p_detail ->> 'players', '') = '2');
$function$
;

CREATE OR REPLACE FUNCTION public.black_piece_rows(p_week integer)
 RETURNS TABLE(user_id uuid, rn integer, pieces bigint, per_game jsonb, last_win timestamp with time zone, prev_rn integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with b as (
    select * from public.hell_week_bounds(p_week)
  ), cutoff as (
    select (date_trunc('day', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul') as t
  ), hell as (
    select r.user_id, r.game, r.played_at,
           lag(r.played_at) over (partition by r.user_id, r.game order by r.played_at) as prev_at
      from public.game_results r, b
     where r.game in ('wallgo2', 'wallgo', 'janggi', 'russian_janggi', 'blind_gomoku', 'color_link_duel')
       and r.mode = 'ai' and r.result = 'win'
       and public.is_hell_clear(r.game, r.mode, r.result, r.detail)
       and r.played_at >= b.starts and r.played_at < b.ends
  ), counted as (
    select h.* from hell h where h.prev_at is null or h.played_at - h.prev_at >= interval '60 seconds'
  ), wins as (
    select c.user_id, c.game, count(*) as n, max(c.played_at) as last_win from counted c group by c.user_id, c.game
  ), totals as (
    select w.user_id, sum(w.n)::bigint as pieces, jsonb_object_agg(w.game, w.n) as per_game, max(w.last_win) as last_win
      from wins w group by w.user_id
  ), ranked as (
    select t.*, row_number() over (order by t.pieces desc, t.last_win asc, t.user_id) as rn
      from totals t join public.profiles p on p.id = t.user_id
     where p.show_in_hall
  ), prev_totals as (
    select c.user_id, count(*)::bigint as pieces, max(c.played_at) as last_win
      from counted c, cutoff x where c.played_at < x.t group by c.user_id
  ), prev_ranked as (
    select t.user_id, row_number() over (order by t.pieces desc, t.last_win asc, t.user_id) as rn
      from prev_totals t join public.profiles p on p.id = t.user_id
     where p.show_in_hall
  )
  select k.user_id, k.rn::int, k.pieces, k.per_game, k.last_win, y.rn::int
    from ranked k left join prev_ranked y on y.user_id = k.user_id;
$function$
;

CREATE OR REPLACE FUNCTION public.hell_ai_record_live()
 RETURNS TABLE(game text, ai_wins integer, ai_losses integer, draws integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select r.game,
         count(*) filter (where r.result = 'loss')::int,
         count(*) filter (where r.result = 'win')::int,
         count(*) filter (where r.result = 'draw')::int
    from public.game_results r
   where r.game in ('wallgo2', 'wallgo', 'janggi', 'russian_janggi', 'blind_gomoku', 'color_link_duel')
     and r.mode = 'ai'
     and coalesce(r.detail ->> 'difficulty', r.detail ->> 'level', '') = 'hell'
     and (r.game not in ('wallgo', 'wallgo2') or coalesce(r.detail ->> 'players', '') = '2')
   group by r.game;
$function$
;

notify pgrst, 'reload schema';

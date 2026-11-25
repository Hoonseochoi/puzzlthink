-- 블랙피스 경쟁전: 러시아장기 매우 어려움 has a line that always wins, so its wins stop counting at 30 a week
-- per player. Wins already on the board when the cap went in (2026-11-26 08:06 KST) stay: a player who was
-- past 30 keeps that number and earns no more from 러시아장기 that week.
-- Built from the live black_piece_rows (20271126010000_color_link_duel_hell.sql); only `capped` is new.

create or replace function public.black_piece_rows(p_week integer)
returns table(user_id uuid, rn integer, pieces bigint, per_game jsonb, last_win timestamptz, prev_rn integer)
language sql stable security definer set search_path to 'public'
as $function$
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
  ), spaced as (
    select h.* from hell h where h.prev_at is null or h.played_at - h.prev_at >= interval '60 seconds'
  ), numbered as (
    select s.*,
           row_number() over (partition by s.user_id, s.game order by s.played_at) as k,
           count(*) filter (where s.played_at < timestamptz '2026-11-25 23:06:00+00') over (partition by s.user_id, s.game) as before_cap
      from spaced s
  ), counted as (
    select n.user_id, n.game, n.played_at from numbered n
     where n.game <> 'russian_janggi' or n.k <= greatest(30, n.before_cap)
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
$function$;

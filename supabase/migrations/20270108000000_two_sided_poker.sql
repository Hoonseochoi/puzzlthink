-- 양면포커: allow its AI results and anonymous play counts, and keep it out of 피스 경쟁전
-- like 러시안 룰렛 and 인디언 포커 (one card a round, so luck weighs too much for pieces).
-- The existing RLS policies still limit result reads/inserts to the signed-in owner.
alter table public.game_results drop constraint if exists game_results_game_check;
alter table public.game_results add constraint game_results_game_check
  check (game in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'piggy_bank', 'hexagon', 'gyulhap', 'indian_poker', 'slitherlink', 'wallgo2', 'nine_mens_morris', 'flip_omok', 'monorail', 'two_sided_poker'));

alter table public.game_plays_daily drop constraint if exists game_plays_daily_game_check;
alter table public.game_plays_daily add constraint game_plays_daily_game_check
  check (game in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'piggy_bank', 'hexagon', 'gyulhap', 'indian_poker', 'slitherlink', 'wallgo2', 'nine_mens_morris', 'flip_omok', 'monorail', 'two_sided_poker'));

create or replace function public.count_play(p_game text, p_mode text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_game not in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'piggy_bank', 'hexagon', 'gyulhap', 'indian_poker', 'slitherlink', 'wallgo2', 'nine_mens_morris', 'flip_omok', 'monorail', 'two_sided_poker')
     or p_mode not in ('ai', 'friend', 'solo') then
    return;
  end if;
  insert into public.game_plays_daily (day, game, mode, count)
  values ((now() at time zone 'Asia/Seoul')::date, p_game, p_mode, 1)
  on conflict (day, game, mode) do update set count = public.game_plays_daily.count + 1;
end; $$;
revoke all on function public.count_play(text, text) from public;
grant execute on function public.count_play(text, text) to anon, authenticated;

CREATE OR REPLACE FUNCTION public.competition_ranking(p_limit integer DEFAULT 50)
 RETURNS TABLE(rank integer, nickname text, avatar_url text, pieces bigint, per_game jsonb, last_win timestamp with time zone, is_me boolean, prev_rank integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with cutoff as (
    select (date_trunc('day', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul') as t
  ), hard as (
    select r.user_id, r.game, r.played_at,
           row_number() over (partition by r.user_id, r.game order by r.played_at) as nth
      from public.game_results r
     where r.mode = 'ai' and r.result = 'win'
       and coalesce(r.detail ->> 'difficulty', r.detail ->> 'level', '') = 'hard'
       and r.game not in ('russian_roulette', 'indian_poker', 'two_sided_poker')
  ), wins as (
    select h.user_id, h.game, count(*) as n, max(h.played_at) as last_win
      from hard h where h.nth <= 30
     group by h.user_id, h.game
  ), totals as (
    select w.user_id, sum(w.n)::bigint as pieces, jsonb_object_agg(w.game, w.n) as per_game, max(w.last_win) as last_win
      from wins w group by w.user_id
  ), ranked as (
    select t.*, row_number() over (order by t.pieces desc, t.last_win asc, t.user_id) as rn
      from totals t join public.profiles p on p.id = t.user_id
     where p.show_in_hall
  ), prev_totals as (
    select h.user_id, count(*)::bigint as pieces, max(h.played_at) as last_win
      from hard h, cutoff c
     where h.nth <= 30 and h.played_at < c.t
     group by h.user_id
  ), prev_ranked as (
    select t.user_id, row_number() over (order by t.pieces desc, t.last_win asc, t.user_id) as rn
      from prev_totals t join public.profiles p on p.id = t.user_id
     where p.show_in_hall
  )
  select k.rn::integer, coalesce(p.nickname, 'Player'), p.avatar_url, k.pieces, k.per_game, k.last_win, k.user_id = auth.uid(), y.rn::integer
    from ranked k join public.profiles p on p.id = k.user_id
    left join prev_ranked y on y.user_id = k.user_id
   where k.rn <= least(greatest(p_limit, 1), 100) or k.user_id = auth.uid()
   order by k.rn;
$function$;

-- 피스 경쟁전 2W.
-- 1W = every hard-AI win before 2026-11-25 00:00 KST (up to 30 pieces per game). Its final board is frozen in
-- piece_race_final, and its top three keep a platinum crown on their stone for good (piece_champions).
-- 2W = hard-AI wins from 2026-11-25 00:00 KST, up to 5 pieces per game. competition_ranking now ranks 2W.

create table if not exists public.piece_race_final (
  week smallint not null,
  rank integer not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  pieces bigint not null,
  per_game jsonb not null,
  last_win timestamptz not null,
  primary key (week, rank)
);
alter table public.piece_race_final enable row level security;

-- Freeze 1W (ranks among players shown in the hall, as the board showed them).
insert into public.piece_race_final (week, rank, user_id, pieces, per_game, last_win)
with hard as (
  select r.user_id, r.game, r.played_at, row_number() over (partition by r.user_id, r.game order by r.played_at) as nth
    from public.game_results r
   where r.mode = 'ai' and r.result = 'win'
     and coalesce(r.detail ->> 'difficulty', r.detail ->> 'level', '') = 'hard'
     and r.game not in ('russian_roulette', 'indian_poker', 'two_sided_poker')
     and r.played_at < timestamptz '2026-11-25 00:00:00+09'
), wins as (
  select h.user_id, h.game, count(*) as n, max(h.played_at) as last_win from hard h where h.nth <= 30 group by h.user_id, h.game
), totals as (
  select w.user_id, sum(w.n)::bigint as pieces, jsonb_object_agg(w.game, w.n) as per_game, max(w.last_win) as last_win from wins w group by w.user_id
)
select 1, row_number() over (order by t.pieces desc, t.last_win asc, t.user_id)::int, t.user_id, t.pieces, t.per_game, t.last_win
  from totals t join public.profiles p on p.id = t.user_id
 where p.show_in_hall
on conflict (week, rank) do nothing;

-- 2W, live.
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
       and r.played_at >= timestamptz '2026-11-25 00:00:00+09'
  ), wins as (
    select h.user_id, h.game, count(*) as n, max(h.played_at) as last_win
      from hard h where h.nth <= 5
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
     where h.nth <= 5 and h.played_at < c.t
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

-- A finished week's frozen board (same columns; prev_rank = rank, so nothing shows as moved).
CREATE OR REPLACE FUNCTION public.competition_final(p_week integer, p_limit integer DEFAULT 50)
 RETURNS TABLE(rank integer, nickname text, avatar_url text, pieces bigint, per_game jsonb, last_win timestamp with time zone, is_me boolean, prev_rank integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select f.rank, coalesce(p.nickname, 'Player'), p.avatar_url, f.pieces, f.per_game, f.last_win, f.user_id = auth.uid(), f.rank
    from public.piece_race_final f join public.profiles p on p.id = f.user_id
   where f.week = p_week and (f.rank <= least(greatest(p_limit, 1), 100) or f.user_id = auth.uid())
   order by f.rank;
$function$;

-- Past weeks' top three, by current nickname: their stones wear a platinum crown everywhere.
CREATE OR REPLACE FUNCTION public.piece_champions()
 RETURNS TABLE(week integer, rank integer, nickname text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select f.week::int, f.rank, coalesce(p.nickname, 'Player')
    from public.piece_race_final f join public.profiles p on p.id = f.user_id
   where f.rank <= 3
   order by f.week, f.rank;
$function$;

grant execute on function public.competition_final(integer, integer) to anon, authenticated;
grant execute on function public.piece_champions() to anon, authenticated;

notify pgrst, 'reload schema';

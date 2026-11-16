-- How many games are played, per game and mode, per day (KST) — signed in or not.
-- Every finished game a player sees counts once for that player (a 2-player friend game counts 2).
-- Run once in the Supabase SQL Editor (project zxkuzpueuvhvypsqbelg).

create table if not exists public.game_plays_daily (
  day date not null,
  game text not null check (game in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi')),
  mode text not null check (mode in ('ai', 'friend', 'solo')),
  count bigint not null default 0,
  primary key (day, game, mode)
);
alter table public.game_plays_daily enable row level security;
revoke all on public.game_plays_daily from anon, authenticated;

-- Called by the site when a game ends. Clients can only add one, never read or edit rows.
create or replace function public.count_play(p_game text, p_mode text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_game not in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi')
     or p_mode not in ('ai', 'friend', 'solo') then
    return;
  end if;
  insert into public.game_plays_daily (day, game, mode, count)
  values ((now() at time zone 'Asia/Seoul')::date, p_game, p_mode, 1)
  on conflict (day, game, mode) do update set count = public.game_plays_daily.count + 1;
end; $$;
revoke all on function public.count_play(text, text) from public;
grant execute on function public.count_play(text, text) to anon, authenticated;

-- For the site owner (Table Editor / SQL only) -------------------------------------------

-- Per game: all-time, today, last 7 and 30 days, split by mode.
create or replace view public.admin_game_plays with (security_invoker = true) as
with today as (select (now() at time zone 'Asia/Seoul')::date as d)
select g.game,
       sum(g.count) as total,
       sum(g.count) filter (where g.mode = 'ai') as vs_ai,
       sum(g.count) filter (where g.mode = 'friend') as vs_friend,
       sum(g.count) filter (where g.mode = 'solo') as solo,
       coalesce(sum(g.count) filter (where g.day = t.d), 0) as today,
       coalesce(sum(g.count) filter (where g.day > t.d - 7), 0) as last_7_days,
       coalesce(sum(g.count) filter (where g.day > t.d - 30), 0) as last_30_days,
       min(g.day) as first_day
  from public.game_plays_daily g cross join today t
 group by g.game
 order by total desc;

-- Day by day, one row per game per day.
create or replace view public.admin_game_plays_daily with (security_invoker = true) as
select day, game, sum(count) as plays,
       sum(count) filter (where mode = 'ai') as vs_ai,
       sum(count) filter (where mode = 'friend') as vs_friend,
       sum(count) filter (where mode = 'solo') as solo
  from public.game_plays_daily
 group by day, game
 order by day desc, plays desc;

-- Signed-in players only: how many different people played each game, and how often.
create or replace view public.admin_game_players with (security_invoker = true) as
select r.game,
       count(distinct r.user_id) as players,
       count(*) as games,
       round(count(*)::numeric / nullif(count(distinct r.user_id), 0), 1) as games_per_player,
       max(r.played_at) as last_played
  from public.game_results r
 group by r.game
 order by players desc;

-- Signed-in players only: each player's game count per game.
create or replace view public.admin_player_games with (security_invoker = true) as
select p.nickname, p.email, r.game, count(*) as games,
       count(*) filter (where r.result = 'win') as wins,
       max(r.played_at) as last_played
  from public.game_results r join public.profiles p on p.id = r.user_id
 group by p.nickname, p.email, r.game
 order by games desc;

revoke all on public.admin_game_plays, public.admin_game_plays_daily, public.admin_game_players, public.admin_player_games from anon, authenticated;

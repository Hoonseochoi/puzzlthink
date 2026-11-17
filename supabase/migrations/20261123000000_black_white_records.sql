-- 흑과 백 (black_white) in the records, the Hall of Fame and the play counter.
-- Run once in the Supabase SQL Editor (project zxkuzpueuvhvypsqbelg), after 20261122000000_online_heartbeat.sql.
-- Until this runs, 흑과 백 results are rejected by the checks below and nothing is stored.

-- 1) Player records ------------------------------------------------------------------------
alter table public.game_results drop constraint if exists game_results_game_check;
alter table public.game_results add constraint game_results_game_check
  check (game in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white'));

-- 2) Play counter --------------------------------------------------------------------------
alter table public.game_plays_daily drop constraint if exists game_plays_daily_game_check;
alter table public.game_plays_daily add constraint game_plays_daily_game_check
  check (game in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white'));

create or replace function public.count_play(p_game text, p_mode text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_game not in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white')
     or p_mode not in ('ai', 'friend', 'solo') then
    return;
  end if;
  insert into public.game_plays_daily (day, game, mode, count)
  values ((now() at time zone 'Asia/Seoul')::date, p_game, p_mode, 1)
  on conflict (day, game, mode) do update set count = public.game_plays_daily.count + 1;
end; $$;
revoke all on function public.count_play(text, text) from public;
grant execute on function public.count_play(text, text) to anon, authenticated;

-- Check: both should list black_white.
select conname, pg_get_constraintdef(oid) from pg_constraint
 where conname in ('game_results_game_check', 'game_plays_daily_game_check');

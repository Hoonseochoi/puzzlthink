-- 나인 멘스 모리스: allow its results and play counts. Everything else (Hall of Fame, open ranking, hard clears) is game-agnostic.
alter table public.game_results drop constraint if exists game_results_game_check;
alter table public.game_results add constraint game_results_game_check
  check (game in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'piggy_bank', 'hexagon', 'gyulhap', 'indian_poker', 'slitherlink', 'wallgo2', 'nine_mens_morris'));

alter table public.game_plays_daily drop constraint if exists game_plays_daily_game_check;
alter table public.game_plays_daily add constraint game_plays_daily_game_check
  check (game in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'piggy_bank', 'hexagon', 'gyulhap', 'indian_poker', 'slitherlink', 'wallgo2', 'nine_mens_morris'));

create or replace function public.count_play(p_game text, p_mode text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_game not in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'piggy_bank', 'hexagon', 'gyulhap', 'indian_poker', 'slitherlink', 'wallgo2', 'nine_mens_morris')
     or p_mode not in ('ai', 'friend', 'solo') then
    return;
  end if;
  insert into public.game_plays_daily (day, game, mode, count)
  values ((now() at time zone 'Asia/Seoul')::date, p_game, p_mode, 1)
  on conflict (day, game, mode) do update set count = public.game_plays_daily.count + 1;
end; $$;
revoke all on function public.count_play(text, text) from public;
grant execute on function public.count_play(text, text) to anon, authenticated;

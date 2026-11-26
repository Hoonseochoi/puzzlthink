-- 시간 경매 (time_auction): allow its results and play counts. Generated from the live definitions on 2026-11-26
-- (read-only check of game_results_game_check, game_plays_daily_game_check and count_play), plus 'time_auction'.
-- Hall of Fame, open ranking, hard clears and the open-room list are game-agnostic. Rooms need no table.
-- NOTE for merging: the 스나이퍼 홀덤 session may add its own id the same way; apply one combined list.
begin;
alter table public.game_results drop constraint if exists game_results_game_check;
alter table public.game_results add constraint game_results_game_check check (game in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'piggy_bank', 'hexagon', 'gyulhap', 'indian_poker', 'slitherlink', 'wallgo2', 'nine_mens_morris', 'flip_omok', 'monorail', 'two_sided_poker', 'masyu', 'nonogram', 'starbattle', 'binairo', 'onestroke', 'colorlink', 'four_three', 'magicswap', 'merge2048', 'point_omok', 'hit_stay', 'card_janggi', 'color_link_duel', 'gradation', 'equation_signal', 'equation_tower', 'hidden_word', 'time_auction'));

alter table public.game_plays_daily drop constraint if exists game_plays_daily_game_check;
alter table public.game_plays_daily add constraint game_plays_daily_game_check check (game in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'piggy_bank', 'hexagon', 'gyulhap', 'indian_poker', 'slitherlink', 'wallgo2', 'nine_mens_morris', 'flip_omok', 'monorail', 'two_sided_poker', 'masyu', 'nonogram', 'starbattle', 'binairo', 'onestroke', 'colorlink', 'four_three', 'magicswap', 'merge2048', 'point_omok', 'hit_stay', 'card_janggi', 'color_link_duel', 'gradation', 'equation_signal', 'equation_tower', 'hidden_word', 'time_auction'));

CREATE OR REPLACE FUNCTION public.count_play(p_game text, p_mode text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if p_game not in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'piggy_bank', 'hexagon', 'gyulhap', 'indian_poker', 'slitherlink', 'wallgo2', 'nine_mens_morris', 'flip_omok', 'monorail', 'two_sided_poker', 'masyu', 'nonogram', 'starbattle', 'binairo', 'onestroke', 'colorlink', 'four_three', 'magicswap', 'merge2048', 'point_omok', 'hit_stay', 'card_janggi', 'color_link_duel', 'gradation', 'equation_signal', 'equation_tower', 'hidden_word', 'time_auction')
     or p_mode not in ('ai', 'friend', 'solo') then
    return;
  end if;
  insert into public.game_plays_daily (day, game, mode, count)
  values ((now() at time zone 'Asia/Seoul')::date, p_game, p_mode, 1)
  on conflict (day, game, mode) do update set count = public.game_plays_daily.count + 1;
end; $function$;
commit;

notify pgrst, 'reload schema';

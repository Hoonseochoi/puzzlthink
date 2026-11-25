-- The app-style home shows "[nickname] N위" on each game tile: every rank of the signed-in player in one call.
-- A solo-challenge game uses its challenge board (the same board the home podium shows); every other game uses
-- the AI Hall of Fame. Additive: nothing else changes.
CREATE OR REPLACE FUNCTION public.my_game_ranks()
 RETURNS TABLE(game text, rank integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with boards(game, board) as (values
    ('slitherlink', 'slither'), ('binairo', 'binairo'), ('onestroke', 'onestroke'), ('colorlink', 'colorlink'),
    ('magicswap', 'magicswap'), ('starbattle', 'starbattle'), ('masyu', 'masyu'), ('nonogram', 'nonogram'),
    ('gyulhap', 'gyulhap10'), ('nemo_count', 'nemo_hard'), ('hexagon', 'hexagon'), ('equation_signal', 'eqsignal'),
    ('equation_tower', 'eqtower'), ('merge2048', 'merge2048'), ('hidden_word', 'hidden_word'))
  select h.game, h.rn::integer from public.hall_ranking() h
   where auth.uid() is not null and h.user_id = auth.uid() and h.game not in (select b.game from boards b)
  union all
  select b.game, c.rnk from boards b cross join lateral public.challenge_rows(b.board) c
   where auth.uid() is not null and c.user_id = auth.uid();
$function$;
revoke all on function public.my_game_ranks() from public, anon;
grant execute on function public.my_game_ranks() to authenticated;

notify pgrst, 'reload schema';

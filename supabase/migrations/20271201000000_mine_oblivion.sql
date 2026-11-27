-- 망각의 지뢰 (mine_oblivion) in the shared records: results and play counts, its #1 crown icon ('c-mine_oblivion',
-- already allowed by the c-[a-z0-9_] icon pattern) and the 어려움 clear list of the HIDDEN MISSION (mission_games 'hard'):
-- a win against the 어려움 AI is a hard clear (is_hard_clear reads detail.level = 'hard').
--
-- Order-independent, like 20271127200000_sniper_holdem.sql and 20271127210000_time_auction.sql: it patches whatever is
-- live instead of shipping copies of the shared definitions. It reads each definition, adds 'mine_oblivion' to its game
-- list next to 'hit_stay' and re-creates it; running it twice changes nothing, and it works before or after those two.
-- Apply after any migration that re-creates these lists wholesale (so the re-created versions get the id too).
-- Rollback: see the comment at the end.
do $$
declare
  def text;
  c record;
begin
  -- 1. The game CHECKs on game_results and game_plays_daily: add the id next to 'hit_stay'.
  for c in select conrelid::regclass as tbl, conname from pg_constraint
            where conname in ('game_results_game_check', 'game_plays_daily_game_check') loop
    def := pg_get_constraintdef((select oid from pg_constraint where conname = c.conname and conrelid = c.tbl));
    if position('''mine_oblivion''' in def) = 0 then
      if position('''hit_stay''::text' in def) = 0 then raise exception 'unexpected % definition: %', c.conname, def; end if;
      def := replace(def, '''hit_stay''::text', '''hit_stay''::text, ''mine_oblivion''::text');
      execute format('alter table %s drop constraint %I', c.tbl, c.conname);
      execute format('alter table %s add constraint %I %s', c.tbl, c.conname, def);
    end if;
  end loop;

  -- 2. count_play (play counter), refresh_game_crowns (#1 icons) and mission_games('hard'): the same list edit.
  foreach def in array array['public.count_play(text, text)', 'public.refresh_game_crowns()', 'public.mission_games(text)'] loop
    def := pg_get_functiondef(def::regprocedure);
    if position('''mine_oblivion''' in def) = 0 then
      if def like '%mission_games%' then
        if position('when ''hard'' then array[''' in def) = 0 then raise exception 'unexpected mission_games: %', def; end if;
        def := replace(def, 'when ''hard'' then array[''', 'when ''hard'' then array[''mine_oblivion'', ''');
      else
        if position('''hit_stay''' in def) = 0 then raise exception 'hit_stay not found in %', left(def, 120); end if;
        def := replace(def, '''hit_stay''', '''hit_stay'', ''mine_oblivion''');
      end if;
      execute def;
    end if;
  end loop;
end $$;

revoke all on function public.refresh_game_crowns() from public, anon, authenticated;

notify pgrst, 'reload schema';

-- Rollback (only if no mine_oblivion rows were recorded; delete them first otherwise): run the same block with
-- replace(def, ', ''mine_oblivion''::text', '') for the checks, replace(def, ', ''mine_oblivion''', '') for count_play and
-- refresh_game_crowns, and replace(def, '''mine_oblivion'', ', '') for mission_games.

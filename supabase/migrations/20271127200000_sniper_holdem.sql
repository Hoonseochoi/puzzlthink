-- 스나이퍼 홀덤 (sniper_holdem) in the shared records: results and play counts, its #1 crown icon ('c-sniper_holdem',
-- already allowed by the c-[a-z0-9_] icon pattern) and the 어려움 clear list of the HIDDEN MISSION (mission_games 'hard').
--
-- Order-independent: instead of shipping copies of the shared definitions (other games' migrations, e.g. 히든 워드
-- 확장판 20271127100000, rewrite the same constraints and functions), this patches whatever is live: it reads each
-- definition, adds 'sniper_holdem' to its game list and re-creates it. Running it twice changes nothing.
-- Apply AFTER the other pending migrations (so their re-created functions get the new id too).
-- Hall of Fame, the open ranking, hard clears (is_hard_clear) and the open-room list are game-agnostic.
do $$
declare
  def text;
  c record;
begin
  -- 1. The game CHECKs on game_results and game_plays_daily: add the id next to 'hit_stay'.
  for c in select conrelid::regclass as tbl, conname from pg_constraint
            where conname in ('game_results_game_check', 'game_plays_daily_game_check') loop
    def := pg_get_constraintdef((select oid from pg_constraint where conname = c.conname and conrelid = c.tbl));
    if position('''sniper_holdem''' in def) = 0 then
      if position('''hit_stay''::text' in def) = 0 then raise exception 'unexpected % definition: %', c.conname, def; end if;
      def := replace(def, '''hit_stay''::text', '''hit_stay''::text, ''sniper_holdem''::text');
      execute format('alter table %s drop constraint %I', c.tbl, c.conname);
      execute format('alter table %s add constraint %I %s', c.tbl, c.conname, def);
    end if;
  end loop;

  -- 2. count_play (anonymous play counter) and refresh_game_crowns (#1 icons): the same list edit.
  foreach def in array array['public.count_play(text, text)', 'public.refresh_game_crowns()', 'public.mission_games(text)'] loop
    def := pg_get_functiondef(def::regprocedure);
    if position('''sniper_holdem''' in def) = 0 then
      if def like '%mission_games%' then
        -- Only the 'hard' list (games with a 어려움 AI), not 'hell'.
        if position('when ''hard'' then array[''' in def) = 0 then raise exception 'unexpected mission_games: %', def; end if;
        def := replace(def, 'when ''hard'' then array[''', 'when ''hard'' then array[''sniper_holdem'', ''');
      else
        if position('''hit_stay''' in def) = 0 then raise exception 'hit_stay not found in %', left(def, 120); end if;
        def := replace(def, '''hit_stay''', '''hit_stay'', ''sniper_holdem''');
      end if;
      execute def;
    end if;
  end loop;
end $$;

revoke all on function public.refresh_game_crowns() from public, anon, authenticated;

notify pgrst, 'reload schema';

-- Roll back 20271127100000_hidden_word_plus_game.sql: 확장판 results go back under 히든 워드 (detail.level = 'plus'
-- keeps them apart there), the shared functions return to their definitions of 2026-11-27 before that migration.
-- If another migration redefined one of these functions after it, take that newer definition and drop only the
-- 'hidden_word_plus' lines instead of running this file as is.
begin;
update public.game_results set game = 'hidden_word' where game = 'hidden_word_plus';
insert into public.game_plays_daily (day, game, mode, count)
  select day, 'hidden_word', mode, count from public.game_plays_daily where game = 'hidden_word_plus'
  on conflict (day, game, mode) do update set count = public.game_plays_daily.count + excluded.count;
delete from public.game_plays_daily where game = 'hidden_word_plus';
update public.profile_icons set revoked_at = now() where icon = 'c-hidden_word_plus' and revoked_at is null;
delete from public.game_crowns where game = 'hidden_word_plus';
delete from public.rank_snapshots where board = 'chal:hidden_word_plus';
alter table public.game_results drop constraint if exists game_results_game_check;
alter table public.game_results add constraint game_results_game_check CHECK ((game = ANY (ARRAY['wallgo'::text, 'janggi'::text, 'heavy13'::text, 'sudoku'::text, 'russian_roulette'::text, 'russian_janggi'::text, 'blind_gomoku'::text, 'laser_janggi'::text, 'nemo_count'::text, 'black_white'::text, 'black_white_2'::text, 'piggy_bank'::text, 'hexagon'::text, 'gyulhap'::text, 'indian_poker'::text, 'slitherlink'::text, 'wallgo2'::text, 'nine_mens_morris'::text, 'flip_omok'::text, 'monorail'::text, 'two_sided_poker'::text, 'masyu'::text, 'nonogram'::text, 'starbattle'::text, 'binairo'::text, 'onestroke'::text, 'colorlink'::text, 'four_three'::text, 'magicswap'::text, 'merge2048'::text, 'point_omok'::text, 'hit_stay'::text, 'card_janggi'::text, 'color_link_duel'::text, 'gradation'::text, 'equation_signal'::text, 'equation_tower'::text, 'hidden_word'::text])));
alter table public.game_plays_daily drop constraint if exists game_plays_daily_game_check;
alter table public.game_plays_daily add constraint game_plays_daily_game_check CHECK ((game = ANY (ARRAY['wallgo'::text, 'janggi'::text, 'heavy13'::text, 'sudoku'::text, 'russian_roulette'::text, 'russian_janggi'::text, 'blind_gomoku'::text, 'laser_janggi'::text, 'nemo_count'::text, 'black_white'::text, 'black_white_2'::text, 'piggy_bank'::text, 'hexagon'::text, 'gyulhap'::text, 'indian_poker'::text, 'slitherlink'::text, 'wallgo2'::text, 'nine_mens_morris'::text, 'flip_omok'::text, 'monorail'::text, 'two_sided_poker'::text, 'masyu'::text, 'nonogram'::text, 'starbattle'::text, 'binairo'::text, 'onestroke'::text, 'colorlink'::text, 'four_three'::text, 'magicswap'::text, 'merge2048'::text, 'point_omok'::text, 'hit_stay'::text, 'card_janggi'::text, 'color_link_duel'::text, 'gradation'::text, 'equation_signal'::text, 'equation_tower'::text, 'hidden_word'::text])));

CREATE OR REPLACE FUNCTION public.count_play(p_game text, p_mode text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if p_game not in ('wallgo', 'janggi', 'heavy13', 'sudoku', 'russian_roulette', 'russian_janggi', 'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'piggy_bank', 'hexagon', 'gyulhap', 'indian_poker', 'slitherlink', 'wallgo2', 'nine_mens_morris', 'flip_omok', 'monorail', 'two_sided_poker', 'masyu', 'nonogram', 'starbattle', 'binairo', 'onestroke', 'colorlink', 'four_three', 'magicswap', 'merge2048', 'point_omok', 'hit_stay', 'card_janggi', 'color_link_duel', 'gradation', 'equation_signal', 'equation_tower', 'hidden_word')
     or p_mode not in ('ai', 'friend', 'solo') then
    return;
  end if;
  insert into public.game_plays_daily (day, game, mode, count)
  values ((now() at time zone 'Asia/Seoul')::date, p_game, p_mode, 1)
  on conflict (day, game, mode) do update set count = public.game_plays_daily.count + 1;
end; $function$

;

CREATE OR REPLACE FUNCTION public.challenge_rows(p_board text)
 RETURNS TABLE(user_id uuid, score integer, sub integer, rnk integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with runs as (
    select r.user_id, (r.detail ->> 'score')::int as score, nullif(r.detail ->> 'durationMs', '')::int as sub, r.played_at
      from public.game_results r
     where p_board in ('gyulhap10', 'gyulhap5') and r.game = 'gyulhap' and r.mode = 'solo'
       and r.detail ->> 'mode' = case p_board when 'gyulhap10' then 'challenge10' else 'challenge5' end
       and (r.detail ->> 'score') ~ '^-?[0-9]+$' and not (r.detail ? 'voided')
    union all
    select r.user_id, (r.detail ->> 'score')::int, null, r.played_at
      from public.game_results r
     where p_board = 'hexagon' and r.game = 'hexagon' and r.mode = 'solo' and r.detail ->> 'mode' = 'challenge'
       and (r.detail ->> 'score') ~ '^-?[0-9]+$' and not (r.detail ? 'voided')
    union all
    -- 수식 신호등 · 수식의 탑 10분 챌린지: equations solved / points. For 수식 신호등, sub = guesses used (fewer first on a tie).
    select r.user_id, (r.detail ->> 'score')::int,
           case when r.game = 'equation_signal' and (r.detail ->> 'guesses') ~ '^[0-9]{1,5}$' then (r.detail ->> 'guesses')::int end, r.played_at
      from public.game_results r
     where ((p_board = 'eqsignal' and r.game = 'equation_signal')
            or (p_board = 'eqtower' and r.game = 'equation_tower' and coalesce(r.detail ->> 'level', 'hard') = 'hard'))
       and r.mode = 'solo' and r.detail ->> 'mode' = 'challenge'
       and (r.detail ->> 'score') ~ '^[0-9]{1,4}$' and not (r.detail ? 'voided')
    union all
    -- sub = minus the run's biggest block: the ranking shows it as the player's picture, and on a tied score
    -- the bigger block goes first (sub sorts ascending).
    select r.user_id, (r.detail ->> 'score')::int,
           case when (r.detail ->> 'max') ~ '^[0-9]{1,6}$' then -((r.detail ->> 'max')::int) end, r.played_at
      from public.game_results r
     where p_board = 'merge2048' and r.game = 'merge2048' and r.mode = 'solo' and r.detail ->> 'mode' = 'endless'
       and (r.detail ->> 'score') ~ '^[0-9]+$' and (r.detail ->> 'moves') ~ '^[0-9]+$' and not (r.detail ? 'voided')
       -- A run spawns at most a 4 per move, so its blocks add up to at most 4·(moves + 2), and every point of
       -- score is one of those values merged again (at most 16 times on the way to 131072): drop runs past that.
       and (r.detail ->> 'score')::bigint <= 64 * ((r.detail ->> 'moves')::bigint + 2)
    union all
    select r.user_id, (r.detail ->> 'correct')::int, nullif(r.detail ->> 'avgMs', '')::int, r.played_at
      from public.game_results r
     where p_board like 'nemo\_%' and r.game = 'nemo_count' and r.mode = 'solo'
       and r.detail ->> 'difficulty' = substr(p_board, 6) and (r.detail ->> 'correct') ~ '^[0-9]+$' and not (r.detail ? 'voided')
  ),
  best as (
    select distinct on (x.user_id) x.user_id, x.score, x.sub, x.played_at
      from runs x where x.score > 0
     order by x.user_id, x.score desc, x.sub asc nulls last, x.played_at
  ),
  ranked as (
    select b.user_id, b.score, b.sub, (row_number() over (order by b.score desc, b.sub asc nulls last, b.played_at))::int as rnk
      from best b join public.profiles p on p.id = b.user_id where p.show_in_hall
  )
  select * from ranked
  union all
  select o.user_id, o.maps, o.best_ms, o.rnk from public.slither_owner_rows() o where p_board = 'slither'
  union all
  select l.user_id, l.maps, l.best_ms, l.rnk from public.logic_owner_rows(p_board) l where p_board in ('masyu', 'nonogram', 'starbattle', 'binairo', 'onestroke', 'colorlink', 'magicswap')
  union all
  select h.user_id, h.points, h.games, h.rnk from public.hw_rank_rows() h where p_board = 'hidden_word';
$function$

;

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
$function$

;

CREATE OR REPLACE FUNCTION public.rank_mission_tick()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_n int := 0; r record;
begin
  for r in
    with boards(game, board) as (values
      ('slitherlink', 'slither'), ('binairo', 'binairo'), ('onestroke', 'onestroke'), ('colorlink', 'colorlink'),
      ('magicswap', 'magicswap'), ('starbattle', 'starbattle'), ('masyu', 'masyu'), ('nonogram', 'nonogram'),
      ('gyulhap', 'gyulhap10'), ('nemo_count', 'nemo_hard'), ('hexagon', 'hexagon'), ('equation_signal', 'eqsignal'),
      ('equation_tower', 'eqtower'), ('merge2048', 'merge2048'), ('hidden_word', 'hidden_word')),
    ranks as (
      select h.game, h.user_id, h.rn::int as rnk from public.hall_ranking() h where h.game not in (select b.game from boards b)
      union all
      select b.game, c.user_id, c.rnk from boards b cross join lateral public.challenge_rows(b.board) c),
    total as (select count(distinct game) as n from ranks)
    select k.user_id from ranks k
     group by k.user_id
    having count(distinct k.game) = (select n from total) and avg(k.rnk) <= 10
  loop
    if public.grant_icon(r.user_id, 'hm-rank') then v_n := v_n + 1; end if;
  end loop;
  return v_n;
end; $function$

;

CREATE OR REPLACE FUNCTION public.rank_snapshot_ensure()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare d date := public.kst_today(); b text;
begin
  insert into public.rank_snapshot_days (day) values (d) on conflict do nothing;
  if not found then return; end if;
  insert into public.rank_snapshots (day, board, user_id, rank)
    select d, 'hall:' || h.game, h.user_id, h.rn from public.hall_ranking() h where h.rn <= 100
    on conflict do nothing;
  insert into public.rank_snapshots (day, board, user_id, rank)
    select d, 'open:' || g.game, r.user_id, r.rnk
      from (select distinct game from public.game_results where mode = 'friend' and detail ->> 'open' = 'true') g,
           lateral public.open_ranking_rows(g.game) r
     where r.rnk <= 100
    on conflict do nothing;
  insert into public.rank_snapshots (day, board, user_id, rank)
    select d, 'slither', o.user_id, o.rnk from public.slither_owner_rows() o where o.rnk <= 100
    on conflict do nothing;
  foreach b in array array['slither', 'gyulhap10', 'gyulhap5', 'hexagon', 'nemo_easy', 'nemo_normal', 'nemo_hard', 'masyu', 'nonogram', 'starbattle', 'binairo', 'onestroke', 'colorlink', 'magicswap', 'merge2048', 'eqsignal', 'eqtower', 'hidden_word'] loop
    insert into public.rank_snapshots (day, board, user_id, rank)
      select d, 'chal:' || b, c.user_id, c.rnk from public.challenge_rows(b) c where c.rnk <= 100
      on conflict do nothing;
  end loop;
  delete from public.rank_snapshots where day < d - 7;
  delete from public.rank_snapshot_days where day < d - 7;
end; $function$

;

CREATE OR REPLACE FUNCTION public.refresh_game_crowns()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  g text; v_board text; v_uid uuid; v_cur uuid; v_hall jsonb; d text;
  games text[] := array['hidden_word', 'equation_signal', 'equation_tower', 'gradation', 'card_janggi', 'color_link_duel', 'hit_stay', 'point_omok', 'merge2048', 'magicswap', 'binairo', 'onestroke',
    'colorlink', 'starbattle', 'masyu', 'nonogram', 'two_sided_poker', 'monorail', 'four_three', 'flip_omok', 'nine_mens_morris',
    'wallgo2', 'slitherlink', 'gyulhap', 'indian_poker', 'wallgo', 'heavy13', 'janggi', 'russian_janggi', 'russian_roulette',
    'blind_gomoku', 'laser_janggi', 'nemo_count', 'black_white', 'black_white_2', 'hexagon', 'piggy_bank', 'sudoku'];
  no_hall text[] := array['nemo_count', 'gyulhap', 'slitherlink', 'masyu', 'nonogram', 'starbattle', 'binairo', 'onestroke', 'colorlink', 'magicswap', 'merge2048', 'equation_signal', 'equation_tower'];
begin
  select coalesce(jsonb_object_agg(s.game, s.user_id), '{}'::jsonb) into v_hall
    from (select distinct on (h.game) h.game, h.user_id from public.hall_ranking() h where h.rn = 1 order by h.game, h.rn, h.user_id) s;
  foreach g in array games loop
    v_uid := null;
    v_board := case g when 'slitherlink' then 'slither' when 'binairo' then 'binairo' when 'onestroke' then 'onestroke'
      when 'colorlink' then 'colorlink' when 'magicswap' then 'magicswap' when 'starbattle' then 'starbattle'
      when 'masyu' then 'masyu' when 'nonogram' then 'nonogram' when 'merge2048' then 'merge2048' when 'hidden_word' then 'hidden_word'
      when 'gyulhap' then 'gyulhap10' when 'hexagon' then 'hexagon'
      when 'equation_signal' then 'eqsignal' when 'equation_tower' then 'eqtower' end;
    if v_board is not null then
      select c.user_id into v_uid from public.challenge_rows(v_board) c where c.rnk = 1 order by c.sub nulls last, c.user_id limit 1;
    elsif g = 'nemo_count' then
      foreach d in array array['hard', 'normal', 'easy'] loop
        select b.user_id into v_uid from (
          select distinct on (r.user_id) r.user_id, (r.detail ->> 'correct')::int as correct, nullif(r.detail ->> 'avgMs', '')::int as avg_ms, r.played_at
            from public.game_results r
           where r.game = 'nemo_count' and r.mode = 'solo' and r.detail ->> 'difficulty' = d and (r.detail ->> 'correct') ~ '^[0-9]+$'
             and not (r.detail ? 'voided')
           order by r.user_id, (r.detail ->> 'correct')::int desc, nullif(r.detail ->> 'avgMs', '')::int asc nulls last, r.played_at
        ) b join public.profiles p on p.id = b.user_id
         where p.show_in_hall and b.correct > 0
         order by b.correct desc, b.avg_ms asc nulls last, b.played_at limit 1;
        exit when v_uid is not null;
      end loop;
      if v_uid is null then select o.user_id into v_uid from public.open_ranking_rows(g) o where o.rnk = 1 order by o.wins desc, o.user_id limit 1; end if;
    else
      if not (g = any(no_hall)) then v_uid := (v_hall ->> g)::uuid; end if;
      if v_uid is null and g not in ('sudoku', 'gradation') then
        select o.user_id into v_uid from public.open_ranking_rows(g) o where o.rnk = 1 order by o.wins desc, o.user_id limit 1;
      end if;
    end if;

    select c.user_id into v_cur from public.game_crowns c where c.game = g;
    if v_uid is not distinct from v_cur then continue; end if;
    if v_cur is not null then
      update public.profile_icons set revoked_at = now() where user_id = v_cur and icon = 'c-' || g and revoked_at is null;
    end if;
    if v_cur is not null and v_uid is not null then   -- taken by someone: the old #1 is told at their next visit
      insert into public.crown_losses (user_id, game, taker) values (v_cur, g, v_uid);
    end if;
    if v_uid is null then
      delete from public.game_crowns where game = g;
    else
      insert into public.game_crowns (game, user_id, since) values (g, v_uid, now())
      on conflict (game) do update set user_id = excluded.user_id, since = excluded.since;
      perform public.grant_icon(v_uid, 'c-' || g);
    end if;
  end loop;
end; $function$

;

CREATE OR REPLACE FUNCTION public.hw_act(p_game uuid, p_action jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  g public.hw_games; s jsonb; t jsonb; kind text := p_action ->> 't'; phase text; lv text; cfg jsonb;
  now_ms bigint := (extract(epoch from clock_timestamp()) * 1000)::bigint;
  mult int; stage int; w text; ws text[]; sc numeric; late boolean; closed boolean; ok boolean;
  hand jsonb; clues jsonb; banned text[]; used text[]; sims jsonb; n int;
begin
  select * into g from public.hw_games where id = p_game for update;
  if not found or (g.user_id is not null and g.user_id is distinct from auth.uid()) then
    return jsonb_build_object('error', 'missing');
  end if;
  s := g.state; t := s -> 't'; phase := s ->> 'phase'; mult := (s ->> 'round')::int; stage := (t ->> 'stage')::int;
  lv := public.hw_level(s ->> 'level'); cfg := public.hw_level_cfg(lv);
  late := (s ->> 'deadline') is not null and now_ms > (s ->> 'deadline')::bigint + 3000;

  if phase = 'envelope' and kind = 'envelope' then
    hand := s -> 'envelopes' -> (p_action ->> 'i')::int;
    if hand is null then return public.hw_view(g.id, s); end if;
    s := s || jsonb_build_object('hand', hand, 'envelope', (p_action ->> 'i')::int, 'aiWords', public.hw_ai_words(lv, hand));
    s := public.hw_begin_turn(s, now_ms);
    perform public.count_play('hidden_word', 'ai');

  elsif phase = 'pick' and kind = 'pick' then
    w := p_action ->> 'word';
    if not (s -> 'hand' ? w) then return public.hw_view(g.id, s); end if;
    s := s || jsonb_build_object('hand', (s -> 'hand') - w, 'phase', 'hint', 'deadline', now_ms + (cfg ->> 'hintSecs')::int * 1000,
      't', t || jsonb_build_object('word', w));

  elsif phase = 'hint' and kind in ('hint', 'timeout') then
    if kind = 'timeout' and now_ms < (s ->> 'deadline')::bigint - 1500 then return public.hw_view(g.id, s); end if;
    closed := false;
    if kind = 'hint' and not late then
      w := normalize(btrim(coalesce(p_action ->> 'word', '')), NFC);
      if w !~ '^[가-힣]{1,8}$' then return public.hw_view(g.id, s) || jsonb_build_object('error', 'invalid'); end if;
      if w = t ->> 'word' then return public.hw_view(g.id, s) || jsonb_build_object('error', 'secret'); end if;
      if exists (select 1 from jsonb_array_elements(t -> 'hints') h where h ->> 'w' = w)
         or exists (select 1 from jsonb_array_elements(t -> 'guesses') x where x -> 'w' ? w) then
        return public.hw_view(g.id, s) || jsonb_build_object('error', 'duplicate');
      end if;
      sc := public.hw_score(t ->> 'word', w);
      if sc is null then return public.hw_view(g.id, s) || jsonb_build_object('error', 'unknown'); end if;
      t := jsonb_set(t, '{hints}', (t -> 'hints') || jsonb_build_object('w', w, 's', sc, 'stage', stage, 'by', 'me'));
      closed := sc >= (cfg ->> 'cut')::numeric;
      select count(*) into n from jsonb_array_elements(t -> 'hints') h where (h ->> 'stage')::int = stage and h ->> 'by' = 'me';
    end if;
    if kind = 'hint' and not late and not closed and n < (cfg ->> 'maxHints')::int then
      s := s || jsonb_build_object('t', t);   -- the hint phase goes on
    else
      if not closed then   -- out of hints or time: the closest unused word of the list is revealed
        select h.word, h.score into w, sc from public.hw_hints h
         where h.target = t ->> 'word' and not exists (select 1 from jsonb_array_elements(t -> 'hints') x where x ->> 'w' = h.word)
         order by h.score desc, h.word limit 1;
        if w is not null then
          t := jsonb_set(t, '{hints}', (t -> 'hints') || jsonb_build_object('w', w, 's', sc, 'stage', stage, 'by', 'reveal'));
        end if;
      end if;
      -- the AI answers: every hint so far, and its own wrong answers with their shown %
      select coalesce(jsonb_agg(jsonb_build_object('w', h ->> 'w', 's', h -> 's')), '[]'::jsonb) into clues from jsonb_array_elements(t -> 'hints') h;
      select coalesce(array_agg(x.w), '{}') into banned from jsonb_array_elements(t -> 'guesses') gs, jsonb_array_elements_text(gs -> 'w') x(w);
      select clues || coalesce(jsonb_agg(jsonb_build_object('w', b, 's', public.hw_score(t ->> 'word', b))), '[]'::jsonb) into clues from unnest(banned) b;
      -- a word given as a hint cannot be the hidden word: the AI never answers one
      ws := public.hw_ai_guess(clues, banned || array(select h ->> 'w' from jsonb_array_elements(t -> 'hints') h), (s ->> 'seed')::int, (t ->> 'chance')::boolean and stage >= 2, lv);
      ok := (t ->> 'word') = any (ws);
      select jsonb_agg(public.hw_score(t ->> 'word', x)) into sims from unnest(ws) x;
      t := jsonb_set(t, '{guesses}', (t -> 'guesses') || jsonb_build_object('w', to_jsonb(ws), 's', sims, 'stage', stage, 'by', 'ai', 'ok', ok));
      if array_length(ws, 1) > 1 then t := t || jsonb_build_object('chance', false); end if;
      if ok then
        n := (cfg -> 'guessPoints' ->> (stage - 1))::int * mult;
        t := t || jsonb_build_object('ai', (t ->> 'ai')::int + n, 'solved', stage);
        s := s || jsonb_build_object('ai', (s ->> 'ai')::int + n, 'phase', 'turnEnd', 'deadline', null, 't', t);
      else
        n := (cfg -> 'setPoints' ->> (stage - 1))::int * mult;
        t := t || jsonb_build_object('me', (t ->> 'me')::int + n);
        s := s || jsonb_build_object('me', (s ->> 'me')::int + n);
        if stage >= (cfg ->> 'stages')::int then
          s := s || jsonb_build_object('phase', 'turnEnd', 'deadline', null, 't', t || jsonb_build_object('solved', 0));
        else
          s := s || jsonb_build_object('deadline', now_ms + (cfg ->> 'hintSecs')::int * 1000 + 6000, 't', t || jsonb_build_object('stage', stage + 1));
        end if;
      end if;
    end if;

  elsif phase = 'guess' and kind in ('guess', 'timeout') then
    if kind = 'timeout' and now_ms < (s ->> 'deadline')::bigint - 1500 then return public.hw_view(g.id, s); end if;
    ws := '{}';
    if kind = 'guess' and not late then
      select coalesce(array_agg(normalize(btrim(x), NFC)), '{}') into ws from jsonb_array_elements_text(coalesce(p_action -> 'words', '[]'::jsonb)) x;
      n := coalesce(array_length(ws, 1), 0);
      if n < 1 or n > 2 or (n = 2 and (not (t ->> 'chance')::boolean or ws[1] = ws[2])) then return public.hw_view(g.id, s) || jsonb_build_object('error', 'invalid'); end if;
      foreach w in array ws loop
        if w !~ '^[가-힣]{1,8}$' then return public.hw_view(g.id, s) || jsonb_build_object('error', 'invalid', 'word', w); end if;
        if exists (select 1 from jsonb_array_elements(t -> 'guesses') x where x -> 'w' ? w)
           or exists (select 1 from jsonb_array_elements(t -> 'hints') h where h ->> 'w' = w) then   -- a hint is never the answer
          return public.hw_view(g.id, s) || jsonb_build_object('error', 'duplicate', 'word', w);
        end if;
        if not exists (select 1 from public.hw_vocab v where v.word = w) then return public.hw_view(g.id, s) || jsonb_build_object('error', 'unknown', 'word', w); end if;
      end loop;
      if n = 2 then   -- the second answer costs one 피스 (signed-in players with a piece left)
        if auth.uid() is null or public.piece_balance(auth.uid()) < 1 then return public.hw_view(g.id, s) || jsonb_build_object('error', 'nopiece'); end if;
        insert into public.piece_spends (user_id, reason, ref) values (auth.uid(), 'hidden_word', g.id);
      end if;
    end if;
    ok := (t ->> 'word') = any (ws);
    select coalesce(jsonb_agg(public.hw_score(t ->> 'word', x)), '[]'::jsonb) into sims from unnest(ws) x;
    t := jsonb_set(t, '{guesses}', (t -> 'guesses') || jsonb_build_object('w', to_jsonb(ws), 's', sims, 'stage', stage, 'by', 'me', 'ok', ok));
    if array_length(ws, 1) > 1 then t := t || jsonb_build_object('chance', false); end if;
    if ok then
      n := (cfg -> 'guessPoints' ->> (stage - 1))::int * mult;
      t := t || jsonb_build_object('me', (t ->> 'me')::int + n, 'solved', stage);
      s := s || jsonb_build_object('me', (s ->> 'me')::int + n, 'phase', 'turnEnd', 'deadline', null, 't', t);
    else
      n := (cfg -> 'setPoints' ->> (stage - 1))::int * mult;
      t := t || jsonb_build_object('ai', (t ->> 'ai')::int + n);
      s := s || jsonb_build_object('ai', (s ->> 'ai')::int + n);
      if stage >= (cfg ->> 'stages')::int then
        s := s || jsonb_build_object('phase', 'turnEnd', 'deadline', null, 't', t || jsonb_build_object('solved', 0));
      else
        select coalesce(array_agg(h ->> 'w'), '{}') into used from jsonb_array_elements(t -> 'hints') h;
        t := t || jsonb_build_object('stage', stage + 1, 'hints', (t -> 'hints') || public.hw_ai_hints(t ->> 'word', stage + 1, used));
        s := s || jsonb_build_object('deadline', now_ms + (cfg ->> 'guessSecs')::int * 1000 + 6000, 't', t);
      end if;
    end if;

  elsif phase = 'turnEnd' and kind = 'next' then
    s := s || jsonb_build_object('history', (s -> 'history') || (t || jsonb_build_object('round', mult)));
    if (s ->> 'turnNo')::int = 0 then
      s := public.hw_begin_turn(s || jsonb_build_object('turnNo', 1), now_ms);
    elsif mult = 1 then
      s := public.hw_begin_turn(s || jsonb_build_object('round', 2, 'turnNo', 0), now_ms);
    else
      s := (s - 't') || jsonb_build_object('phase', 'over', 'deadline', null);
      -- a match started signed out counts for whoever finishes it signed in
      if exists (select 1 from public.profiles p where p.id = coalesce(g.user_id, auth.uid())) then
        insert into public.hw_results (game_id, user_id, points, ai_points, level) values (g.id, coalesce(g.user_id, auth.uid()), (s ->> 'me')::int, (s ->> 'ai')::int, lv)
        on conflict do nothing;
        insert into public.game_results (id, user_id, game, mode, result, detail)
        values (g.id, coalesce(g.user_id, auth.uid()), 'hidden_word', 'solo',
                case when (s ->> 'me')::int > (s ->> 'ai')::int then 'win' when (s ->> 'me')::int < (s ->> 'ai')::int then 'loss' else 'draw' end,
                jsonb_build_object('mode', 'match', 'level', lv, 'score', (s ->> 'me')::int, 'ai', (s ->> 'ai')::int))
        on conflict do nothing;
        s := s || jsonb_build_object('recorded', true);
      end if;
    end if;

  else
    return public.hw_view(g.id, s);
  end if;

  update public.hw_games set state = s, updated_at = now() where id = g.id;
  return public.hw_view(g.id, s);
end $function$

;

CREATE OR REPLACE FUNCTION public.hw_rank_rows()
 RETURNS TABLE(user_id uuid, points integer, games integer, rnk integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  select t.user_id, (t.score * 10)::int, t.games, (row_number() over (order by t.score desc, t.games desc, t.last_at))::int
    from (select r.user_id, public.hw_rank_score(avg(r.points), count(*)::int) as score, count(*)::int as games, max(r.played_at) as last_at
            from public.hw_results r where r.level = 'basic' group by r.user_id) t
    join public.profiles p on p.id = t.user_id
   where p.show_in_hall and t.games >= 3 and t.score > 0;
$function$

;

drop function if exists public.hw_level_rank_rows(text);
revoke all on function public.hw_rank_rows(), public.refresh_game_crowns(), public.rank_mission_tick() from public, anon, authenticated;
commit;
notify pgrst, 'reload schema';

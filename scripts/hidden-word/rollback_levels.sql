-- Roll back 20271127000000_hidden_word_levels.sql: the functions as they were live on 2026-11-26 (pg_get_functiondef),
-- the 확장 rows removed. Run it, then reload the 기본-only data (4-column hw_targets.tsv) if hw_vocab should shrink back:
--   docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 < scripts/hidden-word/rollback_levels.sql
--   scripts/hidden-word/load_game.sh ~/puzzlthink-supabase/hidden-word/v2/game      (optional; 기본 numbers are the same)
-- The level columns stay (default 'basic', harmless); results of 확장 matches stay in hw_results / game_results.
begin;
delete from public.hw_hints h using public.hw_targets t where t.word = h.target and t.level <> 'basic';
delete from public.hw_targets where level <> 'basic';
drop function if exists public.hw_start(text);
drop function if exists public.hw_ranking(int, text);
drop function if exists public.hw_room_deal(text);
drop function if exists public.hw_ai_guess(jsonb, text[], int, boolean, text);
drop function if exists public.hw_ai_words(text, jsonb);
drop function if exists public.hw_deal(text);
drop function if exists public.hw_level_cfg(text);
drop function if exists public.hw_level(text);

CREATE OR REPLACE FUNCTION public.hw_ai_guess(p_clues jsonb, p_banned text[], p_seed integer, p_two boolean)
 RETURNS text[]
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare cfg jsonb := public.hw_cfg(); ws text[]; vs float8[];
begin
  with clue as (
    select c ->> 'w' as w, (c ->> 's')::float8 as s, v.idx
      from jsonb_array_elements(p_clues) c join public.hw_vocab v on v.word = c ->> 'w'
  ), cand as (
    select t.word, sum((clue.s - (cfg ->> 'aiBase')::float8) / (100 - (cfg ->> 'aiBase')::float8)
                       * (get_byte(substring(t.feel from clue.idx + 1 for 1), 0)
                          + public.hw_noise(p_seed, t.word, clue.w) * (cfg ->> 'aiNoise')::float8)) as v
      from public.hw_targets t cross join clue
     where t.word <> all (p_banned)
     group by t.word
  ), best as (select word, v from cand order by v desc, word limit 2)
  select array_agg(word order by v desc, word), array_agg(v order by v desc, word) into ws, vs from best;
  if ws is null then
    return array(select word from public.hw_targets where word <> all (p_banned) order by random() limit 1);
  end if;
  if p_two and array_length(ws, 1) = 2 and vs[1] - vs[2] < (cfg ->> 'aiGap')::float8 then return ws; end if;
  return ws[1:1];
end $function$

;

CREATE OR REPLACE FUNCTION public.hw_ai_hints(p_target text, p_stage integer, p_used text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  cut float8 := (public.hw_cfg() ->> 'cut')::float8;
  top text[]; n int; k int; lo float8; hi float8; closing text; out jsonb;
begin
  select array_agg(word order by fits - random() * 0.9 desc) into top
    from public.hw_hints where target = p_target and word <> all (p_used) and score >= cut and score < 98;
  if top is null then
    select array_agg(word order by fits - random() * 0.9 desc) into top
      from public.hw_hints where target = p_target and word <> all (p_used) and score >= cut;
  end if;
  if top is null then  -- every strong hint is spent: the best one left
    select array_agg(word) into top from (select word from public.hw_hints where target = p_target and word <> all (p_used) order by score desc limit 1) x;
  end if;
  n := array_length(top, 1);
  k := case p_stage when 1 then 1 when 2 then n / 2 + 1 + floor(random() * 3)::int - 1 else n end;
  closing := top[greatest(1, least(n, k))];
  lo := case p_stage when 1 then 72 when 2 then 80 else 86 end;
  hi := case p_stage when 1 then 86 when 2 then 91 else 94.5 end;
  select coalesce(jsonb_agg(jsonb_build_object('w', word, 's', score, 'stage', p_stage, 'by', 'ai')), '[]'::jsonb) into out
    from (select word, score from public.hw_hints
           where target = p_target and word <> all (p_used) and word <> closing and score between lo and hi
           order by random() limit 1 + floor(random() * 2)::int) w;
  return out || jsonb_build_array(jsonb_build_object('w', closing, 's', (select score from public.hw_hints where target = p_target and word = closing), 'stage', p_stage, 'by', 'ai'));
end $function$

;

CREATE OR REPLACE FUNCTION public.hw_view(p_id uuid, s jsonb)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select (s - 'aiWords' - 'seed' - 'envelopes')
      || jsonb_build_object('id', p_id, 'now', (extract(epoch from clock_timestamp()) * 1000)::bigint, 'cfg', public.hw_cfg() - 'aiNoise' - 'aiBase' - 'aiGap')
      || jsonb_build_object('pieces', public.piece_balance(auth.uid()))
      || case when s -> 't' ->> 'kind' = 'guess' and s ->> 'phase' = 'guess' then jsonb_build_object('t', (s -> 't') - 'word') else '{}'::jsonb end
$function$

;

CREATE OR REPLACE FUNCTION public.hw_begin_turn(s jsonb, p_now bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare cfg jsonb := public.hw_cfg(); is_set boolean; word text;
begin
  is_set := (((s ->> 'first') = 'set') <> ((s ->> 'turnNo')::int = 1)) <> ((s ->> 'round')::int = 2);
  if is_set then
    return s || jsonb_build_object('phase', 'pick', 'deadline', null,
      't', jsonb_build_object('kind', 'set', 'stage', 1, 'hints', '[]'::jsonb, 'guesses', '[]'::jsonb, 'chance', true, 'me', 0, 'ai', 0));
  end if;
  word := s -> 'aiWords' ->> ((s ->> 'round')::int - 1);
  return s || jsonb_build_object('phase', 'guess', 'deadline', p_now + (cfg ->> 'guessSecs')::int * 1000 + 6000,
    't', jsonb_build_object('kind', 'guess', 'word', word, 'stage', 1, 'hints', public.hw_ai_hints(word, 1, '{}'), 'guesses', '[]'::jsonb, 'chance', true, 'me', 0, 'ai', 0));
end $function$

;

CREATE OR REPLACE FUNCTION public.hw_start()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  envs jsonb := '[[],[],[],[],[],[]]'; groups jsonb := '[[],[],[],[],[],[]]';
  r record; i int; j int; start int; filled int := 0; s jsonb; gid uuid;
begin
  delete from public.hw_games where updated_at < now() - interval '2 days';
  for r in select word, cluster from public.hw_targets order by random() loop
    exit when filled = 30;
    start := floor(random() * 6)::int;
    for i in 0..5 loop
      j := (i + start) % 6;
      if jsonb_array_length(envs -> j) < 5 and not (groups -> j ? r.cluster) then
        envs := jsonb_set(envs, array[j::text], (envs -> j) || to_jsonb(r.word));
        groups := jsonb_set(groups, array[j::text], (groups -> j) || to_jsonb(r.cluster));
        filled := filled + 1;
        exit;
      end if;
    end loop;
  end loop;
  if filled < 30 then return jsonb_build_object('error', 'unavailable'); end if;
  s := jsonb_build_object('phase', 'envelope', 'envelopes', envs, 'hand', '[]'::jsonb,
    'first', case when random() < 0.5 then 'set' else 'guess' end, 'round', 1, 'turnNo', 0,
    'me', 0, 'ai', 0, 'history', '[]'::jsonb, 'deadline', null, 'seed', floor(random() * 1000000)::int);
  insert into public.hw_games (user_id, state) values (auth.uid(), s) returning id into gid;
  return public.hw_view(gid, s);
end $function$

;

CREATE OR REPLACE FUNCTION public.hw_act(p_game uuid, p_action jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  cfg jsonb := public.hw_cfg();
  g public.hw_games; s jsonb; t jsonb; kind text := p_action ->> 't'; phase text;
  now_ms bigint := (extract(epoch from clock_timestamp()) * 1000)::bigint;
  mult int; stage int; w text; ws text[]; sc numeric; late boolean; closed boolean; ok boolean;
  hand jsonb; clues jsonb; banned text[]; used text[]; sims jsonb; n int;
begin
  select * into g from public.hw_games where id = p_game for update;
  if not found or (g.user_id is not null and g.user_id is distinct from auth.uid()) then
    return jsonb_build_object('error', 'missing');
  end if;
  s := g.state; t := s -> 't'; phase := s ->> 'phase'; mult := (s ->> 'round')::int; stage := (t ->> 'stage')::int;
  late := (s ->> 'deadline') is not null and now_ms > (s ->> 'deadline')::bigint + 3000;

  if phase = 'envelope' and kind = 'envelope' then
    hand := s -> 'envelopes' -> (p_action ->> 'i')::int;
    if hand is null then return public.hw_view(g.id, s); end if;
    s := s || jsonb_build_object('hand', hand, 'envelope', (p_action ->> 'i')::int, 'aiWords', to_jsonb(array(
      select word from (select distinct on (cluster) word from public.hw_targets where not (hand ? word) order by cluster, random()) x
       order by random() limit 2)));
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
      ws := public.hw_ai_guess(clues, banned || array(select h ->> 'w' from jsonb_array_elements(t -> 'hints') h), (s ->> 'seed')::int, (t ->> 'chance')::boolean and stage >= 2);
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
        insert into public.hw_results (game_id, user_id, points, ai_points) values (g.id, coalesce(g.user_id, auth.uid()), (s ->> 'me')::int, (s ->> 'ai')::int)
        on conflict do nothing;
        -- the shared records too: 내 기록, play history (needs 20271126020000_hidden_word_records.sql for the game id)
        insert into public.game_results (id, user_id, game, mode, result, detail)
        values (g.id, coalesce(g.user_id, auth.uid()), 'hidden_word', 'solo',
                case when (s ->> 'me')::int > (s ->> 'ai')::int then 'win' when (s ->> 'me')::int < (s ->> 'ai')::int then 'loss' else 'draw' end,
                jsonb_build_object('mode', 'match', 'score', (s ->> 'me')::int, 'ai', (s ->> 'ai')::int))
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
            from public.hw_results r group by r.user_id) t
    join public.profiles p on p.id = t.user_id
   where p.show_in_hall and t.games >= 3 and t.score > 0;
$function$

;

CREATE OR REPLACE FUNCTION public.hw_ranking(p_limit integer DEFAULT 20)
 RETURNS TABLE(rank integer, nickname text, avatar_url text, points integer, games integer, best integer, wins integer, is_me boolean, avg numeric, bonus numeric, score numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  with tot as (
    select r.user_id, sum(r.points)::int as points, count(*)::int as games, max(r.points)::int as best,
           count(*) filter (where r.points > r.ai_points)::int as wins, max(r.played_at) as last_at,
           round(avg(r.points), 1) as avg, public.hw_rank_score(avg(r.points), count(*)::int) as score
      from public.hw_results r group by r.user_id
  ), ranked as (
    select t.user_id, (row_number() over (order by t.score desc, t.games desc, t.last_at))::int as rnk
      from tot t join public.profiles p on p.id = t.user_id
     where t.games >= 3 and t.score > 0 and (p.show_in_hall or t.user_id = auth.uid())
  )
  select x.rnk, coalesce(nullif(btrim(p.nickname), ''), '익명'), p.avatar_url, t.points, t.games, t.best, t.wins, t.user_id = auth.uid(),
         t.avg, round(least(t.games, 20) * 0.3, 1), t.score
    from tot t join public.profiles p on p.id = t.user_id left join ranked x on x.user_id = t.user_id
   where x.rnk <= greatest(1, least(p_limit, 100)) or t.user_id = auth.uid()
   order by x.rnk nulls last;
$function$

;

CREATE OR REPLACE FUNCTION public.hw_room_deal()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  envs jsonb := '[[],[],[],[],[],[]]'; groups jsonb := '[[],[],[],[],[],[]]';
  r record; i int; j int; start int; filled int := 0; words text[] := '{}'; did uuid;
begin
  delete from public.hw_room_deals where created_at < now() - interval '2 days';
  -- same dealing as hw_start: five words per envelope, no two from one cluster
  for r in select word, cluster from public.hw_targets order by random() loop
    exit when filled = 30;
    start := floor(random() * 6)::int;
    for i in 0..5 loop
      j := (i + start) % 6;
      if jsonb_array_length(envs -> j) < 5 and not (groups -> j ? r.cluster) then
        envs := jsonb_set(envs, array[j::text], (envs -> j) || to_jsonb(r.word));
        groups := jsonb_set(groups, array[j::text], (groups -> j) || to_jsonb(r.cluster));
        words := words || r.word;
        filled := filled + 1;
        exit;
      end if;
    end loop;
  end loop;
  if filled < 30 then return jsonb_build_object('error', 'unavailable'); end if;
  insert into public.hw_room_deals (words) values (words) returning id into did;
  return jsonb_build_object('deal', did, 'envelopes', envs, 'cfg', public.hw_cfg());
end $function$

;

revoke all on function public.hw_ai_guess(jsonb, text[], int, boolean), public.hw_ai_hints(text, int, text[]),
  public.hw_begin_turn(jsonb, bigint), public.hw_view(uuid, jsonb), public.hw_rank_rows() from public, anon, authenticated;
revoke all on function public.hw_room_deal() from public;
grant execute on function public.hw_start(), public.hw_ranking(int), public.hw_room_deal() to anon, authenticated;
commit;
notify pgrst, 'reload schema';

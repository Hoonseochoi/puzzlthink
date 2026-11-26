-- 히든 워드 levels: 기본 ('basic', the 60-word pool so far) and 확장 ('plus', a second, larger and harder pool).
-- Both pools live in the same tables; a hidden word belongs to one level (hw_targets.level). The vocabulary
-- (hw_vocab) is shared, so both pools are built and loaded together (scripts/hidden-word/load_game.sh).
--   hw_level_cfg(level)   the rules of a level: hw_cfg() (기본, unchanged) plus the 확장 overrides
--   hw_start(level)       a match of that level (no argument = 기본, so pages loaded before this keep working)
--   hw_act                the match's level comes from its state (matches started before this are 기본)
--   hw_ranking(limit, level) and hw_results.level: each level ranks on its own; the shared 'hidden_word' board
--                         (기록실, crown) stays 기본 only
--   hw_room_deal(level)   friend rooms deal from the chosen level
-- Also: MORA's own words used to be drawn one per group, so a word alone in its group (주말) came up far more
-- often than the rest; now every word of the level is equally likely (still never two of one group).
-- Function bodies are the live definitions (20271126000000, 060000, 070000, 120000) with the level added.

alter table public.hw_targets add column if not exists level text not null default 'basic';
alter table public.hw_targets drop constraint if exists hw_targets_level_check;
alter table public.hw_targets add constraint hw_targets_level_check check (level in ('basic', 'plus'));
create index if not exists hw_targets_level on public.hw_targets (level);

alter table public.hw_results add column if not exists level text not null default 'basic';
create index if not exists hw_results_level_user on public.hw_results (level, user_id);

alter table public.hw_room_deals add column if not exists level text not null default 'basic';

create or replace function public.hw_level(p_level text)
returns text language sql immutable
as $$ select case when p_level = 'plus' then 'plus' else 'basic' end $$;

-- The rules of a level. 기본 = hw_cfg() as it was. MORA's hint choice, per stage:
--   aiWarm   the score range of its warm-up hints; aiWarmN how many (at least, at most)
--   aiClose  where the closing (95%+) hint sits among its 95%+ hints ordered from the one that fits the most other
--            pool words (0) to the most specific (1)
-- 확장: the same match and points on a harder pool; MORA's hints stay on the shared end and come with one warm-up,
-- and it reads hints a little more sharply (aiNoise 3). Tuned with scripts/hidden-word/simulate.py.
create or replace function public.hw_level_cfg(p_level text)
returns jsonb language sql immutable
as $$ select public.hw_cfg()
  || jsonb_build_object('aiWarm', jsonb_build_array(jsonb_build_array(72, 86), jsonb_build_array(80, 91), jsonb_build_array(86, 94.5)),
                        'aiWarmN', jsonb_build_array(1, 2), 'aiClose', jsonb_build_array(0, 0.5, 1))
  || case when public.hw_level(p_level) = 'plus' then jsonb_build_object(
       'aiWarm', jsonb_build_array(jsonb_build_array(70, 82), jsonb_build_array(78, 88), jsonb_build_array(85, 93)),
       'aiWarmN', jsonb_build_array(1, 1), 'aiClose', jsonb_build_array(0, 0.15, 0.4),
       'aiNoise', 3.0
     ) else '{}'::jsonb end $$;

-- Six envelopes of five words of one level, no two of a group in one envelope.
create or replace function public.hw_deal(p_level text)
returns jsonb language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  envs jsonb := '[[],[],[],[],[],[]]'; groups jsonb := '[[],[],[],[],[],[]]';
  r record; i int; j int; start int; filled int := 0; words text[] := '{}';
begin
  for r in select word, cluster from public.hw_targets where level = public.hw_level(p_level) order by random() loop
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
  if filled < 30 then return null; end if;
  return jsonb_build_object('envelopes', envs, 'words', to_jsonb(words));
end $$;

-- MORA's two words for a match: not in my hand, not of one group, every word of the level equally likely
-- (the lowest random number of each group, then the two lowest of those).
create or replace function public.hw_ai_words(p_level text, p_hand jsonb)
returns jsonb language sql volatile security definer set search_path = public, pg_temp
as $$
  select coalesce(jsonb_agg(word order by r), '[]'::jsonb) from (
    select word, r from (
      select distinct on (cluster) word, r from (
        select word, cluster, random() as r from public.hw_targets where level = public.hw_level(p_level) and not (p_hand ? word)
      ) x order by cluster, r
    ) y order by r limit 2
  ) z
$$;

-- The AI's answer, among the hidden words of one level (see 20271126000000 for how it reasons).
create or replace function public.hw_ai_guess(p_clues jsonb, p_banned text[], p_seed int, p_two boolean, p_level text)
returns text[] language plpgsql stable security definer set search_path = public, pg_temp
as $$
declare cfg jsonb := public.hw_level_cfg(p_level); ws text[]; vs float8[];
begin
  with clue as (
    select c ->> 'w' as w, (c ->> 's')::float8 as s, v.idx
      from jsonb_array_elements(p_clues) c join public.hw_vocab v on v.word = c ->> 'w'
  ), cand as (
    select t.word, sum((clue.s - (cfg ->> 'aiBase')::float8) / (100 - (cfg ->> 'aiBase')::float8)
                       * (get_byte(substring(t.feel from clue.idx + 1 for 1), 0)
                          + public.hw_noise(p_seed, t.word, clue.w) * (cfg ->> 'aiNoise')::float8)) as v
      from public.hw_targets t cross join clue
     where t.level = public.hw_level(p_level) and t.word <> all (p_banned)
     group by t.word
  ), best as (select word, v from cand order by v desc, word limit 2)
  select array_agg(word order by v desc, word), array_agg(v order by v desc, word) into ws, vs from best;
  if ws is null then
    return array(select word from public.hw_targets where level = public.hw_level(p_level) and word <> all (p_banned) order by random() limit 1);
  end if;
  if p_two and array_length(ws, 1) = 2 and vs[1] - vs[2] < (cfg ->> 'aiGap')::float8 then return ws; end if;
  return ws[1:1];
end $$;

-- The old signature, for anything still calling it: 기본.
create or replace function public.hw_ai_guess(p_clues jsonb, p_banned text[], p_seed int, p_two boolean)
returns text[] language sql stable security definer set search_path = public, pg_temp
as $$ select public.hw_ai_guess(p_clues, p_banned, p_seed, p_two, 'basic') $$;

-- The AI's hints for one stage; the level (and so its warm-up ranges) comes from the hidden word.
create or replace function public.hw_ai_hints(p_target text, p_stage int, p_used text[])
returns jsonb language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare
  cfg jsonb := public.hw_level_cfg((select level from public.hw_targets where word = p_target));
  cut float8 := (cfg ->> 'cut')::float8;
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
  -- 1-based position of the closing hint (기본: 1, about the middle give or take one, the last), half rounded up
  k := 1 + round(((cfg -> 'aiClose' ->> (least(p_stage, 3) - 1))::numeric) * (n - 1))::int
       + case when p_stage = 2 then floor(random() * 3)::int - 1 else 0 end;
  closing := top[greatest(1, least(n, k))];
  lo := (cfg -> 'aiWarm' -> (least(p_stage, 3) - 1) ->> 0)::float8;
  hi := (cfg -> 'aiWarm' -> (least(p_stage, 3) - 1) ->> 1)::float8;
  select coalesce(jsonb_agg(jsonb_build_object('w', word, 's', score, 'stage', p_stage, 'by', 'ai')), '[]'::jsonb) into out
    from (select word, score from public.hw_hints
           where target = p_target and word <> all (p_used) and word <> closing and score between lo and hi
           order by random()
           limit (cfg -> 'aiWarmN' ->> 0)::int + floor(random() * ((cfg -> 'aiWarmN' ->> 1)::int - (cfg -> 'aiWarmN' ->> 0)::int + 1))::int) w;
  return out || jsonb_build_array(jsonb_build_object('w', closing, 's', (select score from public.hw_hints where target = p_target and word = closing), 'stage', p_stage, 'by', 'ai'));
end $$;

-- What the player may see; cfg is the match's level (a match from before levels is 기본).
create or replace function public.hw_view(p_id uuid, s jsonb)
returns jsonb language sql stable security definer set search_path = public
as $$
  select (s - 'aiWords' - 'seed' - 'envelopes')
      || jsonb_build_object('id', p_id, 'now', (extract(epoch from clock_timestamp()) * 1000)::bigint,
                            'level', public.hw_level(s ->> 'level'),
                            'cfg', public.hw_level_cfg(s ->> 'level') - 'aiNoise' - 'aiBase' - 'aiGap' - 'aiWarm' - 'aiWarmN' - 'aiClose')
      || jsonb_build_object('pieces', public.piece_balance(auth.uid()))
      || case when s -> 't' ->> 'kind' = 'guess' and s ->> 'phase' = 'guess' then jsonb_build_object('t', (s -> 't') - 'word') else '{}'::jsonb end
$$;

create or replace function public.hw_begin_turn(s jsonb, p_now bigint)
returns jsonb language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare cfg jsonb := public.hw_level_cfg(s ->> 'level'); is_set boolean; word text;
begin
  is_set := (((s ->> 'first') = 'set') <> ((s ->> 'turnNo')::int = 1)) <> ((s ->> 'round')::int = 2);
  if is_set then
    return s || jsonb_build_object('phase', 'pick', 'deadline', null,
      't', jsonb_build_object('kind', 'set', 'stage', 1, 'hints', '[]'::jsonb, 'guesses', '[]'::jsonb, 'chance', true, 'me', 0, 'ai', 0));
  end if;
  word := s -> 'aiWords' ->> ((s ->> 'round')::int - 1);
  return s || jsonb_build_object('phase', 'guess', 'deadline', p_now + (cfg ->> 'guessSecs')::int * 1000 + 6000,
    't', jsonb_build_object('kind', 'guess', 'word', word, 'stage', 1, 'hints', public.hw_ai_hints(word, 1, '{}'), 'guesses', '[]'::jsonb, 'chance', true, 'me', 0, 'ai', 0));
end $$;

drop function if exists public.hw_start();
create or replace function public.hw_start(p_level text default 'basic')
returns jsonb language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare lv text := public.hw_level(p_level); d jsonb; s jsonb; gid uuid;
begin
  delete from public.hw_games where updated_at < now() - interval '2 days';
  d := public.hw_deal(lv);
  if d is null then return jsonb_build_object('error', 'unavailable'); end if;
  s := jsonb_build_object('phase', 'envelope', 'level', lv, 'envelopes', d -> 'envelopes', 'hand', '[]'::jsonb,
    'first', case when random() < 0.5 then 'set' else 'guess' end, 'round', 1, 'turnNo', 0,
    'me', 0, 'ai', 0, 'history', '[]'::jsonb, 'deadline', null, 'seed', floor(random() * 1000000)::int);
  insert into public.hw_games (user_id, state) values (auth.uid(), s) returning id into gid;
  return public.hw_view(gid, s);
end $$;

-- One move (20271126070000 with the level): cfg, MORA's words and answers, and the result row follow the match's level.
create or replace function public.hw_act(p_game uuid, p_action jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
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
end $$;

-- The shared 승점 board 'hidden_word' (기록실, ranking page, crown) stays 기본.
create or replace function public.hw_rank_rows()
returns table (user_id uuid, points int, games int, rnk int)
language sql stable security definer set search_path = public, pg_temp
as $$
  select t.user_id, (t.score * 10)::int, t.games, (row_number() over (order by t.score desc, t.games desc, t.last_at))::int
    from (select r.user_id, public.hw_rank_score(avg(r.points), count(*)::int) as score, count(*)::int as games, max(r.played_at) as last_at
            from public.hw_results r where r.level = 'basic' group by r.user_id) t
    join public.profiles p on p.id = t.user_id
   where p.show_in_hall and t.games >= 3 and t.score > 0;
$$;
revoke all on function public.hw_rank_rows() from public, anon, authenticated;

-- The in-game ranking sheet, per level (20271126050000 with the level).
drop function if exists public.hw_ranking(int);
create or replace function public.hw_ranking(p_limit int default 20, p_level text default 'basic')
returns table (rank int, nickname text, avatar_url text, points int, games int, best int, wins int, is_me boolean, avg numeric, bonus numeric, score numeric)
language sql stable security definer set search_path = public, pg_temp
as $$
  with tot as (
    select r.user_id, sum(r.points)::int as points, count(*)::int as games, max(r.points)::int as best,
           count(*) filter (where r.points > r.ai_points)::int as wins, max(r.played_at) as last_at,
           round(avg(r.points), 1) as avg, public.hw_rank_score(avg(r.points), count(*)::int) as score
      from public.hw_results r where r.level = public.hw_level(p_level) group by r.user_id
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
$$;

-- Friend rooms deal from the chosen level (20271126120000 with the level).
drop function if exists public.hw_room_deal();
create or replace function public.hw_room_deal(p_level text default 'basic')
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare lv text := public.hw_level(p_level); d jsonb; did uuid;
begin
  delete from public.hw_room_deals where created_at < now() - interval '2 days';
  d := public.hw_deal(lv);
  if d is null then return jsonb_build_object('error', 'unavailable'); end if;
  insert into public.hw_room_deals (words, level) values (array(select jsonb_array_elements_text(d -> 'words')), lv) returning id into did;
  return jsonb_build_object('deal', did, 'level', lv, 'envelopes', d -> 'envelopes', 'cfg', public.hw_level_cfg(lv) - 'aiNoise' - 'aiBase' - 'aiGap' - 'aiWarm' - 'aiWarmN' - 'aiClose');
end $$;

revoke all on function public.hw_level_cfg(text), public.hw_deal(text), public.hw_ai_words(text, jsonb),
  public.hw_ai_guess(jsonb, text[], int, boolean, text), public.hw_ai_guess(jsonb, text[], int, boolean),
  public.hw_ai_hints(text, int, text[]), public.hw_begin_turn(jsonb, bigint), public.hw_view(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.hw_start(text), public.hw_ranking(int, text), public.hw_room_deal(text) from public;
grant execute on function public.hw_level(text), public.hw_start(text), public.hw_ranking(int, text), public.hw_room_deal(text) to anon, authenticated;

notify pgrst, 'reload schema';

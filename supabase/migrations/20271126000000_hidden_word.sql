-- 히든 워드 (hidden word): the AI match, played on the server so the AI's word never reaches the browser.
--   hw_vocab     every word a player may type (~74k nouns), with its column in the score tables
--   hw_targets   the hidden-word pool (60 words in look-alike groups). scores = % x 10 of every vocab word
--                against this word (uint16 LE), feel = the embedding model's own % (uint8): the AI player
--                guesses from feel only, so it reasons from meaning and cannot read the answer off a table
--   hw_hints     each hidden word's association list (what the AI gives as hints), and how many other
--                pool words a hint fits just as well
--   hw_games     one row per match; state holds everything, hw_view() strips what the player may not see
--   hw_results   finished matches of signed-in players (the 승점 ranking)
-- Data is built offline by scripts/hidden-word and loaded with scripts/hidden-word/load_game.sh.
-- Tables have RLS on and no policies: only the SECURITY DEFINER functions below touch them.
-- Rules live in hw_cfg(); scripts/hidden-word/simulate.py plays the same rules for tuning.

create table if not exists public.hw_vocab (word text primary key, idx int not null);
alter table public.hw_vocab enable row level security;

create table if not exists public.hw_targets (word text primary key, cluster text not null, scores bytea not null, feel bytea not null);
alter table public.hw_targets alter column scores set storage external;  -- read two bytes without unpacking the row
alter table public.hw_targets alter column feel set storage external;
alter table public.hw_targets enable row level security;

create table if not exists public.hw_hints (target text not null, word text not null, score real not null, fits int not null, primary key (target, word));
alter table public.hw_hints enable row level security;

create table if not exists public.hw_games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  state jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists hw_games_updated on public.hw_games (updated_at);
alter table public.hw_games enable row level security;

create table if not exists public.hw_results (
  game_id uuid primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  points int not null,
  ai_points int not null,
  played_at timestamptz not null default now()
);
create index if not exists hw_results_user on public.hw_results (user_id);
alter table public.hw_results enable row level security;

-- The rules. Points are per stage (1차, 2차, 3차); round 2 doubles them.
create or replace function public.hw_cfg()
returns jsonb language sql immutable
as $$ select jsonb_build_object(
  'cut', 95,                 -- a hint at or above this ends the hint phase
  'stages', 3,
  'maxHints', 5,             -- hints per stage before the closest word is revealed
  'setPoints', jsonb_build_array(1, 2, 3),    -- setter, each stage the word survives
  'guessPoints', jsonb_build_array(6, 3, 1),  -- guesser, by the stage of the right answer
  'hintSecs', 120, 'guessSecs', 75,
  'aiNoise', 5.0, 'aiBase', 60, 'aiGap', 3.0
) $$;

create or replace function public.hw_cell(p_scores bytea, p_idx int)
returns numeric language sql immutable
as $$ select round((get_byte(substring(p_scores from p_idx * 2 + 1 for 2), 0) + 256 * get_byte(substring(p_scores from p_idx * 2 + 1 for 2), 1)) / 10.0, 1) $$;

-- Similarity (0-100, one decimal) of a word to a hidden word of the pool; null when either is unknown.
create or replace function public.hw_score(p_target text, p_word text)
returns numeric language sql stable security definer set search_path = public, pg_temp
as $$ select public.hw_cell(t.scores, v.idx) from public.hw_targets t, public.hw_vocab v where t.word = p_target and v.word = p_word $$;

-- A repeatable number around 0 (sd 1) for one word pair of one match: the AI's feel is a little off.
create or replace function public.hw_noise(p_seed int, p_a text, p_b text)
returns float8 language sql immutable
as $$ select ((abs(hashtext(p_seed || ':' || p_a || ':' || p_b)) % 1000 + abs(hashtext(p_b || ':' || p_seed || ':' || p_a)) % 1000) / 1000.0 - 1) * 2.449 $$;

-- The AI's answer: the pool word that explains the clues best (related to the hints shown as close,
-- unrelated to the ones shown as far), going by the embedding's feel only. p_two: it may spend its
-- chance on a second word when its two best are close.
create or replace function public.hw_ai_guess(p_clues jsonb, p_banned text[], p_seed int, p_two boolean)
returns text[] language plpgsql stable security definer set search_path = public, pg_temp
as $$
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
end $$;

-- The AI's hints for one stage: one or two warm-ups below the cut, then one at or above it. Stage 1 closes
-- with the hint that fits the most other pool words, stage 3 with the one that fits the fewest.
create or replace function public.hw_ai_hints(p_target text, p_stage int, p_used text[])
returns jsonb language plpgsql volatile security definer set search_path = public, pg_temp
as $$
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
end $$;

-- What the player may see of a match: not the AI's words, not the other envelopes, not the word being guessed.
create or replace function public.hw_view(p_id uuid, s jsonb)
returns jsonb language sql stable
as $$
  select (s - 'aiWords' - 'seed' - 'envelopes')
      || jsonb_build_object('id', p_id, 'now', (extract(epoch from clock_timestamp()) * 1000)::bigint, 'cfg', public.hw_cfg() - 'aiNoise' - 'aiBase' - 'aiGap')
      || case when s -> 't' ->> 'kind' = 'guess' and s ->> 'phase' = 'guess' then jsonb_build_object('t', (s -> 't') - 'word') else '{}'::jsonb end
$$;

-- Start the turn s.round / s.turnNo: the player sets (picks a word) or guesses (the AI's first hints).
create or replace function public.hw_begin_turn(s jsonb, p_now bigint)
returns jsonb language plpgsql volatile security definer set search_path = public, pg_temp
as $$
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
end $$;

-- New match: six envelopes of five words (no two of a group in one envelope), and who sets first.
create or replace function public.hw_start()
returns jsonb language plpgsql volatile security definer set search_path = public, pg_temp
as $$
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
end $$;

create or replace function public.hw_state(p_game uuid)
returns jsonb language sql stable security definer set search_path = public, pg_temp
as $$ select public.hw_view(g.id, g.state) from public.hw_games g where g.id = p_game and (g.user_id is null or g.user_id = auth.uid()) $$;

-- One move. p_action: {t:'envelope', i} | {t:'pick', word} | {t:'hint', word} | {t:'guess', words:[..]}
--                     | {t:'timeout'} | {t:'next'}. A refused word comes back as {..., error: reason} with nothing changed.
create or replace function public.hw_act(p_game uuid, p_action jsonb)
returns jsonb language plpgsql volatile security definer set search_path = public, pg_temp
as $$
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
      ws := public.hw_ai_guess(clues, banned, (s ->> 'seed')::int, (t ->> 'chance')::boolean and stage >= 2);
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
        if exists (select 1 from jsonb_array_elements(t -> 'guesses') x where x -> 'w' ? w) then
          return public.hw_view(g.id, s) || jsonb_build_object('error', 'duplicate', 'word', w);
        end if;
        if not exists (select 1 from public.hw_vocab v where v.word = w) then return public.hw_view(g.id, s) || jsonb_build_object('error', 'unknown', 'word', w); end if;
      end loop;
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
end $$;

-- 승점 ranking: total points over every finished match. Ties: fewer matches, then who got there first.
create or replace function public.hw_ranking(p_limit int default 20)
returns table (rank int, nickname text, avatar_url text, points int, games int, best int, wins int, is_me boolean)
language sql stable security definer set search_path = public, pg_temp
as $$
  with tot as (
    select r.user_id, sum(r.points)::int as points, count(*)::int as games, max(r.points)::int as best,
           count(*) filter (where r.points > r.ai_points)::int as wins, max(r.played_at) as last_at
      from public.hw_results r group by r.user_id
  ), ranked as (
    select t.*, (row_number() over (order by t.points desc, t.games, t.last_at))::int as rnk
      from tot t join public.profiles p on p.id = t.user_id where p.show_in_hall or t.user_id = auth.uid()
  )
  select x.rnk, coalesce(nullif(btrim(p.nickname), ''), '익명'), p.avatar_url, x.points, x.games, x.best, x.wins, x.user_id = auth.uid()
    from ranked x join public.profiles p on p.id = x.user_id
   where x.rnk <= greatest(1, least(p_limit, 100)) or x.user_id = auth.uid()
   order by x.rnk;
$$;

revoke all on function public.hw_score(text, text), public.hw_cell(bytea, int), public.hw_noise(int, text, text),
  public.hw_ai_guess(jsonb, text[], int, boolean), public.hw_ai_hints(text, int, text[]),
  public.hw_begin_turn(jsonb, bigint), public.hw_view(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.hw_cfg(), public.hw_start(), public.hw_state(uuid), public.hw_act(uuid, jsonb), public.hw_ranking(int) to anon, authenticated;

notify pgrst, 'reload schema';

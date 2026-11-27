-- 히든 워드 / 히든 워드 확장판: a permanent record of the words people play, to improve the word data.
--   hw_log_hints    one row per hint shown on the board: the hidden word (target), level, the hint, the number shown,
--                   stage, turn kind ('set' = the player hides, 'guess' = MORA hides, 'room' = friend room), who gave
--                   it ('player', 'mora', 'reveal' = the closest list word revealed, 'room' / 'room?' in rooms)
--   hw_log_answers  one row per answer: the word(s) answered, their numbers, stage, who answered, correct or not
--   hw_log_refused  a word the game refused (reason 'invalid' / 'secret' / 'duplicate' / 'unknown' = not in the
--                   vocabulary) with what it was for ('hint' / 'answer'): 'unknown' words are candidates for the vocabulary
-- No user id, nickname, e-mail or IP is stored. Rows of one match share `match_id`, which is NOT the game's id but a
-- keyed hash of it (hw_log_id, with a random key kept in hw_log_key): the log cannot be joined to hw_results /
-- game_results (which do carry the player) without that key, and hw_games rows themselves still go after 2 days.
-- Written only by SECURITY DEFINER functions: the hw_games trigger (every hint and answer of an AI match as it lands
-- on the board), hw_act (refused words) and the friend-room scoring functions. RLS on, no policies.
-- Natural key (match_id, round, turn, pos) = the entry's place in the match, so the backfill from saved hw_games
-- states (scripts/hidden-word/backfill_log.sh) and the live writes never double-count.
-- Friend rooms: the server only ever saw a room's hidden words and how many words were scored, so rooms played before
-- this have nothing to recover; from now on hw_room_score / hw_room_reveal log each word (the client says whether it
-- is a hint or an answer; an older page that does not is logged as a hint with who = 'room?').
-- Rollback: scripts/hidden-word/rollback_log.sql.

create table if not exists public.hw_log_key (k bytea not null);
insert into public.hw_log_key (k) select decode(replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''), 'hex') where not exists (select 1 from public.hw_log_key);
alter table public.hw_log_key enable row level security;

create or replace function public.hw_log_id(p_id uuid)
returns uuid language sql stable security definer set search_path = public, pg_temp
as $$ select md5((select k from public.hw_log_key limit 1) || convert_to(p_id::text, 'UTF8'))::uuid $$;

create table if not exists public.hw_log_hints (
  match_id uuid not null, round smallint not null, turn text not null, pos smallint not null,
  level text not null, target text not null, word text not null, score numeric(4, 1), stage smallint,
  who text not null, at timestamptz not null default now(),
  primary key (match_id, round, turn, pos)
);
create table if not exists public.hw_log_answers (
  match_id uuid not null, round smallint not null, turn text not null, pos smallint not null,
  level text not null, target text not null, words text[] not null, scores numeric(4, 1)[], stage smallint,
  who text not null, correct boolean not null, at timestamptz not null default now(),
  primary key (match_id, round, turn, pos)
);
create table if not exists public.hw_log_refused (
  id bigserial primary key, match_id uuid not null, level text not null, target text, word text not null,
  reason text not null, kind text not null, stage smallint, at timestamptz not null default now()
);
create index if not exists hw_log_hints_target_word on public.hw_log_hints (level, target, word);
create index if not exists hw_log_hints_word on public.hw_log_hints (word);
create index if not exists hw_log_hints_at on public.hw_log_hints (at);
create index if not exists hw_log_answers_target on public.hw_log_answers (level, target);
create index if not exists hw_log_answers_at on public.hw_log_answers (at);
create index if not exists hw_log_refused_reason on public.hw_log_refused (reason, word);
alter table public.hw_log_hints enable row level security;
alter table public.hw_log_answers enable row level security;
alter table public.hw_log_refused enable row level security;

-- Log one turn's hints from position p_hfrom and answers from p_gfrom (0 = all). p_match is already hashed.
create or replace function public.hw_log_turn(p_match uuid, p_level text, p_round int, p_turn jsonb, p_hfrom int, p_gfrom int, p_at timestamptz)
returns void language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  if p_turn is null or p_turn ->> 'word' is null then return; end if;
  insert into public.hw_log_hints (match_id, round, turn, pos, level, target, word, score, stage, who, at)
  select p_match, p_round, p_turn ->> 'kind', o - 1, p_level, p_turn ->> 'word', h ->> 'w', (h ->> 's')::numeric, (h ->> 'stage')::smallint,
         case h ->> 'by' when 'me' then 'player' when 'ai' then 'mora' else coalesce(h ->> 'by', '?') end, p_at
    from jsonb_array_elements(coalesce(p_turn -> 'hints', '[]')) with ordinality x(h, o)
   where o > p_hfrom and h ->> 'w' is not null
  on conflict do nothing;
  insert into public.hw_log_answers (match_id, round, turn, pos, level, target, words, scores, stage, who, correct, at)
  select p_match, p_round, p_turn ->> 'kind', o - 1, p_level, p_turn ->> 'word',
         array(select jsonb_array_elements_text(coalesce(a -> 'w', '[]'))),
         array(select (x)::numeric from jsonb_array_elements_text(coalesce(a -> 's', '[]')) x),
         (a ->> 'stage')::smallint, case a ->> 'by' when 'me' then 'player' when 'ai' then 'mora' else coalesce(a ->> 'by', '?') end,
         coalesce((a ->> 'ok')::boolean, false), p_at
    from jsonb_array_elements(coalesce(p_turn -> 'guesses', '[]')) with ordinality y(a, o)
   where o > p_gfrom
  on conflict do nothing;
end $$;

-- Every turn of a saved match state (history and the turn in play): used by the backfill.
create or replace function public.hw_log_state(p_id uuid, p_state jsonb, p_at timestamptz)
returns void language plpgsql security definer set search_path = public, pg_temp
as $$
declare m uuid := public.hw_log_id(p_id); lv text := public.hw_level(p_state ->> 'level'); h jsonb;
begin
  for h in select x from jsonb_array_elements(coalesce(p_state -> 'history', '[]')) x loop
    perform public.hw_log_turn(m, lv, (h ->> 'round')::int, h, 0, 0, p_at);
  end loop;
  if p_state ? 't' then perform public.hw_log_turn(m, lv, (p_state ->> 'round')::int, p_state -> 't', 0, 0, p_at); end if;
end $$;

-- As a match moves on, log what just landed on the board (only the new entries of the turn in play).
create or replace function public.hw_log_game()
returns trigger language plpgsql security definer set search_path = public, pg_temp
as $$
declare nt jsonb := new.state -> 't'; ot jsonb; hf int := 0; gf int := 0;
begin
  if nt is null or nt ->> 'word' is null then return null; end if;
  if tg_op = 'UPDATE' then
    ot := old.state -> 't';
    if ot is not null and old.state ->> 'round' = new.state ->> 'round' and old.state ->> 'turnNo' = new.state ->> 'turnNo'
       and ot ->> 'kind' = nt ->> 'kind' and ot ->> 'word' is not distinct from nt ->> 'word' then
      hf := jsonb_array_length(coalesce(ot -> 'hints', '[]')); gf := jsonb_array_length(coalesce(ot -> 'guesses', '[]'));
    end if;
  end if;
  begin
    perform public.hw_log_turn(public.hw_log_id(new.id), public.hw_level(new.state ->> 'level'), (new.state ->> 'round')::int, nt, hf, gf, now());
  exception when others then null;   -- the log never stops a match
  end;
  return null;
end $$;
drop trigger if exists hw_log_game on public.hw_games;
create trigger hw_log_game after insert or update of state on public.hw_games for each row execute function public.hw_log_game();

-- A refused word (called by hw_act before it returns the refusal).
create or replace function public.hw_log_refusal(p_game uuid, s jsonb, p_word text, p_reason text, p_kind text)
returns void language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  if p_word is null or btrim(p_word) = '' then return; end if;
  insert into public.hw_log_refused (match_id, level, target, word, reason, kind, stage)
  values (public.hw_log_id(p_game), public.hw_level(s ->> 'level'), s -> 't' ->> 'word', left(btrim(p_word), 40), p_reason, p_kind, (s -> 't' ->> 'stage')::smallint);
exception when others then null;
end $$;

-- hw_act: the live definition (11/27, with 20271127100000) with only the refused-word logging added.
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
    perform public.count_play(case lv when 'plus' then 'hidden_word_plus' else 'hidden_word' end, 'ai');

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
      if w !~ '^[가-힣]{1,8}$' then perform public.hw_log_refusal(g.id, s, w, 'invalid', 'hint'); return public.hw_view(g.id, s) || jsonb_build_object('error', 'invalid'); end if;
      if w = t ->> 'word' then perform public.hw_log_refusal(g.id, s, w, 'secret', 'hint'); return public.hw_view(g.id, s) || jsonb_build_object('error', 'secret'); end if;
      if exists (select 1 from jsonb_array_elements(t -> 'hints') h where h ->> 'w' = w)
         or exists (select 1 from jsonb_array_elements(t -> 'guesses') x where x -> 'w' ? w) then
        perform public.hw_log_refusal(g.id, s, w, 'duplicate', 'hint');
        return public.hw_view(g.id, s) || jsonb_build_object('error', 'duplicate');
      end if;
      sc := public.hw_score(t ->> 'word', w);
      if sc is null then perform public.hw_log_refusal(g.id, s, w, 'unknown', 'hint'); return public.hw_view(g.id, s) || jsonb_build_object('error', 'unknown'); end if;
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
        if w !~ '^[가-힣]{1,8}$' then perform public.hw_log_refusal(g.id, s, w, 'invalid', 'answer'); return public.hw_view(g.id, s) || jsonb_build_object('error', 'invalid', 'word', w); end if;
        if exists (select 1 from jsonb_array_elements(t -> 'guesses') x where x -> 'w' ? w)
           or exists (select 1 from jsonb_array_elements(t -> 'hints') h where h ->> 'w' = w) then   -- a hint is never the answer
          perform public.hw_log_refusal(g.id, s, w, 'duplicate', 'answer');
          return public.hw_view(g.id, s) || jsonb_build_object('error', 'duplicate', 'word', w);
        end if;
        if not exists (select 1 from public.hw_vocab v where v.word = w) then perform public.hw_log_refusal(g.id, s, w, 'unknown', 'answer'); return public.hw_view(g.id, s) || jsonb_build_object('error', 'unknown', 'word', w); end if;
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
        values (g.id, coalesce(g.user_id, auth.uid()), case lv when 'plus' then 'hidden_word_plus' else 'hidden_word' end, 'solo',
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
end $function$;

-- Friend rooms: each scored word is logged. p_kind ('hint' / 'answer') comes from the page; without it (a page from
-- before this) the word is logged as a hint with who = 'room?'. pos = the lock's running count, so no two collide.
drop function if exists public.hw_room_score(uuid, text[]);
create or replace function public.hw_room_score(p_lock uuid, p_words text[], p_kind text default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare l public.hw_room_locks; n int := coalesce(array_length(p_words, 1), 0); lv text; out jsonb; ws text[];
begin
  if n < 1 or n > 2 then return null; end if;
  select * into l from public.hw_room_locks where id = p_lock for update;
  if not found or l.calls + n > 60 then return null; end if;
  update public.hw_room_locks set calls = calls + n where id = p_lock;
  ws := array(select normalize(btrim(w), NFC) from unnest(p_words) w);
  out := (select jsonb_agg(public.hw_score(l.word, w) order by o) from unnest(ws) with ordinality u(w, o));
  begin
    select coalesce(d.level, 'basic') into lv from public.hw_room_deals d where d.id = l.deal;
    if p_kind = 'answer' then
      insert into public.hw_log_answers (match_id, round, turn, pos, level, target, words, scores, stage, who, correct)
      values (public.hw_log_id(p_lock), 0, 'room', l.calls, coalesce(lv, 'basic'), l.word, ws,
              array(select (x)::numeric from jsonb_array_elements_text(out) x), null, 'room', l.word = any (ws))
      on conflict do nothing;
    else
      insert into public.hw_log_hints (match_id, round, turn, pos, level, target, word, score, stage, who)
      select public.hw_log_id(p_lock), 0, 'room', l.calls + o - 1, coalesce(lv, 'basic'), l.word, w, (out ->> (o - 1)::int)::numeric, null,
             case when p_kind = 'hint' then 'room' else 'room?' end
        from unnest(ws) with ordinality u(w, o) where out ->> (o - 1)::int is not null
      on conflict do nothing;
    end if;
    insert into public.hw_log_refused (match_id, level, target, word, reason, kind)
    select public.hw_log_id(p_lock), coalesce(lv, 'basic'), l.word, left(w, 40), 'unknown', coalesce(p_kind, 'room?')
      from unnest(ws) with ordinality u(w, o) where out ->> (o - 1)::int is null;
  exception when others then null;   -- the log never stops a room
  end;
  return out;
end $$;
revoke all on function public.hw_room_score(uuid, text[], text) from public;
grant execute on function public.hw_room_score(uuid, text[], text) to anon, authenticated;

create or replace function public.hw_room_reveal(p_lock uuid, p_used text[])
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare l public.hw_room_locks; w text; sc numeric;
begin
  select * into l from public.hw_room_locks where id = p_lock for update;
  if not found or l.calls >= 60 then return null; end if;
  update public.hw_room_locks set calls = calls + 1 where id = p_lock;
  select h.word, round(h.score::numeric, 1) into w, sc from public.hw_hints h
   where h.target = l.word and not (h.word = any (coalesce(p_used, '{}')))
   order by h.score desc, h.word limit 1;
  if w is null then return null; end if;
  begin
    insert into public.hw_log_hints (match_id, round, turn, pos, level, target, word, score, stage, who)
    select public.hw_log_id(p_lock), 0, 'room', l.calls, coalesce(d.level, 'basic'), l.word, w, sc, null, 'reveal'
      from public.hw_room_deals d where d.id = l.deal
    on conflict do nothing;
  exception when others then null;
  end;
  return jsonb_build_object('w', w, 's', sc);
end $$;

revoke all on function public.hw_log_id(uuid), public.hw_log_turn(uuid, text, int, jsonb, int, int, timestamptz),
  public.hw_log_state(uuid, jsonb, timestamptz), public.hw_log_game(), public.hw_log_refusal(uuid, jsonb, text, text, text)
  from public, anon, authenticated;

notify pgrst, 'reload schema';

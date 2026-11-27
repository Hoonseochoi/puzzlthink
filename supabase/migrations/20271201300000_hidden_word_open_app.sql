-- 히든 워드 / 히든 워드 확장판 open matches (오픈 대전), opened inside the Google Play app only.
--
-- 1. App-only listing. open_room_put / open_room_list / open_room_list_all take p_app; rooms of the games in
--    public.open_room_app_only() are written and listed only when it is 'play' (the Play app's client sends it, the
--    website never does). This is a marker, not proof: any client can send it. It stops a website visitor from
--    reaching the rooms through the site (URL editing included); it does not stop a hand-written client.
--
-- 2. Fair matches with strangers. In a friend room the host's browser holds all six envelopes and every hidden word
--    (hw_room_deal returns them, and the room state carries them to both browsers). An open match never puts a word
--    into the room state:
--      hw_open_deal(level)             a deal whose envelopes stay on the server → { deal }
--      hw_open_take(deal, i, key)      a player takes envelope i with a secret key only its browser knows → its words
--      hw_open_lock(deal, key, word)   the setter locks a word of its own envelope (twice per player)
--      hw_open_hint(lock, key, word)   similarity of a hint word: the setter's key only
--      hw_open_reveal(lock, key, used) the closest unused word (out of hints or time): the setter's key only
--      hw_open_answer(lock, key, ws)   the guesser's answer: the other player's key only, at most 3 answers and 4 words
--                                      per lock (the game's own limit), and the server says whether it is right
--    hw_room_lock / hw_room_score / hw_room_reveal refuse open deals and locks, so the lock id in the room state is no
--    way to probe the word. What stays client-reported (as in every open room, whose state the host's browser runs):
--    the numbers and the right/wrong a player sends with its own action. See the PR for the follow-up.
--
-- Rollout: apply this before deploying the client. Old clients keep working (the new parameters have defaults).

alter table public.hw_room_deals add column if not exists open boolean not null default false;
alter table public.hw_room_deals add column if not exists envelopes jsonb;
alter table public.hw_room_locks add column if not exists setter_key uuid;
alter table public.hw_room_locks add column if not exists answers int not null default 0;
alter table public.hw_room_locks add column if not exists answer_words int not null default 0;
alter table public.hw_room_locks add column if not exists solved boolean not null default false;

create table if not exists public.hw_open_hands (
  deal uuid not null references public.hw_room_deals (id) on delete cascade,
  envelope smallint not null,
  key uuid not null,
  words text[] not null,
  created_at timestamptz not null default now(),
  primary key (deal, envelope),
  unique (deal, key)
);
alter table public.hw_open_hands enable row level security;

-- ── 1. app-only open rooms ─────────────────────────────────────────────────────────────────────────────────────────
create or replace function public.open_room_app_only()
 returns text[] language sql immutable as $$ select array['hiddenWord', 'hiddenWordPlus'] $$;

drop function if exists public.open_room_put(text, text, text, integer, text, integer, integer, text);
CREATE OR REPLACE FUNCTION public.open_room_put(p_game text, p_code text, p_token text, p_variant integer, p_host text, p_players integer, p_capacity integer, p_title text DEFAULT ''::text, p_app text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if auth.uid() is null then return; end if;
  if p_game !~ '^[a-zA-Z0-9]{2,24}$' or p_code !~ '^[a-z0-9]{4,6}$' or length(p_token) not between 8 and 64 then return; end if;
  if p_game = any (public.open_room_app_only()) and p_app is distinct from 'play' then return; end if;
  delete from public.open_rooms where updated_at < now() - interval '10 minutes';
  insert into public.open_rooms (game, code, token, variant, host, players, capacity, title, updated_at)
  values (p_game, p_code, p_token, greatest(0, least(p_variant, 9)), left(coalesce(nullif(trim(p_host), ''), '?'), 16),
          greatest(1, least(p_players, 12)), greatest(1, least(p_capacity, 12)), left(trim(coalesce(p_title, '')), 30), now())
  on conflict (game, code) do update
    set token = excluded.token, variant = excluded.variant, host = excluded.host, players = excluded.players, capacity = excluded.capacity,
        title = excluded.title, updated_at = now()
    where public.open_rooms.token = excluded.token or public.open_rooms.updated_at < now() - interval '45 seconds';
end; $function$;

drop function if exists public.open_room_list(text);
CREATE OR REPLACE FUNCTION public.open_room_list(p_game text, p_app text DEFAULT NULL::text)
 RETURNS TABLE(code text, variant smallint, host text, players smallint, capacity smallint, title text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select code, variant, host, players, capacity, title from public.open_rooms
   where game = p_game and updated_at > now() - interval '90 seconds'
     and (p_app = 'play' or not (game = any (public.open_room_app_only())))
   order by updated_at desc limit 30;
$function$;

drop function if exists public.open_room_list_all();
CREATE OR REPLACE FUNCTION public.open_room_list_all(p_app text DEFAULT NULL::text)
 RETURNS TABLE(game text, code text, variant smallint, host text, players smallint, capacity smallint, title text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select game, code, variant, host, players, capacity, title from public.open_rooms
   where updated_at > now() - interval '90 seconds'
     and (p_app = 'play' or not (game = any (public.open_room_app_only())))
   order by updated_at desc limit 60;
$function$;

grant execute on function public.open_room_put(text, text, text, integer, text, integer, integer, text, text) to anon, authenticated;
grant execute on function public.open_room_list(text, text) to anon, authenticated;
grant execute on function public.open_room_list_all(text) to anon, authenticated;

-- ── 2. server-dealt open matches ───────────────────────────────────────────────────────────────────────────────────
-- The scoring and closest-word bodies of hw_room_score / hw_room_reveal, unchanged, as internal functions; the public
-- ones now refuse open locks and call these.
CREATE OR REPLACE FUNCTION public.hw_room_score_core(p_lock uuid, p_words text[], p_kind text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
end $function$;

CREATE OR REPLACE FUNCTION public.hw_room_reveal_core(p_lock uuid, p_used text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
end $function$;

CREATE OR REPLACE FUNCTION public.hw_room_score(p_lock uuid, p_words text[], p_kind text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  if exists (select 1 from public.hw_room_locks where id = p_lock and setter_key is not null) then return null; end if;
  return public.hw_room_score_core(p_lock, p_words, p_kind);
end $function$;

CREATE OR REPLACE FUNCTION public.hw_room_reveal(p_lock uuid, p_used text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  if exists (select 1 from public.hw_room_locks where id = p_lock and setter_key is not null) then return null; end if;
  return public.hw_room_reveal_core(p_lock, p_used);
end $function$;

CREATE OR REPLACE FUNCTION public.hw_room_lock(p_deal uuid, p_word text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare d public.hw_room_deals; lid uuid;
begin
  select * into d from public.hw_room_deals where id = p_deal for update;
  if not found or d.open or not (btrim(p_word) = any (d.words)) then return null; end if;
  select id into lid from public.hw_room_locks where deal = p_deal and word = btrim(p_word);
  if lid is not null then return lid; end if;
  if (select count(*) from public.hw_room_locks where deal = p_deal) >= 4 then return null; end if;
  insert into public.hw_room_locks (deal, word) values (p_deal, btrim(p_word)) returning id into lid;
  return lid;
end $function$;

-- A deal for an open match: the envelopes stay here; nothing about the words goes back.
CREATE OR REPLACE FUNCTION public.hw_open_deal(p_level text DEFAULT 'basic'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare lv text := public.hw_level(p_level); d jsonb; did uuid;
begin
  if auth.uid() is null then return jsonb_build_object('error', 'login'); end if;   -- open rooms are for members
  delete from public.hw_room_deals where created_at < now() - interval '2 days';
  d := public.hw_deal(lv);
  if d is null then return jsonb_build_object('error', 'unavailable'); end if;
  insert into public.hw_room_deals (words, level, open, envelopes)
  values (array(select jsonb_array_elements_text(d -> 'words')), lv, true, d -> 'envelopes') returning id into did;
  return jsonb_build_object('deal', did, 'level', lv);
end $function$;

-- Takes envelope i for the browser holding p_key (asked again with the same key: the same envelope). Two per deal.
CREATE OR REPLACE FUNCTION public.hw_open_take(p_deal uuid, p_i integer, p_key uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare d public.hw_room_deals; h public.hw_open_hands; ws text[];
begin
  if p_key is null then return null; end if;
  select * into d from public.hw_room_deals where id = p_deal for update;
  if not found or not d.open or d.envelopes is null then return null; end if;
  select * into h from public.hw_open_hands where deal = p_deal and key = p_key;
  if found then return jsonb_build_object('i', h.envelope, 'words', to_jsonb(h.words)); end if;
  if p_i is null or p_i < 0 or p_i >= jsonb_array_length(d.envelopes) then return null; end if;
  if exists (select 1 from public.hw_open_hands where deal = p_deal and envelope = p_i) then return jsonb_build_object('error', 'taken'); end if;
  if (select count(*) from public.hw_open_hands where deal = p_deal) >= 2 then return jsonb_build_object('error', 'full'); end if;
  ws := array(select jsonb_array_elements_text(d.envelopes -> p_i));
  insert into public.hw_open_hands (deal, envelope, key, words) values (p_deal, p_i, p_key, ws);
  return jsonb_build_object('i', p_i, 'words', to_jsonb(ws));
end $function$;

-- The setter locks a word of its own envelope: two per player (one per round), each word once.
CREATE OR REPLACE FUNCTION public.hw_open_lock(p_deal uuid, p_key uuid, p_word text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare h public.hw_open_hands; w text := btrim(p_word); lid uuid;
begin
  select * into h from public.hw_open_hands where deal = p_deal and key = p_key for update;
  if not found or not (w = any (h.words)) then return null; end if;
  select id into lid from public.hw_room_locks where deal = p_deal and word = w and setter_key = p_key;
  if lid is not null then return lid; end if;   -- a retry
  if (select count(*) from public.hw_room_locks where deal = p_deal and setter_key = p_key) >= 2 then return null; end if;
  insert into public.hw_room_locks (deal, word, setter_key) values (p_deal, w, p_key) returning id into lid;
  return lid;
end $function$;

CREATE OR REPLACE FUNCTION public.hw_open_hint(p_lock uuid, p_key uuid, p_word text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  if p_key is null or not exists (select 1 from public.hw_room_locks where id = p_lock and setter_key = p_key and not solved) then return null; end if;
  return public.hw_room_score_core(p_lock, array[p_word], 'hint');
end $function$;

CREATE OR REPLACE FUNCTION public.hw_open_reveal(p_lock uuid, p_key uuid, p_used text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  if p_key is null or not exists (select 1 from public.hw_room_locks where id = p_lock and setter_key = p_key) then return null; end if;
  return public.hw_room_reveal_core(p_lock, p_used);
end $function$;

-- The guesser's answer (1 word, or 2 with the one-time chance). Unknown words are refused before anything counts or
-- any number comes back, so an answer is no way to look up similarity.
CREATE OR REPLACE FUNCTION public.hw_open_answer(p_lock uuid, p_key uuid, p_words text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare l public.hw_room_locks; n int := coalesce(array_length(p_words, 1), 0); ws text[]; out jsonb;
begin
  if p_key is null or n < 1 or n > 2 then return null; end if;
  select * into l from public.hw_room_locks where id = p_lock for update;
  if not found or l.setter_key is null or l.setter_key = p_key or l.solved then return null; end if;
  if not exists (select 1 from public.hw_open_hands where deal = l.deal and key = p_key) then return null; end if;
  if l.answers >= 3 or l.answer_words + n > 4 then return null; end if;
  ws := array(select normalize(btrim(w), NFC) from unnest(p_words) w);
  if exists (select 1 from unnest(ws) w where not exists (select 1 from public.hw_vocab v where v.word = w)) then
    return jsonb_build_object('error', 'unknown');
  end if;
  out := public.hw_room_score_core(p_lock, ws, 'answer');
  if out is null then return null; end if;
  update public.hw_room_locks set answers = answers + 1, answer_words = answer_words + n, solved = (l.word = any (ws)) where id = p_lock;
  return jsonb_build_object('s', out, 'ok', l.word = any (ws));
end $function$;

revoke all on function public.hw_room_score_core(uuid, text[], text) from public, anon, authenticated;
revoke all on function public.hw_room_reveal_core(uuid, text[]) from public, anon, authenticated;
revoke all on function public.hw_open_deal(text) from public;
revoke all on function public.hw_open_take(uuid, integer, uuid) from public;
revoke all on function public.hw_open_lock(uuid, uuid, text) from public;
revoke all on function public.hw_open_hint(uuid, uuid, text) from public;
revoke all on function public.hw_open_reveal(uuid, uuid, text[]) from public;
revoke all on function public.hw_open_answer(uuid, uuid, text[]) from public;
grant execute on function public.hw_open_deal(text) to anon, authenticated;
grant execute on function public.hw_open_take(uuid, integer, uuid) to anon, authenticated;
grant execute on function public.hw_open_lock(uuid, uuid, text) to anon, authenticated;
grant execute on function public.hw_open_hint(uuid, uuid, text) to anon, authenticated;
grant execute on function public.hw_open_reveal(uuid, uuid, text[]) to anon, authenticated;
grant execute on function public.hw_open_answer(uuid, uuid, text[]) to anon, authenticated;

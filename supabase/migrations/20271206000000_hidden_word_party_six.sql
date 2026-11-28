-- 히든 워드 확장판 party rooms: up to 6 players, one turn each, and open (public) party rooms.
--
-- 1. Six seats. hw_party_deal takes 2–6 players (six envelopes were always dealt, so with six players every envelope is
--    taken). One round: each player sets once, so hw_party_lock gives one lock per envelope.
-- 2. Strangers can share a table. Until now a party lock was scored with hw_room_score(lock, words), so anyone holding
--    the lock id from the room state could ask the similarity of any word, the hidden word included. Party locks are
--    now keyed to the setter (hw_room_locks.setter_key = md5 of the setter's secret, as uuid), which makes
--    hw_room_score / hw_room_reveal refuse them (20271201300000), and the room asks these instead:
--      hw_party_hint(lock, secret, word)     the setter's hint: setter only
--      hw_party_reveal(lock, secret, used)   the closest unused list word: setter only
--      hw_party_answer(lock, secret, words)  a guesser's answer (1 word, or 2 with the one-time chance): only a player
--                                            who holds an envelope of this deal and is not the setter; at most 3
--                                            answers and 4 words per guesser per lock; unknown words are refused
--                                            before anything counts; the server says whether it is right
--    Friend and open party rooms both use them. Hints and answers are logged as before (hw_room_score_core).
--
-- Rollout: apply this, then deploy the client right after. Between the two, a party match already running on the old
-- client cannot score hints or answers (its new locks are keyed); 1:1 rooms are not touched.
-- Rollback (restores 20271128300000's behaviour; party clients of this version stop scoring):
--   drop function public.hw_party_hint(uuid, text, text), public.hw_party_reveal(uuid, text, text[]),
--                 public.hw_party_answer(uuid, text, text[]);
--   drop table public.hw_party_answers;
--   then re-run the hw_party_deal and hw_party_lock definitions of 20271128300000_hidden_word_party.sql.

create table if not exists public.hw_party_answers (
  lock uuid not null references public.hw_room_locks (id) on delete cascade,
  guesser uuid not null,          -- md5 of the guesser's secret, as uuid
  answers int not null default 0,
  words int not null default 0,
  primary key (lock, guesser)
);
alter table public.hw_party_answers enable row level security;

create or replace function public.hw_party_deal(p_players int default 6)
returns jsonb language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare d jsonb; did uuid; i int;
begin
  if auth.uid() is null then return jsonb_build_object('error', 'login'); end if;
  if p_players is null or p_players < 2 or p_players > 6 then return jsonb_build_object('error', 'invalid'); end if;
  delete from public.hw_room_deals where created_at < now() - interval '2 days';
  d := public.hw_deal('plus');
  if d is null then return jsonb_build_object('error', 'unavailable'); end if;
  insert into public.hw_room_deals (words, level) values (array(select jsonb_array_elements_text(d -> 'words')), 'plus') returning id into did;
  for i in 0..5 loop
    insert into public.hw_party_envelopes (deal, envelope, words)
    values (did, i, array(select jsonb_array_elements_text(d -> 'envelopes' -> i)));
  end loop;
  return jsonb_build_object('deal', did, 'level', 'plus', 'envelopes', 6);
end $$;

create or replace function public.hw_party_lock(p_deal uuid, p_word text, p_secret text)
returns uuid language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare e public.hw_party_envelopes; w text := normalize(btrim(coalesce(p_word, '')), NFC); k uuid; lid uuid;
begin
  if p_secret is null or length(p_secret) < 16 then return null; end if;
  k := md5(p_secret)::uuid;
  select * into e from public.hw_party_envelopes where deal = p_deal and secret_hash = md5(p_secret) for update;
  if not found or not (w = any (e.words)) then return null; end if;
  select id into lid from public.hw_room_locks where deal = p_deal and word = w and setter_key = k;
  if lid is not null then return lid; end if;     -- asking again for the same word (a reload)
  if e.locks >= 1 then return null; end if;       -- one turn each
  insert into public.hw_room_locks (deal, word, setter_key) values (p_deal, w, k) returning id into lid;
  update public.hw_party_envelopes set locks = locks + 1 where deal = p_deal and envelope = e.envelope;
  return lid;
end $$;

create or replace function public.hw_party_hint(p_lock uuid, p_secret text, p_word text)
returns jsonb language plpgsql volatile security definer set search_path = public, pg_temp
as $$
begin
  if p_secret is null or length(p_secret) < 16 then return null; end if;
  if not exists (select 1 from public.hw_room_locks where id = p_lock and setter_key = md5(p_secret)::uuid) then return null; end if;
  return public.hw_room_score_core(p_lock, array[p_word], 'hint');
end $$;

create or replace function public.hw_party_reveal(p_lock uuid, p_secret text, p_used text[])
returns jsonb language plpgsql volatile security definer set search_path = public, pg_temp
as $$
begin
  if p_secret is null or length(p_secret) < 16 then return null; end if;
  if not exists (select 1 from public.hw_room_locks where id = p_lock and setter_key = md5(p_secret)::uuid) then return null; end if;
  return public.hw_room_reveal_core(p_lock, p_used);
end $$;

create or replace function public.hw_party_answer(p_lock uuid, p_secret text, p_words text[])
returns jsonb language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare l public.hw_room_locks; n int := coalesce(array_length(p_words, 1), 0); k uuid; a public.hw_party_answers; ws text[]; out jsonb;
begin
  if p_secret is null or length(p_secret) < 16 or n < 1 or n > 2 then return null; end if;
  k := md5(p_secret)::uuid;
  select * into l from public.hw_room_locks where id = p_lock for update;
  if not found or l.setter_key is null or l.setter_key = k then return null; end if;
  if not exists (select 1 from public.hw_party_envelopes where deal = l.deal and secret_hash = md5(p_secret)) then return null; end if;
  select * into a from public.hw_party_answers where lock = p_lock and guesser = k;
  if found and (a.answers >= 3 or a.words + n > 4) then return null; end if;
  ws := array(select normalize(btrim(w), NFC) from unnest(p_words) w);
  if exists (select 1 from unnest(ws) w where not exists (select 1 from public.hw_vocab v where v.word = w)) then
    return jsonb_build_object('error', 'unknown');
  end if;
  out := public.hw_room_score_core(p_lock, ws, 'answer');
  if out is null then return null; end if;
  insert into public.hw_party_answers (lock, guesser, answers, words) values (p_lock, k, 1, n)
  on conflict (lock, guesser) do update set answers = hw_party_answers.answers + 1, words = hw_party_answers.words + n;
  return jsonb_build_object('s', out, 'ok', l.word = any (ws));
end $$;

revoke all on function public.hw_party_deal(int), public.hw_party_lock(uuid, text, text), public.hw_party_hint(uuid, text, text),
  public.hw_party_reveal(uuid, text, text[]), public.hw_party_answer(uuid, text, text[]) from public;
grant execute on function public.hw_party_deal(int), public.hw_party_lock(uuid, text, text), public.hw_party_hint(uuid, text, text),
  public.hw_party_reveal(uuid, text, text[]), public.hw_party_answer(uuid, text, text[]) to anon, authenticated;

notify pgrst, 'reload schema';

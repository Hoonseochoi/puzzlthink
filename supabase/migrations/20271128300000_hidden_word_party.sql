-- 히든 워드 확장판 party rooms: 2–5 friends, the broadcast's rules (src/lib/hiddenWordParty.ts has the rule set).
-- Unlike the 1:1 room, no browser ever receives another player's words:
--   hw_party_deal(players)            six envelopes of five 확장 words, kept here; the host gets only the deal id
--   hw_party_claim(deal, i, secret)   a player takes envelope i and receives its five words (only that player:
--                                     the envelope is bound to the player's own random secret, kept in their browser)
--   hw_party_lock(deal, word, secret) the setter locks one of their own words for a turn → lock id (at most two per
--                                     envelope: one per round); the word itself never goes into the room state
--   hw_room_score / hw_room_reveal    unchanged: similarity against the locked word; an answer is right when it scores
--                                     100 (only the word itself does: every other number is capped at 99.9)
-- Friend matches are not ranked. Members only, like the 1:1 확장판 room (the host must be signed in to deal).
-- Hints and answers are logged by hw_room_score / hw_room_reveal (20271128200000_hidden_word_log.sql) when that is applied.
-- Rollback: drop function hw_party_deal(int), hw_party_claim(uuid, int, text), hw_party_lock(uuid, text, text);
--           drop table hw_party_envelopes.

create table if not exists public.hw_party_envelopes (
  deal uuid not null references public.hw_room_deals (id) on delete cascade,
  envelope smallint not null,
  words text[] not null,
  secret_hash text,               -- md5 of the claiming browser's secret, null while unclaimed
  locks smallint not null default 0,
  primary key (deal, envelope)
);
alter table public.hw_party_envelopes enable row level security;

create or replace function public.hw_party_deal(p_players int default 5)
returns jsonb language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare d jsonb; did uuid; i int;
begin
  if auth.uid() is null then return jsonb_build_object('error', 'login'); end if;
  if p_players is null or p_players < 2 or p_players > 5 then return jsonb_build_object('error', 'invalid'); end if;
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

create or replace function public.hw_party_claim(p_deal uuid, p_envelope int, p_secret text)
returns text[] language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare e public.hw_party_envelopes; h text := md5(coalesce(p_secret, ''));
begin
  if p_secret is null or length(p_secret) < 16 then return null; end if;
  select * into e from public.hw_party_envelopes where deal = p_deal and envelope = p_envelope for update;
  if not found then return null; end if;
  if e.secret_hash is null then
    if exists (select 1 from public.hw_party_envelopes where deal = p_deal and secret_hash = h) then return null; end if;  -- one envelope each
    update public.hw_party_envelopes set secret_hash = h where deal = p_deal and envelope = p_envelope;
    return e.words;
  end if;
  return case when e.secret_hash = h then e.words end;   -- the same player asking again (a reload) gets their words back
end $$;

create or replace function public.hw_party_lock(p_deal uuid, p_word text, p_secret text)
returns uuid language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare e public.hw_party_envelopes; w text := normalize(btrim(coalesce(p_word, '')), NFC); lid uuid;
begin
  select * into e from public.hw_party_envelopes where deal = p_deal and secret_hash = md5(coalesce(p_secret, '')) for update;
  if not found or not (w = any (e.words)) then return null; end if;
  select id into lid from public.hw_room_locks where deal = p_deal and word = w;
  if lid is not null then return lid; end if;     -- asking again for the same word (a reload)
  if e.locks >= 2 then return null; end if;
  insert into public.hw_room_locks (deal, word) values (p_deal, w) returning id into lid;
  update public.hw_party_envelopes set locks = locks + 1 where deal = p_deal and envelope = e.envelope;
  return lid;
end $$;

revoke all on function public.hw_party_deal(int), public.hw_party_claim(uuid, int, text), public.hw_party_lock(uuid, text, text) from public;
grant execute on function public.hw_party_deal(int), public.hw_party_claim(uuid, int, text), public.hw_party_lock(uuid, text, text) to anon, authenticated;

notify pgrst, 'reload schema';

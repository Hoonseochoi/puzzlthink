-- Lounge chat ("라운지"): one site-wide room, on the home page and every game page (entry screen, AI games,
-- challenges, open-room waiting), mostly for finding people for open rooms. No admin needed to run it.
-- Every rule is checked here, in lounge_send (SECURITY DEFINER); the client only shows the reason.
--   1. Signed-in players only; one message per 3 seconds and at most 10 per minute.
--   2. Nearly the same text again within 5 minutes is refused; a third time is a 1-hour chat ban.
--   3. Swearing and sexual words (Korean and English, with spaces, symbols, digits, Latin letters or 자모
--      slipped between the letters, and 초성). The word list is the table lounge_words: edit it there.
--   4. Personal info: mobile numbers (any format, spelled-out digits too), e-mail, KakaoTalk / open chat /
--      messenger IDs, resident registration numbers, and links to other sites (puzzlthink.com is allowed).
--   5. A blocked message is not stored and not broadcast; the caller gets a reason code.
--   6. Reports: when 3 different players have reported someone (within an hour), that player gets a
--      10-minute chat ban and the reported messages are removed.
-- Accepted messages fan out by Realtime broadcast on the public topic 'lounge' (event 'msg'; 'del' on removal).
-- Only the last 50 are kept, for people who join late.
-- Not applied automatically: run by hand on supabase-db (see selfhost notes).

-- Tables (RLS on, no policies: everything goes through the functions below) ------------------------
create table if not exists public.lounge_messages (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  game text,
  body text not null,
  created_at timestamptz not null default now()
);
alter table public.lounge_messages enable row level security;

-- Recent sends per player (~10 minutes) for the rate limits (accepted only) and the repeat check
-- (accepted and refused repeats, so the third try is caught).
create table if not exists public.lounge_send_log (
  user_id uuid not null,
  norm text not null,
  at timestamptz not null default now(),
  accepted boolean not null default true
);
create index if not exists lounge_send_log_user_at on public.lounge_send_log (user_id, at desc);
alter table public.lounge_send_log enable row level security;

create table if not exists public.lounge_bans (
  user_id uuid primary key references auth.users (id) on delete cascade,
  until timestamptz not null,
  reason text not null,
  created_at timestamptz not null default now()
);
alter table public.lounge_bans enable row level security;

create table if not exists public.lounge_reports (
  id bigint generated always as identity primary key,
  message_id bigint not null,
  reporter uuid not null references auth.users (id) on delete cascade,
  reported_user uuid,
  body text,
  created_at timestamptz not null default now(),
  counted boolean not null default false, -- already led to a ban
  unique (message_id, reporter)
);
create index if not exists lounge_reports_user on public.lounge_reports (reported_user, created_at desc);
alter table public.lounge_reports enable row level security;

-- Site operators: shown as "퍼띵 운영자" in another colour, not held to the rate limits, the repeat check or
-- the link rule (word and personal-info checks still apply), and reports against them do not ban.
-- Rows are added by hand on the live DB (by account id), never in a migration.
create table if not exists public.lounge_staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.lounge_staff enable row level security;

-- The word list. kind: 'profanity' | 'sexual' block; 'allow' is removed from the text before checking
-- (everyday words that contain a blocked one, e.g. 시발점). Words are matched inside each word of the
-- message after lounge_norm, so write them plainly: '시발' also catches '시.발', '시1발', 'ㅅㅣ발', and
-- '시 발' / '개 새끼' / 'f u c k' (a one-letter word is joined to the next). Words are not matched across
-- ordinary spaces, so 'this exam' does not hit 'sex'; that is also why 보지/자지 (보지 마) are not listed.
create table if not exists public.lounge_words (
  word text primary key,
  kind text not null check (kind in ('profanity', 'sexual', 'allow'))
);
alter table public.lounge_words enable row level security;

insert into public.lounge_words (word, kind) values
  -- Korean swearing
  ('시발', 'profanity'), ('씨발', 'profanity'), ('씨빨', 'profanity'), ('시빨', 'profanity'), ('씨바', 'profanity'),
  ('쓰발', 'profanity'), ('싀발', 'profanity'), ('씌발', 'profanity'), ('씨팔', 'profanity'), ('시팔', 'profanity'),
  ('십팔', 'profanity'), ('씹팔', 'profanity'), ('씨부랄', 'profanity'), ('시부랄', 'profanity'), ('씹새', 'profanity'),
  ('씹년', 'profanity'), ('씹놈', 'profanity'), ('씹창', 'profanity'), ('십새', 'profanity'), ('18놈', 'profanity'),
  ('18년', 'profanity'), ('개새', 'profanity'), ('개색', 'profanity'), ('개세끼', 'profanity'), ('개쉐', 'profanity'),
  ('개씹', 'profanity'), ('개좆', 'profanity'), ('좆', 'profanity'), ('존나', 'profanity'), ('졸라', 'profanity'),
  ('조낸', 'profanity'), ('병신', 'profanity'), ('븅신', 'profanity'), ('빙신', 'profanity'), ('병쉰', 'profanity'),
  ('지랄', 'profanity'), ('염병', 'profanity'), ('미친놈', 'profanity'), ('미친년', 'profanity'), ('미친새', 'profanity'),
  ('미친색', 'profanity'), ('또라이', 'profanity'), ('닥쳐', 'profanity'), ('엿먹', 'profanity'),
  ('느금', 'profanity'), ('니애미', 'profanity'), ('니어미', 'profanity'), ('느그애미', 'profanity'), ('니미', 'profanity'),
  ('애미뒤', 'profanity'), ('애비뒤', 'profanity'), ('니엄마', 'profanity'), ('시이발', 'profanity'), ('씨이발', 'profanity'),
  ('씨발럼', 'profanity'), ('썅', 'profanity'), ('쌍년', 'profanity'), ('쌍놈', 'profanity'), ('호로', 'profanity'),
  ('후레자식', 'profanity'), ('좃', 'profanity'), ('존내', 'profanity'), ('젼나', 'profanity'),
  ('뒈져', 'profanity'), ('찐따', 'profanity'), ('애자', 'profanity'), ('정신병자', 'profanity'),
  ('ㅈ같', 'profanity'), ('ㅈㄹㄴ', 'profanity'), ('ㅆㅂㄹㅁ', 'profanity'), ('ㅂㅅㄴ', 'profanity'),
  ('ㅅㅂ', 'profanity'), ('ㅆㅂ', 'profanity'), ('ㅂㅅ', 'profanity'), ('ㅄ', 'profanity'), ('ㅈㄹ', 'profanity'),
  ('ㅈㄴ', 'profanity'), ('ㅁㅊ', 'profanity'), ('ㄲㅈ', 'profanity'), ('ㄷㅊ', 'profanity'), ('ㅅㄲ', 'profanity'),
  ('ㅗㅗ', 'profanity'), ('ㅆㄹㄱ', 'profanity'),
  ('한남충', 'profanity'), ('김치녀', 'profanity'), ('틀딱', 'profanity'), ('장애인새', 'profanity'),
  -- English swearing
  ('fuck', 'profanity'), ('fuk', 'profanity'), ('fck', 'profanity'), ('fxck', 'profanity'), ('phuck', 'profanity'),
  ('shit', 'profanity'), ('bitch', 'profanity'), ('biatch', 'profanity'), ('asshole', 'profanity'), ('bastard', 'profanity'),
  ('cunt', 'profanity'), ('dickhead', 'profanity'), ('motherf', 'profanity'), ('nigger', 'profanity'), ('nigga', 'profanity'),
  ('faggot', 'profanity'), ('retard', 'profanity'), ('wtf', 'profanity'), ('stfu', 'profanity'),
  -- Sexual
  ('섹스', 'sexual'), ('쎅스', 'sexual'), ('섹쓰', 'sexual'), ('섻스', 'sexual'), ('보짓', 'sexual'), ('보지털', 'sexual'),
  ('보지빨', 'sexual'), ('자지털', 'sexual'), ('자지빨', 'sexual'), ('잠지', 'sexual'), ('꼴려', 'sexual'), ('꼴림', 'sexual'), ('야동', 'sexual'), ('딸딸이', 'sexual'),
  ('자위', 'sexual'), ('강간', 'sexual'), ('창녀', 'sexual'), ('걸레년', 'sexual'), ('오르가즘', 'sexual'), ('펠라', 'sexual'),
  ('조건만남', 'sexual'), ('원나잇', 'sexual'), ('섹시', 'sexual'), ('젖꼭지', 'sexual'),
  ('사정해', 'sexual'), ('질싸', 'sexual'), ('노콘', 'sexual'), ('떡치', 'sexual'), ('붕가', 'sexual'),
  ('야짤', 'sexual'), ('몸사진', 'sexual'), ('엉덩이사진', 'sexual'), ('ㅅㅅ', 'sexual'), ('ㅅㅅ하', 'sexual'), ('ㅂㅈ', 'sexual'), ('ㅈㅈ빨', 'sexual'),
  ('sex', 'sexual'), ('porn', 'sexual'), ('pussy', 'sexual'), ('dick', 'sexual'), ('penis', 'sexual'), ('vagina', 'sexual'),
  ('boobs', 'sexual'), ('blowjob', 'sexual'), ('horny', 'sexual'), ('nude', 'sexual'), ('slut', 'sexual'), ('whore', 'sexual'),
  ('hentai', 'sexual'), ('milf', 'sexual'),
  -- Everyday words that contain one of the above
  ('시발점', 'allow'), ('시발역', 'allow'), ('자위대', 'allow'), ('자위권', 'allow'), ('강간섭', 'allow'), ('졸라맨', 'allow'),
  ('니미츠', 'allow'), ('sussex', 'allow'), ('essex', 'allow'), ('middlesex', 'allow'), ('dickens', 'allow'),
  ('scunthorpe', 'allow'), ('shitake', 'allow'), ('애자일', 'allow'),
  ('호로록', 'allow'), ('호로롱', 'allow'), ('사정해서', 'allow'), ('사정해도', 'allow'), ('사정해야', 'allow'),
  ('사정해주', 'allow')
on conflict (word) do nothing;

-- Helpers ---------------------------------------------------------------------------------------------
-- One canonical form: NFKC (full-width letters, ＠, and ㅅㅣ → 시), lower case, letters and digits only.
-- Choseong typed as compatibility jamo (ㅅㅂ) become conjoining jamo here; the word list goes through the
-- same function, so they still match.
create or replace function public.lounge_norm(p text)
returns text language sql immutable set search_path = public as $$
  select regexp_replace(lower(normalize(coalesce(p, ''), NFKC)), '[^0-9a-z가-힣ㄱ-ㅎㅏ-ㅣᄀ-ᇿ]', '', 'g');
$$;

-- The message as normalized words separated by spaces, in one of these forms:
--   raw     letters and digits (symbols and zero-width characters dropped: 시.발, 시★발 → 시발)
--   leet    f4ck → fack, sh1t → shit, $ex → sex
--   bare    digits dropped: 시1발 → 시발
--   squash  bare with repeats squashed: fuuuck → fuck
--   hangul  Hangul syllables only: 시a발, 시ㅋ발 → 시발
--   latin   Latin letters only (after leet): f가uck, sㅋex → fuck, sex
-- A one-letter word is joined to the next one, so '시 발', 'ㅅ ㅂ', 'f u c k', 'ㅅ ㅣ 발' and '개 새끼'
-- are read as one word.
create or replace function public.lounge_words_form(p_low text, p_form text)
returns text language plpgsql immutable set search_path = public as $$
declare
  tok text;
  word text;
  acc text := '';
  glue boolean := false;
begin
  foreach tok in array regexp_split_to_array(btrim(coalesce(p_low, '')), '\s+') loop
    word := public.lounge_norm(case when p_form = 'leet' then translate(tok, '013457@$!|', 'oieastasii') else tok end);
    if p_form in ('bare', 'squash') then word := regexp_replace(word, '[0-9]', '', 'g'); end if;
    if p_form = 'squash' then word := regexp_replace(word, '(.)\1+', '\1', 'g'); end if;
    if p_form = 'hangul' then word := regexp_replace(word, '[^가-힣]', '', 'g'); end if;
    if p_form = 'latin' then word := regexp_replace(word, '[^a-z]', '', 'g'); end if;
    if word = '' then continue; end if;
    acc := acc || case when acc = '' or glue then '' else ' ' end || word;
    glue := char_length(word) = 1;
  end loop;
  return normalize(acc, NFC); -- jamo split over one-letter words (ㅅ ㅣ 발) compose again
end; $$;

-- What a message may not contain, as a reason code, or null when it is fine.
create or replace function public.lounge_check(p_body text, p_staff boolean default false)
returns text language plpgsql stable set search_path = public as $$
declare
  low text := lower(normalize(coalesce(p_body, ''), NFKC));
  raw text := public.lounge_norm(p_body); -- letters + digits, no spaces
  form text;
  f text;
  digits text;
  mail text;
  w record;
begin
  -- 4. Personal info first: these also contain digits the word checks would strip.
  -- Phone: spelled-out digits to digits, separators removed (letters still break a number).
  digits := translate(low, '공영일이삼사오육륙칠팔구o', '0012345667890');
  digits := regexp_replace(digits, '[\s\-–—_.,·/\\()\[\]~+*#:|]', '', 'g');
  if digits ~ '(^|[^0-9])(01[016789][0-9]{7,8}|821[016789][0-9]{7,8})' then return 'phone'; end if;
  if digits ~ '[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[1-4][0-9]{6}' then return 'rrn'; end if;
  -- ...and a number split by words ("010 그리고 1234 5678"): every real digit in the message, together.
  if regexp_replace(low, '[^0-9]', '', 'g') ~ '01[016789][0-9]{7,8}' then return 'phone'; end if;

  -- E-mail, including "골뱅이", "(at)" and "닷"/"dot" spellings.
  mail := regexp_replace(low, '\s*(골뱅이|\(at\)|\[at\]|\sat\s)\s*', '@', 'g');
  mail := regexp_replace(mail, '\s*(닷|쩜|점|\(dot\)|\[dot\]|\sdot\s)\s*', '.', 'g');
  if mail ~ '[a-z0-9._%+\-]+\s*@\s*[a-z0-9\-]+(\s*\.\s*[a-z0-9\-]+)*\s*\.\s*[a-z]{2,}'
     or mail ~ '[a-z0-9._%+\-]+\s*@\s*(gmail|naver|daum|hanmail|nate|kakao|hotmail|outlook|icloud|yahoo|네이버|지메일|다음|한메일)'
     or raw ~ '(gmail|naver|hanmail|daum|nate|hotmail|outlook|icloud|yahoo)(com|net|cokr)' then
    return 'email';
  end if;

  -- KakaoTalk / open chat / messenger IDs.
  if raw ~ ('(카톡|카카오톡|카카오|캌톡|katalk|kakaotalk|kakao)(아이디|아뒤|아디|id|주소|친추|추가|검색|' || public.lounge_norm('ㄱ') || ')')
     or raw ~ '(openkakao|오픈채팅|오픈카톡|오픈톡|오카방|오픈챗|텔레그램|telegram|라인아이디|lineid|디코아이디|discordgg)'
     or raw like ('%' || public.lounge_norm('ㅋㅌ') || '아이디%') then
    return 'contact';
  end if;

  -- Links (other than this site).
  if not p_staff and regexp_replace(low, '(https?://)?(www\.)?puzzlthink\.com\S*', '', 'g') ~ '(https?://|www\.|\m[a-z0-9\-]+\.(com|net|org|kr|io|gg|me|ly|xyz|site|link)\M)' then
    return 'link';
  end if;

  -- 3. Words, inside each word of the message, on several forms of it, with allowed words taken out first.
  -- Links that got this far (this site, or staff) are left out, so https://example.com is not "s ex".
  low := regexp_replace(low, '(https?://|www\.)\S+|\m[a-z0-9\-]+(\.[a-z0-9\-]+)*\.(com|net|org|kr|io|gg|me|ly|xyz|site|link)\M\S*', ' ', 'g');
  foreach f in array array['raw', 'leet', 'bare', 'squash', 'hangul', 'latin'] loop
    form := public.lounge_words_form(low, f);
    for w in select public.lounge_words_form(lower(word), f) as word from public.lounge_words where kind = 'allow' loop -- same form, so Sussex is not 'susex'
      form := replace(form, w.word, '');
    end loop;
    for w in select public.lounge_norm(word) as word, kind from public.lounge_words where kind <> 'allow' order by kind loop
      if w.word <> '' and position(w.word in form) > 0 then return w.kind; end if;
    end loop;
  end loop;
  return null;
end; $$;
revoke all on function public.lounge_check(text, boolean) from public, anon, authenticated;

-- Removes a message everywhere (history and open screens).
create or replace function public.lounge_remove(p_id bigint)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  delete from public.lounge_messages where id = p_id;
  if not found then return false; end if;
  perform realtime.send(jsonb_build_object('id', p_id), 'del', 'lounge', false);
  return true;
end; $$;
revoke all on function public.lounge_remove(bigint) from public, anon, authenticated;

-- A player's public id in the lounge (for "mine" and muting): not the account id.
create or replace function public.lounge_sender(p_user uuid)
returns text language sql immutable set search_path = public as $$
  select left(encode(sha256(convert_to('lounge:' || p_user::text, 'UTF8')), 'hex'), 12);
$$;

-- Client API ------------------------------------------------------------------------------------------
-- The last 50 messages, my lounge id and my ban (if any). Anyone can read; only members can send.
create or replace function public.lounge_state()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'messages', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'sender', public.lounge_sender(user_id), 'name', name, 'game', game, 'staff', exists (select 1 from public.lounge_staff st where st.user_id = m.user_id), 'text', body,
                                                                'at', (extract(epoch from created_at) * 1000)::bigint) order by id)
                            from (select * from public.lounge_messages order by id desc limit 50) m), '[]'::jsonb),
    'me', case when auth.uid() is null then null else public.lounge_sender(auth.uid()) end,
    'banned_until', (select until from public.lounge_bans where user_id = auth.uid() and until > now()),
    'ban_reason', (select reason from public.lounge_bans where user_id = auth.uid() and until > now()));
$$;
revoke all on function public.lounge_state() from public;
grant execute on function public.lounge_state() to anon, authenticated;

-- Sends a message. Returns {ok: true, id} or {ok: false, reason, until?, wait_ms?}.
-- reason: login | empty | long | fast | quota | repeat | banned | spam | profanity | sexual | phone | rrn | email | contact | link
-- (banned also carries ban_reason: repeat | reports | admin)
create or replace function public.lounge_send(p_body text, p_game text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  v_body text := btrim(regexp_replace(coalesce(p_body, ''), '\s+', ' ', 'g'));
  v_game text := case when p_game ~ '^[A-Za-z0-9_\-]{1,24}$' then p_game end;
  v_norm text;
  ban timestamptz;
  last_at timestamptz;
  n_similar int;
  recent int;
  oldest timestamptz;
  ban_reason text;
  bad text;
  nick text;
  v_staff boolean;
  new_id bigint;
  sent_at timestamptz := now();
begin
  if me is null then return jsonb_build_object('ok', false, 'reason', 'login'); end if;
  if v_body = '' then return jsonb_build_object('ok', false, 'reason', 'empty'); end if;
  if char_length(v_body) > 200 then return jsonb_build_object('ok', false, 'reason', 'long'); end if;

  perform pg_advisory_xact_lock(hashtext('lounge:' || me::text)); -- one send at a time per player

  select until, reason into ban, ban_reason from public.lounge_bans where user_id = me and until > now();
  if ban is not null then return jsonb_build_object('ok', false, 'reason', 'banned', 'until', ban, 'ban_reason', ban_reason); end if;

  v_staff := exists (select 1 from public.lounge_staff where user_id = me);

  select max(at) into last_at from public.lounge_send_log where user_id = me and accepted;
  if not v_staff and last_at is not null and now() - last_at < interval '3 seconds' then
    return jsonb_build_object('ok', false, 'reason', 'fast', 'wait_ms', ceil(extract(epoch from (last_at + interval '3 seconds' - now())) * 1000)::int);
  end if;
  select count(*), min(at) into recent, oldest from public.lounge_send_log where user_id = me and accepted and at > now() - interval '1 minute';
  if not v_staff and recent >= 10 then
    return jsonb_build_object('ok', false, 'reason', 'quota', 'wait_ms', ceil(extract(epoch from (oldest + interval '1 minute' - now())) * 1000)::int);
  end if;

  bad := public.lounge_check(v_body, v_staff);
  if bad is not null then return jsonb_build_object('ok', false, 'reason', bad); end if;

  -- Spam: nearly the same text = same letters once repeats are squashed, or one contains the other.
  v_norm := regexp_replace(public.lounge_norm(v_body), '(.)\1+', '\1', 'g');
  select count(*) into n_similar
    from public.lounge_send_log l
   where l.user_id = me and l.at > now() - interval '5 minutes'
     and (l.norm = v_norm or (char_length(v_norm) >= 4 and char_length(l.norm) >= 4 and (position(l.norm in v_norm) > 0 or position(v_norm in l.norm) > 0)));
  if v_staff then n_similar := 0; end if;
  if n_similar >= 2 then
    insert into public.lounge_bans (user_id, until, reason) values (me, now() + interval '1 hour', 'repeat')
      on conflict (user_id) do update set until = greatest(public.lounge_bans.until, excluded.until), reason = excluded.reason, created_at = now();
    return jsonb_build_object('ok', false, 'reason', 'spam', 'until', now() + interval '1 hour');
  end if;
  if n_similar = 1 then -- refused, but remembered: the next try is the ban
    insert into public.lounge_send_log (user_id, norm, at, accepted) values (me, v_norm, sent_at, false);
    return jsonb_build_object('ok', false, 'reason', 'repeat');
  end if;

  select left(coalesce(nullif(btrim(nickname), ''), 'Player'), 16) into nick from public.profiles where id = me;
  insert into public.lounge_messages (user_id, name, game, body, created_at) values (me, coalesce(nick, 'Player'), v_game, v_body, sent_at) returning id into new_id;
  insert into public.lounge_send_log (user_id, norm, at) values (me, v_norm, sent_at);

  -- Keep the last 50 messages and ten minutes of send log.
  delete from public.lounge_messages where id <= new_id - 50;
  delete from public.lounge_send_log where user_id = me and at < now() - interval '10 minutes';

  perform realtime.send(jsonb_build_object('id', new_id, 'sender', public.lounge_sender(me), 'name', coalesce(nick, 'Player'), 'game', v_game, 'staff', v_staff, 'text', v_body,
                                           'at', (extract(epoch from sent_at) * 1000)::bigint), 'msg', 'lounge', false);
  return jsonb_build_object('ok', true, 'id', new_id);
end; $$;
revoke all on function public.lounge_send(text, text) from public, anon;
grant execute on function public.lounge_send(text, text) to authenticated;

-- Reports a message (once per message per player). When 3 different players have reported someone in the
-- last hour, that player gets a 10-minute chat ban and every message they were reported for is removed.
create or replace function public.lounge_report(p_id bigint)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  m public.lounge_messages;
  n int;
  r record;
begin
  if me is null then return jsonb_build_object('ok', false, 'reason', 'login'); end if;
  select * into m from public.lounge_messages where id = p_id;
  if m.id is null then return jsonb_build_object('ok', false, 'reason', 'gone'); end if;
  if m.user_id = me then return jsonb_build_object('ok', false, 'reason', 'self'); end if;
  if exists (select 1 from public.lounge_staff where user_id = m.user_id) then return jsonb_build_object('ok', true); end if;
  perform pg_advisory_xact_lock(hashtext('lounge-report:' || m.user_id::text));
  insert into public.lounge_reports (message_id, reporter, reported_user, body) values (m.id, me, m.user_id, m.body)
    on conflict (message_id, reporter) do nothing;
  select count(distinct reporter) into n from public.lounge_reports
   where reported_user = m.user_id and not counted and created_at > now() - interval '1 hour';
  if n >= 3 then
    insert into public.lounge_bans (user_id, until, reason) values (m.user_id, now() + interval '10 minutes', 'reports')
      on conflict (user_id) do update set until = greatest(public.lounge_bans.until, excluded.until),
                                          reason = case when public.lounge_bans.until > excluded.until then public.lounge_bans.reason else 'reports' end,
                                          created_at = now();
    for r in select distinct message_id from public.lounge_reports where reported_user = m.user_id and not counted loop
      perform public.lounge_remove(r.message_id);
    end loop;
    update public.lounge_reports set counted = true where reported_user = m.user_id and not counted;
    return jsonb_build_object('ok', true, 'banned', true);
  end if;
  return jsonb_build_object('ok', true);
end; $$;
revoke all on function public.lounge_report(bigint) from public, anon;
grant execute on function public.lounge_report(bigint) to authenticated;

-- Admin, optional (the lounge runs without one). Same token as admin_report: sha256 in admin_secrets 'report'.
create or replace function public.lounge_admin_ok(p_token text)
returns boolean language sql stable security definer set search_path = public as $$
  select p_token is not null and encode(sha256(convert_to(p_token, 'UTF8')), 'hex') = (select hash from public.admin_secrets where name = 'report');
$$;
revoke all on function public.lounge_admin_ok(text) from public, anon, authenticated;

create or replace function public.admin_lounge_reports(p_token text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.lounge_admin_ok(p_token) then raise exception 'forbidden'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('message_id', message_id, 'reported_user', reported_user, 'body', body, 'reports', n, 'last_at', last_at,
                                                       'live', exists (select 1 from public.lounge_messages where id = message_id)) order by last_at desc)
                     from (select message_id, reported_user, max(body) body, count(*)::int n, max(created_at) last_at from public.lounge_reports
                            where created_at > now() - interval '30 days' group by message_id, reported_user) r), '[]'::jsonb);
end; $$;
revoke all on function public.admin_lounge_reports(text) from public;
grant execute on function public.admin_lounge_reports(text) to anon, authenticated;

create or replace function public.admin_lounge_delete(p_token text, p_id bigint)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.lounge_admin_ok(p_token) then raise exception 'forbidden'; end if;
  return public.lounge_remove(p_id);
end; $$;
revoke all on function public.admin_lounge_delete(text, bigint) from public;
grant execute on function public.admin_lounge_delete(text, bigint) to anon, authenticated;

-- Bans a player for p_hours (0 lifts the ban).
create or replace function public.admin_lounge_ban(p_token text, p_user uuid, p_hours int)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.lounge_admin_ok(p_token) then raise exception 'forbidden'; end if;
  if coalesce(p_hours, 0) <= 0 then delete from public.lounge_bans where user_id = p_user; return; end if;
  insert into public.lounge_bans (user_id, until, reason) values (p_user, now() + make_interval(hours => p_hours), 'admin')
    on conflict (user_id) do update set until = excluded.until, reason = 'admin', created_at = now();
end; $$;
revoke all on function public.admin_lounge_ban(text, uuid, int) from public;
grant execute on function public.admin_lounge_ban(text, uuid, int) to anon, authenticated;

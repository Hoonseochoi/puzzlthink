-- 히든 워드: 라이어, round 2 of the owner's play-test (11/28):
--   1. A clue turn is 20 s (was 22). A turn that runs out is a silent clue ("⏰ 시간 초과"); as before it does not count
--      as a spoken clue for the reward rule.
--   2. 최후의 발언 → 검거 결정: the vote no longer ends the game. The accused gets 20 s of last words (phase 'last'), then
--      everyone else picks 검거하기 or 다시 투표하기 (phase 'decide', 15 s). More 검거 than 다시 투표 → arrested (the
--      liar gets the 30 s guess as before; a citizen arrested = the liar wins, 'wrong'). Otherwise (a tie or nobody chose)
--      → one re-vote per game, without the person just accused. At the second decision 다시 투표 is gone: the choice
--      is 검거하기 or 풀어 주기, and letting them go means the liar wins ('released').
--   3. Chat goes through hwl_chat: the server keeps the last lines of a room (hwl_chat) and pushes only their id; browsers
--      read the text back with hwl_chat_since. While a game runs, a line with the sender's own word is refused
--      ('word'); a line with the other game word (the answer or the liar's word) is accepted but shown to everyone else
--      as a hidden line, so the sender learns nothing from the server about the word they did not know. Spacing,
--      punctuation, particles (사과를) and typing in loose jamo (ㅅㅏㄱㅘ) are all caught (hwl_chat_hits).
--   4. The end of a game is a show: hwl_finish sets reveal_at / reveal_until (4 s + 0.8 s a player + 2 s if the liar
--      guessed); a friend host cannot start, and a 공개방 cannot restart, before reveal_until.
-- Test: scripts/hidden-word-liar/test_last_words.sql (scratch DB) and test_timeout.sql (begin … rollback anywhere).

-- ── settings ─────────────────────────────────────────────────────────────────────────────────────────────────────
create or replace function public.hwl_cfg()
returns jsonb language sql immutable as $$ select jsonb_build_object(
  'hot', 85,                       -- a clue this close to the answer shows as 85+ (its number hidden)
  'cards', 8, 'turn', 20, 'talk', 45, 'talkBig', 60, 'vote', 20, 'runoff', 15, 'last', 20, 'decide', 15, 'guess', 30,
  'again', 25, 'houseLobby', 25, 'revotes', 1,
  'revealBase', 4, 'revealSeat', 0.8, 'revealGuess', 2,   -- seconds of the end-of-game show
  'min', 4, 'max', 10, 'liarWin', 3, 'citizenWin', 1, 'dailyCap', 7   -- 피스 from this game per player per KST day (owner 11/28)
) $$;

-- ── tables ───────────────────────────────────────────────────────────────────────────────────────────────────────
alter table public.hwl_rooms drop constraint if exists hwl_rooms_phase_check;
alter table public.hwl_rooms add constraint hwl_rooms_phase_check
  check (phase in ('lobby', 'cards', 'clue', 'talk', 'vote', 'runoff', 'last', 'decide', 'guess', 'done', 'closed'));
alter table public.hwl_rooms add column if not exists excluded smallint[] not null default '{}';   -- accused once, not again
alter table public.hwl_rooms add column if not exists revotes smallint not null default 0;
alter table public.hwl_rooms add column if not exists reveal_at timestamptz;
alter table public.hwl_rooms add column if not exists reveal_until timestamptz;
alter table public.hwl_members add column if not exists decide text check (decide in ('arrest', 'revote'));

create table if not exists public.hwl_chat (
  id bigint generated always as identity primary key,
  code text not null references public.hwl_rooms (code) on delete cascade,
  seat smallint not null, name text not null,
  body text not null,
  hidden boolean not null default false,   -- carried a game word: everyone but the sender sees it hidden
  at timestamptz not null default now()
);
create index if not exists hwl_chat_room on public.hwl_chat (code, id);
alter table public.hwl_chat enable row level security;   -- no policies: only the functions below read or write it

-- ── chat filter ──────────────────────────────────────────────────────────────────────────────────────────────────
-- Hangul spelled out as plain jamo (compound vowels and finals split), anything else dropped: '사 과를' → 'ㅅㅏㄱㅗㅏㄹㅡㄹ'.
create or replace function public.hwl_jamo(p text)
returns text language plpgsql immutable as $$
declare
  cho text[] := array['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  jung text[] := array['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅗㅏ','ㅗㅐ','ㅗㅣ','ㅛ','ㅜ','ㅜㅓ','ㅜㅔ','ㅜㅣ','ㅠ','ㅡ','ㅡㅣ','ㅣ'];
  jong text[] := array['','ㄱ','ㄲ','ㄱㅅ','ㄴ','ㄴㅈ','ㄴㅎ','ㄷ','ㄹ','ㄹㄱ','ㄹㅁ','ㄹㅂ','ㄹㅅ','ㄹㅌ','ㄹㅍ','ㄹㅎ','ㅁ','ㅂ','ㅂㅅ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  out text := ''; ch text; c int; i int;
begin
  foreach ch in array regexp_split_to_array(normalize(coalesce(p, ''), NFC), '') loop
    c := ascii(ch);
    if c between 44032 and 55203 then
      i := c - 44032;
      out := out || cho[i / 588 + 1] || jung[(i % 588) / 28 + 1] || jong[i % 28 + 1];
    elsif c between 12593 and 12643 then   -- a loose compatibility jamo
      out := out || coalesce((jsonb_build_object('ㄳ','ㄱㅅ','ㄵ','ㄴㅈ','ㄶ','ㄴㅎ','ㄺ','ㄹㄱ','ㄻ','ㄹㅁ','ㄼ','ㄹㅂ','ㄽ','ㄹㅅ','ㄾ','ㄹㅌ','ㄿ','ㄹㅍ','ㅀ','ㄹㅎ','ㅄ','ㅂㅅ',
                                              'ㅘ','ㅗㅏ','ㅙ','ㅗㅐ','ㅚ','ㅗㅣ','ㅝ','ㅜㅓ','ㅞ','ㅜㅔ','ㅟ','ㅜㅣ','ㅢ','ㅡㅣ')) ->> ch, ch);
    end if;
  end loop;
  return out;
end $$;

-- Does this chat line carry the word? Syllables with everything else squeezed out ('사.과', '사 과를'), or — when the line
-- has loose jamo in it — the jamo spelling ('ㅅㅏ과'). Plain syllable text is not matched by jamo across syllable
-- boundaries, so short words do not hit ordinary sentences.
create or replace function public.hwl_chat_hits(p_text text, p_word text)
returns boolean language sql immutable as $$
  select coalesce(p_word, '') <> '' and (
    position(p_word in regexp_replace(normalize(coalesce(p_text, ''), NFC), '[^가-힣]', '', 'g')) > 0
    or (p_text ~ '[ㄱ-ㅣ]' and position(public.hwl_jamo(p_word) in public.hwl_jamo(p_text)) > 0))
$$;

create or replace function public.hwl_chat(p_code text, p_key text, p_text text)
returns jsonb language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare r public.hwl_rooms; m public.hwl_members; t text; own text; other text; hid boolean := false; nid bigint;
begin
  select * into r from public.hwl_rooms where code = p_code;
  if not found then return jsonb_build_object('error', 'missing'); end if;
  m := public.hwl_member(p_code, p_key);
  if m.seat is null then return jsonb_build_object('error', 'member'); end if;
  t := left(btrim(regexp_replace(coalesce(p_text, ''), '[[:cntrl:][:space:]]+', ' ', 'g')), 100);
  if t = '' then return jsonb_build_object('error', 'empty'); end if;
  if exists (select 1 from public.hwl_chat c where c.code = p_code and c.seat = m.seat and c.at > now() - interval '700 milliseconds') then
    return jsonb_build_object('error', 'fast');
  end if;
  if (select count(*) from public.hwl_chat c where c.code = p_code and c.seat = m.seat and c.at > now() - interval '10 seconds') >= 5 then
    return jsonb_build_object('error', 'burst');
  end if;
  if (select count(*) = 2 and bool_and(x.body = t) from (select c.body from public.hwl_chat c where c.code = p_code and c.seat = m.seat order by c.id desc limit 2) x) then
    return jsonb_build_object('error', 'repeat');
  end if;
  if r.phase in ('cards', 'clue', 'talk', 'vote', 'runoff', 'last', 'decide', 'guess') then
    if m.playing then
      own := case when m.seat = r.liar then r.decoy else r.answer end;
      other := case when m.seat = r.liar then r.answer else r.decoy end;
      if public.hwl_chat_hits(t, own) then return jsonb_build_object('error', 'word'); end if;
      hid := public.hwl_chat_hits(t, other);
    else
      hid := public.hwl_chat_hits(t, r.answer) or public.hwl_chat_hits(t, r.decoy);   -- someone watching
    end if;
  end if;
  insert into public.hwl_chat (code, seat, name, body, hidden) values (p_code, m.seat, m.name, t, hid) returning id into nid;
  delete from public.hwl_chat where code = p_code and id <= nid - 80;
  begin
    perform realtime.send(jsonb_build_object('id', nid), 'c', 'hwl-' || p_code, false);
  exception when others then null;
  end;
  return jsonb_build_object('ok', true, 'id', nid);
end $$;

-- Chat lines after p_after (the last 60 at most), as this browser may see them.
create or replace function public.hwl_chat_since(p_code text, p_key text, p_after bigint default 0)
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp
as $$
declare m public.hwl_members;
begin
  m := public.hwl_member(p_code, p_key);
  if m.seat is null then return '[]'::jsonb; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('id', x.id, 'seat', x.seat, 'name', x.name, 'at', floor(extract(epoch from x.at) * 1000),
            'text', case when x.hidden and x.seat <> m.seat then null else x.body end) order by x.id), '[]'::jsonb)
            from (select * from public.hwl_chat c where c.code = p_code and c.id > coalesce(p_after, 0) order by c.id desc limit 60) x);
end $$;

-- ── the game (redefined from 20271205100000 with the new phases) ───────────────────────────────────────────────────
create or replace function public.hwl_begin(p_code text, p_seats smallint[])
returns void language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare r public.hwl_rooms; cfg jsonb := public.hwl_cfg(); a text; cl text; d text; n int := coalesce(array_length(p_seats, 1), 0);
begin
  select * into r from public.hwl_rooms where code = p_code;
  select t.word, t.cluster into a, cl from public.hw_targets t
   where t.cluster not in ('한글자', '원작', '시간') and not (t.word = any (r.recent))
     and (select count(*) from public.hw_targets s where s.cluster = t.cluster) >= 3
   order by random() limit 1;
  if a is null then   -- every word used: start over
    update public.hwl_rooms set recent = '{}' where code = p_code;
    select t.word, t.cluster into a, cl from public.hw_targets t where t.cluster not in ('한글자', '원작', '시간') order by random() limit 1;
  end if;
  select s.word into d from public.hw_targets s where s.cluster = cl and s.word <> a order by random() limit 1;
  update public.hwl_members set playing = seat = any (p_seats), ready = false, talk = null, decide = null, mask_used = false, pieces = null,
         gone = case when seat = any (p_seats) then false else gone end
   where code = p_code;
  delete from public.hwl_clues where code = p_code and game_no <= r.game_no - 3;   -- keep a little history only
  delete from public.hwl_votes where code = p_code and game_no <= r.game_no - 3;
  update public.hwl_rooms set
    game_no = r.game_no + 1, phase = 'cards', deadline = now() + make_interval(secs => (cfg ->> 'cards')::int),
    answer = a, decoy = d, cluster = cl, liar = p_seats[1 + floor(random() * n)::int],
    turn_order = (select array_agg(x order by random()) from unnest(p_seats) x),
    round = 1, pos = 0, rounds_max = case when n <= 6 then 3 else 2 end,
    runoff = null, accused = null, outcome = null, reason = null, guess = null, valid = null,
    excluded = '{}', revotes = 0, reveal_at = null, reveal_until = null,
    recent = (r.recent || a)[greatest(1, array_length(r.recent || a, 1) - 40):]
   where code = p_code;
end $$;

create or replace function public.hwl_finish(p_code text, p_outcome text, p_reason text)
returns void language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare r public.hwl_rooms; cfg jsonb := public.hwl_cfg(); show numeric;
begin
  select * into r from public.hwl_rooms where code = p_code;
  show := case when p_outcome = 'void' then 0
               else (cfg ->> 'revealBase')::numeric + (cfg ->> 'revealSeat')::numeric * coalesce(array_length(r.turn_order, 1), 0)
                    + case when r.guess is not null then (cfg ->> 'revealGuess')::numeric else 0 end end;
  update public.hwl_rooms set phase = 'done', outcome = p_outcome, reason = p_reason,
         reveal_at = now(), reveal_until = now() + make_interval(secs => show::double precision),
         deadline = case when r.kind = 'house' then now() + make_interval(secs => (show + (cfg ->> 'again')::numeric)::double precision) end
   where code = p_code;
  update public.hwl_members set ready = false where code = p_code;
  perform public.hwl_settle(p_code);
end $$;

-- The vote picked one player: their last words come first (a tie goes to a runoff, a second tie lets the liar win).
create or replace function public.hwl_after_vote(p_code text)
returns void language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare r public.hwl_rooms; top int; tied smallint[];
begin
  select * into r from public.hwl_rooms where code = p_code;
  select max(c) into top from (select count(*) c from public.hwl_votes where code = p_code and game_no = r.game_no and stage = r.phase group by target) x;
  if top is null then perform public.hwl_finish(p_code, 'liar', 'tie'); return; end if;
  select array_agg(target order by target) into tied from (
    select target from public.hwl_votes where code = p_code and game_no = r.game_no and stage = r.phase group by target having count(*) = top) x;
  if array_length(tied, 1) > 1 then
    if r.phase = 'vote' then
      update public.hwl_rooms set phase = 'runoff', runoff = tied, deadline = now() + make_interval(secs => (public.hwl_cfg() ->> 'runoff')::int) where code = p_code;
    else
      perform public.hwl_finish(p_code, 'liar', 'tie');
    end if;
    return;
  end if;
  update public.hwl_members set decide = null where code = p_code;
  update public.hwl_rooms set accused = tied[1], phase = 'last', deadline = now() + make_interval(secs => (public.hwl_cfg() ->> 'last')::int) where code = p_code;
end $$;

-- 검거 or not: more 검거 than 다시 투표 arrests; otherwise one re-vote without them, and after that letting go = the liar wins.
create or replace function public.hwl_after_decide(p_code text)
returns void language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare r public.hwl_rooms; arrest int; back int;
begin
  select * into r from public.hwl_rooms where code = p_code;
  select count(*) filter (where decide = 'arrest'), count(*) filter (where decide = 'revote') into arrest, back
    from public.hwl_members where code = p_code and playing and not gone and seat <> r.accused;
  if arrest > back then
    if r.accused = r.liar then
      update public.hwl_rooms set phase = 'guess', deadline = now() + make_interval(secs => (public.hwl_cfg() ->> 'guess')::int) where code = p_code;
    else
      perform public.hwl_finish(p_code, 'liar', 'wrong');
    end if;
  elsif r.revotes < (public.hwl_cfg() ->> 'revotes')::int then
    delete from public.hwl_votes where code = p_code and game_no = r.game_no;
    update public.hwl_members set decide = null where code = p_code;
    update public.hwl_rooms set revotes = revotes + 1, excluded = excluded || r.accused, accused = null, runoff = null,
           phase = 'vote', deadline = now() + make_interval(secs => (public.hwl_cfg() ->> 'vote')::int) where code = p_code;
  else
    perform public.hwl_finish(p_code, 'liar', 'released');
  end if;
end $$;

create or replace function public.hwl_step(p_code text)
returns boolean language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare r public.hwl_rooms; alive smallint[]; rdy smallint[];
begin
  select * into r from public.hwl_rooms where code = p_code for update;
  if not found or r.deadline is null or r.deadline > now() then return false; end if;
  if r.phase = 'lobby' then   -- house rooms only: start with whoever arrived
    select coalesce(array_agg(seat order by seat), '{}') into alive from public.hwl_members where code = p_code and key_hash is not null and not gone;
    delete from public.hwl_members where code = p_code and key_hash is null;
    if coalesce(array_length(alive, 1), 0) >= (public.hwl_cfg() ->> 'min')::int then perform public.hwl_begin(p_code, alive);
    else update public.hwl_rooms set phase = 'closed', deadline = null where code = p_code; end if;
  elsif r.phase = 'cards' then
    perform public.hwl_settle_turn(p_code);
  elsif r.phase = 'clue' then
    insert into public.hwl_clues (code, game_no, n, seat, round)
    values (p_code, r.game_no, (select count(*) from public.hwl_clues where code = p_code and game_no = r.game_no), r.turn_order[r.pos + 1], r.round);
    update public.hwl_rooms set pos = pos + 1 where code = p_code;
    perform public.hwl_settle_turn(p_code);
  elsif r.phase = 'talk' then
    perform public.hwl_after_talk(p_code);
  elsif r.phase in ('vote', 'runoff') then
    perform public.hwl_after_vote(p_code);
  elsif r.phase = 'last' then
    update public.hwl_members set decide = null where code = p_code;
    update public.hwl_rooms set phase = 'decide', deadline = now() + make_interval(secs => (public.hwl_cfg() ->> 'decide')::int) where code = p_code;
  elsif r.phase = 'decide' then
    perform public.hwl_after_decide(p_code);
  elsif r.phase = 'guess' then
    perform public.hwl_finish(p_code, 'citizens', 'missed');
  elsif r.phase = 'done' and r.kind = 'house' then
    select coalesce(array_agg(seat order by seat), '{}') into rdy from public.hwl_members where code = p_code and ready and not gone;
    if coalesce(array_length(rdy, 1), 0) >= 5 then perform public.hwl_begin(p_code, rdy);
    else update public.hwl_rooms set phase = 'closed', deadline = null where code = p_code; end if;
  else
    return false;
  end if;
  -- too few left to play on: the game does not count
  select * into r from public.hwl_rooms where code = p_code;
  if r.phase in ('cards', 'clue', 'talk', 'vote', 'runoff', 'last', 'decide') and coalesce(array_length(public.hwl_alive(p_code), 1), 0) < 3 then
    perform public.hwl_finish(p_code, 'void', 'void');
  end if;
  perform public.hwl_bump(p_code);
  return true;
end $$;

create or replace function public.hwl_leave(p_code text, p_key text)
returns void language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare r public.hwl_rooms; m public.hwl_members; nh smallint;
begin
  select * into r from public.hwl_rooms where code = p_code for update;
  m := public.hwl_member(p_code, p_key);
  if m.seat is null then return; end if;
  if r.phase in ('lobby', 'done', 'closed') or not m.playing then
    delete from public.hwl_members where code = p_code and seat = m.seat;
  else
    update public.hwl_members set gone = true where code = p_code and seat = m.seat;
  end if;
  if not exists (select 1 from public.hwl_members where code = p_code and not gone) then
    delete from public.hwl_rooms where code = p_code; return;
  end if;
  if r.kind = 'friend' and r.host_seat = m.seat then
    select min(seat) into nh from public.hwl_members where code = p_code and not gone and seat <> m.seat;
    update public.hwl_rooms set host_seat = nh where code = p_code;
  end if;
  if r.phase = 'clue' and r.turn_order[r.pos + 1] = m.seat then   -- it was their turn
    update public.hwl_rooms set deadline = now() where code = p_code;
    perform public.hwl_step(p_code); return;
  end if;
  if r.phase in ('cards', 'clue', 'talk', 'vote', 'runoff', 'last', 'decide', 'guess') and coalesce(array_length(public.hwl_alive(p_code), 1), 0) < 3 then
    perform public.hwl_finish(p_code, 'void', 'void');
  end if;
  perform public.hwl_bump(p_code);
end $$;

create or replace function public.hwl_start(p_code text, p_key text)
returns jsonb language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare r public.hwl_rooms; m public.hwl_members; seats smallint[];
begin
  select * into r from public.hwl_rooms where code = p_code for update;
  m := public.hwl_member(p_code, p_key);
  if m.seat is null or r.kind <> 'friend' or r.host_seat <> m.seat then return jsonb_build_object('error', 'host'); end if;
  if r.phase not in ('lobby', 'done') then return jsonb_build_object('error', 'started'); end if;
  if r.reveal_until > now() then return jsonb_build_object('error', 'reveal'); end if;   -- everyone sees the end first
  delete from public.hwl_members where code = p_code and gone;
  select array_agg(seat order by seat) into seats from public.hwl_members where code = p_code;
  if coalesce(array_length(seats, 1), 0) < (public.hwl_cfg() ->> 'min')::int then return jsonb_build_object('error', 'few'); end if;
  perform public.hwl_begin(p_code, seats);
  perform public.hwl_bump(p_code);
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.hwl_ready(p_code text, p_key text, p_ready boolean default true)
returns boolean language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare r public.hwl_rooms; m public.hwl_members;
begin
  select * into r from public.hwl_rooms where code = p_code for update;
  m := public.hwl_member(p_code, p_key);
  if m.seat is null or r.phase not in ('done', 'lobby') then return false; end if;
  update public.hwl_members set ready = coalesce(p_ready, true), gone = false where code = p_code and seat = m.seat;
  if r.kind = 'house' and r.phase = 'done'
     and not exists (select 1 from public.hwl_members where code = p_code and not gone and not ready)
     and (select count(*) from public.hwl_members where code = p_code and ready) >= 5 then
    -- all ready: start as soon as the end-of-game show is over
    update public.hwl_rooms set deadline = greatest(now(), coalesce(reveal_until, now())) where code = p_code;
    perform public.hwl_step(p_code);
  end if;
  perform public.hwl_bump(p_code);
  return true;
end $$;

create or replace function public.hwl_vote(p_code text, p_key text, p_target int)
returns boolean language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare r public.hwl_rooms; m public.hwl_members;
begin
  select * into r from public.hwl_rooms where code = p_code for update;
  m := public.hwl_member(p_code, p_key);
  if m.seat is null or not m.playing or m.gone or r.phase not in ('vote', 'runoff') or p_target = m.seat then return false; end if;
  if not exists (select 1 from public.hwl_members where code = p_code and seat = p_target and playing) then return false; end if;
  if p_target::smallint = any (r.excluded) then return false; end if;   -- already had their last words
  if r.phase = 'runoff' and not (p_target::smallint = any (r.runoff)) then return false; end if;
  insert into public.hwl_votes (code, game_no, stage, seat, target) values (p_code, r.game_no, r.phase, m.seat, p_target)
  on conflict (code, game_no, stage, seat) do update set target = excluded.target;
  if not exists (select 1 from public.hwl_members x where x.code = p_code and x.playing and not x.gone
                   and not exists (select 1 from public.hwl_votes v where v.code = p_code and v.game_no = r.game_no and v.stage = r.phase and v.seat = x.seat)) then
    perform public.hwl_after_vote(p_code);   -- everyone voted
  end if;
  perform public.hwl_bump(p_code);
  return true;
end $$;

create or replace function public.hwl_decide(p_code text, p_key text, p_choice text)
returns boolean language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare r public.hwl_rooms; m public.hwl_members;
begin
  select * into r from public.hwl_rooms where code = p_code for update;
  m := public.hwl_member(p_code, p_key);
  if m.seat is null or not m.playing or m.gone or r.phase <> 'decide' or m.seat = r.accused or p_choice not in ('arrest', 'revote') then return false; end if;
  update public.hwl_members set decide = p_choice where code = p_code and seat = m.seat;
  if not exists (select 1 from public.hwl_members where code = p_code and playing and not gone and seat <> r.accused and decide is null) then
    perform public.hwl_after_decide(p_code);   -- everyone chose
  end if;
  perform public.hwl_bump(p_code);
  return true;
end $$;

-- What one browser may see. Words: only its own; the liar's seat, the answer and the hidden numbers only once it is over.
create or replace function public.hwl_view(p_code text, p_key text)
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp
as $$
declare r public.hwl_rooms; m public.hwl_members; over boolean; running boolean;
begin
  select * into r from public.hwl_rooms where code = p_code;
  if not found then return jsonb_build_object('error', 'missing'); end if;
  m := public.hwl_member(p_code, p_key);
  over := r.phase in ('done', 'closed') and r.game_no > 0;
  running := r.phase in ('cards', 'clue', 'talk', 'vote', 'runoff', 'last', 'decide', 'guess');
  return jsonb_build_object(
    'code', r.code, 'kind', r.kind, 'v', r.v, 'phase', r.phase, 'now', floor(extract(epoch from now()) * 1000),
    'deadline', case when r.deadline is not null then floor(extract(epoch from r.deadline) * 1000) end,
    'game', r.game_no, 'round', r.round, 'roundsMax', r.rounds_max, 'order', to_jsonb(r.turn_order),
    'turn', case when r.phase = 'clue' then r.turn_order[r.pos + 1] end, 'host', r.host_seat, 'runoff', to_jsonb(r.runoff),
    'accused', r.accused, 'excluded', to_jsonb(r.excluded), 'revotes', r.revotes, 'cfg', public.hwl_cfg(),
    'reveal', case when over and r.reveal_at is not null then jsonb_build_object(
      'at', floor(extract(epoch from r.reveal_at) * 1000), 'until', floor(extract(epoch from r.reveal_until) * 1000)) end,
    'me', case when m.seat is null then null else jsonb_build_object(
      'seat', m.seat, 'playing', m.playing, 'maskUsed', m.mask_used, 'talk', m.talk, 'decide', m.decide, 'ready', m.ready,
      'piecesToday', case when m.uid is not null then public.hwl_pieces_today(m.uid) end,
      'word', case when m.playing and (running or over) then case when m.seat = r.liar then r.decoy else r.answer end end,
      'voted', (select v.target from public.hwl_votes v where v.code = p_code and v.game_no = r.game_no and v.stage = r.phase and v.seat = m.seat)) end,
    'members', (select coalesce(jsonb_agg(jsonb_build_object(
        'seat', x.seat, 'name', x.name, 'playing', x.playing, 'gone', x.gone, 'ready', x.ready, 'here', x.key_hash is not null,
        'member', x.uid is not null, 'talked', x.talk is not null, 'decided', x.decide is not null, 'mask', x.mask_used,
        'pieces', case when over then x.pieces end,
        'voted', exists (select 1 from public.hwl_votes v where v.code = p_code and v.game_no = r.game_no and v.stage = r.phase and v.seat = x.seat)
      ) order by x.seat), '[]'::jsonb) from public.hwl_members x where x.code = p_code),
    'talk', (select jsonb_build_object('accuse', count(*) filter (where talk = 'accuse'), 'more', count(*) filter (where talk = 'more'))
               from public.hwl_members where code = p_code and playing and not gone),
    'decide', (select jsonb_build_object('arrest', count(*) filter (where decide = 'arrest'), 'revote', count(*) filter (where decide = 'revote'))
               from public.hwl_members where code = p_code and playing and not gone),
    'clues', (select coalesce(jsonb_agg(jsonb_build_object(
        'n', c.n, 'seat', c.seat, 'round', c.round, 'word', c.word, 'hot', c.hot, 'masked', c.masked,
        'score', case when c.word is null then null when over then c.score when c.masked then null when c.hot then null else c.score end,
        'decoyScore', case when over and c.word is not null then public.hw_score(r.decoy, c.word) end
      ) order by c.n), '[]'::jsonb) from public.hwl_clues c where c.code = p_code and c.game_no = r.game_no),
    'votes', case when r.phase not in ('vote', 'runoff') then (select coalesce(jsonb_agg(jsonb_build_object('stage', v.stage, 'seat', v.seat, 'target', v.target)), '[]'::jsonb)
                    from public.hwl_votes v where v.code = p_code and v.game_no = r.game_no) end,
    'result', case when over then jsonb_build_object('outcome', r.outcome, 'reason', r.reason, 'answer', r.answer, 'decoy', r.decoy,
                    'liar', r.liar, 'guess', r.guess, 'valid', r.valid) end,
    'liar', case when r.phase = 'guess' or over then r.liar end
  );
end $$;

-- ── grants ───────────────────────────────────────────────────────────────────────────────────────────────────────
revoke all on function public.hwl_after_decide(text), public.hwl_jamo(text), public.hwl_chat_hits(text, text) from public, anon, authenticated;
revoke all on function public.hwl_decide(text, text, text), public.hwl_chat(text, text, text), public.hwl_chat_since(text, text, bigint) from public;
grant execute on function public.hwl_decide(text, text, text), public.hwl_chat(text, text, text), public.hwl_chat_since(text, text, bigint) to anon, authenticated;

notify pgrst, 'reload schema';

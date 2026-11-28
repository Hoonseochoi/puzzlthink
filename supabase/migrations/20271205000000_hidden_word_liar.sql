-- 히든 워드: 라이어 (game id 'hidden_word_liar', page /hidden-word-liar). 4–10 players say one noun each in turn; every
-- clue shows its similarity to the citizens' word (hw_score). One player, the liar, was dealt a look-alike word of the
-- same group and does not know it. From the end of the first round the table may accuse; an accused liar gets one
-- guess at the citizens' word.
--
-- The whole game runs here, not in a host's browser: words, the liar's seat, turns, clocks, votes and results live
-- in these tables, and every change is pushed with realtime.send to topic 'hwl-<code>' (payload { v }), after which
-- browsers re-read hwl_view. Nobody's browser ever holds another player's word or the liar's seat.
--   friend rooms ('friend'): a signed-in host opens one, anyone with the link joins (4–10), the host starts.
--   house rooms ('house'): made by the matchmaking queue (hwl_q_*), no host, start and continue on their own.
-- A finished, valid game (4+ signed-in players, at least one full round) is settled here: game_results rows
-- (mode 'friend', detail.role 'liar'|'citizen', detail.open = house), 피스 through piece_grants (liar win 3, citizen
-- win 1, no cap — owner 11/28), the 'lw' icon on a first liar win and the #1 crown 'c-hidden_word_liar'.
-- Shared CHECK constraints are extended from their LIVE definitions at apply time (DO blocks), so this file does not
-- carry copies of shared functions. Deploy the client first (it knows the 'lw' icon), then apply this.
-- Rollback: scripts/hidden-word-liar/rollback.sql

-- ── shared constraints (from the live definitions) ──────────────────────────────────────────────────────────────
do $$
declare d text;
begin
  select pg_get_constraintdef(oid) into d from pg_constraint where conname = 'game_results_game_check';
  if position('hidden_word_liar' in d) = 0 then
    execute 'alter table public.game_results drop constraint game_results_game_check';
    execute 'alter table public.game_results add constraint game_results_game_check ' || regexp_replace(d, '\]\)\)\)$', ', ''hidden_word_liar''::text])))');
  end if;
  select pg_get_constraintdef(oid) into d from pg_constraint where conname = 'game_plays_daily_game_check';
  if position('hidden_word_liar' in d) = 0 then
    execute 'alter table public.game_plays_daily drop constraint game_plays_daily_game_check';
    execute 'alter table public.game_plays_daily add constraint game_plays_daily_game_check ' || regexp_replace(d, '\]\)\)\)$', ', ''hidden_word_liar''::text])))');
  end if;
  select pg_get_constraintdef(oid) into d from pg_constraint where conname = 'piece_grants_source_check';
  if position('liar_win' in d) = 0 then
    execute 'alter table public.piece_grants drop constraint piece_grants_source_check';
    execute 'alter table public.piece_grants add constraint piece_grants_source_check ' || regexp_replace(d, '\]\)\)\)$', ', ''liar_win''::text, ''liar_cit''::text])))');
  end if;
  select pg_get_constraintdef(oid) into d from pg_constraint where conname = 'profile_icons_icon_check';
  if d !~ '\|lw\)' then
    execute 'alter table public.profile_icons drop constraint profile_icons_icon_check';
    execute 'alter table public.profile_icons add constraint profile_icons_icon_check ' || regexp_replace(d, '\)\$''::text\)\)$', '|lw)$''::text))');
  end if;
  select pg_get_constraintdef(oid) into d from pg_constraint where conname = 'stone_choices_stone_check';
  if d !~ '\|lw\)' then
    execute 'alter table public.stone_choices drop constraint stone_choices_stone_check';
    execute 'alter table public.stone_choices add constraint stone_choices_stone_check ' || regexp_replace(d, '\)\$''::text\)\)$', '|lw)$''::text))');
  end if;
  -- every one of them must now name the new ids (a changed live definition would make the regexps miss)
  if not exists (select 1 from pg_constraint where conname = 'game_results_game_check' and pg_get_constraintdef(oid) like '%hidden_word_liar%')
     or not exists (select 1 from pg_constraint where conname = 'game_plays_daily_game_check' and pg_get_constraintdef(oid) like '%hidden_word_liar%')
     or not exists (select 1 from pg_constraint where conname = 'piece_grants_source_check' and pg_get_constraintdef(oid) like '%liar_cit%')
     or not exists (select 1 from pg_constraint where conname = 'profile_icons_icon_check' and pg_get_constraintdef(oid) like '%|lw)%')
     or not exists (select 1 from pg_constraint where conname = 'stone_choices_stone_check' and pg_get_constraintdef(oid) like '%|lw)%') then
    raise exception 'hidden_word_liar: a shared CHECK constraint was not extended';
  end if;
end $$;

-- ── tables ───────────────────────────────────────────────────────────────────────────────────────────────────────
create table if not exists public.hwl_rooms (
  code text primary key check (code ~ '^[a-z0-9]{5}$'),
  kind text not null check (kind in ('friend', 'house')),
  host_seat smallint,                      -- friend rooms: who may start / kick
  created_at timestamptz not null default now(),
  touched_at timestamptz not null default now(),
  v int not null default 0,                -- bumped on every change
  phase text not null default 'lobby' check (phase in ('lobby', 'cards', 'clue', 'talk', 'vote', 'runoff', 'guess', 'done', 'closed')),
  deadline timestamptz,
  game_no int not null default 0,
  answer text, decoy text, cluster text,
  liar smallint,                           -- seat
  turn_order smallint[] not null default '{}',
  round smallint not null default 0,
  pos smallint not null default 0,
  rounds_max smallint not null default 2,
  runoff smallint[],
  accused smallint,
  outcome text check (outcome in ('liar', 'citizens', 'void')),
  reason text,                             -- wrong | tie | guessed | missed | void
  guess text,
  valid boolean,
  recent text[] not null default '{}'      -- answers already used in this room
);
create table if not exists public.hwl_members (
  code text not null references public.hwl_rooms (code) on delete cascade,
  seat smallint not null check (seat between 0 and 9),
  uid uuid,
  name text not null,
  key_hash text,                           -- md5 of the browser's secret; null until a house seat is taken
  joined_at timestamptz not null default now(),
  playing boolean not null default false,  -- dealt into the current game
  gone boolean not null default false,
  ready boolean not null default false,
  talk text check (talk in ('accuse', 'more')),
  mask_used boolean not null default false,
  pieces int,                              -- what the last game paid this seat
  primary key (code, seat)
);
create unique index if not exists hwl_members_key on public.hwl_members (code, key_hash) where key_hash is not null;
create unique index if not exists hwl_members_uid on public.hwl_members (code, uid) where uid is not null;
create table if not exists public.hwl_clues (
  code text not null references public.hwl_rooms (code) on delete cascade,
  game_no int not null, n smallint not null, seat smallint not null, round smallint not null,
  word text,                               -- null = silent (time ran out)
  score numeric(4,1), hot boolean not null default false, masked boolean not null default false,
  at timestamptz not null default now(),
  primary key (code, game_no, n)
);
create table if not exists public.hwl_votes (
  code text not null references public.hwl_rooms (code) on delete cascade,
  game_no int not null, stage text not null check (stage in ('vote', 'runoff')), seat smallint not null, target smallint not null,
  primary key (code, game_no, stage, seat)
);
create table if not exists public.hwl_results (   -- one row per finished game, kept (no account data but the liar's uid)
  id bigint generated always as identity primary key,
  code text not null, game_no int not null, kind text not null, answer text, decoy text, liar_uid uuid,
  outcome text not null, reason text, players int not null, valid boolean not null, at timestamptz not null default now()
);
alter table public.hwl_rooms enable row level security;
alter table public.hwl_members enable row level security;
alter table public.hwl_clues enable row level security;
alter table public.hwl_votes enable row level security;
alter table public.hwl_results enable row level security;

-- ── settings and small helpers ───────────────────────────────────────────────────────────────────────────────────
create or replace function public.hwl_cfg()
returns jsonb language sql immutable as $$ select jsonb_build_object(
  'hot', 85,                       -- a clue this close to the answer shows as 85+ (its number hidden)
  'cards', 8, 'turn', 22, 'talk', 45, 'talkBig', 60, 'vote', 20, 'runoff', 15, 'guess', 30, 'again', 25, 'houseLobby', 25,
  'min', 4, 'max', 10, 'liarWin', 3, 'citizenWin', 1
) $$;

create or replace function public.hwl_norm(p text)
returns text language sql immutable as $$ select regexp_replace(normalize(btrim(coalesce(p, '')), NFC), '\s+', '', 'g') $$;

create or replace function public.hwl_bump(p_code text)
returns void language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare nv int;
begin
  update public.hwl_rooms set v = v + 1, touched_at = now() where code = p_code returning v into nv;
  begin
    perform realtime.send(jsonb_build_object('v', nv), 'v', 'hwl-' || p_code, false);
  exception when others then null;   -- the push is a nicety; browsers also re-read on their clocks
  end;
end $$;

create or replace function public.hwl_member(p_code text, p_key text)
returns public.hwl_members language sql stable security definer set search_path = public, pg_temp
as $$ select m.* from public.hwl_members m where m.code = p_code and p_key is not null and length(p_key) >= 16 and m.key_hash = md5(p_key) $$;

create or replace function public.hwl_new_code()
returns text language plpgsql volatile as $$
declare c text; a text := 'abcdefghjkmnpqrstuvwxyz23456789';
begin
  loop
    c := '';
    for i in 1..5 loop c := c || substr(a, 1 + floor(random() * length(a))::int, 1); end loop;
    exit when not exists (select 1 from public.hwl_rooms where code = c);
  end loop;
  return c;
end $$;

-- Seats still in the current game, in turn order.
create or replace function public.hwl_alive(p_code text)
returns smallint[] language sql stable security definer set search_path = public, pg_temp
as $$ select coalesce(array_agg(m.seat order by m.seat), '{}') from public.hwl_members m where m.code = p_code and m.playing and not m.gone $$;

-- ── the game ─────────────────────────────────────────────────────────────────────────────────────────────────────
-- Deal a new game to the given seats.
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
  update public.hwl_members set playing = seat = any (p_seats), ready = false, talk = null, mask_used = false, pieces = null,
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
    recent = (r.recent || a)[greatest(1, array_length(r.recent || a, 1) - 40):]
   where code = p_code;
end $$;

-- The seat whose turn it is, skipping players who left (their turn is a silent clue).
create or replace function public.hwl_settle_turn(p_code text)
returns void language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare r public.hwl_rooms; cfg jsonb := public.hwl_cfg(); s smallint; big boolean;
begin
  loop
    select * into r from public.hwl_rooms where code = p_code;
    if r.pos >= coalesce(array_length(r.turn_order, 1), 0) then   -- the round is over: talk
      big := array_length(public.hwl_alive(p_code), 1) > 6;
      update public.hwl_members set talk = null where code = p_code;
      update public.hwl_rooms set phase = 'talk', deadline = now() + make_interval(secs => (cfg ->> case when big then 'talkBig' else 'talk' end)::int) where code = p_code;
      return;
    end if;
    s := r.turn_order[r.pos + 1];
    if exists (select 1 from public.hwl_members where code = p_code and seat = s and playing and not gone) then
      update public.hwl_rooms set phase = 'clue', deadline = now() + make_interval(secs => (cfg ->> 'turn')::int) where code = p_code;
      return;
    end if;
    insert into public.hwl_clues (code, game_no, n, seat, round) values (p_code, r.game_no, (select count(*) from public.hwl_clues where code = p_code and game_no = r.game_no), s, r.round);
    update public.hwl_rooms set pos = pos + 1 where code = p_code;
  end loop;
end $$;

-- Rewards and records for a finished game; called once, from hwl_finish.
create or replace function public.hwl_settle(p_code text)
returns void language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare r public.hwl_rooms; cfg jsonb := public.hwl_cfg(); m record; members int; win boolean; liar_uid uuid; amt int; kday date := (now() at time zone 'Asia/Seoul')::date;
begin
  select * into r from public.hwl_rooms where code = p_code;
  select count(distinct uid) into members from public.hwl_members where code = p_code and playing and uid is not null;
  select uid into liar_uid from public.hwl_members where code = p_code and seat = r.liar;
  update public.hwl_rooms set valid = r.outcome <> 'void' and members >= (cfg ->> 'min')::int
     and (select count(*) from public.hwl_clues c where c.code = p_code and c.game_no = r.game_no and c.word is not null) >= array_length(r.turn_order, 1)
   where code = p_code returning * into r;
  insert into public.hwl_results (code, game_no, kind, answer, decoy, liar_uid, outcome, reason, players, valid)
  values (p_code, r.game_no, r.kind, r.answer, r.decoy, liar_uid, r.outcome, r.reason, array_length(r.turn_order, 1), r.valid);
  if not r.valid then return; end if;

  insert into public.game_plays_daily (day, game, mode, count) values (kday, 'hidden_word_liar', 'friend', 1)
  on conflict (day, game, mode) do update set count = public.game_plays_daily.count + 1;

  for m in select * from public.hwl_members where code = p_code and playing and not gone and uid is not null loop
    win := (m.seat = r.liar) = (r.outcome = 'liar');
    amt := case when not win then 0 when m.seat = r.liar then (cfg ->> 'liarWin')::int else (cfg ->> 'citizenWin')::int end;
    insert into public.game_results (id, user_id, game, mode, result, detail)
    values (gen_random_uuid(), m.uid, 'hidden_word_liar', 'friend', case when win then 'win' else 'loss' end,
            jsonb_build_object('role', case when m.seat = r.liar then 'liar' else 'citizen' end, 'kind', r.kind,
                               'open', r.kind = 'house', 'players', array_length(r.turn_order, 1), 'reason', r.reason));
    if amt > 0 then
      insert into public.piece_grants (user_id, source, day, amount, period, seen_at)
      values (m.uid, case when m.seat = r.liar then 'liar_win' else 'liar_cit' end, kday, amt, public.piece_period_of(now()), now())
      on conflict (user_id, source, day) do update set amount = public.piece_grants.amount + excluded.amount;
      update public.hwl_members set pieces = amt where code = p_code and seat = m.seat;
    end if;
    if win and m.seat = r.liar then perform public.grant_icon(m.uid, 'lw'); end if;
  end loop;
  perform public.hwl_refresh_crown();
end $$;

create or replace function public.hwl_finish(p_code text, p_outcome text, p_reason text)
returns void language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare k text;
begin
  select kind into k from public.hwl_rooms where code = p_code;
  update public.hwl_rooms set phase = 'done', outcome = p_outcome, reason = p_reason,
         deadline = case when k = 'house' then now() + make_interval(secs => (public.hwl_cfg() ->> 'again')::int) end
   where code = p_code;
  update public.hwl_members set ready = false where code = p_code;
  perform public.hwl_settle(p_code);
end $$;

-- After the talk: accuse, or one more round (a tie means one more round; the last round always goes to the vote).
create or replace function public.hwl_after_talk(p_code text)
returns void language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare r public.hwl_rooms; acc int; more int;
begin
  select * into r from public.hwl_rooms where code = p_code;
  select count(*) filter (where talk = 'accuse'), count(*) filter (where talk = 'more') into acc, more
    from public.hwl_members where code = p_code and playing and not gone;
  if r.round >= r.rounds_max or acc > more then
    update public.hwl_rooms set phase = 'vote', deadline = now() + make_interval(secs => (public.hwl_cfg() ->> 'vote')::int) where code = p_code;
  else
    update public.hwl_rooms set round = round + 1, pos = 0 where code = p_code;
    perform public.hwl_settle_turn(p_code);
  end if;
end $$;

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
  update public.hwl_rooms set accused = tied[1] where code = p_code;
  if tied[1] = r.liar then
    update public.hwl_rooms set phase = 'guess', deadline = now() + make_interval(secs => (public.hwl_cfg() ->> 'guess')::int) where code = p_code;
  else
    perform public.hwl_finish(p_code, 'liar', 'wrong');
  end if;
end $$;

-- The clock ran out in the current phase (checked against the server's own time).
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
  if r.phase in ('cards', 'clue', 'talk', 'vote', 'runoff') and coalesce(array_length(public.hwl_alive(p_code), 1), 0) < 3 then
    perform public.hwl_finish(p_code, 'void', 'void');
  end if;
  perform public.hwl_bump(p_code);
  return true;
end $$;

-- ── player calls ─────────────────────────────────────────────────────────────────────────────────────────────────
create or replace function public.hwl_nick(p_name text)
returns text language sql stable security definer set search_path = public, pg_temp
as $$ select left(coalesce(nullif(btrim(p.nickname), ''), nullif(btrim(p_name), ''), 'Player'), 16)
        from (select 1) one left join public.profiles p on p.id = auth.uid() $$;

create or replace function public.hwl_create(p_key text, p_name text)
returns jsonb language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare c text;
begin
  if auth.uid() is null then return jsonb_build_object('error', 'login'); end if;
  if p_key is null or length(p_key) < 16 then return jsonb_build_object('error', 'invalid'); end if;
  delete from public.hwl_rooms where touched_at < now() - interval '6 hours';
  c := public.hwl_new_code();
  insert into public.hwl_rooms (code, kind, host_seat) values (c, 'friend', 0);
  insert into public.hwl_members (code, seat, uid, name, key_hash) values (c, 0, auth.uid(), public.hwl_nick(p_name), md5(p_key));
  return jsonb_build_object('code', c, 'seat', 0);
end $$;

create or replace function public.hwl_join(p_code text, p_key text, p_name text)
returns jsonb language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare r public.hwl_rooms; m public.hwl_members; s smallint;
begin
  if p_key is null or length(p_key) < 16 then return jsonb_build_object('error', 'invalid'); end if;
  select * into r from public.hwl_rooms where code = p_code for update;
  if not found or r.phase = 'closed' then return jsonb_build_object('error', 'missing'); end if;
  m := public.hwl_member(p_code, p_key);
  if m.seat is not null then   -- coming back (a reload, or after leaving mid-game)
    if m.gone then update public.hwl_members set gone = false where code = p_code and seat = m.seat; perform public.hwl_bump(p_code); end if;
    return jsonb_build_object('seat', m.seat);
  end if;
  if r.kind = 'house' then     -- only the matched players, each with their own account
    if auth.uid() is null then return jsonb_build_object('error', 'login'); end if;
    select * into m from public.hwl_members where code = p_code and uid = auth.uid();
    if not found then return jsonb_build_object('error', 'full'); end if;
    update public.hwl_members set key_hash = md5(p_key), gone = false where code = p_code and seat = m.seat;
    perform public.hwl_bump(p_code);
    if not exists (select 1 from public.hwl_members where code = p_code and key_hash is null) and r.phase = 'lobby' then
      update public.hwl_rooms set deadline = now() where code = p_code;   -- everyone is here: start now
      perform public.hwl_step(p_code);
    end if;
    return jsonb_build_object('seat', m.seat);
  end if;
  if auth.uid() is not null and exists (select 1 from public.hwl_members where code = p_code and uid = auth.uid()) then
    -- same account from another browser: take the seat over
    update public.hwl_members set key_hash = md5(p_key), gone = false where code = p_code and uid = auth.uid() returning seat into s;
    perform public.hwl_bump(p_code);
    return jsonb_build_object('seat', s);
  end if;
  if r.phase <> 'lobby' and r.phase <> 'done' then return jsonb_build_object('error', 'started'); end if;
  select min(x)::smallint into s from generate_series(0, 9) x where not exists (select 1 from public.hwl_members where code = p_code and seat = x);
  if s is null then return jsonb_build_object('error', 'full'); end if;
  insert into public.hwl_members (code, seat, uid, name, key_hash) values (p_code, s, auth.uid(), public.hwl_nick(p_name), md5(p_key));
  perform public.hwl_bump(p_code);
  return jsonb_build_object('seat', s);
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
  if r.phase in ('cards', 'clue', 'talk', 'vote', 'runoff', 'guess') and coalesce(array_length(public.hwl_alive(p_code), 1), 0) < 3 then
    perform public.hwl_finish(p_code, 'void', 'void');
  end if;
  perform public.hwl_bump(p_code);
end $$;

create or replace function public.hwl_kick(p_code text, p_key text, p_seat int)
returns boolean language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare r public.hwl_rooms; m public.hwl_members;
begin
  select * into r from public.hwl_rooms where code = p_code for update;
  m := public.hwl_member(p_code, p_key);
  if m.seat is null or r.kind <> 'friend' or r.host_seat <> m.seat or p_seat = m.seat or r.phase not in ('lobby', 'done') then return false; end if;
  delete from public.hwl_members where code = p_code and seat = p_seat;
  perform public.hwl_bump(p_code);
  return true;
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
  delete from public.hwl_members where code = p_code and gone;
  select array_agg(seat order by seat) into seats from public.hwl_members where code = p_code;
  if coalesce(array_length(seats, 1), 0) < (public.hwl_cfg() ->> 'min')::int then return jsonb_build_object('error', 'few'); end if;
  perform public.hwl_begin(p_code, seats);
  perform public.hwl_bump(p_code);
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.hwl_clue(p_code text, p_key text, p_word text, p_mask boolean default false)
returns jsonb language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare r public.hwl_rooms; m public.hwl_members; w text := public.hwl_norm(p_word); own text; sc numeric; masked boolean;
begin
  select * into r from public.hwl_rooms where code = p_code for update;
  if not found then return jsonb_build_object('error', 'missing'); end if;
  perform public.hwl_step(p_code);   -- a clock that already ran out comes first
  select * into r from public.hwl_rooms where code = p_code;
  m := public.hwl_member(p_code, p_key);
  if m.seat is null or r.phase <> 'clue' or r.turn_order[r.pos + 1] <> m.seat then return jsonb_build_object('error', 'turn'); end if;
  if w = '' or length(w) > 12 then return jsonb_build_object('error', 'empty'); end if;
  if not exists (select 1 from public.hw_vocab where word = w) then return jsonb_build_object('error', 'vocab'); end if;
  if exists (select 1 from public.hwl_clues where code = p_code and game_no = r.game_no and word = w) then return jsonb_build_object('error', 'dup'); end if;
  own := case when m.seat = r.liar then r.decoy else r.answer end;   -- the same rule for everyone, on their own word
  if position(own in w) > 0 or position(w in own) > 0 then return jsonb_build_object('error', 'own'); end if;
  sc := coalesce(public.hw_score(r.answer, w), 0);
  masked := coalesce(p_mask, false) and not m.mask_used;
  insert into public.hwl_clues (code, game_no, n, seat, round, word, score, hot, masked)
  values (p_code, r.game_no, (select count(*) from public.hwl_clues where code = p_code and game_no = r.game_no), m.seat, r.round, w,
          sc, sc >= (public.hwl_cfg() ->> 'hot')::numeric, masked);
  if masked then update public.hwl_members set mask_used = true where code = p_code and seat = m.seat; end if;
  update public.hwl_rooms set pos = pos + 1 where code = p_code;
  perform public.hwl_settle_turn(p_code);
  perform public.hwl_bump(p_code);
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.hwl_talk(p_code text, p_key text, p_choice text)
returns boolean language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare r public.hwl_rooms; m public.hwl_members;
begin
  select * into r from public.hwl_rooms where code = p_code for update;
  m := public.hwl_member(p_code, p_key);
  if m.seat is null or not m.playing or m.gone or r.phase <> 'talk' or p_choice not in ('accuse', 'more') then return false; end if;
  update public.hwl_members set talk = p_choice where code = p_code and seat = m.seat;
  if not exists (select 1 from public.hwl_members where code = p_code and playing and not gone and talk is null) then
    perform public.hwl_after_talk(p_code);
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

create or replace function public.hwl_guess(p_code text, p_key text, p_word text)
returns jsonb language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare r public.hwl_rooms; m public.hwl_members; w text := public.hwl_norm(p_word); ok boolean;
begin
  select * into r from public.hwl_rooms where code = p_code for update;
  m := public.hwl_member(p_code, p_key);
  if m.seat is null or r.phase <> 'guess' or m.seat <> r.liar or r.deadline < now() then return jsonb_build_object('error', 'turn'); end if;
  if w = '' then return jsonb_build_object('error', 'empty'); end if;
  ok := w = r.answer;
  update public.hwl_rooms set guess = w where code = p_code;
  perform public.hwl_finish(p_code, case when ok then 'liar' else 'citizens' end, case when ok then 'guessed' else 'missed' end);
  perform public.hwl_bump(p_code);
  return jsonb_build_object('ok', ok);
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
    update public.hwl_rooms set deadline = now() where code = p_code;
    perform public.hwl_step(p_code);
    return true;
  end if;
  perform public.hwl_bump(p_code);
  return true;
end $$;

-- Anyone may nudge a room whose clock ran out (browsers call it at the deadline; pg_cron sweeps every minute).
create or replace function public.hwl_tick(p_code text)
returns boolean language sql volatile security definer set search_path = public, pg_temp
as $$ select public.hwl_step(p_code) $$;

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
  running := r.phase in ('cards', 'clue', 'talk', 'vote', 'runoff', 'guess');
  return jsonb_build_object(
    'code', r.code, 'kind', r.kind, 'v', r.v, 'phase', r.phase, 'now', floor(extract(epoch from now()) * 1000),
    'deadline', case when r.deadline is not null then floor(extract(epoch from r.deadline) * 1000) end,
    'game', r.game_no, 'round', r.round, 'roundsMax', r.rounds_max, 'order', to_jsonb(r.turn_order),
    'turn', case when r.phase = 'clue' then r.turn_order[r.pos + 1] end, 'host', r.host_seat, 'runoff', to_jsonb(r.runoff),
    'accused', r.accused, 'cfg', public.hwl_cfg(),
    'me', case when m.seat is null then null else jsonb_build_object(
      'seat', m.seat, 'playing', m.playing, 'maskUsed', m.mask_used, 'talk', m.talk, 'ready', m.ready,
      'word', case when m.playing and (running or over) then case when m.seat = r.liar then r.decoy else r.answer end end,
      'voted', (select v.target from public.hwl_votes v where v.code = p_code and v.game_no = r.game_no and v.stage = r.phase and v.seat = m.seat)) end,
    'members', (select coalesce(jsonb_agg(jsonb_build_object(
        'seat', x.seat, 'name', x.name, 'playing', x.playing, 'gone', x.gone, 'ready', x.ready, 'here', x.key_hash is not null,
        'member', x.uid is not null, 'talked', x.talk is not null, 'mask', x.mask_used, 'pieces', case when over then x.pieces end,
        'voted', exists (select 1 from public.hwl_votes v where v.code = p_code and v.game_no = r.game_no and v.stage = r.phase and v.seat = x.seat)
      ) order by x.seat), '[]'::jsonb) from public.hwl_members x where x.code = p_code),
    'talk', (select jsonb_build_object('accuse', count(*) filter (where talk = 'accuse'), 'more', count(*) filter (where talk = 'more'))
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

-- ── ranking and the #1 crown ─────────────────────────────────────────────────────────────────────────────────────
create or replace function public.hwl_rank_rows()
returns table (user_id uuid, liar_wins int, citizen_wins int, games int, points int, rnk int)
language sql stable security definer set search_path = public, pg_temp
as $$
  with t as (
    select g.user_id,
           count(*) filter (where g.result = 'win' and g.detail ->> 'role' = 'liar')::int as liar_wins,
           count(*) filter (where g.result = 'win' and g.detail ->> 'role' = 'citizen')::int as citizen_wins,
           count(*)::int as games, max(g.played_at) filter (where g.result = 'win') as last_win
      from public.game_results g where g.game = 'hidden_word_liar' group by g.user_id
  )
  select t.user_id, t.liar_wins, t.citizen_wins, t.games, t.liar_wins * 3 + t.citizen_wins,
         (row_number() over (order by t.liar_wins * 3 + t.citizen_wins desc, (t.liar_wins + t.citizen_wins)::numeric / greatest(t.games, 1) desc, t.last_win))::int
    from t join public.profiles p on p.id = t.user_id
   where t.liar_wins + t.citizen_wins > 0 and p.show_in_hall;
$$;

create or replace function public.hwl_ranking(p_limit int default 20)
returns table (rank int, nickname text, avatar_url text, liar_wins int, citizen_wins int, games int, points int, is_me boolean)
language sql stable security definer set search_path = public, pg_temp
as $$
  select x.rnk, coalesce(nullif(btrim(p.nickname), ''), '익명'), p.avatar_url, x.liar_wins, x.citizen_wins, x.games, x.points, x.user_id = auth.uid()
    from public.hwl_rank_rows() x join public.profiles p on p.id = x.user_id
   where x.rnk <= greatest(1, least(coalesce(p_limit, 20), 100)) or x.user_id = auth.uid()
   order by x.rnk;
$$;

-- My own totals (shown even when I am not on the board).
create or replace function public.hwl_my_stats()
returns jsonb language sql stable security definer set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'liarWins', count(*) filter (where result = 'win' and detail ->> 'role' = 'liar'),
    'citizenWins', count(*) filter (where result = 'win' and detail ->> 'role' = 'citizen'),
    'liarGames', count(*) filter (where detail ->> 'role' = 'liar'),
    'games', count(*))
    from public.game_results where game = 'hidden_word_liar' and user_id = auth.uid()
$$;

-- The same bookkeeping refresh_game_crowns does for the other games, for this one board only.
create or replace function public.hwl_refresh_crown()
returns void language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare v_uid uuid; v_cur uuid;
begin
  select x.user_id into v_uid from public.hwl_rank_rows() x where x.rnk = 1;
  select c.user_id into v_cur from public.game_crowns c where c.game = 'hidden_word_liar';
  if v_uid is not distinct from v_cur then return; end if;
  if v_cur is not null then
    update public.profile_icons set revoked_at = now() where user_id = v_cur and icon = 'c-hidden_word_liar' and revoked_at is null;
    if v_uid is not null then insert into public.crown_losses (user_id, game, taker) values (v_cur, 'hidden_word_liar', v_uid); end if;
  end if;
  if v_uid is null then
    delete from public.game_crowns where game = 'hidden_word_liar';
  else
    insert into public.game_crowns (game, user_id, since) values ('hidden_word_liar', v_uid, now())
    on conflict (game) do update set user_id = excluded.user_id, since = excluded.since;
    perform public.grant_icon(v_uid, 'c-hidden_word_liar');
  end if;
end $$;

-- ── matchmaking queue (공개방) ───────────────────────────────────────────────────────────────────────────────────
-- 신청 puts a signed-in player in the queue. When 10 live players wait (or 6+ and the earliest has waited 3 minutes),
-- they are offered a game: a popup on whatever page they are on (realtime.send to their own ticket's topic
-- 'hwlq-<ticket>', plus hwl_q_ping every 10 s). After 25 s, 5+ accepts make a house room; fewer put the accepters
-- back in line in their old places.
create table if not exists public.hwl_queue (
  uid uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  ticket uuid not null default gen_random_uuid(),
  joined_at timestamptz not null default now(),
  seen_at timestamptz not null default now()
);
create table if not exists public.hwl_offers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  deadline timestamptz not null,
  state text not null default 'open' check (state in ('open', 'done', 'failed')),
  room text
);
create table if not exists public.hwl_offer_members (
  offer uuid not null references public.hwl_offers (id) on delete cascade,
  uid uuid not null, name text not null, ticket uuid not null, joined_at timestamptz not null,
  accept boolean,
  primary key (offer, uid)
);
alter table public.hwl_queue enable row level security;
alter table public.hwl_offers enable row level security;
alter table public.hwl_offer_members enable row level security;

create or replace function public.hwl_q_send(p_ticket uuid, p_event text, p_payload jsonb)
returns void language plpgsql volatile security definer set search_path = public, pg_temp
as $$ begin perform realtime.send(p_payload, p_event, 'hwlq-' || p_ticket, false); exception when others then null; end $$;

create or replace function public.hwl_q_resolve(p_offer uuid)
returns void language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare o public.hwl_offers; n int; c text; x record; s int := 0;
begin
  select * into o from public.hwl_offers where id = p_offer for update;
  if not found or o.state <> 'open' then return; end if;
  if o.deadline > now() and exists (select 1 from public.hwl_offer_members where offer = p_offer and accept is null) then return; end if;
  select count(*) into n from public.hwl_offer_members where offer = p_offer and accept;
  -- those who did not accept leave the queue either way
  delete from public.hwl_queue q using public.hwl_offer_members om where om.offer = p_offer and om.uid = q.uid and om.accept is not true;
  for x in select * from public.hwl_offer_members where offer = p_offer and accept is not true loop
    perform public.hwl_q_send(x.ticket, 'drop', jsonb_build_object('offer', p_offer));
  end loop;
  if n >= 5 then
    c := public.hwl_new_code();
    insert into public.hwl_rooms (code, kind, phase, deadline) values (c, 'house', 'lobby', now() + make_interval(secs => (public.hwl_cfg() ->> 'houseLobby')::int));
    for x in select * from public.hwl_offer_members where offer = p_offer and accept order by joined_at loop
      insert into public.hwl_members (code, seat, uid, name) values (c, s, x.uid, x.name);
      s := s + 1;
      perform public.hwl_q_send(x.ticket, 'go', jsonb_build_object('offer', p_offer, 'room', c));
    end loop;
    delete from public.hwl_queue q using public.hwl_offer_members om where om.offer = p_offer and om.uid = q.uid and om.accept;
    update public.hwl_offers set state = 'done', room = c where id = p_offer;
  else
    for x in select * from public.hwl_offer_members where offer = p_offer and accept loop   -- back in line, same place
      perform public.hwl_q_send(x.ticket, 'retry', jsonb_build_object('offer', p_offer));
    end loop;
    update public.hwl_offers set state = 'failed' where id = p_offer;
  end if;
end $$;

create or replace function public.hwl_q_match()
returns void language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare live int; oldest timestamptz; oid uuid; x record;
begin
  if not pg_try_advisory_xact_lock(hashtext('hwl_q_match')) then return; end if;
  delete from public.hwl_queue where seen_at < now() - interval '3 minutes';
  select count(*), min(joined_at) into live, oldest from public.hwl_queue q
   where q.seen_at > now() - interval '75 seconds'
     and not exists (select 1 from public.hwl_offer_members om join public.hwl_offers o on o.id = om.offer where om.uid = q.uid and o.state = 'open');
  if live >= 10 or (live >= 6 and oldest < now() - interval '3 minutes') then
    insert into public.hwl_offers (deadline) values (now() + interval '25 seconds') returning id into oid;
    insert into public.hwl_offer_members (offer, uid, name, ticket, joined_at)
    select oid, q.uid, q.name, q.ticket, q.joined_at from public.hwl_queue q
     where q.seen_at > now() - interval '75 seconds'
       and not exists (select 1 from public.hwl_offer_members om join public.hwl_offers o on o.id = om.offer where om.uid = q.uid and o.state = 'open')
     order by q.joined_at limit 10;
    for x in select * from public.hwl_offer_members where offer = oid loop
      perform public.hwl_q_send(x.ticket, 'offer', jsonb_build_object('offer', oid, 'deadline', floor(extract(epoch from now() + interval '25 seconds') * 1000)));
    end loop;
  end if;
end $$;

-- My place in the queue: { queued, ticket, waiting, offer?: { id, deadline, accept } }.
create or replace function public.hwl_q_state()
returns jsonb language sql stable security definer set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'queued', q.uid is not null, 'ticket', q.ticket, 'now', floor(extract(epoch from now()) * 1000),
    'waiting', (select count(*) from public.hwl_queue w where w.seen_at > now() - interval '75 seconds'),
    'offer', (select jsonb_build_object('id', o.id, 'deadline', floor(extract(epoch from o.deadline) * 1000), 'accept', om.accept)
                from public.hwl_offer_members om join public.hwl_offers o on o.id = om.offer
               where om.uid = auth.uid() and o.state = 'open' limit 1),
    'room', (select o.room from public.hwl_offer_members om join public.hwl_offers o on o.id = om.offer
              where om.uid = auth.uid() and om.accept and o.state = 'done' and o.created_at > now() - interval '2 minutes'
                and exists (select 1 from public.hwl_rooms r where r.code = o.room and r.phase <> 'closed')
              order by o.created_at desc limit 1))
    from (select 1) one left join public.hwl_queue q on q.uid = auth.uid()
$$;

create or replace function public.hwl_q_join(p_name text)
returns jsonb language plpgsql volatile security definer set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then return jsonb_build_object('error', 'login'); end if;
  insert into public.hwl_queue (uid, name) values (auth.uid(), public.hwl_nick(p_name))
  on conflict (uid) do update set seen_at = now();
  perform public.hwl_q_match();
  return public.hwl_q_state();
end $$;

create or replace function public.hwl_q_ping()
returns jsonb language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare o uuid;
begin
  if auth.uid() is null then return jsonb_build_object('error', 'login'); end if;
  update public.hwl_queue set seen_at = now() where uid = auth.uid();
  for o in select om.offer from public.hwl_offer_members om join public.hwl_offers f on f.id = om.offer
            where om.uid = auth.uid() and f.state = 'open' and f.deadline <= now() loop
    perform public.hwl_q_resolve(o);
  end loop;
  perform public.hwl_q_match();
  return public.hwl_q_state();
end $$;

create or replace function public.hwl_q_leave()
returns void language plpgsql volatile security definer set search_path = public, pg_temp
as $$
begin
  delete from public.hwl_queue where uid = auth.uid();
  update public.hwl_offer_members om set accept = false from public.hwl_offers o
   where o.id = om.offer and o.state = 'open' and om.uid = auth.uid() and om.accept is null;
end $$;

create or replace function public.hwl_q_answer(p_offer uuid, p_accept boolean)
returns jsonb language plpgsql volatile security definer set search_path = public, pg_temp
as $$
begin
  update public.hwl_offer_members om set accept = coalesce(p_accept, false) from public.hwl_offers o
   where o.id = om.offer and om.offer = p_offer and om.uid = auth.uid() and o.state = 'open' and o.deadline > now();
  perform public.hwl_q_resolve(p_offer);
  return public.hwl_q_state();
end $$;

-- Every minute: rooms whose browsers are all gone, offers nobody resolved, old rows, the crown.
create or replace function public.hwl_cron()
returns void language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare c text; o uuid;
begin
  for c in select code from public.hwl_rooms where deadline < now() - interval '3 seconds' limit 200 loop
    perform public.hwl_step(c);
  end loop;
  for o in select id from public.hwl_offers where state = 'open' and deadline < now() loop perform public.hwl_q_resolve(o); end loop;
  perform public.hwl_q_match();
  delete from public.hwl_rooms where touched_at < now() - interval '6 hours';
  delete from public.hwl_offers where created_at < now() - interval '1 day';
  perform public.hwl_refresh_crown();
end $$;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule(jobid) from cron.job where jobname = 'hwl-tick';
    perform cron.schedule('hwl-tick', '* * * * *', 'select public.hwl_cron()');
  end if;
end $$;

-- ── grants ───────────────────────────────────────────────────────────────────────────────────────────────────────
revoke all on function public.hwl_bump(text), public.hwl_member(text, text), public.hwl_new_code(), public.hwl_alive(text),
  public.hwl_begin(text, smallint[]), public.hwl_settle_turn(text), public.hwl_settle(text), public.hwl_finish(text, text, text),
  public.hwl_after_talk(text), public.hwl_after_vote(text), public.hwl_step(text), public.hwl_nick(text), public.hwl_rank_rows(),
  public.hwl_refresh_crown(), public.hwl_q_send(uuid, text, jsonb), public.hwl_q_resolve(uuid), public.hwl_q_match(), public.hwl_cron()
  from public, anon, authenticated;
revoke all on function public.hwl_create(text, text), public.hwl_join(text, text, text), public.hwl_leave(text, text),
  public.hwl_kick(text, text, int), public.hwl_start(text, text), public.hwl_clue(text, text, text, boolean), public.hwl_talk(text, text, text),
  public.hwl_vote(text, text, int), public.hwl_guess(text, text, text), public.hwl_ready(text, text, boolean), public.hwl_tick(text),
  public.hwl_view(text, text), public.hwl_ranking(int), public.hwl_my_stats(), public.hwl_q_state(), public.hwl_q_join(text),
  public.hwl_q_ping(), public.hwl_q_leave(), public.hwl_q_answer(uuid, boolean) from public;
grant execute on function public.hwl_create(text, text), public.hwl_join(text, text, text), public.hwl_leave(text, text),
  public.hwl_kick(text, text, int), public.hwl_start(text, text), public.hwl_clue(text, text, text, boolean), public.hwl_talk(text, text, text),
  public.hwl_vote(text, text, int), public.hwl_guess(text, text, text), public.hwl_ready(text, text, boolean), public.hwl_tick(text),
  public.hwl_view(text, text), public.hwl_ranking(int), public.hwl_my_stats(), public.hwl_q_state(), public.hwl_q_join(text),
  public.hwl_q_ping(), public.hwl_q_leave(), public.hwl_q_answer(uuid, boolean) to anon, authenticated;

notify pgrst, 'reload schema';

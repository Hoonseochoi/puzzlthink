-- 히든 워드: 라이어 — rematch and invite (owner report 11/28: "방이 닫혔어요" with 5 players still seated, no way to
-- play again). Built on the #304 hotfix (20271209100000_hwl_house_rematch.sql), which is kept as it is for house
-- rooms (4 ready → a new game; otherwise wait while 4+ remain, up to 3 minutes after the show). This adds:
--   · 한 판 더 everywhere: hwl_ready in a friend room too. 4+ ready start a new game in the same room (the same seats,
--     a fresh deal) when everyone present is ready, or after a short countdown ('readyWait', 10 s) for the rest; the
--     host is not needed. A friend room whose host left passes the host to whoever presses 한 판 더 or 시작.
--   · A closed room that still has people opens again from 한 판 더 (hwl_ready): after a game back to 'done',
--     a room that never started back to its lobby.
--   · 초대하기 (hwl_invite): 5 minutes of open seats (house rooms then take new signed-in players), the table on the
--     home card (hwl_lobby_stats.open), and a "자리 있어요" push to everyone in the 공개방 queue. Once a minute a room.
-- Test: scripts/hidden-word-liar/test_rematch.sql (scratch DB). Undo: drop hwl_invite and the two columns, re-run
-- hwl_join (20271205100000), hwl_start/hwl_ready (20271209000000), hwl_step (20271209100000), hwl_lobby_stats (20271207000000).

alter table public.hwl_rooms add column if not exists invited_at timestamptz;
alter table public.hwl_rooms add column if not exists open_until timestamptz;

create or replace function public.hwl_cfg()
returns jsonb language sql immutable as $$ select jsonb_build_object(
  'hot', 85,                       -- a clue this close to the answer shows as 85+ (its number hidden)
  'cards', 8, 'turn', 20, 'talk', 45, 'talkBig', 60, 'vote', 20, 'runoff', 15, 'last', 20, 'decide', 15, 'guess', 30,
  'again', 25, 'houseLobby', 25, 'revotes', 1, 'extend', 30,   -- ⏱ seconds a player may add to their own turn, once a game
  'readyWait', 10,                 -- 한 판 더: once 4 are ready, the rest get this long before it starts
  'revealBase', 4, 'revealSeat', 0.8, 'revealGuess', 2,   -- seconds of the end-of-game show
  'min', 4, 'max', 10, 'liarWin', 3, 'citizenWin', 1, 'dailyCap', 7   -- 피스 from this game per player per KST day (owner 11/28)
) $$;

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
    if not found then
      -- not matched here: only an invited room (초대하기, open_until) with a free seat, between games
      if not coalesce(r.open_until > now() and r.phase in ('lobby', 'done'), false) then return jsonb_build_object('error', 'full'); end if;
      select min(x)::smallint into s from generate_series(0, 9) x where not exists (select 1 from public.hwl_members where code = p_code and seat = x);
      if s is null then return jsonb_build_object('error', 'full'); end if;
      insert into public.hwl_members (code, seat, uid, name, key_hash) values (p_code, s, auth.uid(), public.hwl_nick(p_name), md5(p_key));
      delete from public.hwl_queue where uid = auth.uid();   -- found a table: out of the matchmaking line
      perform public.hwl_bump(p_code);
      return jsonb_build_object('seat', s);
    end if;
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
  if auth.uid() is not null then delete from public.hwl_queue where uid = auth.uid(); end if;
  perform public.hwl_bump(p_code);
  return jsonb_build_object('seat', s);
end $$;

create or replace function public.hwl_start(p_code text, p_key text)
returns jsonb language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare r public.hwl_rooms; m public.hwl_members; seats smallint[];
begin
  select * into r from public.hwl_rooms where code = p_code for update;
  m := public.hwl_member(p_code, p_key);
  if m.seat is null or r.kind <> 'friend' then return jsonb_build_object('error', 'host'); end if;
  if r.host_seat is distinct from m.seat then
    if exists (select 1 from public.hwl_members where code = p_code and seat = r.host_seat and not gone) then return jsonb_build_object('error', 'host'); end if;
    update public.hwl_rooms set host_seat = m.seat where code = p_code;   -- the host is gone: whoever starts takes over
  end if;
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
declare r public.hwl_rooms; m public.hwl_members; cfg jsonb := public.hwl_cfg(); n_ready int; n_here int; at timestamptz;
begin
  select * into r from public.hwl_rooms where code = p_code for update;
  m := public.hwl_member(p_code, p_key);
  if m.seat is null or r.phase not in ('done', 'lobby', 'closed') then return false; end if;
  if r.phase = 'closed' then
    -- a closed table that still has people: open it again (after a game: back to 한 판 더; never started: a lobby)
    if r.game_no > 0 then
      update public.hwl_rooms set phase = 'done', reveal_until = now(), deadline = case when r.kind = 'house' then now() + make_interval(secs => (cfg ->> 'again')::int) end
       where code = p_code returning * into r;
    else
      update public.hwl_rooms set phase = 'lobby', deadline = case when r.kind = 'house' then now() + make_interval(secs => (cfg ->> 'houseLobby')::int) end
       where code = p_code returning * into r;
    end if;
    update public.hwl_members set ready = false where code = p_code;
  end if;
  update public.hwl_members set ready = coalesce(p_ready, true), gone = false where code = p_code and seat = m.seat;
  if r.kind = 'friend' and not exists (select 1 from public.hwl_members where code = p_code and seat = r.host_seat and not gone) then
    update public.hwl_rooms set host_seat = m.seat where code = p_code;   -- host migration: the host left
  end if;
  if r.phase = 'done' then
    select count(*) filter (where ready), count(*) into n_ready, n_here from public.hwl_members where code = p_code and not gone;
    if n_ready >= (cfg ->> 'min')::int then
      -- enough for a game: start when everyone here is ready, else after a short countdown for the rest (never mid-show)
      at := greatest(coalesce(r.reveal_until, now()), now() + case when n_ready >= n_here then interval '0' else make_interval(secs => (cfg ->> 'readyWait')::int) end);
      update public.hwl_rooms set deadline = case when r.deadline is null or r.deadline > at then at else r.deadline end where code = p_code;
      perform public.hwl_step(p_code);
    end if;
  end if;
  perform public.hwl_bump(p_code);
  return true;
end $$;

create or replace function public.hwl_step(p_code text)
returns boolean language plpgsql volatile security definer set search_path = public, pg_temp
as $function$
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
  elsif r.phase = 'done' and r.kind = 'friend' then
    -- 한 판 더 (hwl_ready) set this clock: 4+ ready play again, host or not; otherwise keep waiting (friend rooms never close)
    select coalesce(array_agg(seat order by seat), '{}') into rdy from public.hwl_members where code = p_code and ready and not gone;
    if coalesce(array_length(rdy, 1), 0) >= (public.hwl_cfg() ->> 'min')::int then perform public.hwl_begin(p_code, rdy);
    else update public.hwl_rooms set deadline = null where code = p_code; end if;
  elsif r.phase = 'done' and r.kind = 'house' then
    select coalesce(array_agg(seat order by seat), '{}') into rdy from public.hwl_members where code = p_code and ready and not gone;
    -- 4+ pressed 한 판 더 → play again. Otherwise keep waiting while 4+ are still here (up to 3 minutes after the
    -- game), so a slow table is not thrown out; close only when too few remain or the wait runs out.
    if coalesce(array_length(rdy, 1), 0) >= (public.hwl_cfg() ->> 'min')::int then perform public.hwl_begin(p_code, rdy);
    elsif (select count(*) from public.hwl_members where code = p_code and not gone) >= (public.hwl_cfg() ->> 'min')::int
          and now() < coalesce(r.reveal_until, now()) + interval '3 minutes' then
      update public.hwl_rooms set deadline = now() + make_interval(secs => (public.hwl_cfg() ->> 'again')::int) where code = p_code;
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
end $function$;

-- 초대하기: open the empty seats to everyone for 5 minutes (house rooms then take new signed-in players too), show the
-- table on the 라이어 home card, and push a "자리 있어요" popup to everyone waiting in the 공개방 queue. Once a minute a room.
create or replace function public.hwl_invite(p_code text, p_key text)
returns jsonb language plpgsql volatile security definer set search_path = public, pg_temp
as $$
declare r public.hwl_rooms; m public.hwl_members; free int; q record; sent int := 0;
begin
  select * into r from public.hwl_rooms where code = p_code for update;
  if not found then return jsonb_build_object('error', 'missing'); end if;
  m := public.hwl_member(p_code, p_key);
  if m.seat is null or m.gone then return jsonb_build_object('error', 'member'); end if;
  if r.phase not in ('lobby', 'done') then return jsonb_build_object('error', 'started'); end if;
  if r.invited_at > now() - interval '60 seconds' then
    return jsonb_build_object('error', 'wait', 'wait', ceil(extract(epoch from r.invited_at + interval '60 seconds' - now())));
  end if;
  free := (public.hwl_cfg() ->> 'max')::int - (select count(*) from public.hwl_members where code = p_code);
  if free <= 0 then return jsonb_build_object('error', 'full'); end if;
  update public.hwl_rooms set invited_at = now(), open_until = now() + interval '5 minutes' where code = p_code;
  for q in select w.ticket from public.hwl_queue w
            where w.seen_at > now() - interval '75 seconds'
              and not exists (select 1 from public.hwl_members x where x.code = p_code and x.uid = w.uid)
            order by w.joined_at limit 30 loop
    perform public.hwl_q_send(q.ticket, 'seat', jsonb_build_object('room', p_code, 'seats', free));
    sent := sent + 1;
  end loop;
  perform public.hwl_bump(p_code);
  return jsonb_build_object('ok', true, 'sent', sent, 'seats', free);
end $$;

-- The home card's numbers, and the invited tables with free seats ("지금 바로 참가").
create or replace function public.hwl_lobby_stats()
returns jsonb language sql stable security definer set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'waiting', (select count(*) from public.hwl_queue w where w.seen_at > now() - interval '75 seconds'),
    'rooms', (select count(*) from public.hwl_rooms r where r.kind = 'house' and r.phase not in ('done', 'closed')),
    'open', (select coalesce(jsonb_agg(x order by x ->> 'at' desc), '[]'::jsonb) from (
       select jsonb_build_object('code', r.code, 'kind', r.kind, 'players', count(m.seat), 'seats', (public.hwl_cfg() ->> 'max')::int - count(m.seat), 'at', r.invited_at) x
         from public.hwl_rooms r join public.hwl_members m on m.code = r.code
        where r.open_until > now() and r.phase in ('lobby', 'done')
        group by r.code, r.kind, r.invited_at
       having count(m.seat) < (public.hwl_cfg() ->> 'max')::int
        order by r.invited_at desc limit 3) t));
$$;

revoke all on function public.hwl_invite(text, text) from public;
grant execute on function public.hwl_invite(text, text) to anon, authenticated;

notify pgrst, 'reload schema';

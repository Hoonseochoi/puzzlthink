-- SCRATCH DATABASE ONLY: the matchmaking queue (failed offer → back in line, 6 accept → house room, auto start,
-- timeouts, one more game with 5 ready, leaving down to 2 → void). Run after test_games.sql (it reuses its users).
\set ON_ERROR_STOP 1
create or replace function pg_temp.as_user(u uuid) returns void language sql as $$ select set_config('request.jwt.claims', json_build_object('sub', u, 'role', 'authenticated')::text, false), set_config('request.jwt.claim.sub', u::text, false) $$;
create or replace function pg_temp.uid(i int) returns uuid language sql as $$ select ('00000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid $$;
create or replace function pg_temp.key(i int) returns text language sql as $$ select 'qkey-' || i || '-xxxxxxxxxxxxxxxxxxxx' $$;
do $$
declare s jsonb; o uuid; rc text; r public.hwl_rooms;
begin
  truncate public.hwl_queue, public.hwl_offers cascade;
  -- 9 waiting: no offer yet
  for i in 1..9 loop perform pg_temp.as_user(pg_temp.uid(i)); s := public.hwl_q_join('q' || i); end loop;
  if s -> 'offer' <> 'null'::jsonb then raise exception 'offer too early'; end if;
  raise notice 'waiting %', s ->> 'waiting';
  -- the 10th makes an offer
  insert into auth.users (id, email) values (pg_temp.uid(10), 'bot10@x.test') on conflict do nothing;
  perform pg_temp.as_user(pg_temp.uid(10)); s := public.hwl_q_join('q10');
  o := (s -> 'offer' ->> 'id')::uuid; if o is null then raise exception 'no offer'; end if;
  -- only 3 accept → back in line
  for i in 1..3 loop perform pg_temp.as_user(pg_temp.uid(i)); perform public.hwl_q_answer(o, true); end loop;
  perform pg_temp.as_user(pg_temp.uid(4)); perform public.hwl_q_answer(o, false);
  update public.hwl_offers set deadline = now() - interval '1 second' where id = o;
  perform pg_temp.as_user(pg_temp.uid(1)); s := public.hwl_q_ping();
  raise notice 'after failed offer: state % queued=% left in queue=%', (select state from hwl_offers where id = o), s ->> 'queued', (select count(*) from hwl_queue);
  if (select count(*) from hwl_queue) <> 3 then raise exception 'accepters should stay'; end if;
  -- 7 more join (10 again) → new offer, 6 accept → house room
  for i in 4..10 loop perform pg_temp.as_user(pg_temp.uid(i)); s := public.hwl_q_join('q' || i); end loop;
  perform pg_temp.as_user(pg_temp.uid(1)); s := public.hwl_q_state(); o := (s -> 'offer' ->> 'id')::uuid;
  if o is null then raise exception 'no second offer'; end if;
  for i in 1..6 loop perform pg_temp.as_user(pg_temp.uid(i)); perform public.hwl_q_answer(o, true); end loop;
  for i in 7..10 loop perform pg_temp.as_user(pg_temp.uid(i)); perform public.hwl_q_answer(o, i = 7); end loop;
  select room into rc from hwl_offers where id = o;
  raise notice 'offer % room % queue left %', (select state from hwl_offers where id = o), rc, (select count(*) from hwl_queue);
  perform pg_temp.as_user(pg_temp.uid(2)); s := public.hwl_q_state(); if s ->> 'room' <> rc then raise exception 'room not offered back: %', s; end if;
  -- an outsider cannot sit
  perform pg_temp.as_user(pg_temp.uid(9)); if public.hwl_join(rc, pg_temp.key(9), 'x') ->> 'error' <> 'full' then raise exception 'outsider joined'; end if;
  -- 6 of the 7 arrive; the lobby clock then starts the game
  for i in 1..6 loop perform pg_temp.as_user(pg_temp.uid(i)); s := public.hwl_join(rc, pg_temp.key(i), 'x'); if s ? 'error' then raise exception 'join %', s; end if; end loop;
  update public.hwl_rooms set deadline = now() where hwl_rooms.code = rc; perform public.hwl_tick(rc);
  select * into r from hwl_rooms where hwl_rooms.code = rc;
  raise notice 'house started: phase % players % members %', r.phase, array_length(r.turn_order, 1), (select count(*) from hwl_members m where m.code = r.code);
  -- run the clocks out to the end (all silent): void? (silent rounds still count as a round)
  for i in 1..60 loop
    select * into r from hwl_rooms where hwl_rooms.code = rc; exit when r.phase = 'done';
    update public.hwl_rooms set deadline = now() where hwl_rooms.code = rc; perform public.hwl_tick(rc);
  end loop;
  raise notice 'timeouts → % % valid %', r.outcome, r.reason, r.valid;
  -- 5 ready → next game automatically at the clock
  for i in 1..5 loop perform pg_temp.as_user(pg_temp.uid(i)); perform public.hwl_ready(rc, pg_temp.key(i), true); end loop;
  update public.hwl_rooms set deadline = now() where hwl_rooms.code = rc; perform public.hwl_tick(rc);
  select * into r from hwl_rooms where hwl_rooms.code = rc;
  raise notice 'again: phase % game % players %', r.phase, r.game_no, array_length(r.turn_order, 1);
  -- leaving mid-game down to 2 → void
  for i in 1..3 loop perform pg_temp.as_user(pg_temp.uid(i)); perform public.hwl_leave(rc, pg_temp.key(i)); end loop;
  select * into r from hwl_rooms where hwl_rooms.code = rc;
  raise notice 'after 3 leave: phase % outcome % (alive %)', r.phase, r.outcome, array_length(public.hwl_alive(rc), 1);
end $$;

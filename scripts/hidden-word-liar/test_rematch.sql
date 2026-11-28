-- SCRATCH DATABASE ONLY (hwl_dev, bot users from test_games.sql): 한 판 더 in house and friend rooms, a closed room
-- reopening, host migration, and 초대하기 → queue push + open seats. After 20271209100000 and 20271209300000:
--   docker exec -i supabase-db psql -U postgres -d hwl_dev -q < scripts/hidden-word-liar/test_rematch.sql
\set ON_ERROR_STOP 1
create or replace function pg_temp.as_user(u uuid) returns void language sql as $$ select set_config('request.jwt.claims', json_build_object('sub', u, 'role', 'authenticated')::text, false) $$;
create or replace function pg_temp.key(i int) returns text language sql as $$ select 'rmkey-' || i || '-xxxxxxxxxxxxxxxxxxxx' $$;
create or replace function pg_temp.uid(i int) returns uuid language sql as $$ select ('00000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid $$;
-- a finished 5-player room (seat n = bot n+1), the show over
create or replace function pg_temp.done_room(p_kind text) returns text language plpgsql as $$
declare c text;
begin
  perform pg_temp.as_user(pg_temp.uid(1));
  c := public.hwl_create(pg_temp.key(1), '봇1') ->> 'code';
  for i in 2..5 loop perform pg_temp.as_user(pg_temp.uid(i)); perform public.hwl_join(c, pg_temp.key(i), '봇' || i); end loop;
  perform pg_temp.as_user(pg_temp.uid(1)); perform public.hwl_start(c, pg_temp.key(1));
  perform public.hwl_finish(c, 'citizens', 'missed');
  update public.hwl_rooms set kind = p_kind, reveal_until = now() - interval '1 second',
         deadline = case when p_kind = 'house' then now() + interval '25 seconds' end where code = c;
  return c;
end $$;
create or replace function pg_temp.ready(c text, i int) returns boolean language plpgsql as $$
begin perform pg_temp.as_user(pg_temp.uid(i)); return public.hwl_ready(c, pg_temp.key(i), true); end $$;

do $$
declare c text; r public.hwl_rooms; g int; res jsonb; s jsonb; secs numeric;
begin
  -- A. house: 4 of 5 ready → a 10 s countdown, then a new game with those 4 (the 5th watches)
  c := pg_temp.done_room('house'); g := (select game_no from public.hwl_rooms where code = c);
  for i in 1..4 loop perform pg_temp.ready(c, i); end loop;
  select * into r from public.hwl_rooms where code = c;
  secs := extract(epoch from r.deadline - now());
  if r.phase <> 'done' or secs < 9 or secs > 10.5 then raise exception 'A: countdown % %', r.phase, secs; end if;
  update public.hwl_rooms set deadline = now() - interval '1 second' where code = c; perform public.hwl_tick(c);
  select * into r from public.hwl_rooms where code = c;
  if r.phase <> 'cards' or r.game_no <> g + 1 or array_length(r.turn_order, 1) <> 4 then raise exception 'A: rematch % % %', r.phase, r.game_no, r.turn_order; end if;
  raise notice 'A ok: house 4/5 ready → 10 s → game % with 4 seats', r.game_no;

  -- B. friend: everyone ready → starts at once, no host press
  c := pg_temp.done_room('friend'); g := (select game_no from public.hwl_rooms where code = c);
  for i in 1..5 loop perform pg_temp.ready(c, i); end loop;
  select * into r from public.hwl_rooms where code = c;
  if r.phase <> 'cards' or r.game_no <> g + 1 then raise exception 'B: friend rematch % %', r.phase, r.game_no; end if;
  raise notice 'B ok: friend room, all 5 ready → game % right away', r.game_no;

  -- C. friend, the host left: 한 판 더 passes the host on; 4 ready (all who are left) → a new game
  c := pg_temp.done_room('friend'); g := (select game_no from public.hwl_rooms where code = c);
  perform pg_temp.as_user(pg_temp.uid(1)); perform public.hwl_leave(c, pg_temp.key(1));
  select * into r from public.hwl_rooms where code = c;
  if r.host_seat = 0 then raise exception 'C: host not moved on leave'; end if;
  update public.hwl_rooms set host_seat = 0 where code = c;   -- as if the host's seat were stale: 한 판 더 must still work
  perform pg_temp.ready(c, 3);
  if (select host_seat from public.hwl_rooms where code = c) <> 2 then raise exception 'C: host migration on ready'; end if;
  for i in 2..5 loop perform pg_temp.ready(c, i); end loop;
  select * into r from public.hwl_rooms where code = c;
  if r.phase <> 'cards' or r.game_no <> g + 1 then raise exception 'C: no rematch after the host left % %', r.phase, r.game_no; end if;
  raise notice 'C ok: host left → host passed on, 4 ready → game %', r.game_no;

  -- D. a closed room with people: 한 판 더 opens it again, then plays
  c := pg_temp.done_room('house'); g := (select game_no from public.hwl_rooms where code = c);
  update public.hwl_rooms set phase = 'closed', deadline = null where code = c;
  if not pg_temp.ready(c, 2) then raise exception 'D: ready refused on a closed room'; end if;
  select * into r from public.hwl_rooms where code = c;
  if r.phase <> 'done' then raise exception 'D: not reopened (%)', r.phase; end if;
  for i in 1..5 loop perform pg_temp.ready(c, i); end loop;
  select * into r from public.hwl_rooms where code = c;
  if r.phase <> 'cards' or r.game_no <> g + 1 then raise exception 'D: reopened room did not start % %', r.phase, r.game_no; end if;
  raise notice 'D ok: closed → 한 판 더 reopens → game %', r.game_no;

  -- E. 초대하기: a queued player gets the push, the house room takes them in, once a minute only
  c := pg_temp.done_room('house');
  delete from public.hwl_queue where uid = pg_temp.uid(8);
  insert into public.hwl_queue (uid, name) values (pg_temp.uid(8), '봇8');
  perform pg_temp.as_user(pg_temp.uid(8));
  if public.hwl_join(c, pg_temp.key(8), '봇8') ->> 'error' is distinct from 'full' then raise exception 'E: an outsider got into a closed-off house room'; end if;
  perform pg_temp.as_user(pg_temp.uid(2));
  res := public.hwl_invite(c, pg_temp.key(2));
  if (res ->> 'ok') is null or (res ->> 'sent')::int < 1 or (res ->> 'seats')::int <> 5 then raise exception 'E: invite %', res; end if;
  if public.hwl_invite(c, pg_temp.key(2)) ->> 'error' is distinct from 'wait' then raise exception 'E: no rate limit'; end if;
  s := public.hwl_lobby_stats();
  if not exists (select 1 from jsonb_array_elements(s -> 'open') x where x ->> 'code' = c and (x ->> 'seats')::int = 5) then raise exception 'E: not on the home card %', s; end if;
  perform pg_temp.as_user(pg_temp.uid(8));
  res := public.hwl_join(c, pg_temp.key(8), '봇8');
  if res ->> 'seat' is null then raise exception 'E: invited join %', res; end if;
  if exists (select 1 from public.hwl_queue where uid = pg_temp.uid(8)) then raise exception 'E: still queued'; end if;
  raise notice 'E ok: invite pushed to % queued, house room took 봇8 (seat %), out of the queue; second invite waits', 1, res ->> 'seat';
end $$;

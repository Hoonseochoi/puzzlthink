-- Turn timer check, safe on the live DB: it loads the 20 s migration and plays one timed-out turn inside begin … rollback,
-- with made-up user ids (hwl_members.uid has no foreign key, so no auth.users rows are needed). Run:
--   docker cp supabase/migrations/20271209000000_hwl_turn_20.sql supabase-db:/mig.sql
--   docker exec -i supabase-db psql -U postgres -q < scripts/hidden-word-liar/test_timeout.sql; docker exec supabase-db rm /mig.sql
\set ON_ERROR_STOP 1
begin;
\i /mig.sql
create or replace function pg_temp.as_user(u uuid) returns void language sql as $$ select set_config('request.jwt.claims', json_build_object('sub', u, 'role', 'authenticated')::text, true), set_config('request.jwt.claim.sub', u::text, true) $$;
create or replace function pg_temp.key(i int) returns text language sql as $$ select 'tkey-' || i || '-xxxxxxxxxxxxxxxxxxxx' $$;
create or replace function pg_temp.uid(i int) returns uuid language sql as $$ select ('00000000-0000-0000-0000-' || lpad((900+i)::text, 12, '0'))::uuid $$;
do $$
declare res jsonb; c text; r public.hwl_rooms; v jsonb; secs numeric; who int;
begin
  if (public.hwl_cfg() ->> 'turn')::int <> 20 then raise exception 'cfg turn %', public.hwl_cfg() ->> 'turn'; end if;
  perform pg_temp.as_user(pg_temp.uid(1));
  res := public.hwl_create(pg_temp.key(1), 'T1'); c := res ->> 'code';
  for i in 2..4 loop perform pg_temp.as_user(pg_temp.uid(i)); perform public.hwl_join(c, pg_temp.key(i), 'T' || i); end loop;
  perform pg_temp.as_user(pg_temp.uid(1));
  res := public.hwl_start(c, pg_temp.key(1)); if res ? 'error' then raise exception 'start %', res; end if;
  update public.hwl_rooms set deadline = now() - interval '1 second' where code = c; perform public.hwl_tick(c);   -- cards → first turn
  select * into r from public.hwl_rooms where code = c;
  secs := extract(epoch from r.deadline - now());
  raise notice 'phase % turn seat % deadline in % s', r.phase, r.turn_order[r.pos + 1], round(secs, 1);
  if r.phase <> 'clue' or secs < 19.5 or secs > 20.5 then raise exception 'turn clock %', secs; end if;
  who := r.turn_order[r.pos + 1];
  -- the clock runs out: a silent clue, the next seat's 20 s
  update public.hwl_rooms set deadline = now() - interval '1 second' where code = c; perform public.hwl_tick(c);
  select * into r from public.hwl_rooms where code = c;
  if r.pos <> 1 or r.phase <> 'clue' then raise exception 'not passed pos % phase %', r.pos, r.phase; end if;
  if not exists (select 1 from public.hwl_clues where code = c and seat = who and word is null) then raise exception 'no timeout row'; end if;
  secs := extract(epoch from r.deadline - now());
  if secs < 19.5 or secs > 20.5 then raise exception 'next clock %', secs; end if;
  v := public.hwl_view(c, pg_temp.key(1));
  raise notice 'view clues %, turn %', v -> 'clues', v -> 'turn';
  if (v -> 'clues' -> 0 ->> 'word') is not null or (v -> 'clues' -> 0 ->> 'seat')::int <> who then raise exception 'view row'; end if;
  -- a tick before the deadline changes nothing
  perform public.hwl_tick(c);
  if (select pos from public.hwl_rooms where code = c) <> 1 then raise exception 'early tick moved the turn'; end if;
  raise notice 'OK: 20 s turns, timeout row, early tick ignored';
end $$;
rollback;
select count(*) as rooms_left from public.hwl_rooms where code in (select code from public.hwl_members where uid::text like '00000000-0000-0000-0000-0000000009%');
select pg_get_functiondef('public.hwl_cfg'::regproc) like '%''turn'', 22%' as live_cfg_unchanged;

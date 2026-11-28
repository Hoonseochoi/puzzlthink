-- SCRATCH DATABASE ONLY (hwl_dev, bot users from test_games.sql): 토론 ⏱ +30 s once a game per player, +90 s cap.
--   docker exec -i supabase-db psql -U postgres -d hwl_dev -q < scripts/hidden-word-liar/test_talk_extend.sql
\set ON_ERROR_STOP 1
create or replace function pg_temp.as_user(u uuid) returns void language sql as $$ select set_config('request.jwt.claims', json_build_object('sub', u, 'role', 'authenticated')::text, false) $$;
create or replace function pg_temp.key(i int) returns text language sql as $$ select 'tekey-' || i || '-xxxxxxxxxxxxxxxxxxxx' $$;
create or replace function pg_temp.uid(i int) returns uuid language sql as $$ select ('00000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid $$;
create or replace function pg_temp.ext(c text, i int) returns jsonb language plpgsql as $$ begin perform pg_temp.as_user(pg_temp.uid(i)); return public.hwl_talk_extend(c, pg_temp.key(i)); end $$;
do $$
declare c text; r public.hwl_rooms; res jsonb; secs numeric; v jsonb;
begin
  perform pg_temp.as_user(pg_temp.uid(1));
  c := public.hwl_create(pg_temp.key(1), '봇1') ->> 'code';
  for i in 2..5 loop perform pg_temp.as_user(pg_temp.uid(i)); perform public.hwl_join(c, pg_temp.key(i), '봇' || i); end loop;
  perform pg_temp.as_user(pg_temp.uid(1)); perform public.hwl_start(c, pg_temp.key(1));
  -- not in the talk phase: refused
  if pg_temp.ext(c, 1) ->> 'error' is distinct from 'turn' then raise exception 'outside talk'; end if;
  update public.hwl_rooms set phase = 'talk', deadline = now() + interval '10 seconds' where code = c;
  res := pg_temp.ext(c, 1);
  secs := extract(epoch from (select deadline from public.hwl_rooms where code = c) - now());
  if (res ->> 'ok') is null or secs < 39 or secs > 41 then raise exception 'first extend % %', res, secs; end if;
  if pg_temp.ext(c, 1) ->> 'error' is distinct from 'used' then raise exception 'twice by one player'; end if;
  if (pg_temp.ext(c, 2) ->> 'total')::int <> 60 or (pg_temp.ext(c, 3) ->> 'total')::int <> 90 then raise exception 'second/third'; end if;
  if pg_temp.ext(c, 4) ->> 'error' is distinct from 'cap' then raise exception 'cap not held'; end if;
  perform pg_temp.as_user(pg_temp.uid(1));
  v := public.hwl_view(c, pg_temp.key(1));
  if (v ->> 'talkExt')::int <> 90 or not (v -> 'me' ->> 'talkExtended')::boolean then raise exception 'view %', v ->> 'talkExt'; end if;
  -- a new game: everyone may extend again
  update public.hwl_rooms set reveal_until = now() where code = c;
  perform public.hwl_finish(c, 'citizens', 'missed');
  update public.hwl_rooms set reveal_until = now() where code = c;
  perform pg_temp.as_user(pg_temp.uid(1)); perform public.hwl_start(c, pg_temp.key(1));
  update public.hwl_rooms set phase = 'talk', deadline = now() + interval '10 seconds' where code = c;
  if (pg_temp.ext(c, 1) ->> 'ok') is null then raise exception 'new game, extend again'; end if;
  raise notice 'ok: +30 s once per player, cap 90 s (4th refused), outside talk refused, resets next game';
end $$;

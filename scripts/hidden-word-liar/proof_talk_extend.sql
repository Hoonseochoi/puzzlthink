-- Live-schema proof for 20271210100000_hwl_talk_extend.sql on top of the two pending migrations (#307, #305), all in begin … rollback:
--   docker cp each of 20271209300000_hwl_rematch_invite.sql / 20271210000000_hwl_liar_knows.sql / 20271210100000_hwl_talk_extend.sql to supabase-db:/m1.sql /m2.sql /m3.sql
--   docker exec -i supabase-db psql -U postgres -q < scripts/hidden-word-liar/proof_talk_extend.sql
\set ON_ERROR_STOP 1
begin;
create temp table pr_before as
  select p.period, r.user_id, r.pieces, r.per_game, r.last_win
    from generate_series(1, public.piece_period_of(now())) p(period), lateral public.piece_race_rows(p.period) r;
create temp table cr_before as select md5(string_agg(to_jsonb(c)::text, '|' order by c::text)) h, count(*) n from public.competition_ranking(500) c;
create temp table bal_before as select id, public.piece_balance(id) b from public.profiles;
\i /m1.sql
\i /m2.sql
\i /m3.sql
do $$
declare c text; res jsonb;
begin
  for i in 1..5 loop
    perform set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-0000-0000-00000000090' || i, 'role', 'authenticated')::text, true);
    if i = 1 then c := public.hwl_create('pkey-1-xxxxxxxxxxxxxxxxxxxx', 'P1') ->> 'code';
    else perform public.hwl_join(c, 'pkey-' || i || '-xxxxxxxxxxxxxxxxxxxx', 'P' || i); end if;
  end loop;
  perform set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-0000-0000-000000000901', 'role', 'authenticated')::text, true);
  perform public.hwl_start(c, 'pkey-1-xxxxxxxxxxxxxxxxxxxx');
  update public.hwl_rooms set phase = 'talk', deadline = now() + interval '10 seconds' where code = c;
  res := public.hwl_talk_extend(c, 'pkey-1-xxxxxxxxxxxxxxxxxxxx');
  if (res ->> 'ok') is null then raise exception 'live: talk extend %', res; end if;
  if public.hwl_talk_extend(c, 'pkey-1-xxxxxxxxxxxxxxxxxxxx') ->> 'error' is distinct from 'used' then raise exception 'live: twice'; end if;
  if (public.hwl_view(c, 'pkey-1-xxxxxxxxxxxxxxxxxxxx') ->> 'talkExt')::int <> 30 then raise exception 'live: view'; end if;
  raise notice 'live ok: talk +30 s once, view talkExt 30';
end $$;
select set_config('request.jwt.claims', '', true);
create temp table pr_after as
  select p.period, r.user_id, r.pieces, r.per_game, r.last_win
    from generate_series(1, public.piece_period_of(now())) p(period), lateral public.piece_race_rows(p.period) r;
select 'piece_race_rows rows' k, (select count(*) from pr_before) before, (select count(*) from pr_after) after,
  (select count(*) from (select * from pr_before except select * from pr_after) x) + (select count(*) from (select * from pr_after except select * from pr_before) y) diffs;
select 'competition_ranking(500)' k, b.n before_rows, b.h = a.h same_hash from cr_before b, (select md5(string_agg(to_jsonb(c)::text, '|' order by c::text)) h from public.competition_ranking(500) c) a;
select 'piece_balance (members)' k, count(*) members, count(*) filter (where b.b is distinct from public.piece_balance(b.id)) changed from bal_before b;
select 'hwl tables' k, count(*) from pg_tables where schemaname = 'public' and tablename like 'hwl\_%';
do $$ begin
  if exists (select * from pr_before except select * from pr_after) or exists (select * from pr_after except select * from pr_before) then raise exception 'piece_race_rows changed'; end if;
  if exists (select 1 from bal_before b where b.b is distinct from public.piece_balance(b.id)) then raise exception 'a balance changed'; end if;
  if (select h from cr_before) is distinct from (select md5(string_agg(to_jsonb(c)::text, '|' order by c::text)) from public.competition_ranking(500) c) then raise exception 'competition_ranking changed'; end if;
end $$;
rollback;
select 'live unchanged' k, to_regprocedure('public.hwl_talk_extend(text,text)') is null no_fn, not exists (select 1 from information_schema.columns where table_name = 'hwl_rooms' and column_name = 'talk_ext_secs') no_column;

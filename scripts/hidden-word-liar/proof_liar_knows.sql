-- Live-schema proof for 20271210000000_hwl_liar_knows.sql, all inside begin … rollback (made-up user ids):
--   docker cp supabase/migrations/20271210000000_hwl_liar_knows.sql supabase-db:/mig.sql
--   docker exec -i supabase-db psql -U postgres -q < scripts/hidden-word-liar/proof_liar_knows.sql; docker exec supabase-db rm /mig.sql
\set ON_ERROR_STOP 1
begin;
create temp table pr_before as
  select p.period, r.user_id, r.pieces, r.per_game, r.last_win
    from generate_series(1, public.piece_period_of(now())) p(period), lateral public.piece_race_rows(p.period) r;
create temp table cr_before as select md5(string_agg(to_jsonb(c)::text, '|' order by c::text)) h, count(*) n from public.competition_ranking(500) c;
create temp table bal_before as select id, public.piece_balance(id) b from public.profiles;
create temp table fn_before as select p.proname, md5(pg_get_functiondef(p.oid)) h from pg_proc p where p.pronamespace = 'public'::regnamespace and p.proname in ('hwl_begin','hwl_view','hwl_clue','hwl_chat');
\i /mig.sql
-- one deal on the live schema with made-up ids: the liar is not first and gets no word
do $$
declare c text; r public.hwl_rooms; v jsonb;
begin
  perform set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-0000-0000-000000000901', 'role', 'authenticated')::text, true);
  c := public.hwl_create('pkey-1-xxxxxxxxxxxxxxxxxxxx', 'P1') ->> 'code';
  for i in 2..5 loop
    perform set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-0000-0000-00000000090' || i, 'role', 'authenticated')::text, true);
    perform public.hwl_join(c, 'pkey-' || i || '-xxxxxxxxxxxxxxxxxxxx', 'P' || i);
  end loop;
  for d in 1..200 loop
    perform public.hwl_begin(c, array[0,1,2,3,4]::smallint[]);
    select * into r from public.hwl_rooms where code = c;
    if r.turn_order[1] = r.liar or r.decoy is not null then raise exception 'live: liar first or a decoy'; end if;
  end loop;
  v := public.hwl_view(c, 'pkey-' || (r.liar + 1) || '-xxxxxxxxxxxxxxxxxxxx');
  if v -> 'me' ->> 'word' is not null or not (v -> 'me' ->> 'liar')::boolean then raise exception 'live: liar view %', v -> 'me'; end if;
  raise notice 'live ok: 200 deals, liar never first, liar view has no word';
end $$;
select set_config('request.jwt.claims', '', true);   -- the test's login would turn is_me null → false in the ranking
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
select 'live functions unchanged' k, count(*) filter (where md5(pg_get_functiondef(p.oid)) is distinct from null) n from pg_proc p where p.pronamespace = 'public'::regnamespace and p.proname = 'hwl_begin' and pg_get_functiondef(p.oid) like '%decoy = d, cluster = cl, liar = p_seats%';

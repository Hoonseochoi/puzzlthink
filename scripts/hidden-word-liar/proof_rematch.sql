-- Live-schema proof for 20271209200000_hwl_rematch_invite.sql, all inside begin … rollback (made-up user ids):
--   docker cp supabase/migrations/20271209200000_hwl_rematch_invite.sql supabase-db:/mig.sql
--   docker exec -i supabase-db psql -U postgres -q < scripts/hidden-word-liar/proof_rematch.sql; docker exec supabase-db rm /mig.sql
\set ON_ERROR_STOP 1
begin;
create temp table pr_before as
  select p.period, r.user_id, r.pieces, r.per_game, r.last_win
    from generate_series(1, public.piece_period_of(now())) p(period), lateral public.piece_race_rows(p.period) r;
create temp table cr_before as select md5(string_agg(to_jsonb(c)::text, '|' order by c::text)) h, count(*) n from public.competition_ranking(500) c;
create temp table bal_before as select id, public.piece_balance(id) b from public.profiles;
create temp table cfg_before as select public.hwl_cfg() c;
\i /mig.sql
select 'cfg: only readyWait added' k, (public.hwl_cfg() - 'readyWait') = (select c from cfg_before) same;
do $$
declare c text; r public.hwl_rooms; g int; res jsonb;
begin
  for i in 1..5 loop
    perform set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-0000-0000-00000000090' || i, 'role', 'authenticated')::text, true);
    if i = 1 then c := public.hwl_create('pkey-1-xxxxxxxxxxxxxxxxxxxx', 'P1') ->> 'code';
    else perform public.hwl_join(c, 'pkey-' || i || '-xxxxxxxxxxxxxxxxxxxx', 'P' || i); end if;
  end loop;
  perform set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-0000-0000-000000000901', 'role', 'authenticated')::text, true);
  perform public.hwl_start(c, 'pkey-1-xxxxxxxxxxxxxxxxxxxx');
  update public.hwl_rooms set phase = 'closed', deadline = null, game_no = game_no where code = c;   -- the reported state
  g := (select game_no from public.hwl_rooms where code = c);
  for i in 1..5 loop
    perform set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-0000-0000-00000000090' || i, 'role', 'authenticated')::text, true);
    perform public.hwl_ready(c, 'pkey-' || i || '-xxxxxxxxxxxxxxxxxxxx', true);
  end loop;
  select * into r from public.hwl_rooms where code = c;
  if r.phase <> 'cards' or r.game_no <> g + 1 then raise exception 'live: closed room did not reopen and start (% %)', r.phase, r.game_no; end if;
  update public.hwl_rooms set phase = 'done' where code = c;
  res := public.hwl_invite(c, 'pkey-5-xxxxxxxxxxxxxxxxxxxx');
  if (res ->> 'ok') is null then raise exception 'live: invite %', res; end if;
  raise notice 'live ok: closed room with 5 → 한 판 더 → game %, invite % (sent to % queued)', r.game_no, res ->> 'seats', res ->> 'sent';
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
select 'live unchanged' k, to_regprocedure('public.hwl_invite(text,text)') is null no_invite_fn, not exists (select 1 from information_schema.columns where table_name = 'hwl_rooms' and column_name = 'open_until') no_column;

-- Live-schema trial of #307 then #305 (20271209300000_hwl_rematch_invite, 20271210000000_hwl_liar_knows), all in begin … rollback:
--   docker cp each to supabase-db:/m1.sql and /m2.sql; docker exec -i supabase-db psql -U postgres -q < scripts/hidden-word-liar/proof_307_305.sql
\set ON_ERROR_STOP 1
begin;
create temp table pr_before as
  select p.period, r.user_id, r.pieces, r.per_game, r.last_win
    from generate_series(1, public.piece_period_of(now())) p(period), lateral public.piece_race_rows(p.period) r;
create temp table cr_before as select md5(string_agg(to_jsonb(c)::text, '|' order by c::text)) h, count(*) n from public.competition_ranking(500) c;
create temp table bal_before as select id, public.piece_balance(id) b from public.profiles;
create temp table cfg_before as select public.hwl_cfg() c;
\i /m1.sql
\i /m2.sql
select 'cfg: only readyWait added' k, (public.hwl_cfg() - 'readyWait') = (select c from cfg_before) same;
do $$
declare c text; r public.hwl_rooms; g int; v jsonb; res jsonb;
begin
  for i in 1..5 loop
    perform set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-0000-0000-00000000090' || i, 'role', 'authenticated')::text, true);
    if i = 1 then c := public.hwl_create('pkey-1-xxxxxxxxxxxxxxxxxxxx', 'P1') ->> 'code';
    else perform public.hwl_join(c, 'pkey-' || i || '-xxxxxxxxxxxxxxxxxxxx', 'P' || i); end if;
  end loop;
  perform set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-0000-0000-000000000901', 'role', 'authenticated')::text, true);
  perform public.hwl_start(c, 'pkey-1-xxxxxxxxxxxxxxxxxxxx');
  -- 305: the liar is not first and has no word
  for d in 1..100 loop
    perform public.hwl_begin(c, array[0,1,2,3,4]::smallint[]);
    select * into r from public.hwl_rooms where code = c;
    if r.turn_order[1] = r.liar or r.decoy is not null then raise exception 'live: liar first / decoy'; end if;
  end loop;
  v := public.hwl_view(c, 'pkey-' || (r.liar + 1) || '-xxxxxxxxxxxxxxxxxxxx');
  if v -> 'me' ->> 'word' is not null or not (v -> 'me' ->> 'liar')::boolean then raise exception 'live: liar view'; end if;
  -- 307: a closed table with 5 → 한 판 더 → a new game; invite works
  update public.hwl_rooms set phase = 'closed', deadline = null where code = c;
  g := r.game_no;
  for i in 1..5 loop
    perform set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-0000-0000-00000000090' || i, 'role', 'authenticated')::text, true);
    perform public.hwl_ready(c, 'pkey-' || i || '-xxxxxxxxxxxxxxxxxxxx', true);
  end loop;
  select * into r from public.hwl_rooms where code = c;
  if r.phase <> 'cards' or r.game_no <> g + 1 or r.turn_order[1] = r.liar then raise exception 'live: rematch (% %)', r.phase, r.game_no; end if;
  update public.hwl_rooms set phase = 'done' where code = c;
  res := public.hwl_invite(c, 'pkey-5-xxxxxxxxxxxxxxxxxxxx');
  if (res ->> 'ok') is null then raise exception 'live: invite %', res; end if;
  raise notice 'live ok: 307 then 305 — liar never first / no word (100 deals), closed → 한 판 더 → game %, invite ok', r.game_no;
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
select 'live unchanged' k, to_regprocedure('public.hwl_invite(text,text)') is null no_invite, pg_get_functiondef('public.hwl_begin'::regproc) not like '%liar = lr%' begin_unchanged;

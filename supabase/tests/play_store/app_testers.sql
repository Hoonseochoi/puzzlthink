-- 앱 테스터 모집 (20271130000000_app_testers.sql). Wraps itself in begin … rollback, so it can also run on a scratch
-- database that already has the migration applied inside the same transaction (see run.sh). Prints PASS/FAIL lines.
\set QUIET on
\pset tuples_only on
\set ON_ERROR_STOP on
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000e1', 'Tester.One@Gmail.com'),
  ('00000000-0000-0000-0000-0000000000e2', null);
grant usage on schema public, auth to authenticated;

-- Signed out: refused; status says not joined.
do $$ begin
  perform set_config('request.jwt.claim.sub', '', true);
  begin perform public.app_tester_join(); raise notice 'FAIL anonymous join allowed';
  exception when others then raise notice 'PASS anonymous join refused (%)', sqlerrm; end;
end $$;

set local role authenticated;
-- No direct table access.
do $$ begin
  begin perform 1 from public.app_testers; raise notice 'FAIL authenticated can read app_testers';
  exception when insufficient_privilege then raise notice 'PASS no direct read'; end;
  begin insert into public.app_testers (user_id, email) values ('00000000-0000-0000-0000-0000000000e1', 'x@y.zz'); raise notice 'FAIL direct insert';
  exception when insufficient_privilege then raise notice 'PASS no direct insert'; end;
end $$;

-- Player 1: one tap with the sign-in email.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e1', true);
select case when (public.app_tester_status()->>'joined')::boolean then 'FAIL joined before joining' else 'PASS not joined yet' end;
select case when public.app_tester_join() = '{"joined": true, "email": "te***@gmail.com"}'::jsonb then 'PASS join with sign-in email' else 'FAIL join: ' || public.app_tester_join()::text end;
select case when public.app_tester_status()->>'email' = 'te***@gmail.com' then 'PASS status masked' else 'FAIL status ' || public.app_tester_status()::text end;
-- A bad address is refused and changes nothing.
do $$ begin
  begin perform public.app_tester_join('not-an-email'); raise notice 'FAIL bad email accepted';
  exception when others then raise notice 'PASS bad email refused (%)', sqlerrm; end;
end $$;
select case when public.app_tester_leave() then 'PASS leave returned true' else 'FAIL leave' end;
select case when (public.app_tester_status()->>'joined')::boolean then 'FAIL still joined after leave' else 'PASS not joined after leave' end;
reset role;
select case when email = 'te***@gmail.com' and withdrawn_at is not null then 'PASS withdrawn row keeps no address' else 'FAIL withdrawn row ' || email end
  from public.app_testers where user_id = '00000000-0000-0000-0000-0000000000e1';
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e1', true);
select case when (public.app_tester_join('other.person@gmail.com')->>'joined')::boolean then 'PASS re-join with a typed email' else 'FAIL re-join' end;
reset role;
select case when email = 'other.person@gmail.com' and withdrawn_at is null then 'PASS re-join cleared withdrawn_at' else 'FAIL re-join row' end
  from public.app_testers where user_id = '00000000-0000-0000-0000-0000000000e1';

-- PLAY TESTER icons. Player 1 is joined again here: pt-tester active and equipped.
select case when exists (select 1 from public.profile_icons where user_id = '00000000-0000-0000-0000-0000000000e1' and icon = 'pt-tester' and revoked_at is null and not seen)
  then 'PASS join grants pt-tester (unseen, for the popup)' else 'FAIL no pt-tester after join' end;
select case when public.effective_stone('00000000-0000-0000-0000-0000000000e1') = 'pt-tester' then 'PASS pt-tester equipped' else 'FAIL equipped ' || coalesce(public.effective_stone('00000000-0000-0000-0000-0000000000e1'), 'null') end;
-- The operator's FOUNDER grant upgrades the equipped tester icon.
select case when public.grant_tester_icon('00000000-0000-0000-0000-0000000000e1', 'pt-founder') then 'PASS founder granted' else 'FAIL founder not granted' end;
select case when public.effective_stone('00000000-0000-0000-0000-0000000000e1') = 'pt-founder' then 'PASS founder equipped over pt-tester' else 'FAIL founder not equipped' end;
-- Leaving revokes only pt-tester; founder stays and stays on.
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e1', true);
select public.app_tester_leave();
reset role;
select case when (select revoked_at is not null from public.profile_icons where user_id = '00000000-0000-0000-0000-0000000000e1' and icon = 'pt-tester')
             and (select revoked_at is null from public.profile_icons where user_id = '00000000-0000-0000-0000-0000000000e1' and icon = 'pt-founder')
  then 'PASS leave revokes pt-tester only' else 'FAIL leave icons' end;
-- A member showing a #1 crown keeps it on when joining; the tester icon is theirs to pick.
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000e3', 'crown.holder@gmail.com');
select public.grant_icon('00000000-0000-0000-0000-0000000000e3', 'c-wallgo');
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e3', true);
select public.app_tester_join();
reset role;
select case when public.effective_stone('00000000-0000-0000-0000-0000000000e3') = 'c-wallgo'
             and exists (select 1 from public.profile_icons where user_id = '00000000-0000-0000-0000-0000000000e3' and icon = 'pt-tester' and revoked_at is null)
  then 'PASS crown stays on, pt-tester owned' else 'FAIL crown holder shows ' || coalesce(public.effective_stone('00000000-0000-0000-0000-0000000000e3'), 'null') end;
-- Losing the crown later: the stone falls back to the tester icon.
update public.profile_icons set revoked_at = now() where user_id = '00000000-0000-0000-0000-0000000000e3' and icon = 'c-wallgo';
select case when public.effective_stone('00000000-0000-0000-0000-0000000000e3') = 'pt-tester' then 'PASS lost crown falls back to pt-tester' else 'FAIL fallback ' || coalesce(public.effective_stone('00000000-0000-0000-0000-0000000000e3'), 'null') end;
-- A member who only shows an achievement badge gets the tester icon on.
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000e4', 'badge.only@gmail.com');
select public.grant_badge('00000000-0000-0000-0000-0000000000e4', 'fw');
select public.grant_tester_icon('00000000-0000-0000-0000-0000000000e4', 'pt-14d');
select case when public.effective_stone('00000000-0000-0000-0000-0000000000e4') = 'pt-14d' then 'PASS badge replaced by pt-14d' else 'FAIL badge holder shows ' || coalesce(public.effective_stone('00000000-0000-0000-0000-0000000000e4'), 'null') end;
-- Unknown ids are refused, and the API role cannot grant.
do $$ begin
  begin insert into public.profile_icons (user_id, icon) values ('00000000-0000-0000-0000-0000000000e4', 'pt-bogus'); raise notice 'FAIL pt-bogus accepted';
  exception when check_violation then raise notice 'PASS pt-bogus refused'; end;
  if public.grant_tester_icon('00000000-0000-0000-0000-0000000000e4', 'c-wallgo') then raise notice 'FAIL grant_tester_icon granted a non-tester icon';
  else raise notice 'PASS grant_tester_icon only grants pt-*'; end if;
end $$;
set local role authenticated;
do $$ begin
  begin perform public.grant_tester_icon('00000000-0000-0000-0000-0000000000e4', 'pt-founder'); raise notice 'FAIL authenticated can grant';
  exception when insufficient_privilege then raise notice 'PASS authenticated cannot grant'; end;
end $$;
reset role;
-- Back to player 1 joined, for the deletion check below.
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e1', true);
select public.app_tester_join('other.person@gmail.com');
reset role;

-- Player 2 has no sign-in email: must type one.
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e2', true);
do $$ begin
  begin perform public.app_tester_join(); raise notice 'FAIL join without any email';
  exception when others then raise notice 'PASS join without any email refused (%)', sqlerrm; end;
  begin perform public.app_tester_mask('a@b.cc'); raise notice 'FAIL mask callable';
  exception when insufficient_privilege then raise notice 'PASS mask not callable'; end;
end $$;
reset role;

-- Deleting the account removes the row: through delete_my_account where it exists (full scratch DB), else the FK.
do $$ begin
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e1', true);
  if to_regprocedure('public.delete_my_account(text)') is not null then
    perform public.delete_my_account('DELETE'); raise notice 'INFO deleted through delete_my_account';
  else
    delete from auth.users where id = '00000000-0000-0000-0000-0000000000e1'; raise notice 'INFO deleted auth.users row directly';
  end if;
end $$;
select case when not exists (select 1 from public.app_testers where user_id = '00000000-0000-0000-0000-0000000000e1')
             and not exists (select 1 from public.profile_icons where user_id = '00000000-0000-0000-0000-0000000000e1')
  then 'PASS account deletion removes the row and the icons' else 'FAIL row or icons survived account deletion' end;

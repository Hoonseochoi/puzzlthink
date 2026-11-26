-- 20271128010000_nickname_filter.sql: a filtered nickname is refused, a normal one is saved.
\set QUIET on
\pset tuples_only on
begin;
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000e5', 'e@example.com');
insert into public.profiles (id, nickname) values ('00000000-0000-0000-0000-0000000000e5', 'old') on conflict (id) do nothing;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e5', true);
grant usage on schema public, auth to authenticated;
set local role authenticated;
do $$ begin
  begin perform public.update_profile('시발', null); raise notice 'FAIL profanity nickname saved';
  exception when others then raise notice 'PASS profanity nickname refused (%)', sqlerrm; end;
  begin perform public.update_profile('010-1234-5678', null); raise notice 'FAIL phone nickname saved';
  exception when others then raise notice 'PASS phone nickname refused (%)', sqlerrm; end;
  perform public.update_profile('퍼즐왕', null); raise notice 'PASS normal nickname saved';
end $$;
reset role;
select case when nickname = '퍼즐왕' then 'PASS nickname is 퍼즐왕' else 'FAIL nickname is ' || nickname end from public.profiles where id = '00000000-0000-0000-0000-0000000000e5';
rollback;

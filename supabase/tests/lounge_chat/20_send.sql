\set QUIET on
\pset tuples_only on
grant usage on schema public, auth, realtime to anon, authenticated;
create or replace function pg_temp.as_user(u text, body text, game text default 'wallgo2') returns jsonb language plpgsql as $$
declare r jsonb; begin
  perform set_config('test.uid', coalesce(u, ''), false);
  execute 'set role authenticated';
  r := public.lounge_send(body, game);
  execute 'reset role';
  return r;
end; $$;
-- time passes for everyone's send log
create or replace function pg_temp.wait(sec int) returns void language sql as $$ update public.lounge_send_log set at = at - make_interval(secs => sec) $$;
\echo '--- 1. login required'
select 'anon send', pg_temp.as_user(null, '안녕');
\echo '--- 1b. anon role cannot call lounge_send at all'
set role anon; select 'anon direct', has_function_privilege('anon', 'public.lounge_send(text,text)', 'execute'), has_table_privilege('anon', 'public.lounge_messages', 'select'); reset role;
\echo '--- normal message passes and is broadcast'
select 'A hello', pg_temp.as_user('00000000-0000-0000-0000-00000000000a', '  안녕하세요   같이 해요 ');
select 'stored', name, game, body from public.lounge_messages order by id desc limit 1;
select 'broadcast', topic, event, private, payload->>'name', payload->>'game', payload->>'text', payload ? 'sender', payload ? 'user_id' from realtime.sent order by n desc limit 1;
\echo '--- 1. rate limit 3s'
select 'A again at once', pg_temp.as_user('00000000-0000-0000-0000-00000000000a', '두번째 메시지');
select pg_temp.wait(2); select 'A after 2s', pg_temp.as_user('00000000-0000-0000-0000-00000000000a', '두번째 메시지');
select pg_temp.wait(1); select 'A after 3s', pg_temp.as_user('00000000-0000-0000-0000-00000000000a', '두번째 메시지');
\echo '--- empty / long / bad game id'
select pg_temp.wait(4); select 'empty', pg_temp.as_user('00000000-0000-0000-0000-00000000000a', '    ');
select 'long', pg_temp.as_user('00000000-0000-0000-0000-00000000000a', repeat('가', 201));
select 'bad game', pg_temp.as_user('00000000-0000-0000-0000-00000000000a', '게임 이름 이상', '<script>');
select 'stored game', coalesce(game, 'NULL') from public.lounge_messages order by id desc limit 1;
\echo '--- 3/4/5. blocked: not stored, not broadcast'
select count(*) as before_msgs from public.lounge_messages \gset
select count(*) as before_sent from realtime.sent \gset
select pg_temp.wait(4); select 'profanity', pg_temp.as_user('00000000-0000-0000-0000-00000000000b', '시 1 발 뭐야');
select pg_temp.wait(4); select 'sexual', pg_temp.as_user('00000000-0000-0000-0000-00000000000b', 's.e.x');
select pg_temp.wait(4); select 'phone', pg_temp.as_user('00000000-0000-0000-0000-00000000000b', '공일공 일이삼사 오육칠팔로 연락');
select pg_temp.wait(4); select 'email', pg_temp.as_user('00000000-0000-0000-0000-00000000000b', 'abc 골뱅이 gmail 닷 com');
select pg_temp.wait(4); select 'kakao', pg_temp.as_user('00000000-0000-0000-0000-00000000000b', '카톡 아이디 abc');
select pg_temp.wait(4); select 'rrn', pg_temp.as_user('00000000-0000-0000-0000-00000000000b', '900101-1234567');
select 'nothing stored/broadcast', (select count(*) from public.lounge_messages) = :before_msgs, (select count(*) from realtime.sent) = :before_sent;
\echo '--- blocked attempt does not count toward the 3s limit'
select 'B right after blocks', pg_temp.as_user('00000000-0000-0000-0000-00000000000b', '좋은 게임이었어요');
\echo '--- 2. repeat: 2nd near-same within 5 min refused, 3rd -> 1h ban'
select pg_temp.wait(5); select 'C 1', pg_temp.as_user('00000000-0000-0000-0000-00000000000c', '같이 하실분');
select pg_temp.wait(60); select 'C 2 (60s later, near-same)', pg_temp.as_user('00000000-0000-0000-0000-00000000000c', '같이 하실 분!!');
select pg_temp.wait(60); select 'C 3 (near-same) -> ban', pg_temp.as_user('00000000-0000-0000-0000-00000000000c', '같이하실분~~~') - 'until';
select 'C ban row', reason, until > now() + interval '59 minutes' from public.lounge_bans where user_id = '00000000-0000-0000-0000-00000000000c';
select pg_temp.wait(30); select 'C while banned', (pg_temp.as_user('00000000-0000-0000-0000-00000000000c', '전혀 다른 말')) - 'until';
select 'C name without nickname', name from public.lounge_messages where user_id = '00000000-0000-0000-0000-00000000000c' limit 1;
set role authenticated; select set_config('test.uid', '00000000-0000-0000-0000-00000000000c', false); select 'C state', public.lounge_state()->>'ban_reason', public.lounge_state()->'banned_until' is not null; reset role;
\echo '--- same text 6 minutes apart is fine'
select pg_temp.wait(5); select 'D 1', pg_temp.as_user('00000000-0000-0000-0000-00000000000d', '벽바둑2 오픈방 같이 해요');
select pg_temp.wait(360); select 'D 2 (6 min later)', pg_temp.as_user('00000000-0000-0000-0000-00000000000d', '벽바둑2 오픈방 같이 해요');
\echo '--- 1. quota: at most 10 in 5 minutes'
delete from public.lounge_bans; delete from public.lounge_send_log;
do $$ declare i int; r jsonb; begin
  for i in 1..11 loop
    update public.lounge_send_log set at = at - interval '20 seconds';
    r := pg_temp.as_user('00000000-0000-0000-0000-00000000000b', '메시지 ' || md5(i::text));
    if not (r->>'ok')::boolean then raise notice 'quota: message % -> %', i, r; end if;
  end loop; end $$;
select pg_temp.wait(110); select 'B after the oldest leaves the window', pg_temp.as_user('00000000-0000-0000-0000-00000000000b', '이제 보낼 수 있다');
\echo '--- keep only the last 50'
delete from public.lounge_bans; delete from public.lounge_send_log;
do $$ declare i int; begin for i in 1..60 loop delete from public.lounge_send_log; perform pg_temp.as_user('00000000-0000-0000-0000-00000000000a', 'history ' || i || ' ' || md5(i::text)); end loop; end $$;
select 'kept', count(*), min(body), max(id) - min(id) from public.lounge_messages;
select 'state len', jsonb_array_length(public.lounge_state()->'messages');
\echo '--- 6. reports: 3 different players -> 10-minute ban, reported messages removed'
delete from public.lounge_bans; delete from public.lounge_send_log;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a', '신고당할 메시지 하나')->>'id' as m1 \gset
select pg_temp.wait(5); select pg_temp.as_user('00000000-0000-0000-0000-00000000000a', '신고당할 메시지 둘')->>'id' as m2 \gset
set role authenticated;
select set_config('test.uid', '00000000-0000-0000-0000-00000000000a', false); select 'self report', public.lounge_report(:m1);
select set_config('test.uid', '00000000-0000-0000-0000-00000000000b', false); select 'B reports m1 twice + m2', public.lounge_report(:m1), public.lounge_report(:m1), public.lounge_report(:m2);
select set_config('test.uid', '00000000-0000-0000-0000-00000000000c', false); select 'C reports m2', public.lounge_report(:m2);
reset role;
select 'after 2 reporters: no ban, messages there', not exists (select 1 from public.lounge_bans where user_id = '00000000-0000-0000-0000-00000000000a'), (select count(*) from public.lounge_messages where id in (:m1, :m2));
set role authenticated;
select set_config('test.uid', '00000000-0000-0000-0000-00000000000d', false); select 'D reports m1 (3rd player)', public.lounge_report(:m1);
reset role;
select 'A banned', reason, until between now() + interval '9 minutes' and now() + interval '11 minutes' from public.lounge_bans where user_id = '00000000-0000-0000-0000-00000000000a';
select 'both messages removed', (select count(*) from public.lounge_messages where id in (:m1, :m2)) = 0, (select string_agg(event || ':' || (payload->>'id'), ',' order by n) from (select * from realtime.sent order by n desc limit 2) x);
select 'A tries to send', pg_temp.as_user('00000000-0000-0000-0000-00000000000a', '왜요') - 'until';
\echo '--- admin'
select pg_temp.wait(5); select pg_temp.as_user('00000000-0000-0000-0000-00000000000b', '관리자 테스트')->>'id' as mid2 \gset
set role anon;
select 'admin reports', jsonb_array_length(public.admin_lounge_reports('admintoken'));
select 'admin delete', public.admin_lounge_delete('admintoken', :mid2);
select 'admin ban', public.admin_lounge_ban('admintoken', '00000000-0000-0000-0000-00000000000d', 24);
reset role;
select 'D banned 24h', until > now() + interval '23 hours' from public.lounge_bans where user_id = '00000000-0000-0000-0000-00000000000d';
set role anon;
\set ON_ERROR_STOP off
select public.admin_lounge_delete('wrong', 1);
select public.lounge_check('x');
select * from public.lounge_bans;

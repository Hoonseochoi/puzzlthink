-- Account deletion (20271128000000_account_deletion.sql). Run on a scratch database that has every migration in
-- supabase/migrations applied (see run.sh). Prints PASS/FAIL lines; any FAIL means the migration is wrong.
\set QUIET on
\pset tuples_only on
\set ON_ERROR_STOP on
begin;
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'a@example.com'),
  ('00000000-0000-0000-0000-0000000000b2', 'b@example.com');
insert into public.profiles (id, email, nickname) values
  ('00000000-0000-0000-0000-0000000000a1', 'a@example.com', '테스터A'),
  ('00000000-0000-0000-0000-0000000000b2', 'b@example.com', '테스터B')
  on conflict (id) do update set nickname = excluded.nickname;
insert into public.game_results (id, user_id, game, mode, result, detail) values
  (gen_random_uuid(), '00000000-0000-0000-0000-0000000000a1', 'wallgo', 'friend', 'win', '{}'),
  (gen_random_uuid(), '00000000-0000-0000-0000-0000000000b2', 'wallgo', 'friend', 'loss', '{}'),
  (gen_random_uuid(), '00000000-0000-0000-0000-0000000000b2', 'janggi', 'ai', 'win', '{}');
insert into public.play_time (user_id, base_seconds) values ('00000000-0000-0000-0000-0000000000a1', 60), ('00000000-0000-0000-0000-0000000000b2', 60);
insert into public.game_crowns (game, user_id) values ('wallgo', '00000000-0000-0000-0000-0000000000a1'), ('janggi', '00000000-0000-0000-0000-0000000000b2');
insert into public.supporter_covers (user_id) values ('00000000-0000-0000-0000-0000000000a1');
insert into public.slither_challenges (id, seed, first_user, holder) values ('t-1', 1, '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a1');
insert into public.hw_games (id, user_id, state) values ('00000000-0000-0000-0000-0000000000c3', '00000000-0000-0000-0000-0000000000a1', '{}');
insert into public.hw_results (game_id, user_id, points, ai_points) values ('00000000-0000-0000-0000-0000000000c3', '00000000-0000-0000-0000-0000000000a1', 3, 1);
insert into public.lounge_messages (id, user_id, name, body) overriding system value values (900001, '00000000-0000-0000-0000-0000000000a1', '테스터A', 'hi'), (900002, '00000000-0000-0000-0000-0000000000b2', '테스터B', 'hello');
insert into public.lounge_reports (message_id, reporter, reported_user) values (900001, '00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000a1');
insert into public.bug_reports (id, game, category, message, contact_email, user_id) values ('00000000-0000-0000-0000-0000000000d4', 'wallgo', 'bug', 'broken', 'a@example.com', '00000000-0000-0000-0000-0000000000a1');
insert into public.live_events (kind, game, name, other, value) values ('open_win', 'wallgo', '테스터A', '테스터B', 1), ('open_win', 'wallgo', '테스터B', '테스터A', 1);
insert into public.nemo_duels (id, seed, difficulty, count, creator) values ('nd-t', 1, 'normal', 5, '테스터A');
insert into public.rpc_cache (key, payload) values ('test', '{"nickname":"테스터A"}');
grant usage on schema public, auth to authenticated;

-- Not signed in, or without the confirmation word: nothing happens.
do $$ begin
  perform set_config('request.jwt.claim.sub', '', true);
  begin perform public.delete_my_account('DELETE'); raise notice 'FAIL anonymous call was allowed';
  exception when others then raise notice 'PASS anonymous call refused (%)', sqlerrm; end;
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', true);
  begin perform public.delete_my_account('yes'); raise notice 'FAIL call without DELETE was allowed';
  exception when others then raise notice 'PASS call without DELETE refused (%)', sqlerrm; end;
end $$;

-- As player A, through the API role.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', true);
set local role authenticated;
select case when public.delete_my_account('DELETE') then 'PASS delete_my_account returned true' else 'FAIL returned false' end;
reset role;
-- authenticated may not call the internal function directly.
set local role authenticated;
do $$ begin
  begin perform public.delete_account_data('00000000-0000-0000-0000-0000000000b2'); raise notice 'FAIL authenticated could call delete_account_data';
  exception when insufficient_privilege then raise notice 'PASS delete_account_data not callable by authenticated'; end;
end $$;
reset role;

create temp table checks (name text, ok boolean);
insert into checks values
 ('A auth row gone', not exists (select 1 from auth.users where id = '00000000-0000-0000-0000-0000000000a1')),
 ('A profile gone', not exists (select 1 from public.profiles where id = '00000000-0000-0000-0000-0000000000a1')),
 ('A results gone', not exists (select 1 from public.game_results where user_id = '00000000-0000-0000-0000-0000000000a1')),
 ('B results kept (2)', (select count(*) from public.game_results where user_id = '00000000-0000-0000-0000-0000000000b2') = 2),
 ('A play time gone', not exists (select 1 from public.play_time where user_id = '00000000-0000-0000-0000-0000000000a1')),
 ('B play time kept', exists (select 1 from public.play_time where user_id = '00000000-0000-0000-0000-0000000000b2')),
 ('A crown gone, B crown kept', not exists (select 1 from public.game_crowns where user_id = '00000000-0000-0000-0000-0000000000a1') and exists (select 1 from public.game_crowns where user_id = '00000000-0000-0000-0000-0000000000b2')),
 ('A supporter cover gone', not exists (select 1 from public.supporter_covers where user_id = '00000000-0000-0000-0000-0000000000a1')),
 ('slither board kept, holder cleared', exists (select 1 from public.slither_challenges where id = 't-1' and holder is null and first_user is null)),
 ('A hidden word games/results gone', not exists (select 1 from public.hw_games where user_id = '00000000-0000-0000-0000-0000000000a1') and not exists (select 1 from public.hw_results where user_id = '00000000-0000-0000-0000-0000000000a1')),
 ('A lounge message gone, B kept', not exists (select 1 from public.lounge_messages where id = 900001) and exists (select 1 from public.lounge_messages where id = 900002)),
 ('bug report kept, anonymised', exists (select 1 from public.bug_reports where id = '00000000-0000-0000-0000-0000000000d4' and user_id is null and contact_email is null)),
 ('live feed names anonymised', not exists (select 1 from public.live_events where name = '테스터A' or other = '테스터A') and (select count(*) from public.live_events where name = '탈퇴한 플레이어' or other = '탈퇴한 플레이어') = 2),
 ('B in live feed untouched', (select count(*) from public.live_events where name = '테스터B' or other = '테스터B') = 2),
 ('nemo duel kept, creator anonymised', exists (select 1 from public.nemo_duels where id = 'nd-t' and creator = '탈퇴한 플레이어')),
 ('ranking cache cleared', not exists (select 1 from public.rpc_cache)),
 ('B account untouched', exists (select 1 from public.profiles where id = '00000000-0000-0000-0000-0000000000b2' and nickname = '테스터B'));
select case when ok then 'PASS ' else 'FAIL ' end || name from checks;
select 'TOTAL ' || count(*) filter (where ok) || '/' || count(*) from checks;
rollback;

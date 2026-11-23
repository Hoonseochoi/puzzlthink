create role anon; create role authenticated;
create schema auth; create schema realtime;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid', true), '')::uuid $$;
create table realtime.sent (n serial, payload jsonb, event text, topic text, private boolean);
create function realtime.send(payload jsonb, event text, topic text, private boolean default true) returns void language sql as $$ insert into realtime.sent (payload, event, topic, private) values ($1, $2, $3, $4) $$;
create table public.profiles (id uuid primary key references auth.users(id), nickname text, full_name text);
create table public.game_results (user_id uuid, game text, mode text, result text, detail jsonb not null default '{}'::jsonb);
create table public.admin_secrets (name text primary key, hash text not null);
insert into auth.users values ('00000000-0000-0000-0000-00000000000a'), ('00000000-0000-0000-0000-00000000000b'), ('00000000-0000-0000-0000-00000000000c'), ('00000000-0000-0000-0000-00000000000d');
insert into public.profiles values ('00000000-0000-0000-0000-00000000000a', '테스터A', null), ('00000000-0000-0000-0000-00000000000b', '테스터B', null), ('00000000-0000-0000-0000-00000000000c', '', 'C Name'), ('00000000-0000-0000-0000-00000000000d', 'D', null);
insert into public.admin_secrets values ('report', encode(sha256('admintoken'::bytea), 'hex'));
-- A: 32 hard wins in wallgo2 (capped at 30) + 2 in janggi + 5 roulette (not counted) + 3 normal (not counted) = 32 pieces.
insert into public.game_results select '00000000-0000-0000-0000-00000000000a', 'wallgo2', 'ai', 'win', '{"difficulty":"hard"}' from generate_series(1, 32);
insert into public.game_results select '00000000-0000-0000-0000-00000000000a', 'janggi', 'ai', 'win', '{"level":"hard"}' from generate_series(1, 2);
insert into public.game_results select '00000000-0000-0000-0000-00000000000a', 'russian_roulette', 'ai', 'win', '{"difficulty":"hard"}' from generate_series(1, 5);
insert into public.game_results select '00000000-0000-0000-0000-00000000000a', 'janggi', 'ai', 'win', '{"difficulty":"normal"}' from generate_series(1, 3);

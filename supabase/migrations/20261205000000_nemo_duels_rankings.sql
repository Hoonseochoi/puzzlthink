-- 네모 세기 도전장: the same boards (by seed) sent to friends; everyone who takes it is ranked on one board.
-- Plus the 30-minute challenge leaderboard for the public ranking pages.
-- Run once in the Supabase SQL Editor (project zxkuzpueuvhvypsqbelg).

create table if not exists public.nemo_duels (
  id text primary key,
  seed bigint not null,
  difficulty text not null check (difficulty in ('easy', 'normal', 'hard')),
  count integer not null check (count between 1 and 30),
  creator text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.nemo_duel_runs (
  id bigint generated always as identity primary key,
  duel_id text not null references public.nemo_duels(id) on delete cascade,
  name text not null,
  user_id uuid references auth.users(id) on delete set null,
  correct integer not null,
  ms integer not null,
  created_at timestamptz not null default now()
);
create index if not exists nemo_duel_runs_duel on public.nemo_duel_runs (duel_id, correct desc, ms asc);
alter table public.nemo_duels enable row level security;
alter table public.nemo_duel_runs enable row level security; -- access only through the functions below

-- A run is plausible: right count, at least ~1 s per board, under 2 hours, a short name.
create or replace function public.nemo_run_ok(p_count integer, p_correct integer, p_ms integer, p_name text)
returns boolean language sql immutable set search_path = public as $$
  select p_correct between 0 and p_count and p_ms between p_count * 1000 and 7200000
     and char_length(btrim(p_name)) between 1 and 16;
$$;

-- Creates a challenge from the boards I just played and records my run. Returns its id.
create or replace function public.nemo_duel_create(p_seed bigint, p_difficulty text, p_count integer, p_name text, p_correct integer, p_ms integer)
returns text language plpgsql security definer set search_path = public as $$
declare new_id text := substr(md5(random()::text || clock_timestamp()::text), 1, 10);
begin
  if p_difficulty not in ('easy', 'normal', 'hard') or p_count not between 1 and 30 or not public.nemo_run_ok(p_count, p_correct, p_ms, p_name) then
    raise exception 'invalid';
  end if;
  insert into public.nemo_duels (id, seed, difficulty, count, creator) values (new_id, p_seed, p_difficulty, p_count, btrim(p_name));
  insert into public.nemo_duel_runs (duel_id, name, user_id, correct, ms) values (new_id, btrim(p_name), auth.uid(), p_correct, p_ms);
  return new_id;
end; $$;

-- One challenge with its leaderboard (best first: more correct, then faster).
create or replace function public.nemo_duel_get(p_id text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', d.id, 'seed', d.seed, 'difficulty', d.difficulty, 'count', d.count, 'creator', d.creator, 'created_at', d.created_at,
    'creator_run', (select jsonb_build_object('correct', r.correct, 'ms', r.ms) from public.nemo_duel_runs r where r.duel_id = d.id order by r.id limit 1),
    'total', (select count(*) from public.nemo_duel_runs r where r.duel_id = d.id),
    'runs', coalesce((select jsonb_agg(x) from (
      select r.name, r.correct, r.ms from public.nemo_duel_runs r where r.duel_id = d.id order by r.correct desc, r.ms asc, r.id limit 20) x), '[]'::jsonb))
  from public.nemo_duels d where d.id = p_id;
$$;

-- Records my run on a challenge; returns my place among everyone who took it.
create or replace function public.nemo_duel_submit(p_id text, p_name text, p_correct integer, p_ms integer)
returns integer language plpgsql security definer set search_path = public as $$
declare d public.nemo_duels;
begin
  select * into d from public.nemo_duels where id = p_id;
  if not found or not public.nemo_run_ok(d.count, p_correct, p_ms, p_name) then raise exception 'invalid'; end if;
  insert into public.nemo_duel_runs (duel_id, name, user_id, correct, ms) values (p_id, btrim(p_name), auth.uid(), p_correct, p_ms);
  return (select count(*) + 1 from public.nemo_duel_runs r where r.duel_id = p_id and (r.correct > p_correct or (r.correct = p_correct and r.ms < p_ms)))::int;
end; $$;

-- 30-minute challenge: each signed-in player's best score at one difficulty (shown players only).
create or replace function public.nemo_challenge_top(p_difficulty text, p_limit integer default 10)
returns table(rank integer, nickname text, correct integer, avg_ms integer)
language sql stable security definer set search_path = public as $$
  with best as (
    select distinct on (r.user_id) r.user_id, (r.detail ->> 'correct')::int as correct, nullif(r.detail ->> 'avgMs', '')::int as avg_ms, r.played_at
      from public.game_results r
     where r.game = 'nemo_count' and r.mode = 'solo' and r.detail ->> 'difficulty' = p_difficulty and (r.detail ->> 'correct') ~ '^[0-9]+$'
     order by r.user_id, (r.detail ->> 'correct')::int desc, nullif(r.detail ->> 'avgMs', '')::int asc nulls last, r.played_at
  )
  select (row_number() over (order by b.correct desc, b.avg_ms asc nulls last, b.played_at))::int, coalesce(nullif(p.nickname, ''), 'Player'), b.correct, b.avg_ms
    from best b join public.profiles p on p.id = b.user_id
   where p.show_in_hall and b.correct > 0
   order by 1 limit least(greatest(p_limit, 1), 20);
$$;

revoke all on function public.nemo_duel_create(bigint, text, integer, text, integer, integer) from public;
revoke all on function public.nemo_duel_get(text) from public;
revoke all on function public.nemo_duel_submit(text, text, integer, integer) from public;
revoke all on function public.nemo_challenge_top(text, integer) from public;
grant execute on function public.nemo_duel_create(bigint, text, integer, text, integer, integer) to anon, authenticated;
grant execute on function public.nemo_duel_get(text) to anon, authenticated;
grant execute on function public.nemo_duel_submit(text, text, integer, integer) to anon, authenticated;
grant execute on function public.nemo_challenge_top(text, integer) to anon, authenticated;

-- Rankings are now on public pages: never fall back to the Google account name.
create or replace function public.open_ranking_top(p_game text, p_limit integer default 5)
returns table(rank integer, nickname text, avatar_url text, wins integer, losses integer, draws integer)
language sql stable security definer set search_path = public as $$
  select r.rnk, coalesce(nullif(p.nickname, ''), 'Player'), p.avatar_url, r.wins, r.losses, r.draws
    from public.open_ranking_rows(p_game) r join public.profiles p on p.id = r.user_id
   where r.rnk <= least(greatest(p_limit, 1), 20)
   order by r.rnk;
$$;
create or replace function public.open_ranking_me(p_game text)
returns table(rank integer, nickname text, wins integer, losses integer, draws integer, is_me boolean)
language sql stable security definer set search_path = public as $$
  with rows as (select * from public.open_ranking_rows(p_game)),
       me as (select rnk from rows where user_id = auth.uid())
  select r.rnk, coalesce(nullif(p.nickname, ''), 'Player'), r.wins, r.losses, r.draws, r.user_id = auth.uid()
    from rows r join public.profiles p on p.id = r.user_id, me
   where r.rnk between me.rnk - 2 and me.rnk + 2
  union all
  select null, null, count(*) filter (where result = 'win')::int, count(*) filter (where result = 'loss')::int,
         count(*) filter (where result = 'draw')::int, true
    from public.game_results
   where auth.uid() is not null and user_id = auth.uid() and game = p_game and mode = 'friend'
     and detail ->> 'open' = 'true' and not exists (select 1 from me)
  order by 1 nulls last;
$$;

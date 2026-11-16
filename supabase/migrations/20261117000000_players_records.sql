-- PUZZLTHINK players, game records, online time and hall of fame.
-- Run once in the Supabase SQL Editor (project zxkuzpueuvhvypsqbelg).

-- 1) Player profiles: one row per signed-in Google user ------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  nickname text,
  avatar_url text,
  show_in_hall boolean not null default true,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz,
  total_seconds bigint not null default 0,
  last_heartbeat_at timestamptz
);
alter table public.profiles enable row level security;

drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles for select using (auth.uid() = id);
-- Writes go through the functions below only.
revoke insert, update, delete on public.profiles from anon, authenticated;

-- Create the profile when someone signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, nickname, avatar_url, last_seen_at)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    left(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 16),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    now()
  ) on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Backfill anyone who signed up before this migration.
insert into public.profiles (id, email, full_name, nickname, avatar_url, created_at)
select u.id, u.email,
       coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
       left(coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)), 16),
       coalesce(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture'),
       u.created_at
from auth.users u on conflict (id) do nothing;

-- Daily online time, for "how long did people play" charts.
create table if not exists public.activity_days (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day date not null,
  seconds integer not null default 0,
  primary key (user_id, day)
);
alter table public.activity_days enable row level security;
drop policy if exists "activity: read own" on public.activity_days;
create policy "activity: read own" on public.activity_days for select using (auth.uid() = user_id);
revoke insert, update, delete on public.activity_days from anon, authenticated;

-- Heartbeat from an open, visible tab. Server caps the credit so it cannot be inflated.
create or replace function public.track_activity(p_seconds integer default 60)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_last timestamptz;
  v_credit integer;
begin
  if v_uid is null then return; end if;
  select last_heartbeat_at into v_last from public.profiles where id = v_uid;
  v_credit := least(greatest(coalesce(p_seconds, 0), 0), 120);
  if v_last is not null then
    v_credit := least(v_credit, greatest(0, extract(epoch from (now() - v_last))::integer));
  end if;
  update public.profiles
     set total_seconds = total_seconds + v_credit, last_seen_at = now(), last_heartbeat_at = now()
   where id = v_uid;
  if v_credit > 0 then
    insert into public.activity_days (user_id, day, seconds)
    values (v_uid, (now() at time zone 'Asia/Seoul')::date, v_credit)
    on conflict (user_id, day) do update set seconds = public.activity_days.seconds + excluded.seconds;
  end if;
end; $$;

-- Refresh name/avatar on sign-in and let players set a nickname / hall-of-fame visibility.
create or replace function public.touch_profile(p_full_name text default null, p_avatar_url text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  insert into public.profiles (id, email, full_name, nickname, avatar_url, last_seen_at)
  select u.id, u.email, coalesce(p_full_name, u.raw_user_meta_data->>'full_name'), left(coalesce(p_full_name, split_part(u.email, '@', 1)), 16), p_avatar_url, now()
    from auth.users u where u.id = auth.uid()
  on conflict (id) do update
    set full_name = coalesce(excluded.full_name, public.profiles.full_name),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
        last_seen_at = now();
end; $$;

create or replace function public.update_profile(p_nickname text, p_show_in_hall boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  update public.profiles
     set nickname = nullif(left(btrim(p_nickname), 16), ''), show_in_hall = coalesce(p_show_in_hall, show_in_hall)
   where id = auth.uid();
end; $$;

-- 2) Game results ---------------------------------------------------------------------
create table if not exists public.game_results (
  id uuid primary key, -- generated by the client, so a repeated report is ignored
  user_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  game text not null check (game in ('wallgo', 'janggi', 'heavy13', 'sudoku')),
  mode text not null check (mode in ('ai', 'friend', 'solo')),
  result text not null check (result in ('win', 'loss', 'draw')),
  detail jsonb not null default '{}'::jsonb,
  played_at timestamptz not null default now()
);
create index if not exists game_results_user_idx on public.game_results (user_id, game);
create index if not exists game_results_hall_idx on public.game_results (game, mode, result);
alter table public.game_results enable row level security;
drop policy if exists "results: read own" on public.game_results;
create policy "results: read own" on public.game_results for select using (auth.uid() = user_id);
drop policy if exists "results: insert own" on public.game_results;
create policy "results: insert own" on public.game_results for insert with check (auth.uid() = user_id);
revoke update, delete on public.game_results from anon, authenticated;

-- 3) Hall of fame: top players per game by wins against AI (solved puzzles for sudoku) ----
create or replace function public.hall_of_fame(p_limit integer default 3)
returns table (game text, rank integer, nickname text, avatar_url text, wins bigint, games bigint)
language sql stable security definer set search_path = public as $$
  with scored as (
    select r.game, r.user_id,
           count(*) filter (where r.result = 'win') as wins,
           count(*) as games,
           max(r.played_at) filter (where r.result = 'win') as last_win
      from public.game_results r
     where (r.mode = 'ai' or (r.game = 'sudoku' and r.mode = 'solo'))
     group by r.game, r.user_id
  ), ranked as (
    select s.*, row_number() over (partition by s.game order by s.wins desc, s.games asc, s.last_win asc) as rn
      from scored s join public.profiles p on p.id = s.user_id
     where s.wins > 0 and p.show_in_hall
  )
  select r.game, r.rn::integer, coalesce(p.nickname, 'Player'), p.avatar_url, r.wins, r.games
    from ranked r join public.profiles p on p.id = r.user_id
   where r.rn <= least(greatest(p_limit, 1), 10)
   order by r.game, r.rn;
$$;

grant execute on function public.track_activity(integer) to authenticated;
grant execute on function public.touch_profile(text, text) to authenticated;
grant execute on function public.update_profile(text, boolean) to authenticated;
grant execute on function public.hall_of_fame(integer) to anon, authenticated;
revoke execute on function public.track_activity(integer) from anon;
revoke execute on function public.touch_profile(text, text) from anon;
revoke execute on function public.update_profile(text, boolean) from anon;

-- 4) For the site owner: one row per player with totals (Table Editor / SQL only) ------------
create or replace view public.admin_player_stats with (security_invoker = true) as
select p.id, p.email, p.full_name, p.nickname, p.created_at, p.last_seen_at,
       round(p.total_seconds / 60.0) as total_minutes,
       (select count(*) from public.game_results r where r.user_id = p.id) as games_played,
       (select count(*) from public.game_results r where r.user_id = p.id and r.result = 'win') as wins
  from public.profiles p;
revoke all on public.admin_player_stats from anon, authenticated;

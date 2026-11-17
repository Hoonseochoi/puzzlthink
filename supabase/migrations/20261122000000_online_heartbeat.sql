-- "N online now" without Realtime: each open browser pings every ~45 s, and the count is the number of
-- browsers seen in the last 90 s. This keeps Realtime connections (200 on the free plan) for friend rooms.
-- Run once in the Supabase SQL Editor (project zxkuzpueuvhvypsqbelg). Safe to run again.

create table if not exists public.online_heartbeats (
  id text primary key,            -- random per-browser id (no personal data)
  last_seen timestamptz not null default now()
);
create index if not exists online_heartbeats_last_seen_idx on public.online_heartbeats (last_seen);
alter table public.online_heartbeats enable row level security;
revoke all on public.online_heartbeats from anon, authenticated;

-- Record a ping and return how many browsers are online. Clients can only call this; they cannot read
-- or change the table directly.
create or replace function public.online_ping(p_id text)
returns integer language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  if p_id is null or length(p_id) < 8 or length(p_id) > 64 or p_id !~ '^[A-Za-z0-9-]+$' then
    return null;
  end if;
  insert into public.online_heartbeats (id, last_seen) values (p_id, now())
  on conflict (id) do update set last_seen = excluded.last_seen;
  -- Occasionally sweep browsers gone for more than 10 minutes, so the table stays tiny.
  if random() < 0.02 then
    delete from public.online_heartbeats where last_seen < now() - interval '10 minutes';
  end if;
  select count(*) into n from public.online_heartbeats where last_seen > now() - interval '90 seconds';
  return n;
end; $$;
revoke all on function public.online_ping(text) from public;
grant execute on function public.online_ping(text) to anon, authenticated;

-- Check: should return 1.
select public.online_ping('sql-editor-check');

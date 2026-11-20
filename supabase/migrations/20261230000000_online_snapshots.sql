-- Hourly traffic history: every 5 minutes, record how many browsers are online (same 90 s window as the
-- "지금 N명 접속 중" pill) plus today's running visit and play totals, so outages show up by the hour.
-- One tiny row per 5 minutes (~105k rows a year, a few MB); rows older than 180 days are dropped.
create extension if not exists pg_cron;

create table if not exists public.online_snapshots (
  at timestamptz primary key default date_trunc('minute', now()),
  online integer not null,
  visits_today integer not null,
  plays_today integer not null
);
alter table public.online_snapshots enable row level security; -- no public access; read it from the dashboard or SQL

create or replace function public.take_online_snapshot()
returns void language sql security definer set search_path = public as $$
  insert into public.online_snapshots (at, online, visits_today, plays_today)
  select date_trunc('minute', now()),
         (select count(*) from public.online_heartbeats where last_seen > now() - interval '90 seconds'),
         coalesce((select count from public.daily_visits where day = (now() at time zone 'Asia/Seoul')::date), 0),
         coalesce((select sum(count) from public.game_plays_daily where day = (now() at time zone 'Asia/Seoul')::date), 0)
  on conflict (at) do nothing;
  delete from public.online_snapshots where at < now() - interval '180 days';
$$;
revoke all on function public.take_online_snapshot() from public, anon, authenticated;

select cron.unschedule(jobid) from cron.job where jobname = 'online-snapshot';
select cron.schedule('online-snapshot', '*/5 * * * *', $$select public.take_online_snapshot()$$);

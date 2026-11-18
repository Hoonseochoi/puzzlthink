-- 앱 설치 tracking, per day and platform (android / ios / desktop): install prompt shown (top bar or
-- after-game card), install button clicked, accepted, installed (appinstalled), and opens of the
-- installed app (once per device per day). No personal data. Applied already.
create table if not exists public.app_events_daily (
  day date not null,
  event text not null,
  platform text not null default '',
  count integer not null default 0,
  primary key (day, event, platform)
);
alter table public.app_events_daily enable row level security;

create or replace function public.count_app_event(p_event text, p_platform text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_event not in ('shown_top', 'shown_game', 'click', 'accepted', 'installed', 'open') then return; end if;
  insert into public.app_events_daily (day, event, platform, count)
  values ((now() at time zone 'Asia/Seoul')::date, p_event, case when p_platform in ('android', 'ios', 'desktop') then p_platform else 'other' end, 1)
  on conflict (day, event, platform) do update set count = public.app_events_daily.count + 1;
end; $$;
revoke all on function public.count_app_event(text, text) from public;
grant execute on function public.count_app_event(text, text) to anon, authenticated;

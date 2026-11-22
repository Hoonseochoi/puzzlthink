-- Direct-sold banner ads: impressions, clicks and dismissals per KST day, campaign and placement.
create table if not exists public.ad_events_daily (
  day date not null,
  campaign text not null,
  place text not null,
  event text not null,
  count integer not null default 0,
  primary key (day, campaign, place, event)
);
alter table public.ad_events_daily enable row level security;

create or replace function public.count_ad_event(p_campaign text, p_place text, p_event text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_campaign !~ '^[a-z0-9_]{1,32}$' or p_place !~ '^[a-z_]{1,16}$' or p_event not in ('impression', 'click', 'dismiss') then return; end if;
  insert into public.ad_events_daily (day, campaign, place, event, count)
  values ((now() at time zone 'Asia/Seoul')::date, p_campaign, p_place, p_event, 1)
  on conflict (day, campaign, place, event) do update set count = public.ad_events_daily.count + 1;
end; $$;
revoke all on function public.count_ad_event(text, text, text) from public;
grant execute on function public.count_ad_event(text, text, text) to anon, authenticated;

-- Support (후원) link clicks per day, place (card, footer, result, hall, open_rank, hard_clear) and page. Applied already.
create table if not exists public.support_clicks_daily (
  day date not null,
  place text not null,
  page text not null default '',
  count integer not null default 0,
  primary key (day, place, page)
);
alter table public.support_clicks_daily enable row level security;

create or replace function public.count_support_click(p_place text, p_page text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_place !~ '^[a-z_]{1,24}$' then return; end if;
  insert into public.support_clicks_daily (day, place, page, count)
  values ((now() at time zone 'Asia/Seoul')::date, p_place, left(coalesce(regexp_replace(p_page, '[^a-z0-9/_-]', '', 'g'), ''), 40), 1)
  on conflict (day, place, page) do update set count = public.support_clicks_daily.count + 1;
end; $$;
revoke all on function public.count_support_click(text, text) from public;
grant execute on function public.count_support_click(text, text) to anon, authenticated;

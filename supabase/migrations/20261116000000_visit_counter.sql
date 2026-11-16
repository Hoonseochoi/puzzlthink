-- Daily unique-visitor counter (KST). Clients can only call the RPC; the table is not exposed.
create table if not exists public.daily_visits (
  day date primary key,
  count bigint not null default 0
);

alter table public.daily_visits enable row level security;
revoke all on public.daily_visits from anon, authenticated;

create or replace function public.record_visit(p_increment boolean default true)
returns table (today bigint, total bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day date := (now() at time zone 'Asia/Seoul')::date;
begin
  if p_increment then
    insert into public.daily_visits (day, count) values (v_day, 1)
    on conflict (day) do update set count = public.daily_visits.count + 1;
  end if;
  return query
    select coalesce((select d.count from public.daily_visits d where d.day = v_day), 0)::bigint,
           coalesce((select sum(d.count) from public.daily_visits d), 0)::bigint;
end;
$$;

revoke all on function public.record_visit(boolean) from public;
grant execute on function public.record_visit(boolean) to anon, authenticated;

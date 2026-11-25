-- 아이콘 컬렉션: who holds each profile icon.
-- A 블랙피스 icon looks the same every week, so every week's place counts under one key (h3-1 → h-1).

create or replace function public.icon_holder_counts()
returns table(icon text, holders integer, nickname text)
language sql stable security definer set search_path to 'public'
as $$
  with held as (
    select distinct regexp_replace(i.icon, '^h[0-9]+-', 'h-') as icon, i.user_id
      from public.profile_icons i
     where i.revoked_at is null
  )
  select h.icon, count(*)::integer,
         -- The name only when exactly one player holds it.
         case when count(*) = 1 then coalesce(nullif(max(p.nickname), ''), 'Player') end
    from held h left join public.profiles p on p.id = h.user_id
   group by h.icon;
$$;

create or replace function public.icon_holders(p_icon text, p_limit integer default 60)
returns table(nickname text, granted_at timestamptz)
language sql stable security definer set search_path to 'public'
as $$
  select coalesce(nullif(max(p.nickname), ''), 'Player'), max(i.granted_at) as granted_at
    from public.profile_icons i left join public.profiles p on p.id = i.user_id
   where i.revoked_at is null and regexp_replace(i.icon, '^h[0-9]+-', 'h-') = p_icon
   group by i.user_id
   order by granted_at desc
   limit least(greatest(coalesce(p_limit, 60), 1), 100);
$$;

revoke all on function public.icon_holder_counts() from public;
revoke all on function public.icon_holders(text, integer) from public;
grant execute on function public.icon_holder_counts() to anon, authenticated;
grant execute on function public.icon_holders(text, integer) to anon, authenticated;

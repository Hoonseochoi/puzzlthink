-- Nicknames must be unique (ignoring upper/lower case and surrounding spaces).
-- Run once in the Supabase SQL Editor (project zxkuzpueuvhvypsqbelg), after 20261130000000_nicknames.sql.
-- Existing duplicates stay as they are; a player can't save a nickname someone else already uses.

-- Whether a nickname is free for the signed-in player (their own current nickname counts as free).
create or replace function public.nickname_available(p_nickname text)
returns boolean language sql stable security definer set search_path = public as $$
  select length(btrim(coalesce(p_nickname, ''))) between 2 and 16
     and not exists (
       select 1 from public.profiles
        where lower(btrim(nickname)) = lower(btrim(p_nickname))
          and id is distinct from auth.uid()
     );
$$;
revoke all on function public.nickname_available(text) from public;
grant execute on function public.nickname_available(text) to anon, authenticated;

-- Saving a nickname another player uses fails with the message 'nickname_taken'.
create or replace function public.update_profile(p_nickname text, p_show_in_hall boolean)
returns void language plpgsql security definer set search_path = public as $$
declare
  wanted text := nullif(left(btrim(coalesce(p_nickname, '')), 16), '');
begin
  if auth.uid() is null then return; end if;
  if wanted is not null and exists (
    select 1 from public.profiles where lower(btrim(nickname)) = lower(wanted) and id <> auth.uid()
  ) then
    raise exception 'nickname_taken';
  end if;
  update public.profiles
     set nickname = coalesce(wanted, nickname),
         nickname_set = nickname_set or wanted is not null,
         show_in_hall = coalesce(p_show_in_hall, show_in_hall)
   where id = auth.uid();
end; $$;
revoke execute on function public.update_profile(text, boolean) from anon;
grant execute on function public.update_profile(text, boolean) to authenticated;

create index if not exists profiles_nickname_lower on public.profiles (lower(btrim(nickname)));

-- Check: true for an unused name.
select public.nickname_available('아무도안쓰는이름zz');

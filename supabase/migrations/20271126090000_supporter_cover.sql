-- 후원자 커버: a ring drawn around the profile icon of players who supported the site (3,000원 or more on CTEE).
-- CTEE has no API, so a supporter is added by hand from the nickname in their support message:
--   scripts/supporter/grant.sh <nickname> [memo]   (calls grant_supporter as postgres)
-- The cover goes over whichever icon the player uses; the player can switch it off (and on again).

create table if not exists public.supporter_covers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_at timestamptz not null default now(),
  memo text,
  hidden boolean not null default false
);
alter table public.supporter_covers enable row level security;
revoke all on public.supporter_covers from public, anon, authenticated;

-- Nicknames whose icon shows the cover (everyone sees it on boards, the lounge, rooms).
create or replace function public.supporter_names()
returns table(nickname text)
language sql stable security definer set search_path to 'public'
as $$
  select p.nickname from public.supporter_covers s join public.profiles p on p.id = s.user_id
   where not s.hidden and p.nickname is not null and btrim(p.nickname) <> '';
$$;

-- How many players hold a cover (for the icon collection).
create or replace function public.supporter_count()
returns integer
language sql stable security definer set search_path to 'public'
as $$ select count(*)::integer from public.supporter_covers; $$;

-- The signed-in player's cover: { has, on }.
create or replace function public.my_supporter_cover()
returns jsonb
language sql stable security definer set search_path to 'public'
as $$
  select jsonb_build_object('has', s.user_id is not null, 'on', coalesce(not s.hidden, false))
    from (select 1) x left join public.supporter_covers s on s.user_id = auth.uid();
$$;

create or replace function public.set_my_cover(p_on boolean)
returns boolean
language plpgsql security definer set search_path to 'public'
as $$
begin
  if auth.uid() is null then return false; end if;
  update public.supporter_covers set hidden = not coalesce(p_on, true) where user_id = auth.uid();
  return found;
end; $$;

-- Admin only (run as postgres): give the cover to the player with this nickname. Returns their user id.
create or replace function public.grant_supporter(p_nickname text, p_memo text default null)
returns uuid
language plpgsql security definer set search_path to 'public'
as $$
declare uid uuid; n integer;
begin
  select count(*) into n from public.profiles where nickname = btrim(p_nickname);
  if n = 0 then raise exception 'no player with nickname %', p_nickname; end if;
  if n > 1 then raise exception 'more than one player with nickname %', p_nickname; end if;
  select id into uid from public.profiles where nickname = btrim(p_nickname);
  insert into public.supporter_covers (user_id, memo) values (uid, p_memo)
  on conflict (user_id) do update set memo = coalesce(excluded.memo, public.supporter_covers.memo);
  return uid;
end; $$;

revoke all on function public.supporter_names() from public;
revoke all on function public.supporter_count() from public;
revoke all on function public.my_supporter_cover() from public;
revoke all on function public.set_my_cover(boolean) from public;
revoke all on function public.grant_supporter(text, text) from public, anon, authenticated;
grant execute on function public.supporter_names() to anon, authenticated;
grant execute on function public.supporter_count() to anon, authenticated;
grant execute on function public.my_supporter_cover() to anon, authenticated;
grant execute on function public.set_my_cover(boolean) to authenticated;

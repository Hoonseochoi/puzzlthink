-- 오픈 대전 card, "지금 플레이 중": games in progress by game, open matches included.
-- Open rooms leave the public list when they start, so their hosts now ping too once the game is under way (open = true).
-- "지금 열린 방" stays the waiting list (open_rooms).

alter table public.live_friend_rooms add column if not exists open boolean not null default false;

drop function if exists public.friend_room_ping(text);
create or replace function public.friend_room_ping(p_room text, p_open boolean default false)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_room !~ '^[a-z0-9]+(-[a-z0-9]+)*-[0-9]{4}$' or length(p_room) > 48 then return; end if;
  insert into public.live_friend_rooms (room, seen_at, open) values (p_room, now(), coalesce(p_open, false))
  on conflict (room) do update set seen_at = now(), open = excluded.open;
  delete from public.live_friend_rooms where seen_at < now() - interval '10 minutes';
end; $$;
revoke all on function public.friend_room_ping(text, boolean) from public;
grant execute on function public.friend_room_ping(text, boolean) to anon, authenticated;

-- Friend matches only (kept for pages loaded before this change).
create or replace function public.friend_rooms_live()
returns integer language sql stable security definer set search_path = public as $$
  select count(*)::int from public.live_friend_rooms where seen_at > now() - interval '150 seconds' and not open;
$$;

-- Matches in progress per room channel (e.g. wallgo-room): open and friend counts.
create or replace function public.live_rooms()
returns table(channel text, open_n integer, friend_n integer)
language sql stable security definer set search_path = public as $$
  select regexp_replace(room, '-[0-9]{4}$', ''), count(*) filter (where open)::int, count(*) filter (where not open)::int
    from public.live_friend_rooms where seen_at > now() - interval '150 seconds'
   group by 1;
$$;
revoke all on function public.live_rooms() from public;
grant execute on function public.live_rooms() to anon, authenticated;

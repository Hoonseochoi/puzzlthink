-- 친구 대전 in progress, for the home 오픈 대전 card ("친구 대전 N판 진행 중").
-- Friend rooms live only in Realtime, so the host's browser pings once a minute while two or more people are in the room.
-- Nothing about the players is stored: just the room channel and when it was last seen.

create table if not exists public.live_friend_rooms (
  room text primary key,      -- room channel, e.g. wallgo-room-1234
  seen_at timestamptz not null default now()
);
create index if not exists live_friend_rooms_seen on public.live_friend_rooms (seen_at);
alter table public.live_friend_rooms enable row level security; -- only through the functions below

create or replace function public.friend_room_ping(p_room text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_room !~ '^[a-z0-9]+(-[a-z0-9]+)*-[0-9]{4}$' or length(p_room) > 48 then return; end if;
  insert into public.live_friend_rooms (room, seen_at) values (p_room, now())
  on conflict (room) do update set seen_at = now();
  delete from public.live_friend_rooms where seen_at < now() - interval '10 minutes';
end; $$;
revoke all on function public.friend_room_ping(text) from public;
grant execute on function public.friend_room_ping(text) to anon, authenticated;

-- Rooms pinged in the last 2½ minutes.
create or replace function public.friend_rooms_live()
returns integer language sql stable security definer set search_path = public as $$
  select count(*)::int from public.live_friend_rooms where seen_at > now() - interval '150 seconds';
$$;
revoke all on function public.friend_rooms_live() from public;
grant execute on function public.friend_rooms_live() to anon, authenticated;

-- Public ("open") rooms: the list on each game's entry screen.
-- Run once in the Supabase SQL Editor (project zxkuzpueuvhvypsqbelg).
-- The room itself still runs on Realtime; this table only lists rooms that are waiting for players.
-- A host's browser refreshes its row every ~20 s; rows older than 90 s drop out of the list.
-- Only the functions below touch the table (RLS on, no policies), and a row can only be
-- changed or removed with the token its host created it with.

create table if not exists public.open_rooms (
  game text not null,
  code text not null,
  token text not null,
  variant smallint not null default 0,
  host text not null,
  players smallint not null default 1,
  capacity smallint not null default 2,
  updated_at timestamptz not null default now(),
  primary key (game, code)
);
alter table public.open_rooms enable row level security;
create index if not exists open_rooms_fresh on public.open_rooms (game, updated_at desc);

create or replace function public.open_room_put(p_game text, p_code text, p_token text, p_variant int, p_host text, p_players int, p_capacity int)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_game !~ '^[a-zA-Z0-9]{2,24}$' or p_code !~ '^[a-z0-9]{4,6}$' or length(p_token) not between 8 and 64 then return; end if;
  delete from public.open_rooms where updated_at < now() - interval '10 minutes';
  insert into public.open_rooms (game, code, token, variant, host, players, capacity, updated_at)
  values (p_game, p_code, p_token, greatest(0, least(p_variant, 9)), left(coalesce(nullif(trim(p_host), ''), '?'), 16),
          greatest(1, least(p_players, 12)), greatest(1, least(p_capacity, 12)), now())
  on conflict (game, code) do update
    set variant = excluded.variant, host = excluded.host, players = excluded.players, capacity = excluded.capacity, updated_at = now()
    where public.open_rooms.token = excluded.token;
end; $$;

create or replace function public.open_room_close(p_game text, p_code text, p_token text)
returns void language sql security definer set search_path = public as $$
  delete from public.open_rooms where game = p_game and code = p_code and token = p_token;
$$;

create or replace function public.open_room_list(p_game text)
returns table (code text, variant smallint, host text, players smallint, capacity smallint)
language sql security definer set search_path = public stable as $$
  select code, variant, host, players, capacity from public.open_rooms
   where game = p_game and updated_at > now() - interval '90 seconds'
   order by updated_at desc limit 30;
$$;

revoke all on function public.open_room_put(text, text, text, int, text, int, int) from public;
revoke all on function public.open_room_close(text, text, text) from public;
revoke all on function public.open_room_list(text) from public;
grant execute on function public.open_room_put(text, text, text, int, text, int, int) to anon, authenticated;
grant execute on function public.open_room_close(text, text, text) to anon, authenticated;
grant execute on function public.open_room_list(text) to anon, authenticated;

-- Check: should return an empty list (no error).
select * from public.open_room_list('heavy13');

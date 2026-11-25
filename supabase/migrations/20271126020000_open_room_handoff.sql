-- Open rooms: when a room's host leaves, another player takes over as host (useRealtimeRoom host handoff) and
-- keeps the room listed. The new host has its own token, so it may take over a row the old host stopped
-- refreshing (hosts re-put every 20 s; 45 s without one means that host is gone).
create or replace function public.open_room_put(p_game text, p_code text, p_token text, p_variant integer, p_host text, p_players integer, p_capacity integer, p_title text default ''::text)
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  if auth.uid() is null then return; end if;
  if p_game !~ '^[a-zA-Z0-9]{2,24}$' or p_code !~ '^[a-z0-9]{4,6}$' or length(p_token) not between 8 and 64 then return; end if;
  delete from public.open_rooms where updated_at < now() - interval '10 minutes';
  insert into public.open_rooms (game, code, token, variant, host, players, capacity, title, updated_at)
  values (p_game, p_code, p_token, greatest(0, least(p_variant, 9)), left(coalesce(nullif(trim(p_host), ''), '?'), 16),
          greatest(1, least(p_players, 12)), greatest(1, least(p_capacity, 12)), left(trim(coalesce(p_title, '')), 30), now())
  on conflict (game, code) do update
    set token = excluded.token, variant = excluded.variant, host = excluded.host, players = excluded.players, capacity = excluded.capacity,
        title = excluded.title, updated_at = now()
    where public.open_rooms.token = excluded.token or public.open_rooms.updated_at < now() - interval '45 seconds';
end; $function$;

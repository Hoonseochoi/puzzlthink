-- Open rooms across every game, for the "오픈 대전" card on the home page.
-- Run once in the Supabase SQL Editor (project zxkuzpueuvhvypsqbelg), after 20261125000000_open_rooms.sql.
-- It also contains everything from 20261126000000_open_rooms_login_records.sql (safe to run again),
-- because that file did not seem to have been applied.

create or replace function public.open_room_list_all()
returns table (game text, code text, variant smallint, host text, players smallint, capacity smallint)
language sql security definer set search_path = public stable as $$
  select game, code, variant, host, players, capacity from public.open_rooms
   where updated_at > now() - interval '90 seconds'
   order by updated_at desc limit 60;
$$;
revoke all on function public.open_room_list_all() from public;
grant execute on function public.open_room_list_all() to anon, authenticated;

-- 1) Only signed-in players can list a room (the site also asks for sign-in before creating or joining).
create or replace function public.open_room_put(p_game text, p_code text, p_token text, p_variant int, p_host text, p_players int, p_capacity int)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  if p_game !~ '^[a-zA-Z0-9]{2,24}$' or p_code !~ '^[a-z0-9]{4,6}$' or length(p_token) not between 8 and 64 then return; end if;
  delete from public.open_rooms where updated_at < now() - interval '10 minutes';
  insert into public.open_rooms (game, code, token, variant, host, players, capacity, updated_at)
  values (p_game, p_code, p_token, greatest(0, least(p_variant, 9)), left(coalesce(nullif(trim(p_host), ''), '?'), 16),
          greatest(1, least(p_players, 12)), greatest(1, least(p_capacity, 12)), now())
  on conflict (game, code) do update
    set variant = excluded.variant, host = excluded.host, players = excluded.players, capacity = excluded.capacity, updated_at = now()
    where public.open_rooms.token = excluded.token;
end; $$;

-- 2) A player's win / loss / draw count in one game (all modes), shown next to their name in an open room.
--    Counts only: no dates, opponents or other details. Callable by signed-in players.
create or replace function public.player_record(p_user uuid, p_game text)
returns table (wins int, losses int, draws int)
language sql security definer set search_path = public stable as $$
  select count(*) filter (where result = 'win')::int,
         count(*) filter (where result = 'loss')::int,
         count(*) filter (where result = 'draw')::int
    from public.game_results
   where user_id = p_user and game = p_game and auth.uid() is not null;
$$;
revoke all on function public.player_record(uuid, text) from public;
grant execute on function public.player_record(uuid, text) to authenticated;

-- 3) Head-to-head lookups read the player's own results with detail @> {"vs": [...]}; this index keeps them quick.
create index if not exists game_results_detail on public.game_results using gin (detail jsonb_path_ops);

-- Check: the first should list open rooms (maybe none); the second should return 0, 0, 0.
select * from public.open_room_list_all();
select * from public.player_record('00000000-0000-0000-0000-000000000000', 'heavy13');

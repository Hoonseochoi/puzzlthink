-- Open rooms, part 2: room titles, a list across all games, sign-in to list a room, and records.
-- Run once in the Supabase SQL Editor (project zxkuzpueuvhvypsqbelg), after 20261125000000_open_rooms.sql.
-- Replaces 20261126000000_open_rooms_login_records.sql and the old 20261127 file: run only this one.

-- 1) Room titles ------------------------------------------------------------------------------
alter table public.open_rooms add column if not exists title text not null default '';

-- Return types and arguments change, so the old versions go first.
drop function if exists public.open_room_put(text, text, text, int, text, int, int);
drop function if exists public.open_room_list(text);
drop function if exists public.open_room_list_all();

-- 2) List a room (signed-in players only; only the creator's token can change it) ------------------
create or replace function public.open_room_put(p_game text, p_code text, p_token text, p_variant int, p_host text, p_players int, p_capacity int, p_title text default '')
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  if p_game !~ '^[a-zA-Z0-9]{2,24}$' or p_code !~ '^[a-z0-9]{4,6}$' or length(p_token) not between 8 and 64 then return; end if;
  delete from public.open_rooms where updated_at < now() - interval '10 minutes';
  insert into public.open_rooms (game, code, token, variant, host, players, capacity, title, updated_at)
  values (p_game, p_code, p_token, greatest(0, least(p_variant, 9)), left(coalesce(nullif(trim(p_host), ''), '?'), 16),
          greatest(1, least(p_players, 12)), greatest(1, least(p_capacity, 12)), left(trim(coalesce(p_title, '')), 30), now())
  on conflict (game, code) do update
    set variant = excluded.variant, host = excluded.host, players = excluded.players, capacity = excluded.capacity,
        title = excluded.title, updated_at = now()
    where public.open_rooms.token = excluded.token;
end; $$;

-- 3) Lists: one game (its entry screen) and every game (the home card) --------------------------
create or replace function public.open_room_list(p_game text)
returns table (code text, variant smallint, host text, players smallint, capacity smallint, title text)
language sql security definer set search_path = public stable as $$
  select code, variant, host, players, capacity, title from public.open_rooms
   where game = p_game and updated_at > now() - interval '90 seconds'
   order by updated_at desc limit 30;
$$;

create or replace function public.open_room_list_all()
returns table (game text, code text, variant smallint, host text, players smallint, capacity smallint, title text)
language sql security definer set search_path = public stable as $$
  select game, code, variant, host, players, capacity, title from public.open_rooms
   where updated_at > now() - interval '90 seconds'
   order by updated_at desc limit 60;
$$;

revoke all on function public.open_room_put(text, text, text, int, text, int, int, text) from public;
revoke all on function public.open_room_list(text) from public;
revoke all on function public.open_room_list_all() from public;
grant execute on function public.open_room_put(text, text, text, int, text, int, int, text) to anon, authenticated;
grant execute on function public.open_room_list(text) to anon, authenticated;
grant execute on function public.open_room_list_all() to anon, authenticated;

-- 4) Records shown in the waiting room ------------------------------------------------------------
-- A player's win / loss / draw count in one game (all modes). Counts only.
create or replace function public.player_record(p_user uuid, p_game text)
returns table (wins int, losses int, draws int)
language sql security definer set search_path = public stable as $$
  select count(*) filter (where result = 'win')::int, count(*) filter (where result = 'loss')::int, count(*) filter (where result = 'draw')::int
    from public.game_results
   where user_id = p_user and game = p_game and auth.uid() is not null;
$$;
-- A player's record against other people (friend and open rooms, every game). Counts only.
create or replace function public.versus_record(p_user uuid)
returns table (wins int, losses int, draws int)
language sql security definer set search_path = public stable as $$
  select count(*) filter (where result = 'win')::int, count(*) filter (where result = 'loss')::int, count(*) filter (where result = 'draw')::int
    from public.game_results
   where user_id = p_user and mode = 'friend' and auth.uid() is not null;
$$;
revoke all on function public.player_record(uuid, text) from public;
revoke all on function public.versus_record(uuid) from public;
grant execute on function public.player_record(uuid, text) to authenticated;
grant execute on function public.versus_record(uuid) to authenticated;

-- Head-to-head lookups read the player's own results with detail @> {"vs": [...]}.
create index if not exists game_results_detail on public.game_results using gin (detail jsonb_path_ops);

-- Check: an open-room list (maybe empty), then 0 / 0 / 0.
select * from public.open_room_list_all();
select * from public.versus_record('00000000-0000-0000-0000-000000000000');

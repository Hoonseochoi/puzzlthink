-- The home page asks for 7 challenge podiums and the AI Hall of Fame on every visit. At the 2026-11-21 16:10 KST
-- traffic peak those reads (≈50–60 ms of CPU each) saturated the database and most API calls timed out (504).
-- challenge_top and hall_of_fame now answer from a 60-second cache; the original queries become *_live.
create table if not exists public.rpc_cache (
  key text primary key,
  payload jsonb not null,
  at timestamptz not null default now()
);
alter table public.rpc_cache enable row level security;
revoke all on public.rpc_cache from public, anon, authenticated;

alter function public.challenge_top(text, integer) rename to challenge_top_live;
alter function public.hall_of_fame(integer) rename to hall_of_fame_live;
revoke all on function public.challenge_top_live(text, integer) from public, anon, authenticated;
revoke all on function public.hall_of_fame_live(integer) from public, anon, authenticated;

-- Reads `key` from the cache when it is under `ttl` old; otherwise the caller recomputes. One recompute at a time per key.
create or replace function public.rpc_cache_get(p_key text, p_ttl interval)
returns jsonb language plpgsql security definer set search_path = public as $$
declare c public.rpc_cache;
begin
  select * into c from public.rpc_cache where key = p_key;
  if found and c.at > now() - p_ttl then return c.payload; end if;
  -- Someone else is already refreshing it: serve the stale copy rather than piling on.
  if found and not pg_try_advisory_xact_lock(hashtext('rpc_cache:' || p_key)) then return c.payload; end if;
  return null;
end; $$;

create or replace function public.rpc_cache_put(p_key text, p_payload jsonb)
returns void language sql security definer set search_path = public as $$
  insert into public.rpc_cache (key, payload, at) values (p_key, p_payload, now())
  on conflict (key) do update set payload = excluded.payload, at = excluded.at;
$$;
revoke all on function public.rpc_cache_get(text, interval) from public, anon, authenticated;
revoke all on function public.rpc_cache_put(text, jsonb) from public, anon, authenticated;

create or replace function public.challenge_top(p_board text, p_limit integer default 3)
returns table(rank integer, nickname text, avatar_url text, score integer, sub integer, prev_rank integer)
language plpgsql security definer set search_path = public as $$
declare k text := 'challenge_top:' || p_board || ':' || p_limit; j jsonb;
begin
  j := public.rpc_cache_get(k, interval '60 seconds');
  if j is null then
    select coalesce(jsonb_agg(to_jsonb(t) order by t.ordinality), '[]'::jsonb) into j from public.challenge_top_live(p_board, p_limit) with ordinality t;
    perform public.rpc_cache_put(k, j);
  end if;
  return query select * from jsonb_to_recordset(j) as x(rank integer, nickname text, avatar_url text, score integer, sub integer, prev_rank integer);
end; $$;
revoke all on function public.challenge_top(text, integer) from public;
grant execute on function public.challenge_top(text, integer) to anon, authenticated;

create or replace function public.hall_of_fame(p_limit integer default 3)
returns table(game text, rank integer, nickname text, avatar_url text, wins bigint, games bigint, prev_rank integer)
language plpgsql security definer set search_path = public as $$
declare k text := 'hall_of_fame:' || p_limit; j jsonb;
begin
  j := public.rpc_cache_get(k, interval '60 seconds');
  if j is null then
    select coalesce(jsonb_agg(to_jsonb(t) order by t.ordinality), '[]'::jsonb) into j from public.hall_of_fame_live(p_limit) with ordinality t;
    perform public.rpc_cache_put(k, j);
  end if;
  return query select * from jsonb_to_recordset(j) as x(game text, rank integer, nickname text, avatar_url text, wins bigint, games bigint, prev_rank integer);
end; $$;
revoke all on function public.hall_of_fame(integer) from public;
grant execute on function public.hall_of_fame(integer) to anon, authenticated;

-- Read-only (GET) calls skip refreshing the cache instead of failing.
create or replace function public.rpc_cache_put(p_key text, p_payload jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.rpc_cache (key, payload, at) values (p_key, p_payload, now())
  on conflict (key) do update set payload = excluded.payload, at = excluded.at;
exception when read_only_sql_transaction then
  null;
end; $$;
revoke all on function public.rpc_cache_put(text, jsonb) from public, anon, authenticated;

-- Fewer heartbeats: browsers ping every 120 s (was 45 s), so count those seen in the last 4 minutes.
create or replace function public.online_ping(p_id text)
returns integer language plpgsql security definer set search_path = public as $function$
declare n integer;
begin
  if p_id is null or length(p_id) < 8 or length(p_id) > 64 or p_id !~ '^[A-Za-z0-9-]+$' then
    return null;
  end if;
  insert into public.online_heartbeats (id, last_seen) values (p_id, now())
  on conflict (id) do update set last_seen = excluded.last_seen;
  if random() < 0.02 then
    delete from public.online_heartbeats where last_seen < now() - interval '10 minutes';
  end if;
  select count(*) into n from public.online_heartbeats where last_seen > now() - interval '240 seconds';
  return n;
end; $function$;

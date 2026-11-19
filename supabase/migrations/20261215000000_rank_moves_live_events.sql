-- Daily rank moves (▲▼ / NEW) for every ranking board, and a public live-event feed for the
-- "dynamic island" alerts (boards claimed or taken, open-match wins, Hall of Fame top 3, hard clears).

-- ── Daily snapshots ───────────────────────────────────────────────────────
-- No scheduler here, so the first visit of each KST day takes the snapshot (record_visit calls it).
create table if not exists public.rank_snapshot_days (day date primary key, taken_at timestamptz not null default now());
create table if not exists public.rank_snapshots (
  day date not null, board text not null, user_id uuid not null, rank integer not null,
  primary key (day, board, user_id)
);
alter table public.rank_snapshot_days enable row level security;
alter table public.rank_snapshots enable row level security;

create or replace function public.kst_today() returns date language sql stable as $$ select (now() at time zone 'Asia/Seoul')::date $$;

create or replace function public.rank_snapshot_ensure()
returns void language plpgsql security definer set search_path = public as $$
declare d date := public.kst_today();
begin
  insert into public.rank_snapshot_days (day) values (d) on conflict do nothing;
  if not found then return; end if;
  insert into public.rank_snapshots (day, board, user_id, rank)
    select d, 'hall:' || h.game, h.user_id, h.rn from public.hall_ranking() h where h.rn <= 100
    on conflict do nothing;
  insert into public.rank_snapshots (day, board, user_id, rank)
    select d, 'open:' || g.game, r.user_id, r.rnk
      from (select distinct game from public.game_results where mode = 'friend' and detail ->> 'open' = 'true') g,
           lateral public.open_ranking_rows(g.game) r
     where r.rnk <= 100
    on conflict do nothing;
  insert into public.rank_snapshots (day, board, user_id, rank)
    select d, 'slither', o.user_id, o.rnk from public.slither_owner_rows() o where o.rnk <= 100
    on conflict do nothing;
  delete from public.rank_snapshots where day < d - 7;
  delete from public.rank_snapshot_days where day < d - 7;
end; $$;
revoke all on function public.rank_snapshot_ensure() from public, anon, authenticated;

-- Rank at the start of today; null = new on the board today. Before today's snapshot exists: no change.
create or replace function public.rank_prev(p_board text, p_user uuid, p_now integer)
returns integer language sql stable security definer set search_path = public as $$
  select case when not exists (select 1 from public.rank_snapshot_days where day = public.kst_today()) then p_now
              else (select s.rank from public.rank_snapshots s where s.day = public.kst_today() and s.board = p_board and s.user_id = p_user) end;
$$;
revoke all on function public.rank_prev(text, uuid, integer) from public, anon, authenticated;

create or replace function public.record_visit(p_increment boolean default true)
returns table(today bigint, total bigint) language plpgsql security definer set search_path = public as $$
declare v_day date := (now() at time zone 'Asia/Seoul')::date;
begin
  perform public.rank_snapshot_ensure();
  if p_increment then
    insert into public.daily_visits (day, count) values (v_day, 1)
    on conflict (day) do update set count = public.daily_visits.count + 1;
  end if;
  return query
    select coalesce((select d.count from public.daily_visits d where d.day = v_day), 0)::bigint,
           coalesce((select sum(d.count) from public.daily_visits d), 0)::bigint;
end; $$;
revoke all on function public.record_visit(boolean) from public;
grant execute on function public.record_visit(boolean) to anon, authenticated;

-- Ranking reads now carry prev_rank.
drop function if exists public.hall_of_fame(integer);
create or replace function public.hall_of_fame(p_limit integer default 3)
returns table(game text, rank integer, nickname text, avatar_url text, wins bigint, games bigint, prev_rank integer)
language sql stable security definer set search_path = public as $$
  select h.game, h.rn::integer, coalesce(p.nickname, 'Player'), p.avatar_url, h.wins, h.games, public.rank_prev('hall:' || h.game, h.user_id, h.rn::int)
    from public.hall_ranking() h join public.profiles p on p.id = h.user_id
   where h.rn <= least(greatest(p_limit, 1), 10)
   order by h.game, h.rn;
$$;

drop function if exists public.open_ranking_top(text, integer);
create or replace function public.open_ranking_top(p_game text, p_limit integer default 5)
returns table(rank integer, nickname text, avatar_url text, wins integer, losses integer, draws integer, prev_rank integer)
language sql stable security definer set search_path = public as $$
  select r.rnk, coalesce(nullif(p.nickname, ''), 'Player'), p.avatar_url, r.wins, r.losses, r.draws, public.rank_prev('open:' || p_game, r.user_id, r.rnk)
    from public.open_ranking_rows(p_game) r join public.profiles p on p.id = r.user_id
   where r.rnk <= least(greatest(p_limit, 1), 20)
   order by r.rnk;
$$;

drop function if exists public.slither_ranking(integer);
create or replace function public.slither_ranking(p_limit integer default 10)
returns table(rank integer, nickname text, maps integer, is_me boolean, board text, board_ms integer, tried boolean, prev_rank integer)
language sql stable security definer set search_path = public as $$
  select x.rnk, coalesce(nullif(p.nickname, ''), 'Player'), x.maps, x.user_id = auth.uid(), b.id, b.holder_ms, b.tried, public.rank_prev('slither', x.user_id, x.rnk)
    from public.slither_owner_rows() x
    join public.profiles p on p.id = x.user_id
    left join lateral (
      select c.id, c.holder_ms,
             auth.uid() is not null and exists (select 1 from public.slither_runs r where r.challenge_id = c.id and r.user_id = auth.uid()) as tried
        from public.slither_challenges c
       where c.holder = x.user_id and c.published_at is not null
       order by 3, c.published_at desc limit 1
    ) b on true
   order by x.rnk, x.best_ms limit least(greatest(p_limit, 1), 50);
$$;

revoke all on function public.hall_of_fame(integer) from public;
revoke all on function public.open_ranking_top(text, integer) from public;
revoke all on function public.slither_ranking(integer) from public;
grant execute on function public.hall_of_fame(integer) to anon, authenticated;
grant execute on function public.open_ranking_top(text, integer) to anon, authenticated;
grant execute on function public.slither_ranking(integer) to anon, authenticated;

-- ── Live events ───────────────────────────────────────────────────────────
-- Public by design: only nicknames of players who chose to appear in rankings (show_in_hall).
create table if not exists public.live_events (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('slither_claim', 'slither_take', 'open_win', 'hall_rank', 'hard_clear')),
  game text,
  name text not null,
  other text,
  value integer,
  created_at timestamptz not null default now()
);
alter table public.live_events enable row level security;
drop policy if exists live_events_read on public.live_events;
create policy live_events_read on public.live_events for select to anon, authenticated using (created_at > now() - interval '1 day');
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'live_events') then
    alter publication supabase_realtime add table public.live_events;
  end if;
end $$;

-- Nickname shown in alerts, or null (no nickname, or hidden from rankings).
create or replace function public.live_name(p_user uuid)
returns text language sql stable security definer set search_path = public as $$
  select nullif(btrim(p.nickname), '') from public.profiles p where p.id = p_user and p.show_in_hall;
$$;
revoke all on function public.live_name(uuid) from public, anon, authenticated;

create or replace function public.live_emit(p_kind text, p_game text, p_name text, p_other text default null, p_value integer default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_name is null then return; end if;
  insert into public.live_events (kind, game, name, other, value) values (p_kind, p_game, left(p_name, 16), left(p_other, 16), p_value);
  delete from public.live_events where created_at < now() - interval '2 days';
end; $$;
revoke all on function public.live_emit(text, text, text, text, integer) from public, anon, authenticated;

-- 슬리더링크: a new board claimed, or a board taken from someone.
create or replace function public.live_on_slither()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.published_at is null and new.published_at is not null then
    perform public.live_emit('slither_claim', 'slitherlink', public.live_name(new.holder), null, new.holder_ms);
  elsif old.holder is distinct from new.holder and old.published_at is not null then
    perform public.live_emit('slither_take', 'slitherlink', public.live_name(new.holder), public.live_name(old.holder), new.holder_ms);
  end if;
  return new;
exception when others then
  return new; -- an alert must never block the game data
end; $$;
drop trigger if exists live_on_slither on public.slither_challenges;
create trigger live_on_slither after update on public.slither_challenges for each row execute function public.live_on_slither();

-- Last Hall of Fame rank each player was announced at (so moving 3 → 2 → 1 announces each step once).
create table if not exists public.live_hall_seen (game text not null, user_id uuid not null, rank integer not null, primary key (game, user_id));
alter table public.live_hall_seen enable row level security;
-- Today's top 3 count as already announced.
insert into public.live_hall_seen (game, user_id, rank)
  select h.game, h.user_id, h.rn::int from public.hall_ranking() h where h.rn <= 3
  on conflict (game, user_id) do nothing;

-- Results: open-match wins, and AI wins that lift a player into the Hall of Fame top 3.
create or replace function public.live_on_result()
returns trigger language plpgsql security definer set search_path = public as $$
declare r integer; seen integer;
begin
  if new.result <> 'win' then return new; end if;
  if new.mode = 'friend' and new.detail ->> 'open' = 'true' then
    perform public.live_emit('open_win', new.game, public.live_name(new.user_id));
  elsif (new.mode = 'ai' and coalesce(new.detail ->> 'difficulty', new.detail ->> 'level', '') <> 'easy') or (new.game = 'sudoku' and new.mode = 'solo') then
    select h.rn::int into r from public.hall_ranking() h where h.game = new.game and h.user_id = new.user_id;
    if r is not null and r <= 3 then
      select s.rank into seen from public.live_hall_seen s where s.game = new.game and s.user_id = new.user_id;
      if seen is null or r < seen then
        insert into public.live_hall_seen (game, user_id, rank) values (new.game, new.user_id, r)
        on conflict (game, user_id) do update set rank = excluded.rank;
        perform public.live_emit('hall_rank', new.game, public.live_name(new.user_id), null, r);
      end if;
    end if;
  end if;
  return new;
exception when others then
  return new; -- an alert must never block the game data
end; $$;
drop trigger if exists live_on_result on public.game_results;
create trigger live_on_result after insert on public.game_results for each row execute function public.live_on_result();

-- 어려움 클리어 certificates.
create or replace function public.live_on_hard_clear()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.live_emit('hard_clear', new.game, public.live_name(new.user_id), null, new.clear_no);
  return new;
exception when others then
  return new; -- an alert must never block the game data
end; $$;
drop trigger if exists live_on_hard_clear on public.hard_clears;
create trigger live_on_hard_clear after insert on public.hard_clears for each row execute function public.live_on_hard_clear();

revoke all on function public.live_on_slither() from public, anon, authenticated;
revoke all on function public.live_on_result() from public, anon, authenticated;
revoke all on function public.live_on_hard_clear() from public, anon, authenticated;

-- Deliver each event as a public broadcast on the "live-events" topic (simpler and lighter than table change feeds).
create or replace function public.live_emit(p_kind text, p_game text, p_name text, p_other text default null, p_value integer default null)
returns void language plpgsql security definer set search_path = public as $$
declare rid bigint;
begin
  if p_name is null then return; end if;
  insert into public.live_events (kind, game, name, other, value) values (p_kind, p_game, left(p_name, 16), left(p_other, 16), p_value) returning id into rid;
  perform realtime.send(jsonb_build_object('id', rid, 'kind', p_kind, 'game', p_game, 'name', left(p_name, 16), 'other', left(p_other, 16), 'value', p_value), 'live', 'live-events', false);
  delete from public.live_events where created_at < now() - interval '2 days';
end; $$;
revoke all on function public.live_emit(text, text, text, text, integer) from public, anon, authenticated;
alter publication supabase_realtime drop table public.live_events;

-- 명제 바둑 (Proposition Go), a PUZZLTHINK ORIGINAL: the daily three-puzzle timed challenge.
--
-- Everyone gets the same three puzzles each KST day (기본 · 심화 · 거짓말), one ranked attempt per member per day,
-- one clock for the whole run (10 minutes at most). The server keeps every answer and every 피스 hint: a player
-- receives only the propositions of the puzzle in front of them, sends the placement when the board is solved,
-- and the server times the run, checks the placement against the stored answer, and moves on to the next puzzle.
--   prop_pool   puzzles built by scripts/proposition-go/pool.ts (public part, hint, answer); the day takes 3 unused ones
--   prop_days   which three puzzles a day uses (made the first time anyone opens that day)
--   prop_runs   one row per member per day: splits, hints, result, the input trace (src/lib/logicTrace.ts)
-- RPCs: prop_today (anyone), prop_start / prop_solve / prop_hint / prop_giveup / prop_ranking (members).
-- Hints (the owner's caps: 피스 hint at most once per puzzle; both kinds together at most 3 per run):
--   피스 hint   1 piece (piece_balance / piece_spends, as 히든 워드): one more true proposition. +30 s on the ranked time.
--   블랙피스 hint 1 black piece (new: black_piece_spends / black_piece_balance): one stone, chosen at random among the
--               stones not yet on their answer point, is shown on its point and locked. +40 s on the ranked time.
--   Every hint is logged in prop_hints (run, puzzle, kind, currency, cost, ms into the run, stone and point); the
--   owner's report is scripts/proposition-go/hints.sh. 블랙피스 spent this week come off the week's 블랙피스 ranking
--   (black_piece_rows), as spent 피스 come off the 피스 race: the owner accepted that spending can lower a rank.
-- The #1 of today's ranking wears the game's crown icon (c-proposition_go): game_crowns / crown_losses as for every game,
-- moved here at each finish (refresh_game_crowns does not list this game, so it never undoes it).
--
-- Rollout: apply this file, then scripts/proposition-go/pool-batch1.sql (400 days per tier; built by
-- scripts/proposition-go/pool.ts 400 1, which a later batch number extends).
-- Another new game's migration may land before or after this one: the game-id CHECK lists and count_play are
-- extended from their live definitions (whatever they hold by then), not rewritten from a fixed list.

-- ─── 'proposition_go' in the game lists ──────────────────────────────────────────────────────────────────────────

do $$
declare t text; c text; def text; vals text;
begin
  foreach t in array array['game_results', 'game_plays_daily'] loop
    c := t || '_game_check';
    select pg_get_constraintdef(oid) into def from pg_constraint where conrelid = ('public.' || t)::regclass and conname = c;
    if def is null or position('''proposition_go''' in def) > 0 then continue; end if;
    -- Rebuild from the values the constraint holds now, plus ours.
    select string_agg(quote_literal(m[1]), ', ') into vals from regexp_matches(def, '''([a-z0-9_]+)''', 'g') m;
    execute format('alter table public.%I drop constraint %I', t, c);
    execute format('alter table public.%I add constraint %I check (game = any (array[%s, %L]))', t, c, vals, 'proposition_go');
  end loop;
end $$;

-- count_play keeps its own list of game ids: put ours at its front, keeping whatever else it lists by now.
do $$
declare def text;
begin
  select pg_get_functiondef('public.count_play(text,text)'::regprocedure) into def;
  if position('''proposition_go''' in def) = 0 then
    def := replace(def, 'p_game not in (', 'p_game not in (''proposition_go'', ');
    execute def;
  end if;
end $$;

-- ─── Tables ──────────────────────────────────────────────────────────────────────────────────────────────────────

create table if not exists public.prop_pool (
  id integer generated always as identity primary key,
  tier smallint not null check (tier between 1 and 3),
  seed integer not null,
  puzzle jsonb not null,          -- { tier, stones, props } : what a player sees
  hint jsonb not null,            -- the extra true proposition a 피스 buys
  answer text not null,           -- one hex digit (cell) per stone, in tray order
  used_on date,
  unique (tier, seed)
);
create index if not exists prop_pool_free_idx on public.prop_pool (tier, id) where used_on is null;
alter table public.prop_pool enable row level security;   -- definer functions only

create table if not exists public.prop_days (
  day date primary key,
  puzzles integer[] not null check (array_length(puzzles, 1) = 3),
  created_at timestamptz not null default now()
);
alter table public.prop_days enable row level security;

-- 블랙피스 spends, the way piece_spends works for 피스 (written by definer functions only).
create table if not exists public.black_piece_spends (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  amount integer not null default 1 check (amount > 0),
  reason text not null,
  ref uuid,
  spent_at timestamptz not null default now()
);
create index if not exists black_piece_spends_user_idx on public.black_piece_spends (user_id, spent_at);
alter table public.black_piece_spends enable row level security;

create table if not exists public.prop_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  started_at timestamptz not null default now(),
  stage smallint not null default 0,                       -- puzzle in front of the player (0–2); 3 = all solved
  splits integer[] not null default '{}',                  -- ms since the start at each solve, server clock
  hints smallint[] not null default '{0,0,0}',                -- 피스 hints per puzzle (0 or 1)
  stone_hints smallint[] not null default '{0,0,0}',          -- 블랙피스 stone hints per puzzle
  finished_at timestamptz,
  result text check (result in ('clear', 'giveup', 'timeout')),
  ms integer,                                              -- raw time of a clear
  penalty_ms integer not null default 0,                   -- 30 s per 피스 hint, 40 s per 블랙피스 hint
  flag text,                                               -- 'fast': kept out of the ranking
  steps jsonb not null default '[]',                       -- one input trace per puzzle (src/lib/logicTrace.ts)
  signals jsonb not null default '[]',
  unique (user_id, day)
);
-- One row per hint used: what, what it cost, when in the run. No names or addresses: the run's user id only.
create table if not exists public.prop_hints (
  id bigint generated always as identity primary key,
  run_id uuid not null references public.prop_runs (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  stage smallint not null check (stage between 0 and 2),
  tier smallint not null check (tier between 1 and 3),
  kind text not null check (kind in ('prop', 'stone')),
  currency text not null check (currency in ('piece', 'black_piece')),
  cost integer not null check (cost > 0),
  at_ms integer not null,
  stone smallint,
  cell smallint,
  created_at timestamptz not null default now()
);
create index if not exists prop_hints_day_idx on public.prop_hints (day, tier);
create index if not exists prop_hints_run_idx on public.prop_hints (run_id, stage);
alter table public.prop_hints enable row level security;

create index if not exists prop_runs_rank_idx on public.prop_runs (day, (ms + penalty_ms)) where result = 'clear' and flag is null;
alter table public.prop_runs enable row level security;

-- ─── Helpers ─────────────────────────────────────────────────────────────────────────────────────────────────────

create or replace function public.prop_limit_ms() returns integer language sql immutable as $$ select 600000 $$;
create or replace function public.prop_hint_ms() returns integer language sql immutable as $$ select 30000 $$;
create or replace function public.prop_stone_hint_ms() returns integer language sql immutable as $$ select 40000 $$;
create or replace function public.prop_hint_cap() returns integer language sql immutable as $$ select 3 $$;

-- The week's 블랙피스 ranking counts what is left after spends (earned − spent), like the 피스 race. Patched into the
-- live black_piece_rows so whatever else it holds by now stays; the migration stops if its shape is not the expected one.
do $$
declare def text; a1 text; a2 text;
begin
  select pg_get_functiondef('public.black_piece_rows(integer)'::regprocedure) into def;
  if position('black_piece_spends' in def) > 0 then return; end if;
  a1 := 'select w.user_id, sum(w.n)::bigint as pieces,';
  a2 := 'select c.user_id, count(*)::bigint as pieces, max(c.played_at) as last_win
      from counted c, cutoff x where c.played_at < x.t group by c.user_id';
  if position(a1 in def) = 0 or position(a2 in def) = 0 then raise exception 'black_piece_rows changed: update this patch'; end if;
  def := replace(def, a1, 'select w.user_id, (sum(w.n) - coalesce((select sum(s.amount) from public.black_piece_spends s, b where s.user_id = w.user_id and s.spent_at >= b.starts and s.spent_at < b.ends), 0))::bigint as pieces,');
  def := replace(def, a2, 'select c.user_id, (count(*) - coalesce((select sum(s.amount) from public.black_piece_spends s, b where s.user_id = c.user_id and s.spent_at >= b.starts and s.spent_at < least(b.ends, x.t)), 0))::bigint as pieces, max(c.played_at) as last_win
      from counted c, cutoff x where c.played_at < x.t group by c.user_id, x.t');
  execute def;
end $$;

-- A member's 블랙피스 left this week (their row in this week's ranking; members hidden from the hall have none to spend,
-- which is also what the home strip shows them).
create or replace function public.black_piece_balance(p_user uuid)
 returns integer language sql stable security definer set search_path to 'public'
as $$
  select case when p_user is null then 0 else greatest(0, coalesce((select k.pieces from public.black_piece_rows(public.hell_week_of(now())) k where k.user_id = p_user), 0))::int end;
$$;
revoke all on function public.black_piece_balance(uuid) from public, anon, authenticated;

-- The day's three puzzles (one per tier), chosen once: the lowest unused pool row of each tier.
create or replace function public.prop_day_puzzles(p_day date)
 returns integer[] language plpgsql security definer set search_path to 'public'
as $$
declare ids integer[]; t smallint; pid integer;
begin
  select d.puzzles into ids from public.prop_days d where d.day = p_day;
  if ids is not null then return ids; end if;
  perform pg_advisory_xact_lock(hashtext('prop_day'));
  select d.puzzles into ids from public.prop_days d where d.day = p_day;
  if ids is not null then return ids; end if;
  ids := '{}';
  for t in 1..3 loop
    select p.id into pid from public.prop_pool p where p.tier = t and p.used_on is null order by p.id limit 1;
    if pid is null then return null; end if;     -- pool empty: the game says so instead of starting
    update public.prop_pool set used_on = p_day where id = pid;
    ids := ids || pid;
  end loop;
  insert into public.prop_days (day, puzzles) values (p_day, ids);
  return ids;
end; $$;
revoke all on function public.prop_day_puzzles(date) from public, anon, authenticated;

-- Consecutive KST days, ending today or yesterday, with a clear.
create or replace function public.prop_streak(p_user uuid)
 returns integer language sql stable security definer set search_path to 'public'
as $$
  with d as (select r.day from public.prop_runs r where r.user_id = p_user and r.result = 'clear'),
  g as (select day, day - (row_number() over (order by day))::int as grp from d)
  select coalesce((select count(*)::int from g where grp = (select grp from g where day = (select max(day) from d))
                    and (select max(day) from d) >= public.kst_today() - 1), 0);
$$;
revoke all on function public.prop_streak(uuid) from public, anon, authenticated;

-- Ranked runs of a day: clears not flagged, members shown in the hall. Time = raw + hint penalty.
create or replace function public.prop_rank_rows(p_day date)
 returns table (run_id uuid, user_id uuid, total integer, hints integer, rnk integer)
 language sql stable security definer set search_path to 'public'
as $$
  select r.id, r.user_id, r.ms + r.penalty_ms, (select coalesce(sum(h), 0)::int from unnest(r.hints || r.stone_hints) h),
         (row_number() over (order by r.ms + r.penalty_ms, r.finished_at, r.id))::int
    from public.prop_runs r join public.profiles p on p.id = r.user_id
   where r.day = p_day and r.result = 'clear' and r.flag is null and p.show_in_hall;
$$;
revoke all on function public.prop_rank_rows(date) from public, anon, authenticated;

-- The crown (c-proposition_go) goes to today's #1; the one who loses it is told at the next visit.
create or replace function public.prop_crown_refresh()
 returns void language plpgsql security definer set search_path to 'public'
as $$
declare v_uid uuid; v_cur uuid;
begin
  select x.user_id into v_uid from public.prop_rank_rows(public.kst_today()) x where x.rnk = 1;
  if v_uid is null then return; end if;     -- nobody has cleared today yet: yesterday's #1 keeps it until someone does
  select c.user_id into v_cur from public.game_crowns c where c.game = 'proposition_go';
  if v_uid is not distinct from v_cur then return; end if;
  if v_cur is not null then
    update public.profile_icons set revoked_at = now() where user_id = v_cur and icon = 'c-proposition_go' and revoked_at is null;
    insert into public.crown_losses (user_id, game, taker) values (v_cur, 'proposition_go', v_uid);
  end if;
  insert into public.game_crowns (game, user_id, since) values ('proposition_go', v_uid, now())
  on conflict (game) do update set user_id = excluded.user_id, since = excluded.since;
  perform public.grant_icon(v_uid, 'c-proposition_go');
end; $$;
revoke all on function public.prop_crown_refresh() from public, anon, authenticated;

-- What the result screen shows for a finished run.
create or replace function public.prop_result(p_run uuid)
 returns jsonb language sql stable security definer set search_path to 'public'
as $$
  select jsonb_build_object(
    'done', true, 'run', r.id, 'day', r.day, 'result', r.result, 'ms', r.ms, 'penalty', r.penalty_ms,
    'total', case when r.result = 'clear' then r.ms + r.penalty_ms end,
    'splits', to_jsonb(r.splits), 'hints', to_jsonb(r.hints), 'stoneHints', to_jsonb(r.stone_hints), 'solved', coalesce(array_length(r.splits, 1), 0),
    'flag', r.flag,
    'rank', (select x.rnk from public.prop_rank_rows(r.day) x where x.run_id = r.id),
    'players', (select count(*) from public.prop_rank_rows(r.day)),
    'streak', public.prop_streak(r.user_id),
    'crown', exists (select 1 from public.game_crowns c where c.game = 'proposition_go' and c.user_id = r.user_id))
  from public.prop_runs r where r.id = p_run;
$$;
revoke all on function public.prop_result(uuid) from public, anon, authenticated;

-- The puzzle in front of the player (and its hint once bought).
create or replace function public.prop_view(r public.prop_runs)
 returns jsonb language sql stable security definer set search_path to 'public'
as $$
  select jsonb_build_object(
    'done', false, 'run', r.id, 'day', r.day, 'stage', r.stage,
    'elapsed', (extract(epoch from clock_timestamp() - r.started_at) * 1000)::bigint,
    'limit', public.prop_limit_ms(), 'splits', to_jsonb(r.splits), 'hints', to_jsonb(r.hints),
    'puzzle', p.puzzle, 'hint', case when r.hints[r.stage + 1] > 0 then p.hint end,
    'stoneHints', to_jsonb(r.stone_hints),
    'givens', coalesce((select jsonb_agg(jsonb_build_array(h.stone, h.cell) order by h.id) from public.prop_hints h where h.run_id = r.id and h.stage = r.stage and h.kind = 'stone'), '[]'::jsonb),
    'hintsLeft', public.prop_hint_cap() - (select coalesce(sum(x), 0)::int from unnest(r.hints || r.stone_hints) x),
    'pieces', public.piece_balance(r.user_id), 'blackPieces', public.black_piece_balance(r.user_id))
  from public.prop_pool p where p.id = (public.prop_day_puzzles(r.day))[r.stage + 1];
$$;
revoke all on function public.prop_view(public.prop_runs) from public, anon, authenticated;

-- Ends a run past the clock (called on every touch of it).
create or replace function public.prop_expire(p_run uuid)
 returns boolean language plpgsql security definer set search_path to 'public'
as $$
begin
  update public.prop_runs set finished_at = started_at + make_interval(secs => public.prop_limit_ms() / 1000.0), result = 'timeout'
   where id = p_run and finished_at is null and clock_timestamp() > started_at + make_interval(secs => (public.prop_limit_ms() + 3000) / 1000.0);
  return found;
end; $$;
revoke all on function public.prop_expire(uuid) from public, anon, authenticated;

-- ─── RPCs ────────────────────────────────────────────────────────────────────────────────────────────────────────

-- Today at a glance, for anyone: how many cleared, and (signed in) my state, streak and the current #1.
create or replace function public.prop_today()
 returns jsonb language plpgsql security definer set search_path to 'public'
as $$
declare d date := public.kst_today(); r public.prop_runs; uid uuid := auth.uid(); out jsonb;
begin
  out := jsonb_build_object('day', d,
    'players', (select count(*) from public.prop_rank_rows(d)),
    'ready', public.prop_day_puzzles(d) is not null,
    'top', (select jsonb_build_object('nickname', coalesce(nullif(btrim(p.nickname), ''), 'Player'), 'total', x.total)
              from public.prop_rank_rows(d) x join public.profiles p on p.id = x.user_id where x.rnk = 1));
  if uid is null then return out || jsonb_build_object('status', 'guest'); end if;
  select * into r from public.prop_runs where user_id = uid and day = d;
  if found then perform public.prop_expire(r.id); select * into r from public.prop_runs where id = r.id; end if;
  return out || jsonb_build_object(
    'status', case when r.id is null then 'none' when r.finished_at is null then 'running' else 'done' end,
    'streak', public.prop_streak(uid), 'pieces', public.piece_balance(uid), 'blackPieces', public.black_piece_balance(uid),
    'result', case when r.finished_at is not null then public.prop_result(r.id) end);
end; $$;
revoke all on function public.prop_today() from public;
grant execute on function public.prop_today() to anon, authenticated;

-- Starts today's run (or picks it up where it is: the clock never stops). One run per member per day.
create or replace function public.prop_start()
 returns jsonb language plpgsql security definer set search_path to 'public'
as $$
declare uid uuid := auth.uid(); d date := public.kst_today(); r public.prop_runs;
begin
  if uid is null then raise exception 'auth'; end if;
  if public.prop_day_puzzles(d) is null then raise exception 'no_pool'; end if;
  insert into public.prop_runs (user_id, day) values (uid, d) on conflict (user_id, day) do nothing;
  select * into r from public.prop_runs where user_id = uid and day = d;
  if public.prop_expire(r.id) or r.finished_at is not null then return public.prop_result(r.id); end if;
  if r.stage = 0 and coalesce(array_length(r.splits, 1), 0) = 0 then perform public.count_play('proposition_go', 'solo'); end if;
  return public.prop_view(r);
end; $$;
revoke all on function public.prop_start() from public, anon;
grant execute on function public.prop_start() to authenticated;

-- The board of the puzzle in front of the player is solved: p_cells = one hex digit per stone, tray order.
-- p_trace / p_signals: that puzzle's input trace (kept for review, decides nothing; capped in size).
create or replace function public.prop_solve(p_run uuid, p_stage integer, p_cells text, p_trace jsonb default null, p_signals jsonb default null)
 returns jsonb language plpgsql security definer set search_path to 'public'
as $$
declare r public.prop_runs; want text; took integer; v_flag text; hint_n integer; stone_n integer;
begin
  select * into r from public.prop_runs where id = p_run and user_id = auth.uid() for update;
  if not found then raise exception 'not_found'; end if;
  if public.prop_expire(r.id) or r.finished_at is not null then return public.prop_result(r.id); end if;
  if p_stage is distinct from r.stage then return public.prop_view(r); end if;
  select p.answer into want from public.prop_pool p where p.id = (public.prop_day_puzzles(r.day))[r.stage + 1];
  if p_cells is null or p_cells !~ '^[0-9a-f]{4,5}$' or p_cells <> want then
    return public.prop_view(r) || jsonb_build_object('wrong', true);
  end if;
  took := (extract(epoch from clock_timestamp() - r.started_at) * 1000)::int;
  update public.prop_runs set
    splits = splits || took, stage = stage + 1,
    steps = steps || jsonb_build_array(case when p_trace is not null and jsonb_typeof(p_trace) = 'array' and length(p_trace::text) <= 100000 then p_trace end),
    signals = signals || jsonb_build_array(case when p_signals is not null and jsonb_typeof(p_signals) = 'object' and length(p_signals::text) <= 8000 then p_signals end)
   where id = r.id returning * into r;
  if r.stage < 3 then return public.prop_view(r); end if;
  -- All three solved. Under 4 s for any puzzle (or 15 s for the run) is no person reading the cards: kept, not ranked.
  v_flag := case when took < 15000 or exists (select 1 from generate_series(1, 3) k
                   where r.splits[k] - coalesce(r.splits[k - 1], 0) < 4000) then 'fast' end;
  hint_n := (select coalesce(sum(h), 0)::int from unnest(r.hints) h);
  stone_n := (select coalesce(sum(h), 0)::int from unnest(r.stone_hints) h);
  update public.prop_runs set finished_at = clock_timestamp(), result = 'clear', ms = took,
         penalty_ms = hint_n * public.prop_hint_ms() + stone_n * public.prop_stone_hint_ms(), flag = v_flag
   where id = r.id returning * into r;
  insert into public.game_results (id, user_id, game, mode, result, detail)
  values (gen_random_uuid(), r.user_id, 'proposition_go', 'solo', 'win', jsonb_build_object('mode', 'daily', 'day', r.day, 'ms', r.ms, 'hints', hint_n, 'stoneHints', stone_n, 'total', r.ms + r.penalty_ms));
  if v_flag is null then perform public.prop_crown_refresh(); end if;
  return public.prop_result(r.id);
end; $$;
revoke all on function public.prop_solve(uuid, integer, text, jsonb, jsonb) from public, anon;
grant execute on function public.prop_solve(uuid, integer, text, jsonb, jsonb) to authenticated;

-- 피스 hint for the puzzle in front of the player: one piece, once per puzzle, within the run's 3, +30 s.
create or replace function public.prop_hint(p_run uuid)
 returns jsonb language plpgsql security definer set search_path to 'public'
as $$
declare r public.prop_runs; tier smallint;
begin
  select * into r from public.prop_runs where id = p_run and user_id = auth.uid() for update;
  if not found then raise exception 'not_found'; end if;
  if public.prop_expire(r.id) or r.finished_at is not null then return public.prop_result(r.id); end if;
  if r.hints[r.stage + 1] > 0 then return public.prop_view(r); end if;
  if (select coalesce(sum(x), 0) from unnest(r.hints || r.stone_hints) x) >= public.prop_hint_cap() then return public.prop_view(r) || jsonb_build_object('error', 'cap'); end if;
  perform pg_advisory_xact_lock(hashtext('piece_spend:' || r.user_id::text));   -- one spend at a time per member
  if public.piece_balance(r.user_id) < 1 then return public.prop_view(r) || jsonb_build_object('error', 'no_pieces'); end if;
  insert into public.piece_spends (user_id, amount, reason, ref) values (r.user_id, 1, 'proposition_go', r.id);
  select p.tier into tier from public.prop_pool p where p.id = (public.prop_day_puzzles(r.day))[r.stage + 1];
  insert into public.prop_hints (run_id, user_id, day, stage, tier, kind, currency, cost, at_ms)
  values (r.id, r.user_id, r.day, r.stage, tier, 'prop', 'piece', 1, (extract(epoch from clock_timestamp() - r.started_at) * 1000)::int);
  r.hints[r.stage + 1] := 1;
  update public.prop_runs set hints = r.hints where id = r.id returning * into r;
  return public.prop_view(r);
end; $$;
revoke all on function public.prop_hint(uuid) from public, anon;
grant execute on function public.prop_hint(uuid) to authenticated;

-- 블랙피스 hint: one black piece shows one stone on its answer point, chosen at random among the stones the player has
-- not got right yet (p_cells: the board now, one hex digit per stone in tray order, '-' for a stone in the tray).
-- No cap per puzzle beyond the stones left; the run's 3 covers both kinds. +40 s.
create or replace function public.prop_stone_hint(p_run uuid, p_cells text)
 returns jsonb language plpgsql security definer set search_path to 'public'
as $$
declare r public.prop_runs; want text; tier smallint; k integer; pick integer; n integer;
begin
  select * into r from public.prop_runs where id = p_run and user_id = auth.uid() for update;
  if not found then raise exception 'not_found'; end if;
  if public.prop_expire(r.id) or r.finished_at is not null then return public.prop_result(r.id); end if;
  if (select coalesce(sum(x), 0) from unnest(r.hints || r.stone_hints) x) >= public.prop_hint_cap() then return public.prop_view(r) || jsonb_build_object('error', 'cap'); end if;
  select p.answer, p.tier into want, tier from public.prop_pool p where p.id = (public.prop_day_puzzles(r.day))[r.stage + 1];
  n := length(want);
  if p_cells is null or length(p_cells) <> n or p_cells !~ '^[0-9a-f-]+$' then p_cells := repeat('-', n); end if;
  -- A random stone that is not on its answer point and was not given already.
  select s.k - 1 into pick from generate_series(1, n) s(k)
   where substr(p_cells, s.k, 1) <> substr(want, s.k, 1)
     and not exists (select 1 from public.prop_hints h where h.run_id = r.id and h.stage = r.stage and h.kind = 'stone' and h.stone = s.k - 1)
   order by random() limit 1;
  if pick is null then return public.prop_view(r) || jsonb_build_object('error', 'nothing_left'); end if;
  perform pg_advisory_xact_lock(hashtext('black_piece_spend:' || r.user_id::text));
  if public.black_piece_balance(r.user_id) < 1 then return public.prop_view(r) || jsonb_build_object('error', 'no_black_pieces'); end if;
  insert into public.black_piece_spends (user_id, amount, reason, ref) values (r.user_id, 1, 'proposition_go', r.id);
  insert into public.prop_hints (run_id, user_id, day, stage, tier, kind, currency, cost, at_ms, stone, cell)
  values (r.id, r.user_id, r.day, r.stage, tier, 'stone', 'black_piece', 1, (extract(epoch from clock_timestamp() - r.started_at) * 1000)::int,
          pick, ('x' || lpad(substr(want, pick + 1, 1), 8, '0'))::bit(32)::int);
  r.stone_hints[r.stage + 1] := r.stone_hints[r.stage + 1] + 1;
  update public.prop_runs set stone_hints = r.stone_hints where id = r.id returning * into r;
  return public.prop_view(r);
end; $$;
revoke all on function public.prop_stone_hint(uuid, text) from public, anon;
grant execute on function public.prop_stone_hint(uuid, text) to authenticated;

create or replace function public.prop_giveup(p_run uuid)
 returns jsonb language plpgsql security definer set search_path to 'public'
as $$
declare r public.prop_runs;
begin
  select * into r from public.prop_runs where id = p_run and user_id = auth.uid() for update;
  if not found then raise exception 'not_found'; end if;
  if not public.prop_expire(r.id) and r.finished_at is null then
    update public.prop_runs set finished_at = clock_timestamp(), result = 'giveup' where id = r.id;
    insert into public.game_results (id, user_id, game, mode, result, detail)
    values (gen_random_uuid(), r.user_id, 'proposition_go', 'solo', 'loss', jsonb_build_object('mode', 'daily', 'day', r.day, 'solved', coalesce(array_length(r.splits, 1), 0)));
  end if;
  return public.prop_result(r.id);
end; $$;
revoke all on function public.prop_giveup(uuid) from public, anon;
grant execute on function public.prop_giveup(uuid) to authenticated;

-- A day's ranking (default today): top p_limit plus my row.
create or replace function public.prop_ranking(p_day date default null, p_limit integer default 20)
 returns table (rank integer, nickname text, avatar_url text, total integer, hints integer, is_me boolean)
 language sql stable security definer set search_path to 'public'
as $$
  select x.rnk, coalesce(nullif(btrim(p.nickname), ''), 'Player'), p.avatar_url, x.total, x.hints, x.user_id = auth.uid()
    from public.prop_rank_rows(coalesce(p_day, public.kst_today())) x join public.profiles p on p.id = x.user_id
   where x.rnk <= least(greatest(p_limit, 1), 100) or x.user_id = auth.uid()
   order by x.rnk;
$$;
revoke all on function public.prop_ranking(date, integer) from public;
grant execute on function public.prop_ranking(date, integer) to anon, authenticated;

notify pgrst, 'reload schema';

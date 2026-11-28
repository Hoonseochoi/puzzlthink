-- 피스 경쟁전 becomes weekly for good, and finished weeks' pieces become 현자의 징표 (Sage's Tokens).
-- Also: 명제 바둑 pays pieces (a ranked clear within 5 minutes: +1 a day; the day's 1st · 2nd · 3rd: +5 each, the next day).
--
-- Two spendable currencies (블랙피스 is untouched):
--   피스        pieces of the CURRENT race period only: what the race board ranks.
--   현자의 징표  what a finished period's unspent pieces were exchanged into, 1:1, kept for good.
--
-- Periods (piece_period_of / piece_period_bounds / piece_period_cap; nothing else holds a date):
--   1 (1W)  every hard-AI win before 2026-11-25 00:00 KST, up to 30 per game.
--   n ≥ 2   7 days from Wednesday 2026-11-25 00:00 KST + (n − 2) weeks, up to 5 per game.
--   A win counts as before: mode 'ai', result 'win', difficulty/level 'hard', no items (not detail ? 'items'),
--   not russian_roulette / indian_poker / two_sided_poker.
--   Plus piece_grants (명제 바둑 rewards): pieces of the period they were granted in, so they show on that week's board.
--
-- Ledger, not a derived FIFO:
--   piece_spends.from_tokens   how much of each spend was paid in tokens; the rest (amount − from_tokens) was paid in
--                              pieces of the period the spend falls in (spent_at). Set by trigger piece_spend_split on
--                              insert, under the member's wallet lock: tokens first, then this period's pieces. Every caller
--                              (spend_currency, slither_hint, hw_*, prop_hint, mo_use_item …) is covered without changes.
--                              Spends made before this migration keep from_tokens = 0: they stay charged to 2W pieces, so
--                              the live 2W board does not move when this is applied.
--   piece_token_grants         one row per member and finished period: the unspent pieces exchanged into tokens.
--   piece_grants               extra pieces (명제 바둑), unique per (member, source, day): nothing pays twice.
--   Tokens = Σ token grants − Σ from_tokens. Period pieces = wins (capped) + grants − Σ (amount − from_tokens) in it.
--   A finished period's numbers never change afterwards: later spends fall in later periods.
--
-- Period change: finalize_piece_weeks (pg_cron 'icon-tick', every 5 min, through icon_tick) freezes every finished
-- period ≥ 2 that is not frozen yet (piece_race_final + icons w{n}-1..3 + contest_frozen 'piece'), exchanges every
-- finished period not exchanged yet (piece_token_grants + contest_frozen 'piece_exchange'), and pays 명제 바둑 podiums.
-- Being late is harmless: until a period is exchanged, piece_token_balance counts its unspent pieces as pending
-- tokens, and the first spend of a member settles their own row (piece_settle) before splitting.
-- 1W is exchanged by this migration (period 1 is finished).
--
-- Rollback (nothing here deletes data):
--   drop trigger piece_spend_split on public.piece_spends; drop trigger prop_runs_reward on public.prop_runs;
--   restore piece_balance / competition_ranking / competition_final / finalize_piece_weeks and the patched
--   hw_view / my_wallet / mo_item_state / prop_view / prop_today / prop_result from the live definitions saved before
--   applying (scripts: select pg_get_functiondef(...)); the token / grant tables and from_tokens can stay (unused) or
--   be dropped. Tokens already spent were real spends: dropping from_tokens charges them to the period they fell in.

-- ---------------------------------------------------------------- periods
create or replace function public.piece_period_of(p_at timestamptz)
returns integer language sql immutable parallel safe as $$
  select case when p_at < timestamptz '2026-11-25 00:00:00+09' then 1
              else 2 + floor(extract(epoch from (p_at - timestamptz '2026-11-25 00:00:00+09')) / 604800)::int end;
$$;

create or replace function public.piece_period_bounds(p_period integer)
returns table (starts timestamptz, ends timestamptz) language sql immutable parallel safe as $$
  select case when p_period <= 1 then '-infinity'::timestamptz
              else timestamptz '2026-11-25 00:00:00+09' + (p_period - 2) * interval '7 days' end,
         timestamptz '2026-11-25 00:00:00+09' + (greatest(p_period, 1) - 1) * interval '7 days';
$$;

create or replace function public.piece_period_cap(p_period integer)
returns integer language sql immutable parallel safe as $$ select case when p_period <= 1 then 30 else 5 end $$;

-- ---------------------------------------------------------------- ledger tables
alter table public.piece_spends add column if not exists from_tokens integer not null default 0;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'piece_spends_from_tokens_check') then
    alter table public.piece_spends add constraint piece_spends_from_tokens_check check (from_tokens >= 0 and from_tokens <= amount);
  end if;
end $$;

create table if not exists public.piece_token_grants (
  user_id uuid not null references auth.users (id) on delete cascade,
  period integer not null,                  -- the finished period whose unspent pieces were exchanged
  amount integer not null check (amount > 0),
  created_at timestamptz not null default now(),
  seen_at timestamptz,                      -- the "교환해 드렸어요" popup was shown
  primary key (user_id, period)
);
alter table public.piece_token_grants enable row level security;  -- definer functions only

create table if not exists public.piece_grants (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  source text not null check (source in ('prop_fast', 'prop_top')),
  day date not null,                        -- the 명제 바둑 day it is for
  amount integer not null check (amount > 0),
  rank integer,                             -- prop_top: 1, 2 or 3
  period integer not null,                  -- the race period it counts in (when it was granted)
  created_at timestamptz not null default now(),
  seen_at timestamptz,
  unique (user_id, source, day)
);
create index if not exists piece_grants_period_idx on public.piece_grants (period, user_id);
alter table public.piece_grants enable row level security;

create table if not exists public.prop_podium_paid (day date primary key, paid_at timestamptz not null default now());
alter table public.prop_podium_paid enable row level security;

-- ---------------------------------------------------------------- per member
-- Pieces a member has in a period (before p_cut): capped wins + grants − pieces spent in it. Can be read for any period.
create or replace function public.piece_period_pieces(p_user uuid, p_period integer, p_cut timestamptz default 'infinity')
returns integer language sql stable security definer set search_path = public as $$
  with b as (select bb.starts, least(bb.ends, p_cut) as cut from public.piece_period_bounds(p_period) bb)
  select ((select coalesce(sum(least(t.n, public.piece_period_cap(p_period))), 0) from (
            select count(*) as n from public.game_results r, b
             where r.user_id = p_user and r.mode = 'ai' and r.result = 'win'
               and coalesce(r.detail ->> 'difficulty', r.detail ->> 'level', '') = 'hard' and not (r.detail ? 'items')
               and r.game not in ('russian_roulette', 'indian_poker', 'two_sided_poker')
               and r.played_at >= b.starts and r.played_at < b.cut
             group by r.game) t)
        + (select coalesce(sum(g.amount), 0) from public.piece_grants g, b where g.user_id = p_user and g.period = p_period and g.created_at < b.cut)
        - (select coalesce(sum(x.amount - x.from_tokens), 0) from public.piece_spends x, b
            where x.user_id = p_user and x.spent_at >= b.starts and x.spent_at < b.cut))::int;
$$;

-- Tokens at p_now: exchanged grants + finished periods not exchanged yet (pending) − tokens spent.
create or replace function public.piece_token_balance(p_user uuid, p_now timestamptz default now())
returns integer language sql stable security definer set search_path = public as $$
  select case when p_user is null then 0 else greatest(0,
      (select coalesce(sum(t.amount), 0) from public.piece_token_grants t where t.user_id = p_user)
    + (select coalesce(sum(greatest(0, public.piece_period_pieces(p_user, p.n))), 0)
         from generate_series(1, public.piece_period_of(p_now) - 1) p(n)
        where not exists (select 1 from public.contest_frozen f where f.kind = 'piece_exchange' and f.week = p.n)
          and not exists (select 1 from public.piece_token_grants t where t.user_id = p_user and t.period = p.n))
    - (select coalesce(sum(x.from_tokens), 0) from public.piece_spends x where x.user_id = p_user))::int end;
$$;

-- This period's pieces at p_now (floor 0).
create or replace function public.piece_current_pieces(p_user uuid, p_now timestamptz default now())
returns integer language sql stable security definer set search_path = public as $$
  select case when p_user is null then 0 else greatest(0, public.piece_period_pieces(p_user, public.piece_period_of(p_now), p_now + interval '1 microsecond')) end;
$$;

-- Spendable: tokens + this period's pieces. Every caller (spend_currency, hint/item RPCs, pages) reads this.
create or replace function public.piece_balance(p_user uuid)
returns integer language sql stable security definer set search_path = public as $$
  select case when p_user is null then 0 else public.piece_token_balance(p_user) + public.piece_current_pieces(p_user) end;
$$;

-- Writes this member's pending exchange rows (finished periods not exchanged yet). Idempotent.
create or replace function public.piece_settle(p_user uuid, p_now timestamptz default now())
returns void language sql security definer set search_path = public as $$
  insert into public.piece_token_grants (user_id, period, amount)
  select p_user, p.n, v.amount
    from generate_series(1, public.piece_period_of(p_now) - 1) p(n)
    cross join lateral (select public.piece_period_pieces(p_user, p.n) as amount) v
   where v.amount > 0
     and not exists (select 1 from public.contest_frozen f where f.kind = 'piece_exchange' and f.week = p.n)
  on conflict (user_id, period) do nothing;
$$;

-- Every spend row: tokens first, then this period's pieces (recorded on the row).
create or replace function public.piece_spend_split()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform pg_advisory_xact_lock(hashtext('wallet:' || new.user_id::text));
  perform public.piece_settle(new.user_id, new.spent_at);
  new.from_tokens := least(new.amount, public.piece_token_balance(new.user_id, new.spent_at));
  return new;
end $$;
drop trigger if exists piece_spend_split on public.piece_spends;
create trigger piece_spend_split before insert on public.piece_spends for each row execute function public.piece_spend_split();
revoke all on function public.piece_period_pieces(uuid, integer, timestamptz) from public, anon, authenticated;
revoke all on function public.piece_token_balance(uuid, timestamptz) from public, anon, authenticated;
revoke all on function public.piece_current_pieces(uuid, timestamptz) from public, anon, authenticated;
revoke all on function public.piece_settle(uuid, timestamptz) from public, anon, authenticated;
revoke all on function public.piece_spend_split() from public, anon, authenticated;

-- ---------------------------------------------------------------- race (any period)
-- Standing of every member who earned in p_period, counting what happened before p_cut.
create or replace function public.piece_race_rows(p_period integer, p_cut timestamptz default 'infinity')
returns table (user_id uuid, pieces bigint, per_game jsonb, last_win timestamptz)
language sql stable security definer set search_path = public as $$
  with b as (
    select bb.starts, least(bb.ends, p_cut) as cut from public.piece_period_bounds(p_period) bb
  ), hard as (
    select r.user_id, r.game, r.played_at, row_number() over (partition by r.user_id, r.game order by r.played_at) as nth
      from public.game_results r, b
     where r.mode = 'ai' and r.result = 'win'
       and coalesce(r.detail ->> 'difficulty', r.detail ->> 'level', '') = 'hard' and not (r.detail ? 'items')
       and r.game not in ('russian_roulette', 'indian_poker', 'two_sided_poker')
       and r.played_at >= b.starts and r.played_at < b.cut
  ), per as (
    select h.user_id, h.game, count(*)::bigint as n, max(h.played_at) as last_at
      from hard h where h.nth <= public.piece_period_cap(p_period) group by h.user_id, h.game
    union all
    select g.user_id, 'proposition_go', sum(g.amount)::bigint, max(g.created_at)
      from public.piece_grants g, b where g.period = p_period and g.created_at < b.cut group by g.user_id
  ), earned as (
    select p.user_id, sum(p.n)::bigint as n, jsonb_object_agg(p.game, p.n) as per_game, max(p.last_at) as last_at
      from (select q.user_id, q.game, sum(q.n)::bigint as n, max(q.last_at) as last_at from per q group by q.user_id, q.game) p
     group by p.user_id
  ), spent as (
    select x.user_id, sum(x.amount - x.from_tokens)::bigint as n
      from public.piece_spends x, b where x.spent_at >= b.starts and x.spent_at < b.cut group by x.user_id
  )
  select e.user_id, e.n - coalesce(s.n, 0), e.per_game, e.last_at
    from earned e left join spent s on s.user_id = e.user_id;
$$;
revoke all on function public.piece_race_rows(integer, timestamptz) from public, anon, authenticated;

-- One board for any period: the current one live (prev_rank = standing at the start of today, KST), a frozen one from
-- piece_race_final, a finished one that is not frozen yet live without movement.
create or replace function public.piece_board(p_period integer, p_limit integer default 50)
returns table (rank integer, nickname text, avatar_url text, pieces bigint, per_game jsonb, last_win timestamptz, is_me boolean, prev_rank integer)
language sql stable security definer set search_path = public as $$
  with frozen as (
    select exists (select 1 from public.contest_frozen f where f.kind = 'piece' and f.week = p_period) as yes
  ), live as (
    select t.*, row_number() over (order by t.pieces desc, t.last_win asc, t.user_id) as rn
      from public.piece_race_rows(p_period) t join public.profiles p on p.id = t.user_id
     where p.show_in_hall and t.pieces > 0 and not (select yes from frozen)
  ), prev as (
    select t.user_id, row_number() over (order by t.pieces desc, t.last_win asc, t.user_id) as rn
      from public.piece_race_rows(p_period, date_trunc('day', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul') t
      join public.profiles p on p.id = t.user_id
     where p.show_in_hall and t.pieces > 0 and p_period = public.piece_period_of(now()) and not (select yes from frozen)
  ), brd as (
    select k.user_id, k.rn::int as rn, k.pieces, k.per_game, k.last_win,
           case when p_period = public.piece_period_of(now()) then y.rn::int else k.rn::int end as prev_rn
      from live k left join prev y on y.user_id = k.user_id
    union all
    select f.user_id, f.rank, f.pieces, f.per_game, f.last_win, f.rank
      from public.piece_race_final f where f.week = p_period and (select yes from frozen)
  )
  select r.rn, coalesce(p.nickname, 'Player'), p.avatar_url, r.pieces, r.per_game, r.last_win, r.user_id = auth.uid(), r.prev_rn
    from brd r join public.profiles p on p.id = r.user_id
   where r.rn <= least(greatest(p_limit, 1), 100) or r.user_id = auth.uid()
   order by r.rn;
$$;
revoke all on function public.piece_board(integer, integer) from public;
grant execute on function public.piece_board(integer, integer) to anon, authenticated;

-- Same names and columns the clients already call.
create or replace function public.competition_ranking(p_limit integer default 50)
returns table (rank integer, nickname text, avatar_url text, pieces bigint, per_game jsonb, last_win timestamptz, is_me boolean, prev_rank integer)
language sql stable security definer set search_path = public as $$
  select * from public.piece_board(public.piece_period_of(now()), p_limit);
$$;
create or replace function public.competition_final(p_week integer, p_limit integer default 50)
returns table (rank integer, nickname text, avatar_url text, pieces bigint, per_game jsonb, last_win timestamptz, is_me boolean, prev_rank integer)
language sql stable security definer set search_path = public as $$
  select * from public.piece_board(p_week, p_limit);
$$;

-- Freeze one period's board and give its top three their icons (w{n}-1..3). No time check: the caller decides.
create or replace function public.piece_race_freeze(p_week integer)
returns void language plpgsql security definer set search_path = public as $$
declare r record;
begin
  if exists (select 1 from public.contest_frozen f where f.kind = 'piece' and f.week = p_week) then return; end if;
  insert into public.piece_race_final (week, rank, user_id, pieces, per_game, last_win)
  select p_week, row_number() over (order by t.pieces desc, t.last_win asc, t.user_id)::int, t.user_id, t.pieces, t.per_game, t.last_win
    from public.piece_race_rows(p_week) t join public.profiles p on p.id = t.user_id
   where p.show_in_hall and t.pieces > 0
  on conflict (week, rank) do nothing;
  insert into public.contest_frozen (kind, week) values ('piece', p_week) on conflict do nothing;
  for r in select f.user_id, f.rank from public.piece_race_final f where f.week = p_week and f.rank <= 3 order by f.rank desc loop
    perform public.grant_icon(r.user_id, 'w' || p_week || '-' || r.rank);
  end loop;
end $$;
revoke all on function public.piece_race_freeze(integer) from public, anon, authenticated;

-- Exchange one finished period's unspent pieces into tokens, for everyone. Idempotent.
create or replace function public.piece_exchange(p_period integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.contest_frozen f where f.kind = 'piece_exchange' and f.week = p_period) then return; end if;
  insert into public.piece_token_grants (user_id, period, amount)
  select t.user_id, p_period, t.pieces from public.piece_race_rows(p_period) t where t.pieces > 0
  on conflict (user_id, period) do nothing;
  insert into public.contest_frozen (kind, week) values ('piece_exchange', p_period) on conflict do nothing;
end $$;
revoke all on function public.piece_exchange(integer) from public, anon, authenticated;

-- ---------------------------------------------------------------- 명제 바둑 rewards
create or replace function public.prop_fast_ms() returns integer language sql immutable as $$ select 300000 $$;

-- A ranked clear (not flagged 'fast') whose ranked time (raw + hint penalties) is at most 5:00: +1 piece, once a day.
create or replace function public.prop_runs_reward()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.result = 'clear' and old.result is distinct from 'clear' and new.flag is null
     and new.ms is not null and new.ms + new.penalty_ms <= public.prop_fast_ms() then
    insert into public.piece_grants (user_id, source, day, amount, period)
    values (new.user_id, 'prop_fast', new.day, 1, public.piece_period_of(now()))
    on conflict (user_id, source, day) do nothing;
  end if;
  return new;
end $$;
drop trigger if exists prop_runs_reward on public.prop_runs;
create trigger prop_runs_reward after update of result on public.prop_runs for each row execute function public.prop_runs_reward();
revoke all on function public.prop_runs_reward() from public, anon, authenticated;

-- Yesterday's (and any unpaid earlier day's) 1st · 2nd · 3rd: +5 each, once a day is over for good (runs started
-- before midnight can finish up to 10 minutes later, so a day is paid from 00:11 KST). Ties as the ranking breaks them.
create or replace function public.prop_settle_podium(p_now timestamptz default now())
returns void language plpgsql security definer set search_path = public as $$
declare d date;
begin
  for d in select pd.day from public.prop_days pd
            where (pd.day + 1)::timestamp at time zone 'Asia/Seoul' + interval '11 minutes' <= p_now
              and pd.day >= (p_now at time zone 'Asia/Seoul')::date - 7
              and not exists (select 1 from public.prop_podium_paid q where q.day = pd.day)
            order by pd.day loop
    insert into public.piece_grants (user_id, source, day, amount, rank, period, created_at)
    select x.user_id, 'prop_top', d, 5, x.rnk, public.piece_period_of(p_now), p_now
      from public.prop_rank_rows(d) x where x.rnk <= 3
    on conflict (user_id, source, day) do nothing;
    insert into public.prop_podium_paid (day) values (d) on conflict do nothing;
  end loop;
end $$;
revoke all on function public.prop_settle_podium(timestamptz) from public, anon, authenticated;

-- A day's podium (top three) for the entry and result screens; anyone may read it.
create or replace function public.prop_podium(p_day date)
returns table (rank integer, nickname text, total integer, hints integer)
language sql stable security definer set search_path = public as $$
  select x.rnk, coalesce(nullif(btrim(p.nickname), ''), 'Player'), x.total, x.hints
    from public.prop_rank_rows(p_day) x join public.profiles p on p.id = x.user_id
   where x.rnk <= 3 order by x.rnk;
$$;
revoke all on function public.prop_podium(date) from public;
grant execute on function public.prop_podium(date) to anon, authenticated;

-- ---------------------------------------------------------------- weekly job (pg_cron 'icon-tick' → icon_tick → here)
create or replace function public.finalize_piece_weeks()
returns void language plpgsql security definer set search_path = public as $$
declare cur integer := public.piece_period_of(now()); p integer;
begin
  for p in 2 .. cur - 1 loop
    if not exists (select 1 from public.contest_frozen f where f.kind = 'piece' and f.week = p) then perform public.piece_race_freeze(p); end if;
  end loop;
  for p in 1 .. cur - 1 loop
    if not exists (select 1 from public.contest_frozen f where f.kind = 'piece_exchange' and f.week = p) then perform public.piece_exchange(p); end if;
  end loop;
  perform public.prop_settle_podium();
end $$;

-- ---------------------------------------------------------------- popups ("seen" kept on the server)
create or replace function public.my_piece_news()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(n order by n ->> 'at'), '[]'::jsonb) from (
    select jsonb_build_object('kind', 'exchange', 'id', t.period, 'period', t.period, 'amount', t.amount, 'at', t.created_at) as n
      from public.piece_token_grants t where t.user_id = auth.uid() and t.seen_at is null
    union all
    select jsonb_build_object('kind', g.source, 'id', g.id, 'day', g.day, 'amount', g.amount, 'rank', g.rank, 'at', g.created_at,
             'podium', case when g.source = 'prop_top' then (select coalesce(jsonb_agg(to_jsonb(z) order by z.rank), '[]'::jsonb) from public.prop_podium(g.day) z) end)
      from public.piece_grants g where g.user_id = auth.uid() and g.seen_at is null
  ) s;
$$;
revoke all on function public.my_piece_news() from public, anon;
grant execute on function public.my_piece_news() to authenticated;

create or replace function public.mark_piece_news_seen(p_periods integer[] default '{}', p_grants bigint[] default '{}')
returns void language sql security definer set search_path = public as $$
  update public.piece_token_grants set seen_at = now() where user_id = auth.uid() and period = any(p_periods) and seen_at is null;
  update public.piece_grants set seen_at = now() where user_id = auth.uid() and id = any(p_grants) and seen_at is null;
$$;
revoke all on function public.mark_piece_news_seen(integer[], bigint[]) from public, anon;
grant execute on function public.mark_piece_news_seen(integer[], bigint[]) to authenticated;

-- ---------------------------------------------------------------- payloads that show the wallet: add 'tokens'
-- Every RPC that reports 'pieces' (spendable: tokens + this period's pieces, as before) also reports 'tokens';
-- the client shows tokens and this period's pieces (pieces − tokens) and labels the cost by what goes first.
-- prop_today also settles a finished 명제 바둑 day lazily; prop_result carries the day's 5-minute reward.
do $$
declare f text; def text;
begin
  foreach f in array array['hw_view', 'my_wallet', 'mo_item_state', 'prop_view', 'prop_today'] loop
    select pg_get_functiondef(p.oid) into def from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = f;
    if def is null then raise exception 'missing %', f; end if;
    if position('piece_token_balance' in def) = 0 then
      def := regexp_replace(def, '''pieces'', public\.piece_balance\(([a-z_.]+(\(\))?)\)', '''pieces'', public.piece_balance(\1), ''tokens'', public.piece_token_balance(\1)');
      if position('piece_token_balance' in def) = 0 then raise exception 'pattern not found in %', f; end if;
      execute def;
    end if;
  end loop;

  select pg_get_functiondef('public.prop_today'::regproc) into def;
  if position('prop_settle_podium' in def) = 0 then
    def := replace(def, E'begin\n  out := ', E'begin\n  perform public.prop_settle_podium();\n  out := ');
    if position('prop_settle_podium' in def) = 0 then raise exception 'prop_today: pattern not found'; end if;
    execute def;
  end if;

  select pg_get_functiondef('public.prop_result'::regproc) into def;
  if position('prop_fast' in def) = 0 then
    def := replace(def, '''flag'', r.flag,', '''flag'', r.flag, ''reward'', (select jsonb_build_object(''id'', g.id, ''amount'', g.amount, ''seen'', g.seen_at is not null) from public.piece_grants g where g.user_id = r.user_id and g.source = ''prop_fast'' and g.day = r.day), ''fastMs'', public.prop_fast_ms(),');
    if position('prop_fast' in def) = 0 then raise exception 'prop_result: pattern not found'; end if;
    execute def;
  end if;
end $$;

-- ---------------------------------------------------------------- 1W is finished: exchange it now
select public.piece_exchange(1);

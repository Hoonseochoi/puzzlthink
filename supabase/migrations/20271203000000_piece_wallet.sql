-- 피스 becomes a lasting wallet: pieces earned in every period keep adding up, and spending uses the oldest first.
--
-- Before: piece_balance, competition_ranking and finalize_piece_weeks were hard-coded to the 2W window
-- (2026-11-25 00:00 KST → 2026-12-02 00:00 KST), so 1W pieces could not be spent and from 12/02 every balance read 0.
--
-- Rules (as implemented here):
--  * Earning periods: period 1 (1W) = every hard-AI win before 2026-11-25 00:00 KST, up to 30 pieces per game.
--    From then on one period per week, starting Wednesday 00:00 KST (2 = 11/25, 3 = 12/02, 4 = 12/09, …),
--    up to 5 pieces per game per period. A win counts only if mode 'ai', result 'win', difficulty/level 'hard',
--    no items used (not detail ? 'items'), and the game is not russian_roulette / indian_poker / two_sided_poker.
--    All period arithmetic lives in piece_period_of / piece_period_bounds / piece_period_cap.
--  * Wallet: piece_balance = everything earned in all periods − everything ever spent (piece_spends), never below 0.
--    It no longer depends on now(), so it keeps working after any period ends.
--  * Oldest first, as the race sees it: for period P,
--      carry = max(0, earned before P − spent before P)
--      race  = earned in P − max(0, spent in P − carry)
--    i.e. a spend in P is first paid from pieces carried in from earlier periods, and only the rest lowers P's count.
--    competition_ranking (live 2W board and its "yesterday's rank") and finalize_piece_weeks (frozen 2W) use it.
--  * No 3W race is created here: competition_ranking keeps showing period 2, finalize_piece_weeks freezes 2W once.
--  * lounge_pieces is left as it was (it means "earned", the lifetime 30-per-game tally shown in the lounge).
--  * piece_race_final week 1 is history and is not touched.
--
-- No new index: piece_balance for the five members with the most results (643–1,266 rows) runs in ~1 ms on the
-- existing game_results_user_idx (user_id, game); competition_ranking(50) ~17 ms, same as before (12–16 ms).
--
-- Idempotent: only create or replace.
-- Rollback: run the three old definitions in the comment block at the end of this file (copied from the live DB on
-- 2026-11-28, i.e. after 20271202000000_item_spends.sql patched them), then
--   drop function public.piece_race_freeze(integer); drop function public.piece_race_rows(integer, timestamptz);
--   drop function public.piece_period_cap(integer); drop function public.piece_period_bounds(integer);
--   drop function public.piece_period_of(timestamptz);
-- No data is written by this migration, so rolling back loses nothing (spends made meanwhile simply count against 2W again).

-- Period of a moment: 1 before 2026-11-25 00:00 KST, then 2, 3, … one per 7 days from that Wednesday.
create or replace function public.piece_period_of(p_at timestamptz)
returns integer language sql immutable parallel safe as $$
  select case when p_at < timestamptz '2026-11-25 00:00:00+09' then 1
              else 2 + floor(extract(epoch from (p_at - timestamptz '2026-11-25 00:00:00+09')) / 604800)::int end;
$$;

-- [starts, ends) of a period; period 1 starts at -infinity.
create or replace function public.piece_period_bounds(p_period integer)
returns table (starts timestamptz, ends timestamptz) language sql immutable parallel safe as $$
  select case when p_period <= 1 then '-infinity'::timestamptz
              else timestamptz '2026-11-25 00:00:00+09' + (p_period - 2) * interval '7 days' end,
         timestamptz '2026-11-25 00:00:00+09' + (greatest(p_period, 1) - 1) * interval '7 days';
$$;

-- Pieces a single game can earn in a period.
create or replace function public.piece_period_cap(p_period integer)
returns integer language sql immutable parallel safe as $$
  select case when p_period <= 1 then 30 else 5 end;
$$;

-- Wallet balance: earned in all periods − spent ever, floor 0.
create or replace function public.piece_balance(p_user uuid)
returns integer language sql stable security definer set search_path = public as $$
  select case when p_user is null then 0 else greatest(0, (
    select coalesce(sum(least(t.n, public.piece_period_cap(t.period))), 0) from (
      select public.piece_period_of(r.played_at) as period, r.game, count(*) as n from public.game_results r
       where r.user_id = p_user and r.mode = 'ai' and r.result = 'win'
         and coalesce(r.detail ->> 'difficulty', r.detail ->> 'level', '') = 'hard' and not (r.detail ? 'items')
         and r.game not in ('russian_roulette', 'indian_poker', 'two_sided_poker')
       group by 1, 2) t
  ) - coalesce((select sum(x.amount) from public.piece_spends x where x.user_id = p_user), 0))::int end;
$$;

-- Race standing of every member for one period, counting wins and spends before p_cut (default: the whole period).
-- pieces = earned in period − the part of the period's spending not covered by carry from earlier periods.
create or replace function public.piece_race_rows(p_period integer, p_cut timestamptz default 'infinity')
returns table (user_id uuid, pieces bigint, per_game jsonb, last_win timestamptz)
language sql stable security definer set search_path = public as $$
  with b as (
    select bb.starts, least(bb.ends, p_cut) as cut from public.piece_period_bounds(p_period) bb
  ), hard as (
    select r.user_id, r.game, r.played_at, public.piece_period_of(r.played_at) as period,
           row_number() over (partition by r.user_id, r.game, public.piece_period_of(r.played_at) order by r.played_at) as nth
      from public.game_results r, b
     where r.mode = 'ai' and r.result = 'win'
       and coalesce(r.detail ->> 'difficulty', r.detail ->> 'level', '') = 'hard' and not (r.detail ? 'items')
       and r.game not in ('russian_roulette', 'indian_poker', 'two_sided_poker')
       and r.played_at < b.cut
  ), counted as (
    select h.* from hard h where h.nth <= public.piece_period_cap(h.period)
  ), wins as (
    select c.user_id, c.game, count(*) as n, max(c.played_at) as last_win
      from counted c where c.period = p_period group by c.user_id, c.game
  ), earned_in as (
    select w.user_id, sum(w.n)::bigint as n, jsonb_object_agg(w.game, w.n) as per_game, max(w.last_win) as last_win
      from wins w group by w.user_id
  ), earned_before as (
    select c.user_id, count(*)::bigint as n from counted c where c.period < p_period group by c.user_id
  ), spent as (
    select x.user_id,
           coalesce(sum(x.amount) filter (where x.spent_at < b.starts), 0)::bigint as before,
           coalesce(sum(x.amount) filter (where x.spent_at >= b.starts and x.spent_at < b.cut), 0)::bigint as during
      from public.piece_spends x, b group by x.user_id
  )
  select e.user_id,
         e.n - greatest(0, coalesce(s.during, 0) - greatest(0, coalesce(eb.n, 0) - coalesce(s.before, 0))),
         e.per_game, e.last_win
    from earned_in e
    left join earned_before eb on eb.user_id = e.user_id
    left join spent s on s.user_id = e.user_id;
$$;
revoke all on function public.piece_race_rows(integer, timestamptz) from public, anon, authenticated;

-- Live 2W board (period 2). Same columns and ordering as before; prev_rank = standing at the start of today (KST).
create or replace function public.competition_ranking(p_limit integer default 50)
returns table (rank integer, nickname text, avatar_url text, pieces bigint, per_game jsonb, last_win timestamptz, is_me boolean, prev_rank integer)
language sql stable security definer set search_path = public as $$
  with ranked as (
    select t.*, row_number() over (order by t.pieces desc, t.last_win asc, t.user_id) as rn
      from public.piece_race_rows(2) t join public.profiles p on p.id = t.user_id
     where p.show_in_hall and t.pieces > 0
  ), prev_ranked as (
    select t.user_id, row_number() over (order by t.pieces desc, t.last_win asc, t.user_id) as rn
      from public.piece_race_rows(2, date_trunc('day', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul') t
      join public.profiles p on p.id = t.user_id
     where p.show_in_hall and t.pieces > 0
  )
  select k.rn::integer, coalesce(p.nickname, 'Player'), p.avatar_url, k.pieces, k.per_game, k.last_win, k.user_id = auth.uid(), y.rn::integer
    from ranked k join public.profiles p on p.id = k.user_id
    left join prev_ranked y on y.user_id = k.user_id
   where k.rn <= least(greatest(p_limit, 1), 100) or k.user_id = auth.uid()
   order by k.rn;
$$;

-- Writes one period's frozen board and gives its top three their icons. No time check here: callers decide when.
create or replace function public.piece_race_freeze(p_week integer)
returns void language plpgsql security definer set search_path = public as $$
declare r record;
begin
  insert into public.piece_race_final (week, rank, user_id, pieces, per_game, last_win)
  select p_week, row_number() over (order by t.pieces desc, t.last_win asc, t.user_id)::int, t.user_id, t.pieces, t.per_game, t.last_win
    from public.piece_race_rows(p_week) t join public.profiles p on p.id = t.user_id
   where p.show_in_hall and t.pieces > 0
  on conflict (week, rank) do nothing;
  insert into public.contest_frozen (kind, week) values ('piece', p_week);
  for r in select f.user_id, f.rank from public.piece_race_final f where f.week = p_week and f.rank <= 3 order by f.rank desc loop
    perform public.grant_icon(r.user_id, 'w' || p_week || '-' || r.rank);
  end loop;
end $$;
revoke all on function public.piece_race_freeze(integer) from public, anon, authenticated;

-- Freezes 2W once, after it ends (called from icon_tick). Later periods have no race yet.
create or replace function public.finalize_piece_weeks()
returns void language plpgsql security definer set search_path = public as $$
begin
  if now() < (select b.ends from public.piece_period_bounds(2) b)
     or exists (select 1 from public.contest_frozen f where f.kind = 'piece' and f.week = 2) then return; end if;
  perform public.piece_race_freeze(2);
end $$;


/* ROLLBACK — previous live definitions (2W window only):

CREATE OR REPLACE FUNCTION public.piece_balance(p_user uuid)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select case when p_user is null then 0 else greatest(0, (
    select coalesce(sum(least(n, 5)), 0) from (
      select count(*) as n from public.game_results r
       where r.user_id = p_user and r.mode = 'ai' and r.result = 'win'
         and coalesce(r.detail ->> 'difficulty', r.detail ->> 'level', '') = 'hard' and not (r.detail ? 'items')
         and r.game not in ('russian_roulette', 'indian_poker', 'two_sided_poker')
         and r.played_at >= timestamptz '2026-11-25 00:00:00+09' and r.played_at < timestamptz '2026-12-02 00:00:00+09'
       group by r.game) t
  ) - coalesce((select sum(x.amount) from public.piece_spends x where x.user_id = p_user and x.spent_at >= timestamptz '2026-11-25 00:00:00+09' and x.spent_at < timestamptz '2026-12-02 00:00:00+09'), 0))::int end;
$function$
;

CREATE OR REPLACE FUNCTION public.finalize_piece_weeks()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare r record;
begin
  if now() < timestamptz '2026-12-02 00:00:00+09' or exists (select 1 from public.contest_frozen f where f.kind = 'piece' and f.week = 2) then return; end if;
  insert into public.piece_race_final (week, rank, user_id, pieces, per_game, last_win)
  with hard as (
    select r.user_id, r.game, r.played_at, row_number() over (partition by r.user_id, r.game order by r.played_at) as nth
      from public.game_results r
     where r.mode = 'ai' and r.result = 'win'
       and coalesce(r.detail ->> 'difficulty', r.detail ->> 'level', '') = 'hard' and not (r.detail ? 'items')
       and r.game not in ('russian_roulette', 'indian_poker', 'two_sided_poker')
       and r.played_at >= timestamptz '2026-11-25 00:00:00+09' and r.played_at < timestamptz '2026-12-02 00:00:00+09'
  ), wins as (
    select h.user_id, h.game, count(*) as n, max(h.played_at) as last_win from hard h where h.nth <= 5 group by h.user_id, h.game
  ), totals as (
    select e.user_id, e.pieces - coalesce((select sum(x.amount) from public.piece_spends x where x.user_id = e.user_id and x.spent_at >= timestamptz '2026-11-25 00:00:00+09' and x.spent_at < timestamptz '2026-12-02 00:00:00+09'), 0)::bigint as pieces, e.per_game, e.last_win from (
      select w.user_id, sum(w.n)::bigint as pieces, jsonb_object_agg(w.game, w.n) as per_game, max(w.last_win) as last_win from wins w group by w.user_id) e
  )
  select 2, row_number() over (order by t.pieces desc, t.last_win asc, t.user_id)::int, t.user_id, t.pieces, t.per_game, t.last_win
    from totals t join public.profiles p on p.id = t.user_id
   where p.show_in_hall and t.pieces > 0
  on conflict (week, rank) do nothing;
  insert into public.contest_frozen (kind, week) values ('piece', 2);
  for r in select f.user_id, f.rank from public.piece_race_final f where f.week = 2 and f.rank <= 3 order by f.rank desc loop
    perform public.grant_icon(r.user_id, 'w2-' || r.rank);
  end loop;
end; $function$
;

CREATE OR REPLACE FUNCTION public.competition_ranking(p_limit integer DEFAULT 50)
 RETURNS TABLE(rank integer, nickname text, avatar_url text, pieces bigint, per_game jsonb, last_win timestamp with time zone, is_me boolean, prev_rank integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with cutoff as (
    select (date_trunc('day', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul') as t
  ), hard as (
    select r.user_id, r.game, r.played_at,
           row_number() over (partition by r.user_id, r.game order by r.played_at) as nth
      from public.game_results r
     where r.mode = 'ai' and r.result = 'win'
       and coalesce(r.detail ->> 'difficulty', r.detail ->> 'level', '') = 'hard' and not (r.detail ? 'items')
       and r.game not in ('russian_roulette', 'indian_poker', 'two_sided_poker')
       and r.played_at >= timestamptz '2026-11-25 00:00:00+09'
       and r.played_at < timestamptz '2026-12-02 00:00:00+09'
  ), wins as (
    select h.user_id, h.game, count(*) as n, max(h.played_at) as last_win
      from hard h where h.nth <= 5
     group by h.user_id, h.game
  ), totals as (
    select e.user_id, e.pieces - coalesce((select sum(x.amount) from public.piece_spends x where x.user_id = e.user_id and x.spent_at >= timestamptz '2026-11-25 00:00:00+09' and x.spent_at < timestamptz '2026-12-02 00:00:00+09'), 0)::bigint as pieces, e.per_game, e.last_win from (
      select w.user_id, sum(w.n)::bigint as pieces, jsonb_object_agg(w.game, w.n) as per_game, max(w.last_win) as last_win
        from wins w group by w.user_id) e
  ), ranked as (
    select t.*, row_number() over (order by t.pieces desc, t.last_win asc, t.user_id) as rn
      from totals t join public.profiles p on p.id = t.user_id
     where p.show_in_hall and t.pieces > 0
  ), prev_totals as (
    select e.user_id, e.pieces - coalesce((select sum(x.amount) from public.piece_spends x where x.user_id = e.user_id and x.spent_at >= timestamptz '2026-11-25 00:00:00+09' and x.spent_at < timestamptz '2026-12-02 00:00:00+09' and x.spent_at < e.t), 0)::bigint as pieces, e.last_win from (
      select h.user_id, count(*)::bigint as pieces, max(h.played_at) as last_win, c.t
        from hard h, cutoff c
       where h.nth <= 5 and h.played_at < c.t
       group by h.user_id, c.t) e
  ), prev_ranked as (
    select t.user_id, row_number() over (order by t.pieces desc, t.last_win asc, t.user_id) as rn
      from prev_totals t join public.profiles p on p.id = t.user_id
     where p.show_in_hall and t.pieces > 0
  )
  select k.rn::integer, coalesce(p.nickname, 'Player'), p.avatar_url, k.pieces, k.per_game, k.last_win, k.user_id = auth.uid(), y.rn::integer
    from ranked k join public.profiles p on p.id = k.user_id
    left join prev_ranked y on y.user_id = k.user_id
   where k.rn <= least(greatest(p_limit, 1), 100) or k.user_id = auth.uid()
   order by k.rn;
$function$
;
*/

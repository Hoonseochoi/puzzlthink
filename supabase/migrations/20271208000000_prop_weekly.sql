-- 명제 바둑: the weekly board. Each day's ranking gives points (#1 = 20, #2 = 19 … #20 = 1, below 20 = 0) and the
-- week's board sums them per member.
--   Days ranked: prop_rank_rows (clears only, not flagged, members shown in the hall), the daily board's own rows.
--   The week: Wednesday 00:00 KST to Tuesday 24:00, the 피스 경쟁전 week (piece_period_of / piece_period_bounds start
--   their weeks on Wed 2026-11-25 00:00 KST). Today's ranking counts live, so the board moves during the day.
--   Ties: more points, then the better best day, then the faster average ranked time.
-- RPCs (anyone): prop_weekly_ranking(p_limit, p_week) — 0 this week, 1 last week; prop_week() — the week's dates,
-- its #1, last week's #1 and (signed in) my row.
-- Reads only. No piece rewards, no crown or icon: the daily #1 crown (prop_crown_refresh) and the daily rewards
-- (prop_runs_reward, prop_settle_podium) stay as they are. Creates or replaces none of the existing prop_* functions.

-- The Wednesday that starts the week of a KST day.
create or replace function public.prop_week_start(p_day date)
 returns date language sql immutable parallel safe
as $$ select p_day - ((extract(isodow from p_day)::int + 4) % 7) $$;
revoke all on function public.prop_week_start(date) from public, anon, authenticated;

-- A week's points per member, from the week's Wednesday through today at the latest.
create or replace function public.prop_week_rows(p_start date)
 returns table (user_id uuid, points integer, days integer, best integer, rnk integer)
 language sql stable security definer set search_path to 'public'
as $$
  with d as (select g::date as day from generate_series(p_start::timestamp, least(p_start + 6, public.kst_today())::timestamp, interval '1 day') g),
  x as (select x.user_id, x.rnk, x.total from d cross join lateral public.prop_rank_rows(d.day) x),
  a as (select x.user_id, sum(greatest(21 - x.rnk, 0))::int as points, count(*)::int as days, min(x.rnk)::int as best, avg(x.total) as avg_ms
          from x group by x.user_id)
  select a.user_id, a.points, a.days, a.best, (row_number() over (order by a.points desc, a.best, a.avg_ms, a.user_id))::int
    from a;
$$;
revoke all on function public.prop_week_rows(date) from public, anon, authenticated;

-- The weekly board: top p_limit plus my row. p_week: 0 = this week, 1 = last week (up to 8 back).
create or replace function public.prop_weekly_ranking(p_limit integer default 20, p_week integer default 0)
 returns table (rank integer, nickname text, avatar_url text, points integer, days integer, best integer, is_me boolean)
 language sql stable security definer set search_path to 'public'
as $$
  select w.rnk, coalesce(nullif(btrim(p.nickname), ''), 'Player'), p.avatar_url, w.points, w.days, w.best, w.user_id = auth.uid()
    from public.prop_week_rows(public.prop_week_start(public.kst_today()) - 7 * least(greatest(coalesce(p_week, 0), 0), 8)) w
    join public.profiles p on p.id = w.user_id
   where w.rnk <= least(greatest(p_limit, 1), 100) or w.user_id = auth.uid()
   order by w.rnk;
$$;
revoke all on function public.prop_weekly_ranking(integer, integer) from public;
grant execute on function public.prop_weekly_ranking(integer, integer) to anon, authenticated;

-- The week at a glance: its dates, its #1 so far, last week's #1, how many scored, and my row.
create or replace function public.prop_week()
 returns jsonb language sql stable security definer set search_path to 'public'
as $$
  with s as (select public.prop_week_start(public.kst_today()) as ws),
  cur as (select w.* from s, public.prop_week_rows(s.ws) w),
  prev as (select w.* from s, public.prop_week_rows(s.ws - 7) w),
  nick as (select p.id, coalesce(nullif(btrim(p.nickname), ''), 'Player') as nickname from public.profiles p)
  select jsonb_build_object(
    'start', s.ws, 'end', s.ws + 6,
    'players', (select count(*) from cur),
    'top', (select jsonb_build_object('nickname', n.nickname, 'points', c.points, 'days', c.days) from cur c join nick n on n.id = c.user_id where c.rnk = 1),
    'last', (select jsonb_build_object('nickname', n.nickname, 'points', c.points, 'days', c.days) from prev c join nick n on n.id = c.user_id where c.rnk = 1),
    'me', (select jsonb_build_object('rank', c.rnk, 'points', c.points, 'days', c.days) from cur c where c.user_id = auth.uid()))
  from s;
$$;
revoke all on function public.prop_week() from public;
grant execute on function public.prop_week() to anon, authenticated;

notify pgrst, 'reload schema';

#!/bin/bash
# 명제 바둑: how members use hints in 오늘의 명제, per day and per difficulty (20271202100000_proposition_go.sql:
# prop_runs + prop_hints). Read-only (the session runs with default_transaction_read_only): it prints, it changes nothing.
# No names, e-mails or addresses are read: only counts per day / tier.
#
# Usage: scripts/proposition-go/hints.sh            last 14 days
#        DAYS=60 scripts/proposition-go/hints.sh
#
# Per day (KST):
#   runs          daily runs started · clears and clear rate
#   prop% stone%  share of runs that used at least one 피스 hint (one more proposition) / 블랙피스 hint (one stone)
#   hints/run     hints of both kinds per run (cap 3)
#   pieces black  피스 and 블랙피스 spent on hints
#   med_clear     median ranked-less time (raw, s) of clears without any hint / with at least one
# Per difficulty (기본 · 심화 · 거짓말 = the run's 1st · 2nd · 3rd puzzle), over the same days:
#   reached       runs that got to this puzzle · solved and solve rate
#   prop% stone%  share of reached runs that used each hint on this puzzle; stones = 블랙피스 hints spent here
#   med_s         median seconds spent on this puzzle when solved, without / with a hint on it
#   hint_at       median seconds into the puzzle when its first hint was taken
set -euo pipefail
DB=${DB_CONTAINER:-supabase-db}
DAYS=${DAYS:-14}
[[ "$DAYS" =~ ^[0-9]+$ ]] || { echo "DAYS must be a whole number" >&2; exit 1; }
psql() { docker exec -i -e PGOPTIONS='-c default_transaction_read_only=on' "$DB" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q -P pager=off "$@"; }

psql -v days="$DAYS" <<'SQL'
\echo '== 명제 바둑 hints per day'
with runs as (
  select r.*, (select coalesce(sum(x), 0) from unnest(r.hints) x) as ph, (select coalesce(sum(x), 0) from unnest(r.stone_hints) x) as sh
    from public.prop_runs r where r.day > public.kst_today() - :'days'::int
)
select to_char(day, 'MM/DD') as day, count(*) as runs,
       count(*) filter (where result = 'clear') as clears,
       round(100.0 * count(*) filter (where result = 'clear') / count(*)) as "clear%",
       round(100.0 * count(*) filter (where ph > 0) / count(*)) as "prop%",
       round(100.0 * count(*) filter (where sh > 0) / count(*)) as "stone%",
       round(avg(ph + sh), 2) as "hints/run",
       sum(ph) as pieces, sum(sh) as black,
       round((percentile_cont(.5) within group (order by ms) filter (where result = 'clear' and ph + sh = 0))::numeric / 1000, 1) as med_clear_nohint,
       round((percentile_cont(.5) within group (order by ms) filter (where result = 'clear' and ph + sh > 0))::numeric / 1000, 1) as med_clear_hint
  from runs group by day order by day desc;

\echo
\echo '== per difficulty (1 기본 · 2 심화 · 3 거짓말)'
with runs as (select r.* from public.prop_runs r where r.day > public.kst_today() - :'days'::int),
per as (
  select r.id, k as tier,
         coalesce(array_length(r.splits, 1), 0) >= k as solved,
         case when coalesce(array_length(r.splits, 1), 0) >= k then r.splits[k] - coalesce(r.splits[k - 1], 0) end as took,
         coalesce(r.hints[k], 0) as ph, coalesce(r.stone_hints[k], 0) as sh,
         (select min(h.at_ms) from public.prop_hints h where h.run_id = r.id and h.stage = k - 1) - coalesce(r.splits[k - 1], 0) as first_hint
    from runs r, generate_series(1, 3) k
   where coalesce(array_length(r.splits, 1), 0) >= k - 1
)
select tier, count(*) as reached, count(*) filter (where solved) as solved,
       round(100.0 * count(*) filter (where solved) / count(*)) as "solve%",
       round(100.0 * count(*) filter (where ph > 0) / count(*)) as "prop%",
       round(100.0 * count(*) filter (where sh > 0) / count(*)) as "stone%",
       sum(sh) as stones,
       round((percentile_cont(.5) within group (order by took) filter (where solved and ph + sh = 0))::numeric / 1000, 1) as med_s_nohint,
       round((percentile_cont(.5) within group (order by took) filter (where solved and ph + sh > 0))::numeric / 1000, 1) as med_s_hint,
       round((percentile_cont(.5) within group (order by first_hint))::numeric / 1000, 1) as hint_at_s
  from per group by tier order by tier;

\echo
\echo '== hints by kind (all days above)'
select kind, currency, count(*) as hints, sum(cost) as spent, count(distinct run_id) as runs,
       round((percentile_cont(.5) within group (order by at_ms))::numeric / 1000, 1) as med_s_into_run
  from public.prop_hints where day > public.kst_today() - :'days'::int group by kind, currency order by kind;
SQL

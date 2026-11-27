#!/bin/bash
# 로직 챌린지 (마슈 · 노노그램 · 스타배틀 · 비나이로 · 한붓길 · 컬러 잇기 · 마방진 스왑): members whose recorded runs look automated,
# per game, from the input trace kept with each run (logic_runs.steps / signals, 20271130100000_logic_run_trace.sql).
# Read-only (the session runs with default_transaction_read_only): it prints, it changes nothing. The owner judges.
#
# Usage: scripts/logic/suspects.sh                 last 30 days, members with 3+ traced runs, only the ones that look off
#        DAYS=90 MIN_RUNS=2 scripts/logic/suspects.sh
#        ALL=1 scripts/logic/suspects.sh            every member with traced runs (to see what normal looks like)
#        RUNS=<nickname> scripts/logic/suspects.sh  that member's traced runs one by one
#
# Columns (per member and game, over runs with a trace):
#   runs/clears   traced runs and how many cleared
#   clean         clears with no wrong input, no erase, no undo and no clear-all (a person almost always slips somewhere)
#   wrong/fix     wrong inputs (against the answer at the time) / erases + undos + clear-alls, summed
#   inputs        inputs summed (a drag counts once)
#   gap_med/cv    median of the runs' median time between inputs (ms) / median coefficient of variation (< 0.35 = very even)
#   p10           median of the runs' 10th-percentile gap (ms): a bot clicking flat out shows tens of ms
#   still         mouse: share of press-to-press gaps with at most one pointer move between (> 0.8 = the pointer jumps)
#   no_ev         inputs with no real press, drag or key just before them (script-made changes)
#   untr          events dispatched from script (isTrusted false)
#   wd            runs where navigator.webdriver was true
#   bursts        pauses of 3 s+ followed by 5+ quick inputs ("think, then fire"), summed; pause_cv = how even those pauses are
#   ptr           presses by type, summed: m mouse, t touch, p pen, k keys
#   suspects      the client's own flags, with how many runs raised each
set -euo pipefail
DB=${DB_CONTAINER:-supabase-db}
DAYS=${DAYS:-30}
MIN_RUNS=${MIN_RUNS:-3}
ALL=${ALL:-0}
[[ "$DAYS" =~ ^[0-9]+$ && "$MIN_RUNS" =~ ^[0-9]+$ ]] || { echo "DAYS and MIN_RUNS must be whole numbers" >&2; exit 1; }
psql() { docker exec -i -e PGOPTIONS='-c default_transaction_read_only=on' "$DB" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q -P pager=off "$@"; }

if [[ -n "${RUNS:-}" ]]; then
  psql -v who="$RUNS" -v days="$DAYS" <<'SQL'
select r.game, r.kind, to_char(r.finished_at at time zone 'Asia/Seoul', 'MM/DD HH24:MI') as at_kst, r.result, r.flag,
       round(r.ms / 1000.0) as sec, s ->> 'inputs' as inputs, s ->> 'wrong' as wrong,
       (coalesce((s ->> 'erases')::int, 0) + coalesce((s ->> 'undos')::int, 0) + coalesce((s ->> 'wipes')::int, 0)) as fix,
       s -> 'gap' ->> 'med' as gap_med, s -> 'gap' ->> 'p10' as p10, s -> 'gap' ->> 'cv' as cv, s -> 'gap' ->> 'max' as max_gap,
       s ->> 'stillGaps' || '/' || (s ->> 'mouseGaps') as still, s ->> 'movesMed' as moves_med, s ->> 'noEvent' as no_ev,
       s ->> 'untrusted' as untr, s ->> 'webdriver' as wd, s ->> 'bursts' as bursts, s -> 'pauses' ->> 'cv' as pause_cv,
       s -> 'away' ->> 'n' as away_n, s ->> 'ptr' as ptr, s ->> 'suspects' as suspects, s ->> 'serverCut' as cut
  from public.logic_runs r
  join public.profiles p on p.id = r.user_id
  cross join lateral (select r.signals as s) x
 where btrim(p.nickname) = btrim(:'who') and r.signals is not null and r.finished_at > now() - make_interval(days => :days)
 order by r.game, r.finished_at;
SQL
  exit 0
fi

psql -v days="$DAYS" -v min_runs="$MIN_RUNS" -v show_all="$ALL" <<'SQL'
with t as (
  select r.game, r.user_id, r.result, r.signals s,
         (r.signals ->> 'wrong')::int as wrong,
         coalesce((r.signals ->> 'erases')::int, 0) + coalesce((r.signals ->> 'undos')::int, 0) + coalesce((r.signals ->> 'wipes')::int, 0) as fix
    from public.logic_runs r
   where r.signals is not null and r.signals ? 'inputs' and r.finished_at > now() - make_interval(days => :days)
), m as (
  select game, user_id, count(*) as runs, count(*) filter (where result = 'clear') as clears,
         count(*) filter (where result = 'clear' and coalesce(wrong, 0) = 0 and fix = 0) as clean,
         sum(wrong) as wrong, sum(fix) as fix, sum((s ->> 'inputs')::int) as inputs,
         percentile_cont(0.5) within group (order by (s -> 'gap' ->> 'med')::numeric) as gap_med,
         percentile_cont(0.5) within group (order by (s -> 'gap' ->> 'cv')::numeric) as gap_cv,
         percentile_cont(0.5) within group (order by (s -> 'gap' ->> 'p10')::numeric) as p10,
         sum((s ->> 'stillGaps')::int)::numeric / nullif(sum((s ->> 'mouseGaps')::int), 0) as still,
         sum((s ->> 'noEvent')::int) as no_ev, sum((s ->> 'untrusted')::int) as untr,
         count(*) filter (where (s ->> 'webdriver')::boolean) as wd,
         sum((s ->> 'bursts')::int) as bursts,
         percentile_cont(0.5) within group (order by (s -> 'pauses' ->> 'cv')::numeric) as pause_cv,
         'm' || sum((s -> 'ptr' ->> 'mouse')::int) || ' t' || sum((s -> 'ptr' ->> 'touch')::int) || ' p' || sum((s -> 'ptr' ->> 'pen')::int) || ' k' || sum((s -> 'ptr' ->> 'key')::int) as ptr
    from t group by game, user_id
), f as (
  select t.game, t.user_id, string_agg(x.sus || '×' || x.n, ' ' order by x.n desc, x.sus) as suspects
    from (select game, user_id, sus, count(*) n from t cross join jsonb_array_elements_text(coalesce(t.s -> 'suspects', '[]'::jsonb)) sus group by 1, 2, 3) x
    join (select distinct game, user_id from t) t using (game, user_id)
   group by t.game, t.user_id
)
select m.game, coalesce(nullif(btrim(p.nickname), ''), 'Player') as nickname, m.runs, m.clears, m.clean,
       m.wrong || '/' || m.fix as "wrong/fix", m.inputs,
       round(m.gap_med::numeric) as gap_med, round(m.gap_cv::numeric, 2) as cv, round(m.p10::numeric) as p10, round(m.still, 2) as still,
       m.no_ev, m.untr, m.wd, m.bursts, round(m.pause_cv::numeric, 2) as pause_cv, m.ptr, coalesce(f.suspects, '') as suspects
  from m
  left join f using (game, user_id)
  left join public.profiles p on p.id = m.user_id
 where m.runs >= :min_runs
   and (:show_all = 1
        or m.wd > 0 or m.untr > 0 or m.no_ev >= 3
        or (m.clears >= 3 and m.clean::numeric / m.clears >= 0.8)
        or (m.runs >= 3 and m.gap_cv < 0.35)
        or m.still >= 0.8
        or m.bursts >= 3 * m.runs)
 order by m.game, coalesce(m.wd > 0, false)::int + coalesce(m.untr > 0, false)::int + coalesce(m.no_ev >= 3, false)::int
          + coalesce(m.still >= 0.8, false)::int + coalesce(m.clears >= 3 and m.clean::numeric / m.clears >= 0.8, false)::int
          + coalesce(m.gap_cv < 0.35, false)::int desc, m.clears desc;
SQL
echo "(read-only; DAYS=$DAYS MIN_RUNS=$MIN_RUNS; RUNS=<nickname> for one member's runs)"

#!/usr/bin/env bash
# 망각의 지뢰 items, per day (KST): AI games, share of games using each item, 피스 / 블랙피스 spent, and win rate
# with and without items per AI level. Read-only (one READ ONLY transaction, rolled back).
#   scripts/mine-oblivion/item-stats.sh [days=14]
# DB: the self-hosted docker container (DB_CONTAINER, default supabase-db); PSQL='psql "$DATABASE_URL"' to use a URL.
set -euo pipefail
DAYS="${1:-14}"
[[ "$DAYS" =~ ^[0-9]{1,3}$ ]] || { echo "days must be a number" >&2; exit 1; }
PSQL="${PSQL:-docker exec -i ${DB_CONTAINER:-supabase-db} psql -U postgres -X -q}"

if ! $PSQL -tA -c "select to_regclass('public.item_uses')" | grep -q item_uses; then
  echo "public.item_uses is missing: apply supabase/migrations/20271202000000_item_spends.sql first." >&2; exit 1
fi

$PSQL <<SQL
\pset footer off
begin transaction read only;

\echo '── AI games and item use per day (KST) ──'
with g as (
  select r.user_id, r.result, coalesce(r.detail ->> 'level', '?') as level, r.detail ->> 'gid' as gid,
         (r.played_at at time zone 'Asia/Seoul')::date as day, r.detail ? 'items' as with_items
    from public.game_results r
   where r.game = 'mine_oblivion' and r.mode = 'ai' and r.played_at >= now() - interval '$DAYS days'
), u as (
  select distinct user_id, match, item from public.item_uses where game = 'mine_oblivion'
)
select g.day,
       count(*) as games,
       round(100.0 * count(*) filter (where g.with_items) / count(*), 1) as "items %",
       round(100.0 * count(*) filter (where exists (select 1 from u where u.user_id = g.user_id and u.match = g.gid and u.item = 'probe')) / count(*), 1) as "탐지기 %",
       round(100.0 * count(*) filter (where exists (select 1 from u where u.user_id = g.user_id and u.match = g.gid and u.item = 'recall')) / count(*), 1) as "기억 %",
       round(100.0 * count(*) filter (where exists (select 1 from u where u.user_id = g.user_id and u.match = g.gid and u.item = 'suit')) / count(*), 1) as "방폭복 %"
  from g group by g.day order by g.day desc;

\echo ''
\echo '── Spent per day (every charge, finished game or not) ──'
select (used_at at time zone 'Asia/Seoul')::date as day,
       coalesce(sum(cost) filter (where currency = 'piece'), 0) as "피스",
       coalesce(sum(cost) filter (where currency = 'black_piece'), 0) as "블랙피스",
       count(*) filter (where item = 'probe') as "탐지기", count(*) filter (where item = 'recall') as "기억", count(*) filter (where item = 'suit') as "방폭복",
       count(distinct user_id) as members, count(distinct match) as matches
  from public.item_uses
 where game = 'mine_oblivion' and used_at >= now() - interval '$DAYS days'
 group by 1 order by 1 desc;

\echo ''
\echo '── Win rate with / without items, per day and AI level (draws count half) ──'
select (r.played_at at time zone 'Asia/Seoul')::date as day, coalesce(r.detail ->> 'level', '?') as level,
       count(*) filter (where not (r.detail ? 'items')) as "games plain",
       round(100.0 * avg(case r.result when 'win' then 1 when 'draw' then 0.5 else 0 end) filter (where not (r.detail ? 'items')), 1) as "win % plain",
       count(*) filter (where r.detail ? 'items') as "games items",
       round(100.0 * avg(case r.result when 'win' then 1 when 'draw' then 0.5 else 0 end) filter (where r.detail ? 'items'), 1) as "win % items"
  from public.game_results r
 where r.game = 'mine_oblivion' and r.mode = 'ai' and r.played_at >= now() - interval '$DAYS days'
 group by 1, 2 order by 1 desc, 2;

rollback;
SQL

#!/bin/sh
# Give the 후원자 커버 to a player by nickname (after checking their ₩3,000 CTEE support).
#   scripts/supporter/grant.sh <nickname> [memo]
# List supporters: scripts/supporter/grant.sh --list
set -e
if [ "$1" = "--list" ]; then
  docker exec -i supabase-db psql -U postgres -d postgres -c "select p.nickname, s.granted_at at time zone 'Asia/Seoul' as granted_kst, s.memo, s.hidden from supporter_covers s join profiles p on p.id = s.user_id order by s.granted_at"
  exit 0
fi
[ -n "$1" ] || { echo "usage: $0 <nickname> [memo] | --list" >&2; exit 1; }
docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 -v nick="$1" -v memo="${2:-}" <<'SQL'
select public.grant_supporter(:'nick', nullif(:'memo', '')) as user_id;
SQL
echo "granted: $1"

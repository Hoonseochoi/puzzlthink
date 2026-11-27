#!/bin/sh
# Google Play 앱 테스터: record that these emails are now on the Play Console email list, so the site shows them the
# install button and popup (supabase/migrations/20271130200000_app_testers_listed.sql).
#   scripts/play/mark-listed.sh <email[,email...]> [email ...]
# Run it only after Play Console shows the list saved with them in it. Writes to the LIVE database.
set -eu
[ $# -gt 0 ] || { echo "usage: $0 <email[,email...]> [email ...]" >&2; exit 1; }
LIST=$(printf '%s\n' "$@" | tr ',; ' '\n\n\n' | tr 'A-Z' 'a-z' | grep '@' | sort -u | paste -sd, -)
[ -n "$LIST" ] || { echo "no emails given" >&2; exit 1; }
docker exec -i "${TESTERS_CONTAINER:-supabase-db}" psql -U postgres -d "${TESTERS_DB:-postgres}" -X -At -v ON_ERROR_STOP=1 -v list="$LIST" <<'SQL'
with done as (
  update public.app_testers set listed_at = now()
   where withdrawn_at is null and listed_at is null and email = any(string_to_array(:'list', ','))
  returning 1)
select 'marked listed: ' || count(*) from done;
select 'still pending: ' || count(*) from public.app_testers where withdrawn_at is null and listed_at is null;
SQL

#!/bin/sh
# Google Play 앱 테스터 list (supabase/migrations/20271130000000_app_testers.sql) for the closed test.
#   scripts/play/testers.sh [out.csv]
# Prints how many members joined (and how many withdrew), and writes the current, not withdrawn emails one per line
# (no header) to scripts/play/out/testers.csv, the format Play Console takes for an email list: Test and release →
# Closed testing → Testers → Email lists → create/edit the list → "Upload CSV file". Upload the whole file each time:
# it replaces the list, so members who withdrew drop out of it.
# Reads the live container in a read-only transaction; the CSV holds emails, so it is git-ignored and chmod 600.
set -eu
cd "$(dirname "$0")"
OUT="${1:-out/testers.csv}"
mkdir -p "$(dirname "$OUT")"
# TESTERS_CONTAINER / TESTERS_DB only for trying the script on a scratch container.
psql_ro() { docker exec -i -e PGOPTIONS='-c default_transaction_read_only=on' "${TESTERS_CONTAINER:-supabase-db}" psql -U postgres -d "${TESTERS_DB:-postgres}" -X -At -v ON_ERROR_STOP=1 "$@"; }

psql_ro -F ' ' -c "select count(*) filter (where withdrawn_at is null), count(*) filter (where withdrawn_at is not null) from public.app_testers" \
  | { read -r joined withdrawn; echo "joined: $joined   withdrawn: $withdrawn   (Google needs at least 12 opted in for 14 days)"; }

umask 077
psql_ro -c "select email from public.app_testers where withdrawn_at is null order by consented_at" > "$OUT"
echo "wrote $(wc -l < "$OUT" | tr -d ' ') emails to $(cd "$(dirname "$OUT")" && pwd)/$(basename "$OUT")"

#!/bin/sh
# Google Play 앱 테스터: the emails that joined on the site but are not on the Play Console email list yet
# (supabase/migrations/20271130200000_app_testers_listed.sql).
#   scripts/play/pending.sh            → one line: the emails separated by commas (empty when there are none)
#   scripts/play/pending.sh --count    → how many, and how many are listed already
# After adding them in Play Console (Test and release → Closed testing → Testers → the email list → "이메일 주소 추가"
# → 변경사항 저장 → 저장), run scripts/play/mark-listed.sh with the same emails. Read-only.
set -eu
psql_ro() { docker exec -i -e PGOPTIONS='-c default_transaction_read_only=on' "${TESTERS_CONTAINER:-supabase-db}" psql -U postgres -d "${TESTERS_DB:-postgres}" -X -At -v ON_ERROR_STOP=1 "$@"; }
if [ "${1:-}" = "--count" ]; then
  psql_ro -F ' ' -c "select count(*) filter (where listed_at is null), count(*) filter (where listed_at is not null) from public.app_testers where withdrawn_at is null" \
    | { read -r pending listed; echo "pending: $pending   listed: $listed"; }
else
  psql_ro -c "select coalesce(string_agg(email, ',' order by consented_at), '') from public.app_testers where withdrawn_at is null and listed_at is null"
fi

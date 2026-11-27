#!/usr/bin/env bash
# Scratch tests for the account deletion, nickname filter and app tester migrations. Needs Docker and the cached supabase/postgres image.
# Never point this at the live database: it starts its own throwaway container.
set -euo pipefail
cd "$(dirname "$0")/../../.."
NAME=ptk-play-store-test
docker rm -f "$NAME" >/dev/null 2>&1 || true
docker run -d --name "$NAME" -e POSTGRES_PASSWORD=scratch supabase/postgres:17.6.1.136 >/dev/null
trap 'docker rm -f "$NAME" >/dev/null' EXIT
until docker exec "$NAME" pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done; sleep 5
for f in supabase/migrations/*.sql; do docker exec -i "$NAME" psql -U postgres -v ON_ERROR_STOP=1 -q < "$f" >/dev/null; done
for t in test nickname_filter; do docker exec -i "$NAME" psql -U postgres -v ON_ERROR_STOP=1 < supabase/tests/play_store/$t.sql 2>&1 | grep -E "PASS|FAIL|TOTAL|ERROR"; done
{ echo 'begin;'; cat supabase/tests/play_store/app_testers.sql; echo 'rollback;'; } | docker exec -i "$NAME" psql -U postgres -v ON_ERROR_STOP=1 2>&1 | grep -E "PASS|FAIL|INFO|ERROR"

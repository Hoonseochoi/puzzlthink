#!/usr/bin/env bash
# Runs the lounge chat rule tests on a throwaway Postgres container (never the live supabase-db).
# 00_stub.sql fakes auth.uid(), auth.users, profiles, admin_secrets and realtime.send.
set -euo pipefail
cd "$(dirname "$0")"
name=lounge-test-$$
docker run -d --rm --name "$name" -e POSTGRES_PASSWORD=test postgres:17 >/dev/null
trap 'docker rm -f "$name" >/dev/null' EXIT
until docker exec "$name" pg_isready -U postgres -q; do sleep 1; done; sleep 1
psql() { docker exec -i "$name" psql -U postgres -q "$@"; }
psql -v ON_ERROR_STOP=1 < 00_stub.sql
psql -v ON_ERROR_STOP=1 < ../../migrations/20271123020000_lounge_chat.sql
psql < 10_check.sql | grep -E 'FAIL|pass|^ +[0-9]+ \|'
psql < 20_send.sql 2>&1 | grep -v '^ *$\|^ 0000'

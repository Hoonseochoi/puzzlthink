#!/bin/bash
# Backfill the 히든 워드 play log (20271128200000_hidden_word_log.sql) from saved match states: a pg_dump data file of
# hw_games (the 11/27 09:24 snapshot) and the hw_games rows still in the database. Idempotent: every hint and answer
# has a natural key (match, round, turn, position), so running it again adds nothing. Prints the reconciliation:
# matches, hints and answers found in the states vs log rows for those matches.
# Usage: backfill_log.sh <snapshot.sql.gz>            DB_NAME=hw_dev backfill_log.sh ... for the scratch database
set -euo pipefail
SNAP=${1:?usage: backfill_log.sh <hw_games snapshot .sql.gz>}
DB=${DB_CONTAINER:-supabase-db}
NAME=${DB_NAME:-postgres}
psql() { docker exec -i "$DB" psql -U postgres -d "$NAME" -v ON_ERROR_STOP=1 -q "$@"; }

psql -c "create table if not exists public.hw_log_backfill_src (id uuid primary key, user_id uuid, state jsonb not null, created_at timestamptz, updated_at timestamptz);
         alter table public.hw_log_backfill_src enable row level security; truncate public.hw_log_backfill_src;"
# the dump's COPY into hw_games goes into the side table instead (no trigger, nothing else touched)
gzcat "$SNAP" | sed -n '/^COPY public.hw_games /,/^\\\.$/p' | sed '1s/^COPY public.hw_games /COPY public.hw_log_backfill_src /' | psql
# the rows still in hw_games (newer ones, or ones the snapshot missed): their current state wins
psql -c "insert into public.hw_log_backfill_src select id, user_id, state, created_at, updated_at from public.hw_games
         on conflict (id) do update set state = excluded.state, updated_at = excluded.updated_at;"
psql -c "select public.hw_log_state(id, state, coalesce(updated_at, created_at)) from public.hw_log_backfill_src;" > /dev/null
docker exec "$DB" psql -U postgres -d "$NAME" -tA -F' ' -c "
  with st as (
    select s.id, coalesce(sum(jsonb_array_length(coalesce(x.turn -> 'hints', '[]'))) filter (where x.turn ->> 'word' is not null), 0) nh,
                 coalesce(sum(jsonb_array_length(coalesce(x.turn -> 'guesses', '[]'))) filter (where x.turn ->> 'word' is not null), 0) ng
      from public.hw_log_backfill_src s
      left join lateral (select h as turn from jsonb_array_elements(coalesce(s.state -> 'history', '[]')) h
                         union all select s.state -> 't' where s.state ? 't') x on true
     group by s.id),
  m as (select public.hw_log_id(id) mid, nh, ng from st),
  lh as (select match_id, count(*) n from public.hw_log_hints where match_id in (select mid from m) group by 1),
  la as (select match_id, count(*) n from public.hw_log_answers where match_id in (select mid from m) group by 1)
  select 'matches', count(*), 'with play', count(*) filter (where nh + ng > 0),
         'hints in states', sum(nh), 'hint rows', coalesce(sum(lh.n), 0),
         'answers in states', sum(ng), 'answer rows', coalesce(sum(la.n), 0),
         'mismatched matches', count(*) filter (where nh <> coalesce(lh.n, 0) or ng <> coalesce(la.n, 0))
    from m left join lh on lh.match_id = m.mid left join la on la.match_id = m.mid"
psql -c "drop table public.hw_log_backfill_src;"

# 히든 워드: 라이어 — server side

The game runs in Postgres: `supabase/migrations/20271205100000_hidden_word_liar.sql` (tables `hwl_*`, RPCs `hwl_*`,
pg_cron job `hwl-tick` every minute). Browsers only call the RPCs and listen for `realtime.send` pushes
(`hwl-<code>` for rooms, `hwlq-<ticket>` for a queued player). Nothing runs on the Cloudflare Worker.

## Apply / roll back
1. Deploy the client first (it knows the new `lw` icon id).
2. `docker exec -i supabase-db psql -U postgres -d postgres -1 -v ON_ERROR_STOP=1 < supabase/migrations/20271205100000_hidden_word_liar.sql`
   It extends five shared CHECK constraints from their live definitions (game_results, game_plays_daily, piece_grants
   source, profile_icons, stone_choices) and raises if any regexp missed.
3. Roll back: `scripts/hidden-word-liar/rollback.sql` (results already written stay; see its header).

## Test on a scratch database
```bash
docker exec supabase-db createdb -U postgres hwl_dev
docker exec supabase-db sh -c "pg_dump -U postgres -s -d postgres -N cron -N storage -N graphql -N graphql_public -N supabase_functions -N _realtime -N net -N pgsodium -N vault | psql -U postgres -d hwl_dev -q"   # role errors are expected
docker exec supabase-db sh -c "pg_dump -U postgres -a -t public.hw_targets -t public.hw_vocab -t public.hw_hints -d postgres | psql -U postgres -d hwl_dev -q"
docker exec -i supabase-db psql -U postgres -d hwl_dev -1 -v ON_ERROR_STOP=1 < supabase/migrations/20271205100000_hidden_word_liar.sql
docker exec -i supabase-db psql -U postgres -d hwl_dev -q < scripts/hidden-word-liar/test_games.sql
docker exec -i supabase-db psql -U postgres -d hwl_dev -q < scripts/hidden-word-liar/test_queue.sql
```

## Numbers (hwl_cfg)
🔥 cap 85 (a clue at or above shows as 85+, from the play log: players' own-word hints have median 80, and a liar's
strong decoy hints score median 68 on the real answer, so the two overlap). Turn 22 s, talk 45 s (60 s for 7+), vote
20 s, runoff 15 s, liar's guess 30 s, rounds 3 (≤6 players) / 2. Rewards: liar win 3 피스, citizen win 1 (no cap,
owner 11/28), only in a valid game (4+ signed-in players; spoken clues from at least half the seats, min 4 — a game of silence pays nothing).

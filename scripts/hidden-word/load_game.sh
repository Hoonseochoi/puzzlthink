#!/bin/bash
# Step 5: replace the 히든 워드 game data on the self-hosted DB in one transaction.
# Usage: load_game.sh [game dir]   (needs migration 20271126000000_hidden_word.sql applied)
set -euo pipefail
D=${1:-$HOME/puzzlthink-supabase/hidden-word/v2/game}
DB=${DB_CONTAINER:-supabase-db}
for file in hw_vocab.tsv hw_targets.tsv hw_hints.tsv; do
  [ -r "$D/$file" ] || { printf 'Missing export: %s\n' "$D/$file" >&2; exit 1; }
done
{
  echo "begin;"
  echo "truncate public.hw_vocab, public.hw_targets, public.hw_hints;"
  echo "copy public.hw_vocab (word, idx) from stdin;"; cat "$D/hw_vocab.tsv"; echo '\.'
  echo "copy public.hw_targets (word, cluster, scores, feel) from stdin;"; cat "$D/hw_targets.tsv"; echo '\.'
  echo "copy public.hw_hints (target, word, score, fits) from stdin;"; cat "$D/hw_hints.tsv"; echo '\.'
  echo "commit;"
  echo "analyze public.hw_vocab; analyze public.hw_targets; analyze public.hw_hints;"
} | docker exec -i "$DB" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q
docker exec "$DB" psql -U postgres -d postgres -tAc \
  "select 'words', count(*) from public.hw_vocab union all select 'hidden words', count(*) from public.hw_targets union all select 'AI hints', count(*) from public.hw_hints"

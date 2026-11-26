#!/bin/bash
# Step 5: replace the 히든 워드 game data (both levels) in one transaction.
# Usage: load_game.sh [game dir]   DB_NAME=hw_dev load_game.sh ... to load a scratch database instead of the live one.
# Needs 20271126000000_hidden_word.sql and, for a hw_targets.tsv with a level column (build_game.py with levels),
# 20271127000000_hidden_word_levels.sql applied first.
set -euo pipefail
D=${1:-$HOME/puzzlthink-supabase/hidden-word/levels/game}
DB=${DB_CONTAINER:-supabase-db}
NAME=${DB_NAME:-postgres}
for file in hw_vocab.tsv hw_targets.tsv hw_hints.tsv; do
  [ -r "$D/$file" ] || { printf 'Missing export: %s\n' "$D/$file" >&2; exit 1; }
done
cols=$(head -1 "$D/hw_targets.tsv" | awk -F'\t' '{print NF}')
if [ "$cols" = 5 ]; then
  has=$(docker exec "$DB" psql -U postgres -d "$NAME" -tAc "select count(*) from information_schema.columns where table_schema = 'public' and table_name = 'hw_targets' and column_name = 'level'")
  [ "$has" = 1 ] || { echo 'hw_targets has no level column: apply 20271127000000_hidden_word_levels.sql first' >&2; exit 1; }
  target_cols='word, cluster, scores, feel, level'
else
  target_cols='word, cluster, scores, feel'
fi
{
  echo "begin;"
  echo "truncate public.hw_vocab, public.hw_targets, public.hw_hints;"
  echo "copy public.hw_vocab (word, idx) from stdin;"; cat "$D/hw_vocab.tsv"; echo '\.'
  echo "copy public.hw_targets ($target_cols) from stdin;"; cat "$D/hw_targets.tsv"; echo '\.'
  echo "copy public.hw_hints (target, word, score, fits) from stdin;"; cat "$D/hw_hints.tsv"; echo '\.'
  echo "commit;"
  echo "analyze public.hw_vocab; analyze public.hw_targets; analyze public.hw_hints;"
} | docker exec -i "$DB" psql -U postgres -d "$NAME" -v ON_ERROR_STOP=1 -q
if [ "$cols" = 5 ]; then
  docker exec "$DB" psql -U postgres -d "$NAME" -tAc \
    "select 'words', count(*) from public.hw_vocab union all select 'hidden words ' || level, count(*) from public.hw_targets group by level union all select 'AI hints', count(*) from public.hw_hints"
else
  docker exec "$DB" psql -U postgres -d "$NAME" -tAc \
    "select 'words', count(*) from public.hw_vocab union all select 'hidden words', count(*) from public.hw_targets union all select 'AI hints', count(*) from public.hw_hints"
fi

#!/usr/bin/env bash
# Every rule set × AI pairing, fixed seeds. Appends one JSON line per run to reports/flip-omok-rules/sim-results.jsonl.
#   scripts/flip-omok/run-all.sh [rule ids...]   (default: all)   WORKERS=5
set -euo pipefail
cd "$(dirname "$0")/../.."
OUT=reports/flip-omok-rules/sim-results.jsonl
W="${WORKERS:-5}"
RULES=("$@")
[ ${#RULES[@]} -eq 0 ] && RULES=(liveai live c2 c3 c5 c3lock c3lockfive c2lockfive c3last c3fivelast earn line lock short post c3line)
for r in "${RULES[@]}"; do
  [ "${SKIP_NN:-}" = "$r" ] || npx tsx scripts/flip-omok/sim.ts "$r" normal normal 1000 1000000 "$W" >> "$OUT"
  npx tsx scripts/flip-omok/sim.ts "$r" hard hard 400 2000000 "$W" >> "$OUT"
  npx tsx scripts/flip-omok/sim.ts "$r" normal hard 300 3000000 "$W" >> "$OUT"
  npx tsx scripts/flip-omok/sim.ts "$r" hard normal 300 4000000 "$W" >> "$OUT"
  echo "done $r" >&2
done

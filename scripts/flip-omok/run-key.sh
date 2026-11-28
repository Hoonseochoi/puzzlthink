#!/usr/bin/env bash
# The short list again with the steadier comeback measure, and the recommended set with the AI valuing a charge
# lower / higher (CHARGE_VALUE) to see how much its saving habit moves the numbers.
# Appends to reports/flip-omok-rules/sim-key.jsonl.   WORKERS=4
set -euo pipefail
cd "$(dirname "$0")/../.."
OUT=reports/flip-omok-rules/sim-key.jsonl
W="${WORKERS:-4}"
for r in liveai c3lock c3last earn lock c3lockfive; do
  npx tsx scripts/flip-omok/sim.ts "$r" normal normal 600 5000000 "$W" >> "$OUT"
  npx tsx scripts/flip-omok/sim.ts "$r" hard hard 200 6000000 "$W" >> "$OUT"
done
for cv in 200 800; do
  CHARGE_VALUE=$cv npx tsx scripts/flip-omok/sim.ts c3lock normal normal 600 5000000 "$W" | sed "s/\"rules\":\"c3lock\"/\"rules\":\"c3lock-cv$cv\"/" >> "$OUT"
  CHARGE_VALUE=$cv npx tsx scripts/flip-omok/sim.ts c3lock hard hard 200 6000000 "$W" | sed "s/\"rules\":\"c3lock\"/\"rules\":\"c3lock-cv$cv\"/" >> "$OUT"
done
echo done-key >&2

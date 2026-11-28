// Side-by-side table of the simulation results: `npx tsx scripts/flip-omok/table.ts [results.jsonl]`
// Pools each rule set's runs (보통·보통, 어려움·어려움, and the mixed pairings), weighting by games played.
import { readFileSync } from 'node:fs';

const file = process.argv[2] ?? 'reports/flip-omok-rules/sim-results.jsonl';
type Row = Record<string, number | string | null>;
const rows: Row[] = readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));

const KEYS: [string, string, number][] = [
  ['plies', '수(평균)', 1], ['redWin', '선공 승률', 3], ['draw', '무승부', 3],
  ['flipMovesPerGame', '뒤집기 수/판', 1], ['flipsPerGame', '뒤집힌 돌/판', 1], ['flipsPerMove', '돌/수', 2],
  ['changesPerStone', '돌당 색 변경', 2], ['stonesChanged2plus', '2번+ 바뀐 돌', 3], ['boardFlippedShareP95', '최악 5% 판 뒤집힘', 2],
  ['fourBrokenPerGame', '4 깨짐/판', 2], ['threeBrokenPerGame', '열린3 깨짐/판', 2], ['winUsesFlipped', '승리 5목에 뒤집힌 돌', 2],
  ['winByFlipMove', '뒤집기로 완성한 5목', 2], ['voidFivesPerGame', '무효 5목/판', 2],
  ['unusedChargesShare', '남긴 뒤집기(명)', 2], ['swingRatio', '뒤집기 한 방 크기(보통 수 대비)', 1],
  ['winnerFlipInLast3', '마지막 3수 안 승자 뒤집기', 2], ['comeback', '역전률(15수)', 2],
];

function pooled(rs: Row[], key: string): number | null {
  let sum = 0, w = 0;
  for (const r of rs) {
    let v = r[key] as number | null;
    if (key === 'swingRatio') v = (r.quietGainMean as number) ? (r.swingMean as number) / (r.quietGainMean as number) : null;
    if (v === null || v === undefined || Number.isNaN(v)) continue;
    const n = key === 'comeback' ? (r.comebackBase as number) : (r.games as number);
    sum += v * n; w += n;
  }
  return w ? sum / w : null;
}

const pairs = process.argv.includes('--by-pair');
const groups = new Map<string, Row[]>();
for (const r of rows) {
  const k = pairs ? `${r.rules} ${r.red}/${r.blue}` : String(r.rules);
  groups.set(k, [...(groups.get(k) ?? []), r]);
}
console.log(`| 규칙 | 판 | ${KEYS.map((k) => k[1]).join(' | ')} |`);
console.log(`|---|---|${KEYS.map(() => '---').join('|')}|`);
for (const [k, rs] of groups) {
  const games = rs.reduce((a, r) => a + (r.games as number), 0);
  console.log(`| ${k} | ${games} | ${KEYS.map(([key, , d]) => { const v = pooled(rs, key); return v === null ? '–' : v.toFixed(d); }).join(' | ')} |`);
}

// AI vs AI for 레이저 장기: `npx tsx scripts/laser-janggi/arena.ts [games per pairing]`
// Pairings among 쉬움/보통/어려움 and the previous AI ("old"); colours alternate. Prints win rates and move times.
import { applyLaserAction, chooseLaserAiActionLegacy, initialLaserPieces, type LaserOwner } from '../../src/lib/laserJanggi';
import { thinkLaser } from '../../src/lib/laserJanggiAi';

type Lv = 'easy' | 'normal' | 'hard' | 'old';
const n = Number(process.argv[2] ?? 10);
const pairs = (process.argv[3] ?? 'hard-normal,hard-easy,normal-easy,easy-old,hard-old').split(',').map((p) => p.split('-') as [Lv, Lv]);
const times: Record<string, number[]> = {};
function pick(lv: Lv, pieces: ReturnType<typeof initialLaserPieces>, side: LaserOwner) {
  const t0 = performance.now();
  const a = lv === 'old' ? chooseLaserAiActionLegacy(pieces, side, 'hard') : thinkLaser(pieces, side, lv)?.action ?? null;
  (times[lv] ??= []).push(performance.now() - t0);
  return a;
}
for (const [x, y] of pairs) {
  const score = { [x]: 0, [y]: 0, draw: 0 } as Record<string, number>;
  let plies = 0;
  for (let g = 0; g < n; g += 1) {
    const lv: [Lv, Lv] = g % 2 ? [y, x] : [x, y];
    let pieces = initialLaserPieces(); let cur: LaserOwner = 0; let res = 'draw';
    for (let t = 1; t <= 200; t += 1) {
      const a = pick(lv[cur], pieces, cur);
      if (!a) break;
      const r = applyLaserAction(pieces, cur, a);
      if (!r) throw new Error(`illegal ${JSON.stringify(a)}`);
      pieces = r.pieces; plies += 1;
      if (r.winner !== null) { res = lv[r.winner]; break; }
      cur = (1 - cur) as LaserOwner;
    }
    score[res] += 1;
  }
  console.log(`${x} vs ${y}: ${x} ${score[x]}, ${y} ${score[y]}, draw ${score.draw} (avg ${(plies / n).toFixed(0)} plies)`);
}
for (const [lv, ts] of Object.entries(times)) { ts.sort((a, b) => a - b); console.log(`${lv}: median ${ts[ts.length >> 1].toFixed(0)} ms, p95 ${ts[Math.floor(ts.length * 0.95)].toFixed(0)} ms, max ${ts[ts.length - 1].toFixed(0)} ms`); }

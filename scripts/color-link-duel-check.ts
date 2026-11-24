// Solver checks for 컬러 링크: `npx tsx scripts/color-link-duel-check.ts [boards]`
// Random boards are solved by the real solver and by a plain brute-force search; the answers must agree,
// and every line set the solver returns must pass the proof checker.
import { CLD_CELLS, CLD_COLORS, CLD_MIN, adjacent, checkProof, cldNeighbors, emptyBoard, solve, stonesOf } from '../src/lib/colorLinkDuel';
import { rng } from '../src/lib/colorlink';

function brute(board: number[], cap: number): 'ok' | 'none' | 'unknown' {
  const st = stonesOf(board);
  const colors = st.flatMap((s, k) => (k && s.length ? [k] : []));
  const occ = board.slice();
  let nodes = 0;
  const go = (ci: number): boolean | null => {
    if (ci === colors.length) return true;
    const k = colors[ci], s = st[k];
    const path = [s[0]];
    const ext = (): boolean | null => {
      if (++nodes > cap) return null;
      const head = path[path.length - 1];
      if (s.length === 1 && path.length >= CLD_MIN) { const r = go(ci + 1); if (r !== false) return r; }
      for (const j of cldNeighbors[head]) {
        if (s.length === 2 && j === s[1]) { if (path.length + 1 >= CLD_MIN) { const r = go(ci + 1); if (r !== false) return r; } continue; }
        if (occ[j]) continue;
        occ[j] = k; path.push(j);
        const r = ext();
        path.pop(); occ[j] = 0;
        if (r !== false) return r;
      }
      return false;
    };
    return ext();
  };
  const r = go(0);
  return r === null ? 'unknown' : r ? 'ok' : 'none';
}

const total = Number(process.argv[2] ?? 300);
const rand = rng(Number(process.argv[3] ?? 7));
let agree = 0, skipped = 0, worst = 0, sumNodes = 0, oks = 0, nones = 0, unk = 0;
const t0 = Date.now();
for (let b = 0; b < total; b++) {
  const board = emptyBoard();
  const stones = 3 + Math.floor(rand() * 12);
  for (let s = 0; s < stones; s++) {
    let cell; do cell = Math.floor(rand() * CLD_CELLS); while (board[cell]);
    const left = Array.from({ length: CLD_COLORS }, (_, i) => i + 1).filter((k) => board.filter((v) => v === k).length < 2);
    // Prefer finishing colours already down half the time.
    const lone = left.filter((k) => board.includes(k));
    board[cell] = lone.length && rand() < 0.5 ? lone[Math.floor(rand() * lone.length)] : left.filter((k) => !board.includes(k))[0] ?? left[0];
  }
  const t1 = Date.now();
  const res = solve(board, { cap: 2_000_000 });
  worst = Math.max(worst, Date.now() - t1); sumNodes += res.nodes;
  if (res.status === 'ok') { oks++; const chk = checkProof(board, res.paths); if (!chk.ok) { console.log('BAD PROOF', JSON.stringify(board), chk); process.exit(1); } }
  else if (res.status === 'none') nones++; else unk++;
  const bf = brute(board, 3_000_000);
  if (bf === 'unknown' || res.status === 'unknown') { skipped++; continue; }
  if (bf !== res.status) { console.log('MISMATCH', res.status, bf, JSON.stringify(board)); process.exit(1); }
  agree++;
}
void adjacent;
console.log({ total, agree, skipped, oks, nones, unk, worstMs: worst, avgNodes: Math.round(sumNodes / total), ms: Date.now() - t0 });

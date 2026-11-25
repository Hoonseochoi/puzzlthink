// Drawing lines for a 컬러 링크 proof with a finger: start on a stone (or on a line to continue or cut it),
// drag through cells, back up to erase. Crossing another colour's line cuts that line. Pure helpers.
import { CLD_CELLS, CLD_MIN, CLD_N, type CldPaths, adjacent, colOf, rowOf, stonesOf } from './colorLinkDuel';

export const emptyPaths = (): CldPaths => Array(15).fill(null);
const copy = (paths: CldPaths): CldPaths => Array.from({ length: 15 }, (_, k) => (paths[k] ? [...paths[k]!] : null));

/** Starts a stroke at `cell`: the colour drawn, and the lines with that colour's line reset or cut there. */
export function strokeStart(board: ArrayLike<number>, paths: CldPaths, cell: number): { color: number; paths: CldPaths } | null {
  const k = board[cell];
  if (k < 0) return null; // outside the board
  const next = copy(paths);
  if (k) {
    const p = next[k];
    // Grabbing the loose end of this colour's line carries on from there; grabbing a stone redraws from it.
    if (p && p.length > 1 && p[p.length - 1] === cell && p[0] !== cell) return { color: k, paths: next };
    next[k] = [cell];
    return { color: k, paths: next };
  }
  for (let c = 1; c < next.length; c++) {
    const p = next[c];
    const i = p ? p.indexOf(cell) : -1;
    if (i > 0) { next[c] = p!.slice(0, i + 1); return { color: c, paths: next }; }
  }
  return null;
}

/** Moves the stroke of `color` to `cell` (stepping cell by cell when the finger skipped some). */
export function strokeTo(board: ArrayLike<number>, paths: CldPaths, color: number, cell: number): CldPaths {
  let next = paths;
  for (let guard = 0; guard < 14; guard++) {
    const p = next[color];
    if (!p || !p.length) return next;
    const head = p[p.length - 1];
    if (head === cell) return next;
    const step = adjacent(head, cell) ? cell : towards(head, cell);
    const after = stepTo(board, next, color, step);
    if (after === next) return next;
    next = after;
  }
  return next;
}

function towards(from: number, to: number) {
  const dr = rowOf(to) - rowOf(from), dc = colOf(to) - colOf(from);
  if (Math.abs(dr) >= Math.abs(dc)) return from + Math.sign(dr) * CLD_N;
  return from + Math.sign(dc);
}

function stepTo(board: ArrayLike<number>, paths: CldPaths, color: number, cell: number): CldPaths {
  if (cell < 0 || cell >= CLD_CELLS) return paths;
  const p = paths[color]!;
  const head = p[p.length - 1];
  // Back over the line: erase to there.
  const back = p.indexOf(cell);
  if (back >= 0) { const next = copy(paths); next[color] = p.slice(0, back + 1); return next; }
  const stones = stonesOf(board)[color];
  // A finished line (reached the partner) does not run on.
  if (stones.length === 2 && p.length > 1 && head !== p[0] && stones.includes(head)) return paths;
  if (board[cell]) {
    if (stones.length === 2 && board[cell] === color && cell !== p[0]) { const next = copy(paths); next[color] = [...p, cell]; return next; }
    return paths;
  }
  const next = copy(paths);
  for (let c = 1; c < next.length; c++) {
    if (c === color || !next[c]) continue;
    const i = next[c]!.indexOf(cell);
    if (i >= 0) next[c] = next[c]!.slice(0, i);
    if (next[c] && !next[c]!.length) next[c] = null;
  }
  next[color] = [...p, cell];
  return next;
}

/** Per colour on the board: 'done' (a full line), or how many cells its line has. */
export function lineStatus(board: ArrayLike<number>, paths: CldPaths): { color: number; cells: number; done: boolean }[] {
  const stones = stonesOf(board);
  const out: { color: number; cells: number; done: boolean }[] = [];
  for (let k = 1; k < stones.length; k++) {
    if (!stones[k].length) continue;
    const p = paths[k] ?? [];
    const ends = stones[k].length === 2 ? p.length > 1 && stones[k].includes(p[p.length - 1]) && p[p.length - 1] !== p[0] : p.length > 0;
    out.push({ color: k, cells: p.length, done: ends && p.length >= CLD_MIN });
  }
  return out;
}

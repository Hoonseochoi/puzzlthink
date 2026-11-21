// 노노그램 (Nonogram, 네모로직): fill cells so each row and column shows the runs its numbers list, in order.
// Boards are mirror-symmetric pixel pictures, kept only when pure line-by-line logic finds the whole picture
// (so there is exactly one answer and no guessing is needed).
//
// Self-contained (no imports) so `scripts/logic-pool.ts` can run it in Node to build the puzzle pool.

/** Board sizes, in cells per side. Challenge boards are CHALLENGE_SIZE. */
export const NONO_SIZES = [5, 10, 15] as const;
export type NonoSize = (typeof NONO_SIZES)[number];
export const NONO_CHALLENGE_SIZE = 15;

/** Cell state while playing: 0 empty, 1 filled, 2 marked ✕. */
export type Cell = 0 | 1 | 2;
export type Clues = { rows: number[][]; cols: number[][] };
export type NonoPuzzle = { id: number; size: number; clues: Clues };

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The runs of filled cells in a line, e.g. [1,1,0,1] → [2, 1]. An empty line is []. */
export function runs(line: ArrayLike<number>): number[] {
  const out: number[] = [];
  let k = 0;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === 1) k++;
    else if (k) { out.push(k); k = 0; }
  }
  if (k) out.push(k);
  return out;
}

export function cluesOf(size: number, grid: ArrayLike<number>): Clues {
  const rows: number[][] = [], cols: number[][] = [];
  for (let r = 0; r < size; r++) rows.push(runs(Array.from({ length: size }, (_, c) => grid[r * size + c])));
  for (let c = 0; c < size; c++) cols.push(runs(Array.from({ length: size }, (_, r) => grid[r * size + c])));
  return { rows, cols };
}

const same = (a: number[], b: number[]) => a.length === b.length && a.every((v, i) => v === b[i]);

/** Solved when every row and column shows its numbers (✕ marks count as empty). */
export function isSolved(p: NonoPuzzle, cells: ArrayLike<number>): boolean {
  const got = cluesOf(p.size, Array.from({ length: p.size * p.size }, (_, i) => (cells[i] === 1 ? 1 : 0)));
  return got.rows.every((r, i) => same(r, p.clues.rows[i])) && got.cols.every((c, i) => same(c, p.clues.cols[i]));
}

/** Which rows / columns already match their numbers exactly (the numbers dim when done). */
export function doneLines(p: NonoPuzzle, cells: ArrayLike<number>): { rows: boolean[]; cols: boolean[] } {
  const n = p.size;
  const line = (get: (i: number) => number) => runs(Array.from({ length: n }, (_, i) => (get(i) === 1 ? 1 : 0)));
  return {
    rows: p.clues.rows.map((want, r) => same(line((c) => cells[r * n + c]), want)),
    cols: p.clues.cols.map((want, c) => same(line((r) => cells[r * n + c]), want)),
  };
}

export const encodeCells = (cells: ArrayLike<number>, count: number) => Array.from({ length: count }, (_, i) => (cells[i] === 1 ? '1' : '0')).join('');

// ── Line solver: which cells every arrangement of the runs agrees on ──

/**
 * `known`: −1 unknown, 0 empty, 1 filled. Returns the line with every forced cell filled in, or null when no
 * arrangement fits. Dynamic programming over (cell, runs placed), forwards and backwards.
 */
export function solveLine(known: Int8Array, clue: number[]): Int8Array | null {
  const n = known.length, k = clue.length;
  // A virtual empty cell at the end lets every run be followed by a gap.
  const cell = (i: number) => (i === n ? 0 : known[i]);
  const zeros = new Int32Array(n + 2);
  for (let i = 0; i < n; i++) zeros[i + 1] = zeros[i] + (known[i] === 0 ? 1 : 0);
  const fits = (i: number, len: number) => i + len <= n && zeros[i + len] - zeros[i] === 0 && cell(i + len) !== 1;
  const W = k + 1;
  const back = new Uint8Array((n + 2) * W);
  back[(n + 1) * W + k] = 1;
  for (let i = n; i >= 0; i--) for (let j = k; j >= 0; j--) {
    let ok = cell(i) !== 1 && back[(i + 1) * W + j] === 1;
    if (!ok && j < k && fits(i, clue[j])) ok = back[(i + clue[j] + 1) * W + j + 1] === 1;
    back[i * W + j] = ok ? 1 : 0;
  }
  if (!back[0]) return null;
  const fwd = new Uint8Array((n + 2) * W);
  fwd[0] = 1;
  const canFill = new Uint8Array(n), canEmpty = new Uint8Array(n);
  for (let i = 0; i <= n; i++) for (let j = 0; j <= k; j++) {
    if (!fwd[i * W + j]) continue;
    if (cell(i) !== 1 && back[(i + 1) * W + j]) { fwd[(i + 1) * W + j] = 1; if (i < n) canEmpty[i] = 1; }
    if (j < k && fits(i, clue[j]) && back[(i + clue[j] + 1) * W + j + 1]) {
      fwd[(i + clue[j] + 1) * W + j + 1] = 1;
      for (let x = i; x < i + clue[j]; x++) canFill[x] = 1;
      if (i + clue[j] < n) canEmpty[i + clue[j]] = 1;
    }
  }
  const out = new Int8Array(n);
  for (let i = 0; i < n; i++) {
    if (!canFill[i] && !canEmpty[i]) return null;
    out[i] = canFill[i] && canEmpty[i] ? -1 : canFill[i] ? 1 : 0;
  }
  return out;
}

/** Solves by lines alone. Returns the grid (−1 where logic got stuck) or null on a contradiction. */
export function solveByLines(size: number, clues: Clues): Int8Array | null {
  const g = new Int8Array(size * size).fill(-1);
  const dirty = new Uint8Array(size * 2).fill(1);
  let changed = true;
  while (changed) {
    changed = false;
    for (let L = 0; L < size * 2; L++) {
      if (!dirty[L]) continue;
      dirty[L] = 0;
      const row = L < size, idx = row ? L : L - size;
      const at = (i: number) => (row ? idx * size + i : i * size + idx);
      const line = Int8Array.from({ length: size }, (_, i) => g[at(i)]);
      const next = solveLine(line, row ? clues.rows[idx] : clues.cols[idx]);
      if (!next) return null;
      for (let i = 0; i < size; i++) if (next[i] !== line[i]) {
        g[at(i)] = next[i];
        dirty[row ? size + i : i] = 1;
        changed = true;
      }
    }
  }
  return g;
}

// ── Generation ──

/** Density by size: small boards a little fuller so they read as pictures. */
const FILL: Record<number, number> = { 5: 0.6, 10: 0.56, 15: 0.55 };

/** One mirror-symmetric picture that line logic solves completely (so it has exactly one answer). */
export function generate(size: number, seed: number): { grid: number[]; clues: Clues } {
  const rand = rng(seed);
  for (let attempt = 0; attempt < 4000; attempt++) {
    const p = (FILL[size] ?? 0.55) + (rand() - 0.5) * 0.08;
    const half = Math.ceil(size / 2);
    const grid = new Array<number>(size * size).fill(0);
    // Mostly mirrored (pixel-art look); a few cells break the mirror so the picture is not perfectly even.
    for (let r = 0; r < size; r++) for (let c = 0; c < half; c++) {
      const v = rand() < p ? 1 : 0;
      grid[r * size + c] = v;
      grid[r * size + size - 1 - c] = v;
    }
    const flips = Math.floor(size * size * 0.04);
    for (let i = 0; i < flips; i++) { const j = Math.floor(rand() * size * size); grid[j] ^= 1; }
    if (grid.every((v) => v === 0)) continue;
    const clues = cluesOf(size, grid);
    const solved = solveByLines(size, clues);
    if (solved && solved.every((v, i) => v === grid[i])) return { grid, clues };
  }
  throw new Error('no nonogram');
}

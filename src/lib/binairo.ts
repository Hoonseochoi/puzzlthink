// 비나이로 (Binairo / Takuzu): fill an even N×N grid with black and white stones.
// - No three of the same colour in a row, across or down.
// - Every row and every column holds as many black as white stones.
// - Some cells start filled; "=" between two cells means same colour, "×" means different.
// Boards are built from a random full grid: clues are removed one by one while a solver still finds exactly one answer.
//
// Self-contained (no imports) so `scripts/logic-pool.ts` can run it in Node to build the puzzle pool.

export const BINAIRO_SIZES = [6, 8, 10] as const;
export const BINAIRO_CHALLENGE_SIZE = 8;

/** Cell values: 0 empty, 1 black, 2 white. */
export type Sign = { a: number; b: number; same: boolean };
export type BinairoPuzzle = { size: number; givens: number[]; signs: Sign[] };

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

const shuffle = <T,>(list: T[], rand: () => number) => {
  for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
  return list;
};

/** Cells breaking a rule: part of three in a line, in a line with too many of one colour, or against a sign. */
export function conflicts(p: BinairoPuzzle, cells: ArrayLike<number>): Set<number> {
  const n = p.size, bad = new Set<number>();
  const line = (idx: number[]) => {
    for (let k = 0; k + 2 < n; k++) {
      const v = cells[idx[k]];
      if (v && cells[idx[k + 1]] === v && cells[idx[k + 2]] === v) { bad.add(idx[k]); bad.add(idx[k + 1]); bad.add(idx[k + 2]); }
    }
    for (const colour of [1, 2]) {
      const mine = idx.filter((i) => cells[i] === colour);
      if (mine.length > n / 2) mine.forEach((i) => bad.add(i));
    }
  };
  for (let r = 0; r < n; r++) line(Array.from({ length: n }, (_, c) => r * n + c));
  for (let c = 0; c < n; c++) line(Array.from({ length: n }, (_, r) => r * n + c));
  for (const s of p.signs) {
    const x = cells[s.a], y = cells[s.b];
    if (x && y && (x === y) !== s.same) { bad.add(s.a); bad.add(s.b); }
  }
  return bad;
}

export function isSolved(p: BinairoPuzzle, cells: ArrayLike<number>): boolean {
  for (let i = 0; i < p.size * p.size; i++) {
    if (cells[i] !== 1 && cells[i] !== 2) return false;
    if (p.givens[i] && p.givens[i] !== cells[i]) return false;
  }
  return conflicts(p, cells).size === 0;
}

/**
 * Counts answers up to `limit` (`limit` 0: logic only, 1 when propagation alone fills the board): line propagation (pairs, gaps, counts, signs), then a guess on the first empty cell.
 * `cap` bounds the work; hitting it reports `limit` (treated as "not unique").
 */
export function countSolutions(p: BinairoPuzzle, limit = 2, cap = 20_000): { count: number; sol: number[] | null } {
  const n = p.size, half = n / 2;
  const lines: number[][] = [];
  for (let r = 0; r < n; r++) lines.push(Array.from({ length: n }, (_, c) => r * n + c));
  for (let c = 0; c < n; c++) lines.push(Array.from({ length: n }, (_, r) => r * n + c));
  let count = 0, nodes = 0;
  let sol: number[] | null = null;
  const other = (v: number) => (v === 1 ? 2 : 1);

  // Returns false on a contradiction; fills forced cells in place.
  const propagate = (g: number[]): boolean => {
    for (let changed = true; changed;) {
      changed = false;
      const set = (i: number, v: number) => {
        if (g[i] === v) return true;
        if (g[i]) return false;
        g[i] = v; changed = true; return true;
      };
      for (const idx of lines) {
        let b = 0, w = 0;
        for (const i of idx) { if (g[i] === 1) b++; else if (g[i] === 2) w++; }
        if (b > half || w > half) return false;
        if (b === half || w === half) {
          const fill = b === half ? 2 : 1;
          for (const i of idx) if (!g[i] && !set(i, fill)) return false;
        }
        for (let k = 0; k + 2 < n; k++) {
          const [x, y, z] = [g[idx[k]], g[idx[k + 1]], g[idx[k + 2]]];
          if (x && x === y && x === z) return false;
          if (x && x === y && !z && !set(idx[k + 2], other(x))) return false;
          if (y && y === z && !x && !set(idx[k], other(y))) return false;
          if (x && x === z && !y && !set(idx[k + 1], other(x))) return false;
        }
      }
      for (const s of p.signs) {
        const x = g[s.a], y = g[s.b];
        if (x && y && (x === y) !== s.same) return false;
        if (x && !y && !set(s.b, s.same ? x : other(x))) return false;
        if (y && !x && !set(s.a, s.same ? y : other(y))) return false;
      }
    }
    return true;
  };

  if (limit === 0) {
    // Logic only: propagation must fill the whole board, no guessing.
    const g = p.givens.slice();
    return propagate(g) && g.indexOf(0) < 0 ? { count: 1, sol: g } : { count: 0, sol: null };
  }
  const rec = (g: number[]) => {
    if (count >= limit) return;
    if (++nodes > cap) { count = limit; return; }
    if (!propagate(g)) return;
    const empty = g.indexOf(0);
    if (empty < 0) {
      count++;
      if (!sol) sol = g.slice();
      return;
    }
    for (const v of [1, 2]) { const next = g.slice(); next[empty] = v; rec(next); if (count >= limit) return; }
  };
  rec(p.givens.slice());
  return { count, sol };
}

/** A random full grid that keeps both rules (backtracking, cells in reading order). */
function fullGrid(n: number, rand: () => number): number[] {
  const g = new Array<number>(n * n).fill(0);
  const half = n / 2;
  const ok = (i: number, v: number) => {
    const r = Math.floor(i / n), c = i % n;
    if (c >= 2 && g[i - 1] === v && g[i - 2] === v) return false;
    if (r >= 2 && g[i - n] === v && g[i - 2 * n] === v) return false;
    let row = 0, col = 0;
    for (let k = 0; k < c; k++) if (g[r * n + k] === v) row++;
    for (let k = 0; k < r; k++) if (g[k * n + c] === v) col++;
    return row < half && col < half;
  };
  const rec = (i: number): boolean => {
    if (i === n * n) return true;
    for (const v of rand() < 0.5 ? [1, 2] : [2, 1]) {
      if (!ok(i, v)) continue;
      g[i] = v;
      if (rec(i + 1)) return true;
      g[i] = 0;
    }
    return false;
  };
  rec(0);
  return g;
}

/** Board for (size, seed): givens, signs and the answer (1 black, 2 white). Deterministic. */
export function generate(n: number, seed: number): { givens: number[]; signs: Sign[]; answer: number[] } {
  const rand = rng(seed * 17 + n);
  const answer = fullGrid(n, rand);
  // Start from every cell given plus signs on about a quarter of the neighbouring pairs.
  const pairs: Sign[] = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const i = r * n + c;
    if (c < n - 1) pairs.push({ a: i, b: i + 1, same: answer[i] === answer[i + 1] });
    if (r < n - 1) pairs.push({ a: i, b: i + n, same: answer[i] === answer[i + n] });
  }
  let signs = shuffle(pairs, rand).slice(0, Math.round(pairs.length * 0.22));
  const givens = answer.slice();
  // Remove givens first (they are the strongest clue), then signs, while logic alone still fills the board
  // (so the answer is unique and never needs a guess).
  for (const i of shuffle(Array.from({ length: n * n }, (_, k) => k), rand)) {
    const keep = givens[i];
    givens[i] = 0;
    if (countSolutions({ size: n, givens, signs }, 0).count !== 1) givens[i] = keep;
  }
  for (const s of shuffle(signs.slice(), rand)) {
    const rest = signs.filter((x) => x !== s);
    if (countSolutions({ size: n, givens, signs: rest }, 0).count === 1) signs = rest;
  }
  return { givens, signs, answer };
}

/** The answer as a string of 1 (black) and 2 (white), the form the server stores. */
export const encodeCells = (cells: ArrayLike<number>) => Array.from(cells, (v) => (v === 1 ? '1' : v === 2 ? '2' : '0')).join('');

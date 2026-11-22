// 스타배틀 (Star Battle, one star): an N×N grid cut into N coloured regions. Place one stone in every row,
// every column and every region; no two stones may touch, not even at a corner.
// Boards are built from a planted answer: regions grow from its stones, then cells are traded between regions
// until a solver finds that answer and no other (the planted answer stays valid at every step).
//
// Self-contained (no imports) so `scripts/logic-pool.ts` can run it in Node to build the puzzle pool.

/** Board sizes, in cells per side. Challenge boards are STAR_CHALLENGE_SIZE. */
export const STAR_SIZES = [6, 8, 10] as const;
export const STAR_CHALLENGE_SIZE = 10;

/** Region tints: the PUZZLTHINK stone palette, softened so the stones stand out on top. */
export const STAR_TINTS = ['#ff9e8f', '#ffc56b', '#ffe56b', '#8fe3a0', '#7fd9d0', '#9cc2ff', '#c3a8ff', '#ff9fcf', '#d9cdb8', '#bde07a'];

/** Cell state while playing: 0 empty, 1 stone, 2 marked ✕. */
export type StarPuzzle = { id: number; size: number; regions: number[] };

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

/** Cells whose stone breaks a rule: two in a row / column / region, or touching another stone. */
export function conflicts(p: StarPuzzle, marks: ArrayLike<number>): Set<number> {
  const n = p.size;
  const bad = new Set<number>();
  const stones: number[] = [];
  for (let i = 0; i < n * n; i++) if (marks[i] === 1) stones.push(i);
  for (let a = 0; a < stones.length; a++) {
    for (let b = a + 1; b < stones.length; b++) {
      const i = stones[a], j = stones[b];
      const ri = Math.floor(i / n), ci = i % n, rj = Math.floor(j / n), cj = j % n;
      if (ri === rj || ci === cj || p.regions[i] === p.regions[j] || (Math.abs(ri - rj) <= 1 && Math.abs(ci - cj) <= 1)) { bad.add(i); bad.add(j); }
    }
  }
  return bad;
}

/** Rows, columns and regions that hold exactly one stone (for the "done" glow). */
export function doneSets(p: StarPuzzle, marks: ArrayLike<number>) {
  const n = p.size;
  const rows = new Array<number>(n).fill(0), cols = new Array<number>(n).fill(0), regs = new Array<number>(n).fill(0);
  for (let i = 0; i < n * n; i++) if (marks[i] === 1) { rows[Math.floor(i / n)]++; cols[i % n]++; regs[p.regions[i]]++; }
  return { rows: rows.map((k) => k === 1), cols: cols.map((k) => k === 1), regions: regs.map((k) => k === 1) };
}

export function isSolved(p: StarPuzzle, marks: ArrayLike<number>): boolean {
  let count = 0;
  for (let i = 0; i < p.size * p.size; i++) if (marks[i] === 1) count++;
  return count === p.size && conflicts(p, marks).size === 0;
}

/**
 * Counts solutions up to `limit` (row by row: a free column, not next to the row above, in an unused region).
 * `cap` bounds the work; a search that hits it reports `limit` (treated as "not unique").
 */
export function countSolutions(n: number, regions: ArrayLike<number>, limit = 2, cap = 200_000): { count: number; sol: number[] | null; other: number[] | null } {
  let count = 0, nodes = 0;
  const pick = new Array<number>(n).fill(-1);
  let sol: number[] | null = null, other: number[] | null = null;
  const rec = (r: number, cols: number, regs: number) => {
    if (count >= limit) return;
    if (++nodes > cap) { count = limit; return; }
    if (r === n) {
      count++;
      if (!sol) sol = pick.slice(); else if (!other) other = pick.slice();
      return;
    }
    const prev = r ? pick[r - 1] : -9;
    for (let c = 0; c < n; c++) {
      if (cols & (1 << c) || Math.abs(c - prev) <= 1) continue;
      const g = regions[r * n + c];
      if (regs & (1 << g)) continue;
      pick[r] = c;
      rec(r + 1, cols | (1 << c), regs | (1 << g));
      if (count >= limit) return;
    }
    pick[r] = -1;
  };
  rec(0, 0, 0);
  return { count, sol, other };
}

/** A random column per row: all different, and neighbouring rows never one column apart. */
function plant(n: number, rand: () => number): number[] {
  const cols = new Array<number>(n).fill(-1);
  const used = new Array<boolean>(n).fill(false);
  const rec = (r: number): boolean => {
    if (r === n) return true;
    // Fisher–Yates (never sort with a random comparator: engines call it a different number of times).
    const order = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    for (const c of order) {
      if (used[c] || (r && Math.abs(c - cols[r - 1]) <= 1)) continue;
      used[c] = true; cols[r] = c;
      if (rec(r + 1)) return true;
      used[c] = false;
    }
    return false;
  };
  rec(0);
  return cols;
}

const neighbours = (n: number, i: number) => {
  const r = Math.floor(i / n), c = i % n;
  const out: number[] = [];
  if (r > 0) out.push(i - n);
  if (r < n - 1) out.push(i + n);
  if (c > 0) out.push(i - 1);
  if (c < n - 1) out.push(i + 1);
  return out;
};

/** Whether region g stays in one piece without cell `skip`. */
function connectedWithout(n: number, regions: number[], g: number, skip: number): boolean {
  let start = -1, total = 0;
  for (let i = 0; i < n * n; i++) if (regions[i] === g && i !== skip) { total++; if (start < 0) start = i; }
  if (total === 0) return false;
  const seen = new Set([start]);
  const stack = [start];
  while (stack.length) {
    const i = stack.pop()!;
    for (const j of neighbours(n, i)) if (j !== skip && regions[j] === g && !seen.has(j)) { seen.add(j); stack.push(j); }
  }
  return seen.size === total;
}

/** Board for (size, seed): coloured regions and the answer (1 = stone). Deterministic. */
export function generate(n: number, seed: number): { regions: number[]; answer: number[] } {
  for (let attempt = 0; ; attempt++) {
    const rand = rng(seed * 31 + attempt * 7919 + n);
    const cols = plant(n, rand);
    const stars = cols.map((c, r) => r * n + c);
    // Grow regions from the stones, one random frontier cell at a time (uneven sizes look more natural).
    const regions = new Array<number>(n * n).fill(-1);
    stars.forEach((s, g) => { regions[s] = g; });
    let left = n * n - n;
    while (left > 0) {
      const g = Math.floor(rand() * n);
      const frontier: number[] = [];
      for (let i = 0; i < n * n; i++) if (regions[i] === g) for (const j of neighbours(n, i)) if (regions[j] < 0) frontier.push(j);
      if (!frontier.length) continue;
      regions[frontier[Math.floor(rand() * frontier.length)]] = g;
      left--;
    }
    // Trade border cells between regions until the planted answer is the only one.
    // No region gets tiny (a 1–2 cell region hands its stone away).
    const minSize = n <= 6 ? 2 : 3;
    const size = new Array<number>(n).fill(0);
    for (const g of regions) size[g]++;
    const isStar = new Set(stars);
    let best = countSolutions(n, regions, 60);
    for (let step = 0; step < 1500 && best.count > 1; step++) {
      // Prefer cells that break the other solution: a stone of it that is not ours.
      const other = best.other ?? best.sol!;
      const targets = other.map((c, r) => r * n + c).filter((i) => !isStar.has(i));
      const i = targets.length && rand() < 0.7 ? targets[Math.floor(rand() * targets.length)] : Math.floor(rand() * n * n);
      if (isStar.has(i)) continue;
      const from = regions[i];
      const options = [...new Set(neighbours(n, i).map((j) => regions[j]).filter((g) => g !== from))];
      if (!options.length || size[from] <= minSize || !connectedWithout(n, regions, from, i)) continue;
      const to = options[Math.floor(rand() * options.length)];
      regions[i] = to;
      const next = countSolutions(n, regions, 60);
      if (next.count <= best.count) { best = next; size[from]--; size[to]++; }
      else regions[i] = from;
    }
    if (best.count !== 1 || size.some((k) => k < minSize)) continue;
    const answer = new Array<number>(n * n).fill(0);
    for (const s of stars) answer[s] = 1;
    return { regions, answer };
  }
}

/** The answer as a "0/1" string (one per cell), the form the server stores. */
export const encodeCells = (cells: ArrayLike<number>) => Array.from(cells, (v) => (v === 1 ? '1' : '0')).join('');

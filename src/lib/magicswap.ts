// 마방진 스왑: a magic square (every row, column and both diagonals add up to the same number) with a few pairs of
// tiles swapped. Swap tiles back until every line adds up again. Three tiles are fixed (never swapped, never movable), so a
// magic square learnt by heart does not fit; any magic arrangement that keeps them counts, not only the planted one.
// Boards are built from (size, seed) with a deterministic generator, so the browser, rooms and the pool script agree.

export const MAGIC_SIZES = [5, 6, 7] as const;
export const MAGIC_CHALLENGE_SIZE = 7;
/** Pairs swapped away from the magic square, by size. */
export const SCRAMBLE: Record<number, number> = { 5: 3, 6: 4, 7: 6 };
/** Tiles locked in place on every board (each in its own row and column, none of them scrambled). */
export const FIXED = 3;

/** What every line must add up to: n(n² + 1) / 2 (65 · 111 · 175). */
export const magicSum = (n: number) => (n * (n * n + 1)) / 2;

export function rng(seed: number) {
  let a = seed >>> 0 || 1;
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
const mod = (a: number, n: number) => ((a % n) + n) % n;
const gcd = (a: number, b: number): number => (b ? gcd(b, mod(a, b)) : Math.abs(a));

/** Sums of the rows, the columns and the two diagonals (↘ then ↙). */
export function lineSums(n: number, cells: ArrayLike<number>) {
  const rows = new Array<number>(n).fill(0), cols = new Array<number>(n).fill(0);
  let down = 0, up = 0;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) { const v = cells[r * n + c] ?? 0; rows[r] += v; cols[c] += v; }
  for (let i = 0; i < n; i++) { down += cells[i * n + i] ?? 0; up += cells[i * n + n - 1 - i] ?? 0; }
  return { rows, cols, down, up };
}

/** How many of the 2n + 2 lines already add up (the room's progress count). */
export function linesRight(n: number, cells: ArrayLike<number>) {
  const m = magicSum(n), s = lineSums(n, cells);
  return s.rows.filter((v) => v === m).length + s.cols.filter((v) => v === m).length + (s.down === m ? 1 : 0) + (s.up === m ? 1 : 0);
}

/** Solved board: a magic square with the fixed tiles where they started. */
export const isSolvedWith = (n: number, cells: ArrayLike<number>, start: ArrayLike<number>, fixed: readonly number[]) =>
  fixed.every((i) => cells[i] === start[i]) && isMagic(n, cells);

/** Solved: the cells hold 1…n² once each and all 2n + 2 lines add up. */
export function isMagic(n: number, cells: ArrayLike<number>) {
  if (cells.length !== n * n) return false;
  const seen = new Array<boolean>(n * n + 1).fill(false);
  for (let i = 0; i < cells.length; i++) { const v = cells[i]; if (!Number.isInteger(v) || v < 1 || v > n * n || seen[v]) return false; seen[v] = true; }
  return linesRight(n, cells) === 2 * n + 2;
}

/** Odd n: two orthogonal "diagonal" Latin squares A, B (linear in r, c) give n·A + B + 1, with the symbols relabelled. */
function oddSquare(n: number, rand: () => number) {
  const ok = (a: number, b: number) => [a, b, a + b, a - b].every((x) => gcd(mod(x, n), n) === 1);
  const pick = () => { for (;;) { const a = 1 + Math.floor(rand() * (n - 1)), b = 1 + Math.floor(rand() * (n - 1)); if (ok(a, b)) return [a, b]; } };
  for (;;) {
    const [a1, b1] = pick(), [a2, b2] = pick();
    if (gcd(mod(a1 * b2 - a2 * b1, n), n) !== 1) continue;
    const c1 = Math.floor(rand() * n), c2 = Math.floor(rand() * n);
    const s1 = shuffle(Array.from({ length: n }, (_, i) => i), rand), s2 = shuffle(Array.from({ length: n }, (_, i) => i), rand);
    const out: number[] = [];
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) out.push(n * s1[mod(a1 * r + b1 * c + c1, n)] + s2[mod(a2 * r + b2 * c + c2, n)] + 1);
    return out;
  }
}

/** n = 6 (4m + 2): Conway's LUX method on a 3×3 magic square. */
function luxSquare(n: number) {
  const k = n / 2, m = (n - 2) / 4;
  const base = new Array<number>(k * k).fill(0);
  let r = 0, c = Math.floor(k / 2);
  for (let v = 1; v <= k * k; v++) {
    base[r * k + c] = v;
    const nr = mod(r - 1, k), nc = mod(c + 1, k);
    if (base[nr * k + nc]) r = mod(r + 1, k); else { r = nr; c = nc; }
  }
  const L = [4, 1, 2, 3], U = [1, 4, 2, 3], X = [1, 4, 3, 2];
  const kind = (br: number, bc: number) => {
    let t = br <= m ? L : br === m + 1 ? U : X;
    if (bc === Math.floor(k / 2) && br === m) t = U;
    if (bc === Math.floor(k / 2) && br === m + 1) t = L;
    return t;
  };
  const out = new Array<number>(n * n).fill(0);
  for (let br = 0; br < k; br++) for (let bc = 0; bc < k; bc++) {
    const t = kind(br, bc), b = 4 * (base[br * k + bc] - 1);
    out[(2 * br) * n + 2 * bc] = b + t[0];
    out[(2 * br) * n + 2 * bc + 1] = b + t[1];
    out[(2 * br + 1) * n + 2 * bc] = b + t[2];
    out[(2 * br + 1) * n + 2 * bc + 1] = b + t[3];
  }
  return out;
}

/** Moves that keep any magic square magic: turn / flip, n² + 1 − v, and the same mirror-paired shuffle of rows and columns. */
function vary(n: number, sq: number[], rand: () => number) {
  let cur = sq.slice();
  const turns = Math.floor(rand() * 4);
  for (let t = 0; t < turns; t++) { const next = new Array<number>(n * n); for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) next[c * n + (n - 1 - r)] = cur[r * n + c]; cur = next; }
  if (rand() < 0.5) { const next = new Array<number>(n * n); for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) next[r * n + (n - 1 - c)] = cur[r * n + c]; cur = next; }
  if (rand() < 0.5) cur = cur.map((v) => n * n + 1 - v);
  // π with π(n−1−i) = n−1−π(i): shuffle the mirror pairs and flip some of them; applied to rows and columns alike.
  const half = Math.floor(n / 2);
  const pairs = shuffle(Array.from({ length: half }, (_, i) => i), rand);
  const pi = new Array<number>(n);
  if (n % 2) pi[half] = half;
  pairs.forEach((to, from) => {
    const flip = rand() < 0.5;
    pi[from] = flip ? n - 1 - to : to;
    pi[n - 1 - from] = flip ? to : n - 1 - to;
  });
  const next = new Array<number>(n * n);
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) next[pi[r] * n + pi[c]] = cur[r * n + c];
  return next;
}

export type MagicPuzzle = { answer: number[]; start: number[]; swaps: [number, number][]; fixed: number[] };

/** A magic square, then `SCRAMBLE[n]` swaps of distinct cells (each pair different numbers); the start is never magic. */
export function generate(n: number, seed: number): MagicPuzzle {
  const rand = rng(seed * 7919 + n);
  for (;;) {
    const answer = vary(n, n % 2 ? oddSquare(n, rand) : luxSquare(n), rand);
    if (!isMagic(n, answer)) throw new Error(`magic ${n}`);
    const k = SCRAMBLE[n] ?? Math.max(2, n - 2);
    const cells = shuffle(Array.from({ length: n * n }, (_, i) => i), rand).slice(0, 2 * k);
    const swaps: [number, number][] = [];
    for (let i = 0; i < 2 * k; i += 2) swaps.push([cells[i], cells[i + 1]]);
    const start = answer.slice();
    for (const [i, j] of swaps) [start[i], start[j]] = [start[j], start[i]];
    // Every swap must show in the sums (a swap inside one row and one column pair could hide), and the start must not be magic.
    if (linesRight(n, start) > n) continue;
    if (isMagic(n, start)) continue;
    // Drawn after the scramble, so a seed keeps the board it had before fixed tiles existed.
    const moved = new Set(cells), fixed: number[] = [];
    for (const i of shuffle(Array.from({ length: n * n }, (_, k) => k), rand)) {
      if (fixed.length === FIXED) break;
      if (moved.has(i) || fixed.some((f) => Math.floor(f / n) === Math.floor(i / n) || f % n === i % n)) continue;
      fixed.push(i);
    }
    return { answer, start, swaps, fixed: fixed.sort((a, b) => a - b) };
  }
}

/** The pool stores a board's start as comma-separated numbers (the server replays swaps from it). */
export const encodeCells = (cells: ArrayLike<number>) => Array.from(cells).join(',');
/** Pool row: the start, then `|` and the fixed cell indexes (rows from before fixed tiles have no `|`). */
export const encodePool = (p: MagicPuzzle) => `${encodeCells(p.start)}|${p.fixed.join(',')}`;
export const decodeCells = (text: string) => text.split(',').map((x) => Number(x));

// 네모 세기 (Nemo Count): count the rectangles on a board whose numbers add up to the target.
// A "네모" is any rectangle of whole cells (squares included, 1×1 too) lying entirely inside the board's
// shape. Blank cells count as 0. Boards are generated at random per difficulty, and every answer (and
// the list of rectangles behind it, used for the solution replay) is computed, never hand-made.

/** `cells[r][c]`: null = not part of the board, otherwise the cell's number (0 = blank). */
export type NemoBoard = { cells: (number | null)[][]; target: number };
export type NemoRect = { r1: number; c1: number; r2: number; c2: number; sum: number };
export type NemoDifficulty = 'easy' | 'normal' | 'hard';
export type NemoProblem = NemoBoard & { id: string; difficulty: NemoDifficulty | 'tutorial'; answer: number };

export const NEMO_DIFFICULTIES: NemoDifficulty[] = ['easy', 'normal', 'hard'];
export const CHALLENGE_MS = 30 * 60 * 1000;

const rowsOf = (b: NemoBoard) => b.cells.length;
const colsOf = (b: NemoBoard) => Math.max(0, ...b.cells.map((row) => row.length));
const at = (b: NemoBoard, r: number, c: number) => b.cells[r]?.[c] ?? null;

/** Every rectangle inside the board's shape, with its sum (prefix sums keep this fast up to ~12×12). */
export function allRects(board: NemoBoard): NemoRect[] {
  const R = rowsOf(board), C = colsOf(board);
  const out: NemoRect[] = [];
  for (let r1 = 0; r1 < R; r1 += 1) for (let c1 = 0; c1 < C; c1 += 1) {
    if (at(board, r1, c1) === null) continue;
    // Grow downwards; track how far right each row stays inside the shape.
    let maxC = C - 1;
    const colSums = new Array(C).fill(0);
    for (let r2 = r1; r2 < R; r2 += 1) {
      let c = c1;
      while (c <= maxC && at(board, r2, c) !== null) c += 1;
      maxC = c - 1;
      if (maxC < c1) break;
      let sum = 0;
      for (let c2 = c1; c2 <= maxC; c2 += 1) {
        colSums[c2] += at(board, r2, c2)!;
        sum += colSums[c2];
        out.push({ r1, c1, r2, c2, sum });
      }
    }
  }
  return out;
}

/** Rectangles that hit the target, smallest first (the order the solution replay walks through). */
export function solutionRects(board: NemoBoard): NemoRect[] {
  const area = (x: NemoRect) => (x.r2 - x.r1 + 1) * (x.c2 - x.c1 + 1);
  return allRects(board).filter((x) => x.sum === board.target)
    .sort((a, b) => area(a) - area(b) || a.r1 - b.r1 || a.c1 - b.c1 || a.r2 - b.r2 || a.c2 - b.c2);
}

export const countNemo = (board: NemoBoard) => allRects(board).filter((x) => x.sum === board.target).length;

// ---------- Tutorial boards (the two boards from 「데블스 플랜: 데드 어게인」) ----------

function fromRows(rows: string[], values: Record<string, number> = {}): (number | null)[][] {
  // '.' = no cell, '_' = blank cell, digits/letters = number (letters looked up in `values`).
  return rows.map((row) => row.split(' ').map((token) => token === '.' ? null : token === '_' ? 0 : values[token] ?? Number(token)));
}

const TUTORIAL_BOARDS: NemoBoard[] = [
  {
    target: 20,
    cells: fromRows([
      '1 8 6 . 7 3 1',
      '3 5 2 . 4 5 8',
      '7 4 9 X 9 2 6',
      '. . . . . . X',
      '. . . . 9 4 7',
      '. . . . 2 5 3',
      '. . . . 6 8 1',
    ], { X: 21 }),
  },
  {
    target: 0,
    cells: fromRows([
      '. . . . . _ . _ . . .',
      '_ _ . . _ _ . _ _ . .',
      '_ _ _ . _ _ . _ _ _ .',
      '_ _ _ 1 _ _ 1 _ _ _ _',
      '_ _ . . _ _ . . . . .',
      '. . . . _ . . . . . .',
    ]),
  },
];

export const tutorialProblems = (): NemoProblem[] => TUTORIAL_BOARDS.map((b, i) => ({ ...b, id: `tutorial-${i}`, difficulty: 'tutorial', answer: countNemo(b) }));

// ---------- Random boards ----------

/** Small seeded PRNG so a room can share a problem set by seed. */
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
type Rand = () => number;
const int = (rand: Rand, lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));

type Spec = {
  size: [number, number]; // max rows/cols
  cells: [number, number]; // board size range (cells)
  numberAnswer: [number, number]; // answer range for numbered boards
  blankAnswer: [number, number]; // answer range for mostly-blank boards
  maxValue: number; // regular cell values 1..maxValue
  bigChance: number; // chance a bridge cell carries a big number
  marks: [number, number]; // how many numbered cells on a mostly-blank board
};
const SPECS: Record<NemoDifficulty, Spec> = {
  easy: { size: [5, 5], cells: [10, 17], numberAnswer: [2, 5], blankAnswer: [8, 30], maxValue: 6, bigChance: 0, marks: [1, 2] },
  normal: { size: [7, 7], cells: [18, 30], numberAnswer: [3, 9], blankAnswer: [25, 90], maxValue: 9, bigChance: 0.5, marks: [2, 3] },
  hard: { size: [8, 9], cells: [28, 44], numberAnswer: [5, 14], blankAnswer: [60, 220], maxValue: 9, bigChance: 0.8, marks: [2, 4] },
};

/** A connected shape: a few solid blocks joined by one-cell-wide bridges (like the broadcast boards). */
function blockShape(rand: Rand, R: number, C: number, cellsRange: [number, number]): boolean[][] {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const grid = Array.from({ length: R }, () => new Array(C).fill(false));
    const blocks = int(rand, 2, R >= 7 ? 4 : 3);
    const centres: [number, number][] = [];
    for (let i = 0; i < blocks; i += 1) {
      const h = int(rand, 2, Math.min(3, R)), w = int(rand, 2, Math.min(3, C));
      const r = int(rand, 0, R - h), c = int(rand, 0, C - w);
      for (let y = r; y < r + h; y += 1) for (let x = c; x < c + w; x += 1) grid[y][x] = true;
      centres.push([r + Math.floor(h / 2), c + Math.floor(w / 2)]);
    }
    // Join each block to the previous one with an L-shaped bridge.
    for (let i = 1; i < centres.length; i += 1) {
      let [r, c] = centres[i - 1];
      const [tr, tc] = centres[i];
      const rowFirst = rand() < 0.5;
      const stepRow = () => { while (r !== tr) { r += Math.sign(tr - r); grid[r][c] = true; } };
      const stepCol = () => { while (c !== tc) { c += Math.sign(tc - c); grid[r][c] = true; } };
      if (rowFirst) { stepRow(); stepCol(); } else { stepCol(); stepRow(); }
    }
    const n = grid.flat().filter(Boolean).length;
    if (n >= cellsRange[0] && n <= cellsRange[1]) return grid;
  }
  return Array.from({ length: R }, (_, r) => Array.from({ length: C }, (_, c) => r < 3 && c < 4));
}

/** A "skyline": bars of random height on a shared base row, some gaps (like the target-0 board). */
function skylineShape(rand: Rand, R: number, C: number, cellsRange: [number, number]): boolean[][] {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const grid = Array.from({ length: R }, () => new Array(C).fill(false));
    const base = int(rand, Math.floor(R / 2), R - 1);
    for (let c = 0; c < C; c += 1) {
      grid[base][c] = true; // the shared row keeps it connected
      if (rand() < 0.25) continue;
      const up = int(rand, 0, base), down = int(rand, 0, Math.min(2, R - 1 - base));
      for (let r = base - up; r <= base + down; r += 1) grid[r][c] = true;
    }
    const n = grid.flat().filter(Boolean).length;
    if (n >= cellsRange[0] && n <= cellsRange[1]) return grid;
  }
  return Array.from({ length: R }, (_, r) => Array.from({ length: C }, () => r === R - 1));
}

/** Drops empty outer rows/columns so the board is drawn tight. */
function trim(cells: (number | null)[][]): (number | null)[][] {
  const used = (row: (number | null)[]) => row.some((v) => v !== null);
  let rows = cells.filter(used);
  const C = Math.max(...rows.map((r) => r.length));
  const keep = Array.from({ length: C }, (_, c) => rows.some((r) => r[c] !== null && r[c] !== undefined));
  const first = keep.indexOf(true), last = keep.lastIndexOf(true);
  rows = rows.map((r) => Array.from({ length: last - first + 1 }, (_, i) => r[first + i] ?? null));
  return rows;
}

let counter = 0;

/** One random problem at this difficulty. `rand` makes it reproducible (rooms share a seed). */
export function generateProblem(difficulty: NemoDifficulty, rand: Rand = Math.random): NemoProblem {
  const spec = SPECS[difficulty];
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const R = int(rand, Math.max(3, spec.size[0] - 2), spec.size[0]);
    const C = int(rand, Math.max(3, spec.size[1] - 2), spec.size[1]);
    const blank = rand() < 0.4; // about four in ten are "count the empty rectangles" boards
    const shape = blank ? skylineShape(rand, R, C, spec.cells) : blockShape(rand, R, C, spec.cells);
    let cells: (number | null)[][];
    let targetOptions: number[];
    if (blank) {
      cells = shape.map((row) => row.map((on) => (on ? 0 : null)));
      const spots = shape.flatMap((row, r) => row.flatMap((on, c) => (on ? [[r, c]] : [])));
      const marks = int(rand, spec.marks[0], spec.marks[1]);
      for (let i = 0; i < marks && spots.length; i += 1) {
        const [r, c] = spots.splice(int(rand, 0, spots.length - 1), 1)[0];
        cells[r][c] = difficulty === 'hard' && rand() < 0.4 ? 2 : 1;
      }
      targetOptions = difficulty === 'easy' ? [0] : difficulty === 'normal' ? [0, 0, 1] : [0, 1, 2];
    } else {
      // A bridge cell is a one-cell-wide corridor (neighbours only straight across); bridges may carry a
      // big number, like the 21s on air. At most two per board.
      const on = (r: number, c: number) => !!shape[r]?.[c];
      let bigLeft = difficulty === 'hard' ? 2 : 1;
      cells = shape.map((row, r) => row.map((cell, c) => {
        if (!cell) return null;
        const vertical = on(r - 1, c) && on(r + 1, c) && !on(r, c - 1) && !on(r, c + 1);
        const horizontal = on(r, c - 1) && on(r, c + 1) && !on(r - 1, c) && !on(r + 1, c);
        if ((vertical || horizontal) && bigLeft > 0 && rand() < spec.bigChance) { bigLeft -= 1; return int(rand, 12, 25); }
        return int(rand, 1, spec.maxValue);
      }));
      targetOptions = [];
    }
    const board: NemoBoard = { cells: trim(cells), target: 0 };
    const rects = allRects(board);
    if (!blank) {
      // Pick a target that is reached by an interesting number of rectangles, not only by single cells.
      const bySum = new Map<number, NemoRect[]>();
      for (const x of rects) bySum.set(x.sum, [...(bySum.get(x.sum) ?? []), x]);
      const minTarget = difficulty === 'easy' ? 8 : 12;
      targetOptions = [...bySum.entries()].filter(([sum, list]) => sum >= minTarget
        && list.length >= spec.numberAnswer[0] && list.length <= spec.numberAnswer[1]
        && list.some((x) => x.r1 !== x.r2 || x.c1 !== x.c2)).map(([sum]) => sum);
      if (!targetOptions.length) continue;
    }
    board.target = targetOptions[int(rand, 0, targetOptions.length - 1)];
    const answer = rects.filter((x) => x.sum === board.target).length;
    const range = blank ? spec.blankAnswer : spec.numberAnswer;
    if (answer < range[0] || answer > range[1]) continue;
    counter += 1;
    return { ...board, id: `${difficulty}-${Date.now().toString(36)}-${counter}`, difficulty, answer };
  }
  // Very unlikely; fall back to the first tutorial board.
  return { ...tutorialProblems()[0], id: `fallback-${++counter}`, difficulty };
}

/** A fixed set for a room: everyone gets the same boards. */
export function generateSet(difficulty: NemoDifficulty, count: number, seed: number): NemoProblem[] {
  const rand = rng(seed);
  return Array.from({ length: count }, (_, i) => ({ ...generateProblem(difficulty, rand), id: `room-${seed}-${i}` }));
}

export const formatMs = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 100) / 10);
  return s >= 60 ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : `${s.toFixed(1)}s`;
};

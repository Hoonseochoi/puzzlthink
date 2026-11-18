// 헥사곤 (Hexagon), the second game of 「데블스 플랜」 season 1's final.
// 19 hexagons in rows of 3-4-5-4-3, lettered A–S. Each round the numbers are shown for a while, then the
// tiles flip to their letters and a target appears: find every straight line of three neighbouring tiles
// (across or along either diagonal) whose numbers add up to the target, and declare it by its letters.

export const LETTERS = 'ABCDEFGHIJKLMNOPQRS';
export const ROWS = [3, 4, 5, 4, 3];
export const MEMORIZE_MS = 30_000;
export const IDLE_MS = 90_000; // a round ends after this long without a declaration
export const ROUNDS = 10;
export const CHALLENGE_MS = 10 * 60 * 1000;

export type HexBoard = { numbers: number[]; target: number };
export type HexRound = HexBoard & { id: string; answers: string[]; broadcast?: number };

/** Axial coordinates (q, r) of each tile, row by row from the top, left to right. */
export const CELLS: { q: number; r: number; row: number; col: number }[] = ROWS.flatMap((len, row) => {
  const r = row - 2;
  const qStart = Math.max(-2, -2 - r);
  return Array.from({ length: len }, (_, col) => ({ q: qStart + col, r, row, col }));
});
const indexAt = new Map(CELLS.map((c, i) => [`${c.q},${c.r}`, i]));

/** The 27 lines of three: across, and down along both diagonals. Each is its letters in board order. */
export const LINES: string[] = (() => {
  const out: string[] = [];
  for (const [dq, dr] of [[1, 0], [0, 1], [-1, 1]]) {
    CELLS.forEach((c, i) => {
      const j = indexAt.get(`${c.q + dq},${c.r + dr}`), k = indexAt.get(`${c.q + 2 * dq},${c.r + 2 * dr}`);
      if (j !== undefined && k !== undefined) out.push(LETTERS[i] + LETTERS[j] + LETTERS[k]);
    });
  }
  return out;
})();

/** One key per set of three tiles, whatever order they were picked in. */
export const keyOf = (letters: string) => [...letters.toUpperCase()].sort().join('');
const LINE_BY_KEY = new Map(LINES.map((line) => [keyOf(line), line]));
/** The line these three letters make, in board order (e.g. "IHJ" → "HIJ"), or null if they are not one. */
export const lineOf = (letters: string) => (letters.length === 3 ? LINE_BY_KEY.get(keyOf(letters)) ?? null : null);

export const sumOf = (numbers: number[], line: string) => [...line].reduce((s, ch) => s + numbers[LETTERS.indexOf(ch)], 0);
export const answersOf = (board: HexBoard) => LINES.filter((line) => sumOf(board.numbers, line) === board.target);

// ---------- The ten boards from the broadcast ----------

const BROADCAST: [string | number[], number][] = [
  ['1632456252134535113', 5],
  ['2326541437442115622', 7],
  ['4331214523513522233', 6],
  ['6123562343153234643', 9],
  ['3126372422367341561', 8],
  ['2354451283544572811', 12],
  ['6524342255367514112', 10],
  [[6, 7, 5, 5, 1, 10, 10, 4, 4, 6, 8, 6, 10, 9, 1, 1, 4, 2, 10], 18],
  ['4714335632522611125', 11],
  ['5657816442334667418', 15],
];

export const broadcastRounds = (): HexRound[] => BROADCAST.map(([nums, target], i) => {
  const numbers = typeof nums === 'string' ? [...nums].map(Number) : nums;
  return { numbers, target, id: `broadcast-${i}`, answers: answersOf({ numbers, target }), broadcast: i + 1 };
});

// ---------- Random boards ----------

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

let counter = 0;

/** Numbers 1–9; the target is a sum that 2–5 lines reach (on air most rounds had 1–4 answers). */
export function generateRound(rand: () => number = Math.random): HexRound {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const numbers = Array.from({ length: 19 }, () => 1 + Math.floor(rand() * 9));
    const bySum = new Map<number, number>();
    for (const line of LINES) { const s = sumOf(numbers, line); bySum.set(s, (bySum.get(s) ?? 0) + 1); }
    const options = [...bySum.entries()].filter(([, n]) => n >= 2 && n <= 5).map(([s]) => s);
    if (!options.length) continue;
    const target = options[Math.floor(rand() * options.length)];
    counter += 1;
    return { numbers, target, id: `r-${Date.now().toString(36)}-${counter}`, answers: answersOf({ numbers, target }) };
  }
  return broadcastRounds()[0];
}

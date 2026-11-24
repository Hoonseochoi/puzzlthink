// 포인트 오목 (Point Omok): each round the choosing player marks three empty points in a row, both players
// split their points over them in secret, and every point gets the stone of whoever bid more on it.
//
// Rules as played on this site (agreed with the site owner, 2026-11-24):
// - 15×15 board. The three points are empty intersections next to each other on one line:
//   across, down or either diagonal.
// - Every round each player gets 10 points on top of what was carried over. Bids are whole numbers, at least
//   1 on each of the three points. Half of what is left (rounded down) carries over to the next round.
// - Higher bid takes the point. On a tie the player who did NOT choose the points this round takes it.
// - The three stones go down together (their order means nothing). Afterwards, whoever has more fives wins.
//   A five is exactly five stones in a row in one direction: six or more (an overline) is not a five. Each five counts once.
//   Same number of fives (one or more each) is a draw, and so is a board with no three empty points in a row left.
// - The first chooser is drawn at random; after that the players take turns choosing.

export const PO_SIZE = 15;
export const PO_CELLS = PO_SIZE * PO_SIZE;
export const PO_GRANT = 10;
export const PO_SECONDS = 90;
export const PO_POINTS = 3;

/** Board cells: −1 empty, 0 / 1 the seat's stone. */
export type PoBoard = number[];
export type PoSeat = 0 | 1;
/** Three cell indices in line order. */
export type PoTriple = [number, number, number];
export type PoBets = [number, number, number];

/** Directions as (row, col) steps: across, down, down-right, down-left. */
export const PO_DIRS: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]];

export const rowOf = (cell: number) => Math.floor(cell / PO_SIZE);
export const colOf = (cell: number) => cell % PO_SIZE;
export const cellAt = (row: number, col: number) => row * PO_SIZE + col;
export const onBoard = (row: number, col: number) => row >= 0 && row < PO_SIZE && col >= 0 && col < PO_SIZE;
export const emptyBoard = (): PoBoard => Array(PO_CELLS).fill(-1);
export const other = (seat: PoSeat): PoSeat => (seat === 0 ? 1 : 0);

const COLS = 'ABCDEFGHJKLMNOP';
/** Board coordinate as written on the edge: column letter (no I) and row number from the bottom, e.g. H8. */
export const coordinate = (cell: number) => `${COLS[colOf(cell)]}${PO_SIZE - rowOf(cell)}`;

/** The three cells in line order if they are distinct, on one line and next to each other; null otherwise. */
export function lineOrder(cells: number[]): PoTriple | null {
  if (cells.length !== 3 || new Set(cells).size !== 3 || cells.some((c) => !Number.isInteger(c) || c < 0 || c >= PO_CELLS)) return null;
  for (const [dr, dc] of PO_DIRS) {
    for (const start of cells) {
      const line = [0, 1, 2].map((k) => ({ r: rowOf(start) + dr * k, c: colOf(start) + dc * k }));
      if (!line.every(({ r, c }) => onBoard(r, c))) continue;
      const ids = line.map(({ r, c }) => cellAt(r, c));
      if (ids.every((id) => cells.includes(id))) return ids as PoTriple;
    }
  }
  return null;
}

/** Whether `cells` is a legal choice on `board`: three empty points in a row. */
export const isLegalTriple = (board: PoBoard, cells: number[]): cells is PoTriple =>
  !!lineOrder(cells) && cells.every((c) => board[c] === -1);

/** Every legal choice on the board (each line of three once). */
export function allTriples(board: PoBoard): PoTriple[] {
  const out: PoTriple[] = [];
  for (let r = 0; r < PO_SIZE; r += 1) for (let c = 0; c < PO_SIZE; c += 1) {
    for (const [dr, dc] of PO_DIRS) {
      const r2 = r + dr * 2, c2 = c + dc * 2;
      if (!onBoard(r2, c2)) continue;
      const t: PoTriple = [cellAt(r, c), cellAt(r + dr, c + dc), cellAt(r2, c2)];
      if (t.every((x) => board[x] === -1)) out.push(t);
    }
  }
  return out;
}

export const hasTriple = (board: PoBoard) => {
  for (let r = 0; r < PO_SIZE; r += 1) for (let c = 0; c < PO_SIZE; c += 1) {
    if (board[cellAt(r, c)] !== -1) continue;
    for (const [dr, dc] of PO_DIRS) {
      const r2 = r + dr * 2, c2 = c + dc * 2;
      if (onBoard(r2, c2) && board[cellAt(r + dr, c + dc)] === -1 && board[cellAt(r2, c2)] === -1) return true;
    }
  }
  return false;
};

/** Empty cells that complete a legal triple together with the cells already picked (for the picking preview). */
export function extensions(board: PoBoard, picked: number[]): number[] {
  if (picked.length >= 3) return [];
  const found = new Set<number>();
  for (const t of allTriples(board)) if (picked.every((p) => t.includes(p))) for (const x of t) if (!picked.includes(x)) found.add(x);
  return [...found];
}

/** A line of exactly five of one seat's stones: its two end cells. */
export type PoLine = { seat: PoSeat; from: number; to: number; length: number };

/** Every five on the board. A run of six or more (an overline) is not a five. */
export function fiveLines(board: PoBoard): PoLine[] {
  const lines: PoLine[] = [];
  for (const [dr, dc] of PO_DIRS) {
    for (let r = 0; r < PO_SIZE; r += 1) for (let c = 0; c < PO_SIZE; c += 1) {
      const seat = board[cellAt(r, c)];
      if (seat < 0) continue;
      const pr = r - dr, pc = c - dc;
      if (onBoard(pr, pc) && board[cellAt(pr, pc)] === seat) continue; // not the start of the run
      let n = 1;
      while (onBoard(r + dr * n, c + dc * n) && board[cellAt(r + dr * n, c + dc * n)] === seat) n += 1;
      if (n === 5) lines.push({ seat: seat as PoSeat, from: cellAt(r, c), to: cellAt(r + dr * (n - 1), c + dc * (n - 1)), length: n });
    }
  }
  return lines;
}

export const countFives = (board: PoBoard): [number, number] => {
  const lines = fiveLines(board);
  return [lines.filter((l) => l.seat === 0).length, lines.filter((l) => l.seat === 1).length];
};

/** Who takes each point: the higher bid; a tie goes to the player who did not choose. */
export const pointOwners = (bets: [PoBets, PoBets], chooser: PoSeat): [PoSeat, PoSeat, PoSeat] =>
  [0, 1, 2].map((i) => (bets[0][i] > bets[1][i] ? 0 : bets[1][i] > bets[0][i] ? 1 : other(chooser))) as [PoSeat, PoSeat, PoSeat];

/** Bids a player may make: three whole numbers, each at least 1, adding up to no more than the budget. */
export const validBets = (bets: unknown, budget: number): bets is PoBets =>
  Array.isArray(bets) && bets.length === 3 && bets.every((b) => Number.isInteger(b) && b >= 1) && (bets as number[]).reduce((a, b) => a + b, 0) <= budget;

export const sum = (bets: readonly number[]) => bets.reduce((a, b) => a + b, 0);
/** Points carried into the next round: half of what is left, rounded down. */
export const carryOf = (budget: number, spent: number) => Math.max(0, Math.floor((budget - spent) / 2));

/** A player's budget after the given rounds of their own bids (10 at the start). */
export function budgetAfter(history: readonly (readonly number[])[]): number {
  let budget = PO_GRANT;
  for (const bets of history) budget = PO_GRANT + carryOf(budget, sum(bets));
  return budget;
}

export type PoOutcome = { winner: PoSeat | 'draw' | null; fives: [number, number]; reason: 'five' | 'full' | null };

/** The result after a round: more fives wins, equal fives is a draw, no legal triple left is a draw. */
export function outcomeOf(board: PoBoard): PoOutcome {
  const fives = countFives(board);
  if (fives[0] || fives[1]) return { winner: fives[0] > fives[1] ? 0 : fives[1] > fives[0] ? 1 : 'draw', fives, reason: 'five' };
  if (!hasTriple(board)) return { winner: 'draw', fives, reason: 'full' };
  return { winner: null, fives, reason: null };
}

export const placeStones = (board: PoBoard, triple: readonly number[], owners: readonly number[]): PoBoard => {
  const next = board.slice();
  triple.forEach((cell, i) => { next[cell] = owners[i]; });
  return next;
};

/** A legal triple for a chooser who ran out of time: next to the stones when there are any, else near the centre. */
export function fallbackTriple(board: PoBoard, rand: () => number = Math.random): PoTriple | null {
  const all = allTriples(board);
  if (!all.length) return null;
  const stones = board.some((x) => x >= 0);
  const near = all.filter((t) => t.some((cell) => {
    if (!stones) return Math.abs(rowOf(cell) - 7) <= 2 && Math.abs(colOf(cell) - 7) <= 2;
    for (let dr = -1; dr <= 1; dr += 1) for (let dc = -1; dc <= 1; dc += 1) {
      const r = rowOf(cell) + dr, c = colOf(cell) + dc;
      if (onBoard(r, c) && board[cellAt(r, c)] >= 0) return true;
    }
    return false;
  }));
  const pool = near.length ? near : all;
  return pool[Math.floor(rand() * pool.length)];
}

/** An even split of `budget` over the three points (used as the starting bid on the steppers). */
export function evenSplit(budget: number): PoBets {
  const base = Math.max(1, Math.floor(budget / 3));
  return [base, base, base];
}

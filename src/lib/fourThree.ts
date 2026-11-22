// 4인 3목: four players on a 4×4 board, five pieces each, pieces stack up to three high.
// A turn is either a new piece onto any cell (height < 3) or one of your top pieces moved to one of the
// eight neighbouring cells (height < 3). Seen from above, three of one colour in a row wins the round.
// If one action shows lines for two or more colours at once, the round ends with nobody scoring.

export type Seat = 0 | 1 | 2 | 3;
export const SEATS: Seat[] = [0, 1, 2, 3];
export const SIZE = 4;
export const CELLS = SIZE * SIZE;
export const MAX_HEIGHT = 3;
export const HAND = 5;
export const ROUNDS = 4;
export const WIN_REWARD = 3;
export const TURN_MS = 90_000;
/** A round with no line after this many actions (passes included) ends with nobody scoring. */
export const PLY_CAP = 120;

export type Move = { kind: 'place'; to: number } | { kind: 'move'; from: number; to: number };
export type Board = Seat[][]; // each cell: stack bottom → top

export interface FtState {
  board: Board;
  hand: number[];
  /** Seats in play order for this round. */
  order: Seat[];
  turn: number; // index into order
  plies: number;
  last: (Move & { by: Seat }) | { kind: 'pass'; by: Seat } | null;
  /** Colours that completed a line on the final action (empty on a cap draw). Null while the round runs. */
  winners: Seat[] | null;
  lines: number[][];
}

/** All 24 straight three-cell segments on the 4×4 board. */
export const LINES: number[][] = (() => {
  const out: number[][] = [];
  const at = (r: number, c: number) => r * SIZE + c;
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
      const r2 = r + 2 * dr, c2 = c + 2 * dc;
      if (r2 < 0 || r2 >= SIZE || c2 < 0 || c2 >= SIZE) continue;
      out.push([at(r, c), at(r + dr, c + dc), at(r2, c2)]);
    }
  }
  return out;
})();

export const NEIGHBORS: number[][] = Array.from({ length: CELLS }, (_, i) => {
  const r = Math.floor(i / SIZE), c = i % SIZE, out: number[] = [];
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    if (!dr && !dc) continue;
    const rr = r + dr, cc = c + dc;
    if (rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE) out.push(rr * SIZE + cc);
  }
  return out;
});

/** Play order for a round: red-yellow-green-blue, starting one seat later each round. */
export const roundOrder = (round: number): Seat[] => SEATS.map((_, i) => ((round + i) % 4) as Seat);

export function newRound(round: number): FtState {
  return { board: Array.from({ length: CELLS }, () => []), hand: [HAND, HAND, HAND, HAND], order: roundOrder(round), turn: 0, plies: 0, last: null, winners: null, lines: [] };
}

export const toMove = (s: FtState): Seat => s.order[s.turn];
export const top = (stack: Seat[]): Seat | -1 => (stack.length ? stack[stack.length - 1] : -1);

export function legalMoves(board: Board, hand: number[], p: Seat): Move[] {
  const out: Move[] = [];
  if (hand[p] > 0) for (let i = 0; i < CELLS; i++) if (board[i].length < MAX_HEIGHT) out.push({ kind: 'place', to: i });
  for (let i = 0; i < CELLS; i++) {
    if (top(board[i]) !== p) continue;
    for (const j of NEIGHBORS[i]) if (board[j].length < MAX_HEIGHT) out.push({ kind: 'move', from: i, to: j });
  }
  return out;
}

/** Lines showing from above, grouped by colour. */
export function lineScan(board: Board): { winners: Seat[]; lines: number[][] } {
  const winners: Seat[] = [], lines: number[][] = [];
  for (const line of LINES) {
    const a = top(board[line[0]]);
    if (a !== -1 && a === top(board[line[1]]) && a === top(board[line[2]])) {
      lines.push(line);
      if (!winners.includes(a)) winners.push(a);
    }
  }
  return { winners, lines };
}

function applyRaw(board: Board, hand: number[], p: Seat, m: Move): [Board, number[]] {
  const b = board.slice();
  const h = hand.slice();
  if (m.kind === 'place') { b[m.to] = [...b[m.to], p]; h[p]--; }
  else { b[m.from] = b[m.from].slice(0, -1); b[m.to] = [...b[m.to], p]; }
  return [b, h];
}

function advance(s: FtState, board: Board, hand: number[], last: FtState['last']): FtState {
  const { winners, lines } = lineScan(board);
  const plies = s.plies + 1;
  const over = winners.length > 0 || plies >= PLY_CAP;
  return { ...s, board, hand, last, plies, turn: over ? s.turn : (s.turn + 1) % 4, winners: over ? winners : null, lines };
}

export function play(s: FtState, m: Move): FtState {
  const p = toMove(s);
  const [board, hand] = applyRaw(s.board, s.hand, p, m);
  return advance(s, board, hand, { ...m, by: p });
}

/** The player to move has nothing legal (or ran out of time): the turn passes. */
export function pass(s: FtState): FtState {
  return advance(s, s.board, s.hand, { kind: 'pass', by: toMove(s) });
}

export const canMove = (s: FtState) => legalMoves(s.board, s.hand, toMove(s)).length > 0;

// ─── AI ────────────────────────────────────────────────────────────────────────
// One seat is the Special Guest: everyone else is a player. The three players work together to stop the
// guest (a guest line in any round fails the mission) while still racing each other for pieces.
// Each AI plays max-n with its own utility, so allies block the guest and the guest plays against all three.

const WIN = 100_000;

/** Static worth of a position for each colour (bigger = better for that colour). */
function staticScores(board: Board, hand: number[]): number[] {
  const s = [0, 0, 0, 0];
  for (const line of LINES) {
    const own = [0, 0, 0, 0];
    let filled = 0;
    let coverable = 0; // cells in the line that can still take a piece
    for (const i of line) {
      const t = top(board[i]);
      if (t !== -1) { own[t]++; filled++; }
      if (board[i].length < MAX_HEIGHT) coverable++;
    }
    for (const p of SEATS) {
      const others = filled - own[p];
      if (own[p] === 2 && others === 0) s[p] += 40;
      else if (own[p] === 2 && others === 1 && coverable > 0) s[p] += 12;
      else if (own[p] === 1 && others === 0) s[p] += 4;
      else if (own[p] === 1 && others === 1) s[p] += 1;
    }
  }
  for (let i = 0; i < CELLS; i++) {
    const t = top(board[i]);
    if (t === -1) continue;
    const r = Math.floor(i / SIZE), c = i % SIZE;
    const centre = (r === 1 || r === 2) && (c === 1 || c === 2);
    s[t] += centre ? 3 : 1;
    // Being buried costs a little.
    for (let k = 0; k < board[i].length - 1; k++) s[board[i][k]] -= 1;
  }
  for (const p of SEATS) s[p] += hand[p] * 2;
  return s;
}

/** Utility for every seat. The guest fights all three; a player fears the guest most, then its rivals for gems. */
function utility(raw: number[], guest: Seat): number[] {
  return raw.map((v, p) => {
    if (p === guest) return v - 0.8 * Math.max(...raw.filter((_, q) => q !== p));
    const rival = Math.max(...raw.filter((_, q) => q !== p && q !== guest));
    return v - 1.3 * raw[guest] - 0.3 * rival;
  });
}

function terminal(winners: Seat[], guest: Seat): number[] {
  const guestIn = winners.includes(guest);
  if (winners.length === 1) {
    const w = winners[0];
    return SEATS.map((p) => (p === guest ? (w === guest ? WIN : -WIN) : w === p ? WIN : w === guest ? -WIN : -WIN * 0.2));
  }
  // Shared line: nobody gets pieces. With the guest in it the mission fails.
  return SEATS.map((p) => (p === guest ? (guestIn ? WIN * 0.6 : -WIN) : guestIn ? -WIN : 0));
}

interface Ctx { guest: Seat; beams: number[] }

/** Max-n: the colour to move picks the child best for itself, `depth` actions ahead. */
function maxn(board: Board, hand: number[], order: Seat[], turn: number, depth: number, ctx: Ctx): number[] {
  if (depth === 0) return utility(staticScores(board, hand), ctx.guest);
  const p = order[turn];
  const next = (turn + 1) % 4;
  const moves = legalMoves(board, hand, p);
  if (!moves.length) return maxn(board, hand, order, next, depth - 1, ctx);

  type Child = { b: Board; h: number[]; v: number[] | null; quick: number };
  const children: Child[] = [];
  for (const m of moves) {
    const [b, h] = applyRaw(board, hand, p, m);
    const { winners } = lineScan(b);
    if (winners.length === 1 && winners[0] === p) return terminal(winners, ctx.guest); // take the win
    const v = winners.length ? terminal(winners, ctx.guest) : null;
    children.push({ b, h, v, quick: v ? v[p] : utility(staticScores(b, h), ctx.guest)[p] });
  }
  if (depth === 1) {
    const pick = children.reduce((a, c) => (c.quick > a.quick ? c : a));
    return pick.v ?? utility(staticScores(pick.b, pick.h), ctx.guest);
  }
  children.sort((a, b) => b.quick - a.quick);
  const beam = ctx.beams[Math.min(depth, ctx.beams.length - 1)];
  let best: number[] | null = null;
  for (const c of children.slice(0, beam)) {
    const v = c.v ?? maxn(c.b, c.h, order, next, depth - 1, ctx);
    if (!best || v[p] > best[p]) best = v;
  }
  return best!;
}

/** Whether `p` could complete a line of its own right now (ignores whose turn it is). */
function hasWin(board: Board, hand: number[], p: Seat): boolean {
  for (const m of legalMoves(board, hand, p)) {
    const [b] = applyRaw(board, hand, p, m);
    const { winners } = lineScan(b);
    if (winners.length === 1 && winners[0] === p) return true;
  }
  return false;
}

// There is one AI strength: it always plays its best move (no random slips), so a game is lost only when
// the people at the table misplay. depth = actions searched (4 = one full rotation of the table);
// beams[d] = children kept at a node with d actions left.
const DEPTH = 5;
const BEAMS = [0, 0, 6, 8, 10, 10];

export function chooseMove(s: FtState, guest: Seat): Move | null {
  const p = toMove(s);
  const moves = legalMoves(s.board, s.hand, p);
  if (!moves.length) return null;
  for (const m of moves) {
    const [b] = applyRaw(s.board, s.hand, p, m);
    const { winners } = lineScan(b);
    if (winners.length === 1 && winners[0] === p) return m; // a win on the board is always taken
  }
  // An ally never leaves the guest a ready-made line when one of its own moves can take it away,
  // and never opens one (for example by lifting a piece off a guest piece).
  let pool = moves;
  if (p !== guest) {
    const safe = moves.filter((m) => {
      const [b, h] = applyRaw(s.board, s.hand, p, m);
      return lineScan(b).winners.length === 0 && !hasWin(b, h, guest);
    });
    if (safe.length) pool = safe;
  }
  const ctx: Ctx = { guest, beams: BEAMS };
  const next = (s.turn + 1) % 4;
  let best: Move = pool[0], bestV = -Infinity;
  for (const m of pool) {
    const [b, h] = applyRaw(s.board, s.hand, p, m);
    const { winners } = lineScan(b);
    const v = (winners.length ? terminal(winners, guest) : maxn(b, h, s.order, next, DEPTH - 1, ctx))[p];
    if (v > bestV) { bestV = v; best = m; }
  }
  return best;
}

export const CELL_NAME = (i: number) => `${'ABCD'[i % SIZE]}${Math.floor(i / SIZE) + 1}`;

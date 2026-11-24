// 카드 장기 (Card Janggi) — 「데블스 플랜: 데드 어게인」 결승전 1회차 매치. Pure rules engine.
//
// Board: 6 columns (x 0–5, seat 0's side at x = 0) × 5 rows (y 0–4), as on the show's screen.
// Each side has a big piece (왕) and three small pieces, set out as on the show:
//   seat 0: 왕 (0,2), small (0,1) (1,2) (0,3)      seat 1: 왕 (5,2), small (5,1) (4,2) (5,3)
// Five movement cards, the same for both sides (all moves are symmetric, so the board's orientation does not matter):
//   쥐 rat      — one square up, down, left or right
//   말 horse    — a chess knight's jump
//   원숭이 monkey — any of the eight neighbouring squares
//   코끼리 elephant — a chess bishop: any distance diagonally, stopped by the first piece (an enemy one can be taken)
//   기린 giraffe — exactly two squares up, down, left or right, jumping over whatever is between (as drawn on the card)
//
// A round: a coin decides who goes first (선); then it alternates every round. Both lay out their cards face down at
// the same time — 선 all five, 후 four of the five (its first cycle only) — and turn the first one up together.
// Moves alternate from 선: the mover moves any of their pieces as the face-up card allows, then turns up their next
// card. A player who has just used their last card lays out all five again at once and turns the first one up; the
// other player then moves (so 선 always sees 후's new first card before using its own last one, and vice versa).
// Moving onto an enemy piece takes it. A round is won by taking the enemy 왕 or by moving your own 왕 onto the square
// the enemy 왕 started on. The match is a single round (PUZZLTHINK: one round, for quick games).
//
// Calls the show left open (ours):
// - A card with no legal move is used up without a move (rare: only when every piece is boxed in).
// - Giraffe jumps; elephant slides and is blocked. Neither may land on your own piece.
// - A round that reaches CJ_MAX_PLY moves without a result goes to the side with more pieces left, else it is a draw
//   (a drawn round scores for nobody; the match goes on, at most CJ_MAX_ROUNDS rounds).

export const CJ_W = 6;
export const CJ_H = 5;
export const CJ_CELLS = CJ_W * CJ_H;
export const CJ_MAX_PLY = 60;
export const CJ_WINS = 1;
export const CJ_MAX_ROUNDS = 1;

export type CjSeat = 0 | 1;
/** 0 rat 쥐 · 1 horse 말 · 2 monkey 원숭이 · 3 elephant 코끼리 · 4 giraffe 기린 */
export type CjCard = 0 | 1 | 2 | 3 | 4;
export const CJ_CARDS: readonly CjCard[] = [0, 1, 2, 3, 4];
export const CJ_CARD_KEYS = ['rat', 'horse', 'monkey', 'elephant', 'giraffe'] as const;

/** Cell contents: 0 empty, 1 seat-0 small, 2 seat-0 왕, 3 seat-1 small, 4 seat-1 왕. */
export const smallOf = (seat: number) => 1 + 2 * seat;
export const kingOf = (seat: number) => 2 + 2 * seat;
export const seatOfPiece = (p: number) => (p - 1) >> 1;
export const isKing = (p: number) => p > 0 && p % 2 === 0;
export const other = (seat: number) => (1 - seat) as CjSeat;
export const cellOf = (x: number, y: number) => y * CJ_W + x;
export const xOf = (cell: number) => cell % CJ_W;
export const yOf = (cell: number) => Math.floor(cell / CJ_W);

/** Where each side's 왕 starts: the square the other side must reach. */
export const KING_HOME: readonly [number, number] = [cellOf(0, 2), cellOf(5, 2)];
export const goalOf = (seat: number) => KING_HOME[1 - seat];

export function startBoard(): number[] {
  const board = Array<number>(CJ_CELLS).fill(0);
  board[cellOf(0, 2)] = kingOf(0);
  for (const [x, y] of [[0, 1], [1, 2], [0, 3]]) board[cellOf(x, y)] = smallOf(0);
  board[cellOf(5, 2)] = kingOf(1);
  for (const [x, y] of [[5, 1], [4, 2], [5, 3]]) board[cellOf(x, y)] = smallOf(1);
  return board;
}

// Move tables. Jumps (every card but the elephant): target squares per square. Rays (elephant): four diagonals.
const STEPS: Record<number, [number, number][]> = {
  0: [[1, 0], [-1, 0], [0, 1], [0, -1]],
  1: [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]],
  2: [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]],
  4: [[2, 0], [-2, 0], [0, 2], [0, -2]],
};
const inside = (x: number, y: number) => x >= 0 && x < CJ_W && y >= 0 && y < CJ_H;
export const JUMPS: number[][][] = [0, 1, 2, 3, 4].map((card) => Array.from({ length: CJ_CELLS }, (_, cell) => {
  if (card === 3) return [];
  return STEPS[card].map(([dx, dy]) => [xOf(cell) + dx, yOf(cell) + dy]).filter(([x, y]) => inside(x, y)).map(([x, y]) => cellOf(x, y));
}));
export const RAYS: number[][][] = Array.from({ length: CJ_CELLS }, (_, cell) => [[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([dx, dy]) => {
  const ray: number[] = [];
  for (let x = xOf(cell) + dx, y = yOf(cell) + dy; inside(x, y); x += dx, y += dy) ray.push(cellOf(x, y));
  return ray;
}));

/** Squares the piece on `from` may move to with `card` (empty or enemy squares). */
export function targetsOf(board: readonly number[], from: number, card: number): number[] {
  const piece = board[from];
  if (!piece) return [];
  const seat = seatOfPiece(piece);
  const out: number[] = [];
  const free = (cell: number) => board[cell] === 0 || seatOfPiece(board[cell]) !== seat;
  if (card === 3) {
    for (const ray of RAYS[from]) for (const cell of ray) { if (free(cell)) out.push(cell); if (board[cell]) break; }
  } else {
    for (const cell of JUMPS[card][from]) if (free(cell)) out.push(cell);
  }
  return out;
}

export type CjMovePair = [from: number, to: number];
export function legalMoves(board: readonly number[], seat: number, card: number): CjMovePair[] {
  const moves: CjMovePair[] = [];
  for (let cell = 0; cell < CJ_CELLS; cell += 1) {
    const p = board[cell];
    if (p && seatOfPiece(p) === seat) for (const to of targetsOf(board, cell, card)) moves.push([cell, to]);
  }
  return moves;
}

/** One move in a round. `cap`: what was taken (cell code). `pass`: the card had no legal move. `proxy`: made by the opponent after a timeout. */
export type CjMove = { seat: CjSeat; card: number; from: number; to: number; cap: number; pass?: boolean; proxy?: boolean };

export type CjGame = {
  board: number[];
  first: CjSeat; // 선 this round
  phase: 'arrange' | 'move' | 'over';
  turn: CjSeat; // whose move it is (in 'arrange': who moves once the layout is in)
  arranging: [boolean, boolean]; // who has to lay out their cards now
  seq: number[][]; // each side's current layout; -1 = a face-down card this browser may not see
  past?: number[][][]; // each side's earlier layouts this round (all played, so public)
  pos: [number, number]; // index of each side's next card (the face-up one)
  cycle: [number, number]; // layouts made so far this round
  ply: number;
  history: CjMove[];
  winner: CjSeat | 'draw' | null;
  reason: 'capture' | 'goal' | 'limit' | null;
};

/** Cards in the layout a side has to make now: 후 uses four in its first cycle, everything else is five. */
export const layoutSize = (g: Pick<CjGame, 'cycle' | 'first'>, seat: number) => (g.cycle[seat] === 0 && seat !== g.first ? 4 : 5);

export function newRound(first: CjSeat): CjGame {
  return {
    board: startBoard(), first, phase: 'arrange', turn: first, arranging: [true, true], seq: [[], []], past: [[], []], pos: [0, 0], cycle: [0, 0],
    ply: 0, history: [], winner: null, reason: null,
  };
}

export const currentCard = (g: CjGame, seat: number): number => g.seq[seat]?.[g.pos[seat]] ?? -1;

/** Whether `order` is a valid layout for `seat` right now. */
export function validLayout(g: CjGame, seat: number, order: unknown): order is number[] {
  if (g.phase !== 'arrange' || !g.arranging[seat] || !Array.isArray(order)) return false;
  if (order.length !== layoutSize(g, seat)) return false;
  return order.every((c) => Number.isInteger(c) && c >= 0 && c <= 4) && new Set(order).size === order.length;
}

const pieces = (board: readonly number[], seat: number) => board.reduce((n, p) => n + (p && seatOfPiece(p) === seat ? 1 : 0), 0);

function finish(g: CjGame, winner: CjSeat | 'draw', reason: CjGame['reason']): CjGame {
  return { ...g, phase: 'over', winner, reason, arranging: [false, false] };
}

/** After a card is used (moved or passed): end of round, a new layout, or the other side's turn. */
function afterCard(g: CjGame, seat: CjSeat): CjGame {
  if (g.ply >= CJ_MAX_PLY) {
    const a = pieces(g.board, 0), b = pieces(g.board, 1);
    return finish(g, a === b ? 'draw' : a > b ? 0 : 1, 'limit');
  }
  if (g.pos[seat] >= g.seq[seat].length) {
    return { ...g, phase: 'arrange', arranging: seat === 0 ? [true, false] : [false, true], turn: other(seat) };
  }
  return settle({ ...g, turn: other(seat) });
}

/** A side whose face-up card cannot move anything uses it up without a move. */
function settle(g: CjGame): CjGame {
  let game = g;
  for (let guard = 0; guard < 20 && game.phase === 'move'; guard += 1) {
    const seat = game.turn;
    const card = currentCard(game, seat);
    if (card < 0 || legalMoves(game.board, seat, card).length) return game;
    game = afterCard({ ...game, pos: setAt(game.pos, seat, game.pos[seat] + 1), ply: game.ply + 1, history: [...game.history, { seat, card, from: -1, to: -1, cap: 0, pass: true }] }, seat);
  }
  return game;
}

const setAt = <T,>(pair: [T, T], i: number, value: T): [T, T] => (i === 0 ? [value, pair[1]] : [pair[0], value]);

/** Lays out `seat`'s cards. Returns null if that is not allowed now. */
export function arrange(g: CjGame, seat: CjSeat, order: number[]): CjGame | null {
  if (!validLayout(g, seat, order)) return null;
  const arranging = setAt(g.arranging, seat, false);
  const seq = g.seq.map((s, i) => (i === seat ? [...order] : s));
  const past = (g.past ?? [[], []]).map((cycles, i) => (i === seat && g.seq[seat].length ? [...cycles, g.seq[seat]] : cycles));
  const next: CjGame = { ...g, seq, past, pos: setAt(g.pos, seat, 0), cycle: setAt(g.cycle, seat, g.cycle[seat] + 1), arranging };
  return arranging[0] || arranging[1] ? next : settle({ ...next, phase: 'move' });
}

/** Plays the mover's face-up card: `from` → `to`. `proxy`: the opponent chose it after a timeout. */
export function playMove(g: CjGame, from: number, to: number, proxy = false): CjGame | null {
  if (g.phase !== 'move') return null;
  const seat = g.turn;
  const card = currentCard(g, seat);
  if (card < 0 || !Number.isInteger(from) || !Number.isInteger(to)) return null;
  const piece = g.board[from];
  if (!piece || seatOfPiece(piece) !== seat || !targetsOf(g.board, from, card).includes(to)) return null;
  const board = [...g.board];
  const cap = board[to];
  board[to] = piece;
  board[from] = 0;
  const move: CjMove = { seat, card, from, to, cap, ...(proxy ? { proxy: true } : {}) };
  const next: CjGame = { ...g, board, pos: setAt(g.pos, seat, g.pos[seat] + 1), ply: g.ply + 1, history: [...g.history, move] };
  if (cap === kingOf(other(seat))) return finish(next, seat, 'capture');
  if (isKing(piece) && to === goalOf(seat)) return finish(next, seat, 'goal');
  return afterCard(next, seat);
}

/** A random layout (used when the clock runs out before one is made). */
export function randomLayout(g: CjGame, seat: number): number[] {
  const cards = [...CJ_CARDS].sort(() => Math.random() - 0.5);
  return cards.slice(0, layoutSize(g, seat));
}

/**
 * What `viewer` may see: the other side's used cards and its face-up card, never the face-down ones
 * (and nothing of either layout before both are in at the start of a round). viewer null = a spectator.
 */
export function redactGame(g: CjGame, viewer: number | null): CjGame {
  const hidden = (seat: number) => seat !== viewer;
  const startHidden = g.phase === 'arrange' && g.ply === 0;
  const seq = g.seq.map((s, seat) => (hidden(seat) && g.phase !== 'over' ? s.map((c, i) => (i < g.pos[seat] || (i === g.pos[seat] && !startHidden) ? c : -1)) : s));
  return { ...g, seq };
}

/** Cards the other side may still play this cycle, face-down ones included (their order unknown). */
export function cardsLeft(g: CjGame, seat: number): { next: number; hidden: number; pool: number[] } {
  const s = g.seq[seat] ?? [];
  const used = new Set(s.slice(0, g.pos[seat]));
  const rest = s.slice(g.pos[seat]);
  const next = rest[0] ?? -1;
  return { next, hidden: rest.filter((c) => c < 0).length, pool: CJ_CARDS.filter((c) => !used.has(c) && c !== next) };
}

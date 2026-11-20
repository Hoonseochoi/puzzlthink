// 나인 멘스 모리스 (Nine Men's Morris), as played in The Devil's Plan 1 final:
// 24 points, nine pieces each. Place all nine in turns, then move along a line to a free neighbour.
// Three of yours in a straight line (a mill) removes one enemy piece that is not itself in a mill.
// Down to three pieces, you may fly to any free point. Two pieces left, or no move on your turn, loses.
// Once a player is down to three, ten turns each without a capture end the round: fewer pieces loses.

export type Player = 0 | 1; // 0 = black (moves first in a round), 1 = white
export type Cell = Player | null;

/** Point names as on the broadcast board (columns A–G, rows 1–7), in board order top to bottom. */
export const POINTS = [
  'A7', 'D7', 'G7',
  'B6', 'D6', 'F6',
  'C5', 'D5', 'E5',
  'A4', 'B4', 'C4', 'E4', 'F4', 'G4',
  'C3', 'D3', 'E3',
  'B2', 'D2', 'F2',
  'A1', 'D1', 'G1',
] as const;
export const POINT_COUNT = POINTS.length;

/** Where each point sits on a 7×7 grid (col 0–6 from A, row 0–6 from the top). */
export const POS = POINTS.map((name) => ({ col: name.charCodeAt(0) - 65, row: 7 - Number(name[1]) }));

const idx = (name: string) => POINTS.indexOf(name as (typeof POINTS)[number]);

/** The 16 straight lines of three. */
export const MILLS: [number, number, number][] = ([
  ['A7', 'D7', 'G7'], ['B6', 'D6', 'F6'], ['C5', 'D5', 'E5'], ['A4', 'B4', 'C4'],
  ['E4', 'F4', 'G4'], ['C3', 'D3', 'E3'], ['B2', 'D2', 'F2'], ['A1', 'D1', 'G1'],
  ['A7', 'A4', 'A1'], ['B6', 'B4', 'B2'], ['C5', 'C4', 'C3'], ['D7', 'D6', 'D5'],
  ['D3', 'D2', 'D1'], ['E5', 'E4', 'E3'], ['F6', 'F4', 'F2'], ['G7', 'G4', 'G1'],
] as const).map((line) => line.map(idx) as [number, number, number]);

/** Neighbours along the drawn lines. */
export const ADJ: number[][] = (() => {
  const adj: number[][] = POINTS.map(() => []);
  for (const [a, b, c] of MILLS) { adj[a].push(b); adj[b].push(a, c); adj[c].push(b); }
  return adj;
})();

const MILLS_AT: [number, number, number][][] = POINTS.map((_, i) => MILLS.filter((m) => m.includes(i)));

export const PIECES = 9;
export const STALL_TURNS = 10; // turns each, once someone is down to three
export const QUIET_LIMIT = 120; // half-moves without a capture before the round is drawn anyway

export type Move = { from: number | null; to: number; remove: number | null };

export type MorrisState = {
  board: Cell[];
  hand: [number, number]; // pieces still to place
  turn: Player;
  stall: number; // half-moves without a capture since someone has had three pieces
  quiet: number; // half-moves without a capture
  winner: Player | 'draw' | null;
  reason: 'pieces' | 'blocked' | 'stall' | 'draw' | 'resign' | 'timeout' | null;
  last: Move | null;
  captured: [number, number]; // pieces each player has taken
};

export const newMorris = (): MorrisState => ({
  board: Array(POINT_COUNT).fill(null), hand: [PIECES, PIECES], turn: 0, stall: 0, quiet: 0,
  winner: null, reason: null, last: null, captured: [0, 0],
});

export const other = (p: Player): Player => (p === 0 ? 1 : 0);
export const onBoard = (board: Cell[], p: Player) => board.reduce<number>((n, c) => n + (c === p ? 1 : 0), 0);
export const total = (s: MorrisState, p: Player) => onBoard(s.board, p) + s.hand[p];
export const placing = (s: MorrisState, p: Player = s.turn) => s.hand[p] > 0;
/** A player flies once all pieces are down and only three remain. */
export const flying = (s: MorrisState, p: Player = s.turn) => s.hand[p] === 0 && onBoard(s.board, p) === 3;

export const inMill = (board: Cell[], i: number) => {
  const p = board[i];
  return p !== null && MILLS_AT[i].some((m) => m.every((j) => board[j] === p));
};

/** Whether moving `from` (or placing, from = null) to `to` closes a mill for player `p`. */
export function closesMill(board: Cell[], p: Player, from: number | null, to: number) {
  return MILLS_AT[to].some((m) => m.every((j) => (j === to ? true : j !== from && board[j] === p)));
}

/** Enemy pieces that may be removed: those not in a mill (none at all if every one is in a mill). */
export function removable(board: Cell[], victim: Player) {
  return board.flatMap((c, i) => (c === victim && !inMill(board, i) ? [i] : []));
}

/** Points the piece on `from` can go to now. */
export function targets(s: MorrisState, from: number) {
  if (s.board[from] !== s.turn || placing(s)) return [];
  if (flying(s)) return s.board.flatMap((c, i) => (c === null ? [i] : []));
  return ADJ[from].filter((j) => s.board[j] === null);
}

/** Pieces of the side to move that have somewhere to go. */
export function movable(s: MorrisState) {
  if (placing(s)) return [];
  return s.board.flatMap((c, i) => (c === s.turn && targets(s, i).length ? [i] : []));
}

/** Every legal move for the side to move, removals included. */
export function legalMoves(s: MorrisState): Move[] {
  if (s.winner !== null) return [];
  const p = s.turn;
  const steps: { from: number | null; to: number }[] = [];
  if (placing(s)) s.board.forEach((c, i) => { if (c === null) steps.push({ from: null, to: i }); });
  else for (const from of movable(s)) for (const to of targets(s, from)) steps.push({ from, to });
  const moves: Move[] = [];
  for (const { from, to } of steps) {
    if (!closesMill(s.board, p, from, to)) { moves.push({ from, to, remove: null }); continue; }
    const after = s.board.slice();
    if (from !== null) after[from] = null;
    after[to] = p;
    const victims = removable(after, other(p));
    if (!victims.length) moves.push({ from, to, remove: null });
    else for (const r of victims) moves.push({ from, to, remove: r });
  }
  return moves;
}

export function isLegal(s: MorrisState, move: Move) {
  return legalMoves(s).some((m) => m.from === move.from && m.to === move.to && m.remove === move.remove);
}

/** Plays a legal move (no check) and settles the round if it is over. */
export function play(s: MorrisState, move: Move): MorrisState {
  const p = s.turn;
  const board = s.board.slice();
  if (move.from !== null) board[move.from] = null;
  board[move.to] = p;
  if (move.remove !== null) board[move.remove] = null;
  const hand: [number, number] = [s.hand[0], s.hand[1]];
  if (move.from === null) hand[p] -= 1;
  const captured: [number, number] = [s.captured[0], s.captured[1]];
  if (move.remove !== null) captured[p] += 1;
  const took = move.remove !== null;
  const next: MorrisState = { ...s, board, hand, captured, turn: other(p), last: move, quiet: took ? 0 : s.quiet + 1, stall: 0 };
  const low = ([0, 1] as Player[]).some((q) => hand[q] === 0 && onBoard(board, q) === 3);
  next.stall = low && !took ? s.stall + 1 : 0;
  return settle(next);
}

/** Decides the round after a move: too few pieces, no move, or the stall rule. */
export function settle(s: MorrisState): MorrisState {
  for (const p of [0, 1] as Player[]) if (total(s, p) < 3) return { ...s, winner: other(p), reason: 'pieces' };
  if (!placing(s) && movable(s).length === 0) return { ...s, winner: other(s.turn), reason: 'blocked' };
  if (s.stall >= STALL_TURNS * 2) {
    const a = total(s, 0), b = total(s, 1);
    return { ...s, winner: a === b ? 'draw' : a > b ? 0 : 1, reason: a === b ? 'draw' : 'stall' };
  }
  if (s.quiet >= QUIET_LIMIT) return { ...s, winner: 'draw', reason: 'draw' };
  return s;
}

/** Turns left before the stall rule ends the round (null while nobody is down to three). */
export const stallLeft = (s: MorrisState) => {
  const low = ([0, 1] as Player[]).some((q) => s.hand[q] === 0 && onBoard(s.board, q) === 3);
  return low ? Math.max(0, STALL_TURNS - Math.floor(s.stall / 2)) : null;
};

// ——— AI ———

export type MorrisLevel = 'easy' | 'normal' | 'hard';
const DEPTH: Record<MorrisLevel, number> = { easy: 2, normal: 3, hard: 5 };

function evaluate(s: MorrisState, me: Player): number {
  if (s.winner !== null) return s.winner === 'draw' ? 0 : s.winner === me ? 100_000 : -100_000;
  const you = other(me);
  let score = (total(s, me) - total(s, you)) * 1000;
  // Two in a line with the third point free: a mill threat.
  for (const m of MILLS) {
    let mine = 0, theirs = 0, free = 0;
    for (const j of m) { const c = s.board[j]; if (c === me) mine += 1; else if (c === you) theirs += 1; else free += 1; }
    if (mine === 2 && free === 1) score += 90;
    if (theirs === 2 && free === 1) score -= 110;
    if (mine === 3) score += 40;
    if (theirs === 3) score -= 40;
  }
  // Room to move (it decides the game once placing ends; a side with no move loses).
  const w = s.hand[me] + s.hand[you] <= 4 ? 14 : 5;
  if (!flying(s, me)) score += countMoves(s, me) * w;
  if (!flying(s, you)) score -= countMoves(s, you) * w;
  // Junction points (four neighbours) are worth more while placing.
  s.board.forEach((c, i) => { if (c !== null) score += (c === me ? 1 : -1) * (ADJ[i].length - 2) * 8; });
  return score;
}

function countMoves(s: MorrisState, p: Player) {
  let n = 0;
  s.board.forEach((c, i) => { if (c === p) for (const j of ADJ[i]) if (s.board[j] === null) n += 1; });
  return n;
}

function search(s: MorrisState, depth: number, alpha: number, beta: number, me: Player, budget: { n: number }): number {
  budget.n -= 1;
  if (depth === 0 || s.winner !== null || budget.n <= 0) return evaluate(s, me) + (s.winner !== null ? depth : 0);
  const moves = order(legalMoves(s));
  if (s.turn === me) {
    let best = -Infinity;
    for (const m of moves) { best = Math.max(best, search(play(s, m), depth - 1, alpha, beta, me, budget)); alpha = Math.max(alpha, best); if (alpha >= beta) break; }
    return best;
  }
  let best = Infinity;
  for (const m of moves) { best = Math.min(best, search(play(s, m), depth - 1, alpha, beta, me, budget)); beta = Math.min(beta, best); if (alpha >= beta) break; }
  return best;
}

/** Captures first, so alpha-beta cuts early. */
const order = (moves: Move[]) => moves.sort((a, b) => (b.remove !== null ? 1 : 0) - (a.remove !== null ? 1 : 0));

/** The AI's move for the side to move. Easy looks two half-moves ahead and often slips; hard looks five half-moves on. */
export function chooseMorrisMove(s: MorrisState, level: MorrisLevel = 'normal'): Move | null {
  const moves = legalMoves(s);
  if (!moves.length) return null;
  const me = s.turn;
  // Fewer pieces means a smaller tree, so look deeper in the endgame.
  const depth = DEPTH[level] + (level === 'hard' && moves.length < 12 ? 1 : 0);
  const budget = { n: level === 'hard' ? 400_000 : 40_000 };
  const scored = order(moves.slice()).map((m) => ({ m, v: search(play(s, m), depth - 1, -Infinity, Infinity, me, budget) + Math.random() * (level === 'easy' ? 700 : 8) }));
  scored.sort((a, b) => b.v - a.v);
  return scored[0].m;
}

/** A random legal move (used when a player's clock runs out). */
export function randomMove(s: MorrisState): Move | null {
  const moves = legalMoves(s);
  return moves.length ? moves[Math.floor(Math.random() * moves.length)] : null;
}

export const moveLabel = (m: Move) => `${m.from === null ? '' : `${POINTS[m.from]}→`}${POINTS[m.to]}${m.remove !== null ? ` ✕${POINTS[m.remove]}` : ''}`;

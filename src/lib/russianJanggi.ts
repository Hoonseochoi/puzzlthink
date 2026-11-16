// 러시아장기 (Russian janggi): 3×3 tic-tac-toe where bigger pieces cover smaller ones.
// Each side has two small, two medium and two large pieces. Pieces are only placed from the hand;
// a piece may go on an empty cell or on top of any smaller piece (either colour). Three of your
// colour showing on top in a row wins. A side with no legal placement (or out of time) passes.

export type Side = 0 | 1;
export type Size = 0 | 1 | 2; // small, medium, large
export type Piece = { owner: Side; size: Size };
export type Action = { kind: 'place'; size: Size; to: number } | { kind: 'pass' };
export type Reason = 'line' | 'draw' | 'resign' | 'timeout' | 'abandon';
export type Difficulty = 'easy' | 'normal' | 'hard';

export type RJState = {
  board: Piece[][]; // per cell, bottom → top
  hands: [number[], number[]]; // pieces left per size, per side
  turn: Side;
  ply: number;
  winner: Side | null;
  reason: Reason | null;
  line: number[] | null;
  last: { to: number; size: Size; owner: Side; covered: Piece | null } | null;
  skipped: Side | null; // who was skipped (no legal move or timeout) right before this turn
};

export const SIZES: Size[] = [0, 1, 2];
export const PER_SIZE = 2;
export const TURN_SECONDS = 10;
export const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

export const other = (side: Side): Side => (side === 0 ? 1 : 0);
export const top = (state: RJState, cell: number): Piece | null => state.board[cell][state.board[cell].length - 1] ?? null;
export const isOver = (state: RJState) => state.winner !== null || state.reason !== null;

export function initialState(first: Side = 0): RJState {
  return {
    board: Array.from({ length: 9 }, () => []),
    hands: [[PER_SIZE, PER_SIZE, PER_SIZE], [PER_SIZE, PER_SIZE, PER_SIZE]],
    turn: first, ply: 0, winner: null, reason: null, line: null, last: null, skipped: null,
  };
}

export const canPlace = (state: RJState, size: Size, cell: number) => {
  const t = top(state, cell);
  return !t || t.size < size;
};

export function targetsFor(state: RJState, side: Side, size: Size): number[] {
  if (state.hands[side][size] <= 0) return [];
  return Array.from({ length: 9 }, (_, i) => i).filter((i) => canPlace(state, size, i));
}

export function legalPlacements(state: RJState, side: Side = state.turn): Action[] {
  const out: Action[] = [];
  for (const size of [2, 1, 0] as Size[]) for (const to of targetsFor(state, side, size)) out.push({ kind: 'place', size, to });
  return out;
}

export function isLegal(state: RJState, action: Action): boolean {
  if (isOver(state)) return false;
  if (action.kind === 'pass') return true;
  return SIZES.includes(action.size) && Number.isInteger(action.to) && action.to >= 0 && action.to < 9
    && state.hands[state.turn][action.size] > 0 && canPlace(state, action.size, action.to);
}

export function winningLine(state: RJState, side: Side): number[] | null {
  return LINES.find((line) => line.every((cell) => top(state, cell)?.owner === side)) ?? null;
}

export const finish = (state: RJState, winner: Side | null, reason: Reason): RJState => ({ ...state, winner, reason });

/** Hands the turn on, skipping a side that cannot place; ends in a draw if nobody can. */
function passTo(state: RJState, next: Side, skipped: Side | null): RJState {
  if (legalPlacements(state, next).length) return { ...state, turn: next, skipped };
  if (legalPlacements(state, other(next)).length) return { ...state, turn: other(next), skipped: next };
  return { ...state, turn: next, skipped: null, reason: 'draw' };
}

export function applyAction(state: RJState, action: Action): RJState {
  if (!isLegal(state, action)) return state;
  const side = state.turn;
  if (action.kind === 'pass') return passTo({ ...state, ply: state.ply + 1, last: null }, other(side), side);
  const board = state.board.map((stack, i) => (i === action.to ? [...stack, { owner: side, size: action.size }] : stack));
  const hands = state.hands.map((h, s) => (s === side ? h.map((n, z) => (z === action.size ? n - 1 : n)) : h)) as [number[], number[]];
  const placed: RJState = {
    ...state, board, hands, ply: state.ply + 1,
    last: { to: action.to, size: action.size, owner: side, covered: top(state, action.to) },
  };
  const line = winningLine(placed, side);
  if (line) return { ...placed, winner: side, reason: 'line', line };
  return passTo(placed, other(side), null);
}

// ---------------------------------------------------------------- AI
// Search works on a small mutable copy (do/undo) so it can look deep within a time budget.

type Search = { stacks: number[][]; hands: number[]; deadline: number; table: Map<string, number> }; // code = owner*3+size
const CELL_LINES = Array.from({ length: 9 }, (_, c) => LINES.filter((l) => l.includes(c)));
const MOVE_ORDER = [4, 0, 2, 6, 8, 1, 3, 5, 7];
class Timeout extends Error {}

const sTop = (s: Search, c: number) => { const st = s.stacks[c]; return st.length ? st[st.length - 1] : -1; };
const ownerOf = (code: number) => (code < 0 ? -1 : code >= 3 ? 1 : 0);

function sWins(s: Search, side: number, cell: number) {
  return CELL_LINES[cell].some((l) => l.every((c) => ownerOf(sTop(s, c)) === side));
}

function sMoves(s: Search, side: number): number[] {
  const out: number[] = []; // move = size*9+cell
  for (let size = 2; size >= 0; size--) {
    if (!s.hands[side * 3 + size]) continue;
    for (const c of MOVE_ORDER) { const t = sTop(s, c); if (t < 0 || t % 3 < size) out.push(size * 9 + c); }
  }
  return out;
}

function sEval(s: Search, side: number): number {
  let score = 0;
  for (const line of LINES) {
    let mine = 0, theirs = 0, mineBig = 0, theirsBig = 0;
    for (const c of line) {
      const t = sTop(s, c);
      if (t < 0) continue;
      if (ownerOf(t) === side) { mine++; if (t % 3 === 2) mineBig++; } else { theirs++; if (t % 3 === 2) theirsBig++; }
    }
    if (!theirs) score += mine * mine * 3 + mineBig * 2;
    if (!mine) score -= theirs * theirs * 3 + theirsBig * 2;
  }
  const centre = sTop(s, 4);
  if (centre >= 0) score += ownerOf(centre) === side ? 4 : -4;
  const o = 1 - side;
  score += (s.hands[side * 3 + 2] - s.hands[o * 3 + 2]) * 3 + (s.hands[side * 3 + 1] - s.hands[o * 3 + 1]);
  return score;
}

function sNegamax(s: Search, side: number, depth: number, alpha: number, beta: number, ply: number, passed: boolean): number {
  if (Date.now() > s.deadline) throw new Timeout();
  const moves = sMoves(s, side);
  if (!moves.length) {
    if (passed) return 0; // nobody can move: draw
    return -sNegamax(s, 1 - side, depth, -beta, -alpha, ply, true);
  }
  if (depth === 0) return sEval(s, side);
  const k = depth >= 2 ? s.stacks.map((st) => st.join('')).join('|') + s.hands.join('') + side + depth : '';
  if (k) { const hit = s.table.get(k); if (hit !== undefined) return hit; }
  const origAlpha = alpha;
  let best = -Infinity;
  for (const m of moves) {
    const size = Math.floor(m / 9), cell = m % 9;
    s.stacks[cell].push(side * 3 + size); s.hands[side * 3 + size]--;
    const value = sWins(s, side, cell) ? 1000 - ply : -sNegamax(s, 1 - side, depth - 1, -beta, -alpha, ply + 1, false);
    s.stacks[cell].pop(); s.hands[side * 3 + size]++;
    if (value > best) best = value;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  if (k && best > origAlpha && best < beta) s.table.set(k, best);
  return best;
}

/** Scores every root move with iterative deepening until the budget runs out. */
function rootScores(state: RJState, budgetMs: number, maxDepth: number): { action: Action; value: number }[] {
  const side = state.turn;
  const s: Search = {
    stacks: state.board.map((st) => st.map((p) => p.owner * 3 + p.size)),
    hands: [...state.hands[0], ...state.hands[1]], deadline: Date.now() + budgetMs, table: new Map(),
  };
  const moves = sMoves(s, side);
  let scores = moves.map(() => 0);
  for (let depth = 1; depth <= maxDepth; depth++) {
    try {
      const next = moves.map((m) => {
        const size = Math.floor(m / 9), cell = m % 9;
        s.stacks[cell].push(side * 3 + size); s.hands[side * 3 + size]--;
        try { return sWins(s, side, cell) ? 1000 : -sNegamax(s, 1 - side, depth - 1, -Infinity, Infinity, state.ply + 1, false); }
        finally { s.stacks[cell].pop(); s.hands[side * 3 + size]++; }
      });
      scores = next;
      s.table.clear();
      if (Math.max(...scores) >= 900 || Math.max(...scores) <= -900) break; // forced win found, or every move loses
    } catch (error) {
      if (error instanceof Timeout) break;
      throw error;
    }
  }
  return moves.map((m, i) => ({ action: { kind: 'place', size: Math.floor(m / 9) as Size, to: m % 9 }, value: scores[i] }));
}

export function chooseAiAction(state: RJState, difficulty: Difficulty): Action {
  const side = state.turn;
  const moves = legalPlacements(state, side);
  if (!moves.length) return { kind: 'pass' };
  const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

  if (difficulty === 'easy') {
    const winNow = moves.find((a) => applyAction(state, a).winner === side);
    if (winNow && Math.random() < 0.75) return winNow;
    if (Math.random() < 0.55) {
      const scored = rootScores(state, 60, 2).filter((x) => x.value > -900);
      if (scored.length) return pick(scored).action;
    }
    return pick(moves);
  }
  const scored = difficulty === 'hard' ? rootScores(state, 700, 12) : rootScores(state, 150, 2);
  const noise = difficulty === 'hard' ? 0.5 : 7;
  const ranked = scored.map((x) => ({ ...x, value: x.value + (Math.abs(x.value) >= 900 ? 0 : Math.random() * noise) })).sort((a, b) => b.value - a.value);
  return ranked[0].action;
}

// 러시아장기 (Russian janggi): 3×3 tic-tac-toe with cups that cover each other.
// Each side has two small, two medium and two large cups. On your turn you either place a cup from
// your hand, or move one of your own cups that is showing on the board to another cell. A cup may
// go on an empty cell or over any smaller cup (either colour). Three of your colour showing on top
// in a row wins — lifting a cup can reveal a line underneath, and if that line is the opponent's,
// they win. Out of time (or with nothing legal to do) the turn passes.

export type Side = 0 | 1;
export type Size = 0 | 1 | 2; // small, medium, large
export type Piece = { owner: Side; size: Size };
export type Action = { kind: 'place'; size: Size; to: number } | { kind: 'move'; from: number; to: number } | { kind: 'pass' };
export type Reason = 'line' | 'draw' | 'limit' | 'resign' | 'timeout' | 'abandon';
export type Difficulty = 'easy' | 'normal' | 'hard';

export type RJState = {
  board: Piece[][]; // per cell, bottom → top
  hands: [number[], number[]]; // pieces left per size, per side
  turn: Side;
  ply: number;
  winner: Side | null;
  reason: Reason | null;
  line: number[] | null;
  last: { from: number | null; to: number; size: Size; owner: Side; covered: Piece | null } | null;
  skipped: Side | null; // who was skipped (no legal move or timeout) right before this turn
  first: Side; // who moved first, so the game can be replayed from `moves`
  moves: Action[]; // every action played, passes included
};

export const SIZES: Size[] = [0, 1, 2];
export const PER_SIZE = 2;
export const TURN_SECONDS = 10;
export const MAX_PLY = 80; // moves can shuffle forever, so a long game ends in a draw
export const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const CELLS = Array.from({ length: 9 }, (_, i) => i);

export const other = (side: Side): Side => (side === 0 ? 1 : 0);
export const top = (state: RJState, cell: number): Piece | null => state.board[cell][state.board[cell].length - 1] ?? null;
export const isOver = (state: RJState) => state.winner !== null || state.reason !== null;

export function initialState(first: Side = 0): RJState {
  return {
    board: Array.from({ length: 9 }, () => []),
    hands: [[PER_SIZE, PER_SIZE, PER_SIZE], [PER_SIZE, PER_SIZE, PER_SIZE]],
    turn: first, ply: 0, winner: null, reason: null, line: null, last: null, skipped: null, first, moves: [],
  };
}

export const canPlace = (state: RJState, size: Size, cell: number) => {
  const t = top(state, cell);
  return !t || t.size < size;
};

/** Cells a cup of `size` from `side`'s hand can go to. */
export function targetsFor(state: RJState, side: Side, size: Size): number[] {
  if (state.hands[side][size] <= 0) return [];
  return CELLS.filter((i) => canPlace(state, size, i));
}

/** Cells the cup on top of `from` can move to (it must be `side`'s). */
export function moveTargets(state: RJState, side: Side, from: number): number[] {
  const cup = top(state, from);
  if (!cup || cup.owner !== side) return [];
  return CELLS.filter((i) => i !== from && canPlace(state, cup.size, i));
}

export function legalActions(state: RJState, side: Side = state.turn): Action[] {
  const out: Action[] = [];
  for (const size of [2, 1, 0] as Size[]) for (const to of targetsFor(state, side, size)) out.push({ kind: 'place', size, to });
  for (const from of CELLS) for (const to of moveTargets(state, side, from)) out.push({ kind: 'move', from, to });
  return out;
}

export function isLegal(state: RJState, action: Action): boolean {
  if (isOver(state)) return false;
  if (action.kind === 'pass') return true;
  const cell = (n: number) => Number.isInteger(n) && n >= 0 && n < 9;
  if (!cell(action.to)) return false;
  if (action.kind === 'move') return cell(action.from) && moveTargets(state, state.turn, action.from).includes(action.to);
  return SIZES.includes(action.size) && state.hands[state.turn][action.size] > 0 && canPlace(state, action.size, action.to);
}

export function winningLine(state: RJState, side: Side): number[] | null {
  return LINES.find((line) => line.every((cell) => top(state, cell)?.owner === side)) ?? null;
}

export const finish = (state: RJState, winner: Side | null, reason: Reason): RJState => ({ ...state, winner, reason });

/** Hands the turn on, skipping a side that cannot act; ends in a draw if nobody can. */
function passTo(state: RJState, next: Side, skipped: Side | null): RJState {
  if (state.ply >= MAX_PLY) return { ...state, turn: next, skipped: null, reason: 'limit' };
  if (legalActions(state, next).length) return { ...state, turn: next, skipped };
  if (legalActions(state, other(next)).length) return { ...state, turn: other(next), skipped: next };
  return { ...state, turn: next, skipped: null, reason: 'draw' };
}

export function applyAction(state: RJState, action: Action): RJState {
  if (!isLegal(state, action)) return state;
  const side = state.turn;
  const moves = [...(state.moves ?? []), action];
  if (action.kind === 'pass') return passTo({ ...state, moves, ply: state.ply + 1, last: null }, other(side), side);
  const from = action.kind === 'move' ? action.from : null;
  const cup: Piece = action.kind === 'move' ? top(state, action.from)! : { owner: side, size: action.size };
  const board = state.board.map((stack, i) => (i === from ? stack.slice(0, -1) : i === action.to ? [...stack, cup] : stack));
  const hands = action.kind === 'place'
    ? state.hands.map((h, s) => (s === side ? h.map((n, z) => (z === action.size ? n - 1 : n)) : h)) as [number[], number[]]
    : state.hands;
  const next: RJState = {
    ...state, board, hands, moves, ply: state.ply + 1,
    last: { from, to: action.to, size: cup.size, owner: side, covered: top(state, action.to) },
  };
  // Lifting a cup may reveal the opponent's line — that counts for them.
  const theirs = winningLine(next, other(side));
  if (theirs) return { ...next, winner: other(side), reason: 'line', line: theirs };
  const mine = winningLine(next, side);
  if (mine) return { ...next, winner: side, reason: 'line', line: mine };
  return passTo(next, other(side), null);
}

/** Every position of a finished (or ongoing) game, from the opening to the last move. */
export function replayStates(game: RJState): RJState[] {
  const states = [initialState(game.first ?? 0)];
  for (const action of game.moves ?? []) states.push(applyAction(states[states.length - 1], action));
  return states;
}

// ---------------------------------------------------------------- AI
// Search works on a small mutable copy (do/undo) so it can look deep within a time budget.

type Search = { stacks: number[][]; hands: number[]; deadline: number; table: Map<string, number> }; // code = owner*3+size
const MOVE_ORDER = [4, 0, 2, 6, 8, 1, 3, 5, 7];
class Timeout extends Error {}

const sTop = (s: Search, c: number) => { const st = s.stacks[c]; return st.length ? st[st.length - 1] : -1; };
const ownerOf = (code: number) => (code < 0 ? -1 : code >= 3 ? 1 : 0);

const sLine = (s: Search, side: number) => LINES.some((l) => l.every((c) => ownerOf(sTop(s, c)) === side));

/** Plays move `m` for `side`; returns how to undo it. */
function sDo(s: Search, side: number, m: number): () => void {
  if (m < 27) {
    const size = Math.floor(m / 9), cell = m % 9;
    s.stacks[cell].push(side * 3 + size); s.hands[side * 3 + size]--;
    return () => { s.stacks[cell].pop(); s.hands[side * 3 + size]++; };
  }
  const from = Math.floor((m - 27) / 9), to = (m - 27) % 9;
  const cup = s.stacks[from].pop()!;
  s.stacks[to].push(cup);
  return () => { s.stacks[to].pop(); s.stacks[from].push(cup); };
}

/** +1 if `side` just won with that move, -1 if it revealed the opponent's line, 0 otherwise. */
const sOutcome = (s: Search, side: number) => (sLine(s, 1 - side) ? -1 : sLine(s, side) ? 1 : 0);

const toAction = (m: number): Action => (m < 27
  ? { kind: 'place', size: Math.floor(m / 9) as Size, to: m % 9 }
  : { kind: 'move', from: Math.floor((m - 27) / 9), to: (m - 27) % 9 });

function sMoves(s: Search, side: number): number[] {
  const out: number[] = []; // move = size*9+cell
  for (let size = 2; size >= 0; size--) {
    if (!s.hands[side * 3 + size]) continue;
    for (const c of MOVE_ORDER) { const t = sTop(s, c); if (t < 0 || t % 3 < size) out.push(size * 9 + c); }
  }
  for (const from of MOVE_ORDER) {
    const cup = sTop(s, from);
    if (cup < 0 || ownerOf(cup) !== side) continue;
    for (const to of MOVE_ORDER) { if (to === from) continue; const t = sTop(s, to); if (t < 0 || t % 3 < cup % 3) out.push(27 + from * 9 + to); }
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
    const undo = sDo(s, side, m);
    const outcome = sOutcome(s, side);
    const value = outcome ? outcome * (1000 - ply) : -sNegamax(s, 1 - side, depth - 1, -beta, -alpha, ply + 1, false);
    undo();
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
        const undo = sDo(s, side, m);
        try { const outcome = sOutcome(s, side); return outcome ? outcome * 1000 : -sNegamax(s, 1 - side, depth - 1, -Infinity, Infinity, state.ply + 1, false); }
        finally { undo(); }
      });
      scores = next;
      s.table.clear();
      if (Math.max(...scores) >= 900 || Math.max(...scores) <= -900) break; // forced win found, or every move loses
    } catch (error) {
      if (error instanceof Timeout) break;
      throw error;
    }
  }
  return moves.map((m, i) => ({ action: toAction(m), value: scores[i] }));
}

export function chooseAiAction(state: RJState, difficulty: Difficulty): Action {
  const side = state.turn;
  const moves = legalActions(state, side);
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

// 십이장기 (12-janggi): 3 columns × 4 rows. Side 0 sits at the bottom (row 3), side 1 at the top (row 0).
export const COLS = 3;
export const ROWS = 4;
export const CELLS = COLS * ROWS;
export const MAX_PLY = 200; // draw after this many moves, so games always end

export type Side = 0 | 1;
export type PieceType = 'jang' | 'sang' | 'wang' | 'ja' | 'hu';
export type HandType = Exclude<PieceType, 'wang' | 'hu'>;
export type Piece = { type: PieceType; owner: Side };
export type Action = { kind: 'move'; from: number; to: number } | { kind: 'drop'; type: HandType; to: number };
export type WinReason = 'capture' | 'entry' | 'draw' | 'resign' | 'timeout';

export type JanggiState = {
  board: (Piece | null)[];
  hands: [HandType[], HandType[]];
  turn: Side;
  winner: Side | null;
  reason: WinReason | null;
  ply: number;
  last: Action | null;
  first?: Side; // who moved first — with `moves`, enough to replay the game
  moves?: Action[]; // kept by playAction only (the AI search uses applyAction and skips it)
};

export const HANJA: Record<PieceType, string> = { jang: '將', sang: '相', wang: '王', ja: '子', hu: '侯' };

// Directions as [dRow, dCol] with "forward" = up (-1 row), i.e. as seen by the bottom player.
export const DIRS: Record<PieceType, [number, number][]> = {
  jang: [[-1, 0], [1, 0], [0, -1], [0, 1]],
  sang: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
  wang: [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]],
  ja: [[-1, 0]],
  hu: [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0]],
};

export const idx = (row: number, col: number) => row * COLS + col;
export const rowOf = (i: number) => Math.floor(i / COLS);
export const colOf = (i: number) => i % COLS;
export const campRow = (side: Side) => (side === 0 ? ROWS - 1 : 0);
export const inCamp = (i: number, side: Side) => rowOf(i) === campRow(side);
export const cellName = (i: number) => `${String.fromCharCode(65 + colOf(i))}${ROWS - rowOf(i)}`;

export function initialState(first: Side = 0): JanggiState {
  const board: (Piece | null)[] = Array(CELLS).fill(null);
  board[idx(3, 0)] = { type: 'sang', owner: 0 };
  board[idx(3, 1)] = { type: 'wang', owner: 0 };
  board[idx(3, 2)] = { type: 'jang', owner: 0 };
  board[idx(2, 1)] = { type: 'ja', owner: 0 };
  board[idx(0, 0)] = { type: 'jang', owner: 1 };
  board[idx(0, 1)] = { type: 'wang', owner: 1 };
  board[idx(0, 2)] = { type: 'sang', owner: 1 };
  board[idx(1, 1)] = { type: 'ja', owner: 1 };
  return { board, hands: [[], []], turn: first, winner: null, reason: null, ply: 0, last: null, first, moves: [] };
}

/** Squares a piece on `from` can move to (ignores whose turn it is). */
export function targets(state: JanggiState, from: number): number[] {
  const piece = state.board[from];
  if (!piece) return [];
  const sign = piece.owner === 0 ? 1 : -1;
  const result: number[] = [];
  for (const [dr, dc] of DIRS[piece.type]) {
    const r = rowOf(from) + dr * sign, c = colOf(from) + dc * sign;
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) continue;
    const target = state.board[idx(r, c)];
    if (!target || target.owner !== piece.owner) result.push(idx(r, c));
  }
  return result;
}

export function dropTargets(state: JanggiState, side: Side): number[] {
  const enemy: Side = side === 0 ? 1 : 0;
  return state.board.flatMap((cell, i) => (!cell && !inCamp(i, enemy) ? [i] : []));
}

export function legalActions(state: JanggiState): Action[] {
  if (state.winner !== null || state.reason) return [];
  const side = state.turn;
  const actions: Action[] = [];
  state.board.forEach((piece, from) => {
    if (piece?.owner === side) for (const to of targets(state, from)) actions.push({ kind: 'move', from, to });
  });
  const drops = dropTargets(state, side);
  for (const type of new Set(state.hands[side])) for (const to of drops) actions.push({ kind: 'drop', type, to });
  return actions;
}

/** Board, both hands and side to move — two states with the same key are the same position. */
export function positionKey(state: JanggiState): string {
  const board = state.board.map((p) => (p ? `${p.owner}${p.type}` : '.')).join(',');
  return `${board}|${[...state.hands[0]].sort().join('')}|${[...state.hands[1]].sort().join('')}|${state.turn}`;
}

/** How many times each position has appeared in this game so far (needs `moves`, i.e. a game built with playAction). */
export function positionCounts(game: JanggiState): Map<string, number> {
  const counts = new Map<string, number>();
  if (!game.moves) return counts;
  for (const state of replayStates(game)) counts.set(positionKey(state), (counts.get(positionKey(state)) ?? 0) + 1);
  return counts;
}

/**
 * Legal actions in a real game: same as legalActions, but a move that would bring the same position
 * back for the third time is not allowed (no endless back-and-forth). If every move would do that,
 * the repetition ban is lifted so the player is never left without a move.
 */
export function playableActions(game: JanggiState): Action[] {
  const actions = legalActions(game);
  const counts = positionCounts(game);
  if (!counts.size) return actions;
  const fresh = actions.filter((action) => {
    const next = applyAction(game, action);
    return next.winner !== null || (counts.get(positionKey(next)) ?? 0) < 2;
  });
  return fresh.length ? fresh : actions;
}

const sameAction = (a: Action, b: Action) => a.kind === b.kind && a.to === b.to
  && (a.kind === 'move' ? b.kind === 'move' && a.from === b.from : b.kind === 'drop' && a.type === b.type);

/** Whether `action` may be played now, including the repetition ban. */
export function isLegal(state: JanggiState, action: Action) {
  return playableActions(state).some((a) => sameAction(a, action));
}

/** Applies a legal action. Captures go to the hand (侯 returns as 子). */
export function applyAction(state: JanggiState, action: Action): JanggiState {
  const side = state.turn;
  const enemy: Side = side === 0 ? 1 : 0;
  const board = [...state.board];
  const hands: [HandType[], HandType[]] = [[...state.hands[0]], [...state.hands[1]]];
  let winner: Side | null = null;
  let reason: WinReason | null = null;

  if (action.kind === 'move') {
    const piece = board[action.from]!;
    const captured = board[action.to];
    if (captured) {
      if (captured.type === 'wang') { winner = side; reason = 'capture'; }
      else hands[side].push(captured.type === 'hu' ? 'ja' : (captured.type as HandType));
    }
    const promoted = piece.type === 'ja' && inCamp(action.to, enemy);
    board[action.to] = promoted ? { type: 'hu', owner: side } : piece;
    board[action.from] = null;
  } else {
    hands[side].splice(hands[side].indexOf(action.type), 1);
    board[action.to] = { type: action.type, owner: side };
  }

  // A king that entered our camp last turn and survived our reply wins for its owner.
  if (winner === null) {
    const enemyKing = board.findIndex((p) => p?.type === 'wang' && p.owner === enemy);
    if (enemyKing >= 0 && inCamp(enemyKing, side)) { winner = enemy; reason = 'entry'; }
  }
  const ply = state.ply + 1;
  if (winner === null && ply >= MAX_PLY) reason = 'draw';
  return { board, hands, turn: enemy, winner, reason, ply, last: action };
}

/** applyAction for real games: also records the move so the game can be replayed. */
export function playAction(state: JanggiState, action: Action): JanggiState {
  return { ...applyAction(state, action), first: state.first, moves: [...(state.moves ?? []), action] };
}

/** Every position of a game, from the opening to its last move. */
export function replayStates(game: JanggiState): JanggiState[] {
  const states = [initialState(game.first ?? 0)];
  for (const action of game.moves ?? []) states.push(applyAction(states[states.length - 1], action));
  return states;
}

export function finish(state: JanggiState, winner: Side, reason: WinReason): JanggiState {
  return { ...state, winner, reason };
}

// ---------- AI ----------

export type Difficulty = 'easy' | 'normal' | 'hard';
const VALUE: Record<PieceType, number> = { ja: 1, sang: 3, jang: 4, hu: 4.5, wang: 0 };
const WIN = 10_000;

function evaluate(state: JanggiState, side: Side): number {
  let score = 0;
  state.board.forEach((piece, i) => {
    if (!piece) return;
    const sign = piece.owner === side ? 1 : -1;
    let value = VALUE[piece.type];
    if (piece.type === 'wang') {
      const advance = piece.owner === 0 ? ROWS - 1 - rowOf(i) : rowOf(i);
      value = advance * 0.35;
    }
    score += sign * value;
  });
  for (const s of [0, 1] as Side[]) for (const type of state.hands[s]) score += (s === side ? 1 : -1) * VALUE[type] * 0.9;
  return score;
}

function order(state: JanggiState, actions: Action[]) {
  // Captures of valuable pieces first: makes alpha-beta prune much more.
  const gain = (a: Action) => (a.kind === 'move' && state.board[a.to] ? (state.board[a.to]!.type === 'wang' ? 100 : VALUE[state.board[a.to]!.type]) : 0);
  return actions.sort((a, b) => gain(b) - gain(a));
}

function negamax(state: JanggiState, depth: number, alpha: number, beta: number, deadline: number): number {
  if (state.winner !== null) return state.winner === state.turn ? WIN + depth : -WIN - depth;
  if (state.reason === 'draw') return 0;
  if (depth === 0 || Date.now() > deadline) return evaluate(state, state.turn);
  let best = -Infinity;
  for (const action of order(state, legalActions(state))) {
    const value = -negamax(applyAction(state, action), depth - 1, -beta, -alpha, deadline);
    if (value > best) best = value;
    if (value > alpha) alpha = value;
    if (alpha >= beta) break;
  }
  return best === -Infinity ? 0 : best;
}

export function chooseAiAction(state: JanggiState, difficulty: Difficulty = 'normal'): Action | null {
  // The repetition ban is checked here at the root only; the search below looks at piece rules.
  const actions = playableActions(state);
  if (!actions.length) return null;
  const maxDepth = difficulty === 'easy' ? 1 : difficulty === 'normal' ? 3 : 7;
  const noise = difficulty === 'easy' ? 2.5 : difficulty === 'normal' ? 0.6 : 0.05;
  const deadline = Date.now() + (difficulty === 'hard' ? 900 : 400);
  let scored: { action: Action; value: number }[] = actions.map((action) => ({ action, value: 0 }));
  for (let depth = 1; depth <= maxDepth; depth += 1) {
    const round = order(state, actions.slice()).map((action) => ({ action, value: -negamax(applyAction(state, action), depth - 1, -Infinity, Infinity, deadline) }));
    if (Date.now() > deadline && depth > 1) break;
    scored = round;
  }
  // Always take an immediate win; otherwise add a little noise so games vary.
  const winning = scored.find((s) => s.value >= WIN);
  if (winning) return winning.action;
  scored.forEach((s) => { s.value += Math.random() * noise; });
  scored.sort((a, b) => b.value - a.value);
  return scored[0].action;
}

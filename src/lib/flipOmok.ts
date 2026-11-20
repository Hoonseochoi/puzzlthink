// 뒤집기 오목 (PUZZLTHINK original): 오목 on a 15×15 board, plus the 오셀로 sandwich.
// Placing a stone flips every straight run of the opponent's stones that it closes off against one of your own stones
// (all eight directions, any length). Five or more of your colour in a row after the flips wins. Only the mover flips,
// so stepping between two enemy stones is safe.

export const SIZE = 15;
export type Cell = 0 | 1 | 2; // empty · black (first) · white
export type Player = 1 | 2;
export type Board = Cell[];
export type FlipDifficulty = 'easy' | 'normal' | 'hard';

export interface Line { start: number; end: number; owner: Player }
export interface MoveResult { board: Board; flipped: number[]; win: Line | null }

export const other = (p: Player): Player => (p === 1 ? 2 : 1);
export const emptyBoard = (): Board => Array<Cell>(SIZE * SIZE).fill(0);
const idx = (r: number, c: number) => r * SIZE + c;
const inside = (r: number, c: number) => r >= 0 && r < SIZE && c >= 0 && c < SIZE;

const ALL_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1], [0, -1], [-1, 0], [-1, -1], [-1, 1]] as const;
const LINE_DIRS = ALL_DIRS.slice(0, 4);

/** Stones that a stone of `p` at `at` would flip. */
export function flipsFor(board: Board, at: number, p: Player): number[] {
  const r0 = Math.floor(at / SIZE), c0 = at % SIZE, foe = other(p);
  const out: number[] = [];
  for (const [dr, dc] of ALL_DIRS) {
    const run: number[] = [];
    let r = r0 + dr, c = c0 + dc;
    while (inside(r, c) && board[idx(r, c)] === foe) { run.push(idx(r, c)); r += dr; c += dc; }
    if (run.length && inside(r, c) && board[idx(r, c)] === p) out.push(...run);
  }
  return out;
}

/** The longest run of `p` through `at` that reaches five, if any. */
function fiveThrough(board: Board, at: number, p: Player): Line | null {
  const r0 = Math.floor(at / SIZE), c0 = at % SIZE;
  for (const [dr, dc] of LINE_DIRS) {
    let s = 0, e = 0;
    while (inside(r0 - dr * (s + 1), c0 - dc * (s + 1)) && board[idx(r0 - dr * (s + 1), c0 - dc * (s + 1))] === p) s++;
    while (inside(r0 + dr * (e + 1), c0 + dc * (e + 1)) && board[idx(r0 + dr * (e + 1), c0 + dc * (e + 1))] === p) e++;
    if (s + e + 1 >= 5) return { start: idx(r0 - dr * s, c0 - dc * s), end: idx(r0 + dr * e, c0 + dc * e), owner: p };
  }
  return null;
}

/** Place, flip, and check for five through the new stone or any flipped one. */
export function play(board: Board, at: number, p: Player): MoveResult {
  const flipped = flipsFor(board, at, p);
  const next = board.slice();
  next[at] = p;
  for (const f of flipped) next[f] = p;
  let win: Line | null = null;
  for (const cell of [at, ...flipped]) { win = fiveThrough(next, cell, p); if (win) break; }
  return { board: next, flipped, win };
}

export const isFull = (board: Board) => board.every((c) => c !== 0);

// ---- AI (MIRA) ----

// Every five-cell window on the board, built once.
const WINDOWS: number[][] = [];
for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) for (const [dr, dc] of LINE_DIRS) {
  if (!inside(r + dr * 4, c + dc * 4)) continue;
  WINDOWS.push([0, 1, 2, 3, 4].map((k) => idx(r + dr * k, c + dc * k)));
}
const WINDOW_SCORE = [0, 1, 12, 120, 2600, 1_000_000];

/** Position value for `p`: windows only one side can still fill, weighted by how full they are. */
function evaluate(board: Board, p: Player): number {
  let score = 0;
  for (const w of WINDOWS) {
    let mine = 0, theirs = 0;
    for (const i of w) { const v = board[i]; if (v === p) mine++; else if (v) theirs++; }
    if (mine && !theirs) score += WINDOW_SCORE[mine];
    else if (theirs && !mine) score -= WINDOW_SCORE[theirs] * 1.15; // the side to move next is the opponent
  }
  return score;
}

/** Empty points within two of any stone (the centre on an empty board). */
function candidates(board: Board): number[] {
  const out = new Set<number>();
  board.forEach((v, i) => {
    if (!v) return;
    const r = Math.floor(i / SIZE), c = i % SIZE;
    for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) {
      if (inside(r + dr, c + dc) && !board[idx(r + dr, c + dc)]) out.add(idx(r + dr, c + dc));
    }
  });
  return out.size ? [...out] : [idx(7, 7)];
}

/** Opponent's winning replies to a position (used to refuse moves that hand over a win). */
function winningReply(board: Board, p: Player): number | null {
  for (const m of candidates(board)) if (play(board, m, p).win) return m;
  return null;
}

export function chooseMove(board: Board, me: Player, difficulty: FlipDifficulty = 'normal'): number {
  const foe = other(me);
  const moves = candidates(board);
  // 1. Win now.
  for (const m of moves) if (play(board, m, me).win) return m;
  const noise = difficulty === 'easy' ? 900 : difficulty === 'normal' ? 60 : 4;
  const ranked = moves.map((m) => {
    const res = play(board, m, me);
    return { m, res, score: evaluate(res.board, me) + res.flipped.length * 40 + Math.random() * noise };
  }).sort((a, b) => b.score - a.score);
  if (difficulty === 'easy') return ranked[0].m;
  // 2. Normal / hard: skip moves after which the opponent wins at once (if a safe one exists).
  const depth = difficulty === 'hard' ? 20 : 8;
  let best = ranked[0].m, bestScore = -Infinity, checked = 0;
  for (const { m, res, score } of ranked) {
    // Past the depth, keep looking only until one safe move turns up.
    if (checked >= depth && bestScore > -Infinity) break;
    checked++;
    if (winningReply(res.board, foe) !== null) continue;
    let s = score;
    if (difficulty === 'hard') {
      // Look one reply ahead: assume the opponent answers with their best-looking move.
      let worst = Infinity;
      for (const r of candidates(res.board)) {
        const reply = play(res.board, r, foe);
        const v = evaluate(reply.board, me) - reply.flipped.length * 40;
        if (v < worst) worst = v;
      }
      s = worst;
    }
    if (s > bestScore) { bestScore = s; best = m; }
  }
  return best;
}

export function coordinateLabel(at: number) {
  const letters = 'ABCDEFGHJKLMNOP';
  return `${letters[at % SIZE]}${SIZE - Math.floor(at / SIZE)}`;
}

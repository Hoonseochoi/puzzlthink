// 뒤집기 오목 (PUZZLTHINK original): 오목 on a 15×15 board, plus the 오셀로 sandwich.
// - Placing a stone flips a straight run of one or two enemy stones closed off against one of your own stones
//   (all eight directions). A run of three or more is too heavy to flip. Only the mover flips.
// - The stone placed on the move just before can't be flipped yet, so a block always holds for a turn.
// - A flipped stone keeps a mark (opposite-colour eyes). A winning five may hold at most one marked stone,
//   so a line won by flips doesn't count — you have to build it yourself.

export const SIZE = 15;
/** 0 empty · 1 red placed · 2 blue placed · 3 red flipped · 4 blue flipped */
export type Cell = 0 | 1 | 2 | 3 | 4;
export type Player = 1 | 2;
export type Board = Cell[];
export type FlipDifficulty = 'easy' | 'normal' | 'hard';

/** Longest enemy run one move can flip. */
export const MAX_SANDWICH = 2;
/** Most flipped stones a winning five may contain. */
export const MAX_FLIPPED_IN_FIVE = 1;

export interface Line { start: number; end: number; owner: Player }
export interface MoveResult { board: Board; flipped: number[]; win: Line | null }

export const other = (p: Player): Player => (p === 1 ? 2 : 1);
/** Owner of a cell (0 when empty). */
export const owner = (v: Cell): 0 | Player => (v === 0 ? 0 : v === 1 || v === 3 ? 1 : 2);
export const isFlipped = (v: Cell) => v === 3 || v === 4;
export const emptyBoard = (): Board => Array<Cell>(SIZE * SIZE).fill(0);
const idx = (r: number, c: number) => r * SIZE + c;
const inside = (r: number, c: number) => r >= 0 && r < SIZE && c >= 0 && c < SIZE;

const ALL_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1], [0, -1], [-1, 0], [-1, -1], [-1, 1]] as const;
const LINE_DIRS = ALL_DIRS.slice(0, 4);

/**
 * Stones that a stone of `p` at `at` would flip. `fresh` is the opponent's stone from the move just before:
 * it can't be flipped yet, so a run holding it stays put (a block always holds for one turn).
 */
export function flipsFor(board: Board, at: number, p: Player, fresh: number | null = null): number[] {
  const r0 = Math.floor(at / SIZE), c0 = at % SIZE, foe = other(p);
  const out: number[] = [];
  for (const [dr, dc] of ALL_DIRS) {
    const run: number[] = [];
    let r = r0 + dr, c = c0 + dc;
    while (inside(r, c) && owner(board[idx(r, c)]) === foe) { run.push(idx(r, c)); r += dr; c += dc; }
    if (run.length && run.length <= MAX_SANDWICH && (fresh === null || !run.includes(fresh)) && inside(r, c) && owner(board[idx(r, c)]) === p) out.push(...run);
  }
  return out;
}

/** A five of `p` through `at` with no more than MAX_FLIPPED_IN_FIVE flipped stones in it. */
function fiveThrough(board: Board, at: number, p: Player): Line | null {
  const r0 = Math.floor(at / SIZE), c0 = at % SIZE;
  for (const [dr, dc] of LINE_DIRS) {
    let s = 0, e = 0;
    while (inside(r0 - dr * (s + 1), c0 - dc * (s + 1)) && owner(board[idx(r0 - dr * (s + 1), c0 - dc * (s + 1))]) === p) s++;
    while (inside(r0 + dr * (e + 1), c0 + dc * (e + 1)) && owner(board[idx(r0 + dr * (e + 1), c0 + dc * (e + 1))]) === p) e++;
    if (s + e + 1 < 5) continue;
    const run = Array.from({ length: s + e + 1 }, (_, k) => idx(r0 + dr * (k - s), c0 + dc * (k - s)));
    for (let k = 0; k + 5 <= run.length; k++) {
      const window = run.slice(k, k + 5);
      if (window.filter((i) => isFlipped(board[i])).length <= MAX_FLIPPED_IN_FIVE) return { start: window[0], end: window[4], owner: p };
    }
  }
  return null;
}

/** Place, flip (marking the flipped stones), and check for a five through any changed stone. */
export function play(board: Board, at: number, p: Player, fresh: number | null = null): MoveResult {
  const flipped = flipsFor(board, at, p, fresh);
  const next = board.slice();
  next[at] = p;
  for (const f of flipped) next[f] = (p === 1 ? 3 : 4);
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

/** Position value for `p`: windows only one side holds (and could still win), weighted by how full they are. */
function evaluate(board: Board, p: Player): number {
  let score = 0;
  for (const w of WINDOWS) {
    let mine = 0, theirs = 0, marked = 0;
    for (const i of w) { const v = board[i], o = owner(v); if (o === p) mine++; else if (o) theirs++; if (isFlipped(v)) marked++; }
    if (marked > MAX_FLIPPED_IN_FIVE) continue; // this window can never become a winning five
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
function winningReply(board: Board, p: Player, fresh: number): number | null {
  for (const m of candidates(board)) if (play(board, m, p, fresh).win) return m;
  return null;
}

export function chooseMove(board: Board, me: Player, difficulty: FlipDifficulty = 'normal', fresh: number | null = null): number {
  const foe = other(me);
  const moves = candidates(board);
  // 1. Win now.
  for (const m of moves) if (play(board, m, me, fresh).win) return m;
  const noise = difficulty === 'easy' ? 900 : difficulty === 'normal' ? 60 : 4;
  const ranked = moves.map((m) => {
    const res = play(board, m, me, fresh);
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
    if (winningReply(res.board, foe, m) !== null) continue;
    let s = score;
    if (difficulty === 'hard') {
      // Look one reply ahead: assume the opponent answers with their best-looking move.
      let worst = Infinity;
      for (const r of candidates(res.board)) {
        const reply = play(res.board, r, foe, m);
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

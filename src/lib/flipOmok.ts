// 뒤집기 오목 (PUZZLTHINK original): 오목 on a 15×15 board, plus the 오셀로 sandwich, under the usual 오목 rules.
// - Placing a stone flips every straight run of enemy stones it closes off against one of your own stones
//   (all eight directions, any length). Only the mover flips. Flipped stones keep the other colour's eyes.
// - Exactly five in a row wins; six or more (장목) does not.
// - 쌍삼 is forbidden for both sides: a move may not make two open threes at once, unless it makes five.

export const SIZE = 15;
/** 0 empty · 1 red placed · 2 blue placed · 3 red flipped · 4 blue flipped */
export type Cell = 0 | 1 | 2 | 3 | 4;
export type Player = 1 | 2;
export type Board = Cell[];
export type FlipDifficulty = 'easy' | 'normal' | 'hard';

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

/** Stones that a stone of `p` at `at` would flip. */
export function flipsFor(board: Board, at: number, p: Player): number[] {
  const r0 = Math.floor(at / SIZE), c0 = at % SIZE, foe = other(p);
  const out: number[] = [];
  for (const [dr, dc] of ALL_DIRS) {
    const run: number[] = [];
    let r = r0 + dr, c = c0 + dc;
    while (inside(r, c) && owner(board[idx(r, c)]) === foe) { run.push(idx(r, c)); r += dr; c += dc; }
    if (run.length && inside(r, c) && owner(board[idx(r, c)]) === p) out.push(...run);
  }
  return out;
}

/** Length of p's run through `at` along (dr, dc), and its two ends. */
function runAt(board: Board, at: number, p: Player, dr: number, dc: number) {
  const r0 = Math.floor(at / SIZE), c0 = at % SIZE;
  let s = 0, e = 0;
  while (inside(r0 - dr * (s + 1), c0 - dc * (s + 1)) && owner(board[idx(r0 - dr * (s + 1), c0 - dc * (s + 1))]) === p) s++;
  while (inside(r0 + dr * (e + 1), c0 + dc * (e + 1)) && owner(board[idx(r0 + dr * (e + 1), c0 + dc * (e + 1))]) === p) e++;
  return { len: s + e + 1, start: idx(r0 - dr * s, c0 - dc * s), end: idx(r0 + dr * e, c0 + dc * e) };
}

/** An exact five of `p` through `at` (six or more doesn't count). */
function fiveThrough(board: Board, at: number, p: Player): Line | null {
  for (const [dr, dc] of LINE_DIRS) {
    const run = runAt(board, at, p, dr, dc);
    if (run.len === 5) return { start: run.start, end: run.end, owner: p };
  }
  return null;
}

/** Place and flip, then check for an exact five through any changed stone. Doesn't check 쌍삼; see `isForbidden`. */
export function play(board: Board, at: number, p: Player): MoveResult {
  const flipped = flipsFor(board, at, p);
  const next = board.slice();
  next[at] = p;
  for (const f of flipped) next[f] = (p === 1 ? 3 : 4);
  let win: Line | null = null;
  for (const cell of [at, ...flipped]) { win = fiveThrough(next, cell, p); if (win) break; }
  return { board: next, flipped, win };
}

/** Whether one more stone of `p` at the empty point `e` makes an open four (exactly four, both ends empty) through `e`. */
function makesOpenFour(board: Board, e: number, p: Player, dr: number, dc: number) {
  const b = board.slice();
  b[e] = p;
  const run = runAt(b, e, p, dr, dc);
  if (run.len !== 4) return false;
  const before = run.start - (dr * SIZE + dc), after = run.end + (dr * SIZE + dc);
  const br = Math.floor(run.start / SIZE) - dr, bc = (run.start % SIZE) - dc;
  const ar = Math.floor(run.end / SIZE) + dr, ac = (run.end % SIZE) + dc;
  if (!inside(br, bc) || !inside(ar, ac) || b[before] || b[after]) return false;
  // Filling either end must make exactly five, not six.
  const far1r = br - dr, far1c = bc - dc, far2r = ar + dr, far2c = ac + dc;
  const six1 = inside(far1r, far1c) && owner(b[idx(far1r, far1c)]) === p;
  const six2 = inside(far2r, far2c) && owner(b[idx(far2r, far2c)]) === p;
  return !(six1 && six2);
}

/** Whether the stone at `at` takes part in an open three along (dr, dc) on `board`. */
function openThreeAt(board: Board, at: number, p: Player, dr: number, dc: number) {
  const r0 = Math.floor(at / SIZE), c0 = at % SIZE;
  for (let k = -4; k <= 4; k++) {
    if (!k) continue;
    const r = r0 + dr * k, c = c0 + dc * k;
    if (!inside(r, c) || board[idx(r, c)]) continue;
    if (makesOpenFour(board, idx(r, c), p, dr, dc)) {
      // The four must run through `at`.
      const b = board.slice(); b[idx(r, c)] = p;
      const run = runAt(b, at, p, dr, dc);
      if (run.len === 4) return true;
    }
  }
  return false;
}

/** 쌍삼: after the move (flips included), the placed stone sits in two or more open threes. A move that makes five is always allowed. */
export function isForbidden(board: Board, at: number, p: Player): boolean {
  if (board[at]) return true;
  const res = play(board, at, p);
  if (res.win) return false;
  let threes = 0;
  for (const [dr, dc] of LINE_DIRS) if (openThreeAt(res.board, at, p, dr, dc) && ++threes >= 2) return true;
  return false;
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

/** Position value for `p`: windows only one side holds, weighted by how full they are. */
function evaluate(board: Board, p: Player): number {
  let score = 0;
  for (const w of WINDOWS) {
    let mine = 0, theirs = 0;
    for (const i of w) { const o = owner(board[i]); if (o === p) mine++; else if (o) theirs++; }
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

/** Points near the stones where `p` may not play (for the board's ✕ marks). */
export function forbiddenPoints(board: Board, p: Player): number[] {
  return candidates(board).filter((m) => isForbidden(board, m, p));
}

/** Opponent's winning replies to a position (used to refuse moves that hand over a win). */
function winningReply(board: Board, p: Player): number | null {
  for (const m of candidates(board)) if (play(board, m, p).win) return m;
  return null;
}

export function chooseMove(board: Board, me: Player, difficulty: FlipDifficulty = 'normal'): number {
  const foe = other(me);
  const moves = candidates(board).filter((m) => !isForbidden(board, m, me));
  if (!moves.length) return board.findIndex((v, i) => !v && !isForbidden(board, i, me));
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
    {
      // Look one reply ahead (this is what spots a block that would just get flipped):
      // assume the opponent answers with their best-looking move.
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

// 뒤집기 오목 (PUZZLTHINK original), 「전략적 뒤집기」 rules (rules version 2, from 2026-11-28):
// 오목 on a 15×15 board, plus the 오셀로 sandwich — as a limited, chosen strike.
// - Placing a stone may close off straight runs of enemy stones against your own stones (8 directions, any length).
//   By default nothing flips (놓기). Each player has 3 뒤집기 per game: spending one at the moment of placing (놓고 뒤집기)
//   turns every run that stone sandwiches into your colour. Only the mover flips.
// - A flipped stone is locked for good: a run that contains a flipped stone can't be flipped (so stones never flip back).
//   A flipped stone is the cell value 3/4, so the board alone carries the locks (rooms, saves and replays need nothing more).
// - Exactly five in a row wins; six or more (장목) does not. A five that includes a stone flipped by that very move
//   doesn't win.
// - 쌍삼 is forbidden for both sides: a move may not make two open threes at once (judged after that move's flips,
//   through the placed stone), unless it makes five. Placing quietly and placing with a flip are judged separately.
// Before version 2 every move flipped every sandwich automatically; the research behind the change is in
// reports/flip-omok-rules (and scripts/flip-omok, which keeps the old rules for comparison).

export const SIZE = 15;
/** Rules version, written into rooms and game records so the two eras can be told apart. */
export const FLIP_RULES_VERSION = 2;
/** 뒤집기 per player per game. */
export const FLIP_CHARGES = 3;
/** 0 empty · 1 red placed · 2 blue placed · 3 red flipped (locked) · 4 blue flipped (locked) */
export type Cell = 0 | 1 | 2 | 3 | 4;
export type Player = 1 | 2;
export type Board = Cell[];
export type FlipDifficulty = 'normal' | 'hard';
/** Charges left, by player (index 0 unused). */
export type Charges = [number, number, number];
export interface FlipMove { at: number; flip: boolean }

export interface Line { start: number; end: number; owner: Player }
export interface MoveResult { board: Board; flipped: number[]; win: Line | null }

export const other = (p: Player): Player => (p === 1 ? 2 : 1);
/** Owner of a cell (0 when empty). */
export const owner = (v: Cell): 0 | Player => (v === 0 ? 0 : v === 1 || v === 3 ? 1 : 2);
/** A stone that was flipped over: it shows the other colour's eyes and is locked. */
export const isFlipped = (v: Cell) => v === 3 || v === 4;
export const emptyBoard = (): Board => Array<Cell>(SIZE * SIZE).fill(0);
export const fullCharges = (): Charges => [0, FLIP_CHARGES, FLIP_CHARGES];
const idx = (r: number, c: number) => r * SIZE + c;
const inside = (r: number, c: number) => r >= 0 && r < SIZE && c >= 0 && c < SIZE;

const ALL_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1], [0, -1], [-1, 0], [-1, -1], [-1, 1]] as const;
const LINE_DIRS = ALL_DIRS.slice(0, 4);

/** Stones that spending a 뒤집기 with a stone of `p` at `at` would flip (runs holding a locked stone don't flip). */
export function flipsFor(board: Board, at: number, p: Player): number[] {
  const r0 = Math.floor(at / SIZE), c0 = at % SIZE, foe = other(p);
  const out: number[] = [];
  for (const [dr, dc] of ALL_DIRS) {
    const run: number[] = [];
    let r = r0 + dr, c = c0 + dc, locked = false;
    while (inside(r, c) && owner(board[idx(r, c)]) === foe) { const i = idx(r, c); if (isFlipped(board[i])) locked = true; run.push(i); r += dr; c += dc; }
    if (!locked && run.length && inside(r, c) && owner(board[idx(r, c)]) === p) out.push(...run);
  }
  return out;
}

/** Whether an empty point sits between enemy stones in some line (placing there is still safe: only the mover flips). */
export function isGap(board: Board, at: number, p: Player): boolean {
  const r0 = Math.floor(at / SIZE), c0 = at % SIZE, foe = other(p);
  return LINE_DIRS.some(([dr, dc]) => inside(r0 - dr, c0 - dc) && inside(r0 + dr, c0 + dc)
    && owner(board[idx(r0 - dr, c0 - dc)]) === foe && owner(board[idx(r0 + dr, c0 + dc)]) === foe);
}

/** Length of p's run through `at` along (dr, dc), and its two ends. */
function runAt(board: Board, at: number, p: Player, dr: number, dc: number) {
  const r0 = Math.floor(at / SIZE), c0 = at % SIZE;
  let s = 0, e = 0;
  while (inside(r0 - dr * (s + 1), c0 - dc * (s + 1)) && owner(board[idx(r0 - dr * (s + 1), c0 - dc * (s + 1))]) === p) s++;
  while (inside(r0 + dr * (e + 1), c0 + dc * (e + 1)) && owner(board[idx(r0 + dr * (e + 1), c0 + dc * (e + 1))]) === p) e++;
  return { len: s + e + 1, start: idx(r0 - dr * s, c0 - dc * s), end: idx(r0 + dr * e, c0 + dc * e) };
}

/** An exact five of `p` through `at` (six or more doesn't count) with none of the `fresh` (just-flipped) stones in it. */
function fiveThrough(board: Board, at: number, p: Player, fresh: ReadonlySet<number> | null = null): Line | null {
  for (const [dr, dc] of LINE_DIRS) {
    const run = runAt(board, at, p, dr, dc);
    if (run.len !== 5) continue;
    let clean = true;
    if (fresh) for (let k = 0, i = run.start; k < 5; k++, i += dr * SIZE + dc) if (fresh.has(i)) { clean = false; break; }
    if (clean) return { start: run.start, end: run.end, owner: p };
  }
  return null;
}

/**
 * Place a stone of `p` at `at`, spending a 뒤집기 when `flip` is set (it flips every run the stone sandwiches), then
 * check for an exact five through the placed stone; a five that needs this move's flips doesn't count. Doesn't check
 * 쌍삼 or charges; see `isForbidden` and `canFlip`.
 */
export function play(board: Board, at: number, p: Player, flip: boolean): MoveResult {
  const flipped = flip ? flipsFor(board, at, p) : [];
  const next = board.slice();
  next[at] = p;
  for (const f of flipped) next[f] = (p === 1 ? 3 : 4);
  return { board: next, flipped, win: fiveThrough(next, at, p, flipped.length ? new Set(flipped) : null) };
}

/** Whether a 뒤집기 is on offer at `at`: the player has one left and the stone would sandwich something. */
export const canFlip = (board: Board, at: number, p: Player, charges: Charges) => charges[p] > 0 && !board[at] && flipsFor(board, at, p).length > 0;

/** After a move at `at` that flipped `flipped`: it lined up five, but only thanks to those flips, so it doesn't win. */
export function voidFive(board: Board, at: number, flipped: number[]): boolean {
  const p = owner(board[at]);
  if (!p || !flipped.length) return false;
  return fiveThrough(board, at, p) !== null && fiveThrough(board, at, p, new Set(flipped)) === null;
}

/** Whether one more stone of `p` at the empty point `e` makes an open four (exactly four, both ends empty) through `e`. */
function makesOpenFour(b: Board, e: number, p: Player, dr: number, dc: number) {
  const prev = b[e];
  b[e] = p;
  const run = runAt(b, e, p, dr, dc);
  let ok = false;
  if (run.len === 4) {
    const br = Math.floor(run.start / SIZE) - dr, bc = (run.start % SIZE) - dc;
    const ar = Math.floor(run.end / SIZE) + dr, ac = (run.end % SIZE) + dc;
    if (inside(br, bc) && inside(ar, ac) && !b[idx(br, bc)] && !b[idx(ar, ac)]) {
      // Filling either end must make exactly five, not six.
      const six1 = inside(br - dr, bc - dc) && owner(b[idx(br - dr, bc - dc)]) === p;
      const six2 = inside(ar + dr, ac + dc) && owner(b[idx(ar + dr, ac + dc)]) === p;
      ok = !(six1 && six2);
    }
  }
  b[e] = prev;
  return ok;
}

/** Whether the stone at `at` takes part in an open three along (dr, dc) on `b` (b is restored afterwards). */
function openThreeAt(b: Board, at: number, p: Player, dr: number, dc: number) {
  const r0 = Math.floor(at / SIZE), c0 = at % SIZE;
  for (let k = -4; k <= 4; k++) {
    if (!k) continue;
    const r = r0 + dr * k, c = c0 + dc * k;
    if (!inside(r, c) || b[idx(r, c)]) continue;
    const e = idx(r, c);
    if (makesOpenFour(b, e, p, dr, dc)) {
      // The four must run through `at`.
      b[e] = p;
      const run = runAt(b, at, p, dr, dc);
      b[e] = 0;
      if (run.len === 4) return true;
    }
  }
  return false;
}

/** 쌍삼: after the move (its flips included), the placed stone sits in two or more open threes. A move that makes five is always allowed. */
export function isForbidden(board: Board, at: number, p: Player, flip = false): boolean {
  if (board[at]) return true;
  const res = play(board, at, p, flip);
  if (res.win) return false;
  let threes = 0;
  for (const [dr, dc] of LINE_DIRS) if (openThreeAt(res.board, at, p, dr, dc) && ++threes >= 2) return true;
  return false;
}

/** Whether `move` may be played: an empty point, a 뒤집기 only when one is on offer, and no 쌍삼. */
export function isLegal(board: Board, move: FlipMove, p: Player, charges: Charges): boolean {
  if (!Number.isInteger(move.at) || move.at < 0 || move.at >= board.length || board[move.at]) return false;
  if (move.flip && !canFlip(board, move.at, p, charges)) return false;
  return !isForbidden(board, move.at, p, move.flip);
}

export const isFull = (board: Board) => board.every((c) => c !== 0);

// ---- AI (COCO) ----

// Every five-cell window on the board, built once.
const WINDOWS: number[][] = [];
for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) for (const [dr, dc] of LINE_DIRS) {
  if (!inside(r + dr * 4, c + dc * 4)) continue;
  WINDOWS.push([0, 1, 2, 3, 4].map((k) => idx(r + dr * k, c + dc * k)));
}
// A full window that didn't win (a dead five, made by a flip) is worth nothing.
const WINDOW_SCORE = [0, 1, 12, 120, 2600, 0];
/** What an unused 뒤집기 is worth to COCO, in window points: it spends one when the flip gains more than that. */
const CHARGE_VALUE = 420;

/** Position value for `p`: windows only one side holds, weighted by how full they are, plus the 뒤집기 each side keeps. */
function evaluate(board: Board, p: Player, charges: Charges): number {
  let score = 0;
  for (const w of WINDOWS) {
    let mine = 0, theirs = 0;
    for (const i of w) { const o = owner(board[i]); if (o === p) mine++; else if (o) theirs++; }
    if (mine && !theirs) score += WINDOW_SCORE[mine];
    else if (theirs && !mine) score -= WINDOW_SCORE[theirs] * 1.15; // the side to move next is the opponent
  }
  return score + CHARGE_VALUE * (charges[p] - charges[other(p)]);
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

/** The ways `p` can play at `at`: quietly, and with a 뒤집기 when one is on offer. */
function movesAt(board: Board, at: number, p: Player, charges: Charges): FlipMove[] {
  return canFlip(board, at, p, charges) ? [{ at, flip: false }, { at, flip: true }] : [{ at, flip: false }];
}

const spend = (charges: Charges, p: Player, m: FlipMove): Charges => {
  if (!m.flip) return charges;
  const next = [...charges] as Charges;
  next[p]--;
  return next;
};

/** Points near the stones where `p` may not place at all (every way of playing there is 쌍삼): the board's ✕ marks. */
export function forbiddenPoints(board: Board, p: Player, charges: Charges = [0, 0, 0]): number[] {
  return candidates(board).filter((m) => movesAt(board, m, p, charges).every((mv) => isForbidden(board, m, p, mv.flip)));
}

/** Every legal move near the stones for `p`. */
export function legalMoves(board: Board, p: Player, charges: Charges): FlipMove[] {
  return candidates(board).flatMap((m) => movesAt(board, m, p, charges).filter((mv) => !isForbidden(board, m, p, mv.flip)));
}

/** A move of `p` that makes five at once (quiet or with a 뒤집기), if any. */
function winningMove(board: Board, p: Player, charges: Charges): FlipMove | null {
  for (const m of candidates(board)) for (const mv of movesAt(board, m, p, charges)) if (play(board, m, p, mv.flip).win) return mv;
  return null;
}

/** Whether `p` has a move that leaves two or more winning points (an open four or a double four): an unstoppable threat. */
function hasOpenFourMove(board: Board, p: Player, charges: Charges): boolean {
  for (const m of candidates(board)) for (const mv of movesAt(board, m, p, charges)) {
    if (isForbidden(board, m, p, mv.flip)) continue;
    const next = play(board, m, p, mv.flip).board;
    let wins = 0;
    for (const r of candidates(next)) {
      next[r] = p;
      const f = fiveThrough(next, r, p);
      next[r] = 0;
      if (f && ++wins >= 2) return true;
    }
  }
  return false;
}

interface Scored { mv: FlipMove; board: Board; charges: Charges; score: number }
function scored(board: Board, me: Player, charges: Charges, mv: FlipMove, noise: number): Scored {
  const res = play(board, mv.at, me, mv.flip);
  const after = spend(charges, me, mv);
  return { mv, board: res.board, charges: after, score: evaluate(res.board, me, after) + Math.random() * noise };
}

/**
 * 보통: looks at its own move only. It always takes a five and blocks one (with a 뒤집기 when that is the only answer),
 * usually avoids a move that hands over a win, but its judgement is loose (wide noise). A 뒤집기 costs it CHARGE_VALUE,
 * so it spends one for a real gain.
 */
function casualMove(board: Board, me: Player, charges: Charges, moves: FlipMove[]): FlipMove {
  const foe = other(me);
  const threat = winningMove(board, foe, charges);
  if (threat) {
    const block = moves.filter((m) => m.at === threat.at).map((m) => scored(board, me, charges, m, 0)).sort((a, b) => b.score - a.score);
    for (const b of block) if (!winningMove(b.board, foe, b.charges)) return b.mv;
  }
  const ranked = moves.map((m) => scored(board, me, charges, m, 350)).sort((a, b) => b.score - a.score);
  const careful = Math.random() < 0.9;
  // With a five standing against it, it looks through every move (a 뒤집기 elsewhere may break the four).
  for (const r of threat ? ranked : ranked.slice(0, 10)) if (!careful || !winningMove(r.board, foe, r.charges)) return r.mv;
  return ranked[0].mv;
}

/** 어려움: reads its move and the opponent's best-looking reply (their 뒤집기 included), with a little randomness. */
function readerMove(board: Board, me: Player, charges: Charges, moves: FlipMove[]): FlipMove {
  const foe = other(me);
  // The opponent's open three (one move from an unstoppable four) must be answered: keep to moves that defuse it.
  if (hasOpenFourMove(board, foe, charges)) {
    const safe = moves.map((m) => scored(board, me, charges, m, 60))
      .filter((x) => !winningMove(x.board, foe, x.charges) && !hasOpenFourMove(x.board, foe, x.charges))
      .sort((a, b) => b.score - a.score);
    if (safe.length) return safe[0].mv;
  }
  const ranked = moves.map((m) => scored(board, me, charges, m, 60)).sort((a, b) => b.score - a.score);
  let best = ranked[0].mv, bestScore = -Infinity, checked = 0;
  for (const x of ranked) {
    // Look at the best eight; past that keep looking only until one safe move turns up.
    if (checked >= 8 && bestScore > -Infinity) break;
    checked++;
    if (winningMove(x.board, foe, x.charges)) continue;
    // Assume the opponent answers with their best-looking move (this spots a block that would just get flipped).
    let worst = Infinity;
    for (const r of candidates(x.board)) for (const rm of movesAt(x.board, r, foe, x.charges)) {
      const reply = play(x.board, r, foe, rm.flip);
      const v = evaluate(reply.board, me, spend(x.charges, foe, rm));
      if (v < worst) worst = v;
    }
    if (worst > bestScore) { bestScore = worst; best = x.mv; }
  }
  return best;
}

/** COCO's move for `me` with `charges` left (pass zero charges for `me` to forbid a 뒤집기, e.g. a timed-out turn). */
export function chooseMove(board: Board, me: Player, charges: Charges, difficulty: FlipDifficulty = 'normal'): FlipMove {
  const moves = legalMoves(board, me, charges);
  if (!moves.length) {
    const at = board.findIndex((v, i) => !v && !isForbidden(board, i, me));
    return { at: at >= 0 ? at : board.findIndex((v) => !v), flip: false };
  }
  for (const m of moves) if (play(board, m.at, me, m.flip).win) return m;
  return difficulty === 'hard' ? readerMove(board, me, charges, moves) : casualMove(board, me, charges, moves);
}

export function coordinateLabel(at: number) {
  const letters = 'ABCDEFGHJKLMNOP';
  return `${letters[at % SIZE]}${SIZE - Math.floor(at / SIZE)}`;
}

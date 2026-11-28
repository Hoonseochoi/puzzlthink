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
//
// Every level plays the tactics a person expects, in this order, and never skips them:
//   1. make five now;  2. stop every five the opponent could make next move (a block, or a 뒤집기 that turns a stone of
//   their four — it then locks);  3. 어려움: a forced win by fours (VCF), flips included;  4. stop an open three / any move
//   of theirs that would leave two fives at once (their flips included);  5. otherwise the best-looking move after the
//   opponent's best reply (their flips included). Lines are scored only while they can still become EXACTLY five, so a
//   line heading for six is worth nothing. A 뒤집기 is spent only to win, to stop a loss, or (keeping one in reserve) to
//   make a four / open three; never for a small positional gain.

// Every five-cell window on the board, with the cells just outside each end (-1 off the board).
const WINDOWS: { cells: number[]; before: number; after: number }[] = [];
for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) for (const [dr, dc] of LINE_DIRS) {
  if (!inside(r + dr * 4, c + dc * 4)) continue;
  WINDOWS.push({
    cells: [0, 1, 2, 3, 4].map((k) => idx(r + dr * k, c + dc * k)),
    before: inside(r - dr, c - dc) ? idx(r - dr, c - dc) : -1,
    after: inside(r + dr * 5, c + dc * 5) ? idx(r + dr * 5, c + dc * 5) : -1,
  });
}
// By stones in a window that can still become exactly five (no enemy stone in it, none of mine just outside it).
const LIVE_SCORE = [0, 1, 10, 90, 900, 0];
const CHARGE_VALUE = 160;

/** Position value for `p`: live windows only (a line that can only grow into six counts nothing), plus 뒤집기 kept. */
function evaluate(board: Board, p: Player, charges: Charges): number {
  const foe = other(p);
  let score = 0;
  for (const w of WINDOWS) {
    let mine = 0, theirs = 0;
    for (const i of w.cells) { const o = owner(board[i]); if (o === p) mine++; else if (o) theirs++; }
    if (mine && !theirs) {
      if (!(w.before >= 0 && owner(board[w.before]) === p) && !(w.after >= 0 && owner(board[w.after]) === p)) score += LIVE_SCORE[mine];
    } else if (theirs && !mine) {
      if (!(w.before >= 0 && owner(board[w.before]) === foe) && !(w.after >= 0 && owner(board[w.after]) === foe)) score -= LIVE_SCORE[theirs] * 1.1;
    }
  }
  return score + CHARGE_VALUE * (charges[p] - charges[foe]);
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

/**
 * The points where one stone of `p` makes exactly five. A five needs no flip (a five that uses this move's flips is
 * void), so these are the quiet fives; a 5-window with one empty point is only a five point if no stone of `p` sits
 * just outside it (else it would be six).
 */
function fivePoints(board: Board, p: Player): number[] {
  const out = new Set<number>();
  for (const w of WINDOWS) {
    let mine = 0, empty = -1, ok = true;
    for (const i of w.cells) { const o = owner(board[i]); if (o === p) mine++; else if (!o && empty < 0) empty = i; else { ok = false; break; } }
    if (!ok || mine !== 4 || empty < 0) continue;
    if ((w.before >= 0 && owner(board[w.before]) === p) || (w.after >= 0 && owner(board[w.after]) === p)) continue;
    out.add(empty);
  }
  return [...out];
}

// The windows each point belongs to, so a move only re-checks the lines it touches.
const WINDOWS_OF: number[][] = Array.from({ length: SIZE * SIZE }, () => []);
WINDOWS.forEach((w, k) => { for (const i of w.cells) WINDOWS_OF[i].push(k); });

/** Five points of `p` in the windows through `cells` only (enough when `p` had none before the move at `cells`). */
function fivePointsNear(board: Board, p: Player, cells: number[]): number {
  const seen = new Set<number>(), out = new Set<number>();
  for (const c of cells) for (const k of WINDOWS_OF[c]) {
    if (seen.has(k)) continue;
    seen.add(k);
    const w = WINDOWS[k];
    let mine = 0, empty = -1, ok = true;
    for (const i of w.cells) { const o = owner(board[i]); if (o === p) mine++; else if (!o && empty < 0) empty = i; else { ok = false; break; } }
    if (!ok || mine !== 4 || empty < 0) continue;
    if ((w.before >= 0 && owner(board[w.before]) === p) || (w.after >= 0 && owner(board[w.after]) === p)) continue;
    out.add(empty);
  }
  return out.size;
}

/** A move of `p` (to move) that leaves them two or more five points — an open four or a double four — if any. */
function doubleFourMove(board: Board, p: Player, charges: Charges): FlipMove | null {
  const base = fivePoints(board, p).length;
  for (const m of candidates(board)) for (const mv of movesAt(board, m, p, charges)) {
    const next = play(board, m, p, mv.flip);
    if (next.win) return mv;
    const n = base ? fivePoints(next.board, p).length : fivePointsNear(next.board, p, [m, ...next.flipped]);
    if (n >= 2 && !isForbidden(board, m, p, mv.flip)) return mv;
  }
  return null;
}

interface Option { mv: FlipMove; board: Board; charges: Charges; fours: number; win: boolean }
function option(board: Board, me: Player, charges: Charges, mv: FlipMove): Option {
  const res = play(board, mv.at, me, mv.flip);
  return { mv, board: res.board, charges: spend(charges, me, mv), fours: res.win ? 9 : fivePoints(res.board, me).length, win: !!res.win };
}

/** The opponent's best reply value (from `me`'s side): every move of theirs, flips included, the worst for me. */
function worstReply(board: Board, me: Player, charges: Charges): number {
  const foe = other(me);
  let worst = Infinity;
  for (const r of candidates(board)) for (const rm of movesAt(board, r, foe, charges)) {
    const reply = play(board, r, foe, rm.flip);
    if (reply.win) return -1e9;
    const v = evaluate(reply.board, me, spend(charges, foe, rm));
    if (v < worst) worst = v;
  }
  return worst === Infinity ? evaluate(board, me, charges) : worst;
}

/**
 * VCF: a forced win by fours. `me` makes a four (a move leaving a five point; a 뒤집기 allowed), every way the opponent
 * can stop it (a block, or a 뒤집기 on a stone of the four) is tried, and so on, up to `depth` fours. Returns the first
 * move of a win, or null.
 */
function vcf(board: Board, me: Player, charges: Charges, depth: number, deadline: number): FlipMove | null {
  const foe = other(me);
  if (fivePoints(board, foe).length) return null; // they would make five first
  const opts: Option[] = [];
  for (const m of candidates(board)) for (const mv of movesAt(board, m, me, charges)) {
    const o = option(board, me, charges, mv);
    if (o.win) return mv;
    if (o.fours && !isForbidden(board, m, me, mv.flip)) opts.push(o);
  }
  if (depth <= 0) return null;
  // Most fives first (an open four needs no reading).
  opts.sort((a, b) => b.fours - a.fours);
  for (const o of opts) {
    if (Date.now() > deadline) return null;
    let refuted = false;
    for (const r of candidates(o.board)) {
      for (const rm of movesAt(o.board, r, foe, o.charges)) {
        const reply = play(o.board, r, foe, rm.flip);
        if (reply.win) { refuted = true; break; }
        if (fivePoints(reply.board, me).length) continue; // leaves my five: not an answer
        if (isForbidden(o.board, r, foe, rm.flip)) continue;
        if (!vcf(reply.board, me, spend(o.charges, foe, rm), depth - 1, deadline)) { refuted = true; break; }
      }
      if (refuted) break;
    }
    if (!refuted) return o.mv;
  }
  return null;
}

/**
 * 어려움 only: a forced win by threes and fours (VCT). `me` plays a move that leaves an open three (a move of mine that
 * would make two fives) or a four; every opponent reply that stops it (no five point and no such move left for me) is
 * tried, flips included; an opponent four in reply counts as a refutation (kept simple). `depth` threes deep, then VCF.
 */
function vct(board: Board, me: Player, charges: Charges, depth: number, deadline: number): FlipMove | null {
  const foe = other(me);
  if (depth <= 0 || Date.now() > deadline || fivePoints(board, foe).length || doubleFourMove(board, foe, charges)) return null;
  const threats: { o: Option; v: number }[] = [];
  for (const m of candidates(board)) for (const mv of movesAt(board, m, me, charges)) {
    if (mv.flip && charges[me] < 2) continue; // keep one 뒤집기 for defence
    if (isForbidden(board, m, me, mv.flip)) continue;
    const o = option(board, me, charges, mv);
    if (o.fours || doubleFourMove(o.board, me, [0, 0, 0])) threats.push({ o, v: evaluate(o.board, me, o.charges) });
  }
  threats.sort((a, b) => b.v - a.v);
  for (const { o } of threats.slice(0, 6)) {
    if (Date.now() > deadline) return null;
    let refuted = false, answers = 0;
    for (const r of candidates(o.board)) {
      for (const rm of movesAt(o.board, r, foe, o.charges)) {
        if (isForbidden(o.board, r, foe, rm.flip)) continue;
        const reply = play(o.board, r, foe, rm.flip);
        if (reply.win || fivePoints(reply.board, foe).length) { refuted = true; break; } // they counter with a five or a four
        if (fivePoints(reply.board, me).length || doubleFourMove(reply.board, me, [0, 0, 0])) continue; // doesn't stop it
        answers++;
        const after = spend(o.charges, foe, rm);
        if (!vcf(reply.board, me, after, 4, deadline) && !vct(reply.board, me, after, depth - 1, deadline)) { refuted = true; break; }
      }
      if (refuted || Date.now() > deadline) break;
    }
    if (!refuted && Date.now() <= deadline && answers >= 0) return o.mv;
  }
  return null;
}

/** COCO's move for `me` with `charges` left (pass zero charges for `me` to forbid a 뒤집기, e.g. a timed-out turn). */
export function chooseMove(board: Board, me: Player, charges: Charges, difficulty: FlipDifficulty = 'normal'): FlipMove {
  const foe = other(me);
  const moves = legalMoves(board, me, charges);
  if (!moves.length) {
    const at = board.findIndex((v, i) => !v && !isForbidden(board, i, me));
    return { at: at >= 0 ? at : board.findIndex((v) => !v), flip: false };
  }
  const hard = difficulty === 'hard';
  const deadline = Date.now() + (hard ? 600 : 250);
  const noise = hard ? 30 : 520; // 보통's positional judgement is loose; its tactics above and below are not
  const opts = moves.map((mv) => option(board, me, charges, mv));
  const quietFirst = (list: Option[]) => { const q = list.filter((o) => !o.mv.flip); return q.length ? q : list; };
  const pick = (list: Option[], extra: (o: Option) => number = () => 0) => list
    .map((o) => ({ o, v: evaluate(o.board, me, o.charges) + o.fours * 400 + extra(o) + Math.random() * noise }))
    .sort((a, b) => b.v - a.v)[0].o.mv;

  // 1. Five now.
  const win = opts.find((o) => o.win);
  if (win) return { at: win.mv.at, flip: false };

  // 2. Their five next move: every one of them must be gone after my move.
  if (fivePoints(board, foe).length) {
    const safe = opts.filter((o) => !fivePoints(o.board, foe).length);
    if (safe.length) return pick(quietFirst(safe));
    return pick(opts.filter((o) => !o.mv.flip).length ? opts.filter((o) => !o.mv.flip) : opts); // lost anyway
  }

  // 3. 어려움: a forced win by fours. Both: a move leaving two five points they can't both stop.
  if (hard) {
    const v = vcf(board, me, charges, 6, deadline) ?? vct(board, me, charges, 2, deadline);
    if (v) return v;
  }
  for (const o of quietFirst(opts.filter((o) => o.fours >= 2))) {
    // Make sure no single reply (a block or a flip) takes both away.
    if (!refutable(o, me)) return o.mv;
  }

  // 4. Their open three (or any move leaving them two fives): stop it, quietly if possible; a counter-four also works
  //    only if it doesn't leave them the double after my four is blocked (keep it simple: block).
  if (doubleFourMove(board, foe, charges)) {
    const safe = opts.filter((o) => !doubleFourMove(o.board, foe, o.charges));
    if (safe.length) {
      const quiet = safe.filter((o) => !o.mv.flip);
      return pick(quiet.length ? quiet : safe, (o) => (o.fours ? 300 : 0));
    }
  }

  // 5. Positional: quiet moves, plus a 뒤집기 only when it makes a four or an open three and one stays in reserve.
  const reserve = charges[me] >= 2;
  const pool = opts.filter((o) => !o.mv.flip || (reserve && (o.fours >= 1 || !!doubleFourMove(o.board, me, [0, 0, 0]))));
  // Never hand them a five or an unanswerable double.
  const sound = pool.filter((o) => !fivePoints(o.board, foe).length && !doubleFourMove(o.board, foe, o.charges));
  const list = sound.length ? sound : pool.length ? pool : opts;
  const ranked = list.map((o) => ({ o, v: evaluate(o.board, me, o.charges) + o.fours * 400 + Math.random() * noise })).sort((a, b) => b.v - a.v);
  // Both levels look at the opponent's best reply (flips included) among their top choices; 어려움 looks wider.
  const width = hard ? 10 : 3;
  let best = ranked[0].o.mv, bestScore = -Infinity;
  for (const { o, v } of ranked.slice(0, width)) {
    if (Date.now() > deadline && bestScore > -Infinity) break;
    const score = worstReply(o.board, me, o.charges) + (v - evaluate(o.board, me, o.charges)) + o.fours * 200;
    if (score > bestScore) { bestScore = score; best = o.mv; }
  }
  return best;
}

/** Whether one opponent reply (a block or a flip) leaves `me` with no five point after `o`. */
function refutable(o: Option, me: Player): boolean {
  const foe = other(me);
  if (fivePoints(o.board, foe).length) return true; // they make five first
  for (const r of candidates(o.board)) for (const rm of movesAt(o.board, r, foe, o.charges)) {
    const reply = play(o.board, r, foe, rm.flip);
    if (reply.win || !fivePoints(reply.board, me).length) return true;
  }
  return false;
}

export function coordinateLabel(at: number) {
  const letters = 'ABCDEFGHJKLMNOP';
  return `${letters[at % SIZE]}${SIZE - Math.floor(at / SIZE)}`;
}

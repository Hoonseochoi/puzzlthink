// 뒤집기 오목 (PUZZLTHINK original): 오목 on a 15×15 board, plus the 오셀로 sandwich, under the usual 오목 rules.
// - Placing a stone flips every straight run of enemy stones it closes off against one of your own stones
//   (all eight directions, any length). Only the mover flips. Flipped stones keep the other colour's eyes.
// - Exactly five in a row wins; six or more (장목) does not. A five that includes a stone flipped by that very move
//   doesn't win (so a blocker that gets flipped can't hand over the game).
// - 쌍삼 is forbidden for both sides: a move may not make two open threes at once, unless it makes five.

export const SIZE = 15;
/** 0 empty · 1 red placed · 2 blue placed · 3 red flipped · 4 blue flipped */
export type Cell = 0 | 1 | 2 | 3 | 4;
export type Player = 1 | 2;
export type Board = Cell[];
export type FlipDifficulty = 'normal' | 'hard';

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
function fiveThrough(board: Board, at: number, p: Player, fresh: ReadonlySet<number> = new Set()): Line | null {
  for (const [dr, dc] of LINE_DIRS) {
    const run = runAt(board, at, p, dr, dc);
    if (run.len !== 5) continue;
    let clean = true;
    for (let k = 0, i = run.start; k < 5; k++, i += dr * SIZE + dc) if (fresh.has(i)) { clean = false; break; }
    if (clean) return { start: run.start, end: run.end, owner: p };
  }
  return null;
}

/** Place and flip, then check for an exact five through the placed stone; a five that needs this move's flips doesn't count. Doesn't check 쌍삼; see `isForbidden`. */
export function play(board: Board, at: number, p: Player): MoveResult {
  const flipped = flipsFor(board, at, p);
  const next = board.slice();
  next[at] = p;
  for (const f of flipped) next[f] = (p === 1 ? 3 : 4);
  return { board: next, flipped, win: fiveThrough(next, at, p, new Set(flipped)) };
}

/** After a move at `at` that flipped `flipped`: it lined up five, but only thanks to those flips, so it doesn't win. */
export function voidFive(board: Board, at: number, flipped: number[]): boolean {
  const p = owner(board[at]);
  if (!p || !flipped.length) return false;
  return fiveThrough(board, at, p) !== null && fiveThrough(board, at, p, new Set(flipped)) === null;
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

/** 중간: one move of lookahead with a little randomness — solid, but it can be out-read. */
function normalMove(board: Board, me: Player, moves: number[]): number {
  const foe = other(me);
  const ranked = moves.map((m) => {
    const res = play(board, m, me);
    return { m, res, score: evaluate(res.board, me) + res.flipped.length * 40 + Math.random() * 60 };
  }).sort((a, b) => b.score - a.score);
  let best = ranked[0].m, bestScore = -Infinity, checked = 0;
  for (const { m, res, score } of ranked) {
    // Look at the best eight; past that keep looking only until one safe move turns up.
    if (checked >= 8 && bestScore > -Infinity) break;
    checked++;
    if (winningReply(res.board, foe) !== null) continue;
    // Assume the opponent answers with their best-looking move (this spots a block that would just get flipped).
    let worst = Infinity;
    for (const r of candidates(res.board)) {
      const reply = play(res.board, r, foe);
      const v = evaluate(reply.board, me) - reply.flipped.length * 40;
      if (v < worst) worst = v;
    }
    void score;
    if (worst > bestScore) { bestScore = worst; best = m; }
  }
  return best;
}

// ---- 어려움: alpha-beta search ----

// The windows each point belongs to, so a move only re-scores the lines it touches.
const WINDOWS_OF: number[][] = Array.from({ length: SIZE * SIZE }, () => []);
WINDOWS.forEach((w, k) => { for (const i of w) WINDOWS_OF[i].push(k); });
const SEARCH_SCORE = [0, 2, 24, 260, 6000, 0];
const WIN = 1e9;

/** Window value from red's side: + for red-only windows, − for blue-only ones. */
function windowValue(board: Board, k: number): number {
  let red = 0, blue = 0;
  for (const i of WINDOWS[k]) { const o = owner(board[i]); if (o === 1) red++; else if (o === 2) blue++; }
  if (red && !blue) return SEARCH_SCORE[red];
  if (blue && !red) return -SEARCH_SCORE[blue];
  return 0;
}

function totalValue(board: Board): number {
  let v = 0;
  for (let k = 0; k < WINDOWS.length; k++) v += windowValue(board, k);
  return v;
}

/** Change in red-side value when `before` becomes `after` at the given points. */
function deltaValue(before: Board, after: Board, changed: number[]): number {
  const seen = new Set<number>();
  for (const c of changed) for (const k of WINDOWS_OF[c]) seen.add(k);
  let d = 0;
  for (const k of seen) d += windowValue(after, k) - windowValue(before, k);
  return d;
}

interface Child { m: number; res: MoveResult; value: number; order: number }

/** Legal moves for `p`, best-looking first, cut to `width` (wins always kept first). */
function orderedMoves(board: Board, value: number, p: Player, width: number): Child[] {
  const sign = p === 1 ? 1 : -1, foe = other(p);
  const out: Child[] = [];
  for (const m of candidates(board)) {
    const res = play(board, m, p);
    const v = value + deltaValue(board, res.board, [m, ...res.flipped]);
    // Order by my gain plus how much the same point would have been worth to the opponent (blocking).
    const theirs = play(board, m, foe);
    const block = -sign * deltaValue(board, theirs.board, [m, ...theirs.flipped]); // ≥ 0: what the point is worth to them
    // My five first, then the point where the opponent would make five, then the rest.
    out.push({ m, res, value: v, order: res.win ? 2e12 : theirs.win ? 1e12 : sign * (v - value) + block * 0.9 });
  }
  out.sort((a, b) => b.order - a.order);
  const legal: Child[] = [];
  for (const ch of out) {
    if (ch.res.win || !isForbidden(board, ch.m, p)) legal.push(ch);
    if (legal.length >= width) break;
  }
  return legal;
}

/** Negamax with alpha-beta; scores are from the side to move. */
function negamax(board: Board, value: number, p: Player, depth: number, alpha: number, beta: number, deadline: number, ply: number): number {
  const sign = p === 1 ? 1 : -1;
  if (depth === 0 || Date.now() > deadline) return sign * value;
  const moves = orderedMoves(board, value, p, depth >= 3 ? 10 : 8);
  if (!moves.length) return 0;
  let best = -Infinity;
  for (const ch of moves) {
    const score = ch.res.win ? WIN - ply : -negamax(ch.res.board, ch.value, other(p), depth - 1, -beta, -alpha, deadline, ply + 1);
    if (score > best) best = score;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

/** 어려움: iterative deepening (2 → 4 → 6 plies) inside a time budget, best move of the deepest finished pass. */
function hardMove(board: Board, me: Player, budgetMs = 800): number {
  const deadline = Date.now() + budgetMs;
  const value = totalValue(board);
  const root = orderedMoves(board, value, me, 14);
  if (!root.length) return candidates(board)[0];
  const win = root.find((ch) => ch.res.win);
  if (win) return win.m;
  let best = root[0].m;
  for (let depth = 2; depth <= 6; depth += 2) {
    let alpha = -Infinity, bestHere = root[0].m, finished = true;
    const scored: { ch: Child; score: number }[] = [];
    for (const ch of root) {
      const score = -negamax(ch.res.board, ch.value, other(me), depth - 1, -Infinity, -alpha, deadline, 1);
      if (Date.now() > deadline) { finished = false; break; }
      scored.push({ ch, score });
      if (score > alpha) { alpha = score; bestHere = ch.m; }
    }
    if (!finished) break;
    best = bestHere;
    if (alpha >= WIN - 10) break; // a forced win was found
    // Search the best lines first next time.
    root.sort((a, b) => (scored.find((x) => x.ch === b)?.score ?? -Infinity) - (scored.find((x) => x.ch === a)?.score ?? -Infinity));
  }
  return best;
}

export function chooseMove(board: Board, me: Player, difficulty: FlipDifficulty = 'normal'): number {
  const moves = candidates(board).filter((m) => !isForbidden(board, m, me));
  if (!moves.length) return board.findIndex((v, i) => !v && !isForbidden(board, i, me));
  for (const m of moves) if (play(board, m, me).win) return m;
  return difficulty === 'hard' ? hardMove(board, me) : normalMove(board, me, moves);
}

export function coordinateLabel(at: number) {
  const letters = 'ABCDEFGHJKLMNOP';
  return `${letters[at % SIZE]}${SIZE - Math.floor(at / SIZE)}`;
}

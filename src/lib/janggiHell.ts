// 십이장기 '매우 어려움' (hell) engine: iterative-deepening PVS (negamax alpha-beta) over a small
// mutable board, with a Zobrist transposition table, killer/history move ordering, a capture/escape
// quiescence search, exact king-capture / camp-entry wins, and a time budget.
// No runtime imports, so it runs the same in the browser worker, on the main thread, and in Node scripts.
import type { Action, HandType, JanggiState, PieceType } from './janggi';

const ROWS = 4, COLS = 3, N = 12;
const MAX_GAME_PLY = 200; // keep in step with janggi.ts MAX_PLY
const TYPES: PieceType[] = ['jang', 'sang', 'wang', 'ja', 'hu'];
const T_JANG = 0, T_SANG = 1, T_WANG = 2, T_JA = 3, T_HU = 4;
const HAND_TYPES: HandType[] = ['jang', 'sang', 'ja'];
const HAND_T = [T_JANG, T_SANG, T_JA]; // hand index -> piece type
const T_HAND = [0, 1, -1, 2, 2]; // piece type -> hand index when captured (侯 returns as 子)
const DIRS: [number, number][][] = [
  [[-1, 0], [1, 0], [0, -1], [0, 1]],
  [[-1, -1], [-1, 1], [1, -1], [1, 1]],
  [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]],
  [[-1, 0]],
  [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0]],
];

// code = owner*5 + type + 1 (0 = empty)
const ownerOf = (code: number) => (code > 5 ? 1 : 0);
const typeOf = (code: number) => (code - 1) % 5;
const rowOf = (i: number) => (i / COLS) | 0;
/** Cells of the camp `side` starts in: side 0 bottom row, side 1 top row. */
const CAMP = [0b111 << 9, 0b111];

const ATT = new Int32Array(11 * N); // attacked-cell mask per (code, cell)
for (let code = 1; code <= 10; code++) {
  const sign = ownerOf(code) === 0 ? 1 : -1;
  for (let i = 0; i < N; i++) {
    let mask = 0;
    for (const [dr, dc] of DIRS[typeOf(code)]) {
      const r = rowOf(i) + dr * sign, c = (i % COLS) + dc * sign;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) mask |= 1 << (r * COLS + c);
    }
    ATT[code * N + i] = mask;
  }
}

// ---------- Zobrist hashing (two 32-bit halves: low indexes the table, high verifies) ----------
let seed = 0x9e3779b9;
const rnd = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return seed | 0; };
const Z_PC_LO = new Int32Array(11 * N), Z_PC_HI = new Int32Array(11 * N);
const Z_HAND_LO = new Int32Array(6 * 3), Z_HAND_HI = new Int32Array(6 * 3);
for (let i = 0; i < 11 * N; i++) { Z_PC_LO[i] = rnd(); Z_PC_HI[i] = rnd(); }
for (let i = 0; i < 18; i++) { Z_HAND_LO[i] = rnd(); Z_HAND_HI[i] = rnd(); }
const Z_SIDE_LO = rnd(), Z_SIDE_HI = rnd();

// ---------- Search state ----------
const b = new Int8Array(N);
const hand = new Int8Array(6); // side*3 + hand index
let side = 0, hLo = 0, hHi = 0;
const king = new Int8Array(2);
let basePly = 0;

const MAXP = 128;
const moveBuf = new Int16Array(MAXP * 128);
const scoreBuf = new Int32Array(MAXP * 128);
const pathLo = new Int32Array(MAXP + 256), pathHi = new Int32Array(MAXP + 256);
const pathBase = 0; // the search path starts at the root
/** Earlier positions of the game: low hash -> [high hash, times seen]. */
const gameSeen = new Map<number, [number, number]>();

const TT_BITS = 20, TT_SIZE = 1 << TT_BITS, TT_MASK = TT_SIZE - 1;
const ttKey = new Int32Array(TT_SIZE), ttVal = new Int16Array(TT_SIZE), ttDepth = new Int8Array(TT_SIZE);
const ttFlag = new Int8Array(TT_SIZE), ttMove = new Int16Array(TT_SIZE);
const EXACT = 1, LOWER = 2, UPPER = 3;

const killers = new Int16Array(MAXP * 2).fill(-1);
const hist = new Int32Array(2 * 180);

const WIN = 30000;
const MATE_BOUND = WIN - 1000;
const INF = 32000;

let nodes = 0, deadline = 0, stopped = false;

// Tunable evaluation weights (centi-pieces).
export const EVAL = {
  board: [380, 330, 0, 100, 470], // jang, sang, wang, ja, hu
  hand: [420, 360, 0, 120, 0],
  kingAdvance: 35,
  kingNearCamp: 60, // extra when the king stands one row from the enemy camp
  mobility: 6,
  kingZone: 14, // enemy attacks on cells around a king
  hanging: 0.35, // share of a hanging piece's value counted as already lost (side not to move)
};

const hashSet = (code: number, i: number) => { hLo ^= Z_PC_LO[code * N + i]; hHi ^= Z_PC_HI[code * N + i]; };
const handSet = (k: number, delta: number) => {
  hLo ^= Z_HAND_LO[k * 3 + hand[k]]; hHi ^= Z_HAND_HI[k * 3 + hand[k]];
  hand[k] += delta;
  hLo ^= Z_HAND_LO[k * 3 + hand[k]]; hHi ^= Z_HAND_HI[k * 3 + hand[k]];
};

function load(state: JanggiState) {
  hLo = 0; hHi = 0;
  for (let i = 0; i < N; i++) {
    const p = state.board[i];
    const code = p ? p.owner * 5 + TYPES.indexOf(p.type) + 1 : 0;
    b[i] = code;
    if (code) { hashSet(code, i); if (typeOf(code) === T_WANG) king[ownerOf(code)] = i; }
  }
  for (let s = 0; s < 2; s++) for (let k = 0; k < 3; k++) {
    hand[s * 3 + k] = 0;
    hLo ^= Z_HAND_LO[(s * 3 + k) * 3]; hHi ^= Z_HAND_HI[(s * 3 + k) * 3];
    const n = state.hands[s].filter((t) => t === HAND_TYPES[k]).length;
    for (let j = 0; j < n; j++) handSet(s * 3 + k, 1);
  }
  side = state.turn;
  if (side) { hLo ^= Z_SIDE_LO; hHi ^= Z_SIDE_HI; }
  basePly = state.ply;
}

function attacks(s: number): number {
  let mask = 0;
  for (let i = 0; i < N; i++) { const c = b[i]; if (c && ownerOf(c) === s) mask |= ATT[c * N + i]; }
  return mask;
}

function ownMask(s: number): number {
  let mask = 0;
  for (let i = 0; i < N; i++) { const c = b[i]; if (c && ownerOf(c) === s) mask |= 1 << i; }
  return mask;
}

// ---------- Moves: from*12+to (0..143), drop 144 + hand*12 + to ----------
const DROP = 144;

function genMoves(ply: number, capturesOnly: boolean): number {
  const base = ply * 128;
  let n = 0;
  const own = ownMask(side), enemy = ownMask(side ^ 1);
  for (let from = 0; from < N; from++) {
    const c = b[from];
    if (!c || ownerOf(c) !== side) continue;
    let t = ATT[c * N + from] & ~own;
    if (capturesOnly) {
      // captures, plus the king stepping into the enemy camp (an entry threat)
      t &= enemy | (typeOf(c) === T_WANG ? CAMP[side ^ 1] : 0);
    }
    while (t) { const to = 31 - Math.clz32(t); t &= ~(1 << to); moveBuf[base + n++] = from * N + to; }
  }
  if (!capturesOnly) {
    const empty = ~(own | enemy) & 0xfff & ~CAMP[side ^ 1];
    for (let k = 0; k < 3; k++) {
      if (!hand[side * 3 + k]) continue;
      let t = empty;
      while (t) { const to = 31 - Math.clz32(t); t &= ~(1 << to); moveBuf[base + n++] = DROP + k * N + to; }
    }
  }
  return n;
}

// undo data per ply
const uCap = new Int8Array(MAXP), uCode = new Int8Array(MAXP);

function make(m: number, ply: number) {
  const s = side;
  if (m < DROP) {
    const from = (m / N) | 0, to = m % N;
    const code = b[from], cap = b[to];
    uCap[ply] = cap; uCode[ply] = code;
    if (cap) { hashSet(cap, to); handSet(s * 3 + T_HAND[typeOf(cap)], 1); }
    const promote = typeOf(code) === T_JA && (CAMP[s ^ 1] >> to) & 1;
    const nc = promote ? s * 5 + T_HU + 1 : code;
    hashSet(code, from); b[from] = 0;
    hashSet(nc, to); b[to] = nc;
    if (typeOf(code) === T_WANG) king[s] = to;
  } else {
    const k = ((m - DROP) / N) | 0, to = (m - DROP) % N;
    const code = s * 5 + HAND_T[k] + 1;
    handSet(s * 3 + k, -1);
    hashSet(code, to); b[to] = code;
  }
  side ^= 1; hLo ^= Z_SIDE_LO; hHi ^= Z_SIDE_HI;
}

function unmake(m: number, ply: number) {
  side ^= 1; hLo ^= Z_SIDE_LO; hHi ^= Z_SIDE_HI;
  const s = side;
  if (m < DROP) {
    const from = (m / N) | 0, to = m % N;
    const code = uCode[ply], cap = uCap[ply];
    hashSet(b[to], to);
    b[to] = cap;
    if (cap) { hashSet(cap, to); handSet(s * 3 + T_HAND[typeOf(cap)], -1); }
    b[from] = code; hashSet(code, from);
    if (typeOf(code) === T_WANG) king[s] = from;
  } else {
    const k = ((m - DROP) / N) | 0, to = (m - DROP) % N;
    hashSet(b[to], to); b[to] = 0;
    handSet(s * 3 + k, 1);
  }
}

const popcount = (x: number) => { let n = 0; while (x) { x &= x - 1; n++; } return n; };

/** Static evaluation from the side to move's point of view. */
function evaluate(): number {
  const me = side, op = side ^ 1;
  const attMe = attacks(me), attOp = attacks(op);
  let score = 0;
  let worstHanging = 0;
  for (let i = 0; i < N; i++) {
    const c = b[i];
    if (!c) continue;
    const t = typeOf(c), o = ownerOf(c);
    let v = EVAL.board[t];
    if (t === T_WANG) {
      const adv = o === 0 ? ROWS - 1 - rowOf(i) : rowOf(i);
      v = adv * EVAL.kingAdvance + (adv === 2 ? EVAL.kingNearCamp : 0);
    }
    if (o === me) score += v; else score -= v;
    // A piece of the side NOT to move, attacked and undefended, is likely lost.
    if (o === op && t !== T_WANG && (attMe >> i) & 1 && !((attOp >> i) & 1)) worstHanging = Math.max(worstHanging, EVAL.board[t]);
  }
  score += worstHanging * EVAL.hanging;
  for (let k = 0; k < 3; k++) score += (hand[me * 3 + k] * EVAL.hand[HAND_T[k]]) - (hand[op * 3 + k] * EVAL.hand[HAND_T[k]]);
  score += (popcount(attMe) - popcount(attOp)) * EVAL.mobility;
  const zone = (k: number) => ATT[(2 + 1) * N + k] | (1 << k); // wang code for side 0 is 3 (symmetric moves)
  score += popcount(zone(king[op]) & attMe) * EVAL.kingZone - popcount(zone(king[me]) & attOp) * EVAL.kingZone;
  return score | 0;
}

/** How many times this position (same side to move) came up before, in the game or along the search path. */
function seenBefore(ply: number): number {
  let n = 0;
  for (let i = ply - 2; i >= 0; i -= 2) if (pathLo[i] === hLo && pathHi[i] === hHi) n++;
  const g = gameSeen.get(hLo);
  return g && g[0] === hHi ? n + g[1] : n;
}
// The game bans a move that brings a position back a third time: such a child answers BANNED,
// so its parent sees -BANNED and never picks it (unless every move is banned).
const BANNED = 31000;

/**
 * Terminal checks at a node (side to move = `side`). Returns a score or null.
 * - We can capture the enemy king: win now.
 * - Our king stands in the enemy camp (it entered and survived): win.
 * - The enemy king stands in our camp and we can't take it: we lose after our move.
 * - We can step our king into the enemy camp on a cell they don't attack: win in two plies.
 */
function terminal(ply: number, attMe: number, attOp: number): number | null {
  const me = side, op = side ^ 1;
  if ((attMe >> king[op]) & 1) return WIN - ply;
  if ((CAMP[op] >> king[me]) & 1) return WIN - ply;
  if ((CAMP[me] >> king[op]) & 1) return -(WIN - ply - 1);
  const kingSteps = ATT[(me * 5 + T_WANG + 1) * N + king[me]] & CAMP[op] & ~attOp & ~ownMask(me);
  if (kingSteps) return WIN - ply - 2;
  return null;
}

function checkTime() {
  if ((++nodes & 1023) === 0 && Date.now() > deadline) stopped = true;
}

function orderMoves(ply: number, n: number, ttm: number) {
  const base = ply * 128;
  for (let j = 0; j < n; j++) {
    const m = moveBuf[base + j];
    let sc = 0;
    if (m === ttm) sc = 1 << 30;
    else if (m < DROP) {
      const cap = b[m % N];
      if (cap) sc = (1 << 28) + EVAL.board[typeOf(cap)] * 16 - EVAL.board[typeOf(b[(m / N) | 0])];
      else if (killers[ply * 2] === m) sc = 1 << 27;
      else if (killers[ply * 2 + 1] === m) sc = (1 << 27) - 1;
      else sc = hist[side * 180 + m];
    } else if (killers[ply * 2] === m) sc = 1 << 27;
    else if (killers[ply * 2 + 1] === m) sc = (1 << 27) - 1;
    else sc = hist[side * 180 + m];
    scoreBuf[base + j] = sc;
  }
}

function pickNext(ply: number, j: number, n: number): number {
  const base = ply * 128;
  let best = j;
  for (let k = j + 1; k < n; k++) if (scoreBuf[base + k] > scoreBuf[base + best]) best = k;
  if (best !== j) {
    const tm = moveBuf[base + j]; moveBuf[base + j] = moveBuf[base + best]; moveBuf[base + best] = tm;
    const ts = scoreBuf[base + j]; scoreBuf[base + j] = scoreBuf[base + best]; scoreBuf[base + best] = ts;
  }
  return moveBuf[base + j];
}

function qsearch(alpha: number, beta: number, ply: number, qd: number): number {
  checkTime();
  const attMe = attacks(side), attOp = attacks(side ^ 1);
  const term = terminal(ply, attMe, attOp);
  if (term !== null) return term;
  if (basePly + ply >= MAX_GAME_PLY) return 0;
  if (ply >= MAXP - 2) return evaluate();
  const inCheck = (attOp >> king[side]) & 1;
  let best = -INF;
  if (!inCheck || qd >= 6) {
    best = evaluate();
    if (best >= beta) return best;
    if (best > alpha) alpha = best;
  }
  const n = genMoves(ply, !(inCheck && qd < 6));
  orderMoves(ply, n, -1);
  for (let j = 0; j < n; j++) {
    const m = pickNext(ply, j, n);
    pathLo[pathBase + ply] = hLo; pathHi[pathBase + ply] = hHi;
    make(m, ply);
    const v = -qsearch(-beta, -alpha, ply + 1, qd + 1);
    unmake(m, ply);
    if (stopped) return 0;
    if (v > best) best = v;
    if (v > alpha) { alpha = v; if (alpha >= beta) break; }
  }
  return best === -INF ? evaluate() : best;
}

function search(depth: number, alpha: number, beta: number, ply: number): number {
  checkTime();
  if (ply >= 2 && seenBefore(ply) >= 2) return BANNED; // root moves are already filtered by the ban
  const attMe = attacks(side), attOp = attacks(side ^ 1);
  const term = terminal(ply, attMe, attOp);
  if (term !== null) return term;
  if (basePly + ply >= MAX_GAME_PLY) return 0;
  if (depth <= 0 || ply >= MAXP - 8) return qsearch(alpha, beta, ply, 0);

  // mate-distance pruning
  if (alpha < -(WIN - ply)) alpha = -(WIN - ply);
  if (beta > WIN - ply - 1) beta = WIN - ply - 1;
  if (alpha >= beta) return alpha;

  const slot = hLo & TT_MASK;
  let ttm = -1;
  if (ttKey[slot] === hHi) {
    ttm = ttMove[slot];
    if (ttDepth[slot] >= depth && ply > 0) {
      let v = ttVal[slot];
      if (v > MATE_BOUND) v -= ply; else if (v < -MATE_BOUND) v += ply;
      const f = ttFlag[slot];
      if (f === EXACT || (f === LOWER && v >= beta) || (f === UPPER && v <= alpha)) return v;
    }
  }

  const inCheck = (attOp >> king[side]) & 1;
  const ext = inCheck ? 1 : 0;
  const n = genMoves(ply, false);
  if (!n) return evaluate();
  orderMoves(ply, n, ttm);
  const origAlpha = alpha;
  let best = -INF, bestMove = -1;
  pathLo[pathBase + ply] = hLo; pathHi[pathBase + ply] = hHi;
  for (let j = 0; j < n; j++) {
    const m = pickNext(ply, j, n);
    make(m, ply);
    let v: number;
    if (j === 0) v = -search(depth - 1 + ext, -beta, -alpha, ply + 1);
    else {
      // late quiet moves at depth are reduced a ply
      const quiet = m >= DROP || !uCap[ply];
      const red = depth >= 3 && j >= 4 && quiet && !inCheck ? 1 : 0;
      v = -search(depth - 1 - red + ext, -alpha - 1, -alpha, ply + 1);
      if (v > alpha && red) v = -search(depth - 1 + ext, -alpha - 1, -alpha, ply + 1);
      if (v > alpha && v < beta) v = -search(depth - 1 + ext, -beta, -alpha, ply + 1);
    }
    unmake(m, ply);
    if (stopped) return 0;
    if (v > best) { best = v; bestMove = m; }
    if (v > alpha) {
      alpha = v;
      if (alpha >= beta) {
        const quiet = m >= DROP || !b[m % N];
        if (quiet && killers[ply * 2] !== m) { killers[ply * 2 + 1] = killers[ply * 2]; killers[ply * 2] = m; }
        if (quiet) hist[side * 180 + m] += depth * depth;
        break;
      }
    }
  }
  if (best <= -BANNED) return evaluate(); // every move banned: the game lifts the ban; rough guess
  let store = best;
  if (store > MATE_BOUND) store += ply; else if (store < -MATE_BOUND) store -= ply;
  if (ttKey[slot] !== hHi || ttDepth[slot] <= depth) {
    ttKey[slot] = hHi; ttVal[slot] = store; ttDepth[slot] = depth; ttMove[slot] = bestMove;
    ttFlag[slot] = best <= origAlpha ? UPPER : best >= beta ? LOWER : EXACT;
  }
  return best;
}

// ---------- Root ----------

const toAction = (m: number): Action => (m < DROP
  ? { kind: 'move', from: (m / N) | 0, to: m % N }
  : { kind: 'drop', type: HAND_TYPES[((m - DROP) / N) | 0], to: (m - DROP) % N });
const fromAction = (a: Action): number => (a.kind === 'move' ? a.from * N + a.to : DROP + HAND_TYPES.indexOf(a.type) * N + a.to);

export type HellResult = { action: Action; value: number; depth: number; nodes: number; candidates: number };

/**
 * Picks a move for the side to move. `allowed` is the root move list after the repetition ban
 * (playableActions); `history` the positions played so far (replayStates), so the search treats
 * going back to one of them as a draw. Moves within `margin` of the best are picked at random.
 */
export function chooseHellAction(
  state: JanggiState, allowed: Action[], history: JanggiState[] = [],
  opts: { budgetMs?: number; maxDepth?: number; margin?: number; random?: () => number } = {},
): HellResult | null {
  const budgetMs = opts.budgetMs ?? 1500, maxDepth = opts.maxDepth ?? 40, margin = opts.margin ?? 12;
  const random = opts.random ?? Math.random;
  if (!allowed.length) return null;
  const roots = allowed.map(fromAction);
  // game history hashes (same side to move as positions at even distance)
  gameSeen.clear();
  load(state);
  const nowLo = hLo, nowHi = hHi;
  let skippedNow = false;
  for (let k = history.length - 1; k >= 0; k--) {
    load(history[k]);
    if (!skippedNow && hLo === nowLo && hHi === nowHi && k === history.length - 1) { skippedNow = true; continue; } // the current position itself
    const g = gameSeen.get(hLo);
    if (g && g[0] === hHi) g[1]++; else if (!g) gameSeen.set(hLo, [hHi, 1]);
  }
  load(state);
  deadline = Date.now() + budgetMs; stopped = false; nodes = 0;
  killers.fill(-1);
  for (let i = 0; i < hist.length; i++) hist[i] >>= 2;

  let scores = roots.map(() => 0);
  let doneDepth = 0;
  let order = roots.map((_, i) => i);
  // Taking the king ends the game at once (the search below never plays that capture).
  const kingTake = roots.find((m) => m < DROP && b[m % N] && typeOf(b[m % N]) === T_WANG);
  if (kingTake !== undefined) return { action: toAction(kingTake), value: WIN, depth: 0, nodes: 0, candidates: 1 };
  for (let depth = 1; depth <= maxDepth; depth++) {
    const next = roots.map(() => -INF);
    let best = -INF;
    pathLo[pathBase] = hLo; pathHi[pathBase] = hHi;
    for (const i of order) {
      const m = roots[i];
      // keep alpha `margin` below the best so near-best moves get real scores
      const alpha = best === -INF ? -INF : best - margin - 1;
      make(m, 0);
      let v: number;
      if (best === -INF) v = -search(depth - 1, -INF, INF, 1);
      else {
        v = -search(depth - 1, -alpha - 1, -alpha, 1);
        if (v > alpha && !stopped) v = -search(depth - 1, -INF, -alpha, 1);
      }
      unmake(m, 0);
      if (stopped) break;
      next[i] = v;
      if (v > best) best = v;
    }
    if (stopped) break;
    scores = next; doneDepth = depth;
    order = order.slice().sort((x, y) => scores[y] - scores[x]);
    if (best > MATE_BOUND || best < -MATE_BOUND) {
      if (depth >= 3 && (best > MATE_BOUND || scores.every((s) => s < -MATE_BOUND))) break; // decided
    }
  }
  const best = Math.max(...scores);
  const cut = Math.abs(best) > MATE_BOUND ? best : best - margin;
  const pool = roots.map((m, i) => ({ m, v: scores[i] })).filter((x) => x.v >= cut);
  const pick = pool[Math.floor(random() * pool.length)] ?? { m: roots[order[0]], v: best };
  return { action: toAction(pick.m), value: pick.v, depth: doneDepth, nodes, candidates: pool.length };
}

/** Time budget for this device: about 1.5 s on desktop, 1 s on phones. */
export function hellBudgetMs(): number {
  if (typeof navigator === 'undefined') return 1500;
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  return coarse ? 1000 : 1500;
}

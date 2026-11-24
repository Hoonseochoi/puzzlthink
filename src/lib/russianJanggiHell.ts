// 러시아장기 '매우 어려움' (hell) engine: iterative-deepening PVS (negamax alpha-beta) with a
// Zobrist transposition table, killer/history ordering, exact line wins (including a line revealed
// by lifting a cup) and a time budget. The game is deterministic with full information — no dice,
// no hidden cups — so there is nothing to average over: the search reads exact outcomes.
// No runtime imports, so it runs the same in the browser worker, on the main thread, and in Node scripts.
import type { Action, RJState, Size } from './russianJanggi';

const MAX_GAME_PLY = 80; // keep in step with russianJanggi.ts MAX_PLY
const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const LINE_MASKS = LINES.map((l) => l.reduce((m, c) => m | (1 << c), 0));
const ORDER = [4, 0, 2, 6, 8, 1, 3, 5, 7];
const CENTRE_W = [3, 2, 3, 2, 4, 2, 3, 2, 3]; // lines through each cell

// ---------- state: occ[cell*3+size] = 0 empty, 1 side 0, 2 side 1; hands[side*3+size] ----------
const occ = new Int8Array(27);
const hand = new Int8Array(6);
let side = 0, hLo = 0, hHi = 0, basePly = 0;

let seed = 0x2545f491;
const rnd = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return seed | 0; };
const Z_LO = new Int32Array(54), Z_HI = new Int32Array(54);
for (let i = 0; i < 54; i++) { Z_LO[i] = rnd(); Z_HI[i] = rnd(); }
const Z_SIDE_LO = rnd(), Z_SIDE_HI = rnd();
const zx = (slot: number, owner: number) => { hLo ^= Z_LO[slot * 2 + owner]; hHi ^= Z_HI[slot * 2 + owner]; };

const topSize = (c: number) => (occ[c * 3 + 2] ? 2 : occ[c * 3 + 1] ? 1 : occ[c * 3] ? 0 : -1);

function topMasks(): [number, number] {
  let m0 = 0, m1 = 0;
  for (let c = 0; c < 9; c++) {
    const z = topSize(c);
    if (z < 0) continue;
    if (occ[c * 3 + z] === 1) m0 |= 1 << c; else m1 |= 1 << c;
  }
  return [m0, m1];
}
const hasLine = (mask: number) => LINE_MASKS.some((l) => (mask & l) === l);

function load(state: RJState) {
  occ.fill(0); hLo = 0; hHi = 0;
  state.board.forEach((stack, c) => { for (const p of stack) { occ[c * 3 + p.size] = p.owner + 1; zx(c * 3 + p.size, p.owner); } });
  for (let s = 0; s < 2; s++) for (let z = 0; z < 3; z++) hand[s * 3 + z] = state.hands[s][z];
  side = state.turn;
  if (side) { hLo ^= Z_SIDE_LO; hHi ^= Z_SIDE_HI; }
  basePly = state.ply;
}

// ---------- moves: place = size*9+cell (0..26), move = 27 + from*9 + to ----------
const MAXP = 100;
const moveBuf = new Int16Array(MAXP * 96);
const scoreBuf = new Int32Array(MAXP * 96);

function genMoves(ply: number): number {
  const base = ply * 96;
  let n = 0;
  for (let z = 2; z >= 0; z--) {
    if (!hand[side * 3 + z]) continue;
    for (const c of ORDER) if (topSize(c) < z) moveBuf[base + n++] = z * 9 + c;
  }
  for (const f of ORDER) {
    const z = topSize(f);
    if (z < 0 || occ[f * 3 + z] !== side + 1) continue;
    for (const t of ORDER) if (t !== f && topSize(t) < z) moveBuf[base + n++] = 27 + f * 9 + t;
  }
  return n;
}

const uSize = new Int8Array(MAXP);

function make(m: number, ply: number) {
  if (m < 27) {
    const z = (m / 9) | 0, c = m % 9;
    occ[c * 3 + z] = side + 1; zx(c * 3 + z, side); hand[side * 3 + z]--;
  } else {
    const f = ((m - 27) / 9) | 0, t = (m - 27) % 9, z = topSize(f);
    uSize[ply] = z;
    occ[f * 3 + z] = 0; zx(f * 3 + z, side);
    occ[t * 3 + z] = side + 1; zx(t * 3 + z, side);
  }
  side ^= 1; hLo ^= Z_SIDE_LO; hHi ^= Z_SIDE_HI;
}

function unmake(m: number, ply: number) {
  side ^= 1; hLo ^= Z_SIDE_LO; hHi ^= Z_SIDE_HI;
  if (m < 27) {
    const z = (m / 9) | 0, c = m % 9;
    occ[c * 3 + z] = 0; zx(c * 3 + z, side); hand[side * 3 + z]++;
  } else {
    const f = ((m - 27) / 9) | 0, t = (m - 27) % 9, z = uSize[ply];
    occ[t * 3 + z] = 0; zx(t * 3 + z, side);
    occ[f * 3 + z] = side + 1; zx(f * 3 + z, side);
  }
}

/** After `mover` played: -1 it revealed the opponent's line (they win), +1 it made its own, 0 neither. */
function outcome(mover: number): number {
  const masks = topMasks();
  if (hasLine(masks[mover ^ 1])) return -1;
  if (hasLine(masks[mover])) return 1;
  return 0;
}

export const EVAL = { two: 34, one: 5, centre: 6, bigInHand: 16, midInHand: 5, covered: 7, tempo: 8, threats: 22 };

/** Static evaluation for the side to move. */
function evaluate(): number {
  const me = side, op = side ^ 1;
  const [m0, m1] = topMasks();
  const mine = me === 0 ? m0 : m1, theirs = me === 0 ? m1 : m0;
  let score = EVAL.tempo;
  let myThreat = 0, opThreat = 0;
  for (const l of LINE_MASKS) {
    const a = popcount(mine & l), d = popcount(theirs & l);
    if (!d) { score += a === 2 ? EVAL.two : a === 1 ? EVAL.one : 0; if (a === 2) myThreat |= l & ~mine; }
    if (!a) { score -= d === 2 ? EVAL.two : d === 1 ? EVAL.one : 0; if (d === 2) opThreat |= l & ~theirs; }
  }
  // Several open two-lines at once are hard to stop.
  score += (popcount(myThreat) > 1 ? EVAL.threats : 0) - (popcount(opThreat) > 1 ? EVAL.threats : 0);
  for (let c = 0; c < 9; c++) {
    const z = topSize(c);
    if (z < 0) continue;
    const owner = occ[c * 3 + z] - 1;
    score += (owner === me ? 1 : -1) * CENTRE_W[c] * EVAL.centre * (z + 1) / 3;
    for (let u = 0; u < z; u++) {
      const under = occ[c * 3 + u] - 1;
      if (under < 0 || under === owner) continue;
      // a cup under the other colour is locked; uncovering it later is a risk for the top owner
      score += (owner === me ? 1 : -1) * EVAL.covered * (u + 1);
    }
  }
  score += (hand[me * 3 + 2] - hand[op * 3 + 2]) * EVAL.bigInHand + (hand[me * 3 + 1] - hand[op * 3 + 1]) * EVAL.midInHand;
  return score | 0;
}
const popcount = (x: number) => { let n = 0; while (x) { x &= x - 1; n++; } return n; };

// ---------- search ----------
const WIN = 10000, MATE_BOUND = WIN - 500, INF = 32000;
const TT_BITS = 20, TT_SIZE = 1 << TT_BITS, TT_MASK = TT_SIZE - 1;
const ttKey = new Int32Array(TT_SIZE), ttVal = new Int16Array(TT_SIZE), ttDepth = new Int8Array(TT_SIZE);
const ttFlag = new Int8Array(TT_SIZE), ttMove = new Int16Array(TT_SIZE);
const EXACT = 1, LOWER = 2, UPPER = 3;
const killers = new Int16Array(MAXP * 2).fill(-1);
const hist = new Int32Array(2 * 108);
const pathLo = new Int32Array(MAXP + 200), pathHi = new Int32Array(MAXP + 200);
let pathBase = 0;
let nodes = 0, deadline = 0, stopped = false;

function isRepeat(ply: number): boolean {
  for (let i = pathBase + ply - 1; i >= 0; i--) if (pathLo[i] === hLo && pathHi[i] === hHi) return true;
  return false;
}

function orderMoves(ply: number, n: number, ttm: number) {
  const base = ply * 96;
  for (let j = 0; j < n; j++) {
    const m = moveBuf[base + j];
    scoreBuf[base + j] = m === ttm ? 1 << 30 : killers[ply * 2] === m ? 1 << 28 : killers[ply * 2 + 1] === m ? (1 << 28) - 1 : hist[side * 108 + m];
  }
}
function pickNext(ply: number, j: number, n: number): number {
  const base = ply * 96;
  let best = j;
  for (let k = j + 1; k < n; k++) if (scoreBuf[base + k] > scoreBuf[base + best]) best = k;
  if (best !== j) {
    const tm = moveBuf[base + j]; moveBuf[base + j] = moveBuf[base + best]; moveBuf[base + best] = tm;
    const ts = scoreBuf[base + j]; scoreBuf[base + j] = scoreBuf[base + best]; scoreBuf[base + best] = ts;
  }
  return moveBuf[base + j];
}

function search(depth: number, alpha: number, beta: number, ply: number, passed: boolean): number {
  if ((++nodes & 1023) === 0 && Date.now() > deadline) stopped = true;
  if (stopped) return 0;
  if (basePly + ply >= MAX_GAME_PLY) return 0;
  if (ply > 0 && isRepeat(ply)) return 0;
  if (ply >= MAXP - 2) return evaluate();
  if (alpha < -(WIN - ply)) alpha = -(WIN - ply);
  if (beta > WIN - ply - 1) beta = WIN - ply - 1;
  if (alpha >= beta) return alpha;

  const n = genMoves(ply);
  if (!n) {
    if (passed) return 0; // nobody can act: draw
    pathLo[pathBase + ply] = hLo; pathHi[pathBase + ply] = hHi;
    side ^= 1; hLo ^= Z_SIDE_LO; hHi ^= Z_SIDE_HI;
    const v = -search(depth, -beta, -alpha, ply + 1, true);
    side ^= 1; hLo ^= Z_SIDE_LO; hHi ^= Z_SIDE_HI;
    return v;
  }
  // A win this move is final: look for one before anything else.
  const base = ply * 96;
  for (let j = 0; j < n; j++) {
    const m = moveBuf[base + j];
    const mover = side;
    make(m, ply);
    const o = outcome(mover);
    unmake(m, ply);
    if (o > 0) return WIN - ply - 1;
  }
  if (depth <= 0) return evaluate();

  const slot = hLo & TT_MASK;
  let ttm = -1;
  if (ttKey[slot] === hHi) {
    ttm = ttMove[slot];
    if (ttDepth[slot] >= depth) {
      let v = ttVal[slot];
      if (v > MATE_BOUND) v -= ply; else if (v < -MATE_BOUND) v += ply;
      const f = ttFlag[slot];
      if (f === EXACT || (f === LOWER && v >= beta) || (f === UPPER && v <= alpha)) return v;
    }
  }
  orderMoves(ply, n, ttm);
  const origAlpha = alpha;
  let best = -INF, bestMove = -1;
  pathLo[pathBase + ply] = hLo; pathHi[pathBase + ply] = hHi;
  for (let j = 0; j < n; j++) {
    const m = pickNext(ply, j, n);
    const mover = side;
    make(m, ply);
    const o = outcome(mover);
    let v: number;
    if (o < 0) v = -(WIN - ply - 1);
    else if (j === 0) v = -search(depth - 1, -beta, -alpha, ply + 1, false);
    else {
      v = -search(depth - 1, -alpha - 1, -alpha, ply + 1, false);
      if (v > alpha && v < beta) v = -search(depth - 1, -beta, -alpha, ply + 1, false);
    }
    unmake(m, ply);
    if (stopped) return 0;
    if (v > best) { best = v; bestMove = m; }
    if (v > alpha) {
      alpha = v;
      if (alpha >= beta) {
        if (killers[ply * 2] !== m) { killers[ply * 2 + 1] = killers[ply * 2]; killers[ply * 2] = m; }
        hist[mover * 108 + m] += depth * depth;
        break;
      }
    }
  }
  let store = best;
  if (store > MATE_BOUND) store += ply; else if (store < -MATE_BOUND) store -= ply;
  if (ttKey[slot] !== hHi || ttDepth[slot] <= depth) {
    ttKey[slot] = hHi; ttVal[slot] = store; ttDepth[slot] = depth; ttMove[slot] = bestMove;
    ttFlag[slot] = best <= origAlpha ? UPPER : best >= beta ? LOWER : EXACT;
  }
  return best;
}

const toAction = (m: number): Action => (m < 27
  ? { kind: 'place', size: ((m / 9) | 0) as Size, to: m % 9 }
  : { kind: 'move', from: ((m - 27) / 9) | 0, to: (m - 27) % 9 });

export type HellResult = { action: Action; value: number; depth: number; nodes: number; candidates: number };

/**
 * Picks a move for the side to move. `history` (replayStates) lets the search treat going back to an
 * earlier position as a draw, so it presses on when ahead. Moves within `margin` of the best are picked at random.
 */
export function chooseHellAction(
  state: RJState,
  opts: { budgetMs?: number; maxDepth?: number; margin?: number; history?: RJState[]; random?: () => number } = {},
): HellResult {
  const budgetMs = opts.budgetMs ?? 1500, maxDepth = opts.maxDepth ?? 60, margin = opts.margin ?? 8;
  const random = opts.random ?? Math.random;
  pathBase = 0;
  for (const h of (opts.history ?? []).slice(-120)) { load(h); pathLo[pathBase] = hLo; pathHi[pathBase] = hHi; pathBase++; }
  load(state);
  if (pathBase && pathLo[pathBase - 1] === hLo && pathHi[pathBase - 1] === hHi) pathBase--;
  const roots = Array.from(moveBuf.subarray(0, genMoves(0)));
  if (!roots.length) return { action: { kind: 'pass' }, value: 0, depth: 0, nodes: 0, candidates: 0 };
  deadline = Date.now() + budgetMs; stopped = false; nodes = 0;
  killers.fill(-1);
  for (let i = 0; i < hist.length; i++) hist[i] >>= 2;

  // Book: after a large cup in the centre as the first move (a theoretical win for the first player),
  // a cup in a corner leaves the fewest winning answers — 16 of 28 for a large cup, 18 of 31 for a
  // small one, against 19-23 for the other replies (checked offline with 3 s searches per answer).
  if (state.board.every((st, c) => (c === 4 ? st.length === 1 && st[0].size === 2 && st[0].owner !== state.turn : !st.length))) {
    const corner = [0, 2, 6, 8][Math.floor(random() * 4)];
    return { action: { kind: 'place', size: random() < 0.5 ? 2 : 0, to: corner }, value: 0, depth: 0, nodes: 0, candidates: 8 };
  }

  // Immediate results first: a winning move is played at once; a move revealing their line is never chosen.
  const instant = roots.map((m) => { const mover = side; make(m, 0); const o = outcome(mover); unmake(m, 0); return o; });
  const win = roots.findIndex((_, i) => instant[i] > 0);
  if (win >= 0) return { action: toAction(roots[win]), value: WIN, depth: 0, nodes: 0, candidates: 1 };

  let scores = roots.map((_, i) => (instant[i] < 0 ? -WIN : 0));
  let order = roots.map((_, i) => i).filter((i) => instant[i] >= 0);
  let doneDepth = 0;
  for (let depth = 1; depth <= maxDepth && order.length; depth++) {
    const next = scores.slice();
    let best = -INF;
    pathLo[pathBase] = hLo; pathHi[pathBase] = hHi;
    for (const i of order) {
      const m = roots[i];
      const alpha = best === -INF ? -INF : best - margin - 1;
      make(m, 0);
      let v: number;
      if (best === -INF) v = -search(depth - 1, -INF, INF, 1, false);
      else {
        v = -search(depth - 1, -alpha - 1, -alpha, 1, false);
        if (v > alpha && !stopped) v = -search(depth - 1, -INF, -alpha, 1, false);
      }
      unmake(m, 0);
      if (stopped) break;
      next[i] = v;
      if (v > best) best = v;
    }
    if (stopped) break;
    scores = next; doneDepth = depth;
    order = order.slice().sort((x, y) => scores[y] - scores[x]);
    if (depth >= 2 && (best > MATE_BOUND || order.every((i) => scores[i] < -MATE_BOUND))) break; // decided
  }
  const ranked = roots.map((m, i) => ({ m, v: scores[i] })).filter((_, i) => instant[i] >= 0);
  if (!ranked.length) return { action: toAction(roots[0]), value: -WIN, depth: doneDepth, nodes, candidates: 0 };
  const best = Math.max(...ranked.map((x) => x.v));
  if (best < -MATE_BOUND) {
    // Lost against perfect play: instead of only dragging it out, play the move that leaves the
    // opponent the fewest winning replies, and none they can see at once (an immediate line).
    const tricky = trickiest(ranked.slice().sort((a, b) => b.v - a.v).map((x) => x.m)); // ties: the longest fight
    if (tricky) return { action: toAction(tricky.m), value: best, depth: doneDepth, nodes, candidates: tricky.pool };
  }
  const cut = Math.abs(best) > MATE_BOUND ? best : best - margin;
  const pool = ranked.filter((x) => x.v >= cut);
  const pick = pool[Math.floor(random() * pool.length)];
  return { action: toAction(pick.m), value: pick.v, depth: doneDepth, nodes, candidates: pool.length };
}

/**
 * For each of our moves, the share of the opponent's sensible replies (ones that don't hand us a line)
 * that still win for them. Lower is better; a reply that wins on the spot counts as certain.
 * Runs on whatever time the budget has left; returns null if it can't finish.
 */
function trickiest(moves: number[]): { m: number; pool: number } | null {
  const me = side;
  let bestM = -1, bestShare = Infinity, pool = 0;
  pathLo[pathBase] = hLo; pathHi[pathBase] = hHi;
  for (const m of moves) {
    make(m, 0);
    pathLo[pathBase + 1] = hLo; pathHi[pathBase + 1] = hHi;
    const n = genMoves(1);
    const replies = Array.from(moveBuf.subarray(96, 96 + n));
    let sensible = 0, winning = 0, certain = false;
    for (const r of replies) {
      make(r, 1);
      const o = outcome(me ^ 1);
      if (o > 0) certain = true;
      else if (o === 0) {
        sensible++;
        if (!certain && search(6, -INF, -MATE_BOUND, 2, false) < -MATE_BOUND) winning++;
      }
      unmake(r, 1);
      if (certain || stopped) break;
    }
    unmake(m, 0);
    if (stopped) return null;
    const share = certain ? 2 : sensible ? winning / sensible : 1;
    if (share < bestShare - 1e-9) { bestShare = share; bestM = m; pool = 1; } else if (Math.abs(share - bestShare) < 1e-9) pool++;
  }
  return bestM >= 0 ? { m: bestM, pool } : null;
}

/** Time budget for this device: about 1.5 s on desktop, 1 s on phones. */
export function hellBudgetMs(): number {
  if (typeof navigator === 'undefined') return 1500;
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  return coarse ? 1000 : 1500;
}

// 카드 장기 AI (어려움 only). It is handed the game as its own seat sees it: its own layout, and of the opponent's only
// the used cards and the face-up one. Everything else is searched over:
//
// - Moves: every order the opponent's face-down cards could be in is a "world" (at most 4! = 24). In each world the
//   rest of both layouts is fixed, so the game is a plain two-player game: alpha-beta with a transposition table
//   (iterative deepening) scores every move, and the move with the best average win chance over all worlds is played.
// - Layouts: candidate orders are grown card by card (a beam over prefixes); each prefix is scored by searching just far
//   enough to see all its cards played, against the possible opponent orders.
// - Past the end of a known layout a side may play any card it has left in that cycle (it will lay them out then).
//
// A timeout on the opponent's side (rule 13: the AI moves the opponent's piece) uses the same search, picking the
// opponent move that is worst for the opponent.
import {
  CJ_CELLS, CJ_MAX_PLY, JUMPS, RAYS, type CjGame, type CjSeat, currentCard, goalOf, isKing, kingOf, layoutSize, legalMoves, seatOfPiece, xOf, yOf,
} from './cardJanggi';

const WIN = 30000;
const WON = 20000; // scores above this are forced wins
const PASS = 31; // from/to of a pass (no cell has this index)
const ALL = 31; // card mask: all five

type St = {
  b: Int8Array;
  seq: number[][]; // known rest of each side's layout (from index pos)
  pos: number[];
  mask: number[]; // cards a side may still choose from once its known layout is used up
  left: number[]; // how many cards are left in that free cycle
  turn: number;
  ply: number; // absolute ply in the round
  king: number[]; // cell of each 왕
  count: number[]; // pieces of each side
  h1: number; h2: number; // Zobrist hash of the board and side to move
};

let deadline = 0;
let nodes = 0;
let aborted = false;
let reached = 0;
const tick = () => {
  nodes += 1;
  if ((nodes & 2047) === 0 && Date.now() > deadline) aborted = true;
  return aborted;
};

// ---------------------------------------------------------------------------------------------- hashing

let seed = 0x2545f491;
const rnd = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return seed | 0; };
const Z1 = Array.from({ length: 5 }, () => Int32Array.from({ length: CJ_CELLS }, rnd));
const Z2 = Array.from({ length: 5 }, () => Int32Array.from({ length: CJ_CELLS }, rnd));
const TURN1 = rnd(), TURN2 = rnd();
// Per side: position in the known layout (0–5), free mask (0–31) and cards left in the free cycle (0–5).
const POS1 = [Int32Array.from({ length: 8 }, rnd), Int32Array.from({ length: 8 }, rnd)];
const POS2 = [Int32Array.from({ length: 8 }, rnd), Int32Array.from({ length: 8 }, rnd)];
const MASK1 = [Int32Array.from({ length: 32 }, rnd), Int32Array.from({ length: 32 }, rnd)];
const MASK2 = [Int32Array.from({ length: 32 }, rnd), Int32Array.from({ length: 32 }, rnd)];
const LEFT1 = [Int32Array.from({ length: 8 }, rnd), Int32Array.from({ length: 8 }, rnd)];
const LEFT2 = [Int32Array.from({ length: 8 }, rnd), Int32Array.from({ length: 8 }, rnd)];

const TT_BITS = 18;
const TT_SIZE = 1 << TT_BITS;
const ttKey = new Int32Array(TT_SIZE);
const ttGen = new Int32Array(TT_SIZE);
const ttDepth = new Int8Array(TT_SIZE);
const ttFlag = new Int8Array(TT_SIZE); // 0 exact, 1 lower bound, 2 upper bound
const ttVal = new Int32Array(TT_SIZE);
const ttMove = new Int32Array(TT_SIZE);
let gen = 1;
const newTable = () => { gen += 1; };

function fullHash(s: St): [number, number] {
  let h1 = s.turn ? TURN1 : 0, h2 = s.turn ? TURN2 : 0;
  for (let c = 0; c < CJ_CELLS; c += 1) if (s.b[c]) { h1 ^= Z1[s.b[c]][c]; h2 ^= Z2[s.b[c]][c]; }
  return [h1, h2];
}
let key1 = 0, key2 = 0;
/** Sets key1/key2: the board hash plus where each side stands in its cards. */
function keyOf(s: St) {
  let h1 = s.h1, h2 = s.h2;
  for (let side = 0; side < 2; side += 1) {
    const p = s.pos[side] > 7 ? 7 : s.pos[side];
    h1 ^= POS1[side][p] ^ MASK1[side][s.mask[side]] ^ LEFT1[side][s.left[side]];
    h2 ^= POS2[side][p] ^ MASK2[side][s.mask[side]] ^ LEFT2[side][s.left[side]];
  }
  key1 = h1; key2 = h2;
}

// ---------------------------------------------------------------------------------------------- moves

const encode = (card: number, from: number, to: number) => (card << 10) | (from << 5) | to;
const cardOf = (m: number) => m >> 10;
const fromOf = (m: number) => (m >> 5) & 31;
const toOf = (m: number) => m & 31;

const cardBuf = [0, 0, 0, 0, 0];
/** Cards the side may play now: its face-up card, or any card left in a free cycle. Fills cardBuf, returns the count. */
function cardsFor(s: St, side: number): number {
  if (s.pos[side] < s.seq[side].length) { cardBuf[0] = s.seq[side][s.pos[side]]; return 1; }
  let n = 0;
  for (let c = 0; c < 5; c += 1) if (s.mask[side] & (1 << c)) cardBuf[n++] = c;
  return n;
}

function genMoves(s: St, out: number[]): number {
  const side = s.turn;
  const b = s.b;
  let n = 0;
  const k = cardsFor(s, side);
  const cards = cardBuf.slice(0, k);
  for (const card of cards) {
    for (let from = 0; from < CJ_CELLS; from += 1) {
      const p = b[from];
      if (!p || ((p - 1) >> 1) !== side) continue;
      if (card === 3) {
        for (const ray of RAYS[from]) for (const to of ray) { const q = b[to]; if (!q) out[n++] = encode(card, from, to); else { if (((q - 1) >> 1) !== side) out[n++] = encode(card, from, to); break; } }
      } else {
        for (const to of JUMPS[card][from]) { const q = b[to]; if (!q || ((q - 1) >> 1) !== side) out[n++] = encode(card, from, to); }
      }
    }
  }
  if (n === 0) out[n++] = encode(cards[0] ?? 0, PASS, PASS);
  return n;
}

type Undo = { cap: number; fixed: boolean; mask: number; left: number };

function make(s: St, m: number): Undo {
  const side = s.turn;
  const card = cardOf(m), from = fromOf(m), to = toOf(m);
  const fixed = s.pos[side] < s.seq[side].length;
  const undo: Undo = { cap: 0, fixed, mask: s.mask[side], left: s.left[side] };
  if (fixed) s.pos[side] += 1;
  else {
    let mask = s.mask[side] & ~(1 << card), left = s.left[side] - 1;
    if (left <= 0 || mask === 0) { mask = ALL; left = 5; }
    s.mask[side] = mask; s.left[side] = left;
  }
  if (from !== PASS) {
    const p = s.b[from];
    const cap = s.b[to];
    undo.cap = cap;
    s.h1 ^= Z1[p][from] ^ Z1[p][to]; s.h2 ^= Z2[p][from] ^ Z2[p][to];
    if (cap) { s.h1 ^= Z1[cap][to]; s.h2 ^= Z2[cap][to]; }
    s.b[to] = p; s.b[from] = 0;
    if (isKing(p)) s.king[side] = to;
    if (cap) { s.count[1 - side] -= 1; if (isKing(cap)) s.king[1 - side] = -1; }
  }
  s.h1 ^= TURN1; s.h2 ^= TURN2;
  s.turn = 1 - side;
  s.ply += 1;
  return undo;
}

function unmake(s: St, m: number, u: Undo) {
  s.ply -= 1;
  const side = 1 - s.turn;
  s.turn = side;
  s.h1 ^= TURN1; s.h2 ^= TURN2;
  const from = fromOf(m), to = toOf(m);
  if (from !== PASS) {
    const p = s.b[to];
    s.b[from] = p; s.b[to] = u.cap;
    s.h1 ^= Z1[p][from] ^ Z1[p][to]; s.h2 ^= Z2[p][from] ^ Z2[p][to];
    if (u.cap) { s.h1 ^= Z1[u.cap][to]; s.h2 ^= Z2[u.cap][to]; }
    if (isKing(p)) s.king[side] = from;
    if (u.cap) { s.count[1 - side] += 1; if (isKing(u.cap)) s.king[1 - side] = to; }
  }
  if (u.fixed) s.pos[side] -= 1;
  else { s.mask[side] = u.mask; s.left[side] = u.left; }
}

/** Whether the move just made (by `side`) won the round. */
const wonBy = (s: St, side: number, m: number) => fromOf(m) !== PASS && (s.king[1 - side] < 0 || s.king[side] === goalOf(side));

const dist = (a: number, b: number) => Math.abs(xOf(a) - xOf(b)) + Math.abs(yOf(a) - yOf(b));
const cheb = (a: number, b: number) => Math.max(Math.abs(xOf(a) - xOf(b)), Math.abs(yOf(a) - yOf(b)));

/** Static score for the side to move. */
function evaluate(s: St): number {
  const me = s.turn, op = 1 - me;
  let v = (s.count[me] - s.count[op]) * 120;
  const myK = s.king[me], opK = s.king[op];
  v += (dist(opK, goalOf(op)) - dist(myK, goalOf(me))) * 16;
  // Pieces close to a 왕 or to its home square (the square the enemy 왕 wants) press on it; own pieces there guard it.
  const myHome = goalOf(op), opHome = goalOf(me);
  for (let c = 0; c < CJ_CELLS; c += 1) {
    const p = s.b[c];
    if (!p || isKing(p)) continue;
    const side = seatOfPiece(p);
    const sign = side === me ? 1 : -1;
    const enemyK = side === me ? opK : myK;
    const enemyHome = side === me ? opHome : myHome;
    const ownHome = side === me ? myHome : opHome;
    const ownK = side === me ? myK : opK;
    const dk = cheb(c, enemyK);
    if (dk <= 2) v += sign * (dk === 1 ? 22 : 10);
    if (cheb(c, enemyHome) <= 1) v += sign * 6;
    if (cheb(c, ownHome) <= 1 || cheb(c, ownK) <= 1) v += sign * 8;
  }
  return v + 10; // the move is worth something
}

/** Score of a finished round for the side to move (`ply` past the limit). */
function limitScore(s: St): number {
  const d = s.count[s.turn] - s.count[1 - s.turn];
  return d > 0 ? WON + 1 : d < 0 ? -WON - 1 : 0;
}

const moveBufs: number[][] = Array.from({ length: 64 }, () => new Array(160));
const scoreBufs: number[][] = Array.from({ length: 64 }, () => new Array(160));
const killers: number[] = new Array(64).fill(-1);

function orderMoves(s: St, moves: number[], n: number, scores: number[], hint: number, killer: number) {
  const side = s.turn;
  const goal = goalOf(side);
  const opK = s.king[1 - side];
  for (let i = 0; i < n; i += 1) {
    const m = moves[i];
    const from = fromOf(m), to = toOf(m);
    let sc = 0;
    if (m === hint) sc = 1e6;
    else if (from === PASS) sc = -1000;
    else {
      const p = s.b[from], q = s.b[to];
      if (q && isKing(q)) sc = 5e5;
      else if (isKing(p) && to === goal) sc = 4e5;
      else {
        if (q) sc += 2000;
        if (m === killer) sc += 1500;
        if (isKing(p)) sc += (dist(from, goal) - dist(to, goal)) * 30;
        sc += (cheb(from, opK) - cheb(to, opK)) * 10;
      }
    }
    scores[i] = sc;
  }
  for (let i = 1; i < n; i += 1) {
    const m = moves[i], sc = scores[i];
    let j = i - 1;
    while (j >= 0 && scores[j] < sc) { moves[j + 1] = moves[j]; scores[j + 1] = scores[j]; j -= 1; }
    moves[j + 1] = m; scores[j + 1] = sc;
  }
}

/** Leaf check: can the side to move win right now (take the 왕 or step onto the goal)? */
function winsNow(s: St): boolean {
  const side = s.turn;
  const opK = s.king[1 - side], myK = s.king[side], goal = goalOf(side);
  const enemyOrEmpty = (cell: number) => !s.b[cell] || ((s.b[cell] - 1) >> 1) !== side;
  const k = cardsFor(s, side);
  for (let i = 0; i < k; i += 1) {
    const card = cardBuf[i];
    for (let from = 0; from < CJ_CELLS; from += 1) {
      const p = s.b[from];
      if (!p || ((p - 1) >> 1) !== side) continue;
      if (card === 3) {
        for (const ray of RAYS[from]) for (const to of ray) { if (to === opK || (from === myK && to === goal && enemyOrEmpty(to))) return true; if (s.b[to]) break; }
      } else {
        for (const to of JUMPS[card][from]) if (to === opK || (from === myK && to === goal && enemyOrEmpty(to))) return true;
      }
    }
  }
  return false;
}

// Forced-win scores count plies from the root; in the table they are stored relative to the node.
const toTT = (v: number, h: number) => (v > WON ? v + h : v < -WON ? v - h : v);
const fromTT = (v: number, h: number) => (v > WON ? v - h : v < -WON ? v + h : v);

function search(s: St, depth: number, alpha: number, beta: number, height: number): number {
  if (tick()) return 0;
  if (s.ply >= CJ_MAX_PLY) return limitScore(s);
  if (winsNow(s)) return WIN - height - 1;
  if (depth <= 0) return evaluate(s);
  keyOf(s);
  const k2 = key2;
  const slot = key1 & (TT_SIZE - 1);
  let hint = -1;
  if (ttGen[slot] === gen && ttKey[slot] === k2) {
    hint = ttMove[slot];
    if (ttDepth[slot] >= depth) {
      const v = fromTT(ttVal[slot], height);
      const flag = ttFlag[slot];
      if (flag === 0 || (flag === 1 && v >= beta) || (flag === 2 && v <= alpha)) return v;
    }
  }
  const moves = moveBufs[height], scores = scoreBufs[height];
  const n = genMoves(s, moves);
  orderMoves(s, moves, n, scores, hint, killers[height]);
  const alpha0 = alpha;
  let best = -Infinity, bestMove = moves[0];
  for (let i = 0; i < n; i += 1) {
    const m = moves[i];
    const side = s.turn;
    const u = make(s, m);
    const v = wonBy(s, side, m) ? WIN - height - 1 : -search(s, depth - 1, -beta, -alpha, height + 1);
    unmake(s, m, u);
    if (aborted) return 0;
    if (v > best) { best = v; bestMove = m; }
    if (v > alpha) alpha = v;
    if (alpha >= beta) { if (fromOf(m) !== PASS && !s.b[toOf(m)]) killers[height] = m; break; }
  }
  ttKey[slot] = k2; ttGen[slot] = gen; ttDepth[slot] = depth; ttMove[slot] = bestMove; ttVal[slot] = toTT(best, height);
  ttFlag[slot] = best <= alpha0 ? 2 : best >= beta ? 1 : 0;
  return best;
}

const winProb = (v: number) => (v >= WON ? 1 : v <= -WON ? 0 : 1 / (1 + Math.exp(-v / 180)));
const clampWin = (v: number) => Math.max(-WIN, Math.min(WIN, v));

// ---------------------------------------------------------------------------------------------- worlds

/** Every way the opponent's face-down cards could be ordered (sampled down to `max`). */
function oppWorlds(g: CjGame, op: number, max: number): number[][] {
  const seq = g.seq[op] ?? [];
  const pos = g.pos[op];
  let known: number[] = [];
  let unknown: number;
  let pool: number[];
  if (g.arranging[op]) {
    // Still laying out (start of a round): any order of a full layout.
    unknown = layoutSize(g, op);
    pool = [0, 1, 2, 3, 4];
  } else {
    known = seq.slice(pos).filter((c) => c >= 0);
    unknown = seq.slice(pos).filter((c) => c < 0).length;
    const seen = new Set(seq.filter((c) => c >= 0));
    pool = [0, 1, 2, 3, 4].filter((c) => !seen.has(c));
  }
  const tails: number[][] = [];
  const rec = (acc: number[], rest: number[]) => {
    if (acc.length === unknown) { tails.push(acc); return; }
    rest.forEach((c, i) => rec([...acc, c], [...rest.slice(0, i), ...rest.slice(i + 1)]));
  };
  rec([], pool);
  for (let i = tails.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [tails[i], tails[j]] = [tails[j], tails[i]]; }
  return tails.slice(0, max).map((tail) => [...known, ...tail]);
}

function stateFor(g: CjGame, me: number, myRest: number[], myMask: number, myLeft: number, opRest: number[]): St {
  const b = Int8Array.from(g.board);
  const king = [-1, -1], count = [0, 0];
  for (let c = 0; c < CJ_CELLS; c += 1) { const p = b[c]; if (!p) continue; count[seatOfPiece(p)] += 1; if (isKing(p)) king[seatOfPiece(p)] = c; }
  const seq: number[][] = [[], []];
  seq[me] = myRest; seq[1 - me] = opRest;
  const mask = [ALL, ALL], left = [5, 5];
  mask[me] = myMask; left[me] = myLeft;
  const s: St = { b, seq, pos: [0, 0], mask, left, turn: g.turn, ply: g.ply, king, count, h1: 0, h2: 0 };
  [s.h1, s.h2] = fullHash(s);
  return s;
}

// ---------------------------------------------------------------------------------------------- decisions

export type CjAiMove = { from: number; to: number };

/**
 * The move for the side to move (`g.turn`), seen from `me`. If that is the opponent (it ran out of time),
 * the AI picks the move that is worst for them.
 */
export function chooseMove(g: CjGame, me: CjSeat, budgetMs = 1300): CjAiMove | null {
  const actor = g.turn;
  const card = currentCard(g, actor);
  if (g.phase !== 'move' || card < 0) return null;
  const root = legalMoves(g.board, actor, card);
  if (!root.length) return null;
  // Immediate wins (or, for the opponent, moves to avoid).
  const winning = root.filter(([from, to]) => g.board[to] === kingOf(1 - actor) || (isKing(g.board[from]) && to === goalOf(actor)));
  if (actor === me && winning.length) return { from: winning[0][0], to: winning[0][1] };
  let candidates = root;
  if (actor !== me && winning.length < root.length) candidates = root.filter((m) => !winning.includes(m));
  if (candidates.length === 1) return { from: candidates[0][0], to: candidates[0][1] };

  const scores = scoreMoves(g, me, candidates, budgetMs);
  let pick = 0;
  for (let i = 1; i < candidates.length; i += 1) if (actor === me ? scores[i] > scores[pick] : scores[i] < scores[pick]) pick = i;
  return { from: candidates[pick][0], to: candidates[pick][1] };
}

/**
 * Average win chance for `me` after each candidate move of the side to move (over every order the other side's
 * face-down cards could be in), from the deepest search finished within the budget.
 */
function scoreMoves(g: CjGame, me: CjSeat, candidates: [number, number][], budgetMs: number): number[] {
  const actor = g.turn;
  const card = currentCard(g, actor);
  const op = 1 - me;
  const myRest = (g.seq[me] ?? []).slice(g.pos[me]);
  const worlds = oppWorlds(g, op, 24);
  deadline = Date.now() + budgetMs; nodes = 0; aborted = false;
  let result: number[] | null = null;
  for (let depth = 1; depth <= 16; depth += 1) {
    // Within `depth` plies (and the leaf check one ply further) the opponent plays only so many cards: worlds that
    // agree on those are the same search, so each distinct prefix is searched once and counted by how many share it.
    let oppTurns = 0;
    for (let ply = 1; ply <= depth + 1; ply += 1) if ((ply % 2 === 1 ? actor : 1 - actor) === op) oppTurns += 1;
    const groups = new Map<string, { world: number[]; weight: number }>();
    for (const world of worlds) {
      const key = world.slice(0, oppTurns).join(',');
      const entry = groups.get(key);
      if (entry) entry.weight += 1; else groups.set(key, { world, weight: 1 });
    }
    const prob = new Array(candidates.length).fill(0), raw = new Array(candidates.length).fill(0);
    let allForced = true;
    for (const { world, weight } of groups.values()) {
      newTable();
      const s = stateFor(g, me, myRest, ALL, 5, world);
      let best = -WIN - 1; // best score for the actor in this world so far
      for (let i = 0; i < candidates.length && !aborted; i += 1) {
        const [from, to] = candidates[i];
        const m = encode(card, from, to);
        const u = make(s, m);
        let v: number;
        if (wonBy(s, actor, m)) v = WIN;
        else {
          // Moves far below the best one here only need a bound (their win chance is near zero anyway).
          const floor = Math.abs(best) < WON - 1000 ? best - 700 : -WIN - 1;
          v = -search(s, depth - 1, -WIN - 1, -floor, 1);
        }
        unmake(s, m, u);
        if (aborted) break;
        if (v > best) best = v;
        if (Math.abs(v) <= WON) allForced = false;
        const mine = actor === me ? v : -v; // score for `me`
        prob[i] += winProb(mine) * weight; raw[i] += clampWin(mine) * weight;
      }
      if (aborted) break;
    }
    if (aborted) break;
    result = prob.map((p, i) => p / worlds.length + raw[i] * 1e-9);
    reached = depth;
    if (allForced) break;
  }
  return result ?? candidates.map(() => 0);
}

export type CjJudgement = { played: [number, number]; better: [number, number]; playedChance: number; betterChance: number; missedWin: boolean };

/**
 * After a game: was the move `played` (by the side to move in `g`, seen as that side saw it) clearly worse than
 * the best one? Returns the better move when the search finds a clearly higher win chance, or a missed immediate win.
 */
export function judgeMove(g: CjGame, played: [number, number], budgetMs = 300): CjJudgement | null {
  const actor = g.turn as CjSeat;
  const card = currentCard(g, actor);
  if (g.phase !== 'move' || card < 0) return null;
  const root = legalMoves(g.board, actor, card);
  if (root.length < 2) return null;
  const wins = (m: [number, number]) => g.board[m[1]] === kingOf(1 - actor) || (isKing(g.board[m[0]]) && m[1] === goalOf(actor));
  const winning = root.find(wins);
  if (winning && !wins(played)) return { played, better: winning, playedChance: 0, betterChance: 1, missedWin: true };
  const scores = scoreMoves(g, actor, root, budgetMs);
  const at = root.findIndex(([f, t]) => f === played[0] && t === played[1]);
  if (at < 0) return null;
  let best = 0;
  for (let i = 1; i < root.length; i += 1) if (scores[i] > scores[best]) best = i;
  const gap = scores[best] - scores[at];
  if (best === at || gap < 0.28) return null;
  return { played, better: root[best], playedChance: scores[at], betterChance: scores[best], missedWin: false };
}

/** The AI's layout for the cycle it has to lay out now. */
export function chooseLayout(g: CjGame, me: CjSeat, budgetMs = 2200): number[] {
  const size = layoutSize(g, me);
  const op = 1 - me;
  const worlds = oppWorlds(g, op, 12);
  const meFirst = g.turn === me;
  deadline = Date.now() + budgetMs; nodes = 0; aborted = false;
  let ranked: number[][] = [[]];
  reached = 0;
  for (let level = 1; level <= Math.min(size, 4); level += 1) {
    const cands: number[][] = [];
    for (const prefix of ranked) for (let c = 0; c < 5; c += 1) if (!prefix.includes(c)) cands.push([...prefix, c]);
    const depth = 2 * level + (meFirst ? 0 : 1);
    const score = new Map<number[], number>();
    for (const cand of cands) {
      let total = 0;
      const used = cand.reduce((mask, c) => mask | (1 << c), 0);
      for (const world of worlds) {
        newTable();
        const s = stateFor(g, me, cand, ALL & ~used, size - cand.length, world);
        if (s.left[me] <= 0 || s.mask[me] === 0) { s.mask[me] = ALL; s.left[me] = 5; }
        const v = s.turn === me ? search(s, depth, -WIN - 1, WIN + 1, 0) : -search(s, depth, -WIN - 1, WIN + 1, 0);
        if (aborted) break;
        total += winProb(v) + clampWin(v) * 1e-9;
      }
      if (aborted) break;
      score.set(cand, total + Math.random() * 1e-7);
    }
    if (aborted) break;
    ranked = cands.sort((a, b) => (score.get(b) ?? 0) - (score.get(a) ?? 0)).slice(0, 5);
    reached = level;
  }
  const best = ranked[0];
  const rest = [0, 1, 2, 3, 4].filter((c) => !best.includes(c)).sort(() => Math.random() - 0.5);
  return [...best, ...rest].slice(0, size);
}

/** For tests: nodes searched by the last decision. */
export const lastNodes = () => nodes;
/** For tests: depth (moves, the shallowest world) or layout level reached by the last decision. */
export const lastDepth = () => reached;

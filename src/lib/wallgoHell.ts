// 벽바둑 / 벽바둑 II "매우 어려움" (hell) AI for the 1:1 mode.
//
// Iterative-deepening negamax with alpha-beta, a transposition table and forward pruning (only the best few
// candidates by static evaluation are searched at each depth). One ply is a whole turn: a placement, or a move
// plus the wall that follows it. Once few squares are still contested the pruning is switched off and the search
// runs to the end of the game when time allows. Placements are searched with the same tree.
//
// This file has no runtime imports, so the Web Worker and the Node self-play script can load it directly.
import type { Direction, MoveOption, Piece, PieceKind, PlayerId, Position, Variant } from './wallgo';

const N = 7;
const CELLS = 49;
const DR = [-N, 1, N, -1];
const DIR_NAMES: Direction[] = ['up', 'right', 'down', 'left'];
const PERP = [[3, 1], [0, 2], [3, 1], [0, 2]];
const WIN = 100_000;

export type HellRequest = {
  variant: Variant;
  pieces: Piece[];
  walls: string[];
  /** Who acts now. */
  toMove: PlayerId;
  /** Placements still to come, in order (the first one is `toMove`'s). Empty once play has started. */
  placeQueue: PlayerId[];
  /** Who moves first once every piece is placed. */
  firstMover: PlayerId;
  timeMs: number;
  /** Override the node budget instead of the clock (tests). */
  maxNodes?: number;
  seed?: number;
};
export type HellResult =
  | { type: 'place'; position: Position; kind?: PieceKind; depth: number; score: number; nodes: number }
  | { type: 'move'; move: MoveOption; wall: string; direction: Direction; depth: number; score: number; nodes: number }
  | null;

// ---------- Tunables ----------
export const HELL_TUNING = {
  rootWidth: 28,
  widths: [0, 999, 16, 11, 8, 7, 6, 6, 5],
  endgameContested: 14, // full-width search (exact when it finishes) at or below this many contested squares
  libertyWeight: 0.9,
  trappedWeight: 2.2,
  tempo: 0.6,
  tieShare: 0.35, // share of equidistant squares that goes to the side to move
  noise: 0.35,
};

// ---------- Zobrist ----------
let rngState = 0x9e3779b9;
const rnd32 = () => { rngState ^= rngState << 13; rngState ^= rngState >>> 17; rngState ^= rngState << 5; return rngState >>> 0; };
const ZP = new Uint32Array(2 * 2 * CELLS * 2); // [player][kind][cell][2 words]
const ZW = new Uint32Array(CELLS * 4 * 2);
for (let i = 0; i < ZP.length; i += 1) ZP[i] = rnd32();
for (let i = 0; i < ZW.length; i += 1) ZW[i] = rnd32();
const ZSIDE = [rnd32(), rnd32()];
const zp = (player: number, kind: number, cell: number) => ((player * 2 + kind) * CELLS + cell) * 2;
// One random pair per edge, shared by both of its cells (indexed by the lower cell: right or down).
const zwIndex = (cell: number, dir: number) => (dir === 1 || dir === 2 ? cell * 4 + dir : (cell + DR[dir]) * 4 + ((dir + 2) & 3)) * 2;

// ---------- Transposition table ----------
const TT_BITS = 19;
const TT_SIZE = 1 << TT_BITS;
const ttKey = new Int32Array(TT_SIZE);
const ttLock = new Int32Array(TT_SIZE);
const ttDepth = new Int8Array(TT_SIZE);
const ttFlag = new Int8Array(TT_SIZE); // 0 empty, 1 exact, 2 lower, 3 upper
const ttValue = new Float64Array(TT_SIZE);
const ttMove = new Int32Array(TT_SIZE);
let ttGeneration = 1;
const ttGen = new Int32Array(TT_SIZE);

// ---------- Search state ----------
const wallBits = new Uint8Array(CELLS);
const occ = new Int8Array(CELLS);
let pieceCount = 0;
const pCell = new Int8Array(16);
const pPlayer = new Int8Array(16);
const pKind = new Int8Array(16); // 0 square / v1 piece, 1 circle
const pId: string[] = [];
let variant: Variant = 1;
let placeQueue: number[] = [];
let placeIdx = 0;
let placeKind = 0;
let firstMover = 0;
let side = 0;
let h1 = 0, h2 = 0;
let salt = 0;

let nodes = 0;
let deadline = 0;
let nodeBudget = Infinity;
let heuristicUsed = false;
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

// Per-ply scratch.
const MAX_PLY = 96;
const MAX_MOVES = 640;
const moveBuf: Int32Array[] = [];
const scoreBuf: Float64Array[] = [];
for (let i = 0; i < MAX_PLY; i += 1) { moveBuf.push(new Int32Array(MAX_MOVES)); scoreBuf.push(new Float64Array(MAX_MOVES)); }
const undoFrom = new Int8Array(MAX_PLY);
const undoSide = new Int8Array(MAX_PLY);
const undoPlaced = new Int8Array(MAX_PLY);

// Region analysis scratch.
const regionOf = new Int8Array(CELLS);
const regionSize = new Int8Array(CELLS);
const regionOwners = new Uint8Array(CELLS);
const queue = new Int8Array(CELLS);
const distA = new Int8Array(CELLS);
const distB = new Int8Array(CELLS);
const qA = new Int8Array(CELLS);

const PLACE_FLAG = 1 << 14;
const encode = (piece: number, dest: number, dir: number) => (piece << 8) | (dest << 2) | dir;

function hashPiece(i: number, cell: number) {
  const z = zp(pPlayer[i], pKind[i], cell);
  h1 ^= ZP[z]; h2 ^= ZP[z + 1];
}
function toggleWall(cell: number, dir: number) {
  const other = cell + DR[dir];
  wallBits[cell] ^= 1 << dir;
  wallBits[other] ^= 1 << ((dir + 2) & 3);
  const z = zwIndex(cell, dir);
  h1 ^= ZW[z]; h2 ^= ZW[z + 1];
}
const allPlaced = () => placeIdx >= placeQueue.length;

// ---------- Region analysis ----------
type Analysis = { terminal: boolean; score: [number, number]; largest: [number, number]; contested: number };
const analysis: Analysis = { terminal: false, score: [0, 0], largest: [0, 0], contested: 0 };

function analyze(): Analysis {
  regionOf.fill(-1);
  let regions = 0;
  for (let start = 0; start < CELLS; start += 1) {
    if (regionOf[start] >= 0) continue;
    let head = 0, tail = 0;
    queue[tail++] = start; regionOf[start] = regions;
    let owners = 0;
    while (head < tail) {
      const c = queue[head++];
      const o = occ[c];
      if (o >= 0) owners |= 1 << pPlayer[o];
      const w = wallBits[c];
      for (let d = 0; d < 4; d += 1) {
        if (w & (1 << d)) continue;
        const n = c + DR[d];
        if (regionOf[n] < 0) { regionOf[n] = regions; queue[tail++] = n; }
      }
    }
    regionSize[regions] = tail; regionOwners[regions] = owners;
    regions += 1;
  }
  const score = analysis.score, largest = analysis.largest;
  score[0] = 0; score[1] = 0; largest[0] = 0; largest[1] = 0;
  let contested = 0;
  const placed = allPlaced();
  for (let r = 0; r < regions; r += 1) {
    const owners = regionOwners[r];
    if (owners === 1 || owners === 2) {
      if (!placed) { contested += regionSize[r]; continue; }
      const p = owners === 1 ? 0 : 1;
      score[p] += regionSize[r];
      if (regionSize[r] > largest[p]) largest[p] = regionSize[r];
    } else if (owners === 3) {
      // Frozen: every piece inside has no free neighbour. Then each scores its own square.
      let frozen = true;
      for (let i = 0; i < pieceCount && frozen; i += 1) {
        const c = pCell[i];
        if (c < 0 || regionOf[c] !== r) continue;
        const w = wallBits[c];
        for (let d = 0; d < 4; d += 1) if (!(w & (1 << d)) && occ[c + DR[d]] < 0) { frozen = false; break; }
      }
      if (frozen) {
        for (let i = 0; i < pieceCount; i += 1) {
          const c = pCell[i];
          if (c < 0 || regionOf[c] !== r) continue;
          score[pPlayer[i]] += 1;
          if (largest[pPlayer[i]] < 1) largest[pPlayer[i]] = 1;
        }
        regionOwners[r] = 4; // treat as settled
      } else contested += regionSize[r];
    }
  }
  analysis.contested = contested;
  analysis.terminal = placed && contested === 0;
  return analysis;
}

/** Exact value of a finished game for `p`. */
function terminalValue(a: Analysis, p: number, ply: number) {
  const q = p ^ 1;
  const margin = a.score[p] - a.score[q];
  let result = Math.sign(margin);
  if (result === 0 && variant === 2) result = Math.sign(a.largest[p] - a.largest[q]);
  if (result > 0) return WIN + margin * 16 - ply;
  if (result < 0) return -WIN + margin * 16 + ply;
  return margin * 16;
}

/** Heuristic value for the side to move. `a` must be fresh from analyze(). */
function evaluate(a: Analysis): number {
  heuristicUsed = true;
  const p = side, q = side ^ 1;
  const T = HELL_TUNING;
  // Voronoi over contested regions: squares a side reaches strictly first; pieces block.
  distA.fill(99); distB.fill(99);
  let ta = 0, tb = 0;
  const lib = [0, 0], trapped = [0, 0];
  for (let i = 0; i < pieceCount; i += 1) {
    const c = pCell[i];
    if (c < 0) continue;
    const owners = regionOwners[regionOf[c]];
    if (owners !== 3) continue;
    if (pPlayer[i] === 0) { distA[c] = 0; queue[ta++] = c; } else { distB[c] = 0; qA[tb++] = c; }
    let open = 0;
    const w = wallBits[c];
    for (let d = 0; d < 4; d += 1) if (!(w & (1 << d)) && occ[c + DR[d]] < 0) open += 1;
    lib[pPlayer[i]] += Math.min(open, 3);
    if (open === 0) trapped[pPlayer[i]] += 2; else if (open === 1) trapped[pPlayer[i]] += 1;
  }
  bfs(queue, ta, distA);
  bfs(qA, tb, distB);
  let v0 = 0, v1 = 0, ties = 0;
  for (let c = 0; c < CELLS; c += 1) {
    if (regionOwners[regionOf[c]] !== 3) continue;
    const da = distA[c], db = distB[c];
    if (da < db) v0 += 1; else if (db < da) v1 += 1; else if (da < 99) ties += 1;
  }
  const est = [a.score[0] + v0, a.score[1] + v1];
  let value = est[p] - est[q] + T.tieShare * ties; // equidistant squares lean to the side to move
  value += T.libertyWeight * 0.25 * (lib[p] - lib[q]) - T.trappedWeight * (trapped[p] - trapped[q]);
  value += T.tempo;
  if (!allPlaced()) value += placementBias(p) - placementBias(q);
  // Small deterministic noise per position so equal moves vary from game to game.
  const n = Math.imul((h1 ^ salt) | 0, 0x2c1b3c6d) >>> 0;
  value += ((n >>> 8) / 16_777_216 - 0.5) * T.noise;
  return value;
}

function placementBias(p: number) {
  // Pieces hugging the board edge or each other are weaker before walls exist.
  let bias = 0;
  for (let i = 0; i < pieceCount; i += 1) {
    if (pPlayer[i] !== p || pCell[i] < 0) continue;
    const c = pCell[i], r = (c / N) | 0, col = c % N;
    if (r === 0 || r === N - 1) bias -= 0.6;
    if (col === 0 || col === N - 1) bias -= 0.6;
  }
  return bias;
}

function bfs(q: Int8Array, tail: number, dist: Int8Array) {
  let head = 0;
  while (head < tail) {
    const c = q[head++];
    const d = dist[c] + 1;
    const w = wallBits[c];
    for (let k = 0; k < 4; k += 1) {
      if (w & (1 << k)) continue;
      const n = c + DR[k];
      if (occ[n] >= 0 || dist[n] <= d) continue;
      dist[n] = d; q[tail++] = n;
    }
  }
}

// ---------- Move generation ----------
const destSeen = new Int32Array(CELLS);
let destStamp = 1;

/** Writes moves for the side to move into `out`; returns the count. Needs regionOwners/regionOf from analyze(). */
function generate(out: Int32Array): number {
  let count = 0;
  if (!allPlaced()) {
    for (let c = 0; c < CELLS; c += 1) if (occ[c] < 0) out[count++] = PLACE_FLAG | c;
    return count;
  }
  let passDone = false;
  for (let i = 0; i < pieceCount; i += 1) {
    if (pPlayer[i] !== side) continue;
    const from = pCell[i];
    const settled = regionOwners[regionOf[from]] !== 3;
    if (settled && passDone) continue;
    const start = count;
    destStamp += 1;
    const addDest = (t: number) => {
      if (destSeen[t] === destStamp) return;
      destSeen[t] = destStamp;
      const w = wallBits[t];
      for (let d = 0; d < 4; d += 1) if (!(w & (1 << d))) out[count++] = encode(i, t, d);
    };
    const wf = wallBits[from];
    if (variant === 1) {
      let any = false;
      for (let d = 0; d < 4; d += 1) {
        if (wf & (1 << d)) continue;
        const one = from + DR[d];
        if (occ[one] >= 0) continue;
        any = true;
        addDest(one);
        const w1 = wallBits[one];
        for (let e = 0; e < 4; e += 1) {
          if (w1 & (1 << e)) continue;
          const two = one + DR[e];
          if (two === from || occ[two] >= 0) continue;
          addDest(two);
        }
      }
      if (any) addDest(from);
    } else {
      for (let d = 0; d < 4; d += 1) {
        if (wf & (1 << d)) continue;
        const one = from + DR[d];
        if (occ[one] >= 0) continue;
        addDest(one);
        const w1 = wallBits[one];
        if (pKind[i] === 1) {
          for (const e of PERP[d]) { if (!(w1 & (1 << e)) && occ[one + DR[e]] < 0) addDest(one + DR[e]); }
        } else if (!(w1 & (1 << d)) && occ[one + DR[d]] < 0) addDest(one + DR[d]);
      }
    }
    if (settled && count > start) {
      // A piece sealed in its own area: its move is a pass. Keep one that does not split the area.
      let keep = -1;
      for (let k = start; k < count && keep < 0; k += 1) if (!splitsOwnArea(out[k])) keep = out[k];
      if (keep >= 0) { out[start] = keep; count = start + 1; passDone = true; }
    }
  }
  return count;
}

const seen = new Uint8Array(CELLS);
function splitsOwnArea(move: number) {
  const dest = (move >> 2) & 63, dir = move & 3;
  const other = dest + DR[dir];
  // With the new wall, can `dest` still reach `other`?
  wallBits[dest] |= 1 << dir; wallBits[other] |= 1 << ((dir + 2) & 3);
  seen.fill(0);
  let head = 0, tail = 0; queue[tail++] = dest; seen[dest] = 1;
  let found = false;
  while (head < tail && !found) {
    const c = queue[head++];
    const w = wallBits[c];
    for (let d = 0; d < 4; d += 1) {
      if (w & (1 << d)) continue;
      const n = c + DR[d];
      if (seen[n]) continue;
      if (n === other) { found = true; break; }
      seen[n] = 1; queue[tail++] = n;
    }
  }
  wallBits[dest] &= ~(1 << dir); wallBits[other] &= ~(1 << ((dir + 2) & 3));
  return !found;
}

function nextSideAfterPlacement() {
  return placeIdx < placeQueue.length ? placeQueue[placeIdx] : firstMover;
}

function make(move: number, ply: number) {
  undoSide[ply] = side;
  h1 ^= ZSIDE[side];
  if (move & PLACE_FLAG) {
    const c = move & 63;
    const i = pieceCount++;
    pCell[i] = c; pPlayer[i] = side; pKind[i] = placeKind; occ[c] = i;
    hashPiece(i, c);
    placeIdx += 1;
    undoPlaced[ply] = 1;
    side = nextSideAfterPlacement();
  } else {
    undoPlaced[ply] = 0;
    const i = move >> 8, dest = (move >> 2) & 63, dir = move & 3;
    const from = pCell[i];
    undoFrom[ply] = from;
    hashPiece(i, from); occ[from] = -1;
    pCell[i] = dest; occ[dest] = i; hashPiece(i, dest);
    toggleWall(dest, dir);
    side ^= 1;
  }
  h1 ^= ZSIDE[side];
}
function unmake(move: number, ply: number) {
  h1 ^= ZSIDE[side];
  side = undoSide[ply];
  if (undoPlaced[ply]) {
    const i = --pieceCount;
    const c = pCell[i];
    hashPiece(i, c); occ[c] = -1; pCell[i] = -1;
    placeIdx -= 1;
  } else {
    const i = move >> 8, dest = (move >> 2) & 63, dir = move & 3;
    toggleWall(dest, dir);
    hashPiece(i, dest); occ[dest] = -1;
    const from = undoFrom[ply];
    pCell[i] = from; occ[from] = i; hashPiece(i, from);
  }
  h1 ^= ZSIDE[side];
}

function canMove(player: number): boolean {
  if (!allPlaced()) return true;
  for (let i = 0; i < pieceCount; i += 1) {
    if (pPlayer[i] !== player) continue;
    const from = pCell[i], wf = wallBits[from];
    for (let d = 0; d < 4; d += 1) {
      if (wf & (1 << d)) continue;
      const one = from + DR[d];
      // Stepping onto a free neighbour always leaves the side we came through open for the wall.
      if (occ[one] < 0) return true;
    }
  }
  return false;
}

// ---------- Search ----------
class Abort extends Error {}

function negamax(depth: number, alpha: number, beta: number, ply: number, fullWidth: boolean): number {
  nodes += 1;
  if ((nodes & 1023) === 0 && (now() > deadline || nodes > nodeBudget)) { throw new Abort(); }
  if (nodes > nodeBudget) { throw new Abort(); }
  const a = analyze();
  if (a.terminal) return terminalValue(a, side, ply);
  const contested = a.contested;
  if (depth <= 0) return evaluate(a);

  const slot = h1 & (TT_SIZE - 1);
  let ttBest = -1;
  if (ttFlag[slot] && ttKey[slot] === (h1 | 0) && ttLock[slot] === (h2 | 0)) {
    ttBest = ttMove[slot];
    if (ttDepth[slot] >= depth) {
      const v = ttValue[slot], f = ttFlag[slot];
      if (f === 1) return v;
      if (f === 2 && v >= beta) return v;
      if (f === 3 && v <= alpha) return v;
    }
  }

  const moves = moveBuf[ply], scores = scoreBuf[ply];
  let count = generate(moves);
  if (count === 0) {
    // Cannot move: skip the turn, or the game ends when nobody can.
    if (!canMove(side ^ 1)) return terminalValue(a, side, ply); // nobody can move: contested squares count for nobody
    h1 ^= ZSIDE[side]; side ^= 1; h1 ^= ZSIDE[side];
    let v: number;
    try { v = -negamax(depth - 1, -beta, -alpha, ply + 1, fullWidth); } finally { h1 ^= ZSIDE[side]; side ^= 1; h1 ^= ZSIDE[side]; }
    return v;
  }

  const full = fullWidth || (allPlaced() && contested <= HELL_TUNING.endgameContested);
  const me = side;
  // Order by a one-ply look (this is also the full depth-1 search).
  for (let k = 0; k < count; k += 1) {
    const m = moves[k];
    make(m, ply);
    const ca = analyze();
    let s: number;
    if (ca.terminal) s = terminalValue(ca, me, ply + 1);
    else { const v = evaluate(ca); s = side === me ? v : -v; }
    unmake(m, ply);
    scores[k] = m === ttBest ? s + 1e7 : s;
  }
  sortMoves(moves, scores, count);
  if (depth === 1) {
    // The true max, without the TT-move ordering bonus.
    let value = -Infinity;
    for (let k = 0; k < count; k += 1) { const s = scores[k] >= 1e6 ? scores[k] - 1e7 : scores[k]; if (s > value) value = s; }
    store(slot, depth, value, -Infinity, Infinity, moves[0]);
    return value;
  }
  if (!full) {
    const width = HELL_TUNING.widths[Math.min(depth, HELL_TUNING.widths.length - 1)];
    if (count > width) count = width;
  }

  let best = -Infinity, bestMove = moves[0];
  const alpha0 = alpha;
  for (let k = 0; k < count; k += 1) {
    const m = moves[k];
    make(m, ply);
    let v: number;
    try {
      v = side === me ? negamax(depth - 1, alpha, beta, ply + 1, fullWidth) : -negamax(depth - 1, -beta, -alpha, ply + 1, fullWidth);
    } finally { unmake(m, ply); }
    if (v > best) { best = v; bestMove = m; }
    if (v > alpha) alpha = v;
    if (alpha >= beta) break;
  }
  store(slot, depth, best, alpha0, beta, bestMove);
  return best;
}

function store(slot: number, depth: number, value: number, alpha: number, beta: number, move: number) {
  if (ttFlag[slot] && ttGen[slot] === ttGeneration && ttDepth[slot] > depth && ttKey[slot] !== (h1 | 0)) return;
  ttKey[slot] = h1 | 0; ttLock[slot] = h2 | 0; ttDepth[slot] = depth; ttValue[slot] = value; ttMove[slot] = move; ttGen[slot] = ttGeneration;
  ttFlag[slot] = value <= alpha ? 3 : value >= beta ? 2 : 1;
}

function sortMoves(moves: Int32Array, scores: Float64Array, count: number) {
  for (let i = 1; i < count; i += 1) {
    const m = moves[i], s = scores[i];
    let j = i - 1;
    while (j >= 0 && scores[j] < s) { moves[j + 1] = moves[j]; scores[j + 1] = scores[j]; j -= 1; }
    moves[j + 1] = m; scores[j + 1] = s;
  }
}

// ---------- Public entry ----------
const cellOf = (p: Position) => p.row * N + p.col;
const posOf = (c: number): Position => ({ row: (c / N) | 0, col: c % N });
const keyOf = (p: Position) => `${p.row},${p.col}`;
const edgeKeyOf = (a: Position, b: Position) => { const x = keyOf(a), y = keyOf(b); return x < y ? `${x}|${y}` : `${y}|${x}`; };

function load(req: HellRequest) {
  variant = req.variant;
  wallBits.fill(0); occ.fill(-1); pCell.fill(-1);
  h1 = 0; h2 = 0;
  for (let c = 0; c < CELLS; c += 1) {
    const r = (c / N) | 0, col = c % N;
    if (r === 0) wallBits[c] |= 1; if (col === N - 1) wallBits[c] |= 2; if (r === N - 1) wallBits[c] |= 4; if (col === 0) wallBits[c] |= 8;
  }
  for (const key of req.walls) {
    const [a, b] = key.split('|').map((s) => { const [r, c] = s.split(',').map(Number); return r * N + c; });
    const lo = Math.min(a, b), hi = Math.max(a, b);
    toggleWall(lo, hi - lo === 1 ? 1 : 2);
  }
  pieceCount = 0; pId.length = 0;
  for (const piece of req.pieces) {
    const i = pieceCount++;
    pCell[i] = cellOf(piece); pPlayer[i] = piece.player; pKind[i] = piece.kind === 'circle' ? 1 : 0; pId[i] = piece.id;
    occ[pCell[i]] = i; hashPiece(i, pCell[i]);
  }
  placeQueue = req.placeQueue.slice(); placeIdx = 0;
  // 1:1 placements: 벽바둑 II places the two square pieces (round ones are fixed).
  placeKind = 0;
  firstMover = req.firstMover;
  side = req.toMove;
  h1 ^= ZSIDE[side];
}

/** Best action for the side to move, within `timeMs`. */
export function hellSearch(req: HellRequest): HellResult {
  load(req);
  ttGeneration += 1;
  salt = (req.seed ?? Math.floor(Math.random() * 0x7fffffff)) | 0;
  nodes = 0;
  const start = now();
  deadline = start + req.timeMs;
  nodeBudget = req.maxNodes ?? Infinity;

  const a = analyze();
  if (a.terminal) return null;
  const rootMoves = moveBuf[0], rootScores = scoreBuf[0];
  let count = generate(rootMoves);
  if (!count) return null;
  const me = side;
  for (let k = 0; k < count; k += 1) {
    const m = rootMoves[k];
    make(m, 0);
    const ca = analyze();
    let s: number;
    if (ca.terminal) s = terminalValue(ca, me, 1);
    else { const v = evaluate(ca); s = side === me ? v : -v; }
    unmake(m, 0);
    rootScores[k] = s;
  }
  sortMoves(rootMoves, rootScores, count);
  const fullAtRoot = allPlaced() && a.contested <= HELL_TUNING.endgameContested;
  if (!fullAtRoot && count > HELL_TUNING.rootWidth) count = HELL_TUNING.rootWidth;
  const list = Array.from(rootMoves.subarray(0, count));
  const scoresNow = Array.from(rootScores.subarray(0, count));
  let bestMove = list[0], bestScore = scoresNow[0], depthDone = 1;

  try {
    for (let depth = 2; depth <= 60; depth += 1) {
      heuristicUsed = false;
      let alpha = -Infinity, iterBest = list[0], iterScore = -Infinity;
      const iterScores: number[] = [];
      for (let k = 0; k < list.length; k += 1) {
        const m = list[k];
        make(m, 0);
        let v: number;
        try {
          if (k === 0) v = side === me ? negamax(depth - 1, -Infinity, Infinity, 1, false) : -negamax(depth - 1, -Infinity, Infinity, 1, false);
          else {
            // Null-window probe first, re-search only if it beats the best so far.
            v = side === me ? negamax(depth - 1, alpha, alpha + 1e-6, 1, false) : -negamax(depth - 1, -alpha - 1e-6, -alpha, 1, false);
            if (v > alpha) v = side === me ? negamax(depth - 1, alpha, Infinity, 1, false) : -negamax(depth - 1, -Infinity, -alpha, 1, false);
          }
        } finally { unmake(m, 0); }
        iterScores.push(v);
        if (v > iterScore) { iterScore = v; iterBest = m; }
        if (v > alpha) alpha = v;
      }
      bestMove = iterBest; bestScore = iterScore; depthDone = depth;
      // Reorder: best first, then by this iteration's (bounded) scores.
      const order = list.map((m, i) => ({ m, s: m === iterBest ? Infinity : iterScores[i] })).sort((x, y) => y.s - x.s);
      for (let i = 0; i < order.length; i += 1) list[i] = order[i].m;
      if (!heuristicUsed) break; // solved to the end
      if (Math.abs(bestScore) >= WIN / 2 && depth >= 4) break; // forced result found
      if (now() - start > req.timeMs * 0.55) break; // the next depth would not finish
    }
  } catch (error) {
    if (!(error instanceof Abort)) throw error;
    // Restore the root position after an abort mid-tree.
    load(req);
  }
  const result = { depth: depthDone, score: bestScore, nodes };
  if (bestMove & PLACE_FLAG) {
    const kind: PieceKind | undefined = variant === 2 ? 'square' : undefined;
    return { type: 'place', position: posOf(bestMove & 63), ...(kind ? { kind } : {}), ...result };
  }
  const i = bestMove >> 8, dest = (bestMove >> 2) & 63, dir = bestMove & 3;
  const from = posOf(pCell[i]), to = posOf(dest);
  const distance = (from.row === to.row && from.col === to.col ? 0 : Math.abs(from.row - to.row) + Math.abs(from.col - to.col) === 1 ? 1 : 2) as 0 | 1 | 2;
  const wallTo = posOf(dest + DR[dir]);
  return {
    type: 'move',
    move: { pieceId: pId[i], from, to, distance },
    wall: edgeKeyOf(to, wallTo),
    direction: DIR_NAMES[dir],
    ...result,
  };
}

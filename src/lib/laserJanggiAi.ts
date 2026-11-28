// 레이저 장기 AI: a compact board with make/unmake and an alpha-beta search over moves, rotations and the shot.
// Rules are exactly those of src/lib/laserJanggi.ts (traceLaser / applyLaserAction); scripts/laser-janggi/check.ts
// compares the two engines move for move.
import type { Direction, LaserAction, LaserDifficulty, LaserOwner, LaserPiece } from './laserJanggi';

const N = 8;
const LASER = 0, SPLITTER = 1, KING = 2, TRIANGLE = 3, SQUARE = 4;
const TYPE_CODE = { laser: LASER, splitter: SPLITTER, king: KING, triangle: TRIANGLE, square: SQUARE } as const;
const DR = [-1, 0, 1, 0];
const DC = [0, 1, 0, -1];
const MOVE_DR = [-1, -1, -1, 0, 0, 1, 1, 1];
const MOVE_DC = [-1, 0, 1, -1, 1, -1, 0, 1];
const VALUE = [0, 0, 0, 3, 5]; // knights are the only pieces that can be lost (kings end the game)
const WIN = 100_000;
let HARD_MAX_DEPTH = 5;
export const setDepth = (d: number) => { HARD_MAX_DEPTH = d; }; // scripts compare search depths

/** Mutable search position. Pieces keep their index for the whole game (ids map to indexes). */
class Board {
  n: number;
  ids: string[];
  type: Uint8Array; owner: Uint8Array; row: Int8Array; col: Int8Array; dir: Uint8Array; alive: Uint8Array;
  cell = new Int8Array(64).fill(-1);
  laser = [-1, -1];
  king = [-1, -1];
  // trace scratch
  private seen = new Int32Array(64 * 4);
  private stamp = 0;
  private qr = new Int8Array(256); private qc = new Int8Array(256); private qd = new Uint8Array(256);
  hits = new Int8Array(32); nHits = 0; kingHit = 0; // bit 1 = owner 0's king, bit 2 = owner 1's
  lit = new Uint8Array(64); // squares the last traced beam passed through (cleared per trace when asked)

  constructor(pieces: LaserPiece[]) {
    this.n = pieces.length;
    this.ids = pieces.map((p) => p.id);
    this.type = new Uint8Array(this.n); this.owner = new Uint8Array(this.n); this.row = new Int8Array(this.n);
    this.col = new Int8Array(this.n); this.dir = new Uint8Array(this.n); this.alive = new Uint8Array(this.n);
    pieces.forEach((p, i) => {
      this.type[i] = TYPE_CODE[p.type]; this.owner[i] = p.owner; this.row[i] = p.row; this.col[i] = p.col; this.dir[i] = p.direction; this.alive[i] = 1;
      this.cell[p.row * N + p.col] = i;
      if (p.type === 'laser') this.laser[p.owner] = i;
      if (p.type === 'king') this.king[p.owner] = i;
    });
  }

  /** Fire `owner`'s laser on the current position: fills hits/nHits/kingHit (nothing is removed). */
  trace(owner: number, markLit = false) {
    this.nHits = 0; this.kingHit = 0;
    if (markLit) this.lit.fill(0);
    const e = this.laser[owner];
    if (e < 0 || !this.alive[e]) return;
    this.stamp += 1;
    const stamp = this.stamp;
    let head = 0, tail = 0, segs = 0;
    this.qr[tail] = this.row[e]; this.qc[tail] = this.col[e]; this.qd[tail] = this.dir[e]; tail += 1;
    while (head < tail && segs < 96) {
      const r0 = this.qr[head], c0 = this.qc[head], d = this.qd[head]; head += 1;
      const key = (r0 * N + c0) * 4 + d;
      if (this.seen[key] === stamp) continue;
      this.seen[key] = stamp;
      segs += 1;
      let r = r0, c = c0;
      for (;;) {
        r += DR[d]; c += DC[d];
        if (r < 0 || r >= N || c < 0 || c >= N) break;
        const at = this.cell[r * N + c];
        if (markLit) this.lit[r * N + c] = 1;
        if (at < 0) continue;
        const t = this.type[at];
        if (t === KING) { this.addHit(at); this.kingHit |= 1 << this.owner[at]; break; }
        if (t === LASER) break;
        if (t === SPLITTER) {
          const slash = this.dir[at] % 2 === 0;
          const refl = slash ? (d ^ 1) : 3 - d; // "/": up↔right, down↔left; "\": up↔left, right↔down
          if (tail < 254) {
            this.qr[tail] = r; this.qc[tail] = c; this.qd[tail] = d; tail += 1;
            this.qr[tail] = r; this.qc[tail] = c; this.qd[tail] = refl; tail += 1;
          }
          break;
        }
        if (t === TRIANGLE) {
          const fa = this.dir[at], fb = (fa + 1) & 3;
          if (d === ((fa + 2) & 3)) { if (tail < 255) { this.qr[tail] = r; this.qc[tail] = c; this.qd[tail] = fb; tail += 1; } }
          else if (d === ((fb + 2) & 3)) { if (tail < 255) { this.qr[tail] = r; this.qc[tail] = c; this.qd[tail] = fa; tail += 1; } }
          else this.addHit(at);
          break;
        }
        // square: the mirror face sends the beam straight back
        if (((d + 2) & 3) === this.dir[at]) { if (tail < 255) { this.qr[tail] = r; this.qc[tail] = c; this.qd[tail] = (d + 2) & 3; tail += 1; } }
        else this.addHit(at);
        break;
      }
    }
  }
  private addHit(i: number) { for (let k = 0; k < this.nHits; k += 1) if (this.hits[k] === i) return; this.hits[this.nHits++] = i; }

  /** Actions as ints: piece * 16 + code (0–7 step to a neighbour, 8 turn left, 9 turn right). */
  actions(owner: number, out: number[]) {
    out.length = 0;
    for (let i = 0; i < this.n; i += 1) {
      if (!this.alive[i] || this.owner[i] !== owner) continue;
      if (this.type[i] !== LASER) {
        for (let k = 0; k < 8; k += 1) {
          const r = this.row[i] + MOVE_DR[k], c = this.col[i] + MOVE_DC[k];
          if (r >= 0 && r < N && c >= 0 && c < N && this.cell[r * N + c] < 0) out.push(i * 16 + k);
        }
        out.push(i * 16 + 8, i * 16 + 9);
      } else {
        for (const [code, delta] of [[8, 3], [9, 1]] as const) {
          const d = (this.dir[i] + delta) & 3;
          const r = this.row[i] + DR[d], c = this.col[i] + DC[d];
          if (r >= 0 && r < N && c >= 0 && c < N) out.push(i * 16 + code);
        }
      }
    }
    return out;
  }

  // make / unmake ---------------------------------------------------------------------------------------------
  private undo: number[] = []; // stack frames: [piece, row, col, dir, nRemoved, ...removed]

  /** Plays `action` for `owner` and fires. Returns 0 (game goes on), +1 (owner won) or -1 (owner lost). */
  make(action: number, owner: number) {
    const i = action >> 4, code = action & 15;
    const pr = this.row[i], pc = this.col[i], pd = this.dir[i];
    if (code < 8) {
      this.cell[pr * N + pc] = -1;
      this.row[i] = pr + MOVE_DR[code]; this.col[i] = pc + MOVE_DC[code];
      this.cell[this.row[i] * N + this.col[i]] = i;
    } else this.dir[i] = (pd + (code === 8 ? 3 : 1)) & 3;
    this.trace(owner);
    const removed = this.nHits;
    for (let k = 0; k < removed; k += 1) { const h = this.hits[k]; this.alive[h] = 0; this.cell[this.row[h] * N + this.col[h]] = -1; this.undo.push(h); }
    this.undo.push(i, pr, pc, pd, removed);
    if (!this.kingHit) return 0;
    return this.kingHit & (1 << owner) ? -1 : 1;
  }

  unmake() {
    const removed = this.undo.pop()!, pd = this.undo.pop()!, pc = this.undo.pop()!, pr = this.undo.pop()!, i = this.undo.pop()!;
    for (let k = 0; k < removed; k += 1) { const h = this.undo.pop()!; this.alive[h] = 1; this.cell[this.row[h] * N + this.col[h]] = h; }
    this.cell[this.row[i] * N + this.col[i]] = -1;
    this.row[i] = pr; this.col[i] = pc; this.dir[i] = pd;
    this.cell[pr * N + pc] = i;
  }

  /** Last make()'s removed pieces, read right after make(). */
  lastRemoved() { const f = this.undo.length; return this.undo.slice(f - 5 - this.undo[f - 1], f - 5); }

  toAction(action: number): LaserAction {
    const i = action >> 4, code = action & 15;
    if (code >= 8) return { type: 'rotate', pieceId: this.ids[i], delta: code === 8 ? -1 : 1 };
    return { type: 'move', pieceId: this.ids[i], row: this.row[i] + MOVE_DR[code], col: this.col[i] + MOVE_DC[code] };
  }
}

// evaluation --------------------------------------------------------------------------------------------------

/**
 * Static score for `me` (higher is better), no side to move assumed. Material; each king's cover (open lines
 * from the king to the board edge, own mirrors next to it); how close each laser's current beam passes to the
 * enemy king; and the knights that beam would destroy if nothing changed.
 */
function evaluate(b: Board, me: number) {
  let score = 0;
  for (let i = 0; i < b.n; i += 1) if (b.alive[i]) score += (b.owner[i] === me ? 1 : -1) * VALUE[b.type[i]] * 100;
  for (const side of [0, 1]) {
    const sign = side === me ? 1 : -1;
    const k = b.king[side];
    if (k < 0 || !b.alive[k]) continue;
    const kr = b.row[k], kc = b.col[k];
    let cover = 0;
    for (let d = 0; d < 4; d += 1) {
      let r = kr + DR[d], c = kc + DC[d], steps = 1;
      for (; r >= 0 && r < N && c >= 0 && c < N; r += DR[d], c += DC[d], steps += 1) {
        const at = b.cell[r * N + c];
        if (at < 0) continue;
        // a line ending on an own knight is shielded; ending on anything that can turn a beam is a way in
        if (b.owner[at] === side && (b.type[at] === TRIANGLE || b.type[at] === SQUARE)) cover += steps === 1 ? 14 : 8;
        else cover -= b.type[at] === TRIANGLE || b.type[at] === SPLITTER ? 18 : 6;
        break;
      }
      if (r < 0 || r >= N || c < 0 || c >= N) cover -= 4; // open to the edge: only a laser on that line could use it
    }
    score += sign * cover;
    // the enemy beam as it stands now
    b.trace(1 - side, true);
    let near = 0;
    for (let dr = -1; dr <= 1; dr += 1) for (let dc = -1; dc <= 1; dc += 1) {
      const r = kr + dr, c = kc + dc;
      if (r >= 0 && r < N && c >= 0 && c < N && b.lit[r * N + c]) near += dr === 0 || dc === 0 ? 2 : 1;
    }
    score -= sign * near * 22;
    for (let h = 0; h < b.nHits; h += 1) if (b.owner[b.hits[h]] === side) score -= sign * VALUE[b.type[b.hits[h]]] * 40; // hanging
  }
  return score;
}

// search ------------------------------------------------------------------------------------------------------

type Search = { b: Board; deadline: number; nodes: number; stop: boolean; buf: number[][]; threats: boolean };

/** Can `side` (to move) hit the enemy king right now? Counts the ways, stopping at `cap`. */
function winningMoves(s: Search, side: number, ply: number, cap: number) {
  const list = s.b.actions(side, s.buf[ply] ??= []);
  let n = 0;
  for (const a of list) {
    const r = s.b.make(a, side);
    s.b.unmake();
    s.nodes += 1;
    if (r > 0 && ++n >= cap) break;
  }
  return n;
}

function negamax(s: Search, side: number, depth: number, alpha: number, beta: number, ply: number): number {
  if ((s.nodes & 1023) === 0 && performance.now() > s.deadline) s.stop = true;
  if (s.stop) return 0;
  if (depth === 0) {
    // Leaf, `side` to move. A king shot available to it decides the position; otherwise count the ways in
    // (each is a threat the other side has to answer) and fall back on the static score.
    if (s.threats) {
      const mine = winningMoves(s, side, ply, 2);
      if (mine) return WIN - 50 - ply;
      const theirs = winningMoves(s, 1 - side, ply, 3);
      return evaluate(s.b, side) - theirs * 260;
    }
    return evaluate(s.b, side);
  }
  const list = s.b.actions(side, s.buf[ply] ??= []).slice();
  // order: winning shots, captures, then the rest (stable order keeps the search deterministic)
  const keyed = list.map((a) => {
    const r = s.b.make(a, side);
    let k = 0;
    if (r > 0) k = 1e9; else if (r < 0) k = -1e9;
    else { const removed = s.b.lastRemoved(); for (const h of removed) k += (s.b.owner[h] === side ? -1 : 1) * (VALUE[s.b.type[h]] + 1); }
    s.b.unmake();
    s.nodes += 1;
    return { a, k };
  }).sort((x, y) => y.k - x.k);
  let best = -Infinity;
  for (const { a, k } of keyed) {
    if (k === 1e9) return WIN - ply;
    let v: number;
    if (k === -1e9) v = -WIN + ply;
    else {
      s.b.make(a, side);
      v = -negamax(s, 1 - side, depth - 1, -beta, -alpha, ply + 1);
      s.b.unmake();
    }
    if (s.stop) return best === -Infinity ? 0 : best;
    if (v > best) best = v;
    if (v > alpha) alpha = v;
    if (alpha >= beta) break;
  }
  return best === -Infinity ? evaluate(s.b, side) : best;
}

/** Scores every root action for `me` with a depth-limited search; returns [action, score] pairs, best first. */
function searchRoot(b: Board, me: number, depth: number, threats: boolean, deadline: number, previous?: number[], margin = 5) {
  const s: Search = { b, deadline, nodes: 0, stop: false, buf: [], threats };
  const root = previous ?? b.actions(me, []).slice();
  const scored: [number, number][] = [];
  let alpha = -Infinity;
  for (const a of root) {
    const r = b.make(a, me);
    let v: number;
    if (r > 0) v = WIN;
    else if (r < 0) v = -WIN;
    else v = -negamax(s, 1 - me, depth - 1, -Infinity, -alpha + margin, 1);
    b.unmake();
    if (s.stop) return null;
    scored.push([a, v]);
    if (v > alpha) alpha = v;
  }
  return scored.sort((x, y) => y[1] - x[1]);
}

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

export type LaserThink = { action: LaserAction; score: number; depth: number; nodes?: number };

/**
 * Picks the AI's move.
 * - 어려움: iterative deepening (2 → 3 → 4 → 5 plies; threats counted at the 2- and 3-ply leaves) inside a time
 *   budget, keeping the deepest search that finished.
 * - 보통: 3 plies with king-shot threats counted at the leaves, a little randomness among near-best moves.
 * - 쉬움: 1 ply plus the reply's king shot, often a random decent move.
 * Every level takes a winning shot, and blocks a king shot next turn whenever any move does.
 */
export function thinkLaser(pieces: LaserPiece[], owner: LaserOwner, difficulty: LaserDifficulty, budgetMs = 800): LaserThink | null {
  const b = new Board(pieces);
  const me = owner;
  const all = b.actions(me, []).slice();
  if (!all.length) return null;
  const start = now();
  // Never shoot your own king while any other move exists: when every line loses anyway, a self-hit scores
  // within a few points of a slower loss, so it is taken out of the root list instead of left to the scores.
  const notSuicide = all.filter((a) => { const r = b.make(a, me); b.unmake(); return r >= 0; });
  const roots = notSuicide.length ? notSuicide : all;

  if (difficulty === 'hard') {
    let ranked = searchRoot(b, me, 2, true, Infinity, roots)!;
    let depth = 2;
    for (let d = 3; d <= HARD_MAX_DEPTH; d += 1) {
      if (ranked[0][1] >= WIN - 10) break; // a forced win is already found
      const next = searchRoot(b, me, d, d === 3, start + budgetMs, ranked.map(([a]) => a));
      if (!next) break;
      ranked = next; depth = d;
    }
    const top = ranked.filter(([, v]) => v >= ranked[0][1] - 4);
    const [a, v] = top[Math.floor(Math.random() * top.length)];
    return { action: b.toAction(a), score: v, depth };
  }

  if (difficulty === 'normal') {
    // 3 plies with king-shot threats at the leaves (what 어려움 sees on its way to deeper plies), then a
    // random pick among moves within 40 points of the best, so it plays soundly but not the same game twice.
    const two = searchRoot(b, me, 2, true, Infinity, roots)!;
    const ranked = searchRoot(b, me, 3, true, Infinity, two.map(([a]) => a), 40)!;
    const best = ranked[0][1];
    const pool = ranked.filter(([, v]) => v >= best - (Math.abs(best) > WIN / 2 ? 0 : 40));
    const [a, v] = pool[Math.floor(Math.random() * Math.min(pool.length, 3))];
    return { action: b.toAction(a), score: v, depth: 3 };
  }

  // easy: one ply, then the reply's king shot only; picks among the top dozen non-losing moves
  const ranked = searchRoot(b, me, 2, false, Infinity, roots, Infinity)!;
  if (ranked[0][1] >= WIN - 10) return { action: b.toAction(ranked[0][0]), score: ranked[0][1], depth: 1 };
  const safe = ranked.filter(([, v]) => v > -WIN / 2);
  const pool = (safe.length ? safe : ranked).slice(0, 12);
  const [a, v] = Math.random() < 0.5 ? pool[0] : pool[Math.floor(Math.random() * pool.length)];
  return { action: b.toAction(a), score: v, depth: 1 };
}

/** Every action `owner` could play that would hit the other king right now (the danger marker uses this). */
export function kingShots(pieces: LaserPiece[], owner: LaserOwner): LaserAction[] {
  const b = new Board(pieces);
  const out: LaserAction[] = [];
  for (const a of b.actions(owner, []).slice()) {
    const r = b.make(a, owner);
    b.unmake();
    if (r > 0) out.push(b.toAction(a));
  }
  return out;
}

export const __test = { Board, evaluate, WIN, dirOf: (d: number) => d as Direction };

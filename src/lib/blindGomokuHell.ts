// Blind Gomoku '매우 어려움' (hell) engine: threat-space search (VCF / VCT) and iterative-deepening alpha-beta
// with a transposition table, run inside a Web Worker by the game (and directly by scripts/blind-gomoku-arena.ts).
//
// What the AI knows: exactly what a player who watched the whole game knows — where each stone went and in
// which order. Owners are never read from the hidden face: black moves first, so the n-th stone played is
// black when n is odd. The hidden face hides nothing from someone who remembers the order; this level is the
// player who remembers all of it (the lower levels remember only the last few moves).
// Pure TypeScript without imports, so Node can run it straight from the source.

const N = 15;
const CELLS = N * N;
const DR = [0, 1, 1, 1];
const DC = [1, 0, 1, -1];

export interface HellPoint { row: number; col: number }
export interface HellResult extends HellPoint { kind: 'opening' | 'five' | 'block' | 'vcf' | 'vct' | 'search'; depth: number; nodes: number; ms: number }

// LINE[(c * 4 + d) * 9 + k]: the cell k - 4 steps from c along direction d, or -1 off the board.
const LINE = new Int16Array(CELLS * 4 * 9);
for (let c = 0; c < CELLS; c += 1) {
  const r = Math.floor(c / N);
  const col = c % N;
  for (let d = 0; d < 4; d += 1) {
    for (let k = 0; k < 9; k += 1) {
      const rr = r + DR[d] * (k - 4);
      const cc = col + DC[d] * (k - 4);
      LINE[(c * 4 + d) * 9 + k] = rr >= 0 && rr < N && cc >= 0 && cc < N ? rr * N + cc : -1;
    }
  }
}

// Line shapes, from the point of view of a stone placed at the centre of a 9-cell window.
const P_FIVE = 7; // five or more in a row
const P_OPEN4 = 6; // two different cells complete five
const P_FOUR = 5; // one cell completes five
const P_OPEN3 = 4; // one more stone makes an open four
const P_THREE = 3; // one more stone makes a four
const P_OPEN2 = 2;
const P_TWO = 1;

// PAT[index of the 8 other cells, base 3: 0 empty, 1 own, 2 blocked] -> shape.
const PAT = new Uint8Array(6561);
{
  const memo = new Int8Array(6561).fill(-1);
  const w = new Int8Array(9);
  const key = () => { let k = 0; for (let j = 0; j < 9; j += 1) if (j !== 4) k = k * 3 + w[j]; return k; };
  const isFive = () => {
    for (let s = 0; s <= 4; s += 1) {
      let all = true;
      for (let j = s; j < s + 5; j += 1) if (w[j] !== 1) { all = false; break; }
      if (all) return true;
    }
    return false;
  };
  const classify = (): number => {
    const k = key();
    if (memo[k] >= 0) return memo[k];
    let result = 0;
    if (isFive()) result = P_FIVE;
    else {
      let ways = 0;
      for (let e = 0; e < 9; e += 1) {
        if (w[e] !== 0) continue;
        w[e] = 1;
        if (isFive()) ways += 1;
        w[e] = 0;
      }
      if (ways >= 2) result = P_OPEN4;
      else if (ways === 1) result = P_FOUR;
      else {
        for (let e = 0; e < 9; e += 1) {
          if (w[e] !== 0) continue;
          w[e] = 1;
          const next = classify();
          w[e] = 0;
          const derived = next === P_OPEN4 ? P_OPEN3 : next === P_FOUR ? P_THREE : next === P_OPEN3 ? P_OPEN2 : next === P_THREE ? P_TWO : 0;
          if (derived > result) result = derived;
        }
      }
    }
    memo[k] = result;
    return result;
  };
  for (let index = 0; index < 6561; index += 1) {
    let x = index;
    for (let j = 8; j >= 0; j -= 1) {
      if (j === 4) continue;
      w[j] = x % 3;
      x = Math.floor(x / 3);
    }
    w[4] = 1;
    PAT[index] = classify();
  }
}

const VAL = [0, 12, 55, 110, 700, 900, 20000, 0];
const FIVE_SCORE = 1_000_000; // playing here makes five
const WIN_MOVE = 60_000; // playing here makes an open four or a double four
const WIN = 100_000_000;
const INF = 2_000_000_000;

// Zobrist keys (two 32-bit halves: one picks the table slot, the other checks it).
const Z1 = new Int32Array(CELLS * 2);
const Z2 = new Int32Array(CELLS * 2);
{
  let s = 0x2545f491;
  const rnd = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return s | 0; };
  for (let i = 0; i < CELLS * 2; i += 1) { Z1[i] = rnd(); Z2[i] = rnd(); }
}

const TT_BITS = 20;
const TT_SIZE = 1 << TT_BITS;
const TT_MASK = TT_SIZE - 1;
const EXACT = 1;
const LOWER = 2;
const UPPER = 3;

class Timeout extends Error {}

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

export class HellEngine {
  board = new Int8Array(CELLS); // 0 empty, 1 black, 2 white
  code = [new Uint8Array(CELLS * 4), new Uint8Array(CELLS * 4)];
  score = [new Int32Array(CELLS), new Int32Array(CELLS)];
  total = [0, 0];
  h1 = 0;
  h2 = 0;
  stones = 0;
  nodes = 0;
  deadline = Infinity;
  ttKey = new Int32Array(TT_SIZE);
  ttVal = new Int32Array(TT_SIZE);
  ttDepth = new Int8Array(TT_SIZE);
  ttFlag = new Int8Array(TT_SIZE);
  ttMove = new Int16Array(TT_SIZE);
  vcfFail = new Map<number, number>();
  random: () => number;

  constructor(random: () => number = Math.random) {
    this.random = random;
  }

  reset() {
    this.board.fill(0);
    this.code[0].fill(0);
    this.code[1].fill(0);
    this.score[0].fill(0);
    this.score[1].fill(0);
    this.total = [0, 0];
    this.h1 = 0;
    this.h2 = 0;
    this.stones = 0;
    this.ttFlag.fill(0);
    this.vcfFail.clear();
  }

  private lineCode(p: number, c: number, d: number) {
    const base = (c * 4 + d) * 9;
    let idx = 0;
    for (let j = 0; j < 9; j += 1) {
      if (j === 4) continue;
      const m = LINE[base + j];
      const v = m < 0 ? 2 : this.board[m] === 0 ? 0 : this.board[m] === p ? 1 : 2;
      idx = idx * 3 + v;
    }
    return PAT[idx];
  }

  private cellScore(pi: number, c: number) {
    const code = this.code[pi];
    let s = 0;
    let n6 = 0;
    let n5 = 0;
    let n4 = 0;
    for (let d = 0; d < 4; d += 1) {
      const k = code[c * 4 + d];
      if (k === P_FIVE) return FIVE_SCORE;
      s += VAL[k];
      if (k === P_OPEN4) n6 += 1;
      else if (k === P_FOUR) n5 += 1;
      else if (k === P_OPEN3) n4 += 1;
    }
    if (n6 || n5 >= 2) s += WIN_MOVE;
    else if (n5 && n4) s += 15000;
    else if (n4 >= 2) s += 6000;
    return s;
  }

  private refresh(c: number) {
    for (let d = 0; d < 4; d += 1) {
      const base = (c * 4 + d) * 9;
      for (let k = 0; k < 9; k += 1) {
        const n = LINE[base + k];
        if (n < 0) continue;
        for (let pi = 0; pi < 2; pi += 1) {
          this.code[pi][n * 4 + d] = this.board[n] === 0 ? this.lineCode(pi + 1, n, d) : 0;
          const next = this.board[n] === 0 ? this.cellScore(pi, n) : 0;
          this.total[pi] += next - this.score[pi][n];
          this.score[pi][n] = next;
        }
      }
    }
  }

  place(c: number, p: number) {
    this.board[c] = p;
    this.h1 ^= Z1[c * 2 + p - 1];
    this.h2 ^= Z2[c * 2 + p - 1];
    this.stones += 1;
    this.refresh(c);
  }

  unplace(c: number) {
    const p = this.board[c];
    this.board[c] = 0;
    this.h1 ^= Z1[c * 2 + p - 1];
    this.h2 ^= Z2[c * 2 + p - 1];
    this.stones -= 1;
    this.refresh(c);
  }

  load(moves: HellPoint[]) {
    this.reset();
    // Owners from the order of play: black first, then alternating.
    moves.forEach((m, i) => this.place(m.row * N + m.col, i % 2 === 0 ? 1 : 2));
  }

  private hasCode(pi: number, c: number, min: number) {
    const code = this.code[pi];
    for (let d = 0; d < 4; d += 1) if (code[c * 4 + d] >= min) return true;
    return false;
  }

  private tick() {
    if ((++this.nodes & 1023) === 0 && now() > this.deadline) throw new Timeout();
  }

  /** Cells where `p` would make five. */
  private fives(p: number, out: number[]) {
    out.length = 0;
    const s = this.score[p - 1];
    for (let c = 0; c < CELLS; c += 1) if (s[c] >= FIVE_SCORE && this.board[c] === 0) out.push(c);
    return out;
  }

  // ---- Threat-space search -------------------------------------------------------------------------------

  /** Victory by continuous fours for `a` (to move). Returns the first move or -1. */
  vcf(a: number, depth: number): number {
    this.tick();
    const ai = a - 1;
    const o = 3 - a;
    const sa = this.score[ai];
    const so = this.score[o - 1];
    let oFive = -1;
    let oFives = 0;
    for (let c = 0; c < CELLS; c += 1) {
      if (this.board[c] !== 0) continue;
      if (sa[c] >= FIVE_SCORE) return c;
      if (so[c] >= FIVE_SCORE) { oFive = c; oFives += 1; }
    }
    if (depth <= 0 || oFives >= 2) return -1;
    const key = this.h1 ^ (a << 30);
    const failed = this.vcfFail.get(key);
    if (failed !== undefined && failed >= depth) return -1;

    const fours: number[] = [];
    if (oFives === 1) {
      // `a` has to block, and the block must itself be a four to keep the initiative.
      if (this.hasCode(ai, oFive, P_FOUR)) fours.push(oFive);
    } else {
      for (let c = 0; c < CELLS; c += 1) if (this.board[c] === 0 && sa[c] >= VAL[P_FOUR] && this.hasCode(ai, c, P_FOUR)) fours.push(c);
      fours.sort((x, y) => sa[y] - sa[x]);
    }
    for (const c of fours) {
      if (oFives === 0 && sa[c] >= WIN_MOVE) return c; // open four or double four
      this.place(c, a);
      // The defender must take the one cell that completes the five.
      let block = -1;
      let blocks = 0;
      for (let d = 0; d < 4; d += 1) {
        const base = (c * 4 + d) * 9;
        for (let k = 0; k < 9; k += 1) {
          const n = LINE[base + k];
          // A cell lies on only one of the four lines through c, so each one is counted once.
          if (n >= 0 && this.board[n] === 0 && sa[n] >= FIVE_SCORE) { block = n; blocks += 1; }
        }
      }
      let ok = false;
      if (blocks >= 2) ok = true;
      else if (block >= 0 && so[block] < FIVE_SCORE) {
        this.place(block, o);
        ok = this.vcf(a, depth - 1) >= 0;
        this.unplace(block);
      }
      this.unplace(c);
      if (ok) return c;
    }
    this.vcfFail.set(key, depth);
    return -1;
  }

  /** Victory by continuous threats (fours and open threes) for `a` (to move). Returns the first move or -1. */
  vct(a: number, depth: number, vcfDepth = 10): number {
    this.tick();
    const ai = a - 1;
    const o = 3 - a;
    const sa = this.score[ai];
    const so = this.score[o - 1];
    const oFives: number[] = [];
    for (let c = 0; c < CELLS; c += 1) {
      if (this.board[c] !== 0) continue;
      if (sa[c] >= FIVE_SCORE) return c;
      if (so[c] >= FIVE_SCORE) oFives.push(c);
    }
    if (oFives.length >= 2) return -1;
    if (oFives.length === 1) {
      // Forced block first, then carry on attacking.
      const b = oFives[0];
      this.place(b, a);
      const ok = this.defendedBy(a, depth);
      this.unplace(b);
      return ok ? b : -1;
    }
    const f = this.vcf(a, vcfDepth);
    if (f >= 0) return f;
    if (depth <= 0) return -1;

    const threats: number[] = [];
    for (let c = 0; c < CELLS; c += 1) if (this.board[c] === 0 && sa[c] >= VAL[P_OPEN3] && this.hasCode(ai, c, P_OPEN3)) threats.push(c);
    threats.sort((x, y) => sa[y] + so[y] * 0.5 - (sa[x] + so[x] * 0.5));
    if (threats.length > 10) threats.length = 10;
    for (const c of threats) {
      this.place(c, a);
      const ok = this.defendedBy(a, depth - 1);
      this.unplace(c);
      if (ok) return c;
    }
    return -1;
  }

  /** After `a`'s threat: true when every defence of the other side still loses to a VCT of `a`. */
  private defendedBy(a: number, depth: number): boolean {
    const ai = a - 1;
    const o = 3 - a;
    const oi = o - 1;
    const sa = this.score[ai];
    const so = this.score[oi];
    const replies: number[] = [];
    let aFives = 0;
    let threatened = false;
    for (let c = 0; c < CELLS; c += 1) {
      if (this.board[c] !== 0) continue;
      if (so[c] >= FIVE_SCORE) return false; // the defender just wins
      if (sa[c] >= FIVE_SCORE) { aFives += 1; replies.length = 0; replies.push(c); continue; }
      if (aFives) continue;
      if (sa[c] >= WIN_MOVE) threatened = true;
    }
    if (aFives >= 2) return true;
    if (!aFives) {
      if (!threatened) return false; // the move threatened nothing
      // Defences: the cells of the threat line, plus every counter-four.
      for (let c = 0; c < CELLS; c += 1) {
        if (this.board[c] !== 0) continue;
        if ((sa[c] >= VAL[P_FOUR] && this.hasCode(ai, c, P_FOUR)) || (so[c] >= VAL[P_FOUR] && this.hasCode(oi, c, P_FOUR))) replies.push(c);
      }
    }
    for (const r of replies) {
      this.place(r, o);
      const ok = this.vct(a, depth) >= 0;
      this.unplace(r);
      if (!ok) return false;
    }
    return true;
  }

  // ---- Alpha-beta ------------------------------------------------------------------------------------------

  private evaluate(s: number) {
    return Math.round(this.total[s - 1] * 1.15 - this.total[2 - s]);
  }

  /** Candidate moves for `s`, best first. Returns null when `s` wins at once. */
  private generate(s: number, limit: number, out: number[]): { win: boolean; oppFives: number; selfWin: boolean } {
    out.length = 0;
    const si = s - 1;
    const oi = 2 - s;
    const ss = this.score[si];
    const so = this.score[oi];
    let oppFives = 0;
    let selfWin = false;
    let oppWin = false;
    for (let c = 0; c < CELLS; c += 1) {
      if (this.board[c] !== 0) continue;
      const a = ss[c];
      const b = so[c];
      if (a + b === 0) continue;
      if (a >= FIVE_SCORE) return { win: true, oppFives: 0, selfWin: true };
      if (b >= FIVE_SCORE) oppFives += 1;
      if (a >= WIN_MOVE) selfWin = true;
      if (b >= WIN_MOVE) oppWin = true;
    }
    if (oppFives) {
      for (let c = 0; c < CELLS; c += 1) if (this.board[c] === 0 && so[c] >= FIVE_SCORE) out.push(c);
      return { win: false, oppFives, selfWin };
    }
    const pri = (c: number) => ss[c] * 1.1 + so[c];
    if (oppWin && !selfWin) {
      // The other side threatens an open four (or a double four): block the line or answer with a four.
      for (let c = 0; c < CELLS; c += 1) {
        if (this.board[c] !== 0) continue;
        if (so[c] >= WIN_MOVE || (so[c] >= VAL[P_FOUR] && this.hasCode(oi, c, P_FOUR)) || (ss[c] >= VAL[P_FOUR] && this.hasCode(si, c, P_FOUR))) out.push(c);
      }
      out.sort((x, y) => pri(y) - pri(x));
      return { win: false, oppFives, selfWin };
    }
    for (let c = 0; c < CELLS; c += 1) if (this.board[c] === 0 && ss[c] + so[c] > 0) out.push(c);
    out.sort((x, y) => pri(y) - pri(x));
    if (out.length > limit) out.length = limit;
    return { win: false, oppFives, selfWin };
  }

  private search(s: number, depth: number, alpha: number, beta: number, ply: number): number {
    this.tick();
    const idx = this.h1 & TT_MASK;
    let ttBest = -1;
    if (this.ttFlag[idx] && this.ttKey[idx] === this.h2) {
      ttBest = this.ttMove[idx];
      if (this.ttDepth[idx] >= depth) {
        const v = this.ttVal[idx];
        const f = this.ttFlag[idx];
        if (f === EXACT) return v;
        if (f === LOWER && v >= beta) return v;
        if (f === UPPER && v <= alpha) return v;
      }
    }
    const moves: number[] = [];
    const g = this.generate(s, ply < 2 ? 12 : 9, moves);
    if (g.win) return WIN - ply;
    if (g.oppFives >= 2) return -(WIN - ply - 1);
    if (!g.oppFives && g.selfWin) return WIN - ply - 2;
    if (moves.length === 0) return 0;
    const forced = g.oppFives === 1;
    if ((depth <= 0 && !forced) || ply >= 40) return this.evaluate(s);
    if (ttBest >= 0) {
      const at = moves.indexOf(ttBest);
      if (at > 0) { moves.splice(at, 1); moves.unshift(ttBest); }
    }
    const next = forced ? depth : depth - 1;
    const alpha0 = alpha;
    let best = -INF;
    let bestMove = moves[0];
    for (const m of moves) {
      this.place(m, s);
      let v: number;
      try { v = -this.search(3 - s, next, -beta, -alpha, ply + 1); } finally { this.unplace(m); }
      if (v > best) { best = v; bestMove = m; }
      if (v > alpha) alpha = v;
      if (alpha >= beta) break;
    }
    this.ttKey[idx] = this.h2;
    this.ttVal[idx] = best;
    this.ttDepth[idx] = depth;
    this.ttMove[idx] = bestMove;
    this.ttFlag[idx] = best <= alpha0 ? UPPER : best >= beta ? LOWER : EXACT;
    return best;
  }

  // ---- Root ------------------------------------------------------------------------------------------------

  /** Best move for the side to move, within `timeMs`. */
  think(moves: HellPoint[], timeMs: number): HellResult {
    const start = now();
    this.nodes = 0;
    this.deadline = Infinity;
    const done = (c: number, kind: HellResult['kind'], depth = 0): HellResult => ({ row: Math.floor(c / N), col: c % N, kind, depth, nodes: this.nodes, ms: Math.round(now() - start) });

    if (moves.length === 0) return done(7 * N + 7, 'opening');
    this.load(moves);
    const s = moves.length % 2 === 0 ? 1 : 2;
    const o = 3 - s;
    if (moves.length === 1) {
      // Answer the first stone next to it (diagonal or straight), towards the centre.
      const first = moves[0].row * N + moves[0].col;
      const around: number[] = [];
      for (let dr = -1; dr <= 1; dr += 1) for (let dc = -1; dc <= 1; dc += 1) {
        const r = moves[0].row + dr;
        const c = moves[0].col + dc;
        if ((dr || dc) && r >= 1 && r < N - 1 && c >= 1 && c < N - 1) around.push(r * N + c);
      }
      if (around.length) return done(around[Math.floor(this.random() * around.length)], 'opening');
      void first;
    }

    const fiveCells: number[] = [];
    if (this.fives(s, fiveCells).length) return done(fiveCells[0], 'five');
    const oppFives = this.fives(o, []);
    if (oppFives.length) return done(oppFives[0], 'block');

    this.vcfFail.clear();
    this.deadline = start + timeMs * 0.25;
    try {
      const f = this.vcf(s, 24);
      if (f >= 0) return done(f, 'vcf');
    } catch (e) { if (!(e instanceof Timeout)) throw e; this.load(moves); }

    this.deadline = start + timeMs * 0.45;
    try {
      const v = this.vct(s, 4, 8);
      if (v >= 0) return done(v, 'vct');
    } catch (e) { if (!(e instanceof Timeout)) throw e; this.load(moves); }

    // Root candidates; drop the ones that hand the other side a forced win by fours.
    const root: number[] = [];
    this.generate(s, 18, root);
    const safe: number[] = [];
    this.deadline = start + timeMs * 0.6;
    try {
      for (const m of root) {
        this.place(m, s);
        let lost = false;
        try { lost = this.vcf(o, 16) >= 0; } finally { this.unplace(m); }
        if (!lost) safe.push(m);
      }
    } catch (e) {
      if (!(e instanceof Timeout)) throw e;
      this.load(moves); // a timeout inside the threat search leaves its stones on the board
      for (const m of root) if (!safe.includes(m)) safe.push(m); // unchecked ones stay in, at the back
    }
    const list = safe.length ? safe : root;
    if (list.length === 1) return done(list[0], 'search');

    this.deadline = start + timeMs * 0.92;
    const scores = new Map<number, number>();
    let order = list.slice();
    let finished: { scores: Map<number, number>; depth: number } | null = null;
    for (let depth = 1; depth <= 20; depth += 1) {
      const iter = new Map<number, number>();
      let best = -INF;
      try {
        for (const m of order) {
          // A window just below the best lets near-best moves get a real score (for the random pick).
          const margin = Math.max(40, Math.abs(best) * 0.04);
          const alpha = best === -INF ? -INF : best - margin;
          this.place(m, s);
          let v: number;
          try { v = -this.search(o, depth - 1, -INF, -alpha, 1); } finally { this.unplace(m); }
          iter.set(m, v);
          if (v > best) best = v;
        }
      } catch (e) {
        if (!(e instanceof Timeout)) throw e;
        break;
      }
      finished = { scores: iter, depth };
      for (const [m, v] of iter) scores.set(m, v);
      order = order.slice().sort((x, y) => (iter.get(y) ?? -INF) - (iter.get(x) ?? -INF));
      if (best >= WIN / 2 || best <= -WIN / 2) break;
      if (now() > start + timeMs * 0.55) break; // the next depth would not finish
    }
    if (!finished) return done(list[0], 'search');

    const ranked = [...finished.scores.entries()].sort((x, y) => y[1] - x[1]);
    const best = ranked[0][1];
    if (Math.abs(best) >= WIN / 2) return done(ranked[0][0], 'search', finished.depth);
    const margin = Math.max(40, Math.abs(best) * 0.04);
    const near = ranked.filter(([, v]) => v >= best - margin).slice(0, 3);
    const pick = near[Math.floor(this.random() * near.length)] ?? ranked[0];
    return done(pick[0], 'search', finished.depth);
  }
}

let shared: HellEngine | null = null;

/** One hell move for the side to move (owners follow the order of `moves`). */
export function chooseHellMove(moves: HellPoint[], timeMs = 1500, random: () => number = Math.random): HellResult {
  shared ??= new HellEngine(random);
  shared.random = random;
  return shared.think(moves, timeMs);
}

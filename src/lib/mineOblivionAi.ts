/*
 * 망각의 지뢰 AI, two levels.
 *
 * Fair play: every decision goes through moKnowledge(), which reads only what a player in that seat can know — their
 * own buried cells, the public board (pieces, scores, footprints, craters, treasures, the mined-cell count) and the
 * announced numbers of every move. The opponent's mines and the secret `removed` count of an explosion never reach
 * the AI.
 *
 * 보통 (normal) plays like a person: it forgets some of its own mines (more as the game goes on) and most numbers
 * older than a few moves, reads only what it still remembers with rough local arithmetic, and picks among good moves
 * with some noise. It can and does step on its own forgotten mines.
 *
 * 어려움 (hard) remembers everything it legitimately saw. It turns every announced number into a constraint on where
 * the opponent's 15 mines can be (minus its own mines around that cell, minus craters at that moment), adds the known
 * safe cells (every footprint), forced mines (a crater that was not its own mine) and the overlap fixed by the public
 * mined-cell count, and samples consistent placements with a Metropolis chain to get each cell's mine probability.
 * It looks two moves ahead, races for treasure it can reach first and never takes the last treasure when that loses
 * the game. It buries clever: guards around the treasures on the opponent's side, mines along the opponent's
 * shortest routes, clusters that give it safe points, and an open lane for itself.
 */
import {
  type MineOblivion, type MoSeat, type MoStep, type Rng, MO_MOVE_LIMIT, MO_PENALTY, MO_TREASURE_VALUES,
  buryCells, canBury, dist, legalMoves, neighbours, other, respawnOptions, startOf, treasureCells,
} from './mineOblivion';

export type MoLevel = 'normal' | 'hard';
export const MO_LEVELS: MoLevel[] = ['normal', 'hard'];
/** A seat's private memory seed (normal level): which of its mines and which numbers it will forget. */
export type MoMind = {
  seed: number;
  /** Items (the simulation's item-using player only; the AI itself never uses items): own moves made when it last
   * used 기억 되살리기, and the 탐지기 numbers it has seen. */
  recallAt?: number;
  probes?: MoProbe[];
};
export type MoProbe = { cell: number; number: number; n: number };
export const rollMoMind = (rng: Rng = Math.random): MoMind => ({ seed: Math.floor(rng() * 2 ** 31) });

const hash01 = (seed: number, a: number, b: number) => {
  let h = (seed ^ Math.imul(a + 0x9e37, 0x85ebca6b) ^ Math.imul(b + 0x51ed, 0xc2b2ae35)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

/** A public step, without the secret `removed`. */
export type MoSeen = Pick<MoStep, 'n' | 'seat' | 'from' | 'to' | 'kind' | 'number' | 'respawn'>;

/** Everything the seat can know (and, at the normal level, still remembers). */
export type MoKnowledge = {
  size: number; seat: MoSeat; mines: number;
  own: number[]; // own mines it remembers (all of them at hard)
  ownAll: boolean; // whether `own` is complete
  steps: MoSeen[]; // announced moves it remembers, oldest first
  probes: MoProbe[]; // 탐지기 numbers it saw and remembers (item-using players only)
  allSteps: number; // moves played so far
  pos: [number, number]; score: [number, number];
  scored: number[]; craters: number[];
  treasures: { cell: number; found: boolean }[];
  minedAtStart: number; // public distinct mined cells when the walk began
  minedCells: number;
};

export function moKnowledge(g: MineOblivion, seat: MoSeat, level: MoLevel, mind?: MoMind | null): MoKnowledge {
  const seed = mind?.seed ?? 1;
  const myMoves = g.log.filter((s) => s.seat === seat).length;
  const all: MoSeen[] = g.log.map(({ n, seat: s, from, to, kind, number, respawn }) => ({ n, seat: s, from, to, kind, number, respawn }));
  let own = [...g.buried[seat]];
  let steps = all;
  let probes = mind?.probes ?? [];
  if (level === 'normal') {
    // Own mines fade: one in twenty is gone at the first move, one in four by the 40th.
    const forget = Math.min(NORMAL.forgetMax, NORMAL.forget0 + NORMAL.forgetSlope * Math.max(0, myMoves - (mind?.recallAt ?? 0)));
    own = own.filter((_, i) => hash01(seed, 1, i) >= forget);
    // Numbers: the last two moves are always remembered; one 10 moves old is gone four times in ten.
    const now = g.log.length;
    steps = all.filter((s) => { const age = now - s.n; return age < 2 || hash01(seed, 2, s.n) >= Math.min(0.92, NORMAL.obsFade * age); });
    probes = probes.filter((p) => { const age = now - p.n; return age < 2 || hash01(seed, 3, p.n * 131 + p.cell) >= Math.min(0.92, NORMAL.obsFade * age); });
  }
  return {
    size: g.size, seat, mines: g.mines, own, ownAll: level === 'hard', steps, probes, allSteps: g.log.length,
    pos: [...g.pos] as [number, number], score: [...g.score] as [number, number],
    scored: [...g.scored], craters: [...g.craters],
    treasures: g.treasures.map((t) => ({ cell: t.cell, found: t.by !== null })),
    minedAtStart: g.minedCells + g.craters.length, minedCells: g.minedCells,
  };
}

// ── Inference: probability of an opponent mine on each cell ─────────────────────────────────────────────────────
type Constraint = { cells: number[]; k: number };

/** Hard: constraints from every announced number, sampled with a Metropolis chain. */
function hardBeliefs(k: MoKnowledge, rng: Rng): number[] {
  const size = k.size, N = size * size, nb = neighbours(size);
  const S = new Set(k.own);
  const allowed = buryCells(size);
  const ov = Math.max(0, Math.min(k.mines, 2 * k.mines - k.minedAtStart));
  const forced0 = new Set<number>();
  const forced1 = new Set<number>();
  const cons: Constraint[] = [];
  const craterBefore: number[] = []; // craters in order
  for (const s of k.steps) {
    const gone = new Set(craterBefore);
    if (s.kind === 'mine') {
      if (!S.has(s.to) && !gone.has(s.to)) forced1.add(s.to);
      craterBefore.push(s.to);
      continue;
    }
    if (!gone.has(s.to)) forced0.add(s.to);
    if (s.number !== null) {
      const cells = nb[s.to].filter((c) => !gone.has(c));
      const ownHere = cells.filter((c) => S.has(c)).length;
      cons.push({ cells: cells.filter((c) => canBury(c, size)), k: s.number - ownHere });
    }
  }
  for (const p of k.probes) {
    // A 탐지기 number: like an announced number, but the cell itself may hold a mine.
    const gone = new Set(k.steps.filter((s) => s.kind === 'mine' && s.n <= p.n).map((s) => s.to));
    const cells = nb[p.cell].filter((c) => !gone.has(c));
    cons.push({ cells: cells.filter((c) => canBury(c, size)), k: p.number - cells.filter((c) => S.has(c)).length });
  }
  // Unknown-to-hard steps cannot happen (it remembers all), but craters in k.craters not in steps would: none.
  const inPool = allowed.filter((c) => S.has(c) && !forced0.has(c) && !forced1.has(c));
  const outPool = allowed.filter((c) => !S.has(c) && !forced0.has(c) && !forced1.has(c));
  const fixedIn = [...forced1].filter((c) => S.has(c)).length;
  const fixedOut = forced1.size - fixedIn;
  let needIn = ov - fixedIn;
  let needOut = k.mines - ov - fixedOut;
  if (needIn < 0 || needIn > inPool.length || needOut < 0 || needOut > outPool.length) {
    // Inconsistent with what it believes (cannot happen at hard): fall back to ignoring the overlap.
    needIn = Math.min(inPool.length, Math.max(0, needIn));
    needOut = Math.min(outPool.length, Math.max(0, k.mines - forced1.size - needIn));
  }
  const consOf: number[][] = Array.from({ length: N }, () => []);
  cons.forEach((c, i) => c.cells.forEach((x) => consOf[x].push(i)));
  const prob = Array<number>(N).fill(0);
  const craterSet = new Set(k.craters);
  const sum = Array<number>(N).fill(0);
  let samples = 0;
  let bestE = Infinity;
  const bestSum = Array<number>(N).fill(0);
  let bestSamples = 0;
  const CHAINS = 6, ANNEAL = 1600, SAMPLE = 2400;
  for (let chain = 0; chain < CHAINS; chain += 1) {
    const on = new Uint8Array(N);
    forced1.forEach((c) => { on[c] = 1; });
    const shuffle = (list: number[]) => { const a = [...list]; for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const inOn = shuffle(inPool).slice(0, needIn), outOn = shuffle(outPool).slice(0, needOut);
    inOn.forEach((c) => { on[c] = 1; }); outOn.forEach((c) => { on[c] = 1; });
    const inOff = inPool.filter((c) => !on[c]), outOff = outPool.filter((c) => !on[c]);
    const count = cons.map((c) => c.cells.reduce((s, x) => s + on[x], 0));
    let E = cons.reduce((s, c, i) => s + Math.abs(count[i] - c.k), 0);
    const delta = (x: number, y: number) => {
      // x goes off, y goes on
      let d = 0;
      for (const i of consOf[x]) { const before = Math.abs(count[i] - cons[i].k); const after = Math.abs(count[i] - 1 + (consOf[y].includes(i) ? 1 : 0) - cons[i].k); d += after - before; }
      for (const i of consOf[y]) { if (consOf[x].includes(i)) continue; d += Math.abs(count[i] + 1 - cons[i].k) - Math.abs(count[i] - cons[i].k); }
      return d;
    };
    const total = ANNEAL + SAMPLE;
    for (let it = 0; it < total; it += 1) {
      const useIn = inOn.length && inOff.length && (!outOn.length || !outOff.length || rng() < inOn.length / (inOn.length + outOn.length));
      const onL = useIn ? inOn : outOn, offL = useIn ? inOff : outOff;
      if (onL.length && offL.length) {
        const a = Math.floor(rng() * onL.length), b = Math.floor(rng() * offL.length);
        const x = onL[a], y = offL[b];
        const d = delta(x, y);
        const T = it < ANNEAL ? 2 * (1 - it / ANNEAL) + 0.12 : 0.12;
        if (d <= 0 || rng() < Math.exp(-d / T)) {
          for (const i of consOf[x]) count[i] -= 1;
          for (const i of consOf[y]) count[i] += 1;
          on[x] = 0; on[y] = 1; onL[a] = y; offL[b] = x; E += d;
        }
      }
      if (it >= ANNEAL && it % 4 === 0) {
        if (E === 0) { for (let c = 0; c < N; c += 1) if (on[c]) sum[c] += 1; samples += 1; }
        if (E < bestE) { bestE = E; bestSum.fill(0); bestSamples = 0; }
        if (E === bestE) { for (let c = 0; c < N; c += 1) if (on[c]) bestSum[c] += 1; bestSamples += 1; }
      }
    }
  }
  const src = samples ? sum : bestSum, n = samples || bestSamples || 1;
  for (let c = 0; c < N; c += 1) prob[c] = craterSet.has(c) ? 0 : src[c] / n;
  return prob;
}

/** Normal: rough local arithmetic over what it still remembers. */
function normalBeliefs(k: MoKnowledge): number[] {
  const size = k.size, N = size * size, nb = neighbours(size);
  const S = new Set(k.own);
  const craters = new Set(k.craters);
  const safe = new Set([...k.scored, ...k.craters]);
  const unknown = buryCells(size).filter((c) => !safe.has(c) && !S.has(c));
  // Explosions not on a mine it remembers are taken as the opponent's.
  const oppGone = k.craters.filter((c) => !S.has(c)).length;
  const base = Math.max(0, k.mines - oppGone) / Math.max(1, unknown.length);
  const est: number[][] = Array.from({ length: N }, () => []);
  for (const s of k.steps) {
    if (s.number === null) continue;
    const cells = nb[s.to].filter((c) => canBury(c, size) && !craters.has(c));
    const ownHere = cells.filter((c) => S.has(c)).length;
    const cand = cells.filter((c) => !safe.has(c) && !S.has(c));
    if (!cand.length) continue;
    const p = Math.max(0, Math.min(1, (s.number - ownHere) / cand.length));
    cand.forEach((c) => est[c].push(p));
  }
  for (const p of k.probes) {
    const cells = nb[p.cell].filter((c) => canBury(c, size) && !craters.has(c));
    const cand = cells.filter((c) => !safe.has(c) && !S.has(c));
    if (!cand.length) continue;
    const q = Math.max(0, Math.min(1, (p.number - cells.filter((c) => S.has(c)).length) / cand.length));
    cand.forEach((c) => est[c].push(q));
  }
  const prob = Array<number>(N).fill(0);
  for (const c of unknown) prob[c] = est[c].length ? (est[c].reduce((a, b) => a + b, 0) + base) / (est[c].length + 1) : base;
  return prob;
}

export function moBeliefs(k: MoKnowledge, level: MoLevel, rng: Rng = Math.random) {
  return level === 'hard' ? hardBeliefs(k, rng) : normalBeliefs(k);
}

// ── Moves ────────────────────────────────────────────────────────────────────────────────────────────────────────
const TEMPO = 0.55; // points a move is worth on average, roughly
/** Normal is bolder than the numbers say (people under-weigh a 30 % risk). */
/** How the normal level plays (tuned with scripts/mine-oblivion/sim.ts). */
export const NORMAL = { nerve: 0.95, tau: 0.15, depth: 2, gamma: 0.6, forget0: 0.05, forgetSlope: 0.005, forgetMax: 0.25, obsFade: 0.04, lane: 0.3, route: 0.8 };
const PULL: Record<MoLevel, number> = { normal: 1.6, hard: 1.8 };
/** A move onto a cell someone already scored wastes the turn. */
const IDLE = 0.3;
type Ctx = { k: MoKnowledge; p: number[]; own: Set<number>; level: MoLevel; opp: number };

/** Probability that stepping on `c` explodes, as this seat believes it. */
const danger = (x: Ctx, c: number) => (x.own.has(c) ? 1 : x.k.craters.includes(c) || !canBury(c, x.k.size) ? 0 : Math.min(1, x.p[c] * (x.level === 'normal' ? NORMAL.nerve : 1)));

function expectedNumber(x: Ctx, c: number) {
  const craters = new Set(x.k.craters);
  return neighbours(x.k.size)[c].reduce((s, n) => s + (craters.has(n) ? 0 : (x.own.has(n) ? 1 : 0) + x.p[n]), 0);
}

function nextTreasureValue(k: MoKnowledge) {
  const found = k.treasures.filter((t) => t.found).length;
  return MO_TREASURE_VALUES[Math.min(found, MO_TREASURE_VALUES.length - 1)];
}

/** Risk-weighted distance from `from` to every cell (Dijkstra, 8-way). */
function riskDistances(x: Ctx, from: number, avoid: number) {
  const size = x.k.size, N = size * size, nb = neighbours(size);
  const d = Array<number>(N).fill(Infinity);
  d[from] = 0;
  const done = new Uint8Array(N);
  for (;;) {
    let u = -1, best = Infinity;
    for (let i = 0; i < N; i += 1) if (!done[i] && d[i] < best) { best = d[i]; u = i; }
    if (u < 0) break;
    done[u] = 1;
    for (const v of nb[u]) {
      if (v === avoid) continue;
      const w = 1 + danger(x, v) * 3;
      if (d[u] + w < d[v]) d[v] = d[u] + w;
    }
  }
  return d;
}

/** Immediate value of stepping on `c` (points expected), with the end-of-game rule for the last treasure. */
function stepValue(x: Ctx, c: number, scored: Set<number>, myScore: number, oppScore: number) {
  const k = x.k;
  const d = danger(x, c);
  const back = TEMPO * Math.max(0, dist(c, startOf(k.seat, k.size), k.size) - 1);
  const t = k.treasures.find((tr) => tr.cell === c && !tr.found);
  const num = scored.has(c) ? 0 : expectedNumber(x, c);
  let gain = scored.has(c) ? -IDLE : num;
  if (t) {
    const val = nextTreasureValue(k);
    const left = k.treasures.filter((tr) => !tr.found).length;
    gain += val;
    if (left === 1) {
      // Taking the last treasure ends the game now.
      const after = myScore + num + val;
      gain += after > oppScore ? 120 : after === oppScore ? -20 : -150;
    }
  }
  return (1 - d) * gain - d * (MO_PENALTY + back);
}

function scoreMove(x: Ctx, c: number, rngNoise: number) {
  const k = x.k;
  const me = k.seat;
  const scored = new Set(k.scored);
  const myScore = k.score[me], oppScore = k.score[other(me)];
  let v = stepValue(x, c, scored, myScore, oppScore);
  const d = danger(x, c);
  // Look ahead: the best follow-up from there (two plies at hard, one at normal).
  const depth = x.level === 'hard' ? 2 : NORMAL.depth;
  const gamma = x.level === 'hard' ? 0.75 : NORMAL.gamma;
  const after = new Set(scored); after.add(c);
  const follow = (from: number, left: number, seen: Set<number>): number => {
    if (!left) return 0;
    let best = -Infinity;
    for (const n of neighbours(k.size)[from]) {
      if (n === x.opp) continue;
      const val = stepValue(x, n, seen, myScore, oppScore);
      let more = 0;
      if (left > 1) { const s2 = new Set(seen); s2.add(n); more = gamma * (1 - danger(x, n)) * follow(n, left - 1, s2); }
      best = Math.max(best, val + more);
    }
    return best === -Infinity ? 0 : best;
  };
  v += gamma * (1 - d) * follow(c, depth, after);
  // Treasure race: pull towards the treasure it can reach first (linear in risk-weighted distance, so every step
  // closer counts the same), plus a little for the others.
  const left = k.treasures.filter((t) => !t.found);
  if (left.length) {
    const dm = riskDistances(x, c, x.opp);
    const val = nextTreasureValue(k);
    // A treasure taken by this move counts as reached (distance 0), so the pull never argues against taking it.
    const pulls = left.map((t) => {
      const mine = t.cell === c ? 0 : dm[t.cell];
      const theirs = dist(x.opp, t.cell, k.size);
      const last = left.length === 1;
      // The last treasure is only worth chasing when taking it wins.
      const wanted = last ? (myScore + val > oppScore ? 1 : 0.05) : 1;
      const race = mine <= theirs + 1 ? 1 : x.level === 'hard' ? 0.45 : 0.7;
      return wanted * race * val * PULL[x.level] * (1 - Math.min(mine, 40) / 40);
    }).sort((a, b) => b - a);
    if (pulls.length) v += pulls[0] + 0.25 * pulls.slice(1).reduce((a, b) => a + b, 0);
  }
  // Near the move limit, points now matter more than routes.
  if (k.allSteps > MO_MOVE_LIMIT - 8) v += stepValue(x, c, scored, myScore, oppScore) * 0.5;
  return v + rngNoise;
}

/** The AI's move: a cell from legalMoves(). */
export function chooseMoMove(g: MineOblivion, seat: MoSeat, level: MoLevel, mind?: MoMind | null, rng: Rng = Math.random): number {
  const moves = legalMoves(g, seat);
  if (moves.length <= 1) return moves[0];
  const k = moKnowledge(g, seat, level, mind);
  const x: Ctx = { k, p: moBeliefs(k, level, rng), own: new Set(k.own), level, opp: g.pos[other(seat)] };
  const scored = moves.map((c) => ({ c, v: scoreMove(x, c, 0) }));
  if (level === 'hard') return scored.reduce((a, b) => (b.v > a.v ? b : a)).c;
  // Normal: softmax over the values (a person picks a good move, not always the best).
  const tau = NORMAL.tau;
  const top = Math.max(...scored.map((s) => s.v));
  const w = scored.map((s) => Math.exp((s.v - top) / tau));
  let r = rng() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < w.length; i += 1) { r -= w[i]; if (r <= 0) return scored[i].c; }
  return scored[scored.length - 1].c;
}

/** How likely each of `cells` is to explode, as `seat` believes (the simulation's item policy). */
export function moDanger(g: MineOblivion, seat: MoSeat, level: MoLevel, mind: MoMind | null | undefined, cells: number[], rng: Rng = Math.random) {
  const k = moKnowledge(g, seat, level, mind);
  const x: Ctx = { k, p: moBeliefs(k, level, rng), own: new Set(k.own), level, opp: g.pos[other(seat)] };
  return cells.map((c) => danger(x, c));
}

/** After a mine: the respawn cell closest (in risk) to the best remaining treasure. */
export function chooseMoRespawn(g: MineOblivion, seat: MoSeat, level: MoLevel, mind?: MoMind | null, rng: Rng = Math.random): number {
  const opts = respawnOptions(g, seat);
  if (opts.length <= 1) return opts[0];
  const k = moKnowledge(g, seat, level, mind);
  const x: Ctx = { k, p: level === 'hard' ? moBeliefs(k, level, rng) : normalBeliefs(k), own: new Set(k.own), level, opp: g.pos[other(seat)] };
  let best = opts[0], bv = -Infinity;
  for (const c of opts) { const v = scoreMove(x, c, level === 'normal' ? rng() * 0.6 : 0); if (v > bv) { bv = v; best = c; } }
  return best;
}

// ── Burying ──────────────────────────────────────────────────────────────────────────────────────────────────────
function weightedPick(cands: number[], weight: (c: number) => number, rng: Rng) {
  const w = cands.map((c) => Math.max(0.0001, weight(c)));
  let r = rng() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < cands.length; i += 1) { r -= w[i]; if (r <= 0) return cands[i]; }
  return cands[cands.length - 1];
}

/** Where the AI buries its mines. */
export function chooseMoBurial(seat: MoSeat, level: MoLevel, rng: Rng = Math.random, size = 11, mines = 15): number[] {
  const me = startOf(seat, size), opp = startOf(other(seat), size);
  const treasures = treasureCells(size);
  const nb = neighbours(size);
  const chosen: number[] = [];
  const pool = buryCells(size);
  const onRoute = (from: number, c: number, t: number, slack: number) => dist(from, c, size) + dist(c, t, size) <= dist(from, t, size) + slack;
  // Hard keeps one lane open for itself: a straight walk from its start to the centre, then to each corner treasure.
  // Normal keeps the same lane only loosely (a person avoids burying right in their own way, mostly).
  const lane = new Set<number>();
  {
    const walk = (a: number, b: number) => {
      let [r, c] = [Math.floor(a / size), a % size];
      const [br, bc] = [Math.floor(b / size), b % size];
      while (r !== br || c !== bc) { r += Math.sign(br - r); c += Math.sign(bc - c); lane.add(r * size + c); }
    };
    const centre = treasures[1];
    walk(me, centre);
    for (const t of [treasures[0], treasures[2]]) walk(centre, t);
  }
  for (let i = 0; i < mines; i += 1) {
    const cands = pool.filter((c) => !chosen.includes(c) && (level === 'normal' || !lane.has(c)));
    const weight = (c: number) => {
      const adjChosen = nb[c].filter((n) => chosen.includes(n)).length;
      const nearT = treasures.some((t) => dist(c, t, size) <= 1);
      const near2 = treasures.some((t) => dist(c, t, size) === 2);
      if (level === 'normal') return (lane.has(c) ? NORMAL.lane : 1) * (1 + (nearT ? 1.2 : 0) + (near2 ? 0.4 : 0) + Math.min(2, adjChosen) * 0.5 + (treasures.some((t) => onRoute(opp, c, t, 0)) ? NORMAL.route : 0));
      // Never wall a treasure in completely: leave at least two open neighbours.
      for (const t of treasures) {
        if (dist(c, t, size) === 1 && nb[t].filter((n) => chosen.includes(n) || n === c).length > nb[t].length - 2) return 0.0001;
      }
      const oppRoute = treasures.some((t) => onRoute(opp, c, t, 0)) ? 2.6 : treasures.some((t) => onRoute(opp, c, t, 1)) ? 1.2 : 0;
      const guard = treasures.some((t) => dist(c, t, size) === 1 && dist(c, opp, size) < dist(c, me, size) + 3) ? 2.8 : nearT ? 1.4 : 0;
      const field = [...nb[c]].some((n) => lane.has(n)) ? 1.1 : 0; // mines next to its own lane = safe points for it
      const myRoute = treasures.some((t) => onRoute(me, c, t, 0)) && !guard ? -0.6 : 0;
      return Math.max(0.05, 0.5 + oppRoute + guard + field + myRoute + Math.min(2, adjChosen) * 0.35);
    };
    const pick = cands.length ? weightedPick(cands, (c) => weight(c) ** (level === 'hard' ? 2 : 1), rng) : pool.find((c) => !chosen.includes(c))!;
    chosen.push(pick);
  }
  return chosen;
}

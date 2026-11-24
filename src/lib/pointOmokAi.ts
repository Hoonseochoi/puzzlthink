// 포인트 오목 AI. It is handed only what a player at the table knows: the board, the public record of each round
// (who chose, which points, whose stone landed where) and its own bids. It never sees the other player's bids or points.
//
// - Choosing: every legal line of three near the stones is scored by how the board would look for each of the eight
//   ways the three points could be split, weighted by how likely each split is.
// - Bidding (어려움): the other player's budget is narrowed to a range from the grant and carry rules and the results
//   of earlier rounds; their bids are sampled from that range; every split of the AI's own budget is scored by its
//   expected board value plus the worth of the points it would carry over; one is drawn from the best ones (mixed),
//   so its bids cannot be read off the board.
import {
  PO_CELLS, PO_DIRS, PO_GRANT, PO_SIZE, allTriples, carryOf, cellAt, colOf, countFives, onBoard, other, rowOf, sum,
  type PoBets, type PoBoard, type PoSeat, type PoTriple,
} from './pointOmok';

export type PoLevel = 'easy' | 'normal' | 'hard';
export const PO_LEVELS: PoLevel[] = ['easy', 'normal', 'hard'];

export type PoPublicRound = { chooser: PoSeat; triple: PoTriple; owners: PoSeat[] };
export type PoAiView = {
  board: PoBoard;
  me: PoSeat;
  chooser: PoSeat;
  triple: PoTriple | null; // set when bidding
  rounds: PoPublicRound[]; // finished rounds, public part only
  myBets: number[][]; // the AI's own bids, one per finished round
  budget: number; // the AI's points this round
  level: PoLevel;
  seed?: number;
};

const WIN = 1_000_000;
const SCORE = [0, 1, 7, 45, 320, 0];
const OPP_WEIGHT = 1.15;

// Every run of five cells on the board, and the runs through each cell.
const WINDOWS: number[][] = [];
const WINDOWS_AT: number[][] = Array.from({ length: PO_CELLS }, () => []);
for (const [dr, dc] of PO_DIRS) for (let r = 0; r < PO_SIZE; r += 1) for (let c = 0; c < PO_SIZE; c += 1) {
  if (!onBoard(r + dr * 4, c + dc * 4)) continue;
  const cells = [0, 1, 2, 3, 4].map((k) => cellAt(r + dr * k, c + dc * k));
  const id = WINDOWS.length;
  WINDOWS.push(cells);
  for (const cell of cells) WINDOWS_AT[cell].push(id);
}

/** Seeded random numbers (mulberry32), so a worker run can be repeated in tests. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function windowScore(board: PoBoard, id: number, me: PoSeat) {
  let mine = 0, theirs = 0;
  for (const cell of WINDOWS[id]) { const v = board[cell]; if (v === me) mine += 1; else if (v >= 0) theirs += 1; }
  if (mine && theirs) return 0;
  return mine ? SCORE[mine] : -SCORE[theirs] * OPP_WEIGHT;
}

/** Positional value of the board for `me` (no five on it). */
export function evaluate(board: PoBoard, me: PoSeat) {
  let total = 0;
  for (let id = 0; id < WINDOWS.length; id += 1) total += windowScore(board, id, me);
  return total;
}

/**
 * Value for `me` of each of the eight ways the triple could be split: index bit i set = `me` takes point i.
 * Terminal splits (someone has more fives) are ±WIN, an equal-fives draw is 0.
 */
export function splitValues(board: PoBoard, triple: PoTriple, me: PoSeat, base = evaluate(board, me)): number[] {
  const touched = [...new Set(triple.flatMap((cell) => WINDOWS_AT[cell]))];
  const before = touched.reduce((s, id) => s + windowScore(board, id, me), 0);
  const out: number[] = [];
  const work = board.slice();
  for (let mask = 0; mask < 8; mask += 1) {
    triple.forEach((cell, i) => { work[cell] = mask & (1 << i) ? me : other(me); });
    let full = false;
    let after = 0;
    for (const id of touched) {
      after += windowScore(work, id, me);
      if (!full) { const v = work[WINDOWS[id][0]]; if (v >= 0 && WINDOWS[id].every((cell) => work[cell] === v)) full = true; }
    }
    const [a, b] = full ? countFives(work) : [0, 0];
    const mine = me === 0 ? a : b, theirs = me === 0 ? b : a;
    // A full window inside a run of six is no five (overlines do not count): then it is just a position.
    if (mine || theirs) out.push(mine > theirs ? WIN : theirs > mine ? -WIN : 0);
    else out.push(base - before + after);
  }
  triple.forEach((cell) => { work[cell] = -1; });
  return out;
}

/** Expected value of the eight splits when `me` takes each point with probability p (independently). */
const expected = (values: number[], p: number) => values.reduce((s, v, mask) => {
  let pr = 1;
  for (let i = 0; i < 3; i += 1) pr *= mask & (1 << i) ? p : 1 - p;
  return s + pr * v;
}, 0);

/** How much point i matters to `me`: value of taking it minus leaving it, averaged over the other two points. */
export function marginals(values: number[]): number[] {
  return [0, 1, 2].map((i) => {
    let s = 0;
    for (let mask = 0; mask < 8; mask += 1) if (mask & (1 << i)) s += values[mask] - values[mask & ~(1 << i)];
    return s / 4;
  });
}

function nearStones(board: PoBoard, cell: number, reach: number) {
  const r0 = rowOf(cell), c0 = colOf(cell);
  for (let dr = -reach; dr <= reach; dr += 1) for (let dc = -reach; dc <= reach; dc += 1) {
    const r = r0 + dr, c = c0 + dc;
    if (onBoard(r, c) && board[cellAt(r, c)] >= 0) return true;
  }
  return false;
}

function candidates(board: PoBoard): PoTriple[] {
  const all = allTriples(board);
  const stones = board.some((x) => x >= 0);
  const pool = all.filter((t) => stones ? t.some((cell) => nearStones(board, cell, 2)) : t.every((cell) => Math.abs(rowOf(cell) - 7) <= 2 && Math.abs(colOf(cell) - 7) <= 2));
  return pool.length ? pool : all;
}

/** Picks one item, more likely the higher its score (softmax at `temperature`). */
function pickSoft<T>(items: T[], scores: number[], temperature: number, rand: () => number): T {
  const top = Math.max(...scores);
  const weights = scores.map((s) => Math.exp((s - top) / Math.max(temperature, 1e-9)));
  let roll = rand() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < items.length; i += 1) { roll -= weights[i]; if (roll <= 0) return items[i]; }
  return items[items.length - 1];
}

/** The three points to put up this round. */
export function chooseTriple(view: PoAiView): PoTriple {
  const rand = rng(view.seed ?? Math.floor(Math.random() * 2 ** 31));
  const pool = candidates(view.board);
  if (view.level === 'easy') {
    // Mostly next to its own stones, otherwise anywhere near the play.
    const own = pool.filter((t) => t.some((cell) => {
      for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1], [0, -1], [-1, 0], [-1, -1], [-1, 1]]) {
        const r = rowOf(cell) + dr, c = colOf(cell) + dc;
        if (onBoard(r, c) && view.board[cellAt(r, c)] === view.me) return true;
      }
      return false;
    }));
    const from = own.length && rand() < 0.7 ? own : pool;
    return from[Math.floor(rand() * from.length)];
  }
  const base = evaluate(view.board, view.me);
  // The chooser loses ties, so it expects slightly less than half of each point.
  const p = view.level === 'hard' ? 0.45 : 0.5;
  const scored = (view.level === 'normal' && pool.length > 160 ? pool.filter(() => rand() < 160 / pool.length) : pool)
    .map((t) => {
      const values = splitValues(view.board, t, view.me, base);
      let score = expected(values, p);
      if (view.level === 'hard') {
        // Lines where the other side can win outright are only worth it when the AI can win there too.
        const worst = Math.min(...values), best = Math.max(...values);
        if (worst <= -WIN && best < WIN) score -= WIN * 0.15;
      } else score *= 1 + (rand() - 0.5) * 0.3;
      return { t, score };
    });
  if (!scored.length) return pool[0];
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, view.level === 'hard' ? 4 : 6);
  const spread = Math.abs(top[0].score - top[top.length - 1].score) || 1;
  return pickSoft(top.map((x) => x.t), top.map((x) => x.score), spread * (view.level === 'hard' ? 0.12 : 0.4), rand);
}

/**
 * The other player's possible budget this round, from the public record and the AI's own bids:
 * each point they took means they bid at least as much as the AI (more, if they chose), each point they lost
 * means they bid less (or the same, if they chose); the carry rule then bounds what they brought into this round.
 */
export function opponentBudgetRange(rounds: PoPublicRound[], myBets: number[][], me: PoSeat): [number, number] {
  let lo = PO_GRANT, hi = PO_GRANT;
  rounds.forEach((round, r) => {
    const mine = myBets[r];
    if (!mine) return;
    const theyChose = round.chooser !== me;
    let spentMin = 0, spentMax = 0;
    for (let i = 0; i < 3; i += 1) {
      if (round.owners[i] !== me) { spentMin += mine[i] + (theyChose ? 1 : 0); spentMax += hi; }
      else { spentMin += 1; spentMax += Math.max(1, mine[i] - (theyChose ? 0 : 1)); }
    }
    spentMin = Math.min(spentMin, hi);
    spentMax = Math.min(spentMax, hi);
    const effLo = Math.max(lo, spentMin);
    const nextLo = PO_GRANT + Math.floor(Math.max(0, effLo - spentMax) / 2);
    const nextHi = PO_GRANT + carryOf(hi, spentMin);
    lo = Math.min(nextLo, nextHi);
    hi = nextHi;
  });
  return [lo, hi];
}

/** Every way to bid: at least 1 on each point, no more than the budget in all. */
function allSplits(budget: number): PoBets[] {
  const out: PoBets[] = [];
  for (let a = 1; a <= budget - 2; a += 1) for (let b = 1; a + b <= budget - 1; b += 1) for (let c = 1; a + b + c <= budget; c += 1) out.push([a, b, c]);
  return out;
}

/** A sampled bid for a player with `budget` points who cares about the points by `weights`. */
function sampleBid(budget: number, weights: number[], spendFrac: number, rand: () => number): number[] {
  const spend = Math.max(3, Math.min(budget, Math.round(budget * spendFrac)));
  const w = weights.map((x) => x * Math.exp((rand() - 0.5) * 0.9));
  const total = w.reduce((a, b) => a + b, 0) || 1;
  const extra = spend - 3;
  const bids = w.map((x) => 1 + Math.floor((x / total) * extra));
  let left = spend - sum(bids);
  while (left > 0) { const i = Math.floor(rand() * 3); bids[i] += 1; left -= 1; }
  return bids;
}

/** How the AI splits its points over the three points. */
export function chooseBets(view: PoAiView): PoBets {
  const rand = rng(view.seed ?? Math.floor(Math.random() * 2 ** 31));
  const budget = view.budget;
  const triple = view.triple!;
  const values = splitValues(view.board, triple, view.me);
  const m = marginals(values);
  const worth = m.map((x) => Math.max(0, x));

  if (view.level === 'easy') {
    const bids = sampleBid(budget, [1, 1, 1], 0.55 + rand() * 0.45, rand);
    return bids as PoBets;
  }
  if (view.level === 'normal') {
    const urgent = worth.some((x) => x >= WIN / 4);
    const bids = sampleBid(budget, worth.map((x) => Math.min(x, 600) + 8), urgent ? 1 : 0.65 + rand() * 0.25, rand);
    return bids as PoBets;
  }

  // 어려움: expected value against sampled bids from the range the other player can be in.
  const [lo, hi] = opponentBudgetRange(view.rounds, view.myBets, view.me);
  const iChose = view.chooser === view.me;
  const terminal = worth.some((x) => x >= WIN / 4);
  const oppWorth = worth.map((x) => Math.min(x, terminal ? WIN : 600) + 6); // the stakes are the same for both sides
  const samples: number[][] = [];
  for (let k = 0; k < 360; k += 1) {
    const b = lo + Math.floor(rand() * (hi - lo + 1));
    const frac = terminal ? 0.85 + rand() * 0.15 : 0.5 + rand() * 0.5;
    samples.push(sampleBid(b, oppWorth.map((x) => Math.pow(x, 0.8)), frac, rand));
  }
  // A carried point is worth about one point of bidding next round (already halved by the carry rule).
  const scale = Math.max(4, Math.min(400, worth.reduce((a, b) => a + Math.min(b, 400), 0) / 3));
  const lambda = (scale / 3.2) * 0.55;
  const options = allSplits(budget);
  const evs = options.map((bets) => {
    let total = 0;
    for (const o of samples) {
      let mask = 0;
      for (let i = 0; i < 3; i += 1) if (bets[i] > o[i] || (bets[i] === o[i] && !iChose)) mask |= 1 << i;
      total += values[mask];
    }
    return total / samples.length + lambda * carryOf(budget, sum(bets));
  });
  const order = evs.map((ev, i) => ({ ev, i })).sort((a, b) => b.ev - a.ev).slice(0, 8);
  const spread = Math.abs(order[0].ev - order[order.length - 1].ev) || 1;
  const pick = pickSoft(order.map((x) => options[x.i]), order.map((x) => x.ev), spread * 0.25, rand);
  return pick;
}

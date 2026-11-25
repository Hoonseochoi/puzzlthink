// 그라데이션 (Gradation) — the prison final of The Devil's Plan 3, day 6. One match, 1:1.
//
// Each player has 7 cups in a row, dark at both ends and lightest in the middle, and 20 number cubes
// (0–9, two of each). Secretly put one cube in every cup: left to right the numbers never go down, and they
// add up to at most 30. Then 7 rounds: the lead player hands in a cup — the other side sees only its shade
// (dark, grey, light or white), never where it stood — the other player answers with a cup, both cubes are
// shown and the higher one scores a point (a tie scores nothing). The round's winner leads the next one
// (a tie keeps the lead). Most points after 7 rounds wins; a tie means a fresh rematch until someone wins.
//
// The shade is the whole game: cups 1 and 7 are both dark, so a dark cup is either the smallest or the
// largest cube of the row. The AI never looks at the other side's cubes: it keeps every row that fits what
// it has seen (shades and revealed numbers) and plays out the rest of the match many times per choice.

export const GR_CUPS = 7;
export const GR_SUM = 30;
export const GR_PLAYERS = 2;
export const GR_ROUNDS = 7;
/** Tied matches replay at most this many times in all; after that the match is a draw. */
export const GR_SETS_MAX = 5;
/** Cubes per number. */
export const GR_COPIES = 2;

/** Shade of a cup: 0 = dark (both ends) … 3 = white (the middle one). */
export const grTier = (pos: number) => Math.min(pos, GR_CUPS - 1 - pos);
/** How many cups of each shade a row has: dark 2, grey 2, light 2, white 1. */
export const GR_TIER_COUNT = [2, 2, 2, 1];

export type GrStyle = 'calc' | 'blitz' | 'wall' | 'trick';
export const GR_STYLES: GrStyle[] = ['calc', 'blitz', 'wall', 'trick'];
/** Four full-strength AI players; one is drawn at random for every match. They differ in rows they like and in how they break near-ties. */
export const GR_PERSONA: Record<GrStyle, { name: string; nameEn: string; color: string; tag: string; tagEn: string }> = {
  calc: { name: '노바', nameEn: 'Nova', color: '#5fd38d', tag: '계산형 · 확률이 가장 높은 수만', tagEn: 'Calculator · always the likeliest win' },
  blitz: { name: '렉스', nameEn: 'Rex', color: '#ff6b5e', tag: '공격형 · 큰 숫자로 기선 제압', tagEn: 'Aggressor · big cubes, early lead' },
  wall: { name: '미로', nameEn: 'Miro', color: '#6fb6ff', tag: '수비형 · 고르게 깔고 중반 승부', tagEn: 'Wall · an even row, wins the middle' },
  trick: { name: '쥬드', nameEn: 'Jude', color: '#c38bff', tag: '심리형 · 어두운 통으로 흔들기', tagEn: 'Trickster · bluffs with the dark cups' },
};

export type GrLog = {
  leader: number;
  tier: [number, number];
  value: [number, number];
  pos: [number | null, number | null]; // where each cup stood: only its owner (and the host) knows
  win: -1 | 0 | 1; // seat that scored, -1 = tie
};

export type Gradation = {
  gid: string;
  phase: 'place' | 'lead' | 'follow' | 'reveal' | 'finished';
  set: number; // 1, then 2, 3… after tied matches
  leader: number; // who hands in a cup first this round
  rows: (number[] | null)[]; // each row of 7 cubes (secret)
  ready: boolean[]; // row handed in
  pickPos: (number | null)[]; // cup handed in this round (secret)
  pickTier: (number | null)[]; // its shade (public)
  log: GrLog[]; // rounds of this match
  score: [number, number];
  past: [number, number][]; // final scores of earlier, tied matches
  winner: number | null; // seat, -1 = draw after GR_SETS_MAX ties, null while playing
  early: boolean; // ended before round 7 because the result could no longer change
};

export type GrAction = { kind: 'place'; row: number[] } | { kind: 'pick'; pos: number };

const gid = () => Math.random().toString(36).slice(2, 10);

export function newGradation(leader = Math.random() < 0.5 ? 0 : 1): Gradation {
  return {
    gid: gid(), phase: 'place', set: 1, leader,
    rows: [null, null], ready: [false, false], pickPos: [null, null], pickTier: [null, null],
    log: [], score: [0, 0], past: [], winner: null, early: false,
  };
}

/** Whether a row follows the rules: 7 whole numbers 0–9, never going down, each at most twice, sum ≤ 30. */
export function grValid(row: unknown): row is number[] {
  if (!Array.isArray(row) || row.length !== GR_CUPS) return false;
  const counts = Array(10).fill(0);
  let sum = 0;
  for (let i = 0; i < GR_CUPS; i++) {
    const v = row[i];
    if (!Number.isInteger(v) || v < 0 || v > 9) return false;
    if (i > 0 && v < row[i - 1]) return false;
    if (++counts[v] > GR_COPIES) return false;
    sum += v;
  }
  return sum <= GR_SUM;
}

export const grRound = (g: Gradation) => g.log.length + 1;
export const grFollower = (g: Gradation) => 1 - g.leader;
/** Cups a seat has used, by position. Only meaningful for a seat whose positions are known (its own, or on the host). */
export function grUsed(g: Gradation, seat: number): boolean[] {
  const used = Array(GR_CUPS).fill(false);
  for (const l of g.log) if (l.pos[seat] !== null) used[l.pos[seat]!] = true;
  if (g.pickPos[seat] !== null) used[g.pickPos[seat]!] = true;
  return used;
}
/** Cups of each shade a seat still has — public knowledge. */
export function grTierLeft(g: Gradation, seat: number): number[] {
  const left = [...GR_TIER_COUNT];
  for (const l of g.log) left[l.tier[seat]]--;
  if (g.pickTier[seat] !== null) left[g.pickTier[seat]!]--;
  return left;
}
/** Seats whose move it is. */
export function grWaitingOn(g: Gradation): number[] {
  if (g.phase === 'place') return [0, 1].filter((s) => !g.ready[s]);
  if (g.phase === 'lead') return [g.leader];
  if (g.phase === 'follow') return [grFollower(g)];
  return [];
}

export function applyGrAction(g: Gradation, seat: number, action: GrAction): Gradation | null {
  if (seat !== 0 && seat !== 1) return null;
  if (action.kind === 'place') {
    if (g.phase !== 'place' || g.ready[seat] || !grValid(action.row)) return null;
    const rows = g.rows.map((r, s) => (s === seat ? [...action.row] : r));
    const ready = g.ready.map((r, s) => r || s === seat);
    return { ...g, rows, ready, phase: ready.every(Boolean) ? 'lead' : 'place' };
  }
  const pos = action.pos;
  if (!Number.isInteger(pos) || pos < 0 || pos >= GR_CUPS) return null;
  const row = g.rows[seat];
  if (!row || grUsed(g, seat)[pos]) return null;
  if (g.phase === 'lead' && seat === g.leader) {
    return { ...g, phase: 'follow', pickPos: set2(g.pickPos, seat, pos), pickTier: set2(g.pickTier, seat, grTier(pos)) };
  }
  if (g.phase === 'follow' && seat === grFollower(g)) {
    const posPair: [number, number] = seat === 0 ? [pos, g.pickPos[1]!] : [g.pickPos[0]!, pos];
    const value: [number, number] = [g.rows[0]![posPair[0]], g.rows[1]![posPair[1]]];
    const win: -1 | 0 | 1 = value[0] > value[1] ? 0 : value[1] > value[0] ? 1 : -1;
    const score: [number, number] = [g.score[0] + (win === 0 ? 1 : 0), g.score[1] + (win === 1 ? 1 : 0)];
    const log: GrLog = { leader: g.leader, tier: [grTier(posPair[0]), grTier(posPair[1])], value, pos: posPair, win };
    return { ...g, phase: 'reveal', log: [...g.log, log], score, pickPos: [null, null], pickTier: [null, null], leader: win === -1 ? g.leader : win };
  }
  return null;
}

const set2 = <T,>(list: T[], seat: number, value: T) => list.map((v, s) => (s === seat ? value : v));

/** Whether the match can no longer change: one side is ahead by more than the rounds left. */
export const grDecided = (g: Gradation) => Math.abs(g.score[0] - g.score[1]) > GR_ROUNDS - g.log.length;

/** After a reveal: the next round, the end of the match, or a rematch after a tie. */
export function grNext(g: Gradation): Gradation {
  if (g.phase !== 'reveal') return g;
  const over = g.log.length >= GR_ROUNDS || grDecided(g);
  if (!over) return { ...g, phase: 'lead' };
  if (g.score[0] !== g.score[1]) return { ...g, phase: 'finished', winner: g.score[0] > g.score[1] ? 0 : 1, early: g.log.length < GR_ROUNDS };
  if (g.set >= GR_SETS_MAX) return { ...g, phase: 'finished', winner: -1 };
  // A tie: both arrange a new row and play again. The lead stays with whoever had it.
  return {
    ...g, phase: 'place', set: g.set + 1, past: [...g.past, g.score], score: [0, 0], log: [],
    rows: [null, null], ready: [false, false], pickPos: [null, null], pickTier: [null, null],
  };
}

// ── Rows ────────────────────────────────────────────────────────────────────

let allRows: number[][] | null = null;
/** Every legal row (non-decreasing, each number at most twice, sum ≤ 30). */
export function grAllRows(): number[][] {
  if (allRows) return allRows;
  const out: number[][] = [];
  const row: number[] = [];
  const walk = (from: number, sum: number) => {
    if (row.length === GR_CUPS) { out.push([...row]); return; }
    const left = GR_CUPS - row.length;
    for (let v = from; v <= 9; v++) {
      if (sum + v * left > GR_SUM) break; // the rest are at least v each
      const n = row.length >= 1 && row[row.length - 1] === v ? (row.length >= 2 && row[row.length - 2] === v ? 3 : 2) : 1;
      if (n > GR_COPIES) continue;
      row.push(v); walk(v, sum + v); row.pop();
    }
  };
  walk(0, 0);
  allRows = out;
  return out;
}
export const grSum = (row: number[]) => row.reduce((a, b) => a + b, 0);

/**
 * Strong opening rows, best first: every 30-sum row was played by the search AI against a mixed field, then the
 * best 24 round-robin against each other (scripts/gradation/selfplay.ts openings-full / roundrobin). Two low
 * "sacrifice" cubes under a strong top beat flat rows; a few flatter rows stay at the end for 미로's taste.
 * Each AI persona draws from this list with its own taste.
 */
export const GR_OPENINGS: number[][] = [
  [1, 1, 2, 2, 7, 8, 9],
  [0, 1, 1, 3, 8, 8, 9],
  [0, 0, 1, 3, 8, 9, 9],
  [0, 1, 2, 2, 8, 8, 9],
  [0, 1, 1, 3, 7, 9, 9],
  [1, 1, 2, 3, 6, 8, 9],
  [0, 0, 1, 4, 7, 9, 9],
  [0, 1, 1, 4, 7, 8, 9],
  [0, 1, 2, 2, 7, 9, 9],
  [1, 1, 2, 3, 7, 7, 9],
  [1, 1, 2, 3, 7, 8, 8],
  [0, 0, 1, 4, 8, 8, 9],
  [0, 0, 2, 3, 8, 8, 9],
  [0, 1, 2, 3, 7, 8, 9],
  [0, 0, 2, 3, 7, 9, 9],
  [1, 1, 3, 3, 6, 8, 8],
  [1, 2, 3, 3, 6, 7, 8],
  [1, 1, 3, 3, 7, 7, 8],
  [2, 2, 3, 3, 6, 6, 8],
  [1, 2, 2, 4, 6, 7, 8],
];

/** A random legal row that uses the full 30 (what a seat gets if its placing time runs out). */
export function grRandomRow(rand = Math.random): number[] {
  const full = grAllRows().filter((r) => grSum(r) === GR_SUM);
  return [...full[Math.floor(rand() * full.length)]];
}

const spread = (row: number[]) => row[GR_CUPS - 1] - row[0];
const topTwo = (row: number[]) => row[GR_CUPS - 1] + row[GR_CUPS - 2];
const zeros = (row: number[]) => row.filter((v) => v === 0).length;

/** The row an AI persona hands in: a strong opening, weighted by what this persona likes. */
export function grAiRow(style: GrStyle, rand = Math.random): number[] {
  const list = GR_OPENINGS.length ? GR_OPENINGS : [grRandomRow(rand)];
  const taste = (row: number[], rank: number) => {
    const base = Math.pow(0.86, rank); // stronger rows first
    switch (style) {
      case 'blitz': return base * Math.pow(1.35, topTwo(row) - 15);
      case 'wall': return base * Math.pow(1.4, 7 - spread(row));
      case 'trick': return base * Math.pow(1.6, zeros(row)) * Math.pow(1.12, spread(row) - 7);
      default: return base * Math.pow(0.8, rank); // the calculator stays near the very top
    }
  };
  const weights = list.map((row, i) => taste(row, i));
  return [...list[pick(weights, rand)]];
}

function pick(weights: number[], rand: () => number): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < weights.length; i++) { r -= weights[i]; if (r <= 0) return i; }
  return weights.length - 1;
}

// ── Search AI ───────────────────────────────────────────────────────────────

/** Seeded random numbers, so every choice is measured on the same imagined matches. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** How likely a player is to have built a row: full-30 rows by far, strong openings more so. */
function priorWeight(row: number[], openings: Set<string>): number {
  const s = grSum(row);
  const base = s === GR_SUM ? 1 : s === GR_SUM - 1 ? 0.12 : s === GR_SUM - 2 ? 0.03 : 0.004;
  return openings.has(row.join('')) ? base * 4 : base;
}

let openingKeys: Set<string> | null = null;
const openingSet = () => (openingKeys ??= new Set(GR_OPENINGS.map((r) => r.join(''))));

/**
 * Rows the other side could have, given the shades and numbers it has shown, with where each shown cube
 * stood. In any legal row the two cups of a shade never hold the same number, so a shown cube's place is
 * certain once the row is fixed.
 */
export function grBelief(seen: { tier: number; value: number }[]): { row: number[]; used: boolean[]; w: number }[] {
  const keys = openingSet();
  const out: { row: number[]; used: boolean[]; w: number }[] = [];
  for (const row of grAllRows()) {
    const used = Array(GR_CUPS).fill(false);
    let ok = true;
    for (const { tier, value } of seen) {
      const a = tier, b = GR_CUPS - 1 - tier;
      if (row[a] === value && !used[a]) used[a] = true;
      else if (row[b] === value && !used[b]) used[b] = true;
      else { ok = false; break; }
    }
    if (ok) out.push({ row, used, w: priorWeight(row, keys) });
  }
  return out;
}

type Side = { row: number[]; used: boolean[] };

/**
 * A quick, reasonable answer used inside the imagined matches: knowing the lead cup could be either of the
 * two cubes of its shade, take the cube that best trades the chance of winning against how valuable it is.
 */
let rankCost = 0.42;
/** Tuning knob for scripts/gradation/selfplay.ts. */
export function grTune(opts: { cost?: number }) { if (opts.cost !== undefined) rankCost = opts.cost; }

function rolloutFollow(me: Side, leadValues: number[]): number {
  const mine: number[] = [];
  for (let p = 0; p < GR_CUPS; p++) if (!me.used[p]) mine.push(p);
  let best = mine[0], bestScore = -Infinity;
  const n = mine.length;
  for (let i = 0; i < n; i++) {
    const x = me.row[mine[i]];
    let imm = 0;
    for (const l of leadValues) imm += x > l ? 1 : x === l ? 0.5 : 0;
    imm /= leadValues.length;
    const cost = n > 1 ? rankCost * (i / (n - 1)) : 0; // positions are sorted, so i is the cube's rank
    const score = imm > 0 ? imm - cost : -cost - 0.5;
    if (score > bestScore + 1e-9) { bestScore = score; best = mine[i]; }
  }
  return best;
}

/** Candidates the follower fears for a lead cup at `pos`: both unused cubes of that shade. */
function shadeValues(side: Side, pos: number): number[] {
  const t = grTier(pos);
  const a = t, b = GR_CUPS - 1 - t;
  const vals: number[] = [];
  if (a === b) return [side.row[a]];
  if (!side.used[a] || a === pos) vals.push(side.row[a]);
  if (!side.used[b] || b === pos) vals.push(side.row[b]);
  return vals;
}

function randomUnused(side: Side, rand: () => number): number {
  const free: number[] = [];
  for (let p = 0; p < GR_CUPS; p++) if (!side.used[p]) free.push(p);
  return free[Math.floor(rand() * free.length)];
}

/** Plays the rest of the match out; returns 1 if side 0 wins, 0 if it loses, 0.5 on a tie. */
function rollout(sides: [Side, Side], score: [number, number], leader: number, roundsLeft: number, rand: () => number): number {
  const s0 = sides[0], s1 = sides[1];
  let a = score[0], b = score[1], lead = leader;
  for (let r = 0; r < roundsLeft; r++) {
    const L = lead === 0 ? s0 : s1, F = lead === 0 ? s1 : s0;
    const lp = randomUnused(L, rand);
    L.used[lp] = true;
    const fp = rolloutFollow(F, shadeValues(L, lp));
    F.used[fp] = true;
    const lv = L.row[lp], fv = F.row[fp];
    if (lv !== fv) {
      const w = lv > fv ? lead : 1 - lead;
      if (w === 0) a++; else b++;
      lead = w;
    }
  }
  return a > b ? 1 : a < b ? 0 : 0.5;
}

/** Imagined matches per choice. */
const SAMPLES = 420;

/**
 * The AI's cup for this round: every free cup is tried against hundreds of rows the other side could have
 * (weighted by how likely each is), playing the rest of the match out each time. The persona only matters
 * between cups that score within a hair of the best.
 */
export function grAiPick(g: Gradation, seat: number, style: GrStyle, seed = Math.floor(Math.random() * 2 ** 31), samples = SAMPLES): number {
  const row = g.rows[seat]!;
  const myUsed = grUsed(g, seat);
  const free = Array.from({ length: GR_CUPS }, (_, p) => p).filter((p) => !myUsed[p]);
  if (free.length === 1) return free[0];
  const opp = 1 - seat;
  const seen = g.log.map((l) => ({ tier: l.tier[opp], value: l.value[opp] }));
  const belief = grBelief(seen);
  const leading = g.phase === 'lead';
  const oppTier = leading ? null : g.pickTier[opp];
  // The other side's cup this round must be a free cup of the shade it showed.
  const worlds = oppTier === null ? belief : belief.filter((h) => !h.used[oppTier] || !h.used[GR_CUPS - 1 - oppTier]);
  if (!worlds.length) return free[0];
  const rand = mulberry32(seed);
  const weights = worlds.map((h) => h.w);
  const total = weights.reduce((x, y) => x + y, 0);
  const cum: number[] = [];
  let acc = 0;
  for (const w of weights) { acc += w; cum.push(acc); }
  const draw = () => { const r = rand() * total; let lo = 0, hi = cum.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (cum[m] < r) lo = m + 1; else hi = m; } return worlds[lo]; };

  const scores = new Map<number, number>(free.map((p) => [p, 0]));
  const roundsLeft = GR_ROUNDS - g.log.length;
  const myScore = g.score[seat], oppScore = g.score[opp];
  for (let k = 0; k < samples; k++) {
    const world = draw();
    // Where the other side's cup this round stood, if it already handed one in: one of the free cups of that shade.
    let oppPos = -1;
    if (oppTier !== null) {
      const a = oppTier, b = GR_CUPS - 1 - oppTier;
      const opts = [a, b].filter((p, i, arr) => arr.indexOf(p) === i && !world.used[p]);
      oppPos = opts[Math.floor(rand() * opts.length)];
    }
    const subSeed = Math.floor(rand() * 2 ** 31);
    for (const p of free) {
      const r2 = mulberry32(subSeed);
      const me: Side = { row, used: [...myUsed] };
      const them: Side = { row: world.row, used: [...world.used] };
      let ms = myScore, os = oppScore, lead = g.leader === seat ? 0 : 1; // 0 = me
      me.used[p] = true;
      let ov: number;
      if (leading) {
        const fp = rolloutFollow(them, shadeValues(me, p));
        them.used[fp] = true;
        ov = them.row[fp];
      } else {
        them.used[oppPos] = true;
        ov = them.row[oppPos];
      }
      const mv = row[p];
      if (mv > ov) { ms++; lead = 0; } else if (ov > mv) { os++; lead = 1; }
      scores.set(p, scores.get(p)! + rollout([me, them], [ms, os], lead, roundsLeft - 1, r2));
    }
  }
  const best = Math.max(...scores.values());
  const near = free.filter((p) => scores.get(p)! >= best - samples * 0.012);
  if (near.length === 1 || style === 'calc') return free.reduce((x, y) => (scores.get(y)! > scores.get(x)! ? y : x));
  // Between near-equal cups the persona shows: Rex reaches for the bigger cube, Miro for the middle shades,
  // Jude for the dark ones (a dark cup could be either end of the row).
  const taste = (p: number) => style === 'blitz' ? row[p] : style === 'wall' ? grTier(p) : -grTier(p);
  return near.reduce((x, y) => (taste(y) > taste(x) ? y : x));
}

/** The AI's move for a seat (placing its row, or handing in a cup). */
export function chooseGrAction(g: Gradation, seat: number, style: GrStyle): GrAction {
  if (g.phase === 'place') return { kind: 'place', row: grAiRow(style) };
  return { kind: 'pick', pos: grAiPick(g, seat, style) };
}

/** What a seat does when its placing time runs out: a random full row. */
export const grTimeoutRow = () => grRandomRow();

// ── What each side may see ──────────────────────────────────────────────────

/** Public state: no rows, no positions. */
export function redactGradation(g: Gradation): Gradation {
  return {
    ...g,
    rows: g.phase === 'finished' ? g.rows : [null, null],
    pickPos: [null, null],
    log: g.log.map((l) => ({ ...l, pos: g.phase === 'finished' ? l.pos : [null, null] })),
  };
}

export const gradationSecret = (g: Gradation, seat: number) => ({ row: g.rows[seat], pick: g.pickPos[seat], pos: g.log.map((l) => l.pos[seat]) });

export function withGradationSecret(g: Gradation, secret: unknown, seat: number): Gradation {
  if (!secret || typeof secret !== 'object' || (seat !== 0 && seat !== 1)) return g;
  const s = secret as { row?: unknown; pick?: unknown; pos?: unknown };
  const row = grValid(s.row) ? s.row : g.rows[seat];
  const pos = Array.isArray(s.pos) ? (s.pos as (number | null)[]) : [];
  return {
    ...g,
    rows: g.rows.map((r, i) => (i === seat ? row : r)),
    pickPos: g.pickPos.map((p, i) => (i === seat && typeof s.pick === 'number' ? s.pick : p)),
    log: g.log.map((l, k) => (typeof pos[k] === 'number' ? { ...l, pos: (seat === 0 ? [pos[k], l.pos[1]] : [l.pos[0], pos[k]]) as [number | null, number | null] } : l)),
  };
}

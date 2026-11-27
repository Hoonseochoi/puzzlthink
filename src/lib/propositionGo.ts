// 명제 바둑 (Proposition Go), a PUZZLTHINK ORIGINAL: put 4–5 coloured stones on a 4×4 board so that every
// proposition on the table is true. Exactly one placement works. The 거짓말 (lie) tier adds one false proposition:
// exactly one placement makes every proposition but one true, and the one it breaks is the liar.
//
// Everything here is deterministic from (tier, seed): the browser builds practice puzzles with it and
// scripts/proposition-go/pool.ts builds the server's pool (statements, the paid hint and the answer) with it.
// Cells are row * 4 + col, row 0 at the top. A placement is one cell per stone, packed 4 bits per stone.

export const SIZE = 4;
export const CELLS = 16;

/** The stones, in the order a puzzle lists them. Colour names are what the propositions say. */
export const STONES = [
  { id: 'red', ko: '빨강', en: 'Red', hi: '#ffb3ba', mid: '#ff4d5e', lo: '#a3122a', eye: '#2a0509' },
  { id: 'blue', ko: '파랑', en: 'Blue', hi: '#b8d6ff', mid: '#3f8cff', lo: '#123c9c', eye: '#04122e' },
  { id: 'green', ko: '초록', en: 'Green', hi: '#bff5cd', mid: '#34c463', lo: '#0f6a32', eye: '#03200e' },
  { id: 'yellow', ko: '노랑', en: 'Yellow', hi: '#fff2bf', mid: '#ffc23d', lo: '#b07a07', eye: '#2a1d00' },
  { id: 'purple', ko: '보라', en: 'Purple', hi: '#e6d4ff', mid: '#a874ff', lo: '#4d1fa3', eye: '#14052e' },
] as const;
export type StoneIx = 0 | 1 | 2 | 3 | 4;

export type RegionId = 'r0' | 'r1' | 'r2' | 'r3' | 'c0' | 'c1' | 'c2' | 'c3' | 'corner' | 'edge' | 'center' | 'top' | 'bottom' | 'left' | 'right';
export const REGIONS: RegionId[] = ['r0', 'r1', 'r2', 'r3', 'c0', 'c1', 'c2', 'c3', 'corner', 'edge', 'center', 'top', 'bottom', 'left', 'right'];

const rowOf = (c: number) => c >> 2;
const colOf = (c: number) => c & 3;
function regionMask(r: RegionId): number {
  let m = 0;
  for (let c = 0; c < CELLS; c++) {
    const y = rowOf(c), x = colOf(c);
    const inside = r[0] === 'r' && r.length === 2 ? y === Number(r[1])
      : r[0] === 'c' && r.length === 2 ? x === Number(r[1])
        : r === 'corner' ? (y === 0 || y === 3) && (x === 0 || x === 3)
          : r === 'edge' ? y === 0 || y === 3 || x === 0 || x === 3
            : r === 'center' ? y >= 1 && y <= 2 && x >= 1 && x <= 2
              : r === 'top' ? y <= 1 : r === 'bottom' ? y >= 2 : r === 'left' ? x <= 1 : x >= 2;
    if (inside) m |= 1 << c;
  }
  return m;
}
export const REGION_MASK: Record<RegionId, number> = Object.fromEntries(REGIONS.map((r) => [r, regionMask(r)])) as Record<RegionId, number>;

/**
 * The proposition grammar. a/b/s are stone indexes into the puzzle's stones; `d` is 'row' (가로줄) or 'col' (세로줄).
 * in / out: s is (not) in region r · adj / nadj: a and b (do not) touch side by side · line / nline: a and b share
 * (do not share) a row or column · above / left: a is higher than / left of b (strictly) · next: b sits right below /
 * right beside a · diag: a and b touch corner to corner · count: region r holds
 * exactly n stones · with: exactly n other stones share s's row or column · if: when a is in ra, b is (not) in rb.
 */
export type Prop =
  | { t: 'in' | 'out'; s: number; r: RegionId }
  | { t: 'adj' | 'nadj'; a: number; b: number }
  | { t: 'line' | 'nline'; a: number; b: number; d: 'row' | 'col' }
  | { t: 'above' | 'left'; a: number; b: number }
  | { t: 'next'; a: number; b: number; d: 'down' | 'right' }
  | { t: 'diag'; a: number; b: number }
  | { t: 'count'; r: RegionId; n: number }
  | { t: 'with'; s: number; d: 'row' | 'col'; n: number }
  | { t: 'if'; a: number; ra: RegionId; b: number; rb: RegionId; neg: boolean };
export type PropType = Prop['t'];

/** The stones a proposition talks about (null = it counts every stone). */
export function propStones(p: Prop): number[] | null {
  switch (p.t) {
    case 'in': case 'out': return [p.s];
    case 'count': case 'with': return null;
    default: return [p.a, p.b];
  }
}

const adjacent = (x: number, y: number) => {
  const dy = Math.abs(rowOf(x) - rowOf(y)), dx = Math.abs(colOf(x) - colOf(y));
  return dx + dy === 1;
};
const sameLine = (x: number, y: number, d: 'row' | 'col') => (d === 'row' ? rowOf(x) === rowOf(y) : colOf(x) === colOf(y));

/** Truth of p for a full placement (cells[i] = cell of stone i). */
export function evalProp(p: Prop, cells: ArrayLike<number>): boolean {
  switch (p.t) {
    case 'in': return ((REGION_MASK[p.r] >> cells[p.s]) & 1) === 1;
    case 'out': return ((REGION_MASK[p.r] >> cells[p.s]) & 1) === 0;
    case 'adj': return adjacent(cells[p.a], cells[p.b]);
    case 'nadj': return !adjacent(cells[p.a], cells[p.b]);
    case 'line': return sameLine(cells[p.a], cells[p.b], p.d);
    case 'nline': return !sameLine(cells[p.a], cells[p.b], p.d);
    case 'above': return rowOf(cells[p.a]) < rowOf(cells[p.b]);
    case 'left': return colOf(cells[p.a]) < colOf(cells[p.b]);
    case 'next': return p.d === 'down' ? cells[p.b] === cells[p.a] + 4 : colOf(cells[p.a]) < 3 && cells[p.b] === cells[p.a] + 1;
    case 'diag': return Math.abs(rowOf(cells[p.a]) - rowOf(cells[p.b])) === 1 && Math.abs(colOf(cells[p.a]) - colOf(cells[p.b])) === 1;
    case 'count': {
      let n = 0;
      for (let i = 0; i < cells.length; i++) if ((REGION_MASK[p.r] >> cells[i]) & 1) n++;
      return n === p.n;
    }
    case 'with': {
      let n = 0;
      for (let i = 0; i < cells.length; i++) if (i !== p.s && sameLine(cells[i], cells[p.s], p.d)) n++;
      return n === p.n;
    }
    case 'if': return ((REGION_MASK[p.ra] >> cells[p.a]) & 1) === 0 || (((REGION_MASK[p.rb] >> cells[p.b]) & 1) === 1) !== p.neg;
  }
}

export type Truth = 'true' | 'false' | 'open';
/**
 * What a card shows while the board is being filled (cells[i] = -1 for a stone still in the tray). A card about
 * named stones lights up once those stones are down; a counting card decides as soon as the placed stones settle it.
 */
export function liveTruth(p: Prop, cells: ArrayLike<number>): Truth {
  const placed: number[] = [];
  let free = 0;
  for (let i = 0; i < cells.length; i++) if (cells[i] >= 0) placed.push(i); else free++;
  const named = propStones(p);
  if (named) return named.every((i) => cells[i] >= 0) ? (evalProp(p, cells) ? 'true' : 'false') : 'open';
  if (p.t === 'count') {
    let n = 0;
    for (const i of placed) if ((REGION_MASK[p.r] >> cells[i]) & 1) n++;
    if (n > p.n || n + free < p.n) return 'false';
    return free === 0 ? 'true' : 'open';
  }
  // with: needs its own stone down; more than n already alongside it is false at once.
  if (p.t !== 'with' || cells[p.s] < 0) return 'open';
  let n = 0;
  for (const i of placed) if (i !== p.s && sameLine(cells[i], cells[p.s], p.d)) n++;
  if (n > p.n || n + free < p.n) return 'false';
  return free === 0 ? 'true' : 'open';
}

// ─── Tiers ────────────────────────────────────────────────────────────────────────────────────────────────────────

export type Tier = 1 | 2 | 3;
/** 1 기본 (4 stones) · 2 심화 (5 stones) · 3 거짓말 (5 stones, one lie). */
export const TIER_SPEC: Record<Tier, { stones: number; min: number; max: number; lie: boolean }> = {
  1: { stones: 4, min: 4, max: 6, lie: false },
  2: { stones: 5, min: 5, max: 7, lie: false },
  3: { stones: 5, min: 6, max: 8, lie: true },
};

export type Puzzle = {
  tier: Tier;
  seed: number;
  /** Stone indexes into STONES, in tray order. */
  stones: number[];
  props: Prop[];
  /** The answer: cells[i] for stone i. */
  answer: number[];
  /** 거짓말 tier: index of the lying proposition in props. */
  lie: number | null;
  /** The extra true proposition a 피스 hint reveals. */
  hint: Prop;
  grade: Grade;
};
/** What the server sends to a player: no answer, no lie, no hint. */
export type PublicPuzzle = { tier: Tier; stones: number[]; props: Prop[] };
export const publicPart = (p: Puzzle): PublicPuzzle => ({ tier: p.tier, stones: p.stones, props: p.props });

// ─── Random numbers ───────────────────────────────────────────────────────────────────────────────────────────────

export function rng(seed: number) {
  let s = seed >>> 0 || 0x9e3779b9;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
type Rand = ReturnType<typeof rng>;
const pickOne = <T>(r: Rand, xs: readonly T[]) => xs[Math.floor(r() * xs.length)];
function shuffle<T>(r: Rand, xs: T[]) {
  for (let i = xs.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [xs[i], xs[j]] = [xs[j], xs[i]];
  }
  return xs;
}

// ─── Placements ───────────────────────────────────────────────────────────────────────────────────────────────────

const allCache = new Map<number, Int32Array>();
/** Every placement of n distinct stones on the 16 cells (43 680 for 4, 524 160 for 5), packed. */
export function allPlacements(n: number): Int32Array {
  const hit = allCache.get(n);
  if (hit) return hit;
  let count = 1;
  for (let i = 0; i < n; i++) count *= CELLS - i;
  const out = new Int32Array(count);
  let k = 0;
  const rec = (i: number, used: number, packed: number) => {
    if (i === n) { out[k++] = packed; return; }
    for (let c = 0; c < CELLS; c++) if (!((used >> c) & 1)) rec(i + 1, used | (1 << c), packed | (c << (4 * i)));
  };
  rec(0, 0, 0);
  allCache.set(n, out);
  return out;
}
export const unpack = (packed: number, n: number) => Array.from({ length: n }, (_, i) => (packed >> (4 * i)) & 15);
const pack = (cells: number[]) => cells.reduce((a, c, i) => a | (c << (4 * i)), 0);

/** A packed evaluator for p (avoids unpacking 500k placements). */
function packedEval(p: Prop, n: number): (x: number) => boolean {
  const cell = (x: number, i: number) => (x >> (4 * i)) & 15;
  switch (p.t) {
    case 'in': { const m = REGION_MASK[p.r]; return (x) => ((m >> cell(x, p.s)) & 1) === 1; }
    case 'out': { const m = REGION_MASK[p.r]; return (x) => ((m >> cell(x, p.s)) & 1) === 0; }
    case 'adj': return (x) => adjacent(cell(x, p.a), cell(x, p.b));
    case 'nadj': return (x) => !adjacent(cell(x, p.a), cell(x, p.b));
    case 'line': return (x) => sameLine(cell(x, p.a), cell(x, p.b), p.d);
    case 'nline': return (x) => !sameLine(cell(x, p.a), cell(x, p.b), p.d);
    case 'above': return (x) => rowOf(cell(x, p.a)) < rowOf(cell(x, p.b));
    case 'left': return (x) => colOf(cell(x, p.a)) < colOf(cell(x, p.b));
    case 'next': case 'diag': {
      const buf = [0, 0, 0, 0, 0];
      return (x) => { buf[p.a] = cell(x, p.a); buf[p.b] = cell(x, p.b); return evalProp(p, buf); };
    }
    default: {
      const buf = new Array<number>(n);
      return (x) => { for (let i = 0; i < n; i++) buf[i] = cell(x, i); return evalProp(p, buf); };
    }
  }
}
function filterBy(set: Int32Array, p: Prop, n: number, want = true): Int32Array {
  const f = packedEval(p, n);
  const out = new Int32Array(set.length);
  let k = 0;
  for (let i = 0; i < set.length; i++) if (f(set[i]) === want) out[k++] = set[i];
  return out.slice(0, k);
}
/** Placements satisfying every proposition in ps. */
export function solutions(ps: Prop[], n: number, from?: Int32Array): Int32Array {
  let set = from ?? allPlacements(n);
  // Cheap, sharp propositions first.
  const order = [...ps].sort((x, y) => cost(x) - cost(y));
  for (const p of order) { set = filterBy(set, p, n); if (!set.length) break; }
  return set;
}
const cost = (p: Prop) => (p.t === 'in' || p.t === 'out' ? 0 : p.t === 'count' || p.t === 'with' || p.t === 'if' ? 2 : 1);

/** Placements where exactly one proposition is false (the 거짓말 tier's candidates), with the index of the false one. */
export function oneLieSolutions(ps: Prop[], n: number): { packed: number; lie: number }[] {
  const all = allPlacements(n);
  const fs = ps.map((p) => packedEval(p, n));
  const out: { packed: number; lie: number }[] = [];
  for (let i = 0; i < all.length; i++) {
    let lie = -1, bad = 0;
    for (let k = 0; k < fs.length; k++) {
      if (!fs[k](all[i])) { bad++; lie = k; if (bad > 1) break; }
    }
    if (bad === 1) out.push({ packed: all[i], lie });
  }
  return out;
}

// ─── Human-style grading ──────────────────────────────────────────────────────────────────────────────────────────
// Domains: a 16-bit mask of the cells each stone can still be in. A step applies one proposition (or "two stones
// cannot share a cell") and strikes out every cell that has no support left. Level 1 = propositions one at a time
// (what a person does reading a card against the board); level 2 = level 1 plus "if this stone were here, a card
// would break" on one cell at a time (a single what-if); anything that needs more is rejected.

export type Grade = { level: 1 | 2 | 3; steps: number; trials: number };
const popcount = (m: number) => { let n = 0; while (m) { m &= m - 1; n++; } return n; };
const cellsOf = (m: number) => { const out: number[] = []; for (let c = 0; c < CELLS; c++) if ((m >> c) & 1) out.push(c); return out; };
const ENUM_LIMIT = 6000;

/** Strikes out unsupported cells for one proposition. Returns the new domains or null if a stone has none left. */
function reviseProp(p: Prop, dom: number[]): number[] | null {
  const n = dom.length;
  const named = propStones(p);
  const vars = named ?? Array.from({ length: n }, (_, i) => i);
  let product = 1;
  for (const v of vars) product *= popcount(dom[v]);
  if (product > ENUM_LIMIT) return dom; // too many cases to hold in one's head: skip this card for now
  const support = vars.map(() => 0);
  const cells = new Array<number>(n).fill(0);
  // Stones a counting card does not name still occupy cells; enumerate all of them (vars = every stone).
  const lists = vars.map((v) => cellsOf(dom[v]));
  const rec = (k: number, used: number) => {
    if (k === vars.length) {
      if (evalProp(p, cells)) for (let j = 0; j < vars.length; j++) support[j] |= 1 << cells[vars[j]];
      return;
    }
    for (const c of lists[k]) {
      if ((used >> c) & 1) continue;
      cells[vars[k]] = c;
      rec(k + 1, used | (1 << c));
    }
  };
  if (named) {
    // evalProp only reads the named stones' cells.
    rec(0, 0);
  } else rec(0, 0);
  const next = dom.slice();
  for (let j = 0; j < vars.length; j++) {
    next[vars[j]] &= support[j];
    if (!next[vars[j]]) return null;
  }
  return next;
}
/** Two stones cannot share a cell: a stone pinned to one cell takes it away from the rest. */
function reviseDistinct(dom: number[]): number[] | null {
  const next = dom.slice();
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < next.length; i++) {
      if (popcount(next[i]) !== 1) continue;
      for (let j = 0; j < next.length; j++) {
        if (j === i || !(next[j] & next[i])) continue;
        next[j] &= ~next[i];
        if (!next[j]) return null;
        changed = true;
      }
    }
  }
  return next;
}
/** Level 1 closure. Returns final domains (null = contradiction) and how many card readings changed something. */
function propagate(ps: Prop[], start: number[]): { dom: number[] | null; steps: number } {
  let dom: number[] | null = start.slice();
  let steps = 0;
  for (let guard = 0; guard < 200; guard++) {
    let changed = false;
    for (const p of ps) {
      const next = reviseProp(p, dom!);
      if (!next) return { dom: null, steps: steps + 1 };
      const d2 = reviseDistinct(next);
      if (!d2) return { dom: null, steps: steps + 1 };
      if (d2.some((m, i) => m !== dom![i])) { steps++; changed = true; dom = d2; }
    }
    if (!changed) break;
  }
  return { dom, steps };
}
const solvedDom = (dom: number[]) => dom.every((m) => popcount(m) === 1);
const fullDom = (n: number) => new Array<number>(n).fill(0xffff);

/**
 * What is still open after reading every card once over, as bits (sum of log2 of each stone's possible points), with the
 * card readings that took. 0 bits = solved by reading alone. Used to measure how much a hint helps.
 */
export function openBits(ps: Prop[], n: number): { bits: number; steps: number } | null {
  const { dom, steps } = propagate(ps, fullDom(n));
  return dom ? { bits: dom.reduce((a, m) => a + Math.log2(popcount(m)), 0), steps } : null;
}

/** How a person would get through ps (null when level 2 is not enough). */
export function grade(ps: Prop[], n: number, start = fullDom(n)): Grade | null {
  let { dom, steps } = propagate(ps, start);
  if (!dom) return null;
  if (solvedDom(dom)) return { level: 1, steps, trials: 0 };
  let trials = 0;
  for (let round = 0; round < 12; round++) {
    let progress = false;
    for (let i = 0; i < n && !progress; i++) {
      if (popcount(dom![i]) === 1) continue;
      for (const c of cellsOf(dom![i])) {
        const tryDom = dom!.slice();
        tryDom[i] = 1 << c;
        const out = propagate(ps, tryDom);
        if (out.dom === null) {
          trials++;
          dom![i] &= ~(1 << c);
          const back = propagate(ps, dom!);
          if (!back.dom) return null;
          steps += back.steps + 1;
          dom = back.dom;
          progress = true;
          break;
        }
      }
    }
    if (solvedDom(dom!)) return { level: 2, steps, trials };
    if (!progress) break;
  }
  return { level: 3, steps, trials };
}

// ─── Candidate propositions ───────────────────────────────────────────────────────────────────────────────────────

const LINE_REGIONS: RegionId[] = ['r0', 'r1', 'r2', 'r3', 'c0', 'c1', 'c2', 'c3'];
const AREA_REGIONS: RegionId[] = ['corner', 'edge', 'center', 'top', 'bottom', 'left', 'right'];
const COND_REGIONS: RegionId[] = ['r0', 'r1', 'r2', 'r3', 'c0', 'c1', 'c2', 'c3', 'corner', 'center'];

/** Every proposition of the grammar over n stones (deduplicated by meaning where it is cheap to see). */
function allProps(n: number): Prop[] {
  const out: Prop[] = [];
  for (let s = 0; s < n; s++) {
    for (const r of [...LINE_REGIONS, ...AREA_REGIONS]) {
      out.push({ t: 'in', s, r });
      if (r !== 'top' && r !== 'bottom' && r !== 'left' && r !== 'right' && r !== 'edge') out.push({ t: 'out', s, r });
    }
    for (const d of ['row', 'col'] as const) for (let k = 0; k <= 2; k++) out.push({ t: 'with', s, d, n: k });
  }
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) {
    if (a === b) continue;
    if (a < b) {
      out.push({ t: 'adj', a, b }, { t: 'nadj', a, b });
      for (const d of ['row', 'col'] as const) out.push({ t: 'line', a, b, d }, { t: 'nline', a, b, d });
    }
    out.push({ t: 'above', a, b }, { t: 'left', a, b }, { t: 'next', a, b, d: 'down' }, { t: 'next', a, b, d: 'right' });
    if (a < b) out.push({ t: 'diag', a, b });
    for (const ra of COND_REGIONS) for (const rb of COND_REGIONS) for (const neg of [false, true]) out.push({ t: 'if', a, ra, b, rb, neg });
  }
  for (const r of ['r0', 'r1', 'r2', 'r3', 'c0', 'c1', 'c2', 'c3', 'corner', 'center', 'top', 'left'] as RegionId[]) {
    for (let k = 0; k <= Math.min(3, n); k++) out.push({ t: 'count', r, n: k });
  }
  return out;
}

/** How likely the generator is to reach for each kind (variety without walls of "X is in row Y"). */
const TYPE_WEIGHT: Record<PropType, number> = { in: 3, out: 2, adj: 2.5, nadj: 2, line: 2.5, nline: 1.2, above: 3, left: 3, next: 1.4, diag: 1.4, count: 2.2, with: 1.6, if: 1.6 };

/** At most this many cards of one kind in a puzzle. */
const TYPE_CAP: Partial<Record<PropType, number>> = { next: 2, diag: 2, count: 2, with: 1, if: 1, nline: 1, out: 2 };
/**
 * 심화 and 거짓말 lean on the cards that make a person think (a conditional, a "not", a count) and away from the ones
 * that glue two stones together at once (바로 아래 / 대각선): fewer of those, more of these.
 */
const HARD_BOOST: Partial<Record<PropType, number>> = { if: 2.6, nadj: 1.8, out: 1.8, count: 1.4, with: 1.6, nline: 1.4, next: 0.5, diag: 0.7, in: 0.7 };
const HARD_CAP: Partial<Record<PropType, number>> = { next: 1, diag: 1, if: 2, count: 2, with: 1, nline: 1, out: 2 };
/** Kinds that only narrow things down through reasoning; the harder tiers need at least two of them doing work. */
const SOFT = new Set<PropType>(['if', 'out', 'nadj', 'nline', 'count', 'with']);
const softCount = (ps: Prop[]) => ps.filter((p) => SOFT.has(p.t)).length;

const key = (p: Prop) => JSON.stringify(p);

/** Picks a kind first (so the 2 000 "if" cards do not drown the 30 "above" cards), then one unused card of it. */
function pickProp(r: Rand, byType: Map<PropType, Prop[]>, used: Set<string>, typeCount: Partial<Record<PropType, number>>, hard = false): Prop | null {
  const cap = hard ? HARD_CAP : TYPE_CAP;
  const types = [...byType.keys()].filter((t) => (typeCount[t] ?? 0) < (cap[t] ?? 3) && byType.get(t)!.some((p) => !used.has(key(p))));
  if (!types.length) return null;
  const ws = types.map((t) => (TYPE_WEIGHT[t] / (1 + (typeCount[t] ?? 0) * 1.6)) * (hard ? HARD_BOOST[t] ?? 1 : 1));
  let x = r() * ws.reduce((a, b) => a + b, 0);
  let t = types[types.length - 1];
  for (let i = 0; i < types.length; i++) { x -= ws[i]; if (x <= 0) { t = types[i]; break; } }
  const left = byType.get(t)!.filter((p) => !used.has(key(p)));
  return pickOne(r, left);
}
const groupByType = (ps: Prop[]) => {
  const m = new Map<PropType, Prop[]>();
  for (const p of ps) { const l = m.get(p.t); if (l) l.push(p); else m.set(p.t, [p]); }
  return m;
};

/** A stone pinned to one cell by in/out cards alone: too easy a read. */
function unaryPinned(ps: Prop[], n: number) {
  const dom = fullDom(n);
  for (const p of ps) {
    if (p.t === 'in') dom[p.s] &= REGION_MASK[p.r];
    else if (p.t === 'out') dom[p.s] &= ~REGION_MASK[p.r] & 0xffff;
  }
  return dom.filter((m) => popcount(m) <= 1).length;
}

/** Drops propositions the answer does not need (keeps the order of the rest). */
function prune(r: Rand, ps: Prop[], ok: (qs: Prop[]) => boolean): Prop[] {
  const order = shuffle(r, ps.map((_, k) => k));
  const keep = new Set(order);
  for (const k of order) {
    keep.delete(k);
    if (!ok(ps.filter((_, j) => keep.has(j)))) keep.add(k);
  }
  return ps.filter((_, j) => keep.has(j));
}

const SAMPLE = 10;
const FLAVOUR = new Set<PropType>(['if', 'with', 'nadj', 'out']);
type Built = { props: Prop[]; lie: number | null; grade: Grade };

/** A plain puzzle: true propositions with exactly one common placement. */
function buildPlain(r: Rand, tier: Tier, cells: number[], pool: Prop[]): Built | null {
  const { stones: n, min, max } = TIER_SPEC[tier];
  const truths = groupByType(pool.filter((p) => evalProp(p, cells)));
  const total = allPlacements(n).length;
  const chosen: Prop[] = [];
  const used = new Set<string>();
  const typeCount: Partial<Record<PropType, number>> = {};
  let set = allPlacements(n);
  for (let guard = 0; guard < 60 && set.length > 1; guard++) {
    // Of a few random cards, keep the sharpest that is not too sharp: short puzzles, no single card doing it all.
    let best: { p: Prop; next: Int32Array } | null = null;
    for (let k = 0; k < SAMPLE; k++) {
      const p = pickProp(r, truths, used, typeCount, tier > 1);
      if (!p) break;
      const next = filterBy(set, p, n);
      if (next.length > set.length * 0.9) { used.add(key(p)); continue; }
      if (set.length === total && next.length < total * 0.15) { used.add(key(p)); continue; }
      if (!best || next.length < best.next.length) best = { p, next };
      // Softer kinds (a conditional, "alone in its row", "not touching") rarely win on sharpness: let them in now and then.
      if (FLAVOUR.has(p.t) && next.length < set.length * 0.7 && r() < 0.6) { best = { p, next }; break; }
      if (r() < 0.15) break;
    }
    if (!best) continue;
    used.add(key(best.p));
    chosen.push(best.p);
    typeCount[best.p.t] = (typeCount[best.p.t] ?? 0) + 1;
    set = best.next;
  }
  if (set.length !== 1) return null;
  const unique = (qs: Prop[]) => solutions(qs, n).length === 1;
  const props = prune(r, chosen, unique);
  if (props.length < min || props.length > max) return null;
  if (new Set(props.map((p) => p.t)).size < Math.min(3, props.length)) return null;
  if (unaryPinned(props, n) > (tier === 1 ? 1 : 0)) return null;
  const g = grade(props, n);
  if (!g) return null;
  // 기본: one card at a time solves it, but not in a couple of glances. 심화: needs a what-if, or a long chain of readings,
  // and at least two of the reasoning kinds.
  if (tier === 1 && !(g.level === 1 && g.steps >= 6 && g.steps <= 16)) return null;
  if (tier === 2 && !(g.level <= 2 && (g.level === 2 || g.steps >= 16) && softCount(props) >= 2)) return null;
  return { props: shuffle(r, props), lie: null, grade: g };
}

/** "X" against "not X": a clash anyone sees at once, so the liar would be found by reading, not reasoning. */
function negationPair(p: Prop, q: Prop) {
  const flip: Partial<Record<PropType, PropType>> = { in: 'out', out: 'in', adj: 'nadj', nadj: 'adj', line: 'nline', nline: 'line' };
  if (flip[p.t] !== q.t) return false;
  const strip = (x: Prop) => JSON.stringify({ ...x, t: 0 });
  return strip(p) === strip(q);
}

/** Two propositions that cannot both be true (with stones on different cells), judged on just their own stones. */
function clash(p: Prop, q: Prop, n: number): boolean {
  const vars = [...new Set([...(propStones(p) ?? [...Array(n).keys()]), ...(propStones(q) ?? [...Array(n).keys()])])];
  if (vars.length > 3) return false;
  const cells = new Array<number>(n).fill(0);
  const rec = (k: number, used: number): boolean => {
    if (k === vars.length) return evalProp(p, cells) && evalProp(q, cells);
    for (let c = 0; c < CELLS; c++) {
      if ((used >> c) & 1) continue;
      cells[vars[k]] = c;
      if (rec(k + 1, used | (1 << c))) return true;
    }
    return false;
  };
  return !rec(0, 0);
}

/**
 * 거짓말: a lie L (false for the answer) that clashes with a true card J, so a solver can see one of the two must be the
 * liar. The other truths T are picked so that T + J has exactly one placement (the answer) and T + L has none:
 * then exactly one placement makes all but one card true, and that card is L.
 */
function buildLie(r: Rand, tier: Tier, cells: number[], pool: Prop[]): Built | null {
  const { stones: n, min, max } = TIER_SPEC[tier];
  const truthList = pool.filter((p) => evalProp(p, cells));
  const truths = groupByType(truthList);
  const falses = pool.filter((p) => !evalProp(p, cells) && p.t !== 'if' && p.t !== 'nline' && p.t !== 'with');
  let J: Prop | null = null, L: Prop | null = null;
  for (let tries = 0; tries < 60 && !J; tries++) {
    const l = pickOne(r, falses);
    const partners = truthList.filter((t) => t.t !== 'if' && (() => {
      const ls = propStones(l), ts = propStones(t);
      return ls && ts && ls.some((s) => ts.includes(s)) && !negationPair(l, t) && clash(l, t, n);
    })());
    if (!partners.length) continue;
    L = l; J = pickOne(r, partners);
  }
  if (!J || !L) return null;
  const chosen: Prop[] = [];
  const used = new Set<string>([key(J)]);
  const typeCount: Partial<Record<PropType, number>> = { [J.t]: 1, [L.t]: 1 };
  let withJ = filterBy(allPlacements(n), J, n);
  let withL = filterBy(allPlacements(n), L, n);
  for (let guard = 0; guard < 60 && (withJ.length > 1 || withL.length > 0); guard++) {
    let best: { p: Prop; nj: Int32Array; nl: Int32Array; score: number } | null = null;
    for (let k = 0; k < SAMPLE; k++) {
      const p = pickProp(r, truths, used, typeCount, true);
      if (!p) break;
      const nj = filterBy(withJ, p, n), nl = filterBy(withL, p, n);
      if (nj.length > withJ.length * 0.9 && nl.length > withL.length * 0.9) { used.add(key(p)); continue; }
      const score = Math.log2(nj.length + 1) + Math.log2(nl.length + 1);
      if (!best || score < best.score) best = { p, nj, nl, score };
      if (FLAVOUR.has(p.t) && nj.length < withJ.length * 0.7 && r() < 0.6) { best = { p, nj, nl, score }; break; }
    }
    if (!best) continue;
    used.add(key(best.p));
    chosen.push(best.p);
    typeCount[best.p.t] = (typeCount[best.p.t] ?? 0) + 1;
    withJ = best.nj; withL = best.nl;
  }
  if (withJ.length !== 1 || withL.length !== 0) return null;
  const okT = (qs: Prop[]) => solutions([J!, ...qs], n).length === 1 && solutions([L!, ...qs], n).length === 0;
  const T = prune(r, chosen, okT);
  // J must matter: without it the truths alone would already be the whole answer.
  if (solutions(T, n).length <= 1) return null;
  const props = shuffle(r, [...T, J, L]);
  if (props.length < min || props.length > max) return null;
  const lies = oneLieSolutions(props, n);
  if (lies.length !== 1 || lies[0].packed !== pack(cells)) return null;
  if (solutions(props, n).length !== 0) return null;
  if (unaryPinned(T, n) > 0) return null;
  // Grade the path: the clash points at J or L; trying "L is the lie" must solve, "J is the lie" must break.
  const gTrue = grade([...T, J], n);
  if (!gTrue || gTrue.level > 2) return null;
  const gFalse = propagate([...T, L], fullDom(n));
  let refuted = gFalse.dom === null;
  if (!refuted) { const g2 = grade([...T, L], n); refuted = g2 === null; }
  if (!refuted) return null;
  if (!(gTrue.level === 2 || gTrue.steps >= 14) || softCount([...T, J]) < 2) return null;
  return { props, lie: props.indexOf(L), grade: { level: gTrue.level, steps: gTrue.steps + 2, trials: gTrue.trials } };
}

/** The 피스 hint: the true card (not on the table) that leaves the fewest cells open after reading every card. */
function pickHint(r: Rand, props: Prop[], lie: number | null, cells: number[], pool: Prop[], n: number): Prop {
  const truths = props.filter((_, i) => i !== lie);
  const have = new Set(props.map(key));
  const cands = shuffle(r, pool.filter((p) => !have.has(key(p)) && evalProp(p, cells) && p.t !== 'if' && p.t !== 'with' && p.t !== 'count'));
  let best = cands[0], bestScore = Infinity;
  for (const h of cands.slice(0, 160)) {
    const out = propagate([...truths, h], fullDom(n));
    if (!out.dom) continue;
    const score = out.dom.reduce((a, m) => a + Math.log2(popcount(m)), 0) + (h.t === 'in' ? -0.3 : 0);
    if (score < bestScore) { bestScore = score; best = h; }
  }
  return best;
}

const propPool = new Map<number, Prop[]>();
const poolFor = (n: number) => { let p = propPool.get(n); if (!p) { p = allProps(n); propPool.set(n, p); } return p; };

const puzzleCache = new Map<string, Puzzle>();
/** The puzzle for (tier, seed): the same everywhere. */
export function generate(tier: Tier, seed: number): Puzzle {
  const ck = `${tier}-${seed}`;
  const hit = puzzleCache.get(ck);
  if (hit) return hit;
  const r = rng(seed * 7 + tier);
  const { stones: n, lie } = TIER_SPEC[tier];
  const pool = poolFor(n);
  for (;;) {
    const order = shuffle(r, Array.from({ length: CELLS }, (_, i) => i));
    const cells = order.slice(0, n);
    const built = lie ? buildLie(r, tier, cells, pool) : buildPlain(r, tier, cells, pool);
    if (!built) continue;
    const colours = shuffle(r, [0, 1, 2, 3, 4]).slice(0, n).sort((a, b) => a - b);
    const hint = pickHint(r, built.props, built.lie, cells, pool, n);
    const puzzle: Puzzle = { tier, seed, stones: colours, props: built.props, answer: cells, lie: built.lie, hint, grade: built.grade };
    if (puzzleCache.size > 30) puzzleCache.clear();
    puzzleCache.set(ck, puzzle);
    return puzzle;
  }
}

/** Board state → solved? Plain tiers: every card true. 거짓말: every stone down and exactly one card false. */
export function isSolved(pz: PublicPuzzle, cells: number[]): boolean {
  if (cells.some((c) => c < 0)) return false;
  const bad = pz.props.filter((p) => !evalProp(p, cells)).length;
  return TIER_SPEC[pz.tier].lie ? bad === 1 : bad === 0;
}

/** The board as the server compares it: one hex digit per stone, in tray order. */
export const encodeCells = (cells: number[]) => cells.map((c) => c.toString(16)).join('');
export const decodeCells = (s: string) => [...s].map((ch) => parseInt(ch, 16));

/** Seconds added to a run's ranked time for each 피스 hint. */
export const HINT_PENALTY_MS = 30_000;
/** Seconds added for each 블랙피스 hint (one stone shown on its point). */
export const STONE_HINT_PENALTY_MS = 40_000;
/** Hints of both kinds together in one daily run (the 피스 hint also at most once per puzzle). */
export const HINT_CAP = 3;
export const HINT_PRICE = 1;
/** The whole run (three puzzles) must end inside this. */
export const RUN_LIMIT_MS = 10 * 60_000;

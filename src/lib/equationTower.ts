// 수식의 탑 (Tower of Equations), the fifth prison match of 「데블스 플랜: 데드 어게인」.
// Number blocks stand in four stacks. Some are plain numbers, the others carry a sign (+3, ×2 …).
// A move lifts any number of blocks off the top of one stack, optionally turns the bundle upside down,
// and sets it down on any stack (turning it over in place is a move too). Each round names a target
// number and a height: build a tower of exactly that height that reads, from the top down, as a sum
// worth the target. The top block must be a plain number and every block under it a signed one; the
// tower reads as an ordinary formula from the top, × and ÷ before + and − (5, +3, ×2 → 5+3×2 = 11).
// The stacks carry over to the next round. The show did not publish its block set, so that is this site's own choice.

export const STACKS = 4;
export const CHALLENGE_MS = 10 * 60 * 1000;
export type Op = '' | '+' | '-' | '*' | '/';
export type Block = { n: number; op: Op };
/** Block ids per stack, bottom first. */
export type Stacks = number[][];
export type Move = { from: number; count: number; flip: boolean; to: number };
export type TowerRound = { id: string; target: number; floors: number; par: number };

export const opGlyph = (op: Op) => (op === '*' ? '×' : op === '/' ? '÷' : op === '-' ? '−' : op);
export const blockText = (b: Block) => `${opGlyph(b.op)}${b.n}`;

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const shuffled = <T,>(list: T[], rand: () => number) => {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) { const j = Math.floor(rand() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
};

/** Every block carries one of the four primes. */
export const PRIMES = [2, 3, 5, 7] as const;
/** Towers asked for are three to five blocks high. */
export const MIN_FLOORS = 3;
export const MAX_FLOORS = 5;

/** 보통: 2–3 moves to the fewest; 어려움: 4–6, with a second × block and bigger targets. */
export type Level = 'normal' | 'hard';
export const LEVELS = ['normal', 'hard'] as const;
export const asLevel = (v: unknown): Level => (v === 'hard' ? 'hard' : 'normal');

/**
 * Nine blocks, all numbered with the four primes: three plain numbers (three different primes) and six signed
 * ones. 보통: two +, two −, one ×, one ÷; the + and − blocks take one prime each, so all four kinds are in play.
 * 어려움: two +, one −, two ×, one ÷, so towers climb higher.
 */
export function createBlocks(rand: () => number = Math.random, level: Level = 'normal'): Block[] {
  const plain = shuffled([...PRIMES], rand).slice(0, 3).map((n): Block => ({ n, op: '' }));
  const mix = shuffled([...PRIMES], rand);
  const signed: Block[] = level === 'hard'
    ? [{ n: mix[0], op: '+' }, { n: mix[1], op: '+' }, { n: mix[2], op: '-' },
      { n: PRIMES[Math.floor(rand() * 4)], op: '*' }, { n: PRIMES[Math.floor(rand() * 3)], op: '*' }, { n: PRIMES[Math.floor(rand() * 2)], op: '/' }]
    : [{ n: mix[0], op: '+' }, { n: mix[1], op: '+' }, { n: mix[2], op: '-' }, { n: mix[3], op: '-' },
      { n: PRIMES[Math.floor(rand() * 3)], op: '*' }, { n: PRIMES[Math.floor(rand() * 2)], op: '/' }];
  return [...plain, ...signed];
}

/** Nine blocks over the four stacks (3-2-2-2), in a random order. */
export function dealStacks(blocks: Block[], rand: () => number = Math.random): Stacks {
  const ids = shuffled(blocks.map((_, i) => i), rand);
  return Array.from({ length: STACKS }, (_, s) => ids.filter((_, i) => i % STACKS === s));
}

export const legalMove = (stacks: Stacks, m: Move) =>
  m.from >= 0 && m.from < stacks.length && m.to >= 0 && m.to < stacks.length && Number.isInteger(m.count)
  && m.count >= 1 && m.count <= stacks[m.from].length && (m.from !== m.to || (m.flip && m.count >= 2));

export function applyMove(stacks: Stacks, m: Move): Stacks {
  const next = stacks.map((s) => [...s]);
  const lifted = next[m.from].splice(next[m.from].length - m.count, m.count);
  next[m.to].push(...(m.flip ? lifted.reverse() : lifted));
  return next;
}

/**
 * What a stack is worth as a tower, as a fraction [p, q]: a plain number on top, signed blocks under it,
 * read from the top down as an ordinary formula — × and ÷ before + and − (7+7+2÷2−5 = 10). Null when it is
 * not a tower (one block, a signed block on top, a plain number lower down).
 */
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a) || 1);
export function towerValue(stack: number[], blocks: Block[]): [number, number] | null {
  if (stack.length < 2) return null;
  const top = blocks[stack[stack.length - 1]];
  if (top.op !== '') return null;
  // sum sp/sq of the finished terms; the current term is sign · tp/tq
  let sp = 0, sq = 1, tp = top.n, tq = 1, sign = 1;
  const close = () => { sp = sp * tq + sign * tp * sq; sq *= tq; };
  for (let i = stack.length - 2; i >= 0; i -= 1) {
    const b = blocks[stack[i]];
    if (b.op === '') return null;
    if (b.op === '*') tp *= b.n;
    else if (b.op === '/') tq *= b.n;
    else { close(); tp = b.n; tq = 1; sign = b.op === '+' ? 1 : -1; }
  }
  close();
  const g = gcd(sp, sq);
  return [sp / g, sq / g];
}
/** The tower's formula from the top down, e.g. "5×2+3". */
export const towerText = (stack: number[], blocks: Block[]) => [...stack].reverse().map((id) => blockText(blocks[id])).join('');

const hits = (stack: number[], blocks: Block[], target: number, floors: number) => {
  if (stack.length !== floors) return false;
  const v = towerValue(stack, blocks);
  return !!v && v[0] === target * v[1];
};
/** The stack that is the asked-for tower right now, or -1. */
export const solvedStack = (stacks: Stacks, blocks: Block[], target: number, floors: number) =>
  stacks.findIndex((s) => hits(s, blocks, target, floors));

function* movesOf(stacks: Stacks): Generator<Move> {
  for (let from = 0; from < stacks.length; from += 1) {
    for (let count = 1; count <= stacks[from].length; count += 1) {
      for (let to = 0; to < stacks.length; to += 1) {
        if (to !== from) yield { from, count, flip: false, to };
        if (count >= 2) yield { from, count, flip: true, to };
      }
    }
  }
}
const keyOf = (stacks: Stacks) => stacks.map((s) => s.join(',')).join('|');

/** Fewest moves to the tower (breadth first), or null past `maxDepth`. */
export function solve(stacks: Stacks, blocks: Block[], target: number, floors: number, maxDepth = 3): Move[] | null {
  if (solvedStack(stacks, blocks, target, floors) >= 0) return [];
  let frontier: { stacks: Stacks; path: Move[] }[] = [{ stacks, path: [] }];
  const seen = new Set([keyOf(stacks)]);
  for (let depth = 1; depth <= maxDepth; depth += 1) {
    const next: typeof frontier = [];
    for (const node of frontier) {
      for (const m of movesOf(node.stacks)) {
        const after = applyMove(node.stacks, m);
        if (solvedStack(after, blocks, target, floors) >= 0) return [...node.path, m];
        if (depth === maxDepth) continue;
        const key = keyOf(after);
        if (seen.has(key)) continue;
        seen.add(key);
        next.push({ stacks: after, path: [...node.path, m] });
      }
    }
    frontier = next;
  }
  return null;
}

let counter = 0;
const roundId = () => { counter += 1; return `t-${Date.now().toString(36)}-${counter}`; };

const LEVEL_SPEC = {
  normal: { depth: 3, pars: [2, 2, 3, 3, 3], maxTarget: 99 },
  hard: { depth: 5, pars: [4, 4, 5, 5, 6], maxTarget: 300 },
} as const;

/** Towers reachable from `stacks`: floors·1000 + target → fewest moves, and whether every tower that does it in that many uses × or ÷. */
type Reach = Map<number, { par: number; md: boolean }>;
const buf = new Int8Array(12);
/** buf[0..n) bottom first: the tower's key, or -1 when it is not an asked-for tower. Sets `lastMd`. */
let lastMd = false;
function towerKey(n: number, blocks: Block[], maxTarget: number): number {
  if (n < MIN_FLOORS || n > MAX_FLOORS) return -1;
  const top = blocks[buf[n - 1]];
  if (top.op !== '') return -1;
  let sp = 0, sq = 1, tp = top.n, tq = 1, sign = 1, md = false;
  for (let i = n - 2; i >= 0; i -= 1) {
    const b = blocks[buf[i]];
    if (b.op === '') return -1;
    if (b.op === '*') { tp *= b.n; md = true; } else if (b.op === '/') { tq *= b.n; md = true; } else { sp = sp * tq + sign * tp * sq; sq *= tq; tp = b.n; tq = 1; sign = b.op === '+' ? 1 : -1; }
  }
  sp = sp * tq + sign * tp * sq; sq *= tq;
  if (sp % sq !== 0) return -1;
  const v = sp / sq;
  if (v < 1 || v > maxTarget) return -1;
  lastMd = md;
  return n * 1000 + v;
}
const stackKey = (stacks: Stacks) => { let k = 0; for (let i = 0; i < stacks.length; i += 1) { for (const x of stacks[i]) k = k * 16 + x; if (i < stacks.length - 1) k = k * 16 + 15; } return k; };

/**
 * Every tower reachable within `depth` moves, breadth first: the stacks after each move are checked where they
 * changed, and the last level is only checked, not stored. Depth 5 looks at about ten million positions.
 */
function reachable(stacks: Stacks, blocks: Block[], depth: number, maxTarget: number): Reach {
  const reach: Reach = new Map();
  const note = (k: number, d: number) => {
    if (k < 0) return;
    const had = reach.get(k);
    if (!had) reach.set(k, { par: d, md: lastMd });
    else if (had.par === d && !lastMd) had.md = false;
  };
  for (const s of stacks) { for (let i = 0; i < s.length; i += 1) buf[i] = s[i]; note(towerKey(s.length, blocks, maxTarget), 0); }
  let frontier: Stacks[] = [stacks];
  const seen = new Set([stackKey(stacks)]);
  for (let d = 1; d <= depth; d += 1) {
    const next: Stacks[] = [];
    for (const st of frontier) {
      for (let from = 0; from < STACKS; from += 1) {
        const src = st[from];
        for (let count = 1; count <= src.length; count += 1) {
          const cut = src.length - count;
          // what is left behind
          for (let i = 0; i < cut; i += 1) buf[i] = src[i];
          note(towerKey(cut, blocks, maxTarget), d);
          for (let flip = 0; flip <= (count >= 2 ? 1 : 0); flip += 1) {
            for (let to = 0; to < STACKS; to += 1) {
              if (to === from && !flip) continue;
              const dst = to === from ? src.slice(0, cut) : st[to];
              for (let i = 0; i < dst.length; i += 1) buf[i] = dst[i];
              for (let i = 0; i < count; i += 1) buf[dst.length + i] = flip ? src[src.length - 1 - i] : src[cut + i];
              note(towerKey(dst.length + count, blocks, maxTarget), d);
              if (d === depth) continue;
              const after = applyMove(st, { from, count, flip: !!flip, to });
              const k = stackKey(after);
              if (seen.has(k)) continue;
              seen.add(k);
              next.push(after);
            }
          }
        }
      }
    }
    frontier = next;
  }
  return reach;
}

/**
 * The next round from where the stacks stand, for the level: every tower within reach is worked out with its
 * fewest moves (`par`), then one is picked whose par is in the level's range (보통 2–3, 어려움 4–6), favouring
 * towers that need × or ÷. Par 6 comes from wandering six moves to a tower the search did not reach in five.
 */
export function generateRound(stacks: Stacks, blocks: Block[], rand: () => number = Math.random, level: Level = 'normal'): TowerRound {
  const spec = LEVEL_SPEC[level];
  const reach = reachable(stacks, blocks, spec.depth, spec.maxTarget);
  const want = spec.pars[Math.floor(rand() * spec.pars.length)];
  const pick = (list: [number, { par: number; md: boolean }][]) => {
    // favour towers that need × or ÷, and on 어려움 targets of 12 and up
    const big = level === 'hard' ? list.filter(([k]) => k % 1000 >= 12) : list;
    const base = big.length && rand() < 0.85 ? big : list;
    const md = base.filter(([, v]) => v.md);
    const pool = md.length && rand() < 0.75 ? md : base;
    const [k, v] = pool[Math.floor(rand() * pool.length)];
    return { id: roundId(), target: k % 1000, floors: Math.floor(k / 1000), par: v.par };
  };
  if (want > spec.depth) {
    for (let attempt = 0; attempt < 300; attempt += 1) {
      let cur = stacks;
      for (let i = 0; i < want; i += 1) { const moves = [...movesOf(cur)]; cur = applyMove(cur, moves[Math.floor(rand() * moves.length)]); }
      const found: [number, { par: number; md: boolean }][] = [];
      for (const s of cur) {
        for (let i = 0; i < s.length; i += 1) buf[i] = s[i];
        const k = towerKey(s.length, blocks, spec.maxTarget);
        if (k >= 0 && !reach.has(k)) found.push([k, { par: want, md: lastMd }]);
      }
      if (found.length) return pick(found);
    }
  }
  const all = [...reach.entries()];
  // the wanted par, else the nearest one inside the level's range, else anything at least 2 (1 at worst)
  const lo = spec.pars[0], hi = Math.min(spec.depth, spec.pars[spec.pars.length - 1]);
  for (const par of [Math.min(want, hi), ...[hi, hi - 1, hi - 2, hi - 3, hi - 4].filter((p) => p >= lo && p !== Math.min(want, hi)), 3, 2, 1]) {
    const list = all.filter(([, v]) => v.par === par);
    if (list.length) return pick(list);
  }
  // Nothing reachable: a placeholder round so the game can go on.
  return { id: roundId(), target: 1, floors: MIN_FLOORS, par: 1 };
}

/** Points for a solo round: 3 in the fewest moves, 2 with one more, 1 for any finish. */
export const roundPoints = (moves: number, par: number) => (moves <= par ? 3 : moves === par + 1 ? 2 : 1);

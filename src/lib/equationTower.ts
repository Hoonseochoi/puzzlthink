// 수식의 탑 (Tower of Equations), the fifth prison match of 「데블스 플랜: 데드 어게인」.
// Number blocks stand in four stacks. Some are plain numbers, the others carry a sign (+3, ×2 …).
// A move lifts any number of blocks off the top of one stack, optionally turns the bundle upside down,
// and sets it down on any stack (turning it over in place is a move too). Each round names a target
// number and a height: build a tower of exactly that height that reads, from the top down, as a sum
// worth the target. The top block must be a plain number and every block under it a signed one; the
// tower is worked out in order from the top (5, ×2, +3 → 5×2+3 = 13). The stacks carry over to the next round.
// The show did not publish its block set or how signs chain, so those two are this site's own choice.

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

/** Nine blocks: three plain numbers and six signed ones (two +, two −, one ×, one ÷; small numbers). */
export function createBlocks(rand: () => number = Math.random): Block[] {
  const digits = shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9], rand);
  const plain = digits.slice(0, 3).map((n): Block => ({ n, op: '' }));
  const small = shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9], rand);
  const signed: Block[] = [
    { n: small[0], op: '+' }, { n: small[1], op: '+' }, { n: small[2], op: '-' }, { n: small[3], op: '-' },
    { n: 2 + Math.floor(rand() * 3), op: '*' }, { n: 2 + Math.floor(rand() * 2), op: '/' },
  ];
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
 * worked out from the top down. Null when it is not a tower (one block, a signed block on top, a plain
 * number lower down).
 */
export function towerValue(stack: number[], blocks: Block[]): [number, number] | null {
  if (stack.length < 2) return null;
  const top = blocks[stack[stack.length - 1]];
  if (top.op !== '') return null;
  let p = top.n, q = 1;
  for (let i = stack.length - 2; i >= 0; i -= 1) {
    const b = blocks[stack[i]];
    if (b.op === '') return null;
    if (b.op === '+') p += b.n * q; else if (b.op === '-') p -= b.n * q; else if (b.op === '*') p *= b.n; else q *= b.n;
  }
  return [p, q];
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

/**
 * The next round from where the stacks stand: wander a few moves, take a tower that came up (a whole
 * number from 1 to 99, two to five blocks high) and ask for it. `par` is the fewest moves that reach it.
 * `depth` 2 or 3 is how far to wander; rounds that are already solved or one move away are passed over.
 */
export function generateRound(stacks: Stacks, blocks: Block[], rand: () => number = Math.random, depth = 3): TowerRound {
  let fallback: TowerRound | null = null;
  for (let attempt = 0; attempt < 400; attempt += 1) {
    let cur = stacks;
    for (let i = 0; i < depth; i += 1) { const moves = [...movesOf(cur)]; cur = applyMove(cur, moves[Math.floor(rand() * moves.length)]); }
    for (const stack of shuffled(cur, rand)) {
      if (stack.length < 2 || stack.length > 5) continue;
      const v = towerValue(stack, blocks);
      if (!v || v[0] % v[1] !== 0) continue;
      const target = v[0] / v[1];
      if (target < 1 || target > 99) continue;
      const path = solve(stacks, blocks, target, stack.length, depth);
      if (!path || path.length === 0) continue;
      counter += 1;
      const round = { id: `t-${Date.now().toString(36)}-${counter}`, target, floors: stack.length, par: path.length };
      if (path.length >= 2) return round;
      fallback ??= round;
    }
  }
  if (fallback) return fallback;
  // Nothing reachable (never seen in practice): ask for what one plain block on one signed block makes.
  counter += 1;
  return { id: `t-${Date.now().toString(36)}-${counter}`, target: 1, floors: 2, par: 1 };
}

/** Points for a solo round: 3 in the fewest moves, 2 with one more, 1 for any finish. */
export const roundPoints = (moves: number, par: number) => (moves <= par ? 3 : moves === par + 1 ? 2 : 1);

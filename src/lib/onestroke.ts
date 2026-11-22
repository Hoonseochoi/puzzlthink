// 한붓길 (one-stroke number path): draw one line that starts on 1, passes the numbered stones in order and ends on
// the last number, visiting every cell exactly once (moving across or down, never diagonally).
// Boards come from a random Hamiltonian path (backbite moves); numbers are added where another route still fits,
// then trimmed, until a solver finds only the planted route.
//
// Edges are numbered like 마슈: horizontals first (row-major, n-1 per row), then verticals.
// Self-contained (no imports) so `scripts/logic-pool.ts` can run it in Node to build the puzzle pool.

export const ONESTROKE_SIZES = [5, 6, 7] as const;
export const ONESTROKE_CHALLENGE_SIZE = 7;

/** `numbers[cell]` = its number (1…K) or 0. Edge marks: 0 empty, 1 line, 2 ✕. */
export type OneStrokePuzzle = { size: number; numbers: number[] };

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

const geoCache = new Map<number, { edgeCount: number; ends: [number, number][]; nbr: number[][] }>();
/** Edge list and neighbours of an n×n grid. */
export function geometry(n: number) {
  const hit = geoCache.get(n);
  if (hit) return hit;
  const ends: [number, number][] = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n - 1; c++) ends.push([r * n + c, r * n + c + 1]);
  for (let r = 0; r < n - 1; r++) for (let c = 0; c < n; c++) ends.push([r * n + c, (r + 1) * n + c]);
  const nbr = Array.from({ length: n * n }, (_, i) => {
    const r = Math.floor(i / n), c = i % n, out: number[] = [];
    if (r > 0) out.push(i - n); if (r < n - 1) out.push(i + n); if (c > 0) out.push(i - 1); if (c < n - 1) out.push(i + 1);
    return out;
  });
  const g = { edgeCount: ends.length, ends, nbr };
  geoCache.set(n, g);
  return g;
}
export const edgeBetween = (n: number, a: number, b: number) => {
  const [x, y] = a < b ? [a, b] : [b, a];
  if (y === x + 1 && Math.floor(x / n) === Math.floor(y / n)) return Math.floor(x / n) * (n - 1) + (x % n);
  if (y === x + n) return n * (n - 1) + x;
  return -1;
};

/** The cells of the drawn line in order from 1, or null if the marks are not one simple path from 1. */
export function walk(p: OneStrokePuzzle, marks: ArrayLike<number>): number[] | null {
  const n = p.size, { ends } = geometry(n);
  const adj: number[][] = Array.from({ length: n * n }, () => []);
  for (let e = 0; e < ends.length; e++) if (marks[e] === 1) { adj[ends[e][0]].push(ends[e][1]); adj[ends[e][1]].push(ends[e][0]); }
  const start = p.numbers.indexOf(1);
  if (start < 0 || adj[start].length !== 1) return null;
  const order = [start];
  let prev = -1, cur = start;
  for (;;) {
    const next = adj[cur].filter((x) => x !== prev);
    if (adj[cur].length > 2) return null;
    if (!next.length) break;
    prev = cur; cur = next[0];
    if (order.includes(cur)) return null;
    order.push(cur);
  }
  return order;
}

/** Numbered cells passed out of order so far (for the worried faces). */
export function wrongNumbers(p: OneStrokePuzzle, marks: ArrayLike<number>): Set<number> {
  const order = walk(p, marks);
  const bad = new Set<number>();
  if (!order) return bad;
  let expect = 1;
  for (const cell of order) {
    const k = p.numbers[cell];
    if (!k) continue;
    if (k !== expect) bad.add(cell); else expect++;
  }
  return bad;
}

export function isSolved(p: OneStrokePuzzle, marks: ArrayLike<number>): boolean {
  const order = walk(p, marks);
  if (!order || order.length !== p.size * p.size) return false;
  let expect = 1;
  for (const cell of order) { const k = p.numbers[cell]; if (k) { if (k !== expect) return false; expect++; } }
  const last = Math.max(...p.numbers);
  return p.numbers[order[order.length - 1]] === last;
}

/**
 * Counts routes up to `limit`: depth-first from 1, entering a number only when it is the next one, pruned when the
 * unvisited cells split or leave more than one dead end. `cap` bounds the work (hitting it reports `limit`).
 */
export function countSolutions(n: number, numbers: number[], limit = 2, cap = 400_000): { count: number; sol: number[] | null; other: number[] | null } {
  const { nbr } = geometry(n), N = n * n;
  const last = Math.max(...numbers);
  const start = numbers.indexOf(1), finish = numbers.indexOf(last);
  const seen = new Uint8Array(N);
  const path: number[] = [];
  let count = 0, nodes = 0;
  let sol: number[] | null = null, other: number[] | null = null;
  const stamp = new Int32Array(N);
  let mark = 0;

  const viable = (head: number, left: number) => {
    // Every unvisited cell is reachable from the head, and each one but the finish keeps two open sides.
    if (left === 0) return true;
    mark++;
    const stack: number[] = [];
    for (const j of nbr[head]) if (!seen[j] && stamp[j] !== mark) { stamp[j] = mark; stack.push(j); }
    let reached = 0;
    while (stack.length) {
      const i = stack.pop()!;
      reached++;
      let free = 0;
      for (const j of nbr[i]) {
        if (!seen[j]) { free++; if (stamp[j] !== mark) { stamp[j] = mark; stack.push(j); } } else if (j === head) free++;
      }
      if (i === finish ? free < 1 : free < 2) return false;
    }
    return reached === left;
  };

  const rec = (cell: number, next: number, left: number) => {
    if (count >= limit) return;
    if (++nodes > cap) { count = limit; return; }
    if (left === 0) {
      if (cell === finish) { count++; if (!sol) sol = path.slice(); else if (!other) other = path.slice(); }
      return;
    }
    if (cell === finish) return;
    // A neighbour with only two open sides (one of them us) must be entered now, or it becomes a dead end.
    let forced = -1;
    for (const j of nbr[cell]) {
      if (seen[j] || j === finish) continue;
      let free = 0;
      for (const x of nbr[j]) if (!seen[x] || x === cell) free++;
      if (free === 2) { if (forced >= 0) return; forced = j; }
    }
    for (const j of forced >= 0 ? [forced] : nbr[cell]) {
      if (seen[j]) continue;
      const k = numbers[j];
      if (k && k !== next) continue;
      seen[j] = 1; path.push(j);
      if (viable(j, left - 1)) rec(j, k ? next + 1 : next, left - 1);
      seen[j] = 0; path.pop();
      if (count >= limit) return;
    }
  };
  seen[start] = 1; path.push(start);
  rec(start, 2, N - 1);
  return { count, sol, other };
}

/** A random Hamiltonian path: a serpentine, scrambled by backbite moves. */
function randomPath(n: number, rand: () => number): number[] {
  const { nbr } = geometry(n);
  let path: number[] = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) path.push(r * n + (r % 2 ? n - 1 - c : c));
  const pos = new Int32Array(n * n);
  for (let step = 0; step < n * n * 60; step++) {
    if (rand() < 0.5) path.reverse();
    path.forEach((cell, i) => { pos[cell] = i; });
    const head = path[path.length - 1];
    const options = nbr[head].filter((j) => j !== path[path.length - 2]);
    const j = options[Math.floor(rand() * options.length)];
    const k = pos[j];
    // Backbite: link the head to j and reverse the tail after j.
    path = path.slice(0, k + 1).concat(path.slice(k + 1).reverse());
  }
  return path;
}

/** Board for (size, seed): numbers and the answer as edge marks. Deterministic. */
export function generate(n: number, seed: number): { numbers: number[]; answer: number[] } {
  for (let attempt = 0; ; attempt++) {
    const rand = rng(seed * 13 + attempt * 104729 + n);
    const path = randomPath(n, rand);
    const N = n * n;
    // Checkpoints by position on the path: start, end, plus a few spread out.
    const at = new Set<number>([0, N - 1]);
    const spread = Math.max(2, Math.round(N / (n >= 7 ? 5 : 8)));
    for (let i = 0; i < spread; i++) at.add(1 + Math.floor(rand() * (N - 2)));
    const numbersFor = (set: Set<number>) => {
      const list = [...set].sort((a, b) => a - b);
      const nums = new Array<number>(N).fill(0);
      list.forEach((idx, k) => { nums[path[idx]] = k + 1; });
      return nums;
    };
    let res = countSolutions(n, numbersFor(at), 2, 60_000);
    for (let guard = 0; res.count > 1 && guard < N; guard++) {
      // Pin the first cell where the other route leaves ours (or, when the search ran out, any new cell).
      const alt = res.other ?? res.sol;
      let i = 1;
      if (alt) while (i < N && alt[i] === path[i]) i++;
      else i = 1 + Math.floor(rand() * (N - 2));
      while (at.has(i) && i < N - 2) i++;
      if (at.has(i)) i = [...Array(N).keys()].find((k) => !at.has(k)) ?? i;
      at.add(Math.min(i, N - 2));
      res = countSolutions(n, numbersFor(at), 2, 60_000);
    }
    if (res.count !== 1) continue;
    // Trim numbers that are not needed (keep 1 and the last).
    const middle = [...at].filter((x) => x !== 0 && x !== N - 1);
    for (let i = middle.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [middle[i], middle[j]] = [middle[j], middle[i]]; }
    for (const idx of middle) {
      at.delete(idx);
      // A cheap check: when it runs long, the number stays (still unique, a little easier).
      if (countSolutions(n, numbersFor(at), 2, 30_000).count !== 1) at.add(idx);
    }
    const numbers = numbersFor(at);
    const answer = new Array<number>(geometry(n).edgeCount).fill(0);
    for (let i = 0; i + 1 < N; i++) answer[edgeBetween(n, path[i], path[i + 1])] = 1;
    return { numbers, answer };
  }
}

/** The answer as a "0/1" string (one per edge), the form the server stores. */
export const encodeEdges = (edges: ArrayLike<number>) => Array.from(edges, (v) => (v === 1 ? '1' : '0')).join('');

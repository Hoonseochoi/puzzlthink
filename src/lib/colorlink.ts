// 컬러 잇기 (colour link, Numberlink / Arukone genre): join each pair of same-coloured stones with a line.
// Lines run across or down through cell centers, never cross or branch, and together fill every cell.
// Boards cut a random Hamiltonian path into segments (so every cell is covered), and are kept only when a solver
// finds that one filling and no other.
//
// Edges are numbered like 마슈: horizontals first (row-major, n-1 per row), then verticals.
// Self-contained (no imports) so `scripts/logic-pool.ts` can run it in Node to build the puzzle pool.

export const COLORLINK_SIZES = [5, 6, 7] as const;
export const COLORLINK_CHALLENGE_SIZE = 7;

/** `ends[cell]` = colour number (1…K) on the two stones of a pair, else 0. Edge marks: 0 empty, 1 line, 2 ✕. */
export type ColorLinkPuzzle = { size: number; ends: number[] };

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

/**
 * Colours the drawn lines: each cell gets the colour of the stone its line reaches (0 when it reaches none),
 * and `broken` lists stones whose line branches, joins the wrong colour or crosses a stone.
 */
export function paint(p: ColorLinkPuzzle, marks: ArrayLike<number>): { color: number[]; broken: Set<number> } {
  const n = p.size, { ends } = geometry(n);
  const adj: number[][] = Array.from({ length: n * n }, () => []);
  for (let e = 0; e < ends.length; e++) if (marks[e] === 1) { adj[ends[e][0]].push(ends[e][1]); adj[ends[e][1]].push(ends[e][0]); }
  const color = new Array<number>(n * n).fill(0);
  const broken = new Set<number>();
  for (let s = 0; s < n * n; s++) {
    const k = p.ends[s];
    if (!k) continue;
    if (adj[s].length > 1) broken.add(s);
    // Walk the line from this stone; stop at a branch.
    let prev = -1, cur = s;
    color[s] = k;
    for (;;) {
      const next = adj[cur].filter((x) => x !== prev);
      if (cur !== s && adj[cur].length > 2) { broken.add(s); break; }
      if (!next.length) break;
      prev = cur; cur = next[0];
      if (color[cur] && color[cur] !== k) { broken.add(s); break; }
      color[cur] = k;
      if (p.ends[cur]) { if (p.ends[cur] !== k) broken.add(s); break; }
    }
  }
  return { color, broken };
}

export function isSolved(p: ColorLinkPuzzle, marks: ArrayLike<number>): boolean {
  const n = p.size, { ends } = geometry(n);
  const deg = new Array<number>(n * n).fill(0);
  for (let e = 0; e < ends.length; e++) if (marks[e] === 1) { deg[ends[e][0]]++; deg[ends[e][1]]++; }
  for (let i = 0; i < n * n; i++) if (deg[i] !== (p.ends[i] ? 1 : 2)) return false;
  const { color, broken } = paint(p, marks);
  if (broken.size) return false;
  // Every cell is on a stone-to-stone line (no closed loops), and each line joins the right pair.
  for (let i = 0; i < n * n; i++) if (!color[i]) return false;
  for (let e = 0; e < ends.length; e++) if (marks[e] === 1 && color[ends[e][0]] !== color[ends[e][1]]) return false;
  return true;
}

/**
 * Counts fillings up to `limit`: one colour at a time, a depth-first line from its first stone to its second,
 * pruned when an empty cell can no longer be passed through or a pair can no longer meet.
 * `cap` bounds the work (hitting it reports `limit`).
 */
export function countSolutions(n: number, endsIn: number[], limit = 2, cap = 300_000): { count: number; sol: number[] | null } {
  const { nbr } = geometry(n), N = n * n;
  const K = Math.max(...endsIn);
  const pairs: [number, number][] = [];
  for (let k = 1; k <= K; k++) {
    const cells = endsIn.flatMap((v, i) => (v === k ? [i] : []));
    pairs.push([cells[0], cells[1]]);
  }
  // Short pairs first: they settle the board fastest.
  const order = pairs.map((_, k) => k).sort((a, b) => {
    const d = (k: number) => Math.abs(Math.floor(pairs[k][0] / n) - Math.floor(pairs[k][1] / n)) + Math.abs((pairs[k][0] % n) - (pairs[k][1] % n));
    return d(a) - d(b) || a - b;
  });
  const occ = new Int8Array(N); // colour per cell (1-based), 0 empty
  pairs.forEach(([s, t], k) => { occ[s] = k + 1; occ[t] = k + 1; });
  const next = new Int16Array(N).fill(-1); // line successor, to rebuild the answer
  let count = 0, nodes = 0;
  let sol: number[] | null = null;
  const region = new Int16Array(N);

  const viable = (step: number, head: number) => {
    // Open stones: the moving head and its target, plus both stones of every colour still to draw.
    const target = pairs[order[step]][1];
    const open = (i: number) => i === head || i === target || (occ[i] > 0 && order.indexOf(occ[i] - 1) > step && (i === pairs[occ[i] - 1][0] || i === pairs[occ[i] - 1][1]));
    for (let i = 0; i < N; i++) {
      if (occ[i]) continue;
      let free = 0;
      for (const j of nbr[i]) if (!occ[j] || open(j)) free++;
      if (free < 2) return false;
    }
    // Empty regions: each pair still to join must share one (or touch), and each region must touch a pair.
    region.fill(-1);
    let regions = 0;
    for (let i = 0; i < N; i++) {
      if (occ[i] || region[i] >= 0) continue;
      const stack = [i]; region[i] = regions;
      while (stack.length) { const x = stack.pop()!; for (const j of nbr[x]) if (!occ[j] && region[j] < 0) { region[j] = regions; stack.push(j); } }
      regions++;
    }
    const touch = (cell: number) => { const set = new Set<number>(); for (const j of nbr[cell]) if (!occ[j]) set.add(region[j]); return set; };
    const served = new Uint8Array(regions);
    const pairOk = (a: number, b: number) => {
      if (nbr[a].includes(b)) return true;
      const ta = touch(a), tb = touch(b);
      let ok = false;
      for (const r of ta) if (tb.has(r)) { served[r] = 1; ok = true; }
      return ok;
    };
    if (!pairOk(head, target)) return false;
    for (let s = step + 1; s < order.length; s++) { const [a, b] = pairs[order[s]]; if (!pairOk(a, b)) return false; }
    for (let r = 0; r < regions; r++) if (!served[r]) return false;
    return true;
  };

  const rec = (step: number, head: number) => {
    if (count >= limit) return;
    if (++nodes > cap) { count = limit; return; }
    const k = order[step], target = pairs[k][1];
    for (const j of nbr[head]) {
      if (j === target) {
        next[head] = j;
        if (step + 1 === order.length) {
          let full = true;
          for (let i = 0; i < N; i++) if (!occ[i]) { full = false; break; }
          if (full) { count++; if (!sol) sol = Array.from(next); }
        } else if (viable(step + 1, pairs[order[step + 1]][0])) rec(step + 1, pairs[order[step + 1]][0]);
        next[head] = -1;
        if (count >= limit) return;
        continue;
      }
      if (occ[j]) continue;
      occ[j] = k + 1; next[head] = j;
      if (viable(step, j)) rec(step, j);
      occ[j] = 0; next[head] = -1;
      if (count >= limit) return;
    }
  };
  if (viable(0, pairs[order[0]][0])) rec(0, pairs[order[0]][0]);
  return { count, sol };
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
    path = path.slice(0, k + 1).concat(path.slice(k + 1).reverse());
  }
  return path;
}

/** Board for (size, seed): coloured stone pairs and the answer as edge marks. Deterministic. */
export function generate(n: number, seed: number): { ends: number[]; answer: number[] } {
  const N = n * n;
  const colors = n <= 5 ? 5 : n === 6 ? 6 : 7;
  for (let attempt = 0; ; attempt++) {
    const rand = rng(seed * 7 + attempt * 7919 + n);
    const path = randomPath(n, rand);
    // Cut points: K segments, each at least 3 cells long.
    const cuts: number[] = [];
    let room = N - colors * 3;
    const extra = Array.from({ length: colors }, () => 0);
    while (room > 0) { extra[Math.floor(rand() * colors)]++; room--; }
    let at = 0;
    for (let k = 0; k < colors; k++) { at += 3 + extra[k]; cuts.push(at); }
    const ends = new Array<number>(N).fill(0);
    const answer = new Array<number>(geometry(n).edgeCount).fill(0);
    let from = 0;
    cuts.forEach((to, k) => {
      ends[path[from]] = k + 1; ends[path[to - 1]] = k + 1;
      for (let i = from; i + 1 < to; i++) answer[edgeBetween(n, path[i], path[i + 1])] = 1;
      from = to;
    });
    // Two stones of a pair side by side read as a mistake; skip those boards.
    const { nbr } = geometry(n);
    if (cuts.some((to, k) => nbr[path[k ? cuts[k - 1] : 0]].includes(path[to - 1]))) continue;
    if (countSolutions(n, ends, 2).count === 1) return { ends, answer };
  }
}

/** The answer as a "0/1" string (one per edge), the form the server stores. */
export const encodeEdges = (edges: ArrayLike<number>) => Array.from(edges, (v) => (v === 1 ? '1' : '0')).join('');

/**
 * When every pair is already joined by a clean line but some cells are still off any line, the cells left
 * (so the board can point them out: the puzzle only ends once every cell is filled). Otherwise null.
 */
export function unfilledAfterLinking(p: ColorLinkPuzzle, marks: ArrayLike<number>): number[] | null {
  const n = p.size, { ends } = geometry(n);
  const adj: number[][] = Array.from({ length: n * n }, () => []);
  for (let e = 0; e < ends.length; e++) if (marks[e] === 1) { adj[ends[e][0]].push(ends[e][1]); adj[ends[e][1]].push(ends[e][0]); }
  const { color, broken } = paint(p, marks);
  if (broken.size) return null;
  for (let s = 0; s < n * n; s++) {
    const k = p.ends[s];
    if (!k) continue;
    if (adj[s].length !== 1) return null;
    // Follow the line; it must end on the other stone of the same colour.
    let prev = s, cur = adj[s][0];
    while (!p.ends[cur]) {
      const next = adj[cur].filter((x) => x !== prev);
      if (next.length !== 1) return null;
      prev = cur; cur = next[0];
    }
    if (p.ends[cur] !== k || cur === s) return null;
  }
  const empty: number[] = [];
  for (let i = 0; i < n * n; i++) if (!color[i]) empty.push(i);
  return empty.length ? empty : null;
}

// 마슈 (Masyu): draw one closed loop through the centers of the cells so it passes every pearl.
// ● black pearl (검은 돌): the loop turns on it and goes straight one more cell on both sides.
// ○ white pearl (흰 돌): the loop goes straight through it and turns in at least one of the cells next to it.
//
// Self-contained (no imports) so `scripts/logic-pool.ts` can run it in Node to build the puzzle pool.
// The loop runs between cell centers, so the board is an N×N grid of "dots" (cells) with edges between neighbours.

/** Board sizes, in cells per side. Challenge boards are CHALLENGE_SIZE. */
export const MASYU_SIZES = [6, 8, 10] as const;
export type MasyuSize = (typeof MASYU_SIZES)[number];
export const MASYU_CHALLENGE_SIZE = 10;

/** Pearls per cell: 0 none, 1 white, 2 black. */
export type Pearl = 0 | 1 | 2;
/** Edge state while playing: 0 empty, 1 line, 2 marked ✕. */
export type Mark = 0 | 1 | 2;
export type MasyuPuzzle = { id: number; size: number; pearls: Pearl[] };

/**
 * Edges: horizontals first (size rows × (size−1), row by row), then verticals ((size−1) rows × size).
 * `cellEdges[c]` = [up, down, left, right] (−1 off the board); `ends[e]` = its two cells.
 */
export type Geometry = { n: number; edgeCount: number; cellEdges: number[][]; ends: [number, number][] };
const cache = new Map<number, Geometry>();
export function geometry(n: number): Geometry {
  const hit = cache.get(n);
  if (hit) return hit;
  const H = n * (n - 1);
  const ends: [number, number][] = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n - 1; c++) ends.push([r * n + c, r * n + c + 1]);
  for (let r = 0; r < n - 1; r++) for (let c = 0; c < n; c++) ends.push([r * n + c, (r + 1) * n + c]);
  const cellEdges: number[][] = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    cellEdges.push([
      r > 0 ? H + (r - 1) * n + c : -1,
      r < n - 1 ? H + r * n + c : -1,
      c > 0 ? r * (n - 1) + c - 1 : -1,
      c < n - 1 ? r * (n - 1) + c : -1,
    ]);
  }
  const g = { n, edgeCount: H + (n - 1) * n, cellEdges, ends };
  cache.set(n, g);
  return g;
}
export const hEdge = (n: number, r: number, c: number) => r * (n - 1) + c;
export const vEdge = (n: number, r: number, c: number) => n * (n - 1) + r * n + c;
/** Whether edge `e` is horizontal, and the cell it starts from (top-left end). */
export function edgeAt(n: number, e: number): { horizontal: boolean; r: number; c: number } {
  const H = n * (n - 1);
  if (e < H) return { horizontal: true, r: Math.floor(e / (n - 1)), c: e % (n - 1) };
  const i = e - H;
  return { horizontal: false, r: Math.floor(i / n), c: i % n };
}

/** Direction steps for [up, down, left, right]. */
const STEP: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const OPP = [1, 0, 3, 2];
const neighbour = (n: number, cell: number, d: number) => {
  const r = Math.floor(cell / n) + STEP[d][0], c = (cell % n) + STEP[d][1];
  return r >= 0 && r < n && c >= 0 && c < n ? r * n + c : -1;
};

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

// ── Rules ──

/** Turn (true) or straight (false) at a cell with exactly two lines, else null. */
function shapeAt(g: Geometry, lines: ArrayLike<number>, cell: number): { turn: boolean; dirs: number[] } | null {
  const dirs = [0, 1, 2, 3].filter((d) => g.cellEdges[cell][d] >= 0 && lines[g.cellEdges[cell][d]] === 1);
  if (dirs.length !== 2) return null;
  return { turn: OPP[dirs[0]] !== dirs[1], dirs };
}

/** Pearls this set of lines breaks (for the red warning ring), given the lines drawn so far. */
export function brokenPearls(p: MasyuPuzzle, lines: ArrayLike<number>): Set<number> {
  const g = geometry(p.size);
  const bad = new Set<number>();
  p.pearls.forEach((pearl, cell) => {
    if (!pearl) return;
    const dirs = [0, 1, 2, 3].filter((d) => g.cellEdges[cell][d] >= 0 && lines[g.cellEdges[cell][d]] === 1);
    if (dirs.length > 2) { bad.add(cell); return; }
    if (pearl === 2) {
      if (dirs.length === 2 && OPP[dirs[0]] === dirs[1]) bad.add(cell);
      // Each line leaving a black pearl must go straight through the next cell.
      for (const d of dirs) {
        const next = neighbour(g.n, cell, d);
        const nd = [0, 1, 2, 3].filter((x) => g.cellEdges[next][x] >= 0 && lines[g.cellEdges[next][x]] === 1);
        if (nd.length === 2 && !nd.includes(d)) bad.add(cell);
      }
    } else {
      if (dirs.length === 2 && OPP[dirs[0]] !== dirs[1]) { bad.add(cell); return; }
      if (dirs.length === 2) {
        const a = shapeAt(g, lines, neighbour(g.n, cell, dirs[0])), b = shapeAt(g, lines, neighbour(g.n, cell, dirs[1]));
        if (a && b && !a.turn && !b.turn) bad.add(cell);
      }
    }
  });
  return bad;
}

/** Solved when the lines form one loop through every pearl, keeping every pearl's rule. */
export function isSolved(p: MasyuPuzzle, lines: ArrayLike<number>): boolean {
  const g = geometry(p.size);
  const deg = new Array<number>(g.n * g.n).fill(0);
  let count = 0, first = -1;
  for (let e = 0; e < g.edgeCount; e++) if (lines[e] === 1) { count++; deg[g.ends[e][0]]++; deg[g.ends[e][1]]++; if (first < 0) first = e; }
  if (!count || deg.some((d) => d !== 0 && d !== 2)) return false;
  if (p.pearls.some((pearl, c) => pearl && deg[c] !== 2)) return false;
  // One loop: walking from the first line visits every line.
  const start = g.ends[first][0];
  let seen = 1, at = g.ends[first][1], from = first;
  while (at !== start) {
    const next = g.cellEdges[at].find((e) => e >= 0 && e !== from && lines[e] === 1);
    if (next === undefined) return false;
    if (next === first) break;
    seen++; from = next;
    const [a, b] = g.ends[next];
    at = a === at ? b : a;
    if (seen > count) return false;
  }
  if (seen !== count) return false;
  return brokenPearls(p, lines).size === 0;
}

/** Lines as the "0/1" string the server compares against the stored answer. */
export const encodeLines = (lines: ArrayLike<number>, edgeCount: number) => Array.from({ length: edgeCount }, (_, e) => (lines[e] === 1 ? '1' : '0')).join('');
export const decodePearls = (s: string): Pearl[] => [...s].map((ch) => (ch === 'b' ? 2 : ch === 'w' ? 1 : 0));
export const encodePearls = (pearls: Pearl[]) => pearls.map((p) => (p === 2 ? 'b' : p === 1 ? 'w' : '.')).join('');

// ── Solver (counts up to `limit` solutions; used to keep only boards with one answer) ──

type State = { e: Int8Array; parent: Int32Array; edgesIn: Int32Array; on: number; closed: boolean };
function find(p: Int32Array, x: number): number {
  while (p[x] !== x) { p[x] = p[p[x]]; x = p[x]; }
  return x;
}

export function countSolutions(n: number, pearls: Pearl[], limit = 2, nodes = 40000): number {
  return solve(n, pearls, limit, nodes).count;
}

/** Up to `limit` solutions (as line arrays). `count` equals `limit` when the search ran out of budget. */
export function solve(n: number, pearls: Pearl[], limit = 2, nodes = 40000): { count: number; sols: number[][] } {
  const sols: number[][] = [];
  const g = geometry(n);
  const cells = n * n;
  const pearlCells = pearls.map((p, c) => (p ? c : -1)).filter((c) => c >= 0);
  const budget = { nodes };
  const init: State = { e: new Int8Array(g.edgeCount).fill(-1), parent: Int32Array.from({ length: cells }, (_, i) => i), edgesIn: new Int32Array(cells), on: 0, closed: false };
  const val = (s: State, e: number) => (e < 0 ? 0 : s.e[e]);

  const set = (s: State, edge: number, v: 0 | 1, queue: number[]): boolean => {
    if (edge < 0) return v === 0;
    if (s.e[edge] !== -1) return s.e[edge] === v;
    s.e[edge] = v;
    queue.push(edge);
    if (v === 1) {
      if (s.closed) return false;
      s.on++;
      const [a, b] = g.ends[edge];
      const ra = find(s.parent, a), rb = find(s.parent, b);
      if (ra === rb) {
        s.edgesIn[ra]++;
        if (s.edgesIn[ra] !== s.on) return false;
        s.closed = true;
        for (let i = 0; i < g.edgeCount; i++) if (s.e[i] === -1) { s.e[i] = 0; queue.push(i); }
      } else { s.parent[ra] = rb; s.edgesIn[rb] += s.edgesIn[ra] + 1; }
    }
    return true;
  };

  const cellRule = (s: State, d: number, queue: number[]): boolean => {
    let on = 0, unk = 0, u1 = -1;
    for (const x of g.cellEdges[d]) { if (x < 0) continue; if (s.e[x] === 1) on++; else if (s.e[x] === -1) { unk++; if (u1 < 0) u1 = x; } }
    const must = pearls[d] !== 0;
    if (on > 2 || (on === 1 && unk === 0) || (must && on + unk < 2)) return false;
    if (on === 2) { for (const x of g.cellEdges[d]) if (x >= 0 && s.e[x] === -1 && !set(s, x, 0, queue)) return false; }
    else if (on === 1 && unk === 1) { if (!set(s, u1, 1, queue)) return false; }
    else if (on === 0 && unk === 1) { if (!set(s, u1, 0, queue)) return false; }
    else if (must && on + unk === 2) { for (const x of g.cellEdges[d]) if (x >= 0 && s.e[x] === -1 && !set(s, x, 1, queue)) return false; }
    if (on === 1 && unk >= 2) {
      // An edge that would close a small loop while other lines lie outside it is ruled out.
      const root = find(s.parent, d);
      if (s.edgesIn[root] !== s.on) {
        for (const x of g.cellEdges[d]) {
          if (x < 0 || s.e[x] !== -1) continue;
          const [p, q] = g.ends[x];
          if (find(s.parent, p === d ? q : p) === root && !set(s, x, 0, queue)) return false;
        }
      }
    }
    return true;
  };

  const pearlRule = (s: State, d: number, queue: number[]): boolean => {
    const E = g.cellEdges[d];
    if (pearls[d] === 2) {
      for (const [a, b] of [[0, 1], [2, 3]]) {
        // One line on each axis: never straight through.
        const va = val(s, E[a]), vb = val(s, E[b]);
        if (va === 1 && !set(s, E[b], 0, queue)) return false;
        if (vb === 1 && !set(s, E[a], 0, queue)) return false;
        if (va === 0 && !set(s, E[b], 1, queue)) return false;
        if (vb === 0 && !set(s, E[a], 1, queue)) return false;
      }
      for (let dir = 0; dir < 4; dir++) {
        const next = neighbour(n, d, dir);
        const beyond = next < 0 ? -1 : g.cellEdges[next][dir];
        if (val(s, beyond) === 0 && !set(s, E[dir], 0, queue)) return false;
        if (val(s, E[dir]) === 1 && !set(s, beyond, 1, queue)) return false;
      }
    } else if (pearls[d] === 1) {
      for (const [a, b, c, e] of [[2, 3, 0, 1], [0, 1, 2, 3]]) {
        const va = val(s, E[a]), vb = val(s, E[b]);
        if (va === 1 || vb === 1) {
          if (!set(s, E[a], 1, queue) || !set(s, E[b], 1, queue) || !set(s, E[c], 0, queue) || !set(s, E[e], 0, queue)) return false;
          // Turn in at least one neighbour along the line.
          const na = neighbour(n, d, a), nb = neighbour(n, d, b);
          const ba = g.cellEdges[na][a], bb = g.cellEdges[nb][b];
          if (val(s, ba) === 1 && !set(s, bb, 0, queue)) return false;
          if (val(s, bb) === 1 && !set(s, ba, 0, queue)) return false;
        }
        if (va === 0 || vb === 0) { if (!set(s, E[a], 0, queue) || !set(s, E[b], 0, queue)) return false; }
      }
    }
    return true;
  };

  const propagate = (s: State, queue: number[]): boolean => {
    for (;;) {
      while (queue.length) {
        const edge = queue.pop()!;
        for (const d of g.ends[edge]) if (!cellRule(s, d, queue)) return false;
      }
      for (const d of pearlCells) if (!pearlRule(s, d, queue)) return false;
      if (!queue.length) return true;
    }
  };

  const clone = (s: State): State => ({ e: s.e.slice(), parent: s.parent.slice(), edgesIn: s.edgesIn.slice(), on: s.on, closed: s.closed });

  let found = 0;
  const search = (s: State) => {
    if (found >= limit || budget.nodes <= 0) return;
    budget.nodes--;
    if (s.closed) { found++; sols.push(Array.from(s.e, (v) => (v === 1 ? 1 : 0))); return; }
    let pick = -1;
    for (let d = 0; d < cells && pick < 0; d++) {
      let on = 0, cand = -1;
      for (const x of g.cellEdges[d]) { if (x < 0) continue; if (s.e[x] === 1) on++; else if (s.e[x] === -1 && cand < 0) cand = x; }
      if (on === 1 && cand >= 0) pick = cand;
    }
    if (pick < 0) for (const d of pearlCells) {
      const x = g.cellEdges[d].find((e) => e >= 0 && s.e[e] === -1);
      if (x !== undefined) { pick = x; break; }
    }
    if (pick < 0) return; // pearls all placed but no loop yet and no loose end: impossible
    for (const v of [1, 0] as const) {
      const next = clone(s);
      const q: number[] = [];
      if (set(next, pick, v, q) && propagate(next, q)) search(next);
      if (found >= limit) return;
    }
  };

  const q: number[] = Array.from({ length: g.edgeCount }, (_, i) => i);
  if (!propagate(init, q)) return { count: 0, sols };
  search(init);
  return { count: budget.nodes <= 0 ? limit : found, sols };
}

// ── Generation ──

/** A blob of squares (between cell centers) with no holes and no corner-only contacts: its outline is one loop. */
function growRegion(rows: number, cols: number, rand: () => number): Uint8Array {
  const inside = new Uint8Array(rows * cols);
  const at = (r: number, c: number) => (r >= 0 && r < rows && c >= 0 && c < cols ? inside[r * cols + c] : 0);
  const RING: [number, number][] = [[-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1]];
  const canAdd = (r: number, c: number) => {
    const ring = RING.map(([dr, dc]) => at(r + dr, c + dc));
    let runs = 0;
    for (let i = 0; i < 8; i++) if (ring[i] && !ring[(i + 7) % 8]) runs++;
    if (runs !== 1) return false;
    for (let k = 1; k < 8; k += 2) {
      const diag = ring[k], a = ring[k - 1], b = ring[(k + 1) % 8];
      if (diag && !a && !b) return false;
      if (!diag && a && b) return false;
    }
    return true;
  };
  inside[Math.floor(rand() * rows * cols)] = 1;
  let size = 1;
  const target = Math.round(rows * cols * (0.5 + rand() * 0.15));
  while (size < target) {
    const options: { i: number; w: number }[] = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (inside[r * cols + c]) continue;
      const k = at(r - 1, c) + at(r + 1, c) + at(r, c - 1) + at(r, c + 1);
      if (!k || !canAdd(r, c)) continue;
      options.push({ i: r * cols + c, w: k === 1 ? 6 : k === 2 ? 1.2 : 0.3 });
    }
    if (!options.length) break;
    let pick = rand() * options.reduce((s, o) => s + o.w, 0);
    const chosen = options.find((o) => (pick -= o.w) <= 0) ?? options[options.length - 1];
    inside[chosen.i] = 1;
    size++;
  }
  return inside;
}

function loopFromRegion(n: number, inside: Uint8Array): number[] {
  const m = n - 1;
  const at = (r: number, c: number) => (r >= 0 && r < m && c >= 0 && c < m ? inside[r * m + c] : 0);
  const g = geometry(n);
  const lines = new Array<number>(g.edgeCount).fill(0);
  // A horizontal edge between cells (r, c)–(r, c+1) borders squares (r−1, c) and (r, c).
  for (let r = 0; r < n; r++) for (let c = 0; c < m; c++) if (at(r - 1, c) !== at(r, c)) lines[hEdge(n, r, c)] = 1;
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (at(r, c - 1) !== at(r, c)) lines[vEdge(n, r, c)] = 1;
  return lines;
}

/** Per cell, the pearl this loop would satisfy there (0 when neither rule holds). */
function candidates(n: number, lines: ArrayLike<number>): Pearl[] {
  const g = geometry(n);
  const out: Pearl[] = new Array<Pearl>(n * n).fill(0);
  for (let cell = 0; cell < n * n; cell++) {
    const sh = shapeAt(g, lines, cell);
    if (!sh) continue;
    const [d0, d1] = sh.dirs;
    const s0 = shapeAt(g, lines, neighbour(n, cell, d0)), s1 = shapeAt(g, lines, neighbour(n, cell, d1));
    if (sh.turn) { if (s0 && s1 && !s0.turn && !s1.turn && s0.dirs.includes(d0) && s1.dirs.includes(d1)) out[cell] = 2; }
    else if ((s0 && s0.turn) || (s1 && s1.turn)) out[cell] = 1;
  }
  return out;
}

/**
 * One board with exactly one answer: its pearls and the answer's lines.
 * Start from a few pearls of a random loop; while two answers fit, add a pearl that one answer keeps and the other breaks.
 * Then drop pearls that are not needed, down to a floor that keeps the board fair.
 */
export function generate(n: number, seed: number): { pearls: Pearl[]; lines: number[] } {
  const rand = rng(seed);
  const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)];
  for (let attempt = 0; attempt < 200; attempt++) {
    const start = candidates(n, loopFromRegion(n, growRegion(n - 1, n - 1, rand)));
    const pearls: Pearl[] = start.map((p) => (p && rand() < (p === 2 ? 0.5 : 0.2) ? p : 0));
    let answer: number[] | null = null;
    for (let step = 0; step < n * n; step++) {
      const { count, sols } = solve(n, pearls, 2);
      if (count === 1 && sols.length === 1) { answer = sols[0]; break; }
      if (sols.length < 2) break;
      let [a, b] = rand() < 0.5 ? sols : [sols[1], sols[0]];
      let ca = candidates(n, a), cb = candidates(n, b);
      let options = ca.map((p, c) => (p && !pearls[c] && cb[c] !== p ? c : -1)).filter((c) => c >= 0);
      if (!options.length) {
        [a, b] = [b, a]; [ca, cb] = [cb, ca];
        options = ca.map((p, c) => (p && !pearls[c] && cb[c] !== p ? c : -1)).filter((c) => c >= 0);
      }
      if (!options.length) break;
      // Favour black pearls (they make for a livelier board than a sea of white ones).
      const blacks = options.filter((c) => ca[c] === 2);
      const c = blacks.length && rand() < 0.6 ? pick(blacks) : pick(options);
      pearls[c] = ca[c];
    }
    if (!answer) continue;
    // Thin out: drop pearls the answer does not need, keeping at least `floor`.
    const floor = Math.round(n * n * 0.15);
    const order = pearls.map((p, i) => (p ? i : -1)).filter((i) => i >= 0);
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    let shown = order.length;
    for (const c of order) {
      if (shown <= floor) break;
      const was = pearls[c];
      pearls[c] = 0;
      if (countSolutions(n, pearls) === 1) shown--; else pearls[c] = was;
    }
    return { pearls, lines: answer };
  }
  throw new Error('no masyu');
}

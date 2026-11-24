// 컬러 링크 (데블스 플랜 3 결승 2회차): two players take turns placing coloured stones on a 7×7 board.
// Every pair of same-coloured stones must still be joinable by its own line (6 cells or more, stones included)
// with no two lines crossing or sharing a cell; a colour with one stone so far must still have room for its
// partner. When a player thinks the last placement broke that, they call it impossible and the placer has to
// prove otherwise by drawing every line.
//
// This module holds the board rules, the proof checker and the solver (used by the AI and to show a way
// out after a failed proof). Pure and self-contained apart from the grid geometry it shares with 컬러 잇기.
import { geometry } from './colorlink';

export const CLD_N = 7;
export const CLD_CELLS = CLD_N * CLD_N;
export const CLD_COLORS = 14;
/** Cells on a line, both stones included. */
export const CLD_MIN = 6;
export const CLD_LETTERS = 'ABCDEFGHIJKLMN';
export const CLD_ROUNDS = 1;
export const CLD_TARGET = 1;

/** `board[cell]` = colour 1…14, 0 empty. */
export type CldBoard = number[];
/** `paths[colour]` = the line's cells from one stone to the other (or, for a lone stone, to where its partner would go). */
export type CldPaths = (number[] | null)[];

const { nbr } = geometry(CLD_N);
export const cldNeighbors = nbr;
export const rowOf = (cell: number) => Math.floor(cell / CLD_N);
export const colOf = (cell: number) => cell % CLD_N;
export const dist = (a: number, b: number) => Math.abs(rowOf(a) - rowOf(b)) + Math.abs(colOf(a) - colOf(b));
export const adjacent = (a: number, b: number) => dist(a, b) === 1;
export const letterOf = (color: number) => CLD_LETTERS[color - 1] ?? '?';
export const emptyBoard = (): CldBoard => Array(CLD_CELLS).fill(0);

/** Cells of each colour's stones (index = colour). */
export function stonesOf(board: ArrayLike<number>): number[][] {
  const out: number[][] = Array.from({ length: CLD_COLORS + 1 }, () => []);
  for (let i = 0; i < CLD_CELLS; i++) if (board[i]) out[board[i]].push(i);
  return out;
}

/** Stones of `color` not on the board yet (0–2). */
export const leftOf = (board: ArrayLike<number>, color: number) => {
  let n = 2;
  for (let i = 0; i < CLD_CELLS; i++) if (board[i] === color) n--;
  return n;
};
export const stonesLeft = (board: ArrayLike<number>) => {
  let n = CLD_COLORS * 2;
  for (let i = 0; i < CLD_CELLS; i++) if (board[i]) n--;
  return n;
};
export const emptyCount = (board: ArrayLike<number>) => {
  let n = 0;
  for (let i = 0; i < CLD_CELLS; i++) if (!board[i]) n++;
  return n;
};

/**
 * Stones the next placement must have: 1 to open a round, otherwise 2 of different colours — fewer only when
 * the supply or the board runs out (e.g. the last two stones left are one colour). 0: nothing can be placed.
 */
export function stonesToPlace(board: ArrayLike<number>, opening: boolean): number {
  const colors = Array.from({ length: CLD_COLORS }, (_, i) => i + 1).filter((k) => leftOf(board, k) > 0).length;
  return Math.min(opening ? 1 : 2, colors, emptyCount(board));
}

/** Whether `stones` ([cell, colour] pairs) is a legal placement: empty distinct cells, supply left, different colours. */
export function legalPlacement(board: ArrayLike<number>, stones: unknown, opening: boolean): stones is [number, number][] {
  if (!Array.isArray(stones)) return false;
  const need = stonesToPlace(board, opening);
  if (!need || stones.length !== need) return false;
  const cells = new Set<number>(), colors = new Set<number>();
  for (const s of stones) {
    if (!Array.isArray(s) || s.length !== 2) return false;
    const [cell, color] = s;
    if (!Number.isInteger(cell) || cell < 0 || cell >= CLD_CELLS || board[cell] || cells.has(cell)) return false;
    if (!Number.isInteger(color) || color < 1 || color > CLD_COLORS || colors.has(color) || leftOf(board, color) < 1) return false;
    cells.add(cell); colors.add(color);
  }
  return true;
}

export function place(board: ArrayLike<number>, stones: [number, number][]): CldBoard {
  const next = Array.from(board);
  for (const [cell, color] of stones) next[cell] = color;
  return next;
}

/**
 * Checks a proof: one line per colour on the board, each a run of side-by-side cells of at least CLD_MIN,
 * from a stone to its partner (or, for a lone stone, to an empty cell where the partner goes), over empty
 * cells only, and no two lines touching the same cell. `bad` lists colours whose line is missing or wrong;
 * `clash` the cells used twice.
 */
export function checkProof(board: ArrayLike<number>, paths: unknown): { ok: boolean; bad: number[]; clash: number[] } {
  const stones = stonesOf(board);
  const bad: number[] = [];
  const used = new Map<number, number>();
  const clash = new Set<number>();
  const list = Array.isArray(paths) ? paths : [];
  for (let k = 1; k <= CLD_COLORS; k++) {
    const st = stones[k];
    if (!st.length) continue;
    const path = list[k];
    if (!Array.isArray(path) || !pathOk(board, k, st, path)) { bad.push(k); continue; }
    for (const cell of path as number[]) {
      if (used.has(cell)) clash.add(cell);
      used.set(cell, k);
    }
  }
  for (const cell of clash) { const k = used.get(cell)!; if (!bad.includes(k)) bad.push(k); }
  // A line drawn for a colour that is not on the board is just ignored.
  return { ok: !bad.length && !clash.size, bad: bad.sort((a, b) => a - b), clash: [...clash] };
}

/** One colour's line on its own (ignores the other lines). */
export function pathOk(board: ArrayLike<number>, color: number, stones: number[], path: unknown[]): boolean {
  if (path.length < CLD_MIN || path.length > CLD_CELLS) return false;
  if (!path.every((c) => Number.isInteger(c) && (c as number) >= 0 && (c as number) < CLD_CELLS)) return false;
  const p = path as number[];
  if (new Set(p).size !== p.length) return false;
  for (let i = 1; i < p.length; i++) if (!adjacent(p[i - 1], p[i])) return false;
  const [a, b] = [p[0], p[p.length - 1]];
  if (stones.length === 2) {
    if (!((a === stones[0] && b === stones[1]) || (a === stones[1] && b === stones[0]))) return false;
    for (let i = 1; i < p.length - 1; i++) if (board[p[i]]) return false;
  } else {
    if (a !== stones[0]) return false;
    for (let i = 1; i < p.length; i++) if (board[p[i]]) return false;
  }
  return true;
}

/* ------------------------------------------------------------------ solver */

export type SolveStatus = 'ok' | 'none' | 'unknown';
export type SolveResult = { status: SolveStatus; paths: CldPaths | null; nodes: number };

/**
 * Looks for lines joining every colour on the board (a lone stone gets a line of exactly CLD_MIN cells,
 * ending where its partner can go). Depth-first, one colour at a time (the most cramped first), lines
 * grown toward their target, pruned by:
 *  - shortcuts: a line never needs to touch itself when the shortcut would still be long enough (it uses fewer cells);
 *  - reach and room: every colour still to draw needs its stones to share an open region big enough for its line,
 *    and regions must hold all the colours that can only use them;
 *  - dead ends already seen (same cells taken, same colours done).
 * `cap` bounds the work: past it the answer is 'unknown'.
 */
export function solve(board: ArrayLike<number>, opts: { cap?: number; rand?: () => number } = {}): SolveResult {
  const cap = opts.cap ?? 200_000;
  const rand = opts.rand;
  const N = CLD_CELLS;
  const occ = new Int8Array(N);
  for (let i = 0; i < N; i++) occ[i] = board[i];
  const stones = stonesOf(board);
  const colors: number[] = [];
  for (let k = 1; k <= CLD_COLORS; k++) if (stones[k].length) colors.push(k);
  const done = new Uint8Array(CLD_COLORS + 1);
  const paths: CldPaths = Array(CLD_COLORS + 1).fill(null);
  const pos = new Int8Array(N).fill(-1);
  const comp = new Int8Array(N);
  const compSize: number[] = [];
  const need: number[] = [];
  const stack = new Int8Array(N);
  const seen = new Set<string>();
  let nodes = 0, aborted = false;
  let doneMask = 0;

  const label = () => {
    comp.fill(-1);
    compSize.length = 0;
    let count = 0;
    for (let i = 0; i < N; i++) {
      if (occ[i] || comp[i] >= 0) continue;
      let sp = 0, size = 0;
      stack[sp++] = i; comp[i] = count;
      while (sp) {
        const x = stack[--sp]; size++;
        for (const j of nbr[x]) if (!occ[j] && comp[j] < 0) { comp[j] = count; stack[sp++] = j; }
      }
      compSize.push(size);
      count++;
    }
    return count;
  };
  // Open regions next to a cell (at most 4).
  const touching = (cell: number) => {
    const out: number[] = [];
    for (const j of nbr[cell]) if (!occ[j] && !out.includes(comp[j])) out.push(comp[j]);
    return out;
  };
  /** Regions both cells touch that can hold `size` more cells, or null when none can. */
  const shared = (a: number, b: number, size: number) => {
    const ta = touching(a), out: number[] = [];
    for (const r of touching(b)) if (ta.includes(r) && compSize[r] >= size) out.push(r);
    return out;
  };

  /** Can every colour still be drawn? `cur`: the colour being drawn now (head, cells so far). */
  const viable = (cur: number, head: number, len: number) => {
    const count = label();
    need.length = count; need.fill(0);
    const charge = (regions: number[], size: number) => { if (regions.length === 1) need[regions[0]] += size; };
    if (cur) {
      if (stones[cur].length === 2) {
        const t = stones[cur][0] === pathStart(cur) ? stones[cur][1] : stones[cur][0];
        if (!(adjacent(head, t) && len + 1 >= CLD_MIN)) {
          const more = Math.max(CLD_MIN - len - 1, dist(head, t) - 1);
          const regions = shared(head, t, more);
          if (!regions.length) return false;
          charge(regions, more);
        }
      } else {
        const more = CLD_MIN - len;
        if (more > 0) {
          const regions = touching(head).filter((r) => compSize[r] >= more);
          if (!regions.length) return false;
          charge(regions, more);
        }
      }
    }
    for (const k of colors) {
      if (done[k] || k === cur) continue;
      const st = stones[k];
      if (st.length === 2) {
        const size = Math.max(CLD_MIN - 2, dist(st[0], st[1]) - 1);
        const regions = shared(st[0], st[1], size);
        if (!regions.length) return false;
        charge(regions, size);
      } else {
        const regions = touching(st[0]).filter((r) => compSize[r] >= CLD_MIN - 1);
        if (!regions.length) return false;
        charge(regions, CLD_MIN - 1);
      }
    }
    for (let r = 0; r < count; r++) if (need[r] > compSize[r]) return false;
    return true;
  };

  const starts: number[] = Array(CLD_COLORS + 1).fill(-1);
  const pathStart = (k: number) => starts[k];

  const freeAround = (cell: number) => { let n = 0; for (const j of nbr[cell]) if (!occ[j]) n++; return n; };
  const pickColor = () => {
    let best = -1, bestScore = Infinity;
    for (const k of colors) {
      if (done[k]) continue;
      const st = stones[k];
      const free = Math.min(...st.map(freeAround));
      // Most cramped first; pairs before lone stones (those bend anywhere); then nearer pairs.
      const score = free * 100 + (st.length === 2 ? 0 : 50) + (st.length === 2 ? dist(st[0], st[1]) : 0);
      if (score < bestScore) { bestScore = score; best = k; }
    }
    return best;
  };

  const key = () => {
    let lo = 0, hi = 0;
    for (let i = 0; i < N; i++) if (occ[i] && !board[i]) { if (i < 31) lo |= 1 << i; else hi |= 1 << (i - 31); }
    return `${lo},${hi},${doneMask}`;
  };

  const finish = (k: number, path: number[]): boolean => {
    paths[k] = path.slice();
    done[k] = 1; doneMask |= 1 << k;
    const ok = viable(0, -1, 0) && next();
    if (!ok) { done[k] = 0; doneMask &= ~(1 << k); paths[k] = null; }
    return ok;
  };

  const next = (): boolean => {
    const k = pickColor();
    if (k < 0) return true;
    if (++nodes > cap) { aborted = true; return false; }
    const id = key();
    if (seen.has(id)) return false;
    const st = stones[k];
    let ok: boolean;
    if (st.length === 2) {
      // Start from the more cramped stone.
      const [s, t] = freeAround(st[0]) <= freeAround(st[1]) ? [st[0], st[1]] : [st[1], st[0]];
      starts[k] = s;
      pos[s] = 0;
      ok = growPair(k, [s], t);
      pos[s] = -1;
    } else {
      starts[k] = st[0];
      ok = growSingle(k, [st[0]], new Set());
    }
    if (!ok && !aborted) seen.add(id);
    return ok;
  };

  const growPair = (k: number, path: number[], t: number): boolean => {
    if (++nodes > cap) { aborted = true; return false; }
    const head = path[path.length - 1], len = path.length;
    // Next to the target and long enough: stepping in is never worse than wandering on.
    if (adjacent(head, t) && len + 1 >= CLD_MIN) { path.push(t); const ok = finish(k, path); path.pop(); return ok; }
    const moves = nbr[head].filter((j) => !occ[j] && !touchesEarlier(j, path, t));
    moves.sort((a, b) => dist(a, t) - dist(b, t) || (rand ? rand() - 0.5 : 0));
    for (const j of moves) {
      occ[j] = k; pos[j] = len; path.push(j);
      const ok = viable(k, j, len + 1) && growPair(k, path, t);
      path.pop(); occ[j] = 0; pos[j] = -1;
      if (ok) return true;
      if (aborted) return false;
    }
    return false;
  };
  // Stepping to j next to an earlier cell of the line: the shortcut through that cell uses fewer cells,
  // so skip j when the shortcut can still reach CLD_MIN.
  const touchesEarlier = (j: number, path: number[], t: number) => {
    const len = path.length;
    for (const m of nbr[j]) {
      const i = pos[m];
      if (i >= 0 && i < len - 1 && occ[m] && path[i] === m && i + 2 + dist(j, t) >= CLD_MIN) return true;
    }
    return false;
  };

  const growSingle = (k: number, path: number[], tried: Set<string>): boolean => {
    if (++nodes > cap) { aborted = true; return false; }
    if (path.length === CLD_MIN) {
      // Lines with the same cells leave the same board: try each set of cells once.
      const id = path.slice().sort((a, b) => a - b).join('.');
      if (tried.has(id)) return false;
      tried.add(id);
      return finish(k, path);
    }
    const head = path[path.length - 1];
    // Hug walls and other lines first, so open ground is left for the rest.
    const moves = nbr[head].filter((j) => !occ[j]);
    moves.sort((a, b) => freeAround(a) - freeAround(b) || (rand ? rand() - 0.5 : 0));
    for (const j of moves) {
      occ[j] = k; path.push(j);
      const ok = viable(k, j, path.length) && growSingle(k, path, tried);
      path.pop(); occ[j] = 0;
      if (ok) return true;
      if (aborted) return false;
    }
    return false;
  };

  const found = viable(0, -1, 0) && next();
  return { status: found ? 'ok' : aborted ? 'unknown' : 'none', paths: found ? tidy(board, paths) : null, nodes };
}

/**
 * Shortens a solution's lines where it can: each pair's line is swapped for the shortest route around the
 * other lines when that route still has at least CLD_MIN cells (lone stones' lines are CLD_MIN already).
 * The board stays joined; the lines read better and leave more open ground for the AI to count.
 */
export function tidy(board: ArrayLike<number>, paths: CldPaths): CldPaths {
  const out = paths.map((p) => (p ? [...p] : null));
  const used = new Int8Array(CLD_CELLS);
  for (let i = 0; i < CLD_CELLS; i++) if (board[i]) used[i] = 1;
  out.forEach((p) => p?.forEach((c) => { used[c] = 1; }));
  const stones = stonesOf(board);
  for (let pass = 0; pass < 2; pass++) {
    for (let k = 1; k < out.length; k++) {
      const p = out[k];
      if (!p || stones[k].length !== 2) continue;
      for (let i = 1; i < p.length - 1; i++) used[p[i]] = 0;
      const route = shortestRoute(used, p[0], p[p.length - 1]);
      const best = route && route.length >= CLD_MIN && route.length < p.length ? route : p;
      for (let i = 1; i < best.length - 1; i++) used[best[i]] = 1;
      out[k] = best;
    }
  }
  return out;
}

/** Breadth-first shortest route from stone a to stone b over cells not in `used` (a and b are stones). */
function shortestRoute(used: Int8Array, a: number, b: number): number[] | null {
  const prev = new Int16Array(CLD_CELLS).fill(-1);
  const queue = [a];
  prev[a] = a;
  for (let q = 0; q < queue.length; q++) {
    const x = queue[q];
    for (const j of nbr[x]) {
      if (prev[j] >= 0) continue;
      if (j === b) {
        prev[j] = x;
        const route = [b];
        for (let c = x; c !== a; c = prev[c]) route.push(c);
        route.push(a);
        return route.reverse();
      }
      if (used[j]) continue;
      prev[j] = x;
      queue.push(j);
    }
  }
  return null;
}

/** Lone colours on the board (one stone placed). */
export const loneColors = (board: ArrayLike<number>) => stonesOf(board).flatMap((st, k) => (k && st.length === 1 ? [k] : []));

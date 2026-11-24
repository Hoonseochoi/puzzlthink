// 컬러 링크 AI (어려움 only). Plays best by the rules' own logic:
//
// - It calls 불가능 exactly when the solver proves the board cannot be joined, and proves its own boards with the
//   solver's lines, so it never loses a proof it could win and never calls a board that can be saved.
// - Placing: a player can always complete two lone colours at the ends of their lines, so the only way to get
//   stuck is to face exactly one lone colour with no room left for a new colour's line. The AI looks for a
//   placement that leaves the opponent exactly there (checked cell by cell with the solver). Failing that it
//   keeps the race of space in its favour: it counts how many more 6-cell lines the free ground still holds
//   and steers to the side of that count the opponent cannot win from, and it avoids placements that hand
//   the opponent such a finishing move.
import {
  CLD_CELLS, CLD_COLORS, CLD_MIN, type CldBoard, type CldPaths, cldNeighbors, emptyCount, leftOf, loneColors, place, solve,
  stonesOf, stonesToPlace,
} from './colorLinkDuel';
import { rng } from './colorlink';

export type CldAiMove = { kind: 'declare' } | { kind: 'place'; stones: [number, number][] };

const FAST_CAP = 40_000;
const SURE_CAP = 4_000_000;

/** The board after the opponent's move: call 불가능 only when the solver proves it. */
export const aiShouldDeclare = (board: ArrayLike<number>) => solve(board, { cap: SURE_CAP }).status === 'none';

/** Lines that prove the board (the AI's proof), or null when it cannot. */
export const aiProof = (board: ArrayLike<number>): CldPaths | null => solve(board, { cap: SURE_CAP }).paths;

/* ------------------------------------------------------------------ space counting */

/** Cells no stone or line uses in `paths`. */
function freeCells(board: ArrayLike<number>, paths: CldPaths): Uint8Array {
  const free = new Uint8Array(CLD_CELLS);
  for (let i = 0; i < CLD_CELLS; i++) free[i] = board[i] ? 0 : 1;
  for (const p of paths) if (p) for (const c of p) free[c] = 0;
  return free;
}

/** A simple run of `len` free cells starting at `start` (itself free), hugging walls; null when none. */
function runFrom(free: Uint8Array, start: number, len: number): number[] | null {
  const path = [start];
  free[start] = 0;
  const grow = (): boolean => {
    if (path.length === len) return true;
    const head = path[path.length - 1];
    const moves = cldNeighbors[head].filter((j) => free[j]);
    moves.sort((a, b) => around(free, a) - around(free, b));
    for (const j of moves) {
      free[j] = 0; path.push(j);
      if (grow()) return true;
      path.pop(); free[j] = 1;
    }
    return false;
  };
  const ok = grow();
  for (const c of path) free[c] = 1;
  return ok ? path : null;
}
const around = (free: Uint8Array, cell: number) => { let n = 0; for (const j of cldNeighbors[cell]) if (free[j]) n++; return n; };

/** Roughly how many more new colours' lines (CLD_MIN cells each) the free ground holds: greedy packing, corners first. */
export function freeLines(free: Uint8Array): number {
  const f = free.slice();
  let count = 0;
  for (;;) {
    const cells = [];
    for (let i = 0; i < CLD_CELLS; i++) if (f[i]) cells.push(i);
    cells.sort((a, b) => around(f, a) - around(f, b));
    let found: number[] | null = null;
    for (const c of cells) { found = runFrom(f, c, CLD_MIN); if (found) break; }
    if (!found) return count;
    for (const c of found) f[c] = 0;
    count++;
  }
}

/* ------------------------------------------------------------------ race of space */

// Abstract race: `s` lone colours facing the mover (always odd after the opening stone), `f` free lines.
// Moves: complete two lone colours (s-2), complete one and start one (f-1), start two (s+2, f-2).
// The mover with one lone colour and no free line is stuck. WIN[s][f]: the mover wins.
const MAX_S = 15, MAX_F = 12;
const WIN: boolean[][] = (() => {
  const win = Array.from({ length: MAX_S + 3 }, () => Array<boolean>(MAX_F + 1).fill(false));
  for (let f = 0; f <= MAX_F; f++) {
    for (let s = MAX_S; s >= 0; s--) {
      const next: [number, number][] = [];
      if (s >= 2) next.push([s - 2, f]);
      if (s >= 1 && f >= 1) next.push([s, f - 1]);
      if (f >= 2 && s + 2 <= MAX_S) next.push([s + 2, f - 2]);
      win[s][f] = next.some(([a, b]) => !win[a][b]);
    }
  }
  return win;
})();
export const raceWin = (s: number, f: number) => WIN[Math.min(s, MAX_S)][Math.min(f, MAX_F)];

/* ------------------------------------------------------------------ placements */

/** Every legal placement, as [cell, colour] lists. New colours are interchangeable, so one stands for all. */
function placements(board: CldBoard, opening: boolean): [number, number][][] {
  const need = stonesToPlace(board, opening);
  if (!need) return [];
  const lone = loneColors(board);
  const unused = Array.from({ length: CLD_COLORS }, (_, i) => i + 1).filter((k) => leftOf(board, k) === 2);
  const empty: number[] = [];
  for (let i = 0; i < CLD_CELLS; i++) if (!board[i]) empty.push(i);
  const kinds: number[] = [...lone, ...(unused.length ? [unused[0]] : [])];
  const out: [number, number][][] = [];
  if (need === 1) {
    for (const k of kinds) for (const c of empty) out.push([[c, k]]);
    return out;
  }
  for (let a = 0; a < kinds.length; a++) {
    for (let b = a; b < kinds.length; b++) {
      let ka = kinds[a], kb = kinds[b];
      if (ka === kb) {
        // Two new colours.
        if (!unused.length || lone.includes(ka) || unused.length < 2) continue;
        ka = unused[0]; kb = unused[1];
        for (let i = 0; i < empty.length; i++) for (let j = i + 1; j < empty.length; j++) out.push([[empty[i], ka], [empty[j], kb]]);
        continue;
      }
      for (const c of empty) for (const d of empty) if (c !== d) out.push([[c, ka], [d, kb]]);
    }
  }
  return out;
}

/** Whether a player facing `board` (two stones to place) is stuck: one lone colour and no cell for a new colour. */
export function stuck(board: CldBoard, budget = { n: Infinity }): boolean {
  if (stonesToPlace(board, false) < 2) return false;
  const lone = loneColors(board);
  if (lone.length !== 1) return lone.length === 0 ? stuckFresh(board, budget) : false;
  const unused = Array.from({ length: CLD_COLORS }, (_, i) => i + 1).find((k) => leftOf(board, k) === 2);
  if (!unused) return false;
  // Completing the lone colour at the end of its line is always free, so it comes down to fitting one new colour.
  for (let c = 0; c < CLD_CELLS; c++) {
    if (board[c]) continue;
    if (budget.n-- <= 0) return false;
    const trial = board.slice(); trial[c] = unused;
    if (solve(trial, { cap: FAST_CAP }).status !== 'none') return false;
  }
  return true;
}
// No lone colour: two new colours have to fit (only reachable through odd placements, kept for completeness).
function stuckFresh(board: CldBoard, budget: { n: number }): boolean {
  const unused = Array.from({ length: CLD_COLORS }, (_, i) => i + 1).filter((k) => leftOf(board, k) === 2);
  if (unused.length < 2) return false;
  for (let c = 0; c < CLD_CELLS; c++) {
    if (board[c]) continue;
    if (budget.n-- <= 0) return false;
    const trial = board.slice(); trial[c] = unused[0];
    const res = solve(trial, { cap: FAST_CAP });
    if (res.status !== 'none' && !stuck(trial, budget)) return false;
  }
  return true;
}

type Scored = { stones: [number, number][]; board: CldBoard; score: number; s: number; f: number };

/**
 * The AI's placement. `deadline` (ms timestamp) bounds the thinking; `seed` varies its choice between
 * equally good placements.
 */
export function aiPlace(board: CldBoard, opening: boolean, seed = Date.now(), deadline = Date.now() + 2500): [number, number][] {
  const rand = rng(seed);
  const all = placements(board, opening);
  if (!all.length) return [];
  if (opening) {
    // Any opening stone; away from the very edge leaves more for the race.
    const inner = all.filter(([[c]]) => { const r = Math.floor(c / 7), q = c % 7; return r > 0 && r < 6 && q > 0 && q < 6; });
    return (inner.length ? inner : all)[Math.floor(rand() * (inner.length || all.length))];
  }
  // Shuffle, then keep the placements the solver can join.
  for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
  const good: Scored[] = [];
  let hardest: { stones: [number, number][]; nodes: number } | null = null;
  for (const stones of all) {
    // Out of time: stop with what was found (a squeezed board with nothing joinable gets a little longer).
    if (Date.now() > deadline && (good.length || Date.now() > deadline + 1500)) break;
    const next = place(board, stones);
    const res = solve(next, { cap: FAST_CAP });
    if (res.status !== 'ok') {
      // Nothing joinable at all: keep the one that is hardest to see through.
      if (!hardest || res.nodes > hardest.nodes) hardest = { stones, nodes: res.nodes };
      continue;
    }
    const s = loneColors(next).length;
    const f = freeLines(freeCells(next, res.paths!));
    // The opponent is stuck only facing one lone colour with no free line in some way of joining.
    const score = (s === 1 && f === 0 ? 1000 : 0) + (raceWin(s, f) ? 0 : 100) - f + rand() * 0.5;
    good.push({ stones, board: next, score, s, f });
  }
  if (!good.length) return hardest?.stones ?? all[0];
  good.sort((a, b) => b.score - a.score);
  // Placements that may leave the opponent stuck: confirm with every cell.
  for (const cand of good) {
    if (cand.score < 1000 || Date.now() > deadline + 1500) break;
    if (stuck(cand.board)) return cand.stones;
    cand.score -= 1000;
  }
  good.sort((a, b) => b.score - a.score);
  // Among the rest, skip placements after which the opponent has a finishing move of their own.
  const end = Date.now() + Math.max(600, deadline - Date.now());
  for (const cand of good.slice(0, 12)) {
    if (Date.now() > end) return cand.stones;
    if (!opponentFinishes(cand.board, end)) return cand.stones;
  }
  return good[0].stones;
}

/** Whether the player to move on `board` has a placement that leaves the other one stuck. */
function opponentFinishes(board: CldBoard, end: number): boolean {
  const options = placements(board, false);
  for (const stones of options) {
    if (Date.now() > end) return false;
    const next = place(board, stones);
    if (loneColors(next).length !== 1) continue;
    const res = solve(next, { cap: FAST_CAP });
    if (res.status !== 'ok') continue;
    if (freeLines(freeCells(next, res.paths!)) > 0) continue;
    if (stuck(next, { n: 60 })) return true;
  }
  return false;
}

/** Whether the AI, as the round's loser, takes the first placement. */
export const aiGoesFirst = () => AI_FIRST;
/** Set from self-play (scripts/color-link-duel-arena.ts): the side that wins more often between two AIs. */
const AI_FIRST = false;

export const boardFull = (board: ArrayLike<number>) => emptyCount(board) === 0;
export { stonesOf };

/* ------------------------------------------------------------------ one entry point (page or worker) */

export type CldAiRequest =
  | { kind: 'turn'; board: CldBoard; opening: boolean; seed: number; thinkMs: number }
  | { kind: 'proof'; board: CldBoard };
export type CldAiAnswer = { move?: CldAiMove; proof?: CldPaths | null };

/** The AI's turn (call 불가능, or place) or its proof. */
export function cldAiAnswer(request: CldAiRequest): CldAiAnswer {
  if (request.kind === 'proof') return { proof: aiProof(request.board) };
  if (!request.opening && aiShouldDeclare(request.board)) return { move: { kind: 'declare' } };
  const stones = aiPlace(request.board, request.opening, request.seed, Date.now() + request.thinkMs);
  return { move: stones.length ? { kind: 'place', stones } : { kind: 'declare' } };
}

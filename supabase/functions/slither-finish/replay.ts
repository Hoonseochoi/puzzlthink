// Server replay of a 슬리더링크 challenge run: rebuilds the board from its seed and plays the browser's moves on it.
import { generatePuzzle, hintEdges, isSolved } from './slitherlink.ts';

/** Rules that void a clear (under TRUSTED_MS only). */
export const MAX_FEW_ERASES = 10; // 10 or fewer lines taken back: 15 of the first 97 clears, all from 4 of 41 players
export const AWAY_LIMIT = 3; // left the board (another tab or app) this many times, each for AWAY_MIN_MS or longer
export const AWAY_MIN_MS = 2_000;
export const TRUSTED_MS = 20 * 60_000; // a run this long is never voided
// Suspicion signals: recorded with the run for review, they don't block the record.
export const MIN_MARK_MOVES = 1; // no ✕ at all …
export const MANY_ERASES = 10; // … with little erasing
export const MIN_MS = 120_000; // 11×11 under 2 minutes
export const WIPE_EDGES = 8; // one step clearing this many edges = a wipe (전체 지우기)
export const BURST_MARKS = 30; // ✕ placed back to back, with no line between and no pause
export const BURST_GAP_MS = 2_000; // a longer gap between ✕ steps is a pause
export const CLEAN_SHARE = 0.5; // share of the loop drawn in one streak without a wrong line or an erase
export const MAX_HINTS = 1;
export const MAX_STEPS = 5000;

export type Signals = {
  steps: number; lineAdds: number; wrongLines: number; wipes: number;
  /** Most ✕ placed back to back (no line move between, no pause over BURST_GAP_MS when step times are known), and how long it took. */
  markBurst: number; markBurstMs: number | null;
  /** Longest streak of correct lines with no wrong line or erase in between, as a share of the loop; and the same after the last wipe. */
  cleanShare: number; cleanAfterWipe: number | null;
  /** Time of the last wipe and of the whole run (client clock), when step times are known. */
  lastWipeMs: number | null; endMs: number | null;
  suspects: ('no_marks' | 'too_fast' | 'mark_burst' | 'wipe_clean' | 'clean_streak')[];
};
export type Check = { cleared: boolean; hints: number; markMoves: number; eraseMoves: number; flag: 'few_erases' | 'left_board' | null; signals: Signals };
const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v);

/**
 * `steps`: `{ c: [[edge, 0|1|2], …] }` for a move, `{ h: [r, c] }` for a hint, each with an optional `t` (ms since the start, client clock).
 * `tookMs`: run time measured on the server. `awayCount`: times the player left the board for AWAY_MIN_MS or longer.
 */
export function checkRun(dots: number, seed: number, steps: unknown[], tookMs: number, awayCount = 0): Check {
  const puzzle = generatePuzzle(dots, seed);
  const marks = new Array<number>(puzzle.solution.length).fill(0);
  const locked = new Set<number>();
  let hints = 0, markMoves = 0, eraseMoves = 0, valid = steps.length <= MAX_STEPS;
  const loopLen = puzzle.solution.reduce((n, v) => n + (v ? 1 : 0), 0);
  let lineAdds = 0, wrongLines = 0, wipes = 0, lastWipeMs: number | null = null, endMs: number | null = null;
  let burst = 0, burstStart: number | null = null, lastMarkT: number | null = null, markBurst = 0, markBurstMs: number | null = null;
  let clean = 0, bestClean = 0, bestAfterWipe = 0;
  for (const raw of valid ? steps : []) {
    const step = (raw ?? {}) as { c?: unknown; h?: unknown; t?: unknown };
    const t = typeof step.t === 'number' && Number.isFinite(step.t) ? step.t : null;
    if (t !== null) endMs = t;
    if (Array.isArray(step.h)) {
      const [r, c] = step.h as unknown[];
      if (!isInt(r) || !isInt(c) || ++hints > MAX_HINTS) { valid = false; break; }
      for (const e of hintEdges(puzzle, r, c)) { marks[e] = puzzle.solution[e] ? 1 : 2; locked.add(e); }
      burst = 0;
      continue;
    }
    if (!Array.isArray(step.c)) { valid = false; break; }
    let marked = false, erased = false, newMarks = 0, good = 0, bad = 0, cleared0 = 0;
    for (const change of step.c as unknown[]) {
      const [e, v] = Array.isArray(change) ? change : [];
      if (!isInt(e) || e < 0 || e >= marks.length || (v !== 0 && v !== 1 && v !== 2) || locked.has(e)) { valid = false; break; }
      if (v === 2 && marks[e] !== 2) { marked = true; newMarks++; }
      if (v !== 1 && marks[e] === 1) erased = true;
      if (v === 1 && marks[e] !== 1) { if (puzzle.solution[e]) good++; else bad++; }
      if (v === 0 && marks[e] !== 0) cleared0++;
      marks[e] = v;
    }
    if (!valid) break;
    if (marked) markMoves++;
    if (erased) eraseMoves++;
    lineAdds += good + bad; wrongLines += bad;
    if (cleared0 >= WIPE_EDGES) { wipes++; lastWipeMs = t; bestAfterWipe = 0; clean = 0; }
    // ✕ bursts: ✕-only steps back to back; a line move, an erase or a pause ends one.
    const markOnly = newMarks > 0 && good + bad === 0 && !erased;
    if (markOnly && (burst === 0 || t === null || lastMarkT === null || t - lastMarkT <= BURST_GAP_MS)) {
      if (burst === 0) burstStart = t;
      burst += newMarks;
    } else if (markOnly) { burst = newMarks; burstStart = t; }
    else if (good + bad > 0 || erased) burst = 0;
    if (markOnly) lastMarkT = t;
    if (burst > markBurst) { markBurst = burst; markBurstMs = t !== null && burstStart !== null ? t - burstStart : null; }
    // Clean streak: correct lines only; a wrong line or an erase starts over (✕ moves don't break it).
    if (bad || erased) clean = 0; else clean += good;
    bestClean = Math.max(bestClean, clean);
    if (wipes) bestAfterWipe = Math.max(bestAfterWipe, clean);
  }
  const cleared = valid && isSolved(puzzle, marks);
  const flag = !cleared || tookMs >= TRUSTED_MS ? null
    : eraseMoves <= MAX_FEW_ERASES ? 'few_erases'
      : awayCount >= AWAY_LIMIT ? 'left_board' : null;
  const share = (n: number) => Math.round((n / Math.max(1, loopLen)) * 100) / 100;
  const cleanShare = share(bestClean), cleanAfterWipe = wipes ? share(bestAfterWipe) : null;
  const suspects: Signals['suspects'] = [];
  if (cleared && markMoves < MIN_MARK_MOVES && eraseMoves < MANY_ERASES) suspects.push('no_marks');
  if (cleared && tookMs < MIN_MS) suspects.push('too_fast');
  if (markBurst >= BURST_MARKS) suspects.push('mark_burst');
  if (cleanAfterWipe !== null && cleanAfterWipe >= CLEAN_SHARE) suspects.push('wipe_clean');
  if (cleanShare >= CLEAN_SHARE) suspects.push('clean_streak');
  const signals: Signals = { steps: steps.length, lineAdds, wrongLines, wipes, markBurst, markBurstMs, cleanShare, cleanAfterWipe, lastWipeMs, endMs, suspects };
  return { cleared, hints, markMoves, eraseMoves, flag, signals };
}

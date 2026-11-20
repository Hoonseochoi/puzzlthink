// Server replay of a 슬리더링크 challenge run: rebuilds the board from its seed and plays the browser's moves on it.
import { generatePuzzle, hintEdges, isSolved } from './slitherlink.ts';

/** Rules for a clear that counts. */
export const MIN_MARK_MOVES = 1; // at least one ✕ placed by the player
export const MIN_ERASE_MOVES = 3; // lines taken back at least this often
export const MANY_ERASES = 10; // this much erasing shows a real solve even without any ✕
export const MIN_MS = 120_000; // 11×11 under 2 minutes is not a human solve
export const MAX_HINTS = 1;
export const MAX_STEPS = 5000;

export type Check = { cleared: boolean; hints: number; markMoves: number; eraseMoves: number; flag: 'no_marks' | 'few_erases' | 'too_fast' | null };
const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v);

/** `steps`: `{ c: [[edge, 0|1|2], …] }` for a move, `{ h: [r, c] }` for a hint. `tookMs`: run time measured on the server. */
export function checkRun(dots: number, seed: number, steps: unknown[], tookMs: number): Check {
  const puzzle = generatePuzzle(dots, seed);
  const marks = new Array<number>(puzzle.solution.length).fill(0);
  const locked = new Set<number>();
  let hints = 0, markMoves = 0, eraseMoves = 0, valid = steps.length <= MAX_STEPS;
  for (const raw of valid ? steps : []) {
    const step = (raw ?? {}) as { c?: unknown; h?: unknown };
    if (Array.isArray(step.h)) {
      const [r, c] = step.h as unknown[];
      if (!isInt(r) || !isInt(c) || ++hints > MAX_HINTS) { valid = false; break; }
      for (const e of hintEdges(puzzle, r, c)) { marks[e] = puzzle.solution[e] ? 1 : 2; locked.add(e); }
      continue;
    }
    if (!Array.isArray(step.c)) { valid = false; break; }
    let marked = false, erased = false;
    for (const change of step.c as unknown[]) {
      const [e, v] = Array.isArray(change) ? change : [];
      if (!isInt(e) || e < 0 || e >= marks.length || (v !== 0 && v !== 1 && v !== 2) || locked.has(e)) { valid = false; break; }
      if (v === 2 && marks[e] !== 2) marked = true;
      if (v !== 1 && marks[e] === 1) erased = true;
      marks[e] = v;
    }
    if (!valid) break;
    if (marked) markMoves++;
    if (erased) eraseMoves++;
  }
  const cleared = valid && isSolved(puzzle, marks);
  const flag = !cleared ? null
    : markMoves < MIN_MARK_MOVES && eraseMoves < MANY_ERASES ? 'no_marks'
      : eraseMoves < MIN_ERASE_MOVES ? 'few_erases'
        : tookMs < MIN_MS ? 'too_fast' : null;
  return { cleared, hints, markMoves, eraseMoves, flag };
}

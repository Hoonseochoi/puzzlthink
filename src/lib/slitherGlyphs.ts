import { type Geometry, edgeAt } from './slitherlink';

export { CUTE_DIGITS, DIGIT_PEN, DIGIT_STRIPE, DIGIT_STRIPE_DASH, starPath } from './slitherDigits';

/** Which bulb colour sits on an edge: neighbours along a run and around a corner always differ. */
export const bulbIndex = (horizontal: boolean, r: number, c: number, n: number) => (r * 3 + c * 2 + (horizontal ? 1 : 0)) % n;

/** Where the star sits: the middle of the loop's top edge (row nearest the top, then the middle of that run). */
export function starSpot(g: Geometry, solution: number[]): { x: number; y: number } | null {
  let best: { r: number; cs: number[] } | null = null;
  for (let e = 0; e < (g.rows + 1) * g.cols; e++) {
    if (!solution[e]) continue;
    const { r, c } = edgeAt(g, e);
    if (!best || r < best.r) best = { r, cs: [c] };
    else if (r === best.r) best.cs.push(c);
  }
  if (!best) return null;
  // The first run of horizontal edges on that row.
  const run = [best.cs[0]];
  for (const c of best.cs.slice(1)) { if (c === run[run.length - 1] + 1) run.push(c); else break; }
  return { x: (run[0] + run[run.length - 1]) / 2 + 1, y: best.r + 0.5 };
}

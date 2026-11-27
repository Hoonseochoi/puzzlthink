// Kept apart from the puzzle engine so the home card can draw the Christmas numbers without loading the solver.
// The "cute" numerals: chubby, rounded, hand-drawn 0–3 (a 슬리더링크 clue is never more than 3).
// Each is a stroke path centred on (0, 0) in cell units (one cell = 1), about 0.44 tall, drawn with a thick round
// pen. The same path data feeds the SVG board and the share card's canvas (Path2D accepts SVG path data).
// Also the helpers both of them share for festive drawing (bulb colours, where the clear star sits).

export const CUTE_DIGITS: Record<number, string> = {
  0: 'M0 -0.215C0.175 -0.215 0.185 0.215 0 0.215C-0.185 0.215 -0.175 -0.215 0 -0.215Z',
  1: 'M-0.105 -0.115C-0.06 -0.15 -0.02 -0.18 0.02 -0.215L0.02 0.215',
  2: 'M-0.135 -0.1C-0.125 -0.235 0.135 -0.25 0.135 -0.085C0.135 0.02 0.01 0.075 -0.14 0.215L0.15 0.215',
  3: 'M-0.13 -0.165C-0.05 -0.245 0.135 -0.225 0.125 -0.11C0.118 -0.035 0.04 -0.01 -0.025 -0.01C0.05 -0.01 0.15 0.02 0.148 0.1C0.145 0.235 -0.055 0.255 -0.14 0.165',
};

/** Pen width of the digits, and of the candy-cane stripe laid over them (in cell units). */
export const DIGIT_PEN = 0.108;
export const DIGIT_STRIPE = 0.038;
export const DIGIT_STRIPE_DASH = '0.05 0.075';

/** A five-point star centred on (0, 0) with outer radius `r` (SVG path data). */
export function starPath(r: number, inner = 0.45) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * inner : r;
    d += `${i ? 'L' : 'M'}${(Math.cos(a) * rr).toFixed(4)} ${(Math.sin(a) * rr).toFixed(4)}`;
  }
  return `${d}Z`;
}

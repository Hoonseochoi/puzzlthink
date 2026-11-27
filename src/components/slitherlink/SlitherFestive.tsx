// Drawing pieces for the themed (non-Classic) 슬리더링크 board: cute numerals with their clue states, the garland
// line with fairy-light bulbs, and the clear celebration (lights switch on around the loop, a star, a snow burst).
// Everything is plain SVG + the CSS keyframes in globals.css (.slx-*); with `motion` off nothing animates.
import type { CSSProperties } from 'react';
import { type Geometry, edgeAt } from '@/lib/slitherlink';
import type { SlitherTheme } from '@/lib/slitherTheme';
import { CUTE_DIGITS, DIGIT_PEN, DIGIT_STRIPE, DIGIT_STRIPE_DASH, bulbIndex, starPath } from '@/lib/slitherGlyphs';

export type ClueState = 'normal' | 'done' | 'over';

/** A clue's state from the lines around it: met (a 0 counts only once it could be broken: never "done"), or passed. */
export const clueState = (clue: number, lines: number): ClueState => (lines > clue ? 'over' : lines === clue && clue > 0 ? 'done' : 'normal');

const STAR = starPath(0.075);
const STAR_BIG = starPath(0.34, 0.46);

/** One clue in the cute numerals: candy-cane red, green with a little star once met, dark with a dashed ring when passed. */
export function CuteClue({ x, y, value, state, theme, pop }: { x: number; y: number; value: number; state: ClueState; theme: SlitherTheme; pop: boolean }) {
  const b = theme.board;
  const color = state === 'done' ? b.numDone ?? b.num : state === 'over' ? b.numOver ?? b.num : b.num;
  const d = CUTE_DIGITS[value];
  return (
    <g transform={`translate(${x} ${y})`}>
      {state === 'over' && <circle r={0.3} fill="none" stroke={b.wrong} strokeWidth={0.035} strokeDasharray="0.07 0.055" strokeLinecap="round" opacity={0.9} />}
      <g className={state === 'over' && pop ? 'slx-shake' : undefined}>
        <path d={d} fill="none" stroke={color} strokeWidth={DIGIT_PEN} strokeLinecap="round" strokeLinejoin="round" />
        {state === 'normal' && <path d={d} fill="none" stroke="#ffffff" strokeWidth={DIGIT_STRIPE} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={DIGIT_STRIPE_DASH} opacity={0.75} />}
      </g>
      {state === 'done' && (
        <g transform="translate(0.215 -0.2)">
          <g className={pop ? 'slx-pop' : undefined}><path d={STAR} fill="#ffc23d" stroke="#c98a00" strokeWidth={0.012} strokeLinejoin="round" /></g>
          {pop && <circle className="slx-ring" r={0.12} fill="none" stroke="#ffc23d" strokeWidth={0.025} />}
        </g>
      )}
    </g>
  );
}

/** The bulbs on the drawn lines (the cord itself is the board's ordinary line). Lit bulbs get a glow that comes on in loop order. */
export function GarlandBulbs({ g, edges, theme, lit, order, motion }: {
  g: Geometry; edges: number[]; theme: SlitherTheme; lit: boolean; order: number[]; motion: boolean;
}) {
  const colors = theme.board.bulbs ?? ['#ff4d5e'];
  const rank = lit ? new Map(order.map((e, i) => [e, i])) : null;
  const step = order.length ? Math.min(45, 1500 / order.length) : 0;
  return (
    <g>
      {lit && <defs>{colors.map((c, i) => (
        <radialGradient key={c} id={`slx-glow-${i}`}><stop offset="0" stopColor={c} stopOpacity={0.75} /><stop offset="0.45" stopColor={c} stopOpacity={0.28} /><stop offset="1" stopColor={c} stopOpacity={0} /></radialGradient>
      ))}</defs>}
      {edges.map((edge) => {
        const { horizontal, r, c } = edgeAt(g, edge);
        const x = horizontal ? c + 1 : c + 0.5, y = horizontal ? r + 0.5 : r + 1;
        const k = bulbIndex(horizontal, r, c, colors.length);
        const style = rank && motion ? ({ '--slx-d': `${(rank.get(edge) ?? 0) * step}ms` } as CSSProperties) : undefined;
        return (
          <g key={`b${edge}`} transform={`translate(${x} ${y})`}>
            {lit && <circle r={0.3} fill={`url(#slx-glow-${k})`} className={motion ? 'slx-glow' : undefined} style={style} />}
            <circle r={0.072} fill={colors[k]} stroke="#ffffff" strokeWidth={0.018} opacity={lit ? 1 : 0.82} className={lit && motion ? 'slx-bulb' : undefined} style={style} />
            <circle cx={-0.022} cy={-0.024} r={0.02} fill="#ffffff" opacity={0.85} />
          </g>
        );
      })}
    </g>
  );
}

/** Snow burst flakes: fixed directions so every clear looks the same and nothing random runs during render. */
const BURST = Array.from({ length: 18 }, (_, i) => {
  const a = (i / 18) * Math.PI * 2 + (i % 3) * 0.21;
  const dist = 1.6 + ((i * 37) % 11) / 6;
  return { dx: Math.cos(a) * dist, dy: Math.sin(a) * dist * 0.85 + 0.6, r: 0.05 + (i % 4) * 0.018, gold: i % 5 === 0, delay: (i % 6) * 40 };
});

/** The clear: a star on top of the loop and (with motion) a burst of snow from it. */
export function ClearStar({ x, y, motion }: { x: number; y: number; motion: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      {motion && BURST.map((f, i) => (
        <circle key={i} r={f.r} fill={f.gold ? '#ffc23d' : '#ffffff'} stroke={f.gold ? 'none' : '#8fc3e6'} strokeWidth={0.014} className="slx-burst"
          style={{ '--slx-x': `${f.dx}px`, '--slx-y': `${f.dy}px`, animationDelay: `${1200 + f.delay}ms` } as CSSProperties} />
      ))}
      <g className={motion ? 'slx-star' : undefined}>
        <circle r={0.5} fill="url(#slx-star-glow)" />
        <path d={STAR_BIG} fill="#ffd34d" stroke="#c98a00" strokeWidth={0.03} strokeLinejoin="round" />
        <path d={starPath(0.15, 0.46)} fill="#fff3bf" opacity={0.8} />
      </g>
      <defs><radialGradient id="slx-star-glow"><stop offset="0" stopColor="#ffe27a" stopOpacity={0.8} /><stop offset="1" stopColor="#ffe27a" stopOpacity={0} /></radialGradient></defs>
    </g>
  );
}

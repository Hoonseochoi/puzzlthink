"use client";

import { useMemo } from 'react';
import { walk, wrongNumbers } from '@/lib/onestroke';
import type { OneStrokeBoard as Board } from '@/lib/logicPuzzles';
import { edgeCells } from './edgeGeometry';
import { useEdgeInput } from './useEdgeInput';

const BG = '#f7f2e8';
const GRID = '#e6dccb';
const DOT = '#cfc3ae';
const LINE = '#ff8a2b';
const SOLUTION = '#f2b630';

/**
 * The 한붓길 board: cream paper, numbered black stones, the line in orange between cell centers.
 * The part of the line that runs unbroken from stone 1 glows; numbers passed out of order get a red ring.
 * Drag from cell to cell to draw (starting on a line erases), or tap between two cells to cycle line → ✕ → empty.
 */
export default function OneStrokeBoard({ board, marks, onMarks, readOnly = false, solved = false, showAnswer = false }: {
  board: Board; marks: number[]; onMarks?: (changes: [number, number][], gesture: number) => void;
  readOnly?: boolean; solved?: boolean; showAnswer?: boolean;
}) {
  const n = board.size;
  const { svgRef, handlers } = useEdgeInput(n, marks, onMarks, readOnly);
  const p = useMemo(() => ({ size: n, numbers: board.numbers }), [board, n]);
  const wrong = useMemo(() => wrongNumbers(p, marks), [p, marks]);
  // Edges on the unbroken run from stone 1 (drawn brighter than loose pieces).
  const fromStart = useMemo(() => {
    const order = walk(p, marks);
    const set = new Set<string>();
    if (order) for (let i = 0; i + 1 < order.length; i++) set.add(`${Math.min(order[i], order[i + 1])}-${Math.max(order[i], order[i + 1])}`);
    return set;
  }, [p, marks]);
  const last = Math.max(...board.numbers);

  const seg = (e: number, color: string, width: number, key: string, opacity = 1) => {
    const [a, b] = edgeCells(n, e);
    return <line key={key} x1={(a % n) + 0.5} y1={Math.floor(a / n) + 0.5} x2={(b % n) + 0.5} y2={Math.floor(b / n) + 0.5} stroke={color} strokeWidth={width} strokeLinecap="round" opacity={opacity} />;
  };
  const cross = (e: number) => {
    const [a, b] = edgeCells(n, e);
    const cx = ((a % n) + (b % n)) / 2 + 0.5, cy = (Math.floor(a / n) + Math.floor(b / n)) / 2 + 0.5, s = 0.08;
    return <path key={`x${e}`} d={`M${cx - s} ${cy - s}L${cx + s} ${cy + s}M${cx + s} ${cy - s}L${cx - s} ${cy + s}`} stroke="#a89d8a" strokeWidth={0.04} strokeLinecap="round" />;
  };

  return (
    <svg
      ref={svgRef} viewBox={`0 0 ${n} ${n}`} role="img" aria-label="board"
      className={`mx-auto block aspect-square w-full max-w-[min(100%,calc(100svh-300px))] touch-none select-none rounded-[18px] shadow-[0_18px_50px_rgba(0,0,0,.45),inset_0_0_0_1px_rgba(255,255,255,.6)] lg:max-w-[min(100%,calc(100svh-250px))] ${readOnly ? '' : 'cursor-pointer'}`}
      style={{ background: BG }} {...handlers}
    >
      <defs>
        <radialGradient id="os-stone" cx="35%" cy="30%" r="75%"><stop offset="0%" stopColor="#62656f" /><stop offset="55%" stopColor="#22242b" /><stop offset="100%" stopColor="#060608" /></radialGradient>
        <radialGradient id="os-gold" cx="35%" cy="30%" r="75%"><stop offset="0%" stopColor="#ffe9a3" /><stop offset="55%" stopColor="#f2b630" /><stop offset="100%" stopColor="#b77d0a" /></radialGradient>
      </defs>
      {Array.from({ length: n - 1 }, (_, i) => (
        <g key={`g${i}`} stroke={GRID} strokeWidth={0.02}><line x1={i + 1} y1={0} x2={i + 1} y2={n} /><line x1={0} y1={i + 1} x2={n} y2={i + 1} /></g>
      ))}
      {Array.from({ length: n * n }, (_, i) => <circle key={`d${i}`} cx={(i % n) + 0.5} cy={Math.floor(i / n) + 0.5} r={0.045} fill={DOT} />)}
      {!showAnswer && marks.map((m, e) => (m === 2 ? cross(e) : null))}
      {marks.map((m, e) => {
        if (m !== 1) return null;
        const [a, b] = edgeCells(n, e);
        const lit = fromStart.has(`${Math.min(a, b)}-${Math.max(a, b)}`);
        return seg(e, LINE, 0.2, `l${e}`, showAnswer ? 0.25 : lit ? 1 : 0.55);
      })}
      {showAnswer && board.answer.map((v, e) => (v ? seg(e, SOLUTION, 0.2, `s${e}`) : null))}
      {board.numbers.map((k, cell) => {
        if (!k) return null;
        const cx = (cell % n) + 0.5, cy = Math.floor(cell / n) + 0.5;
        const end = k === 1 || k === last;
        return (
          <g key={`n${cell}`}>
            {wrong.has(cell) && !showAnswer && <circle cx={cx} cy={cy} r={0.42} fill="none" stroke="#ff4d5e" strokeWidth={0.06} />}
            {end && <circle cx={cx} cy={cy} r={0.4} fill="none" stroke={LINE} strokeWidth={0.05} opacity={0.8} />}
            <circle cx={cx} cy={cy + 0.03} r={0.33} fill="rgba(40,24,10,.18)" />
            <circle cx={cx} cy={cy} r={0.33} fill={solved ? 'url(#os-gold)' : 'url(#os-stone)'} />
            <text x={cx} y={cy + 0.12} textAnchor="middle" fontSize={0.34} fontWeight={900} fill={solved ? '#3a2600' : '#ffffff'} fontFamily="ui-rounded, 'SF Pro Rounded', system-ui, sans-serif">{k}</text>
          </g>
        );
      })}
    </svg>
  );
}

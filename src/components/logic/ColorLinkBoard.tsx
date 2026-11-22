"use client";

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { paint, unfilledAfterLinking } from '@/lib/colorlink';
import type { ColorLinkBoard as Board } from '@/lib/logicPuzzles';
import { ColorStone, LINK_COLORS } from './ColorStone';
import { edgeCells } from './edgeGeometry';
import { useEdgeInput } from './useEdgeInput';

/**
 * The 컬러 잇기 board: coloured stone pairs on cream paper. A line takes the colour of the stone it leaves from,
 * and the cells it fills are tinted. Stones whose line branches or meets the wrong colour frown; all smile when solved.
 * Drag from cell to cell to draw (starting on a line erases), or tap between two cells to cycle line → ✕ → empty.
 */
export default function ColorLinkBoard({ board, marks, onMarks, readOnly = false, solved = false }: {
  board: Board; marks: number[]; onMarks?: (changes: [number, number][], gesture: number) => void;
  readOnly?: boolean; solved?: boolean;
}) {
  const n = board.size;
  const { svgRef, handlers } = useEdgeInput(n, marks, onMarks, readOnly);
  const t = useTranslations('Logic');
  const { color, broken } = useMemo(() => paint({ size: n, ends: board.ends }, marks), [board, marks, n]);
  // Every pair joined but cells left over: the puzzle isn't done until every cell is filled, so say so.
  const unfilled = useMemo(() => (readOnly || solved ? null : unfilledAfterLinking({ size: n, ends: board.ends }, marks)), [board, marks, n, readOnly, solved]);

  return (
    <div className="relative">
    {unfilled && (
      <p role="status" className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-[#ff6b4a] px-3 py-1.5 text-[11px] font-black text-white shadow-lg">
        {t('colorlinkFillAll', { count: unfilled.length })}
      </p>
    )}
    <svg
      ref={svgRef} viewBox={`0 0 ${n} ${n}`} role="img" aria-label="board"
      className={`mx-auto block aspect-square w-full max-w-[min(100%,calc(100svh-300px))] touch-none select-none rounded-[18px] shadow-[0_18px_50px_rgba(0,0,0,.45),inset_0_0_0_1px_rgba(255,255,255,.6)] lg:max-w-[min(100%,calc(100svh-250px))] ${readOnly ? '' : 'cursor-pointer'}`}
      style={{ background: '#f7f2e8' }} {...handlers}
    >
      {/* Filled cells take a light tint of their line's colour. */}
      {color.map((k, i) => (k && !board.ends[i] ? <rect key={`t${i}`} x={i % n} y={Math.floor(i / n)} width={1} height={1} fill={LINK_COLORS[(k - 1) % LINK_COLORS.length].fill} opacity={solved ? 0.28 : 0.16} style={{ transition: 'opacity .3s' }} /> : null))}
      {unfilled?.map((i) => (
        <rect key={`u${i}`} x={(i % n) + 0.08} y={Math.floor(i / n) + 0.08} width={0.84} height={0.84} rx={0.12} fill="#ff6b4a" opacity={0.18} stroke="#ff6b4a" strokeWidth={0.03} strokeDasharray="0.08 0.06">
          <animate attributeName="opacity" values="0.1;0.3;0.1" dur="1.4s" repeatCount="indefinite" />
        </rect>
      ))}
      {Array.from({ length: n - 1 }, (_, i) => (
        <g key={`g${i}`} stroke="#e6dccb" strokeWidth={0.02}><line x1={i + 1} y1={0} x2={i + 1} y2={n} /><line x1={0} y1={i + 1} x2={n} y2={i + 1} /></g>
      ))}
      {marks.map((m, e) => {
        const [a, b] = edgeCells(n, e);
        const x1 = (a % n) + 0.5, y1 = Math.floor(a / n) + 0.5, x2 = (b % n) + 0.5, y2 = Math.floor(b / n) + 0.5;
        if (m === 2) {
          const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2, s = 0.08;
          return <path key={`x${e}`} d={`M${cx - s} ${cy - s}L${cx + s} ${cy + s}M${cx + s} ${cy - s}L${cx - s} ${cy + s}`} stroke="#a89d8a" strokeWidth={0.04} strokeLinecap="round" />;
        }
        if (m !== 1) return null;
        const k = color[a] && color[a] === color[b] ? color[a] : 0;
        return <line key={`l${e}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={k ? LINK_COLORS[(k - 1) % LINK_COLORS.length].fill : '#9a8f7c'} strokeWidth={0.3} strokeLinecap="round" />;
      })}
      {board.ends.map((k, cell) => (k ? <ColorStone key={`s${cell}`} id="cl" k={k} cx={(cell % n) + 0.5} cy={Math.floor(cell / n) + 0.5} r={0.34} mood={broken.has(cell) ? 'worried' : solved ? 'happy' : 'idle'} /> : null))}
    </svg>
    </div>
  );
}

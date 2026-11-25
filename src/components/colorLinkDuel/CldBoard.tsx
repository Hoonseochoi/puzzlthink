"use client";

import { useRef } from 'react';
import { CLD_MIN, CLD_N, CLD_WALL, type CldPaths, boardSpan, letterOf, stonesOf } from '@/lib/colorLinkDuel';
import { ColorStone } from '../logic/ColorStone';
import { cldColor } from './copy';

const center = (cell: number) => [(cell % CLD_N) + 0.5, Math.floor(cell / CLD_N) + 0.5] as const;

/**
 * The 컬러 링크 board (the show's 7×7 or a shaped board, cropped to its size; cells outside the shape are dark
 * gaps), on the cream paper of 컬러 잇기: lettered PUZZLTHINK stones, the stones being placed
 * (pulsing), the last placement ringed, and lines (a proof being drawn, or a way to join the board).
 * `onCell`: a tap (placing). `onStroke`: a drag (drawing lines) — start, move over cells, end.
 */
export default function CldBoard({ board, draft = [], lastCells = [], paths, bad = [], clash = [], onCell, onStroke, className = '' }: {
  board: number[];
  draft?: [number, number][];
  lastCells?: number[];
  paths?: CldPaths | null;
  bad?: number[];
  clash?: number[];
  onCell?: (cell: number) => void;
  onStroke?: (kind: 'start' | 'move' | 'end', cell: number) => void;
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const lastCell = useRef(-1);
  const span = boardSpan(board);
  const cellAt = (event: React.PointerEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return -1;
    // The drawn area is the span plus the frame margin on each side.
    const unit = rect.width / (span + 0.24);
    const x = Math.floor((event.clientX - rect.left) / unit - 0.12), y = Math.floor((event.clientY - rect.top) / unit - 0.12);
    if (x < 0 || y < 0 || x >= span || y >= span) return -1;
    const cell = y * CLD_N + x;
    return board[cell] === CLD_WALL ? -1 : cell;
  };
  const interactive = !!(onCell || onStroke);
  const stones = stonesOf(board);
  const lineOf = (k: number) => paths?.[k] ?? null;

  return (
    <svg
      ref={svgRef} viewBox={`-0.12 -0.12 ${span + 0.24} ${span + 0.24}`} role="img" aria-label="board"
      className={`mx-auto block aspect-square w-full touch-none select-none rounded-[16px] shadow-[0_18px_50px_rgba(0,0,0,.45)] ${interactive ? 'cursor-pointer' : ''} ${className}`}
      style={{ background: '#1d1a4a' }}
      onPointerDown={(event) => {
        const cell = cellAt(event);
        if (cell < 0) return;
        if (onStroke) {
          (event.target as Element).setPointerCapture?.(event.pointerId);
          dragging.current = true; lastCell.current = cell;
          onStroke('start', cell);
        } else onCell?.(cell);
      }}
      onPointerMove={(event) => {
        if (!dragging.current || !onStroke) return;
        const cell = cellAt(event);
        if (cell < 0 || cell === lastCell.current) return;
        lastCell.current = cell;
        onStroke('move', cell);
      }}
      onPointerUp={(event) => { if (dragging.current) { dragging.current = false; onStroke?.('end', cellAt(event)); } }}
      onPointerCancel={() => { if (dragging.current) { dragging.current = false; onStroke?.('end', -1); } }}
    >
      <rect x={-0.12} y={-0.12} width={span + 0.24} height={span + 0.24} rx={0.3} fill="#2a2470" />
      <rect x={0} y={0} width={span} height={span} rx={0.12} fill="#f7f2e8" />
      {Array.from({ length: span - 1 }, (_, i) => (
        <g key={`g${i}`} stroke="#e1d6c2" strokeWidth={0.025}><line x1={i + 1} y1={0} x2={i + 1} y2={span} /><line x1={0} y1={i + 1} x2={span} y2={i + 1} /></g>
      ))}
      {/* Cells outside the board's shape: gaps in the paper. */}
      {board.map((k, cell) => (k === CLD_WALL && cell % CLD_N < span && Math.floor(cell / CLD_N) < span
        ? <rect key={`w${cell}`} x={cell % CLD_N - 0.012} y={Math.floor(cell / CLD_N) - 0.012} width={1.024} height={1.024} fill="#2a2470" />
        : null))}
      {/* Lines: a light tint under each cell they use, then the line itself. */}
      {paths && paths.map((p, k) => {
        if (!p || p.length < 1 || !stones[k].length) return null;
        const c = cldColor(k);
        const short = p.length < CLD_MIN;
        return (
          <g key={`p${k}`}>
            {p.map((cell) => (board[cell] ? null : <rect key={cell} x={cell % CLD_N} y={Math.floor(cell / CLD_N)} width={1} height={1} fill={c.fill} opacity={0.18} />))}
            {p.length > 1 && <polyline points={p.map((cell) => center(cell).join(',')).join(' ')} fill="none" stroke={c.fill} strokeWidth={0.3} strokeLinecap="round" strokeLinejoin="round" opacity={short ? 0.55 : 0.95} strokeDasharray={short ? '0.25 0.12' : undefined} />}
          </g>
        );
      })}
      {clash.map((cell) => <rect key={`x${cell}`} x={(cell % CLD_N) + 0.06} y={Math.floor(cell / CLD_N) + 0.06} width={0.88} height={0.88} rx={0.12} fill="none" stroke="#ff3b4e" strokeWidth={0.06} />)}
      {/* Where a lone stone's partner would go: the end of its line. */}
      {paths && stones.map((st, k) => {
        if (st.length !== 1) return null;
        const p = lineOf(k);
        if (!p || p.length < 2) return null;
        const end = p[p.length - 1];
        const [cx, cy] = center(end);
        const c = cldColor(k);
        return (
          <g key={`ghost${k}`} opacity={p.length >= CLD_MIN ? 0.95 : 0.55}>
            <circle cx={cx} cy={cy} r={0.34} fill="#ffffff" stroke={c.fill} strokeWidth={0.06} strokeDasharray="0.12 0.08" />
            <text x={cx} y={cy + 0.13} textAnchor="middle" fontSize={0.36} fontWeight={900} fill={c.lo} style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>{letterOf(k)}</text>
          </g>
        );
      })}
      {lastCells.map((cell) => {
        const [cx, cy] = center(cell);
        return <circle key={`l${cell}`} cx={cx} cy={cy} r={0.47} fill="none" stroke="#7c6cff" strokeWidth={0.06} />;
      })}
      {board.map((k, cell) => {
        if (k <= 0) return null;
        const [cx, cy] = center(cell);
        return <ColorStone key={`s${cell}`} id="cld" k={k} cx={cx} cy={cy} r={0.39} mood={bad.includes(k) ? 'worried' : 'idle'} color={cldColor(k)} label={letterOf(k)} />;
      })}
      {draft.map(([cell, k]) => {
        const [cx, cy] = center(cell);
        return (
          <g key={`d${cell}`}>
            <circle cx={cx} cy={cy} r={0.47} fill="none" stroke="#7c6cff" strokeWidth={0.05} strokeDasharray="0.14 0.08">
              <animateTransform attributeName="transform" type="rotate" from={`0 ${cx} ${cy}`} to={`360 ${cx} ${cy}`} dur="6s" repeatCount="indefinite" />
            </circle>
            <ColorStone id="cld" k={k} cx={cx} cy={cy} r={0.39} mood="happy" color={cldColor(k)} label={letterOf(k)} />
          </g>
        );
      })}
    </svg>
  );
}

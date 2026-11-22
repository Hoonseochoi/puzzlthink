"use client";

import { useId, useMemo, useRef } from 'react';
import { conflicts } from '@/lib/binairo';
import type { BinairoBoard as Board } from '@/lib/logicPuzzles';
import { StoneDefs, StoneFace } from './StoneFace';

/**
 * The 비나이로 board: black and white PUZZLTHINK stones on a light board. Starting stones sit on darker squares and
 * cannot change; "=" / "×" badges between cells mean same / different colour.
 * Tap a cell to cycle black → white → empty. Stones breaking a rule frown; all smile when solved.
 */
export default function BinairoBoard({ board, marks, onMarks, readOnly = false, solved = false }: {
  board: Board; marks: number[]; onMarks?: (changes: [number, number][], gesture: number) => void;
  readOnly?: boolean; solved?: boolean;
}) {
  const n = board.size;
  const prefix = `bn${useId().replace(/[:«»]/g, '')}`;
  const bad = useMemo(() => conflicts({ size: n, givens: board.givens, signs: board.signs }, marks), [board, marks, n]);
  const gestures = useRef(0);

  const tap = (cell: number) => {
    if (readOnly || board.givens[cell]) return;
    const now = marks[cell];
    onMarks?.([[cell, now === 0 ? 1 : now === 1 ? 2 : 0]], ++gestures.current);
  };

  return (
    <svg
      viewBox={`-0.05 -0.05 ${n + 0.1} ${n + 0.1}`} role="img" aria-label="board"
      className={`mx-auto block aspect-square w-full max-w-[min(100%,calc(100svh-300px))] touch-manipulation select-none rounded-[18px] shadow-[0_18px_50px_rgba(0,0,0,.45)] lg:max-w-[min(100%,calc(100svh-250px))] ${readOnly ? '' : 'cursor-pointer'}`}
      style={{ background: '#dfe8f5' }}
    >
      <StoneDefs prefix={prefix} />
      {Array.from({ length: n * n }, (_, cell) => {
        const r = Math.floor(cell / n), c = cell % n;
        const fixed = board.givens[cell] !== 0;
        return (
          <rect key={`c${cell}`} x={c + 0.04} y={r + 0.04} width={0.92} height={0.92} rx={0.16}
            fill={fixed ? '#c3d2e8' : (r + c) % 2 ? '#eef3fa' : '#f6f9fd'} onPointerDown={(e) => { e.preventDefault(); tap(cell); }} />
        );
      })}
      {Array.from({ length: n * n }, (_, cell) => {
        const v = marks[cell];
        if (!v) return null;
        const cx = (cell % n) + 0.5, cy = Math.floor(cell / n) + 0.5;
        return (
          <g key={`s${cell}`} pointerEvents="none">
            <StoneFace prefix={prefix} kind={v === 1 ? 'black' : 'white'} cx={cx} cy={cy} r={0.34} mood={bad.has(cell) ? 'worried' : solved ? 'happy' : 'idle'} />
            {board.givens[cell] !== 0 && <circle cx={cx + 0.27} cy={cy + 0.27} r={0.07} fill="#3f8cff" stroke="#ffffff" strokeWidth={0.025} />}
          </g>
        );
      })}
      {board.signs.map((s) => {
        const ar = Math.floor(s.a / n), ac = s.a % n, br = Math.floor(s.b / n), bc = s.b % n;
        const cx = (ac + bc) / 2 + 0.5, cy = (ar + br) / 2 + 0.5;
        return (
          <g key={`g${s.a}-${s.b}`} pointerEvents="none">
            <circle cx={cx} cy={cy} r={0.17} fill="#ffffff" stroke="#3f8cff" strokeWidth={0.03} />
            <text x={cx} y={cy + 0.09} textAnchor="middle" fontSize={0.27} fontWeight={900} fill="#1b56b8" fontFamily="ui-rounded, system-ui, sans-serif">{s.same ? '=' : '×'}</text>
          </g>
        );
      })}
    </svg>
  );
}

"use client";

import { useEffect, useId, useMemo, useRef } from 'react';
import { STAR_TINTS, conflicts } from '@/lib/starbattle';
import type { StarBoard as Board } from '@/lib/logicPuzzles';
import { StoneDefs, StoneFace } from './StoneFace';

const EDGE = '#2a2620';
const SOLUTION = '#f2b630';

/**
 * The 스타배틀 board: coloured regions with thick borders, stones as PUZZLTHINK stone characters.
 * Tap a cell to cycle ✕ → stone → empty; drag across cells to lay ✕ marks (starting on a ✕ erases them).
 * A stone that breaks a rule frowns with a red ring; once the board is solved every stone smiles.
 * `onMarks` gets [cell, value] pairs with a gesture id (one undo step per tap or drag).
 */
export default function StarBoard({ board, marks, onMarks, readOnly = false, solved = false, showAnswer = false }: {
  board: Board; marks: number[]; onMarks?: (changes: [number, number][], gesture: number) => void;
  readOnly?: boolean; solved?: boolean; showAnswer?: boolean;
}) {
  const n = board.size;
  const prefix = `sb${useId().replace(/[:«»]/g, '')}`;
  const svgRef = useRef<SVGSVGElement>(null);
  const live = useRef(marks);
  useEffect(() => { live.current = marks; }, [marks]);
  const gestures = useRef(0);
  const press = useRef<{ start: number; last: number; value: number | null; gesture: number } | null>(null);
  const bad = useMemo(() => conflicts({ id: 0, size: n, regions: board.regions }, marks), [board, marks, n]);

  const cellAt = (e: React.PointerEvent) => {
    const box = svgRef.current!.getBoundingClientRect();
    const c = Math.floor(((e.clientX - box.left) / box.width) * n), r = Math.floor(((e.clientY - box.top) / box.height) * n);
    return r >= 0 && r < n && c >= 0 && c < n ? r * n + c : -1;
  };

  const onDown = (e: React.PointerEvent) => {
    if (readOnly) return;
    const cell = cellAt(e);
    if (cell < 0) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* not every pointer can be captured */ }
    press.current = { start: cell, last: cell, value: null, gesture: ++gestures.current };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = press.current;
    if (!d || readOnly) return;
    const cell = cellAt(e);
    if (cell < 0 || cell === d.last) return;
    d.last = cell;
    const out: [number, number][] = [];
    // The first step out of the start cell decides the drag: lay ✕ on empty cells, or wipe ✕ when it started on one.
    if (d.value === null) {
      d.value = live.current[d.start] === 2 ? 0 : 2;
      if (live.current[d.start] === (d.value === 2 ? 0 : 2)) out.push([d.start, d.value]);
    }
    if (live.current[cell] === (d.value === 2 ? 0 : 2)) out.push([cell, d.value]);
    if (out.length) onMarks?.(out, d.gesture);
  };
  const onUp = () => {
    const d = press.current;
    press.current = null;
    if (!d || readOnly || d.value !== null) return;
    const now = live.current[d.start];
    onMarks?.([[d.start, now === 0 ? 2 : now === 2 ? 1 : 0]], d.gesture);
  };

  // Region borders: a thick line wherever two neighbouring cells belong to different regions.
  const borders = useMemo(() => {
    const segs: string[] = [];
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      const g = board.regions[r * n + c];
      if (c < n - 1 && board.regions[r * n + c + 1] !== g) segs.push(`M${c + 1} ${r}V${r + 1}`);
      if (r < n - 1 && board.regions[(r + 1) * n + c] !== g) segs.push(`M${c} ${r + 1}H${c + 1}`);
    }
    return segs.join('');
  }, [board, n]);

  const stoneAt = (cell: number) => (showAnswer ? board.answer[cell] === 1 : marks[cell] === 1);

  return (
    <svg
      ref={svgRef} viewBox={`-0.06 -0.06 ${n + 0.12} ${n + 0.12}`} role="img" aria-label="board"
      className={`mx-auto block aspect-square w-full max-w-[min(100%,calc(100svh-300px))] touch-none select-none rounded-[18px] shadow-[0_18px_50px_rgba(0,0,0,.45)] lg:max-w-[min(100%,calc(100svh-250px))] ${readOnly ? '' : 'cursor-pointer'}`}
      style={{ background: EDGE }}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={() => { press.current = null; }}
    >
      <StoneDefs prefix={prefix} />
      {board.regions.map((g, cell) => {
        const r = Math.floor(cell / n), c = cell % n;
        return <rect key={`c${cell}`} x={c} y={r} width={1} height={1} fill={STAR_TINTS[g % STAR_TINTS.length]} />;
      })}
      {/* Thin grid, then the region borders on top. */}
      {Array.from({ length: n - 1 }, (_, i) => (
        <g key={`g${i}`} stroke="rgba(42,38,32,.16)" strokeWidth={0.02}>
          <line x1={i + 1} y1={0} x2={i + 1} y2={n} />
          <line x1={0} y1={i + 1} x2={n} y2={i + 1} />
        </g>
      ))}
      <path d={borders} stroke={EDGE} strokeWidth={0.075} strokeLinecap="square" fill="none" />
      <rect x={0} y={0} width={n} height={n} fill="none" stroke={EDGE} strokeWidth={0.12} />
      {marks.map((m, cell) => {
        if (m !== 2 || stoneAt(cell)) return null;
        const cx = (cell % n) + 0.5, cy = Math.floor(cell / n) + 0.5, s = 0.13;
        return <path key={`x${cell}`} d={`M${cx - s} ${cy - s}L${cx + s} ${cy + s}M${cx + s} ${cy - s}L${cx - s} ${cy + s}`} stroke="rgba(42,38,32,.42)" strokeWidth={0.06} strokeLinecap="round" />;
      })}
      {Array.from({ length: n * n }, (_, cell) => {
        if (!stoneAt(cell)) return null;
        const cx = (cell % n) + 0.5, cy = Math.floor(cell / n) + 0.5;
        const missed = showAnswer && marks[cell] !== 1;
        return (
          <g key={`s${cell}`} style={{ transition: 'opacity .2s' }}>
            {missed && <circle cx={cx} cy={cy} r={0.44} fill="none" stroke={SOLUTION} strokeWidth={0.07} />}
            <StoneFace prefix={prefix} kind="black" cx={cx} cy={cy} r={0.33} mood={!showAnswer && bad.has(cell) ? 'worried' : solved || showAnswer ? 'happy' : 'idle'} />
          </g>
        );
      })}
    </svg>
  );
}

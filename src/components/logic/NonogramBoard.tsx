"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { doneLines } from '@/lib/nonogram';
import type { NonoBoard as Board } from '@/lib/logicPuzzles';

export type NonoTool = 'fill' | 'cross';

const PAPER = '#f7f2e8';
const CLUE_BG = '#efe7d8';
const INK = '#2a2620';
const GRID = '#ded3c1';
const GRID5 = '#b9ab93';
/** The stone palette (PUZZLTHINK characters): a solved picture lights up in these, corner to corner. */
const MOSAIC = ['#ff5b45', '#ff8a2b', '#ffd23f', '#3fcf6a', '#21c2b5', '#3f8cff', '#8b5cf6', '#f05aa8'];

/**
 * The 노노그램 board: numbers on top and on the left, cells as dark glossy stones on cream paper.
 * Tap a cell to fill (or ✕ with the ✕ tool); drag to paint a straight run along one row or column.
 * A row / column whose numbers are met fades its numbers. When solved, the picture turns into a colour mosaic.
 * `onMarks` gets [cell, value] pairs with a gesture id (one undo step per tap or drag).
 */
export default function NonogramBoard({ board, marks, tool, onMarks, readOnly = false, solvedGlow = false, showAnswer = false }: {
  board: Board; marks: number[]; tool: NonoTool; onMarks?: (changes: [number, number][], gesture: number) => void;
  readOnly?: boolean; solvedGlow?: boolean; showAnswer?: boolean;
}) {
  const n = board.size;
  const { rows, cols } = board.clues;
  const R = Math.max(1, ...rows.map((r) => r.length || 1));
  const C = Math.max(1, ...cols.map((c) => c.length || 1));
  const U = 0.66; // one clue number's slot
  const left = R * U + 0.3, top = C * U + 0.3;
  const W = left + n, H = top + n;
  const svgRef = useRef<SVGSVGElement>(null);
  const live = useRef(marks);
  useEffect(() => { live.current = marks; }, [marks]);
  const gestures = useRef(0);
  const drag = useRef<{ start: number; value: number; from: number; axis: 'r' | 'c' | null; gesture: number; touched: Set<number> } | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const done = useMemo(() => doneLines({ id: 0, size: n, clues: board.clues }, marks), [board, marks, n]);

  const cellAt = (e: React.PointerEvent) => {
    const box = svgRef.current!.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * W - left, y = ((e.clientY - box.top) / box.height) * H - top;
    const r = Math.floor(y), c = Math.floor(x);
    return r >= 0 && r < n && c >= 0 && c < n ? r * n + c : -1;
  };

  /** Paint one cell with the gesture's value, never over a cell of another kind (a fill does not wipe a ✕). */
  const paint = (cell: number, d: NonNullable<typeof drag.current>, out: [number, number][]) => {
    if (d.touched.has(cell)) return;
    d.touched.add(cell);
    const now = live.current[cell];
    if (now === d.value) return;
    if (d.value === 0 ? now !== d.from : now !== 0) return;
    out.push([cell, d.value]);
  };

  const onDown = (e: React.PointerEvent) => {
    if (readOnly) return;
    const cell = cellAt(e);
    if (cell < 0) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* optional */ }
    const now = live.current[cell];
    const want = tool === 'fill' ? 1 : 2;
    const d = { start: cell, value: now === want ? 0 : want, from: now, axis: null, gesture: ++gestures.current, touched: new Set<number>() };
    drag.current = d;
    const out: [number, number][] = [];
    paint(cell, d, out);
    if (out.length) onMarks?.(out, d.gesture);
  };
  const onMove = (e: React.PointerEvent) => {
    const cell = cellAt(e);
    setHover(cell >= 0 ? cell : null);
    const d = drag.current;
    if (!d || readOnly || cell < 0) return;
    const sr = Math.floor(d.start / n), sc = d.start % n, r = Math.floor(cell / n), c = cell % n;
    if (!d.axis) { if (r === sr && c !== sc) d.axis = 'r'; else if (c === sc && r !== sr) d.axis = 'c'; else return; }
    const out: [number, number][] = [];
    if (d.axis === 'r') for (let x = Math.min(sc, c); x <= Math.max(sc, c); x++) paint(sr * n + x, d, out);
    else for (let y = Math.min(sr, r); y <= Math.max(sr, r); y++) paint(y * n + sc, d, out);
    if (out.length) onMarks?.(out, d.gesture);
  };
  const end = () => { drag.current = null; };

  const hr = hover !== null && !readOnly ? Math.floor(hover / n) : -1, hc = hover !== null && !readOnly ? hover % n : -1;
  // Numbers as large as the slot allows (readable on a phone even at 15×15).
  const fs = n >= 15 ? 0.56 : 0.6;

  return (
    <svg
      ref={svgRef} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="board"
      className={`mx-auto block w-full touch-none select-none rounded-[18px] shadow-[0_18px_50px_rgba(0,0,0,.45),inset_0_0_0_1px_rgba(255,255,255,.6)] ${readOnly ? '' : 'cursor-pointer'}`}
      // Fits the screen height too (the board is a little taller than wide because of the numbers on top).
      style={{ background: PAPER, aspectRatio: `${W} / ${H}`, maxWidth: `min(100%, calc((100svh - 270px) * ${(W / H).toFixed(3)}))` }}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={end} onPointerCancel={end} onPointerLeave={() => setHover(null)}
    >
      <defs>
        <linearGradient id="nono-stone" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4a4d57" />
          <stop offset="55%" stopColor="#22242b" />
          <stop offset="100%" stopColor="#0b0b0e" />
        </linearGradient>
      </defs>
      {/* Clue strips (the hovered row / column glows) */}
      <rect x={left} y={0} width={n} height={top - 0.08} rx={0.2} fill={CLUE_BG} />
      <rect x={0} y={top} width={left - 0.08} height={n} rx={0.2} fill={CLUE_BG} />
      {hc >= 0 && <rect x={left + hc} y={0} width={1} height={H} fill="#3fcf6a" opacity={0.13} />}
      {hr >= 0 && <rect x={0} y={top + hr} width={W} height={1} fill="#3fcf6a" opacity={0.13} />}
      {cols.map((clue, c) => {
        const list = clue.length ? clue : [0];
        return list.map((v, k) => (
          <text key={`c${c}-${k}`} x={left + c + 0.5} y={top - 0.3 - (list.length - 1 - k) * U} textAnchor="middle" fontSize={fs} fontWeight={800}
            fontFamily="ui-rounded, 'SF Pro Rounded', system-ui, sans-serif" fill={done.cols[c] ? '#3fa865' : INK} opacity={done.cols[c] ? 0.45 : 1}>{v}</text>
        ));
      })}
      {rows.map((clue, r) => {
        const list = clue.length ? clue : [0];
        return list.map((v, k) => (
          <text key={`r${r}-${k}`} x={left - 0.35 - (list.length - 1 - k) * U} y={top + r + 0.66} textAnchor="middle" fontSize={fs} fontWeight={800}
            fontFamily="ui-rounded, 'SF Pro Rounded', system-ui, sans-serif" fill={done.rows[r] ? '#3fa865' : INK} opacity={done.rows[r] ? 0.45 : 1}>{v}</text>
        ));
      })}
      {/* Grid (thicker every 5) */}
      {Array.from({ length: n + 1 }, (_, i) => {
        const thick = i % 5 === 0;
        return <g key={`g${i}`} stroke={thick ? GRID5 : GRID} strokeWidth={thick ? 0.05 : 0.025}>
          <line x1={left + i} y1={top} x2={left + i} y2={top + n} />
          <line x1={left} y1={top + i} x2={left + n} y2={top + i} />
        </g>;
      })}
      {Array.from({ length: n * n }, (_, cell) => {
        const r = Math.floor(cell / n), c = cell % n;
        const x = left + c, y = top + r;
        const filled = showAnswer ? board.answer[cell] === 1 : marks[cell] === 1;
        if (filled) {
          const color = solvedGlow ? MOSAIC[(r + c) % MOSAIC.length] : showAnswer && marks[cell] !== 1 ? '#f2b630' : undefined;
          return <rect key={cell} x={x + 0.07} y={y + 0.07} width={0.86} height={0.86} rx={0.2}
            style={{ fill: color ?? 'url(#nono-stone)', transition: `fill .35s ease ${solvedGlow ? (r + c) * 35 : 0}ms` }} />;
        }
        if (marks[cell] === 2 && !showAnswer) {
          const s = 0.18, cx = x + 0.5, cy = y + 0.5;
          return <path key={cell} d={`M${cx - s} ${cy - s}L${cx + s} ${cy + s}M${cx + s} ${cy - s}L${cx - s} ${cy + s}`} stroke="#b0a48f" strokeWidth={0.07} strokeLinecap="round" />;
        }
        return null;
      })}
    </svg>
  );
}

"use client";

import { useRef } from 'react';
import { type Mark, type Puzzle, edgeAt, geometry, hEdge, vEdge } from '@/lib/slitherlink';

export type Tool = 'pen' | 'eraser' | 'marker' | 'hint';
export const SLITHER_ACCENT = '#8f7cff';
export const SLITHER_INK = '#ffffff';

/** Board look, after the show: pale lilac screen, violet dots and serif numbers. */
const BG = '#eceeff';
const DOT = '#5b45c9';
const NUM = '#5b45c9';
const LINE = '#2c1f78';
const HINT = '#e0a21c';
const SOLUTION = '#e0a21c';

type Point = { x: number; y: number };

/**
 * The dotted board. Drag from dot to dot to draw (or erase / mark with the chosen tool); tap between two dots to toggle
 * (with the pen a tap marks ✕, or clears a line or ✕).
 * With the hint tool, a tap picks the 3×3-dot area around it. `onEdges` gets [edge, value] pairs from one gesture step.
 */
export default function SlitherBoard({ puzzle, marks, tool, locked, onEdges, onHint, solutionUpTo = null, dimLines = false, readOnly = false, flashArea = null }: {
  puzzle: Puzzle; marks: Mark[]; tool: Tool; locked?: ReadonlySet<number>;
  onEdges?: (changes: [number, Mark][]) => void; onHint?: (r: number, c: number) => void;
  /** Give-up animation: the first N edges of the answer (in loop order) drawn over the board. */
  solutionUpTo?: number[] | null;
  dimLines?: boolean; readOnly?: boolean;
  /** Top-left dot of a hint area to outline. */
  flashArea?: { r: number; c: number } | null;
}) {
  const g = geometry(puzzle.rows, puzzle.cols);
  const n = puzzle.dots;
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ lastDot: { r: number; c: number } | null; value: Mark | null; moved: boolean; start: Point } | null>(null);

  const toBoard = (e: React.PointerEvent): Point => {
    const box = svgRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - box.left) / box.width) * n - 0.5, y: ((e.clientY - box.top) / box.height) * n - 0.5 };
  };
  const nearDot = (p: Point, reach: number) => {
    const r = Math.round(p.y), c = Math.round(p.x);
    if (r < 0 || r >= n || c < 0 || c >= n) return null;
    return Math.hypot(p.y - r, p.x - c) <= reach ? { r, c } : null;
  };
  const nearEdge = (p: Point) => {
    let best = -1, dist = 0.42;
    const hr = Math.round(p.y), hc = Math.floor(p.x);
    if (hr >= 0 && hr <= puzzle.rows && hc >= 0 && hc < puzzle.cols && Math.abs(p.y - hr) < dist) { best = hEdge(g, hr, hc); dist = Math.abs(p.y - hr); }
    const vc = Math.round(p.x), vr = Math.floor(p.y);
    if (vc >= 0 && vc <= puzzle.cols && vr >= 0 && vr < puzzle.rows && Math.abs(p.x - vc) < dist) best = vEdge(g, vr, vc);
    return best;
  };
  const edgeBetween = (a: { r: number; c: number }, b: { r: number; c: number }) =>
    a.r === b.r ? hEdge(g, a.r, Math.min(a.c, b.c)) : vEdge(g, Math.min(a.r, b.r), a.c);

  /** What the current tool does to an edge, the first edge of a drag deciding draw vs. erase. */
  const valueFor = (edge: number): Mark => {
    if (tool === 'eraser') return 0;
    if (tool === 'marker') return marks[edge] === 2 ? 0 : 2;
    return marks[edge] === 1 ? 0 : 1;
  };

  const onDown = (e: React.PointerEvent) => {
    if (readOnly) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* not every pointer can be captured */ }
    const p = toBoard(e);
    drag.current = { lastDot: tool === 'hint' ? null : nearDot(p, 0.42), value: null, moved: false, start: p };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || readOnly || tool === 'hint') return;
    const dot = nearDot(toBoard(e), 0.34);
    if (!dot) return;
    if (!d.lastDot) { d.lastDot = dot; return; }
    if (dot.r === d.lastDot.r && dot.c === d.lastDot.c) return;
    // A fast swipe can skip dots: fill in the straight run between them.
    if (dot.r !== d.lastDot.r && dot.c !== d.lastDot.c) { d.lastDot = dot; return; }
    const changes: [number, Mark][] = [];
    let at = d.lastDot;
    while (at.r !== dot.r || at.c !== dot.c) {
      const next = { r: at.r + Math.sign(dot.r - at.r), c: at.c + Math.sign(dot.c - at.c) };
      const edge = edgeBetween(at, next);
      if (d.value === null) d.value = valueFor(edge);
      if (!locked?.has(edge) && marks[edge] !== d.value) changes.push([edge, d.value]);
      at = next;
    }
    d.lastDot = dot; d.moved = true;
    if (changes.length) onEdges?.(changes);
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || readOnly || d.moved) return;
    const p = toBoard(e);
    if (tool === 'hint') { onHint?.(Math.round(p.y) - 1, Math.round(p.x) - 1); return; }
    const edge = nearEdge(p);
    if (edge < 0 || locked?.has(edge)) return;
    // With the pen, a tap is for ✕ (lines are drawn by dragging): empty → ✕, and a line or ✕ clears.
    const value: Mark = tool === 'pen' ? (marks[edge] ? 0 : 2) : valueFor(edge);
    if (value !== marks[edge]) onEdges?.([[edge, value]]);
  };

  const lineFor = (edge: number, color: string, width: number, key: string, opacity = 1) => {
    const { horizontal, r, c } = edgeAt(g, edge);
    const x1 = c + 0.5, y1 = r + 0.5;
    return <line key={key} x1={x1} y1={y1} x2={horizontal ? x1 + 1 : x1} y2={horizontal ? y1 : y1 + 1} stroke={color} strokeWidth={width} strokeLinecap="round" opacity={opacity} />;
  };
  const crossFor = (edge: number, key: string, color: string) => {
    const { horizontal, r, c } = edgeAt(g, edge);
    const cx = horizontal ? c + 1 : c + 0.5, cy = horizontal ? r + 0.5 : r + 1, s = 0.09;
    return <path key={key} d={`M${cx - s} ${cy - s}L${cx + s} ${cy + s}M${cx + s} ${cy - s}L${cx - s} ${cy + s}`} stroke={color} strokeWidth={0.045} strokeLinecap="round" />;
  };

  const solutionSet = solutionUpTo ? new Set(solutionUpTo) : null;
  const area = flashArea ? { r: Math.max(0, Math.min(puzzle.rows - 2, flashArea.r)), c: Math.max(0, Math.min(puzzle.cols - 2, flashArea.c)) } : null;

  return (
    <svg
      ref={svgRef} viewBox={`0 0 ${n} ${n}`} role="img" aria-label="board"
      className={`mx-auto block aspect-square w-full max-w-[min(100%,calc(100svh-290px))] lg:max-w-[min(100%,calc(100svh-250px))] touch-none select-none rounded-[10px] ${readOnly ? '' : tool === 'hint' ? 'cursor-help' : 'cursor-crosshair'}`}
      style={{ background: BG }}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={() => { drag.current = null; }}
    >
      {area && <rect x={area.c + 0.5 - 0.18} y={area.r + 0.5 - 0.18} width={2.36} height={2.36} rx={0.18} fill={HINT} opacity={0.16} stroke={HINT} strokeWidth={0.04} />}
      {puzzle.clues.map((v, cell) => {
        if (v < 0) return null;
        const r = Math.floor(cell / puzzle.cols), c = cell % puzzle.cols;
        return <text key={`n${cell}`} x={c + 1} y={r + 1.03} textAnchor="middle" dominantBaseline="middle" fontSize={0.56} fontFamily="Georgia, 'Times New Roman', serif" fontWeight={600} fill={NUM}>{v}</text>;
      })}
      {marks.map((m, edge) => m === 1 ? lineFor(edge, locked?.has(edge) ? HINT : LINE, 0.1, `l${edge}`, dimLines ? 0.25 : 1) : null)}
      {marks.map((m, edge) => m === 2 ? crossFor(edge, `x${edge}`, locked?.has(edge) ? HINT : '#8a83b8') : null)}
      {solutionSet && [...solutionSet].map((edge) => lineFor(edge, SOLUTION, 0.12, `s${edge}`))}
      {Array.from({ length: n * n }, (_, i) => <circle key={`d${i}`} cx={(i % n) + 0.5} cy={Math.floor(i / n) + 0.5} r={0.075} fill={DOT} />)}
    </svg>
  );
}

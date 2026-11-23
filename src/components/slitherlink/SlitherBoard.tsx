"use client";

import { useEffect, useRef } from 'react';
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

/** The changes that put `marks` back the way they were before `changes` (for 되돌리기). */
export const undoOf = (marks: Mark[], changes: [number, Mark][]): [number, Mark][] => changes.map(([e]) => [e, marks[e]]);

/** Ctrl+Z / ⌘Z runs `onUndo` (not while typing in a field). */
export function useUndoKey(onUndo: () => void) {
  const latest = useRef(onUndo);
  useEffect(() => { latest.current = onUndo; });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.shiftKey || e.altKey || e.key.toLowerCase() !== 'z') return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      e.preventDefault();
      latest.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

/**
 * The dotted board. Tap between two dots to change that edge: with the pen a tap toggles empty ↔ line (a ✕ is cleared);
 * the eraser clears and only the marker toggles ✕. With the hint tool, a tap picks the 3×3-dot area around it.
 * `onEdges` gets the [edge, value] pairs of one tap.
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
  // Where the pointer went down: a tap counts only if it ends near there (a scroll or slip is ignored).
  const press = useRef<Point | null>(null);

  const toBoard = (e: React.PointerEvent): Point => {
    const box = svgRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - box.left) / box.width) * n - 0.5, y: ((e.clientY - box.top) / box.height) * n - 0.5 };
  };
  const nearEdge = (p: Point) => {
    let best = -1, dist = 0.42;
    const hr = Math.round(p.y), hc = Math.floor(p.x);
    if (hr >= 0 && hr <= puzzle.rows && hc >= 0 && hc < puzzle.cols && Math.abs(p.y - hr) < dist) { best = hEdge(g, hr, hc); dist = Math.abs(p.y - hr); }
    const vc = Math.round(p.x), vr = Math.floor(p.y);
    if (vc >= 0 && vc <= puzzle.cols && vr >= 0 && vr < puzzle.rows && Math.abs(p.x - vc) < dist) best = vEdge(g, vr, vc);
    return best;
  };

  /** What a tap with the current tool does to an edge. */
  const valueFor = (edge: number): Mark => {
    if (tool === 'eraser') return 0;
    if (tool === 'marker') return marks[edge] === 2 ? 0 : 2;
    return marks[edge] === 0 ? 1 : 0;
  };

  const onDown = (e: React.PointerEvent) => {
    if (readOnly) return;
    press.current = toBoard(e);
  };
  const onUp = (e: React.PointerEvent) => {
    const start = press.current;
    press.current = null;
    if (!start || readOnly) return;
    const p = toBoard(e);
    if (Math.hypot(p.x - start.x, p.y - start.y) > 0.45) return;
    if (tool === 'hint') { onHint?.(Math.round(p.y) - 1, Math.round(p.x) - 1); return; }
    const edge = nearEdge(start);
    if (edge < 0 || locked?.has(edge)) return;
    const value = valueFor(edge);
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
      className={`mx-auto block aspect-square w-full max-w-[min(100%,calc(100svh-290px))] lg:max-w-[min(100%,calc(100svh-250px))] touch-none select-none rounded-[10px] ${readOnly ? '' : tool === 'hint' ? 'cursor-help' : 'cursor-pointer'}`}
      style={{ background: BG }}
      onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => { press.current = null; }}
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

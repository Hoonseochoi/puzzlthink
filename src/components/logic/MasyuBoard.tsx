"use client";

import { useEffect, useId, useMemo, useRef } from 'react';
import { brokenPearls, edgeAt, geometry, hEdge, vEdge } from '@/lib/masyu';
import type { MasyuBoard as Board } from '@/lib/logicPuzzles';
import { StoneDefs, StoneFace } from './StoneFace';

const BG = '#f7f2e8';
const GRID = '#e6dccb';
const DOT = '#cfc3ae';
const LINE = '#ff4d5e';
const SOLUTION = '#f2b630';

type Point = { x: number; y: number };

/**
 * The 마슈 board: cream paper, the loop drawn in coral between cell centers, pearls as white / black stone characters
 * (they smile once their rule is kept, frown when it is broken).
 * Tap between two cell centers to cycle line → ✕ → empty; or drag from cell to cell to draw (dragging over a line erases).
 * `onMarks` gets [edge, value] pairs with a gesture id (one undo step per tap or drag).
 */
export default function MasyuBoard({ board, marks, onMarks, readOnly = false, solutionLines = null, dimLines = false }: {
  board: Board; marks: number[]; onMarks?: (changes: [number, number][], gesture: number) => void;
  readOnly?: boolean; solutionLines?: number[] | null; dimLines?: boolean;
}) {
  const n = board.size;
  const g = geometry(n);
  const prefix = `ms${useId().replace(/[:«»]/g, '')}`;
  const svgRef = useRef<SVGSVGElement>(null);
  const press = useRef<{ start: Point; last: number; value: number | null; moved: boolean; gesture: number } | null>(null);
  const gestures = useRef(0);
  const live = useRef(marks);
  useEffect(() => { live.current = marks; }, [marks]);

  // Stone faces follow the lines on show: the answer once it is revealed, else the player's own.
  const faceLines = useMemo(() => {
    if (!solutionLines) return marks;
    const list = new Array<number>(g.edgeCount).fill(0);
    for (const e of solutionLines) list[e] = 1;
    return list;
  }, [solutionLines, marks, g]);
  const broken = useMemo(() => brokenPearls({ id: 0, size: n, pearls: board.pearls }, faceLines), [board, faceLines, n]);
  const degree = useMemo(() => {
    const d = new Array<number>(n * n).fill(0);
    faceLines.forEach((m, e) => { if (m === 1) { d[g.ends[e][0]]++; d[g.ends[e][1]]++; } });
    return d;
  }, [faceLines, g, n]);

  const toBoard = (e: React.PointerEvent): Point => {
    const box = svgRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - box.left) / box.width) * n, y: ((e.clientY - box.top) / box.height) * n };
  };
  const cellAt = (p: Point, reach: number) => {
    const r = Math.floor(p.y), c = Math.floor(p.x);
    if (r < 0 || r >= n || c < 0 || c >= n) return -1;
    return Math.hypot(p.x - (c + 0.5), p.y - (r + 0.5)) <= reach ? r * n + c : -1;
  };
  const nearEdge = (p: Point) => {
    let best = -1, dist = 0.36;
    const hr = Math.floor(p.y), hc = Math.round(p.x) - 1;
    if (hr >= 0 && hr < n && hc >= 0 && hc < n - 1 && Math.abs(p.y - (hr + 0.5)) < dist) { best = hEdge(n, hr, hc); dist = Math.abs(p.y - (hr + 0.5)); }
    const vc = Math.floor(p.x), vr = Math.round(p.y) - 1;
    if (vc >= 0 && vc < n && vr >= 0 && vr < n - 1 && Math.abs(p.x - (vc + 0.5)) < dist) best = vEdge(n, vr, vc);
    return best;
  };
  const edgeBetween = (a: number, b: number) => {
    const ra = Math.floor(a / n), ca = a % n, rb = Math.floor(b / n), cb = b % n;
    if (ra === rb && Math.abs(ca - cb) === 1) return hEdge(n, ra, Math.min(ca, cb));
    if (ca === cb && Math.abs(ra - rb) === 1) return vEdge(n, Math.min(ra, rb), ca);
    return -1;
  };

  const onDown = (e: React.PointerEvent) => {
    if (readOnly) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* not every pointer can be captured */ }
    const p = toBoard(e);
    press.current = { start: p, last: cellAt(p, 0.42), value: null, moved: false, gesture: ++gestures.current };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = press.current;
    if (!d || readOnly) return;
    const cell = cellAt(toBoard(e), 0.32);
    if (cell < 0 || cell === d.last) return;
    if (d.last < 0) { d.last = cell; return; }
    const edge = edgeBetween(d.last, cell);
    d.last = cell;
    if (edge < 0) return;
    if (d.value === null) d.value = live.current[edge] === 1 ? 0 : 1;
    d.moved = true;
    if (live.current[edge] !== d.value) onMarks?.([[edge, d.value]], d.gesture);
  };
  const onUp = (e: React.PointerEvent) => {
    const d = press.current;
    press.current = null;
    if (!d || readOnly || d.moved) return;
    const p = toBoard(e);
    if (Math.hypot(p.x - d.start.x, p.y - d.start.y) > 0.45) return;
    const edge = nearEdge(d.start);
    if (edge < 0) return;
    const now = live.current[edge];
    onMarks?.([[edge, now === 0 ? 1 : now === 1 ? 2 : 0]], d.gesture);
  };

  const seg = (edge: number, color: string, width: number, key: string, opacity = 1) => {
    const { horizontal, r, c } = edgeAt(n, edge);
    const x1 = c + 0.5, y1 = r + 0.5;
    return <line key={key} x1={x1} y1={y1} x2={horizontal ? x1 + 1 : x1} y2={horizontal ? y1 : y1 + 1} stroke={color} strokeWidth={width} strokeLinecap="round" opacity={opacity} />;
  };
  const cross = (edge: number) => {
    const { horizontal, r, c } = edgeAt(n, edge);
    const cx = horizontal ? c + 1 : c + 0.5, cy = horizontal ? r + 0.5 : r + 1, s = 0.08;
    return <path key={`x${edge}`} d={`M${cx - s} ${cy - s}L${cx + s} ${cy + s}M${cx + s} ${cy - s}L${cx - s} ${cy + s}`} stroke="#a89d8a" strokeWidth={0.04} strokeLinecap="round" />;
  };

  return (
    <svg
      ref={svgRef} viewBox={`0 0 ${n} ${n}`} role="img" aria-label="board"
      className={`mx-auto block aspect-square w-full max-w-[min(100%,calc(100svh-300px))] touch-none select-none rounded-[18px] shadow-[0_18px_50px_rgba(0,0,0,.45),inset_0_0_0_1px_rgba(255,255,255,.6)] lg:max-w-[min(100%,calc(100svh-250px))] ${readOnly ? '' : 'cursor-pointer'}`}
      style={{ background: BG }}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={() => { press.current = null; }}
    >
      <StoneDefs prefix={prefix} />
      {Array.from({ length: n - 1 }, (_, i) => (
        <g key={`g${i}`} stroke={GRID} strokeWidth={0.02}>
          <line x1={i + 1} y1={0} x2={i + 1} y2={n} />
          <line x1={0} y1={i + 1} x2={n} y2={i + 1} />
        </g>
      ))}
      {Array.from({ length: n * n }, (_, i) => <circle key={`d${i}`} cx={(i % n) + 0.5} cy={Math.floor(i / n) + 0.5} r={0.045} fill={DOT} />)}
      {marks.map((m, e) => (m === 2 ? cross(e) : null))}
      {marks.map((m, e) => (m === 1 ? seg(e, LINE, 0.17, `l${e}`, dimLines ? 0.25 : 1) : null))}
      {solutionLines && solutionLines.map((e) => seg(e, SOLUTION, 0.17, `s${e}`))}
      {board.pearls.map((p, cell) => {
        if (!p) return null;
        const mood = broken.has(cell) ? 'worried' : degree[cell] === 2 ? 'happy' : 'idle';
        return <StoneFace key={`p${cell}`} prefix={prefix} kind={p === 2 ? 'black' : 'white'} cx={(cell % n) + 0.5} cy={Math.floor(cell / n) + 0.5} r={0.33} mood={mood} />;
      })}
    </svg>
  );
}

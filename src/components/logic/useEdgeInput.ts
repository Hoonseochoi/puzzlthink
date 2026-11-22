"use client";

import { useEffect, useRef } from 'react';
import { edgeOf } from './edgeGeometry';

type Point = { x: number; y: number };

/**
 * Pointer handling shared by the line boards (한붓길, 컬러 잇기), the same feel as 마슈:
 * drag from cell to cell to draw (a drag that starts on a line erases), or tap between two cells to cycle line → ✕ → empty.
 * The SVG viewBox must be `0 0 n n`. `onMarks` gets [edge, value] pairs with a gesture id (one undo step per tap or drag).
 */
export function useEdgeInput(n: number, marks: number[], onMarks: ((changes: [number, number][], gesture: number) => void) | undefined, readOnly: boolean) {
  const svgRef = useRef<SVGSVGElement>(null);
  const live = useRef(marks);
  useEffect(() => { live.current = marks; }, [marks]);
  const gestures = useRef(0);
  const press = useRef<{ start: Point; last: number; value: number | null; moved: boolean; gesture: number } | null>(null);

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
    if (hr >= 0 && hr < n && hc >= 0 && hc < n - 1 && Math.abs(p.y - (hr + 0.5)) < dist) { best = edgeOf(n, hr * n + hc, hr * n + hc + 1); dist = Math.abs(p.y - (hr + 0.5)); }
    const vc = Math.floor(p.x), vr = Math.round(p.y) - 1;
    if (vc >= 0 && vc < n && vr >= 0 && vr < n - 1 && Math.abs(p.x - (vc + 0.5)) < dist) best = edgeOf(n, vr * n + vc, (vr + 1) * n + vc);
    return best;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (readOnly) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* not every pointer can be captured */ }
    const p = toBoard(e);
    press.current = { start: p, last: cellAt(p, 0.45), value: null, moved: false, gesture: ++gestures.current };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = press.current;
    if (!d || readOnly) return;
    const cell = cellAt(toBoard(e), 0.34);
    if (cell < 0 || cell === d.last) return;
    if (d.last < 0) { d.last = cell; return; }
    const edge = edgeOf(n, d.last, cell);
    d.last = cell;
    if (edge < 0) return;
    if (d.value === null) d.value = live.current[edge] === 1 ? 0 : 1;
    d.moved = true;
    if (live.current[edge] !== d.value) onMarks?.([[edge, d.value]], d.gesture);
  };
  const onPointerUp = (e: React.PointerEvent) => {
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
  const onPointerCancel = () => { press.current = null; };

  return { svgRef, handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel } };
}

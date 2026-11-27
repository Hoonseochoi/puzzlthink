"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { type Mark, type Puzzle, cellCount, edgeAt, geometry, hEdge, loopOrder, vEdge } from '@/lib/slitherlink';
import { CLASSIC_THEME, type SlitherTheme } from '@/lib/slitherTheme';
import { starSpot } from '@/lib/slitherGlyphs';
import { ClearStar, CuteClue, GarlandBulbs, clueState } from './SlitherFestive';

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
/** Replay with the answer: the answer as a soft green track, the player's marks that disagree with it in red. */
const TRACK = '#2fb47c';
const WRONG = '#e5484d';

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
 * The dotted board. Tap between two dots to change that edge: with the pen a tap toggles empty ↔ line (a ✕ is cleared) and a drag draws a line over every empty edge it crosses (started on a line, it erases lines);
 * the eraser clears and only the marker toggles ✕. With the hint tool, a tap picks the 3×3-dot area around it.
 * `onEdges` gets the [edge, value] pairs of one tap.
 */
export default function SlitherBoard({ puzzle, marks, tool, locked, onEdges, onHint, solutionUpTo = null, dimLines = false, readOnly = false, flashArea = null, answerTrack = false, theme = CLASSIC_THEME, motion = false, celebrate = false }: {
  puzzle: Puzzle; marks: Mark[]; tool: Tool; locked?: ReadonlySet<number>;
  onEdges?: (changes: [number, Mark][]) => void; onHint?: (r: number, c: number) => void;
  /** Give-up animation: the first N edges of the answer (in loop order) drawn over the board. */
  solutionUpTo?: number[] | null;
  dimLines?: boolean; readOnly?: boolean;
  /** Top-left dot of a hint area to outline. */
  flashArea?: { r: number; c: number } | null;
  /** Replay: show the whole answer under the player's lines and mark the player's lines and ✕ that disagree with it. */
  answerTrack?: boolean;
  /** Board theme (src/lib/slitherTheme.ts); Classic is the show's look. */
  theme?: SlitherTheme;
  /** Whether the theme's animated touches may run (effects on, no reduced-motion). */
  motion?: boolean;
  /** The loop is solved: the theme's clear celebration. */
  celebrate?: boolean;
}) {
  const g = geometry(puzzle.rows, puzzle.cols);
  const n = puzzle.dots;
  const svgRef = useRef<SVGSVGElement>(null);
  // Where the pointer went down: a tap counts only if it ends near there (a scroll or slip is ignored).
  const press = useRef<Point | null>(null);
  // Pen drag: one stroke draws lines over every empty edge it crosses (or, started on a line, erases lines). Committed in one step on release.
  const stroke = useRef<{ erase: boolean; seen: Set<number>; changes: Map<number, Mark> } | null>(null);
  const [preview, setPreview] = useState<Map<number, Mark> | null>(null);
  const last = useRef<Point | null>(null);

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
    press.current = toBoard(e); last.current = press.current; stroke.current = null;
    if (tool === 'pen') svgRef.current?.setPointerCapture?.(e.pointerId);
  };
  /** Add the edge under `p` to the stroke (draw on empty, or erase lines when the stroke began on a line). */
  const strokeAt = (st: NonNullable<typeof stroke.current>, p: Point) => {
    const edge = nearEdge(p);
    if (edge < 0 || locked?.has(edge) || st.seen.has(edge)) return;
    st.seen.add(edge);
    const now = marks[edge];
    if (st.erase ? now === 1 : now === 0) st.changes.set(edge, st.erase ? 0 : 1);
  };
  const onMove = (e: React.PointerEvent) => {
    const start = press.current;
    if (!start || readOnly || tool !== 'pen') return;
    const p = toBoard(e);
    if (!stroke.current) {
      if (Math.hypot(p.x - start.x, p.y - start.y) <= 0.45) return;
      const first = nearEdge(start);
      stroke.current = { erase: first >= 0 && marks[first] === 1, seen: new Set(), changes: new Map() };
      strokeAt(stroke.current, start);
    }
    const from = last.current ?? start;
    const steps = Math.max(1, Math.ceil(Math.hypot(p.x - from.x, p.y - from.y) / 0.15));
    for (let i = 1; i <= steps; i++) strokeAt(stroke.current, { x: from.x + ((p.x - from.x) * i) / steps, y: from.y + ((p.y - from.y) * i) / steps });
    last.current = p;
    setPreview(new Map(stroke.current.changes));
  };
  const onUp = (e: React.PointerEvent) => {
    const start = press.current;
    press.current = null;
    const st = stroke.current;
    stroke.current = null; last.current = null;
    if (st) {
      setPreview(null);
      if (!readOnly && st.changes.size) onEdges?.([...st.changes]);
      return;
    }
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

  const shown = preview ? marks.map((m, i) => preview.get(i) ?? m) : marks;
  const solutionSet = solutionUpTo ? new Set(solutionUpTo) : null;
  const area = flashArea ? { r: Math.max(0, Math.min(puzzle.rows - 2, flashArea.r)), c: Math.max(0, Math.min(puzzle.cols - 2, flashArea.c)) } : null;

  const festive = theme.id !== 'classic';
  const handlers = {
    onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp,
    onPointerCancel: () => { press.current = null; stroke.current = null; setPreview(null); },
  };
  if (festive) return <FestiveBoard {...{ puzzle, shown, locked, answerTrack, dimLines, solutionSet, area, theme, motion, celebrate, readOnly, tool, svgRef, handlers, lineFor, crossFor }} />;

  return (
    <svg
      ref={svgRef} viewBox={`0 0 ${n} ${n}`} role="img" aria-label="board"
      className={`mx-auto block aspect-square w-full max-w-[min(100%,calc(100svh-290px))] lg:max-w-[min(100%,calc(100svh-250px))] touch-none select-none rounded-[10px] ${readOnly ? '' : tool === 'hint' ? 'cursor-help' : 'cursor-pointer'}`}
      style={{ background: BG }}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={() => { press.current = null; stroke.current = null; setPreview(null); }}
    >
      {area && <rect x={area.c + 0.5 - 0.18} y={area.r + 0.5 - 0.18} width={2.36} height={2.36} rx={0.18} fill={HINT} opacity={0.16} stroke={HINT} strokeWidth={0.04} />}
      {puzzle.clues.map((v, cell) => {
        if (v < 0) return null;
        const r = Math.floor(cell / puzzle.cols), c = cell % puzzle.cols;
        return <text key={`n${cell}`} x={c + 1} y={r + 1.03} textAnchor="middle" dominantBaseline="middle" fontSize={0.56} fontFamily="Georgia, 'Times New Roman', serif" fontWeight={600} fill={NUM}>{v}</text>;
      })}
      {answerTrack && puzzle.solution.map((on, edge) => on ? lineFor(edge, TRACK, 0.26, `t${edge}`, 0.32) : null)}
      {shown.map((m, edge) => m === 1 ? lineFor(edge, locked?.has(edge) ? HINT : answerTrack && !puzzle.solution[edge] ? WRONG : LINE, 0.1, `l${edge}`, dimLines ? 0.25 : 1) : null)}
      {shown.map((m, edge) => m === 2 ? crossFor(edge, `x${edge}`, locked?.has(edge) ? HINT : answerTrack && puzzle.solution[edge] ? WRONG : '#8a83b8') : null)}
      {solutionSet && [...solutionSet].map((edge) => lineFor(edge, SOLUTION, 0.12, `s${edge}`))}
      {Array.from({ length: n * n }, (_, i) => <circle key={`d${i}`} cx={(i % n) + 0.5} cy={Math.floor(i / n) + 0.5} r={0.075} fill={DOT} />)}
    </svg>
  );
}

type LineFn = (edge: number, color: string, width: number, key: string, opacity?: number) => React.ReactNode;

/** The themed board (anything but Classic): same layout and input as Classic, drawn with the theme's styles. */
function FestiveBoard({ puzzle, shown, locked, answerTrack, dimLines, solutionSet, area, theme, motion, celebrate, readOnly, tool, svgRef, handlers, lineFor, crossFor }: {
  puzzle: Puzzle; shown: Mark[]; locked?: ReadonlySet<number>; answerTrack: boolean; dimLines: boolean; solutionSet: Set<number> | null;
  area: { r: number; c: number } | null; theme: SlitherTheme; motion: boolean; celebrate: boolean; readOnly: boolean; tool: Tool;
  svgRef: React.RefObject<SVGSVGElement | null>; handlers: React.SVGProps<SVGSVGElement>;
  lineFor: LineFn; crossFor: (edge: number, key: string, color: string) => React.ReactNode;
}) {
  const g = geometry(puzzle.rows, puzzle.cols);
  const n = puzzle.dots;
  const b = theme.board;
  const order = useMemo(() => loopOrder(puzzle), [puzzle]);
  const star = useMemo(() => starSpot(g, puzzle.solution), [g, puzzle]);
  const garland = theme.line === 'garland' && !answerTrack;
  // Bulbs on the player's own lines (hint lines stay plain gold so they read as given).
  const bulbEdges = garland ? shown.flatMap((m, e) => (m === 1 && !locked?.has(e) ? [e] : [])) : [];
  const pop = motion && !readOnly;
  return (
    <svg
      ref={svgRef} viewBox={`0 0 ${n} ${n}`} role="img" aria-label="board" data-theme={theme.id}
      className={`mx-auto block aspect-square w-full max-w-[min(100%,calc(100svh-290px))] lg:max-w-[min(100%,calc(100svh-250px))] touch-none select-none rounded-[10px] ${readOnly ? '' : tool === 'hint' ? 'cursor-help' : 'cursor-pointer'}`}
      style={{ background: b.bg2 ? `linear-gradient(160deg, ${b.bg} 0%, ${b.bg} 45%, ${b.bg2} 100%)` : b.bg, boxShadow: 'inset 0 0 0 1px rgba(30,107,71,0.18)' }}
      {...handlers}
    >
      {area && <rect x={area.c + 0.5 - 0.18} y={area.r + 0.5 - 0.18} width={2.36} height={2.36} rx={0.18} fill={b.hint} opacity={0.16} stroke={b.hint} strokeWidth={0.04} />}
      {puzzle.clues.map((v, cell) => {
        if (v < 0) return null;
        const r = Math.floor(cell / puzzle.cols), c = cell % puzzle.cols;
        const state = theme.clueStates ? clueState(v, cellCount(g, shown, cell)) : 'normal';
        return <CuteClue key={`n${cell}-${state}`} x={c + 1} y={r + 1} value={v} state={state} theme={theme} pop={pop} />;
      })}
      {answerTrack && puzzle.solution.map((on, edge) => on ? lineFor(edge, b.track, 0.26, `t${edge}`, 0.32) : null)}
      {shown.map((m, edge) => m === 1 ? lineFor(edge, locked?.has(edge) ? b.hint : answerTrack && !puzzle.solution[edge] ? b.wrong : b.line, 0.1, `l${edge}`, dimLines ? 0.25 : 1) : null)}
      {garland && <g opacity={dimLines ? 0.25 : 1}><GarlandBulbs g={g} edges={bulbEdges} theme={theme} lit={celebrate} order={order} motion={motion} /></g>}
      {shown.map((m, edge) => m === 2 ? crossFor(edge, `x${edge}`, locked?.has(edge) ? b.hint : answerTrack && puzzle.solution[edge] ? b.wrong : b.cross) : null)}
      {solutionSet && [...solutionSet].map((edge) => lineFor(edge, b.solution, 0.12, `s${edge}`))}
      {Array.from({ length: n * n }, (_, i) => <circle key={`d${i}`} cx={(i % n) + 0.5} cy={Math.floor(i / n) + 0.5} r={0.07} fill={b.dot} />)}
      {celebrate && theme.effects.celebrate && star && <ClearStar x={star.x} y={star.y} motion={motion} />}
    </svg>
  );
}

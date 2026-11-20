import { edgeAt, geometry } from '@/lib/slitherlink';

/** An edge: horizontal ('h', dot row, cell col) or vertical ('v', cell row, dot col), or an edge id. */
export type EdgeSpec = ['h' | 'v', number, number] | number;
type Cell = [number, number];

const LINE = '#ff3d7f', FRESH = '#ffb020', INK = '#4b37b8';

/**
 * A static slitherlink picture for the guide: numbers, the loop so far (pink), ✕ marks, and what this step
 * just decided (amber). `inside` / `outside` tint cells for the inside-outside technique; `focus` rings cells.
 */
export default function SlitherDiagram({ rows, cols, clues, lines = [], crosses = [], fresh = [], inside = [], outside = [], focus = [], cell = 34, label }: {
  rows: number; cols: number; clues: string[]; lines?: EdgeSpec[]; crosses?: EdgeSpec[]; fresh?: EdgeSpec[];
  inside?: Cell[]; outside?: Cell[]; focus?: Cell[]; cell?: number; label?: string;
}) {
  const g = geometry(rows, cols);
  const pad = cell * 0.42;
  const w = cols * cell + pad * 2, h = rows * cell + pad * 2;
  const norm = (e: EdgeSpec): { horizontal: boolean; r: number; c: number } => typeof e === 'number' ? edgeAt(g, e) : { horizontal: e[0] === 'h', r: e[1], c: e[2] };
  const key = (e: EdgeSpec) => { const n = norm(e); return `${n.horizontal ? 'h' : 'v'}${n.r}-${n.c}`; };
  const freshSet = new Set(fresh.map(key));
  const seg = (e: EdgeSpec) => { const { horizontal, r, c } = norm(e); const x = pad + c * cell, y = pad + r * cell; return horizontal ? [x, y, x + cell, y] : [x, y, x, y + cell]; };
  const x = (c: number) => pad + c * cell, y = (r: number) => pad + r * cell;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: w * 1.25 }} className="block rounded-[12px] bg-[#ecebff]" role="img" aria-label={label}>
      {inside.map(([r, c]) => <rect key={`i${r}-${c}`} x={x(c)} y={y(r)} width={cell} height={cell} fill="#ff3d7f" fillOpacity=".16" />)}
      {outside.map(([r, c]) => <rect key={`o${r}-${c}`} x={x(c)} y={y(r)} width={cell} height={cell} fill="#4b37b8" fillOpacity=".09" />)}
      {focus.map(([r, c]) => <rect key={`f${r}-${c}`} x={x(c) + 2} y={y(r) + 2} width={cell - 4} height={cell - 4} rx={6} fill="none" stroke={FRESH} strokeWidth={2.5} strokeDasharray="4 3" />)}
      {clues.flatMap((row, r) => [...row].map((ch, c) => ch === '.' || ch === ' ' ? null : (
        <text key={`n${r}-${c}`} x={x(c) + cell / 2} y={y(r) + cell / 2} dy=".36em" textAnchor="middle" fontSize={cell * 0.55} fontWeight={900} fill={INK}>{ch}</text>
      )))}
      {crosses.map((e) => { const [x1, y1, x2, y2] = seg(e); const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, s = cell * 0.11; const col = freshSet.has(key(e)) ? FRESH : '#8f86c9';
        return <g key={`x${key(e)}`} stroke={col} strokeWidth={freshSet.has(key(e)) ? 2.6 : 2} strokeLinecap="round"><line x1={mx - s} y1={my - s} x2={mx + s} y2={my + s} /><line x1={mx - s} y1={my + s} x2={mx + s} y2={my - s} /></g>; })}
      {lines.map((e) => { const [x1, y1, x2, y2] = seg(e); const f = freshSet.has(key(e));
        return <line key={`l${key(e)}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={f ? FRESH : LINE} strokeWidth={cell * 0.16} strokeLinecap="round" />; })}
      {Array.from({ length: (rows + 1) * (cols + 1) }, (_, i) => <circle key={`d${i}`} cx={x(i % (cols + 1))} cy={y(Math.floor(i / (cols + 1)))} r={cell * 0.075} fill={INK} />)}
    </svg>
  );
}

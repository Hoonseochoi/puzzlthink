import { PLAYER_COLORS } from './wallgoTheme';

type Side = 'up' | 'right' | 'down' | 'left';
type Cell = string; // "D4": column A-G, row 1-7 from the top

export type DiagramSpec = {
  pieces?: [0 | 1 | 2, Cell][];
  walls?: [Cell, Side][];
  danger?: [Cell, Side][]; // edge an opponent could close
  hint?: [Cell, Side][]; // edge you could close but should not
  moves?: [Cell, Cell][];
  breakMoves?: [Cell, Cell][];
  blocked?: Cell[];
  zones?: { player: 0 | 1 | 2; cells: Cell[] }[];
};

const SIZE = 7;
const C = 20;
const PAD = 12;

const pos = (cell: Cell) => ({ col: cell.charCodeAt(0) - 65, row: Number(cell.slice(1)) - 1 });
const center = (cell: Cell) => { const { col, row } = pos(cell); return { x: PAD + col * C + C / 2, y: PAD + row * C + C / 2 }; };
const edge = (cell: Cell, side: Side) => {
  const { col, row } = pos(cell);
  const x0 = PAD + col * C, y0 = PAD + row * C;
  return {
    up: [x0, y0, x0 + C, y0],
    down: [x0, y0 + C, x0 + C, y0 + C],
    left: [x0, y0, x0, y0 + C],
    right: [x0 + C, y0, x0 + C, y0 + C],
  }[side];
};
const shorten = (from: Cell, to: Cell) => {
  const a = center(from), b = center(to);
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const ux = (b.x - a.x) / len, uy = (b.y - a.y) / len;
  return [a.x + ux * 8, a.y + uy * 8, b.x - ux * 6, b.y - uy * 6];
};

export default function WallGoDiagram({ spec, label }: { spec: DiagramSpec; label: string }) {
  const full = PAD * 2 + SIZE * C;
  return (
    <svg viewBox={`0 0 ${full} ${full}`} role="img" aria-label={label} className="h-auto w-full">
      <defs>
        <marker id="wg-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#c9cfdc" /></marker>
        <marker id="wg-arrow-red" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#e0283a" /></marker>
      </defs>
      <rect x={PAD - 3} y={PAD - 3} width={SIZE * C + 6} height={SIZE * C + 6} rx="3" fill="#0e0e12" stroke="#8d95a8" strokeWidth="1" />
      <rect x={PAD} y={PAD} width={SIZE * C} height={SIZE * C} fill="#17181e" />
      {spec.zones?.flatMap((zone) => zone.cells.map((cell) => { const { col, row } = pos(cell); return <rect key={`${zone.player}-${cell}`} x={PAD + col * C} y={PAD + row * C} width={C} height={C} fill={PLAYER_COLORS[zone.player]} fillOpacity="0.22" />; }))}
      {Array.from({ length: SIZE - 1 }).map((_, i) => (
        <g key={i} stroke="#2a2c35" strokeWidth="0.6">
          <line x1={PAD + (i + 1) * C} y1={PAD} x2={PAD + (i + 1) * C} y2={PAD + SIZE * C} />
          <line x1={PAD} y1={PAD + (i + 1) * C} x2={PAD + SIZE * C} y2={PAD + (i + 1) * C} />
        </g>
      ))}
      {Array.from({ length: SIZE }).map((_, i) => (
        <g key={`l${i}`} fill="#5a6070" fontSize="5" fontFamily="monospace" textAnchor="middle">
          <text x={PAD + i * C + C / 2} y={PAD - 5}>{String.fromCharCode(65 + i)}</text>
          <text x={PAD - 6} y={PAD + i * C + C / 2 + 2}>{i + 1}</text>
        </g>
      ))}
      {spec.hint?.map(([cell, side]) => { const [x1, y1, x2, y2] = edge(cell, side); return <line key={`h${cell}${side}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8d95a8" strokeWidth="2" strokeDasharray="2 2" strokeLinecap="round" />; })}
      {spec.danger?.map(([cell, side]) => { const [x1, y1, x2, y2] = edge(cell, side); return <line key={`d${cell}${side}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e0283a" strokeWidth="2.5" strokeDasharray="3 2" strokeLinecap="round" />; })}
      {spec.walls?.map(([cell, side]) => { const [x1, y1, x2, y2] = edge(cell, side); return <line key={`w${cell}${side}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e6e9f0" strokeWidth="2.5" strokeLinecap="round" />; })}
      {spec.moves?.map(([from, to]) => { const [x1, y1, x2, y2] = shorten(from, to); return <line key={`m${from}${to}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c9cfdc" strokeWidth="1.4" markerEnd="url(#wg-arrow)" />; })}
      {spec.breakMoves?.map(([from, to]) => { const [x1, y1, x2, y2] = shorten(from, to); return <line key={`b${from}${to}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e0283a" strokeWidth="1.4" strokeDasharray="3 2" markerEnd="url(#wg-arrow-red)" />; })}
      {spec.blocked?.map((cell) => { const { x, y } = center(cell); return <g key={`x${cell}`} stroke="#e0283a" strokeWidth="1.6" strokeLinecap="round"><line x1={x - 4} y1={y - 4} x2={x + 4} y2={y + 4} /><line x1={x + 4} y1={y - 4} x2={x - 4} y2={y + 4} /></g>; })}
      {spec.pieces?.map(([player, cell]) => { const { x, y } = center(cell); return (
        <g key={`p${cell}`}>
          <circle cx={x} cy={y} r="7" fill={PLAYER_COLORS[player]} />
          <rect x={x - 0.2} y={y - 3.6} width="1.5" height="3" rx="0.75" fill="#fff" transform={`rotate(-20 ${x + 0.55} ${y - 2.1})`} />
          <rect x={x + 3} y={y - 4.2} width="1.4" height="2.8" rx="0.7" fill="#fff" transform={`rotate(-20 ${x + 3.7} ${y - 2.8})`} />
        </g>
      ); })}
    </svg>
  );
}

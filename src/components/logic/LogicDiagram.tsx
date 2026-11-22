import { STAR_TINTS } from '@/lib/starbattle';
import { StoneDefs, StoneFace } from './StoneFace';

/** [r1, c1, r2, c2]: a line between two neighbouring cell centers. */
export type Seg = [number, number, number, number];
export type MasyuFigure = { kind: 'masyu'; rows: number; cols: number; pearls: [number, number, 'b' | 'w'][]; lines?: Seg[]; fresh?: Seg[]; crosses?: Seg[] };
/** One nonogram line: `cells` like "..##x..", `fresh` = indices decided in this step. */
export type NonoFigure = { kind: 'nono'; clue: number[]; cells: string; fresh?: number[] };
/**
 * A small 스타배틀 board: `regions` rows of letters (a = first tint), stones and ✕ as [row, col];
 * `fresh` ✕ marks are the ones this step decides (drawn in gold).
 */
export type StarFigure = { kind: 'star'; regions: string[]; stones?: [number, number][]; crosses?: [number, number][]; fresh?: [number, number][]; plain?: boolean };
export type Figure = MasyuFigure | NonoFigure | StarFigure;

function StarDiagram({ fig, label, id }: { fig: StarFigure; label: string; id: string }) {
  const rows = fig.regions.length, cols = fig.regions[0].length;
  const at = (r: number, c: number) => fig.regions[r][c];
  const prefix = `lgs-${id}`;
  const borders: string[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (c < cols - 1 && at(r, c) !== at(r, c + 1)) borders.push(`M${c + 1} ${r}V${r + 1}`);
    if (r < rows - 1 && at(r, c) !== at(r + 1, c)) borders.push(`M${c} ${r + 1}H${c + 1}`);
  }
  const x = (r: number, c: number, color: string, key: string, w = 0.07) => {
    const cx = c + 0.5, cy = r + 0.5, s = 0.15;
    return <path key={key} d={`M${cx - s} ${cy - s}L${cx + s} ${cy + s}M${cx + s} ${cy - s}L${cx - s} ${cy + s}`} stroke={color} strokeWidth={w} strokeLinecap="round" />;
  };
  return (
    <svg viewBox={`-0.06 -0.06 ${cols + 0.12} ${rows + 0.12}`} role="img" aria-label={label} className="block w-full rounded-[12px]" style={{ background: '#2a2620' }}>
      <StoneDefs prefix={prefix} />
      {fig.regions.flatMap((line, r) => [...line].map((ch, c) => <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill={fig.plain ? '#efe7d8' : STAR_TINTS[(ch.charCodeAt(0) - 97) % STAR_TINTS.length]} />))}
      {Array.from({ length: cols - 1 }, (_, i) => <line key={`v${i}`} x1={i + 1} y1={0} x2={i + 1} y2={rows} stroke="rgba(42,38,32,.16)" strokeWidth={0.02} />)}
      {Array.from({ length: rows - 1 }, (_, i) => <line key={`h${i}`} x1={0} y1={i + 1} x2={cols} y2={i + 1} stroke="rgba(42,38,32,.16)" strokeWidth={0.02} />)}
      <path d={borders.join('')} stroke="#2a2620" strokeWidth={0.075} fill="none" strokeLinecap="square" />
      {fig.crosses?.map(([r, c], i) => x(r, c, 'rgba(42,38,32,.42)', `x${i}`))}
      {fig.fresh?.map(([r, c], i) => <g key={`f${i}`}><rect x={c + 0.06} y={r + 0.06} width={0.88} height={0.88} rx={0.14} fill="rgba(242,182,48,.35)" />{x(r, c, '#b7790a', `fx${i}`, 0.09)}</g>)}
      {fig.stones?.map(([r, c]) => <StoneFace key={`s${r}-${c}`} prefix={prefix} kind="black" cx={c + 0.5} cy={r + 0.5} r={0.33} mood="happy" />)}
    </svg>
  );
}

/** Static pictures for the guides (server-rendered): a small 마슈 / 스타배틀 board or one 노노그램 line. */
export default function LogicDiagram({ fig, label, id }: { fig: Figure; label: string; id: string }) {
  if (fig.kind === 'star') return <StarDiagram fig={fig} label={label} id={id} />;
  if (fig.kind === 'nono') {
    const n = fig.cells.length;
    const left = Math.max(1, fig.clue.length) * 0.62 + 0.3;
    const W = left + n;
    return (
      <svg viewBox={`0 0 ${W} 1.2`} role="img" aria-label={label} className="block w-full rounded-[12px]" style={{ background: '#f7f2e8' }}>
        <rect x={0} y={0.1} width={left - 0.1} height={1} rx={0.18} fill="#efe7d8" />
        {fig.clue.map((v, k) => <text key={k} x={left - 0.35 - (fig.clue.length - 1 - k) * 0.62} y={0.78} textAnchor="middle" fontSize={0.48} fontWeight={800} fill="#2a2620">{v}</text>)}
        {[...fig.cells].map((ch, i) => {
          const x = left + i, fresh = fig.fresh?.includes(i);
          return <g key={i}>
            <rect x={x} y={0.1} width={1} height={1} fill={fresh ? 'rgba(63,207,106,.22)' : 'none'} stroke={i % 5 === 0 ? '#b9ab93' : '#ded3c1'} strokeWidth={0.03} />
            {ch === '#' && <rect x={x + 0.08} y={0.18} width={0.84} height={0.84} rx={0.2} fill={fresh ? '#2fae5c' : '#22242b'} />}
            {ch === 'x' && <path d={`M${x + 0.32} 0.42L${x + 0.68} 0.78M${x + 0.68} 0.42L${x + 0.32} 0.78`} stroke={fresh ? '#2fae5c' : '#b0a48f'} strokeWidth={0.07} strokeLinecap="round" />}
          </g>;
        })}
      </svg>
    );
  }
  const { rows, cols } = fig;
  const prefix = `lgd-${id}`;
  const seg = (s: Seg, color: string, key: string, w = 0.17) => <line key={key} x1={s[1] + 0.5} y1={s[0] + 0.5} x2={s[3] + 0.5} y2={s[2] + 0.5} stroke={color} strokeWidth={w} strokeLinecap="round" />;
  return (
    <svg viewBox={`0 0 ${cols} ${rows}`} role="img" aria-label={label} className="block w-full rounded-[12px]" style={{ background: '#f7f2e8' }}>
      <StoneDefs prefix={prefix} />
      {Array.from({ length: cols - 1 }, (_, i) => <line key={`v${i}`} x1={i + 1} y1={0} x2={i + 1} y2={rows} stroke="#e6dccb" strokeWidth={0.02} />)}
      {Array.from({ length: rows - 1 }, (_, i) => <line key={`h${i}`} x1={0} y1={i + 1} x2={cols} y2={i + 1} stroke="#e6dccb" strokeWidth={0.02} />)}
      {Array.from({ length: rows * cols }, (_, i) => <circle key={`d${i}`} cx={(i % cols) + 0.5} cy={Math.floor(i / cols) + 0.5} r={0.045} fill="#cfc3ae" />)}
      {fig.crosses?.map((s, i) => {
        const cx = (s[1] + s[3]) / 2 + 0.5, cy = (s[0] + s[2]) / 2 + 0.5, d = 0.09;
        return <path key={`x${i}`} d={`M${cx - d} ${cy - d}L${cx + d} ${cy + d}M${cx + d} ${cy - d}L${cx - d} ${cy + d}`} stroke="#2fae5c" strokeWidth={0.05} strokeLinecap="round" />;
      })}
      {fig.lines?.map((s, i) => seg(s, '#ff4d5e', `l${i}`))}
      {fig.fresh?.map((s, i) => seg(s, '#f2b630', `f${i}`, 0.19))}
      {fig.pearls.map(([r, c, k]) => <StoneFace key={`${r}-${c}`} prefix={prefix} kind={k === 'b' ? 'black' : 'white'} cx={c + 0.5} cy={r + 0.5} r={0.33} />)}
    </svg>
  );
}

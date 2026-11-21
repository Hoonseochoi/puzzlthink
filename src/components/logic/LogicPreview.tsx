import { buildBoard } from '@/lib/logicPuzzles';
import { cluesOf } from '@/lib/nonogram';
import { StoneDefs, StoneFace } from './StoneFace';

/** Home card art: a solved 6×6 마슈 with the loop in coral and our stones smiling on it. */
export function MasyuPreview() {
  const b = buildBoard('masyu', 6, 20270109);
  if (b.kind !== 'masyu') return null;
  const n = 6, H = n * (n - 1);
  return <div className="w-full -rotate-2 rounded-xl bg-gradient-to-br from-[#ff6b78] to-[#d92f45] p-1.5 shadow-xl sm:w-[66%] sm:rounded-[22px] sm:p-3 sm:shadow-2xl">
    <svg viewBox={`0 0 ${n} ${n}`} className="block w-full rounded-[6px] bg-[#f7f2e8] sm:rounded-[14px]">
      <StoneDefs prefix="mpv" />
      {Array.from({ length: n * n }, (_, i) => <circle key={i} cx={(i % n) + 0.5} cy={Math.floor(i / n) + 0.5} r={0.05} fill="#cfc3ae" />)}
      {b.answer.map((v, e) => {
        if (!v) return null;
        const h = e < H, r = h ? Math.floor(e / (n - 1)) : Math.floor((e - H) / n), c = h ? e % (n - 1) : (e - H) % n;
        return <line key={e} x1={c + 0.5} y1={r + 0.5} x2={h ? c + 1.5 : c + 0.5} y2={h ? r + 0.5 : r + 1.5} stroke="#ff4d5e" strokeWidth={0.17} strokeLinecap="round" />;
      })}
      {b.pearls.map((p, cell) => (p ? <StoneFace key={cell} prefix="mpv" kind={p === 2 ? 'black' : 'white'} cx={(cell % n) + 0.5} cy={Math.floor(cell / n) + 0.5} r={0.34} mood="happy" /> : null))}
    </svg>
  </div>;
}

// The red stone character as a 10×10 picture: the top half already painted, the rest still in progress.
const PICTURE = [
  '...####...',
  '.########.',
  '.########.',
  '#####.#.##',
  '#####.#.##',
  '##########',
  '##########',
  '.########.',
  '.########.',
  '...####...',
];
const GRID = PICTURE.join('').split('').map((ch) => (ch === '#' ? 1 : 0));

/** Home card art: a 노노그램 halfway done, the picture (our red stone) lighting up row by row. */
export function NonogramPreview() {
  const n = 10;
  const { rows, cols } = cluesOf(n, GRID);
  const left = 2.2, top = 2.2, W = left + n;
  return <div className="w-full rotate-2 rounded-xl bg-gradient-to-br from-[#5fe08a] to-[#23a453] p-1.5 shadow-xl sm:w-[66%] sm:rounded-[22px] sm:p-3 sm:shadow-2xl">
    <svg viewBox={`0 0 ${W} ${W}`} className="block w-full rounded-[6px] bg-[#f7f2e8] sm:rounded-[14px]">
      {cols.map((clue, c) => clue.slice(-3).map((v, k, list) => <text key={`c${c}${k}`} x={left + c + 0.5} y={top - 0.25 - (list.length - 1 - k) * 0.62} textAnchor="middle" fontSize={0.46} fontWeight={800} fill="#2a2620">{v}</text>))}
      {rows.map((clue, r) => clue.slice(-3).map((v, k, list) => <text key={`r${r}${k}`} x={left - 0.35 - (list.length - 1 - k) * 0.62} y={top + r + 0.66} textAnchor="middle" fontSize={0.46} fontWeight={800} fill="#2a2620">{v}</text>))}
      {Array.from({ length: n + 1 }, (_, i) => <g key={i} stroke={i % 5 === 0 ? '#b9ab93' : '#ded3c1'} strokeWidth={i % 5 === 0 ? 0.05 : 0.025}><line x1={left + i} y1={top} x2={left + i} y2={top + n} /><line x1={left} y1={top + i} x2={left + n} y2={top + i} /></g>)}
      {GRID.map((v, i) => {
        const r = Math.floor(i / n), c = i % n, x = left + c, y = top + r;
        if (r >= 7 && c >= 5) return v ? null : <path key={i} d={`M${x + 0.32} ${y + 0.32}L${x + 0.68} ${y + 0.68}M${x + 0.68} ${y + 0.32}L${x + 0.32} ${y + 0.68}`} stroke="#b0a48f" strokeWidth={0.07} strokeLinecap="round" />;
        if (!v) return null;
        return <rect key={i} x={x + 0.07} y={y + 0.07} width={0.86} height={0.86} rx={0.2} fill={r < 7 ? '#ff4d5e' : '#22242b'} />;
      })}
    </svg>
  </div>;
}

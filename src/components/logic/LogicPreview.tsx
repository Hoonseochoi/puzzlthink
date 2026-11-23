import { buildBoard } from '@/lib/logicPuzzles';
import { cluesOf } from '@/lib/nonogram';
import { STAR_TINTS } from '@/lib/starbattle';
import { ColorStone, LINK_COLORS } from './ColorStone';
import { edgeCells } from './edgeGeometry';
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

/** Home card art: a solved 6×6 스타배틀 in a gold frame, the regions in our stone colours and a smiling stone in each. */
export function StarBattlePreview() {
  const b = buildBoard('starbattle', 6, 20270109);
  if (b.kind !== 'starbattle') return null;
  const n = 6;
  const borders: string[] = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const g = b.regions[r * n + c];
    if (c < n - 1 && b.regions[r * n + c + 1] !== g) borders.push(`M${c + 1} ${r}V${r + 1}`);
    if (r < n - 1 && b.regions[(r + 1) * n + c] !== g) borders.push(`M${c} ${r + 1}H${c + 1}`);
  }
  return <div className="w-full rotate-[-3deg] rounded-xl bg-gradient-to-br from-[#ffd76a] to-[#e89a12] p-1.5 shadow-xl sm:w-[66%] sm:rounded-[22px] sm:p-3 sm:shadow-2xl">
    <svg viewBox={`-0.06 -0.06 ${n + 0.12} ${n + 0.12}`} className="block w-full rounded-[6px] bg-[#2a2620] sm:rounded-[14px]">
      <StoneDefs prefix="spv" />
      {b.regions.map((g, i) => <rect key={i} x={i % n} y={Math.floor(i / n)} width={1} height={1} fill={STAR_TINTS[g % STAR_TINTS.length]} />)}
      <path d={borders.join('')} stroke="#2a2620" strokeWidth={0.08} fill="none" strokeLinecap="square" />
      {b.answer.map((v, i) => (v ? <StoneFace key={`s${i}`} prefix="spv" kind="black" cx={(i % n) + 0.5} cy={Math.floor(i / n) + 0.5} r={0.34} mood="happy" /> : null))}
    </svg>
  </div>;
}

/** Home card art: a solved 6×6 비나이로, black and white stones smiling in a blue frame. */
export function BinairoPreview() {
  const b = buildBoard('binairo', 6, 20270109);
  if (b.kind !== 'binairo') return null;
  const n = 6;
  return <div className="w-full rotate-2 rounded-xl bg-gradient-to-br from-[#6aa8ff] to-[#2563d8] p-1.5 shadow-xl sm:w-[66%] sm:rounded-[22px] sm:p-3 sm:shadow-2xl">
    <svg viewBox={`-0.05 -0.05 ${n + 0.1} ${n + 0.1}`} className="block w-full rounded-[6px] bg-[#dfe8f5] sm:rounded-[14px]">
      <StoneDefs prefix="bpv" />
      {b.answer.map((v, i) => <rect key={`c${i}`} x={(i % n) + 0.04} y={Math.floor(i / n) + 0.04} width={0.92} height={0.92} rx={0.16} fill={b.givens[i] ? '#c3d2e8' : '#f3f7fc'} />)}
      {b.answer.map((v, i) => <StoneFace key={`s${i}`} prefix="bpv" kind={v === 1 ? 'black' : 'white'} cx={(i % n) + 0.5} cy={Math.floor(i / n) + 0.5} r={0.35} mood="happy" />)}
    </svg>
  </div>;
}

/** Home card art: a solved 6×6 한붓길, the orange line running through the numbered stones. */
export function OneStrokePreview() {
  const b = buildBoard('onestroke', 6, 20270109);
  if (b.kind !== 'onestroke') return null;
  const n = 6;
  return <div className="w-full -rotate-2 rounded-xl bg-gradient-to-br from-[#ffb36b] to-[#e8660f] p-1.5 shadow-xl sm:w-[66%] sm:rounded-[22px] sm:p-3 sm:shadow-2xl">
    <svg viewBox={`0 0 ${n} ${n}`} className="block w-full rounded-[6px] bg-[#f7f2e8] sm:rounded-[14px]">
      {b.answer.map((v, e) => {
        if (!v) return null;
        const [x, y] = edgeCells(n, e);
        return <line key={e} x1={(x % n) + 0.5} y1={Math.floor(x / n) + 0.5} x2={(y % n) + 0.5} y2={Math.floor(y / n) + 0.5} stroke="#ff8a2b" strokeWidth={0.22} strokeLinecap="round" />;
      })}
      {b.numbers.map((k, i) => (k ? <g key={`n${i}`}><circle cx={(i % n) + 0.5} cy={Math.floor(i / n) + 0.5} r={0.33} fill="#22242b" /><text x={(i % n) + 0.5} y={Math.floor(i / n) + 0.62} textAnchor="middle" fontSize={0.34} fontWeight={900} fill="#ffffff">{k}</text></g> : null))}
    </svg>
  </div>;
}

/** Home card art: a solved 6×6 컬러 잇기, colour lines joining smiling stone pairs. */
export function ColorLinkPreview() {
  const b = buildBoard('colorlink', 6, 20270109);
  if (b.kind !== 'colorlink') return null;
  const n = 6;
  // Colour each cell by walking the answer lines from each stone.
  const adj: number[][] = Array.from({ length: n * n }, () => []);
  b.answer.forEach((v, e) => { if (v) { const [x, y] = edgeCells(n, e); adj[x].push(y); adj[y].push(x); } });
  const col = new Array<number>(n * n).fill(0);
  b.ends.forEach((k, s) => { if (!k || col[s]) return; let prev = -1, cur = s; col[s] = k; for (;;) { const nx = adj[cur].find((x) => x !== prev); if (nx === undefined || col[nx]) break; col[nx] = k; prev = cur; cur = nx; } });
  return <div className="w-full rotate-2 rounded-xl bg-gradient-to-br from-[#5fe0d4] to-[#139488] p-1.5 shadow-xl sm:w-[66%] sm:rounded-[22px] sm:p-3 sm:shadow-2xl">
    <svg viewBox={`0 0 ${n} ${n}`} className="block w-full rounded-[6px] bg-[#f7f2e8] sm:rounded-[14px]">
      {col.map((k, i) => (k ? <rect key={`t${i}`} x={i % n} y={Math.floor(i / n)} width={1} height={1} fill={LINK_COLORS[(k - 1) % LINK_COLORS.length].fill} opacity={0.22} /> : null))}
      {b.answer.map((v, e) => {
        if (!v) return null;
        const [x, y] = edgeCells(n, e);
        return <line key={e} x1={(x % n) + 0.5} y1={Math.floor(x / n) + 0.5} x2={(y % n) + 0.5} y2={Math.floor(y / n) + 0.5} stroke={LINK_COLORS[(col[x] - 1 + LINK_COLORS.length) % LINK_COLORS.length].fill} strokeWidth={0.3} strokeLinecap="round" />;
      })}
      {b.ends.map((k, i) => (k ? <ColorStone key={`s${i}`} id="clp" k={k} cx={(i % n) + 0.5} cy={Math.floor(i / n) + 0.5} r={0.35} mood="happy" /> : null))}
    </svg>
  </div>;
}

/** Home card art: a 5×5 마방진 one swap from done, the two culprit tiles lit and every other line ✓ at 65. */
export function MagicSwapPreview() {
  const b = buildBoard('magicswap', 5, 20271123);
  if (b.kind !== 'magicswap') return null;
  const n = 5;
  const [a, c] = b.swaps[0];
  const cells = b.answer.slice();
  [cells[a], cells[c]] = [cells[c], cells[a]];
  const W = n + 0.9;
  const rowOk = (r: number) => cells.slice(r * n, r * n + n).reduce((x, y) => x + y, 0) === 65;
  const colOk = (k: number) => Array.from({ length: n }, (_, r) => cells[r * n + k]).reduce((x, y) => x + y, 0) === 65;
  return <div className="w-full rotate-[-2deg] rounded-xl bg-gradient-to-br from-[#f59ae8] to-[#a8279c] p-1.5 shadow-xl sm:w-[66%] sm:rounded-[22px] sm:p-3 sm:shadow-2xl">
    <svg viewBox={`-0.1 -0.1 ${W + 0.1} ${W + 0.1}`} className="block w-full rounded-[6px] bg-[#1c1420] sm:rounded-[14px]">
      {cells.map((v, i) => {
        const x = i % n, y = Math.floor(i / n), hot = i === a || i === c;
        return <g key={i}>
          <rect x={x + 0.06} y={y + 0.06} width={0.88} height={0.88} rx={0.14} fill={hot ? '#e45bd6' : '#ffffff'} opacity={hot ? 1 : 0.1} />
          <text x={x + 0.5} y={y + 0.64} textAnchor="middle" fontSize={0.42} fontWeight={900} fill="#ffffff">{v}</text>
        </g>;
      })}
      {Array.from({ length: n }, (_, r) => <text key={`r${r}`} x={n + 0.45} y={r + 0.62} textAnchor="middle" fontSize={0.3} fontWeight={900} fill={rowOk(r) ? '#7ee2ae' : '#ff9a9a'}>{rowOk(r) ? '✓' : '±'}</text>)}
      {Array.from({ length: n }, (_, k) => <text key={`c${k}`} x={k + 0.5} y={n + 0.55} textAnchor="middle" fontSize={0.3} fontWeight={900} fill={colOk(k) ? '#7ee2ae' : '#ff9a9a'}>{colOk(k) ? '✓' : '±'}</text>)}
      <text x={n + 0.45} y={n + 0.55} textAnchor="middle" fontSize={0.26} fontWeight={900} fill="#f59ae8">65</text>
    </svg>
  </div>;
}

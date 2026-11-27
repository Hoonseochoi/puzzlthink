/**
 * c-{game}: a game's ranking #1. One family: every #1 is a stone set in a metal bezel that rises into a
 * crown at the top and carries a "1" plaque at the bottom (crown, bezel and plaque share one gradient, so
 * they read as one piece of jewellery). The game lives in the stone's body itself — its board, pieces,
 * pattern or material — and each game picks its own body colours, metal and jewel.
 * Drawn in the same 100×100 box as every other stone; gradient ids are suffixed with the instance `id`.
 */
import type { ReactNode } from 'react';
import type { GameId } from '@/lib/stats';

const CX = 50, CY = 57, R = 36;

type Metal = { c: [string, string, string, string]; line: string };
const METALS = {
  gold: { c: ['#fffbe0', '#f6cd45', '#a8740c', '#ffe58a'], line: '#5e3d04' },
  rose: { c: ['#fff0ea', '#f0a48c', '#94422c', '#ffd2c2'], line: '#5a2214' },
  platinum: { c: ['#ffffff', '#d5dce8', '#6d788b', '#f1f5fb'], line: '#353d4c' },
  violet: { c: ['#f6eeff', '#c2a2ff', '#53309e', '#e6d6ff'], line: '#2a1460' },
  azure: { c: ['#effaff', '#7fd0ff', '#145a9a', '#cdeeff'], line: '#0a335c' },
  emerald: { c: ['#eafff4', '#5fdca4', '#0f6b45', '#c4f7dc'], line: '#083d27' },
  crimson: { c: ['#fff0f0', '#ff6f7c', '#8a0f1e', '#ffc2c8'], line: '#4a0710' },
  obsidian: { c: ['#a9adb8', '#3a3d46', '#0a0a0d', '#7d818c'], line: '#000000' },
} satisfies Record<string, Metal>;
type MetalKey = keyof typeof METALS | 'prism';

type Look = {
  body: [string, string, string]; // stone highlight · mid · shadow
  metal: MetalKey;
  gem: string; // the crown's centre jewel
  glow: string; // halo behind
  eye?: string;
  eyeLine?: string;
  noEyes?: boolean;
  /** The game's surface, drawn inside the stone (clipped to it), under the eyes. */
  pat: (id: string) => ReactNode;
  /** Anything that goes over the eyes (blind gomoku's blindfold). */
  over?: () => ReactNode;
  /** A custom body fill instead of the radial body gradient (split stones). */
  fill?: (id: string) => ReactNode;
};

// ─── tiny drawing helpers ───────────────────────────────────────────────────────────────────────────────────

const K = '#17201e';
const W = '#ffffff';
const f1 = (n: number) => Math.round(n * 10) / 10;
/** Interior grid lines of an nx×ny grid over a box, as one path. */
const grid = (x0: number, y0: number, x1: number, y1: number, nx: number, ny = nx, edge = false) => {
  let d = '';
  for (let i = edge ? 0 : 1; i <= (edge ? nx : nx - 1); i++) { const x = f1(x0 + ((x1 - x0) * i) / nx); d += `M${x} ${y0}V${y1}`; }
  for (let j = edge ? 0 : 1; j <= (edge ? ny : ny - 1); j++) { const y = f1(y0 + ((y1 - y0) * j) / ny); d += `M${x0} ${y}H${x1}`; }
  return d;
};
const star5 = (cx: number, cy: number, r: number) => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r;
    d += `${i ? 'L' : 'M'}${f1(cx + rr * Math.cos(a))} ${f1(cy + rr * Math.sin(a))}`;
  }
  return `${d}Z`;
};
const spark = (x: number, y: number, s: number) => `M${x} ${y - s}L${f1(x + s * 0.28)} ${f1(y - s * 0.28)}L${x + s} ${y}L${f1(x + s * 0.28)} ${f1(y + s * 0.28)}L${x} ${y + s}L${f1(x - s * 0.28)} ${f1(y + s * 0.28)}L${x - s} ${y}L${f1(x - s * 0.28)} ${f1(y - s * 0.28)}Z`;
const hex = (cx: number, cy: number, r: number) => {
  let d = '';
  for (let i = 0; i < 6; i++) { const a = (Math.PI / 3) * i; d += `${i ? 'L' : 'M'}${f1(cx + r * Math.cos(a))} ${f1(cy + r * Math.sin(a))}`; }
  return `${d}Z`;
};
const T = (x: number, y: number, s: string, size: number, fill: string, extra: Record<string, string | number> = {}) => (
  <text x={x} y={y} textAnchor="middle" fontSize={size} fontWeight="900" fontFamily="ui-rounded, system-ui, sans-serif" fill={fill} {...extra}>{s}</text>
);
/** A glowing line: a wide soft stroke under a bright core. */
const beam = (d: string, color: string, core: string, w = 2) => (
  <><path d={d} fill="none" stroke={color} strokeOpacity=".45" strokeWidth={w * 3.2} strokeLinecap="round" strokeLinejoin="round" /><path d={d} fill="none" stroke={color} strokeWidth={w * 1.6} strokeLinecap="round" strokeLinejoin="round" /><path d={d} fill="none" stroke={core} strokeWidth={w * 0.6} strokeLinecap="round" strokeLinejoin="round" /></>
);
const pearl = (x: number, y: number, r: number, black: boolean) => <circle cx={x} cy={y} r={r} fill={black ? K : '#fbfaf6'} stroke={black ? '#000' : '#6b6658'} strokeWidth=".8" />;
const card = (x: number, y: number, w: number, h: number, rot: number, fill: string, stroke: string, child?: ReactNode) => (
  <g transform={`rotate(${rot} ${x + w / 2} ${y + h})`}><rect x={x} y={y} width={w} height={h} rx="2.2" fill={fill} stroke={stroke} strokeWidth="1.1" />{child}</g>
);

// ─── each game's stone ──────────────────────────────────────────────────────────────────────────────────────

const LOOKS: Record<GameId, Look> = {
  // The wallgo board: a grid of cells, cream walls standing on its lines.
  wallgo: {
    body: ['#ffb596', '#ff6b4a', '#9c2c15'], metal: 'gold', gem: '#ff3b30', glow: '#ff8a5c',
    pat: () => <><path d={grid(14, 21, 86, 93, 7)} stroke="#6e1f0e" strokeOpacity=".4" strokeWidth="1" /><path d="M24.3 31.3H45M65.7 31.3V52M24.3 72.7V93M45 82.9H75.9M75.9 62.1V82.9M14 52H24.3" stroke="#fff3e2" strokeWidth="3.4" strokeLinecap="round" /><path d="M24.3 31.3H45M65.7 31.3V52M24.3 72.7V93M45 82.9H75.9M75.9 62.1V82.9M14 52H24.3" stroke="#6e1f0e" strokeOpacity=".35" strokeWidth="1" strokeLinecap="round" transform="translate(0 1.6)" /><circle cx="60.5" cy="72.7" r="4.2" fill="#3a0f06" opacity=".55" /><circle cx="35" cy="62.4" r="4.2" fill="#fff3e2" opacity=".75" /></>,
  },
  // Wallgo II: the same board in deep crimson, gold walls, a II mark.
  wallgo2: {
    body: ['#ff8592', '#d01f33', '#4a0610'], metal: 'platinum', gem: '#ffd23f', glow: '#ff4d5e',
    pat: () => <><path d={grid(14, 21, 86, 93, 7)} stroke="#2a0207" strokeOpacity=".45" strokeWidth="1" /><path d="M24.3 41.6H34.6M75.9 31.3V52M34.6 72.7H55.3M55.3 72.7V93M65.7 62.1H86M14 72.7H24.3" stroke="#ffd36b" strokeWidth="3.4" strokeLinecap="round" /><path d="M42 78V90M47 78V90M53 78V90M58 78V90" stroke="#ffffff" strokeOpacity="0" />{T(50, 89, 'II', 13, '#ffd36b', { stroke: '#4a0610', strokeWidth: 1.4, paintOrder: 'stroke' })}</>,
  },
  // Slitherlink: a dot lattice with the solved loop glowing through it.
  slitherlink: {
    body: ['#6f5ff0', '#2b1f86', '#0a0628'], metal: 'platinum', gem: '#b9a8ff', glow: '#8f7cff',
    pat: () => {
      const s = 12, xs = [20, 32, 44, 56, 68, 80], ys = [27, 39, 51, 63, 75, 87];
      return <>{beam(`M20 39H44V27H68V51H80V75H56V87H32V63H20Z`, '#a996ff', '#f4f0ff', 2)}<g fill="#e9e4ff">{ys.flatMap((y) => xs.map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" />))}</g><g opacity=".55">{T(26 + 0 * s, 82, '3', 7, '#d8d0ff')}{T(74, 33, '2', 7, '#d8d0ff')}{T(62, 82, '1', 7, '#d8d0ff')}</g></>;
    },
  },
  // 십이장기: lacquered wood with the 3×4 board inlaid and a gold 王 below the eyes.
  janggi: {
    body: ['#f7c983', '#c2662a', '#4d1a06'], metal: 'gold', gem: '#e5484d', glow: '#f0a040',
    pat: () => <><path d={grid(23, 25, 77, 93, 3, 4, true)} fill="none" stroke="#3b1203" strokeOpacity=".4" strokeWidth="1.2" /><path d="M23 25 Q50 32 77 25" fill="none" stroke="#fff2d6" strokeOpacity=".25" strokeWidth="6" /><path d="M39 74 l11 -6 11 6 v12 l-11 6 -11 -6Z" fill="#3b1203" opacity=".45" />{T(50, 87.5, '王', 15, '#ffd66b', { stroke: '#5a2208', strokeWidth: 1.2, paintOrder: 'stroke' })}</>,
  },
  // Russian janggi: crimson lacquer over a faint checker, a gold star inlay.
  russian_janggi: {
    body: ['#ff7a84', '#c8102e', '#3e030c'], metal: 'gold', gem: '#ffffff', glow: '#ff3b50',
    pat: () => {
      const cells: ReactNode[] = [];
      for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) if ((x + y) % 2) cells.push(<rect key={`${x}${y}`} x={14 + x * 12} y={21 + y * 12} width="12" height="12" />);
      return <><g fill="#2a0208" opacity=".32">{cells}</g><path d={star5(50, 80, 11)} fill="#ffd66b" stroke="#6b3a05" strokeWidth="1.3" strokeLinejoin="round" /><path d={star5(50, 80, 5)} fill="#fff6cc" /></>;
    },
  },
  // Laser janggi: a dark board where a cyan laser bounces off mirrors.
  laser_janggi: {
    body: ['#2f5a80', '#0f2438', '#03080f'], metal: 'azure', gem: '#5ff0ff', glow: '#28b9d7',
    pat: () => <><path d={grid(14, 21, 86, 93, 6)} stroke="#5fd8ff" strokeOpacity=".16" strokeWidth=".9" />{beam('M8 81H32L56 33L80 57H96', '#28d7f7', '#effdff', 1.8)}<path d="M28 77l8 8M52 29l8 8M76 53l8 8" stroke="#d8e6f0" strokeWidth="2.6" strokeLinecap="round" /><circle cx="80" cy="57" r="2.6" fill="#ffffff" /></>,
  },
  // Card janggi: a fan of three 將 cards.
  card_janggi: {
    body: ['#dcc4ff', '#8a55e6', '#2e0f66'], metal: 'gold', gem: '#b07cff', glow: '#b07cff',
    pat: () => <><path d={grid(14, 21, 86, 93, 6)} stroke="#ffffff" strokeOpacity=".08" strokeWidth="1" />{card(29, 66, 15, 21, -24, '#3d1a85', '#ffd66b')}{card(56, 66, 15, 21, 24, '#3d1a85', '#ffd66b')}{card(42.5, 64, 15, 22, 0, '#ffffff', '#2e0f66', T(50, 80.5, '將', 10.5, '#7b3fe0'))}</>,
  },
  // Nonogram: the stone is pixels — a grid with filled cells and a pixel heart.
  nonogram: {
    body: ['#a6f3b6', '#3fcf6a', '#0f5a28'], metal: 'platinum', gem: '#3fcf6a', glow: '#5be38a',
    pat: () => {
      const heart = ['0110110', '1111111', '1111111', '0111110', '0011100', '0001000'];
      const cells: ReactNode[] = [];
      heart.forEach((row, y) => row.split('').forEach((c, x) => c === '1' && cells.push(<rect key={`h${x}${y}`} x={29 + x * 6} y={63 + y * 5} width="5.4" height="4.4" rx=".6" />)));
      const dots = [[1, 1], [5, 0], [0, 4], [9, 3], [2, 8], [10, 7], [8, 1]];
      return <><path d={grid(14, 21, 86, 93, 12)} stroke="#0a3d1b" strokeOpacity=".3" strokeWidth=".7" /><g fill="#0b4a20" opacity=".4">{dots.map(([x, y]) => <rect key={`d${x}${y}`} x={14 + x * 6} y={21 + y * 6} width="6" height="6" />)}</g><g fill="#0a3d1b">{cells}</g></>;
    },
  },
  // Hidden word: a wall of letter tiles, one sealed tile glowing with "?".
  hidden_word: {
    body: ['#eaffd6', '#a8ef70', '#3f7a14'], metal: 'gold', gem: '#a8ef70', glow: '#b7f57f',
    pat: () => {
      const L = 'ABCDEFGHIJKLMNOP';
      const tiles: ReactNode[] = [];
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) tiles.push(<g key={`${x}${y}`}><rect x={15 + x * 18} y={22 + y * 18} width="16" height="16" rx="3" fill="#ffffff" fillOpacity=".38" />{T(23 + x * 18, 34 + y * 18, L[y * 4 + x], 10, '#2f5c0e', { opacity: 0.35 })}</g>);
      return <>{tiles}<rect x="39" y="69" width="22" height="20" rx="4" fill="#1d3a08" stroke="#eaffd6" strokeWidth="1.4" />{T(50, 85, '?', 17, '#b7f57f')}</>;
    },
  },
  // Hidden word expansion: violet tiles, a gold "+" seal on the sealed card.
  hidden_word_plus: {
    body: ['#ece2ff', '#b79cff', '#47288f'], metal: 'platinum', gem: '#ffd66b', glow: '#b79cff',
    pat: () => {
      const tiles: ReactNode[] = [];
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) tiles.push(<rect key={`${x}${y}`} x={15 + x * 18} y={22 + y * 18} width="16" height="16" rx="3" fill="#ffffff" fillOpacity={(x + y) % 2 ? 0.16 : 0.3} />);
      return <>{tiles}<rect x="38" y="68" width="22" height="20" rx="4" fill="#2a1460" stroke="#ece2ff" strokeWidth="1.4" />{T(49, 84, '?', 16, '#d9caff')}<circle cx="61" cy="70" r="6" fill="#ffd66b" stroke="#5e3d04" strokeWidth="1.2" /><path d="M61 66.8v6.4M57.8 70h6.4" stroke="#5e3d04" strokeWidth="1.8" strokeLinecap="round" /></>;
    },
  },
  // Gradation: the stone shaded like the cup rack, green number cubes for eyes.
  gradation: {
    body: ['#ffffff', '#6f727a', '#0d0d11'], metal: 'emerald', gem: '#33c158', glow: '#3fd67a', noEyes: true,
    fill: (id) => <circle cx={CX} cy={CY} r={R} fill={`url(#cx-${id})`} />,
    pat: () => <><path d="M14 80H86" stroke="#33c158" strokeOpacity=".5" strokeWidth="1" /><g opacity=".9"><rect x="25" y="72" width="9" height="15" rx="2" fill="#26262d" /><rect x="45.5" y="70" width="9" height="17" rx="2" fill="#f1f2f4" stroke="#0d0d11" strokeWidth=".8" /><rect x="66" y="72" width="9" height="15" rx="2" fill="#26262d" /></g></>,
    over: () => {
      const cube = (x: number) => <g key={x}><rect x={x} y={CY - 15} width="12" height="14" rx="2.6" fill="#33c158" stroke="#0f5a25" strokeWidth="1.3" /><path d={`M${x + 1.4} ${CY - 15} l2.8 -3.4 h10 l-1.4 3.4z`} fill="#7be897" stroke="#0f5a25" strokeWidth=".9" strokeLinejoin="round" />{T(x + 6, CY - 4.6, x < 50 ? '9' : '1', 8, W)}</g>;
      return <>{cube(35)}{cube(53)}</>;
    },
  },
  // 2048: the champion's own board — a jewelled tile grid in royal violet, the gold 2048 tile in front,
  // set in a prism bezel with a sunburst behind: above every block tile of the ladder.
  merge2048: {
    body: ['#6a4fc4', '#2a1660', '#0a0420'], metal: 'prism', gem: '#ffffff', glow: '#ffb84d',
    fill: (id) => <circle cx={CX} cy={CY} r={R} fill={`url(#cx-${id})`} />,
    pat: () => {
      const glint = new Set([1, 6, 11, 12]);
      return <>{Array.from({ length: 16 }, (_, i) => <rect key={i} x={17 + (i % 4) * 17} y={24 + Math.floor(i / 4) * 17} width="15" height="15" rx="3.2" fill={glint.has(i) ? '#fff3a8' : '#ffffff'} fillOpacity={glint.has(i) ? 0.6 : 0.2} stroke="#ffffff" strokeOpacity=".35" strokeWidth=".8" />)}<rect x="30" y="68" width="40" height="19" rx="5" fill="#ffd23f" stroke="#fff6c4" strokeWidth="1.6" /><rect x="31.5" y="69.5" width="37" height="7" rx="3.5" fill="#ffffff" opacity=".35" />{T(50, 82.6, '2048', 13, W, { stroke: '#8a5a00', strokeWidth: 1.8, paintOrder: 'stroke', letterSpacing: -0.5 })}</>;
    },
  },
  // Magic square swap: the 3×3 magic square, a gold swap arc.
  magicswap: {
    body: ['#ffc2f6', '#e45bd6', '#5e0f5a'], metal: 'gold', gem: '#e45bd6', glow: '#f07ae4',
    pat: () => {
      const n = [2, 7, 6, 9, 5, 1, 4, 3, 8];
      return <><path d={grid(20, 27, 80, 87, 3)} stroke="#ffffff" strokeOpacity=".45" strokeWidth="1.4" /><g opacity=".5">{n.map((v, i) => <g key={i}>{T(30 + (i % 3) * 20, 42 + Math.floor(i / 3) * 20, String(v), 11, '#ffffff')}</g>)}</g><path d="M28 81 Q50 64 72 81" fill="none" stroke="#ffd66b" strokeWidth="2.6" strokeLinecap="round" /><path d="M72 81l-6.5 -.6 3.6 -4.6z M28 81l6.5 -.6 -3.6 -4.6z" fill="#ffd66b" /></>;
    },
  },
  // Binairo: a grid of 0 and 1 discs.
  binairo: {
    body: ['#b2d0ff', '#3f8cff', '#0b2f78'], metal: 'platinum', gem: '#3f8cff', glow: '#5b9dff',
    pat: () => {
      const g = ['010110', '101001', '011010', '100101', '010011', '101100'];
      return <><path d={grid(14, 21, 86, 93, 6)} stroke="#06204f" strokeOpacity=".35" strokeWidth=".9" />{g.flatMap((row, y) => row.split('').map((c, x) => <circle key={`${x}${y}`} cx={20 + x * 12} cy={27 + y * 12} r="3.8" fill={c === '1' ? '#ffffff' : '#081a40'} opacity={c === '1' ? 0.5 : 0.55} />))}</>;
    },
  },
  // One stroke: a single glowing line snaking through every cell.
  onestroke: {
    body: ['#ffd8b0', '#ff8a2b', '#8a3404'], metal: 'rose', gem: '#fff1a8', glow: '#ff9d4a',
    pat: () => <><g fill="#5a2002" opacity=".35">{[26, 38, 50, 62, 74].flatMap((y) => [26, 38, 50, 62, 74].map((x) => <circle key={`${x}${y}`} cx={x} cy={y + 5} r="1.4" />))}</g>{beam('M26 91V31H38V79H50V31H62V79H74V31', '#fff1a8', '#ffffff', 2)}<circle cx="26" cy="91" r="3.4" fill="#5a2002" /><path d="M74 25l-4 6h8z" fill="#5a2002" /></>,
  },
  // Color link: coloured flows piped across the board.
  colorlink: {
    body: ['#aef4ec', '#21c2b5', '#064e48'], metal: 'platinum', gem: '#ff8a2b', glow: '#3fd8ca',
    pat: () => {
      const flow = (d: string, c: string) => <><path d={d} fill="none" stroke={c} strokeWidth="5.6" strokeLinecap="round" strokeLinejoin="round" /><path d={d} fill="none" stroke="#ffffff" strokeOpacity=".35" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></>;
      return <><path d={grid(14, 21, 86, 93, 6)} stroke="#032f2b" strokeOpacity=".3" strokeWidth=".9" />{flow('M20 75V87H56', '#ff8a2b')}{flow('M32 75H44V63H80', '#ffd23f')}{flow('M68 87H80V75', '#ff5b6e')}{flow('M20 27V39M80 27H68V39', '#8f7cff')}<g fill={K}>{[[20, 75], [56, 87], [32, 75], [80, 63], [68, 87], [80, 75]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="3.6" stroke="#fff" strokeWidth=".8" />)}</g></>;
    },
  },
  // Color link duel: a blue flow and a red flow racing to cut each other off.
  color_link_duel: {
    body: ['#cbc4ff', '#7c6cff', '#211678'], metal: 'gold', gem: '#ff5b6e', glow: '#8f80ff',
    pat: () => <><path d={grid(14, 21, 86, 93, 6)} stroke="#ffffff" strokeOpacity=".14" strokeWidth=".9" />{beam('M14 75H38V87H62', '#5fb2ff', '#e8f4ff', 2.2)}{beam('M86 63H62V75H50', '#ff5b6e', '#ffe8eb', 2.2)}<circle cx="62" cy="87" r="3.6" fill="#5fb2ff" stroke="#fff" strokeWidth="1" /><circle cx="50" cy="75" r="3.6" fill="#ff5b6e" stroke="#fff" strokeWidth="1" /></>,
  },
  // Star battle: a night-sky board, regions outlined, gold stars in the cells.
  starbattle: {
    body: ['#4a4ab0', '#1a1b52', '#05051a'], metal: 'gold', gem: '#ffd23f', glow: '#ffc23d',
    pat: () => <><path d={grid(14, 21, 86, 93, 6)} stroke="#ffd66b" strokeOpacity=".18" strokeWidth=".8" /><path d="M14 45H38V69H62V93M62 21V45H86M38 21V45" fill="none" stroke="#ffd66b" strokeOpacity=".5" strokeWidth="1.8" />{[[26, 81], [74, 81], [56, 33], [20, 57], [80, 45]].map(([x, y]) => <path key={`${x}${y}`} d={star5(x, y, 5.2)} fill="#ffd23f" stroke="#7a5200" strokeWidth=".7" strokeLinejoin="round" />)}<path d={spark(44, 86, 2.2)} fill="#ffffff" /><path d={spark(68, 28, 1.6)} fill="#ffffff" /></>,
  },
  // Masyu: the loop drawn through black and white pearls.
  masyu: {
    body: ['#ffa3ad', '#ff4d5e', '#7a0714'], metal: 'platinum', gem: '#ffffff', glow: '#ff6b78',
    pat: () => <><g fill="#3a0208" opacity=".35">{[27, 39, 51, 63, 75, 87].flatMap((y) => [20, 32, 44, 56, 68, 80].map((x) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.2" />))}</g><path d="M20 63V87H56V75H80V39H68V27" fill="none" stroke="#ffffff" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />{pearl(20, 75, 4.4, true)}{pearl(38, 87, 4.4, false)}{pearl(56, 81, 4.4, false)}{pearl(80, 75, 4.4, true)}{pearl(80, 51, 4.4, false)}</>,
  },
  // Two-sided poker: the stone is split corner to corner like the two faces of the cards.
  two_sided_poker: {
    body: ['#d4ccff', '#9b87ff', '#2f1f8a'], metal: 'gold', gem: '#e5484d', glow: '#a996ff',
    pat: () => <><path d="M86 21V93H14Z" fill="#1c1150" opacity=".55" /><path d="M86 21L14 93" stroke="#ffd66b" strokeWidth="1.8" />{T(30, 87, '♠', 14, '#1c1150', { opacity: 0.75 })}{T(72, 88, '♥', 14, '#ff5b6e')}{T(24, 40, 'A', 10, '#ffffff', { opacity: 0.45 })}{T(78, 43, 'K', 10, '#ffffff', { opacity: 0.35 })}</>,
  },
  // Monorail: the loop of track with its sleepers.
  monorail: {
    body: ['#ffe6aa', '#f3b64a', '#7d4f05'], metal: 'rose', gem: '#3f8cff', glow: '#f7c55e',
    pat: () => <><rect x="21" y="30" width="58" height="56" rx="20" fill="none" stroke="#5a3502" strokeOpacity=".5" strokeWidth="9" /><rect x="21" y="30" width="58" height="56" rx="20" fill="none" stroke="#ffffff" strokeOpacity=".85" strokeWidth="2.4" strokeDasharray="2.4 3.6" /><rect x="21" y="30" width="58" height="56" rx="20" fill="none" stroke="#fff6dc" strokeOpacity=".6" strokeWidth="1" /><rect x="42" y="80" width="16" height="12" rx="3.5" fill="#3f8cff" stroke="#0b2f78" strokeWidth="1.3" /><rect x="45" y="83" width="10" height="4" rx="1" fill="#d6ecff" /></>,
  },
  // 4-player 3-in-a-row: pieces in four colours, one diagonal three ringed.
  four_three: {
    body: ['#ffe4a8', '#ffb52e', '#7d4800'], metal: 'platinum', gem: '#3fcf6a', glow: '#ffc24d',
    pat: () => {
      const cols = ['#ff5d8f', '#3f8cff', '#3fcf6a', '#7d4800'];
      const pts: ReactNode[] = [];
      for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) if ((x * 7 + y * 3) % 4 !== 1) pts.push(<circle key={`${x}${y}`} cx={20 + x * 12} cy={27 + y * 12} r="3.6" fill={cols[(x + y * 2) % 4]} opacity=".55" />);
      return <><path d={grid(14, 21, 86, 93, 6)} stroke="#5a3400" strokeOpacity=".25" strokeWidth=".8" />{pts}<path d="M32 87L56 63" stroke="#ffffff" strokeWidth="11" strokeLinecap="round" strokeOpacity=".55" />{[[32, 87], [44, 75], [56, 63]].map(([x, y]) => <circle key={`w${x}`} cx={x} cy={y} r="4.4" fill="#ff5d8f" stroke="#fff" strokeWidth="1.2" />)}</>;
    },
  },
  // Flip omok: a go board where stones turn over, one caught mid-flip.
  flip_omok: {
    body: ['#b4e4ff', '#3fb8ff', '#0a4a78'], metal: 'gold', gem: '#3fb8ff', glow: '#5cc4ff',
    pat: () => <><path d={grid(14, 21, 86, 93, 6)} stroke="#06263f" strokeOpacity=".45" strokeWidth=".9" />{pearl(26, 81, 4.6, true)}{pearl(38, 69, 4.6, false)}{pearl(62, 81, 4.6, false)}{pearl(74, 69, 4.6, true)}<ellipse cx="50" cy="81" rx="2.4" ry="5" fill={K} /><path d="M50 76a2.4 5 0 0 1 0 10 a4.6 5 0 0 0 0 -10z" fill="#fbfaf6" /><path d="M41 90 Q50 95 59 90" fill="none" stroke="#ffd66b" strokeWidth="1.8" strokeLinecap="round" /><path d="M59 90l-4 -.6 1.6 3.4z" fill="#ffd66b" /></>,
  },
  // Nine men's morris: the three nested squares, engraved, with pieces on the points.
  nine_mens_morris: {
    body: ['#acf2f7', '#3ec9d6', '#06505a'], metal: 'gold', gem: '#ffffff', glow: '#4fd4e0',
    pat: () => <><g fill="none" stroke="#ffffff" strokeOpacity=".7" strokeWidth="1.6"><rect x="20" y="27" width="60" height="60" /><rect x="30" y="37" width="40" height="40" /><rect x="40" y="47" width="20" height="20" /><path d="M50 27V47M50 67V87M20 57H40M60 57H80" /></g>{pearl(20, 87, 3.8, true)}{pearl(50, 87, 3.8, true)}{pearl(80, 87, 3.8, true)}{pearl(70, 77, 3.8, false)}{pearl(30, 37, 3.8, false)}{pearl(80, 27, 3.8, true)}</>,
  },
  // 결합: the 3×3 tiles with their shapes.
  gyulhap: {
    body: ['#fff2ad', '#ffcf3f', '#8a6400'], metal: 'crimson', gem: '#ffd23f', glow: '#ffd84f',
    pat: () => {
      const tile = (x: number, y: number, s: number, bg: string, fg: string) => {
        const c = { x: x + 9, y: y + 9 };
        const shape = s === 0 ? <circle cx={c.x} cy={c.y} r="4.6" fill={fg} /> : s === 1 ? <path d={`M${c.x} ${c.y - 5}L${c.x + 5.4} ${c.y + 4}H${c.x - 5.4}Z`} fill={fg} /> : <rect x={c.x - 4.2} y={c.y - 4.2} width="8.4" height="8.4" fill={fg} />;
        return <g key={`${x}${y}`}><rect x={x} y={y} width="18" height="18" rx="3" fill={bg} stroke="#6b4a00" strokeOpacity=".5" strokeWidth=".8" />{shape}</g>;
      };
      const bgs = ['#ffffff', '#3b3b45', '#f6e2b8'], fgs = ['#e5484d', '#3f8cff', '#ffd23f'];
      const t: ReactNode[] = [];
      for (let i = 0; i < 9; i++) t.push(tile(21 + (i % 3) * 20, 28 + Math.floor(i / 3) * 20, (i * 2) % 3, bgs[(i + 1) % 3], fgs[i % 3]));
      return <g opacity=".85">{t}</g>;
    },
  },
  // Indian poker: a gilt card-back lattice, and the card you hold to your forehead.
  indian_poker: {
    body: ['#fff0bf', '#e6b94f', '#6e4a08'], metal: 'crimson', gem: '#e6b94f', glow: '#f0c860',
    pat: () => {
      let d = '';
      for (let i = -6; i < 12; i++) d += `M${14 + i * 9} 21L${86 + i * 9} 93M${14 + i * 9} 93L${86 + i * 9} 21`;
      return <><path d={d} stroke="#8a1a2a" strokeOpacity=".35" strokeWidth="1.1" />{card(40, 66, 20, 26, 0, '#ffffff', '#8a1a2a', T(50, 86, '?', 17, '#c8243b'))}</>;
    },
  },
  // 무거운 13: a cast-iron weight plate, grooved, 13 stamped in.
  heavy13: {
    body: ['#efd9b0', '#c9a061', '#4e3616'], metal: 'platinum', gem: '#c9a061', glow: '#d9b276',
    pat: () => <><g fill="none" stroke="#3a2608" strokeOpacity=".4"><circle cx={CX} cy={CY} r="31" strokeWidth="1.4" /><circle cx={CX} cy={CY} r="26" strokeWidth="1" /><circle cx={CX} cy={CY} r="8" strokeWidth="1.4" /></g><circle cx={CX} cy={CY} r="31" fill="none" stroke="#fff4dc" strokeOpacity=".3" strokeWidth="1" transform="translate(0 1)" />{[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={f1(CX + 28.5 * Math.cos((i * Math.PI) / 3 + 0.5))} cy={f1(CY + 28.5 * Math.sin((i * Math.PI) / 3 + 0.5))} r="1.6" fill="#3a2608" opacity=".5" />)}{T(50, 88, '13', 15, '#3a2608', { opacity: 0.75, letterSpacing: -0.5 })}</>,
  },
  // Russian roulette: the revolver's cylinder — six chambers, one loaded red.
  russian_roulette: {
    body: ['#8fdcee', '#238ca8', '#06303c'], metal: 'gold', gem: '#ff3b30', glow: '#36a9c8',
    pat: () => <>{[0, 1, 2, 3, 4, 5].map((i) => {
      const a = (i * Math.PI) / 3 + Math.PI / 2, x = f1(CX + 25 * Math.cos(a)), y = f1(CY + 25 * Math.sin(a));
      return <g key={i}><circle cx={x} cy={y} r="7.6" fill="#03161c" opacity=".7" /><circle cx={x} cy={y} r="7.6" fill="none" stroke="#c8f2ff" strokeOpacity=".4" strokeWidth="1" />{i === 0 && <><circle cx={x} cy={y} r="5.2" fill="#ffb02e" /><circle cx={x} cy={y} r="2.6" fill="#ff3b30" /></>}</g>;
    })}<circle cx={CX} cy={CY} r="4" fill="#03161c" opacity=".5" /></>,
  },
  // Blind gomoku: a wooden go board — and the stone wears a blindfold.
  blind_gomoku: {
    body: ['#f6d896', '#d39b2f', '#5e3d06'], metal: 'crimson', gem: '#d39b2f', glow: '#e2b04a',
    pat: () => <><path d={grid(14, 21, 86, 93, 8)} stroke="#4a2c02" strokeOpacity=".45" strokeWidth=".8" />{pearl(32, 75, 4, true)}{pearl(41, 84, 4, true)}{pearl(59, 75, 4, false)}{pearl(68, 84, 4, false)}<circle cx="23" cy="84" r="4" fill={K} opacity=".3" /></>,
    over: () => <><path d={`M10 ${CY - 13} Q50 ${CY - 20} 90 ${CY - 13} L90 ${CY + 1} Q50 ${CY - 6} 10 ${CY + 1}Z`} fill="#1c1428" stroke="#000" strokeWidth="1.2" /><path d={`M12 ${CY - 7} Q50 ${CY - 14} 88 ${CY - 7}`} fill="none" stroke="#d39b2f" strokeWidth="1.4" /><path d={`M35 ${CY - 6} q5 3.5 10 0 M55 ${CY - 6} q5 3.5 10 0`} fill="none" stroke="#ffffff" strokeOpacity=".8" strokeWidth="1.5" strokeLinecap="round" /><path d={`M88 ${CY - 8} l8 8 M89 ${CY - 3} l6 10`} stroke="#1c1428" strokeWidth="3" strokeLinecap="round" /></>,
  },
  // 네모 세기: squares inside squares — count them.
  nemo_count: {
    body: ['#dde1f2', '#7d86a8', '#232a45'], metal: 'gold', gem: '#ffd23f', glow: '#98a2c8',
    pat: () => <><g fill="none" stroke="#ffffff" strokeOpacity=".6" strokeWidth="1.6"><rect x="18" y="25" width="64" height="64" rx="1" /><rect x="18" y="25" width="32" height="32" /><rect x="50" y="57" width="32" height="32" /><rect x="34" y="41" width="32" height="32" /></g><rect x="34" y="57" width="16" height="16" fill="#ffd23f" opacity=".75" /><rect x="50" y="41" width="16" height="16" fill="#ffffff" opacity=".25" />{T(58, 84, '?', 10, '#ffffff', { opacity: 0.7 })}</>,
  },
  // 흑과 백: the stone is half black, half white, a number tile on each side.
  black_white: {
    body: ['#ffffff', '#9a9aa6', '#202026'], metal: 'gold', gem: '#ffffff', glow: '#c9c9d4', eye: '#ffffff', eyeLine: '#17201e',
    fill: (id) => <><circle cx={CX} cy={CY} r={R} fill={`url(#cx-${id})`} /><path d={`M${CX} ${CY - R}A${R} ${R} 0 0 1 ${CX} ${CY + R}Z`} fill={`url(#cw-${id})`} /></>,
    pat: () => <><rect x="31" y="70" width="15" height="19" rx="3" fill="#0d0d10" stroke="#5a5a64" strokeWidth="1" />{T(38.5, 84.5, '8', 12, W)}<rect x="54" y="70" width="15" height="19" rx="3" fill="#ffffff" stroke="#17201e" strokeWidth="1" />{T(61.5, 84.5, '3', 12, K)}<path d={`M${CX} ${CY - R}V${CY + R}`} stroke="#ffd66b" strokeWidth="1.2" strokeOpacity=".8" /></>,
  },
  // 흑과 백 II: the same split, with a red seam.
  black_white_2: {
    body: ['#ffffff', '#9a9aa6', '#202026'], metal: 'crimson', gem: '#ef3340', glow: '#ef3340', eye: '#ffffff', eyeLine: '#17201e',
    fill: (id) => <><circle cx={CX} cy={CY} r={R} fill={`url(#cx-${id})`} /><path d={`M${CX} ${CY - R}A${R} ${R} 0 0 1 ${CX} ${CY + R}Z`} fill={`url(#cw-${id})`} /></>,
    pat: () => <>{beam(`M${CX} ${CY - R}V${CY + R}`, '#ef3340', '#ffd0d4', 1.4)}<rect x="30" y="70" width="15" height="19" rx="3" fill="#0d0d10" stroke="#ef3340" strokeWidth="1" />{T(37.5, 84.5, '8', 12, W)}<rect x="55" y="70" width="15" height="19" rx="3" fill="#ffffff" stroke="#ef3340" strokeWidth="1" />{T(62.5, 84.5, '3', 12, K)}</>,
  },
  // Hexagon: a honeycomb board, a few cells lit.
  hexagon: {
    body: ['#ffe6b0', '#e8b04a', '#6e4404'], metal: 'platinum', gem: '#e8b04a', glow: '#f0c062',
    pat: () => {
      const lit = new Set(['1,4', '2,4', '3,5', '4,1', '0,2']);
      let all = '', on = '';
      for (let q = -1; q < 7; q++) for (let r = -1; r < 8; r++) {
        const h = hex(14 + q * 12, 21 + r * 10.4 + (q % 2 ? 5.2 : 0), 6.6);
        all += h;
        if (lit.has(`${q},${r}`)) on += h;
      }
      return <><path d={on} fill="#fff4d6" fillOpacity=".7" /><path d={all} fill="none" stroke="#5a3602" strokeOpacity=".4" strokeWidth=".9" /></>;
    },
  },
  // Equation signal: maths symbols over the board, the three-lamp signal below.
  equation_signal: {
    body: ['#ecffb0', '#b6e33a', '#3f5a04'], metal: 'platinum', gem: '#2fbf71', glow: '#c4ee55',
    pat: () => {
      const s = ['+', '×', '−', '÷', '=', '+', '−', '×', '=', '÷', '+', '×'];
      return <><g opacity=".3">{s.map((c, i) => <g key={i}>{T(22 + (i % 4) * 19, 32 + Math.floor(i / 4) * 17, c, 11, '#243404')}</g>)}</g><rect x="27" y="71" width="46" height="16" rx="8" fill="#17201e" stroke="#ecffb0" strokeWidth="1.2" /><circle cx="38" cy="79" r="4.6" fill="#2fbf71" /><circle cx="50" cy="79" r="4.6" fill="#f2c230" /><circle cx="62" cy="79" r="4.6" fill="#e5484d" /><circle cx="37" cy="77.5" r="1.4" fill="#ffffff" opacity=".7" /></>;
    },
  },
  // Tower of equations: bricks behind, the three-block tower in front.
  equation_tower: {
    body: ['#ffd4b8', '#f08c5a', '#7a2c08'], metal: 'gold', gem: '#f08c5a', glow: '#f59d6e',
    pat: () => {
      let d = '';
      for (let r = 0; r < 7; r++) { const y = 21 + r * 10.3; d += `M14 ${f1(y)}H86`; for (let c = 0; c < 7; c++) { const x = 14 + c * 12 + (r % 2 ? 6 : 0); d += `M${x} ${f1(y)}V${f1(y + 10.3)}`; } }
      return <><path d={d} stroke="#5a1e04" strokeOpacity=".22" strokeWidth=".9" /><rect x="29" y="81" width="42" height="11" rx="2" fill="#3b3f52" stroke="#17201e" strokeWidth="1" /><rect x="34" y="70.5" width="32" height="11" rx="2" fill="#3b3f52" stroke="#17201e" strokeWidth="1" /><rect x="40" y="60" width="20" height="11" rx="2" fill="#ffd23f" stroke="#17201e" strokeWidth="1" />{T(50, 68.6, '7', 8, K)}{T(50, 79, '×2', 7.5, W)}{T(50, 89.5, '+3', 7.5, W)}</>;
    },
  },
  // Piggy bank: a gold coin — milled edge, coin slot, ₩ stamped in.
  piggy_bank: {
    body: ['#fff3a8', '#e0a91c', '#6e4a00'], metal: 'rose', gem: '#ff8fb0', glow: '#f2c03a',
    pat: () => <><circle cx={CX} cy={CY} r="32" fill="none" stroke="#6e4a00" strokeOpacity=".45" strokeWidth="2.4" strokeDasharray="1.2 1.6" /><circle cx={CX} cy={CY} r="28.5" fill="none" stroke="#fff6cc" strokeOpacity=".6" strokeWidth="1" /><rect x="40" y="26.5" width="20" height="3.4" rx="1.7" fill="#4a3000" opacity=".7" />{T(50, 88, '₩', 16, '#6e4a00', { opacity: 0.6 })}</>,
  },
  // Sudoku: the 9×9 grid with its 3×3 boxes, digits pencilled in.
  sudoku: {
    body: ['#c2d4ff', '#4b7bff', '#0f2878'], metal: 'gold', gem: '#4b7bff', glow: '#6a92ff',
    pat: () => <><path d={grid(14, 21, 86, 93, 9)} stroke="#ffffff" strokeOpacity=".22" strokeWidth=".7" /><path d={grid(14, 21, 86, 93, 3)} stroke="#ffffff" strokeOpacity=".6" strokeWidth="1.6" /><g opacity=".6">{T(26, 39, '5', 7, W)}{T(74, 47, '3', 7, W)}{T(34, 87, '8', 7, W)}{T(66, 79, '1', 7, W)}{T(18, 71, '2', 7, W)}</g>{T(50, 87, '9', 9, '#ffd66b')}</>,
  },
  // Sniper hold'em: a scope reticle over the stone, suits in the corners.
  sniper_holdem: {
    body: ['#ffa6ae', '#ff4f5e', '#6a0612'], metal: 'platinum', gem: '#ff4f5e', glow: '#ff6b78',
    pat: () => <><g fill="none" stroke="#2a0207" strokeOpacity=".55"><circle cx={CX} cy={CY + 1} r="27" strokeWidth="1.6" /><circle cx={CX} cy={CY + 1} r="15" strokeWidth="1" /><path d="M50 21V40M50 62V93M14 58H33M67 58H86" strokeWidth="1.6" /><path d="M45 74H55M46.5 80H53.5M48 86H52" strokeWidth="1.2" /></g><circle cx={CX} cy={CY + 1} r="27" fill="none" stroke="#ffffff" strokeOpacity=".25" strokeWidth="1" transform="translate(0 1)" />{T(22, 38, '♠', 9, '#2a0207', { opacity: 0.5 })}{T(78, 38, '♦', 9, '#ffffff', { opacity: 0.6 })}{T(22, 88, '♣', 9, '#2a0207', { opacity: 0.5 })}{T(78, 88, '♥', 9, '#ffffff', { opacity: 0.6 })}</>,
  },
  // Hit, Stay: a felt table arc, two cards dealt.
  hit_stay: {
    body: ['#ccd1ff', '#6f7dff', '#1a2078'], metal: 'gold', gem: '#ff5b6e', glow: '#8590ff',
    pat: () => <><path d="M10 40 Q50 58 90 40" fill="none" stroke="#ffd66b" strokeOpacity=".6" strokeWidth="1.4" strokeDasharray="3 2.5" /><path d="M10 47 Q50 65 90 47" fill="none" stroke="#ffffff" strokeOpacity=".2" strokeWidth="1" />{card(34, 66, 16, 22, -12, '#ffffff', '#1a2078', T(42, 81, 'A', 10, K))}{card(50, 66, 16, 22, 12, '#ff5b6e', '#1a2078', T(58, 81, 'K', 10, W))}<circle cx="26" cy="83" r="5" fill="#ffd66b" stroke="#6b4a00" strokeWidth="1" strokeDasharray="2 1.4" /><circle cx="75" cy="85" r="5" fill="#17201e" stroke="#ffffff" strokeWidth="1" strokeDasharray="2 1.4" /></>,
  },
  // Time auction: a clock face, the bid's seconds sweeping gold.
  time_auction: {
    body: ['#ffaaa2', '#ff3b30', '#6a0703'], metal: 'gold', gem: '#ffffff', glow: '#ff5a4a',
    pat: () => <><path d={`M${CX} ${CY}L${CX} ${CY - 33}A33 33 0 0 1 ${f1(CX + 33 * Math.sin(2.2))} ${f1(CY - 33 * Math.cos(2.2))}Z`} fill="#ffd66b" opacity=".35" />{Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6, r0 = i % 3 ? 30 : 27; return <path key={i} d={`M${f1(CX + r0 * Math.sin(a))} ${f1(CY - r0 * Math.cos(a))}L${f1(CX + 33 * Math.sin(a))} ${f1(CY - 33 * Math.cos(a))}`} stroke="#ffffff" strokeOpacity=".75" strokeWidth={i % 3 ? 1.2 : 2.4} strokeLinecap="round" />; })}<path d={`M${CX} ${CY}L${f1(CX + 24 * Math.sin(2.2))} ${f1(CY - 24 * Math.cos(2.2))}`} stroke="#ffd66b" strokeWidth="2.4" strokeLinecap="round" /><circle cx={CX} cy={CY} r="2.6" fill="#ffd66b" /></>,
  },
  // Mine of oblivion: a studded mine stone on warning tape, its number lit.
  mine_oblivion: {
    body: ['#ffe2a3', '#ffb020', '#6a3d00'], metal: 'gold', gem: '#ff3b30', glow: '#ffc04a',
    pat: () => <><g stroke={K} strokeOpacity=".4" strokeWidth="4.5">{[14, 28, 42, 56, 70, 84].map((x) => <path key={x} d={`M${x - 8} 96L${x + 6} 76`} />)}</g><g stroke={K} strokeWidth="5" strokeLinecap="round">{[-40, 0, 40, 90, 140, 180, 220].map((a) => { const r = (a * Math.PI) / 180; return <path key={a} d={`M${f1(CX + 12 * Math.cos(r))} ${f1(CY - 4 + 12 * Math.sin(r))}L${f1(CX + 20 * Math.cos(r))} ${f1(CY - 4 + 20 * Math.sin(r))}`} />; })}</g><rect x="45" y="31" width="10" height="7" rx="1.6" fill={K} /><path d="M45.5 32 a4.5 4.5 0 0 1 9 0z" fill="#ff3b30" /><circle cx={CX} cy={CY - 4} r="14" fill={K} /><rect x="44.5" y="47" width="3.2" height="6" rx="1.6" fill={W} /><rect x="52.3" y="47" width="3.2" height="6" rx="1.6" fill={W} />{T(76, 88, '3', 11, '#ffffff', { opacity: 0.85 })}</>,
  },
  // Point omok: a go board where every stone carries its points.
  point_omok: {
    body: ['#ffc0d3', '#ff5d8f', '#7a0f38'], metal: 'gold', gem: '#ff5d8f', glow: '#ff7aa3',
    pat: () => <><path d={grid(14, 21, 86, 93, 6)} stroke="#4a0620" strokeOpacity=".4" strokeWidth=".9" />{([[26, 81, true, '3'], [38, 69, false, '5'], [62, 81, true, '1'], [74, 69, false, '4'], [50, 87, false, '2']] as const).map(([x, y, b, n]) => <g key={`${x}${y}`}>{pearl(x, y, 5, b)}{T(x, y + 2.7, n, 7, b ? W : K)}</g>)}</>,
  },
};

// ─── the shared #1 setting ─────────────────────────────────────────────────────────────────────────────────

const pol = (deg: number, r: number) => { const a = (deg * Math.PI) / 180; return [f1(CX + r * Math.cos(a)), f1(CY + r * Math.sin(a))] as const; };
const pt = (deg: number, r: number) => pol(deg, r).join(' ');
// The crown grows out of the bezel: its base is the bezel's own arc.
const RI = 38, RO = 45;
const CROWN = `M${pt(-123, RI)}L${pt(-125, 50)}L${pt(-113, 47)}L${pt(-106, 52.5)}L${pt(-98, 47.5)}L${pt(-90, 54.5)}L${pt(-82, 47.5)}L${pt(-74, 52.5)}L${pt(-67, 47)}L${pt(-55, 50)}L${pt(-57, RI)}A${RI} ${RI} 0 0 0 ${pt(-123, RI)}Z`;
const BAND = `M${pt(-121, RO)}A${RO} ${RO} 0 0 1 ${pt(-59, RO)}`;
const TIPS = [pol(-125, 50), pol(-106, 52.5), pol(-90, 54.5), pol(-74, 52.5), pol(-55, 50)];

function metalStops(m: MetalKey) {
  if (m === 'prism') return [['0', '#fff6c4'], ['.22', '#ffd23f'], ['.4', '#ff8fd0'], ['.58', '#9ad8ff'], ['.76', '#b48cff'], ['1', '#ffe08a']] as const;
  const c = METALS[m].c;
  return [['0', c[0]], ['.35', c[1]], ['.7', c[2]], ['1', c[3]]] as const;
}

export function CrownStone({ id, name, size, game }: { id: string; name: string; size: number; game: GameId }) {
  const k = LOOKS[game];
  const line = k.metal === 'prism' ? '#3a1a6a' : METALS[k.metal].line;
  const eye = k.eye ?? '#ffffff', eyeLine = k.eyeLine ?? 'rgba(0,0,0,.4)';
  const m = `url(#cm-${id})`;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="block shrink-0 overflow-visible" role="img" aria-label={name}>
      <defs>
        <radialGradient id={`cb-${id}`} cx="36%" cy="28%" r="80%">
          <stop offset="0%" stopColor={k.body[0]} /><stop offset="50%" stopColor={k.body[1]} /><stop offset="100%" stopColor={k.body[2]} />
        </radialGradient>
        <linearGradient id={`cm-${id}`} gradientUnits="userSpaceOnUse" x1="22" y1="0" x2="78" y2="100">
          {metalStops(k.metal).map(([o, c]) => <stop key={o} offset={o} stopColor={c} />)}
        </linearGradient>
        <radialGradient id={`cg-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="40%" stopColor={k.glow} stopOpacity=".55" /><stop offset="100%" stopColor={k.glow} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`cv-${id}`} cx="42%" cy="36%" r="66%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".22" /><stop offset="55%" stopColor="#ffffff" stopOpacity="0" /><stop offset="85%" stopColor="#000000" stopOpacity=".12" /><stop offset="100%" stopColor="#000000" stopOpacity=".45" />
        </radialGradient>
        {k.fill && (
          <>
            <linearGradient id={`cx-${id}`} x1="0" y1="0" x2="1" y2={game === 'merge2048' ? 1 : 0}>
              {game === 'merge2048'
                ? <><stop offset="0%" stopColor="#ffd23f" /><stop offset="30%" stopColor="#ff5fa8" /><stop offset="62%" stopColor="#8a4cff" /><stop offset="100%" stopColor="#1e6fd9" /></>
                : game === 'gradation'
                ? <><stop offset="0%" stopColor="#0d0d11" /><stop offset="22%" stopColor="#6f727a" /><stop offset="50%" stopColor="#f6f7f9" /><stop offset="78%" stopColor="#6f727a" /><stop offset="100%" stopColor="#0d0d11" /></>
                : <><stop offset="0%" stopColor="#4a4a52" /><stop offset="100%" stopColor="#060608" /></>}
            </linearGradient>
            <linearGradient id={`cw-${id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" /><stop offset="100%" stopColor="#bdbcc4" />
            </linearGradient>
          </>
        )}
        <clipPath id={`cc-${id}`}><circle cx={CX} cy={CY} r={R} /></clipPath>
      </defs>
      {/* halo */}
      <circle cx="50" cy="50" r="50" fill={`url(#cg-${id})`} />
      {k.metal === 'prism' && <path d={Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6 + 0.26; return `M50 50L${f1(50 + 50 * Math.cos(a - 0.1))} ${f1(50 + 50 * Math.sin(a - 0.1))}L${f1(50 + 50 * Math.cos(a + 0.1))} ${f1(50 + 50 * Math.sin(a + 0.1))}Z`; }).join('')} fill="#ffd23f" opacity=".55" />}
      <circle cx={CX} cy={CY + 3} r={RI + 3} fill="rgba(0,0,0,.28)" />
      {/* the stone, with the game in its body */}
      {k.fill ? k.fill(id) : <circle cx={CX} cy={CY} r={R} fill={`url(#cb-${id})`} />}
      <g clipPath={`url(#cc-${id})`}>{k.pat(id)}</g>
      <circle cx={CX} cy={CY} r={R} fill={`url(#cv-${id})`} />
      <ellipse cx="37" cy={CY - 22} rx="11" ry="4.4" fill="#ffffff" opacity=".42" transform={`rotate(-30 37 ${CY - 22})`} />
      {!k.noEyes && (
        <>
          <g fill={eyeLine}><rect x="37.6" y={CY - 13.5} width="9.4" height="16" rx="4.7" /><rect x="53" y={CY - 13.5} width="9.4" height="16" rx="4.7" /></g>
          <g fill={eye}><rect x="38.8" y={CY - 13} width="7" height="13.5" rx="3.5" /><rect x="54.2" y={CY - 13} width="7" height="13.5" rx="3.5" /></g>
        </>
      )}
      {k.over?.()}
      {/* the setting: bezel, crown and plaque in one metal */}
      <circle cx={CX} cy={CY} r={RI} fill="none" stroke={m} strokeWidth="5" />
      <circle cx={CX} cy={CY} r={RI + 2.5} fill="none" stroke={line} strokeWidth="1" />
      <circle cx={CX} cy={CY} r={RI - 2.5} fill="none" stroke={line} strokeOpacity=".7" strokeWidth=".8" />
      <path d={CROWN} fill={m} stroke={line} strokeWidth="1.5" strokeLinejoin="round" />
      <path d={BAND} fill="none" stroke={line} strokeOpacity=".55" strokeWidth="1" />
      <path d={`M${pt(-118, 42)}A42 42 0 0 1 ${pt(-62, 42)}`} fill="none" stroke="#ffffff" strokeOpacity=".55" strokeWidth="1.2" />
      {TIPS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === 2 ? 2.6 : 2} fill={i === 2 ? k.gem : m} stroke={line} strokeWidth="1" />)}
      <path d={`M50 ${CY - 49}l4.4 5.6 -4.4 5.6 -4.4 -5.6z`} fill={k.gem} stroke={line} strokeWidth="1.1" strokeLinejoin="round" />
      <path d={`M50 ${CY - 48}l2 2.6 -2 1.4 -2 -1.4z`} fill="#ffffff" opacity=".75" />
      {[pol(-106, 41.5), pol(-74, 41.5)].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.7" fill={k.gem} stroke={line} strokeWidth=".8" />)}
      {/* the 1 plaque */}
      <path d={`M38 ${CY + 31}h24l3 5 -3 5h-24l-3 -5z`} fill={m} stroke={line} strokeWidth="1.4" strokeLinejoin="round" />
      {T(50, CY + 39.6, '1', 9.4, line)}
      {/* sparkles */}
      <path d={spark(88, 26, 5)} fill="#ffffff" />
      <path d={spark(12, 38, 3.4)} fill={k.metal === 'prism' ? '#9ad8ff' : '#ffffff'} opacity=".9" />
    </svg>
  );
}

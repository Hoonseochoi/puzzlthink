/**
 * Earned profile icons beyond the 피스 경쟁전 champion stones (those live in StoneAvatar):
 * - h{week}-{place}: 블랙피스 경쟁전 weekly top three — obsidian stones with horns and a hellfire halo.
 * - m{block}: made that block in 2048 (m2048, m4096 … m131072) — the block's tile with our two eyes; each tier has its own look.
 * - o-{place}: 오픈 대전 total-wins top three — a duelist stone over crossed swords with a laurel; held while in that place.
 * - c-{game}: a game's ranking #1 — a stone in the game's colour, a gold crown and the game's emblem.
 * All drawn in a 100×100 box like the stones, so they swap in anywhere a stone is shown.
 */
import type { GameId } from '@/lib/stats';
import { CERT_GAMES } from '@/lib/hardClear';

export type IconRef =
  | { kind: 'piece'; week: number; place: 1 | 2 | 3 }
  | { kind: 'hell'; week: number; place: 1 | 2 | 3 }
  | { kind: 'm2048'; tier: number }
  | { kind: 'open'; place: 1 | 2 | 3 }
  | { kind: 'crown'; game: GameId };

/** The 2048 block icons, smallest first: one per block from 2048 up to the biggest a 4×4 board can hold. */
export const M2048_TIERS = [2048, 4096, 8192, 16384, 32768, 65536, 131072] as const;

/** 'w2-1' / 'h1-3' / 'm4096' / 'c-wallgo' → what it is; null for a plain colour or anything unknown. */
export function parseIcon(stone: string | null | undefined): IconRef | null {
  if (!stone) return null;
  const m = /^m(\d{4,6})$/.exec(stone);
  if (m) return (M2048_TIERS as readonly number[]).includes(Number(m[1])) ? { kind: 'm2048', tier: Number(m[1]) } : null;
  const wh = /^([wh])(\d{1,3})-([123])$/.exec(stone);
  if (wh) return { kind: wh[1] === 'w' ? 'piece' : 'hell', week: Number(wh[2]), place: Number(wh[3]) as 1 | 2 | 3 };
  const o = /^o-([123])$/.exec(stone);
  if (o) return { kind: 'open', place: Number(o[1]) as 1 | 2 | 3 };
  const c = /^c-([a-z0-9_]+)$/.exec(stone);
  if (c && c[1] in CERT_GAMES) return { kind: 'crown', game: c[1] as GameId };
  return null;
}

// ─── 블랙피스 (hell) ────────────────────────────────────────────────────────────────────────────────────────────

type HellLook = { stone: [string, string, string]; rim: string; eye: string; horn: [string, string]; halo: [string, string] };
export const HELL_LOOKS: Record<1 | 2 | 3, HellLook> = {
  1: { stone: ['#5a1020', '#1c0409', '#050102'], rim: '#ff2448', eye: '#ff3355', horn: ['#fff1c2', '#ff2448'], halo: ['#ffb02e', '#ff2448'] },
  2: { stone: ['#4a0f3a', '#19041a', '#050106'], rim: '#ff2bd6', eye: '#ff6bea', horn: ['#ffd9f6', '#c8126f'], halo: ['#ff7ad9', '#8a1cff'] },
  3: { stone: ['#4a1a10', '#1a0805', '#060201'], rim: '#ff7a2a', eye: '#ff9a4a', horn: ['#ffe0c2', '#a8401a'], halo: ['#ffb27a', '#7a1430'] },
};

export function HellStone({ id, name, size, place }: { id: string; name: string; size: number; place: 1 | 2 | 3 }) {
  const k = HELL_LOOKS[place];
  const cy = 58, r = 39;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="block shrink-0 overflow-visible" role="img" aria-label={name}>
      <defs>
        <radialGradient id={`hs-${id}`} cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor={k.stone[0]} /><stop offset="55%" stopColor={k.stone[1]} /><stop offset="100%" stopColor={k.stone[2]} />
        </radialGradient>
        <linearGradient id={`hh-${id}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={k.horn[1]} /><stop offset="100%" stopColor={k.horn[0]} />
        </linearGradient>
        <linearGradient id={`hf-${id}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={k.halo[1]} /><stop offset="100%" stopColor={k.halo[0]} />
        </linearGradient>
        <filter id={`hg-${id}`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" /></filter>
      </defs>
      {/* hellfire halo: a ring with flame tongues */}
      <circle cx="50" cy={cy} r={r + 7} fill="none" stroke={`url(#hf-${id})`} strokeOpacity=".75" strokeWidth="5" strokeDasharray="7 4" />
      <path d={`M14 ${cy + 6} q-6 -12 2 -22 q-1 8 6 10 z M86 ${cy + 6} q6 -12 -2 -22 q1 8 -6 10 z`} fill={k.halo[0]} opacity=".85" />
      {/* horns */}
      <path d="M33 30 C24 26 17 16 19 2 C25 12 33 16 44 21 Z" fill={`url(#hh-${id})`} stroke={k.stone[2]} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M67 30 C76 26 83 16 81 2 C75 12 67 16 56 21 Z" fill={`url(#hh-${id})`} stroke={k.stone[2]} strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="50" cy={cy + 3} r={r} fill="rgba(0,0,0,.35)" />
      <circle cx="50" cy={cy} r={r} fill={`url(#hs-${id})`} stroke={k.rim} strokeWidth="2.4" />
      <path d={`M24 ${cy + 22} q8 -6 14 2 q6 -9 12 -1 q6 -8 12 1 q6 -8 14 -2`} fill="none" stroke={k.rim} strokeOpacity=".35" strokeWidth="1.6" />
      {place === 1 && <path d="M41 25 L44 13 L50 20 L56 13 L59 25 Z" fill="#ffd36b" stroke="#7a1430" strokeWidth="1.4" strokeLinejoin="round" />}
      {/* slanted glowing eyes */}
      <g filter={`url(#hg-${id})`} opacity=".9">
        <path d={`M34 ${cy - 12} L46 ${cy - 7} L46 ${cy + 3} L34 ${cy} Z`} fill={k.eye} />
        <path d={`M66 ${cy - 12} L54 ${cy - 7} L54 ${cy + 3} L66 ${cy} Z`} fill={k.eye} />
      </g>
      <path d={`M35 ${cy - 10} L45 ${cy - 6} L45 ${cy + 1} L35 ${cy - 1.5} Z`} fill="#fff4f6" />
      <path d={`M65 ${cy - 10} L55 ${cy - 6} L55 ${cy + 1} L65 ${cy - 1.5} Z`} fill="#fff4f6" />
      <path d="M88 30 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill={k.halo[0]} opacity=".9" />
    </svg>
  );
}

// ─── 2048 ──────────────────────────────────────────────────────────────────────────────────────────────────────

type TileLook = { tile: [string, string, string]; rim: string; glow: string; eye: string; text: string; crown: [string, string]; gem?: string; spark: string; stars?: boolean };
// 2048 gold · 4096 black king (silver crown) · 8192 white king · 16384 aurora · then three cosmic tiles.
const TILE_LOOKS: Record<number, TileLook> = {
  2048: { tile: ['#fff3a8', '#f2cf3c', '#c98f06'], rim: '#8a6206', glow: '#ffe066', eye: '#3b2604', text: '#ffffff', crown: ['#ffd23f', '#7d5306'], spark: '#ffffff' },
  4096: { tile: ['#6a6e78', '#24262d', '#050507'], rim: '#c9ced8', glow: '#aab4c8', eye: '#ffffff', text: '#ffffff', crown: ['#e6e9ef', '#5b616c'], spark: '#ffffff', stars: true },
  8192: { tile: ['#ffffff', '#f1eee6', '#c2bdb0'], rim: '#b8860b', glow: '#ffd76a', eye: '#17201e', text: '#17201e', crown: ['#ffd23f', '#7d5306'], gem: '#e5484d', spark: '#ffe9a6' },
  16384: { tile: ['#c9fff0', '#b48cff', '#4b3ab8'], rim: '#2c1f86', glow: '#b48cff', eye: '#ffffff', text: '#ffffff', crown: ['#fff3b8', '#6d3fc4'], gem: '#3ee6c1', spark: '#fff3b8', stars: true },
  32768: { tile: ['#7cf3ff', '#1e6fd9', '#0a1550'], rim: '#06103c', glow: '#4fc3ff', eye: '#ffffff', text: '#ffffff', crown: ['#bff6ff', '#0b3f8f'], gem: '#ffd23f', spark: '#e2fbff', stars: true },
  65536: { tile: ['#ffd0f4', '#e0399a', '#4a0a55'], rim: '#33063c', glow: '#ff5fc4', eye: '#ffffff', text: '#ffffff', crown: ['#ffe3f8', '#8c1466'], gem: '#7cf3ff', spark: '#fff0fb', stars: true },
  131072: { tile: ['#fff3a8', '#ff6b4a', '#6a1bd1'], rim: '#2a0a5c', glow: '#ff9d5c', eye: '#ffffff', text: '#ffffff', crown: ['#ffffff', '#b8860b'], gem: '#3ee6c1', spark: '#ffffff', stars: true },
};

export function Tile2048({ id, name, size, tier = 2048 }: { id: string; name: string; size: number; tier?: number }) {
  const k = TILE_LOOKS[tier] ?? TILE_LOOKS[2048];
  const digits = String(tier).length;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="block shrink-0 overflow-visible" role="img" aria-label={name}>
      <defs>
        <linearGradient id={`tg-${id}`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor={k.tile[0]} /><stop offset="45%" stopColor={k.tile[1]} /><stop offset="100%" stopColor={k.tile[2]} />
        </linearGradient>
        <radialGradient id={`tl-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={k.glow} stopOpacity=".7" /><stop offset="100%" stopColor={k.glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="56" r="50" fill={`url(#tl-${id})`} />
      <rect x="12" y="21" width="76" height="76" rx="18" fill="rgba(0,0,0,.2)" />
      <rect x="12" y="18" width="76" height="76" rx="18" fill={`url(#tg-${id})`} stroke={k.rim} strokeWidth="2.2" />
      <path d="M22 30 Q24 24 32 23 L52 23" fill="none" stroke="#ffffff" strokeOpacity=".7" strokeWidth="3" strokeLinecap="round" />
      {k.stars && <g fill={k.spark} opacity=".85"><circle cx="24" cy="46" r="1.4" /><circle cx="77" cy="42" r="1.7" /><circle cx="71" cy="60" r="1.1" /><circle cx="29" cy="62" r="1.2" /></g>}
      <rect x="37" y="36" width="8" height="15" rx="4" fill={k.eye} />
      <rect x="55" y="36" width="8" height="15" rx="4" fill={k.eye} />
      <text x="50" y={digits > 5 ? 80 : digits > 4 ? 81 : 82} textAnchor="middle" fontSize={digits > 5 ? 14.5 : digits > 4 ? 17.5 : 21} fontWeight="900" fontFamily="ui-rounded, system-ui, sans-serif" fill={k.text} stroke={k.text === '#ffffff' ? k.rim : '#ffffff'} strokeWidth="1.2" paintOrder="stroke" letterSpacing="-0.5">{tier}</text>
      <path d="M28 2 L32 10 L39 6 L37 14 H19 L17 6 L24 10 Z" fill={k.crown[0]} stroke={k.crown[1]} strokeWidth="1.6" strokeLinejoin="round" />
      {k.gem && <circle cx="28" cy="11" r="1.8" fill={k.gem} />}
      <path d="M87 24 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill={k.spark} />
      <path d="M8 60 l1.5 3.5 3.5 1.5 -3.5 1.5 -1.5 3.5 -1.5 -3.5 -3.5 -1.5 3.5 -1.5z" fill={k.spark} />
    </svg>
  );
}

// ─── 오픈 대전 (open match) ──────────────────────────────────────────────────────────────────────────────────────

type OpenLook = { metal: [string, string, string]; rim: string; stone: [string, string, string]; eye: string; band: string; glow: string };
export const OPEN_LOOKS: Record<1 | 2 | 3, OpenLook> = {
  1: { metal: ['#fff3b0', '#f2c53d', '#a8740c'], rim: '#6b4a06', stone: ['#8fa2ff', '#3b47c9', '#141a5c'], eye: '#ffffff', band: '#ffd23f', glow: '#ffd76a' },
  2: { metal: ['#ffffff', '#c9d0dc', '#7c8594'], rim: '#4c5563', stone: ['#7fd4ff', '#2277c4', '#0c2f5c'], eye: '#ffffff', band: '#dfe5ee', glow: '#bcd4ff' },
  3: { metal: ['#ffd9b5', '#d18a52', '#8a4f24'], rim: '#5a3113', stone: ['#b79bff', '#6a3fc4', '#28135c'], eye: '#ffffff', band: '#e0a070', glow: '#e5b48a' },
};

/** The duelist: a stone with a headband over two crossed swords, a laurel around it and the place on a shield. */
export function OpenStone({ id, name, size, place }: { id: string; name: string; size: number; place: 1 | 2 | 3 }) {
  const k = OPEN_LOOKS[place];
  const sword = (flip: boolean) => (
    <g transform={flip ? 'translate(100 0) scale(-1 1)' : undefined}>
      <path d="M14 6 L20 6 L62 70 L55 76 Z" fill={`url(#om-${id})`} stroke={k.rim} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M17 8 L57 70" stroke="#ffffff" strokeOpacity=".7" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M48 80 L68 62" stroke={k.rim} strokeWidth="6.5" strokeLinecap="round" />
      <path d="M48 80 L68 62" stroke={k.band} strokeWidth="3.6" strokeLinecap="round" />
      <path d="M62 76 L70 87" stroke={k.rim} strokeWidth="6" strokeLinecap="round" />
      <circle cx="71.5" cy="89" r="3.6" fill={k.band} stroke={k.rim} strokeWidth="1.4" />
    </g>
  );
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="block shrink-0 overflow-visible" role="img" aria-label={name}>
      <defs>
        <linearGradient id={`om-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={k.metal[0]} /><stop offset="50%" stopColor={k.metal[1]} /><stop offset="100%" stopColor={k.metal[2]} />
        </linearGradient>
        <radialGradient id={`os-${id}`} cx="36%" cy="28%" r="80%">
          <stop offset="0%" stopColor={k.stone[0]} /><stop offset="55%" stopColor={k.stone[1]} /><stop offset="100%" stopColor={k.stone[2]} />
        </radialGradient>
        <radialGradient id={`og-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={k.glow} stopOpacity=".65" /><stop offset="100%" stopColor={k.glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="52" r="50" fill={`url(#og-${id})`} />
      {sword(false)}{sword(true)}
      {/* laurel */}
      <g fill={k.band} stroke={k.rim} strokeWidth=".9">
        {[0, 1, 2, 3].map((i) => <ellipse key={`l${i}`} cx="0" cy="0" rx="4.2" ry="8" transform={`translate(${17 + i * 3.5} ${44 + i * 11}) rotate(${-28 + i * 16})`} />)}
        {[0, 1, 2, 3].map((i) => <ellipse key={`r${i}`} cx="0" cy="0" rx="4.2" ry="8" transform={`translate(${83 - i * 3.5} ${44 + i * 11}) rotate(${28 - i * 16})`} />)}
      </g>
      <circle cx="50" cy="55" r="31" fill="rgba(0,0,0,.3)" />
      <circle cx="50" cy="52" r="31" fill={`url(#os-${id})`} stroke={k.rim} strokeWidth="2.2" />
      <path d="M30 34 Q38 25 50 24" fill="none" stroke="#ffffff" strokeOpacity=".65" strokeWidth="3" strokeLinecap="round" />
      {/* headband with a knot */}
      <path d="M19.5 44 Q50 33 80.5 44 L80 51 Q50 40 20 51 Z" fill={k.band} stroke={k.rim} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M80 46 L92 40 L89 48 L94 54 L81 51 Z" fill={k.band} stroke={k.rim} strokeWidth="1.3" strokeLinejoin="round" />
      {/* determined eyes */}
      <rect x="38" y="52" width="7.5" height="13" rx="3.7" fill={k.eye} />
      <rect x="54.5" y="52" width="7.5" height="13" rx="3.7" fill={k.eye} />
      <path d="M35 51 L47 54 M65 51 L53 54" stroke={k.stone[2]} strokeWidth="2.6" strokeLinecap="round" />
      {/* place shield */}
      <path d="M40 76 H60 V86 Q60 94 50 98 Q40 94 40 86 Z" fill={`url(#om-${id})`} stroke={k.rim} strokeWidth="1.6" strokeLinejoin="round" />
      <text x="50" y="91" textAnchor="middle" fontSize="13" fontWeight="900" fontFamily="ui-rounded, system-ui, sans-serif" fill={k.rim}>{place}</text>
      <path d="M88 20 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill={k.glow} />
    </svg>
  );
}

// ─── Per-game #1 ───────────────────────────────────────────────────────────────────────────────────────────────

const mix = (hex: string, to: string, t: number) => {
  const a = parseInt(hex.slice(1), 16), b = parseInt(to.slice(1), 16);
  const ch = (s: number) => Math.round(((a >> s) & 255) * (1 - t) + ((b >> s) & 255) * t);
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`;
};
const light = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 175;
};

const K = '#17201e';
const W = '#ffffff';
const txt = (x: number, y: number, s: string, size: number, fill: string) => (
  <text x={x} y={y} textAnchor="middle" fontSize={size} fontWeight="900" fontFamily="system-ui, sans-serif" fill={fill}>{s}</text>
);

/** Each game's emblem in a 24×24 box; `c` is the game's colour. */
const EMBLEMS: Record<GameId, (c: string) => React.ReactNode> = {
  hidden_word: (c) => <><rect x="3" y="2.5" width="18" height="11.5" rx="2.5" fill={K} />{txt(12, 11.6, '?', 9.5, c)}<rect x="3" y="16.2" width="18" height="2.2" rx="1.1" fill={c} stroke={K} strokeWidth=".7" /><rect x="3" y="19.8" width="11" height="2.2" rx="1.1" fill={c} fillOpacity=".55" stroke={K} strokeWidth=".7" /></>,
  gradation: (c) => <><rect x="1.5" y="8" width="6.4" height="12" rx="1.6" fill="#26262d" stroke={K} strokeWidth="1" /><rect x="16.1" y="8" width="6.4" height="12" rx="1.6" fill="#26262d" stroke={K} strokeWidth="1" /><rect x="8.6" y="6" width="6.8" height="14" rx="1.8" fill="#f1f2f4" stroke={K} strokeWidth="1.1" /><rect x="9.6" y="11.5" width="4.8" height="4.8" rx="1" fill={c} stroke="#0f5a25" strokeWidth=".7" />{txt(12, 15.4, '9', 4.4, W)}</>,
  card_janggi: (c) => <><rect x="5" y="2.5" width="14" height="19" rx="2.5" fill={W} stroke={K} strokeWidth="1.6" />{txt(12, 16.5, '將', 10, c)}</>,
  color_link_duel: (c) => <><path d="M5 6 C15 6 9 18 19 18" fill="none" stroke={K} strokeWidth="2.6" strokeLinecap="round" /><circle cx="5" cy="6" r="3.6" fill={c} stroke={K} strokeWidth="1.2" /><circle cx="19" cy="18" r="3.6" fill="#ff5b6e" stroke={K} strokeWidth="1.2" /></>,
  hit_stay: (c) => <><rect x="3" y="5" width="11" height="15" rx="2" fill={W} stroke={K} strokeWidth="1.5" transform="rotate(-12 8 12)" /><rect x="10" y="4" width="11" height="15" rx="2" fill={c} stroke={K} strokeWidth="1.5" transform="rotate(10 15 11)" />{txt(15.5, 15, 'H', 8, W)}</>,
  point_omok: (c) => <><circle cx="8" cy="13" r="5.5" fill={K} /><circle cx="16" cy="13" r="5.5" fill={W} stroke={K} strokeWidth="1.4" /><circle cx="19" cy="5" r="4" fill={c} />{txt(19, 7.2, 'P', 6, W)}</>,
  merge2048: () => <><rect x="2.5" y="2.5" width="19" height="19" rx="4.5" fill="#edc22e" stroke={K} strokeWidth="1.5" />{txt(12, 15.6, '2048', 6.6, W)}</>,
  magicswap: (c) => <><rect x="3" y="3" width="18" height="18" rx="2" fill={W} stroke={K} strokeWidth="1.5" /><path d="M9 3 V21 M15 3 V21 M3 9 H21 M3 15 H21" stroke={K} strokeWidth="1" /><rect x="3.8" y="3.8" width="4.4" height="4.4" fill={c} /><rect x="15.8" y="15.8" width="4.4" height="4.4" fill={c} /><path d="M7 12 Q12 7 17 12" fill="none" stroke={c} strokeWidth="1.6" /></>,
  binairo: (c) => <><rect x="2" y="6" width="9.5" height="12" rx="2" fill={K} />{txt(6.75, 15.5, '0', 8, W)}<rect x="12.5" y="6" width="9.5" height="12" rx="2" fill={c} stroke={K} strokeWidth="1.2" />{txt(17.25, 15.5, '1', 8, W)}</>,
  onestroke: (c) => <><path d="M4 19 V5 H12 V19 H20 V5" fill="none" stroke={c} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" /><circle cx="4" cy="19" r="2.6" fill={K} /><path d="M20 5 l-2.5 3.5 h5z" fill={K} /></>,
  colorlink: (c) => <><path d="M4 6 H12 V18 H20" fill="none" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 18 H8" stroke="#ff8a2b" strokeWidth="4" strokeLinecap="round" /><circle cx="4" cy="6" r="2.8" fill={K} /><circle cx="20" cy="18" r="2.8" fill={K} /></>,
  starbattle: (c) => <path d="M12 2 L14.9 8.6 L22 9.3 L16.6 14 L18.2 21 L12 17.3 L5.8 21 L7.4 14 L2 9.3 L9.1 8.6 Z" fill={c} stroke={K} strokeWidth="1.5" strokeLinejoin="round" />,
  masyu: (c) => <><rect x="5" y="5" width="14" height="14" rx="3" fill="none" stroke={c} strokeWidth="2.4" /><circle cx="5" cy="12" r="3.6" fill={K} /><circle cx="19" cy="12" r="3.6" fill={W} stroke={K} strokeWidth="1.5" /></>,
  nonogram: (c) => <>{[[0, 1, 1, 0], [1, 1, 1, 1], [1, 1, 1, 1], [0, 1, 1, 0]].flatMap((row, y) => row.map((on, x) => <rect key={`${x}${y}`} x={3 + x * 4.6} y={3 + y * 4.6} width="4" height="4" rx=".6" fill={on ? c : W} stroke={K} strokeWidth=".6" />))}</>,
  two_sided_poker: (c) => <><rect x="5" y="2.5" width="14" height="19" rx="2.5" fill={W} stroke={K} strokeWidth="1.5" /><path d="M5.8 21 L18.2 3.2 V19 a2 2 0 0 1 -2 2 Z" fill={c} />{txt(9, 10, 'A', 6, K)}</>,
  monorail: (c) => <><rect x="3" y="5" width="18" height="14" rx="7" fill="none" stroke={K} strokeWidth="2.4" /><rect x="3" y="5" width="18" height="14" rx="7" fill="none" stroke={W} strokeWidth="1" strokeDasharray="1.5 2" /><rect x="9" y="2" width="6" height="5" rx="1.5" fill={c} stroke={K} strokeWidth="1.2" /></>,
  four_three: (c) => <><circle cx="5" cy="19" r="3.4" fill={c} stroke={K} strokeWidth="1" /><circle cx="12" cy="12" r="3.4" fill={c} stroke={K} strokeWidth="1" /><circle cx="19" cy="5" r="3.4" fill={c} stroke={K} strokeWidth="1" /><circle cx="19" cy="19" r="3" fill="#3f8cff" /><circle cx="5" cy="5" r="3" fill="#3fcf6a" /></>,
  flip_omok: (c) => <><path d="M12 3 a9 9 0 0 0 0 18 Z" fill={K} /><path d="M12 3 a9 9 0 0 1 0 18 Z" fill={W} stroke={K} strokeWidth="1.4" /><path d="M5 3.5 Q12 -1 19 3.5" fill="none" stroke={c} strokeWidth="1.8" /><path d="M19 3.5 l-3.4 -0.6 1.6 2.8z" fill={c} /></>,
  nine_mens_morris: (c) => <><rect x="2.5" y="2.5" width="19" height="19" fill="none" stroke={K} strokeWidth="1.3" /><rect x="6.5" y="6.5" width="11" height="11" fill="none" stroke={K} strokeWidth="1.3" /><path d="M12 2.5 V6.5 M12 17.5 V21.5 M2.5 12 H6.5 M17.5 12 H21.5" stroke={K} strokeWidth="1.3" /><circle cx="2.5" cy="2.5" r="2.4" fill={c} /><circle cx="12" cy="6.5" r="2.4" fill={c} /><circle cx="21.5" cy="21.5" r="2.4" fill={K} /></>,
  wallgo2: (c) => <><path d="M3 15 H15 V3" fill="none" stroke={K} strokeWidth="3" strokeLinecap="round" /><circle cx="9" cy="9" r="4" fill={c} stroke={K} strokeWidth="1.2" />{txt(18.5, 22, 'II', 8, c)}</>,
  slitherlink: (c) => <><path d="M4 4 H14 V9 H20 V20 H4 Z" fill="none" stroke={c} strokeWidth="2.4" strokeLinejoin="round" />{[4, 9.33, 14.67, 20].flatMap((y) => [4, 9.33, 14.67, 20].map((x) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.1" fill={K} />))}</>,
  gyulhap: (c) => <><path d="M6 3 L11 12 H1 Z" fill={c} stroke={K} strokeWidth="1.2" strokeLinejoin="round" /><circle cx="18" cy="7.5" r="4.5" fill={K} /><rect x="7" y="14" width="9" height="8" rx="1" fill={W} stroke={K} strokeWidth="1.4" /></>,
  indian_poker: (c) => <><rect x="5" y="2.5" width="14" height="19" rx="2.5" fill={W} stroke={K} strokeWidth="1.5" />{txt(12, 16.5, '?', 12, c)}</>,
  wallgo: (c) => <><path d="M3 15 H15 V3" fill="none" stroke={K} strokeWidth="3" strokeLinecap="round" /><path d="M9 21 H21 V9" fill="none" stroke={K} strokeWidth="3" strokeLinecap="round" strokeOpacity=".35" /><circle cx="9" cy="9" r="4.2" fill={c} stroke={K} strokeWidth="1.2" /></>,
  heavy13: (c) => <><path d="M8 8 a4 4 0 0 1 8 0" fill="none" stroke={K} strokeWidth="2.6" /><circle cx="12" cy="15" r="7.5" fill={c} stroke={K} strokeWidth="1.5" />{txt(12, 18.2, '13', 8, W)}</>,
  janggi: (c) => <><path d="M8 2.5 H16 L21.5 8 V16 L16 21.5 H8 L2.5 16 V8 Z" fill="#f6e2b8" stroke={K} strokeWidth="1.5" />{txt(12, 16, '王', 10, c)}</>,
  russian_janggi: (c) => <><path d="M8 2.5 H16 L21.5 8 V16 L16 21.5 H8 L2.5 16 V8 Z" fill={c} stroke={K} strokeWidth="1.5" /><path d="M12 6 L13.6 10.2 L18 10.4 L14.6 13.2 L15.7 17.6 L12 15.2 L8.3 17.6 L9.4 13.2 L6 10.4 L10.4 10.2 Z" fill={W} /></>,
  russian_roulette: (c) => <><circle cx="12" cy="12" r="9.5" fill={K} />{[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={(12 + 5.4 * Math.sin((i * Math.PI) / 3)).toFixed(2)} cy={(12 - 5.4 * Math.cos((i * Math.PI) / 3)).toFixed(2)} r="2.1" fill={i === 0 ? c : W} />)}<circle cx="12" cy="12" r="1.3" fill={W} /></>,
  blind_gomoku: (c) => <><circle cx="12" cy="12" r="9" fill={K} /><path d="M2 10 Q12 6 22 10 V14 Q12 10 2 14 Z" fill={c} /><path d="M20 12 l3 4 M21 11 l3 1" stroke={c} strokeWidth="1.6" strokeLinecap="round" /></>,
  laser_janggi: (c) => <><path d="M2 20 L10 12 L16 16 L22 4" fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /><path d="M2 20 L10 12 L16 16 L22 4" fill="none" stroke={W} strokeWidth=".8" /><path d="M8 10 L12 14" stroke={K} strokeWidth="2.4" strokeLinecap="round" /><rect x="1" y="17" width="5" height="5" rx="1" fill={K} /></>,
  nemo_count: (c) => <><rect x="2.5" y="2.5" width="19" height="19" rx="2" fill="none" stroke={K} strokeWidth="1.8" /><rect x="6.5" y="6.5" width="11" height="11" rx="1.5" fill={c} stroke={K} strokeWidth="1.4" /><rect x="10" y="10" width="4" height="4" fill={W} /></>,
  black_white: () => <><rect x="2" y="5" width="9.5" height="14" rx="2" fill={K} />{txt(6.75, 15.5, '8', 8, W)}<rect x="12.5" y="5" width="9.5" height="14" rx="2" fill={W} stroke={K} strokeWidth="1.3" />{txt(17.25, 15.5, '3', 8, K)}</>,
  black_white_2: (c) => <><rect x="2" y="5" width="9.5" height="14" rx="2" fill={K} />{txt(6.75, 15.5, '8', 8, W)}<rect x="12.5" y="5" width="9.5" height="14" rx="2" fill={W} stroke={K} strokeWidth="1.3" />{txt(17.25, 15.5, '3', 8, K)}<rect x="2" y="20.5" width="20" height="2.2" rx="1" fill={c} /></>,
  hexagon: (c) => <path d="M12 2 L20.7 7 V17 L12 22 L3.3 17 V7 Z" fill={c} stroke={K} strokeWidth="1.6" strokeLinejoin="round" />,
  // A signal head on its side: green, yellow, red lamps (the game's own colours).
  equation_signal: (c) => <><rect x="1.5" y="7" width="21" height="10" rx="5" fill={K} stroke={c} strokeWidth="1.2" /><circle cx="6.3" cy="12" r="2.7" fill="#2fbf71" /><circle cx="12" cy="12" r="2.7" fill="#f2c230" /><circle cx="17.7" cy="12" r="2.7" fill="#e5484d" /></>,
  // Three stacked blocks, a plain number on top.
  equation_tower: (c) => <><rect x="3" y="15.5" width="18" height="6" rx="1.6" fill="#3b3f52" stroke={K} strokeWidth="1.2" /><rect x="5" y="9" width="14" height="6" rx="1.6" fill="#3b3f52" stroke={K} strokeWidth="1.2" /><rect x="7" y="2.5" width="10" height="6" rx="1.6" fill={c} stroke={K} strokeWidth="1.2" />{txt(12, 7.4, '7', 5.4, K)}{txt(12, 13.8, '×2', 4.8, W)}{txt(12, 20.3, '+3', 4.8, W)}</>,
  piggy_bank: (c) => <><ellipse cx="12" cy="13.5" rx="8.5" ry="6.5" fill={c} stroke={K} strokeWidth="1.4" /><path d="M7 8 L8 4.5 L10.5 7.5" fill={c} stroke={K} strokeWidth="1.2" strokeLinejoin="round" /><rect x="19" y="11.5" width="3.2" height="4" rx="1.4" fill={c} stroke={K} strokeWidth="1.2" /><path d="M10 8.5 H14" stroke={K} strokeWidth="1.6" strokeLinecap="round" /><circle cx="16.5" cy="11.5" r="1" fill={K} /><path d="M8 19 V22 M15 19 V22" stroke={K} strokeWidth="2" strokeLinecap="round" /></>,
  sudoku: (c) => <><rect x="2.5" y="2.5" width="19" height="19" rx="2" fill={W} stroke={K} strokeWidth="1.5" /><path d="M8.8 2.5 V21.5 M15.2 2.5 V21.5 M2.5 8.8 H21.5 M2.5 15.2 H21.5" stroke={K} strokeWidth=".9" />{txt(12, 14.8, '9', 6.5, c)}{txt(5.7, 8.2, '1', 5, K)}{txt(18.3, 20.6, '5', 5, K)}</>,
};

/** The emblem alone (used by the ranking page's #1 card too). */
export function GameEmblem({ game, size = 24 }: { game: GameId; size?: number }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} className="block shrink-0" aria-hidden>{EMBLEMS[game](CERT_GAMES[game].color)}</svg>;
}

export function CrownStone({ id, name, size, game }: { id: string; name: string; size: number; game: GameId }) {
  if (game === 'gradation') return <GradationCrownStone id={id} name={name} size={size} />;
  const base = CERT_GAMES[game].color;
  const hi = mix(base, '#ffffff', 0.55), lo = mix(base, '#000000', 0.42), rim = mix(base, '#000000', 0.62);
  const eye = light(base) ? '#2a1d05' : '#ffffff';
  const cy = 56, r = 38;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="block shrink-0 overflow-visible" role="img" aria-label={name}>
      <defs>
        <radialGradient id={`cs-${id}`} cx="35%" cy="28%" r="78%">
          <stop offset="0%" stopColor={hi} /><stop offset="52%" stopColor={base} /><stop offset="100%" stopColor={lo} />
        </radialGradient>
        <linearGradient id={`cc-${id}`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#fff6c4" /><stop offset="50%" stopColor="#f5c53a" /><stop offset="100%" stopColor="#b07d12" />
        </linearGradient>
      </defs>
      <circle cx="50" cy={cy} r={r + 6} fill="none" stroke="#f5c53a" strokeOpacity=".55" strokeWidth="3.5" />
      <circle cx="50" cy={cy + 3} r={r} fill="rgba(0,0,0,.22)" />
      <circle cx="50" cy={cy} r={r} fill={`url(#cs-${id})`} stroke={rim} strokeWidth="2" />
      <ellipse cx="38" cy={cy - 19} rx="10" ry="4.5" fill="#ffffff" opacity=".45" transform={`rotate(-28 38 ${cy - 19})`} />
      <rect x={50 - r * 0.33} y={cy - r * 0.38} width={r * 0.2} height={r * 0.37} rx={r * 0.1} fill={eye} />
      <rect x={50 + r * 0.13} y={cy - r * 0.38} width={r * 0.2} height={r * 0.37} rx={r * 0.1} fill={eye} />
      {/* gold crown with a 1 */}
      <path d="M27 25 L31 4 L41 15 L50 0 L59 15 L69 4 L73 25 Z" fill={`url(#cc-${id})`} stroke="#7d5306" strokeWidth="2" strokeLinejoin="round" />
      <rect x="27" y="22" width="46" height="7" rx="2.5" fill={`url(#cc-${id})`} stroke="#7d5306" strokeWidth="1.8" />
      <circle cx="50" cy="13" r="5.4" fill={base} stroke="#7d5306" strokeWidth="1.4" />
      {txt(50, 16, '1', 8, eye)}
      {/* the game's emblem on a badge */}
      <circle cx="74" cy="78" r="22" fill="#ffffff" stroke={rim} strokeWidth="2.2" />
      <g transform="translate(58.4 62.4) scale(1.3)">{EMBLEMS[game](base)}</g>
    </svg>
  );
}

/**
 * 그라데이션's #1 (the AI Hall of Fame champion) gets its own piece: a stone shaded like the cup rack
 * (dark · grey · white · grey · dark), two green number cubes for eyes, the gold crown with a 1, and a
 * badge with the rack's dark / white / dark cups.
 */
function GradationCrownStone({ id, name, size }: { id: string; name: string; size: number }) {
  const cy = 56, r = 38;
  const eye = (x: number) => (
    <g>
      <rect x={x} y={cy - 15} width="13" height="15" rx="3" fill="#33c158" stroke="#0f5a25" strokeWidth="1.4" />
      <rect x={x} y={cy - 15} width="13" height="6" rx="3" fill="#ffffff" opacity=".28" />
      <path d={`M${x + 1.5} ${cy - 15} l3 -3.6 h11 l-1.5 3.6 z`} fill="#7be897" stroke="#0f5a25" strokeWidth="1" strokeLinejoin="round" />
    </g>
  );
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="block shrink-0 overflow-visible" role="img" aria-label={name}>
      <defs>
        <linearGradient id={`gr-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0d0d11" /><stop offset="22%" stopColor="#6f727a" /><stop offset="50%" stopColor="#f6f7f9" /><stop offset="78%" stopColor="#6f727a" /><stop offset="100%" stopColor="#0d0d11" />
        </linearGradient>
        <radialGradient id={`gs-${id}`} cx="40%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".35" /><stop offset="60%" stopColor="#ffffff" stopOpacity="0" /><stop offset="100%" stopColor="#000000" stopOpacity=".35" />
        </radialGradient>
        <linearGradient id={`gc-${id}`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#fff6c4" /><stop offset="50%" stopColor="#f5c53a" /><stop offset="100%" stopColor="#b07d12" />
        </linearGradient>
      </defs>
      <circle cx="50" cy={cy} r={r + 6.5} fill="none" stroke="#3fd67a" strokeOpacity=".6" strokeWidth="3.5" />
      <circle cx="50" cy={cy} r={r + 6.5} fill="none" stroke="#f5c53a" strokeOpacity=".7" strokeWidth="1.4" strokeDasharray="3 5" />
      <circle cx="50" cy={cy + 3} r={r} fill="rgba(0,0,0,.25)" />
      <circle cx="50" cy={cy} r={r} fill={`url(#gr-${id})`} stroke="#0f5a25" strokeWidth="2.2" />
      <circle cx="50" cy={cy} r={r} fill={`url(#gs-${id})`} />
      {eye(33)}{eye(54)}
      {/* gold crown with a 1 */}
      <path d="M27 25 L31 4 L41 15 L50 0 L59 15 L69 4 L73 25 Z" fill={`url(#gc-${id})`} stroke="#7d5306" strokeWidth="2" strokeLinejoin="round" />
      <rect x="27" y="22" width="46" height="7" rx="2.5" fill={`url(#gc-${id})`} stroke="#7d5306" strokeWidth="1.8" />
      <rect x="44.6" y="7.6" width="10.8" height="10.8" rx="2.2" fill="#33c158" stroke="#7d5306" strokeWidth="1.3" />
      {txt(50, 16.2, '1', 8.5, W)}
      {/* the rack on a badge */}
      <circle cx="74" cy="78" r="22" fill="#ffffff" stroke="#0f5a25" strokeWidth="2.2" />
      <g transform="translate(58.4 62.4) scale(1.3)">{EMBLEMS.gradation('#33c158')}</g>
      <path d="M90 30 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#7be897" />
    </svg>
  );
}

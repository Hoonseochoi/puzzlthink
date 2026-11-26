/**
 * Achievement icons, a step below the #1 crowns (CrownStone) and contest champions:
 * - HardClearStone: cleared a game on 어려움 — a cute stone in the game's colour wearing a little graduation cap,
 *   with the game's emblem as a sticker.
 * - FriendWinStone: won a friend match — a coral stone in a party hat with a heart balloon, confetti and a friend.
 * - OpenWinStone: won an open match — a sky stone in a sweatband with a gold medal round its neck.
 * - HellClearStone: cleared 매우 어려움 once — obsidian, curled horns, red eyes, a little devil tail and embers.
 * - PlayTimeStone: 10…100 hours played — cute first (a nightcap), then cooler with every tier: headphones,
 *   gold shades with rays, and at 100 a prism stone with wings and a visor.
 * All drawn in a 100×100 box like the stones, so they swap in anywhere a stone is shown.
 */
import type { GameId } from '@/lib/stats';
import { CERT_GAMES } from '@/lib/hardClear';
import { EMBLEMS } from './ProfileIcons';

const mix = (hex: string, to: string, t: number) => {
  const a = parseInt(hex.slice(1), 16), b = parseInt(to.slice(1), 16);
  const ch = (s: number) => Math.round(((a >> s) & 255) * (1 - t) + ((b >> s) & 255) * t);
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`;
};
const light = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 175;
};

const spark = (x: number, y: number, s: number, fill: string, opacity = 1) => (
  <path d={`M${x} ${y - s} L${x + s * 0.28} ${y - s * 0.28} L${x + s} ${y} L${x + s * 0.28} ${y + s * 0.28} L${x} ${y + s} L${x - s * 0.28} ${y + s * 0.28} L${x - s} ${y} L${x - s * 0.28} ${y - s * 0.28} Z`} fill={fill} opacity={opacity} />
);

const Svg = ({ name, size, children }: { name: string; size: number; children: React.ReactNode }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} className="block shrink-0 overflow-visible" role="img" aria-label={name}>{children}</svg>
);

/** A rounder stone for the dressed-up badges: body, gloss, our two eyes, blush and a small smile. */
function Cute({ id, base, cy = 60, r = 34, rim, eye, smile = true, blush = true, eyes = true }: {
  id: string; base: string; cy?: number; r?: number; rim?: string; eye?: string; smile?: boolean; blush?: boolean; eyes?: boolean;
}) {
  const hi = mix(base, '#ffffff', 0.6), lo = mix(base, '#000000', 0.38);
  const e = eye ?? (light(base) ? '#2a1d05' : '#ffffff');
  return (
    <>
      <defs>
        <radialGradient id={`cb-${id}`} cx="36%" cy="28%" r="80%">
          <stop offset="0%" stopColor={hi} /><stop offset="50%" stopColor={base} /><stop offset="100%" stopColor={lo} />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy={cy + r - 1} rx={r * 0.8} ry="4" fill="rgba(0,0,0,.2)" />
      <circle cx="50" cy={cy} r={r} fill={`url(#cb-${id})`} stroke={rim ?? mix(base, '#000000', 0.6)} strokeWidth="2" />
      <ellipse cx={50 - r * 0.36} cy={cy - r * 0.5} rx={r * 0.26} ry={r * 0.12} fill="#ffffff" opacity=".55" transform={`rotate(-30 ${50 - r * 0.36} ${cy - r * 0.5})`} />
      {eyes && <>
        <rect x={50 - r * 0.34} y={cy - r * 0.3} width={r * 0.21} height={r * 0.36} rx={r * 0.105} fill={e} />
        <rect x={50 + r * 0.13} y={cy - r * 0.3} width={r * 0.21} height={r * 0.36} rx={r * 0.105} fill={e} />
        <circle cx={50 - r * 0.27} cy={cy - r * 0.2} r={r * 0.045} fill="#ffffff" opacity={light(base) ? 0 : 0.9} />
        <circle cx={50 + r * 0.2} cy={cy - r * 0.2} r={r * 0.045} fill="#ffffff" opacity={light(base) ? 0 : 0.9} />
      </>}
      {blush && <>
        <ellipse cx={50 - r * 0.55} cy={cy + r * 0.18} rx={r * 0.15} ry={r * 0.085} fill="#ff6f86" opacity=".55" />
        <ellipse cx={50 + r * 0.55} cy={cy + r * 0.18} rx={r * 0.15} ry={r * 0.085} fill="#ff6f86" opacity=".55" />
      </>}
      {smile && <path d={`M${50 - r * 0.13} ${cy + r * 0.2} Q50 ${cy + r * 0.34} ${50 + r * 0.13} ${cy + r * 0.2}`} fill="none" stroke={e} strokeWidth="2.2" strokeLinecap="round" />}
    </>
  );
}

// ─── 어려움 클리어 (per game) ─────────────────────────────────────────────────────────────────────────────────────

/** Graduated on 어려움: the game's colour, a tilted mortarboard with a gold tassel, the emblem as a round sticker. */
export function HardClearStone({ id, name, size, game }: { id: string; name: string; size: number; game: GameId }) {
  const base = CERT_GAMES[game].color;
  return (
    <Svg name={name} size={size}>
      <defs>
        <linearGradient id={`hk-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a5468" /><stop offset="100%" stopColor="#1c222e" />
        </linearGradient>
        <linearGradient id={`hs-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" /><stop offset="60%" stopColor="#dfe5ee" /><stop offset="100%" stopColor="#9aa4b4" />
        </linearGradient>
      </defs>
      <Cute id={id} base={base} cy={61} r={33} />
      {/* mortarboard, tilted */}
      <g transform="rotate(-10 50 24)">
        <path d="M36 25 Q50 33 64 25 L63 33 Q50 39 37 33 Z" fill={`url(#hk-${id})`} stroke="#11151d" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M22 20 L50 9 L78 20 L50 31 Z" fill={`url(#hk-${id})`} stroke="#11151d" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M27 20 L50 11.5 L60 15.3" fill="none" stroke="#ffffff" strokeOpacity=".35" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="50" cy="20" r="2.2" fill="#ffd36b" stroke="#a86a12" strokeWidth=".8" />
        <path d="M50 20 Q66 21 74 24 L75 35" fill="none" stroke="#ffd36b" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M72.5 34 L77.5 34 L78.5 42 L71.5 42 Z" fill="#ffd36b" stroke="#a86a12" strokeWidth=".9" strokeLinejoin="round" />
      </g>
      {/* the game's emblem as a sticker */}
      <circle cx="80" cy="80" r="14" fill={`url(#hs-${id})`} stroke="#7c8594" strokeWidth="1.8" />
      <g transform="translate(70.4 70.4) scale(0.8)">{EMBLEMS[game](base)}</g>
      {spark(16, 30, 4.4, '#ffffff', 0.95)}
      {spark(88, 50, 3, '#ffd36b', 0.9)}
    </Svg>
  );
}

// ─── 친구 대전 승리 ──────────────────────────────────────────────────────────────────────────────────────────────

/** Party time: a coral stone in a striped party hat, a heart balloon, confetti, and the friend in a tiny hat. */
export function FriendWinStone({ id, name, size }: { id: string; name: string; size: number }) {
  const confetti: [number, number, string, number][] = [[12, 22, '#ffd36b', 20], [24, 10, '#7cdcff', -30], [86, 58, '#ff6bc4', 40], [10, 52, '#9b8cff', -10], [36, 6, '#ff8a5c', 60]];
  return (
    <Svg name={name} size={size}>
      <defs>
        <linearGradient id={`fh-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff9ad5" /><stop offset="100%" stopColor="#ff4f8b" />
        </linearGradient>
        <radialGradient id={`fb-${id}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffb3c4" /><stop offset="100%" stopColor="#e8365f" />
        </radialGradient>
      </defs>
      {/* heart balloon */}
      <path d="M80 44 Q76 52 82 60" fill="none" stroke="#b07a5a" strokeWidth="1.1" />
      <path d="M80 40 C70 33 70 22 77 21 C80 20.5 81 23 81.5 24.5 C82 23 84 20.5 87 21 C94 22 93 33 80 40 Z" fill={`url(#fb-${id})`} stroke="#b0173f" strokeWidth="1.3" />
      <ellipse cx="76.5" cy="25.5" rx="2.2" ry="1.3" fill="#ffffff" opacity=".7" transform="rotate(-30 76.5 25.5)" />
      {confetti.map(([x, y, c, rot], i) => <rect key={i} x={x - 2.4} y={y - 1.2} width="4.8" height="2.4" rx=".8" fill={c} transform={`rotate(${rot} ${x} ${y})`} />)}
      <Cute id={id} base="#ff8a5c" cy={60} r={32} />
      {/* party hat */}
      <g transform="rotate(14 50 28)">
        <path d="M37 31 L51 3 L63 31 Z" fill={`url(#fh-${id})`} stroke="#a3104a" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M44.5 16 L57 21 M41 24 L60 29" stroke="#fff3b0" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="51" cy="3" r="3.6" fill="#ffd36b" stroke="#a86a12" strokeWidth="1" />
      </g>
      {/* the friend */}
      <circle cx="17" cy="86" r="12" fill="#f6f3ec" stroke="#8c8578" strokeWidth="1.5" />
      <rect x="11.6" y="81" width="3" height="5.4" rx="1.5" fill="#17201e" />
      <rect x="18.6" y="81" width="3" height="5.4" rx="1.5" fill="#17201e" />
      <path d="M13 90 Q16.6 92.6 20.2 90" fill="none" stroke="#17201e" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M11 75.5 L17 64 L23 75.5 Z" fill="#7cdcff" stroke="#1d6f9a" strokeWidth="1.1" strokeLinejoin="round" />
      <circle cx="17" cy="64" r="1.8" fill="#ffd36b" />
    </Svg>
  );
}

// ─── 오픈 대전 승리 ──────────────────────────────────────────────────────────────────────────────────────────────

/** Open match winner: a sky stone in a sporty sweatband, a gold star medal on a ribbon round its neck. */
export function OpenWinStone({ id, name, size }: { id: string; name: string; size: number }) {
  return (
    <Svg name={name} size={size}>
      <defs>
        <linearGradient id={`om-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff6c4" /><stop offset="50%" stopColor="#f5c53a" /><stop offset="100%" stopColor="#a8740c" />
        </linearGradient>
      </defs>
      <Cute id={id} base="#3fb8ff" cy={54} r={34} />
      {/* sweatband */}
      <path d="M17.5 41 Q50 26 82.5 41 L81 49 Q50 35 19 49 Z" fill="#ffffff" stroke="#1f6fa3" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M18.6 45.2 Q50 31 81.6 45.2" fill="none" stroke="#ff5b6e" strokeWidth="2.4" />
      {/* ribbon and medal */}
      <path d="M34 80 L44 92 M66 80 L56 92" stroke="#e5484d" strokeWidth="6" strokeLinecap="round" />
      <path d="M34 80 L44 92 M66 80 L56 92" stroke="#3f6fe0" strokeWidth="2" strokeLinecap="round" />
      <circle cx="50" cy="90" r="10.5" fill={`url(#om-${id})`} stroke="#7d5306" strokeWidth="1.6" />
      <circle cx="50" cy="90" r="7.2" fill="none" stroke="#ffffff" strokeOpacity=".6" strokeWidth="1" />
      <path d="M50 84 L51.8 88 L56 88.3 L52.7 91 L53.8 95 L50 92.8 L46.2 95 L47.3 91 L44 88.3 L48.2 88 Z" fill="#fff8d6" stroke="#a8740c" strokeWidth=".7" />
      {spark(86, 22, 5, '#ffd36b')}
      {spark(14, 70, 3.4, '#7cdcff')}
      {spark(90, 72, 2.8, '#ffffff')}
    </Svg>
  );
}

// ─── 매우 어려움 1회 클리어 ────────────────────────────────────────────────────────────────────────────────────────

/** Survived 매우 어려움: obsidian with glowing red eyes, curled horns, a tiny fang, a devil tail and embers. */
export function HellClearStone({ id, name, size }: { id: string; name: string; size: number }) {
  const cy = 58, r = 34;
  return (
    <Svg name={name} size={size}>
      <defs>
        <radialGradient id={`hc-${id}`} cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#4a1420" /><stop offset="55%" stopColor="#1a070b" /><stop offset="100%" stopColor="#050102" />
        </radialGradient>
        <radialGradient id={`ha-${id}`} cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#ff3355" stopOpacity=".55" /><stop offset="100%" stopColor="#ff3355" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`hn-${id}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#f3e6d4" /><stop offset="70%" stopColor="#ff8a73" /><stop offset="100%" stopColor="#e5233f" />
        </linearGradient>
      </defs>
      <circle cx="50" cy={cy} r="50" fill={`url(#ha-${id})`} />
      {/* devil tail */}
      <path d={`M74 ${cy + 22} C90 ${cy + 26} 94 ${cy + 8} 86 ${cy - 2}`} fill="none" stroke="#1a070b" strokeWidth="3.6" strokeLinecap="round" />
      <path d={`M86 ${cy - 2} L80 ${cy - 6} L89 ${cy - 12} L92 ${cy - 2} Z`} fill="#e5233f" stroke="#1a070b" strokeWidth="1.3" strokeLinejoin="round" />
      {/* curled horns */}
      <path d="M31 33 C22 30 18 20 24 11 C25 19 31 22 39 26 Z" fill={`url(#hn-${id})`} stroke="#1a070b" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M69 33 C78 30 82 20 76 11 C75 19 69 22 61 26 Z" fill={`url(#hn-${id})`} stroke="#1a070b" strokeWidth="1.6" strokeLinejoin="round" />
      <ellipse cx="50" cy={cy + r - 1} rx={r * 0.8} ry="4" fill="rgba(0,0,0,.35)" />
      <circle cx="50" cy={cy} r={r} fill={`url(#hc-${id})`} stroke="#c8102e" strokeWidth="2.2" />
      <ellipse cx={50 - r * 0.36} cy={cy - r * 0.5} rx={r * 0.24} ry={r * 0.1} fill="#ffffff" opacity=".25" transform={`rotate(-30 ${50 - r * 0.36} ${cy - r * 0.5})`} />
      {/* glowing slanted eyes */}
      <path d={`M35 ${cy - 10} L46 ${cy - 5} L46 ${cy + 3} L35 ${cy - 1} Z`} fill="#ff3355" />
      <path d={`M65 ${cy - 10} L54 ${cy - 5} L54 ${cy + 3} L65 ${cy - 1} Z`} fill="#ff3355" />
      <path d={`M37 ${cy - 7} L44 ${cy - 4.5} L44 ${cy - 1} L37 ${cy - 3} Z`} fill="#ffd3d8" opacity=".85" />
      <path d={`M63 ${cy - 7} L56 ${cy - 4.5} L56 ${cy - 1} L63 ${cy - 3} Z`} fill="#ffd3d8" opacity=".85" />
      {/* grin with one fang */}
      <path d={`M42 ${cy + 11} Q50 ${cy + 17} 58 ${cy + 11}`} fill="none" stroke="#ff3355" strokeWidth="2" strokeLinecap="round" />
      <path d={`M53.5 ${cy + 13.4} L55.6 ${cy + 18} L57 ${cy + 12.6} Z`} fill="#ffffff" />
      {/* CLEAR tag */}
      <rect x="30" y={cy + 24} width="40" height="12" rx="6" fill="#c8102e" stroke="#ff8a9a" strokeWidth="1" />
      <text x="50" y={cy + 32.8} textAnchor="middle" fontSize="7.6" fontWeight="900" letterSpacing="1.3" fontFamily="system-ui, sans-serif" fill="#fff0f2">CLEAR</text>
      {/* embers */}
      <circle cx="14" cy="34" r="2.2" fill="#ff7a4a" />
      <circle cx="20" cy="22" r="1.3" fill="#ffb36b" />
      <circle cx="88" cy="40" r="1.5" fill="#ff7a4a" opacity=".85" />
      <circle cx="10" cy="62" r="1.2" fill="#ffb36b" opacity=".8" />
    </Svg>
  );
}

// ─── 플레이 타임 10 … 100시간 ──────────────────────────────────────────────────────────────────────────────────────

export const PLAY_HOURS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;

type PlayLook = { stone: string; metal: [string, string, string]; ink: string; glow?: string };
const PLAY_LOOKS: Record<number, PlayLook> = {
  10: { stone: '#e89a63', metal: ['#f6c79a', '#c77a45', '#6e3a17'], ink: '#3a1c08' },
  20: { stone: '#d98454', metal: ['#ffd2a8', '#c46a32', '#5e2c0d'], ink: '#3a1c08' },
  30: { stone: '#c96f40', metal: ['#ffdcb8', '#cf7136', '#5a2408'], ink: '#331505' },
  40: { stone: '#8d97a8', metal: ['#ffffff', '#b9c2cf', '#5d6675'], ink: '#1d2430' },
  50: { stone: '#6f7c92', metal: ['#ffffff', '#c3ccd9', '#4f5a6b'], ink: '#141a24', glow: '#cfe2ff' },
  60: { stone: '#4f5d78', metal: ['#ffffff', '#cfd8e6', '#46526a'], ink: '#0f1420', glow: '#b8d4ff' },
  70: { stone: '#e3a91f', metal: ['#fff6c4', '#f5c53a', '#8a5a06'], ink: '#3b2604', glow: '#ffe07a' },
  80: { stone: '#d48a12', metal: ['#fffbe0', '#ffcf3f', '#7d4a04'], ink: '#331f02', glow: '#ffd25a' },
  90: { stone: '#ffbf2e', metal: ['#ffffff', '#ffe27a', '#9a5b00'], ink: '#3b2604', glow: '#fff0a0' },
  100: { stone: '#7a4cff', metal: ['#ffffff', '#ffe9a6', '#b8860b'], ink: '#ffffff', glow: '#c9a6ff' },
};

/**
 * Hours played. Every tier keeps the clock ring (ten pips, the earned ones lit) and the hours plate.
 * 10–30: a sleepy bronze stone in a striped nightcap. 40–60: silver, in gamer headphones with a focused look.
 * 70–90: gold, headphones and shades, with rays behind. 100: a prism stone with wings, a holo visor and a halo.
 */
export function PlayTimeStone({ id, name, size, hours }: { id: string; name: string; size: number; hours: number }) {
  const k = PLAY_LOOKS[hours] ?? PLAY_LOOKS[10];
  const step = Math.max(1, Math.min(10, Math.round(hours / 10)));
  const tier = step <= 3 ? 'bronze' : step <= 6 ? 'silver' : step <= 9 ? 'gold' : 'prism';
  const metal = `url(#pm-${id})`;
  const cy = 58, r = 33;
  const ringR = r + 7;
  const headphones = (
    <g>
      <path d={`M${50 - r - 1} ${cy - 2} C${50 - r - 1} ${cy - r - 14} ${50 + r + 1} ${cy - r - 14} ${50 + r + 1} ${cy - 2}`} fill="none" stroke={metal} strokeWidth="5" strokeLinecap="round" />
      <path d={`M${50 - r - 1} ${cy - 2} C${50 - r - 1} ${cy - r - 14} ${50 + r + 1} ${cy - r - 14} ${50 + r + 1} ${cy - 2}`} fill="none" stroke="#ffffff" strokeOpacity=".45" strokeWidth="1.2" />
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <rect x={sd === -1 ? 50 - r - 9 : 50 + r - 3} y={cy - 12} width="12" height="22" rx="5.5" fill={metal} stroke={k.metal[2]} strokeWidth="1.4" />
          <rect x={sd === -1 ? 50 - r - 6 : 50 + r} y={cy - 8} width="6" height="14" rx="3" fill={tier === 'prism' ? '#ff6bc4' : tier === 'gold' ? '#e5484d' : '#3fb8ff'} opacity=".9" />
        </g>
      ))}
    </g>
  );
  return (
    <Svg name={name} size={size}>
      <defs>
        <linearGradient id={`pm-${id}`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor={k.metal[0]} /><stop offset="50%" stopColor={k.metal[1]} /><stop offset="100%" stopColor={k.metal[2]} />
        </linearGradient>
        <radialGradient id={`pg-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={k.glow ?? '#000'} stopOpacity=".75" /><stop offset="100%" stopColor={k.glow ?? '#000'} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`pp-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7cf3ff" /><stop offset="35%" stopColor="#b48cff" /><stop offset="70%" stopColor="#ff6bc4" /><stop offset="100%" stopColor="#ffd36b" />
        </linearGradient>
        <linearGradient id={`pv-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7cf3ff" /><stop offset="50%" stopColor="#ff6bc4" /><stop offset="100%" stopColor="#ffd36b" />
        </linearGradient>
      </defs>

      {/* behind: glow (silver+), rays (gold+), wings (100) */}
      {k.glow && <circle cx="50" cy={cy} r={tier === 'silver' ? 50 : 58} fill={`url(#pg-${id})`} />}
      {(tier === 'gold' || tier === 'prism') && (
        <g opacity={tier === 'prism' ? 0.95 : 0.75}>
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2;
            const r1 = ringR + 2, r2 = ringR + (i % 2 ? 9 : 16);
            return <path key={i} d={`M${50 + r1 * Math.cos(a - 0.09)} ${cy + r1 * Math.sin(a - 0.09)} L${50 + r2 * Math.cos(a)} ${cy + r2 * Math.sin(a)} L${50 + r1 * Math.cos(a + 0.09)} ${cy + r1 * Math.sin(a + 0.09)} Z`} fill={tier === 'prism' ? `url(#pp-${id})` : k.metal[1]} />;
          })}
        </g>
      )}
      {tier === 'prism' && [1, -1].map((s) => (
        <g key={s} transform={s === -1 ? 'translate(100 0) scale(-1 1)' : undefined}>
          {[[-60, 15, 4.6, 10, cy - 18], [-38, 16, 4.8, 6, cy - 8], [-16, 15, 4.6, 5, cy + 3], [6, 12, 4.2, 8, cy + 13]].map(([rot, rx, ry, x, y], i) => (
            <ellipse key={i} cx={x - 6} cy={y - 4} rx={rx} ry={ry} transform={`rotate(${rot} ${x - 6} ${y - 4})`} fill={i % 2 ? '#f1e8ff' : '#ffffff'} stroke="#b48cff" strokeWidth="1.3" />
          ))}
        </g>
      ))}

      {/* the clock ring: ten pips, the earned ones lit */}
      <circle cx="50" cy={cy} r={ringR} fill="none" stroke={tier === 'prism' ? `url(#pp-${id})` : metal} strokeWidth={tier === 'bronze' ? 2.4 : 3.4} />
      {Array.from({ length: 10 }, (_, i) => {
        const a = -Math.PI / 2 + (i / 10) * Math.PI * 2;
        const on = i < step;
        return <circle key={i} cx={50 + ringR * Math.cos(a)} cy={cy + ringR * Math.sin(a)} r={on ? 2.7 : 1.6} fill={on ? (tier === 'prism' ? '#ffffff' : k.metal[0]) : 'rgba(0,0,0,.45)'} stroke={on ? k.metal[2] : 'none'} strokeWidth=".8" />;
      })}

      {/* the stone */}
      {tier === 'prism' ? (
        <>
          <ellipse cx="50" cy={cy + r - 1} rx={r * 0.8} ry="4" fill="rgba(0,0,0,.22)" />
          <circle cx="50" cy={cy} r={r} fill={`url(#pp-${id})`} stroke="#3b1f8f" strokeWidth="2" />
          <circle cx="50" cy={cy} r={r} fill="#3b1f8f" opacity=".22" />
          <ellipse cx={50 - r * 0.36} cy={cy - r * 0.5} rx={r * 0.26} ry={r * 0.12} fill="#ffffff" opacity=".6" transform={`rotate(-30 ${50 - r * 0.36} ${cy - r * 0.5})`} />
          <path d={`M${50 - r * 0.13} ${cy + r * 0.24} Q50 ${cy + r * 0.38} ${50 + r * 0.13} ${cy + r * 0.24}`} fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
        </>
      ) : (
        <Cute id={id} base={k.stone} cy={cy} r={r} eye={tier === 'gold' ? '#3b2604' : undefined}
          eyes={tier !== 'gold'} blush={tier === 'bronze'} smile={tier !== 'silver'} />
      )}

      {tier === 'bronze' && (
        /* sleepy nightcap with a pompom */
        <g>
          <path d="M18 40 C20 16 46 4 84 15 C74 21 71 28 82 40 Q50 31 18 40 Z" fill={k.metal[1]} stroke={k.metal[2]} strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M36 21 L44 34 M54 13 L60 31 M70 13 L71 27" stroke="#fff4e6" strokeWidth="3.4" strokeLinecap="round" opacity=".9" />
          <path d="M17 39.5 Q50 30 83 39.5" fill="none" stroke="#fff4e6" strokeWidth="6.5" strokeLinecap="round" />
          <path d="M17 39.5 Q50 30 83 39.5" fill="none" stroke={k.metal[2]} strokeOpacity=".35" strokeWidth="1" strokeDasharray="1.5 2.5" />
          <circle cx="86" cy="15" r="6" fill="#fff4e6" stroke={k.metal[2]} strokeWidth="1.3" />
          <text x="10" y="30" fontSize="9" fontWeight="900" fontFamily="ui-rounded, system-ui, sans-serif" fill={k.metal[2]}>z</text>
          <text x="4" y="20" fontSize="6.5" fontWeight="900" fontFamily="ui-rounded, system-ui, sans-serif" fill={k.metal[2]} opacity=".7">z</text>
        </g>
      )}
      {tier === 'silver' && (
        <>
          {headphones}
          {/* focused eyebrows and a cool little smirk */}
          <path d={`M${50 - r * 0.42} ${cy - r * 0.42} L${50 - r * 0.12} ${cy - r * 0.34} M${50 + r * 0.42} ${cy - r * 0.42} L${50 + r * 0.12} ${cy - r * 0.34}`} stroke={k.ink} strokeWidth="2.2" strokeLinecap="round" />
          <path d={`M${50 - r * 0.08} ${cy + r * 0.26} Q${50 + r * 0.06} ${cy + r * 0.32} ${50 + r * 0.18} ${cy + r * 0.2}`} fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {(tier === 'gold' || tier === 'prism') && (
        <>
          {headphones}
          {/* shades (gold) or a holo visor (100) */}
          {tier === 'gold' ? (
            <g>
              <path d={`M${50 - r * 0.62} ${cy - r * 0.32} H${50 + r * 0.62}`} stroke="#1a1204" strokeWidth="2.2" />
              <path d={`M${50 - r * 0.6} ${cy - r * 0.32} H${50 - r * 0.06} Q${50 - r * 0.08} ${cy + r * 0.1} ${50 - r * 0.33} ${cy + r * 0.1} Q${50 - r * 0.6} ${cy + r * 0.08} ${50 - r * 0.6} ${cy - r * 0.32} Z`} fill="#1a1204" />
              <path d={`M${50 + r * 0.6} ${cy - r * 0.32} H${50 + r * 0.06} Q${50 + r * 0.08} ${cy + r * 0.1} ${50 + r * 0.33} ${cy + r * 0.1} Q${50 + r * 0.6} ${cy + r * 0.08} ${50 + r * 0.6} ${cy - r * 0.32} Z`} fill="#1a1204" />
              <path d={`M${50 - r * 0.5} ${cy - r * 0.24} L${50 - r * 0.3} ${cy - r * 0.04}`} stroke="#ffffff" strokeOpacity=".7" strokeWidth="1.6" strokeLinecap="round" />
              <path d={`M${50 + r * 0.2} ${cy - r * 0.24} L${50 + r * 0.4} ${cy - r * 0.04}`} stroke="#ffffff" strokeOpacity=".7" strokeWidth="1.6" strokeLinecap="round" />
            </g>
          ) : (
            <g>
              <rect x={50 - r * 0.66} y={cy - r * 0.36} width={r * 1.32} height={r * 0.4} rx={r * 0.2} fill={`url(#pv-${id})`} stroke="#ffffff" strokeWidth="1.4" />
              <path d={`M${50 - r * 0.5} ${cy - r * 0.26} H${50 - r * 0.1}`} stroke="#ffffff" strokeOpacity=".85" strokeWidth="1.6" strokeLinecap="round" />
            </g>
          )}
          {/* halo */}
          {step >= 8 && <ellipse cx="50" cy="6" rx="18" ry="4.6" fill="none" stroke={tier === 'prism' ? `url(#pv-${id})` : k.metal[1]} strokeWidth="3" />}
          {step >= 9 && <path d="M50 -2 L53.5 3 L50 8 L46.5 3 Z" fill={tier === 'prism' ? '#ff6bc4' : '#e5484d'} stroke="#ffffff" strokeWidth="1" />}
        </>
      )}

      {/* hours plate */}
      <rect x={hours >= 100 ? 27 : 31} y={cy + r - 4} width={hours >= 100 ? 46 : 38} height="14" rx="7" fill={tier === 'prism' ? '#ffffff' : metal} stroke={tier === 'prism' ? '#7a4cff' : k.metal[2]} strokeWidth="1.6" />
      <text x="50" y={cy + r + 6.3} textAnchor="middle" fontSize={hours >= 100 ? 10.5 : 10} fontWeight="900" fontFamily="ui-rounded, system-ui, sans-serif" fill={tier === 'prism' ? '#5a2fd6' : k.ink}>{`${hours}H`}</text>

      {/* sparkles grow with the tier */}
      {step >= 4 && spark(90, 22, 4.5, k.metal[0])}
      {step >= 6 && spark(10, 86, 3.6, k.metal[0], 0.9)}
      {step >= 8 && spark(92, 84, 3.2, '#ffffff')}
      {tier === 'prism' && <>{spark(8, 18, 5, '#7cf3ff')}{spark(94, 52, 3.6, '#ff6bc4')}</>}
    </Svg>
  );
}

/**
 * Achievement icons, a step below the #1 crowns (CrownStone) and contest champions:
 * - HardClearStone: cleared a game on 어려움 — the game's colour, a silver ring, a HARD ribbon and the emblem. No crown.
 * - FriendWinStone: won a friend match — a coral stone with a pennant and a small friend stone beside it.
 * - OpenWinStone: won an open match — a sky stone with bronze laurels and a small trophy.
 * - HellClearStone: cleared 매우 어려움 once — obsidian with short horns and red eyes, but no hellfire halo or crown.
 * - PlayTimeStone: 10…100 hours played — bronze → silver → gold → prism, more ornament with every tier.
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

const CY = 56, R = 38;
const spark = (x: number, y: number, s: number, fill: string, opacity = 1) => (
  <path d={`M${x} ${y - s} L${x + s * 0.28} ${y - s * 0.28} L${x + s} ${y} L${x + s * 0.28} ${y + s * 0.28} L${x} ${y + s} L${x - s * 0.28} ${y + s * 0.28} L${x - s} ${y} L${x - s * 0.28} ${y - s * 0.28} Z`} fill={fill} opacity={opacity} />
);

/** The round stone with our two eyes, shaded from `base`. */
function Body({ id, base, rim, eye }: { id: string; base: string; rim?: string; eye?: string }) {
  const hi = mix(base, '#ffffff', 0.55), lo = mix(base, '#000000', 0.42);
  const e = eye ?? (light(base) ? '#2a1d05' : '#ffffff');
  return (
    <>
      <defs>
        <radialGradient id={`b-${id}`} cx="35%" cy="28%" r="78%">
          <stop offset="0%" stopColor={hi} /><stop offset="52%" stopColor={base} /><stop offset="100%" stopColor={lo} />
        </radialGradient>
      </defs>
      <circle cx="50" cy={CY + 3} r={R} fill="rgba(0,0,0,.22)" />
      <circle cx="50" cy={CY} r={R} fill={`url(#b-${id})`} stroke={rim ?? mix(base, '#000000', 0.62)} strokeWidth="2" />
      <ellipse cx="38" cy={CY - 19} rx="10" ry="4.5" fill="#ffffff" opacity=".45" transform={`rotate(-28 38 ${CY - 19})`} />
      <rect x={50 - R * 0.33} y={CY - R * 0.38} width={R * 0.2} height={R * 0.37} rx={R * 0.1} fill={e} />
      <rect x={50 + R * 0.13} y={CY - R * 0.38} width={R * 0.2} height={R * 0.37} rx={R * 0.1} fill={e} />
    </>
  );
}

const Svg = ({ name, size, children }: { name: string; size: number; children: React.ReactNode }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} className="block shrink-0 overflow-visible" role="img" aria-label={name}>{children}</svg>
);

// ─── 어려움 클리어 (per game) ─────────────────────────────────────────────────────────────────────────────────────

export function HardClearStone({ id, name, size, game }: { id: string; name: string; size: number; game: GameId }) {
  const base = CERT_GAMES[game].color;
  const rim = mix(base, '#000000', 0.62);
  return (
    <Svg name={name} size={size}>
      <defs>
        <linearGradient id={`hr-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4f7fb" /><stop offset="55%" stopColor="#c3cbd6" /><stop offset="100%" stopColor="#8a94a3" />
        </linearGradient>
      </defs>
      <circle cx="50" cy={CY} r={R + 5} fill="none" stroke="#c3cbd6" strokeOpacity=".6" strokeWidth="2" />
      <Body id={id} base={base} rim={rim} />
      {/* HARD ribbon across the lower half */}
      <path d={`M8 ${CY + 14} L16 ${CY + 10} L16 ${CY + 24} L8 ${CY + 28} L12 ${CY + 19} Z`} fill="#8a94a3" />
      <path d={`M92 ${CY + 14} L84 ${CY + 10} L84 ${CY + 24} L92 ${CY + 28} L88 ${CY + 19} Z`} fill="#8a94a3" />
      <path d={`M14 ${CY + 9} Q50 ${CY + 3} 86 ${CY + 9} L86 ${CY + 23} Q50 ${CY + 17} 14 ${CY + 23} Z`} fill={`url(#hr-${id})`} stroke="#5d6675" strokeWidth="1.4" strokeLinejoin="round" />
      <text x="50" y={CY + 18.5} textAnchor="middle" fontSize="10.5" fontWeight="900" letterSpacing="1.6" fontFamily="system-ui, sans-serif" fill="#2b3240">HARD</text>
      {/* the game's emblem, small, top right */}
      <circle cx="80" cy="22" r="15" fill="#ffffff" stroke="#8a94a3" strokeWidth="2" />
      <g transform="translate(69.2 11.2) scale(0.9)">{EMBLEMS[game](base)}</g>
      {spark(20, 20, 5, '#e8edf4', 0.9)}
    </Svg>
  );
}

// ─── 친구 대전 승리 ──────────────────────────────────────────────────────────────────────────────────────────────

export function FriendWinStone({ id, name, size }: { id: string; name: string; size: number }) {
  return (
    <Svg name={name} size={size}>
      {/* pennant on a pole behind the stone */}
      <path d="M71 4 V40" stroke="#5a3a22" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="71" cy="4" r="2.4" fill="#ffd36b" />
      <path d="M72 6 L97 13 L72 21 Z" fill="#ffd36b" stroke="#a86a12" strokeWidth="1.4" strokeLinejoin="round" />
      <text x="81" y="16.6" textAnchor="middle" fontSize="7.5" fontWeight="900" fontFamily="system-ui, sans-serif" fill="#6b3d06">W</text>
      <Body id={id} base="#ff8a5c" />
      <path d={`M40 ${CY + 13} Q50 ${CY + 20} 60 ${CY + 13}`} fill="none" stroke="#5a1f0a" strokeWidth="2.4" strokeLinecap="round" />
      {/* the friend: a small white stone leaning in */}
      <circle cx="17" cy="82" r="14" fill="rgba(0,0,0,.2)" />
      <circle cx="17" cy="80" r="14" fill="#f6f3ec" stroke="#8c8578" strokeWidth="1.6" />
      <rect x="11" y="74" width="3.2" height="6" rx="1.6" fill="#17201e" />
      <rect x="18.5" y="74" width="3.2" height="6" rx="1.6" fill="#17201e" />
      <path d="M12.5 84 Q16.5 87 20.5 84" fill="none" stroke="#17201e" strokeWidth="1.5" strokeLinecap="round" />
      {spark(90, 34, 4, '#ffd36b')}
    </Svg>
  );
}

// ─── 오픈 대전 승리 ──────────────────────────────────────────────────────────────────────────────────────────────

const laurel = (side: 1 | -1, color: string, stroke: string) => (
  <g transform={side === -1 ? 'translate(100 0) scale(-1 1)' : undefined}>
    <path d={`M20 ${CY + 30} Q6 ${CY + 6} 16 ${CY - 26}`} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    {[0, 1, 2, 3, 4].map((i) => {
      const t = i / 4;
      const x = 20 - 13 * Math.sin(t * Math.PI * 0.9) + (t > 0.7 ? 6 * (t - 0.7) : 0);
      const y = CY + 26 - t * 52;
      return <ellipse key={i} cx={x - 4} cy={y} rx="5.2" ry="2.6" fill={color} stroke={stroke} strokeWidth="1" transform={`rotate(${-50 + t * 40} ${x - 4} ${y})`} />;
    })}
  </g>
);

export function OpenWinStone({ id, name, size }: { id: string; name: string; size: number }) {
  return (
    <Svg name={name} size={size}>
      {laurel(1, '#d99a5b', '#7a4a1c')}
      {laurel(-1, '#d99a5b', '#7a4a1c')}
      <Body id={id} base="#3fb8ff" />
      <path d={`M40 ${CY + 13} Q50 ${CY + 20} 60 ${CY + 13}`} fill="none" stroke="#06314d" strokeWidth="2.4" strokeLinecap="round" />
      {/* small bronze trophy */}
      <circle cx="77" cy="80" r="15" fill="#2b1a0c" stroke="#d99a5b" strokeWidth="2" />
      <path d="M70 72 H84 V76 Q84 84 77 85 Q70 84 70 76 Z" fill="#e0a868" stroke="#7a4a1c" strokeWidth="1.2" />
      <path d="M70 74 Q65 74 66 78 Q67 81 71 80 M84 74 Q89 74 88 78 Q87 81 83 80" fill="none" stroke="#e0a868" strokeWidth="1.6" />
      <rect x="75.4" y="85" width="3.2" height="3" fill="#b9814a" />
      <rect x="71.5" y="88" width="11" height="3" rx="1" fill="#e0a868" stroke="#7a4a1c" strokeWidth="1" />
      <text x="50" y="12" textAnchor="middle" fontSize="8" fontWeight="900" letterSpacing="2" fontFamily="system-ui, sans-serif" fill="#3fb8ff">OPEN</text>
    </Svg>
  );
}

// ─── 매우 어려움 1회 클리어 ────────────────────────────────────────────────────────────────────────────────────────

export function HellClearStone({ id, name, size }: { id: string; name: string; size: number }) {
  return (
    <Svg name={name} size={size}>
      <defs>
        <radialGradient id={`hc-${id}`} cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#3a1018" /><stop offset="55%" stopColor="#170609" /><stop offset="100%" stopColor="#050102" />
        </radialGradient>
      </defs>
      {/* short horns */}
      <path d="M33 28 C27 25 24 19 25 12 C29 18 34 20 41 22 Z" fill="#c9b8a6" stroke="#050102" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M67 28 C73 25 76 19 75 12 C71 18 66 20 59 22 Z" fill="#c9b8a6" stroke="#050102" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="50" cy={CY + 3} r={R} fill="rgba(0,0,0,.35)" />
      <circle cx="50" cy={CY} r={R} fill={`url(#hc-${id})`} stroke="#a3172f" strokeWidth="2" />
      <path d={`M34 ${CY - 11} L46 ${CY - 6} L46 ${CY + 3} L34 ${CY} Z`} fill="#e5484d" />
      <path d={`M66 ${CY - 11} L54 ${CY - 6} L54 ${CY + 3} L66 ${CY} Z`} fill="#e5484d" />
      <path d={`M36 ${CY - 8} L44 ${CY - 5} L44 ${CY} L36 ${CY - 2} Z`} fill="#ffd3d8" opacity=".8" />
      <path d={`M64 ${CY - 8} L56 ${CY - 5} L56 ${CY} L64 ${CY - 2} Z`} fill="#ffd3d8" opacity=".8" />
      {/* "CLEAR" tag */}
      <rect x="31" y={CY + 15} width="38" height="11" rx="5.5" fill="#a3172f" />
      <text x="50" y={CY + 23.4} textAnchor="middle" fontSize="7.4" fontWeight="900" letterSpacing="1.2" fontFamily="system-ui, sans-serif" fill="#ffe3e6">CLEAR</text>
      <circle cx="84" cy="30" r="2.2" fill="#ff7a4a" opacity=".85" />
      <circle cx="16" cy="76" r="1.6" fill="#ff7a4a" opacity=".6" />
    </Svg>
  );
}

// ─── 플레이 타임 10 … 100시간 ──────────────────────────────────────────────────────────────────────────────────────

export const PLAY_HOURS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;

type PlayLook = { stone: string; metal: [string, string, string]; ink: string; glow?: string };
const PLAY_LOOKS: Record<number, PlayLook> = {
  10: { stone: '#c77a45', metal: ['#f6c79a', '#c77a45', '#6e3a17'], ink: '#3a1c08' },
  20: { stone: '#b8693a', metal: ['#ffd2a8', '#c46a32', '#5e2c0d'], ink: '#3a1c08' },
  30: { stone: '#a3552c', metal: ['#ffdcb8', '#cf7136', '#5a2408'], ink: '#331505' },
  40: { stone: '#8d97a8', metal: ['#ffffff', '#b9c2cf', '#5d6675'], ink: '#1d2430' },
  50: { stone: '#6f7c92', metal: ['#ffffff', '#c3ccd9', '#4f5a6b'], ink: '#141a24', glow: '#cfe2ff' },
  60: { stone: '#4f5d78', metal: ['#ffffff', '#cfd8e6', '#46526a'], ink: '#0f1420', glow: '#b8d4ff' },
  70: { stone: '#e3a91f', metal: ['#fff6c4', '#f5c53a', '#8a5a06'], ink: '#3b2604', glow: '#ffe07a' },
  80: { stone: '#d48a12', metal: ['#fffbe0', '#ffcf3f', '#7d4a04'], ink: '#331f02', glow: '#ffd25a' },
  90: { stone: '#ffbf2e', metal: ['#ffffff', '#ffe27a', '#9a5b00'], ink: '#3b2604', glow: '#fff0a0' },
  100: { stone: '#7a4cff', metal: ['#ffffff', '#ffe9a6', '#b8860b'], ink: '#ffffff', glow: '#c9a6ff' },
};

export function PlayTimeStone({ id, name, size, hours }: { id: string; name: string; size: number; hours: number }) {
  const k = PLAY_LOOKS[hours] ?? PLAY_LOOKS[10];
  const step = Math.max(1, Math.min(10, Math.round(hours / 10)));
  const tier = step <= 3 ? 'bronze' : step <= 6 ? 'silver' : step <= 9 ? 'gold' : 'prism';
  const label = `${hours}H`;
  const metal = `url(#pm-${id})`;
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
      </defs>

      {/* behind: glow (silver+), rays (gold+), wings (100) */}
      {k.glow && <circle cx="50" cy={CY} r={tier === 'silver' ? 50 : 56} fill={`url(#pg-${id})`} />}
      {(tier === 'gold' || tier === 'prism') && (
        <g opacity={tier === 'prism' ? 0.95 : 0.7}>
          {Array.from({ length: tier === 'prism' ? 16 : 12 }, (_, i) => {
            const a = (i / (tier === 'prism' ? 16 : 12)) * Math.PI * 2;
            const r1 = R + 6, r2 = R + (i % 2 ? 14 : 20);
            return <path key={i} d={`M${50 + r1 * Math.cos(a - 0.08)} ${CY + r1 * Math.sin(a - 0.08)} L${50 + r2 * Math.cos(a)} ${CY + r2 * Math.sin(a)} L${50 + r1 * Math.cos(a + 0.08)} ${CY + r1 * Math.sin(a + 0.08)} Z`} fill={tier === 'prism' ? `url(#pp-${id})` : k.metal[1]} />;
          })}
        </g>
      )}
      {tier === 'prism' && (
        <g>
          {[1, -1].map((s) => (
            <g key={s} transform={s === -1 ? 'translate(100 0) scale(-1 1)' : undefined}>
              <path d={`M14 ${CY - 2} C-6 ${CY - 14} -16 ${CY - 34} -8 ${CY - 50} C-2 ${CY - 34} 8 ${CY - 28} 20 ${CY - 22} Z`} fill="#ffffff" stroke="#b48cff" strokeWidth="1.6" strokeLinejoin="round" />
              <path d={`M12 ${CY + 8} C-8 ${CY + 2} -18 ${CY - 14} -14 ${CY - 28} C-6 ${CY - 14} 4 ${CY - 8} 18 ${CY - 6} Z`} fill="#f1e8ff" stroke="#b48cff" strokeWidth="1.6" strokeLinejoin="round" />
              <path d={`M12 ${CY + 18} C-4 ${CY + 18} -14 ${CY + 6} -14 ${CY - 6} C-4 ${CY + 4} 4 ${CY + 8} 16 ${CY + 6} Z`} fill="#e4d4ff" stroke="#b48cff" strokeWidth="1.6" strokeLinejoin="round" />
            </g>
          ))}
        </g>
      )}

      {/* the clock ring: ten pips, the earned ones lit */}
      <circle cx="50" cy={CY} r={R + 5} fill="none" stroke={tier === 'prism' ? `url(#pp-${id})` : metal} strokeWidth={tier === 'bronze' ? 2.4 : 3.4} />
      {Array.from({ length: 10 }, (_, i) => {
        const a = -Math.PI / 2 + (i / 10) * Math.PI * 2;
        const on = i < step;
        return <circle key={i} cx={50 + (R + 5) * Math.cos(a)} cy={CY + (R + 5) * Math.sin(a)} r={on ? 2.6 : 1.6} fill={on ? (tier === 'prism' ? '#ffffff' : k.metal[0]) : 'rgba(0,0,0,.45)'} stroke={on ? k.metal[2] : 'none'} strokeWidth=".8" />;
      })}

      {tier === 'prism' ? (
        <>
          <circle cx="50" cy={CY + 3} r={R} fill="rgba(0,0,0,.22)" />
          <circle cx="50" cy={CY} r={R} fill={`url(#pp-${id})`} stroke="#3b1f8f" strokeWidth="2" />
          <circle cx="50" cy={CY} r={R} fill="#3b1f8f" opacity=".25" />
          <ellipse cx="38" cy={CY - 19} rx="10" ry="4.5" fill="#ffffff" opacity=".55" transform={`rotate(-28 38 ${CY - 19})`} />
          <rect x={50 - R * 0.33} y={CY - R * 0.38} width={R * 0.2} height={R * 0.37} rx={R * 0.1} fill="#ffffff" />
          <rect x={50 + R * 0.13} y={CY - R * 0.38} width={R * 0.2} height={R * 0.37} rx={R * 0.1} fill="#ffffff" />
        </>
      ) : (
        <Body id={id} base={k.stone} eye={tier === 'gold' ? '#3b2604' : undefined} />
      )}

      {/* hourglass on the forehead (bronze/silver) or a halo (gold/prism) */}
      {tier === 'gold' || tier === 'prism' ? (
        <g>
          {step >= 8 && <ellipse cx="50" cy="10" rx="22" ry="6" fill="none" stroke={tier === 'prism' ? '#7cf3ff' : k.metal[0]} strokeOpacity=".7" strokeWidth="1.4" />}
          <ellipse cx="50" cy="10" rx="17" ry="4.6" fill="none" stroke={tier === 'prism' ? '#ffffff' : k.metal[1]} strokeWidth="3" />
          {step >= 9 && <path d="M50 1 L54 6 L50 11 L46 6 Z" fill={tier === 'prism' ? '#ff6bc4' : '#e5484d'} stroke="#ffffff" strokeWidth="1" />}
        </g>
      ) : (
        <g transform="translate(50 14)">
          <path d="M-7 -9 H7 L1.5 0 L7 9 H-7 L-1.5 0 Z" fill="#fff8ec" stroke={k.metal[2]} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M-4 6.5 H4 L0 2 Z" fill={k.metal[1]} />
          <rect x="-9" y="-11" width="18" height="3" rx="1.2" fill={metal} />
          <rect x="-9" y="8" width="18" height="3" rx="1.2" fill={metal} />
        </g>
      )}

      {/* hours plate */}
      <rect x={hours >= 100 ? 26 : 30} y={CY + 12} width={hours >= 100 ? 48 : 40} height="15" rx="7.5" fill={tier === 'prism' ? '#ffffff' : metal} stroke={tier === 'prism' ? '#7a4cff' : k.metal[2]} strokeWidth="1.6" />
      <text x="50" y={CY + 23.6} textAnchor="middle" fontSize={hours >= 100 ? 11.5 : 11} fontWeight="900" fontFamily="ui-rounded, system-ui, sans-serif" fill={tier === 'prism' ? '#5a2fd6' : k.ink}>{label}</text>

      {/* sparkles grow with the tier */}
      {step >= 4 && spark(88, 26, 4.5, k.metal[0])}
      {step >= 6 && spark(12, 84, 3.6, k.metal[0], 0.9)}
      {step >= 8 && spark(90, 86, 3.2, '#ffffff')}
      {tier === 'prism' && <>{spark(8, 20, 5, '#7cf3ff')}{spark(93, 52, 3.6, '#ff6bc4')}{spark(50, -2, 4, '#ffffff')}</>}
    </Svg>
  );
}

/**
 * HIDDEN MISSION icons — the rarest on the site, above the #1 crowns:
 * - hm-hard  ALL HARD:  every game with a 어려움 AI cleared on 어려움 or above — a platinum-teal stone in a silver
 *                       laurel, a star burst, an emerald tiara.
 * - hm-hell  ALL HELL:  every 매우 어려움 game cleared — an obsidian stone cracked with lava, great horns, an iron
 *                       crown with rubies, a ring of flickering flames.
 * - hm-rank  TOP 10:    ranked in every game with an average rank of 10 or better — a holographic stone, gold
 *                       wings, a turning prism halo, an orbit ring and a jewelled crown.
 * All drawn in a 100×100 box like the stones.
 */

export type Mission = 'hard' | 'hell' | 'rank';
export const MISSIONS: Mission[] = ['hard', 'hell', 'rank'];

const CY = 56, R = 36;
const star = (x: number, y: number, s: number, fill: string, opacity = 1) => (
  <path d={`M${x} ${y - s} L${x + s * 0.26} ${y - s * 0.26} L${x + s} ${y} L${x + s * 0.26} ${y + s * 0.26} L${x} ${y + s} L${x - s * 0.26} ${y + s * 0.26} L${x - s} ${y} L${x - s * 0.26} ${y - s * 0.26} Z`} fill={fill} opacity={opacity} />
);
const eyes = (fill: string, shine = '#ffffff') => (
  <>
    <rect x={50 - R * 0.34} y={CY - R * 0.4} width={R * 0.21} height={R * 0.4} rx={R * 0.105} fill={fill} />
    <rect x={50 + R * 0.13} y={CY - R * 0.4} width={R * 0.21} height={R * 0.4} rx={R * 0.105} fill={fill} />
    <circle cx={50 - R * 0.27} cy={CY - R * 0.3} r={R * 0.045} fill={shine} />
    <circle cx={50 + R * 0.2} cy={CY - R * 0.3} r={R * 0.045} fill={shine} />
  </>
);
const ribbon = (id: string, text: string, edge: string, ink: string, y = CY + 22) => (
  <g>
    <path d={`M6 ${y + 2} L15 ${y - 3} L15 ${y + 12} L6 ${y + 16} L10 ${y + 8} Z`} fill={edge} />
    <path d={`M94 ${y + 2} L85 ${y - 3} L85 ${y + 12} L94 ${y + 16} L90 ${y + 8} Z`} fill={edge} />
    <path d={`M13 ${y - 4} Q50 ${y - 10} 87 ${y - 4} L87 ${y + 10} Q50 ${y + 4} 13 ${y + 10} Z`} fill={`url(#${id})`} stroke={edge} strokeWidth="1.4" strokeLinejoin="round" />
    <text x="50" y={y + 5.2} textAnchor="middle" fontSize="9.5" fontWeight="900" letterSpacing="1.4" fontFamily="system-ui, sans-serif" fill={ink}>{text}</text>
  </g>
);

// ─── ALL HARD ───────────────────────────────────────────────────────────────────────────────────────────────────

function AllHard({ id }: { id: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`ah-s-${id}`} cx="34%" cy="26%" r="80%">
          <stop offset="0%" stopColor="#c9fff6" /><stop offset="40%" stopColor="#28b8a8" /><stop offset="100%" stopColor="#063a40" />
        </radialGradient>
        <linearGradient id={`ah-m-${id}`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#ffffff" /><stop offset="45%" stopColor="#cfd8e3" /><stop offset="100%" stopColor="#6c7888" />
        </linearGradient>
        <radialGradient id={`ah-g-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7cf3e4" stopOpacity=".7" /><stop offset="100%" stopColor="#7cf3e4" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy={CY} r="54" fill={`url(#ah-g-${id})`} />
      {/* eight-point burst */}
      <g opacity=".9">
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
          const tip = R + 17, side = R + 2;
          return <path key={i} d={`M${50 + side * Math.cos(a - 0.22)} ${CY + side * Math.sin(a - 0.22)} L${50 + tip * Math.cos(a)} ${CY + tip * Math.sin(a)} L${50 + side * Math.cos(a + 0.22)} ${CY + side * Math.sin(a + 0.22)} Z`} fill={`url(#ah-m-${id})`} stroke="#6c7888" strokeWidth=".8" />;
        })}
      </g>
      {/* silver laurel, both sides */}
      {[1, -1].map((s) => (
        <g key={s} transform={s === -1 ? 'translate(100 0) scale(-1 1)' : undefined}>
          <path d={`M30 ${CY + 36} Q8 ${CY + 14} 14 ${CY - 26}`} fill="none" stroke="#8e9aab" strokeWidth="2" strokeLinecap="round" />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const t = i / 5;
            const x = 26 - 16 * Math.sin(t * Math.PI * 0.85), y = CY + 32 - t * 58;
            return <ellipse key={i} cx={x - 3} cy={y} rx="6" ry="2.8" fill={`url(#ah-m-${id})`} stroke="#6c7888" strokeWidth=".9" transform={`rotate(${-55 + t * 45} ${x - 3} ${y})`} />;
          })}
        </g>
      ))}
      <circle cx="50" cy={CY + 3} r={R} fill="rgba(0,0,0,.3)" />
      <circle cx="50" cy={CY} r={R + 3} fill="none" stroke={`url(#ah-m-${id})`} strokeWidth="3.4" />
      <circle cx="50" cy={CY} r={R} fill={`url(#ah-s-${id})`} stroke="#04292d" strokeWidth="1.6" />
      <ellipse cx="38" cy={CY - 18} rx="10" ry="4.4" fill="#ffffff" opacity=".5" transform={`rotate(-28 38 ${CY - 18})`} />
      {eyes('#ffffff', '#0b4f57')}
      {/* tiara with an emerald */}
      <path d="M30 22 Q50 8 70 22 L66 26 Q50 16 34 26 Z" fill={`url(#ah-m-${id})`} stroke="#5d6675" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M50 2 L56 12 L50 21 L44 12 Z" fill="#2ee6a6" stroke="#ffffff" strokeWidth="1.4" />
      <path d="M50 4 L53 12 L50 12 Z" fill="#c9fff0" opacity=".8" />
      <circle cx="37" cy="19.5" r="2" fill="#7cf3e4" stroke="#ffffff" strokeWidth=".7" />
      <circle cx="63" cy="19.5" r="2" fill="#7cf3e4" stroke="#ffffff" strokeWidth=".7" />
      {ribbon(`ah-m-${id}`, 'ALL HARD', '#5d6675', '#14303a')}
      {star(88, 14, 5.5, '#ffffff')}
      {star(10, 30, 3.6, '#c9fff6', 0.9)}
    </>
  );
}

// ─── ALL HELL ───────────────────────────────────────────────────────────────────────────────────────────────────

function AllHell({ id }: { id: string }) {
  const flames = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2 - Math.PI / 2;
    const base = R + 3, tip = R + (i % 2 ? 13 : 19);
    const bx1 = 50 + base * Math.cos(a - 0.2), by1 = CY + base * Math.sin(a - 0.2);
    const bx2 = 50 + base * Math.cos(a + 0.2), by2 = CY + base * Math.sin(a + 0.2);
    const tx = 50 + tip * Math.cos(a + 0.12), ty = CY + tip * Math.sin(a + 0.12);
    return `M${bx1} ${by1} Q${50 + (tip - 6) * Math.cos(a - 0.15)} ${CY + (tip - 6) * Math.sin(a - 0.15)} ${tx} ${ty} Q${50 + (base + 4) * Math.cos(a + 0.3)} ${CY + (base + 4) * Math.sin(a + 0.3)} ${bx2} ${by2} Z`;
  });
  return (
    <>
      <defs>
        <radialGradient id={`al-s-${id}`} cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#4a0d16" /><stop offset="50%" stopColor="#14030a" /><stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <linearGradient id={`al-f-${id}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#8a0a1e" /><stop offset="50%" stopColor="#ff3b1f" /><stop offset="100%" stopColor="#ffd36b" />
        </linearGradient>
        <linearGradient id={`al-h-${id}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#1a0306" /><stop offset="60%" stopColor="#5a0d18" /><stop offset="100%" stopColor="#ffcf6b" />
        </linearGradient>
        <linearGradient id={`al-r-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff5a3c" /><stop offset="100%" stopColor="#7a0a1a" />
        </linearGradient>
        <filter id={`al-b-${id}`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4" /></filter>
      </defs>
      <circle cx="50" cy={CY} r="52" fill="#ff2a14" opacity=".22" filter={`url(#al-b-${id})`} />
      {/* ring of flames, flickering */}
      <g fill={`url(#al-f-${id})`}>
        {flames.map((d, i) => <path key={i} d={d} opacity=".95"><animate attributeName="opacity" values=".95;.6;.95" dur={`${1.1 + (i % 4) * 0.23}s`} repeatCount="indefinite" /></path>)}
      </g>
      {/* great horns */}
      <path d="M31 30 C18 26 8 12 12 -6 C18 8 28 14 42 20 Z" fill={`url(#al-h-${id})`} stroke="#000" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M69 30 C82 26 92 12 88 -6 C82 8 72 14 58 20 Z" fill={`url(#al-h-${id})`} stroke="#000" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="50" cy={CY + 3} r={R} fill="rgba(0,0,0,.5)" />
      <circle cx="50" cy={CY} r={R} fill={`url(#al-s-${id})`} stroke="#ff3b1f" strokeWidth="2.2" />
      {/* lava cracks */}
      <g fill="none" stroke="#ff6a2a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d={`M24 ${CY + 6} L32 ${CY + 10} L30 ${CY + 18} L38 ${CY + 24}`} />
        <path d={`M76 ${CY + 4} L68 ${CY + 12} L72 ${CY + 18} L64 ${CY + 27}`} />
        <path d={`M44 ${CY + 33} L50 ${CY + 26} L56 ${CY + 33}`} />
      </g>
      <g fill="none" stroke="#ffd36b" strokeWidth=".6" strokeLinecap="round" opacity=".9">
        <path d={`M24 ${CY + 6} L32 ${CY + 10} L30 ${CY + 18}`} /><path d={`M76 ${CY + 4} L68 ${CY + 12}`} />
      </g>
      {/* white-hot eyes */}
      <g filter={`url(#al-b-${id})`}>
        <path d={`M32 ${CY - 14} L46 ${CY - 7} L46 ${CY + 3} L32 ${CY - 2} Z`} fill="#ff5a1f" />
        <path d={`M68 ${CY - 14} L54 ${CY - 7} L54 ${CY + 3} L68 ${CY - 2} Z`} fill="#ff5a1f" />
      </g>
      <path d={`M33 ${CY - 12} L45 ${CY - 6.5} L45 ${CY + 1.5} L33 ${CY - 3} Z`} fill="#fff3d6" />
      <path d={`M67 ${CY - 12} L55 ${CY - 6.5} L55 ${CY + 1.5} L67 ${CY - 3} Z`} fill="#fff3d6" />
      {/* iron crown with rubies */}
      <path d="M33 25 L35 8 L42 16 L50 3 L58 16 L65 8 L67 25 Z" fill="#1c1c22" stroke="#ffcf6b" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="32" y="22" width="36" height="6" rx="2" fill="#1c1c22" stroke="#ffcf6b" strokeWidth="1.3" />
      <path d="M50 9 L54 14 L50 19 L46 14 Z" fill={`url(#al-r-${id})`} stroke="#ffcf6b" strokeWidth=".9" />
      <circle cx="40" cy="25" r="1.7" fill="#ff3b1f" /><circle cx="60" cy="25" r="1.7" fill="#ff3b1f" />
      {ribbon(`al-r-${id}`, 'ALL HELL', '#2a0208', '#fff0d6')}
      <circle cx="90" cy="40" r="1.8" fill="#ffd36b"><animate attributeName="cy" values="42;30;42" dur="2.4s" repeatCount="indefinite" /></circle>
      <circle cx="10" cy="62" r="1.5" fill="#ff7a3c"><animate attributeName="cy" values="64;52;64" dur="2.9s" repeatCount="indefinite" /></circle>
    </>
  );
}

// ─── TOP 10 (average rank across every game) ────────────────────────────────────────────────────────────────────

function AllTop({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`at-s-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7cf3ff" /><stop offset="33%" stopColor="#a98bff" /><stop offset="66%" stopColor="#ff6bc4" /><stop offset="100%" stopColor="#ffd36b" />
        </linearGradient>
        <radialGradient id={`at-d-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".45" /><stop offset="55%" stopColor="#ffffff" stopOpacity="0" /><stop offset="100%" stopColor="#1a0a4a" stopOpacity=".45" />
        </radialGradient>
        <linearGradient id={`at-g-${id}`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#fffbe0" /><stop offset="45%" stopColor="#ffc93a" /><stop offset="100%" stopColor="#a86a04" />
        </linearGradient>
        <radialGradient id={`at-c-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2a1670" stopOpacity=".95" /><stop offset="80%" stopColor="#0c0630" stopOpacity=".9" /><stop offset="100%" stopColor="#0c0630" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* star field disc */}
      <circle cx="50" cy={CY} r="52" fill={`url(#at-c-${id})`} />
      <g fill="#ffffff">{[[18, 30, 0.9], [84, 26, 1.1], [12, 70, 0.8], [90, 74, 1], [28, 92, 0.7], [72, 94, 0.9], [8, 48, 0.6], [94, 50, 0.7]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} opacity=".9" />)}</g>
      {/* turning prism halo */}
      <g>
        <animateTransform attributeName="transform" type="rotate" from={`0 50 ${CY}`} to={`360 50 ${CY}`} dur="24s" repeatCount="indefinite" />
        {Array.from({ length: 18 }, (_, i) => {
          const a = (i / 18) * Math.PI * 2;
          const r1 = R + 5, r2 = R + (i % 3 === 0 ? 22 : i % 3 === 1 ? 15 : 11);
          return <path key={i} d={`M${50 + r1 * Math.cos(a - 0.07)} ${CY + r1 * Math.sin(a - 0.07)} L${50 + r2 * Math.cos(a)} ${CY + r2 * Math.sin(a)} L${50 + r1 * Math.cos(a + 0.07)} ${CY + r1 * Math.sin(a + 0.07)} Z`} fill={`url(#at-s-${id})`} opacity=".9" />;
        })}
      </g>
      {/* gold wings */}
      {[1, -1].map((s) => (
        <g key={s} transform={s === -1 ? 'translate(100 0) scale(-1 1)' : undefined}>
          <path d={`M18 ${CY - 6} C0 ${CY - 18} -10 ${CY - 38} -4 ${CY - 54} C2 ${CY - 38} 10 ${CY - 30} 22 ${CY - 24} Z`} fill={`url(#at-g-${id})`} stroke="#7d4a04" strokeWidth="1.3" strokeLinejoin="round" />
          <path d={`M16 ${CY + 4} C-4 ${CY - 2} -14 ${CY - 18} -12 ${CY - 34} C-4 ${CY - 18} 6 ${CY - 12} 20 ${CY - 8} Z`} fill={`url(#at-g-${id})`} stroke="#7d4a04" strokeWidth="1.3" strokeLinejoin="round" />
          <path d={`M16 ${CY + 14} C0 ${CY + 14} -12 ${CY + 2} -14 ${CY - 12} C-4 ${CY} 4 ${CY + 4} 18 ${CY + 4} Z`} fill={`url(#at-g-${id})`} stroke="#7d4a04" strokeWidth="1.3" strokeLinejoin="round" />
        </g>
      ))}
      {/* orbit ring, back half */}
      <ellipse cx="50" cy={CY + 2} rx="47" ry="11" fill="none" stroke="#ffe9a6" strokeWidth="2" opacity=".55" transform={`rotate(-14 50 ${CY + 2})`} strokeDasharray="74 74" strokeDashoffset="74" />
      <circle cx="50" cy={CY + 3} r={R} fill="rgba(0,0,0,.3)" />
      <circle cx="50" cy={CY} r={R} fill={`url(#at-s-${id})`} stroke="#ffffff" strokeWidth="2" />
      <circle cx="50" cy={CY} r={R} fill={`url(#at-d-${id})`} />
      <ellipse cx="38" cy={CY - 18} rx="10" ry="4.4" fill="#ffffff" opacity=".7" transform={`rotate(-28 38 ${CY - 18})`} />
      {eyes('#1a0a4a')}
      {/* orbit ring, front half, with a moon */}
      <ellipse cx="50" cy={CY + 2} rx="47" ry="11" fill="none" stroke="#ffe9a6" strokeWidth="2.2" transform={`rotate(-14 50 ${CY + 2})`} strokeDasharray="74 74" />
      <circle cx="94" cy={CY - 8} r="3.2" fill="#ffffff" stroke="#ffc93a" strokeWidth="1.2" />
      {/* jewelled crown */}
      <path d="M26 24 L30 2 L40 14 L50 -6 L60 14 L70 2 L74 24 Z" fill={`url(#at-g-${id})`} stroke="#7d4a04" strokeWidth="1.8" strokeLinejoin="round" />
      <rect x="25" y="21" width="50" height="7" rx="2.5" fill={`url(#at-g-${id})`} stroke="#7d4a04" strokeWidth="1.6" />
      <path d="M50 4 L55 10 L50 16 L45 10 Z" fill="#7cf3ff" stroke="#ffffff" strokeWidth="1.2" />
      <circle cx="35" cy="24.5" r="2.1" fill="#ff6bc4" stroke="#ffffff" strokeWidth=".7" />
      <circle cx="65" cy="24.5" r="2.1" fill="#a98bff" stroke="#ffffff" strokeWidth=".7" />
      <circle cx="30" cy="2" r="2" fill="#ffffff" /><circle cx="70" cy="2" r="2" fill="#ffffff" /><circle cx="50" cy="-6" r="2.2" fill="#ffffff" />
      {/* plaque */}
      <rect x="26" y={CY + 17} width="48" height="15" rx="7.5" fill="#1a0a4a" stroke={`url(#at-g-${id})`} strokeWidth="2" />
      <text x="50" y={CY + 28.2} textAnchor="middle" fontSize="10" fontWeight="900" letterSpacing="1" fontFamily="system-ui, sans-serif" fill="#ffe08a">TOP 10</text>
      {star(90, 8, 5.5, '#ffffff')}{star(8, 16, 4.2, '#7cf3ff')}{star(94, 92, 3.6, '#ff6bc4')}
    </>
  );
}

export function MissionStone({ id, name, size, mission }: { id: string; name: string; size: number; mission: Mission }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="block shrink-0 overflow-visible" role="img" aria-label={name}>
      {mission === 'hard' ? <AllHard id={id} /> : mission === 'hell' ? <AllHell id={id} /> : <AllTop id={id} />}
    </svg>
  );
}

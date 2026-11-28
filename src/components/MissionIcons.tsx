/**
 * HIDDEN MISSION icons — the rarest on the site, above the #1 crowns:
 * - hm-hard  ALL HARD:  any 24 games with a 어려움 AI cleared on 어려움 or above (HARD_MISSION_NEED) — a platinum-ice
 *                       stone bevelled like a cut diamond, a ring of 24 chrome blades (one per clear), crossed
 *                       greatswords, a spiked platinum crown with a brilliant diamond, a light sweep and a glint.
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

// One blade of the 24-blade ring: blade i is long on every third, mid on the rest of the evens, short on the odds.
const HARD_BLADES = Array.from({ length: 24 }, (_, i) => {
  const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
  const r1 = R + 2, r2 = R + (i % 3 === 0 ? 17 : i % 2 === 0 ? 12 : 9), w = 0.075;
  const p = (r: number, d: number) => `${(50 + r * Math.cos(a + d)).toFixed(2)} ${(CY + r * Math.sin(a + d)).toFixed(2)}`;
  return { d: `M${p(r1, -w)} L${p(r2, 0)} L${p(r1, w)} Z`, ridge: `M${p(r1, 0)} L${p(r2, 0)}`, long: i % 3 === 0 };
});
// Eight bevel facets on the stone: a brilliant cut seen from above.
const HARD_FACETS = Array.from({ length: 8 }, (_, i) => {
  const a1 = (i / 8) * Math.PI * 2 - Math.PI / 2 - Math.PI / 8, a2 = a1 + Math.PI / 4, t = R * 0.58;
  const q = (r: number, a: number) => `${(50 + r * Math.cos(a)).toFixed(2)} ${(CY + r * Math.sin(a)).toFixed(2)}`;
  return `M${q(t, a1)} L${q(R, a1)} A${R} ${R} 0 0 1 ${q(R, a2)} L${q(t, a2)} Z`;
});
const HARD_CSS = `.hm-ah-sweep{animation:hm-ah-sweep 4.2s cubic-bezier(.5,0,.3,1) infinite}
@keyframes hm-ah-sweep{0%{transform:translateX(-60px)}38%,100%{transform:translateX(120px)}}
.hm-ah-glint{animation:hm-ah-glint 4.2s ease-in-out infinite;transform-origin:50px 9px;transform-box:view-box}
@keyframes hm-ah-glint{0%,30%{opacity:0;transform:scale(.3) rotate(0)}40%{opacity:1;transform:scale(1) rotate(45deg)}55%,100%{opacity:0;transform:scale(.3) rotate(90deg)}}
@media (prefers-reduced-motion:reduce){.hm-ah-sweep{animation:none;opacity:0}.hm-ah-glint{animation:none;opacity:.85}}`;

function AllHard({ id }: { id: string }) {
  const chrome = `url(#ah-m-${id})`;
  return (
    <>
      <defs>
        <style>{HARD_CSS}</style>
        <radialGradient id={`ah-s-${id}`} cx="36%" cy="26%" r="82%">
          <stop offset="0%" stopColor="#ffffff" /><stop offset="28%" stopColor="#cdf6ff" /><stop offset="62%" stopColor="#4fa9c8" /><stop offset="100%" stopColor="#0b2340" />
        </radialGradient>
        <linearGradient id={`ah-m-${id}`} gradientUnits="userSpaceOnUse" x1="20" y1="-10" x2="80" y2="110">
          <stop offset="0" stopColor="#ffffff" /><stop offset=".3" stopColor="#c6d3e2" /><stop offset=".5" stopColor="#6d7f96" /><stop offset=".68" stopColor="#eef4fb" /><stop offset="1" stopColor="#4c5b70" />
        </linearGradient>
        <linearGradient id={`ah-b-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c8d4e2" /><stop offset=".5" stopColor="#ffffff" /><stop offset="1" stopColor="#7d8ea4" />
        </linearGradient>
        <linearGradient id={`ah-p-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d3d63" /><stop offset="1" stopColor="#060f1f" />
        </linearGradient>
        <linearGradient id={`ah-d-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" /><stop offset=".45" stopColor="#9ff4ff" /><stop offset="1" stopColor="#1e8fd8" />
        </linearGradient>
        <radialGradient id={`ah-c-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#123a66" stopOpacity=".95" /><stop offset="78%" stopColor="#061427" stopOpacity=".92" /><stop offset="100%" stopColor="#061427" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`ah-w-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" /><stop offset=".5" stopColor="#ffffff" stopOpacity=".85" /><stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`ah-k-${id}`}><circle cx="50" cy={CY} r={R} /></clipPath>
        <filter id={`ah-f-${id}`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.8" /></filter>
      </defs>
      {/* deep-steel disc with an ice-blue aura */}
      <circle cx="50" cy={CY} r="53" fill={`url(#ah-c-${id})`} />
      <circle cx="50" cy={CY} r={R + 6} fill="none" stroke="#5ff0ff" strokeWidth="5" opacity=".55" filter={`url(#ah-f-${id})`} />
      {/* two crossed greatswords behind it all */}
      {[42, -42].map((deg) => (
        <g key={deg} transform={`rotate(${deg} 50 ${CY})`}>
          <path d={`M50 ${CY - 63} L54 ${CY - 52} L54 ${CY + 43} L46 ${CY + 43} L46 ${CY - 52} Z`} fill={`url(#ah-b-${id})`} stroke="#2a3648" strokeWidth="1.1" strokeLinejoin="round" />
          <path d={`M50 ${CY - 61} L50 ${CY + 43}`} stroke="#ffffff" strokeWidth=".8" opacity=".9" />
          <path d={`M38 ${CY + 43} Q50 ${CY + 40} 62 ${CY + 43} L60 ${CY + 47} Q50 ${CY + 45} 40 ${CY + 47} Z`} fill={chrome} stroke="#1b2a40" strokeWidth="1.1" strokeLinejoin="round" />
          <rect x="47.6" y={CY + 46.5} width="4.8" height="6.5" rx="1" fill="#1b2a40" />
          <circle cx="50" cy={CY + 55} r="3" fill={`url(#ah-d-${id})`} stroke="#1b2a40" strokeWidth="1" />
        </g>
      ))}
      {/* 24 chrome blades: one for each hard clear */}
      <g>
        {HARD_BLADES.map((b, i) => (
          <g key={i}>
            <path d={b.d} fill={chrome} stroke="#26344a" strokeWidth=".8" strokeLinejoin="round" />
            {b.long && <path d={b.ridge} stroke="#ffffff" strokeWidth=".6" opacity=".85" />}
          </g>
        ))}
      </g>
      {/* the armoured stone: platinum ice, bevelled like a cut diamond */}
      <circle cx="50" cy={CY + 3} r={R} fill="rgba(0,0,0,.4)" />
      <circle cx="50" cy={CY} r={R + 2.6} fill="none" stroke={chrome} strokeWidth="4" />
      <circle cx="50" cy={CY} r={R + 4.6} fill="none" stroke="#1b2a40" strokeWidth=".9" />
      <circle cx="50" cy={CY} r={R} fill={`url(#ah-s-${id})`} stroke="#0b1d33" strokeWidth="1.4" />
      <g clipPath={`url(#ah-k-${id})`}>
        {HARD_FACETS.map((d, i) => <path key={i} d={d} fill={i % 2 ? '#ffffff' : '#06203a'} opacity={i % 2 ? 0.2 : 0.14} stroke="#ffffff" strokeOpacity=".35" strokeWidth=".6" />)}
        <polygon points={HARD_FACETS.map((_, i) => { const a = (i / 8) * Math.PI * 2 - Math.PI / 2 - Math.PI / 8; return `${(50 + R * 0.58 * Math.cos(a)).toFixed(2)},${(CY + R * 0.58 * Math.sin(a)).toFixed(2)}`; }).join(' ')} fill="#ffffff" opacity=".1" stroke="#ffffff" strokeOpacity=".45" strokeWidth=".6" />
        <g className="hm-ah-sweep"><rect x="20" y={CY - R - 4} width="16" height={R * 2 + 8} fill={`url(#ah-w-${id})`} transform={`skewX(-22) translate(${(CY * 0.4).toFixed(1)} 0)`} /></g>
      </g>
      <ellipse cx="37" cy={CY - 20} rx="9" ry="3.6" fill="#ffffff" opacity=".75" transform={`rotate(-30 37 ${CY - 20})`} />
      {/* cold, sharp, glowing eyes */}
      <g filter={`url(#ah-f-${id})`}>
        <path d={`M30 ${CY - 13} L46 ${CY - 6} L45 ${CY + 3} L31 ${CY - 1} Z`} fill="#2ee9ff" />
        <path d={`M70 ${CY - 13} L54 ${CY - 6} L55 ${CY + 3} L69 ${CY - 1} Z`} fill="#2ee9ff" />
      </g>
      <path d={`M32 ${CY - 10.5} L44.5 ${CY - 5} L44 ${CY + 1} L33 ${CY - 2.5} Z`} fill="#ffffff" stroke="#0b2a4a" strokeWidth=".9" strokeLinejoin="round" />
      <path d={`M68 ${CY - 10.5} L55.5 ${CY - 5} L56 ${CY + 1} L67 ${CY - 2.5} Z`} fill="#ffffff" stroke="#0b2a4a" strokeWidth=".9" strokeLinejoin="round" />
      <path d={`M28 ${CY - 17} L47 ${CY - 9}`} stroke="#0b2340" strokeWidth="2.6" strokeLinecap="round" />
      <path d={`M72 ${CY - 17} L53 ${CY - 9}`} stroke="#0b2340" strokeWidth="2.6" strokeLinecap="round" />
      {/* spiked platinum crown with a brilliant-cut diamond */}
      <path d="M25 27 L23 5 L34 17 L38 -1 L45 13 L50 -12 L55 13 L62 -1 L66 17 L77 5 L75 27 Z" fill={chrome} stroke="#1b2a40" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M50 -9 L52.6 12 L50 15 L47.4 12 Z M38 2 L40.6 14 L38 16 Z M62 2 L59.4 14 L62 16 Z" fill="#ffffff" opacity=".7" />
      <rect x="23" y="23" width="54" height="7" rx="1.5" fill={chrome} stroke="#1b2a40" strokeWidth="1.5" />
      <path d="M41 6 L59 6 L63 11 L50 25 L37 11 Z" fill={`url(#ah-d-${id})`} stroke="#ffffff" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M41 6 L45 11 L50 6 L55 11 L59 6 M37 11 L63 11 M45 11 L50 25 L55 11" fill="none" stroke="#1676b8" strokeWidth=".7" opacity=".8" />
      <path d="M42 7 L45 10.5 L38.5 10.5 Z" fill="#ffffff" opacity=".9" />
      {[30, 70].map((x) => <path key={x} d={`M${x} 23.6 L${x + 2.6} 26.5 L${x} 29.4 L${x - 2.6} 26.5 Z`} fill="#2ee9ff" stroke="#ffffff" strokeWidth=".7" />)}
      <g className="hm-ah-glint">{star(50, 9, 9, '#ffffff')}</g>
      {/* angular steel plaque */}
      <path d={`M14 ${CY + 25} L22 ${CY + 17} L78 ${CY + 17} L86 ${CY + 25} L78 ${CY + 33} L22 ${CY + 33} Z`} fill={`url(#ah-p-${id})`} stroke={chrome} strokeWidth="2" strokeLinejoin="round" />
      <path d={`M24 ${CY + 19.5} L76 ${CY + 19.5}`} stroke="#5ff0ff" strokeWidth=".7" opacity=".7" />
      <text x="50" y={CY + 28.6} textAnchor="middle" fontSize="10" fontWeight="900" letterSpacing="1.3" fontFamily="system-ui, sans-serif" fill="#dffbff">ALL HARD</text>
      {star(90, 22, 4.6, '#ffffff')}{star(10, 74, 3.4, '#9ff4ff', 0.9)}
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

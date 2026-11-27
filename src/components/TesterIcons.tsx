/**
 * PLAY TESTER icons: for members who joined the Google Play app's closed test (src/components/AppTesterInvite.tsx).
 * - pt-tester   TESTER:   given on joining. A violet stone wearing a glowing lime visor, an antenna with a pulsing
 *                         tip, a turning scan ring.
 * - pt-14d      14 DAYS:  granted by the operator to testers who stayed through the closed test. An emerald stone in a
 *                         completed 14-segment dial, happy eyes, a gold check crest.
 * - pt-founder  FOUNDER:  granted by the operator to the first group. An obsidian stone veined in gold, ringed by 12
 *                         twinkling stars (the 12 testers a closed test needs), a gold crown with a violet gem.
 * Drawn in a 100×100 box like the other stones. No brand marks (original artwork only).
 */

export type TesterTier = 'tester' | '14d' | 'founder';
export const TESTER_TIERS: TesterTier[] = ['tester', '14d', 'founder'];

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
const plaque = (text: string, bg: string, edge: string, ink: string, size = 9.5) => (
  <>
    <rect x="22" y={CY + 18} width="56" height="15" rx="7.5" fill={bg} stroke={edge} strokeWidth="2" />
    <text x="50" y={CY + 29} textAnchor="middle" fontSize={size} fontWeight="900" letterSpacing="1.3" fontFamily="system-ui, sans-serif" fill={ink}>{text}</text>
  </>
);

// ─── TESTER (joined) ────────────────────────────────────────────────────────────────────────────────────────────

function Tester({ id }: { id: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`pt-s-${id}`} cx="34%" cy="26%" r="80%">
          <stop offset="0%" stopColor="#d9ceff" /><stop offset="42%" stopColor="#6a4cff" /><stop offset="100%" stopColor="#1a0b52" />
        </radialGradient>
        <linearGradient id={`pt-v-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eaffb0" /><stop offset="45%" stopColor="#7dff8a" /><stop offset="100%" stopColor="#1ed6c8" />
        </linearGradient>
        <radialGradient id={`pt-g-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#b8ff3a" stopOpacity=".55" /><stop offset="100%" stopColor="#b8ff3a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy={CY} r="54" fill={`url(#pt-g-${id})`} />
      {/* turning scan ring */}
      <g>
        <animateTransform attributeName="transform" type="rotate" from={`0 50 ${CY}`} to={`360 50 ${CY}`} dur="9s" repeatCount="indefinite" />
        <circle cx="50" cy={CY} r={R + 9} fill="none" stroke={`url(#pt-v-${id})`} strokeWidth="3.2" strokeDasharray="14 7 3 7" strokeLinecap="round" />
      </g>
      <circle cx="50" cy={CY} r={R + 4} fill="none" stroke="#b8ff3a" strokeWidth="1" opacity=".5" />
      {/* antenna with a pulsing tip */}
      <path d={`M58 ${CY - R + 2} Q62 22 70 8`} fill="none" stroke="#2a1670" strokeWidth="3.2" strokeLinecap="round" />
      <path d={`M58 ${CY - R + 2} Q62 22 70 8`} fill="none" stroke="#c9b8ff" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="70" cy="8" r="9" fill="#b8ff3a" opacity=".35"><animate attributeName="r" values="6;11;6" dur="1.6s" repeatCount="indefinite" /><animate attributeName="opacity" values=".5;0;.5" dur="1.6s" repeatCount="indefinite" /></circle>
      <circle cx="70" cy="8" r="5" fill={`url(#pt-v-${id})`} stroke="#ffffff" strokeWidth="1.4" />
      <circle cx="50" cy={CY + 3} r={R} fill="rgba(0,0,0,.3)" />
      <circle cx="50" cy={CY} r={R} fill={`url(#pt-s-${id})`} stroke="#12063a" strokeWidth="1.8" />
      <ellipse cx="36" cy={CY - 22} rx="9" ry="4" fill="#ffffff" opacity=".45" transform={`rotate(-28 36 ${CY - 22})`} />
      {/* visor with glowing eyes */}
      <rect x="15" y={CY - 19} width="70" height="20" rx="10" fill="#0b0626" stroke={`url(#pt-v-${id})`} strokeWidth="3" />
      <rect x="19" y={CY - 16} width="62" height="6" rx="3" fill="#ffffff" opacity=".12" />
      <rect x="35" y={CY - 15} width="8" height="12" rx="4" fill="#b8ff3a" />
      <rect x="57" y={CY - 15} width="8" height="12" rx="4" fill="#b8ff3a" />
      <rect x="35" y={CY - 15} width="8" height="12" rx="4" fill="#ffffff" opacity=".0"><animate attributeName="opacity" values="0;0;.9;0;0" keyTimes="0;.9;.94;.98;1" dur="4s" repeatCount="indefinite" /></rect>
      <rect x="57" y={CY - 15} width="8" height="12" rx="4" fill="#ffffff" opacity=".0"><animate attributeName="opacity" values="0;0;.9;0;0" keyTimes="0;.9;.94;.98;1" dur="4s" repeatCount="indefinite" /></rect>
      {plaque('TESTER', '#12063a', '#b8ff3a', '#d8ff7a')}
      {star(14, 20, 4.4, '#b8ff3a')}{star(90, 88, 3.6, '#7cf3ff')}{star(10, 86, 3, '#c9b8ff')}
    </>
  );
}

// ─── 14 DAYS (stayed through the closed test) ───────────────────────────────────────────────────────────────────

function FourteenDays({ id }: { id: string }) {
  const seg = 14, r = R + 9;
  return (
    <>
      <defs>
        <radialGradient id={`pd-s-${id}`} cx="34%" cy="26%" r="80%">
          <stop offset="0%" stopColor="#d9fff2" /><stop offset="42%" stopColor="#1fbf95" /><stop offset="100%" stopColor="#03362b" />
        </radialGradient>
        <linearGradient id={`pd-d-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b8ff3a" /><stop offset="55%" stopColor="#3ddc97" /><stop offset="100%" stopColor="#2bb8ff" />
        </linearGradient>
        <linearGradient id={`pd-g-${id}`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#fffbe0" /><stop offset="45%" stopColor="#ffc93a" /><stop offset="100%" stopColor="#a86a04" />
        </linearGradient>
        <radialGradient id={`pd-h-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3ddc97" stopOpacity=".55" /><stop offset="100%" stopColor="#3ddc97" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy={CY} r="54" fill={`url(#pd-h-${id})`} />
      {/* the completed 14-day dial */}
      <circle cx="50" cy={CY} r={r} fill="none" stroke="#06261f" strokeWidth="9" />
      {Array.from({ length: seg }, (_, i) => {
        const a0 = (i / seg) * Math.PI * 2 - Math.PI / 2 + 0.06, a1 = ((i + 1) / seg) * Math.PI * 2 - Math.PI / 2 - 0.06;
        return <path key={i} d={`M${50 + r * Math.cos(a0)} ${CY + r * Math.sin(a0)} A${r} ${r} 0 0 1 ${50 + r * Math.cos(a1)} ${CY + r * Math.sin(a1)}`} fill="none" stroke={`url(#pd-d-${id})`} strokeWidth="6.5" strokeLinecap="round">
          <animate attributeName="opacity" values="1;.55;1" dur="2.8s" begin={`${(i * 0.2).toFixed(1)}s`} repeatCount="indefinite" />
        </path>;
      })}
      <circle cx="50" cy={CY + 3} r={R} fill="rgba(0,0,0,.3)" />
      <circle cx="50" cy={CY} r={R} fill={`url(#pd-s-${id})`} stroke="#02241c" strokeWidth="1.8" />
      <ellipse cx="38" cy={CY - 18} rx="10" ry="4.4" fill="#ffffff" opacity=".5" transform={`rotate(-28 38 ${CY - 18})`} />
      {/* happy eyes */}
      <path d={`M${50 - R * 0.38} ${CY - R * 0.12} Q${50 - R * 0.24} ${CY - R * 0.42} ${50 - R * 0.1} ${CY - R * 0.12}`} fill="none" stroke="#ffffff" strokeWidth="4.2" strokeLinecap="round" />
      <path d={`M${50 + R * 0.1} ${CY - R * 0.12} Q${50 + R * 0.24} ${CY - R * 0.42} ${50 + R * 0.38} ${CY - R * 0.12}`} fill="none" stroke="#ffffff" strokeWidth="4.2" strokeLinecap="round" />
      {/* gold check crest */}
      <path d="M50 -2 L66 4 L64 18 Q60 27 50 31 Q40 27 36 18 L34 4 Z" fill={`url(#pd-g-${id})`} stroke="#7d4a04" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M42 14 L48 20 L59 8" fill="none" stroke="#2a1d05" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
      {plaque('14 DAYS', '#04261e', `url(#pd-g-${id})`, '#ffe08a')}
      {star(88, 22, 4.2, '#b8ff3a')}{star(12, 30, 3.4, '#ffe08a')}{star(90, 90, 3.2, '#2bb8ff')}
    </>
  );
}

// ─── FOUNDER (the first group) ──────────────────────────────────────────────────────────────────────────────────

function Founder({ id }: { id: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`pf-s-${id}`} cx="34%" cy="26%" r="85%">
          <stop offset="0%" stopColor="#6b6390" /><stop offset="40%" stopColor="#1b1638" /><stop offset="100%" stopColor="#040309" />
        </radialGradient>
        <linearGradient id={`pf-g-${id}`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#fffbe0" /><stop offset="45%" stopColor="#ffc93a" /><stop offset="100%" stopColor="#a86a04" />
        </linearGradient>
        <radialGradient id={`pf-c-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3a2a0a" stopOpacity=".95" /><stop offset="75%" stopColor="#120c02" stopOpacity=".9" /><stop offset="100%" stopColor="#120c02" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* gold sunburst on a dark disc */}
      <circle cx="50" cy={CY} r="53" fill={`url(#pf-c-${id})`} />
      <g opacity=".75">
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i / 24) * Math.PI * 2;
          const r1 = R + 3, r2 = R + (i % 2 ? 10 : 17);
          return <path key={i} d={`M${50 + r1 * Math.cos(a - 0.05)} ${CY + r1 * Math.sin(a - 0.05)} L${50 + r2 * Math.cos(a)} ${CY + r2 * Math.sin(a)} L${50 + r1 * Math.cos(a + 0.05)} ${CY + r1 * Math.sin(a + 0.05)} Z`} fill={`url(#pf-g-${id})`} />;
        })}
      </g>
      {/* twelve founding stars */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const x = 50 + (R + 13) * Math.cos(a), y = CY + (R + 13) * Math.sin(a);
        return <g key={i}>{star(x, y, 4.2, '#ffffff')}<animate attributeName="opacity" values="1;.35;1" dur="2.4s" begin={`${(i * 0.2).toFixed(1)}s`} repeatCount="indefinite" /></g>;
      })}
      <circle cx="50" cy={CY + 3} r={R} fill="rgba(0,0,0,.35)" />
      <circle cx="50" cy={CY} r={R + 2.5} fill="none" stroke={`url(#pf-g-${id})`} strokeWidth="3.6" />
      <circle cx="50" cy={CY} r={R} fill={`url(#pf-s-${id})`} stroke="#000000" strokeWidth="1.4" />
      {/* gold veins */}
      <path d={`M24 ${CY + 10} Q34 ${CY + 4} 38 ${CY + 14} T52 ${CY + 20}`} fill="none" stroke="#ffc93a" strokeWidth="1.3" opacity=".8" />
      <path d={`M70 ${CY - 26} Q64 ${CY - 18} 72 ${CY - 10} T80 ${CY + 4}`} fill="none" stroke="#ffc93a" strokeWidth="1.1" opacity=".7" />
      <ellipse cx="38" cy={CY - 18} rx="10" ry="4.4" fill="#ffffff" opacity=".35" transform={`rotate(-28 38 ${CY - 18})`} />
      {eyes('#ffd36b', '#2a1d05')}
      {/* gold crown with a violet gem */}
      <path d="M27 25 L29 6 L39 16 L50 0 L61 16 L71 6 L73 25 Z" fill={`url(#pf-g-${id})`} stroke="#7d4a04" strokeWidth="1.8" strokeLinejoin="round" />
      <rect x="26" y="22" width="48" height="7" rx="2.5" fill={`url(#pf-g-${id})`} stroke="#7d4a04" strokeWidth="1.6" />
      <path d="M50 9 L55 15 L50 21 L45 15 Z" fill="#a98bff" stroke="#ffffff" strokeWidth="1.2" />
      {star(29, 5, 3, '#ffffff')}{star(71, 5, 3, '#ffffff')}{star(50, -1, 3.4, '#ffffff')}
      {plaque('FOUNDER', '#0a0804', `url(#pf-g-${id})`, '#ffe08a', 9)}
    </>
  );
}

export function TesterStone({ id, name, size, tier }: { id: string; name: string; size: number; tier: TesterTier }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="block shrink-0 overflow-visible" role="img" aria-label={name}>
      {tier === 'tester' ? <Tester id={id} /> : tier === '14d' ? <FourteenDays id={id} /> : <Founder id={id} />}
    </svg>
  );
}

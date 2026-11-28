/**
 * The developer's mark: one icon, for the site's maker only. It is never listed in the icon collection, has no
 * unlock rule and is granted by hand (supabase/migrations/20271205000000_dev_icon.sql); everyone else just sees it on
 * the maker's avatar.
 * - dev-founder  CREATOR:  the PUZZLTHINK stone itself (brand red, the two slanted eyes of the site icon) on a
 *                          blueprint disc, set in a gold bevel inside a turning code ring, an eight-point gold and
 *                          crimson compass star behind, circuit traces ending in the header logo's four colours, a
 *                          gold builder's crown whose centre gem is the 2×2 logo tile, and a "</> DEV" plate with a
 *                          blinking cursor. A light sweep and a glint; all motion stops under prefers-reduced-motion.
 * Drawn in a 100×100 box like the other stones.
 */

export type DevTier = 'founder';

const CY = 56, R = 34;
const BRAND = { red: '#ff6b4a', gold: '#f2c14e', ink: '#17201e' };
const star = (x: number, y: number, s: number, fill: string, opacity = 1) => (
  <path d={`M${x} ${y - s} L${x + s * 0.26} ${y - s * 0.26} L${x + s} ${y} L${x + s * 0.26} ${y + s * 0.26} L${x} ${y + s} L${x - s * 0.26} ${y + s * 0.26} L${x - s} ${y} L${x - s * 0.26} ${y - s * 0.26} Z`} fill={fill} opacity={opacity} />
);
const pt = (r: number, a: number) => `${(50 + r * Math.cos(a)).toFixed(2)} ${(CY + r * Math.sin(a)).toFixed(2)}`;

// Eight compass points: the diagonals long and gold, left/right/bottom crimson (the top one hides under the crown).
const COMPASS = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
  const diag = i % 2 === 1;
  const r2 = R + (diag ? 25 : i === 4 ? 14 : 19), w = diag ? 0.24 : 0.2;
  return { d: `M${pt(R, a - w)} L${pt(r2, a)} L${pt(R, a + w)} Z`, ridge: `M${pt(R, a)} L${pt(r2, a)}`, half: `M${pt(R, a)} L${pt(r2, a)} L${pt(R, a + w)} Z`, diag, top: i === 0 };
});
// Sixteen thin gold rays between the points: a sunburst.
const RAYS = Array.from({ length: 16 }, (_, i) => {
  const a = ((i + 0.5) / 16) * Math.PI * 2 - Math.PI / 2;
  return `M${pt(R + 2, a - 0.05)} L${pt(R + (i % 2 ? 13 : 17), a)} L${pt(R + 2, a + 0.05)} Z`;
});
// Circuit traces: out from the ring, a 45° bend, a node in one of the logo's colours.
const TRACES: { a: number; turn: number; color: string }[] = [
  { a: 200, turn: -1, color: BRAND.red },
  { a: 160, turn: 1, color: '#ffffff' },
  { a: 340, turn: 1, color: '#ffffff' },
  { a: 20, turn: -1, color: BRAND.gold },
];
const traceOf = ({ a, turn }: { a: number; turn: number }) => {
  const rad = (a * Math.PI) / 180, r1 = R + 6, r2 = R + 12;
  const [x1, y1] = [50 + r2 * Math.cos(rad), CY + r2 * Math.sin(rad)];
  const dir = Math.cos(rad) < 0 ? -1 : 1;
  const [x2, y2] = [x1 + dir * 5, y1 + turn * 5];
  return { d: `M${pt(r1, rad)} L${x1.toFixed(2)} ${y1.toFixed(2)} L${x2.toFixed(2)} ${y2.toFixed(2)}`, x: x2, y: y2 };
};

const DEV_CSS = `.dv-ring{animation:dv-spin 28s linear infinite;transform-origin:50px ${CY}px;transform-box:view-box}
@keyframes dv-spin{to{transform:rotate(360deg)}}
.dv-sweep{animation:dv-sweep 5s cubic-bezier(.5,0,.3,1) infinite}
@keyframes dv-sweep{0%{transform:translateX(-70px)}40%,100%{transform:translateX(120px)}}
.dv-glint{animation:dv-glint 5s ease-in-out infinite;transform-origin:50px -2px;transform-box:view-box}
@keyframes dv-glint{0%,34%{opacity:0;transform:scale(.3) rotate(0)}44%{opacity:1;transform:scale(1) rotate(45deg)}58%,100%{opacity:0;transform:scale(.3) rotate(90deg)}}
.dv-cursor{animation:dv-blink 1.1s steps(1) infinite}
@keyframes dv-blink{50%{opacity:0}}
.dv-node{animation:dv-pulse 2.4s ease-in-out infinite}
@keyframes dv-pulse{50%{opacity:.45}}
@media (prefers-reduced-motion:reduce){.dv-ring,.dv-glint,.dv-cursor,.dv-node{animation:none}.dv-sweep{animation:none;opacity:0}.dv-glint{opacity:.9}}`;

function Creator({ id }: { id: string }) {
  const gold = `url(#dv-g-${id})`;
  return (
    <>
      <defs>
        <style>{DEV_CSS}</style>
        {/* the brand stone: icon.png's red, lit from the top left */}
        <radialGradient id={`dv-s-${id}`} cx="34%" cy="24%" r="85%">
          <stop offset="0%" stopColor="#ff9aa0" /><stop offset="30%" stopColor="#f8404f" /><stop offset="72%" stopColor="#d31f33" /><stop offset="100%" stopColor="#5e0914" />
        </radialGradient>
        <linearGradient id={`dv-g-${id}`} gradientUnits="userSpaceOnUse" x1="25" y1="-10" x2="75" y2="110">
          <stop offset="0" stopColor="#fffbe6" /><stop offset=".28" stopColor="#ffd86b" /><stop offset=".52" stopColor="#c98a12" /><stop offset=".7" stopColor="#fff0b0" /><stop offset="1" stopColor="#8a5a06" />
        </linearGradient>
        <linearGradient id={`dv-r-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff6b6b" /><stop offset="1" stopColor="#7a0a18" />
        </linearGradient>
        <radialGradient id={`dv-c-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1b2440" stopOpacity=".97" /><stop offset="76%" stopColor="#090b18" stopOpacity=".95" /><stop offset="100%" stopColor="#090b18" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`dv-w-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" /><stop offset=".5" stopColor="#ffffff" stopOpacity=".7" /><stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`dv-p-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f2236" /><stop offset="1" stopColor="#07080f" />
        </linearGradient>
        <clipPath id={`dv-k-${id}`}><circle cx="50" cy={CY} r={R} /></clipPath>
        <clipPath id={`dv-b-${id}`}><circle cx="50" cy={CY} r="51" /></clipPath>
        <filter id={`dv-f-${id}`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" /></filter>
      </defs>

      {/* blueprint disc: a navy field with a faint grid */}
      <circle cx="50" cy={CY} r="54" fill={`url(#dv-c-${id})`} />
      <g clipPath={`url(#dv-b-${id})`} stroke="#6fb6ff" strokeWidth=".35" opacity=".22">
        {Array.from({ length: 13 }, (_, i) => 2 + i * 8).map((v) => <path key={`v${v}`} d={`M${v} 0 L${v} 110`} />)}
        {Array.from({ length: 13 }, (_, i) => CY - 48 + i * 8).map((v) => <path key={`h${v}`} d={`M-2 ${v} L102 ${v}`} />)}
      </g>
      {/* a red-gold aura */}
      <circle cx="50" cy={CY} r={R + 9} fill="none" stroke="#ff5a4a" strokeWidth="9" opacity=".6" filter={`url(#dv-f-${id})`} />
      <circle cx="50" cy={CY} r={R + 4} fill="none" stroke="#ffd86b" strokeWidth="3" opacity=".5" filter={`url(#dv-f-${id})`} />
      <g opacity=".85">{RAYS.map((d, i) => <path key={i} d={d} fill={gold} />)}</g>

      {/* eight-point compass star */}
      {COMPASS.filter((c) => !c.top).map((c, i) => (
        <g key={i}>
          <path d={c.d} fill={c.diag ? gold : `url(#dv-r-${id})`} stroke={c.diag ? '#5a3a02' : '#3d0610'} strokeWidth=".9" strokeLinejoin="round" />
          <path d={c.half} fill="#000000" opacity=".22" />
          <path d={c.ridge} stroke="#ffffff" strokeWidth=".55" opacity=".75" />
        </g>
      ))}

      {/* circuit traces to the logo's four colours */}
      {TRACES.map((tr, i) => {
        const t = traceOf(tr);
        return (
          <g key={i}>
            <path d={t.d} fill="none" stroke={gold} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            <circle className="dv-node" cx={t.x} cy={t.y} r="2.4" fill={tr.color} stroke="#090b18" strokeWidth=".8" style={{ animationDelay: `${i * 0.6}s` }} />
          </g>
        );
      })}

      {/* the turning code ring */}
      <circle cx="50" cy={CY} r={R + 6} fill="none" stroke={gold} strokeWidth=".8" opacity=".9" />
      <g className="dv-ring">
        <circle cx="50" cy={CY} r={R + 4.2} fill="none" stroke="#ffd86b" strokeWidth="1.6" strokeDasharray="1.2 2.2 5 2.2" opacity=".95" />
      </g>

      {/* the PUZZLTHINK stone in a gold bevel */}
      <circle cx="50" cy={CY + 3} r={R} fill="rgba(0,0,0,.45)" />
      <circle cx="50" cy={CY} r={R + 1.8} fill="none" stroke={gold} strokeWidth="3.4" />
      <circle cx="50" cy={CY} r={R} fill={`url(#dv-s-${id})`} stroke="#3d0610" strokeWidth="1.2" />
      <g clipPath={`url(#dv-k-${id})`}>
        <path d={`M${50 - R} ${CY + 8} Q50 ${CY + 22} ${50 + R} ${CY + 4} L${50 + R} ${CY + R} L${50 - R} ${CY + R} Z`} fill="#000000" opacity=".12" />
        <g className="dv-sweep"><rect x="18" y={CY - R - 4} width="15" height={R * 2 + 8} fill={`url(#dv-w-${id})`} transform="skewX(-22) translate(22 0)" /></g>
      </g>
      <ellipse cx="36" cy={CY - 19} rx="9.5" ry="4" fill="#ffffff" opacity=".55" transform={`rotate(-32 36 ${CY - 19})`} />
      {/* the icon's two slanted eyes, looking up and right */}
      <g fill="#ffffff">
        <rect x={50 - 5} y={CY - 13} width="10" height="17" rx="5" transform={`rotate(-21 50 ${CY - 4.5})`} />
        <rect x={67 - 4.6} y={CY - 18} width="9.2" height="15" rx="4.6" transform={`rotate(-21 67 ${CY - 10.5})`} />
      </g>

      {/* the builder's crown: gold, with the 2×2 logo tile for a gem */}
      <path d="M24 26 L21 7 L33 16 L38 2 L44 12 L50 -8 L56 12 L62 2 L67 16 L79 7 L76 26 Z" fill={gold} stroke="#4a2f02" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M50 -5 L52.4 11 L50 13 L47.6 11 Z M38 5 L40 13 L38 15 Z M62 5 L60 13 L62 15 Z" fill="#ffffff" opacity=".65" />
      <rect x="22.5" y="22.5" width="55" height="7.5" rx="1.6" fill={gold} stroke="#4a2f02" strokeWidth="1.5" />
      {[[21, 7, BRAND.red], [38, 2, '#ffffff'], [62, 2, '#ffffff'], [79, 7, BRAND.gold]].map(([x, y, c], i) => <circle key={i} cx={x} cy={y} r="2.3" fill={c as string} stroke="#4a2f02" strokeWidth=".8" />)}
      <rect x="41.5" y="6.5" width="17" height="17" rx="4" fill={BRAND.ink} stroke="#fff3c4" strokeWidth="1.5" />
      <rect x="44.4" y="9.4" width="5.2" height="5.2" rx="1.1" fill={BRAND.red} />
      <rect x="50.4" y="9.4" width="5.2" height="5.2" rx="1.1" fill="#ffffff" opacity=".92" />
      <rect x="44.4" y="15.4" width="5.2" height="5.2" rx="1.1" fill="#ffffff" opacity=".92" />
      <rect x="50.4" y="15.4" width="5.2" height="5.2" rx="1.1" fill={BRAND.gold} />
      <g className="dv-glint">{star(50, -2, 8, '#ffffff')}</g>

      {/* "</> DEV" plate with a blinking cursor */}
      <path d={`M13 ${CY + 25} L21 ${CY + 17} L79 ${CY + 17} L87 ${CY + 25} L79 ${CY + 33} L21 ${CY + 33} Z`} fill={`url(#dv-p-${id})`} stroke={gold} strokeWidth="2" strokeLinejoin="round" />
      <path d={`M23 ${CY + 19.6} L77 ${CY + 19.6}`} stroke="#ff6b4a" strokeWidth=".7" opacity=".8" />
      <text x="47" y={CY + 28.7} textAnchor="middle" fontSize="10" fontWeight="900" letterSpacing=".6" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">
        <tspan fill="#ff6b4a">&lt;/&gt;</tspan><tspan fill="#ffe08a"> DEV</tspan>
      </text>
      <rect className="dv-cursor" x="70.5" y={CY + 20.8} width="3.6" height="8.6" fill="#ffe08a" />

      {star(91, 20, 4.6, '#ffffff')}{star(9, 22, 3.4, '#ffd86b', 0.95)}{star(93, 88, 3, '#ff9aa0', 0.9)}
    </>
  );
}

export function DevStone({ id, name, size }: { id: string; name: string; size: number; tier?: DevTier }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="block shrink-0 overflow-visible" role="img" aria-label={name}>
      <Creator id={id} />
    </svg>
  );
}

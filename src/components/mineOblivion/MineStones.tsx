import { useId } from 'react';

/*
 * 망각의 지뢰's pieces, in the site's stone language (a round glossy 바둑알 with two eyes, a soft drop shadow made of a
 * second circle, never a blur). Pure SVG, one small <defs> each, readable at 20 px and detailed at 96 px.
 *
 * - MineStone: a naval-mine 바둑알 — gunmetal body, seven studs (detonator horns), a detonator cap on top.
 *   dormant: eyes shut, cap dull; armed: eyes open under angry brows, cap glowing red, red rim;
 *   blast: X eyes on a red-hot body over an orange starburst.
 *   `mark` tints the cap's collar (whose mine it is in the end reveal and 복기).
 * - TreasureStone: a gold stone with a cut gem on top and happy eyes.
 * - WalkerStone: the players' pieces — a white or black 바둑알 in a miner's helmet with a headlamp.
 * - Crater / Footprint: what a cell keeps after an explosion / a scoring step.
 */

export type MineState = 'dormant' | 'armed' | 'blast';

const STUDS = [-40, 0, 40, 90, 140, 180, 220];
const BODY: Record<MineState, [string, string, string]> = {
  dormant: ['#9aa1ab', '#434952', '#16191d'],
  armed: ['#8d939c', '#30353d', '#0b0c0f'],
  blast: ['#ffd08a', '#d9480f', '#3b0d02'],
};

type MineProps = { size?: number; state?: MineState; mark?: string; title?: string; className?: string };
export function MineStone(props: MineProps) {
  return mineArt(useId().replace(/:/g, ''), props);
}

/** The drawing itself, with a fixed gradient id (for the OG image, which renders without hooks). */
export function mineArt(id: string, { size = 32, state = 'dormant', mark, title, className }: MineProps) {
  const [hi, mid, lo] = BODY[state];
  const cx = 50, cy = 57, r = 29;
  const stud = state === 'blast' ? '#7a1d06' : '#1d2126';
  const studHi = state === 'blast' ? '#ffb36b' : state === 'armed' ? '#ff8a7a' : '#aab1ba';
  const cap = state === 'dormant' ? '#7d2f2a' : state === 'armed' ? '#ff3b30' : '#fff1a8';
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={`block shrink-0 overflow-visible ${className ?? ''}`} style={{ overflow: 'visible' }} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <radialGradient id={`mb${id}`} cx="36%" cy="30%" r="78%">
          <stop offset="0%" stopColor={hi} /><stop offset="55%" stopColor={mid} /><stop offset="100%" stopColor={lo} />
        </radialGradient>
      </defs>
      {state === 'blast' && (
        <g>
          <path d={burst(50, 55, 50, 30, 12)} fill="#ff8a1f" />
          <path d={burst(50, 55, 40, 24, 12, 0.26)} fill="#ffd23f" />
          <path d="M12 18 l3 6 6 3 -6 3 -3 6 -3 -6 -6 -3 6 -3z M88 22 l2.4 5 5 2.4 -5 2.4 -2.4 5 -2.4 -5 -5 -2.4 5 -2.4z M86 86 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2z" fill="#fff6c8" />
        </g>
      )}
      {state === 'armed' && <circle cx={cx} cy={cy} r={r + 15} fill="#ff3b30" opacity=".13" />}
      <circle cx={cx} cy={cy + 3} r={r + 2} fill="rgba(0,0,0,.3)" />
      {STUDS.map((a) => {
        // Rounded so the server and the browser print the same numbers (no hydration mismatch).
        const t = (a * Math.PI) / 180, f = (v: number) => Math.round(v * 10) / 10;
        const x1 = f(cx + Math.cos(t) * (r - 3)), y1 = f(cy + Math.sin(t) * (r - 3)), x2 = f(cx + Math.cos(t) * (r + 9)), y2 = f(cy + Math.sin(t) * (r + 9));
        return (
          <g key={a}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stud} strokeWidth="10" strokeLinecap="round" />
            <circle cx={x2} cy={y2} r="3.4" fill={studHi} />
          </g>
        );
      })}
      {/* detonator cap */}
      <rect x="40" y="19" width="20" height="12" rx="3" fill={stud} />
      {mark && <rect x="38" y="26" width="24" height="6" rx="2.5" fill={mark} stroke="#0b0c0f" strokeWidth="1.4" />}
      {state === 'armed' && <circle cx="50" cy="17" r="11" fill="#ff3b30" opacity=".28" />}
      <path d="M42 20 a8 8 0 0 1 16 0 z" fill={cap} stroke="#0b0c0f" strokeWidth="1.6" />
      <circle cx="47" cy="15.5" r="1.8" fill="#fff" opacity={state === 'dormant' ? 0.35 : 0.85} />
      <circle cx={cx} cy={cy} r={r} fill={`url(#mb${id})`} stroke={state === 'armed' ? '#ff4a3d' : state === 'blast' ? '#ffd23f' : '#0b0c0f'} strokeWidth={state === 'dormant' ? 2 : 3} />
      <ellipse cx="40" cy="44" rx="8.5" ry="4" fill="#fff" opacity={state === 'blast' ? 0.45 : 0.32} transform="rotate(-30 40 44)" />
      {eyes(state, cx, cy, r)}
    </svg>
  );
}

function eyes(state: MineState, cx: number, cy: number, r: number) {
  const lx = cx - r * 0.33, rx2 = cx + r * 0.13, w = r * 0.2, y = cy - r * 0.32, h = r * 0.37;
  if (state === 'dormant') {
    // Shut eyes: two short lids, slightly curved down (asleep).
    return (
      <g stroke="#f1f3f5" strokeWidth="3.6" strokeLinecap="round" fill="none">
        <path d={`M${lx - 1} ${y + h * 0.6} q${w / 2 + 1} 3 ${w + 2} 0`} />
        <path d={`M${rx2 - 1} ${y + h * 0.6} q${w / 2 + 1} 3 ${w + 2} 0`} />
      </g>
    );
  }
  if (state === 'blast') {
    const x = (ex: number) => `M${ex - 1} ${y} l${w + 2} ${h} M${ex + w + 1} ${y} l${-w - 2} ${h}`;
    return <path d={`${x(lx)} ${x(rx2)}`} stroke="#fff8e0" strokeWidth="3.6" strokeLinecap="round" />;
  }
  return (
    <g>
      <rect x={lx} y={y} width={w} height={h} rx={w / 2} fill="#fff" />
      <rect x={rx2} y={y} width={w} height={h} rx={w / 2} fill="#fff" />
      <path d={`M${lx - 3} ${y - 6} l${w + 3} 4 M${rx2 + w + 3} ${y - 6} l${-w - 3} 4`} stroke="#ff4a3d" strokeWidth="3.4" strokeLinecap="round" />
    </g>
  );
}

/** A star-like polygon: `n` points between radius `outer` and `inner`. */
function burst(cx: number, cy: number, outer: number, inner: number, n: number, turn = 0) {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i += 1) {
    const a = (i / (n * 2)) * Math.PI * 2 + turn;
    const rr = i % 2 ? inner : outer * (0.86 + ((i * 37) % 7) / 40);
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  return `M${pts.join(' L')}Z`;
}

type TreasureProps = { size?: number; dim?: boolean; title?: string; className?: string };
export function TreasureStone(props: TreasureProps) {
  return treasureArt(useId().replace(/:/g, ''), props);
}

export function treasureArt(id: string, { size = 32, dim = false, title, className }: TreasureProps) {
  const cx = 50, cy = 58, r = 34;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={`block shrink-0 overflow-visible ${className ?? ''}`} style={{ overflow: 'visible' }} opacity={dim ? 0.4 : 1} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <radialGradient id={`tg${id}`} cx="35%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#fff6c4" /><stop offset="50%" stopColor="#f2c53d" /><stop offset="100%" stopColor="#9c6c0a" />
        </radialGradient>
        <linearGradient id={`tj${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e9fffb" /><stop offset="55%" stopColor="#4fe3d0" /><stop offset="100%" stopColor="#0f8f86" />
        </linearGradient>
      </defs>
      {!dim && <circle cx={cx} cy={cy} r={r + 9} fill="none" stroke="#ffd23f" strokeOpacity=".35" strokeWidth="5" />}
      <circle cx={cx} cy={cy + 3} r={r} fill="rgba(0,0,0,.28)" />
      <circle cx={cx} cy={cy} r={r} fill={`url(#tg${id})`} stroke="#7d5306" strokeWidth="2.4" />
      <ellipse cx="38" cy="42" rx="10" ry="4.5" fill="#fff" opacity=".55" transform="rotate(-28 38 42)" />
      {/* happy eyes */}
      <path d={`M${cx - 15} ${cy + 1} q4.5 -7 9 0 M${cx + 6} ${cy + 1} q4.5 -7 9 0`} stroke="#3b2604" strokeWidth="3.6" strokeLinecap="round" fill="none" />
      {/* the gem */}
      <path d="M50 4 L62 16 L50 32 L38 16 Z" fill={`url(#tj${id})`} stroke="#0b5550" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M38 16 H62 M50 4 L46 16 L50 32 M50 4 L54 16" stroke="#0b5550" strokeWidth="1.1" fill="none" opacity=".7" />
      {!dim && <path d="M84 30 l2.2 5 5 2.2 -5 2.2 -2.2 5 -2.2 -5 -5 -2.2 5 -2.2z" fill="#fff8d0" />}
    </svg>
  );
}

/** Seat 0 walks as a white stone in a yellow helmet, seat 1 as a black stone in a red one. */
export const WALKER = [
  { hi: '#ffffff', mid: '#eceae4', lo: '#b9b5aa', rim: '#7c786e', eye: '#17201e', helmet: '#ffc83d', helmetLo: '#c98a06', color: '#ffd76b' },
  { hi: '#6a6e78', mid: '#22252c', lo: '#050507', rim: '#000000', eye: '#ffffff', helmet: '#ff5a4e', helmetLo: '#a8241a', color: '#ff7a6e' },
] as const;

type WalkerProps = { seat: 0 | 1; size?: number; title?: string; glow?: boolean; className?: string };
export function WalkerStone(props: WalkerProps) {
  return walkerArt(useId().replace(/:/g, ''), props);
}

export function walkerArt(id: string, { seat, size = 32, title, glow = false, className }: WalkerProps) {
  const t = WALKER[seat];
  const cx = 50, cy = 60, r = 36;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={`block shrink-0 overflow-visible ${className ?? ''}`} style={{ overflow: 'visible' }} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <radialGradient id={`wb${id}`} cx="35%" cy="32%" r="75%">
          <stop offset="0%" stopColor={t.hi} /><stop offset="55%" stopColor={t.mid} /><stop offset="100%" stopColor={t.lo} />
        </radialGradient>
        <linearGradient id={`wh${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.helmet} /><stop offset="100%" stopColor={t.helmetLo} />
        </linearGradient>
      </defs>
      {glow && <circle cx={cx} cy={cy} r={r + 10} fill="none" stroke={t.color} strokeOpacity=".55" strokeWidth="5" />}
      <circle cx={cx} cy={cy + 3} r={r} fill="rgba(0,0,0,.3)" />
      <circle cx={cx} cy={cy} r={r} fill={`url(#wb${id})`} stroke={t.rim} strokeWidth="2.2" />
      <ellipse cx="66" cy="52" rx="7" ry="3.4" fill="#fff" opacity={seat === 0 ? 0.6 : 0.28} transform="rotate(30 66 52)" />
      {/* miner's helmet: dome, brim, headlamp */}
      <path d="M20 44 C20 18 80 18 80 44 Z" fill={`url(#wh${id})`} stroke="#1a1206" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M50 20 V43" stroke="#1a1206" strokeOpacity=".35" strokeWidth="3" />
      <rect x="13" y="41" width="74" height="7" rx="3.5" fill={t.helmetLo} stroke="#1a1206" strokeWidth="2.2" />
      <circle cx="50" cy="30" r="8" fill="#fff7c2" stroke="#1a1206" strokeWidth="2.2" />
      <circle cx="48" cy="28" r="2.4" fill="#fff" />
      <rect x={cx - r * 0.33} y={53} width={r * 0.2} height={r * 0.36} rx={r * 0.1} fill={t.eye} />
      <rect x={cx + r * 0.13} y={53} width={r * 0.2} height={r * 0.36} rx={r * 0.1} fill={t.eye} />
    </svg>
  );
}

export function Crater({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={`block shrink-0 ${className ?? ''}`} aria-hidden>
      <path d="M50 50 L18 30 M50 50 L84 24 M50 50 L88 70 M50 50 L22 82 M50 50 L56 92" stroke="#120d09" strokeWidth="4" strokeLinecap="round" opacity=".7" />
      <ellipse cx="50" cy="52" rx="30" ry="24" fill="#120d09" opacity=".85" />
      <ellipse cx="50" cy="56" rx="20" ry="14" fill="#000" opacity=".7" />
      <ellipse cx="44" cy="44" rx="14" ry="5" fill="#ff8a1f" opacity=".18" />
    </svg>
  );
}

export function Footprint({ seat, size = 12 }: { seat: 0 | 1; size?: number }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} className="block" aria-hidden>
      <ellipse cx="7" cy="11" rx="2.6" ry="4" fill={WALKER[seat].color} opacity=".55" transform="rotate(-12 7 11)" />
      <ellipse cx="13" cy="8" rx="2.6" ry="4" fill={WALKER[seat].color} opacity=".55" transform="rotate(12 13 8)" />
    </svg>
  );
}

/*
 * Item stones (AI matches): the same glossy 바둑알 with two eyes, each wearing its tool.
 * - ProbeStone (탐지기): a teal stone with a little radar dish on top sending out two waves.
 * - RecallStone (기억 되살리기): a violet stone, eyes wide, a dormant mine floating above it in a thought bubble.
 * - SuitStone (방폭복): an orange stone in a blast helmet: a thick visor across the eyes, a padded collar.
 */
type ItemStoneProps = { size?: number; title?: string; className?: string; dim?: boolean };
function stoneBody(id: string, hi: string, mid: string, lo: string, rim: string, cy = 60, r = 32) {
  return (
    <>
      <defs>
        <radialGradient id={`is${id}`} cx="35%" cy="30%" r="78%"><stop offset="0%" stopColor={hi} /><stop offset="55%" stopColor={mid} /><stop offset="100%" stopColor={lo} /></radialGradient>
      </defs>
      <circle cx="50" cy={cy + 3} r={r} fill="rgba(0,0,0,.3)" />
      <circle cx="50" cy={cy} r={r} fill={`url(#is${id})`} stroke={rim} strokeWidth="2.4" />
      <ellipse cx="39" cy={cy - 15} rx="8" ry="3.6" fill="#fff" opacity=".45" transform={`rotate(-30 39 ${cy - 15})`} />
    </>
  );
}
const svgProps = (size: number, title: string | undefined, className: string | undefined, dim: boolean | undefined) => ({
  viewBox: '0 0 100 100', width: size, height: size, className: `block shrink-0 overflow-visible ${className ?? ''}`, style: { overflow: 'visible' as const },
  opacity: dim ? 0.45 : 1, role: title ? 'img' : undefined, 'aria-label': title, 'aria-hidden': title ? undefined : true,
});

export function ProbeStone({ size = 32, title, className, dim }: ItemStoneProps) {
  const id = useId().replace(/:/g, '');
  return (
    <svg {...svgProps(size, title, className, dim)}>
      <path d="M50 30 V16" stroke="#0b2e2b" strokeWidth="4" strokeLinecap="round" />
      <path d="M34 20 Q50 2 66 20 Z" fill="#bff7ee" stroke="#0b2e2b" strokeWidth="2.6" strokeLinejoin="round" />
      <circle cx="50" cy="16" r="3" fill="#0b2e2b" />
      <path d="M70 10 q7 6 6 15 M77 4 q11 10 9 24" stroke="#5ee0c8" strokeWidth="3.4" strokeLinecap="round" fill="none" />
      {stoneBody(id, '#d9fff8', '#2fbfa8', '#0d5a50', '#0b2e2b')}
      <rect x="37" y="55" width="7" height="12" rx="3.5" fill="#0b2e2b" />
      <rect x="55" y="55" width="7" height="12" rx="3.5" fill="#0b2e2b" />
      <circle cx="58.5" cy="58" r="1.6" fill="#fff" />
    </svg>
  );
}

export function RecallStone({ size = 32, title, className, dim }: ItemStoneProps) {
  const id = useId().replace(/:/g, '');
  return (
    <svg {...svgProps(size, title, className, dim)}>
      <circle cx="68" cy="18" r="15" fill="#f3e8ff" stroke="#3b1d5e" strokeWidth="2.4" />
      <circle cx="54" cy="36" r="3.4" fill="#f3e8ff" stroke="#3b1d5e" strokeWidth="1.8" />
      <g transform="translate(68 19)">
        {[0, 72, 144, 216, 288].map((a) => <line key={a} x1="0" y1="0" x2={Math.round(Math.cos((a * Math.PI) / 180) * 100) / 10} y2={Math.round(Math.sin((a * Math.PI) / 180) * 100) / 10} stroke="#3b1d5e" strokeWidth="3.2" strokeLinecap="round" />)}
        <circle r="6.5" fill="#6b4a8e" stroke="#3b1d5e" strokeWidth="1.6" />
      </g>
      {stoneBody(id, '#f2e6ff', '#9b6cf0', '#3e1f78', '#25104a', 64, 30)}
      <circle cx="40" cy="62" r="5.6" fill="#fff" /><circle cx="60" cy="62" r="5.6" fill="#fff" />
      <circle cx="41.5" cy="62.5" r="2.8" fill="#25104a" /><circle cx="61.5" cy="62.5" r="2.8" fill="#25104a" />
    </svg>
  );
}

export function SuitStone({ size = 32, title, className, dim }: ItemStoneProps) {
  const id = useId().replace(/:/g, '');
  return (
    <svg {...svgProps(size, title, className, dim)}>
      {stoneBody(id, '#ffe2b8', '#f07c1e', '#7a3005', '#3b1702', 56, 34)}
      {/* helmet dome and padded collar */}
      <path d="M20 48 C20 16 80 16 80 48" fill="none" stroke="#3b1702" strokeWidth="5" strokeLinecap="round" />
      <rect x="24" y="80" width="52" height="11" rx="5.5" fill="#3d4450" stroke="#16191d" strokeWidth="2.2" />
      <path d="M32 85.5 h6 M47 85.5 h6 M62 85.5 h6" stroke="#ffd23f" strokeWidth="3" strokeLinecap="round" />
      {/* visor */}
      <rect x="25" y="43" width="50" height="20" rx="10" fill="#10303a" stroke="#16191d" strokeWidth="2.6" />
      <path d="M31 47 h14" stroke="#9ef3ff" strokeWidth="3" strokeLinecap="round" opacity=".7" />
      <rect x="38" y="49" width="6" height="9" rx="3" fill="#ffffff" opacity=".9" />
      <rect x="56" y="49" width="6" height="9" rx="3" fill="#ffffff" opacity=".9" />
    </svg>
  );
}

/** The 방폭복 bubble drawn around a walker while it is armed (on the board), or the burst when it saves you. */
export function ShieldRing({ burst = false, className }: { burst?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`block overflow-visible ${className ?? ''}`} style={{ overflow: 'visible' }} aria-hidden>
      <path d="M50 4 L88 20 V50 C88 74 70 90 50 97 C30 90 12 74 12 50 V20 Z" fill={burst ? 'rgba(94,224,255,.28)' : 'rgba(94,224,255,.12)'} stroke="#5ee0ff" strokeWidth={burst ? 5 : 3.5} strokeLinejoin="round" />
      <path d="M50 12 L80 25 V50 C80 69 66 82 50 88" fill="none" stroke="#dffbff" strokeOpacity=".6" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

"use client";

import type { Color } from '@/lib/piggyBank';

/** A gold piggy bank with its number on the side, facing right. */
export function GoldPig({ label, size = 64, glow = false, className = '' }: { label: number; size?: number; glow?: boolean; className?: string }) {
  const id = `pig-${label}`;
  return (
    <svg viewBox="0 0 120 92" width={size} height={size * 0.77} className={`${glow ? 'drop-shadow-[0_0_10px_rgba(255,214,90,.85)]' : 'drop-shadow-[0_6px_6px_rgba(0,0,0,.45)]'} ${className}`} aria-label={`${label}번 저금통`}>
      <defs>
        <radialGradient id={id} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#fff6b0" />
          <stop offset="45%" stopColor="#ffd84a" />
          <stop offset="100%" stopColor="#d99a12" />
        </radialGradient>
      </defs>
      {/* tail */}
      <path d="M14 42c-8-2-9-10-3-11 5-1 5 6 0 6" fill="none" stroke="#e0a91c" strokeWidth="3.2" strokeLinecap="round" />
      {/* legs */}
      {[34, 50, 72, 86].map((x) => <rect key={x} x={x} y="68" width="11" height="16" rx="4" fill="#e9b52a" />)}
      {/* body */}
      <ellipse cx="58" cy="50" rx="44" ry="30" fill={`url(#${id})`} />
      {/* ear */}
      <path d="M78 26l10-14 5 18z" fill="#f2c335" />
      {/* snout */}
      <ellipse cx="102" cy="52" rx="10" ry="12" fill="#f5c93b" stroke="#d99a12" strokeWidth="1.5" />
      <ellipse cx="100" cy="49" rx="1.6" ry="2.4" fill="#a8740b" /><ellipse cx="104" cy="55" rx="1.6" ry="2.4" fill="#a8740b" />
      {/* eye */}
      <circle cx="88" cy="40" r="2.6" fill="#3a2a06" />
      {/* coin slot */}
      <rect x="44" y="22" width="22" height="4" rx="2" fill="#a8740b" />
      {/* number */}
      <text x="56" y="62" textAnchor="middle" fontSize="28" fontWeight="900" fontFamily="Georgia, serif" fill="#3a2a06">{label}</text>
    </svg>
  );
}

export const CoinDot = ({ color, size = 14 }: { color: Color; size?: number }) => (
  <i className={`inline-block shrink-0 rounded-full border ${color === 'black' ? 'border-[#4a4a6a] bg-gradient-to-b from-[#3b3b5c] to-[#14142a]' : 'border-[#cfcfd8] bg-gradient-to-b from-white to-[#d9d9e2]'}`} style={{ width: size, height: size }} />
);

export const CoinCount = ({ color, n }: { color: Color; n: number }) => (
  <span className="inline-flex items-center gap-1 font-mono font-black"><CoinDot color={color} />{n}</span>
);

/**
 * A player's stepped box: the raised back step is 위칸 (on the table), the low front step is 아래칸.
 * A buzzer sits beside it (lit when this player just doubted).
 */
export function Pedestal({ upper, lower, buzz, active, small = false }: { upper: number | null; lower: number | null; buzz: boolean; active: boolean; small?: boolean }) {
  const w = small ? 80 : 132;
  const pig = small ? 34 : 54;
  return (
    <div className="relative" style={{ width: w + (small ? 14 : 24), height: small ? 82 : 122 }}>
      {/* box */}
      <div className={`absolute bottom-0 left-0 ${active ? 'shadow-[0_0_24px_rgba(255,214,90,.35)]' : 'shadow-[0_10px_18px_rgba(0,0,0,.5)]'}`} style={{ width: w, height: small ? 56 : 84 }}>
        {/* raised back step (위칸) */}
        <div className="absolute left-0 top-0 h-full w-[52%] rounded-t-[6px] border border-white/10 bg-gradient-to-b from-[#4a4f6e] to-[#2a2d44]" />
        {/* low front step (아래칸) */}
        <div className="absolute bottom-0 right-0 h-[62%] w-[52%] rounded-tr-[6px] border border-white/10 bg-gradient-to-b from-[#3f4462] to-[#25283c]" />
        <span className="absolute bottom-2 left-[26%] -translate-x-1/2 text-[8px] font-black tracking-wider text-white/25 sm:text-[9px]">위칸</span>
        <span className="absolute bottom-2 right-[26%] translate-x-1/2 text-[8px] font-black tracking-wider text-white/25 sm:text-[9px]">아래칸</span>
      </div>
      {/* pigs */}
      {upper !== null && <div key={`u${upper}`} className="bw-lay absolute" style={{ left: w * 0.26 - pig / 2, bottom: (small ? 56 : 84) - 4 }}><GoldPig label={upper} size={pig} glow={active} /></div>}
      {lower !== null && <div key={`l${lower}`} className="bw-lay absolute" style={{ left: w * 0.74 - pig / 2, bottom: (small ? 56 : 84) * 0.62 - 4 }}><GoldPig label={lower} size={pig * 0.9} /></div>}
      {/* buzzer */}
      <span className={`absolute bottom-0 right-0 flex items-end justify-center ${small ? 'h-5 w-5' : 'h-7 w-7'}`}>
        <span className="absolute bottom-0 h-[45%] w-full rounded-[4px] bg-[#2a2d44] ring-1 ring-white/10" />
        <span className={`relative mb-[30%] h-[60%] w-[70%] rounded-full ${buzz ? 'bg-[#ff3b5c] shadow-[0_0_16px_#ff3b5c]' : 'bg-[#a81f36]'}`} />
      </span>
    </div>
  );
}

/** A circular countdown with the asked colour in the middle. */
export function TimerRing({ secs, total, color, label }: { secs: number; total: number; color: Color; label: string }) {
  const r = 34, c = 2 * Math.PI * r;
  const left = total > 0 ? Math.max(0, Math.min(1, secs / total)) : 0;
  return (
    <div className="relative flex h-[96px] w-[96px] items-center justify-center sm:h-[116px] sm:w-[116px]">
      <svg viewBox="0 0 80 80" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="40" cy="40" r={r} fill="#1a1c2c" stroke="#3a3d58" strokeWidth="6" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={secs <= 3 ? '#ff3b5c' : '#ffd84a'} strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - left)} className="transition-[stroke-dashoffset] duration-200" />
      </svg>
      <div className="relative flex flex-col items-center leading-none">
        <span className="font-mono text-2xl font-black text-white sm:text-3xl">{secs}</span>
        <span className="mt-1 flex items-center gap-1 text-[10px] font-black text-white/70"><CoinDot color={color} size={10} />{label}</span>
      </div>
    </div>
  );
}

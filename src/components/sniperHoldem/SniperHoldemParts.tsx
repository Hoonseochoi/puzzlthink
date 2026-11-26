"use client";

import { motion } from 'framer-motion';

const SERIF = "Georgia, 'Times New Roman', serif";

/** A number card (no suits on the show). `value` null = face down. */
export function ShCard({ value, size = 'md', dim = false, lifted = false, delay = 0, mark }: {
  value: number | null; size?: 'xs' | 'sm' | 'seat' | 'md' | 'board' | 'hand'; dim?: boolean; lifted?: boolean; delay?: number; mark?: 'hit' | 'win';
}) {
  const box = {
    xs: 'h-[26px] w-[19px] rounded-[4px] text-[12px]',
    sm: 'h-[36px] w-[26px] rounded-[5px] text-[15px]',
    seat: 'h-[30px] w-[22px] rounded-[4px] text-[13px] sm:h-[40px] sm:w-[29px] sm:rounded-[5px] sm:text-[17px]',
    md: 'h-[62px] w-[44px] rounded-[8px] text-[25px]',
    board: 'h-[62px] w-[44px] rounded-[8px] text-[26px] sm:h-[84px] sm:w-[60px] sm:rounded-[10px] sm:text-[36px]',
    hand: 'h-[82px] w-[58px] rounded-[10px] text-[34px] sm:h-[104px] sm:w-[74px] sm:text-[44px]',
  }[size];
  const corner = size === 'md' || size === 'board' || size === 'hand';
  return (
    <motion.span
      initial={{ y: -12, opacity: 0, rotate: -4 }} animate={{ y: lifted ? -8 : 0, opacity: dim ? 0.4 : 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 360, damping: 26, delay }}
      className={`relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden font-bold leading-none shadow-[0_6px_16px_rgba(0,0,0,.45)] ${box} ${value === null
        ? 'border border-[#ff4f5e]/30 bg-[linear-gradient(150deg,#3a1218,#140608)]'
        : 'border border-black/10 bg-[linear-gradient(160deg,#fbfaf6,#e6e1d4)] text-[#1b1d24]'} ${mark === 'win' ? 'ring-2 ring-[#ffd36b] ring-offset-1 ring-offset-[#0b0b0e]' : ''}`}
      style={{ fontFamily: SERIF }}
    >
      {value === null ? (
        <>
          <span className="absolute inset-[3px] rounded-[inherit] border border-white/10 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,.05)_0_2px,transparent_2px_7px)]" />
          {size !== 'xs' && size !== 'seat' && <Scope size={size === 'sm' ? 12 : 20} className="relative text-[#ff4f5e]/70" />}
        </>
      ) : (
        <>
          {corner && <span className="absolute left-[5px] top-[4px] text-[0.3em] opacity-60">{value}</span>}
          <span className="tracking-[-0.06em]">{value}</span>
          {corner && <span className="absolute bottom-[4px] right-[5px] rotate-180 text-[0.3em] opacity-60">{value}</span>}
        </>
      )}
      {mark === 'hit' && <span className="absolute inset-0 grid place-items-center bg-[#ff4f5e]/25"><Scope size={size === 'xs' ? 14 : 24} className="text-[#ff2440]" /></span>}
    </motion.span>
  );
}

/** A crosshair. */
export function Scope({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <path d="M12 1.5v5M12 17.5v5M1.5 12h5M17.5 12h5" />
    </svg>
  );
}

/** A player's round badge: persona color for the AI, the accent for people. */
export function ShAvatar({ name, color, size = 32, active = false }: { name: string; color?: string; size?: number; active?: boolean }) {
  return (
    <span className={`relative grid shrink-0 place-items-center rounded-full font-black text-[#0b0b0e] ${active ? 'ring-2 ring-(--accent) ring-offset-2 ring-offset-[#121217]' : ''}`}
      style={{ width: size, height: size, fontSize: size * 0.42, background: `linear-gradient(150deg, ${color ?? 'var(--accent)'}, color-mix(in srgb, ${color ?? 'var(--accent)'} 55%, #000))` }}>
      {name.slice(0, 1)}
    </span>
  );
}

/** A chip count. */
export function ShChip({ n, className = '' }: { n: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 font-mono font-black ${className}`}>
      <i className="inline-block h-2.5 w-2.5 rounded-full border-2 border-dashed border-[#ffd36b] bg-[#b3261e]" />{n}
    </span>
  );
}

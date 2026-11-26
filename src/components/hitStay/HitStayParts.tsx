"use client";

import { type PersonaId } from '@/lib/aiPersona';
import { PersonaFace } from '@/components/ui/AiPersona';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HS_DIE } from '@/lib/hitStay';

const SERIF = "Georgia, 'Times New Roman', serif";

/** A number card. `value` null = face down. The -1s are black, like the deck on the show board. */
export function HsCard({ value, size = 'md', lifted = false, tag, dim = false, delay = 0 }: {
  value: number | null; size?: 'xs' | 'seat' | 'sm' | 'md' | 'hand' | 'lg'; lifted?: boolean; tag?: string; dim?: boolean; delay?: number;
}) {
  const box = {
    xs: 'h-[27px] w-[19px] rounded-[4px] text-[11px]',
    seat: 'h-[27px] w-[19px] rounded-[4px] text-[11px] sm:h-[40px] sm:w-[28px] sm:rounded-[5px] sm:text-[15px]',
    sm: 'h-[40px] w-[28px] rounded-[5px] text-[15px]',
    md: 'h-[66px] w-[47px] rounded-[8px] text-[26px]',
    hand: 'h-[86px] w-[61px] rounded-[9px] text-[36px] sm:h-[112px] sm:w-[80px] sm:text-[46px]',
    lg: 'h-[96px] w-[68px] rounded-[10px] text-[40px] sm:h-[112px] sm:w-[80px] sm:text-[46px]',
  }[size];
  const corner = size === 'lg' || size === 'md' || size === 'hand';
  const negative = value !== null && value < 0;
  return (
    <motion.span
      initial={{ y: -14, opacity: 0, rotate: -4 }} animate={{ y: lifted ? -10 : 0, opacity: dim ? 0.45 : 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26, delay }}
      className={`relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden font-bold leading-none shadow-[0_6px_16px_rgba(0,0,0,.45)] ${box} ${value === null
        ? 'border border-[#8f9bff]/35 bg-[linear-gradient(150deg,#2f3bb8,#161b62)]'
        : negative ? 'border border-white/25 bg-[linear-gradient(160deg,#24252d,#0d0e13)] text-white' : 'border border-black/10 bg-[linear-gradient(160deg,#fbfaf6,#e7e3d8)] text-[#191c36]'} ${lifted ? 'ring-2 ring-(--accent) ring-offset-2 ring-offset-[#0b0b0e]' : ''}`}
      style={{ fontFamily: SERIF }}
    >
      {value === null ? (
        <>
          <span className="absolute inset-[3px] rounded-[inherit] border border-white/15 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,.07)_0_2px,transparent_2px_7px),repeating-linear-gradient(-45deg,rgba(255,255,255,.07)_0_2px,transparent_2px_7px)]" />
          {size !== 'xs' && size !== 'seat' && <span className="relative rotate-45 border border-white/40 bg-[#ff4d6d]/80" style={{ width: size === 'sm' ? 6 : 11, height: size === 'sm' ? 6 : 11 }} />}
        </>
      ) : (
        <>
          {corner && <span className="absolute left-[5px] top-[5px] text-[0.3em] opacity-70">{value}</span>}
          <span className="tracking-[-0.06em]">{value}</span>
          {corner && <span className="absolute bottom-[5px] right-[5px] rotate-180 text-[0.3em] opacity-70">{value}</span>}
        </>
      )}
      {tag && <span className="absolute inset-x-0 bottom-0 bg-black/70 py-[2px] text-center font-sans text-[8px] font-black tracking-[0.08em] text-white/85">{tag}</span>}
    </motion.span>
  );
}

/**
 * The limit die: an eight-sided die seen face on. On a new round it tumbles through the faces
 * for a moment and lands on the limit.
 */
export function HsDie({ value, rollKey, size = 64, still = false }: { value: number; rollKey: number; size?: number; still?: boolean }) {
  const [shown, setShown] = useState(value);
  const [rolling, setRolling] = useState(false);
  useEffect(() => {
    if (still) return;
    let step = 0;
    const start = window.setTimeout(() => setRolling(true), 0);
    const tick = window.setInterval(() => { step += 1; setShown(HS_DIE[(step * 3 + value) % HS_DIE.length]); }, 85);
    const stop = window.setTimeout(() => { window.clearInterval(tick); setShown(value); setRolling(false); }, 1400);
    return () => { window.clearTimeout(start); window.clearInterval(tick); window.clearTimeout(stop); };
  }, [rollKey, value, still]);
  return (
    <motion.span
      className="relative inline-block" style={{ width: size, height: size }}
      animate={rolling ? { rotate: [0, -160, 40, -300, -360], scale: [1, 1.12, 0.94, 1.08, 1] } : { rotate: 0, scale: 1 }}
      transition={{ duration: rolling ? 1.4 : 0.3, ease: 'easeOut' }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_8px_18px_rgba(40,50,160,.55)]">
        <polygon points="50,3 95,50 50,97 5,50" fill="#141846" />
        <polygon points="50,3 88,64 12,64" fill="#2c348f" />
        <polygon points="50,3 95,50 88,64" fill="#1d2264" />
        <polygon points="50,3 5,50 12,64" fill="#232a7a" />
        <polygon points="12,64 88,64 50,97" fill="#0e1138" />
        <polyline points="50,3 88,64 12,64 50,3" fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="1.2" />
      </svg>
      <span className={`absolute inset-x-0 top-[33%] text-center font-bold text-white transition ${rolling ? 'opacity-70 blur-[0.5px]' : ''}`} style={{ fontFamily: SERIF, fontSize: size * 0.34, lineHeight: 1 }}>{shown}</span>
    </motion.span>
  );
}

/** A player's round badge: persona color for the AI, the accent for people. */
export function HsAvatar({ name, color, size = 32, active = false, persona }: { name: string; color?: string; size?: number; active?: boolean; persona?: PersonaId }) {
  // AI players sit as the site's 바둑알 in their persona colour (the same faces as the other betting games).
  if (persona) return <span className={`relative inline-flex shrink-0 rounded-full ${active ? 'ring-2 ring-(--accent) ring-offset-2 ring-offset-[#121217]' : ''}`}><PersonaFace id={persona} size={size} label={name} /></span>;
  return (
    <span
      className={`relative grid shrink-0 place-items-center rounded-full font-black text-[#0b0b0e] ${active ? 'ring-2 ring-(--accent) ring-offset-2 ring-offset-[#121217]' : ''}`}
      style={{ width: size, height: size, fontSize: size * 0.42, background: `linear-gradient(150deg, ${color ?? 'var(--accent)'}, color-mix(in srgb, ${color ?? 'var(--accent)'} 55%, #000))` }}
    >
      {name.slice(0, 1)}
    </span>
  );
}

/** A small chip pile with a count. */
export function HsChip({ n, className = '' }: { n: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 font-mono font-black ${className}`}>
      <i className="inline-block h-2.5 w-2.5 rounded-full border-2 border-dashed border-[#ffd36b] bg-[#c98a1d]" />{n}
    </span>
  );
}

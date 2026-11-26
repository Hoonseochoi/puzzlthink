"use client";

import { useId } from 'react';
import { motion } from 'framer-motion';
import { Stone } from '../StoneAvatar';

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

/** Lighter / darker shade of a #rrggbb colour (t > 0 towards white, t < 0 towards black). */
function shade(hex: string, t: number) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const m = c.map((v) => Math.round(t > 0 ? v + (255 - v) * t : v * (1 + t)));
  return `#${m.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** The site's 바둑알 (a glossy stone with two eyes) in a persona colour: how the AI players sit at the table. */
export function PersonaStone({ color, size = 32, label }: { color: string; size?: number; label?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="block shrink-0 overflow-visible" role="img" aria-label={label}>
      <defs>
        <radialGradient id={`ps-${id}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={shade(color, 0.45)} /><stop offset="55%" stopColor={color} /><stop offset="100%" stopColor={shade(color, -0.45)} />
        </radialGradient>
      </defs>
      <circle cx="50" cy="53" r="46" fill="rgba(0,0,0,.22)" />
      <circle cx="50" cy="50" r="46" fill={`url(#ps-${id})`} stroke={shade(color, -0.6)} strokeWidth="2" />
      <rect x="34.8" y="33.9" width="9.2" height="17" rx="4.6" fill="#fff" />
      <rect x="56" y="33.9" width="9.2" height="17" rx="4.6" fill="#fff" />
    </svg>
  );
}

/**
 * A seat marker: people sit as their own profile stone (the colour or earned icon they picked in 기록실, looked up
 * by name), the AI as a stone in its persona colour.
 */
export function ShAvatar({ name, color, size = 32, active = false, human = false }: { name: string; color?: string; size?: number; active?: boolean; human?: boolean }) {
  return (
    <span className={`relative inline-flex shrink-0 rounded-full ${active ? 'ring-2 ring-(--accent) ring-offset-2 ring-offset-[#121217]' : ''}`} style={{ width: size, height: size }}>
      {human ? <Stone name={name} size={size} /> : <PersonaStone color={color ?? '#ff4f5e'} size={size} label={name} />}
    </span>
  );
}

/** One chip: a small 바둑알 (black, or white for the gold of a pot). */
export function ChipStone({ size = 11, white = false }: { size?: number; white?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} className="inline-block shrink-0" aria-hidden>
      <ellipse cx="10" cy="11.6" rx="8.6" ry="7.4" fill="rgba(0,0,0,.35)" />
      <ellipse cx="10" cy="10" rx="8.6" ry="7.4" fill={white ? '#eceae4' : '#1d1f25'} stroke={white ? '#9b978c' : '#000'} strokeWidth="1" />
      <ellipse cx="7.2" cy="7.3" rx="3" ry="1.5" fill="#fff" opacity={white ? 0.9 : 0.35} transform="rotate(-20 7.2 7.3)" />
    </svg>
  );
}

/** A chip count with its stone. */
export function ShChip({ n, className = '', white = false }: { n: number; className?: string; white?: boolean }) {
  return <span className={`inline-flex items-center gap-1 font-mono font-black ${className}`}><ChipStone white={white} />{n}</span>;
}

/** The pot: a little heap of black and white stones that grows with it (up to nine). */
export function StonePile({ n, size = 13 }: { n: number; size?: number }) {
  const count = Math.max(1, Math.min(9, Math.ceil(Math.log2(n + 1) * 1.6)));
  return (
    <span className="relative inline-block" style={{ width: size * 2.6, height: size * 1.5 }} aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        const row = i < 4 ? 0 : i < 7 ? 1 : 2;
        const col = row === 0 ? i : row === 1 ? i - 4 : i - 7;
        const left = (col + row * 0.5) * size * 0.55;
        return <span key={i} className="absolute" style={{ left, bottom: row * size * 0.38 }}><ChipStone size={size} white={(i * 7) % 3 === 0} /></span>;
      })}
    </span>
  );
}

"use client";

import { useId } from 'react';
import { motion } from 'framer-motion';

const SERIF = "Georgia, 'Times New Roman', serif";

/** Cup colours by shade: dark at both ends, white in the middle, like the show's rack. */
const SHADES = [
  { edge: '#08080b', base: '#26262d', hi: '#4b4b57', inner: '#030305', rim: '#3b3b45', lip: '#55555f' },
  { edge: '#55575f', base: '#8f9199', hi: '#c6c8cd', inner: '#3d3f46', rim: '#aeb0b6', lip: '#d0d2d6' },
  { edge: '#9a9da4', base: '#c9cbd0', hi: '#eceef0', inner: '#7e8188', rim: '#d9dbde', lip: '#f2f3f4' },
  { edge: '#c2c5cb', base: '#eceef1', hi: '#ffffff', inner: '#a9acb3', rim: '#f4f5f6', lip: '#ffffff' },
] as const;

/** A green number cube seen a little from above. `value` null = still hidden (a "?"). */
function CubeShape({ x, y, s, value, dim }: { x: number; y: number; s: number; value: number | null; dim?: boolean }) {
  const top = s * 0.28;
  return (
    <g opacity={dim ? 0.55 : 1}>
      <path d={`M${x - s / 2} ${y - s / 2} L${x - s / 2 + top} ${y - s / 2 - top * 0.9} L${x + s / 2 + top} ${y - s / 2 - top * 0.9} L${x + s / 2} ${y - s / 2} Z`} fill={value === null ? '#2c6a3f' : '#7be897'} />
      <path d={`M${x + s / 2} ${y - s / 2} L${x + s / 2 + top} ${y - s / 2 - top * 0.9} L${x + s / 2 + top} ${y + s / 2 - top * 0.9} L${x + s / 2} ${y + s / 2} Z`} fill={value === null ? '#163a22' : '#1b7d36'} />
      <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={s * 0.16} fill={value === null ? '#21532f' : '#33c158'} />
      <rect x={x - s / 2} y={y - s / 2} width={s} height={s * 0.5} rx={s * 0.16} fill="#ffffff" opacity={0.13} />
      <text x={x} y={y + s * 0.32} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={s * 0.86} fill={value === null ? '#9fd8b0' : '#ffffff'}>{value === null ? '?' : value}</text>
    </g>
  );
}

/**
 * One cup of the rack. `value`: the cube inside (undefined = empty, null = a cube nobody may see yet).
 * `used` crosses it out like the show's board; `selected` lifts it.
 */
export function GrCup({ tier, value, width = 44, fluid = false, used = false, selected = false, dim = false, onClick, label, pulse = false }: {
  tier: number; value?: number | null; width?: number; fluid?: boolean; used?: boolean; selected?: boolean; dim?: boolean; onClick?: () => void; label?: string; pulse?: boolean;
}) {
  const id = useId().replace(/:/g, '');
  const c = SHADES[Math.max(0, Math.min(3, tier))];
  const h = width * (80 / 64);
  const body = (
    <svg viewBox="0 0 64 80" width={fluid ? undefined : width} height={fluid ? undefined : h} className={`block overflow-visible ${fluid ? 'h-auto w-full' : ''}`} aria-hidden>
      <defs>
        <linearGradient id={`b${id}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={c.edge} /><stop offset="0.22" stopColor={c.base} /><stop offset="0.42" stopColor={c.hi} /><stop offset="0.7" stopColor={c.base} /><stop offset="1" stopColor={c.edge} />
        </linearGradient>
        <radialGradient id={`i${id}`} cx="0.5" cy="0.35" r="0.7"><stop offset="0" stopColor={c.inner} /><stop offset="1" stopColor="#000" stopOpacity={0.85} /></radialGradient>
      </defs>
      <ellipse cx="32" cy="74" rx="27" ry="5" fill="#000" opacity="0.35" />
      <path d="M5 16 V66 A27 8 0 0 0 59 66 V16 Z" fill={`url(#b${id})`} />
      <ellipse cx="32" cy="16" rx="27" ry="8.5" fill={c.rim} />
      <ellipse cx="32" cy="16.5" rx="21.5" ry="6" fill={`url(#i${id})`} />
      {value !== undefined && <CubeShape x={31} y={47} s={27} value={value} dim={used} />}
      {/* the front lip over the cube's foot, so it sits inside the cup */}
      {value !== undefined && <path d="M5 58 V66 A27 8 0 0 0 59 66 V58 A27 8 0 0 1 5 58 Z" fill={`url(#b${id})`} opacity={tier >= 2 ? 0.55 : 0.85} />}
      {used && (
        <g stroke="#b073ff" strokeWidth="4.5" strokeLinecap="round" opacity="0.8">
          <line x1="10" y1="24" x2="54" y2="70" /><line x1="54" y1="24" x2="10" y2="70" />
        </g>
      )}
      {used && value !== undefined && value !== null && (
        <text x="31" y="56" textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize="24" fill="#ffffff" stroke="#1b0b33" strokeWidth="3" paintOrder="stroke">{value}</text>
      )}
    </svg>
  );
  const cls = `relative ${fluid ? 'flex w-full' : 'inline-flex shrink-0'} touch-manipulation select-none flex-col items-center transition ${dim ? 'opacity-40' : ''} ${onClick ? 'cursor-pointer active:scale-95' : ''}`;
  const inner = (
    <motion.span animate={{ y: selected ? -8 : 0 }} transition={{ type: 'spring', stiffness: 420, damping: 24 }} className={`relative block ${fluid ? 'w-full' : ''}`}>
      {selected && <span className="absolute inset-x-[-3px] bottom-[-2px] top-[6px] rounded-[40%] shadow-[0_0_22px_6px_var(--accent-glow)]" />}
      {pulse && <span className="absolute inset-x-0 bottom-0 top-[8px] animate-pulse rounded-[40%] shadow-[0_0_16px_3px_rgba(255,255,255,.25)]" />}
      {body}
    </motion.span>
  );
  return onClick
    ? <button type="button" onClick={onClick} className={cls} aria-label={label} aria-pressed={selected}>{inner}</button>
    : <span className={cls} aria-label={label}>{inner}</span>;
}

/** A loose cube in the tray (placing). */
export function GrCube({ value, size = 34, faded = false, muted = false, onClick, label }: { value: number; size?: number; faded?: boolean; muted?: boolean; onClick?: () => void; label?: string }) {
  const svg = (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden className="block overflow-visible">
      <CubeShape x={18} y={23} s={28} value={value} />
    </svg>
  );
  const cls = `inline-flex shrink-0 touch-manipulation select-none items-center justify-center transition ${faded ? 'opacity-15 grayscale' : muted ? 'opacity-45' : 'active:scale-90'} ${onClick && !faded ? 'cursor-pointer hover:-translate-y-0.5' : ''}`;
  return onClick
    ? <button type="button" onClick={onClick} className={cls} aria-label={label}>{svg}</button>
    : <span className={cls}>{svg}</span>;
}

export function GrAvatar({ name, color, size = 32 }: { name: string; color?: string; size?: number }) {
  return (
    <span className="relative grid shrink-0 place-items-center rounded-full font-black text-[#0b0b0e]"
      style={{ width: size, height: size, fontSize: size * 0.42, background: `linear-gradient(150deg, ${color ?? 'var(--accent)'}, color-mix(in srgb, ${color ?? 'var(--accent)'} 55%, #000))` }}>
      {name.slice(0, 1)}
    </span>
  );
}

/**
 * The 그라데이션 champion's badge: a gold crown over a shield shaded like the rack (dark · light · dark) with
 * the green "1" cube. Worn by whoever is #1 in the AI Hall of Fame right now.
 */
export function GradationCrown({ size = 18, title, className = '' }: { size?: number; title?: string; className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={`inline-block shrink-0 ${className}`} role="img" aria-label={title}>
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id={`g${id}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#17171c" /><stop offset="0.2" stopColor="#8d8f96" /><stop offset="0.5" stopColor="#f4f5f7" /><stop offset="0.8" stopColor="#8d8f96" /><stop offset="1" stopColor="#17171c" />
        </linearGradient>
        <linearGradient id={`au${id}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#fff1a8" /><stop offset="0.55" stopColor="#f2c14e" /><stop offset="1" stopColor="#b9831d" /></linearGradient>
      </defs>
      <path d="M16 6.5 L27.5 10.5 V18 C27.5 24 22.6 28.4 16 30.4 C9.4 28.4 4.5 24 4.5 18 V10.5 Z" fill={`url(#g${id})`} stroke={`url(#au${id})`} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9.6 9.2 L10.4 2.8 L13.6 6 L16 1.4 L18.4 6 L21.6 2.8 L22.4 9.2 Z" fill={`url(#au${id})`} stroke="#8a5f10" strokeWidth="0.6" strokeLinejoin="round" />
      <rect x="10.6" y="13.2" width="10.8" height="10.8" rx="2.2" fill="#2fbf55" stroke="#0f5a25" strokeWidth="0.8" />
      <rect x="10.6" y="13.2" width="10.8" height="4.6" rx="2.2" fill="#fff" opacity="0.18" />
      <text x="16" y="22" textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize="9.5" fill="#fff">1</text>
    </svg>
  );
}

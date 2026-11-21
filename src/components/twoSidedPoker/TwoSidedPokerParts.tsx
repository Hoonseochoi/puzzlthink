"use client";

import { AnimatePresence, motion } from 'framer-motion';
import type { TspCard, TspFace } from '@/lib/twoSidedPoker';

type Size = 'sm' | 'md' | 'lg';
const TILE: Record<Size, string> = {
  sm: 'h-12 w-9 rounded-[7px] text-xl',
  md: 'h-[96px] w-[68px] rounded-[12px] text-[40px] sm:h-[118px] sm:w-[84px] sm:text-[52px]',
  lg: 'h-[112px] w-[80px] rounded-[14px] text-[48px] sm:h-[140px] sm:w-[100px] sm:text-[62px]',
};

/** One face of a card: ivory front (public) or violet back (private). */
export function FaceTile({ kind, value, hidden = false, size = 'md', active = false, dim = false }: {
  kind: 'front' | 'back'; value?: number; hidden?: boolean; size?: Size; active?: boolean; dim?: boolean;
}) {
  const front = kind === 'front';
  return (
    <div className={`relative flex shrink-0 items-center justify-center overflow-hidden border font-black tabular-nums transition duration-300 ${TILE[size]} ${
      front
        ? 'border-white/70 bg-[linear-gradient(150deg,#fffdf6,#ddd5c5)] text-[#15151b]'
        : 'border-(--accent)/45 bg-[linear-gradient(150deg,#3a2f6e,#17122e)] text-[#efeaff]'
    } ${active ? 'z-10 -translate-y-1.5 shadow-[0_0_0_3px_var(--accent),0_14px_36px_var(--accent-glow)]' : 'shadow-[0_10px_26px_rgba(0,0,0,.45)]'} ${dim ? 'opacity-35 saturate-50' : ''}`}>
      {size !== 'sm' && <span className={`absolute left-1.5 top-1 font-mono text-[8px] font-bold tracking-[.14em] sm:left-2 sm:top-1.5 sm:text-[9px] ${front ? 'text-black/35' : 'text-(--accent)/80'}`}>{front ? 'FRONT' : 'BACK'}</span>}
      {hidden ? (
        <>
          <span className="absolute inset-0 opacity-40" style={{ backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 9px, rgba(155,135,255,.35) 9px 10px)' }} />
          <span className="relative text-(--accent)">?</span>
        </>
      ) : <span className="relative leading-none tracking-[-0.06em]">{value}</span>}
      {!hidden && size !== 'sm' && value !== undefined && <span className={`absolute bottom-1.5 right-2 h-1.5 w-1.5 rounded-full ${value % 2 ? 'bg-[#ff8a5c]' : 'bg-[#5cc8ff]'}`} />}
    </div>
  );
}

/** A full card laid open: front and back side by side, the chosen face lifted in the accent. */
export function TwoFaceCard({ card, showBack, chosen, size = 'md', flipKey, dealKey, dimUnchosen = false }: {
  card: TspCard; showBack: boolean; chosen?: TspFace | null; size?: Size; flipKey?: string; dealKey?: string | number; dimUnchosen?: boolean;
}) {
  const on = (kind: 'front' | 'back') => !!chosen && (chosen === 'both' || chosen === kind);
  return (
    <motion.div key={dealKey} initial={{ y: -24, opacity: 0, rotate: -4 }} animate={{ y: 0, opacity: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }} className="flex items-center">
      <FaceTile kind="front" value={card.front} size={size} active={on('front')} dim={dimUnchosen && !!chosen && !on('front')} />
      <span className="mx-1 h-[60%] w-[3px] rounded-full bg-white/10 sm:mx-1.5" />
      <motion.div key={flipKey} initial={flipKey ? { rotateY: 90 } : false} animate={{ rotateY: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }}>
        <FaceTile kind="back" value={card.back} hidden={!showBack} size={size} active={on('back')} dim={dimUnchosen && !!chosen && !on('back')} />
      </motion.div>
    </motion.div>
  );
}

const CHIP_TONE = {
  me: { fill: '#9b87ff', edge: '#e6e0ff', ink: '#120d26' },
  ai: { fill: '#ff8a5c', edge: '#ffe2d6', ink: '#2a0f05' },
  pot: { fill: '#f2c14e', edge: '#fff3cf', ink: '#2b1d00' },
} as const;
export type ChipTone = keyof typeof CHIP_TONE;

/** A single casino chip: solid disc with a dashed rim. */
export function PokerChip({ tone, size = 26, label }: { tone: ChipTone; size?: number; label?: string | number }) {
  const c = CHIP_TONE[tone];
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center rounded-full font-mono font-black shadow-[0_2px_0_rgba(0,0,0,.45)]" style={{ width: size, height: size, background: c.fill, color: c.ink, fontSize: size * 0.38 }}>
      <span className="absolute inset-[3px] rounded-full border-2 border-dashed" style={{ borderColor: c.edge }} />
      {label !== undefined && <span className="relative">{label}</span>}
    </span>
  );
}

/** A stack of chips sized to the count (capped), with the number beside it. Grows and shrinks with a spring. */
export function ChipPile({ count, tone, size = 22, showZero = false, align = 'left', most = 6 }: { count: number; tone: ChipTone; size?: number; showZero?: boolean; align?: 'left' | 'right'; most?: number }) {
  // Height hints at the size without becoming a tower: about one disc per 1, 2 or 5 chips, capped.
  const shown = Math.min(most, Math.ceil(count / (count > 20 ? 5 : count > 6 ? 2 : 1)));
  const c = CHIP_TONE[tone];
  if (!count && !showZero) return <span className="h-0" />;
  return (
    <span className={`inline-flex items-end gap-2 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
      <span className="relative" style={{ width: size, height: size * 0.36 * Math.max(1, shown) + size * 0.64 }}>
        <AnimatePresence initial={false}>
          {Array.from({ length: shown }, (_, i) => (
            <motion.i key={i} initial={{ y: -14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 26, delay: i * 0.015 }}
              className="absolute left-0 rounded-full border border-black/40" style={{ bottom: i * size * 0.36, width: size, height: size * 0.64, background: `radial-gradient(ellipse at 50% 35%, ${c.edge}55, ${c.fill} 55%)`, boxShadow: `inset 0 -2px 0 rgba(0,0,0,.35)` }} />
          ))}
        </AnimatePresence>
      </span>
      <motion.b key={count} initial={{ scale: 1.35 }} animate={{ scale: 1 }} className="font-mono text-base font-black leading-none text-white sm:text-lg">{count}</motion.b>
    </span>
  );
}

/** Speech bubble for the AI's last move. */
export function Bubble({ text, tone = 'ai', id }: { text: string | null; tone?: 'ai' | 'me'; id: string }) {
  return (
    <AnimatePresence mode="wait">
      {text && (
        <motion.span key={id} initial={{ opacity: 0, y: 6, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4 }} transition={{ type: 'spring', stiffness: 380, damping: 24 }}
          className={`relative rounded-lg px-2.5 py-1 text-xs font-black ${tone === 'ai' ? 'bg-[#ff8a5c] text-[#2a0f05]' : 'bg-(--accent) text-(--accent-ink)'}`}>
          {text}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

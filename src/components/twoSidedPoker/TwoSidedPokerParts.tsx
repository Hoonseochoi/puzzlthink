"use client";

import { motion } from 'framer-motion';
import { Eye, Lock } from 'lucide-react';
import type { TspCard, TspFace } from '@/lib/twoSidedPoker';

type Size = 'sm' | 'md' | 'lg';
const TILE: Record<Size, string> = {
  sm: 'h-12 w-9 rounded-[7px] text-xl',
  md: 'h-[104px] w-[74px] rounded-[12px] text-[44px] sm:h-[124px] sm:w-[88px] sm:text-[54px]',
  lg: 'h-[124px] w-[88px] rounded-[14px] text-[54px] sm:h-[150px] sm:w-[106px] sm:text-[66px]',
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
      {!hidden && size !== 'sm' && value !== undefined && <span className={`absolute bottom-1.5 right-2 h-1.5 w-1.5 rounded-full ${value % 2 ? 'bg-[#ff8a5c]' : 'bg-[#5cc8ff]'}`} title={value % 2 ? 'odd' : 'even'} />}
    </div>
  );
}

/** A full card laid open: front and back side by side, the chosen face lifted in the accent. */
export function TwoFaceCard({ card, showBack, chosen, size = 'md', revealKey, dimUnchosen = false }: {
  card: TspCard; showBack: boolean; chosen?: TspFace | null; size?: Size; revealKey?: string; dimUnchosen?: boolean;
}) {
  const on = (kind: 'front' | 'back') => !!chosen && (chosen === 'both' || chosen === kind);
  return (
    <div className="flex items-center">
      <FaceTile kind="front" value={card.front} size={size} active={on('front')} dim={dimUnchosen && !!chosen && !on('front')} />
      <span className="mx-1 h-[60%] w-[3px] rounded-full bg-white/10 sm:mx-1.5" />
      <motion.div key={revealKey} initial={revealKey ? { rotateY: 90 } : false} animate={{ rotateY: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }}>
        <FaceTile kind="back" value={card.back} hidden={!showBack} size={size} active={on('back')} dim={dimUnchosen && !!chosen && !on('back')} />
      </motion.div>
    </div>
  );
}

export function VisibilityTag({ mine, label }: { mine: boolean; label: string }) {
  return <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-black/40 px-1.5 py-0.5 text-[9px] font-bold text-white/50">{mine ? <Eye size={10} /> : <Lock size={10} />}{label}</span>;
}

export function ChipCount({ count, tone }: { count: number; tone: 'me' | 'ai' }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="relative h-5 w-5">{[0, 1, 2].map((i) => <i key={i} className={`absolute left-0 h-1.5 w-5 rounded-full border border-black/40 ${tone === 'me' ? 'bg-(--accent)' : 'bg-[#ff8a5c]'}`} style={{ bottom: i * 3.5 }} />)}</span>
      <b className="font-mono text-base font-black text-white sm:text-lg">{count}</b>
    </span>
  );
}

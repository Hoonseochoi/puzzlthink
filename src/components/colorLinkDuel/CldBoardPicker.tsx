"use client";

import { Shuffle } from 'lucide-react';
import { CLD_LAYOUTS, type CldLayout, type CldTier, layoutById, layoutCells, layoutSpan } from '@/lib/colorLinkDuelBoards';
import type { CldCopy } from './copy';

export const TIER_COLOR: Record<CldTier, string> = { easy: '#3ddc97', normal: '#ffc94d', hard: '#ff6b5a' };

/** A board's shape, small: cream cells, dark gaps. */
export function LayoutThumb({ layout, className = '' }: { layout: CldLayout; className?: string }) {
  const n = layoutSpan(layout);
  return (
    <svg viewBox={`-0.3 -0.3 ${n + 0.6} ${n + 0.6}`} className={`block aspect-square w-full ${className}`} aria-hidden>
      <rect x={-0.3} y={-0.3} width={n + 0.6} height={n + 0.6} rx={0.8} fill="#2a2470" />
      {layout.rows.flatMap((row, r) => [...row].map((ch, c) => (ch === '#' ? <rect key={`${r}-${c}`} x={c + 0.06} y={r + 0.06} width={0.88} height={0.88} rx={0.12} fill="#f7f2e8" /> : null)))}
    </svg>
  );
}

export function TierBadge({ tier, t }: { tier: CldTier; t: CldCopy }) {
  return <span className="shrink-0 rounded-full px-1.5 py-[1px] text-[9px] font-black text-black" style={{ background: TIER_COLOR[tier] }}>{t.tierName[tier]}</span>;
}

/** The board being played, as a small chip (name and difficulty). */
export function BoardChip({ id, t, en }: { id: string; t: CldCopy; en: boolean }) {
  const l = layoutById(id);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[.05] py-0.5 pl-0.5 pr-2 text-[11px] font-black text-white/80">
      <span className="w-5"><LayoutThumb layout={l} /></span>{en ? l.en : l.ko}<TierBadge tier={l.tier} t={t} />
    </span>
  );
}

/**
 * Board choice for a room: 랜덤 or any board, easiest first. Only the host can change it (`onPick`); the others see
 * the host's pick.
 */
export default function CldBoardPicker({ pick, onPick, t, en }: { pick: string; onPick?: (id: string) => void; t: CldCopy; en: boolean }) {
  const order: CldTier[] = ['easy', 'normal', 'hard'];
  const layouts = [...CLD_LAYOUTS].sort((a, b) => order.indexOf(a.tier) - order.indexOf(b.tier));
  const tile = (on: boolean) => `relative flex min-w-0 flex-col items-stretch gap-1 rounded-[10px] border p-1.5 text-left transition ${on ? 'border-(--accent) bg-(--accent)/15 shadow-[0_0_0_1px_var(--accent)]' : 'border-white/10 bg-white/[.03]'} ${onPick ? 'hover:border-white/30' : 'cursor-default'}`;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[11px] font-black tracking-[0.14em] text-white/50">{t.boardTitle}</p>
        {!onPick && <p className="text-[10px] font-bold text-white/35">{t.boardHostOnly}</p>}
      </div>
      <ul className="mt-2 grid grid-cols-3 gap-1.5 min-[460px]:grid-cols-4 sm:grid-cols-5">
        <li>
          <button type="button" disabled={!onPick} onClick={() => onPick?.('random')} aria-pressed={pick === 'random'} className={`${tile(pick === 'random')} h-full`}>
            <span className="flex aspect-square w-full items-center justify-center rounded-[6px] bg-gradient-to-br from-[#2a2470] to-[#4b3fb0] text-white"><Shuffle size={20} /></span>
            <span className="truncate text-[11px] font-black text-white">{t.boardRandom}</span>
            <span className="truncate text-[9.5px] font-bold text-white/45">{t.boardRandomDesc}</span>
          </button>
        </li>
        {layouts.map((l) => (
          <li key={l.id}>
            <button type="button" disabled={!onPick} onClick={() => onPick?.(l.id)} aria-pressed={pick === l.id} className={tile(pick === l.id)}>
              <LayoutThumb layout={l} />
              <span className="flex min-w-0 items-center justify-between gap-1"><span className="truncate text-[11px] font-black text-white">{en ? l.en : l.ko}</span><TierBadge tier={l.tier} t={t} /></span>
              <span className="truncate text-[9.5px] font-bold text-white/45">{t.boardCells(layoutSpan(l), layoutCells(l))}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

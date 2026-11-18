"use client";

import { type GyulCard } from '@/lib/gyulhap';

const INK = ['#21a5ff', '#ff4d5e', '#ffd449'];
const BG = ['#f4efe4', '#777b83', '#111318'];

export function GyulCardView({ card, index, selected = false, onClick, disabled = false, small = false }: {
  card: GyulCard; index?: number; selected?: boolean; onClick?: () => void; disabled?: boolean; small?: boolean;
}) {
  const shape = card.shape === 0
    ? <span className="block h-[48%] w-[48%] rounded-full" style={{ background: INK[card.color] }} />
    : card.shape === 1
      ? <span className="block h-[52%] w-[56%]" style={{ background: INK[card.color], clipPath: 'polygon(50% 0,100% 100%,0 100%)' }} />
      : <span className="block h-[46%] w-[46%] rounded-[8%]" style={{ background: INK[card.color] }} />;
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag type={onClick ? 'button' : undefined} onClick={onClick} disabled={disabled}
      className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-[14px] border shadow-[0_8px_24px_rgba(0,0,0,.28)] transition ${small ? 'w-16' : 'w-full'} ${selected ? 'scale-[.97] border-(--accent) ring-4 ring-(--accent)/30' : 'border-white/15'} ${onClick && !disabled ? 'hover:-translate-y-0.5 hover:border-white/40 active:scale-95' : ''} disabled:cursor-default`}
      style={{ background: BG[card.background] }}>
      {shape}
      {index !== undefined && <span className={`absolute left-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 font-mono text-[10px] font-black ${card.background === 0 ? 'bg-black/75 text-white' : 'bg-white/85 text-black'}`}>{index + 1}</span>}
      {selected && <span className="absolute bottom-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-(--accent) text-[10px] font-black text-(--accent-ink)">✓</span>}
    </Tag>
  );
}

export function GyulBoard({ cards, selected, onSelect, disabled }: { cards: GyulCard[]; selected: number[]; onSelect?: (index: number) => void; disabled?: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-2 rounded-[18px] border border-white/10 bg-black/35 p-2.5 sm:gap-3 sm:p-4">
      {cards.map((card, index) => <GyulCardView key={card.id} card={card} index={index} selected={selected.includes(index)} disabled={disabled} onClick={onSelect ? () => onSelect(index) : undefined} />)}
    </div>
  );
}

export function GyulScore({ names, scores, active }: { names: string[]; scores: number[]; active?: number }) {
  return (
    <div className={`grid gap-2 rounded-[14px] border border-white/10 bg-white/[.04] p-2.5 ${names.length === 1 ? 'grid-cols-1' : names.length >= 3 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'}`}>
      {names.map((name, seat) => (
        <div key={`${name}-${seat}`} className={`rounded-[9px] border px-2.5 py-2 text-center transition ${active === seat ? 'border-(--accent)/60 bg-(--accent)/10 text-white' : 'border-white/5 bg-black/20 text-white/45'}`}>
          <p className="truncate text-[10px] font-black">{name}</p>
          <p className="font-mono text-xl font-black text-(--accent)">{scores[seat] ?? 0}</p>
        </div>
      ))}
    </div>
  );
}

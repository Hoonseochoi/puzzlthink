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

/** A card drawn tiny (no number, no border glow), for the found-합 list. */
function GyulMini({ card }: { card: GyulCard }) {
  const ink = INK[card.color];
  return (
    <span className="relative flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-[4px] ring-1 ring-white/15" style={{ background: BG[card.background] }}>
      {card.shape === 0 ? <span className="block h-[52%] w-[52%] rounded-full" style={{ background: ink }} />
        : card.shape === 1 ? <span className="block h-[56%] w-[60%]" style={{ background: ink, clipPath: 'polygon(50% 0,100% 100%,0 100%)' }} />
          : <span className="block h-[50%] w-[50%] rounded-[1px]" style={{ background: ink }} />}
    </span>
  );
}

/**
 * The 합 already called on this board, newest first: the three card numbers and the cards themselves, small.
 * `found` holds hapKey strings ("0-3-7": board indexes).
 */
export function GyulFound({ cards, found, title, empty, className = '' }: { cards: GyulCard[]; found: readonly string[]; title: string; empty: string; className?: string }) {
  const haps = [...found].reverse().map((key) => ({ key, idx: key.split('-').map(Number) })).filter(({ idx }) => idx.length === 3 && idx.every((i) => cards[i]));
  return (
    <section className={`rounded-[14px] border border-white/10 bg-white/[.04] p-2.5 ${className}`} aria-live="polite">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-black tracking-[.16em] text-white/45">{title}</p>
        <span className="rounded-full bg-(--accent)/15 px-2 py-0.5 font-mono text-[11px] font-black text-(--accent)">{haps.length}</span>
      </div>
      {haps.length ? (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {haps.map(({ key, idx }) => (
            <li key={key} className="flex items-center gap-1 rounded-md border border-white/10 bg-black/25 py-1 pl-1.5 pr-1">
              <span className="mr-0.5 font-mono text-[10px] font-black text-white/55">{idx.map((i) => i + 1).join('·')}</span>
              {idx.map((i) => <GyulMini key={i} card={cards[i]} />)}
            </li>
          ))}
        </ul>
      ) : <p className="mt-1.5 text-[11px] text-white/35">{empty}</p>}
    </section>
  );
}

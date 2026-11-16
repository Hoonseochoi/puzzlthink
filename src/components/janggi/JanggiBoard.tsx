"use client";

import { CELLS, COLS, type HandType, type JanggiState, type Side, cellName, inCamp } from '@/lib/janggi';
import JanggiPiece from './JanggiPiece';
import { SIDE_COLORS, SIDE_SOFT } from './theme';

export type Selection = { kind: 'cell'; index: number } | { kind: 'hand'; type: HandType } | null;

/** The 3×4 board, drawn so that `viewer` sits at the bottom. */
export default function JanggiBoard({ game, viewer, selection, targets, onCell, campLabel }: {
  game: JanggiState;
  viewer: Side;
  selection: Selection;
  targets: number[];
  onCell: (index: number) => void;
  campLabel: string;
}) {
  const order = Array.from({ length: CELLS }, (_, i) => (viewer === 0 ? i : CELLS - 1 - i));
  const last = game.last;
  const lastCells = last ? (last.kind === 'move' ? [last.from, last.to] : [last.to]) : [];

  return (
    <div className="relative mx-auto w-full max-w-[440px] rounded-[26px] bg-gradient-to-br from-[#e8c170]/50 via-white/10 to-[#e8c170]/40 p-[1.5px] shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
      <div className="rounded-[24px] bg-[#0f1116] p-3 sm:p-4">
        <div className="grid gap-2 sm:gap-2.5" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
          {order.map((i, position) => {
            const piece = game.board[i];
            const camp: Side | null = inCamp(i, 0) ? 0 : inCamp(i, 1) ? 1 : null;
            const selected = selection?.kind === 'cell' && selection.index === i;
            const target = targets.includes(i);
            const capture = target && !!piece;
            const wasLast = lastCells.includes(i);
            return (
              <button
                key={i} type="button" onClick={() => onCell(i)} aria-label={`${cellName(i)}${piece ? '' : ''}`}
                className={`group relative aspect-square rounded-[16px] border transition ${selected ? 'border-[#e8c170] shadow-[0_0_0_2px_rgba(232,193,112,.5),0_0_24px_rgba(232,193,112,.35)]' : wasLast ? 'border-[#e8c170]/40' : 'border-white/[0.06]'} ${target ? 'cursor-pointer' : ''}`}
                style={{ background: camp !== null ? SIDE_SOFT[camp] : 'rgba(255,255,255,0.025)' }}
              >
                {camp !== null && position % COLS === 0 && !piece && (
                  <span className="pointer-events-none absolute left-2 top-1.5 text-[8px] font-black tracking-[0.2em]" style={{ color: SIDE_COLORS[camp], opacity: 0.55 }}>{campLabel}</span>
                )}
                {piece && <JanggiPiece type={piece.type} owner={piece.owner} flipped={piece.owner !== viewer} className={`absolute inset-[7%] h-[86%] w-[86%] transition ${selected ? '-translate-y-1 scale-[1.04]' : ''}`} />}
                {target && !capture && <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e8c170] shadow-[0_0_16px_rgba(232,193,112,.8)]" />}
                {capture && <span className="pointer-events-none absolute inset-1 rounded-[14px] border-2 border-[#ff5b3a] shadow-[0_0_18px_rgba(255,91,58,.7)]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Captured pieces waiting to be dropped. */
export function JanggiHand({ side, types, viewer, label, emptyLabel, selectable, selectedType, onSelect }: {
  side: Side; types: HandType[]; viewer: Side; label: string; emptyLabel: string;
  selectable: boolean; selectedType: HandType | null; onSelect: (type: HandType) => void;
}) {
  const counts = types.reduce<Record<string, number>>((acc, type) => ({ ...acc, [type]: (acc[type] ?? 0) + 1 }), {});
  return (
    <div className="mx-auto flex min-h-[64px] w-full max-w-[440px] items-center gap-3 rounded-[16px] border border-white/[0.07] bg-white/[0.025] px-3 py-2">
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: SIDE_COLORS[side], boxShadow: `0 0 10px ${SIDE_COLORS[side]}` }} />
      <span className="shrink-0 text-[10px] font-black tracking-[0.16em] text-white/40">{label}</span>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {Object.keys(counts).length === 0 && <span className="text-[11px] text-white/25">{emptyLabel}</span>}
        {(Object.entries(counts) as [HandType, number][]).map(([type, count]) => (
          <button
            key={type} type="button" disabled={!selectable} onClick={() => onSelect(type)}
            className={`relative h-12 w-12 rounded-[12px] transition ${selectable ? 'cursor-pointer hover:-translate-y-0.5' : 'cursor-default'} ${selectedType === type ? '-translate-y-1 shadow-[0_0_0_2px_#e8c170,0_0_18px_rgba(232,193,112,.5)]' : ''}`}
          >
            <JanggiPiece type={type} owner={side} flipped={side !== viewer} showReading={false} className="h-full w-full" />
            {count > 1 && <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e8c170] px-1 text-[10px] font-black text-[#1a1408]">{count}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

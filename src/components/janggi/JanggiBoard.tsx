"use client";

import { CELLS, COLS, ROWS, type HandType, type JanggiState, type Side, cellName, inCamp } from '@/lib/janggi';
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
  // Once the game is decided: the piece that took the 王 (or the 王 that held the enemy camp) is ringed in the
  // winner's colour, the 王 it took is shown fading on that square, and the deciding move gets an arrow.
  const winner = game.winner;
  const deciding = winner !== null && (game.reason === 'capture' || game.reason === 'entry') && last ? last.to : -1;
  const kingHeld = winner !== null && game.reason === 'entry' ? game.board.findIndex((p) => p?.type === 'wang' && p.owner === winner) : -1;
  const ringAt = game.reason === 'entry' ? kingHeld : deciding;
  const loser: Side = winner === 0 ? 1 : 0;
  const posOf = (i: number) => (viewer === 0 ? i : CELLS - 1 - i);
  const arrow = winner !== null && game.reason === 'capture' && last?.kind === 'move' ? { from: posOf(last.from), to: posOf(last.to) } : null;

  return (
    <div className="relative mx-auto w-full max-w-[440px] rounded-[8px] bg-gradient-to-br from-[#8d95a8] via-[#24252d] to-[#8d95a8] p-[2px] shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
      {['-left-1.5 -top-1.5', '-right-1.5 -top-1.5', '-bottom-1.5 -left-1.5', '-bottom-1.5 -right-1.5'].map((corner) => <span key={corner} aria-hidden className={`absolute z-30 h-3 w-3 rotate-45 border border-[#b9c1d3] bg-[#0b0b0e] ${corner}`} />)}
      <div className="rounded-[6px] bg-[#0e0e12] p-3 sm:p-4">
        <div className="relative grid gap-2 sm:gap-2.5" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
          {arrow && (
            <svg viewBox={`0 0 ${COLS} ${ROWS}`} preserveAspectRatio="none" className="end-reveal-stroke pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
              <line x1={(arrow.from % COLS) + 0.5} y1={Math.floor(arrow.from / COLS) + 0.5} x2={(arrow.to % COLS) + 0.5} y2={Math.floor(arrow.to / COLS) + 0.5}
                stroke={SIDE_COLORS[winner!]} strokeWidth="6" strokeLinecap="round" vectorEffect="non-scaling-stroke" pathLength={100} strokeOpacity=".85" />
            </svg>
          )}
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
                className={`group relative aspect-square rounded-[6px] border transition ${selected ? 'border-[#e8c170] shadow-[0_0_0_2px_rgba(232,193,112,.5),0_0_24px_rgba(232,193,112,.35)]' : wasLast ? 'border-[#e8c170]/40' : 'border-[#2a2c35]'} ${target ? 'cursor-pointer' : ''}`}
                style={{ background: camp !== null ? SIDE_SOFT[camp] : 'rgba(255,255,255,0.025)' }}
              >
                {camp !== null && position % COLS === 0 && !piece && (
                  <span className="pointer-events-none absolute left-2 top-1.5 text-[8px] font-black tracking-[0.2em]" style={{ color: SIDE_COLORS[camp], opacity: 0.55 }}>{campLabel}</span>
                )}
                {piece && <JanggiPiece type={piece.type} owner={piece.owner} flipped={piece.owner !== viewer} className={`absolute inset-[7%] h-[86%] w-[86%] transition ${selected ? '-translate-y-1 scale-[1.04]' : ''}`} />}
                {target && !capture && <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 border-[#0b0b0e] bg-[#e8c170] shadow-[0_0_14px_rgba(232,193,112,.8)] sm:h-5 sm:w-5" />}
                {capture && <span className="pointer-events-none absolute inset-1 rounded-[5px] border-2 border-[#ff5b3a] shadow-[0_0_18px_rgba(255,91,58,.7)]" />}
                {i === ringAt && winner !== null && <span className="end-reveal-pulse pointer-events-none absolute inset-0 z-10 rounded-[6px]" style={{ ['--reveal' as string]: SIDE_COLORS[winner] }} />}
                {i === deciding && game.reason === 'capture' && (
                  <span className="end-reveal-taken pointer-events-none absolute -right-1.5 -top-1.5 z-20 h-[46%] w-[46%]" aria-hidden>
                    <JanggiPiece type="wang" owner={loser} flipped={loser !== viewer} showReading={false} className="h-full w-full" />
                    <svg viewBox="0 0 10 10" className="absolute inset-0 h-full w-full"><path d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" /><path d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5" stroke={SIDE_COLORS[winner!]} strokeWidth=".8" strokeLinecap="round" /></svg>
                  </span>
                )}
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
    <div className="mx-auto flex min-h-[64px] w-full max-w-[440px] items-center gap-3 rounded-[10px] border border-white/10 bg-black/40 px-3 py-2">
      <span className="h-2 w-2 shrink-0 rotate-45" style={{ background: SIDE_COLORS[side], boxShadow: `0 0 10px ${SIDE_COLORS[side]}` }} />
      <span className="shrink-0 text-[10px] font-black tracking-[0.16em] text-white/40">{label}</span>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {Object.keys(counts).length === 0 && <span className="text-[11px] text-white/25">{emptyLabel}</span>}
        {(Object.entries(counts) as [HandType, number][]).map(([type, count]) => (
          <button
            key={type} type="button" disabled={!selectable} onClick={() => onSelect(type)}
            className={`relative h-12 w-12 rounded-[12px] transition ${selectable ? 'cursor-pointer hover:-translate-y-0.5' : 'cursor-default'} ${selectedType === type ? '-translate-y-1 shadow-[0_0_0_2px_#e8c170,0_0_18px_rgba(232,193,112,.5)]' : ''}`}
          >
            <JanggiPiece type={type} owner={side} flipped={side !== viewer} showReading={false} className="h-full w-full" />
            {count > 1 && <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-md bg-[#e8c170] px-1 text-[10px] font-black text-[#1a1408]">{count}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { type Action, type RJState, type Side, type Size, PER_SIZE, SIZES, moveTargets, other, targetsFor, top } from '@/lib/russianJanggi';

type Selection = { kind: 'hand'; size: Size } | { kind: 'cell'; from: number } | null;
import RJPiece, { CUP_RATIO } from './RJPiece';
import { SIDE_COLORS, SIZE_SCALE } from './theme';

/** Board plus both hands. `viewer` sits at the bottom; pick a cup (from your hand or the board), then a cell. */
export default function RJTable({ game, viewer, canAct, onAction, names }: {
  game: RJState; viewer: Side; canAct: boolean; onAction: (action: Action) => void; names: [string, string];
}) {
  const t = useTranslations('RussianJanggi');
  // Either a size from my hand, or one of my cups on the board picked up to move.
  const [picked, setPicked] = useState<{ sel: Selection; ply: number } | null>(null);
  // A pick belongs to one position; it clears itself when the game moves on.
  const raw = canAct && picked?.ply === game.ply ? picked.sel : null;
  const sel: Selection = raw?.kind === 'hand' ? (game.hands[viewer][raw.size] > 0 ? raw : null)
    : raw?.kind === 'cell' ? (top(game, raw.from)?.owner === viewer ? raw : null) : null;
  const size: Size | null = sel?.kind === 'hand' ? sel.size : sel?.kind === 'cell' ? top(game, sel.from)!.size : null;
  const targets = useMemo(() => (!sel ? [] : sel.kind === 'hand' ? targetsFor(game, viewer, sel.size) : moveTargets(game, viewer, sel.from)), [game, viewer, sel]);
  const choose = (next: Selection) => setPicked(next ? { sel: next, ply: game.ply } : null);

  const onCell = (cell: number) => {
    if (!canAct) return;
    if (sel && targets.includes(cell)) {
      onAction(sel.kind === 'hand' ? { kind: 'place', size: sel.size, to: cell } : { kind: 'move', from: sel.from, to: cell });
      choose(null);
      return;
    }
    // Tapping one of my cups picks it up to move (tap again to put it back).
    if (top(game, cell)?.owner === viewer && moveTargets(game, viewer, cell).length) {
      choose(sel?.kind === 'cell' && sel.from === cell ? null : { kind: 'cell', from: cell });
      return;
    }
    // Tapping a free cell first picks the smallest cup from my hand that fits there.
    const fit = SIZES.find((z) => targetsFor(game, viewer, z).includes(cell));
    choose(!sel && fit !== undefined ? { kind: 'hand', size: fit } : null);
  };

  return (
    <div className="space-y-3">
      <Hand side={other(viewer)} game={game} label={names[other(viewer)]} selectable={false} selected={null} onPick={() => {}} active={game.turn === other(viewer)} />
      <div className="relative mx-auto w-full max-w-[440px] rounded-[26px] bg-gradient-to-br from-[#f2b84b]/50 via-white/10 to-[#f2b84b]/40 p-[1.5px] shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
        <div className="rounded-[24px] bg-[linear-gradient(135deg,#2a1d14,#1a120c)] p-3 sm:p-4">
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            {Array.from({ length: 9 }, (_, i) => (viewer === 0 ? i : 8 - i)).map((cell) => {
              const stack = game.board[cell];
              const piece = top(game, cell);
              const target = targets.includes(cell);
              const winning = game.line?.includes(cell);
              const wasLast = game.last?.to === cell || game.last?.from === cell;
              const lifted = sel?.kind === 'cell' && sel.from === cell;
              return (
                <button
                  key={cell} type="button" onClick={() => onCell(cell)} aria-label={`cell ${cell + 1}`}
                  className={`relative aspect-square overflow-hidden rounded-[16px] border transition ${winning ? 'border-[#f2b84b] shadow-[0_0_0_2px_rgba(242,184,75,.55),0_0_30px_rgba(242,184,75,.45)]' : wasLast ? 'border-[#f2b84b]/45' : 'border-black/40'} ${target || piece?.owner === viewer ? 'cursor-pointer' : ''} ${lifted ? 'ring-2 ring-[#f2b84b]/70' : ''}`}
                  style={{ background: 'repeating-linear-gradient(92deg, #6b4a2f 0px, #6b4a2f 7px, #5f4129 7px, #5f4129 11px, #73502f 11px, #73502f 19px)', boxShadow: 'inset 0 6px 14px rgba(0,0,0,.55)' }}
                >
                  <span className="pointer-events-none absolute inset-0 bg-black/25" />
                  {/* The whole stack, standing on its rims: each bigger cup sits over the smaller ones. */}
                  {stack.map((cup, k) => {
                    const isTop = k === stack.length - 1;
                    // Only the cup that just landed drops in; a cup revealed by a lift stays still.
                    const landed = isTop && game.last?.to === cell;
                    return (
                      <RJPiece
                        key={`${cell}-${k}-${cup.owner}${cup.size}`} owner={cup.owner} size={cup.size}
                        className={`pointer-events-none absolute inset-x-0 bottom-[9%] mx-auto transition-transform duration-200 ${landed ? 'animate-[rjDrop_.42s_cubic-bezier(.3,.7,.4,1)]' : ''} ${isTop && lifted ? '-translate-y-[22%] opacity-80' : ''}`}
                        style={{ width: `${SIZE_SCALE[cup.size] * 100}%`, aspectRatio: `${CUP_RATIO}` }}
                      />
                    );
                  })}
                  {stack.length > 1 && <span className="absolute right-1.5 top-1.5 rounded-full bg-black/60 px-1.5 text-[9px] font-black text-white/70">×{stack.length}</span>}
                  {target && size !== null && (
                    <RJPiece
                      ghost owner={viewer} size={size}
                      className={`pointer-events-none absolute inset-x-0 bottom-[9%] mx-auto ${piece ? 'opacity-95' : 'animate-pulse'}`}
                      style={{ width: `${SIZE_SCALE[size] * 100}%`, aspectRatio: `${CUP_RATIO}` }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <Hand side={viewer} game={game} label={names[viewer]} selectable={canAct} selected={sel?.kind === 'hand' ? sel.size : null} onPick={(z) => choose(sel?.kind === 'hand' && sel.size === z ? null : { kind: 'hand', size: z })} active={game.turn === viewer} />
      {canAct && <p className="text-center text-[11px] text-white/40">{!sel ? t('hintPick') : sel.kind === 'cell' ? t('hintMove') : t('hintPlace')}</p>}
    </div>
  );
}

function Hand({ side, game, label, selectable, selected, onPick, active }: {
  side: Side; game: RJState; label: string; selectable: boolean; selected: Size | null; onPick: (size: Size) => void; active: boolean;
}) {
  return (
    <div className={`mx-auto flex w-full max-w-[440px] items-center gap-3 rounded-[16px] border px-3 py-2 transition ${active ? 'border-white/20 bg-white/[0.05]' : 'border-white/[0.07] bg-white/[0.02]'}`}>
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: SIDE_COLORS[side], boxShadow: `0 0 10px ${SIDE_COLORS[side]}` }} />
      <span className="w-14 shrink-0 truncate text-[11px] font-black text-white/60">{label}</span>
      <div className="grid flex-1 grid-cols-3 gap-2">
        {SIZES.map((size) => {
          const left = game.hands[side][size];
          const isSel = selected === size;
          return (
            <button
              key={size} type="button" disabled={!selectable || left === 0} onClick={() => onPick(size)}
              className={`relative flex h-14 items-center justify-center gap-1 rounded-[12px] transition ${isSel ? 'bg-[#f2b84b]/15 shadow-[0_0_0_2px_#f2b84b,0_0_18px_rgba(242,184,75,.45)]' : 'bg-black/25'} ${selectable && left ? 'cursor-pointer hover:-translate-y-0.5 hover:bg-white/[0.06]' : 'cursor-default'}`}
            >
              {Array.from({ length: PER_SIZE }, (_, k) => (
                <span key={k} className="flex h-11 w-[44%] items-end justify-center pb-0.5">
                  <RJPiece owner={side} size={size} className={`transition ${k < left ? '' : 'opacity-[0.12] grayscale'}`} style={{ width: `${52 + size * 24}%`, aspectRatio: `${CUP_RATIO}` }} />
                </span>
              ))}
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useLocale } from 'next-intl';
import { FlipVertical2, X } from 'lucide-react';
import { type Block, type Move, type Stacks, blockText, towerText, towerValue } from '@/lib/equationTower';
import { EQT_ACCENT, type EqtCopy, eqtCopy } from './copy';

/** Blocks lifted off a stack: the top `count` of `from`, upside down if `flip`. */
export type Held = { from: number; count: number; flip: boolean };

export function BlockChip({ block, held = false, win = false, small = false, tile = false }: { block: Block; held?: boolean; win?: boolean; small?: boolean; tile?: boolean }) {
  const plain = block.op === '';
  return (
    <span
      className={`flex w-full items-center justify-center font-mono font-black leading-none transition ${tile ? 'h-10 rounded-lg text-lg sm:h-6 sm:rounded-md sm:text-[11px]' : small ? 'h-5 rounded-[4px] text-[10px]' : 'h-10 rounded-lg text-lg sm:h-11 sm:text-xl'} ${plain ? 'text-[#200d03]' : 'text-white'} ${held ? '-translate-y-1 ring-[3px] ring-white brightness-125' : ''} ${win ? 'ring-2 ring-[#7ee2ae]' : ''}`}
      style={{
        background: plain ? `linear-gradient(180deg, #ffb58a, ${EQT_ACCENT})` : 'linear-gradient(180deg, #3b3f52, #272a39)',
        boxShadow: small || tile ? undefined : `inset 0 -4px 0 rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.22)${held ? ', 0 10px 22px rgba(0,0,0,.5)' : ''}`,
      }}
    >
      {blockText(block)}
    </span>
  );
}

/** What a stack reads as: its formula and value when it is a tower. */
function StackValue({ stack, blocks, c }: { stack: number[]; blocks: Block[]; c: EqtCopy }) {
  const v = towerValue(stack, blocks);
  if (!stack.length) return <span className="text-white/25">{c.emptyStack}</span>;
  if (!v) return <span className="text-white/30">{c.notTower}</span>;
  const whole = v[0] % v[1] === 0;
  return <><span className="text-white/45">{towerText(stack, blocks)} = </span><b className="text-white">{whole ? v[0] / v[1] : `${v[0]}/${v[1]}`}</b></>;
}

/**
 * The stacks, side by side. Tap a block to lift it with everything above it; then tap a stack to set the bundle
 * down (the same stack only when flipped). `held` null and no `onPick` makes it a picture.
 */
export function TowerStacks({ blocks, stacks, c, held = null, onPick, onDrop, onFlip, onCancel, winStack = -1, small = false }: {
  blocks: Block[]; stacks: Stacks; c: EqtCopy; held?: Held | null; onPick?: (stack: number, count: number) => void;
  onDrop?: (stack: number) => void; onFlip?: () => void; onCancel?: () => void; winStack?: number; small?: boolean;
}) {
  const live = !!onPick;
  return (
    <div>
      <div className={`grid ${small ? 'gap-1.5' : 'gap-1.5 sm:gap-3'}`} style={{ gridTemplateColumns: `repeat(${stacks.length}, minmax(0, 1fr))` }}>
        {stacks.map((stack, s) => {
          const mine = held?.from === s;
          const canDrop = !!held && (!mine || (held.flip && held.count >= 2));
          return (
            <div key={s} className="flex flex-col">
              <div className={`flex flex-1 flex-col justify-end gap-1 rounded-[12px] border px-1.5 pb-1.5 pt-2 transition ${small ? 'min-h-[92px]' : 'min-h-[230px] sm:min-h-[300px] sm:px-3'} ${winStack === s ? 'border-[#7ee2ae]/70 bg-[#2fbf71]/10' : canDrop ? 'border-(--accent)/60 bg-(--accent)/[0.06]' : 'border-white/10 bg-black/35'}`}>
                {[...stack].reverse().map((id, fromTop) => {
                  const count = fromTop + 1;
                  const isHeld = mine && count <= held!.count;
                  return live && !held ? (
                    <button key={id} type="button" onClick={() => onPick?.(s, count)} aria-label={`${blockText(blocks[id])} (${count})`} className="rounded-lg transition hover:brightness-125 active:scale-[0.97]">
                      <BlockChip block={blocks[id]} small={small} />
                    </button>
                  ) : <BlockChip key={id} block={blocks[id]} held={isHeld} win={winStack === s} small={small} />;
                })}
              </div>
              {!small && <p className="mt-1.5 min-h-4 truncate text-center font-mono text-[10px] sm:text-[11px]"><StackValue stack={stack} blocks={blocks} c={c} /></p>}
              {live && held && (
                <button type="button" disabled={!canDrop} onClick={() => onDrop?.(s)} className={`mt-1.5 whitespace-nowrap rounded-md py-2 text-[10px] font-black transition sm:text-[11px] ${canDrop ? 'bg-(--accent) text-(--accent-ink) hover:brightness-110 active:scale-95' : 'border border-dashed border-white/15 text-white/25'}`}>
                  {mine ? c.flipHere : c.dropHere}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {live && (
        <div className="mt-3 flex min-h-11 items-center gap-2">
          {held ? (
            <>
              <p className="min-w-0 flex-1 break-keep text-xs font-bold text-white/65">{c.dropHint(held.count)}</p>
              <button type="button" onClick={onFlip} disabled={held.count < 2} aria-pressed={held.flip} className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2.5 text-xs font-black transition disabled:opacity-30 ${held.flip ? 'bg-white text-black' : 'border border-white/20 bg-white/5 text-white/85 hover:bg-white/10'}`}><FlipVertical2 size={15} />{held.flip ? c.flipOn : c.flip}</button>
              <button type="button" onClick={onCancel} aria-label={c.cancel} className="flex shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/5 p-2.5 text-white/70 hover:bg-white/10"><X size={15} /></button>
            </>
          ) : <p className="w-full break-keep text-center text-xs text-white/40">{c.pickHint}</p>}
        </div>
      )}
    </div>
  );
}

/** The move the player has put together, once a place to set it down is chosen. */
export const moveOf = (held: Held, to: number): Move => ({ from: held.from, count: held.count, flip: held.flip, to });

/** The round's ask: target number and height. */
export function TargetCard({ target, floors, c }: { target: number; floors: number; c: EqtCopy }) {
  return (
    <div className="flex shrink-0 items-stretch overflow-hidden rounded-[12px] border border-(--accent)/50 bg-black/50 text-center shadow-[0_0_22px_var(--accent-glow)]">
      <div className="px-3 py-1.5 sm:px-4"><p className="text-[9px] font-black tracking-[0.16em] text-white/45">{c.target}</p><p className="font-mono text-2xl font-black text-(--accent) sm:text-3xl">{target}</p></div>
      <div className="border-l border-white/10 px-3 py-1.5 sm:px-4"><p className="text-[9px] font-black tracking-[0.16em] text-white/45">{c.floorsLabel}</p><p className="font-mono text-2xl font-black sm:text-3xl">{floors}</p></div>
    </div>
  );
}

const DEMO_BLOCKS: Block[] = [{ n: 5, op: '' }, { n: 2, op: '*' }, { n: 3, op: '+' }, { n: 8, op: '' }, { n: 4, op: '-' }, { n: 2, op: '/' }, { n: 6, op: '' }, { n: 7, op: '+' }, { n: 1, op: '-' }];
const DEMO_STACKS: Stacks = [[2, 1, 0], [5, 4, 3], [7, 6], [8]];

/** Entry-screen and home-tile art: four stacks, the left one a tower worth 13. */
export function TowerPreview({ compact = false }: { compact?: boolean }) {
  const c = eqtCopy(useLocale());
  return (
    <div className={`mx-auto w-full ${compact ? 'max-w-[190px]' : 'max-w-[280px] rounded-[18px] border border-white/10 bg-[radial-gradient(ellipse_at_50%_30%,rgba(240,140,90,0.18),rgba(12,9,8,0.9)_70%)] p-4'}`}>
      <TowerStacks blocks={DEMO_BLOCKS} stacks={DEMO_STACKS} c={c} winStack={0} small />
      {!compact && <p className="mt-2 text-center font-mono text-[11px] font-black text-(--accent)">5×2+3 = 13</p>}
    </div>
  );
}

/** Home-card picture. */
export function TowerTile() {
  return (
    <div className="relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-xl border-[3px] border-[#17201e] bg-[radial-gradient(ellipse_at_50%_30%,#5a3322,#170d09_72%)] px-4 pt-6 shadow-xl sm:w-[62%] sm:rounded-2xl sm:border-4 sm:px-2.5 sm:pt-4 sm:shadow-2xl">
      <div className="grid w-full grid-cols-4 items-end gap-1.5 sm:gap-1">
        {DEMO_STACKS.map((stack, s) => (
          <div key={s} className={`flex flex-col gap-1 rounded-lg p-1 sm:gap-[3px] sm:rounded-md sm:p-[3px] ${s === 0 ? 'bg-[#2fbf71]/20 ring-1 ring-[#7ee2ae]' : ''}`}>{[...stack].reverse().map((id) => <BlockChip key={id} block={DEMO_BLOCKS[id]} tile />)}</div>
        ))}
      </div>
      <span className="absolute left-2 top-2 rounded-full bg-[#f08c5a] px-2 py-0.5 font-mono text-[9px] font-black tracking-wider text-[#200d03] sm:left-3 sm:top-3">= 13</span>
    </div>
  );
}

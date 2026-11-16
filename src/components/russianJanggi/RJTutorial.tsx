"use client";

import { useTranslations } from 'next-intl';
import type { Side, Size } from '@/lib/russianJanggi';
import RJPiece from './RJPiece';
import InlineSteps from '../ui/InlineSteps';

type Cell = [Side, Size] | null;
const SIZE_CLASS = ['h-5 w-5', 'h-7 w-7', 'h-9 w-9'] as const;

/** A small 3×3 board. `glow` marks cells in the accent (a winning line, a better move), `bad` in red (the move played). */
export function MiniBoard({ cells, glow = [], bad = [] }: { cells: Cell[]; glow?: number[]; bad?: number[] }) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-md border border-white/10 bg-black/40 p-1.5">
      {cells.map((cell, i) => (
        <div key={i} className={`flex h-11 w-11 items-end justify-center rounded-[6px] pb-1 ${glow.includes(i) ? 'bg-(--accent)/20 ring-2 ring-(--accent)/70' : bad.includes(i) ? 'bg-[#ff5b3a]/15 ring-2 ring-[#ff5b3a]/70' : 'bg-white/[0.04]'}`}>
          {cell && <RJPiece owner={cell[0]} size={cell[1]} className={SIZE_CLASS[cell[1]]} />}
        </div>
      ))}
    </div>
  );
}

const _ = null;
const VISUALS = [
  // 1. Three in a row wins.
  <MiniBoard key="line" cells={[[0, 1], _, [1, 0], _, [0, 2], _, [1, 1], _, [0, 0]]} glow={[0, 4, 8]} />,
  // 2. Six cups each: two of every size.
  <div key="hand" className="flex items-end gap-2">{([0, 0, 1, 1, 2, 2] as Size[]).map((size, i) => <RJPiece key={i} owner={0} size={size} className={SIZE_CLASS[size]} />)}</div>,
  // 3. Bigger covers smaller (any colour).
  <div key="cover" className="flex items-end gap-3"><RJPiece owner={1} size={0} className={SIZE_CLASS[0]} /><span className="pb-2 text-white/40">←</span><RJPiece owner={0} size={1} className={SIZE_CLASS[1]} /><span className="pb-2 text-white/30">·</span><RJPiece owner={1} size={1} className={SIZE_CLASS[1]} /><span className="pb-2 text-white/40">←</span><RJPiece owner={0} size={2} className={SIZE_CLASS[2]} /></div>,
  // 4. Place or move.
  <MiniBoard key="move" cells={[_, _, _, [0, 2], _, _, _, [1, 1], _]} glow={[4]} />,
  // 5. Lifting a cup can reveal the opponent's line.
  <MiniBoard key="reveal" cells={[[1, 0], [1, 1], [0, 2], _, [0, 0], _, _, _, _]} glow={[2]} />,
  // 6. Ten seconds per turn.
  <div key="clock" className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-(--accent)/60 font-mono text-2xl font-black text-(--accent)">10</div>,
];

/** Russian janggi tutorial laid out on the page (entry screen). Text in RussianJanggiGuide.tutorial. */
export function RJTutorialSteps() {
  const t = useTranslations('RussianJanggiGuide');
  const steps = t.raw('tutorial') as { label: string; title: string; desc: string }[];
  return <InlineSteps steps={steps.map((step, i) => ({ ...step, visual: VISUALS[i] }))} />;
}

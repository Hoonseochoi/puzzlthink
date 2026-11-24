"use client";

import { CjCardBack, CjCardFace, CjPiece } from './CjParts';

const MINI: (number | null)[][] = [
  // 5 columns × 6 rows, seat 1 (blue) at the top: [seat, king] codes as 1 small / 2 king, negative = blue
  [null, -1, -2, -1, null],
  [null, null, -1, null, null],
  [null, null, null, null, null],
  [null, null, null, null, null],
  [null, null, 1, null, null],
  [null, 1, 2, 1, null],
];

function MiniBoard({ cell }: { cell: number }) {
  return (
    <div className="grid grid-cols-5 gap-px rounded-[8px] border border-[#6d5bd0]/60 bg-[#8f82e6]/30 p-px" style={{ width: cell * 5 + 6 }}>
      {MINI.flat().map((v, i) => (
        <span key={i} className="flex items-center justify-center bg-[#3a3172]" style={{ width: cell, height: cell }}>
          {v !== null && <span style={{ width: cell * 0.72, height: cell * 0.72 }}><CjPiece seat={v < 0 ? 1 : 0} king={Math.abs(v) === 2} size="100%" /></span>}
        </span>
      ))}
    </div>
  );
}

/** Entry-screen art: the board with both armies and a fan of cards (one face down). */
export default function CjPreview() {
  return (
    <div className="relative mx-auto flex h-[250px] w-[250px] items-center justify-center gap-3 overflow-hidden rounded-[18px] border border-white/10 bg-[radial-gradient(ellipse_at_50%_30%,rgba(176,124,255,.35),rgba(18,18,23,.95)_70%)] md:w-full">
      <p className="absolute left-3 top-3 font-mono text-[9px] font-black tracking-[0.25em] text-white/40">FINAL · 1</p>
      <MiniBoard cell={24} />
      <div className="flex flex-col gap-1.5">
        <CjCardFace card={1} seat={0} size={40} />
        <CjCardFace card={3} seat={0} size={40} />
        <CjCardBack seat={0} size={40} />
      </div>
    </div>
  );
}

/** Home-card picture (laid out in the 300px preview box like the other games). */
export function CjTile() {
  return (
    <div className="relative flex aspect-square w-full items-center justify-center gap-2 overflow-hidden rounded-xl border-[3px] border-[#17201e] bg-[radial-gradient(ellipse_at_50%_30%,#5b3f9e,#1a1238_72%)] shadow-xl sm:w-[62%] sm:rounded-2xl sm:border-4 sm:shadow-2xl">
      <MiniBoard cell={20} />
      <div className="flex flex-col gap-1">
        <CjCardFace card={2} seat={0} size={34} />
        <CjCardBack seat={0} size={34} />
      </div>
    </div>
  );
}

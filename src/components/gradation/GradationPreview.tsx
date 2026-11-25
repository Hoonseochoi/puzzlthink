"use client";

import { useLocale } from 'next-intl';
import { GR_CUPS, grTier } from '@/lib/gradation';
import { GrCup } from './GradationParts';

// The row from the show's title card: 0 · 1 · 3 · 4 · 5 · 8 · 9 (sum 30).
const SHOW_ROW = [0, 1, 3, 4, 5, 8, 9];
const POS = Array.from({ length: GR_CUPS }, (_, p) => p);

/** Entry-screen art: the gradation rack on the prison wall. */
export default function GradationPreview() {
  const en = useLocale() === 'en';
  return (
    <div className="relative mx-auto flex h-[230px] w-[260px] flex-col items-center justify-center overflow-hidden rounded-[18px] border border-white/10 bg-[radial-gradient(ellipse_at_50%_35%,rgba(150,120,210,.35),rgba(22,18,30,.96)_72%)] px-3 md:w-full">
      <p className="absolute left-3 top-3 font-mono text-[9px] font-black tracking-[0.25em] text-white/40">SUM 30</p>
      <p className="mb-2 rounded-md border border-[#cbb6ff]/30 bg-black/40 px-2 py-0.5 text-[10px] font-black tracking-[0.2em] text-[#e9dcff]">{en ? 'PRISON MATCH' : '감옥 매치'}</p>
      <div className="grid w-full grid-cols-7 items-end gap-1">
        {POS.map((p) => <GrCup key={p} fluid tier={grTier(p)} value={SHOW_ROW[p]} />)}
      </div>
      <p className="mt-3 font-serif text-[22px] font-bold tracking-[0.08em] text-[#f1ecff]">{en ? 'Gradation' : '그라데이션'}</p>
    </div>
  );
}

/** Home-card picture (laid out in the 300px preview box like the other games). */
export function GradationTile() {
  return (
    <div className="relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-xl border-[3px] border-[#17201e] bg-[radial-gradient(ellipse_at_50%_35%,#5b4690,#17121f_72%)] px-2 shadow-xl sm:w-[62%] sm:rounded-2xl sm:border-4 sm:shadow-2xl">
      <div className="grid w-full grid-cols-7 items-end gap-0.5 sm:gap-1">
        {POS.map((p) => <GrCup key={p} fluid tier={grTier(p)} value={SHOW_ROW[p]} />)}
      </div>
      <span className="absolute left-2 top-2 rounded-full bg-[#3fd67a] px-2 py-0.5 font-mono text-[9px] font-black tracking-wider text-[#03160a] sm:left-3 sm:top-3">≤ 30</span>
    </div>
  );
}

"use client";

import { useTranslations } from 'next-intl';
import { BellRing, Hand, Timer } from 'lucide-react';
import InlineSteps from '@/components/ui/InlineSteps';
import { type NemoBoard, solutionRects, tutorialProblems } from '@/lib/nemoCount';
import { NemoBoardView, SolutionReplay, TargetPlate } from './NemoParts';

/** A small cut of the first broadcast board: the 3×3 block on the left plus the 21 bridge. */
const CUT: NemoBoard = { target: 20, cells: [[1, 8, 6, null], [3, 5, 2, null], [7, 4, 9, 21]] };

export function NemoTutorialSteps() {
  const t = useTranslations('NemoTutorial');
  const [first, second] = tutorialProblems();
  const example = solutionRects(first).find((r) => r.r1 !== r.r2 && r.c1 !== r.c2) ?? solutionRects(first)[0];
  const steps = [
    {
      title: t('s1Title'), desc: t('s1Desc'),
      visual: <div className="flex w-full items-center justify-center gap-3"><div className="w-40"><NemoBoardView board={CUT} maxCell={40} /></div><TargetPlate target={20} small /></div>,
    },
    {
      title: t('s2Title'), desc: t('s2Desc'),
      // Allowed: the 2×2 at the top left. Not allowed: a rectangle that runs into the gap.
      visual: <div className="w-44"><NemoBoardView board={CUT} maxCell={40} highlight={{ r1: 0, c1: 0, r2: 1, c2: 1, sum: 17 }} ghost={{ r1: 1, c1: 2, r2: 2, c2: 3, sum: 0 }} /></div>,
    },
    {
      title: t('s3Title', { answer: first.answer }), desc: t('s3Desc'),
      visual: <div className="w-full max-w-[260px]"><NemoBoardView board={first} maxCell={36} highlight={example} /></div>,
    },
    {
      title: t('s4Title', { answer: second.answer }), desc: t('s4Desc'),
      visual: <div className="w-full max-w-[300px]"><SolutionReplay board={second} auto stepMs={260} maxCell={28} /></div>,
    },
    {
      title: t('s5Title'), desc: t('s5Desc'),
      visual: <div className="flex items-center gap-6 text-(--accent)"><span className="flex flex-col items-center gap-2"><Timer size={34} /><b className="text-xs">30:00</b></span><span className="flex flex-col items-center gap-2"><b className="font-mono text-3xl">∞</b><b className="text-xs">PRACTICE</b></span></div>,
    },
    {
      title: t('s6Title'), desc: t('s6Desc'),
      visual: <div className="flex items-center gap-5"><span className="flex flex-col items-center gap-2 text-[#ff6b6f]"><BellRing size={34} /><b className="text-xs">10s</b></span><span className="flex flex-col items-center gap-2 text-white/60"><Hand size={32} /><b className="text-xs">PASS ×1</b></span></div>,
    },
  ];
  return <InlineSteps steps={steps} />;
}

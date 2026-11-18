"use client";

import { useTranslations } from 'next-intl';
import { BellRing, Timer } from 'lucide-react';
import InlineSteps from '@/components/ui/InlineSteps';
import { broadcastRounds } from '@/lib/hexagon';
import { HexBoardView, TargetPlate, type TileMark, revealMarks } from './HexParts';

const mark = (line: string, m: TileMark) => Object.fromEntries([...line].map((ch) => [ch, m])) as Record<string, TileMark>;

export function HexagonTutorialSteps() {
  const t = useTranslations('HexagonTutorial');
  const first = broadcastRounds()[0]; // target 5: ADH, KOR, QRS
  const steps = [
    { title: t('s1Title'), desc: t('s1Desc'), visual: <div className="w-full max-w-[220px]"><HexBoardView numbers={first.numbers} front maxWidth={220} /></div> },
    { title: t('s2Title'), desc: t('s2Desc'), visual: <div className="flex w-full items-center justify-center gap-3"><div className="w-44"><HexBoardView numbers={null} front={false} maxWidth={176} /></div><TargetPlate target={first.target} small /></div> },
    { title: t('s3Title'), desc: t('s3Desc'), visual: <div className="w-full max-w-[220px]"><HexBoardView numbers={first.numbers} front marks={{ ...mark('QRS', 'found'), ...mark('ADH', 'found'), ...mark('HIJ', 'wrong') }} maxWidth={220} /></div> },
    { title: t('s4Title'), desc: t('s4Desc'), visual: <div className="w-full max-w-[220px]"><HexBoardView numbers={null} front={false} marks={mark('KOR', 'pick')} maxWidth={220} /></div> },
    { title: t('s5Title'), desc: t('s5Desc'), visual: <div className="w-full max-w-[220px]"><HexBoardView numbers={first.numbers} front marks={revealMarks(first.answers, ['QRS', 'ADH'])} maxWidth={220} /></div> },
    { title: t('s6Title'), desc: t('s6Desc'), visual: <div className="flex items-center gap-6 text-(--accent)"><span className="flex flex-col items-center gap-2"><Timer size={34} /><b className="text-xs">10:00</b></span><span className="flex flex-col items-center gap-2 text-[#ff6b6f]"><BellRing size={34} /><b className="text-xs">2–4P · 10s</b></span></div> },
  ];
  return <InlineSteps steps={steps} />;
}

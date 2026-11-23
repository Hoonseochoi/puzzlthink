"use client";

import { useTranslations } from 'next-intl';
import { ArrowRight, Infinity as InfinityIcon, UsersRound } from 'lucide-react';
import InlineSteps from '@/components/ui/InlineSteps';
import { BlockFace, M2MiniBoard } from './M2Parts';

const B = (...v: number[]) => v;

export function Merge2048TutorialSteps() {
  const t = useTranslations('Merge2048Tutorial');
  const pair = (a: number, b: number) => <span className="flex items-center gap-2"><span className="h-12 w-12"><BlockFace v={a} /></span><span className="text-white/40">+</span><span className="h-12 w-12"><BlockFace v={a} /></span><ArrowRight size={18} className="text-(--accent)" /><span className="h-14 w-14"><BlockFace v={b} happy /></span></span>;
  const steps = [
    { title: t('s1Title'), desc: t('s1Desc'), visual: <div className="flex items-center gap-3"><div className="w-28"><M2MiniBoard cells={B(0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 4, 0)} eyes /></div><ArrowRight size={20} className="text-(--accent)" /><div className="w-28"><M2MiniBoard cells={B(0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 4)} eyes /></div></div> },
    { title: t('s2Title'), desc: t('s2Desc'), visual: pair(2, 4) },
    { title: t('s3Title'), desc: t('s3Desc'), visual: <div className="flex items-end gap-1.5">{[16, 64, 128, 512, 2048].map((v, i) => <span key={v} className="block" style={{ width: 30 + i * 7, height: 30 + i * 7 }}><BlockFace v={v} /></span>)}</div> },
    { title: t('s4Title'), desc: t('s4Desc'), visual: <div className="flex items-center gap-6 text-(--accent)"><span className="flex flex-col items-center gap-2"><InfinityIcon size={34} /><b className="text-xs">RANKING</b></span><span className="flex flex-col items-center gap-2"><UsersRound size={34} /><b className="text-xs">2–4P · 5/10 min</b></span></div> },
  ];
  return <InlineSteps steps={steps} />;
}

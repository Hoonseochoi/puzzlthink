"use client";

import { useTranslations } from 'next-intl';
import InlineSteps from '@/components/ui/InlineSteps';
import { PokerCard } from './IndianPokerParts';

export function IndianPokerTutorialSteps() {
  const t = useTranslations('IndianPokerTutorial');
  const steps = [
    { title: t('s1Title'), desc: t('s1Desc'), visual: <div className="flex items-center gap-5"><PokerCard value={4} hidden label={t('you')} compact /><PokerCard value={8} label={t('them')} compact /></div> },
    { title: t('s2Title'), desc: t('s2Desc'), visual: <div className="flex gap-2">{[1, 3, 5].map((n) => <span key={n} className="rounded-full bg-[#e6b94f] px-3 py-2 text-xs font-black text-[#17120a]">+{n}</span>)}</div> },
    { title: t('s3Title'), desc: t('s3Desc'), visual: <div className="flex items-center gap-3"><PokerCard value={7} compact /><span className="text-xl font-black text-white/35">VS</span><PokerCard value={4} compact /></div> },
    { title: t('s4Title'), desc: t('s4Desc'), visual: <div className="rounded-2xl border border-[#ff5568]/40 bg-[#ff5568]/10 px-5 py-3 text-center"><b className="text-3xl text-[#ff8290]">10</b><p className="mt-1 text-[10px] font-bold text-white/50">FOLD → −10</p></div> },
  ];
  return <InlineSteps steps={steps} />;
}

"use client";

import { useTranslations } from 'next-intl';
import InlineSteps from '@/components/ui/InlineSteps';
import { GYUL_DECK } from '@/lib/gyulhap';
import { GyulCardView } from './GyulhapParts';

export function GyulhapTutorialSteps() {
  const t = useTranslations('GyulhapTutorial');
  const steps = [
    { title: t('s1Title'), desc: t('s1Desc'), visual: <div className="flex gap-2">{[0, 13, 26].map((n) => <GyulCardView key={n} card={GYUL_DECK[n]} small />)}</div> },
    { title: t('s2Title'), desc: t('s2Desc'), visual: <div className="grid w-52 grid-cols-3 gap-1.5">{[0, 4, 8, 9, 13, 17, 18, 22, 26].map((n) => <GyulCardView key={n} card={GYUL_DECK[n]} />)}</div> },
    { title: t('s3Title'), desc: t('s3Desc'), visual: <div className="text-center"><p className="font-mono text-5xl font-black text-[#ffcf3f]">+1</p><p className="mt-2 text-xs text-white/45">HAP!</p></div> },
    { title: t('s4Title'), desc: t('s4Desc'), visual: <div className="text-center"><p className="font-mono text-5xl font-black text-[#ffcf3f]">+3</p><p className="mt-2 text-xs text-white/45">GYEOL!</p></div> },
  ];
  return <InlineSteps steps={steps} />;
}

"use client";

import { useTranslations } from 'next-intl';
import InlineSteps from '@/components/ui/InlineSteps';
import { MiniBoard } from './FlipOmokParts';

/** 뒤집기 오목 in six pictures: take turns, sandwich and flip, eye colours, exact five, no double three, how to block. */
export function FlipOmokTutorialSteps() {
  const t = useTranslations('FlipOmokTutorial');
  const steps = [
    { title: t('s1Title'), desc: t('s1Desc'), visual: <MiniBoard rows={['.....', '..R..', '..BR.', '.....']} ring={[2, 3]} /> },
    { title: t('s2Title'), desc: t('s2Desc'), visual: <MiniBoard rows={['......', '.RrrR.', '......']} flip={[[1, 2], [1, 3]]} ring={[1, 4]} /> },
    { title: t('s3Title'), desc: t('s3Desc'), visual: <MiniBoard rows={['.....', '.RrB.', '.bBR.', '.....']} /> },
    { title: t('s4Title'), desc: t('s4Desc'), visual: <MiniBoard rows={['.RRRRR.', '.......', 'RRRRRR.']} line={[[0, 1], [0, 5]]} /> },
    { title: t('s5Title'), desc: t('s5Desc'), visual: <MiniBoard rows={['.....', '...R.', '...R.', '.RRx.', '.....']} /> },
    { title: t('s6Title'), desc: t('s6Desc'), visual: <MiniBoard rows={['......', '.RRrR.', '......']} flip={[[1, 3]]} ring={[1, 4]} /> },
  ];
  return <InlineSteps steps={steps} />;
}

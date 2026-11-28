"use client";

import { useTranslations } from 'next-intl';
import InlineSteps from '@/components/ui/InlineSteps';
import { Zap } from 'lucide-react';
import { ChargeDiamonds, MiniBoard, STONE_HEX } from './FlipOmokParts';

/** The two buttons a sandwiching point offers, with the player's three diamonds. */
function ChoiceSketch() {
  const t = useTranslations('FlipOmok');
  return <div className="w-[200px] rounded-[10px] border border-[#ffd76b]/40 bg-black/50 p-2">
    <p className="mb-1.5 flex items-center justify-center gap-1.5 text-[10px] font-bold text-white/60">{t('panelTitle')} <ChargeDiamonds left={3} color={STONE_HEX[1]} size={7} /></p>
    <div className="grid grid-cols-2 gap-1.5 text-[11px] font-black">
      <span className="rounded-md border-2 border-white/70 bg-white/10 py-2 text-center text-white">{t('quiet')}</span>
      <span className="flex items-center justify-center gap-0.5 rounded-md py-2 text-[#1a1200]" style={{ background: 'linear-gradient(135deg,#ffd76b,#ffb03b)' }}><Zap size={11} />{t('flipChoice', { n: 2 })}</span>
    </div>
  </div>;
}

/** 뒤집기 오목 in pictures: take turns, sandwich, 3 flips a game, locked stones, safe gaps, eyes, exact five, no double three, their flips. */
export function FlipOmokTutorialSteps() {
  const t = useTranslations('FlipOmokTutorial');
  const steps = [
    { title: t('s1Title'), desc: t('s1Desc'), visual: <MiniBoard rows={['.....', '..R..', '..BR.', '.....']} ring={[2, 3]} /> },
    { title: t('s2Title'), desc: t('s2Desc'), visual: <MiniBoard rows={['......', '.RrrR.', '......']} flip={[[1, 2], [1, 3]]} ring={[1, 4]} /> },
    { title: t('sChargeTitle'), desc: t('sChargeDesc'), visual: <ChoiceSketch /> },
    { title: t('sLockTitle'), desc: t('sLockDesc'), visual: <MiniBoard rows={['......', 'BRrrRB', '......']} ring={[1, 5]} /> },
    { label: t('safeLabel'), title: t('sSafeTitle'), desc: t('sSafeDesc'), visual: <MiniBoard rows={['.......', '.RBR...', '...RBR.', '.......']} ring={[1, 2]} /> },
    { title: t('s3Title'), desc: t('s3Desc'), visual: <MiniBoard rows={['.....', '.RrB.', '.bBR.', '.....']} /> },
    { title: t('s4Title'), desc: t('s4Desc'), visual: <MiniBoard rows={['.RRRRR.', '.......', 'RRRRRR.']} line={[[0, 1], [0, 5]]} /> },
    { title: t('s5Title'), desc: t('s5Desc'), visual: <MiniBoard rows={['.....', '...R.', '...R.', '.RRx.', '.....']} /> },
    { title: t('s6Title'), desc: t('s6Desc'), visual: <MiniBoard rows={['......', '.RRBR.', '......']} flip={[[1, 3]]} ring={[1, 4]} /> },
  ];
  return <InlineSteps steps={steps} />;
}

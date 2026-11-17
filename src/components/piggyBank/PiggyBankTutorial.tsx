"use client";

import { useTranslations } from 'next-intl';
import { Hand, RotateCcw } from 'lucide-react';
import InlineSteps from '@/components/ui/InlineSteps';
import { CoinDot, GoldPig, Pedestal } from './PiggyParts';

const Box = ({ upper, lower, active = false, buzz = false }: { upper: number | null; lower: number | null; active?: boolean; buzz?: boolean }) => (
  <div className="origin-bottom scale-90"><Pedestal small upper={upper} lower={lower} active={active} buzz={buzz} /></div>
);

export function PiggyBankTutorialSteps() {
  const t = useTranslations('PiggyBankTutorial');
  const steps = [
    { title: t('s1Title'), desc: t('s1Desc'), visual: <div className="flex flex-wrap justify-center gap-1.5">{[1, 2, 3, 4, 5].map((n) => <GoldPig key={n} label={n} size={46} />)}</div> },
    { title: t('s2Title'), desc: t('s2Desc'), visual: <div className="flex items-end gap-4"><Box upper={5} lower={1} active /><div className="flex flex-col items-center gap-1 pb-2"><span className="flex gap-1"><CoinDot color="black" size={16} /><CoinDot color="black" size={16} /><CoinDot color="white" size={16} /></span><span className="text-[10px] font-black text-white/60">{t('putSample')}</span></div></div> },
    { title: t('s3Title'), desc: t('s3Desc'), visual: <div className="flex items-end gap-2"><Box upper={null} lower={5} /><span className="pb-8 text-lg text-white/40">→</span><Box upper={1} lower={3} active /></div> },
    { title: t('s4Title'), desc: t('s4Desc'), visual: <div className="relative"><Box upper={1} lower={3} active /><span className="absolute -right-6 -top-2 rounded-lg bg-[#efe9ff] px-2 py-1 text-sm font-black text-[#2b2f4a] shadow">{t('bubble')}</span></div> },
    { title: t('s5Title'), desc: t('s5Desc'), visual: <div className="w-56 rounded-2xl border border-[#ff4d6d]/40 bg-[#1b1e33] p-3 text-center"><p className="text-xs text-white/60">{t('doubtSample')}</p><div className="mt-2 grid grid-cols-2 gap-1.5"><span className="rounded-md border border-white/15 bg-white/5 py-2 text-xs font-bold">{t('noDoubt')}</span><span className="flex items-center justify-center gap-1 rounded-md bg-[#ff4d6d] py-2 text-xs font-black"><Hand size={12} />{t('doubt')}</span></div></div> },
    { title: t('s6Title'), desc: t('s6Desc'), visual: <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-black text-[#1d2036] shadow-[0_0_14px_rgba(255,255,255,.7)]">R</span><span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-black text-[#1d2036]">{t('votes')}</span><RotateCcw size={22} className="text-white/60" /></div> },
  ];
  return <InlineSteps steps={steps} />;
}

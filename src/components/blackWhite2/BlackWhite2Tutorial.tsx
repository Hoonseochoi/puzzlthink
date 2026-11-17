"use client";

import { useTranslations } from 'next-intl';
import { Eye, Gauge, RotateCcw } from 'lucide-react';
import InlineSteps from '@/components/ui/InlineSteps';
import { BW2Card, GaugeLights } from './BW2Parts';

const Versus = () => <span className="font-mono text-xs font-black text-white/30">VS</span>;

export function BlackWhite2TutorialSteps() {
  const t = useTranslations('BlackWhite2Tutorial');
  const steps = [
    {
      title: t('s1Title'), desc: t('s1Desc'),
      visual: <div className="flex flex-col items-center gap-3"><p className="font-mono text-5xl font-black text-[#f4efe4]">99<span className="ml-1 text-sm text-white/35">POINTS</span></p><GaugeLights level={5} points={99} /></div>,
    },
    {
      title: t('s2Title'), desc: t('s2Desc'),
      visual: <div className="flex items-end gap-5"><div className="text-center"><BW2Card color="black" points={7} size="lg" /><p className="mt-2 text-[10px] font-black text-white/45">0–9 · BLACK</p></div><div className="text-center"><BW2Card color="white" points={23} size="lg" /><p className="mt-2 text-[10px] font-black text-white/45">10–99 · WHITE</p></div></div>,
    },
    {
      title: t('s3Title'), desc: t('s3Desc'),
      visual: <div className="space-y-3"><div className="flex items-center justify-center gap-3"><div className="text-center"><BW2Card color="white" size="md" /><p className="mt-1 text-[9px] font-bold text-white/40">{t('leader')}</p></div><Versus /><div className="flex h-[72px] w-[52px] items-center justify-center rounded-[9px] border border-dashed border-white/15"><span className="text-xl text-white/20">?</span></div></div><div className="flex items-center justify-center gap-2 rounded-full border border-[#ef3340]/30 bg-[#ef3340]/10 px-3 py-2"><Gauge size={13} className="text-[#ef3340]" /><GaugeLights level={3} compact /><span className="text-[10px] font-bold text-white/45">{t('beforeReply')}</span></div></div>,
    },
    {
      title: t('s4Title'), desc: t('s4Desc'),
      visual: <div className="space-y-3"><div className="flex items-center gap-4"><BW2Card color="black" size="md" /><Versus /><BW2Card color="white" points={10} size="md" /></div><div className="flex items-center justify-center gap-2"><span className="rounded-full bg-[#ef3340] px-3 py-1 text-xs font-black text-white">+1</span><span className="text-[11px] font-bold text-white/45">{t('winnerLeads')}</span></div></div>,
    },
    {
      title: t('s5Title'), desc: t('s5Desc'),
      visual: <div className="flex flex-col items-center gap-3"><p className="font-mono text-5xl font-black text-[#f4efe4]">4<span className="mx-2 text-white/25">:</span>4</p><div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-black text-white/55"><RotateCcw size={12} />33P · 3 ROUND OT</div></div>,
    },
    {
      title: t('s6Title'), desc: t('s6Desc'),
      visual: <div className="space-y-2">{[[9, 10], [2, 28], [17, 18]].map(([mine, theirs], index) => <div key={index} className="flex items-center gap-2"><BW2Card color={mine < 10 ? 'black' : 'white'} points={mine} size="sm" /><Versus /><BW2Card color={theirs < 10 ? 'black' : 'white'} points={theirs} size="sm" anim="flip" /><span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${index === 0 || index === 2 ? 'border-[#ef3340]/40 text-[#ff9aa1]' : 'border-white/15 text-white/50'}`}>{t(`replay${index + 1}`)}</span></div>)}<p className="flex items-center justify-center gap-1 pt-1 text-[10px] font-bold text-white/40"><Eye size={11} />{t('replayNote')}</p></div>,
    },
  ];
  return <InlineSteps steps={steps} />;
}

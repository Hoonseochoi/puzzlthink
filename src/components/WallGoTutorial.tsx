"use client";

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { BrickWall, Move, Sparkles, Trophy } from 'lucide-react';
import WallGoCharacter from './WallGoCharacter';

const icons = [Sparkles, Move, BrickWall, Trophy];

export default function WallGoTutorial({ onClose }: { onClose: () => void }) {
  const t = useTranslations('WallGo');
  const [step, setStep] = useState(0);
  const Icon = icons[step];

  const visual = step === 0 ? (
    <div className="relative grid h-36 w-36 grid-cols-3 overflow-hidden rounded-2xl border-4 border-[#17201e] bg-white">{Array.from({ length: 9 }).map((_, i) => <span key={i} className="relative border-b border-r border-black/10">{i === 1 && <WallGoCharacter player={0} className="absolute inset-[20%]" />}{i === 6 && <WallGoCharacter player={1} className="absolute inset-[20%]" />}{i === 8 && <WallGoCharacter player={2} className="absolute inset-[20%]" />}{[3,4].includes(i) && <i className="absolute -bottom-1 left-0 z-10 h-2 w-full bg-[#17201e]" />}</span>)}</div>
  ) : step === 1 ? (
    <div className="relative flex h-36 w-56 items-center justify-center gap-7 rounded-2xl bg-[#f3f0e8]"><WallGoCharacter player={0} className="h-14" /><span className="text-3xl text-[#d39a00]">→</span><div className="relative"><WallGoCharacter player={0} className="h-14" /><i className="absolute -right-5 top-0 h-14 w-2 rounded-full bg-[#17201e]" /></div></div>
  ) : step === 2 ? (
    <div className="relative flex h-36 w-60 items-center justify-center rounded-2xl bg-[#fff0eb]"><WallGoCharacter player={0} className="h-16" /><i className="mx-4 h-20 w-3 rotate-12 rounded-full bg-[#17201e]" /><span className="text-4xl font-black text-[#ff6b4a]">✦</span><div className="absolute bottom-2 flex gap-2">{([0,1,2] as const).map((p) => <span key={p} className="rounded-full bg-white px-2 py-1 text-[9px] font-black">P{p + 1} · 1 BREAK</span>)}</div></div>
  ) : (
    <div className="grid h-36 w-60 grid-cols-3 gap-2 rounded-2xl bg-[#17201e] p-3">{[0,1,2].map((p) => <div key={p} className={`flex flex-col items-center justify-end rounded-xl p-2 ${p === 0 ? 'bg-[#fff0eb]' : 'bg-white/10'}`}><WallGoCharacter player={p as 0|1|2} className="h-10" /><strong className={`mt-2 text-xs ${p === 0 ? 'text-[#17201e]' : 'text-white'}`}>{[21,14,14][p]}</strong></div>)}</div>
  );

  return <AnimatePresence><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-[#17201e]/75 p-4 backdrop-blur-md"><motion.div key={step} initial={{ y: 14, scale: .96, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} className="flex min-h-[540px] w-full max-w-md flex-col rounded-[32px] bg-[#f9f7f1] p-7 shadow-2xl sm:p-9">
    <div className="flex items-center justify-between"><span className="rounded-full bg-[#17201e] px-3 py-1 text-[9px] font-black tracking-[0.18em] text-white">{t(`tutorial${step + 1}Label`)}</span><Icon size={18} className="text-black/30" /></div>
    <div className="flex flex-1 flex-col items-center justify-center py-6">{visual}<h2 className="mt-7 text-center text-2xl font-black tracking-[-0.04em]">{t(`tutorial${step + 1}Title`)}</h2><p className="mt-3 text-center text-sm leading-7 text-black/50">{t(`tutorial${step + 1}Desc`)}</p></div>
    <div className="flex items-center justify-between border-t border-black/[0.07] pt-5"><button onClick={onClose} className="px-2 py-2 text-xs font-bold text-black/40 hover:text-black">{t('tutorialSkip')}</button><div className="flex gap-1.5">{icons.map((_, index) => <span key={index} className={`h-1.5 rounded-full transition-all ${index === step ? 'w-6 bg-[#ff6b4a]' : 'w-1.5 bg-black/15'}`} />)}</div><button onClick={() => step === icons.length - 1 ? onClose() : setStep((value) => value + 1)} className="rounded-xl bg-[#17201e] px-5 py-2.5 text-xs font-extrabold text-white">{step === icons.length - 1 ? t('tutorialStart') : t('tutorialNext')}</button></div>
  </motion.div></motion.div></AnimatePresence>;
}

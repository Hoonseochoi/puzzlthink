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
    <div className="relative grid h-36 w-36 grid-cols-3 overflow-hidden rounded-md border-2 border-[#8d95a8] bg-[#17181e]">{Array.from({ length: 9 }).map((_, i) => <span key={i} className="relative border-b border-r border-[#2a2c35]">{i === 1 && <WallGoCharacter player={0} className="absolute inset-[20%]" />}{i === 6 && <WallGoCharacter player={1} className="absolute inset-[20%]" />}{i === 8 && <WallGoCharacter player={2} className="absolute inset-[20%]" />}{[3,4].includes(i) && <i className="absolute -bottom-1 left-0 z-10 h-1.5 w-full bg-gradient-to-b from-[#f1f4fa] to-[#7d8597]" />}</span>)}</div>
  ) : step === 1 ? (
    <div className="relative flex h-36 w-56 items-center justify-center gap-7 rounded-md border border-white/10 bg-[#17181e]"><WallGoCharacter player={0} className="h-14" /><span className="text-3xl text-[#c9cfdc]">→</span><div className="relative"><WallGoCharacter player={0} className="h-14" /><i className="absolute -right-5 top-0 h-14 w-2 rounded-[2px] bg-[#e0283a] shadow-[0_0_12px_rgba(224,40,58,.8)]" /></div></div>
  ) : step === 2 ? (
    <div className="relative flex h-36 w-60 items-center justify-center rounded-md border border-[#e0283a]/30 bg-[#1a0d10]"><WallGoCharacter player={0} className="h-16" /><i className="mx-4 h-20 w-3 rotate-12 rounded-[2px] bg-gradient-to-r from-[#f1f4fa] to-[#7d8597]" /><span className="text-4xl font-black text-[#ff4d5e]">✦</span><div className="absolute bottom-2 flex gap-2">{([0,1,2] as const).map((p) => <span key={p} className="rounded-md border border-white/10 bg-black/60 px-2 py-1 text-[9px] font-black text-white/70">P{p + 1} · 1 BREAK</span>)}</div></div>
  ) : (
    <div className="grid h-36 w-60 grid-cols-3 gap-2 rounded-md border border-white/10 bg-[#0b0b0e] p-3">{[0,1,2].map((p) => <div key={p} className={`flex flex-col items-center justify-end rounded-xl p-2 ${p === 0 ? 'bg-[#e0283a]/20 ring-1 ring-[#e0283a]/50' : 'bg-white/5'}`}><WallGoCharacter player={p as 0|1|2} className="h-10" /><strong className={`mt-2 text-xs ${p === 0 ? 'text-[#ff4d5e]' : 'text-white/70'}`}>{[21,14,14][p]}</strong></div>)}</div>
  );

  return <AnimatePresence><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"><motion.div key={step} initial={{ y: 14, scale: .96, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} className="flex min-h-[540px] w-full max-w-md flex-col rounded-[16px] border border-white/10 bg-[#121217] p-7 text-[#e6e9f0] shadow-[0_0_80px_rgba(224,40,58,.2)] sm:p-9">
    <div className="flex items-center justify-between"><span className="rounded-md bg-[#e0283a] px-3 py-1 text-[9px] font-black tracking-[0.18em] text-white">{t(`tutorial${step + 1}Label`)}</span><Icon size={18} className="text-white/30" /></div>
    <div className="flex flex-1 flex-col items-center justify-center py-6">{visual}<h2 className="mt-7 text-center text-2xl font-black tracking-[-0.04em]">{t(`tutorial${step + 1}Title`)}</h2><p className="mt-3 text-center text-sm leading-7 text-white/55">{t(`tutorial${step + 1}Desc`)}</p></div>
    <div className="flex items-center justify-between border-t border-white/10 pt-5"><button onClick={onClose} className="px-2 py-2 text-xs font-bold text-white/40 hover:text-white">{t('tutorialSkip')}</button><div className="flex gap-1.5">{icons.map((_, index) => <span key={index} className={`h-1.5 rounded-full transition-all ${index === step ? 'w-6 bg-[#e0283a]' : 'w-1.5 bg-white/15'}`} />)}</div><button onClick={() => step === icons.length - 1 ? onClose() : setStep((value) => value + 1)} className="rounded-md bg-[#e0283a] px-5 py-2.5 text-xs font-extrabold text-white hover:bg-[#f0354a]">{step === icons.length - 1 ? t('tutorialStart') : t('tutorialNext')}</button></div>
  </motion.div></motion.div></AnimatePresence>;
}

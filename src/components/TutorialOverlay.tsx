"use client";

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Grid3X3, Keyboard, ListChecks, MousePointer2, Trophy } from 'lucide-react';
import { useTranslations } from 'next-intl';

const icons = [Grid3X3, MousePointer2, Keyboard, ListChecks, Trophy];

export default function TutorialOverlay({ onComplete }: { onComplete: () => void }) {
  const t = useTranslations('Tutorial');
  const [step, setStep] = useState(0);
  const Icon = icons[step];
  const totalSteps = icons.length;

  return <AnimatePresence><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-[#17201e]/70 p-4 backdrop-blur-md"><motion.div key={step} initial={{ scale: .96, y: 12, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} className="flex min-h-[420px] w-full max-w-sm flex-col overflow-hidden rounded-[30px] bg-[#f9f7f1] p-7 shadow-2xl sm:p-9">
    <div className="flex flex-1 flex-col items-center justify-center text-center"><div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[26px] bg-[#edf2ff] text-[#4b7bff] shadow-inner"><Icon size={34} /></div><h3 className="text-2xl font-black tracking-[-0.035em]">{t(`step${step}Title`)}</h3><p className="mt-4 text-sm font-medium leading-7 text-black/50">{t(`step${step}Desc`)}</p></div>
    <div className="mt-7 flex items-center justify-between border-t border-black/[0.07] pt-5"><button onClick={onComplete} className="px-2 py-2 text-xs font-bold text-black/40 hover:text-black">{t('skip')}</button><div className="flex gap-1.5">{Array.from({ length: totalSteps }).map((_, index) => <span key={index} className={`h-1.5 rounded-full transition-all ${index === step ? 'w-5 bg-[#4b7bff]' : 'w-1.5 bg-black/15'}`} />)}</div><button onClick={() => step === totalSteps - 1 ? onComplete() : setStep((value) => value + 1)} className="rounded-xl bg-[#17201e] px-5 py-2.5 text-xs font-extrabold text-white">{step === totalSteps - 1 ? t('finish') : t('next')}</button></div>
  </motion.div></motion.div></AnimatePresence>;
}

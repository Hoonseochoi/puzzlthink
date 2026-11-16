"use client";

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Coins, Eye, EyeOff, LockKeyhole, RotateCw, Target } from 'lucide-react';

const ICONS = [Target, Eye, EyeOff, LockKeyhole, RotateCw];

export default function RussianRouletteTutorial({ onClose }: { onClose: () => void }) {
  const t = useTranslations('RussianRouletteTutorial');
  const [step, setStep] = useState(0);
  const last = step === ICONS.length - 1;
  const Icon = ICONS[step];
  return <AnimatePresence><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"><motion.div key={step} initial={{ y: 14, scale: .97, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} className="w-full max-w-md rounded-[28px] border border-[#65e5ff]/20 bg-[#101722] p-6 text-white shadow-[0_0_100px_rgba(101,229,255,.12)] sm:p-8"><div className="flex items-center justify-between"><span className="rounded-full bg-[#65e5ff] px-3 py-1 text-[9px] font-black tracking-[.16em] text-[#071016]">{t(`label${step}`)}</span><span className="font-mono text-[10px] text-white/30">{step + 1} / {ICONS.length}</span></div><div className="flex min-h-[190px] items-center justify-center"><div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-[#65e5ff]/30 bg-[#65e5ff]/[.06] shadow-[0_0_45px_rgba(101,229,255,.14)]"><Icon size={48} className="text-[#65e5ff]" />{step === 1 && <Coins size={24} className="absolute -bottom-1 -right-1 text-[#ffcf58]" />}</div></div><h2 className="text-center text-xl font-black">{t(`title${step}`)}</h2><p className="mt-2.5 text-center text-sm leading-7 text-white/55">{t(`desc${step}`)}</p><div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5"><button onClick={onClose} className="text-xs font-bold text-white/35">{t('skip')}</button><div className="flex gap-1.5">{ICONS.map((_, i) => <i key={i} className={`h-1.5 rounded-full ${i === step ? 'w-6 bg-[#65e5ff]' : 'w-1.5 bg-white/15'}`} />)}</div><div className="flex gap-2">{step > 0 && <button onClick={() => setStep((value) => value - 1)} className="rounded-[10px] border border-white/15 px-3 py-2 text-xs font-bold text-white/60">{t('prev')}</button>}<button onClick={() => last ? onClose() : setStep((value) => value + 1)} className="rounded-[10px] bg-[#65e5ff] px-4 py-2 text-xs font-black text-[#071016]">{last ? t('start') : t('next')}</button></div></div></motion.div></motion.div></AnimatePresence>;
}

"use client";

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Coins, Eye, EyeOff, LockKeyhole, RotateCw, Target } from 'lucide-react';
import { RR_MODAL } from './theme';
import InlineSteps from '../ui/InlineSteps';

const ICONS = [Target, Eye, EyeOff, LockKeyhole, RotateCw];

export default function RussianRouletteTutorial({ onClose }: { onClose: () => void }) {
  const t = useTranslations('RussianRouletteTutorial');
  const [step, setStep] = useState(0);
  const last = step === ICONS.length - 1;
  const Icon = ICONS[step];
  return <AnimatePresence><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"><motion.div key={step} initial={{ y: 14, scale: .97, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} className={`${RR_MODAL} max-w-md p-6 text-white sm:p-8`}><div className="flex items-center justify-between"><span className="rounded-md bg-(--accent) px-2.5 py-1 text-[9px] font-black tracking-[.16em] text-(--accent-ink)">{t(`label${step}`)}</span><span className="font-mono text-[10px] text-white/30">{step + 1} / {ICONS.length}</span></div><div className="flex min-h-[190px] items-center justify-center"><div className="relative flex h-28 w-28 items-center justify-center rounded-[14px] border border-(--accent)/30 bg-(--accent)/[.06] shadow-[0_0_45px_var(--accent-glow)]"><Icon size={48} className="text-(--accent)" />{step === 1 && <Coins size={24} className="absolute -bottom-1 -right-1 text-[#ffcf58]" />}</div></div><h2 className="text-center text-xl font-extrabold tracking-tight text-[#eef1f7]">{t(`title${step}`)}</h2><p className="mt-2.5 text-center text-sm leading-7 text-white/55">{t(`desc${step}`)}</p><div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5"><button onClick={onClose} className="text-xs font-bold text-white/35 hover:text-white">{t('skip')}</button><div className="flex gap-1.5">{ICONS.map((_, i) => <i key={i} className={`h-1.5 rounded-full ${i === step ? 'w-6 bg-(--accent)' : 'w-1.5 bg-white/15'}`} />)}</div><div className="flex gap-2">{step > 0 && <button onClick={() => setStep((value) => value - 1)} className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white/70 hover:bg-white/10">{t('prev')}</button>}<button onClick={() => last ? onClose() : setStep((value) => value + 1)} className="rounded-md bg-(--accent) px-4 py-2 text-xs font-extrabold text-(--accent-ink) shadow-[0_0_18px_var(--accent-glow)] hover:brightness-110">{last ? t('start') : t('next')}</button></div></div></motion.div></motion.div></AnimatePresence>;
}

/** The same tutorial laid out on the page (entry screen). */
export function RussianRouletteTutorialSteps() {
  const t = useTranslations('RussianRouletteTutorial');
  return <InlineSteps steps={ICONS.map((Icon, step) => ({
    label: t(`label${step}`), title: t(`title${step}`), desc: t(`desc${step}`),
    visual: <div className="relative flex h-24 w-24 items-center justify-center rounded-[14px] border border-(--accent)/30 bg-(--accent)/[.06] shadow-[0_0_45px_var(--accent-glow)]"><Icon size={40} className="text-(--accent)" />{step === 1 && <Coins size={20} className="absolute -bottom-1 -right-1 text-[#ffcf58]" />}</div>,
  }))} />;
}

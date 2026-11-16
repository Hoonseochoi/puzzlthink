"use client";

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Lock } from 'lucide-react';
import type { Chip } from '@/lib/heavy13';
import { ChipToken, RockCard, StandMini } from './Bits';
import { BTN, BTN_ACCENT, STEEL_TEXT } from '../ui/gameUi';
import InlineSteps from '../ui/InlineSteps';

const ORDER: [string, Chip, number, number][] = [['A', 'b', 2, 1], ['B', 'r', 6, 2], ['C', 'g', 6, 3], ['D', 'r', 4, 4]];
const STEPS = 6;

function Visual({ step }: { step: number }) {
  const t = useTranslations('Heavy13');
  const stand = (c: 'r' | 'g' | 'b') => t(`stand_${c}`);
  switch (step) {
    case 0:
      return <div className="flex items-end gap-3"><StandMini color="r" cubes={[6, 4, 0]} label={stand('r')} /><StandMini color="g" cubes={[3]} label={stand('g')} /><StandMini color="b" cubes={[5, 6]} label={stand('b')} /></div>;
    case 1:
      return (
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-1.5">{[0, 1, 2, 3, 4, 5, 6].map((v) => <RockCard key={v} value={v} size="sm" selected={v === 4} />)}</div>
          <div className="flex items-center gap-2">{(['r', 'g', 'b', 'w'] as Chip[]).map((c) => <ChipToken key={c} chip={c} size={c === 'g' ? 30 : 22} dim={c !== 'g'} />)}</div>
          <span className="flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-1 text-[11px] text-white/60"><Lock size={12} />{t('chip_g')} + 4</span>
        </div>
      );
    case 2:
      return (
        <div className="flex gap-3">{ORDER.map(([p, chip, card, order]) => (
          <div key={p} className="flex flex-col items-center gap-1.5"><span className="text-xs font-black text-white/60">{p}</span><ChipToken chip={chip === 'b' ? 'w' : chip} size={20} /><RockCard value={card} size="sm" /><span className="rounded-sm bg-(--accent)/20 px-2 font-mono text-[11px] font-black text-(--accent)">#{order}</span></div>
        ))}</div>
      );
    case 3:
      return <div className="flex items-end gap-3"><StandMini color="r" cubes={[6, 5]} label={stand('r')} /><span className="pb-10 text-white/40">+</span><RockCard value={5} /><span className="pb-10 text-white/40">→</span><StandMini color="r" cubes={[5]} label={stand('r')} glow /></div>;
    case 4:
      return (
        <div className="flex flex-col items-center gap-2 text-xs font-bold">
          <div className="flex items-center gap-2">{['A', 'B', 'C', 'D'].map((p, i) => <span key={p} className={`flex h-10 w-10 items-center justify-center rounded-md ${i < 2 ? 'border border-dashed border-white/35 text-white/45' : 'bg-white/10'}`}>{p}</span>)}</div>
          <span className="text-white/40">↓</span>
          <div className="flex items-center gap-2">{['C', 'D', 'B', 'A'].map((p) => <span key={p} className="flex h-10 w-10 items-center justify-center rounded-md bg-(--accent)/20 text-(--accent)">{p}</span>)}</div>
        </div>
      );
    default:
      return (
        <div className="flex flex-col items-center gap-2 font-mono text-xs">
          {[['1', '0', 'text-(--accent)'], ['2', '3', 'text-white/70'], ['…', '', 'text-white/30'], ['6', '14', 'text-[#ff8a7a]'], ['7', '19', 'text-[#ff8a7a]']].map(([rank, pen, cls]) => (
            <div key={rank} className={`flex w-48 justify-between rounded-md bg-white/[0.05] px-3 py-1.5 font-black ${cls}`}><span>{rank}</span><span>{pen}</span></div>
          ))}
        </div>
      );
  }
}

export default function Heavy13Tutorial({ onClose }: { onClose: () => void }) {
  const t = useTranslations('Heavy13Tutorial');
  const [step, setStep] = useState(0);
  const last = step === STEPS - 1;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
        <motion.div key={step} initial={{ y: 14, scale: 0.97, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} className="flex max-h-[92vh] w-full max-w-md flex-col overflow-y-auto rounded-[16px] border border-white/10 bg-[#121217] p-6 text-[#e6e9f0] shadow-[0_0_80px_var(--accent-glow)] sm:p-8">
          <div className="flex items-center justify-between">
            <span className="rounded-md bg-(--accent) px-3 py-1 text-[9px] font-black tracking-[0.18em] text-(--accent-ink)">{t(`label${step}`)}</span>
            <span className="font-mono text-[10px] text-white/35">{step + 1} / {STEPS}</span>
          </div>
          <div className="flex min-h-[170px] items-center justify-center py-6"><Visual step={step} /></div>
          <h2 className={`text-center text-xl font-black tracking-tight ${STEEL_TEXT}`}>{t(`title${step}`)}</h2>
          <p className="mt-2.5 text-center text-sm leading-7 text-white/60">{t(`desc${step}`)}</p>
          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
            <button onClick={onClose} className="px-2 py-2 text-xs font-bold text-white/40 hover:text-white">{t('skip')}</button>
            <div className="flex gap-1.5">{Array.from({ length: STEPS }).map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-(--accent)' : 'w-1.5 bg-white/15'}`} />)}</div>
            <div className="flex gap-2">
              {step > 0 && <button onClick={() => setStep((s) => s - 1)} className={`px-3 py-2.5 ${BTN}`}>{t('prev')}</button>}
              <button onClick={() => (last ? onClose() : setStep((s) => s + 1))} className={`px-5 py-2.5 ${BTN_ACCENT}`}>{last ? t('start') : t('next')}</button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** The same tutorial laid out on the page (entry screen). */
export function Heavy13TutorialSteps() {
  const t = useTranslations('Heavy13Tutorial');
  return <InlineSteps steps={Array.from({ length: STEPS }, (_, step) => ({ label: t(`label${step}`), title: t(`title${step}`), desc: t(`desc${step}`), visual: <Visual step={step} /> }))} />;
}

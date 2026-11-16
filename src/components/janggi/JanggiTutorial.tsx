"use client";

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { PieceType } from '@/lib/janggi';
import JanggiDiagram, { JanggiMoveChart, type JanggiDiagramSpec } from './JanggiDiagram';
import InlineSteps from '../ui/InlineSteps';

const STEPS: (JanggiDiagramSpec | 'moves')[] = [
  { pieces: [['jang', 0, 1, 1], ['wang', 1, 0, 1], ['sang', 1, 0, 2], ['wang', 0, 3, 1]], arrows: [[1, 1, 0, 1, 'capture']] },
  'moves',
  { pieces: [['ja', 0, 1, 1], ['wang', 1, 0, 1], ['wang', 0, 3, 1]], arrows: [[2, 1, 1, 1, 'capture']], hands: [[0, ['ja']]] },
  { pieces: [['wang', 1, 0, 1], ['wang', 0, 3, 1]], hands: [[0, ['sang']]], arrows: [[4, 0, 2, 0, 'drop']], dots: [[1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2], [3, 0], [3, 2]], blocked: [[0, 0], [0, 2]] },
  { pieces: [['hu', 0, 0, 0], ['wang', 1, 0, 1], ['wang', 0, 3, 1]], arrows: [[1, 0, 0, 0]], glow: [[0, 0]] },
  { pieces: [['wang', 0, 0, 2], ['wang', 1, 1, 0], ['jang', 1, 2, 1]], glow: [[0, 2]], arrows: [[1, 2, 0, 2]] },
];
const MOVE_TYPES: PieceType[] = ['wang', 'jang', 'sang', 'ja', 'hu'];

export default function JanggiTutorial({ onClose }: { onClose: () => void }) {
  const t = useTranslations('JanggiTutorial');
  const tp = useTranslations('JanggiGuide');
  const [step, setStep] = useState(0);
  const spec = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
        <motion.div key={step} initial={{ y: 14, scale: 0.97, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} className="flex max-h-[92vh] w-full max-w-md flex-col overflow-y-auto rounded-[16px] border border-white/10 bg-[#121217] p-6 text-[#e6e9f0] shadow-[0_0_80px_rgba(232,193,112,.18)] sm:p-8">
          <div className="flex items-center justify-between">
            <span className="rounded-md bg-[#e8c170] px-2.5 py-1 text-[9px] font-black tracking-[0.18em] text-[#1a1408]">{t(`label${step}`)}</span>
            <span className="font-mono text-[10px] text-white/35">{step + 1} / {STEPS.length}</span>
          </div>
          <div className="flex flex-1 flex-col items-center py-5">
            {spec === 'moves' ? (
              <div className="grid w-full grid-cols-5 gap-2">
                {MOVE_TYPES.map((type) => <div key={type} className="text-center"><JanggiMoveChart type={type} label={tp(`piece_${type}`)} /><p className="mt-1.5 text-[10px] font-bold text-white/55">{tp(`piece_${type}`)}</p></div>)}
              </div>
            ) : (
              <div className="w-56"><JanggiDiagram spec={spec} label={t(`title${step}`)} /></div>
            )}
            <h2 className="mt-6 text-center text-xl font-extrabold tracking-tight text-[#eef1f7]">{t(`title${step}`)}</h2>
            <p className="mt-2.5 text-center text-sm leading-7 text-white/55">{t(`desc${step}`)}</p>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-5">
            <button onClick={onClose} className="px-2 py-2 text-xs font-bold text-white/40 hover:text-white">{t('skip')}</button>
            <div className="flex gap-1.5">{STEPS.map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-[#e8c170]' : 'w-1.5 bg-white/15'}`} />)}</div>
            <div className="flex gap-2">
              {step > 0 && <button onClick={() => setStep((s) => s - 1)} className="rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-bold text-white/70 hover:bg-white/10">{t('prev')}</button>}
              <button onClick={() => (last ? onClose() : setStep((s) => s + 1))} className="rounded-md bg-[#e8c170] px-5 py-2.5 text-xs font-extrabold text-[#1a1408] shadow-[0_0_18px_rgba(232,193,112,.4)] hover:brightness-110">{last ? t('start') : t('next')}</button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** The same tutorial laid out on the page (entry screen). */
export function JanggiTutorialSteps() {
  const t = useTranslations('JanggiTutorial');
  const tp = useTranslations('JanggiGuide');
  return <InlineSteps steps={STEPS.map((spec, step) => ({
    label: t(`label${step}`), title: t(`title${step}`), desc: t(`desc${step}`),
    visual: spec === 'moves'
      ? <div className="grid w-full grid-cols-5 gap-1.5">{MOVE_TYPES.map((type) => <div key={type} className="text-center"><JanggiMoveChart type={type} label={tp(`piece_${type}`)} /><p className="mt-1 text-[9px] font-bold text-white/55">{tp(`piece_${type}`)}</p></div>)}</div>
      : <div className="w-40"><JanggiDiagram spec={spec} label={t(`title${step}`)} /></div>,
  }))} />;
}

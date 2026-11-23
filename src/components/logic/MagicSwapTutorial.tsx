"use client";

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { accentVars } from '@/components/ui/gameUi';
import { LOGIC, buildBoard } from '@/lib/logicPuzzles';
import { lineSums, magicSum } from '@/lib/magicswap';
import MagicSwapBoard from './MagicSwapBoard';

const SEEN_KEY = 'puzzlthink_magicswap_tutorial_seen';
/** Fired by the rules tip's "튜토리얼" button to open the steps again. */
export const MAGIC_TUTORIAL_EVENT = 'puzzlthink:magic-tutorial';
export const openMagicTutorial = () => window.dispatchEvent(new Event(MAGIC_TUTORIAL_EVENT));

/** 마방진 스왑's how-to: pops up the first time the game opens (and again from the rules tip), four short steps on a 5×5. */
export default function MagicSwapTutorial() {
  const t = useTranslations('MagicSwapTutorial');
  const spec = LOGIC.magicswap;
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const board = useMemo(() => {
    const b = buildBoard('magicswap', 5, 20271123);
    return b.kind === 'magicswap' ? b : null;
  }, []);

  useEffect(() => {
    let seen = true;
    try { seen = localStorage.getItem(SEEN_KEY) === '1'; } catch { /* storage blocked: skip the popup */ }
    if (!seen) setOpen(true); // eslint-disable-line react-hooks/set-state-in-effect -- first visit, read once
    const again = () => { setStep(0); setOpen(true); };
    window.addEventListener(MAGIC_TUTORIAL_EVENT, again);
    return () => window.removeEventListener(MAGIC_TUTORIAL_EVENT, again);
  }, []);
  const close = () => { setOpen(false); try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* optional */ } };
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') setStep((s) => Math.min(3, s + 1)); if (e.key === 'ArrowLeft') setStep((s) => Math.max(0, s - 1)); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open || !board) return null;

  // Step 3: the solved square with one clean swap (different row, column, both on the ↘ diagonal), so its lines read +d / −d.
  const pa = 6, pb = 18;
  const one = board.answer.slice();
  [one[pa], one[pb]] = [one[pb], one[pa]];
  const d = Math.abs(one[pa] - one[pb]);
  const [a, b] = board.swaps[0];
  const sums = lineSums(5, board.start);
  const off = sums.rows.filter((v) => v !== magicSum(5)).length + sums.cols.filter((v) => v !== magicSum(5)).length;
  const steps = [
    { title: t('s1Title'), desc: t('s1Desc'), visual: <MagicSwapBoard board={board} marks={board.answer} readOnly solved demo={{}} /> },
    { title: t('s2Title'), desc: t('s2Desc', { n: board.swaps.length, off }), visual: <MagicSwapBoard board={board} marks={board.start} readOnly demo={{}} /> },
    { title: t('s3Title'), desc: t('s3Desc', { d }), visual: <MagicSwapBoard board={board} marks={one} readOnly demo={{ sel: pa, target: pb }} /> },
    { title: t('s4Title'), desc: t('s4Desc'), visual: <MagicSwapBoard board={board} marks={board.start} readOnly demo={{ pins: { [a]: 2, [b]: 2, [board.swaps[1][0]]: 1 } }} /> },
  ];
  const last = step === steps.length - 1;

  return createPortal(
    <div style={accentVars(spec.accent, spec.ink)} role="dialog" aria-modal="true" aria-label={t('title')} className="fixed inset-0 z-[75] flex items-end justify-center bg-black/65 p-3 backdrop-blur-sm sm:items-center" onClick={close}>
      <div className="w-full max-w-sm rounded-[22px] border border-white/10 bg-[#16121a] p-5 text-white shadow-2xl animate-[logic-pop_.25s_ease]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-black tracking-[0.16em] text-(--accent)">{t('title')} · {step + 1}/{steps.length}</p>
          <button type="button" onClick={close} aria-label={t('close')} className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white"><X size={16} /></button>
        </div>
        <div className="mt-3 flex min-h-[250px] items-center justify-center">{steps[step].visual}</div>
        <h3 className="mt-3 text-lg font-black tracking-tight">{steps[step].title}</h3>
        <p className="mt-1 min-h-[72px] break-keep text-[13px] leading-6 text-white/65">{steps[step].desc}</p>
        <div className="mt-3 flex items-center justify-center gap-1.5">{steps.map((s, i) => <button key={s.title} type="button" aria-label={`${i + 1}`} onClick={() => setStep(i)} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-5 bg-(--accent)' : 'w-1.5 bg-white/25'}`} />)}</div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" disabled={step === 0} onClick={() => setStep(step - 1)} className="flex items-center justify-center gap-1 rounded-xl bg-white/10 py-3 text-sm font-black text-white/80 disabled:opacity-30"><ChevronLeft size={15} />{t('prev')}</button>
          <button type="button" onClick={() => (last ? close() : setStep(step + 1))} className="flex items-center justify-center gap-1 rounded-xl bg-(--accent) py-3 text-sm font-black text-(--accent-ink)">{last ? t('start') : t('next')}{!last && <ChevronRight size={15} />}</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

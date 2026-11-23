"use client";

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { MousePointerClick, Sparkles, Undo2, X } from 'lucide-react';

// Newest first; each item carries the small date tag (same size on every item).
const ITEMS = [['tap', MousePointerClick, '11/23'], ['undo', Undo2, '11/22']] as const;

/** "업데이트" badge for the Slitherlink header: tap for what changed in the latest update (from player feedback). */
export default function SlitherUpdate() {
  const t = useTranslations('Slitherlink');
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" onClick={() => setOpen(true)} className="relative inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#3ddc97] to-[#2bb8ff] px-2.5 py-1 text-[10px] font-black tracking-[0.12em] text-[#06231a] shadow-[0_0_16px_rgba(61,220,151,.45)] transition hover:brightness-110 active:scale-95">
      <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff4d5e] opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff4d5e]" /></span>
      <Sparkles size={11} />{t('updateTag')}
    </button>
    {open && createPortal(
      <div role="dialog" aria-modal="true" aria-label={t('updateTitle')} className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setOpen(false)}>
        <section onClick={(e) => e.stopPropagation()} className="max-h-[86svh] w-full max-w-md overflow-y-auto rounded-t-[24px] bg-[#f9f7f1] p-5 text-[#17201e] shadow-2xl sm:rounded-[24px] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-lg font-black"><Sparkles size={18} />{t('updateTitle')}</h3>
            <button type="button" onClick={() => setOpen(false)} className="rounded-md p-2 text-black/40 hover:text-black" aria-label={t('updateClose')}><X size={16} /></button>
          </div>
          <p className="mt-1 text-[11px] font-bold text-black/40">{t('updateDate')}</p>
          <ul className="mt-4 space-y-2.5">
            {ITEMS.map(([key, Icon, day]) => (
              <li key={key} className="flex gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#5b45c9] text-white"><Icon size={14} /></span>
                <div className="min-w-0">
                  <p className="break-keep text-sm font-black"><span className="mr-1.5 inline-block rounded-full bg-[#5b45c9]/10 px-1.5 py-0.5 align-middle text-[10px] font-black leading-none text-[#5b45c9]">{day}</span>{t(`update_${key}`)}</p>
                  <p className="mt-0.5 break-keep text-xs leading-5 text-black/55">{t(`update_${key}Desc`)}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 break-keep text-center text-[11px] font-bold text-black/45">{t('updateThanks')}</p>
          <button type="button" onClick={() => setOpen(false)} className="mt-4 flex w-full items-center justify-center rounded-full bg-[#17201e] py-3 text-sm font-black text-white">{t('updateOk')}</button>
        </section>
      </div>,
      document.body,
    )}
  </>;
}

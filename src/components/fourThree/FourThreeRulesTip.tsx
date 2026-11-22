"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { CircleHelp, X } from 'lucide-react';
import { accentVars } from '@/components/ui/gameUi';
import { FT_ACCENT, FT_INK } from './FourThreeParts';

/** The in-game "? 규칙" button: the full rules over the board. */
export default function FourThreeRulesTip() {
  const t = useTranslations('FourThree');
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" title={t('tipButton')}
        className="flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1.5 text-xs font-black text-white/80 ring-1 ring-white/10 hover:bg-(--accent) hover:text-(--accent-ink)">
        <CircleHelp size={14} />{t('tipButton')}
      </button>
      {open && createPortal(
        <div style={accentVars(FT_ACCENT, FT_INK)} role="dialog" aria-modal="true" aria-label={t('rulesTitle')} className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center" onClick={() => setOpen(false)}>
          <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-[22px] border border-white/10 bg-[#14161c] p-5 text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-base font-black">{t('rulesTitle')}</p>
              <button type="button" onClick={() => setOpen(false)} aria-label={t('close')} className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white"><X size={16} /></button>
            </div>
            <ol className="mt-3 space-y-2 text-[13px] leading-6 text-white/75">
              {(t.raw('fullRules') as string[]).map((rule, i) => <li key={rule} className="flex gap-2.5"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--accent) text-[10px] font-black text-(--accent-ink)">{i + 1}</span><span className="break-keep">{rule}</span></li>)}
            </ol>
            <p className="mt-4 text-[11px] font-black tracking-[0.12em] text-white/40">{t('tipHelp')}</p>
            <p className="mt-1 break-keep text-[12px] leading-5 text-white/60">{t('helpControls')}</p>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

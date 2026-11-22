"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BookOpen, CircleHelp, X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { type LogicGameId, LOGIC } from '@/lib/logicPuzzles';

/**
 * The in-game "?" button of the logic puzzles: opens the rules, the controls and the key tips over the board,
 * with a link to the illustrated guide. In a challenge it says the clock keeps running.
 */
export default function LogicRulesTip({ game, running = false }: { game: LogicGameId; running?: boolean }) {
  const t = useTranslations('Logic');
  const tc = useTranslations('Common');
  const [open, setOpen] = useState(false);
  const spec = LOGIC[game];
  const rules = t.raw(`rules_${game}`) as string[];

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
      {open && (
        <div role="dialog" aria-modal="true" aria-label={t('tipTitle', { game: tc(spec.catalog) })} className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-[22px] border border-white/10 bg-[#14161c] p-5 text-white shadow-2xl animate-[logic-pop_.25s_ease]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-base font-black">{t('tipTitle', { game: tc(spec.catalog) })}</p>
              <button type="button" onClick={() => setOpen(false)} aria-label={t('tipClose')} className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white"><X size={16} /></button>
            </div>
            <ul className="mt-3 space-y-2 text-[13px] leading-6 text-white/75">
              {rules.map((rule) => <li key={rule} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-(--accent)" /><span className="break-keep">{rule}</span></li>)}
            </ul>
            <p className="mt-4 text-[11px] font-black tracking-[0.12em] text-white/40">{t('tipHelp')}</p>
            <p className="mt-1 break-keep text-[12px] leading-5 text-white/60">{t(`help_${game}${game === 'nonogram' ? '_fill' : ''}`)}</p>
            {running && <p className="mt-3 rounded-lg bg-(--accent)/10 px-3 py-2 text-[11px] font-bold text-(--accent)">{t('tipClock')}</p>}
            <Link href={`${spec.path}/guide`} target="_blank" className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-white/10 py-2.5 text-xs font-black text-white/85 hover:bg-white/15"><BookOpen size={14} />{t('tipGuide')}</Link>
          </div>
        </div>
      )}
    </>
  );
}

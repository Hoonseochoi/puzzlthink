"use client";

import { createContext, useContext, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Hourglass, Play, RotateCcw } from 'lucide-react';
import type { GameId } from '@/lib/gameCatalog';

type Practice = { wait: () => void; again: () => void };
/** Set while a practice game runs beside an open room; result screens offer "wait" / "practice again". */
export const PracticeContext = createContext<Practice | null>(null);
export const usePractice = () => useContext(PracticeContext);

/**
 * In an open room the solo game is practice while people gather. It starts only when the player
 * presses "practice"; a small bar keeps "wait" and "practice again" at hand, and the game's own
 * result screen offers the same two buttons.
 */
export default function OpenPracticeShell({ game, children }: { game: GameId; children: ReactNode }) {
  const t = useTranslations('OpenPractice');
  const tc = useTranslations('Common');
  const [run, setRun] = useState(0); // 0: waiting, n: the nth practice game (a new key restarts it)
  const practice: Practice = { wait: () => { setRun(0); window.scrollTo({ top: 0 }); }, again: () => { setRun((n) => n + 1); window.scrollTo({ top: 0 }); } };

  if (run === 0) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[#0b0b0e] px-5 py-16 text-[#e6e9f0]">
        <div className="w-full max-w-md text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-(--accent)/40 bg-(--accent)/10 px-3 py-1 text-[10px] font-black tracking-[0.2em] text-(--accent)"><Hourglass size={12} />{t('waitingBadge')}</span>
          <h1 className="mt-5 text-3xl font-black tracking-[-0.03em]">{tc(game)}</h1>
          <p className="mx-auto mt-3 max-w-sm break-keep text-sm leading-6 text-white/60">{t('intro')}</p>
          <div className="mx-auto mt-6 max-w-sm rounded-[14px] border border-white/10 bg-white/[.04] p-4 text-left text-xs leading-5 text-white/55">
            <p className="font-black text-white/80">{t('howTitle')}</p>
            <ul className="mt-2 space-y-1.5">{(t.raw('how') as string[]).map((line) => <li key={line} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-(--accent)" /><span className="break-keep">{line}</span></li>)}</ul>
          </div>
          <button type="button" onClick={practice.again} className="mt-6 inline-flex items-center gap-2 rounded-md bg-(--accent) px-6 py-3.5 text-sm font-extrabold text-(--accent-ink) shadow-[0_0_24px_var(--accent-glow)] transition hover:brightness-110">
            <Play size={15} fill="currentColor" />{t('start')}
          </button>
          <p className="mt-3 text-[11px] text-white/40">{t('orWait')}</p>
        </div>
      </main>
    );
  }

  return (
    <PracticeContext.Provider value={practice}>
      <div key={run}>{children}</div>
      <div className="fixed right-3 top-[72px] z-30 flex items-center gap-1 rounded-full border border-(--accent)/40 bg-[#0d0d11]/90 p-1 pl-3 text-[11px] font-black text-white shadow-lg backdrop-blur">
        <span className="text-(--accent)">{t('practiceBadge')}</span>
        <button type="button" onClick={practice.again} className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-white/75 hover:bg-white/10"><RotateCcw size={12} />{t('againShort')}</button>
        <button type="button" onClick={practice.wait} className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1.5 hover:bg-white/15"><Hourglass size={12} />{t('waitShort')}</button>
      </div>
    </PracticeContext.Provider>
  );
}

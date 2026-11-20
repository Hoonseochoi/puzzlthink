"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

/** Leaving the board (another tab or app) for this long counts as an exit; EXIT_LIMIT exits void a timed challenge's record. */
export const EXIT_MIN_MS = 2000;
export const EXIT_LIMIT = 3;

/**
 * Counts exits from the board while `active` (a challenge is running): the tab is hidden, or the window loses focus to
 * another app, for EXIT_MIN_MS or longer. The count resets each time `active` turns on and stays readable after it ends.
 */
export function useBoardExits(active: boolean) {
  const ref = useRef<{ n: number; since: number | null }>({ n: 0, since: null });
  const [warn, setWarn] = useState<number | null>(null);
  useEffect(() => {
    if (!active) return;
    ref.current = { n: 0, since: null };
    let timer = 0;
    const away = () => { if (ref.current.since === null) ref.current.since = Date.now(); };
    const back = () => {
      const r = ref.current;
      if (r.since === null) return;
      const long = Date.now() - r.since >= EXIT_MIN_MS;
      r.since = null;
      if (!long) return;
      r.n += 1;
      setWarn(r.n);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setWarn(null), 4000);
    };
    const onVisibility = () => (document.hidden ? away() : back());
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', away);
    window.addEventListener('focus', back);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', away);
      window.removeEventListener('focus', back);
      window.clearTimeout(timer);
      setWarn(null);
    };
  }, [active]);
  const exits = useCallback(() => ref.current.n, []);
  return { exits, warn };
}

/** Extra fields for a challenge result: the exit count, and `voided` once it reaches EXIT_LIMIT (kept off the rankings). */
export const exitDetail = (n: number) => (n >= EXIT_LIMIT ? { exits: n, voided: 'left_board' } : { exits: n });

/** "보드를 벗어났어요 (n/3)" after each exit. */
export function BoardExitToast({ warn }: { warn: number | null }) {
  const t = useTranslations('BoardExit');
  if (warn === null) return null;
  return (
    <div className="pointer-events-none fixed left-1/2 top-20 z-50 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#ff8f8f]/50 bg-black/85 px-4 py-2 text-xs font-black text-[#ffb3b3] shadow-2xl">
      {warn >= EXIT_LIMIT ? t('void') : t('warn', { n: warn, max: EXIT_LIMIT })}
    </div>
  );
}

/** The rule, for a challenge's start screen; and the reason under a voided result. */
export function BoardExitRule({ voided = false }: { voided?: boolean }) {
  const t = useTranslations('BoardExit');
  return <p className={`mt-3 break-keep text-[11px] leading-5 ${voided ? 'font-bold text-[#ff8f8f]' : 'text-white/40'}`}>{voided ? t('voided', { n: EXIT_LIMIT }) : t('rule', { n: EXIT_LIMIT })}</p>;
}

"use client";

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, LogOut, Maximize2 } from 'lucide-react';
import {
  askBeforeLink, closeDialog, enterFocus, exitFocus, markInteracted, onFullscreenChange, proceedDialog, stakeNow, useFocusState,
} from './focusStore';

/**
 * Drawn once in the layout. While a game is open:
 *  - 전체 모드 on: a slim 축소 bar at the bottom (the game sits above it);
 *  - 전체 모드 off: a small 전체 모드 tab on the left edge brings it back;
 *  - leaving a game in progress (back past 전체 모드, a link, closing or reloading the tab) asks first.
 * The rest of the logic lives in focusStore.ts.
 */
export default function FocusLayer() {
  const t = useTranslations('FocusMode');
  const { active, playing, focus, dialog } = useFocusState();
  const stayRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!active) return;
    // Links out of a game in progress: ask first, then follow the same link again (its own handler included).
    let replaying = false;
    const onClick = (event: MouseEvent) => {
      if (replaying || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!anchor || anchor.closest('[data-focus-safe]') || anchor.hasAttribute('download')) return;
      if (anchor.target && anchor.target !== '_self') return;
      const url = new URL(anchor.href, window.location.href);
      const here = new URL(window.location.href);
      if (url.origin === here.origin && url.pathname === here.pathname && url.search === here.search && url.hash === here.hash) return;
      if (!stakeNow()) return;
      const asked = askBeforeLink(() => { replaying = true; try { anchor.click(); } finally { replaying = false; } });
      if (asked) { event.preventDefault(); event.stopImmediatePropagation(); }
    };
    // Closing or reloading the tab: the browser's own "leave site?" dialog.
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!stakeNow()) return;
      event.preventDefault();
      event.returnValue = '';
    };
    // The first touch in a game that does not report its own state: from now on there is something to lose.
    const onTouch = (event: Event) => {
      if ((event.target as Element | null)?.closest?.('[data-focus-ui]')) return;
      markInteracted();
    };
    window.addEventListener('click', onClick, true);
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('pointerdown', onTouch, true);
    window.addEventListener('keydown', onTouch, true);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      window.removeEventListener('click', onClick, true);
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('pointerdown', onTouch, true);
      window.removeEventListener('keydown', onTouch, true);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, [active]);

  useEffect(() => {
    if (!dialog) return;
    stayRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') closeDialog(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialog]);

  if (!active) return null;

  return (
    <>
      {focus ? (
        <div data-focus-ui className="focus-bar fixed inset-x-0 bottom-0 z-[88] flex justify-center pb-[env(safe-area-inset-bottom)]">
          <button
            type="button" onClick={exitFocus} aria-label={t('shrinkLabel')} title={t('shrinkLabel')}
            className="flex h-[var(--focus-bar)] w-[132px] items-center justify-center gap-1 rounded-t-[10px] border border-b-0 border-white/12 bg-[#16161c]/90 text-[10px] font-black tracking-[0.06em] text-white/60 backdrop-blur transition hover:text-white"
          >
            <ChevronDown size={12} />{t('shrink')}
          </button>
        </div>
      ) : playing && (
        <button
          type="button" data-focus-ui onClick={enterFocus} aria-label={t('fullLabel')} title={t('fullLabel')}
          className="focus-tab fixed left-0 top-[42%] z-[88] flex w-[19px] flex-col items-center gap-1 rounded-r-[8px] border border-l-0 border-white/15 bg-[#16161c]/85 py-2 text-[9px] font-black text-white/75 shadow-[0_6px_20px_rgba(0,0,0,.35)] backdrop-blur transition hover:text-white"
        >
          <Maximize2 size={12} />
          <span className="[writing-mode:vertical-rl]">{t('full')}</span>
        </button>
      )}

      {dialog && (
        <div data-focus-ui role="presentation" className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm" onClick={(event) => { if (event.target === event.currentTarget) closeDialog(); }}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="focus-leave-title" aria-describedby="focus-leave-body" className="focus-pop w-full max-w-[320px] rounded-[16px] border border-white/10 bg-[#121217] p-6 text-center text-[#e6e9f0] shadow-[0_24px_70px_rgba(0,0,0,.6)]">
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#ff6b5e]/15 text-[#ff8a7e]"><LogOut size={20} /></span>
            <h2 id="focus-leave-title" className="mt-3 text-lg font-black tracking-[-0.02em]">{t('title')}</h2>
            <p id="focus-leave-body" className="mt-1.5 break-keep text-sm leading-6 text-white/65">{t(`body_${dialog.kind}`)}</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button ref={stayRef} type="button" onClick={closeDialog} className="rounded-md bg-white px-3 py-3 text-sm font-black text-[#121217] transition hover:brightness-95">{t('stay')}</button>
              <button type="button" onClick={proceedDialog} className="rounded-md border border-white/15 bg-white/5 px-3 py-3 text-sm font-bold text-white/80 transition hover:bg-white/10">{t('leave')}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

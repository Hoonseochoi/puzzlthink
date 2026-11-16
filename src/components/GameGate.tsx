"use client";

import { useEffect, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { BookOpen, Play } from 'lucide-react';
import { accentVars } from './ui/gameUi';

const PLAY_HASH = '#play';

/**
 * A game's entry screen: description, tutorial and tips come first, and the game opens only when
 * the player presses start. Starting adds #play to the URL, so the back button returns to the guide
 * and a reload keeps you in the game. The guide stays in the server HTML for search engines.
 */
export default function GameGate({ hero, tutorial, guide, children, accent, ink = '#ffffff', tone = 'dark', tutorialKey }: {
  hero: ReactNode; // name, tagline, key facts and rules (server-rendered)
  tutorial?: ReactNode; // the game's tutorial steps, laid out on the page
  guide?: ReactNode; // the long-form guide and tips
  children: ReactNode; // the game itself
  accent: string;
  ink?: string;
  tone?: 'dark' | 'light';
  tutorialKey?: string; // localStorage key the game uses to auto-open its tutorial popup
}) {
  const t = useTranslations('GameGate');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const sync = () => setStarted(window.location.hash === PLAY_HASH);
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  const start = () => {
    // The tutorial was just shown on this page, so the game should not pop it up again.
    if (tutorialKey) { try { localStorage.setItem(tutorialKey, '1'); } catch { /* Optional. */ } }
    window.history.pushState(null, '', `${window.location.pathname}${window.location.search}${PLAY_HASH}`);
    setStarted(true);
    window.scrollTo({ top: 0 });
  };

  if (started) return <>{children}</>;

  const dark = tone === 'dark';
  const startButton = (big: boolean) => (
    <button type="button" onClick={start} className={`inline-flex items-center justify-center gap-2 rounded-md bg-(--accent) font-extrabold text-(--accent-ink) shadow-[0_0_24px_var(--accent-glow)] transition hover:brightness-110 ${big ? 'px-7 py-3.5 text-base' : 'w-full px-5 py-3 text-sm sm:w-auto'}`}>
      <Play size={big ? 18 : 16} fill="currentColor" />{t('start')}
    </button>
  );

  return (
    <div className={`min-h-screen pb-24 ${dark ? 'bg-[#0b0b0e] text-[#e6e9f0]' : 'bg-[#f3f0e8] text-[#17201e]'}`} style={accentVars(accent, ink)}>
      <section className="px-4 pb-10 pt-10 sm:px-5 sm:pt-14">
        <div className="mx-auto max-w-4xl">
          {hero}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            {startButton(true)}
            {tutorial && <a href="#how-to-play" className={`inline-flex items-center gap-2 rounded-md border px-4 py-3 text-sm font-bold transition ${dark ? 'border-white/15 bg-white/5 text-white/75 hover:bg-white/10' : 'border-black/15 bg-white/70 text-black/70 hover:bg-white'}`}><BookOpen size={16} />{t('howToPlay')}</a>}
          </div>
        </div>
      </section>

      {tutorial && (
        <section id="how-to-play" className={`scroll-mt-20 border-t px-4 py-12 sm:px-5 ${dark ? 'border-white/10' : 'border-black/10'}`}>
          <div className="mx-auto max-w-4xl">
            <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-(--accent)">TUTORIAL</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] sm:text-3xl">{t('howToPlay')}</h2>
            <div className="mt-6">{tutorial}</div>
          </div>
        </section>
      )}

      {guide}

      {/* Always-visible start button while reading. */}
      {/* pr-32 keeps it clear of the floating bug-report button in the bottom-right corner. */}
      <div className={`fixed inset-x-0 bottom-0 z-30 border-t py-3 pl-4 pr-32 backdrop-blur ${dark ? 'border-white/10 bg-black/75' : 'border-black/10 bg-[#f3f0e8]/90'}`}>
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <p className={`hidden text-xs font-bold sm:block ${dark ? 'text-white/55' : 'text-black/55'}`}>{t('startHint')}</p>
          {startButton(false)}
        </div>
      </div>
    </div>
  );
}

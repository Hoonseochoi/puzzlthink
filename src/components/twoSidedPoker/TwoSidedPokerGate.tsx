"use client";

import { useEffect, useState } from 'react';
import { Bot, Play } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Link } from '@/i18n/routing';
import GameHeader from '@/components/ui/GameHeader';
import { BTN_ACCENT, SHELL, accentVars, fog } from '@/components/ui/gameUi';
import { TSP_ACCENT, TSP_GLOW_RGB, TSP_INK, tspCopy } from './copy';
import TwoSidedPokerGame from './TwoSidedPokerGame';
import TwoSidedPokerPreview from './TwoSidedPokerPreview';

const PLAY_HASH = '#play';

/** Entry screen in the GameGate style: name, facts, how a hand plays, rules, and the start button. #play opens the game. */
export default function TwoSidedPokerGate({ locale }: { locale: string }) {
  const t = tspCopy(locale);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const sync = () => setStarted(window.location.hash === PLAY_HASH);
    sync();
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => { window.removeEventListener('popstate', sync); window.removeEventListener('hashchange', sync); };
  }, []);

  if (started) return <TwoSidedPokerGame locale={locale} />;
  const start = () => { window.history.pushState(null, '', PLAY_HASH); setStarted(true); window.scrollTo(0, 0); };

  return (
    <div className={SHELL} style={{ ...accentVars(TSP_ACCENT, TSP_INK), backgroundImage: fog(TSP_GLOW_RGB) }}>
      <GameHeader backHref="/games" backLabel={t.back} title={t.title} subtitle={t.subtitle}><LanguageSwitcher compact dark /></GameHeader>
      <main className="relative z-10 mx-auto w-full max-w-[1000px] px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_340px]">
          <div>
            <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-(--accent)">{t.intro.kicker}</p>
            <h2 className="mt-2 text-4xl font-black tracking-[-0.05em] sm:text-5xl">{t.title}</h2>
            <p className="mt-3 max-w-xl break-keep text-sm leading-7 text-white/55 sm:text-base">{t.intro.tagline}</p>
            <dl className="mt-6 grid grid-cols-1 gap-2 min-[420px]:grid-cols-3">
              {t.intro.facts.map(([label, value]) => (
                <div key={label} className="rounded-[12px] border border-white/10 bg-white/[0.03] px-3.5 py-3">
                  <dt className="text-[10px] font-black tracking-[0.14em] text-white/40">{label}</dt>
                  <dd className="mt-1 break-keep text-[13px] font-bold leading-5">{value}</dd>
                </div>
              ))}
            </dl>
            <button type="button" onClick={start} className={`${BTN_ACCENT} mt-6 w-full py-4 text-base sm:w-auto sm:px-8`}><Bot size={18} />{t.intro.play}<Play size={14} className="fill-current" /></button>
            <Link href="/ranking/two-sided-poker" className="mt-3 flex w-fit items-center gap-1.5 rounded-full border border-(--accent)/40 bg-(--accent)/10 px-3 py-1.5 text-xs font-black text-(--accent) hover:bg-(--accent)/20 sm:ml-3 sm:mt-0 sm:inline-flex">{t.intro.ranking}</Link>
          </div>
          <div className="mx-auto flex w-[240px] justify-center sm:w-[300px] md:w-full [&>div]:w-full! [&>div]:rounded-2xl! [&>div]:border-white/10!"><TwoSidedPokerPreview /></div>
        </div>

        <section className="mt-10 rounded-[14px] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <h3 className="text-xs font-black tracking-[0.14em] text-white/45">{t.intro.howTitle}</h3>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {t.intro.steps.map(([title, body], i) => (
              <li key={title} className="rounded-[10px] border border-white/10 bg-black/30 p-3.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-(--accent) text-[11px] font-black text-(--accent-ink)">{i + 1}</span>
                <p className="mt-2.5 text-sm font-black">{title}</p>
                <p className="mt-1 break-keep text-xs leading-5 text-white/55">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-4 rounded-[14px] border border-(--accent)/30 bg-black/50 p-4 sm:p-5">
          <h3 className="text-xs font-black tracking-[0.14em] text-white/45">{t.intro.rules}</h3>
          <ol className="mt-3 flex flex-col gap-2">
            {t.ruleLines.map((rule, i) => (
              <li key={rule} className="flex gap-3 text-[13px] leading-6 text-white/75">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--accent)/20 text-[10px] font-black text-(--accent)">{i + 1}</span>
                <span className="break-keep">{rule}</span>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
}

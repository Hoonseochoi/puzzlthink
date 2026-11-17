"use client";

import { useEffect, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { BookOpen, Bot, KeyRound, Link2, Loader2, Play, UserRound, UsersRound } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import type { GameId } from '@/lib/gameCatalog';
import { isRoomCode } from '@/lib/room';
import { GAME_MODES } from './gameModes';
import { accentVars } from './ui/gameUi';
import SupportLink from './SupportLink';

const PLAY_HASH = '#play';

/**
 * A game's entry screen: how to start (against the AI, or with friends by room link or 4-digit code)
 * sits at the top, then the tutorial and the guide. The game opens only when the player starts it.
 * Starting adds #play to the URL, so the back button returns here and a reload keeps you in the game.
 * The guide stays in the server HTML for search engines.
 */
export default function GameGate({ game, hero, tutorial, guide, children, accent, ink = '#ffffff', tone = 'dark', tutorialKey }: {
  game: GameId;
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
  const router = useRouter();
  const modes = GAME_MODES[game];
  const [started, setStarted] = useState(false);
  const [creating, setCreating] = useState<string | null>(null); // label of the room being created
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState(false);

  useEffect(() => {
    const sync = () => setStarted(window.location.hash === PLAY_HASH);
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  const start = (query?: string) => {
    // The tutorial was just shown on this page, so the game should not pop it up again.
    if (tutorialKey) { try { localStorage.setItem(tutorialKey, '1'); } catch { /* Optional. */ } }
    const search = query ? `?${query}` : window.location.search;
    window.history.pushState(null, '', `${window.location.pathname}${search}${PLAY_HASH}`);
    setStarted(true);
    window.scrollTo({ top: 0 });
  };

  const createRoom = async (label: string, create: () => Promise<string>) => {
    setCreating(label);
    try { router.push(`${modes.path}/room/${await create()}`); } catch { setCreating(null); }
  };

  const join = (event: React.FormEvent) => {
    event.preventDefault();
    const value = code.trim().toLowerCase();
    if (!isRoomCode(value)) { setCodeError(true); return; }
    router.push(`${modes.path}/room/${value}`);
  };

  if (started) return <>{children}</>;

  const dark = tone === 'dark';
  const card = `rounded-[14px] border p-4 sm:p-5 ${dark ? 'border-white/10 bg-[#121217]/85' : 'border-black/10 bg-white/70'}`;
  const muted = dark ? 'text-white/55' : 'text-black/55';
  const secondary = `inline-flex items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm font-bold transition disabled:opacity-50 ${dark ? 'border-white/15 bg-white/5 text-white/85 hover:bg-white/10' : 'border-black/15 bg-white text-black/75 hover:bg-white/70'}`;
  const primary = 'inline-flex items-center justify-center gap-2 rounded-md bg-(--accent) px-5 py-3 text-sm font-extrabold text-(--accent-ink) shadow-[0_0_24px_var(--accent-glow)] transition hover:brightness-110';
  const hasRooms = modes.rooms.length > 0;

  return (
    <div className={`min-h-screen pb-24 ${dark ? 'bg-[#0b0b0e] text-[#e6e9f0]' : 'bg-[#f3f0e8] text-[#17201e]'}`} style={accentVars(accent, ink)}>
      <section className="px-4 pb-10 pt-10 sm:px-5 sm:pt-14">
        <div className="mx-auto max-w-4xl">
          {hero}

          {/* How to start: AI (or solo) and, for multiplayer games, friends by link or 4-digit code. */}
          <div id="play-modes" className={`mt-7 grid scroll-mt-20 gap-3 ${hasRooms ? 'md:grid-cols-2' : ''}`}>
            <section className={card}>
              <h3 className="flex items-center gap-2 text-base font-black">{modes.solo ? <UserRound size={17} className="text-(--accent)" /> : <Bot size={17} className="text-(--accent)" />}{t(modes.solo ? 'soloTitle' : 'aiTitle')}</h3>
              <p className={`mt-1 text-xs leading-5 ${muted}`}>{t(modes.solo ? 'soloDesc' : 'aiDesc')}</p>
              <div className="mt-4 flex flex-col gap-2">
                {modes.ai.map((option, i) => (
                  <button key={option.label} type="button" onClick={() => start(option.query)} className={i === 0 ? primary : secondary}>
                    <Play size={15} fill="currentColor" />{t(option.label)}
                  </button>
                ))}
              </div>
            </section>

            {hasRooms && (
              <section className={card}>
                <h3 className="flex items-center gap-2 text-base font-black"><UsersRound size={17} className="text-(--accent)" />{t('friendTitle')}</h3>
                <p className={`mt-1 text-xs leading-5 ${muted}`}>{t('friendDesc')}</p>
                <div className="mt-4 flex flex-col gap-2">
                  {modes.rooms.map((room) => (
                    <button key={room.label} type="button" disabled={creating !== null} onClick={() => createRoom(room.label, room.create)} className={secondary}>
                      {creating === room.label ? <Loader2 size={15} className="animate-spin" /> : <Link2 size={15} />}{creating === room.label ? t('creating') : t(room.label)}
                    </button>
                  ))}
                </div>
                <form onSubmit={join} className={`mt-4 border-t pt-4 ${dark ? 'border-white/10' : 'border-black/10'}`}>
                  <label htmlFor={`join-${game}`} className="flex items-center gap-1.5 text-xs font-black"><KeyRound size={13} className="text-(--accent)" />{t('joinTitle')}</label>
                  <div className="mt-2 flex gap-2">
                    <input
                      id={`join-${game}`} value={code} inputMode="numeric" autoComplete="off" maxLength={6} placeholder={t('codePlaceholder')}
                      onChange={(event) => { setCode(event.target.value.replace(/\s/g, '')); setCodeError(false); }}
                      className={`min-w-0 flex-1 rounded-md border px-3 py-2.5 text-center font-mono text-lg font-black tracking-[0.4em] outline-none focus:border-(--accent) ${dark ? 'border-white/15 bg-black/40 text-white placeholder:text-white/25' : 'border-black/15 bg-white placeholder:text-black/25'}`}
                    />
                    <button type="submit" className={primary}>{t('join')}</button>
                  </div>
                  {codeError && <p className="mt-2 text-xs font-bold text-[#ff6b5e]">{t('codeInvalid')}</p>}
                </form>
              </section>
            )}
          </div>

          {tutorial && <a href="#how-to-play" className={`mt-4 inline-flex items-center gap-2 text-sm font-bold underline-offset-4 hover:underline ${muted}`}><BookOpen size={15} />{t('howToPlay')}</a>}
        </div>
      </section>

      {tutorial && (
        <section id="how-to-play" className={`scroll-mt-20 border-t px-4 py-12 sm:px-5 ${dark ? 'border-white/10' : 'border-black/10'}`}>
          <div className="mx-auto max-w-4xl">
            <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-(--accent)">TUTORIAL</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] sm:text-3xl">{t('howToPlayTitle')}</h2>
            <div className="mt-6">{tutorial}</div>
          </div>
        </section>
      )}

      {guide}

      <section className={`border-t px-4 py-10 sm:px-5 ${dark ? 'border-white/10' : 'border-black/10'}`}><SupportLink tone={tone} /></section>

      {/* Always-visible start while reading. */}
      <div data-gate-bar className={`fixed inset-x-0 bottom-0 z-30 border-t px-4 py-3 backdrop-blur ${dark ? 'border-white/10 bg-black/75' : 'border-black/10 bg-[#f3f0e8]/90'}`}>
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <p className={`hidden text-xs font-bold sm:block ${muted}`}>{t('startHint')}</p>
          <div className="flex w-full gap-2 sm:w-auto">
            {hasRooms && <a href="#play-modes" className={`flex-1 sm:flex-none ${secondary} !py-2.5`}><UsersRound size={15} />{t('friendTitle')}</a>}
            <button type="button" onClick={() => start(modes.ai[0].query)} className={`flex-1 sm:flex-none ${primary} !py-2.5`}><Play size={15} fill="currentColor" />{t(modes.solo ? 'soloPlay' : 'aiPlay')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

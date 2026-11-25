"use client";

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { BookOpen, Bot, ChevronUp, DoorOpen, House, KeyRound, Link2, Loader2, Play, RefreshCw, UserRound, UsersRound } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import type { GameId } from '@/lib/gameCatalog';
import { isRoomCode } from '@/lib/room';
import { type OpenRoomRow, listOpenRooms, saveTitle } from '@/lib/openRooms';
import OpenRoomPanel from './OpenRoomPanel';
import OpenPracticeShell from './OpenPractice';
import AuthButton from './AuthButton';
import { useAuth } from './AuthProvider';
import { GAME_MODES } from './gameModes';
import { accentVars } from './ui/gameUi';

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
  const tc = useTranslations('Common');
  const router = useRouter();
  const modes = GAME_MODES[game];
  const [started, setStarted] = useState(false);
  const [creating, setCreating] = useState<string | null>(null); // label of the room being created
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState(false);
  const [openRoom, setOpenRoom] = useState<{ code: string; variant: number } | null>(null);
  const [openRooms, setOpenRooms] = useState<OpenRoomRow[] | null>(null);
  const [listTick, setListTick] = useState(0);
  const [roomTitle, setRoomTitle] = useState(''); // title for the open room about to be created
  const [menuOpen, setMenuOpen] = useState(false); // the bottom bar's start menu
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, configured } = useAuth();
  const signedIn = !!user || !configured; // open rooms need an account so results are kept for both sides

  // Open rooms waiting for players: refreshed every 10 s while the entry screen is showing.
  useEffect(() => {
    if (started || !modes.useRoom) return;
    let alive = true;
    const load = () => { if (document.visibilityState === 'visible') listOpenRooms(game).then((rows) => { if (alive) setOpenRooms(rows); }); };
    load();
    const timer = window.setInterval(load, 10_000);
    return () => { alive = false; window.clearInterval(timer); };
  }, [started, game, modes.useRoom, listTick]);

  useEffect(() => {
    const sync = () => {
      setStarted(window.location.hash === PLAY_HASH);
      const params = new URLSearchParams(window.location.search);
      const code = params.get('open');
      setOpenRoom(code && isRoomCode(code) && window.location.hash === PLAY_HASH ? { code, variant: Number(params.get('v')) || 0 } : null);
    };
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  /** Solo play query for an open room's variant (e.g. WallGo 1:1 vs 1:1:1). */
  const playQuery = (variant: number) => modes.rooms[variant]?.play ?? modes.ai[0]?.query;
  const enterOpenRoom = (code: string, variant: number) => {
    const base = playQuery(variant);
    start(`${base ? `${base}&` : ''}open=${code}&v=${variant}`);
    setOpenRoom({ code, variant });
  };
  const createOpenRoom = async (variant: number) => {
    const label = `open-${variant}`;
    setCreating(label);
    try {
      const code = await modes.rooms[variant].create();
      if (roomTitle.trim()) saveTitle(code, roomTitle.trim());
      setCreating(null);
      enterOpenRoom(code, variant);
    } catch { setCreating(null); }
  };

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

  // The start menu closes on a tap outside it or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (event: PointerEvent) => { if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [menuOpen]);

  if (started) {
    if (!openRoom) return <>{children}</>;
    return <div style={accentVars(accent, ink)}><div className="lg:pl-[272px]"><OpenPracticeShell game={game}>{children}</OpenPracticeShell></div><OpenRoomPanel game={game} code={openRoom.code} variant={openRoom.variant} /></div>;
  }

  const dark = tone === 'dark';
  const card = `rounded-2xl border p-4 sm:p-5 ${dark ? 'border-white/10 bg-[#121217]/85' : 'border-black/10 bg-white/70'}`;
  const muted = dark ? 'text-white/55' : 'text-black/55';
  const secondary = `inline-flex items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm font-bold transition disabled:opacity-50 ${dark ? 'border-white/15 bg-white/5 text-white/85 hover:bg-white/10' : 'border-black/15 bg-white text-black/75 hover:bg-white/70'}`;
  const primary = 'inline-flex items-center justify-center gap-2 rounded-md bg-(--accent) px-5 py-3 text-sm font-extrabold text-(--accent-ink) shadow-[0_0_24px_var(--accent-glow)] transition hover:brightness-110';
  const hasRooms = modes.rooms.length > 0;

  return (
    <div className={`relative min-h-screen pb-24 ${dark ? 'bg-[#0b0b0e] text-[#e6e9f0]' : 'bg-[#f3f0e8] text-[#17201e]'}`} style={accentVars(accent, ink)}>
      {/* A soft wash of the game's colour behind the title. */}
      <div aria-hidden className={`pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,color-mix(in_srgb,var(--accent)_22%,transparent),transparent_70%)] ${dark ? '' : 'opacity-60'}`} />
      <section className="relative px-4 pb-10 pt-4 sm:px-5 sm:pt-6">
        <div className="mx-auto max-w-4xl">
          {/* Shared game links land here with the site header hidden: one tap back to every other game. */}
          <Link href="/" aria-label={tc('home')} title={tc('home')} className={`mb-6 inline-flex items-center gap-2 rounded-full border py-1.5 pl-2 pr-3.5 text-xs font-black tracking-[-0.02em] transition sm:mb-8 ${dark ? 'border-white/12 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white' : 'border-black/10 bg-white/70 text-black/75 hover:bg-white hover:text-black'}`}>
            <span className={`grid h-6 w-6 place-items-center rounded-full ${dark ? 'bg-white/10' : 'bg-black/[0.06]'}`}><House size={13} /></span>
            PUZZLTHINK
          </Link>
          {hero}

          {/* How to start: AI (or solo) and, for multiplayer games, friends by link or 4-digit code. */}
          <div id="play-modes" className={`mt-6 grid scroll-mt-20 gap-3 ${hasRooms ? 'md:grid-cols-2' : ''}`}>
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

          {/* Open rooms: anyone can join; play solo while it fills, the host starts whenever ready. */}
          {modes.useRoom && (
            <section className={`${card} mt-3`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 text-base font-black"><DoorOpen size={17} className="text-(--accent)" />{t('openTitle')}</h3>
                  <p className={`mt-1 text-xs leading-5 ${muted}`}>{t('openDesc')}</p>
                </div>
                <button type="button" onClick={() => setListTick((n) => n + 1)} className={`shrink-0 rounded-md p-2 ${muted} hover:text-(--accent)`} aria-label={t('openRefresh')}><RefreshCw size={15} /></button>
              </div>
              <div className="mt-4 space-y-2">
                {openRooms === null ? <p className={`flex items-center gap-2 text-xs ${muted}`}><Loader2 size={13} className="animate-spin" />{t('openLoading')}</p>
                  : openRooms.length === 0 ? <p className={`rounded-md border border-dashed px-3 py-3 text-center text-xs ${dark ? 'border-white/15' : 'border-black/15'} ${muted}`}>{t('openEmpty')}</p>
                    : openRooms.map((room) => {
                      const full = room.players >= room.capacity;
                      return (
                        <div key={room.code} className={`flex items-center gap-3 rounded-md border px-3 py-2.5 ${dark ? 'border-white/10 bg-black/30' : 'border-black/10 bg-white'}`}>
                          <span className="min-w-0 flex-1 truncate text-sm font-bold">{room.title || t('openHost', { name: room.host })}{modes.rooms.length > 1 && modes.rooms[room.variant] ? <span className={`ml-1.5 text-xs ${muted}`}>{t(`short_${modes.rooms[room.variant].label}`)}</span> : null}</span>
                          <span className={`flex shrink-0 items-center gap-1 font-mono text-xs font-black ${full ? muted : 'text-(--accent)'}`} title={t('openSeats')}><UsersRound size={13} />{room.players}/{room.capacity}</span>
                          <button type="button" disabled={full || !signedIn} onClick={() => enterOpenRoom(room.code, room.variant)} className={`${primary} !px-3 !py-1.5 text-xs disabled:opacity-40`}>{full ? t('openFull') : t('openJoin')}</button>
                        </div>
                      );
                    })}
              </div>
              {!signedIn && (
                <div className={`mt-4 flex flex-col items-center gap-2 rounded-md border px-3 py-3 text-center sm:flex-row sm:justify-between sm:text-left ${dark ? 'border-(--accent)/30 bg-(--accent)/[.06]' : 'border-black/10 bg-white'}`}>
                  <p className={`break-keep text-xs font-bold leading-5 ${muted}`}>{t('openLogin')}</p>
                  <AuthButton source="game_open" />
                </div>
              )}
              {/* Name the room and create it on one line (games with several room types get one button each). */}
              <div className={`mt-4 flex flex-col gap-2 ${modes.rooms.length > 1 ? '' : 'sm:flex-row'}`}>
                <input
                  value={roomTitle} maxLength={30} onChange={(event) => setRoomTitle(event.target.value)} disabled={!signedIn}
                  onKeyDown={(event) => { if (event.key === 'Enter' && modes.rooms.length === 1 && creating === null && signedIn) createOpenRoom(0); }}
                  placeholder={t('openTitlePlaceholder')} aria-label={t('openTitleLabel')}
                  className={`min-w-0 flex-1 rounded-md border px-3 py-2.5 text-sm font-bold outline-none focus:border-(--accent) disabled:opacity-40 ${dark ? 'border-white/15 bg-black/30 text-white placeholder:text-white/35' : 'border-black/15 bg-white placeholder:text-black/35'}`}
                />
                <div className={`grid gap-2 ${modes.rooms.length > 1 ? 'grid-cols-2' : 'sm:shrink-0'}`}>
                  {modes.rooms.map((room, variant) => (
                    <button key={room.label} type="button" disabled={creating !== null || !signedIn} onClick={() => createOpenRoom(variant)} className={`${secondary} whitespace-nowrap`}>
                      {creating === `open-${variant}` ? <Loader2 size={15} className="animate-spin" /> : <DoorOpen size={15} />}
                      {creating === `open-${variant}` ? t('creating') : modes.rooms.length > 1 ? t('openCreateFor', { label: t(`short_${room.label}`) }) : t('openCreate')}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

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


      {/* Always-visible start while reading. */}
      <div data-gate-bar className={`fixed inset-x-0 bottom-0 ${menuOpen ? 'z-[60]' : 'z-30'} border-t px-4 py-3 backdrop-blur ${dark ? 'border-white/10 bg-black/75' : 'border-black/10 bg-[#f3f0e8]/90'}`}>
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <p className={`hidden text-xs font-bold sm:block ${muted}`}>{t('startHint')}</p>
          <div className="flex w-full gap-2 sm:w-auto">
            {hasRooms && <a href="#play-modes" className={`flex-1 sm:flex-none ${secondary} !py-2.5`}><UsersRound size={15} />{t('friendTitle')}</a>}
            {/* Every way to start, in one menu (a game with a single way just starts). */}
            {modes.ai.length + modes.rooms.length <= 1 ? (
              <button type="button" onClick={() => start(modes.ai[0].query)} className={`flex-1 sm:flex-none ${primary} !py-2.5`}><Play size={15} fill="currentColor" />{t(modes.solo ? 'soloPlay' : 'aiPlay')}</button>
            ) : (
              <div ref={menuRef} className="relative flex flex-1 sm:flex-none">
                <button type="button" aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)} className={`w-full ${primary} !py-2.5`}>
                  <Play size={15} fill="currentColor" />{t('startGame')}<ChevronUp size={15} className={`transition ${menuOpen ? '' : 'rotate-180'}`} />
                </button>
                {menuOpen && (
                  <div role="menu" className={`absolute bottom-full right-0 mb-2 w-[min(320px,calc(100vw-2rem))] overflow-hidden rounded-[14px] border p-2 shadow-[0_18px_50px_rgba(0,0,0,.45)] ${dark ? 'border-white/12 bg-[#16161c]' : 'border-black/10 bg-white'}`}>
                    <p className={`flex items-center gap-1.5 px-2 pb-1 pt-1 text-[10px] font-black tracking-[0.14em] ${muted}`}>{modes.solo ? <UserRound size={12} /> : <Bot size={12} />}{t(modes.solo ? 'soloTitle' : 'aiTitle')}</p>
                    {modes.ai.map((option, i) => (
                      <button key={option.label} type="button" role="menuitem" onClick={() => { setMenuOpen(false); start(option.query); }}
                        className={`flex w-full items-center gap-2 rounded-[10px] px-3 py-3 text-left text-sm font-black transition ${i === 0 ? 'bg-(--accent) text-(--accent-ink)' : dark ? 'text-white/85 hover:bg-white/8' : 'text-black/75 hover:bg-black/5'}`}>
                        <Play size={14} fill="currentColor" className="shrink-0" />{t(option.label)}
                      </button>
                    ))}
                    {hasRooms && <>
                      <p className={`mt-2 flex items-center gap-1.5 border-t px-2 pb-1 pt-3 text-[10px] font-black tracking-[0.14em] ${dark ? 'border-white/10' : 'border-black/10'} ${muted}`}><UsersRound size={12} />{t('friendTitle')}</p>
                      {modes.rooms.map((room) => (
                        <button key={room.label} type="button" role="menuitem" disabled={creating !== null} onClick={() => createRoom(room.label, room.create)}
                          className={`flex w-full items-center gap-2 rounded-[10px] px-3 py-3 text-left text-sm font-black transition disabled:opacity-50 ${dark ? 'text-white/85 hover:bg-white/8' : 'text-black/75 hover:bg-black/5'}`}>
                          {creating === room.label ? <Loader2 size={14} className="shrink-0 animate-spin" /> : <Link2 size={14} className="shrink-0" />}{creating === room.label ? t('creating') : t(room.label)}
                        </button>
                      ))}
                      <a href="#play-modes" role="menuitem" onClick={() => setMenuOpen(false)}
                        className={`flex w-full items-center gap-2 rounded-[10px] px-3 py-3 text-sm font-bold transition ${dark ? 'text-white/60 hover:bg-white/8' : 'text-black/55 hover:bg-black/5'}`}>
                        <KeyRound size={14} className="shrink-0" />{t('joinTitle')}
                      </a>
                    </>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

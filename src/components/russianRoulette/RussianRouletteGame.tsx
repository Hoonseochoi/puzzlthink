"use client";

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, BookOpen, Bot, KeyRound, Link2, RotateCcw, UsersRound } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { prepareRussianRouletteRoom, RUSSIAN_ROULETTE_ROOM } from '@/hooks/useRussianRouletteRoom';
import { useLocalRoom } from '@/hooks/useRealtimeRoom';
import { createRussianRouletteRoom, type RRLevel } from '@/lib/russianRouletteRoom';
import { reportGame } from '@/lib/stats';
import LanguageSwitcher from '../LanguageSwitcher';
import RussianRouletteResult from './RussianRouletteResult';
import { russianRouletteFiringDuration } from './firing';
import RussianRouletteTable from './RussianRouletteTable';
import RussianRouletteTutorial from './RussianRouletteTutorial';
import { RR_BG, RR_PANEL, RR_TITLE } from './theme';

const LEVELS: RRLevel[] = ['easy', 'normal', 'hard'];
const TUTORIAL_KEY = 'puzzlthink_russian_roulette_tutorial_seen';

export default function RussianRouletteGame() {
  const t = useTranslations('RussianRoulette');
  const to = useTranslations('RussianRouletteOnline');
  const router = useRouter();
  const [level, setLevel] = useState<RRLevel>('normal');
  const [roomCode, setRoomCode] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  const create = useCallback(() => createRussianRouletteRoom({ id: 'me', name: t('you'), at: 0 }, { solo: true, aiLevel: level }), [level, t]);
  const { state, dispatch, reset } = useLocalRoom(RUSSIAN_ROULETTE_ROOM, create);

  useEffect(() => {
    const timer = window.setTimeout(() => { try { if (!localStorage.getItem(TUTORIAL_KEY)) setShowTutorial(true); } catch { /* optional */ } }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  // Survivors win, the two players who are shot lose. Reported once per game (room sid).
  const finished = state?.phase === 'finished';
  useEffect(() => {
    if (!finished || !state) return;
    reportGame(`russian_roulette-ai-${state.sid}`, 'russian_roulette', 'ai', state.game.hits.includes(0) ? 'loss' : 'win', { level: state.aiLevel, round: state.game.round }, { revealDelayMs: russianRouletteFiringDuration(state.game.shots.length) + 600 });
  }, [finished, state]);
  const closeTutorial = () => { try { localStorage.setItem(TUTORIAL_KEY, '1'); } catch { /* optional */ } setShowTutorial(false); };
  const join = () => { const code = roomCode.trim().toLowerCase(); if (/^[a-z0-9]{6}$/.test(code)) router.push(`/russian-roulette/room/${code}`); };

  return <div className="min-h-screen text-[#edf5f7]" style={{ background: RR_BG }}>
    <header className="flex min-h-16 items-center justify-between gap-3 border-b border-white/10 bg-black/35 px-4 py-2 backdrop-blur md:px-8"><div className="flex min-w-0 items-center gap-3"><Link href="/" className="flex items-center gap-2 text-sm font-bold text-white/65 hover:text-white"><ArrowLeft size={17} /><span className="hidden sm:inline">PUZZLTHINK</span></Link><span className="h-5 w-px bg-white/15" /><strong className="truncate text-lg font-black tracking-tight sm:text-xl">{t('title')}</strong><span className="hidden text-[9px] font-black tracking-[.18em] text-[#65e5ff]/60 sm:inline">RUSSIAN ROULETTE</span></div><div className="flex items-center gap-1.5"><button onClick={() => setShowTutorial(true)} className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white/75"><BookOpen size={14} /><span className="hidden sm:inline">{t('howToPlay')}</span></button><LanguageSwitcher compact dark /><button onClick={reset} className="flex items-center gap-2 rounded-full bg-[#65e5ff] px-3 py-2 text-xs font-black text-[#071016]"><RotateCcw size={14} /><span className="hidden sm:inline">{t('newGame')}</span></button></div></header>
    <main className="mx-auto w-full max-w-[1240px] px-3 py-4 sm:px-5 lg:py-7">
      {state && <RussianRouletteTable room={state} mySeat={0} onAction={dispatch} online={false} />}
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <section className={RR_PANEL}><div className="flex items-center gap-2"><Bot size={14} className="text-[#65e5ff]" /><h2 className={RR_TITLE}>{t('aiLevel')}</h2></div><div className="mt-3 grid grid-cols-3 gap-2">{LEVELS.map((value) => <button key={value} onClick={() => setLevel(value)} className={`rounded-[10px] py-2.5 text-xs font-black ${level === value ? 'bg-[#65e5ff] text-[#071016]' : 'border border-white/10 text-white/45'}`}>{t(`level_${value}`)}</button>)}</div></section>
        <section className={RR_PANEL}><div className="flex items-center gap-2"><UsersRound size={14} className="text-[#a978ed]" /><h2 className={RR_TITLE}>{t('friendTitle')}</h2></div><p className="mt-2 text-[11px] leading-5 text-white/45">{t('friendDesc')}</p><button onClick={() => router.push(`/russian-roulette/room/${prepareRussianRouletteRoom()}`)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#a978ed] py-2.5 text-xs font-black text-white"><Link2 size={14} />{t('createRoom')}</button></section>
        <section className={RR_PANEL}><div className="flex items-center gap-2"><KeyRound size={14} className="text-[#ffcf58]" /><h2 className={RR_TITLE}>{to('joinCode')}</h2></div><form onSubmit={(event) => { event.preventDefault(); join(); }} className="mt-3 flex gap-2"><input value={roomCode} onChange={(event) => setRoomCode(event.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6))} placeholder={to('codePlaceholder')} aria-label={to('joinCode')} className="min-w-0 flex-1 rounded-[10px] border border-white/10 bg-black/25 px-3 py-2.5 font-mono text-sm uppercase tracking-[.18em] outline-none focus:border-[#ffcf58]/50" /><button disabled={!/^[a-zA-Z0-9]{6}$/.test(roomCode)} className="rounded-[10px] bg-[#ffcf58] px-4 text-xs font-black text-[#211806] disabled:opacity-30">{to('join')}</button></form></section>
      </div>
    </main>
    {state?.phase === 'finished' && <RussianRouletteResult room={state} mySeat={0} onAgain={reset} />}
    {showTutorial && <RussianRouletteTutorial onClose={closeTutorial} />}
  </div>;
}

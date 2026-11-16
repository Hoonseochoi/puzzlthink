"use client";

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BookOpen, Bot, KeyRound, Link2, RotateCcw, UsersRound } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { prepareRussianRouletteRoom, RUSSIAN_ROULETTE_ROOM } from '@/hooks/useRussianRouletteRoom';
import { useLocalRoom } from '@/hooks/useRealtimeRoom';
import { createRussianRouletteRoom, type RRLevel } from '@/lib/russianRouletteRoom';
import { reportGame } from '@/lib/stats';
import LanguageSwitcher from '../LanguageSwitcher';
import WallGoShards from '../WallGoShards';
import GameHeader from '../ui/GameHeader';
import { BTN, BTN_ACCENT, CALLOUT, INPUT, PANEL, PANEL_TITLE, SHELL, seg } from '../ui/gameUi';
import RussianRouletteResult from './RussianRouletteResult';
import { russianRouletteFiringDuration } from './firing';
import RussianRouletteTable from './RussianRouletteTable';
import RussianRouletteTutorial from './RussianRouletteTutorial';
import { RR_ROOT_STYLE, RR_SHARD_TINT } from './theme';

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

  return <div className={SHELL} style={RR_ROOT_STYLE}>
    <WallGoShards tint={RR_SHARD_TINT} />
    <GameHeader backHref="/" backLabel="PUZZLTHINK" title={t('title')} subtitle="RUSSIAN ROULETTE">
      <button onClick={() => setShowTutorial(true)} className={BTN}><BookOpen size={14} /><span className="hidden sm:inline">{t('howToPlay')}</span></button>
      <LanguageSwitcher compact dark />
      <button onClick={reset} className={BTN_ACCENT}><RotateCcw size={14} /><span className="hidden sm:inline">{t('newGame')}</span></button>
    </GameHeader>
    <main className="relative z-10 mx-auto w-full max-w-[1240px] px-3 py-4 sm:px-5 lg:py-7">
      {state && <RussianRouletteTable room={state} mySeat={0} onAction={dispatch} online={false} />}
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <section className={PANEL}><div className="flex items-center gap-2"><Bot size={14} className="text-(--accent)" /><h2 className={PANEL_TITLE}>{t('aiLevel')}</h2></div><div className="mt-3 grid grid-cols-3 gap-2">{LEVELS.map((value) => <button key={value} onClick={() => setLevel(value)} className={`py-2.5 ${seg(level === value)}`}>{t(`level_${value}`)}</button>)}</div></section>
        <section className={CALLOUT}><div className="flex items-center gap-2"><UsersRound size={14} className="text-(--accent)" /><h2 className={PANEL_TITLE}>{t('friendTitle')}</h2></div><p className="mt-2 text-[11px] leading-5 text-white/50">{t('friendDesc')}</p><button onClick={() => router.push(`/russian-roulette/room/${prepareRussianRouletteRoom()}`)} className={`mt-3 w-full py-2.5 ${BTN_ACCENT}`}><Link2 size={14} />{t('createRoom')}</button></section>
        <section className={PANEL}><div className="flex items-center gap-2"><KeyRound size={14} className="text-(--accent)" /><h2 className={PANEL_TITLE}>{to('joinCode')}</h2></div><form onSubmit={(event) => { event.preventDefault(); join(); }} className="mt-3 flex gap-2"><input value={roomCode} onChange={(event) => setRoomCode(event.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6))} placeholder={to('codePlaceholder')} aria-label={to('joinCode')} className={`${INPUT} font-mono uppercase tracking-[.18em]`} /><button disabled={!/^[a-zA-Z0-9]{6}$/.test(roomCode)} className={`px-4 ${BTN_ACCENT}`}>{to('join')}</button></form></section>
      </div>
    </main>
    {state?.phase === 'finished' && <RussianRouletteResult room={state} mySeat={0} onAgain={reset} />}
    {showTutorial && <RussianRouletteTutorial onClose={closeTutorial} />}
  </div>;
}

"use client";

import BugReport from '@/components/BugReport';
import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BookOpen, Bot, RotateCcw} from 'lucide-react';
import { RUSSIAN_ROULETTE_ROOM } from '@/hooks/useRussianRouletteRoom';
import { useLocalRoom } from '@/hooks/useRealtimeRoom';
import { createRussianRouletteRoom, type RRLevel } from '@/lib/russianRouletteRoom';
import { reportGame } from '@/lib/stats';
import LanguageSwitcher from '../LanguageSwitcher';
import WallGoShards from '../WallGoShards';
import GameHeader from '../ui/GameHeader';
import { roomPlayers } from '@/components/ui/PlayerStrip';
import { BTN, BTN_ACCENT, PANEL, PANEL_TITLE, SHELL, seg } from '../ui/gameUi';
import RussianRouletteResult from './RussianRouletteResult';
import { russianRouletteFiringDuration } from './firing';
import RussianRouletteTable from './RussianRouletteTable';
import RouletteReplay from './RouletteReplay';
import RussianRouletteTutorial from './RussianRouletteTutorial';
import { RR_ROOT_STYLE, RR_SHARD_TINT } from './theme';
import GameUpdates from '@/components/GameUpdates';

const LEVELS: RRLevel[] = ['easy', 'normal', 'hard'];
const TUTORIAL_KEY = 'puzzlthink_russian_roulette_tutorial_seen';

export default function RussianRouletteGame() {
  const t = useTranslations('RussianRoulette');
  const [level, setLevel] = useState<RRLevel>('normal');
  const [showTutorial, setShowTutorial] = useState(false);
  const create = useCallback(() => createRussianRouletteRoom({ id: 'me', name: t('you'), at: 0 }, { solo: true, aiLevel: level }), [level, t]);
  const { state, dispatch, reset } = useLocalRoom(RUSSIAN_ROULETTE_ROOM, create);
  const [replaying, setReplaying] = useState(false);
  if (replaying && state?.phase !== 'finished') setReplaying(false); // a new game closes the replay
  const showReplay = replaying && state?.phase === 'finished';
  const seatName = (seat: number) => (seat === 0 ? t('you') : state?.seats[seat]?.name ?? `P${seat + 1}`);

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

  return <div className={SHELL} style={RR_ROOT_STYLE}>
    <WallGoShards tint={RR_SHARD_TINT} />
    <GameHeader players={roomPlayers(state, true)} me={0} backHref="/" backLabel="PUZZLTHINK" title={t('title')} subtitle="RUSSIAN ROULETTE">
      <button onClick={() => setShowTutorial(true)} className={BTN}><BookOpen size={14} /><span className="hidden sm:inline">{t('howToPlay')}</span></button>
      <GameUpdates game="russian_roulette" /><BugReport /><LanguageSwitcher compact dark />
      <button onClick={reset} className={BTN_ACCENT}><RotateCcw size={14} /><span className="hidden sm:inline">{t('newGame')}</span></button>
    </GameHeader>
    <main className="relative z-10 mx-auto w-full max-w-[1240px] px-3 py-4 sm:px-5 lg:py-7">
      {showReplay && state && <RouletteReplay game={state.game} name={seatName} open={showReplay} onClose={() => setReplaying(false)} />}
      {/* Kept mounted behind the replay so the firing sequence doesn't play again. */}
      {state && <div className={showReplay ? 'hidden' : ''}><RussianRouletteTable room={state} mySeat={0} onAction={dispatch} online={false} /></div>}
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <section className={PANEL}><div className="flex items-center gap-2"><Bot size={14} className="text-(--accent)" /><h2 className={PANEL_TITLE}>{t('aiLevel')}</h2></div><div className="mt-3 grid grid-cols-3 gap-2">{LEVELS.map((value) => <button key={value} onClick={() => setLevel(value)} className={`py-2.5 ${seg(level === value)}`}>{t(`level_${value}`)}</button>)}</div></section>
      </div>
    </main>
    {state?.phase === 'finished' && <RussianRouletteResult room={state} mySeat={0} onAgain={reset} onReplay={() => setReplaying(true)} hidden={showReplay} />}
    {showTutorial && <RussianRouletteTutorial onClose={closeTutorial} />}
  </div>;
}

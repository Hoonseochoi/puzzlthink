"use client";

import { useCallback, useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { RotateCcw } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Shards from '@/components/WallGoShards';
import GameHeader from '@/components/ui/GameHeader';
import { roomPlayers } from '@/components/ui/PlayerStrip';
import { BTN_ACCENT, SHELL, STAGE, accentVars, fog } from '@/components/ui/gameUi';
import { useLocalRoom } from '@/hooks/useRealtimeRoom';
import { FT_ROOM } from '@/hooks/useFourThreeRoom';
import { createFtRoom, finalists, missionSucceeded, outcomeFor } from '@/lib/fourThreeRoom';
import { seatOf } from '@/lib/room';
import { reportGame } from '@/lib/stats';
import { FT_ACCENT, FT_INK } from './FourThreeParts';
import FourThreeResult from './FourThreeResult';
import FourThreeTable from './FourThreeTable';

/** You and two ally AI players against the Special Guest AI, four rounds. */
export default function FourThreeGame() {
  const t = useTranslations('FourThree');
  const locale = useLocale();
  const create = useCallback(() => createFtRoom({ id: 'me', name: t('you'), at: 0 }, { solo: true, lang: locale === 'en' ? 'en' : 'ko' }), [t, locale]);
  const { state, dispatch, reset } = useLocalRoom(FT_ROOM, create);
  const mySeat = state ? seatOf(state, 'me') : null;

  const reported = useRef<string | null>(null);
  useEffect(() => {
    if (state?.phase !== 'finished' || mySeat === null || reported.current === state.sid) return;
    reported.current = state.sid;
    const through = finalists(state);
    reportGame(`four-three-ai-${state.sid}`, 'four_three', 'ai', outcomeFor(state, mySeat), {
      mission: missionSucceeded(state) ? 'ok' : 'fail', pieces: state.pieces[mySeat], through: through.includes(mySeat),
    });
  }, [state, mySeat]);

  return (
    <div className={SHELL} style={{ ...accentVars(FT_ACCENT, FT_INK), backgroundImage: fog('255, 181, 46') }}>
      <Shards />
      <GameHeader players={roomPlayers(state, true)} me={0} backHref="/" backLabel="PUZZLTHINK" title={t('title')} subtitle={t('subtitle')}>
        <BugReport /><LanguageSwitcher compact dark />
        <button type="button" onClick={reset} className={BTN_ACCENT}><RotateCcw size={14} /><span className="hidden sm:inline">{t('newGame')}</span></button>
      </GameHeader>
      <main className="relative z-10 mx-auto w-full max-w-[860px] px-3 py-3 sm:px-4 sm:py-5 lg:py-8">
        <section className={STAGE}>{state && <FourThreeTable room={state} mySeat={mySeat} onAction={dispatch} />}</section>
      </main>
      {state?.phase === 'finished' && <FourThreeResult room={state} mySeat={mySeat} onAgain={reset} exitPath="/" />}
    </div>
  );
}

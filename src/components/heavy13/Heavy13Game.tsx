"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BookOpen, Link2, RotateCcw, Sparkles } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import type { AiLevel } from '@/lib/heavy13';
import { createH13Room } from '@/lib/heavy13Room';
import { ranking } from '@/lib/heavy13';
import { reportGame } from '@/lib/stats';
import { H13_ROOM, prepareHeavy13Room } from '@/hooks/useHeavy13Room';
import { useLocalRoom } from '@/hooks/useRealtimeRoom';
import LanguageSwitcher from '../LanguageSwitcher';
import WallGoShards from '../WallGoShards';
import GameHeader from '../ui/GameHeader';
import { BTN, BTN_ACCENT, CALLOUT, MAIN, NOTE, PANEL, PANEL_TITLE, SHELL, STAGE, seg } from '../ui/gameUi';
import Heavy13Result from './Heavy13Result';
import Heavy13Table from './Heavy13Table';
import Heavy13Tutorial from './Heavy13Tutorial';
import { H_ROOT_STYLE, SHARD_TINT } from './theme';

const LEVELS: AiLevel[] = ['easy', 'normal', 'hard'];
const TUTORIAL_KEY = 'puzzlthink_heavy13_tutorial_seen';

export default function Heavy13Game() {
  const t = useTranslations('Heavy13');
  const router = useRouter();
  const [level, setLevel] = useState<AiLevel>('normal');
  const create = useCallback(() => createH13Room({ id: 'me', name: t('you'), at: 0 }, { solo: true, aiLevel: level }), [level, t]);
  const { state, dispatch, reset } = useLocalRoom(H13_ROOM, create);
  const [showTutorial, setShowTutorial] = useState(false);
  const mySeat = 0;

  // Report a finished game once, when the room moves into "finished".
  const prevPhase = useRef<string | null>(null);
  useEffect(() => {
    const phase = state?.phase ?? null;
    if (phase === 'finished' && prevPhase.current && prevPhase.current !== 'finished' && mySeat !== null && state) {
      const rank = ranking(state.game).indexOf(0) + 1;
      reportGame(`heavy13-ai-${state.sid}`, 'heavy13', 'ai', rank === 1 ? 'win' : rank >= 6 ? 'loss' : 'draw', { rank, penalty: state.game.players[0].penalty, level: state.aiLevel });
    }
    prevPhase.current = phase;
  });
  useEffect(() => {
    const timer = window.setTimeout(() => { try { if (!localStorage.getItem(TUTORIAL_KEY)) setShowTutorial(true); } catch { /* optional */ } }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const closeTutorial = () => { try { localStorage.setItem(TUTORIAL_KEY, '1'); } catch { /* optional */ } setShowTutorial(false); };

  return (
    <div className={SHELL} style={H_ROOT_STYLE}>
      <WallGoShards tint={SHARD_TINT} />
      <GameHeader backHref="/" backLabel="PUZZLTHINK" title={t('title')} subtitle="HEAVY 13">
        <button onClick={() => setShowTutorial(true)} className={BTN}><BookOpen size={14} /><span className="hidden sm:inline">{t('howToPlay')}</span></button>
        <LanguageSwitcher compact dark />
        <button onClick={reset} className={BTN_ACCENT}><RotateCcw size={14} /><span className="hidden sm:inline">{t('newGame')}</span></button>
      </GameHeader>
      <main className={MAIN}>
        <section className={`min-w-0 ${STAGE}`}>
          {state && <Heavy13Table room={state} mySeat={0} onAction={dispatch} online={false} />}
        </section>
        <aside className="flex flex-col gap-4">
          <section className={CALLOUT}>
            <div className="flex items-center gap-2"><Link2 size={14} className="text-(--accent)" /><h2 className={PANEL_TITLE}>{t('friendTitle')}</h2></div>
            <p className="mt-2 text-[11px] leading-5 text-white/50">{t('friendDesc')}</p>
            <button onClick={() => router.push(`/heavy13/room/${prepareHeavy13Room()}`)} className={`mt-3 w-full py-2.5 ${BTN_ACCENT}`}>{t('createRoom')}</button>
          </section>
          <section className={PANEL}>
            <h2 className={PANEL_TITLE}>{t('aiLevel')}</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">{LEVELS.map((l) => <button key={l} onClick={() => setLevel(l)} className={`p-2.5 ${seg(level === l)}`}>{t(`level_${l}`)}</button>)}</div>
            <p className="mt-2 text-[10px] text-white/35">{t('levelHint')}</p>
          </section>
          <section className={NOTE}>
            <div className="mb-3 flex items-center gap-2"><Sparkles size={15} className="text-(--accent)" /><h2 className={PANEL_TITLE}>{t('quickRules')}</h2></div>
            <ol className="space-y-3 text-xs leading-relaxed text-white/65">{['quick1', 'quick2', 'quick3', 'quick4', 'quick5'].map((k, i) => <li key={k} className="flex gap-3"><span className="font-mono text-(--accent)">0{i + 1}</span><span>{t(k)}</span></li>)}</ol>
          </section>
        </aside>
      </main>
      {state?.phase === 'finished' && <Heavy13Result room={state} mySeat={0} onAgain={reset} exitPath="/" />}
      {showTutorial && <Heavy13Tutorial onClose={closeTutorial} />}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, BookOpen, Link2, RotateCcw } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import type { AiLevel } from '@/lib/heavy13';
import { createH13Room } from '@/lib/heavy13Room';
import { ranking } from '@/lib/heavy13';
import { reportGame } from '@/lib/stats';
import { H13_ROOM, prepareHeavy13Room } from '@/hooks/useHeavy13Room';
import { useLocalRoom } from '@/hooks/useRealtimeRoom';
import LanguageSwitcher from '../LanguageSwitcher';
import Heavy13Result from './Heavy13Result';
import Heavy13Table from './Heavy13Table';
import Heavy13Tutorial from './Heavy13Tutorial';
import { H_PANEL, H_TITLE, QUARRY_BG } from './theme';

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
    <div className="relative min-h-screen bg-[#0e1013] text-[#eef0f3]" style={{ backgroundImage: QUARRY_BG }}>
      <header className="flex min-h-16 items-center justify-between gap-3 border-b border-white/10 bg-black/40 px-4 py-2 backdrop-blur md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white"><ArrowLeft size={17} /><span className="hidden sm:inline">PUZZLTHINK</span></Link>
          <span className="h-5 w-px bg-white/15" />
          <strong className="text-xl font-black tracking-tight">{t('title')}</strong>
          <span className="hidden text-[10px] font-bold tracking-[0.2em] text-[#e6c48a]/70 sm:inline">HEAVY 13</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setShowTutorial(true)} className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white/80 hover:bg-white/10"><BookOpen size={14} /><span className="hidden sm:inline">{t('howToPlay')}</span></button>
          <LanguageSwitcher compact dark />
          <button onClick={reset} className="flex items-center gap-2 rounded-full bg-[#e6c48a] px-3 py-2 text-xs font-black text-[#2a2118]"><RotateCcw size={14} /><span className="hidden sm:inline">{t('newGame')}</span></button>
        </div>
      </header>
      <main className="mx-auto grid w-full max-w-[1180px] grid-cols-[minmax(0,1fr)] gap-5 px-3 py-4 sm:px-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:py-8">
        <section className="rounded-[20px] border border-white/10 bg-black/20 p-3 sm:p-5">
          {state && <Heavy13Table room={state} mySeat={0} onAction={dispatch} online={false} />}
        </section>
        <aside className="flex flex-col gap-4">
          <section className="rounded-[16px] border border-[#e6c48a]/30 bg-[#e6c48a]/[0.06] p-4">
            <div className="flex items-center gap-2"><Link2 size={14} className="text-[#e6c48a]" /><h2 className={H_TITLE}>{t('friendTitle')}</h2></div>
            <p className="mt-2 text-[11px] leading-5 text-white/55">{t('friendDesc')}</p>
            <button onClick={() => router.push(`/heavy13/room/${prepareHeavy13Room()}`)} className="mt-3 w-full rounded-[10px] bg-[#e6c48a] py-2.5 text-xs font-black text-[#2a2118]">{t('createRoom')}</button>
          </section>
          <section className={H_PANEL}>
            <h2 className={H_TITLE}>{t('aiLevel')}</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">{LEVELS.map((l) => <button key={l} onClick={() => setLevel(l)} className={`rounded-[10px] p-2.5 text-xs font-extrabold ${level === l ? 'bg-white text-[#0e1013]' : 'border border-white/10 bg-white/[0.03] text-white/50'}`}>{t(`level_${l}`)}</button>)}</div>
            <p className="mt-2 text-[10px] text-white/35">{t('levelHint')}</p>
          </section>
          <section className="rounded-[16px] border border-white/10 bg-black/30 p-5">
            <h2 className={H_TITLE}>{t('quickRules')}</h2>
            <ol className="mt-3 space-y-2.5 text-xs leading-relaxed text-white/65">{['quick1', 'quick2', 'quick3', 'quick4', 'quick5'].map((k, i) => <li key={k} className="flex gap-3"><span className="font-mono text-[#e6c48a]">0{i + 1}</span><span>{t(k)}</span></li>)}</ol>
          </section>
        </aside>
      </main>
      {state?.phase === 'finished' && <Heavy13Result room={state} mySeat={0} onAgain={reset} exitPath="/" />}
      {showTutorial && <Heavy13Tutorial onClose={closeTutorial} />}
    </div>
  );
}

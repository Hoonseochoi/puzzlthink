"use client";

import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import GameHeader from '@/components/ui/GameHeader';
import { BTN_ACCENT, MAIN, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, seg } from '@/components/ui/gameUi';
import { reportGame } from '@/lib/stats';
import { TSP_AI_TARGET, type TspLevel, type TspState, applyTspAction, chooseTspAiAction, newTspGame, startTspHand } from '@/lib/twoSidedPoker';
import { TSP_ACCENT, TSP_GLOW_RGB, TSP_INK, tspCopy } from './copy';
import { TspCountingPanel, TspHistoryPanel, TspRulesPanel, TspStage } from './TwoSidedPokerTable';

/** 양면포커 against the AI (seat 1), in this browser. */
export default function TwoSidedPokerGame({ locale }: { locale: string }) {
  const t = tspCopy(locale);
  const [level, setLevel] = useState<TspLevel>('normal');
  // Only rendered after the player starts (#play), never on the server, so the shuffle can happen at init.
  const [state, setState] = useState<TspState>(() => newTspGame('normal'));

  // AI turn, with a short think.
  useEffect(() => {
    if (state.phase !== 'bet' || state.turn !== 1) return;
    const id = window.setTimeout(() => setState((s) => (s.phase === 'bet' && s.turn === 1 ? applyTspAction(s, 1, chooseTspAiAction(s, 1)) : s)), 900 + Math.random() * 700);
    return () => window.clearTimeout(id);
  }, [state]);

  // Every finished match goes to the records; normal/hard wins count for the Hall of Fame, hard wins earn the certificate.
  useEffect(() => {
    if (state.phase !== 'finished') return;
    reportGame(`two-sided-poker-ai-${state.sid}`, 'two_sided_poker', 'ai', state.winner === 0 ? 'win' : 'loss', { difficulty: state.level, hands: state.hand, chips: state.chips[0] });
  }, [state]);

  const footer = state.phase === 'reveal'
    ? <button type="button" onClick={() => setState((s) => startTspHand(s))} className={`${BTN_ACCENT} w-full py-3 text-sm`}>{t.next}</button>
    : state.phase === 'finished'
      ? <button type="button" onClick={() => setState(newTspGame(level))} className={`${BTN_ACCENT} w-full py-3 text-sm`}><RotateCcw size={14} />{t.again}</button>
      : null;

  return (
    <div className={SHELL} style={{ ...accentVars(TSP_ACCENT, TSP_INK), backgroundImage: fog(TSP_GLOW_RGB) }}>
      <GameHeader backHref="/two-sided-poker" backLabel={t.back} title={t.title} subtitle={t.subtitle}><LanguageSwitcher compact dark /></GameHeader>
      <main className={MAIN}>
        <section className={STAGE}>
          <TspStage t={t} state={state} names={[t.you, t.ai]} badges={[t.you, t.ai]} canAct onAct={(action) => setState((s) => applyTspAction(s, 0, action))} waitText={t.status.aiThinking} footer={footer} />
        </section>
        <aside className="flex flex-col gap-4">
          <TspCountingPanel t={t} state={state} />
          <section className={PANEL}>
            <p className={PANEL_TITLE}>{t.difficulty}</p>
            <div className="mt-3 grid grid-cols-3 gap-1.5">{(['easy', 'normal', 'hard'] as TspLevel[]).map((l) => <button key={l} type="button" onClick={() => setLevel(l)} className={`py-2.5 ${seg(level === l)}`}>{t.levels[l]}<span className="mt-0.5 block text-[9px] opacity-55">~{TSP_AI_TARGET[l]}%</span></button>)}</div>
            <p className="mt-2 text-[10px] leading-4 text-white/40">{level !== state.level ? `${t.levelLocked} · ` : ''}{t.targetNote}</p>
          </section>
          <TspHistoryPanel t={t} state={state} />
          <TspRulesPanel t={t} />
        </aside>
      </main>
    </div>
  );
}

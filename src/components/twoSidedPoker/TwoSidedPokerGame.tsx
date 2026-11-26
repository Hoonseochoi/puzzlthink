"use client";

import { useEffect, useState } from 'react';
import { History, RotateCcw, Trophy } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import GameHeader from '@/components/ui/GameHeader';
import GameUpdates from '@/components/GameUpdates';
import { BTN, BTN_ACCENT, MAIN, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, seg } from '@/components/ui/gameUi';
import { reportGame } from '@/lib/stats';
import { TSP_AI_TARGET, type TspLevel, type TspState, applyTspAction, chooseTspAiAction, newTspGame, startTspHand, tspForcedAction, tspRevealMs } from '@/lib/twoSidedPoker';
import { TSP_ACCENT, TSP_GLOW_RGB, TSP_INK, tspCopy } from './copy';
import { TspCountingPanel, TspHistoryPanel, TspRulesPanel, TspStage } from './TwoSidedPokerTable';
import { TspReplay, TspResultModal } from './TwoSidedPokerResult';

/** 양면포커 against the AI (seat 1), in this browser. */
export default function TwoSidedPokerGame({ locale }: { locale: string }) {
  const t = tspCopy(locale);
  const [level, setLevel] = useState<TspLevel>('normal');
  // Only rendered after the player starts (#play), never on the server, so the shuffle can happen at init.
  const [state, setState] = useState<TspState>(() => newTspGame('normal'));
  const [closedSid, setClosedSid] = useState<string | null>(null); // the result popup was closed for this match
  const [replaying, setReplaying] = useState(false);

  // AI turn, with a short think.
  useEffect(() => {
    if (state.phase !== 'bet' || state.turn !== 1) return;
    const id = window.setTimeout(() => setState((s) => (s.phase === 'bet' && s.turn === 1 ? applyTspAction(s, 1, chooseTspAiAction(s, 1)) : s)), 900 + Math.random() * 700);
    return () => window.clearTimeout(id);
  }, [state]);

  // The next hand deals itself after a short look at the result, until someone is out of chips.
  useEffect(() => {
    if (state.phase !== 'reveal') return;
    const id = window.setTimeout(() => setState((s) => (s.phase === 'reveal' ? startTspHand(s) : s)), tspRevealMs(state));
    return () => window.clearTimeout(id);
  }, [state]);

  // All in from the ante: the player's move is forced, so it plays itself.
  useEffect(() => {
    if (state.phase !== 'bet' || state.turn !== 0) return;
    const forced = tspForcedAction(state);
    if (!forced) return;
    const id = window.setTimeout(() => setState((s) => (s.phase === 'bet' && s.turn === 0 ? applyTspAction(s, 0, forced) : s)), 700);
    return () => window.clearTimeout(id);
  }, [state]);

  // Every finished match goes to the records; normal/hard wins count for the Hall of Fame, hard wins earn the certificate.
  useEffect(() => {
    if (state.phase !== 'finished') return;
    reportGame(`two-sided-poker-ai-${state.sid}`, 'two_sided_poker', 'ai', state.winner === 0 ? 'win' : 'loss', { difficulty: state.level, hands: state.hand, chips: state.chips[0] });
  }, [state]);

  const newGame = () => { setReplaying(false); setClosedSid(null); setState(newTspGame(level)); };
  const finished = state.phase === 'finished';
  const won = state.winner === 0;
  const footer = state.phase === 'reveal'
    ? <NextDealBar key={state.rounds.length} ms={tspRevealMs(state)} label={t.room.nextSoon} />
    : finished
      ? (
        <div className="grid grid-cols-3 gap-2">
          <button type="button" onClick={() => { setReplaying(false); setClosedSid(null); }} className={`${BTN} py-3 text-xs`}><Trophy size={14} />{t.end.showResult}</button>
          <button type="button" onClick={() => setReplaying(true)} className={`${BTN} py-3 text-xs`}><History size={14} />{t.end.replay}</button>
          <button type="button" onClick={newGame} className={`${BTN_ACCENT} py-3 text-xs`}><RotateCcw size={14} />{t.again}</button>
        </div>
      )
      : null;

  return (
    <div className={SHELL} style={{ ...accentVars(TSP_ACCENT, TSP_INK), backgroundImage: fog(TSP_GLOW_RGB) }}>
      <GameHeader ai backHref="/two-sided-poker" backLabel={t.back} title={t.title} subtitle={t.subtitle}><GameUpdates game="two_sided_poker" /><LanguageSwitcher compact dark /></GameHeader>
      <main className={MAIN}>
        <section className={STAGE}>
          {replaying && finished
            ? <TspReplay t={t} rounds={state.rounds} names={[t.you, t.ai]} onClose={() => { setReplaying(false); setClosedSid(state.sid); }} onShowResult={() => { setReplaying(false); setClosedSid(null); }} />
            : <TspStage t={t} state={state} names={[t.you, t.ai]} badges={[t.you, t.ai]} canAct onAct={(action) => setState((s) => applyTspAction(s, 0, action))} waitText={t.status.aiThinking} footer={footer} />}
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
      {finished && !replaying && closedSid !== state.sid && (
        <TspResultModal
          t={t} won={won} chips={state.chips[0]} title={won ? t.end.win : t.end.lose}
          reason={`${won ? t.end.byChips(state.hand) : t.end.lostChips(state.hand)} · ${t.end.level(t.levels[state.level])}`}
          rounds={state.rounds} rankingNote={won ? (state.level === 'easy' ? t.end.rankingEasy : t.end.rankingWin) : t.end.rankingLose}
          onReplay={() => setReplaying(true)} onClose={() => setClosedSid(state.sid)} onAgain={newGame}
        />
      )}
    </div>
  );
}

/** A thin bar that runs out while the result is shown, then the next hand is dealt. */
function NextDealBar({ ms, label }: { ms: number; label: string }) {
  return (
    <div className="flex items-center gap-3 px-1 py-2">
      <span className="shrink-0 text-xs font-bold text-white/45">{label}</span>
      <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/10"><span className="block h-full origin-left rounded-full bg-(--accent)" style={{ animation: `tsp-deal ${ms}ms linear forwards` }} /></span>
      <style>{'@keyframes tsp-deal { from { transform: scaleX(1) } to { transform: scaleX(0) } }'}</style>
    </div>
  );
}

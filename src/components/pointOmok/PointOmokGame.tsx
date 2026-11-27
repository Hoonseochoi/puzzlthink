"use client";

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BookOpen, RotateCcw, ShieldQuestion } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ResultActions from '@/components/ResultActions';
import Shards from '@/components/WallGoShards';
import GameHeader from '@/components/ui/GameHeader';
import { roomPlayers } from '@/components/ui/PlayerStrip';
import { BTN, BTN_ACCENT, KICKER, MODAL_BACKDROP, PANEL, PANEL_TITLE, RESULT_PRIMARY, SHELL, accentVars, fog, seg } from '@/components/ui/gameUi';
import { useLocalRoom } from '@/hooks/useRealtimeRoom';
import { PO_ROOM } from '@/hooks/usePointOmokRoom';
import { reportGame } from '@/lib/stats';
import { REVEAL_MS } from '@/hooks/useEndReveal';
import { setRoomPlaying } from '@/lib/roomChat';
import { PO_LEVELS, chooseBets, chooseTriple, type PoAiView, type PoLevel } from '@/lib/pointOmokAi';
import { type PoRoom, PO_SHOW_MS, budgetOf, createPoRoom, reducePoRoom } from '@/lib/pointOmokRoom';
import PoTable from './PoTable';
import { PO_ACCENT, PO_INK } from './PoParts';
import GameUpdates from '@/components/GameUpdates';

const AI = 1 as const;
const linkedLevel = (): PoLevel => {
  if (typeof window === 'undefined') return 'normal';
  const level = new URLSearchParams(window.location.search).get('difficulty') as PoLevel | null;
  return level && PO_LEVELS.includes(level) ? level : 'normal';
};

// 어려움 thinks in a Web Worker; the others are quick enough for the page.
let worker: Worker | null = null;
let seq = 0;
function askAi(kind: 'triple' | 'bets', view: PoAiView): Promise<number[]> {
  const local = () => Promise.resolve(kind === 'triple' ? chooseTriple(view) : chooseBets(view));
  if (view.level !== 'hard' || typeof Worker === 'undefined') return local();
  try { worker ??= new Worker(new URL('../../lib/pointOmokAi.worker.ts', import.meta.url), { type: 'module' }); } catch { return local(); }
  const w = worker;
  const id = ++seq;
  return new Promise((resolve) => {
    const done = () => { w.removeEventListener('message', onMessage); w.removeEventListener('error', onError); };
    const onMessage = (event: MessageEvent<{ id: number; result: number[] }>) => { if (event.data.id !== id) return; done(); resolve(event.data.result); };
    const onError = () => { done(); w.terminate(); if (worker === w) worker = null; resolve(local()); };
    w.addEventListener('message', onMessage);
    w.addEventListener('error', onError);
    w.postMessage({ id, kind, view });
  });
}

/** What the AI may know: the board, the public record and its own bids — never the player's. */
function aiView(state: PoRoom): PoAiView {
  return {
    board: state.board, me: AI, chooser: state.chooser, triple: state.triple,
    rounds: state.rounds.map(({ chooser, triple, owners }) => ({ chooser, triple, owners })),
    myBets: state.secret?.bets[AI] ?? [], budget: budgetOf(state, AI), level: state.level, style: state.aiStyle,
  };
}

export default function PointOmokGame() {
  const t = useTranslations('PointOmok');
  const [level, setLevel] = useState<PoLevel>(linkedLevel);
  const [showRules, setShowRules] = useState(false);
  const create = useCallback(() => {
    const room = createPoRoom({ id: 'me', name: t('you'), at: 0 }, { ai: true, level, aiName: `AI · ${t(`levels.${level}`)}` });
    return reducePoRoom(room, { t: 'start' }, 0, true)!;
  }, [level, t]);
  const { state, dispatch, reset } = useLocalRoom(PO_ROOM, create);

  // The AI acts a moment after its turn comes (after the reveal of the last round has played).
  useEffect(() => {
    if (!state) return;
    const chooses = state.phase === 'choose' && state.chooser === AI;
    const bids = state.phase === 'bid' && state.commits[AI] === null;
    if (!chooses && !bids) return;
    let cancelled = false;
    const wait = Math.max(chooses ? 1300 : 1700, state.shownAt + PO_SHOW_MS + 500 - Date.now());
    const view = aiView(state);
    const timer = window.setTimeout(() => {
      askAi(chooses ? 'triple' : 'bets', view).then((result) => {
        if (!cancelled) dispatch(chooses ? { t: 'ai', seat: AI, triple: result } : { t: 'ai', seat: AI, bets: result });
      });
    }, wait);
    return () => { cancelled = true; window.clearTimeout(timer); };
    // The AI is asked once per turn: when the phase, round or its own lock changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.phase, state?.round, state?.sid, state?.commits[AI]]);

  // The floating lounge button steps aside while a match is on (it would sit over the bid buttons on a phone).
  const live = !!state && state.phase !== 'finished';
  useEffect(() => {
    if (!live) return;
    setRoomPlaying(true);
    return () => setRoomPlaying(false);
  }, [live]);

  // One record per match.
  useEffect(() => {
    if (!state || state.phase !== 'finished') return;
    reportGame(`point_omok-ai-${state.sid}-${state.rounds.length}`, 'point_omok', 'ai', state.winner === 'draw' ? 'draw' : state.winner === 0 ? 'win' : 'loss',
      { difficulty: state.level, style: state.aiStyle, rounds: state.rounds.length, fives: state.fives, reason: state.reason }, { revealDelayMs: REVEAL_MS + 300 });
  }, [state]);

  const started = !!state && state.rounds.length > 0;
  const pickLevel = (next: PoLevel) => {
    if (next === level) return;
    if (started && state?.phase !== 'finished' && !window.confirm(t('levelRestart'))) return;
    setLevel(next);
  };

  return (
    <div className={SHELL} style={{ ...accentVars(PO_ACCENT, PO_INK), backgroundImage: fog('255, 93, 143') }}>
      <Shards />
      <GameHeader players={roomPlayers(state, true)} me={0} backHref="/" backLabel="PUZZLTHINK" title={t('title')} subtitle={t('subtitle')}>
        <button type="button" onClick={() => setShowRules(true)} className={BTN}><BookOpen size={14} /><span className="hidden sm:inline">{t('rules')}</span></button>
        <GameUpdates game="point_omok" /><BugReport /><LanguageSwitcher compact dark />
        <button type="button" onClick={() => { if (!started || state?.phase === 'finished' || window.confirm(t('newGameConfirm'))) reset(); }} className={BTN_ACCENT}><RotateCcw size={14} /><span className="hidden sm:inline">{t('newGame')}</span></button>
      </GameHeader>

      {state && (
        <PoTable
          state={state} mySeat={0} dispatch={dispatch} names={[t('you'), state.seats[AI]?.name ?? 'AI']}
          onResign={() => { if (window.confirm(t('resignConfirm'))) dispatch({ t: 'resign' }); }}
          resultActions={<ResultActions onAgain={reset} gamePath="/point-omok" primaryClass={RESULT_PRIMARY} won={state.winner === 0} />}
          asideExtra={(
            <section className={PANEL}>
              <div className="flex items-center justify-between"><p className={PANEL_TITLE}>{t('difficulty')}</p><span className="text-[10px] font-bold text-white/35">{t(`levelNotes.${level}`)}</span></div>
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                {PO_LEVELS.map((lv) => <button key={lv} type="button" aria-pressed={level === lv} onClick={() => pickLevel(lv)} className={`py-2.5 ${seg(level === lv)}`}>{t(`levels.${lv}`)}</button>)}
              </div>
              <p className="mt-2 text-[10px] leading-4 text-white/35">{t('aiFair')} {t('styleHint')}</p>
            </section>
          )}
        />
      )}

      {showRules && (
        <div role="dialog" aria-modal="true" aria-labelledby="po-rules-title" className={MODAL_BACKDROP} onClick={() => setShowRules(false)}>
          <section className="w-full max-w-md rounded-[18px] border border-white/10 bg-[#15151a] p-6 shadow-[0_0_80px_var(--accent-glow)]" onClick={(event) => event.stopPropagation()}>
            <ShieldQuestion className="text-(--accent)" size={28} /><p className={`${KICKER} mt-4`}>{t('rulesKicker')}</p>
            <h2 id="po-rules-title" className="mt-1 text-2xl font-black text-white">{t('rulesTitle')}</h2>
            <ol className="mt-5 space-y-3">{(t.raw('fullRules') as string[]).map((rule, i) => <li key={rule} className="flex gap-3 text-sm leading-6 text-white/65"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--accent) text-[10px] font-black text-(--accent-ink)">{i + 1}</span><span className="break-keep">{rule}</span></li>)}</ol>
            <button type="button" onClick={() => setShowRules(false)} className={`${BTN_ACCENT} mt-6 w-full py-3`}>{t('understood')}</button>
          </section>
        </div>
      )}
    </div>
  );
}

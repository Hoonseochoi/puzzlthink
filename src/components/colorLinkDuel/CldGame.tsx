"use client";

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { BookOpen, Flag, RotateCcw, Trophy } from 'lucide-react';
import BugReport from '@/components/BugReport';
import { CLD_ROOM } from '@/hooks/useColorLinkDuelRoom';
import { useLocalRoom } from '@/hooks/useRealtimeRoom';
import { type CldAiAnswer, type CldAiRequest, aiGoesFirst, cldAiAnswer } from '@/lib/colorLinkDuelAi';
import { type CldRoom, CLD_COIN_MS, createCldRoom, isPlaying, reduceCldRoom } from '@/lib/colorLinkDuelRoom';
import { type CldTier, CLD_TIERS } from '@/lib/colorLinkDuelBoards';
import { setRoomPlaying } from '@/lib/roomChat';
import LanguageSwitcher from '../LanguageSwitcher';
import GameHeader from '../ui/GameHeader';
import { BTN, BTN_ACCENT, SHELL } from '../ui/gameUi';
import { CldRules, RulesPanel } from './CldRules';
import CldResult, { useCldReport } from './CldResult';
import CldTable from './CldTable';
import { CLD_ROOT_STYLE, cldCopy } from './copy';

const AI = 1 as const;

// The AI thinks in a Web Worker (its placement search runs the solver thousands of times).
let worker: Worker | null = null;
let seq = 0;
function askAi(request: CldAiRequest): Promise<CldAiAnswer> {
  const local = () => new Promise<CldAiAnswer>((resolve) => window.setTimeout(() => resolve(cldAiAnswer(request)), 0));
  if (typeof Worker === 'undefined') return local();
  try { worker ??= new Worker(new URL('../../lib/colorLinkDuelAi.worker.ts', import.meta.url), { type: 'module' }); } catch { return local(); }
  const w = worker;
  const id = ++seq;
  return new Promise((resolve) => {
    const done = () => { w.removeEventListener('message', onMessage); w.removeEventListener('error', onError); };
    const onMessage = (event: MessageEvent<{ id: number; result: CldAiAnswer }>) => { if (event.data.id !== id) return; done(); resolve(event.data.result); };
    const onError = () => { done(); w.terminate(); if (worker === w) worker = null; resolve(local()); };
    w.addEventListener('message', onMessage);
    w.addEventListener('error', onError);
    w.postMessage({ id, ...request });
  });
}
const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
/** The board difficulty picked on the entry screen (?tier=easy|normal|hard); a board is dealt at random from it. */
const readTier = (): CldTier => {
  const v = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('tier');
  return CLD_TIERS.includes(v as CldTier) ? (v as CldTier) : 'hard';
};

/** 컬러 링크 against the AI (어려움), all in this browser. */
export default function CldGame() {
  const locale = useLocale();
  const t = cldCopy(locale);
  const create = useCallback(() => reduceCldRoom(createCldRoom({ id: 'me', name: t.you, at: 0 }, { ai: true, aiName: t.aiName, tier: readTier() }), { t: 'start' }, 0, true)!, [t.you, t.aiName]);
  const { state, dispatch, reset } = useLocalRoom(CLD_ROOM, create);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [closedKey, setClosedKey] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  useCldReport(state, 0, 'ai');
  // The site lounge button would sit over the dock: hidden while the table is open.
  useEffect(() => { setRoomPlaying(true); return () => setRoomPlaying(false); }, []);

  // The AI's turn: call 불가능 or place; its proof (drawn line by line); its pick of the opener.
  const aiTurn = state?.phase === 'place' && state.turn === AI;
  const aiProves = state?.phase === 'proof' && state.proof?.prover === AI;
  const aiChooses = state?.phase === 'choose' && state.chooser === AI;
  const turnKey = state ? `${state.sid}-${state.round}-${state.placements}-${state.phase}` : '';
  useEffect(() => {
    if (!state || (!aiTurn && !aiProves && !aiChooses)) return;
    let cancelled = false;
    const room: CldRoom = state;
    const run = async () => {
      if (aiChooses) {
        await sleep(1400);
        if (!cancelled) dispatch({ t: 'ai', act: { t: 'choose', first: aiGoesFirst() ? AI : 0 } });
        return;
      }
      // Let the coin toss / the human's stones land before the AI moves.
      const coin = room.coin && room.placements === 0 ? Math.max(0, room.startedAt + CLD_COIN_MS - Date.now()) : 0;
      await sleep(coin + 500);
      if (cancelled) return;
      setThinking(true);
      const started = Date.now();
      if (aiTurn) {
        const answer = await askAi({ kind: 'turn', board: room.board, opening: room.placements === 0, seed: Math.floor(Math.random() * 1e9), thinkMs: 900 });
        await sleep(Math.max(0, 1300 - (Date.now() - started)));
        if (cancelled) return;
        setThinking(false);
        const move = answer.move;
        if (move?.kind === 'declare') dispatch({ t: 'ai', act: { t: 'declare' } });
        else if (move?.kind === 'place') dispatch({ t: 'ai', act: { t: 'place', stones: move.stones } });
        return;
      }
      const { proof } = await askAi({ kind: 'proof', board: room.board });
      if (cancelled) return;
      setThinking(false);
      if (!proof) { await sleep(2000); if (!cancelled) dispatch({ t: 'ai', act: { t: 'concede' } }); return; }
      // Draw the lines one colour at a time so the player can follow.
      const shown: (number[] | null)[] = Array(15).fill(null);
      for (let k = 1; k < proof.length; k++) {
        if (!proof[k]) continue;
        await sleep(650);
        if (cancelled) return;
        shown[k] = proof[k];
        dispatch({ t: 'ai', act: { t: 'draft', paths: shown.slice() } });
      }
      await sleep(900);
      if (!cancelled) dispatch({ t: 'ai', act: { t: 'prove', paths: proof } });
    };
    run();
    return () => { cancelled = true; setThinking(false); };
    // Asked once per turn: when the turn, phase or round changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnKey, aiTurn, aiProves, aiChooses]);

  const finished = state?.phase === 'finished';
  const resultKey = state ? `${state.sid}-${finished}` : '';
  const names: [string, string] = [t.you, t.aiName];
  const again = () => { setClosedKey(null); reset(); };

  return (
    <div className={SHELL} style={CLD_ROOT_STYLE}>
      <GameHeader backHref="/color-link-duel" backLabel={t.back} title={t.title} subtitle="AI · HARD">
        <button type="button" onClick={() => setRulesOpen(true)} className={BTN} aria-label={t.rules}><BookOpen size={14} /><span className="hidden sm:inline">{t.rules}</span></button>
        <BugReport /><LanguageSwitcher compact dark />
        {state && isPlaying(state)
          ? <button type="button" onClick={() => { if (window.confirm(t.resignConfirm)) dispatch({ t: 'resign' }); }} className={BTN} aria-label={t.resign}><Flag size={14} /><span className="hidden sm:inline">{t.resign}</span></button>
          : <button type="button" onClick={again} className={BTN_ACCENT} aria-label={t.again}><RotateCcw size={14} /><span className="hidden sm:inline">{t.again}</span></button>}
      </GameHeader>
      <main className="relative z-10 px-3 py-2.5 sm:px-5 sm:py-5">
        {state && (
          <CldTable room={state} mySeat={0} dispatch={dispatch} names={names} t={t} thinking={thinking} aside={<RulesPanel t={t} />} />
        )}
        {finished && closedKey === resultKey && (
          <div className="mx-auto mt-2 grid max-w-[600px] grid-cols-2 gap-2">
            <button type="button" onClick={() => setClosedKey(null)} className={`${BTN} py-3`}><Trophy size={14} />{t.showResult}</button>
            <button type="button" onClick={again} className={`${BTN_ACCENT} py-3`}><RotateCcw size={14} />{t.again}</button>
          </div>
        )}
      </main>
      {finished && closedKey !== resultKey && <CldResult room={state} mySeat={0} names={names} t={t} onAgain={again} onClose={() => setClosedKey(resultKey)} />}
      {rulesOpen && <CldRules t={t} onClose={() => setRulesOpen(false)} />}
    </div>
  );
}

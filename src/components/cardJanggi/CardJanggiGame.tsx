"use client";

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { BookOpen, RotateCcw, Trophy, X } from 'lucide-react';
import BugReport from '@/components/BugReport';
import { useLocalRoom } from '@/hooks/useRealtimeRoom';
import { CJ_ROOM } from '@/hooks/useCardJanggiRoom';
import { type CjGame, type CjSeat, other, redactGame } from '@/lib/cardJanggi';
import { chooseLayout, chooseMove } from '@/lib/cardJanggiAi';
import { type CjRoom, CJ_COIN_MS, createCjRoom, reduceCjRoom } from '@/lib/cardJanggiRoom';
import { setRoomPlaying } from '@/lib/roomChat';
import LanguageSwitcher from '../LanguageSwitcher';
import GameHeader from '../ui/GameHeader';
import { BTN, BTN_ACCENT, MODAL, MODAL_BACKDROP, MODAL_CLOSE, PANEL, PANEL_TITLE, SHELL } from '../ui/gameUi';
import { CJ_ROOT_STYLE, type CjCopy, cjCopy } from './copy';
import CjResult, { useCjReport } from './CjResult';
import CjTable from './CjTable';

const AI: CjSeat = 1;
const MOVE_MS = 1800;
const LAYOUT_MS = 2600;
export const CJ_PATH = '/card-janggi';

// The search runs in a Web Worker (a second or two per decision); the page thread is the fallback.
let worker: Worker | null = null;
let seq = 0;
function askAi(kind: 'layout' | 'move', game: CjGame): Promise<unknown> {
  const local = () => Promise.resolve(kind === 'layout' ? chooseLayout(game, AI, LAYOUT_MS) : chooseMove(game, AI, MOVE_MS));
  if (typeof Worker === 'undefined') return local();
  try { worker ??= new Worker(new URL('../../lib/cardJanggiAi.worker.ts', import.meta.url), { type: 'module' }); } catch { return local(); }
  const w = worker;
  const id = ++seq;
  return new Promise((resolve) => {
    const done = () => { w.removeEventListener('message', onMessage); w.removeEventListener('error', onError); };
    const onMessage = (event: MessageEvent<{ id: number; result: unknown }>) => { if (event.data.id !== id) return; done(); resolve(event.data.result); };
    const onError = () => { done(); w.terminate(); if (worker === w) worker = null; resolve(local()); };
    w.addEventListener('message', onMessage);
    w.addEventListener('error', onError);
    w.postMessage({ id, kind, game, me: AI, budget: kind === 'layout' ? LAYOUT_MS : MOVE_MS });
  });
}

/** What the AI has to do now, if anything: lay out its cards, make its move, or (after your timeout) make yours. */
function aiTask(state: CjRoom | null): 'layout' | 'move' | null {
  if (!state || state.phase !== 'playing') return null;
  const g = state.game;
  if (g.phase === 'arrange' && g.arranging[AI]) return 'layout';
  if (g.phase === 'move' && (state.proxy ? other(g.turn) : g.turn) === AI) return 'move';
  return null;
}

/** 카드 장기 against the AI (어려움), all in this browser. */
export default function CardJanggiGame() {
  const locale = useLocale();
  const t = cjCopy(locale);
  const names: [string, string] = [t.you, t.aiName];
  const create = useCallback(() => reduceCjRoom(createCjRoom({ id: 'me', name: t.you, at: 0 }, { ai: true, aiName: t.aiName }), { t: 'start' }, 0, true)!, [t.you, t.aiName]);
  const { state, dispatch, reset } = useLocalRoom(CJ_ROOM, create);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [closedKey, setClosedKey] = useState<string | null>(null);
  const finished = state?.phase === 'finished';
  const resultKey = state ? `${state.sid}-${finished}` : '';
  useCjReport(state, 0, 'ai');

  // The AI acts a moment after its turn comes (after the coin toss at the start).
  const task = aiTask(state);
  const g = state?.game;
  useEffect(() => {
    if (!state || !task) return;
    let cancelled = false;
    const view = redactGame(state.game, AI); // never the player's face-down cards
    const wait = Math.max(task === 'layout' ? 300 : 500, state.round === 1 && state.game.ply === 0 ? state.coinAt + CJ_COIN_MS - Date.now() : 0);
    const timer = window.setTimeout(() => {
      askAi(task, view).then((result) => {
        if (cancelled || !result) return;
        if (task === 'layout') dispatch({ t: 'ai', order: result as number[] });
        else { const m = result as { from: number; to: number }; dispatch({ t: 'ai', from: m.from, to: m.to }); }
      });
    }, wait);
    return () => { cancelled = true; window.clearTimeout(timer); };
    // Asked once per decision: when the round, ply, phase, layout state or a timeout changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task, state?.sid, state?.round, g?.ply, g?.phase, g?.cycle[AI], state?.proxy]);

  // The site lounge button would sit over the cards and the dock: hidden while the board is open.
  useEffect(() => { setRoomPlaying(true); return () => setRoomPlaying(false); }, []);

  const again = () => { setClosedKey(null); reset(); };
  const started = !!state && (state.round > 1 || state.game.ply > 0);
  return (
    <div className={SHELL} style={CJ_ROOT_STYLE}>
      <GameHeader backHref={CJ_PATH} backLabel={t.back} title={t.title} subtitle="AI · HARD">
        <button type="button" onClick={() => setRulesOpen(true)} className={BTN} aria-label={t.rules}><BookOpen size={14} /><span className="hidden sm:inline">{t.rules}</span></button>
        <BugReport /><LanguageSwitcher compact dark />
        <button type="button" onClick={() => { if (!started || finished || window.confirm(t.newGameConfirm)) again(); }} className={BTN_ACCENT} aria-label={t.newGame}><RotateCcw size={14} /><span className="hidden sm:inline">{t.newGame}</span></button>
      </GameHeader>
      <main className="relative z-10 px-3 py-3 sm:px-5 sm:py-5">
        {state && (
          <CjTable room={state} mySeat={0} onAction={dispatch} t={t} names={names} thinking={!!task}
            onResign={() => { if (window.confirm(t.resignConfirm)) dispatch({ t: 'resign' }); }} />
        )}
        {finished && closedKey === resultKey && (
          <div className="mx-auto mt-2 grid max-w-[480px] grid-cols-2 gap-2">
            <button type="button" onClick={() => setClosedKey(null)} className={`${BTN} py-3`}><Trophy size={14} />{t.showResult}</button>
            <button type="button" onClick={again} className={`${BTN_ACCENT} py-3`}><RotateCcw size={14} />{t.rematch}</button>
          </div>
        )}
      </main>
      {finished && closedKey !== resultKey && <CjResult room={state} mySeat={0} names={names} t={t} onAgain={again} onClose={() => setClosedKey(resultKey)} path={CJ_PATH} />}
      {rulesOpen && <CjRules t={t} onClose={() => setRulesOpen(false)} />}
    </div>
  );
}

export function CjRules({ t, onClose }: { t: CjCopy; onClose: () => void }) {
  return (
    <div className={MODAL_BACKDROP} onClick={onClose}>
      <div className={`${MODAL} max-w-md text-left text-white`} onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label={t.close} className={MODAL_CLOSE}><X size={16} /></button>
        <p className={PANEL_TITLE}>{t.rules}</p>
        <ol className="mt-3 space-y-3 text-[13px] leading-relaxed text-white/75">{t.quick.map((line, i) => <li key={i} className="flex gap-3"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{line}</span></li>)}</ol>
        <p className={`${PANEL} mt-4 !p-3 text-[11px] leading-5 text-white/50`}>{t.notes}</p>
      </div>
    </div>
  );
}

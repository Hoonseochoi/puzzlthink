"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BookOpen, Bot, BrainCircuit, Flag, History, RotateCcw, Trophy, X } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Shards from '@/components/WallGoShards';
import GameHeader from '@/components/ui/GameHeader';
import { ReplayControls, ReplayHeader } from '@/components/ui/ReplayBar';
import { useReplayPlayer } from '@/hooks/useReplayFrames';
import { BTN, BTN_ACCENT, HEADING, KICKER, MAIN, NOTE, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, playerRow, seg } from '@/components/ui/gameUi';
import { reportGame } from '@/lib/stats';
import { answerChallenge, chooseMonorailAction, declareImpossible, giveUpChallenge, inChallenge, moveText, newMonorail, playMonorail, proveCompletion, type MonorailLevel, type MonorailState, type RailTile } from '@/lib/monorail';
import { ChallengeBanner, MONORAIL_ACCENT, MONORAIL_INK, MonorailBoard, MonorailTurnDock, ResultExtras, TileDeck, TurnControls, monorailFrames, useFrameCaption, useMonorailDraft } from './MonorailParts';
import GameUpdates from '@/components/GameUpdates';

const AI_NAME = 'VICKY';

const LEVELS: MonorailLevel[] = ['normal', 'hard'];

export default function MonorailGame() {
  const t = useTranslations('Monorail');
  const tc = useTranslations('Common');
  const [level, setLevel] = useState<MonorailLevel>('normal');
  const [game, setGame] = useState<MonorailState>(newMonorail);
  const [showRules, setShowRules] = useState(false);
  // Tiles the AI is laying down one by one while it answers your Impossible call.
  const [aiDraft, setAiDraft] = useState<RailTile[]>([]);
  // After the game: the result popup can be closed to look at the board (판 보기), or replayed (복기).
  const [showResult, setShowResult] = useState(true);
  const [replaying, setReplaying] = useState(false);
  const run = useRef(0);
  const reportedMatch = useRef(false);
  const thinking = game.winner === null && game.turn === 1;
  const myTurn = game.winner === null && game.turn === 0;
  const draft = useMonorailDraft(game, myTurn);

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('difficulty');
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the entry screen writes the selected level to the URL
    if (param === 'hard' || param === 'normal') setLevel(param);
  }, []);

  useEffect(() => {
    if (game.winner !== null || game.turn !== 1) return;
    const id = run.current;
    const timers: number[] = [];
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(() => { if (run.current === id) fn(); }, ms));
    if (inChallenge(game)) {
      // You called Impossible: VICKY either finishes the loop in front of you or concedes.
      later(900, () => {
        const answer = answerChallenge(game);
        if (answer.t === 'give-up') { setGame((current) => giveUpChallenge(current) ?? current); return; }
        answer.tiles.forEach((_, i) => later(i * 240, () => setAiDraft(answer.tiles.slice(0, i + 1))));
        later(answer.tiles.length * 240 + 600, () => { setAiDraft([]); setGame((current) => proveCompletion(current, answer.tiles) ?? current); });
      });
    } else {
      later(650, () => {
        const action = chooseMonorailAction(game, level);
        setGame((current) => action.t === 'impossible' ? declareImpossible(current) ?? current : playMonorail(current, action.move) ?? current);
      });
    }
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [game, level]);

  useEffect(() => {
    if (game.winner === null || reportedMatch.current) return;
    reportedMatch.current = true;
    reportGame(`monorail-ai-${Date.now()}-${game.moveNo}`, 'monorail', 'ai', game.winner === 0 ? 'win' : 'loss', { difficulty: level, reason: game.reason, moves: game.moveNo });
  }, [game.winner]); // eslint-disable-line react-hooks/exhaustive-deps

  const restart = (nextLevel = level) => {
    run.current += 1; reportedMatch.current = false; setLevel(nextLevel); setGame(newMonorail()); setAiDraft([]); setShowResult(true); setReplaying(false); draft.clear();
    const url = new URL(window.location.href); url.searchParams.set('difficulty', nextLevel); window.history.replaceState(null, '', url);
  };
  const commit = () => {
    const next = playMonorail(game, draft.move);
    if (next) { setGame(next); draft.clear(); }
  };
  const impossible = () => { const next = declareImpossible(game); if (next) { setGame(next); draft.clear(); } };
  const prove = () => { const next = proveCompletion(game, draft.tiles); if (next) { setGame(next); draft.clear(); } };
  const giveUp = () => { if (!window.confirm(t('giveUpConfirm'))) return; const next = giveUpChallenge(game); if (next) { setGame(next); draft.clear(); } };
  const challenge = inChallenge(game);
  const over = game.winner !== null;
  const frames = useMemo(() => monorailFrames(game), [game]);
  const replay = useReplayPlayer(frames.length - 1, replaying && over, 1100);
  const frame = replaying && over ? frames[replay.at] : null;
  const caption = useFrameCaption((p) => p === 0 ? t('you') : AI_NAME);
  const result = game.winner === null ? null
    : game.reason === 'gave-up' && game.winner === 0 ? t('aiGaveUp', { name: AI_NAME })
      : game.reason === 'proved' ? (game.winner === 0 ? t('youProved') : t('aiProved', { name: AI_NAME }))
        : game.winner === 0 ? t('youWin') : t('aiWins');
  const reason = !game.reason ? '' : game.reason === 'gave-up' ? `${t('reason.gave-up')} ${game.proof ? t('gaveUpPossible') : t('gaveUpImpossible')}` : t(`reason.${game.reason}`);
  const heading = result ?? (challenge ? (myTurn ? t('challengeHeading') : t('aiProving', { name: AI_NAME }))
    : thinking ? t('aiThinking') : myTurn ? (draft.tiles.length ? t('pickMore', { n: 3 - draft.tiles.length }) : t('yourTurn')) : t('aiTurn'));
  const last = game.last ? moveText(game.last) : t('firstMove');
  const confidence = level === 'hard' ? 80 : 50;

  return (
    <div className={SHELL} style={{ ...accentVars(MONORAIL_ACCENT, MONORAIL_INK), backgroundImage: fog('116, 44, 52') }}>
      <Shards tint="#5e232d" />
      <GameHeader backHref="/monorail" backLabel="PUZZLTHINK" title={t('title')} titleClass="font-black" subtitle={t('subtitle')}>
        <GameUpdates game="monorail" /><BugReport /><LanguageSwitcher compact dark />
        <button type="button" onClick={() => restart()} className={BTN}><RotateCcw size={14} /><span className="hidden sm:inline">{t('restart')}</span></button>
      </GameHeader>

      <main className={MAIN}>
        <section className={STAGE}>
          <div className="mb-3 flex items-end justify-between gap-3 px-1 sm:mb-4 sm:px-2">
            <div><p className={KICKER}>{game.winner === null ? t('matchKicker') : t('resultKicker')}</p><h1 className={`mt-1 ${HEADING}`}>{heading}</h1></div>
            <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1.5 font-mono text-[11px] font-bold text-white/55">{game.tiles.length}/16</span>
          </div>
          <ChallengeBanner state={game} mine={myTurn} caller={game.challenger === 0 ? t('you') : AI_NAME} answerer={game.turn === 0 ? t('you') : AI_NAME} />
          {frame && <ReplayHeader player={replay} caption={caption(frame)} onClose={() => setReplaying(false)} />}
          <div className="relative">
            {frame ? <MonorailBoard state={frame.state} />
              : <MonorailBoard state={game} pending={myTurn ? draft.tiles : aiDraft} interactive={myTurn} onCell={draft.add} onPending={draft.remove} />}
            {over && showResult && !frame && (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[18px] bg-[#19080d]/62 p-5 backdrop-blur-[2px]">
                <div className="relative w-full max-w-sm rounded-[18px] border border-[#f3b64a]/45 bg-[#241016]/95 p-6 text-center shadow-[0_0_70px_rgba(243,182,74,.22)]">
                  <button type="button" onClick={() => setShowResult(false)} aria-label={t('viewBoard')} title={t('viewBoard')} className="absolute right-2 top-2 rounded-md p-1.5 text-white/40 hover:bg-white/10 hover:text-white"><X size={15} /></button>
                  <Trophy size={32} className="mx-auto text-[#f3b64a]" /><p className={`${KICKER} mt-3`}>{t('resultKicker')}</p>
                  <h2 className="mt-1 text-2xl font-black">{result}</h2><p className="mt-2 break-keep text-sm leading-6 text-white/60">{reason}</p>
                  {game.reason === 'gave-up' && game.proof && <p className="mt-3 rounded-md bg-[#f3b64a]/10 px-3 py-2 text-xs font-bold text-[#f6d58f]">{t('proofShown')}</p>}
                  <button type="button" onClick={() => restart()} className={`${BTN_ACCENT} mt-5 w-full py-3`}><RotateCcw size={15} />{t('rematch')}</button>
                  <ResultExtras canReplay={frames.length > 1} onReplay={() => setReplaying(true)} onViewBoard={() => setShowResult(false)} />
                </div>
              </div>
            )}
          </div>
          {frame && <ReplayControls player={replay} onShowResult={() => { setReplaying(false); setShowResult(true); }} />}
          {over && !frame && !showResult && <div className="mx-auto mt-3 flex max-w-[440px] flex-wrap items-center justify-center gap-2">
            <button type="button" onClick={() => setShowResult(true)} className={`${BTN} py-2.5`}><Trophy size={14} />{tc('replayShowResult')}</button>
            {frames.length > 1 && <button type="button" onClick={() => setReplaying(true)} className={`${BTN} py-2.5`}><History size={14} />{tc('replayOpen')}</button>}
            <button type="button" onClick={() => restart()} className={`${BTN_ACCENT} py-2.5`}><RotateCcw size={14} />{t('rematch')}</button>
          </div>}
          <div className="mt-3 flex min-h-8 items-center justify-between gap-2 px-1 text-[11px] text-white/40"><span>{t('lastMove')}: {last}</span><button type="button" onClick={() => setShowRules(true)} className="flex items-center gap-1 font-bold text-[#f3c86c]"><BookOpen size={12} />{t('rules')}</button></div>
        </section>

        <aside className="flex flex-col gap-4">
          <section className={PANEL}>
            <div className="flex items-center justify-between"><h2 className={PANEL_TITLE}>{t('difficulty')}</h2><span className="text-[10px] font-bold text-white/35">{t('targetWin', { n: confidence })}</span></div>
            <div className="mt-3 grid grid-cols-2 gap-2">{LEVELS.map((item) => <button key={item} type="button" onClick={() => restart(item)} className={`py-2.5 ${seg(level === item)}`}>{t(`level.${item}`)}</button>)}</div>
            <p className="mt-2 break-keep text-[10px] leading-4 text-white/35">{t(`levelDesc.${level}`)}</p>
          </section>
          <section className={PANEL}>
            <div className="grid grid-cols-2 gap-2">
              <div className={playerRow(game.winner === null && game.turn === 0)}><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3b64a] font-black text-[#2a1706]">YOU</span><div><p className="text-xs font-black">{t('you')}</p><p className="text-[10px] text-white/40">{t('first')}</p></div></div>
              <div className={playerRow(game.winner === null && game.turn === 1)}><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6d3140] text-[#ffd987]"><Bot size={18} /></span><div><p className="text-xs font-black">VICKY</p><p className="text-[10px] text-white/40">{t('second')}</p></div></div>
            </div>
            <div className="mt-4 border-t border-white/10 pt-4"><TileDeck used={game.tiles.length} /></div>
          </section>
          {/* Phones use the floating turn dock instead, so the same tile faces are not shown twice. */}
          <section className={`${PANEL} hidden lg:block`}>
            <TurnControls state={game} draft={draft} disabled={!myTurn} onCommit={commit} onImpossible={impossible} onProve={prove} onGiveUp={giveUp} />
          </section>
          <section className={NOTE}>
            <h2 className="flex items-center gap-2 text-xs font-black"><BrainCircuit size={14} className="text-[#f3b64a]" />{t('strategyTitle')}</h2>
            <p className="mt-2 break-keep text-xs leading-5 text-white/55">{t('strategy')}</p>
          </section>
          {game.winner === null && !challenge && <button type="button" onClick={() => { if (window.confirm(t('resignConfirm'))) setGame({ ...game, winner: 1, reason: 'resign' }); }} className={`${BTN} py-2.5 text-white/45`}><Flag size={13} />{t('resign')}</button>}
        </aside>
      </main>

      {showRules && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" onClick={() => setShowRules(false)}><div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-[18px] border border-[#f3b64a]/35 bg-[#241016] p-5" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between"><h2 className="text-lg font-black">{t('rules')}</h2><button onClick={() => setShowRules(false)} className={BTN}>{t('close')}</button></div><ol className="mt-4 space-y-3">{(t.raw('ruleList') as string[]).map((rule, i) => <li key={rule} className="flex gap-3 text-sm leading-6 text-white/65"><span className="font-mono font-black text-[#f3b64a]">{String(i + 1).padStart(2, '0')}</span><span className="break-keep">{rule}</span></li>)}</ol></div></div>}
      <MonorailTurnDock active={myTurn && !showRules} state={game} draft={draft} onCommit={commit} onImpossible={impossible} onProve={prove} onGiveUp={giveUp} />
    </div>
  );
}

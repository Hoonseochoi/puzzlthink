"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BookOpen, ChevronRight, Flag, RotateCcw, ShieldQuestion, Sparkles, Trophy, X } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Shards from '@/components/WallGoShards';
import GameHeader from '@/components/ui/GameHeader';
import { BTN, BTN_ACCENT, HEADING, KICKER, MAIN, NOTE, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, fog, playerRow, seg } from '@/components/ui/gameUi';
import { reportGame } from '@/lib/stats';
import { type Move, type MorrisLevel, type MorrisState, type Player, chooseMorrisMove, flying, moveLabel, newMorris, onBoard, placing, play, stallLeft } from '@/lib/morris';
import { MORRIS_MAX_ROUNDS, MORRIS_WINS } from '@/lib/morrisRoom';
import { HandRow, MORRIS_ACCENT, MORRIS_INK, MorrisBoard, MorrisStone, useMorrisPicker } from './MorrisParts';
import GameUpdates from '@/components/GameUpdates';
import { PieceOwners, useMyNickname } from '../PieceStone';

type Round = { human: Player; winner: 'you' | 'ai' | 'draw' };
const LEVELS: MorrisLevel[] = ['easy', 'normal', 'hard'];

/** 1:1 against OTTO, best of three. You are black (first) in round one; the sides swap every round. */
export default function MorrisGame() {
  const t = useTranslations('Morris');
  const [level, setLevel] = useState<MorrisLevel>('normal');
  const [game, setGame] = useState<MorrisState>(newMorris);
  const [human, setHuman] = useState<Player>(0);
  const nickname = useMyNickname();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [matchNo, setMatchNo] = useState(0);
  const [showRules, setShowRules] = useState(false);

  const wins = { you: rounds.filter((r) => r.winner === 'you').length, ai: rounds.filter((r) => r.winner === 'ai').length };
  const matchOver = wins.you >= MORRIS_WINS || wins.ai >= MORRIS_WINS || rounds.length >= MORRIS_MAX_ROUNDS;
  const roundOver = game.winner !== null;
  const aiColor = (1 - human) as Player;
  const myTurn = !roundOver && game.turn === human;
  const started = rounds.length > 0 || game.last !== null;

  const finishRound = (state: MorrisState) => {
    const winner: Round['winner'] = state.winner === 'draw' ? 'draw' : state.winner === human ? 'you' : 'ai';
    const next = [...rounds, { human, winner }];
    setRounds(next);
    const you = next.filter((r) => r.winner === 'you').length, ai = next.filter((r) => r.winner === 'ai').length;
    if (you >= MORRIS_WINS || ai >= MORRIS_WINS || next.length >= MORRIS_MAX_ROUNDS) {
      reportGame(`morris-ai-${matchNo}-${Date.now()}`, 'nine_mens_morris', 'ai', you === ai ? 'draw' : you > ai ? 'win' : 'loss',
        { difficulty: level, rounds: next.length, score: `${you}-${ai}` });
    }
  };

  const apply = (move: Move) => {
    const next = play(game, move);
    setGame(next);
    if (next.winner !== null) finishRound(next);
  };

  const picker = useMorrisPicker(game, myTurn, apply);

  // OTTO's move, after a short pause so the board can be read.
  useEffect(() => {
    if (roundOver || game.turn !== aiColor) return;
    const timer = window.setTimeout(() => {
      const move = chooseMorrisMove(game, level);
      if (move) apply(move);
    }, game.last ? 650 : 900);
    return () => window.clearTimeout(timer);
    // `game` is the exact position handed to the AI when the turn changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, aiColor, roundOver]);

  const nextRound = () => { setHuman((h) => (1 - h) as Player); setGame(newMorris()); };
  const newMatch = () => { setRounds([]); setHuman(0); setGame(newMorris()); setMatchNo((n) => n + 1); };
  const resign = () => { if (!roundOver && window.confirm(t('resignConfirm'))) { const next = { ...game, winner: aiColor, reason: 'resign' as const }; setGame(next); finishRound(next); } };

  const reasonText = (state: MorrisState) => t(`reason.${state.reason ?? 'pieces'}`);
  const phaseOf = (p: Player) => (placing(game, p) ? t('phasePlace') : flying(game, p) ? t('phaseFly') : t('phaseMove'));
  const stall = stallLeft(game);
  const status = roundOver
    ? game.winner === 'draw' ? t('roundDraw') : game.winner === human ? t('roundWin') : t('roundLoss')
    : !myTurn ? t('aiThinking')
      : picker.removing ? t('pickRemove') : placing(game) ? t('pickPlace') : picker.selected !== null ? t('pickTarget') : flying(game) ? t('pickFly') : t('pickPiece');

  const players: { color: Player; name: string; you: boolean }[] = [{ color: human, name: t('you'), you: true }, { color: aiColor, name: 'OTTO', you: false }];

  const owners: (string | null)[] = [null, null];
  owners[human] = nickname;

  return (
    <PieceOwners.Provider value={owners}>
    <div className={SHELL} style={{ ...accentVars(MORRIS_ACCENT, MORRIS_INK), backgroundImage: fog('62, 201, 214') }}>
      <Shards />
      <GameHeader ai backHref="/" backLabel="PUZZLTHINK" title={t('title')} titleClass="font-black" subtitle={t('subtitle')}>
        <button type="button" onClick={() => setShowRules(true)} className={BTN}><BookOpen size={14} /><span className="hidden sm:inline">{t('rules')}</span></button>
        <GameUpdates game="nine_mens_morris" /><BugReport /><LanguageSwitcher compact dark />
        <button type="button" onClick={newMatch} className={BTN_ACCENT}><RotateCcw size={14} /><span className="hidden sm:inline">{t('newMatch')}</span></button>
      </GameHeader>

      <main className={MAIN}>
        <section className={STAGE}>
          <div className="mb-3 flex items-end justify-between gap-3 px-1 sm:mb-4 sm:px-2">
            <div className="min-w-0">
              <p className={KICKER}>{t('roundKicker', { n: rounds.length + (roundOver ? 0 : 1) })}{stall !== null && !roundOver ? ` · ${t('stallLeft', { n: stall })}` : ''}</p>
              <h1 className={`mt-1 ${HEADING}`}>{status}</h1>
            </div>
            <ScoreDots you={wins.you} them={wins.ai} />
          </div>

          <div className="relative">
            <MorrisBoard board={picker.board} marks={picker.marks} selected={picker.selected} last={game.last} onPoint={picker.onPoint} />
            {roundOver && (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[14px] bg-black/55 p-4 backdrop-blur-[2px]">
                <div className="bw-result w-full max-w-[320px] rounded-[16px] border border-(--accent)/40 bg-[#0e1316]/95 p-5 text-center shadow-[0_0_60px_rgba(62,201,214,.25)]">
                  {matchOver ? <Trophy className="mx-auto text-(--accent)" size={30} /> : <Sparkles className="mx-auto text-(--accent)" size={26} />}
                  <p className={`${KICKER} mt-3`}>{matchOver ? t('matchKicker') : t('roundKicker', { n: rounds.length })}</p>
                  <h2 className="mt-1 text-2xl font-black">{matchOver ? (wins.you === wins.ai ? t('matchDraw') : wins.you > wins.ai ? t('matchWin') : t('matchLoss')) : status}</h2>
                  <p className="mt-1 text-xs text-white/50">{reasonText(game)}</p>
                  <p className="mt-3 font-mono text-3xl font-black">{wins.you}<span className="mx-2 text-white/30">:</span>{wins.ai}</p>
                  {matchOver
                    ? <button type="button" onClick={newMatch} className={`${BTN_ACCENT} mt-4 w-full py-3`}><RotateCcw size={15} />{t('newMatch')}</button>
                    : <button type="button" onClick={nextRound} className={`${BTN_ACCENT} mt-4 w-full py-3`}>{t('nextRound')}<ChevronRight size={15} /></button>}
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 flex min-h-9 flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-white/45">
            <span>{game.last ? t('lastMove', { who: game.turn === human ? 'OTTO' : t('you'), move: moveLabel(game.last) }) : t('firstHint')}</span>
            {picker.selected !== null && myTurn && <button type="button" onClick={picker.cancel} className={`${BTN} py-1.5`}><X size={12} />{t('cancel')}</button>}
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <section className={PANEL}>
            <div className="flex items-center justify-between"><p className={PANEL_TITLE}>{t('difficulty')}</p><span className="text-[10px] font-bold text-white/35">{t(`levelDesc.${level}`)}</span></div>
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {LEVELS.map((l) => <button key={l} type="button" disabled={started && !matchOver} onClick={() => setLevel(l)} className={`py-2.5 ${seg(level === l)} disabled:opacity-40`}>{t(`level.${l}`)}</button>)}
            </div>
            {started && !matchOver && <p className="mt-2 text-[10px] leading-4 text-white/35">{t('levelLocked')}</p>}
          </section>

          <section className={PANEL}>
            <p className={PANEL_TITLE}>{t('players')}</p>
            <div className="mt-2 space-y-1.5">
              {players.map((p) => (
                <div key={p.name} className={playerRow(!roundOver && game.turn === p.color)}>
                  <div className="h-10 w-10 shrink-0"><MorrisStone color={p.color} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-extrabold">{p.name}<span className="ml-1.5 text-[10px] font-bold text-white/40">{p.color === 0 ? t('black') : t('white')}</span></p>
                      <span className="shrink-0 text-[10px] font-bold text-(--accent)">{phaseOf(p.color)}</span>
                    </div>
                    <div className="mt-1.5"><HandRow color={p.color} count={game.hand[p.color]} /></div>
                    <p className="mt-1 text-[10px] text-white/40">{t('onBoard', { n: onBoard(game.board, p.color) })} · {t('captured', { n: game.captured[p.color] })}</p>
                  </div>
                </div>
              ))}
            </div>
            {rounds.length > 0 && (
              <ol className="mt-3 flex flex-wrap gap-1.5">
                {rounds.map((r, i) => <li key={i} className={`rounded-md px-2 py-1 text-[10px] font-black ${r.winner === 'you' ? 'bg-(--accent) text-(--accent-ink)' : r.winner === 'ai' ? 'bg-white/10 text-white/60' : 'border border-white/15 text-white/45'}`}>R{i + 1} {r.winner === 'you' ? t('you') : r.winner === 'ai' ? 'OTTO' : t('draw')}</li>)}
              </ol>
            )}
          </section>

          <section className={NOTE}>
            <h2 className={PANEL_TITLE}>{t('quickRules')}</h2>
            <ol className="mt-3 space-y-3 text-xs leading-relaxed text-white/65">{['quick1', 'quick2', 'quick3', 'quick4'].map((key, i) => <li key={key} className="flex gap-3"><span className="font-mono text-(--accent)">0{i + 1}</span><span className="break-keep">{t(key)}</span></li>)}</ol>
          </section>

          {!roundOver && started && <button type="button" onClick={resign} className={`py-2.5 ${BTN} text-white/45`}><Flag size={13} />{t('resign')}</button>}
        </aside>
      </main>

      {showRules && <div role="dialog" aria-modal="true" aria-labelledby="morris-rules-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setShowRules(false)}>
        <section className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[18px] border border-white/10 bg-[#121518] p-6 shadow-[0_0_80px_rgba(62,201,214,.2)]" onClick={(event) => event.stopPropagation()}>
          <ShieldQuestion className="text-(--accent)" size={28} /><p className={KICKER + ' mt-4'}>{t('rulesKicker')}</p><h2 id="morris-rules-title" className="mt-1 text-2xl font-black text-white">{t('rulesTitle')}</h2>
          <ol className="mt-5 space-y-3">{(t.raw('fullRules') as string[]).map((rule, index) => <li key={rule} className="flex gap-3 text-sm leading-6 text-white/65"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--accent) text-[10px] font-black text-(--accent-ink)">{index + 1}</span><span className="break-keep">{rule}</span></li>)}</ol>
          <button type="button" onClick={() => setShowRules(false)} className={`${BTN_ACCENT} mt-6 w-full py-3`}>{t('understood')}</button>
        </section>
      </div>}
    </div>
    </PieceOwners.Provider>
  );
}

/** Rounds won as two pairs of dots (first to two). */
export function ScoreDots({ you, them, youLabel, themLabel }: { you: number; them: number; youLabel?: string; themLabel?: string }) {
  const dots = (n: number) => Array.from({ length: MORRIS_WINS }, (_, i) => <i key={i} className={`h-2.5 w-2.5 rotate-45 rounded-[2px] ${i < n ? 'bg-(--accent) shadow-[0_0_8px_var(--accent-glow)]' : 'bg-white/10'}`} />);
  return (
    <div className="flex shrink-0 items-center gap-2 rounded-md border border-white/10 bg-black/40 px-3 py-2">
      {youLabel && <span className="max-w-16 truncate text-[10px] font-bold text-white/45">{youLabel}</span>}
      <span className="flex gap-1">{dots(you)}</span>
      <span className="font-mono text-xs font-black">{you}:{them}</span>
      <span className="flex gap-1">{dots(them)}</span>
      {themLabel && <span className="max-w-16 truncate text-[10px] font-bold text-white/45">{themLabel}</span>}
    </div>
  );
}

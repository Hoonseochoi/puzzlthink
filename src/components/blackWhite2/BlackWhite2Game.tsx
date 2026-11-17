"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RotateCcw } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ResultActions from '@/components/ResultActions';
import GameHeader from '@/components/ui/GameHeader';
import { BTN_ACCENT, HEADING, KICKER, MAIN, NOTE, PANEL, PANEL_TITLE, RESULT_PRIMARY, SHELL, STAGE, accentVars, fog, seg } from '@/components/ui/gameUi';
import { reportGame } from '@/lib/stats';
import {
  BW2_MAIN_POINTS, BW2_OVERTIME_POINTS,
  type BW2Difficulty, type BW2Round, type BW2Side, type BW2Stage,
  bw2ColorOf, bw2GaugeOf, bw2IsOver, bw2NextLeader, bw2ResolveRound, bw2RoundsLeft, bw2ScoresOf, bw2StageRounds, bw2WinnerOf, chooseBw2AiBid,
} from '@/lib/blackWhite2';
import { BW2GaugePanel, type BW2LeadView, BW2Replay, BW2RoundLog, BW2Scoreboard, BW2Table, BidControl } from './BW2Parts';

const ACCENT = '#ef3340';
const AI_NAME = 'NOIR';
const FLASH_MS = 1900;
type FirstChoice = 'me' | 'ai' | 'random';
type Lead = { side: BW2Side; bid: number; color: ReturnType<typeof bw2ColorOf>; gaugeAfter: number } | null;

export default function BlackWhite2Game() {
  const t = useTranslations('BlackWhite2');
  const [difficulty, setDifficulty] = useState<BW2Difficulty>('normal');
  const [firstChoice, setFirstChoice] = useState<FirstChoice>('random');
  const [first, setFirst] = useState<BW2Side>(0);
  const [stage, setStage] = useState<BW2Stage>('main');
  const [rounds, setRounds] = useState<BW2Round[]>([]);
  const [bank, setBank] = useState<[number, number]>([BW2_MAIN_POINTS, BW2_MAIN_POINTS]);
  const [lead, setLead] = useState<Lead>(null);
  const [flash, setFlash] = useState<BW2Round | null>(null);
  const [bidValue, setBidValue] = useState(10);
  const [gameNo, setGameNo] = useState(0);

  useEffect(() => {
    const next: BW2Side = firstChoice === 'me' ? 0 : firstChoice === 'ai' ? 1 : Math.random() < 0.5 ? 0 : 1;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- first player is chosen when a fresh game is created
    setFirst(next);
  }, [gameNo, firstChoice]);

  const over = bw2IsOver(rounds);
  const finished = over && !flash;
  const leader = bw2NextLeader(rounds, first);
  const myTurn = !over && !flash && (leader === 0 ? lead === null : lead?.side === 1);
  const aiTurn = !over && !flash && (leader === 1 ? lead === null : lead?.side === 0);
  const gauges: [number, number] = [bw2GaugeOf(bank[0]), bw2GaugeOf(bank[1])];

  const finishRound = (leadSide: BW2Side, leadBid: number, followBid: number, nextBank: [number, number]) => {
    const round = bw2ResolveRound(stage, leadSide, leadBid, followBid, nextBank);
    const nextRounds = [...rounds, round];
    setRounds(nextRounds);
    setBank(nextBank);
    setLead(null);
    setFlash(round);
    setBidValue(Math.min(10, nextBank[0]));

    const score = bw2ScoresOf(nextRounds);
    const mainDone = stage === 'main' && bw2StageRounds(nextRounds, 'main').length >= 9;
    if (mainDone && score[0] === score[1] && !bw2IsOver(nextRounds)) {
      setStage('overtime');
      setBank([BW2_OVERTIME_POINTS, BW2_OVERTIME_POINTS]);
      setBidValue(10);
    }
    if (bw2IsOver(nextRounds)) {
      const winner = bw2WinnerOf(nextRounds);
      reportGame(`black_white_2-ai-${gameNo}-${nextRounds.length}-${Date.now()}`, 'black_white_2', 'ai', winner === 'draw' ? 'draw' : winner === 0 ? 'win' : 'loss', {
        difficulty, rounds: nextRounds.length, score: score[0], against: score[1], overtime: bw2StageRounds(nextRounds, 'overtime').length > 0,
      });
    }
  };

  const commitBid = (side: BW2Side, points: number) => {
    const safe = Math.max(0, Math.min(bank[side], Math.floor(points)));
    const nextBank = [...bank] as [number, number];
    nextBank[side] -= safe;
    if (!lead) {
      setBank(nextBank);
      setLead({ side, bid: safe, color: bw2ColorOf(safe), gaugeAfter: bw2GaugeOf(nextBank[side]) });
      if (side === 0) setBidValue(Math.min(10, nextBank[0]));
      return;
    }
    finishRound(lead.side, lead.bid, safe, nextBank);
  };

  useEffect(() => {
    if (!aiTurn) return;
    const timer = window.setTimeout(() => {
      const points = chooseBw2AiBid({
        rounds, me: 1, first, stage, myBank: bank[1], opponentGauge: bw2GaugeOf(bank[0]),
        lead: lead ? { color: lead.color, gaugeAfter: lead.gaugeAfter } : null, level: difficulty,
      });
      commitBid(1, points);
    }, lead ? 950 : 1150);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one deliberate AI move per turn
  }, [aiTurn, lead]);

  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => setFlash(null), FLASH_MS);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const submit = () => { if (myTurn) commitBid(0, bidValue); };
  const reset = () => {
    setStage('main'); setRounds([]); setBank([BW2_MAIN_POINTS, BW2_MAIN_POINTS]); setLead(null); setFlash(null); setBidValue(10); setGameNo((value) => value + 1);
  };
  const chooseFirst = (choice: FirstChoice) => {
    if (rounds.length || lead) return;
    setFirstChoice(choice);
    if (choice !== 'random') setFirst(choice === 'me' ? 0 : 1);
  };

  const names: [string, string] = [t('you'), AI_NAME];
  const final = bw2WinnerOf(rounds);
  const score = bw2ScoresOf(rounds);
  const status = finished ? (final === 'draw' ? t('finishedDraw') : final === 0 ? t('finishedWin') : t('finishedLoss'))
    : flash ? (flash.winner === null ? t('roundDrawLong') : flash.winner === 0 ? t('roundWinLong') : t('roundLossLong'))
      : stage === 'overtime' && bw2StageRounds(rounds, 'overtime').length === 0 ? t('overtimeStart')
        : myTurn ? (lead ? t('followYou', { color: t(`color.${lead.color}`) }) : t('leadYou'))
          : lead?.side === 0 ? t('aiAnswering') : t('aiLeading');
  const leadView: BW2LeadView = lead ? { ...lead, bid: lead.side === 0 ? lead.bid : null } : null;

  return (
    <div className={SHELL} style={{ ...accentVars(ACCENT, '#ffffff'), backgroundImage: fog('150, 18, 30') }}>
      <GameHeader backHref="/" backLabel="PUZZLTHINK" title={t('title')} titleClass="font-black" subtitle={t('subtitle')}>
        <BugReport /><LanguageSwitcher compact dark /><button type="button" onClick={reset} className={BTN_ACCENT}><RotateCcw size={14} /><span className="hidden sm:inline">{t('newGame')}</span></button>
      </GameHeader>
      <main className={MAIN}>
        <section className={STAGE}>
          <div className="mb-3 px-1 sm:mb-4 sm:px-2"><p className={KICKER}>{finished ? t('resultKicker') : stage === 'overtime' ? t('overtimeKicker') : t('vsAi', { level: t(`levels.${difficulty}`) })}</p><h1 className={`mt-1 ${HEADING}`}>{status}</h1></div>
          {finished ? (
            <BW2Replay key={gameNo} rounds={rounds} me={0} names={names}><ResultActions onAgain={reset} gamePath="/black-white-2" exitPath="/black-white-2" primaryClass={RESULT_PRIMARY} /></BW2Replay>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <BW2Scoreboard rounds={rounds} me={0} names={names} leader={leader} stage={stage} bank={bank} gauges={gauges} finished={false} />
              {stage === 'overtime' && <div className="rounded-[12px] border border-[#ef3340]/30 bg-[#ef3340]/10 px-4 py-3 text-xs font-bold text-[#ffb0b5]">{t('overtimeNotice')}</div>}
              <BW2Table me={0} leader={leader} names={names} lead={leadView} result={flash} waiting={aiTurn ? t('thinking') : null} />
              <BidControl bank={bank[0]} roundsLeft={bw2RoundsLeft(rounds, stage)} value={Math.min(bidValue, bank[0])} onChange={setBidValue} onSubmit={submit} disabled={!myTurn} />
            </div>
          )}
        </section>
        <aside className="flex flex-col gap-4">
          <section className={PANEL}><p className={PANEL_TITLE}>{t('difficulty')}</p><div className="mt-3 grid grid-cols-3 gap-1.5">{(['easy', 'normal', 'hard'] as BW2Difficulty[]).map((level) => <button key={level} type="button" disabled={(rounds.length > 0 || !!lead) && !finished} onClick={() => setDifficulty(level)} className={`py-2.5 ${seg(difficulty === level)} disabled:opacity-40`}>{t(`levels.${level}`)}</button>)}</div><p className="mt-2 break-keep text-[10px] leading-4 text-white/40">{t(`levelDesc.${difficulty}`)}</p></section>
          {!finished && <section className={PANEL}><p className={PANEL_TITLE}>{t('firstPlayer')}</p><div className="mt-3 grid grid-cols-3 gap-1.5">{(['me', 'random', 'ai'] as FirstChoice[]).map((choice) => <button key={choice} type="button" disabled={rounds.length > 0 || !!lead} onClick={() => chooseFirst(choice)} className={`py-2.5 ${seg(firstChoice === choice)} disabled:opacity-40`}>{t(`firstChoice.${choice}`)}</button>)}</div><p className="mt-2 text-[10px] leading-4 text-white/40">{t('firstHint')}</p></section>}
          {!finished && <BW2GaugePanel names={names} me={0} bank={bank} gauges={gauges} />}
          {!finished && <BW2RoundLog rounds={rounds} me={0} />}
          <section className={NOTE}><p className={PANEL_TITLE}>{t('quickRules')}</p><ul className="mt-3 space-y-2.5 text-xs leading-5 text-white/60">{(t.raw('quick') as string[]).map((rule) => <li key={rule} className="flex gap-2.5"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#ef3340]" /><span className="break-keep">{rule}</span></li>)}</ul></section>
          {!finished && score[1] === 4 && score[0] < 4 && <section className="rounded-[12px] border border-[#ef3340]/30 bg-[#ef3340]/10 p-4"><p className={PANEL_TITLE}>{t('matchPointTitle')}</p><p className="mt-2 break-keep text-xs leading-5 text-white/60">{t('matchPointHint', { gap: (4 - score[0]) * 10 })}</p></section>}
        </aside>
      </main>
    </div>
  );
}

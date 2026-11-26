"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RotateCcw, Send } from 'lucide-react';
import BugReport from '@/components/BugReport';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ResultActions from '@/components/ResultActions';
import GameHeader from '@/components/ui/GameHeader';
import { BTN_ACCENT, HEADING, KICKER, MAIN, PANEL, PANEL_TITLE, RESULT_PRIMARY, SHELL, STAGE, accentVars, fog, seg } from '@/components/ui/gameUi';
import { reportGame } from '@/lib/stats';
import { type BWDifficulty, type BWRound, type Side, chooseAiTile, colorOf, isOver, nextLeader, resolveRound, winnerOf } from '@/lib/blackWhite';
import { Hand, MemoPad, OpponentTrack, Replay, RoundLog, Scoreboard, Table } from './BWParts';
import GameUpdates from '@/components/GameUpdates';

const ACCENT = '#e9c46a';
const AI_NAME = 'LUNA';
const FLASH_MS = 1700;

type Lead = { side: Side; tile: number } | null;

export default function BlackWhiteGame() {
  const t = useTranslations('BlackWhite');
  const [difficulty, setDifficulty] = useState<BWDifficulty>('normal');
  const [first, setFirst] = useState<Side>(0);
  const [rounds, setRounds] = useState<BWRound[]>([]);
  const [lead, setLead] = useState<Lead>(null);
  const [flash, setFlash] = useState<BWRound | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [gameNo, setGameNo] = useState(0);

  const over = isOver(rounds);
  const finished = over && !flash;
  const leader = nextLeader(rounds, first);
  const myTurn = !over && !flash && (leader === 0 ? lead === null : lead?.side === 1);
  const aiTurn = !over && !flash && (leader === 1 ? lead === null : lead?.side === 0);

  // A coin toss decides who leads round 1 (from the second game on as well).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- random first player after mount (keeps SSR stable)
    setFirst(Math.random() < 0.5 ? 0 : 1);
  }, [gameNo]);

  const resolve = (leadSide: Side, leadTile: number, followTile: number) => {
    const round = resolveRound(leadSide, leadTile, followTile);
    const next = [...rounds, round];
    setRounds(next);
    setLead(null);
    setFlash(round);
    setSelected(null);
    if (isOver(next)) {
      const w = winnerOf(next);
      reportGame(`black_white-ai-${gameNo}-${next.length}-${Date.now()}`, 'black_white', 'ai', w === 'draw' ? 'draw' : w === 0 ? 'win' : 'loss',
        { difficulty, rounds: next.length, score: next.filter((r) => r.winner === 0).length, against: next.filter((r) => r.winner === 1).length });
    }
  };

  // The AI moves after a short pause, so its choice does not feel instant.
  useEffect(() => {
    if (!aiTurn) return;
    const timer = window.setTimeout(() => {
      const leadColor = lead ? colorOf(lead.tile) : null;
      const tile = chooseAiTile(rounds, 1, first, leadColor, difficulty);
      if (lead) resolve(0, lead.tile, tile);
      else setLead({ side: 1, tile });
    }, lead ? 900 : 1100);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per AI turn
  }, [aiTurn, lead]);

  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => setFlash(null), FLASH_MS);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const submit = () => {
    if (!myTurn || selected === null) return;
    if (lead?.side === 1) resolve(1, lead.tile, selected);
    else { setLead({ side: 0, tile: selected }); setSelected(null); }
  };

  const reset = () => {
    setRounds([]); setLead(null); setFlash(null); setSelected(null); setGameNo((n) => n + 1);
  };

  const names: [string, string] = [t('you'), AI_NAME];
  const final = winnerOf(rounds);
  const status = finished ? (final === 'draw' ? t('finishedDraw') : final === 0 ? t('finishedWin') : t('finishedLoss'))
    : flash ? (flash.winner === null ? t('roundDraw') : flash.winner === 0 ? t('roundWinLong') : t('roundLossLong'))
      : myTurn ? (lead ? t('followYou', { color: t(`color.${colorOf(lead.tile)}`) }) : t('leadYou'))
        : lead?.side === 0 ? t('aiAnswering') : t('aiLeading');

  return (
    <div className={SHELL} style={{ ...accentVars(ACCENT, '#17120a'), backgroundImage: fog('180, 180, 190') }}>
      <GameHeader ai backHref="/" backLabel="PUZZLTHINK" title={t('title')} titleClass="font-black" subtitle={t('subtitle')}>
        <GameUpdates game="black_white" /><BugReport /><LanguageSwitcher compact dark />
        <button type="button" onClick={reset} className={BTN_ACCENT}><RotateCcw size={14} /><span className="hidden sm:inline">{t('newGame')}</span></button>
      </GameHeader>

      <main className={MAIN}>
        <section className={STAGE}>
          <div className="mb-3 px-1 sm:mb-4 sm:px-2">
            <p className={KICKER}>{finished ? t('resultKicker') : t('vsAi', { level: t(`levels.${difficulty}`) })}</p>
            <h1 className={`mt-1 ${HEADING}`}>{status}</h1>
          </div>

          {finished ? (
            <Replay key={gameNo} rounds={rounds} me={0} names={names}>
              <ResultActions onAgain={reset} gamePath="/black-white" exitPath="/black-white" primaryClass={RESULT_PRIMARY} />
            </Replay>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <Scoreboard rounds={rounds} me={0} names={names} leader={leader} finished={false} />
              <OpponentTrack rounds={rounds} me={0} laid={lead?.side === 1 ? colorOf(lead.tile) : null} name={AI_NAME} />
              <Table me={0} leader={leader} names={names} result={flash}
                myTile={lead?.side === 0 ? lead.tile : null} theirColor={lead?.side === 1 ? colorOf(lead.tile) : null}
                waiting={aiTurn ? t('thinking') : null} />
              <div className="rounded-[14px] border border-white/10 bg-black/30 p-3 sm:p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className={PANEL_TITLE}>{t('myTiles')}</p>
                  <p className="text-[10px] font-bold text-white/40">{t('evenOdd')}</p>
                </div>
                <Hand rounds={rounds} me={0} laid={lead?.side === 0 ? lead.tile : null} selected={myTurn ? selected : null} onSelect={setSelected} disabled={!myTurn} />
                <button type="button" onClick={submit} disabled={!myTurn || selected === null} className={`${BTN_ACCENT} mt-3 w-full py-3 text-sm`}>
                  <Send size={15} />{selected !== null && myTurn ? t('playTile', { n: selected }) : t('pickTile')}
                </button>
              </div>
            </div>
          )}
        </section>

        <aside className="flex flex-col gap-4">
          <section className={PANEL}>
            <p className={PANEL_TITLE}>{t('difficulty')}</p>
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {(['easy', 'normal', 'hard'] as BWDifficulty[]).map((level) => (
                <button key={level} type="button" disabled={rounds.length > 0 && !finished} onClick={() => setDifficulty(level)} className={`py-2.5 ${seg(difficulty === level)} disabled:opacity-40`}>{t(`levels.${level}`)}</button>
              ))}
            </div>
            <p className="mt-2 break-keep text-[10px] leading-4 text-white/40">{t(`levelDesc.${difficulty}`)}</p>
          </section>
          {!finished && <MemoPad resetKey={`ai-${gameNo}`} />}
          {!finished && <RoundLog rounds={rounds} me={0} />}
          <section className={PANEL}>
            <p className={PANEL_TITLE}>{t('quickRules')}</p>
            <ul className="mt-3 space-y-2.5 text-xs leading-5 text-white/55">
              {(t.raw('quick') as string[]).map((rule) => <li key={rule} className="flex gap-2.5"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-(--accent)" /><span className="break-keep">{rule}</span></li>)}
            </ul>
          </section>
        </aside>
      </main>
    </div>
  );
}

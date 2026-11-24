"use client";

import BugReport from '@/components/BugReport';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Clock3, Flag, Flame, Infinity, RotateCcw, Sparkles } from 'lucide-react';
import { type Action, type Difficulty, type RJState, type Side, TURN_SECONDS, applyAction, chooseAiAction, finish, initialState, isOver } from '@/lib/russianJanggi';
import { requestHellAction } from '@/lib/russianJanggiHellClient';
import { reportGame } from '@/lib/stats';
import LanguageSwitcher from '../LanguageSwitcher';
import WallGoShards from '../WallGoShards';
import GameHeader from '../ui/GameHeader';
import { BTN, BTN_ACCENT, CHIP, DIAMOND, HEADING, KICKER, MAIN, NOTE, SHELL, STAGE, WELL, seg } from '../ui/gameUi';
import RJTable from './RJTable';
import RJResult from './RJResult';
import RJReplay from './RJReplay';
import RJPiece from './RJPiece';
import TurnClock from './TurnClock';
import { describeAction } from './describe';
import { RJ_PANEL, RJ_ROOT, RJ_SHARD, RJ_TITLE, SIDE_COLORS } from './theme';
import { HELL_HINT, hellSeg } from '../janggi/hellStyle';

const RECORD_KEY = 'puzzlthink_rjanggi_records';
const TIMED_KEY = 'puzzlthink_rjanggi_timed';
export const RESULT_DELAY_MS = 2000;
const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard']; // 'hell' gets its own row below
type FirstChoice = 'me' | 'ai' | 'random';
/** A level named in the link (e.g. `?difficulty=hell#play` from the 헬모드 page), if it is one of ours. */
const linkedDifficulty = (): Difficulty | null => {
  try {
    const level = new URLSearchParams(window.location.search).get('difficulty');
    return level === 'hell' || (DIFFICULTIES as string[]).includes(level ?? '') ? (level as Difficulty) : null;
  } catch { return null; }
};
type MatchRecord = { won: boolean; draw: boolean; difficulty: Difficulty; date: string };

export default function RJGame() {
  const t = useTranslations('RussianJanggi');
  const [firstChoice, setFirstChoice] = useState<FirstChoice>('random');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [game, setGame] = useState<RJState>(() => initialState(0));
  const [deadline, setDeadline] = useState(0);
  const [now, setNow] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [records, setRecords] = useState<MatchRecord[]>([]);
  const [saved, setSaved] = useState(false);
  const [timed, setTimed] = useState(true); // AI games can turn the 10-second clock off
  const [resultOpen, setResultOpen] = useState(false);
  const [replaying, setReplaying] = useState(false);
  const names: [string, string] = [t('you'), 'AI'];
  const over = isOver(game);

  const newGame = (choice: FirstChoice = firstChoice, level: Difficulty = difficulty) => {
    const first: Side = choice === 'me' ? 0 : choice === 'ai' ? 1 : Math.random() < 0.5 ? 0 : 1;
    setFirstChoice(choice); setDifficulty(level); setGame(initialState(first)); setSaved(false);
    setResultOpen(false); setReplaying(false);
    setDeadline(Date.now() + TURN_SECONDS * 1000);
    setLog([t(first === 0 ? 'logYouFirst' : 'logAiFirst')]);
  };

  const play = (action: Action) => {
    const next = applyAction(game, action);
    const lines = [describeAction(t, game, action, names[game.turn])];
    if (action.kind !== 'pass' && next.skipped !== null && !isOver(next)) lines.unshift(t('logNoMove', { player: names[next.skipped] }));
    setLog((items) => [...lines, ...items].slice(0, 12));
    setGame(next);
    setDeadline(Date.now() + TURN_SECONDS * 1000);
  };

  // Latest values for the clock tick.
  const latest = useRef({ game, deadline, play, timed });
  useEffect(() => { latest.current = { game, deadline, play, timed }; });

  const toggleTimed = (on: boolean) => {
    setTimed(on); setDeadline(now + TURN_SECONDS * 1000); // `now` ticks every 200ms
    try { localStorage.setItem(TIMED_KEY, on ? '1' : '0'); } catch { /* Optional. */ }
  };

  // Leave the final board up for a moment before the result pops up.
  useEffect(() => {
    if (!over) return;
    const timer = window.setTimeout(() => setResultOpen(true), RESULT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [over, game]);

  useEffect(() => {
    const boot = window.setTimeout(() => {
      try { setRecords(JSON.parse(localStorage.getItem(RECORD_KEY) || '[]')); } catch { /* Optional history. */ }
      try { if (localStorage.getItem(TIMED_KEY) === '0') setTimed(false); } catch { /* Optional. */ }
      newGame('random', linkedDifficulty() ?? 'normal'); // ?difficulty=hell from the 헬모드 page
    }, 0);
    // Clock: when my 10 seconds run out, the turn passes (rule ⑤).
    const tick = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      const { game: g, deadline: d, play: p, timed: on } = latest.current;
      if (on && d && !isOver(g) && g.turn === 0 && current >= d) p({ kind: 'pass' });
    }, 200);
    return () => { window.clearTimeout(boot); window.clearInterval(tick); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // AI turn.
  useEffect(() => {
    if (over || game.turn !== 1) return;
    if (difficulty === 'hell') {
      // Searched in a Web Worker for about a second; the board stays live meanwhile.
      let cancelled = false;
      const started = Date.now();
      requestHellAction(game).then((action) => {
        const wait = Math.max(0, 350 - (Date.now() - started));
        window.setTimeout(() => { if (!cancelled) play(action); }, wait);
      });
      return () => { cancelled = true; };
    }
    const timer = window.setTimeout(() => play(chooseAiAction(game, difficulty)), difficulty === 'hard' ? 350 : 700);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, over, difficulty]);

  // Save the result once.
  useEffect(() => {
    if (!over || saved) return;
    const record: MatchRecord = { won: game.winner === 0, draw: game.winner === null, difficulty, date: new Date().toISOString() };
    const timer = window.setTimeout(() => {
      setSaved(true);
      reportGame(`russian_janggi-ai-${record.date}`, 'russian_janggi', 'ai', record.draw ? 'draw' : record.won ? 'win' : 'loss', { difficulty, reason: game.reason, moves: game.ply, replay: { first: game.first, moves: game.moves ?? [] } });
      setRecords((current) => {
        const next = [record, ...current].slice(0, 50);
        try { localStorage.setItem(RECORD_KEY, JSON.stringify(next)); } catch { /* Optional. */ }
        return next;
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [over, saved, game.winner, game.reason, game.ply, game.first, game.moves, difficulty]);

  const wins = records.filter((r) => r.won).length;
  const status = over ? t('gameOver') : game.turn === 0 ? t('yourTurn') : t('aiThinking');

  return (
    <div className={SHELL} style={RJ_ROOT}>
      <WallGoShards tint={RJ_SHARD} />
      <GameHeader backHref="/" backLabel="PUZZLTHINK" title={t('title')} subtitle="NESTING 3×3">
        <BugReport /><LanguageSwitcher compact dark />
        <button onClick={() => newGame()} className={BTN_ACCENT}><RotateCcw size={14} /><span className="hidden sm:inline">{t('newGame')}</span></button>
      </GameHeader>

      <main className={MAIN}>
        <section className={STAGE}>
          <div className="mx-auto mb-4 flex max-w-[440px] items-center justify-between gap-3 px-1">
            <div className="min-w-0">
              <p className={`mb-1 ${KICKER}`}>MOVE {String(game.ply + 1).padStart(2, '0')}</p>
              <h2 className={`flex items-center gap-2 ${HEADING}`}>
                {!over && <i className="h-2 w-2 rounded-full" style={{ background: SIDE_COLORS[game.turn], boxShadow: `0 0 10px ${SIDE_COLORS[game.turn]}` }} />}
                {status}
              </h2>
            </div>
            {!over && timed && game.turn === 0 && deadline > 0 && now > 0 && <TurnClock remainingMs={deadline - now} urgent />}
            {!over && !timed && <span className={CHIP}><Infinity size={13} />{t('timeLimit_off')}</span>}
          </div>
          {replaying
            ? <RJReplay game={game} viewer={0} names={names} onShowResult={() => { setReplaying(false); setResultOpen(true); }} onClose={() => setReplaying(false)} />
            : <RJTable game={game} viewer={0} canAct={!over && game.turn === 0} onAction={play} names={names} />}
        </section>

        <aside className="flex flex-col gap-4">
          <section className={RJ_PANEL}>
            <h2 className={RJ_TITLE}>{t('difficulty')}</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">{DIFFICULTIES.map((level) => <button key={level} onClick={() => newGame(firstChoice, level)} className={`p-2.5 ${seg(difficulty === level)}`}>{t(`difficulty_${level}`)}</button>)}
              <button onClick={() => newGame(firstChoice, 'hell')} className={`col-span-3 p-2.5 ${hellSeg(difficulty === 'hell')}`}><Flame size={13} />{t('difficulty_hell')}</button>
            </div>
            {difficulty === 'hell' && <p className={HELL_HINT}>{t('hellHint')}</p>}
            <h2 className={`${RJ_TITLE} mt-4`}>{t('firstPlayer')}</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">{(['me', 'ai', 'random'] as FirstChoice[]).map((choice) => <button key={choice} onClick={() => newGame(choice)} className={`p-2.5 ${seg(firstChoice === choice)}`}>{t(`first_${choice}`)}</button>)}</div>
            <h2 className={`${RJ_TITLE} mt-4`}>{t('timeLimit')}</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">{[true, false].map((on) => <button key={String(on)} onClick={() => toggleTimed(on)} className={`flex items-center justify-center gap-1.5 p-2.5 ${seg(timed === on)}`}>{on ? <Clock3 size={13} /> : <Infinity size={13} />}{t(on ? 'timeLimit_on' : 'timeLimit_off')}</button>)}</div>
          </section>
          <RulesPanel />
          <section className={`grid grid-cols-3 gap-2 ${RJ_PANEL}`}>
            <h2 className={`col-span-3 ${RJ_TITLE}`}>{t('record')}</h2>
            {records.length ? <>
              <div><p className="text-[10px] text-white/35">{t('games')}</p><p className="text-xl font-black">{records.length}</p></div>
              <div><p className="text-[10px] text-white/35">{t('wins')}</p><p className="text-xl font-black text-(--accent)">{wins}</p></div>
              <div><p className="text-[10px] text-white/35">{t('winRate')}</p><p className="text-xl font-black">{Math.round((wins / records.length) * 100)}%</p></div>
            </> : <p className="col-span-3 text-xs text-white/40">{t('recordEmpty')}</p>}
          </section>
          <section className={`min-h-[140px] ${RJ_PANEL}`}>
            <h2 className={`mb-3 ${RJ_TITLE}`}>{t('log')}</h2>
            <div className="space-y-2">{log.slice(0, 6).map((line, i) => <div key={`${line}-${i}`} className="flex gap-2 text-[11px] leading-relaxed text-white/55">{i === 0 ? <span className={DIAMOND} /> : <Check size={11} className="mt-0.5 shrink-0 text-white/25" />}<span>{line}</span></div>)}</div>
          </section>
          {!over && game.ply > 0 && <button onClick={() => setGame(finish(game, 1, 'resign'))} className={`${BTN} !py-2.5 !text-white/45 hover:!text-white`}><Flag size={13} />{t('resign')}</button>}
        </aside>
      </main>

      {over && resultOpen && !replaying && (
        <RJResult game={game} viewer={0} names={names} onAgain={() => newGame()} exitPath="/"
          onReplay={() => { setResultOpen(false); setReplaying(true); }} onClose={() => setResultOpen(false)} />
      )}
    </div>
  );
}

/** The five rules, with a little size ladder. */
export function RulesPanel({ extra }: { extra?: string }) {
  const t = useTranslations('RussianJanggi');
  return (
    <section className={NOTE}>
      <div className="mb-3 flex items-center gap-2"><Sparkles size={15} className="text-(--accent)" /><h2 className={RJ_TITLE}>{t('quickRules')}</h2></div>
      <div className={`mb-4 flex items-end justify-center gap-3 py-3 ${WELL}`}>
        {([0, 1, 2] as const).map((size) => (
          <div key={size} className="flex flex-col items-center gap-1.5">
            <RJPiece owner={size === 1 ? 1 : 0} size={size} style={{ width: 20 + size * 12, height: 20 + size * 12 }} />
            <span className="text-[10px] font-bold text-white/45">{t(`size_${size}`)}</span>
          </div>
        ))}
      </div>
      <ol className="space-y-2.5 text-xs leading-relaxed text-white/65">{['rule1', 'rule2', 'rule3', 'rule4', 'rule5'].map((key, i) => <li key={key} className="flex gap-3"><span className="font-mono text-(--accent)">0{i + 1}</span><span>{t(key)}</span></li>)}</ol>
      {extra && <p className="mt-3 text-[11px] text-white/40">{extra}</p>}
    </section>
  );
}

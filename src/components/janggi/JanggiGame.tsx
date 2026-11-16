"use client";

import BugReport from '@/components/BugReport';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BookOpen, Check, Clock3, Flag, Infinity, RotateCcw, Sparkles } from 'lucide-react';
import { type Action, type Difficulty, type JanggiState, type Side, HANJA, cellName, chooseAiAction, finish, initialState, playableActions, playAction } from '@/lib/janggi';
import { reportGame } from '@/lib/stats';
import LanguageSwitcher from '../LanguageSwitcher';
import JanggiTable from './JanggiTable';
import JanggiTutorial from './JanggiTutorial';
import JanggiResult from './JanggiResult';
import JanggiReplay from './JanggiReplay';
import WallGoShards from '../WallGoShards';
import GameHeader from '../ui/GameHeader';
import { BTN, BTN_ACCENT, CHIP, DIAMOND, HEADING, KICKER, MAIN, NOTE, PANEL, PANEL_TITLE, SHELL, STAGE, accentVars, seg, timer } from '../ui/gameUi';
import { GOLD, JANGGI_FOG, SIDE_COLORS, hanjaFont } from './theme';

const RECORD_KEY = 'puzzlthink_janggi_records';
const TUTORIAL_KEY = 'puzzlthink_janggi_tutorial_seen';
const TURN_KEY = 'puzzlthink_janggi_turn_sec';
const TURN_CHOICES = [0, 90, 60, 30] as const; // 0 = no clock
type TurnChoice = (typeof TURN_CHOICES)[number];
type ClockView = { game: JanggiState; deadline: number; turnSec: number; paused: boolean; timeouts: number; play: (action: Action, auto?: boolean) => void; timeOut: () => void };
export const RESULT_DELAY_MS = 2000;
const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard'];
type FirstChoice = 'me' | 'ai' | 'random';
type MatchRecord = { won: boolean; draw: boolean; difficulty: Difficulty; date: string };

export function describeAction(t: (key: string, values?: Record<string, string | number>) => string, before: JanggiState, action: Action, player: string) {
  if (action.kind === 'drop') return t('logDrop', { player, piece: HANJA[action.type], cell: cellName(action.to) });
  const piece = before.board[action.from]!;
  const captured = before.board[action.to];
  return captured
    ? t('logCapture', { player, piece: HANJA[piece.type], target: HANJA[captured.type], cell: cellName(action.to) })
    : t('logMove', { player, piece: HANJA[piece.type], cell: cellName(action.to) });
}

export default function JanggiGame() {
  const t = useTranslations('Janggi');
  const [firstChoice, setFirstChoice] = useState<FirstChoice>('random');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [game, setGame] = useState<JanggiState>(() => initialState(0));
  const [log, setLog] = useState<string[]>([]);
  const [records, setRecords] = useState<MatchRecord[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [saved, setSaved] = useState(false);
  const [turnSec, setTurnSec] = useState<TurnChoice>(0);
  const [deadline, setDeadline] = useState(0);
  const [now, setNow] = useState(0);
  const [timeouts, setTimeouts] = useState(0); // my timeouts in a row; three loses on time
  const [resultOpen, setResultOpen] = useState(false);
  const [replaying, setReplaying] = useState(false);
  const names = [t('you'), 'AI'];
  const over = game.winner !== null || game.reason !== null;

  // Latest values for the clock tick (filled in after each render, below).
  const latest = useRef<ClockView | null>(null);

  const newGame = (choice: FirstChoice = firstChoice, level: Difficulty = difficulty) => {
    const first: Side = choice === 'me' ? 0 : choice === 'ai' ? 1 : Math.random() < 0.5 ? 0 : 1;
    setFirstChoice(choice); setDifficulty(level); setGame(initialState(first)); setSaved(false);
    setResultOpen(false); setReplaying(false); setTimeouts(0); setDeadline(Date.now() + turnSec * 1000);
    setLog([t(first === 0 ? 'logYouFirst' : 'logAiFirst')]);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setRecords(JSON.parse(localStorage.getItem(RECORD_KEY) || '[]')); } catch { /* Optional history. */ }
      try { if (!localStorage.getItem(TUTORIAL_KEY)) setShowTutorial(true); } catch { /* Optional. */ }
      try { const saved = Number(localStorage.getItem(TURN_KEY)); if ((TURN_CHOICES as readonly number[]).includes(saved)) setTurnSec(saved as TurnChoice); } catch { /* Optional. */ }
      newGame('random');
    }, 0);
    // Turn clock: when my time runs out a random legal move is played; three in a row loses on time.
    const tick = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (!latest.current) return;
      const { game: g, deadline: d, turnSec: sec, paused, timeouts: misses, play: p, timeOut } = latest.current;
      if (!sec || paused || !d || g.winner !== null || g.reason !== null || g.turn !== 0 || current < d) return;
      if (misses >= 2) { timeOut(); return; }
      const options = playableActions(g);
      if (options.length) p(options[Math.floor(Math.random() * options.length)], true);
    }, 250);
    return () => { window.clearTimeout(timer); window.clearInterval(tick); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const play = (action: Action, auto = false) => {
    const line = describeAction(t, game, action, names[game.turn]);
    setLog((items) => [auto ? `${t('logTimeoutMove')} ${line}` : line, ...items].slice(0, 10));
    if (game.turn === 0) setTimeouts(auto ? timeouts + 1 : 0);
    setGame(playAction(game, action));
    setDeadline(Date.now() + turnSec * 1000);
  };
  const timeOut = () => setGame(finish(game, 1, 'timeout'));

  useEffect(() => { latest.current = { game, deadline, turnSec, paused: showTutorial, timeouts, play, timeOut }; });

  const chooseTurnSec = (sec: TurnChoice) => {
    setTurnSec(sec); setDeadline(now + sec * 1000); setTimeouts(0); // `now` ticks every 250ms
    try { localStorage.setItem(TURN_KEY, String(sec)); } catch { /* Optional. */ }
  };

  // Leave the final board up for a moment before the result pops up.
  useEffect(() => {
    if (!over) return;
    const timer = window.setTimeout(() => setResultOpen(true), RESULT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [over, game]);

  // AI turn.
  useEffect(() => {
    if (over || game.turn !== 1 || showTutorial) return;
    const timer = window.setTimeout(() => {
      const action = chooseAiAction(game, difficulty);
      if (action) play(action);
    }, difficulty === 'hard' ? 350 : 650);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, over, difficulty, showTutorial]);

  // Save the result once.
  useEffect(() => {
    if (!over || saved) return;
    const record: MatchRecord = { won: game.winner === 0, draw: game.winner === null, difficulty, date: new Date().toISOString() };
    const timer = window.setTimeout(() => {
      setSaved(true);
      reportGame(`janggi-ai-${record.date}`, 'janggi', 'ai', game.winner === null ? 'draw' : game.winner === 0 ? 'win' : 'loss', { difficulty, reason: game.reason, moves: game.ply });
      setRecords((current) => {
        const next = [record, ...current].slice(0, 50);
        try { localStorage.setItem(RECORD_KEY, JSON.stringify(next)); } catch { /* Optional. */ }
        return next;
      });
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [over, saved, game.winner, difficulty]);

  const closeTutorial = () => { try { localStorage.setItem(TUTORIAL_KEY, '1'); } catch { /* Optional. */ } setShowTutorial(false); };
  const wins = records.filter((r) => r.won).length;
  const status = over ? '' : game.turn === 0 ? t('yourTurn') : t('aiThinking');

  return (
    <div className={SHELL} style={{ ...accentVars(GOLD, '#1a1408'), backgroundImage: JANGGI_FOG }}>
      <WallGoShards tint="#4a3812" />
      {showTutorial && <JanggiTutorial onClose={closeTutorial} />}
      <GameHeader backHref="/" backLabel="PUZZLTHINK" title="十二將棋" titleClass={hanjaFont.className} subtitle={t('subtitle')}>
        <button onClick={() => setShowTutorial(true)} className={BTN}><BookOpen size={14} /><span className="hidden sm:inline">{t('howToPlay')}</span></button>
        <BugReport /><LanguageSwitcher compact dark />
        <button onClick={() => newGame()} className={BTN_ACCENT}><RotateCcw size={14} /><span className="hidden sm:inline">{t('newGame')}</span></button>
      </GameHeader>

      <main className={MAIN}>
        <section className={STAGE}>
          <div className="mx-auto mb-4 flex max-w-[480px] items-center justify-between gap-3 px-1">
            <div className="min-w-0">
              <p className={KICKER}>MOVE {String(game.ply + 1).padStart(2, '0')}</p>
              <h2 className={`mt-1 truncate ${HEADING}`}>{over ? t('gameOver') : status}</h2>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {!over && turnSec > 0 && game.turn === 0 && deadline > 0 && now > 0 && (() => {
                const left = Math.max(0, Math.ceil((deadline - now) / 1000));
                return <span className={timer(left <= 10)}><Clock3 size={14} />{`${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`}</span>;
              })()}
              <span className={`${CHIP} py-2 text-[11px]`}>
                <i className="h-2 w-2 rotate-45" style={{ background: SIDE_COLORS[game.turn], boxShadow: `0 0 10px ${SIDE_COLORS[game.turn]}` }} />{names[game.turn]}
              </span>
            </div>
          </div>
          {replaying
            ? <JanggiReplay game={game} viewer={0} names={names} onShowResult={() => { setReplaying(false); setResultOpen(true); }} onClose={() => setReplaying(false)} />
            : <JanggiTable game={game} viewer={0} canAct={!over && game.turn === 0 && !showTutorial} onAction={play} />}
        </section>

        <aside className="flex flex-col gap-4">
          <section className={PANEL}>
            <h2 className={PANEL_TITLE}>{t('difficulty')}</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">{DIFFICULTIES.map((level) => <button key={level} onClick={() => newGame(firstChoice, level)} className={`p-2.5 ${seg(difficulty === level)}`}>{t(`difficulty_${level}`)}</button>)}</div>
            <h2 className={`${PANEL_TITLE} mt-4`}>{t('firstPlayer')}</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">{(['me', 'ai', 'random'] as FirstChoice[]).map((choice) => <button key={choice} onClick={() => newGame(choice)} className={`p-2.5 ${seg(firstChoice === choice)}`}>{t(`first_${choice}`)}</button>)}</div>
            <h2 className={`${PANEL_TITLE} mt-4`}>{t('turnTime')}</h2>
            <div className="mt-3 grid grid-cols-4 gap-2">{TURN_CHOICES.map((sec) => <button key={sec} onClick={() => chooseTurnSec(sec)} className={`flex items-center justify-center gap-1 p-2.5 ${seg(turnSec === sec)}`}>{sec === 0 ? <><Infinity size={13} />{t('turnTime_off')}</> : t('turnSeconds', { n: sec })}</button>)}</div>
            {turnSec > 0 && <p className="mt-2 text-[10px] leading-4 text-white/35">{t('turnTimeHint')}</p>}
          </section>
          <section className={NOTE}>
            <div className="mb-4 flex items-center gap-2"><Sparkles size={15} className="text-(--accent)" /><h2 className={PANEL_TITLE}>{t('quickRules')}</h2></div>
            <ol className="space-y-3 text-xs leading-relaxed text-white/65">{['quick1', 'quick2', 'quick3', 'quick4', 'quick5'].map((key, i) => <li key={key} className="flex gap-3"><span className="font-mono text-(--accent)">0{i + 1}</span><span>{t(key)}</span></li>)}</ol>
          </section>
          <section className={`grid grid-cols-3 gap-2 ${PANEL}`}>
            <h2 className={`col-span-3 ${PANEL_TITLE}`}>{t('record')}</h2>
            {records.length ? <>
              <div><p className="text-[10px] text-white/35">{t('games')}</p><p className="text-xl font-black">{records.length}</p></div>
              <div><p className="text-[10px] text-white/35">{t('wins')}</p><p className="text-xl font-black text-(--accent)">{wins}</p></div>
              <div><p className="text-[10px] text-white/35">{t('winRate')}</p><p className="text-xl font-black">{Math.round((wins / records.length) * 100)}%</p></div>
            </> : <p className="col-span-3 text-xs text-white/40">{t('recordEmpty')}</p>}
          </section>
          <section className={`min-h-[142px] ${PANEL}`}>
            <h2 className={`mb-3 ${PANEL_TITLE}`}>{t('log')}</h2>
            <div className="space-y-2">{log.slice(0, 6).map((line, i) => <div key={`${line}-${i}`} className="flex gap-2 text-[11px] leading-relaxed text-white/55">{i === 0 ? <span className={DIAMOND} /> : <Check size={11} className="mt-0.5 shrink-0 text-white/25" />}<span>{line}</span></div>)}</div>
          </section>
          {!over && game.ply > 0 && <button onClick={() => setGame(finish(game, 1, 'resign'))} className={`py-2.5 ${BTN} text-white/45`}><Flag size={13} />{t('resign')}</button>}
        </aside>
      </main>

      {over && resultOpen && !replaying && (
        <JanggiResult game={game} viewer={0} names={names} onAgain={() => newGame()} exitPath="/"
          onReplay={() => { setResultOpen(false); setReplaying(true); }} onClose={() => setResultOpen(false)} />
      )}
    </div>
  );
}

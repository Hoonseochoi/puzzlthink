"use client";

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Check, Flag, Link2, RotateCcw, Sparkles } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { type Action, type Difficulty, type RJState, type Side, TURN_SECONDS, applyAction, chooseAiAction, finish, initialState, isOver } from '@/lib/russianJanggi';
import { prepareRussianJanggiRoom } from '@/hooks/useRussianJanggiRoom';
import { reportGame } from '@/lib/stats';
import LanguageSwitcher from '../LanguageSwitcher';
import RJTable from './RJTable';
import RJResult from './RJResult';
import RJPiece from './RJPiece';
import TurnClock from './TurnClock';
import { describeAction } from './describe';
import { ACCENT_TEXT, RJ_FOG, RJ_PANEL, RJ_TITLE, SIDE_COLORS } from './theme';

const RECORD_KEY = 'puzzlthink_rjanggi_records';
const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard'];
type FirstChoice = 'me' | 'ai' | 'random';
type MatchRecord = { won: boolean; draw: boolean; difficulty: Difficulty; date: string };

export default function RJGame() {
  const t = useTranslations('RussianJanggi');
  const router = useRouter();
  const [firstChoice, setFirstChoice] = useState<FirstChoice>('random');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [game, setGame] = useState<RJState>(() => initialState(0));
  const [deadline, setDeadline] = useState(0);
  const [now, setNow] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [records, setRecords] = useState<MatchRecord[]>([]);
  const [saved, setSaved] = useState(false);
  const names: [string, string] = [t('you'), 'AI'];
  const over = isOver(game);

  const newGame = (choice: FirstChoice = firstChoice, level: Difficulty = difficulty) => {
    const first: Side = choice === 'me' ? 0 : choice === 'ai' ? 1 : Math.random() < 0.5 ? 0 : 1;
    setFirstChoice(choice); setDifficulty(level); setGame(initialState(first)); setSaved(false);
    setDeadline(Date.now() + TURN_SECONDS * 1000);
    setLog([t(first === 0 ? 'logYouFirst' : 'logAiFirst')]);
  };

  const play = (action: Action) => {
    const next = applyAction(game, action);
    const lines = [describeAction(t, game, action, names[game.turn])];
    if (action.kind === 'place' && next.skipped !== null && !isOver(next)) lines.unshift(t('logNoMove', { player: names[next.skipped] }));
    setLog((items) => [...lines, ...items].slice(0, 12));
    setGame(next);
    setDeadline(Date.now() + TURN_SECONDS * 1000);
  };

  // Latest values for the clock tick.
  const latest = useRef({ game, deadline, play });
  useEffect(() => { latest.current = { game, deadline, play }; });

  useEffect(() => {
    const boot = window.setTimeout(() => {
      try { setRecords(JSON.parse(localStorage.getItem(RECORD_KEY) || '[]')); } catch { /* Optional history. */ }
      newGame('random');
    }, 0);
    // Clock: when my 10 seconds run out, the turn passes (rule ⑤).
    const tick = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      const { game: g, deadline: d, play: p } = latest.current;
      if (d && !isOver(g) && g.turn === 0 && current >= d) p({ kind: 'pass' });
    }, 200);
    return () => { window.clearTimeout(boot); window.clearInterval(tick); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // AI turn.
  useEffect(() => {
    if (over || game.turn !== 1) return;
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
      reportGame(`russian_janggi-ai-${record.date}`, 'russian_janggi', 'ai', record.draw ? 'draw' : record.won ? 'win' : 'loss', { difficulty, reason: game.reason, moves: game.ply });
      setRecords((current) => {
        const next = [record, ...current].slice(0, 50);
        try { localStorage.setItem(RECORD_KEY, JSON.stringify(next)); } catch { /* Optional. */ }
        return next;
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [over, saved, game.winner, game.reason, game.ply, difficulty]);

  const wins = records.filter((r) => r.won).length;
  const status = over ? t('gameOver') : game.turn === 0 ? t('yourTurn') : t('aiThinking');

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0a0c] text-[#eceff4]" style={{ backgroundImage: RJ_FOG }}>
      <header className="relative z-10 flex min-h-16 items-center justify-between gap-3 border-b border-white/10 bg-black/40 px-4 py-2 backdrop-blur md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white"><ArrowLeft size={17} /><span className="hidden sm:inline">PUZZLTHINK</span></Link>
          <span className="h-5 w-px bg-white/15" />
          <strong className={`${ACCENT_TEXT} text-xl font-black tracking-[-0.02em]`}>{t('title')}</strong>
          <span className="hidden text-[10px] font-bold tracking-[0.2em] text-white/40 sm:inline">NESTING 3×3</span>
        </div>
        <div className="flex items-center gap-1.5">
          <LanguageSwitcher compact dark />
          <button onClick={() => newGame()} className="flex items-center gap-2 rounded-full bg-[#f2b84b] px-3 py-2 text-xs font-black text-[#1d1405] hover:bg-[#ffcd6e]"><RotateCcw size={14} /><span className="hidden sm:inline">{t('newGame')}</span></button>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-[1100px] gap-6 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-6 lg:py-8">
        <section className="rounded-[20px] border border-white/10 bg-white/[0.02] p-3 sm:p-5">
          <div className="mx-auto mb-4 flex max-w-[440px] items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-bold tracking-[0.25em] text-[#f2b84b]">MOVE {String(game.ply + 1).padStart(2, '0')}</p>
              <h2 className="mt-1 flex items-center gap-2 text-lg font-extrabold tracking-tight">
                {!over && <i className="h-2 w-2 rounded-full" style={{ background: SIDE_COLORS[game.turn], boxShadow: `0 0 10px ${SIDE_COLORS[game.turn]}` }} />}
                {status}
              </h2>
            </div>
            {!over && game.turn === 0 && deadline > 0 && now > 0 && <TurnClock remainingMs={deadline - now} urgent />}
          </div>
          <RJTable game={game} viewer={0} canAct={!over && game.turn === 0} onAction={play} names={names} />
        </section>

        <aside className="flex flex-col gap-4">
          <section className="rounded-[16px] border border-[#f2b84b]/30 bg-[#f2b84b]/[0.06] p-4">
            <div className="flex items-center gap-2"><Link2 size={14} className="text-[#f2b84b]" /><h2 className={RJ_TITLE}>{t('friendTitle')}</h2></div>
            <p className="mt-2 text-[11px] leading-5 text-white/55">{t('friendDesc')}</p>
            <button onClick={() => router.push(`/russian-janggi/room/${prepareRussianJanggiRoom()}`)} className="mt-3 w-full rounded-[10px] bg-[#f2b84b] py-2.5 text-xs font-black text-[#1d1405] hover:bg-[#ffcd6e]">{t('createRoom')}</button>
          </section>
          <section className={RJ_PANEL}>
            <h2 className={RJ_TITLE}>{t('difficulty')}</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">{DIFFICULTIES.map((level) => <button key={level} onClick={() => newGame(firstChoice, level)} className={`rounded-[10px] p-2.5 text-xs font-extrabold transition ${difficulty === level ? 'bg-white text-[#0b0a0c]' : 'border border-white/10 bg-white/[0.03] text-white/50 hover:text-white'}`}>{t(`difficulty_${level}`)}</button>)}</div>
            <h2 className={`${RJ_TITLE} mt-4`}>{t('firstPlayer')}</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">{(['me', 'ai', 'random'] as FirstChoice[]).map((choice) => <button key={choice} onClick={() => newGame(choice)} className={`rounded-[10px] p-2.5 text-xs font-extrabold transition ${firstChoice === choice ? 'bg-white text-[#0b0a0c]' : 'border border-white/10 bg-white/[0.03] text-white/50 hover:text-white'}`}>{t(`first_${choice}`)}</button>)}</div>
          </section>
          <RulesPanel />
          <section className={`grid grid-cols-3 gap-2 ${RJ_PANEL}`}>
            <h2 className={`col-span-3 ${RJ_TITLE}`}>{t('record')}</h2>
            {records.length ? <>
              <div><p className="text-[10px] text-white/35">{t('games')}</p><p className="text-xl font-black">{records.length}</p></div>
              <div><p className="text-[10px] text-white/35">{t('wins')}</p><p className="text-xl font-black text-[#f2b84b]">{wins}</p></div>
              <div><p className="text-[10px] text-white/35">{t('winRate')}</p><p className="text-xl font-black">{Math.round((wins / records.length) * 100)}%</p></div>
            </> : <p className="col-span-3 text-xs text-white/40">{t('recordEmpty')}</p>}
          </section>
          <section className={`min-h-[140px] ${RJ_PANEL}`}>
            <h2 className={`mb-3 ${RJ_TITLE}`}>{t('log')}</h2>
            <div className="space-y-2">{log.slice(0, 6).map((line, i) => <div key={`${line}-${i}`} className="flex gap-2 text-[11px] leading-relaxed text-white/55">{i === 0 ? <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f2b84b]" /> : <Check size={11} className="mt-0.5 shrink-0 text-white/25" />}<span>{line}</span></div>)}</div>
          </section>
          {!over && game.ply > 0 && <button onClick={() => setGame(finish(game, 1, 'resign'))} className="flex items-center justify-center gap-2 rounded-[12px] border border-white/10 py-2.5 text-xs font-bold text-white/45 hover:text-white"><Flag size={13} />{t('resign')}</button>}
        </aside>
      </main>

      {over && <RJResult game={game} viewer={0} names={names} onAgain={() => newGame()} exitPath="/" />}
    </div>
  );
}

/** The five rules, with a little size ladder. */
export function RulesPanel({ extra }: { extra?: string }) {
  const t = useTranslations('RussianJanggi');
  return (
    <section className="rounded-[16px] border border-white/10 bg-black/40 p-5">
      <div className="mb-3 flex items-center gap-2"><Sparkles size={14} className="text-[#f2b84b]" /><h2 className={RJ_TITLE}>{t('quickRules')}</h2></div>
      <div className="mb-4 flex items-end justify-center gap-3 rounded-[12px] bg-white/[0.03] py-3">
        {([0, 1, 2] as const).map((size) => (
          <div key={size} className="flex flex-col items-center gap-1.5">
            <RJPiece owner={size === 1 ? 1 : 0} size={size} style={{ width: 20 + size * 12, height: 20 + size * 12 }} />
            <span className="text-[10px] font-bold text-white/45">{t(`size_${size}`)}</span>
          </div>
        ))}
      </div>
      <ol className="space-y-2.5 text-xs leading-relaxed text-white/65">{['rule1', 'rule2', 'rule3', 'rule4', 'rule5'].map((key, i) => <li key={key} className="flex gap-3"><span className="font-mono text-[#f2b84b]">0{i + 1}</span><span>{t(key)}</span></li>)}</ol>
      {extra && <p className="mt-3 text-[11px] text-white/40">{extra}</p>}
    </section>
  );
}

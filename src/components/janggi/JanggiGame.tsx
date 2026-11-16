"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, BookOpen, Check, Flag, Link2, RotateCcw, Sparkles } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { type Action, type Difficulty, type JanggiState, type Side, HANJA, applyAction, cellName, chooseAiAction, finish, initialState } from '@/lib/janggi';
import { prepareJanggiRoom } from '@/hooks/useJanggiRoom';
import LanguageSwitcher from '../LanguageSwitcher';
import JanggiTable from './JanggiTable';
import JanggiTutorial from './JanggiTutorial';
import JanggiResult from './JanggiResult';
import { GOLD_TEXT, J_PANEL, J_TITLE, JANGGI_FOG, SIDE_COLORS, hanjaFont } from './theme';

const RECORD_KEY = 'puzzlthink_janggi_records';
const TUTORIAL_KEY = 'puzzlthink_janggi_tutorial_seen';
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
  const router = useRouter();
  const [firstChoice, setFirstChoice] = useState<FirstChoice>('random');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [game, setGame] = useState<JanggiState>(() => initialState(0));
  const [log, setLog] = useState<string[]>([]);
  const [records, setRecords] = useState<MatchRecord[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [saved, setSaved] = useState(false);
  const names = [t('you'), 'AI'];
  const over = game.winner !== null || game.reason !== null;

  const newGame = (choice: FirstChoice = firstChoice, level: Difficulty = difficulty) => {
    const first: Side = choice === 'me' ? 0 : choice === 'ai' ? 1 : Math.random() < 0.5 ? 0 : 1;
    setFirstChoice(choice); setDifficulty(level); setGame(initialState(first)); setSaved(false);
    setLog([t(first === 0 ? 'logYouFirst' : 'logAiFirst')]);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setRecords(JSON.parse(localStorage.getItem(RECORD_KEY) || '[]')); } catch { /* Optional history. */ }
      try { if (!localStorage.getItem(TUTORIAL_KEY)) setShowTutorial(true); } catch { /* Optional. */ }
      newGame('random');
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const play = (action: Action) => {
    setLog((items) => [describeAction(t, game, action, names[game.turn]), ...items].slice(0, 10));
    setGame(applyAction(game, action));
  };

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
      setRecords((current) => {
        const next = [record, ...current].slice(0, 50);
        try { localStorage.setItem(RECORD_KEY, JSON.stringify(next)); } catch { /* Optional. */ }
        return next;
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [over, saved, game.winner, difficulty]);

  const closeTutorial = () => { try { localStorage.setItem(TUTORIAL_KEY, '1'); } catch { /* Optional. */ } setShowTutorial(false); };
  const wins = records.filter((r) => r.won).length;
  const status = over ? '' : game.turn === 0 ? t('yourTurn') : t('aiThinking');

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0c10] text-[#eceff4]" style={{ backgroundImage: JANGGI_FOG }}>
      {showTutorial && <JanggiTutorial onClose={closeTutorial} />}
      <header className="relative z-10 flex min-h-16 items-center justify-between gap-3 border-b border-white/10 bg-black/40 px-4 py-2 backdrop-blur md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white"><ArrowLeft size={17} /><span className="hidden sm:inline">PUZZLTHINK</span></Link>
          <span className="h-5 w-px bg-white/15" />
          <strong className={`${hanjaFont.className} ${GOLD_TEXT} text-xl tracking-[0.18em]`}>十二將棋</strong>
          <span className="hidden text-[10px] font-bold tracking-[0.2em] text-white/40 sm:inline">{t('subtitle')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setShowTutorial(true)} className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white/80 hover:bg-white/10"><BookOpen size={14} /><span className="hidden sm:inline">{t('howToPlay')}</span></button>
          <LanguageSwitcher compact dark />
          <button onClick={() => newGame()} className="flex items-center gap-2 rounded-full bg-[#e8c170] px-3 py-2 text-xs font-black text-[#1a1408] hover:bg-[#f3d38d]"><RotateCcw size={14} /><span className="hidden sm:inline">{t('newGame')}</span></button>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-[1100px] gap-6 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-6 lg:py-8">
        <section className="rounded-[20px] border border-white/10 bg-white/[0.02] p-3 sm:p-5">
          <div className="mx-auto mb-4 flex max-w-[440px] items-center justify-between">
            <div>
              <p className="font-mono text-[10px] font-bold tracking-[0.25em] text-[#e8c170]">MOVE {String(game.ply + 1).padStart(2, '0')}</p>
              <h2 className="mt-1 text-lg font-extrabold tracking-tight">{over ? t('gameOver') : status}</h2>
            </div>
            <span className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-bold text-white/60">
              <i className="h-2 w-2 rounded-full" style={{ background: SIDE_COLORS[game.turn], boxShadow: `0 0 10px ${SIDE_COLORS[game.turn]}` }} />{names[game.turn]}
            </span>
          </div>
          <JanggiTable game={game} viewer={0} canAct={!over && game.turn === 0 && !showTutorial} onAction={play} />
        </section>

        <aside className="flex flex-col gap-4">
          <section className="rounded-[16px] border border-[#e8c170]/30 bg-[#e8c170]/[0.06] p-4">
            <div className="flex items-center gap-2"><Link2 size={14} className="text-[#e8c170]" /><h2 className={J_TITLE}>{t('friendTitle')}</h2></div>
            <p className="mt-2 text-[11px] leading-5 text-white/55">{t('friendDesc')}</p>
            <button onClick={() => router.push(`/janggi/room/${prepareJanggiRoom()}`)} className="mt-3 w-full rounded-[10px] bg-[#e8c170] py-2.5 text-xs font-black text-[#1a1408] hover:bg-[#f3d38d]">{t('createRoom')}</button>
          </section>
          <section className={J_PANEL}>
            <h2 className={J_TITLE}>{t('difficulty')}</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">{DIFFICULTIES.map((level) => <button key={level} onClick={() => newGame(firstChoice, level)} className={`rounded-[10px] p-2.5 text-xs font-extrabold transition ${difficulty === level ? 'bg-white text-[#0a0c10]' : 'border border-white/10 bg-white/[0.03] text-white/50 hover:text-white'}`}>{t(`difficulty_${level}`)}</button>)}</div>
            <h2 className={`${J_TITLE} mt-4`}>{t('firstPlayer')}</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">{(['me', 'ai', 'random'] as FirstChoice[]).map((choice) => <button key={choice} onClick={() => newGame(choice)} className={`rounded-[10px] p-2.5 text-xs font-extrabold transition ${firstChoice === choice ? 'bg-white text-[#0a0c10]' : 'border border-white/10 bg-white/[0.03] text-white/50 hover:text-white'}`}>{t(`first_${choice}`)}</button>)}</div>
          </section>
          <section className="rounded-[16px] border border-white/10 bg-black/40 p-5">
            <div className="mb-3 flex items-center gap-2"><Sparkles size={14} className="text-[#e8c170]" /><h2 className={J_TITLE}>{t('quickRules')}</h2></div>
            <ol className="space-y-2.5 text-xs leading-relaxed text-white/65">{['quick1', 'quick2', 'quick3', 'quick4'].map((key, i) => <li key={key} className="flex gap-3"><span className="font-mono text-[#e8c170]">0{i + 1}</span><span>{t(key)}</span></li>)}</ol>
          </section>
          <section className={`grid grid-cols-3 gap-2 ${J_PANEL}`}>
            <h2 className={`col-span-3 ${J_TITLE}`}>{t('record')}</h2>
            {records.length ? <>
              <div><p className="text-[10px] text-white/35">{t('games')}</p><p className="text-xl font-black">{records.length}</p></div>
              <div><p className="text-[10px] text-white/35">{t('wins')}</p><p className="text-xl font-black text-[#e8c170]">{wins}</p></div>
              <div><p className="text-[10px] text-white/35">{t('winRate')}</p><p className="text-xl font-black">{Math.round((wins / records.length) * 100)}%</p></div>
            </> : <p className="col-span-3 text-xs text-white/40">{t('recordEmpty')}</p>}
          </section>
          <section className={`min-h-[140px] ${J_PANEL}`}>
            <h2 className={`mb-3 ${J_TITLE}`}>{t('log')}</h2>
            <div className="space-y-2">{log.slice(0, 6).map((line, i) => <div key={`${line}-${i}`} className="flex gap-2 text-[11px] leading-relaxed text-white/55">{i === 0 ? <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e8c170]" /> : <Check size={11} className="mt-0.5 shrink-0 text-white/25" />}<span>{line}</span></div>)}</div>
          </section>
          {!over && game.ply > 0 && <button onClick={() => setGame(finish(game, 1, 'resign'))} className="flex items-center justify-center gap-2 rounded-[12px] border border-white/10 py-2.5 text-xs font-bold text-white/45 hover:text-white"><Flag size={13} />{t('resign')}</button>}
        </aside>
      </main>

      {over && <JanggiResult game={game} viewer={0} names={names} onAgain={() => newGame()} exitPath="/" />}
    </div>
  );
}

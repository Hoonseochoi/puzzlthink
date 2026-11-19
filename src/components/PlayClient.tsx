"use client";

import BugReport from '@/components/BugReport';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import { ArrowLeft, BookOpen, CircleX, Eraser, Lightbulb, Pause, Pencil, Play, RotateCcw, Trophy } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useSudoku } from '@/hooks/useSudoku';
import { reportGame } from '@/lib/stats';
import type { Difficulty } from '@/lib/sudoku';
import TutorialOverlay from './TutorialOverlay';
import LanguageSwitcher from './LanguageSwitcher';
import AdSlot from './AdSlot';

const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

export default function PlayClient() {
  const t = useTranslations('Sudoku');
  const tc = useTranslations('Common');
  const game = useSudoku();
  const searchParams = useSearchParams();
  const [showTutorial, setShowTutorial] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const savedResult = useRef(false);

  const formatTime = (value: number) => `${Math.floor(value / 60).toString().padStart(2, '0')}:${(value % 60).toString().padStart(2, '0')}`;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const requested = searchParams.get('difficulty');
      const difficulty = difficulties.includes(requested as Difficulty) ? requested as Difficulty : 'medium';
      if (localStorage.getItem('puzzlthink_sudoku_tutorial_seen')) game.startGame(difficulty);
      else setShowTutorial(true);
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (game.status === 'playing') savedResult.current = false;
    if ((game.status !== 'won' && game.status !== 'lost') || savedResult.current) return;
    savedResult.current = true;
    reportGame(`sudoku-${Date.now()}`, 'sudoku', 'solo', game.status === 'won' ? 'win' : 'loss', { difficulty: game.difficulty, seconds: game.timer, mistakes: game.mistakes });
    if (game.status !== 'won') return;
    try {
      const records = JSON.parse(localStorage.getItem('puzzlthink_sudoku_records') || '[]');
      records.unshift({ id: Date.now(), difficulty: game.difficulty, seconds: game.timer, date: new Date().toISOString() });
      localStorage.setItem('puzzlthink_sudoku_records', JSON.stringify(records.slice(0, 30)));
    } catch { /* Local records are optional. */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.status, game.difficulty, game.timer]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (game.status !== 'playing') return;
      if (event.key >= '1' && event.key <= '9') game.inputValue(Number(event.key));
      else if (event.key === 'Backspace' || event.key === 'Delete') game.erase();
      else if (event.key === ' ' || event.key.toLowerCase() === 'n') { event.preventDefault(); game.toggleNotesMode(); }
      else if (event.key.startsWith('Arrow')) {
        let { r, c } = game.selectedCell ?? { r: 0, c: 0 };
        if (event.key === 'ArrowUp') r = Math.max(0, r - 1);
        if (event.key === 'ArrowDown') r = Math.min(8, r + 1);
        if (event.key === 'ArrowLeft') c = Math.max(0, c - 1);
        if (event.key === 'ArrowRight') c = Math.min(8, c + 1);
        game.selectCell(r, c);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [game]);

  const finishTutorial = () => {
    localStorage.setItem('puzzlthink_sudoku_tutorial_seen', '1');
    setShowTutorial(false);
    if (game.status === 'idle') {
      const requested = searchParams.get('difficulty');
      game.startGame(difficulties.includes(requested as Difficulty) ? requested as Difficulty : 'medium');
    }
  };

  const selectedValue = game.selectedCell ? game.board[game.selectedCell.r]?.[game.selectedCell.c] : 0;

  return <div className="min-h-screen bg-[#f3f0e8] text-[#17201e]">
    {showTutorial && <TutorialOverlay onComplete={finishTutorial} />}
    <header className="flex h-16 items-center justify-between border-b border-black/10 bg-[#f8f6ef]/90 px-4 backdrop-blur md:px-8"><div className="flex items-center gap-4"><Link href="/" className="flex items-center gap-2 text-sm font-bold"><ArrowLeft size={17} /><span className="hidden sm:inline">PUZZLTHINK</span></Link><span className="h-5 w-px bg-black/10" /><strong className="text-lg tracking-[-0.04em]">{tc('sudoku')}</strong></div><div className="flex items-center gap-2"><button onClick={() => setShowTutorial(true)} className="hidden items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-bold sm:flex"><BookOpen size={14} /> {t('howToPlay')}</button><BugReport dark={false} /><LanguageSwitcher compact /></div></header>

    <main className="mx-auto grid max-w-[1120px] gap-4 px-3 py-3 sm:gap-6 sm:px-4 sm:py-6 lg:grid-cols-[minmax(0,650px)_320px] lg:px-6 lg:py-9">
      <section className="rounded-[28px] border border-black/10 bg-[#e8e2d5] p-3 shadow-[0_24px_70px_rgba(33,42,39,0.1)] sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2 px-1 lg:hidden">
          <span className="rounded-full bg-[#17201e] px-3 py-1 text-[11px] font-extrabold text-white">{t(game.difficulty)}</span>
          <span className="font-mono text-base font-bold">{formatTime(game.timer)}</span>
          <span className="rounded-full bg-[#fff0eb] px-3 py-1 text-[11px] font-extrabold text-[#ff6b4a]">{t('mistakes')} {game.mistakes}/3</span>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-[610px] overflow-hidden rounded-[20px] border-[8px] border-[#17201e] bg-white shadow-xl sm:border-[12px]">
          <div className="grid h-full w-full grid-cols-9 grid-rows-9">
            {game.board.length === 9 && Array.from({ length: 81 }).map((_, index) => {
              const r = Math.floor(index / 9), c = index % 9;
              const value = game.board[r][c];
              const initial = game.initialBoard[r]?.[c] !== 0;
              const selected = game.selectedCell?.r === r && game.selectedCell?.c === c;
              const related = game.selectedCell && (game.selectedCell.r === r || game.selectedCell.c === c || (Math.floor(game.selectedCell.r / 3) === Math.floor(r / 3) && Math.floor(game.selectedCell.c / 3) === Math.floor(c / 3)));
              const same = Boolean(selectedValue && value === selectedValue);
              const error = Boolean(value && !initial && value !== game.solution[r]?.[c]);
              return <button key={index} aria-label={`${r + 1}-${c + 1}`} onClick={() => game.selectCell(r, c)} className={clsx('relative flex items-center justify-center border-b border-r border-black/10 text-xl font-bold transition sm:text-2xl', c === 2 || c === 5 ? 'border-r-[3px] border-r-[#17201e]' : '', r === 2 || r === 5 ? 'border-b-[3px] border-b-[#17201e]' : '', selected ? 'z-10 bg-[#f2c14e]/40 ring-2 ring-inset ring-[#d39a00]' : same ? 'bg-[#4b7bff]/15 text-[#315dcc]' : related ? 'bg-[#f3f0e8]' : 'hover:bg-black/[0.03]', error && 'bg-[#ff6b4a]/15 text-[#e34b2c]')}>
                {value || (game.notes[r]?.[c]?.size ? <span className="absolute inset-1 grid grid-cols-3 text-[8px] font-bold text-black/35 sm:text-[10px]">{[1,2,3,4,5,6,7,8,9].map((n) => <i key={n} className="flex items-center justify-center not-italic">{game.notes[r][c].has(n) ? n : ''}</i>)}</span> : '')}
              </button>;
            })}
          </div>
          {game.status === 'paused' && <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#f8f6ef]/90 backdrop-blur-sm"><Pause size={38} /><h2 className="mt-3 text-2xl font-black">{t('paused')}</h2><button onClick={game.resumeGame} className="mt-5 rounded-2xl bg-[#17201e] px-6 py-3 text-sm font-bold text-white">{t('resume')}</button></div>}
          {(game.status === 'won' || game.status === 'lost') && <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#f8f6ef]/92 p-6 text-center backdrop-blur-sm"><div className={`flex h-16 w-16 items-center justify-center rounded-full text-white ${game.status === 'won' ? 'bg-[#12a594]' : 'bg-[#ff6b4a]'}`}>{game.status === 'won' ? <Trophy /> : <CircleX />}</div><h2 className="mt-4 text-3xl font-black">{t(game.status === 'won' ? 'victory' : 'gameOver')}</h2><p className="mt-2 text-sm text-black/50">{game.status === 'won' ? t('victoryDesc', { time: formatTime(game.timer) }) : t('gameOverDesc')}</p><button onClick={() => game.startGame(game.difficulty)} className="mt-6 rounded-2xl bg-[#17201e] px-7 py-3 text-sm font-bold text-white">{t('playAgain')}</button><AdSlot placement="result" compact className="mt-6 w-full max-w-[320px]" /></div>}
        </div>
        <div className="mx-auto mt-4 grid max-w-[610px] grid-cols-9 gap-1.5 sm:gap-2">{[1,2,3,4,5,6,7,8,9].map((number) => <button key={number} onClick={() => game.inputValue(number)} className="aspect-square rounded-xl border border-black/10 bg-[#f9f7f1] text-lg font-black shadow-sm transition hover:-translate-y-0.5 hover:bg-white sm:text-xl">{number}</button>)}</div>
      </section>

      <aside className="flex flex-col gap-4">
        <section className="rounded-[24px] border border-black/10 bg-[#f9f7f1] p-4 shadow-sm"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-black/35">{t('difficulty')}</p><div className="mt-3 grid grid-cols-3 gap-2">{difficulties.map((difficulty) => <button key={difficulty} onClick={() => game.startGame(difficulty)} className={`rounded-xl px-2 py-2.5 text-xs font-extrabold transition ${game.difficulty === difficulty ? 'bg-[#17201e] text-white' : 'bg-white text-black/50 hover:text-black'}`}>{t(difficulty)}</button>)}</div></section>
        <section className="hidden grid-cols-2 gap-3 lg:grid"><div className="rounded-[22px] bg-[#17201e] p-4 text-white"><p className="text-[10px] font-bold uppercase tracking-wider text-white/45">{t('timer')}</p><p className="mt-1 font-mono text-2xl font-bold">{formatTime(game.timer)}</p></div><div className="rounded-[22px] bg-[#fff0eb] p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-black/35">{t('mistakes')}</p><p className="mt-1 text-2xl font-black text-[#ff6b4a]">{game.mistakes}<span className="text-sm text-black/25"> / 3</span></p></div></section>
        <section className="rounded-[24px] border border-black/10 bg-[#f9f7f1] p-4"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-black/35">{t('tools')}</p><div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={game.toggleNotesMode} className={`flex items-center gap-2 rounded-xl p-3 text-xs font-bold ${game.notesMode ? 'bg-[#edf2ff] text-[#315dcc] ring-1 ring-[#4b7bff]/30' : 'bg-white'}`}><Pencil size={16} /> {t('notes')} · {t(game.notesMode ? 'notesOn' : 'notesOff')}</button>
          <button onClick={game.erase} className="flex items-center gap-2 rounded-xl bg-white p-3 text-xs font-bold"><Eraser size={16} /> {t('erase')}</button>
          <button onClick={game.hint} disabled={!game.hintsRemaining} className="flex items-center gap-2 rounded-xl bg-white p-3 text-xs font-bold disabled:opacity-35"><Lightbulb size={16} /> {t('hint')} {game.hintsRemaining}/1</button>
          <button onClick={game.status === 'paused' ? game.resumeGame : game.pauseGame} className="flex items-center gap-2 rounded-xl bg-white p-3 text-xs font-bold">{game.status === 'paused' ? <Play size={16} /> : <Pause size={16} />} {t(game.status === 'paused' ? 'resume' : 'pause')}</button>
        </div><button onClick={() => game.startGame(game.difficulty)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#17201e] p-3 text-xs font-extrabold text-white"><RotateCcw size={15} /> {t('newGame')}</button></section>
        <section className="rounded-[24px] bg-[#17201e] p-5 text-white"><div className="flex items-center justify-between"><h2 className="text-xs font-black tracking-[0.14em] text-white/55">{t('tips')}</h2><button onClick={() => setShowTips((value) => !value)} className="text-xs font-bold text-[#f2c14e]">{showTips ? t('closeTips') : t('tip')}</button></div>{showTips && <div className="mt-4 space-y-3">{[1,2,3,4].map((number) => <div key={number}><p className="text-xs font-bold">{t(`tip${number}Title`)}</p><p className="mt-1 text-[11px] leading-5 text-white/55">{t(`tip${number}Desc`)}</p></div>)}</div>}</section>
      </aside>
    </main>
  </div>;
}

"use client";

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import clsx from 'clsx';
import { useSearchParams } from 'next/navigation';
import { useSudoku } from '@/hooks/useSudoku';
import { useEffect, useState } from 'react';
import TutorialOverlay from '@/components/TutorialOverlay';
import { AnimatePresence, motion } from 'framer-motion';

export default function PlayPage() {
    const t = useTranslations('Sudoku');
    const game = useSudoku();
    const searchParams = useSearchParams();
    const [showTutorial, setShowTutorial] = useState(false);
    const [showTips, setShowTips] = useState(false);

    useEffect(() => {
        const hasSeen = localStorage.getItem('logicphos_tutorial_seen');
        const diffParam = searchParams.get('difficulty');
        const initialDiff = ['easy', 'medium', 'hard'].includes(diffParam as string) ? diffParam as 'easy' | 'medium' | 'hard' : 'hard';

        if (!hasSeen) {
            setShowTutorial(true);
            // We set difficulty, but game shouldn't be "playing" (timer running) while tutorial is open.
            // startGame sets status to playing. Let's start it paused or wait.
            // A simple approach is to wait until tutorial closes to startGame.
        } else {
            game.startGame(initialDiff);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const handleTutorialComplete = () => {
        localStorage.setItem('logicphos_tutorial_seen', 'true');
        setShowTutorial(false);
        const diffParam = searchParams.get('difficulty');
        const initialDiff = ['easy', 'medium', 'hard'].includes(diffParam as string) ? diffParam as 'easy' | 'medium' | 'hard' : 'hard';
        // Start game only after tutorial completes
        if (game.status === 'idle') {
            game.startGame(initialDiff);
        }
    };

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (game.status !== 'playing') return;
            if (e.key >= '1' && e.key <= '9') {
                game.inputValue(parseInt(e.key));
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                game.erase();
            } else if (e.key === 'n' || e.code === 'Space') {
                if (e.code === 'Space') {
                    if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                        e.preventDefault();
                    }
                }
                game.toggleNotesMode();
            } else if (e.key === 'h') {
                game.hint();
            } else if (e.key.startsWith('Arrow')) {
                if (game.selectedCell) {
                    let { r, c } = game.selectedCell;
                    if (e.key === 'ArrowUp') r = Math.max(0, r - 1);
                    if (e.key === 'ArrowDown') r = Math.min(8, r + 1);
                    if (e.key === 'ArrowLeft') c = Math.max(0, c - 1);
                    if (e.key === 'ArrowRight') c = Math.min(8, c + 1);
                    game.selectCell(r, c);
                } else {
                    game.selectCell(0, 0);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [game]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const isLoaded = game.board && game.board.length === 9;

    return (
        <div className="font-sans bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
            {showTutorial && <TutorialOverlay onComplete={handleTutorialComplete} />}
            {/* Header */}
            <header className="w-full h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15202b] flex items-center justify-between px-6 lg:px-12 shrink-0">
                <Link href="/" className="flex items-center gap-2">
                    <img src="/logo.png" alt="PUZZL THINK Logo" className="h-8 w-auto object-contain rounded-lg" />
                    <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">PUZZL THINK</span>
                </Link>
                <div className="flex items-center gap-4">
                    <button onClick={() => setShowTutorial(true)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors" title="Tutorial">
                        <span className="material-symbols-outlined text-xl">help</span>
                    </button>
                    <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-xl">settings</span>
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-center p-6 lg:p-12 gap-8 lg:gap-16">

                {/* Left Column: Game Board & Numpad */}
                <div className="flex flex-col items-center w-full lg:w-auto shrink-0">

                    {/* Game Board Container */}
                    <div className="relative bg-white dark:bg-[#15202b] rounded-xl shadow-lg border-2 border-slate-800 dark:border-slate-400 p-1 mb-8">
                        {game.status === 'won' && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-xl">
                                <span className="material-symbols-outlined text-6xl text-emerald-500 mb-4 animate-bounce">emoji_events</span>
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">You Won!</h2>
                                <p className="text-slate-600 dark:text-slate-300 mb-6 font-medium">Time: {formatTime(game.timer)}</p>
                                <button onClick={() => game.startGame(game.difficulty)} className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-500/30 transition-transform active:scale-95">Play Again</button>
                            </div>
                        )}
                        {game.status === 'lost' && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-xl">
                                <span className="material-symbols-outlined text-6xl text-red-500 mb-4 animate-pulse">sentiment_dissatisfied</span>
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Game Over</h2>
                                <p className="text-slate-600 dark:text-slate-300 mb-6 font-medium">You made 3 mistakes.</p>
                                <button onClick={() => game.startGame(game.difficulty)} className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-500/30 transition-transform active:scale-95">Try Again</button>
                            </div>
                        )}
                        <div className="grid grid-cols-9 grid-rows-9 w-[340px] h-[340px] sm:w-[500px] sm:h-[500px]">
                            {isLoaded && Array.from({ length: 81 }).map((_, idx) => {
                                const r = Math.floor(idx / 9);
                                const c = idx % 9;
                                const val = game.board[r]?.[c] || 0;
                                const isInitial = game.initialBoard[r]?.[c] !== 0;

                                let isError = false;
                                if (val !== 0 && !isInitial) {
                                    isError = val !== game.solution[r]?.[c];
                                }

                                const isSelected = game.selectedCell?.r === r && game.selectedCell?.c === c;
                                const isHinted = game.hintedCell?.r === r && game.hintedCell?.c === c;
                                const isRightBorder = c === 2 || c === 5;
                                const isBottomBorder = r === 2 || r === 5;

                                // Highlight logic
                                let isHighlighted = false;
                                if (game.selectedCell && !isSelected) {
                                    const sr = game.selectedCell.r;
                                    const sc = game.selectedCell.c;
                                    if (r === sr || c === sc || (Math.floor(r / 3) === Math.floor(sr / 3) && Math.floor(c / 3) === Math.floor(sc / 3))) {
                                        isHighlighted = true;
                                    }
                                }

                                let isSameNumber = false;
                                if (game.selectedCell && val !== 0 && game.board[game.selectedCell.r]?.[game.selectedCell.c] === val) {
                                    isSameNumber = true;
                                }

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => game.selectCell(r, c)}
                                        className={clsx(
                                            "relative flex items-center justify-center text-2xl sm:text-3xl font-medium cursor-pointer transition-colors border-r border-b border-slate-200 dark:border-slate-700",
                                            isRightBorder && "border-r-2 border-r-slate-500 dark:border-r-slate-400",
                                            isBottomBorder && "border-b-2 border-b-slate-500 dark:border-b-slate-400",
                                            c === 8 && "border-r-0",
                                            r === 8 && "border-b-0",
                                            isSelected
                                                ? "bg-blue-500/30 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500 ring-inset z-10"
                                                : isHinted
                                                    ? "bg-amber-400/30 text-amber-600 dark:text-amber-400 ring-2 ring-amber-400 ring-inset z-10"
                                                    : isSameNumber
                                                        ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                                                        : isHighlighted
                                                            ? "bg-blue-500/5 dark:bg-blue-500/10"
                                                            : "hover:bg-slate-50 dark:hover:bg-slate-800",
                                            isInitial && !isSelected && !isHinted && "text-slate-900 dark:text-white font-bold",
                                            !isInitial && !isSelected && !isHinted && !isSameNumber && "text-blue-600 dark:text-blue-400 font-semibold",
                                            isError && "text-red-500 bg-red-500/10 dark:text-red-400 dark:bg-red-500/20",
                                            isError && (isSelected || isHinted) && "bg-red-500/30 ring-red-500"
                                        )}
                                    >
                                        {val !== 0 ? val : (
                                            game.notes[r]?.[c]?.size > 0 && (
                                                <div className="absolute inset-1 grid grid-cols-3 grid-rows-3 text-[10px] sm:text-xs leading-none text-slate-400 dark:text-slate-500 pointer-events-none">
                                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                                        <div key={n} className="flex items-center justify-center">
                                                            {game.notes[r][c].has(n) ? n : ''}
                                                        </div>
                                                    ))}
                                                </div>
                                            )
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Numpad */}
                    <div className="grid grid-cols-9 gap-2 sm:gap-4 w-full max-w-[500px]">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                            <button
                                key={num}
                                onClick={() => game.inputValue(num)}
                                className="aspect-square flex items-center justify-center rounded-lg bg-white dark:bg-[#1f2937] text-slate-700 dark:text-slate-200 text-xl font-semibold shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 hover:text-blue-500 hover:border-blue-500 transition-all active:scale-95"
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Area: Sidebar (Stats & Tools) + Tips */}
                <div className="flex flex-col xl:flex-row gap-6 w-full lg:w-auto shrink-0 mt-8 lg:mt-0 items-start">

                    {/* Game Info & Tools Sidebar */}
                    <div className="flex flex-col gap-6 w-full lg:w-80 shrink-0">
                        {/* Game Info Card */}
                        <div className="bg-white dark:bg-[#15202b] rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Difficulty</p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-500/10 text-blue-500 capitalize">
                                        {game.difficulty || t('medium')}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('mistakes')}</p>
                                    <span className={clsx("text-slate-800 dark:text-white font-medium", game.mistakes >= 2 && "text-red-500 dark:text-red-400")}>
                                        {game.mistakes}/3
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center py-4 border-t border-b border-slate-100 dark:border-slate-800 mb-6">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('timer')}</p>
                                <div className="text-4xl font-light text-slate-800 dark:text-white tabular-nums tracking-widest">
                                    {formatTime(game.timer)}
                                </div>
                                <button
                                    onClick={game.status === 'paused' ? game.resumeGame : game.pauseGame}
                                    className="mt-2 text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-base">
                                        {game.status === 'paused' ? 'play_arrow' : 'pause'}
                                    </span>
                                    {game.status === 'paused' ? 'Resume' : t('pause')}
                                </button>
                            </div>

                            <button
                                onClick={() => game.startGame(game.difficulty)}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md shadow-blue-500/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                <span className="material-symbols-outlined">add</span>
                                {t('newGame')}
                            </button>
                        </div>

                        {/* Tools Card */}
                        <div className="bg-white dark:bg-[#15202b] rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Tools</p>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setShowTips((prev) => !prev)} className={clsx("flex flex-col items-center justify-center p-4 rounded-lg transition-colors gap-2 group active:scale-95", showTips ? "bg-amber-400/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 ring-2 ring-amber-400/50" : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300")}>
                                    <span className={clsx("material-symbols-outlined text-2xl transition-colors", !showTips && "group-hover:text-amber-500")}>emoji_objects</span>
                                    <span className="text-sm font-medium">Tip</span>
                                </button>
                                <button onClick={game.erase} className="flex flex-col items-center justify-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors gap-2 group active:scale-95">
                                    <span className="material-symbols-outlined text-2xl group-hover:text-red-500 transition-colors">backspace</span>
                                    <span className="text-sm font-medium">Erase</span>
                                </button>
                                <button
                                    onClick={game.hint}
                                    disabled={game.hintsRemaining <= 0}
                                    className={clsx(
                                        "flex flex-col items-center justify-center p-4 rounded-lg transition-colors gap-2 group relative active:scale-95",
                                        game.hintsRemaining <= 0
                                            ? "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-600/50 cursor-not-allowed"
                                            : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-500"
                                    )}
                                >
                                    <span className={clsx("material-symbols-outlined text-2xl transition-colors", game.hintsRemaining > 0 && "group-hover:text-blue-500")}>lightbulb</span>
                                    <span className="text-sm font-medium">Hint ({game.hintsRemaining}/1)</span>
                                </button>
                                <button
                                    onClick={game.toggleNotesMode}
                                    className={clsx(
                                        "flex flex-col items-center justify-center pt-3 pb-2 rounded-lg transition-colors gap-1 group active:scale-95 relative",
                                        game.notesMode
                                            ? "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/50"
                                            : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                                    )}
                                >
                                    <span className={clsx("material-symbols-outlined text-2xl transition-colors mb-1", !game.notesMode && "group-hover:text-blue-500")}>edit</span>
                                    <span className="text-sm font-medium leading-none">
                                        Notes {game.notesMode ? 'On' : 'Off'}
                                    </span>
                                    <div className="flex items-center gap-1 text-[10px] font-semibold opacity-60 mt-0.5">
                                        <span className="material-symbols-outlined text-[12px]">space_bar</span> Space
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tips Panel */}
                    <AnimatePresence>
                        {showTips && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, width: 0 }}
                                animate={{ opacity: 1, scale: 1, width: 'auto' }}
                                exit={{ opacity: 0, scale: 0.95, width: 0 }}
                                transition={{ duration: 0.2 }}
                                className="w-full lg:w-80 shrink-0 overflow-hidden origin-top-left"
                            >
                                <div className="bg-white dark:bg-[#15202b] rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col w-full min-w-[280px] lg:w-80 lg:min-h-[500px]">
                                    <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <span className="material-symbols-outlined text-amber-500 text-2xl">emoji_objects</span>
                                            {t('tips')}
                                        </h3>
                                        <button onClick={() => setShowTips(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                            <span className="material-symbols-outlined">close</span>
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 sm:space-y-6 select-none custom-scrollbar pb-6 rounded-b-xl">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">{t(`tip${i}Title` as Parameters<typeof t>[0])}</h4>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{t(`tip${i}Desc` as Parameters<typeof t>[0])}</p>
                                            </div>
                                        ))}
                                        <button onClick={() => setShowTips(false)} className="w-full mt-2 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold transition-colors mt-8">
                                            {t('closeTips')}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

"use client";

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface GameRecord {
    id: string;
    difficulty: 'easy' | 'medium' | 'hard';
    time: number;
    date: string;
    initialBoard: number[][];
    solvedBoard: number[][];
}

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function MiniSudoku({ initialBoard, solvedBoard }: { initialBoard: number[][], solvedBoard: number[][] }) {
    const [showSolved, setShowSolved] = useState(false);
    const board = showSolved ? solvedBoard : initialBoard;

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="grid border-2 border-slate-700 dark:border-slate-400 rounded-lg overflow-hidden"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', width: 198, height: 198 }}>
                {board.flatMap((row, r) =>
                    row.map((val, c) => {
                        const isInitial = initialBoard[r][c] !== 0;
                        const isRightBorder = c === 2 || c === 5;
                        const isBottomBorder = r === 2 || r === 5;
                        const isFilled = showSolved && !isInitial && val !== 0;

                        return (
                            <div
                                key={`${r}-${c}`}
                                className={clsx(
                                    'flex items-center justify-center border-r border-b border-slate-200 dark:border-slate-700',
                                    isRightBorder && 'border-r-2 border-r-slate-600 dark:border-r-slate-400',
                                    isBottomBorder && 'border-b-2 border-b-slate-600 dark:border-b-slate-400',
                                    c === 8 && 'border-r-0',
                                    r === 8 && 'border-b-0',
                                    isInitial ? 'bg-slate-50 dark:bg-slate-800' : 'bg-white dark:bg-[#15202b]'
                                )}
                                style={{ fontSize: '9px', fontWeight: isInitial ? 700 : 500, color: isFilled ? '#3b82f6' : undefined }}
                            >
                                {val !== 0 ? val : ''}
                            </div>
                        );
                    })
                )}
            </div>
            <button
                onClick={() => setShowSolved(prev => !prev)}
                className={clsx(
                    'w-full text-xs font-bold py-2.5 rounded-xl transition-all active:scale-95',
                    showSolved
                        ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
            >
                {showSolved ? '초기 화면 보기 ↩' : '완성된 모습 보기 →'}
            </button>
        </div>
    );
}

const difficultyStyle = {
    easy: 'text-emerald-600 bg-emerald-500/10 ring-1 ring-emerald-500/20',
    medium: 'text-blue-600 bg-blue-500/10 ring-1 ring-blue-500/20',
    hard: 'text-rose-600 bg-rose-500/10 ring-1 ring-rose-500/20',
};

export default function MyRecordPage() {
    const [records, setRecords] = useState<GameRecord[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem('logicphos_records');
        if (stored) {
            try { setRecords(JSON.parse(stored)); } catch { /* ignore */ }
        }
    }, []);

    const bestTime = records.length > 0 ? Math.min(...records.map(r => r.time)) : null;
    const hardCount = records.filter(r => r.difficulty === 'hard').length;
    const easyCount = records.filter(r => r.difficulty === 'easy').length;
    const mediumCount = records.filter(r => r.difficulty === 'medium').length;
    const favDiff = hardCount >= mediumCount && hardCount >= easyCount ? 'HARD' : mediumCount >= easyCount ? 'MEDIUM' : 'EASY';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#101922] text-slate-900 dark:text-slate-100">

            <main className="max-w-5xl mx-auto px-4 py-10">
                {!mounted ? null : records.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                        >
                            <span className="material-symbols-outlined text-7xl text-slate-300 dark:text-slate-700 mb-6 block">history</span>
                        </motion.div>
                        <h2 className="text-2xl font-black text-slate-700 dark:text-slate-300 mb-2">아직 기록이 없어요</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
                            게임을 완성하면 여기에 기록이 남아요!<br />지금 바로 첫 스도쿠를 도전해 보세요.
                        </p>
                        <Link
                            href="/play?difficulty=easy"
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/30 transition-all active:scale-95 hover:-translate-y-0.5"
                        >
                            <span className="material-symbols-outlined text-lg">play_arrow</span>
                            지금 시작하기
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Summary stats */}
                        <div className="grid grid-cols-3 gap-4 mb-10">
                            {[
                                { label: 'Total Solved', value: records.length, icon: 'emoji_events', color: 'text-amber-500' },
                                { label: 'Best Time', value: bestTime !== null ? formatTime(bestTime) : '--:--', icon: 'timer', color: 'text-blue-500' },
                                { label: 'Fav Difficulty', value: favDiff, icon: 'local_fire_department', color: 'text-rose-500' },
                            ].map((stat) => (
                                <div key={stat.label} className="bg-white dark:bg-[#15202b] rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm text-center flex flex-col items-center gap-2">
                                    <span className={clsx('material-symbols-outlined text-3xl', stat.color)}>{stat.icon}</span>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{stat.value}</p>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Record cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {records.map((record, index) => (
                                <motion.div
                                    key={record.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
                                    className="bg-white dark:bg-[#15202b] rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-4"
                                >
                                    {/* Card header */}
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className={clsx('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize', difficultyStyle[record.difficulty])}>
                                                {record.difficulty}
                                            </span>
                                            <p className="text-3xl font-black text-slate-900 dark:text-white mt-2 tabular-nums">
                                                {formatTime(record.time)}
                                            </p>
                                            <p className="text-xs text-slate-400 font-medium mt-1">
                                                {new Date(record.date).toLocaleDateString('ko-KR', {
                                                    month: 'long', day: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <span className="text-xs font-bold text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                            #{records.length - index}
                                        </span>
                                    </div>

                                    {/* Mini Sudoku */}
                                    <MiniSudoku initialBoard={record.initialBoard} solvedBoard={record.solvedBoard} />
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

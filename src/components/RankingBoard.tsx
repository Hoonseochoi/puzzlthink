"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import clsx from "clsx";

const DUMMY_RANKINGS = [
    { rank: 1, country: '🇰🇷', name: 'LogicMaster', diff: 'Hard', time: '02:15' },
    { rank: 2, country: '🇺🇸', name: 'SudokuKing', diff: 'Hard', time: '02:30' },
    { rank: 3, country: '🇯🇵', name: 'PuzzleNinja', diff: 'Hard', time: '02:45' },
    { rank: 4, country: '🇬🇧', name: 'MindBender', diff: 'Medium', time: '01:50' },
    { rank: 5, country: '🇫🇷', name: 'LePenseur', diff: 'Hard', time: '03:05' },
    { rank: 6, country: '🇩🇪', name: 'Zahlen', diff: 'Hard', time: '03:12' },
    { rank: 7, country: '🇨🇦', name: 'MapleBrain', diff: 'Medium', time: '02:05' },
    { rank: 8, country: '🇦🇺', name: 'KangarooOz', diff: 'Easy', time: '01:10' },
    { rank: 9, country: '🇧🇷', name: 'SambaSolve', diff: 'Hard', time: '03:22' },
    { rank: 10, country: '🇮🇳', name: 'VedicMath', diff: 'Hard', time: '03:30' },
    { rank: 1, country: '🇰🇷', name: 'LogicMaster', diff: 'Easy', time: '00:45' },
    { rank: 2, country: '🇺🇸', name: 'SudokuKing', diff: 'Easy', time: '00:52' },
    { rank: 3, country: '🇯🇵', name: 'PuzzleNinja', diff: 'Easy', time: '01:05' },
    { rank: 1, country: '🇰🇷', name: 'LogicMaster', diff: 'Medium', time: '01:25' },
    { rank: 2, country: '🇺🇸', name: 'SudokuKing', diff: 'Medium', time: '01:30' },
    { rank: 3, country: '🇯🇵', name: 'PuzzleNinja', diff: 'Medium', time: '01:42' },
];

type DifficultyTab = 'Easy' | 'Medium' | 'Hard';

export default function RankingBoard() {
    const t = useTranslations('Landing');
    const [selectedTab, setSelectedTab] = useState<DifficultyTab>('Hard');

    const filteredRankings = DUMMY_RANKINGS.filter(r => r.diff === selectedTab).sort((a, b) => {
        // Sort by time for demo purposes (assuming format mm:ss)
        return a.time.localeCompare(b.time);
    }).map((r, i) => ({ ...r, rank: i + 1 })); // Re-assign ranks 1..N

    return (
        <div className="w-full mx-auto mt-4 mb-10 relative flex flex-col items-center">

            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl mb-6">
                {(['Easy', 'Medium', 'Hard'] as DifficultyTab[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        className={clsx(
                            "px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 relative",
                            selectedTab === tab
                                ? "text-white shadow-md"
                                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        )}
                    >
                        {selectedTab === tab && (
                            <motion.div
                                layoutId="activeTabIndicator"
                                className={clsx(
                                    "absolute inset-0 rounded-lg -z-10",
                                    tab === 'Easy' && "bg-emerald-500",
                                    tab === 'Medium' && "bg-blue-500",
                                    tab === 'Hard' && "bg-rose-500"
                                )}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10">{tab}</span>
                    </button>
                ))}
            </div>

            <div className="rounded-2xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-lg ring-1 ring-slate-200/50 dark:ring-slate-800/50 overflow-hidden flex flex-col h-72 relative w-full">

                {/* Header */}
                <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 py-3 px-6 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-black/50 z-10 backdrop-blur-md tracking-wider">
                    <div className="col-span-2 text-center">{t('rank')}</div>
                    <div className="col-span-2 text-center">{t('country')}</div>
                    <div className="col-span-4">{t('nickname')}</div>
                    <div className="col-span-2 text-center">{t('difficulty')}</div>
                    <div className="col-span-2 text-right">{t('clearTime')}</div>
                </div>

                {/* Scrolling Content */}
                <div
                    className="relative flex-grow overflow-hidden"
                    style={{
                        maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)'
                    }}
                >
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={selectedTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col h-full"
                        >
                            <motion.div
                                animate={{ y: filteredRankings.length > 5 ? ["0%", "-50%"] : "0%" }}
                                transition={{ repeat: filteredRankings.length > 5 ? Infinity : 0, ease: "linear", duration: 25 }}
                                className="flex flex-col"
                            >
                                {[...filteredRankings, ...(filteredRankings.length > 5 ? filteredRankings : [])].map((item, idx) => (
                                    <div
                                        key={`${item.name}-${idx}`}
                                        className="grid grid-cols-12 gap-2 items-center py-4 px-6 hover:bg-white/40 dark:hover:bg-white/5 transition-colors border-b border-slate-100/30 dark:border-slate-800/30 last:border-0 group"
                                    >
                                        <div className="col-span-2 text-center font-bold text-slate-400 group-hover:text-blue-500 transition-colors">
                                            #{item.rank}
                                        </div>
                                        <div className="col-span-2 text-center text-xl">
                                            {item.country}
                                        </div>
                                        <div className="col-span-4 font-medium text-slate-800 dark:text-slate-200 truncate">
                                            {item.name}
                                        </div>
                                        <div className="col-span-2 text-center">
                                            <span className={clsx(
                                                "text-[10px] uppercase font-bold rounded-full px-2 py-1",
                                                item.diff === 'Easy' ? "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-500/20" :
                                                    item.diff === 'Medium' ? "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-500/20" :
                                                        "text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-500/20"
                                            )}>
                                                {item.diff}
                                            </span>
                                        </div>
                                        <div className="col-span-2 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                                            {item.time}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

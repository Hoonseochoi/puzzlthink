"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import clsx from "clsx";

// ─── FALLBACK DUMMY DATA ─────────────────────────────────────────────────────
// When real ranking data is available via /api/rankings, this will be replaced.
// To connect live data: implement GET /api/rankings?difficulty=easy|medium|hard
// returning JSON of { rank, flag, countryName, name, diff, time }[]
// ─────────────────────────────────────────────────────────────────────────────
const FALLBACK_RANKINGS = [
    // ── EASY (1st ~8 min) ──────────────────────────────────────
    { flag: '🇰🇷', countryName: 'KOR', name: 'LogicMaster', diff: 'Easy', time: '08:12' },
    { flag: '🇺🇸', countryName: 'USA', name: 'SudokuKing', diff: 'Easy', time: '08:45' },
    { flag: '🇰🇷', countryName: 'KOR', name: 'PuzzleAce', diff: 'Easy', time: '09:23' },
    { flag: '🇺🇸', countryName: 'USA', name: 'BrainStorm', diff: 'Easy', time: '09:58' },
    { flag: '🇰🇷', countryName: 'KOR', name: 'GridWizard', diff: 'Easy', time: '10:34' },
    { flag: '🇺🇸', countryName: 'USA', name: 'NumNinja', diff: 'Easy', time: '11:05' },
    { flag: '🇰🇷', countryName: 'KOR', name: 'CellSolve', diff: 'Easy', time: '11:42' },
    { flag: '🇺🇸', countryName: 'USA', name: 'BoxBreaker', diff: 'Easy', time: '12:19' },
    // ── MEDIUM (1st ~14 min) ────────────────────────────────────
    { flag: '🇺🇸', countryName: 'USA', name: 'SudokuKing', diff: 'Medium', time: '14:07' },
    { flag: '🇰🇷', countryName: 'KOR', name: 'LogicMaster', diff: 'Medium', time: '14:35' },
    { flag: '🇺🇸', countryName: 'USA', name: 'GridWizard', diff: 'Medium', time: '15:12' },
    { flag: '🇰🇷', countryName: 'KOR', name: 'BrainStorm', diff: 'Medium', time: '15:48' },
    { flag: '🇺🇸', countryName: 'USA', name: 'NumNinja', diff: 'Medium', time: '16:30' },
    { flag: '🇰🇷', countryName: 'KOR', name: 'PuzzleAce', diff: 'Medium', time: '17:05' },
    { flag: '🇺🇸', countryName: 'USA', name: 'CellSolve', diff: 'Medium', time: '17:52' },
    { flag: '🇰🇷', countryName: 'KOR', name: 'BoxBreaker', diff: 'Medium', time: '18:40' },
    // ── HARD (1st ~34 min) ──────────────────────────────────────
    { flag: '🇰🇷', countryName: 'KOR', name: 'LogicMaster', diff: 'Hard', time: '34:18' },
    { flag: '🇺🇸', countryName: 'USA', name: 'SudokuKing', diff: 'Hard', time: '34:55' },
    { flag: '🇰🇷', countryName: 'KOR', name: 'GridWizard', diff: 'Hard', time: '36:12' },
    { flag: '🇺🇸', countryName: 'USA', name: 'BrainStorm', diff: 'Hard', time: '37:40' },
    { flag: '🇰🇷', countryName: 'KOR', name: 'PuzzleAce', diff: 'Hard', time: '39:05' },
    { flag: '🇺🇸', countryName: 'USA', name: 'NumNinja', diff: 'Hard', time: '41:22' },
    { flag: '🇰🇷', countryName: 'KOR', name: 'BoxBreaker', diff: 'Hard', time: '43:10' },
    { flag: '🇺🇸', countryName: 'USA', name: 'CellSolve', diff: 'Hard', time: '45:33' },
];

type RankingRow = typeof FALLBACK_RANKINGS[number] & { rank: number };


type DifficultyTab = 'Easy' | 'Medium' | 'Hard';

export default function RankingBoard() {
    const t = useTranslations('Landing');
    const [selectedTab, setSelectedTab] = useState<DifficultyTab>('Hard');
    // `liveRankings` starts with fallback data.
    // When a real /api/rankings endpoint is ready, the useEffect below
    // will fetch and overwrite it automatically.
    const [liveRankings, setLiveRankings] = useState<RankingRow[]>(
        FALLBACK_RANKINGS.map((r, i) => ({ ...r, rank: i + 1 }))
    );
    const [loading, setLoading] = useState(false);
    // Cache per difficulty tab so we don't re-fetch on tab switch
    const [tabCache, setTabCache] = useState<Partial<Record<DifficultyTab, RankingRow[]>>>({});

    useEffect(() => {
        // Already cached for this tab
        if (tabCache[selectedTab]) return;

        setLoading(true);
        fetch(`/api/rankings?difficulty=${selectedTab.toLowerCase()}&limit=10`)
            .then(res => res.ok ? res.json() : null)
            .then((data: RankingRow[] | null) => {
                if (data && data.length > 0) {
                    setTabCache(prev => ({ ...prev, [selectedTab]: data }));
                    setLiveRankings(data);
                }
            })
            .catch(() => { /* keep fallback */ })
            .finally(() => setLoading(false));
    }, [selectedTab]); // eslint-disable-line react-hooks/exhaustive-deps

    // When tab changes, show cached data immediately if available
    const displayRankings = tabCache[selectedTab] ??
        liveRankings.filter((r: RankingRow) => r.diff === selectedTab);

    const filteredRankings = displayRankings
        .sort((a: RankingRow, b: RankingRow) => a.time.localeCompare(b.time))
        .map((r: RankingRow, i: number) => ({ ...r, rank: i + 1 }));

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
                {/* Live indicator / loading */}
                {loading && (
                    <div className="absolute top-2 right-3 z-20 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-blue-400 tracking-wider">LOADING</span>
                    </div>
                )}

                {/* Header */}
                <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 py-3 px-6 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-black/50 z-10 backdrop-blur-md tracking-wider">
                    <div className="col-span-2 text-center">{t('rank')}</div>
                    <div className="col-span-3 text-center">{t('country')}</div>
                    <div className="col-span-3">{t('nickname')}</div>
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
                                        <div className="col-span-3 flex items-center justify-center gap-1.5">
                                            <span className="text-xl leading-none">{item.flag}</span>
                                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hidden sm:block truncate">{item.countryName}</span>
                                        </div>
                                        <div className="col-span-3 font-medium text-slate-800 dark:text-slate-200 truncate">
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

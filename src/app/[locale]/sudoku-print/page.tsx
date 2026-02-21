"use client";

import { useState, useCallback, useRef } from 'react';
import { Link } from '@/i18n/routing';
import clsx from 'clsx';
import { generatePuzzle, type Difficulty, type Board } from '@/lib/sudoku';

interface Puzzle {
    board: Board;
    number: number;
}

function generateSixPuzzles(diff: Difficulty): Puzzle[] {
    return Array.from({ length: 6 }, (_, i) => ({
        board: generatePuzzle(diff).puzzle,
        number: i + 1,
    }));
}

function MiniBoard({ board, size = 190 }: { board: Board; size?: number }) {
    const cellSize = size / 9;
    return (
        <div
            style={{ width: size, height: size, display: 'grid', gridTemplateColumns: `repeat(9, 1fr)`, gridTemplateRows: `repeat(9, 1fr)`, border: '2px solid #1e293b' }}
            className="bg-white"
        >
            {board.flatMap((row, r) =>
                row.map((val, c) => {
                    const rightBorder = c === 2 || c === 5 ? '2px solid #1e293b' : '0.5px solid #94a3b8';
                    const bottomBorder = r === 2 || r === 5 ? '2px solid #1e293b' : '0.5px solid #94a3b8';
                    return (
                        <div
                            key={`${r}-${c}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: `${Math.floor(cellSize * 0.5)}px`,
                                fontWeight: val !== 0 ? 700 : 400,
                                color: val !== 0 ? '#0f172a' : 'transparent',
                                borderRight: c < 8 ? rightBorder : 'none',
                                borderBottom: r < 8 ? bottomBorder : 'none',
                                backgroundColor: 'white',
                            }}
                        >
                            {val !== 0 ? val : ''}
                        </div>
                    );
                })
            )}
        </div>
    );
}

type DiffTab = 'easy' | 'medium' | 'hard';

const diffConfig: Record<DiffTab, { label: string; color: string; desc: string; badge: string }> = {
    easy: { label: 'Easy', color: 'bg-emerald-500', desc: '38+ 힌트 · Naked Single', badge: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' },
    medium: { label: 'Medium', color: 'bg-blue-500', desc: '30+ 힌트 · Hidden Single', badge: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' },
    hard: { label: 'Hard', color: 'bg-rose-500', desc: '24+ 힌트 · Naked Pair+', badge: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800' },
};

export default function SudokuPrintPage() {
    const [difficulty, setDifficulty] = useState<DiffTab>('easy');
    const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
    const [generating, setGenerating] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const handleGenerate = useCallback(() => {
        setGenerating(true);
        setTimeout(() => {
            setPuzzles(generateSixPuzzles(difficulty));
            setGenerating(false);
        }, 50);
    }, [difficulty]);

    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    const cfg = diffConfig[difficulty];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#101922] text-slate-900 dark:text-white">
            {/* Print-only styles */}
            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    #print-area, #print-area * { visibility: visible !important; }
                    #print-area {
                        position: fixed !important;
                        top: 0 !important; left: 0 !important;
                        width: 210mm !important;
                        height: 297mm !important;
                        margin: 0 !important;
                        padding: 12mm !important;
                        background: white !important;
                        display: grid !important;
                        grid-template-columns: 1fr 1fr !important;
                        grid-template-rows: 1fr 1fr 1fr !important;
                        gap: 10mm !important;
                        box-sizing: border-box !important;
                    }
                    .print-cell {
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        justify-content: center !important;
                        gap: 4mm !important;
                    }
                    .print-label {
                        font-size: 9pt !important;
                        font-weight: bold !important;
                        color: #64748b !important;
                        text-align: center !important;
                        font-family: sans-serif !important;
                    }
                    @page { size: A4 portrait; margin: 0; }
                }
            `}</style>

            <main className="max-w-5xl mx-auto px-4 py-10 print:hidden">
                {/* Controls */}
                <div className="bg-white dark:bg-[#15202b] rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm mb-8">
                    <h2 className="text-lg font-black mb-1">난이도 선택</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">선택한 난이도로 스도쿠 6개를 생성해 A4 PDF로 인쇄할 수 있습니다.</p>
                    <div className="flex flex-wrap gap-3 mb-6">
                        {(Object.keys(diffConfig) as DiffTab[]).map(d => (
                            <button
                                key={d}
                                onClick={() => setDifficulty(d)}
                                className={clsx(
                                    'flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border transition-all',
                                    difficulty === d
                                        ? clsx(cfg.badge, 'ring-2', d === 'easy' ? 'ring-emerald-400' : d === 'medium' ? 'ring-blue-400' : 'ring-rose-400')
                                        : clsx(diffConfig[d].badge, 'opacity-60 hover:opacity-100')
                                )}
                            >
                                <span className={clsx('w-2 h-2 rounded-full', diffConfig[d].color)}></span>
                                {diffConfig[d].label}
                                <span className="text-xs font-normal opacity-70">{diffConfig[d].desc}</span>
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="flex items-center gap-2 px-8 py-3 bg-slate-900 dark:bg-white hover:bg-slate-700 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-60"
                        >
                            {generating ? (
                                <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                            ) : (
                                <span className="material-symbols-outlined text-base">casino</span>
                            )}
                            {generating ? '생성 중...' : '스도쿠 생성하기'}
                        </button>
                        {puzzles.length > 0 && (
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
                            >
                                <span className="material-symbols-outlined text-base">download</span>
                                PDF 저장 / 인쇄
                            </button>
                        )}
                    </div>
                </div>

                {/* Empty state */}
                {puzzles.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">print</span>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">난이도를 선택하고 <strong>스도쿠 생성하기</strong>를 눌러보세요</p>
                    </div>
                )}

                {/* Preview — 2×3 grid */}
                {puzzles.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-black">📄 미리보기</h2>
                            <span className={clsx('px-3 py-1 rounded-full text-xs font-bold border', cfg.badge)}>{cfg.label} × 6</span>
                        </div>
                        <div className="bg-white border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                {puzzles.map((p, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2">
                                        <p className="text-xs font-bold text-slate-400">No.{p.number} · {cfg.label}</p>
                                        <div className="shadow-md rounded overflow-hidden">
                                            <MiniBoard board={p.board} size={180} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-center text-xs text-slate-400 mt-6 flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-sm">info</span>
                                PDF 저장 → 브라우저의 인쇄 다이얼로그에서 &lsquo;PDF로 저장&rsquo;을 선택하세요
                            </p>
                        </div>
                    </div>
                )}
            </main>

            {/* Hidden print area — A4 layout */}
            {puzzles.length > 0 && (
                <div id="print-area" ref={printRef}>
                    {puzzles.map((p, i) => (
                        <div key={i} className="print-cell">
                            <p className="print-label">No.{p.number} &nbsp;|&nbsp; {cfg.label} &nbsp;|&nbsp; PUZZL THINK</p>
                            <MiniBoard board={p.board} size={250} />
                            <p className="print-label" style={{ marginTop: 4, fontSize: '8pt', color: '#94a3b8' }}>
                                Time: ____:____ &nbsp;&nbsp; Date: _____ / _____ / _____
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

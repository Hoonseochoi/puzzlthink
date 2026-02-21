"use client";

import clsx from 'clsx';
import { Link } from '@/i18n/routing';

const sections = [
    {
        id: 'basic',
        icon: 'menu_book',
        iconColor: 'text-blue-500',
        bg: 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30',
        badge: '기초',
        badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
        title: '📌 기본 규칙 — 딱 3가지',
        content: null,
        rules: [
            { icon: '①', title: '가로줄 (행)', desc: '각 가로줄 9칸에 1~9 숫자가 하나씩만 들어가야 한다.' },
            { icon: '②', title: '세로줄 (열)', desc: '각 세로줄 9칸에 1~9 숫자가 하나씩만 들어가야 한다.' },
            { icon: '③', title: '3×3 박스', desc: '굵은 선으로 나뉜 9개의 박스 각각에 1~9가 하나씩만 들어가야 한다.' },
        ],
        note: '같은 행 / 같은 열 / 같은 박스 안에 같은 숫자가 두 번 나오면 안 됩니다.',
    },
];

const techniques = [
    {
        level: '🔍 초급 기법',
        levelBadge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800',
        items: [
            {
                num: '1',
                name: 'Naked Single (단일 후보)',
                desc: '어떤 칸에서 행·열·박스의 제약을 모두 따졌을 때 들어갈 수 있는 숫자가 딱 하나뿐인 경우. 가장 기본이 되는 기법으로, 이것만으로 Easy 난이도는 완전히 풀립니다.',
                tip: '한 칸에 8개 숫자가 이미 제외됐다면 → 남은 숫자가 정답',
                icon: '1️⃣',
            },
            {
                num: '2',
                name: 'Hidden Single (숨겨진 단일)',
                desc: '특정 숫자가 행·열·박스 내에서 들어갈 수 있는 칸이 딱 하나뿐인 경우. 칸이 아닌 숫자 기준으로 스캔하는 기법입니다.',
                tip: '"숫자 7이 이 박스의 어느 칸에 들어갈 수 있지?" 라고 물어보세요',
                icon: '🔎',
            },
            {
                num: '3',
                name: 'Pencil Marking (후보 메모)',
                desc: '각 빈 칸에 들어갈 수 있는 숫자들을 작게 메모해두는 방식. 다른 기법을 훨씬 빠르게 적용할 수 있게 해주는 게임 체인저입니다. 앱에서는 스페이스바(✏️) 또는 메모 버튼으로 지원합니다.',
                tip: '스페이스바를 누르면 노트 모드로 전환됩니다',
                icon: '✏️',
            },
        ],
    },
    {
        level: '🧠 중급 기법',
        levelBadge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
        items: [
            {
                num: '4',
                name: 'Naked Pair (네이키드 페어)',
                desc: '같은 행·열·박스 안에서 두 칸이 똑같이 {A, B} 두 숫자만 후보로 가지고 있다면, 그 두 숫자는 이 두 칸에서만 쓰입니다. 따라서 같은 구역의 다른 칸들에서 A, B를 제거할 수 있습니다.',
                tip: '두 칸의 후보가 완전히 같다면 → 같은 구역 다른 칸에서 제거',
                icon: '👥',
            },
            {
                num: '5',
                name: 'Pointing Pair (포인팅 페어)',
                desc: '어떤 박스 안에서 특정 숫자의 후보 칸들이 모두 같은 행(또는 열)에 몰려있다면, 그 행(열)의 박스 바깥 칸들에서 해당 숫자를 제거할 수 있습니다.',
                tip: '박스 안에서 같은 행에만 특정 숫자 후보가 있다면 → 그 행의 다른 박스에서 제거',
                icon: '👆',
            },
            {
                num: '6',
                name: 'Box-Line Reduction (박스-라인 리덕션)',
                desc: '포인팅 페어의 반대 방향. 어떤 행(열)에서 특정 숫자의 후보가 모두 같은 박스 안에 있다면, 그 박스의 나머지 칸들에서 해당 숫자를 제거할 수 있습니다.',
                tip: '행에서 특정 숫자 후보가 같은 박스에만 → 그 박스 다른 칸에서 제거',
                icon: '📦',
            },
        ],
    },
    {
        level: '🎯 고급 기법 (Hard+)',
        levelBadge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
        border: 'border-rose-200 dark:border-rose-800',
        items: [
            {
                num: '7',
                name: 'X-Wing',
                desc: '같은 숫자가 두 행에서 각각 정확히 같은 두 열에만 후보로 있을 때, 그 두 열의 다른 행들에서 해당 숫자를 제거합니다. 4개 코너가 직사각형을 이루는 패턴입니다.',
                tip: '두 행에서 같은 두 열에만 후보 → 그 두 열의 나머지 행에서 제거',
                icon: '✈️',
            },
            {
                num: '8',
                name: 'Swordfish',
                desc: 'X-Wing의 3행(또는 3열) 버전. 3개의 행에서 특정 숫자가 각각 2~3개의 같은 열에만 있을 때 적용할 수 있습니다. 패턴이 복잡하지만 원리는 X-Wing과 같습니다.',
                tip: 'X-Wing을 3줄로 확장한 버전',
                icon: '🐟',
            },
            {
                num: '9',
                name: 'XY-Chain',
                desc: '후보가 2개인 칸들을 체인처럼 연결해서 특정 칸의 후보를 제거하는 기법. 각 칸이 A→B, B→C 식으로 연결되어 체인의 시작과 끝이 같은 숫자를 배제할 수 있으면 제거가 가능합니다.',
                tip: '논리 추론의 꽃. 후보가 2개인 칸들의 체인을 그려보세요',
                icon: '⛓️',
            },
        ],
    },
];

const strategyTips = [
    {
        icon: 'my_location',
        color: 'text-blue-500',
        title: '어디서 시작할까?',
        desc: '숫자가 이미 많이 채워진 행·열·박스부터 시작하세요. 제약이 많을수록 빠르게 답을 좁힐 수 있습니다.',
    },
    {
        icon: 'search',
        color: 'text-amber-500',
        title: '막혔을 때',
        desc: '전체를 훑기보다 숫자 1~9를 하나씩 골라 "이 숫자가 어디 들어갈 수 있지?"라고 접근하면 새로운 힌트가 보이는 경우가 많습니다.',
    },
    {
        icon: 'block',
        color: 'text-rose-500',
        title: '절대 추측하지 말 것 (초반엔)',
        desc: '논리적으로 푸는 것이 실력 향상에 훨씬 도움이 됩니다. Easy~Medium은 추측 없이 반드시 풀 수 있습니다.',
    },
    {
        icon: 'edit_note',
        color: 'text-emerald-500',
        title: '메모를 아끼지 말 것',
        desc: '손으로 풀 때도, 앱으로 풀 때도 후보 메모를 적극 활용하는 게 실수를 줄이는 핵심입니다.',
    },
];

const diffTable = [
    { level: 'Easy', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', techniques: 'Naked Single만으로 해결', count: '38+ 힌트' },
    { level: 'Medium', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', techniques: 'Hidden Single + Pencil Marking', count: '30+ 힌트' },
    { level: 'Hard', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', techniques: 'Naked Pair, Pointing Pair 필요', count: '24+ 힌트' },
    { level: 'Expert', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300', techniques: 'X-Wing, XY-Chain 이상', count: '~20 힌트' },
];

export default function SudokuTipPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#101922] text-slate-900 dark:text-white">

            <main className="max-w-3xl mx-auto px-4 py-10 space-y-14">

                {/* Hero */}
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm font-bold mb-4">
                        <span className="material-symbols-outlined text-base">auto_stories</span>
                        스도쿠 완전 정복 가이드
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">초보부터 고수까지<br />스도쿠 기법 총정리</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
                        기본 규칙부터 X-Wing까지 — 논리적 추론만으로 스도쿠를 정복하세요.
                    </p>
                </div>

                {/* Basic Rules */}
                <section>
                    <div className="flex items-center gap-2 mb-5">
                        <span className="w-2 h-6 bg-blue-500 rounded-full block"></span>
                        <h3 className="text-xl font-black">📌 기본 규칙 — 딱 3가지</h3>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-900 space-y-4">
                        <p className="text-slate-600 dark:text-slate-400 text-sm">스도쿠는 <strong className="text-slate-900 dark:text-white">9×9 격자판</strong>에 1~9 숫자를 채우는 퍼즐이에요. 규칙은 딱 3개입니다.</p>
                        <div className="grid gap-3">
                            {[
                                { icon: '①', title: '가로줄 (행)', desc: '각 행에 1~9가 하나씩만 들어가야 한다.' },
                                { icon: '②', title: '세로줄 (열)', desc: '각 열에 1~9가 하나씩만 들어가야 한다.' },
                                { icon: '③', title: '3×3 박스', desc: '굵은 선으로 나뉜 9개의 박스 각각에 1~9가 하나씩만 들어가야 한다.' },
                            ].map(r => (
                                <div key={r.icon} className="flex items-start gap-3 bg-white/70 dark:bg-white/5 rounded-xl p-4">
                                    <span className="text-2xl font-black text-blue-500 w-8 shrink-0 text-center">{r.icon}</span>
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-white text-sm">{r.title}</p>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">{r.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-blue-500/10 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-start gap-2">
                            <span className="material-symbols-outlined text-base mt-0.5 shrink-0">info</span>
                            같은 행 / 같은 열 / 같은 박스 안에 같은 숫자가 두 번 나오면 안 됩니다.
                        </div>
                    </div>
                </section>

                {/* Techniques */}
                {techniques.map(group => (
                    <section key={group.level}>
                        <div className="flex items-center gap-2 mb-5">
                            <span className={clsx('px-3 py-1 rounded-full text-sm font-bold', group.levelBadge)}>{group.level}</span>
                        </div>
                        <div className="space-y-4">
                            {group.items.map(item => (
                                <div key={item.num} className={clsx('bg-white dark:bg-[#15202b] rounded-2xl p-6 border shadow-sm', group.border)}>
                                    <div className="flex items-start gap-4">
                                        <div className="text-3xl w-10 shrink-0">{item.icon}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">#{item.num}</span>
                                                <h4 className="font-black text-slate-900 dark:text-white text-base">{item.name}</h4>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-3">{item.desc}</p>
                                            <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl px-4 py-2.5">
                                                <span className="material-symbols-outlined text-amber-500 text-base mt-0.5 shrink-0">lightbulb</span>
                                                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{item.tip}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}

                {/* Hard note */}
                <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl p-5 flex items-start gap-3">
                    <span className="material-symbols-outlined text-rose-500 text-xl mt-0.5 shrink-0">warning</span>
                    <p className="text-sm text-rose-700 dark:text-rose-300 font-semibold">
                        Hard 이상은 위의 고급 기법(X-Wing, Swordfish, XY-Chain) 없이는 추측 없이 풀 수 없도록 설계되어 있습니다.
                    </p>
                </div>

                {/* Strategy Tips */}
                <section>
                    <div className="flex items-center gap-2 mb-5">
                        <span className="w-2 h-6 bg-amber-500 rounded-full block"></span>
                        <h3 className="text-xl font-black">💡 풀이 전략 팁</h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {strategyTips.map(tip => (
                            <div key={tip.title} className="bg-white dark:bg-[#15202b] rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={clsx('material-symbols-outlined text-xl', tip.color)}>{tip.icon}</span>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{tip.title}</h4>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{tip.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Difficulty Table */}
                <section>
                    <div className="flex items-center gap-2 mb-5">
                        <span className="w-2 h-6 bg-rose-500 rounded-full block"></span>
                        <h3 className="text-xl font-black">📊 난이도별 필요 기법</h3>
                    </div>
                    <div className="bg-white dark:bg-[#15202b] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/60">
                                <tr>
                                    <th className="text-left px-5 py-3 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">난이도</th>
                                    <th className="text-left px-5 py-3 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">핵심 기법</th>
                                    <th className="text-right px-5 py-3 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">힌트 수</th>
                                </tr>
                            </thead>
                            <tbody>
                                {diffTable.map((row, i) => (
                                    <tr key={row.level} className={clsx('border-t border-slate-100 dark:border-slate-800', i % 2 === 1 && 'bg-slate-50/50 dark:bg-slate-800/20')}>
                                        <td className="px-5 py-3.5">
                                            <span className={clsx('px-2.5 py-1 rounded-full text-xs font-bold', row.badge)}>{row.level}</span>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 font-medium">{row.techniques}</td>
                                        <td className="px-5 py-3.5 text-right text-slate-500 dark:text-slate-400 font-mono text-xs">{row.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* CTA */}
                <div className="text-center pb-6">
                    <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">배운 기법을 직접 적용해보세요!</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/play?difficulty=easy" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/30 transition-all active:scale-95">
                            <span className="material-symbols-outlined text-base">play_arrow</span>
                            Easy로 시작하기
                        </Link>
                        <Link href="/play?difficulty=hard" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold shadow-xl shadow-rose-500/30 transition-all active:scale-95">
                            <span className="material-symbols-outlined text-base">local_fire_department</span>
                            Hard 도전하기
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

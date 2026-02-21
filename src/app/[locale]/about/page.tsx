import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Us | PUZZL THINK',
    description: 'Learn about PUZZL THINK — a free browser-based Sudoku platform designed to sharpen your mind.',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#101922]">
            <main className="max-w-3xl mx-auto px-6 py-14">
                <div className="mb-10">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold mb-4">
                        About
                    </span>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">About PUZZL THINK</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                        Your daily companion for sharpening logic, one puzzle at a time.
                    </p>
                </div>

                <div className="space-y-10 text-slate-700 dark:text-slate-300">
                    <section className="bg-white dark:bg-[#15202b] rounded-2xl p-7 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-3xl">🧩</span>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
                        </div>
                        <p className="leading-relaxed">
                            PUZZL THINK was born from a simple belief: <strong>logic games make you smarter, calmer, and more focused.</strong>
                            We set out to build the cleanest, fastest, and most enjoyable Sudoku experience on the web —
                            completely free, with no downloads required.
                        </p>
                    </section>

                    <section className="bg-white dark:bg-[#15202b] rounded-2xl p-7 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-3xl">🌍</span>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Who We Are</h2>
                        </div>
                        <p className="leading-relaxed mb-3">
                            We are a small, passionate team of developers and puzzle enthusiasts. Starting with <strong>Sudoku</strong>,
                            our long-term vision is to expand PUZZL THINK into a full platform of logic puzzles —
                            Nonogram, Kakuro, Nurikabe, and beyond.
                        </p>
                        <p className="leading-relaxed">
                            Our global leaderboard connects players from Korea, the United States, and beyond —
                            all competing to set the fastest times across Easy, Medium, and Hard difficulties.
                        </p>
                    </section>

                    <section className="bg-white dark:bg-[#15202b] rounded-2xl p-7 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-3xl">✨</span>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">What We Offer</h2>
                        </div>
                        <ul className="space-y-3 leading-relaxed">
                            <li className="flex items-start gap-3">
                                <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                                <span><strong>Free Sudoku —</strong> Three difficulty levels (Easy, Medium, Hard) with guaranteed unique solutions.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                                <span><strong>Global Rankings —</strong> Compete with players worldwide and climb the leaderboard.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                                <span><strong>Sudoku Tips —</strong> Comprehensive guides from beginner techniques to advanced X-Wing strategies.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                                <span><strong>Printable Puzzles —</strong> Generate A4-ready puzzle sheets to solve offline.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                                <span><strong>My Record —</strong> Track your personal best times and review completed puzzles.</span>
                            </li>
                        </ul>
                    </section>

                    <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 rounded-2xl p-7 border border-blue-100 dark:border-blue-900">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-3xl">🚀</span>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">What's Next</h2>
                        </div>
                        <p className="leading-relaxed">
                            We're constantly improving. Coming soon: more puzzle types, social features, daily challenges,
                            and achievement badges. Stay tuned — the best puzzles are yet to come.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}

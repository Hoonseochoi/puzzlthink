"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import RankingBoard from '@/components/RankingBoard';
import { motion, AnimatePresence } from 'framer-motion';

export default function HomePage() {
  const t = useTranslations('Landing');
  const [showDiffModal, setShowDiffModal] = useState(false);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <main className="flex-grow flex flex-col items-center">
        {/* Hero Section */}
        <section className="relative w-full max-w-5xl px-4 py-16 md:py-24 lg:px-20 flex flex-col items-center text-center">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-300/20 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-emerald-300/20 dark:bg-emerald-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '4s' }}></div>
          </div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 px-3 py-1 backdrop-blur-sm shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold tracking-wide text-slate-600 dark:text-slate-300 uppercase">{t('rankingLive')}</span>
          </div>
          <h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-900 dark:text-white sm:text-6xl md:text-7xl mb-6">
            {t('subtitle')}
          </h1>
          <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            {t('description')}
          </p>

          <RankingBoard />

          {/* Play Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 mb-10 w-full justify-center max-w-sm sm:max-w-none">
            <button
              onClick={() => setShowDiffModal(true)}
              className="flex items-center justify-center h-14 px-10 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/40 active:scale-95"
            >
              <span className="material-symbols-outlined mr-2">play_arrow</span>
              {t('playNow')}
            </button>
          </div>
        </section>
      </main>

      {/* Difficulty Selection Modal */}
      <AnimatePresence>
        {showDiffModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
            onClick={() => setShowDiffModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden"
            >
              {/* Decorative backgrounds inside modal */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full filter blur-2xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/10 rounded-full filter blur-2xl -z-10 -translate-x-1/2 translate-y-1/2"></div>

              <button
                onClick={() => setShowDiffModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>

              <div className="text-center mb-8 mt-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 mb-4">
                  <span className="material-symbols-outlined text-2xl">extension</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Select Difficulty</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Choose your challenge level</p>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  href="/play?difficulty=easy"
                  className="group flex items-center justify-between w-full p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 dark:bg-slate-800/50 dark:hover:bg-emerald-500/10 dark:border-slate-700/50 dark:hover:border-emerald-500/30 transition-all active:scale-95"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm text-emerald-500 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-lg">sentiment_very_satisfied</span>
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-slate-900 dark:text-white">Easy</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Perfect for beginners</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all">chevron_right</span>
                </Link>

                <Link
                  href="/play?difficulty=medium"
                  className="group flex items-center justify-between w-full p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 dark:bg-slate-800/50 dark:hover:bg-blue-500/10 dark:border-slate-700/50 dark:hover:border-blue-500/30 transition-all active:scale-95"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm text-blue-500 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-lg">psychology</span>
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-slate-900 dark:text-white">Medium</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">A balanced challenge</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">chevron_right</span>
                </Link>

                <Link
                  href="/play?difficulty=hard"
                  className="group flex items-center justify-between w-full p-4 rounded-2xl bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-200 dark:bg-slate-800/50 dark:hover:bg-rose-500/10 dark:border-slate-700/50 dark:hover:border-rose-500/30 transition-all active:scale-95"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm text-rose-500 group-hover:rotate-12 transition-transform">
                      <span className="material-symbols-outlined text-lg">local_fire_department</span>
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-slate-900 dark:text-white">Hard</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">For puzzle masters</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 group-hover:text-rose-500 group-hover:translate-x-1 transition-all">chevron_right</span>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

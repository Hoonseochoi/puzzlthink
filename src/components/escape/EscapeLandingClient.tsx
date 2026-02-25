"use client";

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

/** 사건 해결하기 진입 시 나오는 저택 배경 이미지 (블루문) */
const MANOR_IMAGE = '/escape/blue-moon/home.png';

export default function EscapeLandingClient() {
  const t = useTranslations('Escape');

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <main className="flex-grow flex flex-col items-center">
        <section className="relative w-full max-w-5xl px-4 pt-8 pb-16 md:pt-10 md:pb-24 lg:px-20 flex flex-col items-center text-center">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-amber-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" />
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-slate-400/20 dark:bg-slate-700/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-violet-300/15 dark:bg-violet-900/15 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '4s' }} />
          </div>

          {/* 상단 중앙: 저택 이미지 둥근 네모 */}
          <div className="w-full max-w-xl mx-auto mb-10 md:mb-14 flex justify-center">
            <div className="relative w-full aspect-[4/3] max-h-[280px] md:max-h-[340px] rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 shadow-xl">
              <img
                src={MANOR_IMAGE}
                alt=""
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>

          {/* 타이틀·설명·버튼 — 아래로 배치 */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 px-3 py-1 backdrop-blur-sm shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-bold tracking-wide text-slate-600 dark:text-slate-300 uppercase">
              {t('title')}
            </span>
          </div>
          <h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-900 dark:text-white sm:text-6xl md:text-7xl mb-6">
            {t('firstStoryTitle')}
          </h1>
          <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            {t('landingDescription')}
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 mb-10 w-full justify-center max-w-sm sm:max-w-none">
            <Link
              href="/escape/blue-moon"
              className="flex items-center justify-center h-14 px-10 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-lg shadow-xl shadow-amber-500/30 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/40 active:scale-95"
            >
              <span className="material-symbols-outlined mr-2">play_arrow</span>
              {t('landingPlayNow')}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

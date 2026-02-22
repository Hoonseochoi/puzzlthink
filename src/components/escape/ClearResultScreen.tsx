"use client";

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  const ss = s % 60;
  if (h > 0) return `${h}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
  return `${mm}:${ss.toString().padStart(2, '0')}`;
}

type Props = {
  storyTitle: string;
  clearTimeMs: number;
  onRetry: () => void;
};

export default function ClearResultScreen({ storyTitle, clearTimeMs, onRetry }: Props) {
  const t = useTranslations('Escape');
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 max-w-md w-full text-center"
      >
        <span className="material-symbols-outlined text-5xl text-amber-500 mb-2">celebration</span>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">{t('clear')}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{storyTitle}</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-lg font-bold text-slate-700 dark:text-slate-200 mb-6">
          <span className="material-symbols-outlined text-slate-500">schedule</span>
          {formatTime(clearTimeMs)}
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={onRetry} variant="secondary" className="w-full">
            {t('retry')}
          </Button>
          <Link href="/escape">
            <Button variant="outline" className="w-full">
              {t('otherStories')}
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="w-full">
              {t('home')}
            </Button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

type Props = {
  startTime: number | null;
  clearTime: number | null;
  isCleared: boolean;
  className?: string;
};

export default function ClearTimeDisplay({ startTime, clearTime, isCleared, className }: Props) {
  const t = useTranslations('Escape');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (startTime == null || isCleared) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startTime, isCleared]);

  const displaySeconds =
    clearTime != null && startTime != null
      ? Math.floor((clearTime - startTime) / 1000)
      : startTime != null
        ? Math.floor((now - startTime) / 1000)
        : 0;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
        className
      )}
    >
      <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[20px]">schedule</span>
      <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-200 tabular-nums">
        {formatTime(displaySeconds)}
      </span>
      {isCleared && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{t('clearLabel')}</span>}
    </div>
  );
}

"use client";

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type Props = {
  current: number;
  total: number;
  label?: string;
  className?: string;
};

export default function ProgressBar({ current, total, label, className }: Props) {
  const t = useTranslations('Escape');
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0;

  return (
    <div className={cn('space-y-1', className)}>
      {label && <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>}
      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-violet-500 dark:bg-violet-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
        {current} / {total} {t('clues')}
      </p>
    </div>
  );
}

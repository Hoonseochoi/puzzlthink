"use client";

import { useTranslations } from 'next-intl';
import type { Clue } from '@/types/escape';
import { cn } from '@/lib/utils';

type Props = {
  clues: Clue[];
  foundClueIds: string[];
  selectedClueId: string | null;
  onSelectClue: (clueId: string | null) => void;
  className?: string;
};

export default function ClueBox({ clues, foundClueIds, selectedClueId, onSelectClue, className }: Props) {
  const t = useTranslations('Escape');
  const foundClues = clues.filter((c) => foundClueIds.includes(c.id));

  return (
    <section className={cn('rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/90 overflow-hidden', className)}>
      <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-amber-600 text-[18px]">fingerprint</span>
          {t('clues')}
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {foundClues.length} / {clues.length}
        </span>
      </div>
      <div className="p-2 max-h-[180px] overflow-y-auto space-y-1">
        {foundClues.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">{t('roomFindClues')}</p>
        ) : (
          foundClues.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectClue(selectedClueId === c.id ? null : c.id)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                selectedClueId === c.id
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 border border-amber-300 dark:border-amber-700'
                  : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
              )}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{c.name}</span>
                {c.chapter != null && (
                  <span className={cn(
                    'text-[10px] font-bold px-1.5 py-0.5 rounded',
                    c.chapter === 1 ? 'bg-amber-200/80 dark:bg-amber-700/50 text-amber-800 dark:text-amber-200' : 'bg-violet-200/80 dark:bg-violet-700/50 text-violet-800 dark:text-violet-200'
                  )}>
                    Ch.{c.chapter}
                  </span>
                )}
              </div>
              {c.description && <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.description}</span>}
            </button>
          ))
        )}
      </div>
    </section>
  );
}

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

/** 도구로 사용되는 단서 id (돋보기 등). 이 id만 도구 탭에 표시됨 */
const TOOL_CLUE_IDS = ['magnifier'];

export default function ToolsBox({ clues, foundClueIds, selectedClueId, onSelectClue, className }: Props) {
  const t = useTranslations('Escape');
  const foundTools = clues.filter((c) => TOOL_CLUE_IDS.includes(c.id) && foundClueIds.includes(c.id));

  return (
    <section className={cn('rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/90 overflow-hidden', className)}>
      <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-amber-600 text-[18px]">inventory_2</span>
          {t('tools')}
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {foundTools.length} / {TOOL_CLUE_IDS.length}
        </span>
      </div>
      <div className="p-3 max-h-[200px] overflow-y-auto">
        {foundTools.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">{t('toolsEmpty')}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {foundTools.map((c) => {
              const isSelected = selectedClueId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectClue(isSelected ? null : c.id)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all',
                    isSelected
                      ? 'border-amber-500 bg-amber-500/15 dark:bg-amber-500/20'
                      : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-500'
                  )}
                >
                  <span className="material-symbols-outlined text-2xl text-amber-600 dark:text-amber-400">
                    category
                  </span>
                  <span className="text-xs font-medium text-center leading-tight line-clamp-2">
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

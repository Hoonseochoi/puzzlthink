"use client";

import { useTranslations } from 'next-intl';
import type { Clue, Room } from '@/types/escape';
import { cn } from '@/lib/utils';

type Props = {
  clues: Clue[];
  foundClueIds: string[];
  selectedClueId: string | null;
  onSelectClue: (clueId: string | null) => void;
  /** 현재 방 id. 있으면 해당 방에서 획득한 단서만 표시. 없으면(평면도) 전체 표시 + 획득 장소 표시 */
  currentRoomId?: string | null;
  /** 방 목록 (평면도에서 획득 장소 표시용) */
  rooms?: Room[];
  className?: string;
};

export default function ClueBox({ clues, foundClueIds, selectedClueId, onSelectClue, currentRoomId, rooms = [], className }: Props) {
  const t = useTranslations('Escape');
  const isFloorPlan = currentRoomId == null;
  const getRoomName = (roomId: string) => rooms.find((r) => r.id === roomId)?.name ?? roomId;

  const foundClues = clues.filter((c) => foundClueIds.includes(c.id));
  const displayClues = isFloorPlan
    ? foundClues
    : foundClues.filter((c) => c.roomId === currentRoomId);

  return (
    <section className={cn('rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/90 overflow-hidden', className)}>
      <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-amber-600 text-[18px]">fingerprint</span>
          {t('clues')}
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {isFloorPlan ? foundClues.length : displayClues.length} / {clues.length}
        </span>
      </div>
      <div className="p-2 max-h-[180px] overflow-y-auto space-y-1">
        {displayClues.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">{t('roomFindClues')}</p>
        ) : (
          displayClues.map((c) => {
            const isWillB = c.id === 'locked_safe';
            return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectClue(selectedClueId === c.id ? null : c.id)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                isWillB && (selectedClueId === c.id
                  ? 'bg-orange-200 dark:bg-orange-900/40 text-orange-900 dark:text-orange-100 border border-orange-300 dark:border-orange-600'
                  : 'bg-orange-50 dark:bg-orange-900/20 text-slate-700 dark:text-slate-200 hover:bg-orange-100 dark:hover:bg-orange-900/30 border border-orange-200/60 dark:border-orange-800/50'),
                !isWillB && (selectedClueId === c.id
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 border border-amber-300 dark:border-amber-700'
                  : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent')
              )}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn(isWillB ? 'font-bold' : 'font-medium')}>{c.name}</span>
                {c.chapter != null && (
                  <span className={cn(
                    'text-[10px] font-bold px-1.5 py-0.5 rounded',
                    c.chapter === 1 ? 'bg-amber-200/80 dark:bg-amber-700/50 text-amber-800 dark:text-amber-200' : 'bg-violet-200/80 dark:bg-violet-700/50 text-violet-800 dark:text-violet-200'
                  )}>
                    ch.{c.chapter}
                  </span>
                )}
                {isFloorPlan && c.roomId && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    - {getRoomName(c.roomId)}
                  </span>
                )}
              </div>
              {c.description && (
                <span
                  className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5 [&_strong]:font-bold [&_strong]:text-slate-600 dark:[&_strong]:text-slate-300"
                  dangerouslySetInnerHTML={{ __html: c.description }}
                />
              )}
            </button>
            );
          })
        )}
      </div>
    </section>
  );
}

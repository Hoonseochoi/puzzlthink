"use client";

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { Character, Clue, DialogueLine } from '@/types/escape';
import { cn } from '@/lib/utils';

type RecordEntry = { clueName: string; text: string };

type Props = {
  characters: Character[];
  revealedIds: string[];
  clues: Clue[];
  foundClueIds: string[];
  className?: string;
};

function getCharacterRecord(
  characterId: string,
  clues: Clue[],
  foundClueIds: string[]
): RecordEntry[] {
  const entries: RecordEntry[] = [];
  const foundSet = new Set(foundClueIds);
  for (const clue of clues) {
    if (!foundSet.has(clue.id) || !clue.dialogue?.length) continue;
    for (const line of clue.dialogue) {
      if (line.characterId === characterId) {
        entries.push({ clueName: clue.name, text: line.text });
      }
    }
  }
  return entries;
}

export default function CharacterBox({
  characters,
  revealedIds,
  clues,
  foundClueIds,
  className,
}: Props) {
  const t = useTranslations('Escape');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedCharacter = selectedId
    ? (characters.find((c) => c.id === selectedId) || null)
    : null;
  const record = useMemo(
    () => (selectedId ? getCharacterRecord(selectedId, clues, foundClueIds) : []),
    [selectedId, clues, foundClueIds]
  );
  const revealedSet = new Set(revealedIds);

  return (
    <section
      className={cn(
        'rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/90 overflow-hidden',
        className
      )}
    >
      <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-violet-500 text-[18px]">person</span>
          {t('characters')}
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {revealedIds.length} / {characters.length}
        </span>
      </div>

      {/* 등장인물: 1열 3명, 2열 2명 배치 */}
      <div className="p-3">
        <div className="grid grid-cols-3 gap-3">
          {characters.map((c, index) => {
            const isRevealed = revealedSet.has(c.id);
            const isSelected = selectedId === c.id;
            const isSecondRow = index >= 3;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(isSelected ? null : c.id)}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                  isSecondRow && index === 3 && 'col-start-2',
                  isSelected
                    ? 'border-violet-500 bg-violet-500/15 dark:bg-violet-500/20'
                    : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-500'
                )}
              >
                <div
                  className={cn(
                    'flex-shrink-0 w-14 h-14 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 ring-2',
                    isSelected ? 'ring-violet-400' : 'ring-slate-300 dark:ring-slate-600'
                  )}
                >
                  {c.image ? (
                    <img
                      src={c.image}
                      alt={c.name}
                      className={cn(
                        'w-full h-full object-cover object-top',
                        !isRevealed && 'opacity-60'
                      )}
                    />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined text-3xl">person</span>
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-semibold text-center leading-tight max-w-[80px] truncate',
                    isRevealed ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'
                  )}
                >
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* 클릭한 인물의 관련 스토리 기록 (단서 발견 시 자동 추가) */}
        {selectedCharacter && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                {selectedCharacter.name} · {t('relatedRecords')}
              </span>
            </div>
            <div className="max-h-[200px] overflow-y-auto space-y-2">
              {record.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-2 text-center">
                  {t('noRelatedRecords')}
                </p>
              ) : (
                record.map((entry, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-slate-50 dark:bg-slate-800/60 px-3 py-2 border border-slate-200 dark:border-slate-600"
                  >
                    <p className="text-[10px] font-medium text-violet-600 dark:text-violet-400 mb-0.5">
                      {entry.clueName}
                    </p>
                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      {entry.text}
                    </p>
                  </div>
                ))
              )}
            </div>
            {selectedCharacter.description && revealedSet.has(selectedCharacter.id) && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                {selectedCharacter.description}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

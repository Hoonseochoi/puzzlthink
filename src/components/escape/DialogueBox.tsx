"use client";

import { useTranslations } from 'next-intl';
import type { Clue, Character } from '@/types/escape';
import { cn } from '@/lib/utils';

type Props = {
  clue: Clue | null;
  characters: Character[];
  className?: string;
};

function getCharacterName(characters: Character[], characterId: string): string {
  return characters.find((c) => c.id === characterId)?.name ?? characterId;
}

export default function DialogueBox({ clue, characters, className }: Props) {
  const t = useTranslations('Escape');
  if (!clue?.dialogue?.length) return null;

  return (
    <section
      className={cn(
        'rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 overflow-hidden',
        className
      )}
    >
      <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
        <span className="material-symbols-outlined text-violet-500 text-[18px]">forum</span>
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
          {t('dialogueRelated', { clue: clue.name })}
        </h3>
      </div>
      <div className="p-3 max-h-[200px] overflow-y-auto space-y-3">
        {clue.dialogue.map((line, i) => {
          const char = characters.find((c) => c.id === line.characterId);
          return (
            <div
              key={i}
              className="flex gap-3 rounded-lg bg-white dark:bg-slate-800/60 px-3 py-2 border border-slate-200 dark:border-slate-600"
            >
              {char?.image ? (
                <span className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                  <img src={char.image} alt={char.name} className="w-full h-full object-cover object-top" />
                </span>
              ) : null}
              <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                  {getCharacterName(characters, line.characterId)}
                </span>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  {line.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

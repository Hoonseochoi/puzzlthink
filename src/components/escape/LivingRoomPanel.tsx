"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Character, LivingRoomStatement } from '@/types/escape';
import { cn } from '@/lib/utils';

type Props = {
  characters: Character[];
  statements: LivingRoomStatement[];
  /** 선택된 용의자 (상위에서 상호작용 질문 표시용) */
  selectedId?: string | null;
  onSelectCharacter?: (characterId: string | null) => void;
  /** 선택된 용의자에 대해 이미 누른 탐정의 질문 → 답 목록 (알리바이 하단에 표시) */
  followUpAnswers?: { question: string; answer: string }[];
  className?: string;
};

function getStatement(statements: LivingRoomStatement[], characterId: string): string | undefined {
  return statements.find((s) => s.characterId === characterId)?.text;
}

function getCharacterName(characters: Character[], characterId: string): string {
  return characters.find((c) => c.id === characterId)?.name ?? characterId;
}

export default function LivingRoomPanel({ characters, statements, selectedId: controlledSelectedId, onSelectCharacter, followUpAnswers = [], className }: Props) {
  const t = useTranslations('Escape');
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const selectedId = controlledSelectedId !== undefined ? controlledSelectedId : internalSelectedId;
  const setSelectedId = (id: string | null) => {
    if (onSelectCharacter) onSelectCharacter(id);
    else setInternalSelectedId(id);
  };

  return (
    <div className={cn('p-3', className)}>
      <h3 className="text-xs font-bold text-amber-400/90 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[16px]">groups</span>
        {t('suspectsTalk')}
      </h3>
      <div className="flex flex-wrap gap-2">
        {characters.map((c) => {
          const text = getStatement(statements, c.id);
          const isSelected = selectedId === c.id;
          if (!text) return null;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedId(isSelected ? null : c.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-sm transition-colors',
                isSelected
                  ? 'border-amber-500/80 bg-amber-500/20 text-amber-100'
                  : 'border-slate-600 bg-slate-700/60 text-slate-200 hover:border-amber-500/50 hover:bg-slate-700'
              )}
            >
              {c.image ? (
                <span className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-slate-600 ring-1 ring-slate-500">
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover object-top" />
                </span>
              ) : null}
              <span>{c.livingRoomTitle ?? c.name}</span>
            </button>
          );
        })}
      </div>
      {selectedId && (() => {
        const char = characters.find((c) => c.id === selectedId);
        return (
          <div className="mt-3 flex gap-3 p-3 rounded-lg bg-slate-900/80 border border-slate-600">
            {char?.image ? (
              <span className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-slate-700 ring-2 ring-slate-500">
                <img src={char.image} alt={char.name} className="w-full h-full object-cover object-top" />
              </span>
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-amber-400/90 mb-1.5">
                {getCharacterName(characters, selectedId)}
              </p>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {getStatement(statements, selectedId)}
              </p>
              {followUpAnswers.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-600 space-y-2">
                  {followUpAnswers.map((qa, i) => (
                    <div key={i}>
                      <p className="text-[10px] font-medium text-amber-400/70 mb-0.5">
                        {qa.question}
                      </p>
                      <p className="text-sm text-slate-200 leading-relaxed">
                        {qa.answer}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Clue, Question } from '@/types/escape';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type Props = {
  selectedClue: Clue | null;
  questions: Question[];
  answeredQuestionIds: string[];
  onAnswerCorrect: (questionId: string, revealCharacterId?: string) => void;
  className?: string;
};

export default function InteractionBox({
  selectedClue,
  questions,
  answeredQuestionIds,
  onAnswerCorrect,
  className,
}: Props) {
  const t = useTranslations('Escape');
  const [shortAnswer, setShortAnswer] = useState('');
  const clueQuestions = selectedClue ? questions.filter((q) => q.clueId === selectedClue.id) : [];
  const pending = clueQuestions.filter((q) => !answeredQuestionIds.includes(q.id));

  const handleCorrect = (q: Question) => {
    onAnswerCorrect(q.id, q.revealCharacterId);
  };

  const handleMultiple = (q: Question, correct: boolean) => {
    if (correct) handleCorrect(q);
  };

  const handleShortSubmit = (q: Question) => {
    const normalized = (q.correctAnswer ?? '').trim().toLowerCase();
    const user = shortAnswer.trim().toLowerCase();
    if (user && (user === normalized || user.includes(normalized) || normalized.includes(user))) {
      handleCorrect(q);
      setShortAnswer('');
    }
  };

  return (
    <section className={cn('rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/90 overflow-hidden', className)}>
      <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-blue-500 text-[18px]">quiz</span>
          {t('interaction')}
        </h3>
      </div>
      <div className="p-3 max-h-[220px] overflow-y-auto space-y-3">
        {!selectedClue ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 py-2">{t('selectCluePrompt')}</p>
        ) : pending.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-2">{t('allQuestionsDone')}</p>
        ) : (
          pending.map((q) => (
            <div key={q.id} className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-200 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100 mb-2">{q.text}</p>
              {q.type === 'multiple' && q.options && (
                <div className="flex flex-col gap-1.5">
                  {q.options.map((opt) => (
                    <Button
                      key={opt.id}
                      variant="outline"
                      size="sm"
                      className="justify-start text-left h-auto py-2"
                      onClick={() => handleMultiple(q, opt.correct ?? false)}
                    >
                      {opt.text}
                    </Button>
                  ))}
                </div>
              )}
              {q.type === 'short' && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shortAnswer}
                    onChange={(e) => setShortAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleShortSubmit(q)}
                    placeholder={t('answerPlaceholder')}
                    className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  />
                  <Button size="sm" onClick={() => handleShortSubmit(q)}>
                    {t('confirm')}
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

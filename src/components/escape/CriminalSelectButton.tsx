"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import type { Character } from '@/types/escape';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  characters: Character[];
  revealedIds: string[];
  correctCriminalId: string;
  onSelect: (characterId: string) => void;
  disabled?: boolean;
  className?: string;
};

export default function CriminalSelectButton({
  characters,
  revealedIds,
  correctCriminalId,
  onSelect,
  disabled,
  className,
}: Props) {
  const t = useTranslations('Escape');
  const [open, setOpen] = useState(false);
  const selectable = characters.filter((c) => revealedIds.includes(c.id));

  const handleSelect = (id: string) => {
    onSelect(id);
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="destructive"
        size="lg"
        className={cn('gap-2', className)}
        onClick={() => setOpen(true)}
        disabled={disabled || selectable.length === 0}
      >
        <span className="material-symbols-outlined text-[20px]">gavel</span>
        {t('criminalSelect')}
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4"
            >
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">{t('selectCriminal')}</h3>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {selectable.map((c) => (
                  <Button
                    key={c.id}
                    variant="outline"
                    className="w-full justify-start gap-3"
                    onClick={() => handleSelect(c.id)}
                  >
                    {c.image ? (
                      <span className="flex-shrink-0 w-9 h-9 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 ring-1 ring-slate-300 dark:ring-slate-600">
                        <img src={c.image} alt={c.name} className="w-full h-full object-cover object-top" />
                      </span>
                    ) : null}
                    {c.name}
                  </Button>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-3" onClick={() => setOpen(false)}>
                {t('cancel')}
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

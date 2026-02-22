"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  hints: string[];
  usedCount: number;
  onUse: () => void;
  className?: string;
};

export default function HintButton({ hints, usedCount, onUse, className }: Props) {
  const t = useTranslations('Escape');
  const [open, setOpen] = useState(false);
  const available = hints.length - usedCount;
  const usedHints = hints.slice(0, usedCount);

  const useNext = () => {
    if (usedCount < hints.length) {
      onUse();
      setOpen(true);
    }
  };

  return (
    <>
      <Button
        size="lg"
        className={cn(
          'gap-2 bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-500/20',
          className
        )}
        onClick={useNext}
        disabled={available <= 0}
      >
        <span className="material-symbols-outlined text-[20px]">lightbulb</span>
        {t('hint')} ({t('hintCount', { available, total: hints.length })})
      </Button>

      <AnimatePresence>
        {open && usedCount > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl shadow-xl border border-amber-200 dark:border-amber-800 p-4"
            >
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined">lightbulb</span>
                {t('hint')}
              </h3>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                {usedHints.map((h, i) => (
                  <p key={i} className="text-sm text-amber-800 dark:text-amber-200">
                    {i + 1}. {h}
                  </p>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => setOpen(false)}>
                {t('close')}
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

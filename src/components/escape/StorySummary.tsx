"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  summary: string;
  /** Show summary modal on mount (first entry) */
  showOnEntry?: boolean;
  onCloseEntry?: () => void;
  className?: string;
};

export default function StorySummary({ title, summary, showOnEntry, onCloseEntry, className }: Props) {
  const t = useTranslations('Escape');
  const [panelOpen, setPanelOpen] = useState(false);
  const [entryShown, setEntryShown] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const showEntryModal = showOnEntry && !entryShown;

  const closeEntry = () => {
    setEntryShown(true);
    onCloseEntry?.();
  };

  const entryModalContent = showEntryModal && (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-5"
        >
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">{summary}</p>
          <Button className="w-full mt-4" onClick={closeEntry}>
            {t('start')}
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  const panelModalContent = panelOpen && (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
        onClick={() => setPanelOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-5"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">{summary}</p>
          <Button variant="outline" className="w-full mt-4" onClick={() => setPanelOpen(false)}>
            {t('close')}
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={cn('gap-1.5', className)}
        onClick={() => setPanelOpen(true)}
      >
        <span className="material-symbols-outlined text-[18px]">menu_book</span>
        {t('story')}
      </Button>

      {mounted && typeof document !== 'undefined' && entryModalContent && createPortal(entryModalContent, document.body)}
      {mounted && typeof document !== 'undefined' && panelModalContent && createPortal(panelModalContent, document.body)}
    </>
  );
}

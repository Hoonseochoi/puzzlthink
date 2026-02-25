"use client";

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export type TabId = 'clues' | 'tools' | 'characters' | 'interaction';

type Props = {
  active: TabId;
  onSelect: (id: TabId) => void;
  className?: string;
};

export default function EscapePanelTabs({ active, onSelect, className }: Props) {
  const t = useTranslations('Escape');
  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'clues', label: t('clues'), icon: 'fingerprint' },
    { id: 'tools', label: t('tools'), icon: 'inventory_2' },
    { id: 'characters', label: t('characters'), icon: 'person' },
    { id: 'interaction', label: t('interaction'), icon: 'quiz' },
  ];

  return (
    <div className={cn('flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-1', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSelect(tab.id)}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-sm font-medium transition-colors',
            active === tab.id
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          )}
        >
          <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
          <span className="hidden xs:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

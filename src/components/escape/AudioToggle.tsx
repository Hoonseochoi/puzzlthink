"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

export default function AudioToggle({ className }: Props) {
  const t = useTranslations('Escape');
  const [bgm, setBgm] = useState(false);
  const [sfx, setSfx] = useState(false);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        type="button"
        onClick={() => setBgm((b) => !b)}
        className={cn(
          'p-2 rounded-lg border transition-colors',
          bgm
            ? 'border-violet-500 bg-violet-500/20 text-violet-600 dark:text-violet-400'
            : 'border-slate-300 dark:border-slate-600 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
        )}
        title={bgm ? t('bgmOn') : t('bgmOff')}
        aria-label={bgm ? t('bgmOff') : t('bgmOn')}
      >
        <span className="material-symbols-outlined text-[20px]">{bgm ? 'music_note' : 'music_off'}</span>
      </button>
      <button
        type="button"
        onClick={() => setSfx((s) => !s)}
        className={cn(
          'p-2 rounded-lg border transition-colors',
          sfx
            ? 'border-violet-500 bg-violet-500/20 text-violet-600 dark:text-violet-400'
            : 'border-slate-300 dark:border-slate-600 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
        )}
        title={sfx ? t('sfxOn') : t('sfxOff')}
        aria-label={sfx ? t('sfxOff') : t('sfxOn')}
      >
        <span className="material-symbols-outlined text-[20px]">{sfx ? 'volume_up' : 'volume_off'}</span>
      </button>
    </div>
  );
}

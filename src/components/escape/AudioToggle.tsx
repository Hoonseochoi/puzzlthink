"use client";

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  /** BGM 켜짐 여부 (controlled) */
  bgmOn: boolean;
  /** 효과음 켜짐 여부 (controlled). showSfx가 false면 사용 안 함 */
  sfxOn?: boolean;
  onBgmToggle: () => void;
  onSfxToggle?: () => void;
  /** 효과음 버튼 표시 여부. false면 BGM 온/오프만 표시 (예: 타이틀 화면) */
  showSfx?: boolean;
  /** 타이틀 등 어두운 배경용 스타일 */
  variant?: 'light' | 'dark';
};

export default function AudioToggle({ className, bgmOn, sfxOn = true, onBgmToggle, onSfxToggle, showSfx = true, variant = 'light' }: Props) {
  const t = useTranslations('Escape');

  const isDark = variant === 'dark';
  const btnBase = isDark
    ? 'p-2 rounded-lg border border-white/30 bg-white/10 hover:bg-white/20 text-white transition-colors'
    : 'p-2 rounded-lg border transition-colors border-slate-300 dark:border-slate-600 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800';
  const btnOn = isDark
    ? '!border-amber-400/80 !bg-amber-400/20 text-amber-200'
    : 'border-violet-500 bg-violet-500/20 text-violet-600 dark:text-violet-400';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        type="button"
        onClick={onBgmToggle}
        className={cn(btnBase, bgmOn && btnOn)}
        title={bgmOn ? t('bgmOn') : t('bgmOff')}
        aria-label={bgmOn ? t('bgmOff') : t('bgmOn')}
      >
        <span className="material-symbols-outlined text-[20px]">{bgmOn ? 'music_note' : 'music_off'}</span>
      </button>
      {showSfx && onSfxToggle != null && (
        <button
          type="button"
          onClick={onSfxToggle}
          className={cn(btnBase, sfxOn && btnOn)}
          title={sfxOn ? t('sfxOn') : t('sfxOff')}
          aria-label={sfxOn ? t('sfxOff') : t('sfxOn')}
        >
          <span className="material-symbols-outlined text-[20px]">{sfxOn ? 'volume_up' : 'volume_off'}</span>
        </button>
      )}
    </div>
  );
}

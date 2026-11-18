"use client";

import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, History, Pause, Play, Trophy, X } from 'lucide-react';
import type { ReplayPlayer } from '@/hooks/useReplayFrames';

const STEP_BTN = 'flex h-10 w-10 items-center justify-center rounded-md border border-white/15 bg-white/5 text-white/80 transition hover:bg-white/10 disabled:opacity-30';

/** Title strip shown above the board while a finished game is replayed. */
export function ReplayHeader({ player, caption, onClose }: { player: ReplayPlayer; caption?: string; onClose: () => void }) {
  const t = useTranslations('Common');
  return (
    <div className="mx-auto mb-3 flex max-w-[680px] items-center justify-between gap-3 rounded-[10px] border border-(--accent)/30 bg-(--accent)/[0.06] px-3 py-2">
      <div className="min-w-0">
        <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-(--accent)">{t('replayTitle')} · {player.at} / {player.total}</p>
        {caption && <p className="truncate text-xs font-bold text-white/75">{caption}</p>}
      </div>
      <button type="button" onClick={onClose} aria-label={t('replayExit')} className="shrink-0 rounded-md p-1.5 text-white/50 hover:bg-white/10 hover:text-white"><X size={16} /></button>
    </div>
  );
}

/** Slider, step buttons and autoplay under the board, plus a way back to the result. */
export function ReplayControls({ player, onShowResult }: { player: ReplayPlayer; onShowResult?: () => void }) {
  const t = useTranslations('Common');
  const { at, total, playing, go, toggle } = player;
  return (
    <div className="mx-auto mt-4 flex max-w-[440px] flex-col gap-3">
      <input type="range" min={0} max={total} value={at} onChange={(e) => go(Number(e.target.value))} aria-label={t('replayTitle')} className="w-full accent-(--accent)" />
      <div className="flex items-center justify-center gap-2">
        <button type="button" onClick={() => go(0)} disabled={at === 0} className={STEP_BTN} aria-label={t('replayFirst')}><ChevronsLeft size={17} /></button>
        <button type="button" onClick={() => go(at - 1)} disabled={at === 0} className={STEP_BTN} aria-label={t('replayPrev')}><ChevronLeft size={17} /></button>
        <button type="button" onClick={toggle} className="flex h-12 w-12 items-center justify-center rounded-md bg-(--accent) text-(--accent-ink) shadow-[0_0_18px_var(--accent-glow)] hover:brightness-110" aria-label={playing ? t('replayPause') : t('replayPlay')}>
          {playing ? <Pause size={18} /> : <Play size={18} className="translate-x-[1px]" />}
        </button>
        <button type="button" onClick={() => go(at + 1)} disabled={at === total} className={STEP_BTN} aria-label={t('replayNext')}><ChevronRight size={17} /></button>
        <button type="button" onClick={() => go(total)} disabled={at === total} className={STEP_BTN} aria-label={t('replayLast')}><ChevronsRight size={17} /></button>
      </div>
      {onShowResult && <button type="button" onClick={onShowResult} className="mx-auto flex items-center gap-1.5 rounded-md border border-white/15 px-4 py-2 text-xs font-bold text-white/70 hover:bg-white/10"><Trophy size={13} />{t('replayShowResult')}</button>}
    </div>
  );
}

/** "복기하기" button for result popups. */
export function ReplayButton({ onClick, className = '' }: { onClick: () => void; className?: string }) {
  const t = useTranslations('Common');
  return (
    <button type="button" onClick={onClick} className={`mt-5 flex w-full items-center justify-center gap-2 rounded-md border border-(--accent)/40 bg-(--accent)/10 py-3 text-sm font-extrabold text-(--accent) hover:bg-(--accent)/20 ${className}`}>
      <History size={15} />{t('replayOpen')}
    </button>
  );
}

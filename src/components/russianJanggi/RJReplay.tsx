"use client";

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Pause, Play, Trophy, X } from 'lucide-react';
import { type RJState, type Side, replayStates } from '@/lib/russianJanggi';
import RJTable from './RJTable';
import { describeAction } from './describe';
import { BTN_ACCENT } from '../ui/gameUi';

const STEP_MS = 1100;

/** Step-through replay of a finished game. Starts at the opening and can autoplay. */
export default function RJReplay({ game, viewer, names, onShowResult, onClose }: {
  game: RJState; viewer: Side; names: [string, string]; onShowResult: () => void; onClose: () => void;
}) {
  const t = useTranslations('RussianJanggi');
  const states = useMemo(() => replayStates(game), [game]);
  const total = states.length - 1;
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(true);
  const moves = game.moves ?? [];

  useEffect(() => {
    if (!playing) return;
    if (at >= total) { const stop = window.setTimeout(() => setPlaying(false), 0); return () => window.clearTimeout(stop); }
    const timer = window.setTimeout(() => setAt((n) => Math.min(total, n + 1)), STEP_MS);
    return () => window.clearTimeout(timer);
  }, [playing, at, total]);

  const go = (n: number) => { setPlaying(false); setAt(Math.max(0, Math.min(total, n))); };
  // The last position of a resigned game is the board before the resignation, so show the real ending there.
  const shown = at === total ? { ...states[at], winner: game.winner, reason: game.reason, line: game.line ?? states[at].line } : states[at];
  const caption = at === 0 ? t('replayStart') : describeAction(t, states[at - 1], moves[at - 1], names[states[at - 1].turn]);
  const btn = 'flex h-10 w-10 items-center justify-center rounded-md border border-white/15 bg-white/5 text-white/80 transition hover:bg-white/10 disabled:opacity-30';

  return (
    <div className="space-y-3">
      <div className="mx-auto flex max-w-[440px] items-center justify-between gap-3 rounded-[10px] border border-(--accent)/30 bg-(--accent)/[0.07] px-3 py-2">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-(--accent)">{t('replayTitle')} · {at} / {total}</p>
          <p className="truncate text-xs font-bold text-white/75">{caption}</p>
        </div>
        <button onClick={onClose} aria-label={t('replayExit')} className="shrink-0 rounded-md p-1.5 text-white/50 hover:bg-white/10 hover:text-white"><X size={16} /></button>
      </div>
      <RJTable game={shown} viewer={viewer} canAct={false} onAction={() => {}} names={names} />
      <div className="mx-auto flex max-w-[440px] flex-col gap-3">
        <input type="range" min={0} max={total} value={at} onChange={(e) => go(Number(e.target.value))} aria-label={t('replayTitle')} className="w-full accent-(--accent)" />
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => go(0)} disabled={at === 0} className={btn} aria-label="first"><ChevronsLeft size={17} /></button>
          <button onClick={() => go(at - 1)} disabled={at === 0} className={btn} aria-label="previous"><ChevronLeft size={17} /></button>
          <button onClick={() => { if (at >= total) setAt(0); setPlaying((p) => !p || at >= total); }} className={`${BTN_ACCENT} h-12 w-12 !px-0`} aria-label={playing ? 'pause' : 'play'}>
            {playing ? <Pause size={18} /> : <Play size={18} className="translate-x-[1px]" />}
          </button>
          <button onClick={() => go(at + 1)} disabled={at === total} className={btn} aria-label="next"><ChevronRight size={17} /></button>
          <button onClick={() => go(total)} disabled={at === total} className={btn} aria-label="last"><ChevronsRight size={17} /></button>
        </div>
        <button onClick={onShowResult} className="mx-auto flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-white/70 hover:bg-white/10 hover:text-white"><Trophy size={13} />{t('replayShowResult')}</button>
      </div>
    </div>
  );
}

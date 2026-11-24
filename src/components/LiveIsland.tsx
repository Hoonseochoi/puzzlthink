"use client";

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { getSupabase } from '@/lib/supabase';
import { CERT_GAMES } from '@/lib/hardClear';
import type { GameId } from '@/lib/stats';
import { GAME_LABEL } from './HallCelebration';

type LiveEvent = { id: number; kind: 'slither_claim' | 'slither_take' | 'open_win' | 'hall_rank' | 'hard_clear' | 'hell_clear'; game: GameId | null; name: string; other: string | null; value: number | null };
type Stage = 'pill' | 'open' | 'closing';

const ICON: Record<LiveEvent['kind'], string> = { slither_claim: '🔗', slither_take: '⚔️', open_win: '🔥', hall_rank: '🏆', hard_clear: '👑', hell_clear: '💀' };
const OPEN_MS = 4600;
const MAX_QUEUE = 4;

/**
 * "Dynamic island" at the top of every page: live news from the whole site — a Slitherlink board claimed or taken,
 * an open-match win, a new Hall of Fame top 3, a hard clear. Events arrive as a Supabase Realtime broadcast sent by the database (no polling).
 * Tap it to open that game; it closes by itself.
 */
export default function LiveIsland() {
  const t = useTranslations('Live');
  const tc = useTranslations('Common');
  const [queue, setQueue] = useState<LiveEvent[]>([]);
  const [stage, setStage] = useState<Stage>('pill');
  const timers = useRef<number[]>([]);
  const current = queue[0] ?? null;

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    const channel = supabase.channel('live-events')
      .on('broadcast', { event: 'live' }, ({ payload }) => {
        const row = payload as LiveEvent;
        if (!row?.kind || !row.name || document.visibilityState !== 'visible') return; // nothing piles up in background tabs
        setQueue((list) => (list.length >= MAX_QUEUE ? list : [...list, row]));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Each alert: a small pill grows into the message, stays a moment, then shrinks away.
  useEffect(() => {
    if (!current) return;
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    at(30, () => setStage('open'));
    at(OPEN_MS, () => setStage('closing'));
    at(OPEN_MS + 450, () => { setStage('pill'); setQueue((list) => list.slice(1)); });
    const list = timers.current;
    return () => { list.forEach((id) => window.clearTimeout(id)); timers.current = []; };
  }, [current?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!current) return null;
  const game = current.game ? tc(GAME_LABEL[current.game] ?? 'slitherlink') : '';
  const time = current.kind === 'slither_claim' && current.value ? `${Math.floor(current.value / 60000)}:${String(Math.floor((current.value % 60000) / 1000)).padStart(2, '0')}` : '';
  const text = current.kind === 'slither_claim' ? t('slitherClaim', { name: current.name, time })
    : current.kind === 'slither_take' ? (current.other ? ((current.value ?? 0) >= 2 ? t('slitherTakeN', { name: current.name, other: current.other, n: current.value ?? 2 }) : t('slitherTake', { name: current.name, other: current.other })) : t('slitherTakeAnon', { name: current.name }))
      : current.kind === 'open_win' ? t('openWin', { name: current.name, game })
        : current.kind === 'hall_rank' ? t('hallRank', { name: current.name, game, rank: current.value ?? 1 })
          : current.kind === 'hell_clear' ? t('hellClear', { name: current.name, game, n: current.value ?? 1 })
            : t('hardClear', { name: current.name, game, n: current.value ?? 1 });
  const href = current.game && CERT_GAMES[current.game] ? (current.kind === 'slither_take' || current.kind === 'slither_claim' ? '/slitherlink?mode=beat#play' : CERT_GAMES[current.game].href) : '/';
  const open = stage === 'open';

  return (
    <div className="pointer-events-none fixed inset-x-0 top-2 z-[120] flex justify-center px-3" aria-live="polite">
      <Link
        href={href}
        onClick={() => setStage('closing')}
        className={`pointer-events-auto flex items-center overflow-hidden rounded-full bg-black text-white shadow-[0_10px_30px_rgba(0,0,0,.35)] ring-1 ring-white/10 transition-all duration-500 ease-[cubic-bezier(.2,.9,.25,1.15)] ${open ? 'max-w-[min(92vw,460px)] gap-2.5 py-2 pl-2 pr-4 opacity-100' : stage === 'closing' ? 'max-w-[120px] gap-0 py-2 pl-2 pr-2 opacity-0' : 'max-w-[120px] gap-0 py-2 pl-2 pr-2 opacity-100'}`}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm">{ICON[current.kind]}</span>
        <span className={`min-w-0 truncate text-[12.5px] font-bold transition-opacity duration-300 ${open ? 'opacity-100 delay-200' : 'opacity-0'}`}>{text}</span>
        <span className={`h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#3ddc97] ${open ? 'opacity-100' : 'opacity-0'}`} />
      </Link>
    </div>
  );
}

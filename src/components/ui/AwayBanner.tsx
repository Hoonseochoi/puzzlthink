"use client";

import { useTranslations } from 'next-intl';
import { Bot, LogIn } from 'lucide-react';
import type { Seat } from '@/lib/room';

/**
 * Friend rooms: who the AI is standing in for. The player who was taken over gets a "rejoin" button;
 * everyone else sees a short line per absent player.
 */
export default function AwayBanner({ seats, away, mySeat, onRejoin }: {
  seats: Seat[]; away?: boolean[]; mySeat: number | null; onRejoin: () => void;
}) {
  const t = useTranslations('Common');
  if (!away?.some(Boolean)) return null;
  const mine = mySeat !== null && away[mySeat];
  const others = away.flatMap((isAway, i) => (isAway && i !== mySeat && seats[i] ? [seats[i]!.name] : []));
  return (
    <div className="relative z-20 mx-auto mt-3 w-full max-w-[1180px] space-y-2 px-3 sm:px-4 lg:px-6">
      {mine && (
        <div className="flex flex-col items-center gap-3 rounded-[14px] border border-[#ffb547]/50 bg-[#2a1d08]/95 px-4 py-3 text-center shadow-[0_10px_30px_rgba(0,0,0,.45)] sm:flex-row sm:justify-between sm:text-left" role="alert">
          <div className="flex items-center gap-2.5">
            <Bot size={20} className="shrink-0 text-[#ffb547]" />
            <div>
              <p className="text-sm font-black text-[#ffd79a]">{t('awayMeTitle')}</p>
              <p className="mt-0.5 text-xs text-white/60">{t('awayMeDesc')}</p>
            </div>
          </div>
          <button type="button" onClick={onRejoin} className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[#ffb547] px-4 py-2.5 text-sm font-black text-[#2a1d08] transition hover:brightness-110">
            <LogIn size={15} />{t('awayRejoin')}
          </button>
        </div>
      )}
      {others.length > 0 && (
        <p className="flex items-center justify-center gap-1.5 rounded-md border border-white/10 bg-black/50 px-3 py-2 text-[11px] font-bold text-white/65">
          <Bot size={13} className="text-[#ffb547]" />{t('awayOthers', { names: others.join(', ') })}
        </p>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from 'react';
import StoneAvatar from './StoneAvatar';
import { CERT_GAMES } from '@/lib/hardClear';
import { fetchHallOfFame, type GameId, type HallEntry } from '@/lib/stats';

type Podium = Map<string, HallEntry[]>; // game href → its top three

let cache: Promise<Podium> | null = null;
/** The AI Hall of Fame top three of every game, keyed by the game's page, loaded once per visit. */
function loadPodiums(): Promise<Podium> {
  cache ??= fetchHallOfFame().then(({ entries }) => {
    const map: Podium = new Map();
    for (const e of entries) {
      const href = CERT_GAMES[e.game as GameId]?.href;
      if (!href) continue;
      map.set(href, [...(map.get(href) ?? []), e].sort((a, b) => a.rank - b.rank).slice(0, 3));
    }
    return map;
  }).catch(() => new Map());
  return cache;
}

export function useHallPodiums() {
  const [podiums, setPodiums] = useState<Podium | null>(null);
  useEffect(() => { let alive = true; loadPodiums().then((m) => { if (alive) setPodiums(m); }); return () => { alive = false; }; }, []);
  return podiums;
}

const STEP: Record<number, { h: string; medal: string; stone: number }> = {
  1: { h: 'h-[14px]', medal: 'from-[#ffe48a] to-[#d9a520]', stone: 19 },
  2: { h: 'h-[10px]', medal: 'from-[#f1f3f7] to-[#aab1bd]', stone: 16 },
  3: { h: 'h-[8px]', medal: 'from-[#f3c79c] to-[#b9773f]', stone: 16 },
};

/** A tiny 2-1-3 podium of a game's AI Hall of Fame (shown at the top right of its home card). */
export function HallPodium({ entries, label, wins }: { entries: HallEntry[]; label: string; wins: (n: number) => string }) {
  const byRank = new Map(entries.map((e) => [e.rank, e]));
  return (
    <div className="flex shrink-0 translate-y-2 items-end gap-[3px]" aria-label={label} title={label}>
      {[2, 1, 3].map((rank) => {
        const e = byRank.get(rank);
        const s = STEP[rank];
        return (
          <div key={rank} className={`flex flex-col items-center ${rank === 1 ? 'w-[42px] sm:w-[50px]' : 'w-[36px] sm:w-[44px]'}`}>
            {e ? <>
              <StoneAvatar name={e.nickname} size={s.stone} />
              <span className="mt-0.5 w-full truncate text-center text-[8.5px] font-black leading-tight tracking-tight text-black/70">{e.nickname}</span>
              <span className="text-[8px] font-bold leading-tight text-black/35">{wins(e.wins)}</span>
            </> : <span className="mb-[22px] h-[17px] w-[17px] rounded-full border border-dashed border-black/15" />}
            <span className={`mt-0.5 flex w-full items-center justify-center rounded-t-[4px] bg-gradient-to-b ${s.medal} ${s.h}`}>
              <span className="text-[7px] font-black leading-none text-black/55">{rank}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

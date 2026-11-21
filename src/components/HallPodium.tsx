"use client";

import { useEffect, useState } from 'react';
import StoneAvatar from './StoneAvatar';
import { CERT_GAMES } from '@/lib/hardClear';
import { getSupabase } from '@/lib/supabase';
import { fetchHallOfFame, type GameId } from '@/lib/stats';

/** What the number under each name means: AI wins, or a solo challenge's score. */
export type PodiumKind = 'wins' | 'maps' | 'score' | 'correct';
export type PodiumEntry = { rank: number; nickname: string; n: number };
export type GamePodium = { kind: PodiumKind; entries: PodiumEntry[] };
type Podium = Map<string, GamePodium>; // game href → its top three

// Solo-challenge games: their challenge board stands in for the AI Hall of Fame (네모 세기 takes the first level with a full podium).
const CHALLENGES: { game: GameId; boards: string[]; kind: PodiumKind }[] = [
  { game: 'slitherlink', boards: ['slither'], kind: 'maps' },
  { game: 'masyu', boards: ['masyu'], kind: 'maps' },
  { game: 'nonogram', boards: ['nonogram'], kind: 'maps' },
  { game: 'gyulhap', boards: ['gyulhap10'], kind: 'score' },
  { game: 'nemo_count', boards: ['nemo_hard', 'nemo_normal', 'nemo_easy'], kind: 'correct' },
  { game: 'hexagon', boards: ['hexagon'], kind: 'score' },
];

async function challengePodiums(): Promise<[string, GamePodium][]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const boards = [...new Set(CHALLENGES.flatMap((c) => c.boards))];
  const tops = new Map(await Promise.all(boards.map(async (b) => {
    const { data } = await supabase.rpc('challenge_top', { p_board: b, p_limit: 3 });
    // Ties share a rank (two players on 15 maps are both 1st): the podium places them in list order instead.
    return [b, ((data as { rank: number; nickname: string; score: number }[] | null) ?? []).map((r, i) => ({ rank: i + 1, nickname: r.nickname, n: r.score }))] as const;
  })));
  const out: [string, GamePodium][] = [];
  for (const c of CHALLENGES) {
    const lists = c.boards.map((b) => tops.get(b) ?? []);
    const entries = lists.find((l) => l.length >= 3) ?? lists.find((l) => l.length) ?? [];
    if (entries.length) out.push([CERT_GAMES[c.game].href, { kind: c.kind, entries }]);
  }
  return out;
}

let cache: Promise<Podium> | null = null;
/** The top three of every game (AI Hall of Fame, or the solo challenge), keyed by the game's page, loaded once per visit. */
function loadPodiums(): Promise<Podium> {
  cache ??= Promise.all([
    fetchHallOfFame().then(({ entries }) => entries).catch(() => []),
    challengePodiums().catch(() => []),
  ]).then(([hall, challenges]) => {
    const map: Podium = new Map(challenges);
    for (const e of hall) {
      const href = CERT_GAMES[e.game as GameId]?.href;
      const cur = href ? map.get(href) : undefined;
      if (!href || (cur && cur.kind !== 'wins')) continue; // a challenge board already stands for this game
      const entries = [...(cur?.entries ?? []), { rank: e.rank, nickname: e.nickname, n: e.wins }].sort((a, b) => a.rank - b.rank).slice(0, 3);
      map.set(href, { kind: 'wins', entries });
    }
    return map;
  });
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

/** A tiny 2-1-3 podium of a game's top three (shown at the top right of its home card). */
export function HallPodium({ entries, label, stat }: { entries: PodiumEntry[]; label: string; stat: (n: number) => string }) {
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
              <span className="text-[8px] font-bold leading-tight text-black/35">{stat(e.n)}</span>
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

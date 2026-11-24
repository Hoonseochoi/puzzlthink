// 기록실 order: the site's game order (header / games page), with boards nobody is on yet moved to the end.
import { GAMES } from '@/lib/gameCatalog';
import { STATS_ID } from '@/lib/openRooms';
import type { GameId } from '@/lib/stats';

const ORDER = new Map<GameId, number>(GAMES.flatMap((g, i): [GameId, number][] => (g.id === 'hitStay' ? [] : [[STATS_ID[g.id], i]])));

/** Sorts by game order, filled items first (stable within each group). */
export function byGameOrder<T>(items: T[], gameOf: (item: T) => GameId, filled: (item: T) => boolean): T[] {
  return items
    .map((item, i) => ({ item, i }))
    .sort((a, b) => Number(filled(b.item)) - Number(filled(a.item)) || (ORDER.get(gameOf(a.item)) ?? 99) - (ORDER.get(gameOf(b.item)) ?? 99) || a.i - b.i)
    .map((x) => x.item);
}

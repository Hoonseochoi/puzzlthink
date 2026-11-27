/*
 * 망각의 지뢰 items — AI matches only (both levels), signed-in members only, paid with the site's own currencies.
 *
 *  탐지기 (probe, 피스): without moving, pick one of the eight cells around you and see the number of mines around
 *    that cell (what you would score there now). It does not say whether the cell itself is a mine. Free action.
 *  기억 되살리기 (recall, 피스): your own live mines show on the board again for MO_RECALL_MS. Free action.
 *  방폭복 (suit, 블랙피스): armed before a move; the next mine you step on costs nothing and does not send you back
 *    (the mine still goes off). Once per game; spent even if the game ends before it saves you.
 *
 * Friend and open rooms never see the bar and never send an item: the room protocol (src/lib/mineOblivionRoom.ts)
 * is untouched; the AI match layers its own reducer on top (src/lib/mineOblivionSolo.ts).
 * Prices and caps must match the SQL function mo_item_cfg() (supabase/migrations/20271202000000_item_spends.sql).
 * Caps tuned with `ITEMS=1 npx tsx scripts/mine-oblivion/sim.ts` (see the numbers in that script's header).
 */
import { type MineOblivion, type MoItem, type MoItemUse, type MoSeat, legalMoves, mineMap, neighbours, numberAt } from './mineOblivion';

export type MoCurrency = 'piece' | 'black_piece';
export type MoItemSpec = { item: MoItem; currency: MoCurrency; price: number; cap: number };

export const MO_ITEMS: Record<MoItem, MoItemSpec> = {
  probe: { item: 'probe', currency: 'piece', price: 1, cap: 2 },
  recall: { item: 'recall', currency: 'piece', price: 1, cap: 2 },
  suit: { item: 'suit', currency: 'black_piece', price: 1, cap: 1 },
};
export const MO_ITEM_ORDER: MoItem[] = ['probe', 'recall', 'suit'];
/** How long 기억 되살리기 shows your mines. */
export const MO_RECALL_MS = 2000;
/** How long the 탐지기 number stays on the board (like an announced number). */
export const MO_PROBE_MS = 3200;

export const itemUses = (g: MineOblivion, seat: MoSeat, item?: MoItem) =>
  (g.items ?? []).filter((u) => u.seat === seat && (!item || u.item === item)).length;
export const itemsLeft = (g: MineOblivion, seat: MoSeat, item: MoItem) => Math.max(0, MO_ITEMS[item].cap - itemUses(g, seat, item));
/** Whether this game used any item (for the result mark and the certificate exclusion). */
export const usedItems = (g: MineOblivion, seat?: MoSeat) => (g.items ?? []).some((u) => seat === undefined || u.seat === seat);
export function itemCounts(g: MineOblivion, seat: MoSeat): Partial<Record<MoItem, number>> {
  const out: Partial<Record<MoItem, number>> = {};
  for (const u of g.items ?? []) if (u.seat === seat) out[u.item] = (out[u.item] ?? 0) + 1;
  return out;
}

/** Cells 탐지기 may look at: the eight around you. */
export const probeTargets = (g: MineOblivion, seat: MoSeat) => neighbours(g.size)[g.pos[seat]];

export type MoItemBlock = 'turn' | 'cap' | 'armed' | 'over';
/** Why `seat` cannot use `item` right now (null = it can). Only on your own move, before you move. */
export function itemBlock(g: MineOblivion, seat: MoSeat, item: MoItem): MoItemBlock | null {
  if (g.phase !== 'walk') return g.phase === 'finished' ? 'over' : 'turn';
  if (itemsLeft(g, seat, item) <= 0) return 'cap';
  if (item === 'suit' && g.suit?.[seat]) return 'armed';
  if (!legalMoves(g, seat).length) return 'turn';
  return null;
}

/** Applies an item that has been paid for. Returns null when it cannot be used now. */
export function applyItem(g: MineOblivion, seat: MoSeat, item: MoItem, cell?: number): MineOblivion | null {
  if (itemBlock(g, seat, item)) return null;
  const use: MoItemUse = { item, seat, n: g.log.length };
  if (item === 'probe') {
    if (cell === undefined || !probeTargets(g, seat).includes(cell)) return null;
    use.cell = cell;
    use.number = numberAt(g, cell, mineMap(g));
  }
  const items = [...(g.items ?? []), use];
  if (item === 'suit') {
    const suit = [...(g.suit ?? [false, false])] as [boolean, boolean];
    suit[seat] = true;
    return { ...g, items, suit };
  }
  return { ...g, items };
}

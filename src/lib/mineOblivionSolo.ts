/*
 * The 망각의 지뢰 AI match in this browser: the room reducer plus one action of its own, `item`, which applies an item
 * the server has already charged for (src/lib/mineOblivionItems.ts). Rooms keep using reduceMoRoom alone, so their
 * protocol is unchanged; an `item` action can only reach this reducer, and only in a solo room.
 */
import type { MoItem, MoSeat } from './mineOblivion';
import { applyItem } from './mineOblivionItems';
import { MO_MEMORIZE_MS, type MoRoom, type MoRoomAction, reduceMoRoom } from './mineOblivionRoom';
import { bump } from './room';

export type MoSoloAction = MoRoomAction | { t: 'item'; item: MoItem; cell?: number };

export function reduceMoSolo(state: MoRoom, action: MoSoloAction, seat: number | null, isHost: boolean): MoRoom | null {
  if (action.t !== 'item') return reduceMoRoom(state, action, seat, isHost);
  if (!state.solo || seat === null || state.ai[seat] || state.phase !== 'playing') return null;
  if (Date.now() < state.walkAt + MO_MEMORIZE_MS - 400) return null;
  const game = applyItem(state.game, seat as MoSeat, action.item, action.cell);
  return game ? bump({ ...state, game }) : null;
}

"use client";

import { type CldAction, type CldRoom, cldRestorable, createCldRoom, isPlaying, reduceCldRoom, syncCldSeats } from '@/lib/colorLinkDuelRoom';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

export const CLD_ROOM: RoomEngine<CldRoom, CldAction> = {
  channel: 'color-link-duel-room',
  storage: 'puzzlthink_color_link_duel',
  create: (value, host) => (value === 'colorlinkduel' ? createCldRoom(host) : null),
  restorable: cldRestorable,
  reduce: reduceCldRoom,
  syncSeats: syncCldSeats,
  running: isPlaying,
  timeoutAction: { t: 'timeout' },
};

/** Creates a 1:1 컬러 링크 room code and marks this browser as its host. */
export const prepareColorLinkDuelRoom = () => prepareRoom(CLD_ROOM.channel, CLD_ROOM.storage, 'colorlinkduel');

export function useColorLinkDuelRoom(code: string, defaultName: string) {
  const room = useRealtimeRoom(CLD_ROOM, code, defaultName);
  return { ...room, mySeat: room.mySeat as 0 | 1 | null };
}

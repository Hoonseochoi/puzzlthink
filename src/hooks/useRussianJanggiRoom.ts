"use client";

import type { Side } from '@/lib/russianJanggi';
import { type RJRoom, type RJRoomAction, createRJRoom, reduceRJRoom, syncRJSeats } from '@/lib/russianJanggiRoom';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

const RJ_ROOM: RoomEngine<RJRoom, RJRoomAction> = {
  channel: 'russian-janggi-room',
  storage: 'puzzlthink_rjanggi',
  create: (value, host) => (value === 'rjanggi' ? createRJRoom(host) : null),
  restorable: (saved) => Array.isArray(saved?.seats) && !!saved.game,
  reduce: reduceRJRoom,
  syncSeats: syncRJSeats,
  running: (state) => state.phase === 'playing',
  timeoutAction: { t: 'timeout' },
};

/** Creates a 러시아장기 room code and marks this browser as its host. */
export const prepareRussianJanggiRoom = () => prepareRoom(RJ_ROOM.channel, RJ_ROOM.storage, 'rjanggi');

export function useRussianJanggiRoom(code: string, defaultName: string) {
  const room = useRealtimeRoom(RJ_ROOM, code, defaultName);
  return { ...room, mySeat: room.mySeat as Side | null };
}

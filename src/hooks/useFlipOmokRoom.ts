"use client";

import { type FlipRoom, type FlipRoomAction, createFlipRoom, reduceFlipRoom, syncFlipSeats } from '@/lib/flipOmokRoom';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

const FLIP_ROOM: RoomEngine<FlipRoom, FlipRoomAction> = {
  channel: 'flip-omok-room',
  storage: 'puzzlthink_flip_omok',
  create: (value, host) => (value === 'flip' ? createFlipRoom(host) : null),
  restorable: (saved) => Array.isArray(saved?.seats) && Array.isArray(saved?.board) && Array.isArray(saved.score),
  reduce: reduceFlipRoom,
  syncSeats: syncFlipSeats,
  running: (state) => state.phase === 'playing',
  timeoutAction: { t: 'timeout' },
};

/** Creates a 1:1 뒤집기 오목 room code and marks this browser as its host. */
export const prepareFlipOmokRoom = () => prepareRoom(FLIP_ROOM.channel, FLIP_ROOM.storage, 'flip');

export function useFlipOmokRoom(code: string, defaultName: string) {
  const room = useRealtimeRoom(FLIP_ROOM, code, defaultName);
  return { ...room, mySeat: room.mySeat as 0 | 1 | null };
}

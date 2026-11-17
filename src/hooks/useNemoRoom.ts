"use client";

import { type NemoRoom, type NemoRoomAction, createNemoRoom, nemoAutoAction, reduceNemoRoom, syncNemoSeats } from '@/lib/nemoCountRoom';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

const NEMO_ROOM: RoomEngine<NemoRoom, NemoRoomAction> = {
  channel: 'nemo-count-room',
  storage: 'puzzlthink_nemo',
  create: (value, host) => (value === 'nemo' ? createNemoRoom(host) : null),
  restorable: (saved) => Array.isArray(saved?.seats) && Array.isArray(saved.problems),
  reduce: reduceNemoRoom,
  syncSeats: syncNemoSeats,
  running: (state) => state.phase === 'playing',
  timeoutAction: { t: 'timeout' },
  autoAction: nemoAutoAction,
};

/** Creates a 네모 세기 room code and marks this browser as its host. */
export const prepareNemoRoom = () => prepareRoom(NEMO_ROOM.channel, NEMO_ROOM.storage, 'nemo');

export function useNemoRoom(code: string, defaultName: string) {
  return useRealtimeRoom(NEMO_ROOM, code, defaultName);
}

"use client";

import { type HwrAction, type HwrRoom, createHwrRoom, reduceHwrRoom, syncHwrSeats } from '@/lib/hiddenWordRoom';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

const HWR_ROOM: RoomEngine<HwrRoom, HwrAction> = {
  channel: 'hidden-word-room',
  storage: 'puzzlthink_hidden_word',
  create: (value, host) => (value === 'hidden-word' ? createHwrRoom(host) : null),
  restorable: (saved) => Array.isArray(saved?.seats) && Array.isArray(saved.scores) && Array.isArray(saved.hands),
  reduce: reduceHwrRoom,
  syncSeats: syncHwrSeats,
  running: (state) => state.phase === 'hint' || state.phase === 'reveal' || state.phase === 'guess',
  timeoutAction: { t: 'timeout' },
};

/** Creates a 히든 워드 room code and marks this browser as its host. */
export const prepareHiddenWordRoom = () => prepareRoom(HWR_ROOM.channel, HWR_ROOM.storage, 'hidden-word');

export function useHiddenWordRoom(code: string, defaultName: string) {
  return useRealtimeRoom(HWR_ROOM, code, defaultName);
}

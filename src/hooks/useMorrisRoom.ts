"use client";

import { type MorrisRoom, type MorrisRoomAction, createMorrisRoom, morrisAutoAction, reduceMorrisRoom, syncMorrisSeats } from '@/lib/morrisRoom';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

const MORRIS_ROOM: RoomEngine<MorrisRoom, MorrisRoomAction> = {
  channel: 'morris-room',
  storage: 'puzzlthink_morris',
  create: (value, host) => (value === 'morris' ? createMorrisRoom(host) : null),
  restorable: (saved) => Array.isArray(saved?.seats) && Array.isArray(saved?.game?.board) && Array.isArray(saved.rounds),
  reduce: reduceMorrisRoom,
  syncSeats: syncMorrisSeats,
  running: (state) => state.phase === 'playing',
  timeoutAction: { t: 'timeout' },
  autoAction: morrisAutoAction,
};

/** Creates a 1:1 나인 멘스 모리스 room code and marks this browser as its host. */
export const prepareMorrisRoom = () => prepareRoom(MORRIS_ROOM.channel, MORRIS_ROOM.storage, 'morris');

export function useMorrisRoom(code: string, defaultName: string) {
  const room = useRealtimeRoom(MORRIS_ROOM, code, defaultName);
  return { ...room, mySeat: room.mySeat as 0 | 1 | null };
}

"use client";

import { type TspRoom, type TspRoomAction, createTspRoom, redactTspRoom, reduceTspRoom, syncTspSeats } from '@/lib/twoSidedPokerRoom';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

const TSP_ROOM: RoomEngine<TspRoom, TspRoomAction> = {
  channel: 'two-sided-poker-room', storage: 'puzzlthink_two_sided_poker',
  create: (value, host) => (value === 'two-sided-poker' ? createTspRoom(host) : null),
  restorable: (saved) => Array.isArray(saved?.seats) && Array.isArray(saved.timeouts) && 'game' in saved,
  reduce: reduceTspRoom, syncSeats: syncTspSeats,
  running: (state) => state.phase === 'bet' || state.phase === 'reveal', timeoutAction: { t: 'timeout' },
  redact: redactTspRoom,
};

/** Creates a 1:1 양면포커 room code and marks this browser as its host. */
export const prepareTwoSidedPokerRoom = () => prepareRoom(TSP_ROOM.channel, TSP_ROOM.storage, 'two-sided-poker');

export function useTwoSidedPokerRoom(code: string, defaultName: string) {
  const room = useRealtimeRoom(TSP_ROOM, code, defaultName);
  return { ...room, mySeat: room.mySeat as 0 | 1 | null };
}

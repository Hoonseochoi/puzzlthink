"use client";

import { type M2Action, type M2Room, createM2Room, m2AutoAction, reduceM2Room, syncM2Seats } from '@/lib/merge2048Room';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

const M2_ROOM: RoomEngine<M2Room, M2Action> = {
  channel: 'merge2048-room',
  storage: 'puzzlthink_2048',
  create: (value, host) => (value === '2048' ? createM2Room(host) : null),
  restorable: (saved) => Array.isArray(saved?.seats) && Array.isArray(saved.snaps) && Array.isArray(saved.players),
  reduce: reduceM2Room,
  syncSeats: syncM2Seats,
  running: (state) => state.phase === 'playing',
  timeoutAction: { t: 'timeout' },
  autoAction: m2AutoAction,
};

/** Creates a 2048 room code and marks this browser as its host. */
export const prepareMerge2048Room = () => prepareRoom(M2_ROOM.channel, M2_ROOM.storage, '2048');

export function useMerge2048Room(code: string, defaultName: string) {
  return useRealtimeRoom(M2_ROOM, code, defaultName);
}

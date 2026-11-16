"use client";

import type { Side } from '@/lib/janggi';
import { type JanggiRoom, type JanggiRoomAction, createJanggiRoom, reduceJanggiRoom, syncJanggiSeats } from '@/lib/janggiRoom';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

const JANGGI_ROOM: RoomEngine<JanggiRoom, JanggiRoomAction> = {
  channel: 'janggi-room',
  storage: 'puzzlthink_janggi',
  create: (value, host) => (value === 'janggi' ? createJanggiRoom(host) : null),
  restorable: (saved) => Array.isArray(saved?.seats) && !!saved.game,
  reduce: reduceJanggiRoom,
  syncSeats: syncJanggiSeats,
  running: (state) => state.phase === 'playing',
  timeoutAction: { t: 'timeout' },
};

/** Creates a 12-janggi room code and marks this browser as its host. */
export const prepareJanggiRoom = () => prepareRoom(JANGGI_ROOM.channel, JANGGI_ROOM.storage, 'janggi');

export function useJanggiRoom(code: string, defaultName: string) {
  const room = useRealtimeRoom(JANGGI_ROOM, code, defaultName);
  return { ...room, mySeat: room.mySeat as Side | null };
}

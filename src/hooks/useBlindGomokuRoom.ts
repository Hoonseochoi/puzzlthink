"use client";

import { type BlindGomokuRoom, type BlindGomokuRoomAction, createBlindGomokuRoom, reduceBlindGomokuRoom, syncBlindGomokuSeats } from '@/lib/blindGomokuRoom';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

const BLIND_GOMOKU_ROOM: RoomEngine<BlindGomokuRoom, BlindGomokuRoomAction> = {
  channel: 'blind-gomoku-room',
  storage: 'puzzlthink_blindgomoku',
  create: (value, host) => (value === 'blindgomoku' ? createBlindGomokuRoom(host) : null),
  restorable: (saved) => Array.isArray(saved?.seats) && Array.isArray(saved.moves),
  reduce: reduceBlindGomokuRoom,
  syncSeats: syncBlindGomokuSeats,
  running: (state) => state.phase === 'playing',
  timeoutAction: { t: 'timeout' },
};

/** Creates a 1:1 blind gomoku room code and marks this browser as its host. */
export const prepareBlindGomokuRoom = () => prepareRoom(BLIND_GOMOKU_ROOM.channel, BLIND_GOMOKU_ROOM.storage, 'blindgomoku');

export function useBlindGomokuRoom(code: string, defaultName: string) {
  const room = useRealtimeRoom(BLIND_GOMOKU_ROOM, code, defaultName);
  return { ...room, mySeat: room.mySeat as 0 | 1 | null };
}

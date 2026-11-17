"use client";

import {
  type BlackWhiteRoom, type BlackWhiteRoomAction,
  blackWhiteSecret, createBlackWhiteRoom, redactBlackWhite, reduceBlackWhiteRoom, syncBlackWhiteSeats, withBlackWhiteSecret,
} from '@/lib/blackWhiteRoom';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

const BLACK_WHITE_ROOM: RoomEngine<BlackWhiteRoom, BlackWhiteRoomAction> = {
  channel: 'black-white-room',
  storage: 'puzzlthink_blackwhite',
  create: (value, host) => (value === 'blackwhite' ? createBlackWhiteRoom(host) : null),
  restorable: (saved) => Array.isArray(saved?.seats) && Array.isArray(saved.rounds) && Array.isArray(saved.timeouts),
  reduce: reduceBlackWhiteRoom,
  syncSeats: syncBlackWhiteSeats,
  running: (state) => state.phase === 'playing',
  timeoutAction: { t: 'timeout' },
  redact: redactBlackWhite, privateFor: blackWhiteSecret, withPrivate: withBlackWhiteSecret,
};

/** Creates a 1:1 흑과 백 room code and marks this browser as its host. */
export const prepareBlackWhiteRoom = () => prepareRoom(BLACK_WHITE_ROOM.channel, BLACK_WHITE_ROOM.storage, 'blackwhite');

export function useBlackWhiteRoom(code: string, defaultName: string) {
  const room = useRealtimeRoom(BLACK_WHITE_ROOM, code, defaultName);
  return { ...room, mySeat: room.mySeat as 0 | 1 | null };
}

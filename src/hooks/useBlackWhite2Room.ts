"use client";

import {
  type BlackWhite2Room, type BlackWhite2RoomAction,
  blackWhite2Secret, createBlackWhite2Room, redactBlackWhite2, reduceBlackWhite2Room, syncBlackWhite2Seats, withBlackWhite2Secret,
} from '@/lib/blackWhite2Room';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

const BLACK_WHITE_2_ROOM: RoomEngine<BlackWhite2Room, BlackWhite2RoomAction> = {
  channel: 'black-white-2-room',
  storage: 'puzzlthink_blackwhite2',
  create: (value, host) => (value === 'blackwhite2' ? createBlackWhite2Room(host) : null),
  restorable: (saved) => Array.isArray(saved?.seats) && Array.isArray(saved.rounds) && Array.isArray(saved.timeouts) && Array.isArray(saved.bank),
  reduce: reduceBlackWhite2Room,
  syncSeats: syncBlackWhite2Seats,
  running: (state) => state.phase === 'playing',
  timeoutAction: { t: 'timeout' },
  redact: redactBlackWhite2,
  privateFor: blackWhite2Secret,
  withPrivate: withBlackWhite2Secret,
};

export const prepareBlackWhite2Room = () => prepareRoom(BLACK_WHITE_2_ROOM.channel, BLACK_WHITE_2_ROOM.storage, 'blackwhite2');

export function useBlackWhite2Room(code: string, defaultName: string) {
  const room = useRealtimeRoom(BLACK_WHITE_2_ROOM, code, defaultName);
  return { ...room, mySeat: room.mySeat as 0 | 1 | null };
}

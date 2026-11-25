"use client";

import { type HexRoom, type HexRoomAction, createHexRoom, hexAutoAction, redactHexRoom, reduceHexRoom, resumeHexRoom, syncHexSeats } from '@/lib/hexagonRoom';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

const HEX_ROOM: RoomEngine<HexRoom, HexRoomAction> = {
  channel: 'hexagon-room',
  storage: 'puzzlthink_hexagon',
  create: (value, host) => (value === 'hexagon' ? createHexRoom(host) : null),
  restorable: (saved) => Array.isArray(saved?.seats) && Array.isArray(saved.history) && Array.isArray(saved.found),
  reduce: reduceHexRoom,
  syncSeats: syncHexSeats,
  running: (state) => state.phase === 'memorize' || state.phase === 'recall',
  timeoutAction: { t: 'timeout' },
  autoAction: hexAutoAction,
  redact: redactHexRoom,
  resume: resumeHexRoom,
};

/** Creates a 헥사곤 room code and marks this browser as its host. */
export const prepareHexagonRoom = () => prepareRoom(HEX_ROOM.channel, HEX_ROOM.storage, 'hexagon');

export function useHexagonRoom(code: string, defaultName: string) {
  return useRealtimeRoom(HEX_ROOM, code, defaultName);
}

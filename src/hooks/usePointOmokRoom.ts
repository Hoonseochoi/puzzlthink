"use client";

import { type PoAction, type PoRoom, createPoRoom, isPlaying, poPrivateFor, poRestorable, poWithPrivate, redactPoRoom, reducePoRoom, syncPoSeats } from '@/lib/pointOmokRoom';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

export const PO_ROOM: RoomEngine<PoRoom, PoAction> = {
  channel: 'point-omok-room',
  storage: 'puzzlthink_point_omok',
  create: (value, host) => (value === 'pointomok' ? createPoRoom(host) : null),
  restorable: poRestorable,
  reduce: reducePoRoom,
  syncSeats: syncPoSeats,
  running: isPlaying,
  timeoutAction: { t: 'timeout' },
  redact: redactPoRoom,
  privateFor: poPrivateFor,
  withPrivate: poWithPrivate,
  sealed: (action) => action.t === 'reveal',
};

/** Creates a 1:1 포인트 오목 room code and marks this browser as its host. */
export const preparePointOmokRoom = () => prepareRoom(PO_ROOM.channel, PO_ROOM.storage, 'pointomok');

export function usePointOmokRoom(code: string, defaultName: string) {
  const room = useRealtimeRoom(PO_ROOM, code, defaultName);
  return { ...room, mySeat: room.mySeat as 0 | 1 | null };
}

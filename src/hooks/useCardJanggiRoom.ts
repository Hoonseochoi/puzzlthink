"use client";

import {
  type CjAction, type CjRoom, cjAutoAction, cjPlaying, cjPrivateFor, cjRestorable, cjWithPrivate, createCjRoom, reduceCjRoom, redactCjRoom, syncCjSeats,
} from '@/lib/cardJanggiRoom';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

export const CJ_ROOM: RoomEngine<CjRoom, CjAction> = {
  channel: 'card-janggi-room',
  storage: 'puzzlthink_card_janggi',
  create: (value, host) => (value === 'cardjanggi' ? createCjRoom(host) : null),
  restorable: cjRestorable,
  reduce: reduceCjRoom,
  syncSeats: syncCjSeats,
  running: cjPlaying,
  timeoutAction: { t: 'timeout' },
  autoAction: cjAutoAction,
  redact: redactCjRoom,
  privateFor: cjPrivateFor,
  withPrivate: cjWithPrivate,
  sealed: (action) => action.t === 'arrange',
};

/** Creates a 1:1 카드 장기 room code and marks this browser as its host. */
export const prepareCardJanggiRoom = () => prepareRoom(CJ_ROOM.channel, CJ_ROOM.storage, 'cardjanggi');

export function useCardJanggiRoom(code: string, defaultName: string) {
  const room = useRealtimeRoom(CJ_ROOM, code, defaultName);
  return { ...room, mySeat: room.mySeat as 0 | 1 | null };
}

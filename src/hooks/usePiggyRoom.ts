"use client";

import { type PiggyRoom, type PiggyRoomAction, createPiggyRoom, piggyAutoAction, redactPiggy, reducePiggyRoom, syncPiggySeats } from '@/lib/piggyBankRoom';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

const PIGGY_ROOM: RoomEngine<PiggyRoom, PiggyRoomAction> = {
  channel: 'piggy-bank-room',
  storage: 'puzzlthink_piggy',
  create: (value, host) => (value === 'piggy' ? createPiggyRoom(host) : null),
  restorable: (saved) => Array.isArray(saved?.seats) && saved.seats.length === 4 && Array.isArray(saved.ai),
  reduce: reducePiggyRoom,
  syncSeats: syncPiggySeats,
  running: () => false, // time limits live inside the game and are driven by { t: 'auto' }
  timeoutAction: { t: 'auto' },
  autoAction: piggyAutoAction,
  redact: redactPiggy,
};

/** Creates a 돼지 저금통 room code (2–4 players) and marks this browser as its host. */
export const preparePiggyRoom = () => prepareRoom(PIGGY_ROOM.channel, PIGGY_ROOM.storage, 'piggy');
export const usePiggyRoom = (code: string, defaultName: string) => useRealtimeRoom(PIGGY_ROOM, code, defaultName);

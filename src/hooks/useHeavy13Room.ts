"use client";

import { type H13Action, type H13Room, createH13Room, h13AutoAction, reduceH13Room, redactH13, syncH13Seats } from '@/lib/heavy13Room';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

export const H13_ROOM: RoomEngine<H13Room, H13Action> = {
  channel: 'heavy13-room',
  storage: 'puzzlthink_heavy13',
  create: (value, host) => (value === 'heavy13' ? createH13Room(host) : null),
  restorable: (saved) => Array.isArray(saved?.seats) && saved.seats.length === 7 && !!saved.game,
  reduce: reduceH13Room,
  syncSeats: syncH13Seats,
  running: (state) => state.phase === 'playing',
  timeoutAction: { t: 'timeout' },
  autoAction: h13AutoAction,
  autoDelay: 1500, // wait at least 1.5s after any move before the next AI step, so play is easy to follow
  redact: redactH13,
};

export const prepareHeavy13Room = () => prepareRoom(H13_ROOM.storage, 'heavy13');
export const useHeavy13Room = (code: string, defaultName: string) => useRealtimeRoom(H13_ROOM, code, defaultName);

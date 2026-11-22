"use client";

import { type FtAction, type FtRoom, createFtRoom, ftAutoAction, reduceFtRoom, syncFtSeats } from '@/lib/fourThreeRoom';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

export const FT_ROOM: RoomEngine<FtRoom, FtAction> = {
  channel: 'four-three-room',
  storage: 'puzzlthink_four_three',
  create: (value, host) => (value === 'ko' || value === 'en' ? createFtRoom(host, { lang: value }) : null),
  restorable: (saved) => Array.isArray(saved?.seats) && Array.isArray(saved?.game?.board) && Array.isArray(saved.results),
  reduce: reduceFtRoom,
  syncSeats: syncFtSeats,
  running: (state) => state.phase === 'playing',
  timeoutAction: { t: 'timeout' },
  autoAction: ftAutoAction,
  autoDelay: 900, // AI moves come a beat apart so the board can be followed
};

/** Creates a 4인 3목 room code (names for the AI seats follow `lang`) and marks this browser as its host. */
export const prepareFourThreeRoom = (lang: 'ko' | 'en' = 'ko') => prepareRoom(FT_ROOM.channel, FT_ROOM.storage, lang);
export const useFourThreeRoom = (code: string, defaultName: string) => useRealtimeRoom(FT_ROOM, code, defaultName);

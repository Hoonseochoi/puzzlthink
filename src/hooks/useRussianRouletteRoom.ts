"use client";

import {
  type RussianRouletteRoom, type RussianRouletteRoomAction,
  createRussianRouletteRoom, redactRussianRoulette, reduceRussianRouletteRoom, russianRouletteAutoAction, russianRouletteSecret, syncRussianRouletteSeats, withRussianRouletteSecret,
} from '@/lib/russianRouletteRoom';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

export const RUSSIAN_ROULETTE_ROOM: RoomEngine<RussianRouletteRoom, RussianRouletteRoomAction> = {
  channel: 'russian-roulette-room', storage: 'puzzlthink_russian_roulette',
  create: (value, host) => value === 'russian-roulette' ? createRussianRouletteRoom(host) : null,
  restorable: (saved) => Array.isArray(saved?.seats) && saved.seats.length === 6 && !!saved.game,
  reduce: reduceRussianRouletteRoom, syncSeats: syncRussianRouletteSeats,
  running: (state) => state.phase === 'playing', timeoutAction: { t: 'timeout' }, autoAction: russianRouletteAutoAction, autoDelay: 2400,
  redact: redactRussianRoulette, privateFor: russianRouletteSecret, withPrivate: withRussianRouletteSecret,
};

export const prepareRussianRouletteRoom = () => prepareRoom(RUSSIAN_ROULETTE_ROOM.channel, RUSSIAN_ROULETTE_ROOM.storage, 'russian-roulette');
export const useRussianRouletteRoom = (code: string, defaultName: string) => useRealtimeRoom(RUSSIAN_ROULETTE_ROOM, code, defaultName);

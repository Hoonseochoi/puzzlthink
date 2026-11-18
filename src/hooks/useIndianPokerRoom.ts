"use client";

import { type IndianPokerAction, type IndianPokerRoom, createIndianPokerRoom, indianPokerAutoAction, redactIndianPoker, reduceIndianPokerRoom, syncIndianPokerSeats } from '@/lib/indianPokerRoom';
import { type RoomEngine, prepareRoom, useLocalRoom, useRealtimeRoom } from './useRealtimeRoom';

export const INDIAN_POKER_ROOM: RoomEngine<IndianPokerRoom, IndianPokerAction> = {
  channel: 'indian-poker-room', storage: 'puzzlthink_indian_poker',
  create: (value, host) => value === 'indian-poker' ? createIndianPokerRoom(host) : null,
  restorable: (saved) => Array.isArray(saved?.seats) && Array.isArray(saved.chips) && Array.isArray(saved.rounds),
  reduce: reduceIndianPokerRoom, syncSeats: syncIndianPokerSeats,
  running: (state) => state.phase === 'playing' || state.phase === 'reveal', timeoutAction: { t: 'timeout' },
  autoAction: indianPokerAutoAction, autoDelay: 1050, redact: redactIndianPoker,
};

export const prepareIndianPokerRoom = () => prepareRoom(INDIAN_POKER_ROOM.channel, INDIAN_POKER_ROOM.storage, 'indian-poker');
export const useIndianPokerRoom = (code: string, defaultName: string) => useRealtimeRoom(INDIAN_POKER_ROOM, code, defaultName);
const createLocalIndianPoker = () => createIndianPokerRoom({ id: 'local', name: 'YOU', at: 0 }, true);
export const useLocalIndianPoker = () => useLocalRoom(INDIAN_POKER_ROOM, createLocalIndianPoker);

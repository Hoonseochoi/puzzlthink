"use client";

import type { HwLevel } from '@/lib/hiddenWord';
import { type HwrAction, type HwrRoom, createHwrRoom, reduceHwrRoom, syncHwrSeats } from '@/lib/hiddenWordRoom';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

/** One engine per game: 히든 워드 (기본 words) and 히든 워드 확장판 (확장 words) have their own channels and saved rooms,
 * so an invite link opens the game it was made in. */
function engine(level: HwLevel): RoomEngine<HwrRoom, HwrAction> {
  const value = level === 'plus' ? 'hidden-word-plus' : 'hidden-word';
  return {
    channel: `${value}-room`,
    storage: level === 'plus' ? 'puzzlthink_hidden_word_plus' : 'puzzlthink_hidden_word',
    create: (v, host) => (v === value ? createHwrRoom(host, level) : null),
    restorable: (saved) => Array.isArray(saved?.seats) && Array.isArray(saved.scores) && Array.isArray(saved.hands),
    reduce: reduceHwrRoom,
    syncSeats: syncHwrSeats,
    running: (state) => state.phase === 'hint' || state.phase === 'reveal' || state.phase === 'guess',
    timeoutAction: { t: 'timeout' },
  };
}
const ENGINES: Record<HwLevel, RoomEngine<HwrRoom, HwrAction>> = { basic: engine('basic'), plus: engine('plus') };

/** Creates a room code for the game of this level and marks this browser as its host. */
export const prepareHiddenWordRoom = () => prepareRoom(ENGINES.basic.channel, ENGINES.basic.storage, 'hidden-word');
export const prepareHiddenWordPlusRoom = () => prepareRoom(ENGINES.plus.channel, ENGINES.plus.storage, 'hidden-word-plus');

export function useHiddenWordRoom(code: string, defaultName: string, level: HwLevel = 'basic') {
  return useRealtimeRoom(ENGINES[level], code, defaultName);
}

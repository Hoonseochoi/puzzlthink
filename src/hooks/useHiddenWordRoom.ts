"use client";

import { useCallback, useEffect } from 'react';
import type { HwLevel } from '@/lib/hiddenWord';
import { type HwrAction, type HwrRoom, createHwrRoom, hwoDeal, reduceHwrRoom, syncHwrSeats } from '@/lib/hiddenWordRoom';
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

/** Starts an open match on a server-held deal (the room page's rematch and the open-room panel's start). */
export async function startOpenMatch(level: HwLevel, dispatch: (action: HwrAction) => void) {
  const deal = await hwoDeal(level);
  if (deal?.deal && !deal.error) dispatch({ t: 'start', deal: deal.deal, open: true });
  return !!deal?.deal;
}

/**
 * The open-room panel's view of a 히든 워드 room (GAME_MODES.useRoom): the host marks the room as an open match while
 * it waits, and its start fetches a server-held deal first. Anyone signed in may join; only the Play app hosts.
 */
function useOpenRoom(level: HwLevel, code: string, defaultName: string) {
  const room = useHiddenWordRoom(code, defaultName, level);
  const { state, me, dispatch } = room;
  const isHost = !!me?.isHost;
  useEffect(() => {
    if (isHost && state?.phase === 'lobby' && !state.open) dispatch({ t: 'open' });
  }, [isHost, state?.phase, state?.open, dispatch]);
  const start = useCallback((action: { t: 'start' } | HwrAction) => {
    if (action.t === 'start' && !('deal' in action && action.deal)) void startOpenMatch(level, dispatch);
    else dispatch(action as HwrAction);
  }, [level, dispatch]);
  return { ...room, dispatch: start };
}
export const useHiddenWordOpenRoom = (code: string, defaultName: string) => useOpenRoom('basic', code, defaultName);
export const useHiddenWordPlusOpenRoom = (code: string, defaultName: string) => useOpenRoom('plus', code, defaultName);

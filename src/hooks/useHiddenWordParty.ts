"use client";

import { useCallback, useMemo } from 'react';
import { type HwpAction, type HwpRoom, createHwpRoom, hwpDeal, reduceHwpRoom, syncHwpSeats } from '@/lib/hiddenWordParty';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

/** 히든 워드 확장판 party room (2–6 players): its own channel, so a 1:1 link never opens it and the other way round. */
const HWP_ROOM: RoomEngine<HwpRoom, HwpAction> = {
  channel: 'hidden-word-party-room',
  storage: 'puzzlthink_hidden_word_party',
  create: (value, host) => (value === 'hidden-word-party' ? createHwpRoom(host) : null),
  restorable: (saved) => Array.isArray(saved?.seats) && Array.isArray(saved.scores) && Array.isArray(saved.players),
  reduce: reduceHwpRoom,
  syncSeats: syncHwpSeats,
  running: (state) => ['pick', 'hint', 'reveal', 'answer', 'turnEnd'].includes(state.phase),
  timeoutAction: { t: 'timeout' },
};
export const HWP_CHANNEL = HWP_ROOM.channel;

export const prepareHiddenWordPartyRoom = () => prepareRoom(HWP_ROOM.channel, HWP_ROOM.storage, 'hidden-word-party');

export function useHiddenWordParty(code: string, defaultName: string) {
  return useRealtimeRoom(HWP_ROOM, code, defaultName);
}

/** Deals for the seated players on the server and starts the match (lobby start, rematch, the open-room panel). */
export async function startPartyMatch(state: HwpRoom, dispatch: (action: HwpAction) => void) {
  const seated = state.seats.filter((s, i) => s && i < state.capacity).length;
  const deal = await hwpDeal(seated);
  if (deal?.deal && !deal.error) dispatch({ t: 'start', deal: deal.deal });
  return deal;
}

/**
 * The open-room panel's view of a party room (RoomOption.useRoom): the lobby's seat count is the panel's capacity, and
 * its start deals on the server first. Every party match keeps the words on the server, so the same room serves
 * friends and strangers.
 */
export function useHiddenWordPartyOpenRoom(code: string, defaultName: string) {
  const room = useHiddenWordParty(code, defaultName);
  const { state, dispatch } = room;
  const view = useMemo(() => (state ? { ...state, playerCount: state.capacity } : null), [state]);
  const start = useCallback((action: { t: 'start' } | HwpAction) => {
    if (action.t === 'start' && !('deal' in action && action.deal)) { if (state) void startPartyMatch(state, dispatch); }
    else dispatch(action as HwpAction);
  }, [state, dispatch]);
  return { ...room, state: view, dispatch: start };
}

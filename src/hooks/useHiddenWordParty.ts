"use client";

import { type HwpAction, type HwpRoom, createHwpRoom, reduceHwpRoom, syncHwpSeats } from '@/lib/hiddenWordParty';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

/** 히든 워드 확장판 party room (2–5 players): its own channel, so a 1:1 link never opens it and the other way round. */
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

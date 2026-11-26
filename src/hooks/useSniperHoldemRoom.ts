"use client";

import {
  type SniperHoldemRoom, type SniperHoldemRoomAction,
  createSniperHoldemRoom, reduceSniperHoldemRoom, redactSniperHoldemRoom, resumeSniperHoldemRoom, sniperHoldemAutoAction,
  sniperHoldemRoomSecret, syncSniperHoldemSeats, withSniperHoldemRoomSecret,
} from '@/lib/sniperHoldemRoom';
import { SH_SEATS } from '@/lib/sniperHoldem';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

export const SNIPER_HOLDEM_ROOM: RoomEngine<SniperHoldemRoom, SniperHoldemRoomAction> = {
  channel: 'sniper-holdem-room', storage: 'puzzlthink_sniper_holdem',
  create: (value, host) => (value === 'sniper-holdem' ? createSniperHoldemRoom(host) : null),
  restorable: (saved) => Array.isArray(saved?.seats) && saved.seats.length === SH_SEATS && !!saved.game && Array.isArray(saved.game.hands) && Array.isArray(saved.game.board),
  reduce: reduceSniperHoldemRoom, syncSeats: syncSniperHoldemSeats,
  running: (state) => state.phase === 'playing', timeoutAction: { t: 'timeout' }, autoAction: sniperHoldemAutoAction, autoDelay: 300,
  redact: redactSniperHoldemRoom, privateFor: sniperHoldemRoomSecret, withPrivate: withSniperHoldemRoomSecret, resume: resumeSniperHoldemRoom,
};

/** Creates a 5-seat 스나이퍼 홀덤 room code (empty seats become AI unless the host turns that off) and marks this browser as its host. */
export const prepareSniperHoldemRoom = () => prepareRoom(SNIPER_HOLDEM_ROOM.channel, SNIPER_HOLDEM_ROOM.storage, 'sniper-holdem');
export const useSniperHoldemRoom = (code: string, defaultName: string) => useRealtimeRoom(SNIPER_HOLDEM_ROOM, code, defaultName);

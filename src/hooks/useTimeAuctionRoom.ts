"use client";

import {
  type TaRoom, type TaRoomAction,
  createTaRoom, redactTaRoom, reduceTaRoom, syncTaSeats, taAutoAction, taQuiet, taRoomSecret, withTaRoomSecret,
} from '@/lib/timeAuctionRoom';
import { TA_MAX_PLAYERS } from '@/lib/timeAuction';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

export const TIME_AUCTION_ROOM: RoomEngine<TaRoom, TaRoomAction> = {
  channel: 'time-auction-room', storage: 'puzzlthink_time_auction',
  create: (value, host) => (value === 'time-auction' ? createTaRoom(host) : null),
  restorable: (saved) => Array.isArray(saved?.seats) && saved.seats.length === TA_MAX_PLAYERS && !!saved.game && Array.isArray(saved.game.bank) && !!saved.hidden,
  reduce: reduceTaRoom, syncSeats: syncTaSeats,
  running: () => false, timeoutAction: { t: 'tick' }, autoAction: taAutoAction, autoDelay: 0,
  redact: redactTaRoom, privateFor: taRoomSecret, withPrivate: withTaRoomSecret,
  // The hidden times leave with a host who goes away: the room goes back to the lobby.
  resume: () => null,
  // Presses and heartbeats are read by the host only; recording a release is not broadcast.
  sealed: (action) => action.t === 'hb' || action.t === 'press',
  quiet: taQuiet,
};

/** Creates a 6-seat 시간 경매 room code and marks this browser as its host. */
export const prepareTimeAuctionRoom = () => prepareRoom(TIME_AUCTION_ROOM.channel, TIME_AUCTION_ROOM.storage, 'time-auction');
export const useTimeAuctionRoom = (code: string, defaultName: string) => useRealtimeRoom(TIME_AUCTION_ROOM, code, defaultName);

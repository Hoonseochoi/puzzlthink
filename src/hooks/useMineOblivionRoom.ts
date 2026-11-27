"use client";

import { type MoRoom, type MoRoomAction, createMoRoom, moAutoAction, redactMoRoom, reduceMoRoom, syncMoSeats } from '@/lib/mineOblivionRoom';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

export const MINE_OBLIVION_ROOM: RoomEngine<MoRoom, MoRoomAction> = {
  channel: 'mine-oblivion-room', storage: 'puzzlthink_mine_oblivion',
  create: (value, host) => (value === 'mine-oblivion' ? createMoRoom(host) : null),
  restorable: (saved) => Array.isArray(saved?.seats) && saved.seats.length === 2 && !!saved.game && Array.isArray(saved.game.buried) && Array.isArray(saved.game.log),
  reduce: reduceMoRoom, syncSeats: syncMoSeats,
  running: (state) => state.phase === 'playing' && !state.solo, timeoutAction: { t: 'timeout' }, autoAction: moAutoAction, autoDelay: 0,
  redact: redactMoRoom,
  // A guest's burial is read by the host only.
  sealed: (action) => action.t === 'bury',
  // The mines leave with a host who goes away mid-match: back to the lobby.
  resume: () => null,
};

/** Creates a 1:1 망각의 지뢰 room code and marks this browser as its host. */
export const prepareMineOblivionRoom = () => prepareRoom(MINE_OBLIVION_ROOM.channel, MINE_OBLIVION_ROOM.storage, 'mine-oblivion');
export const useMineOblivionRoom = (code: string, defaultName: string) => useRealtimeRoom(MINE_OBLIVION_ROOM, code, defaultName);

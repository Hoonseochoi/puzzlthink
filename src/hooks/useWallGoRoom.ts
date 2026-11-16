"use client";

import type { ModeId } from '@/lib/wallgo';
import { type PlayerId } from '@/lib/wallgo';
import { type RoomAction, type RoomState, createRoom, reduceRoom, syncSeats } from '@/lib/wallgoRoom';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

const isMode = (value: string): value is ModeId => value === 'two' || value === 'three';

const WALLGO_ROOM: RoomEngine<RoomState, RoomAction> = {
  channel: 'wallgo-room',
  storage: 'puzzlthink_room',
  create: (value, host) => (isMode(value) ? createRoom(value, host) : null),
  restorable: (saved, value) => saved.mode === value,
  reduce: (state, action, seat, isHost) => reduceRoom(state, action, seat as PlayerId | null, isHost),
  syncSeats,
  running: (state) => state.phase === 'placement' || state.phase === 'playing',
  timeoutAction: { t: 'timeout' },
};

/** Creates a WallGo room code and marks this browser as its host. */
export const prepareHostedRoom = (mode: ModeId) => prepareRoom(WALLGO_ROOM.storage, mode);

export function useWallGoRoom(code: string, defaultName: string) {
  const room = useRealtimeRoom(WALLGO_ROOM, code, defaultName);
  return { ...room, mySeat: room.mySeat as PlayerId | null };
}

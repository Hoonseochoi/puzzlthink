"use client";

import type { ModeId, Variant } from '@/lib/wallgo';
import { type PlayerId } from '@/lib/wallgo';
import { type RoomAction, type RoomState, createRoom, reduceRoom, syncSeats } from '@/lib/wallgoRoom';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

const isMode = (value: string): value is ModeId => value === 'two' || value === 'three';

const engine = (variant: Variant): RoomEngine<RoomState, RoomAction> => ({
  channel: variant === 2 ? 'wallgo2-room' : 'wallgo-room',
  storage: variant === 2 ? 'puzzlthink_wallgo2_room' : 'puzzlthink_room',
  create: (value, host) => (isMode(value) ? createRoom(value, host, variant) : null),
  restorable: (saved, value) => saved.mode === value && (saved.variant ?? 1) === variant,
  reduce: (state, action, seat, isHost) => reduceRoom(state, action, seat as PlayerId | null, isHost),
  syncSeats,
  running: (state) => state.phase === 'placement' || state.phase === 'playing',
  timeoutAction: { t: 'timeout' },
});

const WALLGO_ROOM = engine(1);
const WALLGO2_ROOM = engine(2);

/** Creates a WallGo room code and marks this browser as its host. */
export const prepareHostedRoom = (mode: ModeId) => prepareRoom(WALLGO_ROOM.channel, WALLGO_ROOM.storage, mode);
/** Same for 벽바둑 II. */
export const prepareWallGo2Room = (mode: ModeId) => prepareRoom(WALLGO2_ROOM.channel, WALLGO2_ROOM.storage, mode);

export function useWallGoRoom(code: string, defaultName: string) {
  const room = useRealtimeRoom(WALLGO_ROOM, code, defaultName);
  return { ...room, mySeat: room.mySeat as PlayerId | null };
}

export function useWallGo2Room(code: string, defaultName: string) {
  const room = useRealtimeRoom(WALLGO2_ROOM, code, defaultName);
  return { ...room, mySeat: room.mySeat as PlayerId | null };
}

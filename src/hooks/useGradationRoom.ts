"use client";

import {
  type GradationRoom, type GradationRoomAction,
  createGradationRoom, gradationAutoAction, gradationRoomSecret, gradationSealed, redactGradationRoom, reduceGradationRoom, syncGradationSeats, withGradationRoomSecret,
} from '@/lib/gradationRoom';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

export const GRADATION_ROOM: RoomEngine<GradationRoom, GradationRoomAction> = {
  channel: 'gradation-room', storage: 'puzzlthink_gradation',
  create: (value, host) => (value === 'gradation' ? createGradationRoom(host) : null),
  restorable: (saved) => Array.isArray(saved?.seats) && saved.seats.length === 2 && !!saved.game && Array.isArray(saved.game.rows),
  reduce: reduceGradationRoom, syncSeats: syncGradationSeats,
  running: (state) => state.phase === 'playing', timeoutAction: { t: 'timeout' }, autoAction: gradationAutoAction, autoDelay: 300,
  redact: redactGradationRoom, privateFor: gradationRoomSecret, withPrivate: withGradationRoomSecret, sealed: gradationSealed,
};

/** Creates a 1:1 그라데이션 room code and marks this browser as its host. */
export const prepareGradationRoom = () => prepareRoom(GRADATION_ROOM.channel, GRADATION_ROOM.storage, 'gradation');
export const useGradationRoom = (code: string, defaultName: string) => useRealtimeRoom(GRADATION_ROOM, code, defaultName);

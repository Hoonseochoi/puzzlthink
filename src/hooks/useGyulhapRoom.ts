"use client";

import { type GyulhapAction, type GyulhapRoom, createGyulhapRoom, reduceGyulhapRoom, syncGyulhapSeats } from '@/lib/gyulhapRoom';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

export const GYULHAP_ROOM: RoomEngine<GyulhapRoom, GyulhapAction> = {
  channel: 'gyulhap-room', storage: 'puzzlthink_gyulhap',
  create: (value, host) => value === 'gyulhap' ? createGyulhapRoom(host) : null,
  restorable: (saved) => Array.isArray(saved?.seats) && Array.isArray(saved.cards) && Array.isArray(saved.scores),
  reduce: reduceGyulhapRoom, syncSeats: syncGyulhapSeats,
  running: (state) => state.phase === 'playing', timeoutAction: { t: 'timeout' },
};

export const prepareGyulhapRoom = () => prepareRoom(GYULHAP_ROOM.channel, GYULHAP_ROOM.storage, 'gyulhap');
export const useGyulhapRoom = (code: string, defaultName: string) => useRealtimeRoom(GYULHAP_ROOM, code, defaultName);

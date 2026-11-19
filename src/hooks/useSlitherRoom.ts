"use client";

import { type SlitherAction, type SlitherRoom, createSlitherRoom, reduceSlitherRoom, syncSlitherSeats } from '@/lib/slitherRoom';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

export const SLITHER_ROOM: RoomEngine<SlitherRoom, SlitherAction> = {
  channel: 'slither-room', storage: 'puzzlthink_slither',
  create: (value, host) => (value === 'slitherlink' ? createSlitherRoom(host) : null),
  restorable: (saved) => Array.isArray(saved?.seats) && Array.isArray(saved.solvedMs) && typeof saved.seed === 'number',
  reduce: reduceSlitherRoom, syncSeats: syncSlitherSeats,
  running: () => false, timeoutAction: { t: 'noop' },
};

export const prepareSlitherRoom = () => prepareRoom(SLITHER_ROOM.channel, SLITHER_ROOM.storage, 'slitherlink');
export const useSlitherRoom = (code: string, defaultName: string) => useRealtimeRoom(SLITHER_ROOM, code, defaultName);

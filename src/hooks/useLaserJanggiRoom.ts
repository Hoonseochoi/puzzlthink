"use client";

import { createLaserJanggiRoom, reduceLaserJanggiRoom, syncLaserJanggiSeats, type LaserJanggiRoom, type LaserJanggiRoomAction } from '@/lib/laserJanggiRoom';
import { prepareRoom, type RoomEngine, useRealtimeRoom } from './useRealtimeRoom';

const LASER_JANGGI_ROOM: RoomEngine<LaserJanggiRoom, LaserJanggiRoomAction> = {
  channel: 'laser-janggi-room',
  storage: 'puzzlthink_laserjanggi',
  create: (value, host) => value === 'laserjanggi' ? createLaserJanggiRoom(host) : null,
  restorable: (saved) => Array.isArray(saved?.seats) && Array.isArray(saved?.pieces),
  reduce: reduceLaserJanggiRoom,
  syncSeats: syncLaserJanggiSeats,
  running: (state) => state.phase === 'playing',
  timeoutAction: { t: 'timeout' },
};

export const prepareLaserJanggiRoom = () => prepareRoom(LASER_JANGGI_ROOM.channel, LASER_JANGGI_ROOM.storage, 'laserjanggi');

export function useLaserJanggiRoom(code: string, defaultName: string) {
  const room = useRealtimeRoom(LASER_JANGGI_ROOM, code, defaultName);
  return { ...room, mySeat: room.mySeat as 0 | 1 | null };
}

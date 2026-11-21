"use client";

import { createMonorailRoom, reduceMonorailRoom, restorableMonorailRoom, syncMonorailSeats, type MonorailRoom, type MonorailRoomAction } from '@/lib/monorailRoom';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

const MONORAIL_ROOM: RoomEngine<MonorailRoom, MonorailRoomAction> = {
  channel: 'monorail-room', storage: 'puzzlthink_monorail',
  create: (value, host) => value === 'monorail' ? createMonorailRoom(host) : null,
  restorable: restorableMonorailRoom,
  reduce: reduceMonorailRoom, syncSeats: syncMonorailSeats,
  running: (state) => state.phase === 'playing', timeoutAction: { t: 'timeout' },
};

export const prepareMonorailRoom = () => prepareRoom(MONORAIL_ROOM.channel, MONORAIL_ROOM.storage, 'monorail');

export function useMonorailRoom(code: string, defaultName: string) {
  const room = useRealtimeRoom(MONORAIL_ROOM, code, defaultName);
  return { ...room, mySeat: room.mySeat as 0 | 1 | null };
}

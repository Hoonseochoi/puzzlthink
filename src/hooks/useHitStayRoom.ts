"use client";

import {
  type HitStayRoom, type HitStayRoomAction,
  createHitStayRoom, hitStayAutoAction, resumeHitStayRoom, hitStayRoomSecret, redactHitStayRoom, reduceHitStayRoom, syncHitStaySeats, withHitStayRoomSecret,
} from '@/lib/hitStayRoom';
import { HS_PLAYERS } from '@/lib/hitStay';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

export const HIT_STAY_ROOM: RoomEngine<HitStayRoom, HitStayRoomAction> = {
  channel: 'hit-stay-room', storage: 'puzzlthink_hit_stay',
  create: (value, host) => (value === 'hit-stay' ? createHitStayRoom(host) : null),
  restorable: (saved) => Array.isArray(saved?.seats) && saved.seats.length === HS_PLAYERS && !!saved.game && Array.isArray(saved.game.hands),
  reduce: reduceHitStayRoom, syncSeats: syncHitStaySeats,
  running: (state) => state.phase === 'playing', timeoutAction: { t: 'timeout' }, autoAction: hitStayAutoAction, autoDelay: 300,
  redact: redactHitStayRoom, privateFor: hitStayRoomSecret, withPrivate: withHitStayRoomSecret, resume: resumeHitStayRoom,
};

/** Creates a 5-seat HIT, STAY room code (empty seats become AI) and marks this browser as its host. */
export const prepareHitStayRoom = () => prepareRoom(HIT_STAY_ROOM.channel, HIT_STAY_ROOM.storage, 'hit-stay');
export const useHitStayRoom = (code: string, defaultName: string) => useRealtimeRoom(HIT_STAY_ROOM, code, defaultName);

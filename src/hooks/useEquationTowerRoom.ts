"use client";

import { type EqtRoom, type EqtRoomAction, createEqtRoom, eqtAutoAction, redactEqtRoom, reduceEqtRoom, syncEqtSeats } from '@/lib/equationTowerRoom';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

const EQT_ROOM: RoomEngine<EqtRoom, EqtRoomAction> = {
  channel: 'equation-tower-room',
  storage: 'puzzlthink_equation_tower',
  create: (value, host) => (value === 'equation-tower' ? createEqtRoom(host) : null),
  restorable: (saved) => Array.isArray(saved?.seats) && Array.isArray(saved.stacks) && Array.isArray(saved.bids),
  reduce: reduceEqtRoom,
  syncSeats: syncEqtSeats,
  running: (state) => state.phase === 'think' || state.phase === 'outbid' || state.phase === 'act',
  timeoutAction: { t: 'timeout' },
  autoAction: eqtAutoAction,
  redact: redactEqtRoom,
};

/** Creates a 수식의 탑 room code and marks this browser as its host. */
export const prepareEquationTowerRoom = () => prepareRoom(EQT_ROOM.channel, EQT_ROOM.storage, 'equation-tower');

export function useEquationTowerRoom(code: string, defaultName: string) {
  return useRealtimeRoom(EQT_ROOM, code, defaultName);
}

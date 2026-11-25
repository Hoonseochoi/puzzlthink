"use client";

import { type EqsRoom, type EqsRoomAction, createEqsRoom, eqsAutoAction, redactEqsRoom, reduceEqsRoom, syncEqsSeats } from '@/lib/equationSignalRoom';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

const EQS_ROOM: RoomEngine<EqsRoom, EqsRoomAction> = {
  channel: 'equation-signal-room',
  storage: 'puzzlthink_equation_signal',
  create: (value, host) => (value === 'equation-signal' ? createEqsRoom(host) : null),
  restorable: (saved) => Array.isArray(saved?.seats) && Array.isArray(saved.rows) && Array.isArray(saved.history),
  reduce: reduceEqsRoom,
  syncSeats: syncEqsSeats,
  running: (state) => state.phase === 'play',
  timeoutAction: { t: 'timeout' },
  autoAction: eqsAutoAction,
  redact: redactEqsRoom,
};

/** Creates a 수식 신호등 room code and marks this browser as its host. */
export const prepareEquationSignalRoom = () => prepareRoom(EQS_ROOM.channel, EQS_ROOM.storage, 'equation-signal');

export function useEquationSignalRoom(code: string, defaultName: string) {
  return useRealtimeRoom(EQS_ROOM, code, defaultName);
}

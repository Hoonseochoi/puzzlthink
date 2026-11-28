"use client";

import { type EqsRoom, type EqsRoomAction, createEqsRoom, eqsAutoAction, redactEqsRoom, reduceEqsRoom, syncEqsSeats } from '@/lib/equationSignalRoom';
import { DUEL_HOST_VALUE, type DuelAction, type DuelRoom, createDuelRoom, duelAutoAction, duelRunning, isDuel, reduceDuelRoom, syncDuelSeats } from '@/lib/equationSignalDuel';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

/** One channel, two kinds of room: the 2–4 player race (EqsRoom) and the 1:1 출제 대결 (DuelRoom, `mode: 'duel'`). */
export type EqsAnyRoom = EqsRoom | DuelRoom;
export type EqsAnyAction = EqsRoomAction | DuelAction;

const EQS_ROOM: RoomEngine<EqsAnyRoom, EqsAnyAction> = {
  channel: 'equation-signal-room',
  storage: 'puzzlthink_equation_signal',
  create: (value, host) => (value === 'equation-signal' ? createEqsRoom(host) : value === DUEL_HOST_VALUE ? createDuelRoom(host) : null),
  restorable: (saved, value) => (value === DUEL_HOST_VALUE
    ? isDuel(saved) && Array.isArray(saved.seats) && Array.isArray(saved.rows) && Array.isArray(saved.commits)
    : !isDuel(saved) && Array.isArray(saved?.seats) && Array.isArray(saved.rows) && Array.isArray(saved.history)),
  reduce: (state, action, seat, isHost) => (isDuel(state)
    ? reduceDuelRoom(state, action as DuelAction, seat, isHost)
    : reduceEqsRoom(state, action as EqsRoomAction, seat, isHost)),
  syncSeats: (state, peers) => (isDuel(state) ? syncDuelSeats(state, peers) : syncEqsSeats(state, peers)),
  running: (state) => (isDuel(state) ? duelRunning(state) : state.phase === 'play'),
  timeoutAction: { t: 'timeout' },
  autoAction: (state) => (isDuel(state) ? duelAutoAction(state) : eqsAutoAction(state)),
  // The race hides the answer from guests. A duel's state holds no secret at all (each equation stays in its writer's
  // browser until the reveal), so it goes out whole, and a guest who takes over carries on with it.
  redact: (state) => (isDuel(state) ? state : redactEqsRoom(state)),
  resume: (view) => (isDuel(view) ? view : null),
};

/** Creates a 수식 신호등 room code and marks this browser as its host. */
export const prepareEquationSignalRoom = () => prepareRoom(EQS_ROOM.channel, EQS_ROOM.storage, 'equation-signal');
/** The same, for a 1:1 출제 대결 room. */
export const prepareEquationSignalDuelRoom = () => prepareRoom(EQS_ROOM.channel, EQS_ROOM.storage, DUEL_HOST_VALUE);

export function useEquationSignalRoom(code: string, defaultName: string) {
  return useRealtimeRoom(EQS_ROOM, code, defaultName);
}
export type EqsRoomHook = ReturnType<typeof useEquationSignalRoom>;

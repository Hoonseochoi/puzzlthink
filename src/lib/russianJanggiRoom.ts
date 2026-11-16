// Shared-room state for 러시아장기 with a friend. Seat index = side (seat 0 is the host).
import { type Action, type RJState, type Side, TURN_SECONDS, applyAction, finish, initialState, isLegal, isOver } from './russianJanggi';
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';

export type RJRoom = BaseRoom & {
  phase: 'lobby' | 'playing' | 'finished';
  game: RJState;
  first: Side;
  timeouts: number; // timeouts in a row; six in a row means both players have gone quiet
};

export type RJRoomAction = { t: 'start' } | { t: 'act'; action: Action } | { t: 'resign' } | { t: 'timeout' };

export function createRJRoom(host: Peer): RJRoom {
  return { sid: newSid(), v: 1, seats: [{ id: host.id, name: host.name }, null] as Seat[], phase: 'lobby', deadline: 0, game: initialState(0), first: 0, timeouts: 0 };
}

export const syncRJSeats = (state: RJRoom, peers: Peer[]) => syncSeats(state, peers);

const afterMove = (state: RJRoom, game: RJState, timeouts: number): RJRoom => ({
  ...state, game, timeouts, phase: isOver(game) ? 'finished' : 'playing', deadline: Date.now() + TURN_SECONDS * 1000,
});

export function reduceRJRoom(state: RJRoom, action: RJRoomAction, seat: number | null, isHost: boolean): RJRoom | null {
  let next: RJRoom | null = null;
  switch (action.t) {
    case 'start': {
      if (!isHost || state.phase === 'playing' || state.seats.some((s) => !s)) break;
      const first: Side = Math.random() < 0.5 ? 0 : 1;
      next = { ...state, phase: 'playing', first, game: initialState(first), timeouts: 0, deadline: Date.now() + TURN_SECONDS * 1000 };
      break;
    }
    case 'act':
      if (state.phase !== 'playing' || seat !== state.game.turn || action.action.kind !== 'place' || !isLegal(state.game, action.action)) break;
      next = afterMove(state, applyAction(state.game, action.action), 0);
      break;
    case 'resign':
      if (state.phase !== 'playing' || (seat !== 0 && seat !== 1)) break;
      next = { ...state, phase: 'finished', game: finish(state.game, seat === 0 ? 1 : 0, 'resign') };
      break;
    case 'timeout':
      if (!isHost || state.phase !== 'playing' || Date.now() < state.deadline) break;
      if (state.timeouts >= 5) { next = { ...state, phase: 'finished', game: finish(state.game, null, 'abandon') }; break; }
      // Rule ⑤: out of time → the turn passes.
      next = afterMove(state, applyAction(state.game, { kind: 'pass' }), state.timeouts + 1);
      break;
  }
  return next ? bump(next) : null;
}

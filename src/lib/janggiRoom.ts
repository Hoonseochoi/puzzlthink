// Shared-room state for 12-janggi with a friend. Seat index = side (seat 0 is the host).
import { type Action, type JanggiState, type Side, playAction, finish, initialState, isLegal, legalActions } from './janggi';
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';

export const TURN_OPTIONS = [90, 60, 30] as const;
export type TurnSeconds = (typeof TURN_OPTIONS)[number];

export type JanggiRoom = BaseRoom & {
  phase: 'lobby' | 'playing' | 'finished';
  turnSec: TurnSeconds;
  game: JanggiState;
  first: Side;
  timeouts: number; // auto-moves in a row; three in a row forfeits (an abandoned game)
};

export type JanggiRoomAction =
  | { t: 'start' }
  | { t: 'config'; turnSec: TurnSeconds }
  | { t: 'act'; action: Action }
  | { t: 'resign' }
  | { t: 'timeout' };

export function createJanggiRoom(host: Peer, turnSec: TurnSeconds = 60): JanggiRoom {
  return {
    sid: newSid(), v: 1, seats: [{ id: host.id, name: host.name }, null] as Seat[], phase: 'lobby', deadline: 0,
    turnSec, game: initialState(0), first: 0, timeouts: 0,
  };
}

export const syncJanggiSeats = (state: JanggiRoom, peers: Peer[]) => syncSeats(state, peers);

const done = (game: JanggiState) => game.winner !== null || game.reason !== null;

function afterMove(state: JanggiRoom, game: JanggiState, timeouts: number): JanggiRoom {
  return { ...state, game, timeouts, phase: done(game) ? 'finished' : 'playing', deadline: Date.now() + state.turnSec * 1000 };
}

export function reduceJanggiRoom(state: JanggiRoom, action: JanggiRoomAction, seat: number | null, isHost: boolean): JanggiRoom | null {
  let next: JanggiRoom | null = null;
  switch (action.t) {
    case 'config':
      if (isHost && state.phase === 'lobby' && (TURN_OPTIONS as readonly number[]).includes(action.turnSec)) next = { ...state, turnSec: action.turnSec };
      break;
    case 'start': {
      if (!isHost || state.phase === 'playing' || state.seats.some((s) => !s)) break;
      const first: Side = Math.random() < 0.5 ? 0 : 1;
      next = { ...state, phase: 'playing', first, game: initialState(first), timeouts: 0, deadline: Date.now() + state.turnSec * 1000 };
      break;
    }
    case 'act':
      if (state.phase !== 'playing' || seat !== state.game.turn || !isLegal(state.game, action.action)) break;
      next = afterMove(state, playAction(state.game, action.action), 0);
      break;
    case 'resign':
      if (state.phase !== 'playing' || (seat !== 0 && seat !== 1)) break;
      next = { ...state, phase: 'finished', game: finish(state.game, seat === 0 ? 1 : 0, 'resign') };
      break;
    case 'timeout': {
      if (!isHost || state.phase !== 'playing' || Date.now() < state.deadline) break;
      const loser = state.game.turn;
      // Three automatic moves in a row means the player has left: they lose on time.
      if (state.timeouts >= 2) { next = { ...state, phase: 'finished', game: finish(state.game, loser === 0 ? 1 : 0, 'timeout') }; break; }
      const options = legalActions(state.game);
      if (!options.length) { next = { ...state, phase: 'finished', game: finish(state.game, loser === 0 ? 1 : 0, 'timeout') }; break; }
      next = afterMove(state, playAction(state.game, options[Math.floor(Math.random() * options.length)]), state.timeouts + 1);
      break;
    }
  }
  return next ? bump(next) : null;
}

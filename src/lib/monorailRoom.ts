// Host-authoritative 1:1 Monorail room. Open matches use this exact same engine as friend rooms.
import { type MonorailMove, type MonorailState, type Player, declareImpossible, newMonorail, playMonorail } from './monorail';
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';

export const MONORAIL_TURN_OPTIONS = [90, 60, 30] as const;
export type MonorailTurnSeconds = (typeof MONORAIL_TURN_OPTIONS)[number];

export type MonorailRoom = BaseRoom & {
  phase: 'lobby' | 'playing' | 'finished';
  turnSec: MonorailTurnSeconds;
  first: 0 | 1;
  game: MonorailState;
};

export type MonorailRoomAction =
  | { t: 'config'; turnSec: MonorailTurnSeconds }
  | { t: 'start' }
  | { t: 'move'; move: MonorailMove }
  | { t: 'impossible' }
  | { t: 'resign' }
  | { t: 'timeout' };

export function createMonorailRoom(host: Peer): MonorailRoom {
  return {
    sid: newSid(), v: 1, seats: [{ id: host.id, name: host.name }, null] as Seat[], phase: 'lobby', deadline: 0,
    turnSec: 60, first: 0, game: newMonorail(),
  };
}

export const syncMonorailSeats = (state: MonorailRoom, peers: Peer[]) => syncSeats(state, peers);
export const seatToMove = (state: MonorailRoom): 0 | 1 => (state.game.turn === 0 ? state.first : (1 - state.first) as 0 | 1);
export const colorOf = (state: MonorailRoom, seat: number): Player => (seat === state.first ? 0 : 1);
export const winnerSeat = (state: MonorailRoom): 0 | 1 | null => state.game.winner === null ? null : state.game.winner === 0 ? state.first : (1 - state.first) as 0 | 1;
const withClock = (state: MonorailRoom) => ({ ...state, deadline: Date.now() + state.turnSec * 1000 });

function after(state: MonorailRoom, game: MonorailState) {
  return game.winner === null ? withClock({ ...state, game }) : { ...state, game, phase: 'finished' as const, deadline: 0 };
}

export function reduceMonorailRoom(state: MonorailRoom, action: MonorailRoomAction, seat: number | null, isHost: boolean): MonorailRoom | null {
  let next: MonorailRoom | null = null;
  switch (action.t) {
    case 'config':
      if (isHost && state.phase !== 'playing' && (MONORAIL_TURN_OPTIONS as readonly number[]).includes(action.turnSec)) next = { ...state, turnSec: action.turnSec };
      break;
    case 'start': {
      if (!isHost || state.phase === 'playing' || state.seats.some((x) => !x)) break;
      const first = (Math.random() < 0.5 ? 0 : 1) as 0 | 1;
      next = withClock({ ...state, sid: newSid(), phase: 'playing', first, game: newMonorail() });
      break;
    }
    case 'move': {
      if (state.phase !== 'playing' || seat !== seatToMove(state)) break;
      const game = playMonorail(state.game, action.move);
      if (game) next = after(state, game);
      break;
    }
    case 'impossible': {
      if (state.phase !== 'playing' || seat !== seatToMove(state)) break;
      const game = declareImpossible(state.game);
      if (game) next = after(state, game);
      break;
    }
    case 'resign':
      if (state.phase === 'playing' && (seat === 0 || seat === 1)) next = after(state, { ...state.game, winner: colorOf(state, 1 - seat), reason: 'resign' });
      break;
    case 'timeout':
      if (isHost && state.phase === 'playing' && Date.now() >= state.deadline) {
        const late = seatToMove(state);
        next = after(state, { ...state.game, winner: colorOf(state, 1 - late), reason: 'timeout' });
      }
      break;
  }
  return next ? bump(next) : null;
}

/** Cheap restore guard also rejects stale states with impossible tile counts. */
export function restorableMonorailRoom(saved: MonorailRoom) {
  return Array.isArray(saved?.seats) && saved.seats.length === 2 && Array.isArray(saved?.game?.tiles)
    && saved.game.tiles.length <= 16;
}

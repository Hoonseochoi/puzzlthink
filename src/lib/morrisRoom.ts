// Shared room for 1:1 나인 멘스 모리스 with a friend. Seat 0 is the host.
// A match is best of three rounds (first to two). Round one's black is drawn at random, then the sides swap
// every round. A drawn round does not count; after five rounds the match ends where it stands.
import { type Move, type MorrisState, type Player, isLegal, newMorris, play, randomMove } from './morris';
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';

export const MORRIS_TURN_OPTIONS = [90, 60, 30] as const;
export type MorrisTurnSeconds = (typeof MORRIS_TURN_OPTIONS)[number];
export const MORRIS_WINS = 2;
export const MORRIS_MAX_ROUNDS = 5;
export const ROUND_BREAK_MS = 6000;
const TIMEOUT_LOSS = 3; // missed turns in a row that lose the round

export type MorrisRound = { first: 0 | 1; winner: 0 | 1 | 'draw'; reason: MorrisState['reason'] };

export type MorrisRoom = BaseRoom & {
  phase: 'lobby' | 'playing' | 'roundEnd' | 'finished';
  turnSec: MorrisTurnSeconds;
  first: 0 | 1; // seat playing black (first to move) this round
  firstOfMatch: 0 | 1;
  game: MorrisState;
  wins: [number, number]; // rounds won, by seat
  rounds: MorrisRound[];
  timeouts: [number, number]; // missed turns in a row, by seat
  breakEnd: number; // roundEnd: when the next round starts
};

export type MorrisRoomAction =
  | { t: 'start' }
  | { t: 'config'; turnSec?: MorrisTurnSeconds }
  | { t: 'move'; move: Move }
  | { t: 'resign' }
  | { t: 'next' }
  | { t: 'timeout' };

export function createMorrisRoom(host: Peer): MorrisRoom {
  return {
    sid: newSid(), v: 1, seats: [{ id: host.id, name: host.name }, null] as Seat[], phase: 'lobby', deadline: 0,
    turnSec: 90, first: 0, firstOfMatch: 0, game: newMorris(), wins: [0, 0], rounds: [], timeouts: [0, 0], breakEnd: 0,
  };
}

export const syncMorrisSeats = (state: MorrisRoom, peers: Peer[]) => syncSeats(state, peers);

/** The colour a seat plays this round (0 = black). */
export const colorOf = (state: MorrisRoom, seat: number): Player => (seat === state.first ? 0 : 1);
export const seatOfColor = (state: MorrisRoom, color: Player): 0 | 1 => (color === 0 ? state.first : (1 - state.first) as 0 | 1);
export const seatToMove = (state: MorrisRoom) => seatOfColor(state, state.game.turn);

const withClock = (state: MorrisRoom): MorrisRoom => ({ ...state, deadline: Date.now() + state.turnSec * 1000 });

function beginRound(state: MorrisRoom, first: 0 | 1): MorrisRoom {
  return withClock({ ...state, phase: 'playing', first, game: newMorris(), timeouts: [0, 0], breakEnd: 0 });
}

/** After a move: if the round is over, score it and either pause before the next round or end the match. */
function after(state: MorrisRoom, game: MorrisState, timeouts: [number, number]): MorrisRoom {
  if (game.winner === null) return withClock({ ...state, game, timeouts });
  const winnerSeat: MorrisRound['winner'] = game.winner === 'draw' ? 'draw' : seatOfColor(state, game.winner);
  const wins: [number, number] = [state.wins[0], state.wins[1]];
  if (winnerSeat !== 'draw') wins[winnerSeat] += 1;
  const rounds = [...state.rounds, { first: state.first, winner: winnerSeat, reason: game.reason }];
  const over = wins.some((w) => w >= MORRIS_WINS) || rounds.length >= MORRIS_MAX_ROUNDS;
  return { ...state, game, timeouts, wins, rounds, phase: over ? 'finished' : 'roundEnd', deadline: 0, breakEnd: over ? 0 : Date.now() + ROUND_BREAK_MS };
}

/** Seat that won the match, 'draw', or null while it is still going. */
export const matchWinner = (state: MorrisRoom): 0 | 1 | 'draw' | null =>
  state.phase !== 'finished' ? null : state.wins[0] === state.wins[1] ? 'draw' : state.wins[0] > state.wins[1] ? 0 : 1;

export function reduceMorrisRoom(state: MorrisRoom, action: MorrisRoomAction, seat: number | null, isHost: boolean): MorrisRoom | null {
  let next: MorrisRoom | null = null;
  switch (action.t) {
    case 'config': {
      if (!isHost || state.phase === 'playing' || state.phase === 'roundEnd') break;
      const turnSec = action.turnSec !== undefined && (MORRIS_TURN_OPTIONS as readonly number[]).includes(action.turnSec) ? action.turnSec : state.turnSec;
      next = { ...state, turnSec };
      break;
    }
    case 'start': {
      if (!isHost || state.phase === 'playing' || state.phase === 'roundEnd' || state.seats.some((s) => !s)) break;
      const first = (Math.random() < 0.5 ? 0 : 1) as 0 | 1;
      next = beginRound({ ...state, sid: newSid(), firstOfMatch: first, wins: [0, 0], rounds: [] }, first);
      break;
    }
    case 'move': {
      if (state.phase !== 'playing' || seat !== seatToMove(state) || !action.move || !isLegal(state.game, action.move)) break;
      const move: Move = { from: action.move.from, to: action.move.to, remove: action.move.remove };
      const timeouts: [number, number] = [state.timeouts[0], state.timeouts[1]];
      timeouts[seat] = 0;
      next = after(state, play(state.game, move), timeouts);
      break;
    }
    case 'resign': {
      if (state.phase !== 'playing' || (seat !== 0 && seat !== 1)) break;
      const winnerColor = colorOf(state, 1 - seat);
      next = after(state, { ...state.game, winner: winnerColor, reason: 'resign' }, state.timeouts);
      break;
    }
    case 'next':
      if (!isHost || state.phase !== 'roundEnd' || Date.now() < state.breakEnd) break;
      next = beginRound(state, (1 - state.first) as 0 | 1);
      break;
    case 'timeout': {
      if (!isHost || state.phase !== 'playing' || Date.now() < state.deadline) break;
      const late = seatToMove(state);
      const timeouts: [number, number] = [state.timeouts[0], state.timeouts[1]];
      timeouts[late] += 1;
      const move = randomMove(state.game);
      if (timeouts[late] >= TIMEOUT_LOSS || !move) { next = after(state, { ...state.game, winner: colorOf(state, 1 - late), reason: 'timeout' }, timeouts); break; }
      next = after(state, play(state.game, move), timeouts);
      break;
    }
  }
  return next ? bump(next) : null;
}

/** Host-run step: start the next round once the break is over. */
export const morrisAutoAction = (state: MorrisRoom): MorrisRoomAction | null =>
  state.phase === 'roundEnd' && Date.now() >= state.breakEnd ? { t: 'next' } : null;

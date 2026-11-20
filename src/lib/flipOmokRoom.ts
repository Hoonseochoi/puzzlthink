// Shared room for 1:1 뒤집기 오목 with a friend. Seat 0 is the host.
// One game per match: red (first) is drawn at random for the first game, then swaps on every rematch.
// Each turn has a clock; when it runs out a legal move is played for you, and three in a row lose the game.
import { chooseMove, emptyBoard, isForbidden, isFull, other, play, type Board, type Line, type Player } from './flipOmok';
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';

export const FLIP_TURN_OPTIONS = [60, 30, 15] as const;
export type FlipTurnSeconds = (typeof FLIP_TURN_OPTIONS)[number];
const TIMEOUT_LOSS = 3;

export type FlipRoom = BaseRoom & {
  phase: 'lobby' | 'playing' | 'finished';
  turnSec: FlipTurnSeconds;
  first: 0 | 1; // seat playing red this game
  board: Board;
  turn: Player;
  last: number | null;
  flipped: number[];
  moves: number;
  win: Line | null;
  winner: 0 | 1 | 'draw' | null; // seat
  reason: 'five' | 'resign' | 'timeout' | 'full' | null;
  score: [number, number]; // games won, by seat
  timeouts: [number, number];
};

export type FlipRoomAction =
  | { t: 'start' }
  | { t: 'config'; turnSec?: FlipTurnSeconds }
  | { t: 'move'; at: number }
  | { t: 'resign' }
  | { t: 'timeout' };

export function createFlipRoom(host: Peer): FlipRoom {
  return {
    sid: newSid(), v: 1, seats: [{ id: host.id, name: host.name }, null] as Seat[], phase: 'lobby', deadline: 0, turnSec: 30, first: 0,
    board: emptyBoard(), turn: 1, last: null, flipped: [], moves: 0, win: null, winner: null, reason: null, score: [0, 0], timeouts: [0, 0],
  };
}

export const syncFlipSeats = (state: FlipRoom, peers: Peer[]) => syncSeats(state, peers);
/** The colour a seat plays (1 = red, first). */
export const colorOf = (state: FlipRoom, seat: number): Player => (seat === state.first ? 1 : 2);
export const seatOfColor = (state: FlipRoom, color: Player): 0 | 1 => (color === 1 ? state.first : (1 - state.first) as 0 | 1);
export const seatToMove = (state: FlipRoom) => seatOfColor(state, state.turn);

const withClock = (state: FlipRoom): FlipRoom => ({ ...state, deadline: Date.now() + state.turnSec * 1000 });

function end(state: FlipRoom, winner: FlipRoom['winner'], reason: FlipRoom['reason']): FlipRoom {
  const score: [number, number] = [state.score[0], state.score[1]];
  if (winner === 0 || winner === 1) score[winner] += 1;
  return { ...state, phase: 'finished', winner, reason, score, deadline: 0 };
}

function move(state: FlipRoom, at: number, timeouts: [number, number]): FlipRoom {
  const res = play(state.board, at, state.turn);
  const next: FlipRoom = { ...state, board: res.board, last: at, flipped: res.flipped, moves: state.moves + 1, win: res.win, timeouts };
  if (res.win) return end(next, seatOfColor(state, state.turn), 'five');
  if (isFull(res.board)) return end(next, 'draw', 'full');
  return withClock({ ...next, turn: other(state.turn) });
}

export function reduceFlipRoom(state: FlipRoom, action: FlipRoomAction, seat: number | null, isHost: boolean): FlipRoom | null {
  let next: FlipRoom | null = null;
  switch (action.t) {
    case 'config': {
      if (!isHost || state.phase === 'playing') break;
      const turnSec = action.turnSec !== undefined && (FLIP_TURN_OPTIONS as readonly number[]).includes(action.turnSec) ? action.turnSec : state.turnSec;
      next = { ...state, turnSec };
      break;
    }
    case 'start': {
      if (!isHost || state.phase === 'playing' || state.seats.some((s) => !s)) break;
      // First game: random red. Rematches: the colours swap.
      const first = (state.phase === 'lobby' ? (Math.random() < 0.5 ? 0 : 1) : 1 - state.first) as 0 | 1;
      next = withClock({ ...state, sid: newSid(), phase: 'playing', first, board: emptyBoard(), turn: 1, last: null, flipped: [], moves: 0, win: null, winner: null, reason: null, timeouts: [0, 0] });
      break;
    }
    case 'move': {
      if (state.phase !== 'playing' || seat !== seatToMove(state)) break;
      const at = action.at;
      if (!Number.isInteger(at) || at < 0 || at >= state.board.length || isForbidden(state.board, at, state.turn)) break;
      const timeouts: [number, number] = [state.timeouts[0], state.timeouts[1]];
      timeouts[seat] = 0;
      next = move(state, at, timeouts);
      break;
    }
    case 'resign':
      if (state.phase !== 'playing' || (seat !== 0 && seat !== 1)) break;
      next = end(state, (1 - seat) as 0 | 1, 'resign');
      break;
    case 'timeout': {
      if (!isHost || state.phase !== 'playing' || Date.now() < state.deadline) break;
      const late = seatToMove(state);
      const timeouts: [number, number] = [state.timeouts[0], state.timeouts[1]];
      timeouts[late] += 1;
      if (timeouts[late] >= TIMEOUT_LOSS) { next = end({ ...state, timeouts }, (1 - late) as 0 | 1, 'timeout'); break; }
      next = move(state, chooseMove(state.board, state.turn, 'normal'), timeouts);
      break;
    }
  }
  return next ? bump(next) : null;
}

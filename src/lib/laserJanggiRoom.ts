import { applyLaserAction, chooseLaserAiAction, initialLaserPieces, legalActions, type LaserAction, type LaserOwner, type LaserPiece, type LaserShot } from './laserJanggi';
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';

export const LASER_TURN_OPTIONS = [60, 30, 90] as const;
export const LASER_MAX_TURNS = 200;
export type LaserTurnSeconds = (typeof LASER_TURN_OPTIONS)[number];

export type LaserJanggiRoom = BaseRoom & {
  phase: 'lobby' | 'playing' | 'finished';
  turnSec: LaserTurnSeconds;
  first: 0 | 1;
  current: 0 | 1;
  pieces: LaserPiece[];
  winner: LaserOwner | null;
  reason: 'king' | 'resign' | 'timeout' | 'turn-limit' | null;
  shot: LaserShot | null;
  shotAt: number;
  lastAction: LaserAction | null;
  timeouts: number;
  turn: number;
};

export type LaserJanggiRoomAction =
  | { t: 'start' }
  | { t: 'config'; turnSec: LaserTurnSeconds }
  | { t: 'play'; action: LaserAction }
  | { t: 'resign' }
  | { t: 'timeout' };

export function createLaserJanggiRoom(host: Peer, turnSec: LaserTurnSeconds = 60): LaserJanggiRoom {
  return {
    sid: newSid(), v: 1, seats: [{ id: host.id, name: host.name }, null] as Seat[], phase: 'lobby', deadline: 0,
    turnSec, first: 0, current: 0, pieces: initialLaserPieces(), winner: null, reason: null, shot: null, shotAt: 0, lastAction: null, timeouts: 0, turn: 1,
  };
}

export const syncLaserJanggiSeats = (state: LaserJanggiRoom, peers: Peer[]) => syncSeats(state, peers);

function play(state: LaserJanggiRoom, action: LaserAction, timeouts: number): LaserJanggiRoom | null {
  const result = applyLaserAction(state.pieces, state.current, action);
  if (!result) return null;
  if (result.winner !== null) {
    return { ...state, pieces: result.pieces, shot: result.shot, shotAt: Date.now(), lastAction: action, winner: result.winner, reason: 'king', phase: 'finished', deadline: 0, timeouts };
  }
  if (state.turn >= LASER_MAX_TURNS) {
    return { ...state, pieces: result.pieces, shot: result.shot, shotAt: Date.now(), lastAction: action, winner: null, reason: 'turn-limit', phase: 'finished', deadline: 0, timeouts };
  }
  return {
    ...state, pieces: result.pieces, shot: result.shot, shotAt: Date.now(), lastAction: action, current: (1 - state.current) as 0 | 1,
    deadline: Date.now() + state.turnSec * 1000, timeouts, turn: state.turn + 1,
  };
}

export function reduceLaserJanggiRoom(state: LaserJanggiRoom, action: LaserJanggiRoomAction, seat: number | null, isHost: boolean): LaserJanggiRoom | null {
  let next: LaserJanggiRoom | null = null;
  switch (action.t) {
    case 'config':
      if (isHost && state.phase !== 'playing' && (LASER_TURN_OPTIONS as readonly number[]).includes(action.turnSec)) next = { ...state, turnSec: action.turnSec };
      break;
    case 'start': {
      if (!isHost || state.phase === 'playing' || state.seats.some((item) => !item)) break;
      const first = (Math.random() < 0.5 ? 0 : 1) as 0 | 1;
      next = {
        ...state, sid: newSid(), phase: 'playing', first, current: first, pieces: initialLaserPieces(), winner: null, reason: null,
        shot: null, shotAt: 0, lastAction: null, timeouts: 0, turn: 1, deadline: Date.now() + state.turnSec * 1000,
      };
      break;
    }
    case 'play':
      if (state.phase === 'playing' && seat === state.current && Date.now() >= state.shotAt + 900) next = play(state, action.action, 0);
      break;
    case 'resign':
      if (state.phase === 'playing' && (seat === 0 || seat === 1)) next = { ...state, phase: 'finished', winner: (1 - seat) as LaserOwner, reason: 'resign', deadline: 0 };
      break;
    case 'timeout': {
      if (!isHost || state.phase !== 'playing' || Date.now() < state.deadline) break;
      if (state.timeouts >= 2) {
        next = { ...state, phase: 'finished', winner: (1 - state.current) as LaserOwner, reason: 'timeout', deadline: 0 };
        break;
      }
      const fallback = chooseLaserAiAction(state.pieces, state.current, 'easy') ?? legalActions(state.pieces, state.current)[0];
      if (fallback) next = play(state, fallback, state.timeouts + 1);
      break;
    }
  }
  return next ? bump(next) : null;
}

import { type GyulCard, type Hap, GYUL_ROUNDS, dealGyulCards, hapKey, isHap, remainingHaps } from './gyulhap';
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';

export const GYUL_TURN_OPTIONS = [10, 15, 20] as const;
export type GyulTurnSeconds = (typeof GYUL_TURN_OPTIONS)[number];

export type GyulLast = { seat: number; kind: 'hap' | 'gyeol' | 'pass'; ok: boolean; picks?: Hap; round: number } | null;
export type GyulhapRoom = BaseRoom & {
  phase: 'lobby' | 'playing' | 'finished';
  /** Capacity while waiting, actual participant count after the host starts. */
  playerCount: number;
  /** Kept for the shared open-room UI. Gyul! Hap! never fills empty seats with AI. */
  ai: boolean[];
  turnSec: GyulTurnSeconds;
  round: number;
  cards: GyulCard[];
  found: string[];
  scores: number[];
  turn: number;
  winners: number[];
  reason: 'score' | 'resign' | null;
  timeouts: number[];
  last: GyulLast;
};

export type GyulhapAction =
  | { t: 'config'; turnSec?: GyulTurnSeconds }
  | { t: 'start' }
  | { t: 'hap'; picks: Hap }
  | { t: 'gyeol' }
  | { t: 'pass' }
  | { t: 'resign' }
  | { t: 'timeout' };

const clock = (state: Pick<GyulhapRoom, 'turnSec'>) => Date.now() + state.turnSec * 1000;
const nextSeat = (state: Pick<GyulhapRoom, 'playerCount'>, seat: number) => (seat + 1) % state.playerCount;

export function createGyulhapRoom(host: Peer): GyulhapRoom {
  const seats: Seat[] = [{ id: host.id, name: host.name }, null, null, null];
  return {
    sid: newSid(), v: 1, seats, phase: 'lobby', deadline: 0, playerCount: 4, ai: [false, false, false, false], turnSec: 10,
    round: 1, cards: [], found: [], scores: [0, 0, 0, 0], turn: 0, winners: [], reason: null, timeouts: [0, 0, 0, 0], last: null,
  };
}

export const syncGyulhapSeats = (state: GyulhapRoom, peers: Peer[]) => syncSeats(state, peers);

function startRoom(state: GyulhapRoom): GyulhapRoom | null {
  const occupied = state.seats.filter((seat): seat is NonNullable<Seat> => !!seat);
  if (occupied.length < 2 || occupied.length > 4) return null;
  const playerCount = occupied.length;
  const next = {
    ...state, sid: newSid(), seats: occupied, phase: 'playing' as const, playerCount, round: 1, cards: dealGyulCards(), found: [],
    scores: Array(playerCount).fill(0), turn: Math.floor(Math.random() * playerCount), winners: [], reason: null,
    timeouts: Array(playerCount).fill(0), last: null,
  };
  return { ...next, deadline: clock(next) };
}

function finishRound(state: GyulhapRoom, scores: number[], last: GyulLast): GyulhapRoom {
  if (state.round >= GYUL_ROUNDS) {
    const high = Math.max(...scores.slice(0, state.playerCount));
    const winners = scores.slice(0, state.playerCount).flatMap((score, seat) => score === high ? [seat] : []);
    return { ...state, scores, last, phase: 'finished', winners, reason: 'score', deadline: 0 };
  }
  const turn = nextSeat(state, state.turn);
  const next = { ...state, round: state.round + 1, cards: dealGyulCards(), found: [], scores, last, turn };
  return { ...next, deadline: clock(next) };
}

function act(state: GyulhapRoom, action: Extract<GyulhapAction, { t: 'hap' | 'gyeol' | 'pass' }>, seat: number): GyulhapRoom {
  const scores = [...state.scores];
  const timeouts = state.timeouts.map((n, i) => i === seat ? 0 : n);
  if (action.t === 'pass') {
    const next = { ...state, turn: nextSeat(state, seat), last: { seat, kind: 'pass', ok: true, round: state.round } as GyulLast, timeouts };
    return { ...next, deadline: clock(next) };
  }
  if (action.t === 'gyeol') {
    const ok = remainingHaps(state.cards, state.found).length === 0;
    scores[seat] += ok ? 3 : -1;
    const last: GyulLast = { seat, kind: 'gyeol', ok, round: state.round };
    if (ok) return finishRound({ ...state, timeouts }, scores, last);
    const next = { ...state, scores, turn: nextSeat(state, seat), last, timeouts };
    return { ...next, deadline: clock(next) };
  }
  const picks = [...action.picks].sort((a, b) => a - b) as Hap;
  const key = hapKey(picks);
  const inRange = new Set(picks).size === 3 && picks.every((n) => Number.isInteger(n) && n >= 0 && n < state.cards.length);
  const ok = inRange && !state.found.includes(key) && isHap(picks.map((n) => state.cards[n]));
  scores[seat] += ok ? 1 : -1;
  const next = {
    ...state, scores, found: ok ? [...state.found, key] : state.found, turn: nextSeat(state, seat),
    last: { seat, kind: 'hap', ok, picks, round: state.round } as GyulLast, timeouts,
  };
  return { ...next, deadline: clock(next) };
}

export function reduceGyulhapRoom(state: GyulhapRoom, action: GyulhapAction, seat: number | null, isHost: boolean): GyulhapRoom | null {
  let next: GyulhapRoom | null = null;
  switch (action.t) {
    case 'config':
      if (!isHost || state.phase === 'playing') break;
      next = { ...state, turnSec: action.turnSec && (GYUL_TURN_OPTIONS as readonly number[]).includes(action.turnSec) ? action.turnSec : state.turnSec };
      break;
    case 'start':
      if (!isHost || state.phase === 'playing') break;
      next = startRoom(state);
      break;
    case 'hap': case 'gyeol': case 'pass':
      if (state.phase !== 'playing' || seat === null || seat < 0 || seat >= state.playerCount || state.turn !== seat) break;
      next = act(state, action, seat);
      break;
    case 'resign':
      if (state.phase !== 'playing' || seat === null || seat < 0 || seat >= state.playerCount) break;
      next = { ...state, phase: 'finished', winners: Array.from({ length: state.playerCount }, (_, i) => i).filter((i) => i !== seat), reason: 'resign', deadline: 0 };
      break;
    case 'timeout': {
      if (!isHost || state.phase !== 'playing' || Date.now() < state.deadline) break;
      const late = state.turn;
      const timeouts = state.timeouts.map((n, i) => i === late ? n + 1 : n);
      const turn = nextSeat(state, late);
      const passed = { ...state, timeouts, turn, last: { seat: late, kind: 'pass', ok: true, round: state.round } as GyulLast };
      next = { ...passed, deadline: clock(passed) };
      break;
    }
  }
  return next ? bump(next) : null;
}

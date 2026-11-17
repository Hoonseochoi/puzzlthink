import {
  BW2_MAIN_POINTS, BW2_OVERTIME_POINTS, BW2_OVERTIME_ROUNDS, BW2_WIN_SCORE,
  type BW2Color, type BW2Round, type BW2Side, type BW2Stage,
  bw2ColorOf, bw2GaugeOf, bw2NextLeader, bw2Other, bw2ResolveRound, bw2ScoresOf, bw2StageRounds, bw2WinnerOf,
} from './blackWhite2';
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';

export const BW2_TURN_OPTIONS = [30, 45, 60] as const;
export type Bw2TurnSeconds = (typeof BW2_TURN_OPTIONS)[number];
export type Bw2FirstChoice = 'host' | 'guest' | 'random';
export const BW2_FLASH_MS = 1900;
export const BW2_HIDDEN = -1;

export type BlackWhite2Room = BaseRoom & {
  phase: 'lobby' | 'playing' | 'finished';
  stage: BW2Stage;
  turnSec: Bw2TurnSeconds;
  firstChoice: Bw2FirstChoice;
  first: BW2Side;
  rounds: BW2Round[];
  bank: [number, number];
  gauges: [number, number];
  lead: { side: BW2Side; bid: number; color: BW2Color; gaugeAfter: number } | null;
  winner: BW2Side | 'draw' | null;
  reason: 'score' | 'resign' | 'timeout' | null;
  timeouts: [number, number];
  resolvedAt: number;
};

export type BlackWhite2RoomAction =
  | { t: 'config'; turnSec?: Bw2TurnSeconds; firstChoice?: Bw2FirstChoice }
  | { t: 'start' }
  | { t: 'bid'; points: number }
  | { t: 'resign' }
  | { t: 'timeout' };

export function createBlackWhite2Room(host: Peer): BlackWhite2Room {
  return {
    sid: newSid(), v: 1, seats: [{ id: host.id, name: host.name }, null] as Seat[], phase: 'lobby', deadline: 0,
    stage: 'main', turnSec: 45, firstChoice: 'random', first: 0, rounds: [], bank: [BW2_MAIN_POINTS, BW2_MAIN_POINTS],
    gauges: [5, 5], lead: null, winner: null, reason: null, timeouts: [0, 0], resolvedAt: 0,
  };
}

export const syncBlackWhite2Seats = (state: BlackWhite2Room, peers: Peer[]) => syncSeats(state, peers);

export const seatToBid = (state: BlackWhite2Room): BW2Side => {
  const leader = bw2NextLeader(state.rounds, state.first);
  return state.lead ? bw2Other(leader) : leader;
};

function gameFinished(rounds: BW2Round[], stage: BW2Stage) {
  const scores = bw2ScoresOf(rounds);
  if (scores[0] >= BW2_WIN_SCORE || scores[1] >= BW2_WIN_SCORE) return true;
  if (stage === 'main') {
    const main = bw2StageRounds(rounds, 'main');
    return main.length >= 9 && scores[0] !== scores[1];
  }
  return bw2StageRounds(rounds, 'overtime').length >= BW2_OVERTIME_ROUNDS;
}

function bid(state: BlackWhite2Room, seat: BW2Side, points: number, timeouts: [number, number]): BlackWhite2Room {
  const now = Date.now();
  const leader = bw2NextLeader(state.rounds, state.first);
  const bank = [...state.bank] as [number, number];
  bank[seat] -= points;
  const gauges: [number, number] = [bw2GaugeOf(bank[0]), bw2GaugeOf(bank[1])];
  if (!state.lead) {
    return { ...state, bank, gauges, lead: { side: seat, bid: points, color: bw2ColorOf(points), gaugeAfter: gauges[seat] }, timeouts, deadline: now + state.turnSec * 1000 };
  }

  const rounds = [...state.rounds, bw2ResolveRound(state.stage, leader, state.lead.bid, points, bank)];
  const base = { ...state, rounds, bank, gauges, lead: null, timeouts, resolvedAt: now, deadline: now + BW2_FLASH_MS + state.turnSec * 1000 };
  if (gameFinished(rounds, state.stage)) {
    return { ...base, phase: 'finished' as const, winner: bw2WinnerOf(rounds), reason: 'score' as const, deadline: 0 };
  }

  const main = bw2StageRounds(rounds, 'main');
  const score = bw2ScoresOf(rounds);
  if (state.stage === 'main' && main.length >= 9 && score[0] === score[1]) {
    return { ...base, stage: 'overtime', bank: [BW2_OVERTIME_POINTS, BW2_OVERTIME_POINTS], gauges: [2, 2], deadline: now + BW2_FLASH_MS + state.turnSec * 1000 };
  }
  return base;
}

export function reduceBlackWhite2Room(state: BlackWhite2Room, action: BlackWhite2RoomAction, seat: number | null, isHost: boolean): BlackWhite2Room | null {
  let next: BlackWhite2Room | null = null;
  switch (action.t) {
    case 'config':
      if (!isHost || state.phase === 'playing') break;
      if (action.turnSec !== undefined && (BW2_TURN_OPTIONS as readonly number[]).includes(action.turnSec)) next = { ...state, turnSec: action.turnSec };
      if (action.firstChoice && ['host', 'guest', 'random'].includes(action.firstChoice)) next = { ...(next ?? state), firstChoice: action.firstChoice };
      break;
    case 'start': {
      if (!isHost || state.phase === 'playing' || state.seats.some((value) => !value)) break;
      const first: BW2Side = state.firstChoice === 'host' ? 0 : state.firstChoice === 'guest' ? 1 : Math.random() < 0.5 ? 0 : 1;
      next = {
        ...state, sid: newSid(), phase: 'playing', stage: 'main', first, rounds: [], bank: [BW2_MAIN_POINTS, BW2_MAIN_POINTS], gauges: [5, 5],
        lead: null, winner: null, reason: null, timeouts: [0, 0], resolvedAt: 0, deadline: Date.now() + state.turnSec * 1000,
      };
      break;
    }
    case 'bid': {
      if (state.phase !== 'playing' || (seat !== 0 && seat !== 1) || seat !== seatToBid(state)) break;
      const points = Math.floor(action.points);
      if (!Number.isFinite(points) || points < 0 || points > state.bank[seat]) break;
      next = bid(state, seat, points, state.timeouts.map((value, index) => (index === seat ? 0 : value)) as [number, number]);
      break;
    }
    case 'resign':
      if (state.phase !== 'playing' || (seat !== 0 && seat !== 1)) break;
      next = { ...state, phase: 'finished', winner: bw2Other(seat), reason: 'resign', lead: null, deadline: 0 };
      break;
    case 'timeout': {
      if (!isHost || state.phase !== 'playing' || Date.now() < state.deadline) break;
      const late = seatToBid(state);
      if (state.timeouts[late] >= 2) { next = { ...state, phase: 'finished', winner: bw2Other(late), reason: 'timeout', lead: null, deadline: 0 }; break; }
      const points = Math.floor(Math.random() * (state.bank[late] + 1));
      next = bid(state, late, points, state.timeouts.map((value, index) => (index === late ? value + 1 : value)) as [number, number]);
      break;
    }
  }
  return next ? bump(next) : null;
}

export function redactBlackWhite2(state: BlackWhite2Room): BlackWhite2Room {
  if (state.phase !== 'playing') return state;
  return {
    ...state,
    rounds: state.rounds.map((round) => ({ ...round, bids: [BW2_HIDDEN, BW2_HIDDEN] })),
    bank: [BW2_HIDDEN, BW2_HIDDEN],
    lead: state.lead ? { ...state.lead, bid: BW2_HIDDEN } : null,
  };
}

type BW2Secret = { bids: number[]; bank: number; lead: number | null };

export const blackWhite2Secret = (state: BlackWhite2Room, seat: number): BW2Secret => ({
  bids: state.rounds.map((round) => round.bids[seat]),
  bank: state.bank[seat],
  lead: state.lead?.side === seat ? state.lead.bid : null,
});

export function withBlackWhite2Secret(state: BlackWhite2Room, secret: unknown, seat: number): BlackWhite2Room {
  const value = secret as BW2Secret;
  if (state.phase !== 'playing' || !value || !Array.isArray(value.bids) || (seat !== 0 && seat !== 1)) return state;
  const bank = [...state.bank] as [number, number];
  bank[seat] = value.bank;
  return {
    ...state,
    bank,
    rounds: state.rounds.map((round, index) => ({ ...round, bids: round.bids.map((bidValue, side) => (side === seat ? value.bids[index] : bidValue)) as [number, number] })),
    lead: state.lead && state.lead.side === seat && value.lead !== null ? { ...state.lead, bid: value.lead } : state.lead,
  };
}

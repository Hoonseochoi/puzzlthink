// Shared room for 1:1 흑과 백 with a friend. Seat 0 is the host and plays side 0.
// Numbers are secret until the game ends: guests receive the state with every number blanked (-1) and get
// their own tiles end-to-end encrypted (see useRealtimeRoom's privateFor / withPrivate).
import { type BWColor, type BWRound, type Side, colorOf, handOf, isOver, nextLeader, other, resolveRound, winnerOf } from './blackWhite';
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';

export const BW_TURN_OPTIONS = [30, 15, 60] as const;
export type BwTurnSeconds = (typeof BW_TURN_OPTIONS)[number];
export const BW_FLASH_MS = 1700; // the round result stays on screen this long before the next round's clock starts
export const HIDDEN = -1;

export type BlackWhiteRoom = BaseRoom & {
  phase: 'lobby' | 'playing' | 'finished';
  turnSec: BwTurnSeconds;
  first: Side; // who leads round 1
  rounds: BWRound[];
  lead: { side: Side; tile: number; color: BWColor } | null; // this round's face-down tile
  winner: Side | 'draw' | null;
  reason: 'score' | 'resign' | 'timeout' | null;
  timeouts: [number, number]; // automatic plays in a row, by seat; three in a row loses
  resolvedAt: number; // when the last round was settled (for the result flash)
};

export type BlackWhiteRoomAction =
  | { t: 'config'; turnSec?: BwTurnSeconds }
  | { t: 'start' }
  | { t: 'play'; tile: number }
  | { t: 'resign' }
  | { t: 'timeout' };

export function createBlackWhiteRoom(host: Peer): BlackWhiteRoom {
  return {
    sid: newSid(), v: 1, seats: [{ id: host.id, name: host.name }, null] as Seat[], phase: 'lobby', deadline: 0,
    turnSec: 30, first: 0, rounds: [], lead: null, winner: null, reason: null, timeouts: [0, 0], resolvedAt: 0,
  };
}

export const syncBlackWhiteSeats = (state: BlackWhiteRoom, peers: Peer[]) => syncSeats(state, peers);

/** Seat to play now: the leader until they lay a tile, then the other player. */
export const seatToPlay = (state: BlackWhiteRoom): Side => {
  const leader = nextLeader(state.rounds, state.first);
  return state.lead ? other(leader) : leader;
};

function play(state: BlackWhiteRoom, seat: Side, tile: number, timeouts: [number, number]): BlackWhiteRoom {
  const now = Date.now();
  const leader = nextLeader(state.rounds, state.first);
  if (!state.lead) {
    return { ...state, lead: { side: seat, tile, color: colorOf(tile) }, timeouts, deadline: now + state.turnSec * 1000 };
  }
  const rounds = [...state.rounds, resolveRound(leader, state.lead.tile, tile)];
  const base = { ...state, rounds, lead: null, timeouts, resolvedAt: now, deadline: now + BW_FLASH_MS + state.turnSec * 1000 };
  return isOver(rounds) ? { ...base, phase: 'finished', winner: winnerOf(rounds), reason: 'score', deadline: 0 } : base;
}

export function reduceBlackWhiteRoom(state: BlackWhiteRoom, action: BlackWhiteRoomAction, seat: number | null, isHost: boolean): BlackWhiteRoom | null {
  let next: BlackWhiteRoom | null = null;
  switch (action.t) {
    case 'config':
      if (!isHost || state.phase === 'playing') break;
      if (action.turnSec !== undefined && (BW_TURN_OPTIONS as readonly number[]).includes(action.turnSec)) next = { ...state, turnSec: action.turnSec };
      break;
    case 'start': {
      if (!isHost || state.phase === 'playing' || state.seats.some((s) => !s)) break;
      const first: Side = Math.random() < 0.5 ? 0 : 1;
      next = { ...state, sid: newSid(), phase: 'playing', first, rounds: [], lead: null, winner: null, reason: null, timeouts: [0, 0], resolvedAt: 0, deadline: Date.now() + state.turnSec * 1000 };
      break;
    }
    case 'play': {
      if (state.phase !== 'playing' || (seat !== 0 && seat !== 1) || seat !== seatToPlay(state)) break;
      if (!handOf(state.rounds, seat, state.lead?.side === seat ? state.lead.tile : null).includes(action.tile)) break;
      next = play(state, seat, action.tile, state.timeouts.map((n, i) => (i === seat ? 0 : n)) as [number, number]);
      break;
    }
    case 'resign':
      if (state.phase !== 'playing' || (seat !== 0 && seat !== 1)) break;
      next = { ...state, phase: 'finished', winner: other(seat), reason: 'resign', lead: null, deadline: 0 };
      break;
    case 'timeout': {
      if (!isHost || state.phase !== 'playing' || Date.now() < state.deadline) break;
      const late = seatToPlay(state);
      if (state.timeouts[late] >= 2) { next = { ...state, phase: 'finished', winner: other(late), reason: 'timeout', lead: null, deadline: 0 }; break; }
      const hand = handOf(state.rounds, late);
      const tile = hand[Math.floor(Math.random() * hand.length)];
      next = play(state, late, tile, state.timeouts.map((n, i) => (i === late ? n + 1 : n)) as [number, number]);
      break;
    }
  }
  return next ? bump(next) : null;
}

/** What guests receive while the game runs: colours and results, but no numbers. */
export function redactBlackWhite(state: BlackWhiteRoom): BlackWhiteRoom {
  if (state.phase !== 'playing') return state;
  return {
    ...state,
    rounds: state.rounds.map((r) => ({ ...r, tiles: [HIDDEN, HIDDEN] })),
    lead: state.lead ? { ...state.lead, tile: HIDDEN } : null,
  };
}

type BWSecret = { tiles: number[]; lead: number | null };

/** A seat's own numbers, sent only to that seat. */
export const blackWhiteSecret = (state: BlackWhiteRoom, seat: number): BWSecret => ({
  tiles: state.rounds.map((r) => r.tiles[seat]),
  lead: state.lead?.side === seat ? state.lead.tile : null,
});

export function withBlackWhiteSecret(state: BlackWhiteRoom, secret: unknown, seat: number): BlackWhiteRoom {
  const s = secret as BWSecret;
  if (state.phase !== 'playing' || !s || !Array.isArray(s.tiles) || (seat !== 0 && seat !== 1)) return state;
  return {
    ...state,
    rounds: state.rounds.map((r, i) => (s.tiles[i] === undefined ? r : { ...r, tiles: r.tiles.map((n, j) => (j === seat ? s.tiles[i] : n)) as [number, number] })),
    lead: state.lead && state.lead.side === seat && s.lead !== null ? { ...state.lead, tile: s.lead } : state.lead,
  };
}

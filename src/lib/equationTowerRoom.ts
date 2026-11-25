// Shared room for 수식의 탑 with friends (2–4 players). Seat 0 is the host.
// Each round names a target and a height. Anyone may buzz with the number of moves they need; the others
// then get a short while to offer fewer (one offer each). The lowest offer plays it out, with that many
// moves and a clock. The first to buzz scores +1 for a tower and −1 for a miss; someone who undercut scores
// +2 or −2. The stacks stay as they are for the next round. First to the goal (7 on air) ends the game.
import { type Block, type Move, type Stacks, type TowerRound, applyMove, createBlocks, dealStacks, generateRound, legalMove, solvedStack } from './equationTower';
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';

export const EQT_MAX_PLAYERS = 4;
export const EQT_MIN_PLAYERS = 2;
export const EQT_GOAL_OPTIONS = [3, 5, 7] as const;
export const THINK_MS = 180_000; // on air 5 minutes
export const OUTBID_MS = 30_000; // on air 2 minutes
export const ACT_MS = 60_000; // on air 2 minutes
export const REVEAL_MS = 6_000;
export const MAX_BID = 9;
export const MAX_ROUNDS = 40;

export type EqtResult = { seat: number | null; ok: boolean; bid: number; delta: number; at: number };

export type EqtRoom = BaseRoom & {
  phase: 'lobby' | 'think' | 'outbid' | 'act' | 'reveal' | 'finished';
  goal: (typeof EQT_GOAL_OPTIONS)[number];
  players: number[]; // seats taking part, fixed at the start
  blocks: Block[];
  stacks: Stacks;
  round: TowerRound | null; // `par` is 0 for guests until the round is over
  index: number;
  bids: (number | null)[]; // by seat; 0 = passed
  first: number | null; // who buzzed first
  actor: number | null; // lowest offer, playing it out
  movesLeft: number;
  phaseEnd: number;
  last: EqtResult | null; // how the round went (seat null: nobody buzzed)
  scores: number[];
};

export type EqtRoomAction =
  | { t: 'config'; goal?: number }
  | { t: 'start' }
  | { t: 'bid'; n: number }
  | { t: 'pass' }
  | { t: 'move'; move: Move }
  | { t: 'next' }
  | { t: 'timeout' };

export function createEqtRoom(host: Peer): EqtRoom {
  return {
    sid: newSid(), v: 1, seats: [{ id: host.id, name: host.name }, ...Array(EQT_MAX_PLAYERS - 1).fill(null)] as Seat[],
    phase: 'lobby', deadline: 0, goal: 5, players: [], blocks: [], stacks: [[], [], []], round: null, index: 0,
    bids: Array(EQT_MAX_PLAYERS).fill(null), first: null, actor: null, movesLeft: 0, phaseEnd: 0, last: null, scores: Array(EQT_MAX_PLAYERS).fill(0),
  };
}

export const syncEqtSeats = (state: EqtRoom, peers: Peer[]) => syncSeats(state, peers);
export const eqtRanking = (state: EqtRoom) => [...state.players].sort((a, b) => state.scores[b] - state.scores[a] || a - b);
/** The lowest offer so far, or null. */
export const lowestBid = (state: EqtRoom) => {
  const offers = state.bids.filter((n): n is number => !!n);
  return offers.length ? Math.min(...offers) : null;
};

const at = (state: EqtRoom, phase: EqtRoom['phase'], ms: number): EqtRoom => {
  const end = Date.now() + ms;
  return { ...state, phase, phaseEnd: end, deadline: end };
};

const beginRound = (state: EqtRoom, index: number): EqtRoom =>
  at({ ...state, index, round: generateRound(state.stacks, state.blocks), bids: Array(EQT_MAX_PLAYERS).fill(null), first: null, actor: null, movesLeft: 0, last: null }, 'think', THINK_MS);

/** Offers are in: the lowest one (the latest, as each must beat the last) plays. */
function toAct(state: EqtRoom): EqtRoom {
  const low = lowestBid(state)!;
  const actor = state.bids.findIndex((n) => n === low);
  return at({ ...state, actor, movesLeft: low }, 'act', ACT_MS);
}

function settle(state: EqtRoom, ok: boolean): EqtRoom {
  const seat = state.actor!;
  const delta = (seat === state.first ? 1 : 2) * (ok ? 1 : -1);
  return at({ ...state, scores: state.scores.map((n, i) => (i === seat ? n + delta : n)), last: { seat, ok, bid: state.bids[seat] ?? 0, delta, at: Date.now() } }, 'reveal', REVEAL_MS);
}

export function reduceEqtRoom(state: EqtRoom, action: EqtRoomAction, seat: number | null, isHost: boolean): EqtRoom | null {
  let next: EqtRoom | null = null;
  const now = Date.now();
  const inGame = seat !== null && state.players.includes(seat);
  const busy = state.phase !== 'lobby' && state.phase !== 'finished';
  switch (action.t) {
    case 'config':
      if (!isHost || busy) break;
      next = { ...state, goal: (EQT_GOAL_OPTIONS as readonly number[]).includes(action.goal ?? -1) ? action.goal as EqtRoom['goal'] : state.goal };
      break;
    case 'start': {
      const players = state.seats.flatMap((s, i) => (s ? [i] : []));
      if (!isHost || busy || players.length < EQT_MIN_PLAYERS) break;
      const blocks = createBlocks();
      next = beginRound({ ...state, sid: newSid(), players, blocks, stacks: dealStacks(blocks), scores: Array(EQT_MAX_PLAYERS).fill(0) }, 0);
      break;
    }
    case 'bid': {
      if (!inGame || state.bids[seat!] !== null || !Number.isInteger(action.n) || action.n < 1 || action.n > MAX_BID) break;
      const low = lowestBid(state);
      if (state.phase === 'think') {
        const bids = state.bids.map((n, i) => (i === seat ? action.n : n));
        const mid: EqtRoom = { ...state, bids, first: seat };
        // One move cannot be beaten.
        next = action.n === 1 ? toAct(mid) : at(mid, 'outbid', OUTBID_MS);
      } else if (state.phase === 'outbid' && low !== null && action.n < low) {
        const mid: EqtRoom = { ...state, bids: state.bids.map((n, i) => (i === seat ? action.n : n)) };
        next = action.n === 1 || state.players.every((s) => mid.bids[s] !== null) ? toAct(mid) : { ...mid };
      }
      break;
    }
    case 'pass': {
      if (state.phase !== 'outbid' || !inGame || state.bids[seat!] !== null) break;
      const mid: EqtRoom = { ...state, bids: state.bids.map((n, i) => (i === seat ? 0 : n)) };
      next = state.players.every((s) => mid.bids[s] !== null) ? toAct(mid) : mid;
      break;
    }
    case 'move': {
      if (state.phase !== 'act' || seat !== state.actor || !state.round || !action.move || !legalMove(state.stacks, action.move)) break;
      const moved: EqtRoom = { ...state, stacks: applyMove(state.stacks, action.move), movesLeft: state.movesLeft - 1 };
      if (solvedStack(moved.stacks, moved.blocks, state.round.target, state.round.floors) >= 0) next = settle(moved, true);
      else next = moved.movesLeft <= 0 ? settle(moved, false) : moved;
      break;
    }
    case 'next':
      if (!isHost || state.phase !== 'reveal' || now < state.phaseEnd) break;
      next = state.players.some((s) => state.scores[s] >= state.goal) || state.index + 1 >= MAX_ROUNDS
        ? { ...state, phase: 'finished', deadline: 0 } : beginRound(state, state.index + 1);
      break;
    case 'timeout':
      if (!isHost || now < state.deadline) break;
      if (state.phase === 'think') next = at({ ...state, last: { seat: null, ok: false, bid: 0, delta: 0, at: now } }, 'reveal', REVEAL_MS);
      else if (state.phase === 'outbid') next = toAct(state);
      else if (state.phase === 'act') next = settle(state, false);
      break;
  }
  return next ? bump(next) : null;
}

/** Host-run step: move on once the result has been shown. */
export const eqtAutoAction = (state: EqtRoom): EqtRoomAction | null =>
  state.phase === 'reveal' && Date.now() >= state.phaseEnd ? { t: 'next' } : null;

/** Guests do not get the fewest-moves count until the round is over. */
export const redactEqtRoom = (state: EqtRoom): EqtRoom =>
  state.round && state.phase !== 'reveal' && state.phase !== 'finished' ? { ...state, round: { ...state.round, par: 0 } } : state;

import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';
import {
  type RRAction, type RussianRoulette, RR_PLAYERS,
  applyRRAction, chooseRRAction, newRussianRoulette,
} from './russianRoulette';

export type RRLevel = 'easy' | 'normal' | 'hard';
export const RR_TURN_OPTIONS = [90, 60, 30] as const;
export type RRTurnSec = (typeof RR_TURN_OPTIONS)[number] | 0;

export type RussianRouletteRoom = BaseRoom & {
  phase: 'lobby' | 'playing' | 'finished';
  ai: boolean[];
  aiLevel: RRLevel;
  turnSec: RRTurnSec;
  game: RussianRoulette;
};

export type RussianRouletteRoomAction =
  | { t: 'config'; turnSec?: RRTurnSec; aiLevel?: RRLevel }
  | { t: 'start' }
  | { t: 'act'; action: RRAction }
  | { t: 'ai' }
  | { t: 'timeout' };

export function createRussianRouletteRoom(host: Peer, opts: { solo?: boolean; aiLevel?: RRLevel } = {}): RussianRouletteRoom {
  const seats: Seat[] = Array(RR_PLAYERS).fill(null);
  seats[0] = { id: host.id, name: host.name };
  const room: RussianRouletteRoom = {
    sid: newSid(), v: 1, seats, phase: 'lobby', deadline: 0,
    ai: Array(RR_PLAYERS).fill(false), aiLevel: opts.aiLevel ?? 'normal', turnSec: opts.solo ? 0 : 60,
    game: newRussianRoulette(),
  };
  return opts.solo ? startRoom(room, false)! : room;
}

export const syncRussianRouletteSeats = (state: RussianRouletteRoom, peers: Peer[]) => syncSeats(state, peers);

function startRoom(state: RussianRouletteRoom, shuffleHumans = true): RussianRouletteRoom | null {
  let aiNumber = 0;
  let entries = state.seats.map((seat, i) => ({ seat, ai: state.ai[i] })).filter((entry) => entry.seat && !entry.ai);
  if (shuffleHumans) entries = entries.sort(() => Math.random() - 0.5);
  while (entries.length < RR_PLAYERS) entries.push({ seat: { id: `ai-${entries.length}`, name: `AI ${++aiNumber}` }, ai: true });
  const game = newRussianRoulette();
  return {
    ...state, seats: entries.map((entry) => entry.seat), ai: entries.map((entry) => entry.ai),
    phase: 'playing', game, deadline: state.turnSec ? Date.now() + state.turnSec * 1000 : Number.MAX_SAFE_INTEGER,
  };
}

function withGame(state: RussianRouletteRoom, game: RussianRoulette): RussianRouletteRoom {
  return {
    ...state, game, phase: game.phase === 'finished' ? 'finished' : 'playing',
    deadline: game.phase === 'finished' || !state.turnSec ? Number.MAX_SAFE_INTEGER : Date.now() + state.turnSec * 1000,
  };
}

export function reduceRussianRouletteRoom(state: RussianRouletteRoom, action: RussianRouletteRoomAction, seat: number | null, isHost: boolean): RussianRouletteRoom | null {
  let next: RussianRouletteRoom | null = null;
  switch (action.t) {
    case 'config':
      if (isHost && state.phase === 'lobby') next = { ...state, turnSec: action.turnSec ?? state.turnSec, aiLevel: action.aiLevel ?? state.aiLevel };
      break;
    case 'start':
      if (!isHost || state.phase === 'playing') break;
      next = startRoom(state.phase === 'finished' ? { ...state, seats: state.seats.map((value, i) => state.ai[i] ? null : value) } : state, !!state.turnSec);
      break;
    case 'act': {
      if (seat === null || state.ai[seat] || state.phase !== 'playing') break;
      const game = applyRRAction(state.game, seat, action.action);
      if (game) next = withGame(state, game);
      break;
    }
    case 'ai': {
      if (!isHost || state.phase !== 'playing' || !state.ai[state.game.turn]) break;
      const seatToAct = state.game.turn;
      const game = applyRRAction(state.game, seatToAct, chooseRRAction(state.game, seatToAct, state.aiLevel));
      if (game) next = withGame(state, game);
      break;
    }
    case 'timeout': {
      if (!isHost || state.phase !== 'playing' || !state.turnSec || Date.now() < state.deadline) break;
      const seatToAct = state.game.turn;
      const game = applyRRAction(state.game, seatToAct, chooseRRAction(state.game, seatToAct, 'easy'));
      if (game) next = withGame(state, game);
      break;
    }
  }
  return next ? bump(next) : null;
}

type RRSecret = { credits: number; manipulation: number; intel: (boolean | null)[] };

/** What every guest receives: no bullet positions, private intel or exact credits. Muzzle turns stay public. */
export function redactRussianRoulette(state: RussianRouletteRoom): RussianRouletteRoom {
  const g = state.game;
  if (g.phase === 'finished') return state;
  return {
    ...state,
    game: {
      ...g,
      chambers: Array(RR_PLAYERS).fill(false),
      credits: g.credits.map(() => 1), // exact balance and whether a player has passed stay private
      manipulation: Array(RR_PLAYERS).fill(0),
      privateIntel: g.privateIntel.map((row) => row.map(() => null)),
      log: g.log.map((e) => e.k === 'manipulate' || e.k === 'pass' ? { k: 'manipulateFund', seat: e.seat } : e),
    },
  };
}

export function russianRouletteSecret(state: RussianRouletteRoom, seat: number): RRSecret {
  const g = state.game;
  return { credits: g.credits[seat], manipulation: g.manipulation[seat], intel: g.privateIntel[seat] };
}

export function withRussianRouletteSecret(state: RussianRouletteRoom, secret: unknown, seat: number): RussianRouletteRoom {
  const s = secret as RRSecret;
  const g = state.game;
  if (g.phase === 'finished' || !s || seat < 0 || seat >= RR_PLAYERS) return state;
  const put = <T,>(list: T[], value: T) => list.map((v, i) => (i === seat ? value : v));
  return { ...state, game: { ...g, credits: put(g.credits, s.credits), manipulation: put(g.manipulation, s.manipulation), privateIntel: put(g.privateIntel, s.intel) } };
}

export function russianRouletteAutoAction(state: RussianRouletteRoom): RussianRouletteRoomAction | null {
  return state.phase === 'playing' && state.ai[state.game.turn] ? { t: 'ai' } : null;
}

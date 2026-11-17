// Shared room for 돼지 저금통 (2–4 people; empty seats go to AI players when the host starts).
// The host's browser runs the game: player actions arrive as { t: 'act' }, and the host's clock sends
// { t: 'auto' } for AI moves, time limits and reveal pauses. Guests never receive the coin counts.
import { type PbAction, type PbLevel, type PbState, PB_PLAYERS, act, autoAdvance, createPiggyBank } from './piggyBank';
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';

export type PiggyRoom = BaseRoom & {
  phase: 'lobby' | 'playing' | 'finished';
  level: PbLevel;
  game: PbState | null;
  ai: boolean[];
};

export type PiggyRoomAction =
  | { t: 'config'; level: PbLevel }
  | { t: 'start' }
  | { t: 'act'; action: PbAction }
  | { t: 'auto' };

const AI_NAMES = ['토끼', '곰', '여우'];
const isAiSeat = (seat: Seat) => !!seat && seat.id.startsWith('ai-');

export function createPiggyRoom(host: Peer): PiggyRoom {
  return {
    sid: newSid(), v: 1, seats: [{ id: host.id, name: host.name }, null, null, null] as Seat[],
    phase: 'lobby', deadline: 0, level: 'normal', game: null, ai: Array(PB_PLAYERS).fill(false),
  };
}

export const syncPiggySeats = (state: PiggyRoom, peers: Peer[]) => syncSeats(state, peers);

export function reducePiggyRoom(state: PiggyRoom, action: PiggyRoomAction, seat: number | null, isHost: boolean): PiggyRoom | null {
  let next: PiggyRoom | null = null;
  switch (action.t) {
    case 'config':
      if (isHost && state.phase !== 'playing' && ['easy', 'normal', 'hard'].includes(action.level)) next = { ...state, level: action.level };
      break;
    case 'start': {
      if (!isHost || state.phase === 'playing') break;
      // People keep their seats (AI stand-ins from the last game leave); empty seats get AI players.
      let n = 0;
      const seats = state.seats.map((s, i) => (s && !isAiSeat(s) ? s : { id: `ai-${i}`, name: AI_NAMES[n++] ?? `AI ${n}` }));
      const ai = seats.map(isAiSeat);
      next = { ...state, sid: newSid(), phase: 'playing', seats, ai, game: createPiggyBank(seats.map((s) => s!.name), ai, state.level) };
      break;
    }
    case 'act': {
      if (state.phase !== 'playing' || !state.game || seat === null || state.ai[seat]) break;
      const game = act(state.game, seat, action.action);
      if (game) next = { ...state, game, phase: game.phase === 'finished' ? 'finished' : 'playing' };
      break;
    }
    case 'auto': {
      if (!isHost || !state.game || state.game.phase === 'finished') break;
      const game = autoAdvance(state.game);
      if (game) next = { ...state, game, phase: game.phase === 'finished' ? 'finished' : 'playing' };
      break;
    }
  }
  return next ? bump(next) : null;
}

/** Guests see labels and public events, not how many coins each pig holds, nor the AI memories. */
export function redactPiggy(state: PiggyRoom): PiggyRoom {
  if (!state.game || state.game.phase === 'finished') return state;
  const pigs = Object.fromEntries(Object.entries(state.game.pigs).map(([id, p]) => [id, { ...p, black: -1, white: -1 }]));
  return { ...state, game: { ...state.game, pigs, mem: [], log: [] } }; // the history would give the counts away
}

/** Host clock: one AI move or time limit per tick, while a game runs. */
export const piggyAutoAction = (state: PiggyRoom): PiggyRoomAction | null => (state.phase === 'playing' ? { t: 'auto' } : null);

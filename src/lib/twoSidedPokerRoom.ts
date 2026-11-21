// 양면포커 friend/open room: the host's browser runs the same rules as the AI game (src/lib/twoSidedPoker.ts),
// seat 0 is the host and seat 1 the guest. Guests receive a redacted copy: the host's back stays hidden until a
// showdown shows it, and the shoe order is never sent.
import { type TspAction, type TspCard, type TspRound, type TspSide, type TspState, applyTspAction, newTspGame, startTspHand, tspOther } from './twoSidedPoker';
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';

export const TSP_TURN_OPTIONS = [30, 20, 45] as const;
export type TspTurnSeconds = (typeof TSP_TURN_OPTIONS)[number];
export const TSP_REVEAL_MS = 3800; // the showdown stays up this long before the next hand is dealt
export const TSP_MAX_TIMEOUTS = 3; // the third missed turn in a row loses the match

export type TspRoom = BaseRoom & {
  phase: 'lobby' | 'bet' | 'reveal' | 'finished';
  turnSec: TspTurnSeconds;
  game: TspState | null;
  winner: TspSide | null;
  reason: 'chips' | 'resign' | 'timeout' | null;
  timeouts: [number, number];
};

export type TspRoomAction =
  | { t: 'config'; turnSec: TspTurnSeconds }
  | { t: 'start' }
  | { t: 'act'; action: TspAction }
  | { t: 'resign' }
  | { t: 'timeout' };

export function createTspRoom(host: Peer): TspRoom {
  const seats: Seat[] = [{ id: host.id, name: host.name }, null];
  return { sid: newSid(), v: 1, seats, phase: 'lobby', deadline: 0, turnSec: 30, game: null, winner: null, reason: null, timeouts: [0, 0] };
}

export const syncTspSeats = (state: TspRoom, peers: Peer[]) => syncSeats(state, peers);

/** Room phase and clock that follow a game state. */
function follow(state: TspRoom, game: TspState): TspRoom {
  if (game.phase === 'finished') return { ...state, game, phase: 'finished', winner: game.winner, reason: 'chips', deadline: 0 };
  if (game.phase === 'reveal') return { ...state, game, phase: 'reveal', deadline: Date.now() + TSP_REVEAL_MS };
  return { ...state, game, phase: 'bet', deadline: Date.now() + state.turnSec * 1000 };
}

export function reduceTspRoom(state: TspRoom, action: TspRoomAction, seat: number | null, isHost: boolean): TspRoom | null {
  let next: TspRoom | null = null;
  const g = state.game;
  switch (action.t) {
    case 'config':
      if (!isHost || state.phase === 'bet' || state.phase === 'reveal' || !(TSP_TURN_OPTIONS as readonly number[]).includes(action.turnSec)) break;
      next = { ...state, turnSec: action.turnSec };
      break;
    case 'start':
      if (!isHost || state.phase === 'bet' || state.phase === 'reveal' || state.seats.some((s) => !s)) break;
      next = follow({ ...state, sid: newSid(), winner: null, reason: null, timeouts: [0, 0] }, newTspGame('normal'));
      break;
    case 'act': {
      if (!g || state.phase !== 'bet' || (seat !== 0 && seat !== 1) || g.turn !== seat) break;
      const played = applyTspAction(g, seat, action.action);
      if (played === g) break;
      const timeouts: [number, number] = [...state.timeouts];
      timeouts[seat] = 0;
      next = follow({ ...state, timeouts }, played);
      break;
    }
    case 'resign':
      if ((state.phase !== 'bet' && state.phase !== 'reveal') || (seat !== 0 && seat !== 1)) break;
      next = { ...state, phase: 'finished', winner: tspOther(seat), reason: 'resign', deadline: 0 };
      break;
    case 'timeout':
      if (!isHost || !g || Date.now() < state.deadline) break;
      if (state.phase === 'reveal') { next = follow(state, startTspHand(g)); break; }
      if (state.phase !== 'bet') break;
      {
        const late = g.turn;
        const timeouts: [number, number] = [...state.timeouts];
        timeouts[late] += 1;
        next = timeouts[late] >= TSP_MAX_TIMEOUTS
          ? { ...state, timeouts, phase: 'finished', winner: tspOther(late), reason: 'timeout', deadline: 0 }
          : follow({ ...state, timeouts }, applyTspAction(g, late, { t: 'fold' }));
      }
      break;
  }
  return next ? bump(next) : null;
}

const hideBack = (c: TspCard): TspCard => ({ front: c.front, back: 0 });

/** What the guest (seat 1) receives: no host back before a showdown, no folded host backs, no shoe order. */
export function redactTspRoom(state: TspRoom): TspRoom {
  const g = state.game;
  if (!g) return state;
  const last = g.rounds.at(-1);
  const shown = g.phase !== 'bet' && last?.reason === 'showdown';
  const rounds: TspRound[] = g.rounds.map((r) => (r.reason === 'fold' ? { ...r, cards: [hideBack(r.cards[0]), r.cards[1]] } : r));
  return {
    ...state,
    game: { ...g, cards: shown ? g.cards : [hideBack(g.cards[0]), g.cards[1]], rounds, shoe: g.shoe.map(() => ({ front: 0, back: 0 })) },
  };
}

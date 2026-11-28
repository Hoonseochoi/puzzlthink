// Shared room for 1:1 뒤집기 오목 with a friend. Seat 0 is the host.
// One game per match: red (first) is drawn at random for the first game, then swaps on every rematch.
// Each turn has a clock; when it runs out a legal move is played for you (never spending a 뒤집기), and three in a row
// lose the game.
//
// Rules versions (FLIP_RULES_VERSION in flipOmok.ts). The host's browser runs the rules, so old and new pages can meet:
// - a room state without `rules` comes from a host whose page still has the old rules (automatic flips). A new guest
//   then plays that game the old way (it sends plain moves, shows a notice and no 뒤집기 choice; see the room view);
//   once that host refreshes, its page upgrades the room (`upgrade`, run by the host on its own) and play continues
//   under the new rules, with 3 뒤집기 each and every flipped stone locked.
// - a move without `rv` comes from a guest whose page is old: the host plays it as a quiet move (legal under the new
//   rules, so nothing desyncs) and tags that player's name with 🔄새로고침, which the old page does show. A new page
//   says `ver` when it joins, which clears the tag.
import { FLIP_RULES_VERSION, chooseMove, emptyBoard, fullCharges, isFull, isLegal, other, play, type Board, type Charges, type Line, type Player } from './flipOmok';
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
  rules?: number; // FLIP_RULES_VERSION of the host page that runs the room (missing: the old automatic-flip rules)
  charges?: Charges; // 뒤집기 left, by colour (rules 2)
  stale?: string[]; // client ids seen sending moves from an old page (their names get a refresh tag)
  rulesMove?: number; // `moves` as of the last move a current host played: an old host (after a handoff) leaves it behind
};

export type FlipRoomAction =
  | { t: 'start' }
  | { t: 'config'; turnSec?: FlipTurnSeconds }
  | { t: 'move'; at: number; flip?: boolean; rv?: number }
  | { t: 'ver'; rv: number }
  | { t: 'upgrade' }
  | { t: 'resign' }
  | { t: 'timeout' };

export function createFlipRoom(host: Peer): FlipRoom {
  return {
    sid: newSid(), v: 1, seats: [{ id: host.id, name: host.name }, null] as Seat[], phase: 'lobby', deadline: 0, turnSec: 30, first: 0,
    board: emptyBoard(), turn: 1, last: null, flipped: [], moves: 0, win: null, winner: null, reason: null, score: [0, 0], timeouts: [0, 0],
    rules: FLIP_RULES_VERSION, charges: fullCharges(), stale: [],
  };
}

/** Whether this room runs the current rules (a new page can play it fully). */
export const isCurrentRules = (state: FlipRoom) => state.rules === FLIP_RULES_VERSION;
/**
 * What a page should show: whether the browser running this room plays the current rules. A state carried over by an
 * old page (a host handoff to an old page keeps our fields but not their upkeep) gives itself away by `rulesMove`.
 */
export const hostIsCurrent = (state: FlipRoom) => isCurrentRules(state) && (state.moves === 0 || state.rulesMove === state.moves);
/** 뒤집기 left in a room (an old room has none). */
export const roomCharges = (state: FlipRoom): Charges => state.charges ?? [0, 0, 0];

export const STALE_TAG = '🔄새로고침 ';
const untag = (seat: Seat) => (seat && seat.name.startsWith(STALE_TAG) ? { ...seat, name: seat.name.slice(STALE_TAG.length) } : seat);
const tagSeats = (seats: Seat[], stale: string[]) => seats.map((seat) => (seat && stale.includes(seat.id) ? { ...seat, name: `${STALE_TAG}${seat.name}` } : seat));

/** Seats follow presence (see room.ts), with the refresh tag on players whose page is old. */
export function syncFlipSeats(state: FlipRoom, peers: Peer[]): FlipRoom {
  const synced = syncSeats({ ...state, seats: state.seats.map(untag) }, peers);
  const seats = tagSeats(synced.seats, state.stale ?? []);
  return JSON.stringify(seats) === JSON.stringify(state.seats) ? state : bump({ ...synced, seats });
}

/** A room saved or taken over from an old host, brought to the current rules (an unfinished game goes on from here). */
function upgraded(state: FlipRoom): FlipRoom {
  return { ...state, rules: FLIP_RULES_VERSION, charges: state.charges ?? fullCharges(), stale: state.stale ?? [], rulesMove: state.moves };
}

/** Host: upgrade an old room by itself (restored from an old save, or taken over from an old host). */
export const flipAutoAction = (state: FlipRoom): FlipRoomAction | null => (hostIsCurrent(state) ? null : { t: 'upgrade' });
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

function move(state: FlipRoom, at: number, flip: boolean, timeouts: [number, number]): FlipRoom {
  const res = play(state.board, at, state.turn, flip);
  const charges = [...roomCharges(state)] as Charges;
  if (flip) charges[state.turn]--;
  const next: FlipRoom = { ...state, board: res.board, last: at, flipped: res.flipped, moves: state.moves + 1, win: res.win, timeouts, charges, rulesMove: state.moves + 1 };
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
      next = withClock({ ...state, sid: newSid(), phase: 'playing', first, board: emptyBoard(), turn: 1, last: null, flipped: [], moves: 0, win: null, winner: null, reason: null, timeouts: [0, 0], charges: fullCharges(), rules: FLIP_RULES_VERSION });
      break;
    }
    case 'upgrade':
      if (!isHost || hostIsCurrent(state)) break;
      next = upgraded(state);
      break;
    case 'ver': {
      // A player's page is current: drop their refresh tag.
      const id = seat !== null ? state.seats[seat]?.id : undefined;
      if (!id || action.rv !== FLIP_RULES_VERSION || !(state.stale ?? []).includes(id)) break;
      const stale = (state.stale ?? []).filter((s) => s !== id);
      next = { ...state, stale, seats: state.seats.map((s) => (s?.id === id ? untag(s) : s)) };
      break;
    }
    case 'move': {
      if (state.phase !== 'playing' || seat !== seatToMove(state) || !hostIsCurrent(state)) break;
      // An old page sends no `rv` and knows nothing of 뒤집기: its move is played quietly and its player tagged.
      const old = action.rv !== FLIP_RULES_VERSION;
      const flip = !old && action.flip === true;
      if (!isLegal(state.board, { at: action.at, flip }, state.turn, roomCharges(state))) break;
      const timeouts: [number, number] = [state.timeouts[0], state.timeouts[1]];
      timeouts[seat] = 0;
      const id = state.seats[seat]?.id;
      let base = state;
      if (old && id && !(state.stale ?? []).includes(id)) {
        const stale = [...(state.stale ?? []), id];
        base = { ...state, stale, seats: tagSeats(state.seats.map(untag), stale) };
      }
      next = move(base, action.at, flip, timeouts);
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
      // The move played for a late player never spends their 뒤집기.
      const charges = [...roomCharges(state)] as Charges;
      charges[state.turn] = 0;
      next = move(state, chooseMove(state.board, state.turn, charges, 'normal').at, false, timeouts);
      break;
    }
  }
  return next ? bump(next) : null;
}

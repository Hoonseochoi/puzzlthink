// 마슈 · 노노그램 … friend / open rooms: 2–4 players (마방진 스왑: 2–6) race on the same board; the first correct answer wins.
// The host checks every claimed answer against the board built from the shared seed.
import { type LogicGameId, LOGIC, buildBoard, decodeMarks, newSeed, solved } from './logicPuzzles';
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';

export type LogicRoom = BaseRoom & {
  game: LogicGameId;
  phase: 'lobby' | 'playing' | 'finished';
  /** Capacity while waiting, actual participant count after the host starts. */
  playerCount: number;
  /** Kept for the shared open-room UI; these games have no AI seats. */
  ai: boolean[];
  size: number;
  seed: number;
  startedAt: number;
  /** Lines drawn / cells filled so far (progress only; the work itself stays private). */
  progress: number[];
  /** Time each player solved in (ms), or null. */
  solvedMs: (number | null)[];
  gaveUp: boolean[];
  winners: number[];
};

export type LogicAction =
  | { t: 'config'; size: number }
  | { t: 'start' }
  | { t: 'progress'; n: number }
  | { t: 'solve'; answer: string }
  | { t: 'giveUp' }
  | { t: 'noop' };

export function createLogicRoom(game: LogicGameId, host: Peer): LogicRoom {
  const spec = LOGIC[game];
  const max = maxPlayers(game);
  const seats: Seat[] = [{ id: host.id, name: host.name }, ...Array<Seat>(max - 1).fill(null)];
  return {
    game, sid: newSid(), v: 1, seats, phase: 'lobby', deadline: 0, playerCount: max, ai: Array(max).fill(false),
    size: spec.roomSizes[1], seed: 0, startedAt: 0, progress: Array(max).fill(0), solvedMs: Array(max).fill(null), gaveUp: Array(max).fill(false), winners: [],
  };
}

/** Most players in a room of this game (마방진 스왑 takes 6, the others 4). */
export const maxPlayers = (game: LogicGameId) => LOGIC[game].maxPlayers ?? 4;

export const syncLogicSeats = (state: LogicRoom, peers: Peer[]) => syncSeats(state, peers);
export const roomBoard = (state: Pick<LogicRoom, 'game' | 'size' | 'seed'>) => buildBoard(state.game, state.size, state.seed);

function startRoom(state: LogicRoom): LogicRoom | null {
  const occupied = state.seats.filter((seat): seat is NonNullable<Seat> => !!seat);
  if (occupied.length < 2 || occupied.length > maxPlayers(state.game)) return null;
  const n = occupied.length;
  return {
    ...state, sid: newSid(), seats: occupied, phase: 'playing', playerCount: n, seed: newSeed(), startedAt: Date.now(),
    progress: Array(n).fill(0), solvedMs: Array(n).fill(null), gaveUp: Array(n).fill(false), winners: [],
  };
}

export function reduceLogicRoom(state: LogicRoom, action: LogicAction, seat: number | null, isHost: boolean): LogicRoom | null {
  let next: LogicRoom | null = null;
  const playing = state.phase === 'playing' && seat !== null && seat >= 0 && seat < state.playerCount && state.solvedMs[seat] === null && !state.gaveUp[seat];
  switch (action.t) {
    case 'config':
      if (!isHost || state.phase === 'playing' || !LOGIC[state.game].roomSizes.includes(action.size)) break;
      next = { ...state, size: action.size };
      break;
    case 'start':
      if (!isHost || state.phase === 'playing') break;
      next = startRoom(state);
      break;
    case 'progress':
      if (!playing || !Number.isInteger(action.n) || action.n < 0 || action.n > 400) break;
      next = { ...state, progress: state.progress.map((n, i) => (i === seat ? action.n : n)) };
      break;
    case 'solve': {
      if (!playing || typeof action.answer !== 'string' || action.answer.length > 1000) break;
      const marks = decodeMarks(action.answer);
      if (!solved(roomBoard(state), marks)) break;
      const ms = Date.now() - state.startedAt;
      next = { ...state, solvedMs: state.solvedMs.map((v, i) => (i === seat ? ms : v)), phase: 'finished', winners: [seat!] };
      break;
    }
    case 'giveUp': {
      if (!playing) break;
      const gaveUp = state.gaveUp.map((g, i) => g || i === seat);
      const left = Array.from({ length: state.playerCount }, (_, i) => i).filter((i) => !gaveUp[i]);
      next = left.length <= 1 ? { ...state, gaveUp, phase: 'finished', winners: left } : { ...state, gaveUp };
      break;
    }
  }
  return next ? bump(next) : null;
}

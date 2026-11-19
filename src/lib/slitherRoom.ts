// 슬리더링크 friend / open rooms: 2–4 players race on the same board; the first correct loop wins.
// The host checks every claimed solution against the board built from the shared seed.
import { type Puzzle, generatePuzzle, isSolved, newSeed } from './slitherlink';
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';

export const ROOM_SIZES = [9, 10, 11] as const;
export type RoomSize = (typeof ROOM_SIZES)[number];

export type SlitherRoom = BaseRoom & {
  phase: 'lobby' | 'playing' | 'finished';
  /** Capacity while waiting, actual participant count after the host starts. */
  playerCount: number;
  /** Kept for the shared open-room UI; this game has no AI seats. */
  ai: boolean[];
  dots: RoomSize;
  seed: number;
  startedAt: number;
  /** Lines each player has drawn so far (progress only; the lines themselves stay private). */
  lines: number[];
  /** Time each player solved in (ms), or null. */
  solvedMs: (number | null)[];
  gaveUp: boolean[];
  winners: number[];
};

export type SlitherAction =
  | { t: 'config'; dots: RoomSize }
  | { t: 'start' }
  | { t: 'progress'; lines: number }
  | { t: 'solve'; edges: number[] }
  | { t: 'giveUp' }
  | { t: 'noop' };

export function createSlitherRoom(host: Peer): SlitherRoom {
  const seats: Seat[] = [{ id: host.id, name: host.name }, null, null, null];
  return {
    sid: newSid(), v: 1, seats, phase: 'lobby', deadline: 0, playerCount: 4, ai: [false, false, false, false],
    dots: 11, seed: 0, startedAt: 0, lines: [0, 0, 0, 0], solvedMs: [null, null, null, null], gaveUp: [false, false, false, false], winners: [],
  };
}

export const syncSlitherSeats = (state: SlitherRoom, peers: Peer[]) => syncSeats(state, peers);

let cache: { key: string; puzzle: Puzzle } | null = null;
/** The room's board (built once per seed). */
export function roomPuzzle(state: Pick<SlitherRoom, 'dots' | 'seed'>): Puzzle {
  const key = `${state.dots}-${state.seed}`;
  if (cache?.key !== key) cache = { key, puzzle: generatePuzzle(state.dots, state.seed) };
  return cache.puzzle;
}

function startRoom(state: SlitherRoom): SlitherRoom | null {
  const occupied = state.seats.filter((seat): seat is NonNullable<Seat> => !!seat);
  if (occupied.length < 2 || occupied.length > 4) return null;
  const n = occupied.length;
  return {
    ...state, sid: newSid(), seats: occupied, phase: 'playing', playerCount: n, seed: newSeed(), startedAt: Date.now(),
    lines: Array(n).fill(0), solvedMs: Array(n).fill(null), gaveUp: Array(n).fill(false), winners: [],
  };
}

export function reduceSlitherRoom(state: SlitherRoom, action: SlitherAction, seat: number | null, isHost: boolean): SlitherRoom | null {
  let next: SlitherRoom | null = null;
  const playing = state.phase === 'playing' && seat !== null && seat >= 0 && seat < state.playerCount && state.solvedMs[seat] === null && !state.gaveUp[seat];
  switch (action.t) {
    case 'config':
      if (!isHost || state.phase === 'playing' || !(ROOM_SIZES as readonly number[]).includes(action.dots)) break;
      next = { ...state, dots: action.dots };
      break;
    case 'start':
      if (!isHost || state.phase === 'playing') break;
      next = startRoom(state);
      break;
    case 'progress':
      if (!playing || !Number.isInteger(action.lines) || action.lines < 0 || action.lines > 400) break;
      next = { ...state, lines: state.lines.map((n, i) => (i === seat ? action.lines : n)) };
      break;
    case 'solve': {
      if (!playing || !Array.isArray(action.edges) || action.edges.length > 400) break;
      const puzzle = roomPuzzle(state);
      const marks = new Array<number>(puzzle.solution.length).fill(0);
      for (const e of action.edges) if (Number.isInteger(e) && e >= 0 && e < marks.length) marks[e] = 1;
      if (!isSolved(puzzle, marks)) break;
      const ms = Date.now() - state.startedAt;
      // First correct loop wins and ends the race.
      next = { ...state, solvedMs: state.solvedMs.map((v, i) => (i === seat ? ms : v)), lines: state.lines.map((n, i) => (i === seat ? action.edges.length : n)), phase: 'finished', winners: [seat!] };
      break;
    }
    case 'giveUp': {
      if (!playing) break;
      const gaveUp = state.gaveUp.map((g, i) => g || i === seat);
      const left = Array.from({ length: state.playerCount }, (_, i) => i).filter((i) => !gaveUp[i]);
      // Everyone else gave up: the last one standing wins.
      next = left.length <= 1 ? { ...state, gaveUp, phase: 'finished', winners: left } : { ...state, gaveUp };
      break;
    }
  }
  return next ? bump(next) : null;
}

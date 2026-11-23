// Friend room for 2048 (2–4 players). Seat 0 is the host.
// Everyone plays their own board from the same seed, at the same time, for 5 or 10 minutes.
// Each browser runs its own game and sends a snapshot of its board after moves; the host keeps the snapshots
// and broadcasts them so everyone sees the others' boards small beside their own.
// Ranking: biggest block first, then score. A stuck board stops early (its snapshot stays as it is).
import { cells, maxTile, newGame, randomSeed } from './merge2048';
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';

export const M2_MAX_PLAYERS = 4;
export const M2_MIN_PLAYERS = 2;
export const M2_MINUTE_OPTIONS = [5, 10] as const;
export type M2Minutes = (typeof M2_MINUTE_OPTIONS)[number];
export const COUNTDOWN_MS = 3500;
const GRACE_MS = 2500; // a snapshot sent just before the bell still counts

export type M2Snap = { cells: number[]; score: number; max: number; moves: number; over: boolean };

export type M2Room = BaseRoom & {
  phase: 'lobby' | 'playing' | 'finished';
  minutes: M2Minutes;
  seed: number;
  startAt: number; // moves count from here (after the countdown)
  endAt: number;
  players: number[]; // seats taking part, fixed at the start
  snaps: (M2Snap | null)[]; // by seat
};

export type M2Action =
  | { t: 'config'; minutes?: number }
  | { t: 'start' }
  | { t: 'snap'; snap: M2Snap }
  | { t: 'timeout' }
  | { t: 'end' };

export function createM2Room(host: Peer): M2Room {
  return {
    sid: newSid(), v: 1, seats: [{ id: host.id, name: host.name }, ...Array(M2_MAX_PLAYERS - 1).fill(null)] as Seat[],
    phase: 'lobby', deadline: 0, minutes: 5, seed: 0, startAt: 0, endAt: 0, players: [], snaps: Array(M2_MAX_PLAYERS).fill(null),
  };
}

export const syncM2Seats = (state: M2Room, peers: Peer[]) => syncSeats(state, peers);

export const snapOf = (game: Parameters<typeof cells>[0] & { score: number; moves: number; over: boolean }): M2Snap =>
  ({ cells: cells(game), score: game.score, max: maxTile(game), moves: game.moves, over: game.over });

const isPow2 = (n: number) => n === 0 || (Number.isInteger(n) && n >= 2 && n <= 131072 && (n & (n - 1)) === 0);
function cleanSnap(raw: unknown): M2Snap | null {
  const s = raw as M2Snap;
  if (!s || !Array.isArray(s.cells) || s.cells.length !== 16 || !s.cells.every(isPow2)) return null;
  if (!Number.isFinite(s.score) || s.score < 0 || !Number.isInteger(s.moves) || s.moves < 0) return null;
  return { cells: s.cells.slice(), score: Math.floor(s.score), max: Math.max(...s.cells), moves: s.moves, over: !!s.over };
}

/** Final order: biggest block, then score (ties keep seat order). */
export const m2Ranking = (state: M2Room) => [...state.players].sort((a, b) => {
  const x = state.snaps[a], y = state.snaps[b];
  return (y?.max ?? 0) - (x?.max ?? 0) || (y?.score ?? 0) - (x?.score ?? 0) || a - b;
});

/** A seat's place (1-based); seats level on block and score share it. */
export function m2Place(state: M2Room, seat: number): number {
  const me = state.snaps[seat];
  return 1 + state.players.filter((s) => {
    const o = state.snaps[s];
    return s !== seat && o && me && (o.max > me.max || (o.max === me.max && o.score > me.score));
  }).length;
}

export function m2Outcome(state: M2Room, seat: number): 'win' | 'loss' | 'draw' {
  if (m2Place(state, seat) > 1) return 'loss';
  const me = state.snaps[seat];
  const shared = state.players.some((s) => s !== seat && state.snaps[s]?.max === me?.max && state.snaps[s]?.score === me?.score);
  return shared ? 'draw' : 'win';
}

const allDone = (state: M2Room) => state.players.every((s) => state.snaps[s]?.over);
const finish = (state: M2Room): M2Room => ({ ...state, phase: 'finished', deadline: 0 });

export function reduceM2Room(state: M2Room, action: M2Action, seat: number | null, isHost: boolean): M2Room | null {
  let next: M2Room | null = null;
  const now = Date.now();
  switch (action.t) {
    case 'config':
      if (!isHost || state.phase === 'playing') break;
      if ((M2_MINUTE_OPTIONS as readonly number[]).includes(action.minutes ?? -1)) next = { ...state, minutes: action.minutes as M2Minutes };
      break;
    case 'start': {
      const players = state.seats.flatMap((s, i) => (s ? [i] : []));
      if (!isHost || state.phase === 'playing' || players.length < M2_MIN_PLAYERS) break;
      const seed = randomSeed();
      const first = snapOf(newGame(seed));
      const startAt = now + COUNTDOWN_MS;
      const endAt = startAt + state.minutes * 60_000;
      next = {
        ...state, sid: newSid(), phase: 'playing', seed, startAt, endAt, deadline: endAt + GRACE_MS, players,
        snaps: state.seats.map((_, i) => (players.includes(i) ? first : null)),
      };
      break;
    }
    case 'snap': {
      if (state.phase !== 'playing' || seat === null || !state.players.includes(seat) || now > state.endAt + GRACE_MS) break;
      if (state.snaps[seat]?.over) break;
      const snap = cleanSnap(action.snap);
      if (!snap || snap.moves < (state.snaps[seat]?.moves ?? 0)) break;
      const snaps = state.snaps.map((s, i) => (i === seat ? snap : s));
      next = { ...state, snaps };
      if (allDone(next)) next = finish(next);
      break;
    }
    case 'timeout':
      if (!isHost || state.phase !== 'playing' || now < state.endAt + GRACE_MS) break;
      next = finish(state);
      break;
    case 'end':
      if (!isHost || state.phase !== 'playing' || !allDone(state)) break;
      next = finish(state);
      break;
  }
  return next ? bump(next) : null;
}

export const m2AutoAction = (state: M2Room): M2Action | null => (state.phase === 'playing' && allDone(state) ? { t: 'end' } : null);

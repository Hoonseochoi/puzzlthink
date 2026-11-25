// AI stand-in for friend rooms with AI seats (Heavy13, Russian roulette).
// A player who is disconnected for AWAY_AFTER_MS, or lets MISSES_FOR_AWAY turns in a row time out, is
// marked away: their seat keeps their name but the AI plays it, so the table keeps going. When they come
// back they press "rejoin" and get the seat back. The host's browser runs the room; if the host leaves, a guest
// takes over as host (useRealtimeRoom) and the old host's seat is handled like any other away player.
import type { BaseRoom, Peer } from './room';

export const AWAY_AFTER_MS = 20_000;
export const MISSES_FOR_AWAY = 2;

export type AwayFields = {
  ai: boolean[];
  away?: boolean[]; // human seats the AI is playing for now
  offlineSince?: (number | null)[]; // when a human seat dropped off presence (playing only)
  misses?: number[]; // turns in a row that timed out, by seat
  awayEvent?: { seat: number; back: boolean; at: number } | null; // latest take-over / return, for notices
};
type Room = BaseRoom & AwayFields;

const filled = <T,>(n: number, value: T) => Array<T>(n).fill(value);
const listOf = <T,>(list: T[] | undefined, n: number, value: T) => (list && list.length === n ? list : filled(n, value));

/** Fresh away bookkeeping for a new game. */
export const resetAway = (n: number): Required<Omit<AwayFields, 'ai' | 'awayEvent'>> & { awayEvent: null } =>
  ({ away: filled(n, false), offlineSince: filled<number | null>(n, null), misses: filled(n, 0), awayEvent: null });

/** On a presence change while playing: note when each human seat went offline (and clear it on return). */
export function trackPresence<S extends Room>(state: S, peers: Peer[]): S {
  if (state.phase !== 'playing') return state;
  const n = state.seats.length;
  const online = new Set(peers.map((p) => p.id));
  const prev = listOf(state.offlineSince, n, null);
  const now = Date.now();
  const next = state.seats.map((seat, i) => (!seat || state.ai[i] ? null : online.has(seat.id) ? null : prev[i] ?? now));
  return next.every((v, i) => v === prev[i]) ? state : { ...state, offlineSince: next, v: state.v + 1 };
}

/** A human seat that has been offline long enough to hand to the AI, if any. */
export function seatDueForAway(state: Room): number | null {
  if (state.phase !== 'playing' || !state.offlineSince) return null;
  const now = Date.now();
  const i = state.offlineSince.findIndex((since, s) => since !== null && !state.ai[s] && now - since >= AWAY_AFTER_MS);
  return i < 0 ? null : i;
}

export function takeOver<S extends Room>(state: S, seat: number): S {
  const n = state.seats.length;
  const put = <T,>(list: T[] | undefined, fill: T, value: T) => listOf(list, n, fill).map((v, i) => (i === seat ? value : v));
  return {
    ...state, ai: state.ai.map((v, i) => (i === seat ? true : v)),
    away: put(state.away, false, true), offlineSince: put<number | null>(state.offlineSince, null, null), misses: put(state.misses, 0, 0),
    awayEvent: { seat, back: false, at: Date.now() },
  };
}

export function giveBack<S extends Room>(state: S, seat: number): S | null {
  if (!state.away?.[seat]) return null;
  const n = state.seats.length;
  const put = <T,>(list: T[] | undefined, fill: T, value: T) => listOf(list, n, fill).map((v, i) => (i === seat ? value : v));
  return {
    ...state, ai: state.ai.map((v, i) => (i === seat ? false : v)),
    away: put(state.away, false, false), offlineSince: put<number | null>(state.offlineSince, null, null), misses: put(state.misses, 0, 0),
    awayEvent: { seat, back: true, at: Date.now() },
  };
}

/** A human's turn timed out: count it; on the second in a row the AI takes the seat. */
export function noteMiss<S extends Room>(state: S, seat: number): S {
  if (state.ai[seat] || !state.seats[seat]) return state;
  const misses = listOf(state.misses, state.seats.length, 0).map((v, i) => (i === seat ? v + 1 : v));
  const counted = { ...state, misses };
  return misses[seat] >= MISSES_FOR_AWAY ? takeOver(counted, seat) : counted;
}

/** The player acted themselves: their miss streak starts over. */
export function clearMiss<S extends Room>(state: S, seat: number): S {
  if (!state.misses?.[seat]) return state;
  return { ...state, misses: state.misses.map((v, i) => (i === seat ? 0 : v)) };
}

/** For a rematch: seats the AI was only standing in for go back to their players. */
export const humansBack = <S extends Room>(state: S): S => ({ ...state, ai: state.ai.map((v, i) => v && !state.away?.[i]) });

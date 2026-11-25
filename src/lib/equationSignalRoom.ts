// Shared room for 수식 신호등 with friends (2–4 players). Seat 0 is the host.
// Every round the board hides one equation and everyone guesses it at the same time. A player sees the
// colours of everybody's guesses but only their own symbols. Solving it scores by place (with four
// players 4-3-2-1, with two 2-1); a round ends when everyone has solved it, used up their guesses, or the
// clock runs out. Most points after the last round wins.
import { CELLS, SYMBOLS, generateEquation, markGuess, solved } from './equationSignal';
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';

export const EQS_MAX_PLAYERS = 4;
export const EQS_MIN_PLAYERS = 2;
export const EQS_ROUND_OPTIONS = [3, 5] as const;
export const EQS_TIME_OPTIONS = [120, 180, 300] as const; // seconds per round
export const EQS_MAX_GUESSES = 12;
export const REVEAL_MS = 9_000;

/** One guess: its symbols (blank for other players until the round is over) and its colours. */
export type EqsRow = { g: string; m: string };

export type EqsRoom = BaseRoom & {
  phase: 'lobby' | 'play' | 'reveal' | 'finished';
  rounds: (typeof EQS_ROUND_OPTIONS)[number];
  roundSec: (typeof EQS_TIME_OPTIONS)[number];
  players: number[]; // seats taking part, fixed at the start
  index: number; // 0-based round number
  answer: string; // blank for guests while the round is on
  rows: EqsRow[][]; // by seat
  places: number[]; // seats in the order they solved this round
  phaseEnd: number; // play: the round's clock; reveal: when the next round starts
  scores: number[]; // by seat
  history: { answer: string; places: number[]; guesses: number[] }[];
};

export type EqsRoomAction =
  | { t: 'config'; rounds?: number; roundSec?: number }
  | { t: 'start' }
  | { t: 'guess'; text: string }
  | { t: 'next' }
  | { t: 'timeout' };

const emptyRows = (): EqsRow[][] => Array.from({ length: EQS_MAX_PLAYERS }, () => []);

export function createEqsRoom(host: Peer): EqsRoom {
  return {
    sid: newSid(), v: 1, seats: [{ id: host.id, name: host.name }, ...Array(EQS_MAX_PLAYERS - 1).fill(null)] as Seat[],
    phase: 'lobby', deadline: 0, rounds: 3, roundSec: 180, players: [], index: 0, answer: '', rows: emptyRows(), places: [],
    phaseEnd: 0, scores: Array(EQS_MAX_PLAYERS).fill(0), history: [],
  };
}

export const syncEqsSeats = (state: EqsRoom, peers: Peer[]) => syncSeats(state, peers);

/** Final order by points (ties keep seat order). */
export const eqsRanking = (state: EqsRoom) => [...state.players].sort((a, b) => state.scores[b] - state.scores[a] || a - b);
/** Points for solving in `place` (1 = first) among `players`. */
export const placePoints = (place: number, players: number) => Math.max(1, players - place + 1);
/** Whether this seat can still guess this round. */
export const canGuess = (state: EqsRoom, seat: number) =>
  state.phase === 'play' && state.players.includes(seat) && !state.places.includes(seat) && state.rows[seat].length < EQS_MAX_GUESSES;

const beginRound = (state: EqsRoom, index: number): EqsRoom => {
  const end = Date.now() + state.roundSec * 1000;
  return { ...state, phase: 'play', index, answer: generateEquation(), rows: emptyRows(), places: [], phaseEnd: end, deadline: end };
};

const endRound = (state: EqsRoom): EqsRoom => {
  const end = Date.now() + REVEAL_MS;
  return {
    ...state, phase: 'reveal', phaseEnd: end, deadline: end,
    history: [...state.history, { answer: state.answer, places: state.places, guesses: state.rows.map((r) => r.length) }],
  };
};

export function reduceEqsRoom(state: EqsRoom, action: EqsRoomAction, seat: number | null, isHost: boolean): EqsRoom | null {
  let next: EqsRoom | null = null;
  const now = Date.now();
  const busy = state.phase === 'play' || state.phase === 'reveal';
  switch (action.t) {
    case 'config':
      if (!isHost || busy) break;
      next = {
        ...state,
        rounds: (EQS_ROUND_OPTIONS as readonly number[]).includes(action.rounds ?? -1) ? action.rounds as EqsRoom['rounds'] : state.rounds,
        roundSec: (EQS_TIME_OPTIONS as readonly number[]).includes(action.roundSec ?? -1) ? action.roundSec as EqsRoom['roundSec'] : state.roundSec,
      };
      break;
    case 'start': {
      const players = state.seats.flatMap((s, i) => (s ? [i] : []));
      if (!isHost || busy || players.length < EQS_MIN_PLAYERS) break;
      next = beginRound({ ...state, sid: newSid(), players, scores: Array(EQS_MAX_PLAYERS).fill(0), history: [] }, 0);
      break;
    }
    case 'guess': {
      if (seat === null || !canGuess(state, seat)) break;
      const text = String(action.text ?? '');
      if (text.length !== CELLS || [...text].some((ch) => !SYMBOLS.includes(ch))) break;
      const marks = markGuess(state.answer, text);
      const rows = state.rows.map((r, i) => (i === seat ? [...r, { g: text, m: marks.join('') }] : r));
      const won = solved(marks);
      const places = won ? [...state.places, seat] : state.places;
      const scores = won ? state.scores.map((n, i) => (i === seat ? n + placePoints(places.length, state.players.length) : n)) : state.scores;
      const after = { ...state, rows, places, scores };
      next = state.players.some((s) => canGuess(after, s)) ? after : endRound(after);
      break;
    }
    case 'next':
      if (!isHost || state.phase !== 'reveal' || now < state.phaseEnd) break;
      next = state.index + 1 >= state.rounds ? { ...state, phase: 'finished', deadline: 0 } : beginRound(state, state.index + 1);
      break;
    case 'timeout':
      if (!isHost || now < state.deadline) break;
      if (state.phase === 'play') next = endRound(state);
      break;
  }
  return next ? bump(next) : null;
}

/** Host-run step: move on once the answer has been shown. */
export const eqsAutoAction = (state: EqsRoom): EqsRoomAction | null =>
  state.phase === 'reveal' && Date.now() >= state.phaseEnd ? { t: 'next' } : null;

/** While a round is on, guests get the colours only: no answer, no symbols. */
export const redactEqsRoom = (state: EqsRoom): EqsRoom =>
  state.phase === 'play' ? { ...state, answer: '', rows: state.rows.map((r) => r.map((row) => ({ g: '', m: row.m }))) } : state;

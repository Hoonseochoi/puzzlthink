// Shared room for 헥사곤 with friends (2–4 players). Seat 0 is the host.
// Each round: everyone sees the numbers for the memorize time, then the tiles flip and the target shows.
// Press the buzzer, then pick three tiles in a line within 10 seconds. Right +1, wrong −1 (a line already
// declared this round, or no answer in time, is wrong too). Declared lines are not marked on the board.
// A round ends when every answer is out, or after 90 seconds without a buzz. A tie for first after the
// last round plays overtime rounds (up to three, then the first place is shared).
import { IDLE_MS, type HexRound, generateRound, lineOf } from './hexagon';
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';

export const HEX_MAX_PLAYERS = 4;
export const HEX_MIN_PLAYERS = 2;
export const HEX_ROUND_OPTIONS = [5, 10] as const;
export const HEX_MEMO_OPTIONS = [20, 30, 45] as const; // seconds the numbers stay up
export const BUZZ_MS = 10_000;
export const REVEAL_MS = 8_000;
export const MAX_OVERTIME = 3;
const NEVER = Number.MAX_SAFE_INTEGER;

export type HexDeclare = { seat: number; line: string | null; ok: boolean; reason: 'right' | 'wrong' | 'dup' | 'time'; at: number };

export type HexRoom = BaseRoom & {
  phase: 'lobby' | 'memorize' | 'recall' | 'reveal' | 'finished';
  rounds: (typeof HEX_ROUND_OPTIONS)[number];
  memoSec: (typeof HEX_MEMO_OPTIONS)[number];
  players: number[]; // seats taking part, fixed at the start
  round: HexRound | null;
  index: number; // 0-based round number (overtime continues past `rounds`)
  phaseEnd: number; // memorize: when the tiles flip; recall: when the round ends without a buzz; reveal: next round
  buzz: { seat: number; until: number } | null;
  found: { line: string; seat: number }[];
  last: HexDeclare | null; // the latest declaration, shown to everyone for a moment
  scores: number[]; // by seat
  history: { target: number; answers: string[]; found: { line: string; seat: number }[] }[];
};

export type HexRoomAction =
  | { t: 'config'; rounds?: number; memoSec?: number }
  | { t: 'start' }
  | { t: 'buzz' }
  | { t: 'declare'; letters: string }
  | { t: 'next' }
  | { t: 'timeout' };

export function createHexRoom(host: Peer): HexRoom {
  return {
    sid: newSid(), v: 1, seats: [{ id: host.id, name: host.name }, ...Array(HEX_MAX_PLAYERS - 1).fill(null)] as Seat[],
    phase: 'lobby', deadline: 0, rounds: 10, memoSec: 30, players: [], round: null, index: 0, phaseEnd: 0,
    buzz: null, found: [], last: null, scores: Array(HEX_MAX_PLAYERS).fill(0), history: [],
  };
}

export const syncHexSeats = (state: HexRoom, peers: Peer[]) => syncSeats(state, peers);

/** Final order by points (ties keep seat order; overtime settles them where it can). */
export const hexRanking = (state: HexRoom) => [...state.players].sort((a, b) => state.scores[b] - state.scores[a] || a - b);
export const isOvertime = (state: HexRoom) => state.index >= state.rounds;

const withDeadline = (state: HexRoom): HexRoom => ({ ...state, deadline: Math.min(state.buzz?.until ?? NEVER, state.phaseEnd) });

function beginRound(state: HexRoom, index: number): HexRoom {
  return withDeadline({ ...state, phase: 'memorize', index, round: generateRound(), phaseEnd: Date.now() + state.memoSec * 1000, buzz: null, found: [], last: null });
}

function endRound(state: HexRoom): HexRoom {
  const round = state.round!;
  return withDeadline({
    ...state, phase: 'reveal', buzz: null, phaseEnd: Date.now() + REVEAL_MS,
    history: [...state.history, { target: round.target, answers: round.answers, found: state.found }],
  });
}

/** After a declaration: the buzzer opens again with a fresh 90 seconds, or the round ends if all are out. */
function settle(state: HexRoom, seat: number, line: string | null, reason: HexDeclare['reason']): HexRoom {
  const ok = reason === 'right';
  const now = Date.now();
  const next: HexRoom = {
    ...state, buzz: null, phaseEnd: now + IDLE_MS,
    scores: state.scores.map((n, i) => (i === seat ? n + (ok ? 1 : -1) : n)),
    found: ok && line ? [...state.found, { line, seat }] : state.found,
    last: { seat, line, ok, reason, at: now },
  };
  return next.found.length >= next.round!.answers.length ? endRound(next) : withDeadline(next);
}

export function reduceHexRoom(state: HexRoom, action: HexRoomAction, seat: number | null, isHost: boolean): HexRoom | null {
  let next: HexRoom | null = null;
  const now = Date.now();
  const inGame = seat !== null && state.players.includes(seat);
  const busy = state.phase === 'memorize' || state.phase === 'recall' || state.phase === 'reveal';
  switch (action.t) {
    case 'config':
      if (!isHost || busy) break;
      next = {
        ...state,
        rounds: (HEX_ROUND_OPTIONS as readonly number[]).includes(action.rounds ?? -1) ? action.rounds as HexRoom['rounds'] : state.rounds,
        memoSec: (HEX_MEMO_OPTIONS as readonly number[]).includes(action.memoSec ?? -1) ? action.memoSec as HexRoom['memoSec'] : state.memoSec,
      };
      break;
    case 'start': {
      const players = state.seats.flatMap((s, i) => (s ? [i] : []));
      if (!isHost || busy || players.length < HEX_MIN_PLAYERS) break;
      next = beginRound({ ...state, sid: newSid(), players, scores: Array(HEX_MAX_PLAYERS).fill(0), history: [] }, 0);
      break;
    }
    case 'buzz':
      if (state.phase !== 'recall' || !inGame || state.buzz) break;
      next = withDeadline({ ...state, buzz: { seat: seat!, until: now + BUZZ_MS } });
      break;
    case 'declare': {
      if (state.phase !== 'recall' || !state.buzz || state.buzz.seat !== seat) break;
      const line = lineOf(action.letters);
      // Anything that is not a line of three counts as wrong, like a declaration in numbers on air.
      const reason = !line ? 'wrong' : state.found.some((f) => f.line === line) ? 'dup' : state.round!.answers.includes(line) ? 'right' : 'wrong';
      next = settle(state, seat, line ?? action.letters.toUpperCase().replace(/[^A-S]/g, '').slice(0, 3), reason);
      break;
    }
    case 'next': {
      if (!isHost || state.phase !== 'reveal' || now < state.phaseEnd) break;
      const done = state.index + 1 >= state.rounds;
      if (!done) { next = beginRound(state, state.index + 1); break; }
      const ranking = hexRanking(state);
      const tied = ranking.length > 1 && state.scores[ranking[0]] === state.scores[ranking[1]];
      next = tied && state.index + 1 < state.rounds + MAX_OVERTIME ? beginRound(state, state.index + 1) : { ...state, phase: 'finished', deadline: 0, buzz: null };
      break;
    }
    case 'timeout':
      if (!isHost || now < state.deadline) break;
      if (state.phase === 'memorize') next = withDeadline({ ...state, phase: 'recall', phaseEnd: now + IDLE_MS });
      else if (state.phase === 'recall' && state.buzz && now >= state.buzz.until) next = settle(state, state.buzz.seat, null, 'time');
      else if (state.phase === 'recall' && now >= state.phaseEnd) next = endRound(state);
      break;
  }
  return next ? bump(next) : null;
}

/** Host-run step: move on once the answers have been shown. */
export const hexAutoAction = (state: HexRoom): HexRoomAction | null =>
  state.phase === 'reveal' && Date.now() >= state.phaseEnd ? { t: 'next' } : null;

/** Guests do not get the numbers while they are meant to be remembering them. */
/** Host handoff: the numbers being recalled left with the old host, so this round is played again (scores stay). */
export const resumeHexRoom = (view: HexRoom): HexRoom | null => (view.phase === 'recall' ? beginRound(view, view.index) : view);

export const redactHexRoom = (state: HexRoom): HexRoom =>
  state.phase === 'recall' && state.round ? { ...state, round: { ...state.round, numbers: state.round.numbers.map(() => 0), answers: [] } } : state;

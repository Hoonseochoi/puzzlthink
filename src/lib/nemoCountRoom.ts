// Shared room for 네모 세기 with friends (2–6 players). Seat 0 is the host.
// Everyone sees the same board. Press the buzzer, then answer within 10 seconds; a wrong (or missing)
// answer locks you out of that problem. Each player may pass once per game (give up the current
// problem). A problem ends when someone is right, when everyone still in it is locked out or has passed,
// or when its time runs out; the answer is shown for a few seconds and the next one starts.
import { type NemoDifficulty, type NemoProblem, generateSet } from './nemoCount';
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';

export const NEMO_MAX_PLAYERS = 6;
export const NEMO_MIN_PLAYERS = 2;
export const NEMO_PROBLEM_OPTIONS = [5, 10, 15] as const;
export const NEMO_TIME_OPTIONS = [60, 120, 180, 300, 0] as const; // seconds per problem; 0 = no limit
export const BUZZ_MS = 10_000;
export const REVEAL_MS = 6_000;
const NEVER = Number.MAX_SAFE_INTEGER;

export type NemoRoomResult = { index: number; winner: number | null; answer: number; given: number | null; ms: number | null; reason: 'correct' | 'locked' | 'time' };

export type NemoRoom = BaseRoom & {
  phase: 'lobby' | 'playing' | 'reveal' | 'finished';
  difficulty: NemoDifficulty;
  problemCount: (typeof NEMO_PROBLEM_OPTIONS)[number];
  timeSec: (typeof NEMO_TIME_OPTIONS)[number];
  players: number[]; // seats taking part, fixed at the start
  problems: NemoProblem[];
  index: number;
  problemStart: number;
  problemEnd: number; // NEVER when there is no limit
  buzz: { seat: number; until: number } | null;
  out: number[]; // seats out of the current problem (wrong answer or pass)
  wrong: Record<number, number>; // seat -> wrong answer they gave on this problem
  passesLeft: number[]; // by seat
  scores: number[]; // by seat
  times: number[]; // by seat: total ms spent on problems they solved
  results: NemoRoomResult[];
  revealUntil: number;
};

export type NemoRoomAction =
  | { t: 'config'; difficulty?: NemoDifficulty; problemCount?: number; timeSec?: number }
  | { t: 'start' }
  | { t: 'buzz' }
  | { t: 'answer'; value: number }
  | { t: 'pass' }
  | { t: 'next' }
  | { t: 'timeout' };

export function createNemoRoom(host: Peer): NemoRoom {
  return {
    sid: newSid(), v: 1, seats: [{ id: host.id, name: host.name }, ...Array(NEMO_MAX_PLAYERS - 1).fill(null)] as Seat[],
    phase: 'lobby', deadline: 0, difficulty: 'normal', problemCount: 10, timeSec: 180,
    players: [], problems: [], index: 0, problemStart: 0, problemEnd: NEVER, buzz: null, out: [], wrong: {},
    passesLeft: Array(NEMO_MAX_PLAYERS).fill(1), scores: Array(NEMO_MAX_PLAYERS).fill(0), times: Array(NEMO_MAX_PLAYERS).fill(0),
    results: [], revealUntil: 0,
  };
}

export const syncNemoSeats = (state: NemoRoom, peers: Peer[]) => syncSeats(state, peers);

/** Final order: more correct answers first, then less total time on them. */
export const nemoRanking = (state: NemoRoom) => [...state.players].sort((a, b) => state.scores[b] - state.scores[a] || state.times[a] - state.times[b]);

const withDeadline = (state: NemoRoom): NemoRoom => ({
  ...state,
  deadline: state.phase === 'reveal' ? state.revealUntil : state.buzz ? Math.min(state.buzz.until, state.problemEnd) : state.problemEnd,
});

function beginProblem(state: NemoRoom, index: number): NemoRoom {
  const now = Date.now();
  return withDeadline({
    ...state, phase: 'playing', index, problemStart: now, problemEnd: state.timeSec ? now + state.timeSec * 1000 : NEVER,
    buzz: null, out: [], wrong: {}, revealUntil: 0,
  });
}

function reveal(state: NemoRoom, result: Omit<NemoRoomResult, 'index' | 'answer'>): NemoRoom {
  const problem = state.problems[state.index];
  return withDeadline({
    ...state, phase: 'reveal', buzz: null, revealUntil: Date.now() + REVEAL_MS,
    results: [...state.results, { ...result, index: state.index, answer: problem.answer }],
  });
}

/** After someone drops out of the problem: end it when nobody is left to answer. */
function afterOut(state: NemoRoom): NemoRoom {
  const left = state.players.filter((seat) => !state.out.includes(seat));
  return left.length ? withDeadline({ ...state, buzz: null }) : reveal(state, { winner: null, given: null, ms: null, reason: 'locked' });
}

export function reduceNemoRoom(state: NemoRoom, action: NemoRoomAction, seat: number | null, isHost: boolean): NemoRoom | null {
  let next: NemoRoom | null = null;
  const now = Date.now();
  const inGame = seat !== null && state.players.includes(seat);
  switch (action.t) {
    case 'config': {
      if (!isHost || state.phase === 'playing' || state.phase === 'reveal') break;
      next = {
        ...state,
        difficulty: action.difficulty && ['easy', 'normal', 'hard'].includes(action.difficulty) ? action.difficulty : state.difficulty,
        problemCount: (NEMO_PROBLEM_OPTIONS as readonly number[]).includes(action.problemCount ?? -1) ? action.problemCount as NemoRoom['problemCount'] : state.problemCount,
        timeSec: (NEMO_TIME_OPTIONS as readonly number[]).includes(action.timeSec ?? -1) ? action.timeSec as NemoRoom['timeSec'] : state.timeSec,
      };
      break;
    }
    case 'start': {
      const players = state.seats.flatMap((s, i) => (s ? [i] : []));
      if (!isHost || state.phase === 'playing' || state.phase === 'reveal' || players.length < NEMO_MIN_PLAYERS) break;
      const seed = Math.floor(Math.random() * 2 ** 31);
      next = beginProblem({
        ...state, sid: newSid(), players, problems: generateSet(state.difficulty, state.problemCount, seed),
        passesLeft: Array(NEMO_MAX_PLAYERS).fill(1), scores: Array(NEMO_MAX_PLAYERS).fill(0), times: Array(NEMO_MAX_PLAYERS).fill(0), results: [],
      }, 0);
      break;
    }
    case 'buzz':
      if (state.phase !== 'playing' || !inGame || state.buzz || state.out.includes(seat!) || now >= state.problemEnd) break;
      next = withDeadline({ ...state, buzz: { seat: seat!, until: now + BUZZ_MS } });
      break;
    case 'answer': {
      if (state.phase !== 'playing' || !state.buzz || state.buzz.seat !== seat || !Number.isInteger(action.value)) break;
      const problem = state.problems[state.index];
      if (action.value === problem.answer) {
        const ms = now - state.problemStart;
        const scores = state.scores.map((n, i) => (i === seat ? n + 1 : n));
        const times = state.times.map((n, i) => (i === seat ? n + ms : n));
        next = reveal({ ...state, scores, times }, { winner: seat, given: action.value, ms, reason: 'correct' });
      } else {
        next = afterOut({ ...state, out: [...state.out, seat], wrong: { ...state.wrong, [seat]: action.value } });
      }
      break;
    }
    case 'pass':
      if (state.phase !== 'playing' || !inGame || state.out.includes(seat!) || state.passesLeft[seat!] <= 0 || state.buzz?.seat === seat) break;
      next = afterOut({ ...state, out: [...state.out, seat!], passesLeft: state.passesLeft.map((n, i) => (i === seat ? n - 1 : n)), buzz: state.buzz });
      if (next.phase === 'playing' && state.buzz) next = withDeadline({ ...next, buzz: state.buzz }); // someone else is still answering
      break;
    case 'next':
      if (!isHost || state.phase !== 'reveal' || now < state.revealUntil) break;
      next = state.index + 1 >= state.problems.length ? { ...state, phase: 'finished', deadline: 0, buzz: null } : beginProblem(state, state.index + 1);
      break;
    case 'timeout': {
      if (!isHost || state.phase !== 'playing' || now < state.deadline) break;
      if (state.buzz && now >= state.buzz.until && state.buzz.until <= state.problemEnd) {
        // No answer in 10 seconds counts as a wrong answer.
        next = afterOut({ ...state, out: [...state.out, state.buzz.seat] });
      } else if (now >= state.problemEnd) {
        next = reveal(state, { winner: null, given: null, ms: null, reason: 'time' });
      }
      break;
    }
  }
  return next ? bump(next) : null;
}

/** Host-run step: move on once the answer has been shown. */
export const nemoAutoAction = (state: NemoRoom): NemoRoomAction | null =>
  state.phase === 'reveal' && Date.now() >= state.revealUntil ? { t: 'next' } : null;

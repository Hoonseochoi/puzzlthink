// 수식 신호등 1:1 출제 대결: two players each write an equation, then solve the other's at the same time.
//
// Fairness without a server: an equation never leaves its writer's browser until the reveal.
//   - Writing: each browser keeps its equation (and a random salt) to itself and sends only a commitment,
//     sha256(`${sid}|${salt}|${equation}`).
//   - Solving: a guess goes into the shared state with no colours yet; the *writer's* browser colours it against
//     its own equation and sends the colours back (`mark`). The host (who may be one of the two) never holds the
//     other player's equation, so it has nothing to leak.
//   - Reveal: both browsers send equation + salt. The host checks the commitment, that the equation is valid, and that
//     every colour it sent matches markGuess. A player whose reveal fails (or never comes) loses.
// Win rule: solving beats not solving; between two solves, fewer guesses wins, then the earlier solve (host clock).
import { CELLS, SYMBOLS, isEquation, markGuess } from './equationSignal';
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';
import { sha256 } from './sha256';

export const DUEL_MAX_GUESSES = 12; // the friend-room limit per equation
export const DUEL_WRITE_SEC = 180; // 3 minutes to write
export const DUEL_SOLVE_SEC = 480; // 8 minutes to solve
/** After the writing clock: how long the host waits for a commitment before that player forfeits. */
export const DUEL_WRITE_GRACE_MS = 15_000;
/** A guess left uncoloured this long: its writer (not answering) forfeits. */
export const DUEL_MARK_MS = 30_000;
/** After solving ends: how long the host waits for both reveals. */
export const DUEL_REVEAL_MS = 20_000;

/** One guess by a player at the opponent's equation. `m` is '' until the writer's browser colours it; `at` is host time. */
export type DuelRow = { g: string; m: string; at: number };
export type DuelReason = 'solved' | 'guesses' | 'time' | 'draw' | 'noshow' | 'nomark' | 'cheat';

export type DuelRoom = BaseRoom & {
  mode: 'duel';
  phase: 'lobby' | 'write' | 'solve' | 'reveal' | 'finished';
  writeSec: number;
  solveSec: number;
  commits: (string | null)[]; // by seat
  auto: boolean[]; // the writer's clock ran out and its browser drew a random equation
  writeEnd: number; // host time
  solveStart: number;
  rows: DuelRow[][]; // rows[seat] = seat's guesses at the other's equation
  reveals: ({ eq: string; ok: boolean } | null)[];
  forfeit: { seat: number; reason: 'noshow' | 'nomark' } | null;
  revealEnd: number;
  result: { winner: number | null; reason: DuelReason } | null;
  wins: number[]; // across rematches in this room
};

export type DuelAction =
  | { t: 'start' }
  | { t: 'commit'; hash: string; auto?: boolean }
  | { t: 'guess'; text: string }
  | { t: 'mark'; i: number; m: string }
  | { t: 'reveal'; eq: string; salt: string }
  | { t: 'timeout' };

export const DUEL_HOST_VALUE = 'equation-signal-duel';
export const isDuel = (state: BaseRoom | null | undefined): state is DuelRoom => (state as { mode?: unknown } | null | undefined)?.mode === 'duel';

/** Dev only: `localStorage.eqs_duel_fast = '1'` shortens the clocks (20 s to write, 90 s to solve) for testing. */
function clocks() {
  if (process.env.NODE_ENV !== 'production') {
    try { if (localStorage.getItem('eqs_duel_fast') === '1') return { writeSec: 20, solveSec: 90 }; } catch { /* no storage */ }
  }
  return { writeSec: DUEL_WRITE_SEC, solveSec: DUEL_SOLVE_SEC };
}

export function createDuelRoom(host: Peer): DuelRoom {
  return {
    sid: newSid(), v: 1, seats: [{ id: host.id, name: host.name }, null] as Seat[], phase: 'lobby', deadline: 0, mode: 'duel',
    ...clocks(), commits: [null, null], auto: [false, false], writeEnd: 0, solveStart: 0, rows: [[], []], reveals: [null, null],
    forfeit: null, revealEnd: 0, result: null, wins: [0, 0],
  };
}

export const syncDuelSeats = (state: DuelRoom, peers: Peer[]) => syncSeats(state, peers);

/** The commitment a browser sends for its equation. */
export const duelCommit = (sid: string, salt: string, eq: string) => sha256(`${sid}|${salt}|${eq}`);

const other = (seat: number) => 1 - seat;
const solvedRow = (rows: DuelRow[]) => rows.findIndex((r) => r.m === 'ggggggggg');
/** Whether this seat has nothing left to do: solved, or used every guess (all coloured). */
export const duelDone = (state: DuelRoom, seat: number) => {
  const rows = state.rows[seat];
  return solvedRow(rows) >= 0 || (rows.length >= DUEL_MAX_GUESSES && rows.every((r) => r.m));
};
/** Whether this seat may hand in a guess now (one at a time: the last one must be coloured first). */
export const duelCanGuess = (state: DuelRoom, seat: number) =>
  state.phase === 'solve' && !state.forfeit && !duelDone(state, seat) && state.rows[seat].length < DUEL_MAX_GUESSES && state.rows[seat].every((r) => r.m);

/** A solve as [guesses, host time], or null. */
const solveOf = (state: DuelRoom, seat: number): [number, number] | null => {
  const i = solvedRow(state.rows[seat]);
  return i < 0 ? null : [i + 1, state.rows[seat][i].at];
};

/** Whether the winner is already settled: one solved in n and the other has n coloured misses, or is out. */
function decidedEarly(state: DuelRoom): boolean {
  for (const seat of [0, 1]) {
    const mine = solveOf(state, seat);
    if (!mine) continue;
    const theirs = state.rows[other(seat)];
    const misses = theirs.filter((r) => r.m && r.m !== 'ggggggggg').length;
    if (duelDone(state, other(seat)) || misses >= mine[0]) return true;
  }
  return false;
}

/** Who won, once both reveals are in (or the reveal clock ran out). */
export function duelResult(state: DuelRoom): { winner: number | null; reason: DuelReason } {
  const bad = [0, 1].filter((s) => !state.reveals[s]?.ok);
  if (state.forfeit) return { winner: other(state.forfeit.seat), reason: state.forfeit.reason };
  if (bad.length === 2) return { winner: null, reason: 'draw' };
  if (bad.length === 1) return { winner: other(bad[0]), reason: 'cheat' };
  const a = solveOf(state, 0);
  const b = solveOf(state, 1);
  if (!a && !b) return { winner: null, reason: 'draw' };
  if (!a || !b) return { winner: a ? 0 : 1, reason: 'solved' };
  if (a[0] !== b[0]) return { winner: a[0] < b[0] ? 0 : 1, reason: 'guesses' };
  if (a[1] !== b[1]) return { winner: a[1] < b[1] ? 0 : 1, reason: 'time' };
  return { winner: null, reason: 'draw' };
}

const toReveal = (state: DuelRoom, now: number, forfeit: DuelRoom['forfeit'] = state.forfeit): DuelRoom => {
  const end = now + DUEL_REVEAL_MS;
  return { ...state, phase: 'reveal', forfeit, revealEnd: end, deadline: end };
};

const finish = (state: DuelRoom): DuelRoom => {
  const result = duelResult(state);
  return { ...state, phase: 'finished', deadline: 0, result, wins: state.wins.map((n, s) => (s === result.winner ? n + 1 : n)) };
};

/** The oldest guess still waiting for colours, as [guesser seat, host time]. */
const oldestPending = (state: DuelRoom): [number, number] | null => {
  let best: [number, number] | null = null;
  for (const seat of [0, 1]) for (const r of state.rows[seat]) if (!r.m && (!best || r.at < best[1])) best = [seat, r.at];
  return best;
};

/** The next moment the host has to act on its own. */
export function duelDue(state: DuelRoom): number {
  if (state.phase === 'write') return state.writeEnd + DUEL_WRITE_GRACE_MS;
  if (state.phase === 'reveal') return state.revealEnd;
  if (state.phase === 'solve') {
    const pending = oldestPending(state);
    return Math.min(state.solveStart + state.solveSec * 1000, pending ? pending[1] + DUEL_MARK_MS : Infinity);
  }
  return Infinity;
}

const validMarks = (m: unknown): m is string => typeof m === 'string' && m.length === CELLS && /^[gyr]+$/.test(m);

export function reduceDuelRoom(state: DuelRoom, action: DuelAction, seat: number | null, isHost: boolean): DuelRoom | null {
  const now = Date.now();
  let next: DuelRoom | null = null;
  const busy = state.phase === 'write' || state.phase === 'solve' || state.phase === 'reveal';
  switch (action.t) {
    case 'start': {
      if (!isHost || busy || !state.seats[0] || !state.seats[1]) break;
      const end = now + state.writeSec * 1000;
      next = {
        ...state, sid: newSid(), phase: 'write', writeEnd: end, deadline: end + DUEL_WRITE_GRACE_MS, commits: [null, null], auto: [false, false],
        solveStart: 0, rows: [[], []], reveals: [null, null], forfeit: null, revealEnd: 0, result: null,
      };
      break;
    }
    case 'commit': {
      if (seat === null || state.phase !== 'write' || state.commits[seat]) break;
      if (typeof action.hash !== 'string' || !/^[0-9a-f]{64}$/.test(action.hash)) break;
      const commits = state.commits.map((c, i) => (i === seat ? action.hash : c));
      const auto = state.auto.map((a, i) => (i === seat ? !!action.auto : a));
      next = { ...state, commits, auto };
      if (commits.every(Boolean)) next = { ...next, phase: 'solve', solveStart: now, deadline: now + state.solveSec * 1000 };
      break;
    }
    case 'guess': {
      if (seat === null || !duelCanGuess(state, seat)) break;
      const text = String(action.text ?? '');
      if (text.length !== CELLS || [...text].some((ch) => !SYMBOLS.includes(ch))) break;
      next = { ...state, rows: state.rows.map((r, i) => (i === seat ? [...r, { g: text, m: '', at: now }] : r)) };
      break;
    }
    case 'mark': {
      // Only the writer colours guesses at its own equation.
      if (seat === null || state.phase !== 'solve' || state.forfeit || !validMarks(action.m)) break;
      const target = other(seat);
      const row = state.rows[target][action.i];
      if (!row || row.m) break;
      next = { ...state, rows: state.rows.map((r, i) => (i === target ? r.map((x, j) => (j === action.i ? { ...x, m: action.m } : x)) : r)) };
      if ((duelDone(next, 0) && duelDone(next, 1)) || decidedEarly(next)) next = toReveal(next, now);
      break;
    }
    case 'reveal': {
      if (seat === null || state.phase !== 'reveal' || state.reveals[seat]) break;
      const eq = String(action.eq ?? '');
      const salt = String(action.salt ?? '');
      const ok = !!state.commits[seat] && duelCommit(state.sid, salt, eq) === state.commits[seat] && isEquation(eq)
        && state.rows[other(seat)].every((r) => !r.m || markGuess(eq, r.g).join('') === r.m);
      next = { ...state, reveals: state.reveals.map((r, i) => (i === seat ? { eq: ok ? eq : '', ok } : r)) };
      // A player who had no equation to reveal (did not commit) is not waited for.
      if ([0, 1].every((s) => next!.reveals[s] || !state.commits[s])) next = finish(next);
      break;
    }
    case 'timeout': {
      if (!isHost || now < duelDue(state)) break;
      if (state.phase === 'write') {
        const missing = [0, 1].filter((s) => !state.commits[s]);
        next = missing.length ? toReveal(state, now, missing.length === 1 ? { seat: missing[0], reason: 'noshow' } : null) : null;
        if (next && missing.length === 2) next = finish(next);
      } else if (state.phase === 'solve') {
        const pending = oldestPending(state);
        next = pending && now >= pending[1] + DUEL_MARK_MS ? toReveal(state, now, { seat: other(pending[0]), reason: 'nomark' }) : toReveal(state, now);
      } else if (state.phase === 'reveal') next = finish(state);
      break;
    }
  }
  return next ? bump(next) : null;
}

/** Host-run step: the clocks (writing grace, solving cap, unanswered guess, reveal). */
export const duelAutoAction = (state: DuelRoom): DuelAction | null => (Date.now() >= duelDue(state) ? { t: 'timeout' } : null);
export const duelRunning = (state: DuelRoom) => state.phase === 'write' || state.phase === 'solve';

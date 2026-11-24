// 포인트 오목 match state, shared by the AI game (played in this browser) and 1:1 rooms (host-authoritative).
//
// Hidden bids use commit-then-reveal, so neither side can see the other's bid before locking in its own:
// 1. Each player locks a bid by sending only a hash of it (with a random salt): `commit`.
// 2. When both hashes are in, each sends the bid itself: `reveal`. A guest's reveal is encrypted to the host
//    (see `sealed` in useRealtimeRoom); the host's never leaves its browser. The reducer checks it against the hash.
// 3. Bids stay out of the state guests receive until the match is over (`redact`); each guest gets only its own
//    bids back, encrypted (`privateFor`). When the match ends every bid is shown, and a guest can check the host's
//    bids against the hashes the host committed.
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';
import {
  PO_SECONDS, budgetAfter, emptyBoard, fallbackTriple, isLegalTriple, lineOrder, other, outcomeOf, placeStones, pointOwners, validBets,
  type PoBets, type PoBoard, type PoSeat, type PoTriple,
} from './pointOmok';
import type { PoLevel, PoPublicRound } from './pointOmokAi';
import { sha256 } from './sha256';

export const PO_REVEAL_SECONDS = 15; // to send a locked bid once both are in
export const PO_SHOW_MS = 3600; // the reveal plays before the next chooser's clock starts
export const PO_IDLE_LOSS = 3; // rounds in a row on the clock (no choice or no bid) lose the match

export type PoPhase = 'lobby' | 'choose' | 'bid' | 'reveal' | 'finished';
/** A finished round. `auto`: that seat's bid was made by the clock (1·1·1). `lost`: its bid never arrived (0·0·0). */
export type PoRound = PoPublicRound & { auto?: boolean[]; lost?: boolean[]; picked?: boolean; hashes?: (string | null)[] };
/** `salts[seat][round]` lets anyone check a revealed bid against its hash once the match is over. */
export type PoSecret = { bets: number[][][]; pending: (number[] | null)[]; salts?: string[][]; pendingSalt?: string[] };

export type PoRoom = BaseRoom & {
  phase: PoPhase;
  ai: boolean[];
  level: PoLevel;
  board: PoBoard;
  round: number; // 1-based, the round being played
  first: PoSeat; // chooser of round 1 (drawn at random)
  chooser: PoSeat;
  triple: PoTriple | null;
  commits: (string | null)[]; // a bid hash, or 'auto' / 'ai'
  revealed: boolean[];
  rounds: PoRound[];
  idle: number[];
  autoPicked: boolean; // this round's points were picked by the clock
  shownAt: number; // when the last round was resolved (drives the reveal)
  secret?: PoSecret; // host (and, once over, everyone): every bid. Guests during play: only their own.
  winner: PoSeat | 'draw' | null;
  reason: 'five' | 'full' | 'resign' | 'timeout' | null;
  fives: [number, number];
};

export type PoAction =
  | { t: 'start' }
  | { t: 'choose'; cells: number[] }
  | { t: 'commit'; hash: string }
  | { t: 'reveal'; bets: number[]; salt: string }
  | { t: 'ai'; seat: number; triple?: number[]; bets?: number[] }
  | { t: 'resign' }
  | { t: 'timeout' };

export const commitHash = (sid: string, round: number, seat: number, bets: readonly number[], salt: string) =>
  sha256(`point-omok:${sid}:${round}:${seat}:${bets.join(',')}:${salt}`);

export const isPlaying = (state: PoRoom) => state.phase === 'choose' || state.phase === 'bid' || state.phase === 'reveal';

function fresh(state: PoRoom): PoRoom {
  return {
    ...state, phase: 'lobby', board: emptyBoard(), round: 1, chooser: state.first, triple: null, commits: [null, null], revealed: [false, false],
    rounds: [], idle: [0, 0], autoPicked: false, shownAt: 0, secret: { bets: [[], []], pending: [null, null], salts: [[], []], pendingSalt: ['', ''] }, winner: null, reason: null, fives: [0, 0], deadline: 0,
  };
}

export function createPoRoom(host: Peer, opts: { ai?: boolean; level?: PoLevel; aiName?: string } = {}): PoRoom {
  const seats: Seat[] = [{ id: host.id, name: host.name }, opts.ai ? { id: 'ai', name: opts.aiName ?? 'AI' } : null];
  return fresh({
    sid: newSid(), v: 1, seats, phase: 'lobby', deadline: 0, ai: [false, !!opts.ai], level: opts.level ?? 'normal',
    board: emptyBoard(), round: 1, first: 0, chooser: 0, triple: null, commits: [null, null], revealed: [false, false], rounds: [],
    idle: [0, 0], autoPicked: false, shownAt: 0, winner: null, reason: null, fives: [0, 0],
  });
}

export const syncPoSeats = (state: PoRoom, peers: Peer[]) => syncSeats(state, peers);

/** A seat's points this round, from its own bids (only known to the host and to that seat). */
export const budgetOf = (state: PoRoom, seat: number) => budgetAfter(state.secret?.bets[seat] ?? []);
/** Whether this browser holds `seat`'s bids up to the current round (a guest's copy can lag a moment). */
export const knowsBudget = (state: PoRoom, seat: number) => (state.secret?.bets[seat]?.length ?? -1) === state.rounds.length;

function startRound(state: PoRoom, now: number, pause: number): PoRoom {
  return { ...state, phase: 'choose', triple: null, commits: [null, null], revealed: [false, false], autoPicked: false, deadline: now + pause + PO_SECONDS * 1000, secret: { ...state.secret!, pending: [null, null], pendingSalt: ['', ''] } };
}

function resolve(state: PoRoom, now: number): PoRoom {
  const secret = state.secret!;
  const bets = [0, 1].map((s) => (secret.pending[s] ?? [0, 0, 0]) as PoBets) as [PoBets, PoBets];
  const owners = pointOwners(bets, state.chooser);
  const board = placeStones(state.board, state.triple!, owners);
  const auto = state.commits.map((c) => c === 'auto');
  const lost = [0, 1].map((s) => !secret.pending[s] || secret.pending[s]!.every((b) => b === 0));
  const round: PoRound = { chooser: state.chooser, triple: state.triple!, owners, ...(auto.some(Boolean) ? { auto } : {}), ...(lost.some(Boolean) ? { lost } : {}), ...(state.autoPicked ? { picked: true } : {}), hashes: state.commits.map((c) => (c && c.length === 64 ? c : null)) };
  const idle = [0, 1].map((s) => (auto[s] || (state.autoPicked && state.chooser === s) ? state.idle[s] + 1 : 0));
  const next: PoRoom = {
    ...state, board, rounds: [...state.rounds, round], idle, shownAt: now,
    secret: { bets: [0, 1].map((s) => [...secret.bets[s], bets[s]]), pending: [null, null], salts: [0, 1].map((s) => [...(secret.salts?.[s] ?? []), secret.pendingSalt?.[s] ?? '']), pendingSalt: ['', ''] },
  };
  const result = outcomeOf(board);
  if (result.winner !== null) return { ...next, phase: 'finished', winner: result.winner, reason: result.reason, fives: result.fives, triple: state.triple, deadline: 0 };
  const idler = [0, 1].find((s) => idle[s] >= PO_IDLE_LOSS && !state.ai[s]);
  if (idler !== undefined) return { ...next, phase: 'finished', winner: other(idler as PoSeat), reason: 'timeout', fives: result.fives, deadline: 0 };
  return startRound({ ...next, round: state.round + 1, chooser: other(state.chooser) }, now, PO_SHOW_MS);
}

/** After a bid is locked: reveal once both are in, resolve once both are revealed. */
function advance(state: PoRoom, now: number): PoRoom {
  if (state.commits.some((c) => c === null)) return state;
  if (state.revealed.every(Boolean)) return resolve(state, now);
  return state.phase === 'reveal' ? state : { ...state, phase: 'reveal', deadline: now + PO_REVEAL_SECONDS * 1000 };
}

const setAt = <T,>(list: T[], i: number, value: T) => list.map((x, k) => (k === i ? value : x));

function lockBid(state: PoRoom, seat: number, commit: string, bets: number[] | null, now: number): PoRoom {
  const secret = state.secret!;
  return advance({
    ...state, commits: setAt(state.commits, seat, commit),
    revealed: bets ? setAt(state.revealed, seat, true) : state.revealed,
    secret: bets ? { ...secret, pending: setAt(secret.pending, seat, bets) } : secret,
  }, now);
}

export function reducePoRoom(state: PoRoom, action: PoAction, seat: number | null, isHost: boolean): PoRoom | null {
  const now = Date.now();
  const mine = seat === 0 || seat === 1;
  let next: PoRoom | null = null;
  switch (action.t) {
    case 'start': {
      if (!isHost || isPlaying(state) || state.seats.some((s) => !s)) break;
      const first = (Math.random() < 0.5 ? 0 : 1) as PoSeat;
      next = startRound({ ...fresh({ ...state, first }), sid: state.phase === 'lobby' ? state.sid : newSid() }, now, 0);
      break;
    }
    case 'choose': {
      if (state.phase !== 'choose' || seat !== state.chooser || !Array.isArray(action.cells) || !isLegalTriple(state.board, action.cells)) break;
      next = { ...state, phase: 'bid', triple: lineOrder(action.cells), deadline: now + PO_SECONDS * 1000 };
      break;
    }
    case 'commit':
      if (state.phase !== 'bid' || !mine || state.commits[seat] !== null || typeof action.hash !== 'string' || !/^[0-9a-f]{64}$/.test(action.hash)) break;
      next = lockBid(state, seat, action.hash, null, now);
      break;
    case 'reveal': {
      if (state.phase !== 'reveal' || !mine || state.revealed[seat] || !state.secret) break;
      const hash = state.commits[seat];
      const ok = typeof hash === 'string' && hash.length === 64 && typeof action.salt === 'string' && validBets(action.bets, budgetOf(state, seat))
        && commitHash(state.sid, state.round, seat, action.bets, action.salt) === hash;
      next = advance({ ...state, revealed: setAt(state.revealed, seat, true), secret: { ...state.secret, pending: setAt(state.secret.pending, seat, ok ? [...action.bets] : [0, 0, 0]), pendingSalt: setAt(state.secret.pendingSalt ?? ['', ''], seat, ok ? action.salt : '') } }, now);
      break;
    }
    case 'ai': {
      const s = action.seat;
      if (!isHost || (s !== 0 && s !== 1) || !state.ai[s]) break;
      if (action.triple && state.phase === 'choose' && state.chooser === s && isLegalTriple(state.board, action.triple)) {
        next = { ...state, phase: 'bid', triple: lineOrder(action.triple), deadline: now + PO_SECONDS * 1000 };
      } else if (action.bets && state.phase === 'bid' && state.commits[s] === null && validBets(action.bets, budgetOf(state, s))) {
        next = lockBid(state, s, 'ai', [...action.bets], now);
      }
      break;
    }
    case 'resign':
      if (!isPlaying(state) || !mine) break;
      next = { ...state, phase: 'finished', winner: other(seat as PoSeat), reason: 'resign', deadline: 0 };
      break;
    case 'timeout': {
      if (!isHost || !isPlaying(state) || now < state.deadline) break;
      if (state.phase === 'choose') {
        const triple = fallbackTriple(state.board);
        if (!triple) { next = { ...state, phase: 'finished', winner: 'draw', reason: 'full', deadline: 0 }; break; }
        next = { ...state, phase: 'bid', triple, autoPicked: true, deadline: now + PO_SECONDS * 1000 };
      } else if (state.phase === 'bid') {
        let s2 = state;
        for (const s of [0, 1]) if (s2.commits[s] === null) s2 = { ...s2, commits: setAt(s2.commits, s, 'auto'), revealed: setAt(s2.revealed, s, true), secret: { ...s2.secret!, pending: setAt(s2.secret!.pending, s, [1, 1, 1]) } };
        next = advance(s2, now);
      } else {
        const pending = [0, 1].map((s) => (state.revealed[s] ? state.secret!.pending[s] : [0, 0, 0]));
        next = resolve({ ...state, revealed: [true, true], secret: { ...state.secret!, pending } }, now);
      }
      break;
    }
  }
  return next ? bump(next) : null;
}

/** What guests receive: no bids while the match is on. */
export const redactPoRoom = (state: PoRoom): PoRoom =>
  state.phase === 'finished' && state.secret ? { ...state, secret: { bets: state.secret.bets, salts: state.secret.salts, pending: [null, null] } } : { ...state, secret: undefined };

/** A seat's own bids, sent to that seat only. */
export const poPrivateFor = (state: PoRoom, seat: number) => ({ bets: state.secret?.bets[seat] ?? [] });

export function poWithPrivate(state: PoRoom, secret: unknown, seat: number): PoRoom {
  if (state.secret) return state; // over: every bid is public
  const bets = (secret as { bets?: number[][] })?.bets;
  if (!Array.isArray(bets)) return state;
  return { ...state, secret: { bets: [0, 1].map((s) => (s === seat ? bets : [])), pending: [null, null] } };
}

/** Once the match is over: whether every bid `seat` revealed matches the hash it locked in (bids made by the clock have none). */
export function poBidsCheck(state: PoRoom, seat: number): boolean {
  const bets = state.secret?.bets[seat], salts = state.secret?.salts?.[seat];
  if (!bets || !salts) return false;
  return state.rounds.every((round, r) => {
    const hash = round.hashes?.[seat];
    if (!hash || round.lost?.[seat]) return true;
    return commitHash(state.sid, r + 1, seat, bets[r], salts[r] ?? '') === hash;
  });
}

export const poRestorable = (saved: PoRoom) => Array.isArray(saved?.seats) && Array.isArray(saved?.board) && Array.isArray(saved?.rounds) && !!saved?.secret;

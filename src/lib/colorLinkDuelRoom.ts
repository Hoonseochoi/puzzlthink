// 컬러 링크 match state, shared by the AI game (played in this browser) and 1:1 rooms (host-authoritative).
// Nothing is hidden in this game, so every browser sees the whole state.
//
// A match is up to 5 rounds; the first to 3 points wins. Round 1's opener comes from a coin toss; after
// that the loser of the last round picks who opens. The opener places one stone, then the players take
// turns placing two stones of different colours (3 minutes a turn; running out loses the round). Instead of
// placing, a player may call the opponent's last placement impossible: the placer then has 5 minutes to
// draw every line. A valid proof wins the round for the placer; giving up or running out of time, for the caller.
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';
import {
  CLD_COLORS, CLD_CELLS, CLD_TARGET, type CldBoard, type CldPaths, checkProof, emptyBoard, legalPlacement, place, stonesToPlace,
} from './colorLinkDuel';

export const CLD_TURN_SEC = 180;
export const CLD_PROOF_SEC = 300;
export const CLD_CHOOSE_SEC = 30;
/** Between rounds: the result stays up until both press "next round" or this runs out. */
export const CLD_BREAK_SEC = 25;
/** Round 1's coin toss plays before the opener's clock starts. */
export const CLD_COIN_MS = 2600;

export type CldSeat = 0 | 1;
export type CldPhase = 'lobby' | 'choose' | 'place' | 'proof' | 'break' | 'finished';
/** proved: the placer's lines held. failed: the placer gave up the proof. proofTimeout / timeout: a clock ran out. */
export type CldEnd = 'proved' | 'failed' | 'proofTimeout' | 'timeout';
export type CldRoundLog = {
  round: number; first: CldSeat; winner: CldSeat; reason: CldEnd; declarer: CldSeat | null;
  board: CldBoard; proof: CldPaths | null; placements: number;
};

export type CldRoom = BaseRoom & {
  phase: CldPhase;
  ai: boolean[];
  round: number; // 1-based
  score: [number, number];
  first: CldSeat; // who opened this round
  chooser: CldSeat | null; // last round's loser, picking the opener (phase 'choose')
  coin: boolean; // this round's opener came from the coin toss
  board: CldBoard;
  turn: CldSeat;
  placements: number; // placements so far this round
  last: { seat: CldSeat; cells: number[] } | null;
  proof: { prover: CldSeat; declarer: CldSeat; draft: CldPaths; at: number } | null;
  log: CldRoundLog[];
  ready: boolean[];
  startedAt: number; // when the current phase started (host clock)
  winner: CldSeat | null;
  reason: 'score' | 'resign' | null;
};

export type CldPlayerAction =
  | { t: 'choose'; first: CldSeat }
  | { t: 'place'; stones: [number, number][] }
  | { t: 'declare' }
  | { t: 'draft'; paths: CldPaths }
  | { t: 'prove'; paths: CldPaths }
  | { t: 'concede' }
  | { t: 'ready' };

export type CldAction =
  | CldPlayerAction
  | { t: 'start' }
  | { t: 'resign' }
  | { t: 'timeout' }
  | { t: 'ai'; act: CldPlayerAction };

export const other = (seat: CldSeat): CldSeat => (seat === 0 ? 1 : 0);
export const isPlaying = (state: CldRoom) => state.phase === 'choose' || state.phase === 'place' || state.phase === 'proof' || state.phase === 'break';

export function createCldRoom(host: Peer, opts: { ai?: boolean; aiName?: string } = {}): CldRoom {
  const seats: Seat[] = [{ id: host.id, name: host.name }, opts.ai ? { id: 'ai', name: opts.aiName ?? 'AI' } : null];
  return {
    sid: newSid(), v: 1, seats, phase: 'lobby', deadline: 0, ai: [false, !!opts.ai],
    round: 1, score: [0, 0], first: 0, chooser: null, coin: false, board: emptyBoard(), turn: 0, placements: 0,
    last: null, proof: null, log: [], ready: [false, false], startedAt: 0, winner: null, reason: null,
  };
}

export const syncCldSeats = (state: CldRoom, peers: Peer[]) => syncSeats(state, peers);

/** Placements must leave this many stones (1 opens a round); 0 means the player can only call 불가능. */
export const toPlace = (state: CldRoom) => stonesToPlace(state.board, state.placements === 0);
/** Whether the player to move may call the last placement impossible. */
export const canDeclare = (state: CldRoom) => state.phase === 'place' && state.placements > 0;

function beginRound(state: CldRoom, first: CldSeat, now: number, coin: boolean): CldRoom {
  return {
    ...state, phase: 'place', first, turn: first, chooser: null, coin, board: emptyBoard(), placements: 0, last: null, proof: null,
    ready: [false, false], startedAt: now, deadline: now + (coin ? CLD_COIN_MS : 0) + CLD_TURN_SEC * 1000,
  };
}

function endRound(state: CldRoom, winner: CldSeat, reason: CldEnd, now: number, proof: CldPaths | null): CldRoom {
  const score: [number, number] = [state.score[0] + (winner === 0 ? 1 : 0), state.score[1] + (winner === 1 ? 1 : 0)];
  const log: CldRoundLog = {
    round: state.round, first: state.first, winner, reason, declarer: state.proof?.declarer ?? null,
    board: state.board, proof, placements: state.placements,
  };
  const base = { ...state, score, log: [...state.log, log], proof: null, startedAt: now };
  if (score[winner] >= CLD_TARGET) return { ...base, phase: 'finished', winner, reason: 'score', deadline: 0 };
  return { ...base, phase: 'break', ready: state.ai.map(Boolean), deadline: now + CLD_BREAK_SEC * 1000 };
}

function nextRound(state: CldRoom, now: number): CldRoom {
  const lastLog = state.log[state.log.length - 1];
  const chooser = other(lastLog.winner);
  return { ...state, phase: 'choose', round: state.round + 1, chooser, ready: [false, false], startedAt: now, deadline: now + CLD_CHOOSE_SEC * 1000, board: emptyBoard(), last: null, placements: 0 };
}

/** Light shape check for lines sent over the network. */
function pathsShape(paths: unknown): paths is CldPaths {
  if (!Array.isArray(paths) || paths.length > CLD_COLORS + 1) return false;
  return paths.every((p) => p === null || (Array.isArray(p) && p.length <= CLD_CELLS && p.every((c) => Number.isInteger(c) && c >= 0 && c < CLD_CELLS)));
}

function act(state: CldRoom, a: CldPlayerAction, seat: CldSeat, now: number): CldRoom | null {
  switch (a.t) {
    case 'choose':
      if (state.phase !== 'choose' || state.chooser !== seat || (a.first !== 0 && a.first !== 1)) return null;
      return beginRound(state, a.first, now, false);
    case 'place': {
      if (state.phase !== 'place' || state.turn !== seat || !legalPlacement(state.board, a.stones, state.placements === 0)) return null;
      return {
        ...state, board: place(state.board, a.stones), placements: state.placements + 1, turn: other(seat),
        last: { seat, cells: a.stones.map(([c]) => c) }, deadline: now + CLD_TURN_SEC * 1000,
      };
    }
    case 'declare':
      if (state.turn !== seat || !canDeclare(state)) return null;
      return { ...state, phase: 'proof', proof: { prover: other(seat), declarer: seat, draft: [], at: now }, startedAt: now, deadline: now + CLD_PROOF_SEC * 1000 };
    case 'draft':
      if (state.phase !== 'proof' || state.proof?.prover !== seat || !pathsShape(a.paths)) return null;
      return { ...state, proof: { ...state.proof, draft: a.paths } };
    case 'prove':
      if (state.phase !== 'proof' || state.proof?.prover !== seat || !pathsShape(a.paths) || !checkProof(state.board, a.paths).ok) return null;
      return endRound(state, seat, 'proved', now, a.paths);
    case 'concede':
      if (state.phase !== 'proof' || state.proof?.prover !== seat) return null;
      return endRound(state, state.proof.declarer, 'failed', now, state.proof.draft);
    case 'ready': {
      if (state.phase !== 'break' || state.ready[seat]) return null;
      const ready = state.ready.map((r, i) => r || i === seat);
      return ready.every(Boolean) ? nextRound({ ...state, ready }, now) : { ...state, ready };
    }
  }
}

export function reduceCldRoom(state: CldRoom, action: CldAction, seat: number | null, isHost: boolean): CldRoom | null {
  const now = Date.now();
  let next: CldRoom | null = null;
  switch (action.t) {
    case 'start': {
      if (!isHost || isPlaying(state) || state.seats.some((s) => !s)) break;
      const fresh: CldRoom = { ...state, sid: state.phase === 'lobby' ? state.sid : newSid(), round: 1, score: [0, 0], log: [], winner: null, reason: null };
      next = beginRound(fresh, Math.random() < 0.5 ? 0 : 1, now, true);
      break;
    }
    case 'ai': {
      const aiSeat = state.ai.indexOf(true);
      if (!isHost || aiSeat < 0) break;
      next = act(state, action.act, aiSeat as CldSeat, now);
      break;
    }
    case 'resign':
      if (!isPlaying(state) || (seat !== 0 && seat !== 1) || state.ai[seat]) break;
      next = { ...state, phase: 'finished', winner: other(seat), reason: 'resign', proof: null, deadline: 0 };
      break;
    case 'timeout':
      if (!isHost || !isPlaying(state) || now < state.deadline) break;
      if (state.phase === 'choose') next = beginRound(state, state.chooser ?? 0, now, false);
      else if (state.phase === 'place') next = endRound(state, other(state.turn), 'timeout', now, null);
      else if (state.phase === 'proof') next = endRound(state, state.proof!.declarer, 'proofTimeout', now, state.proof!.draft);
      else next = nextRound(state, now);
      break;
    default:
      if ((seat !== 0 && seat !== 1) || state.ai[seat]) break;
      next = act(state, action, seat, now);
  }
  return next ? bump(next) : null;
}

export const cldRestorable = (saved: CldRoom) => Array.isArray(saved?.seats) && saved.seats.length === 2 && Array.isArray(saved?.board) && saved.board.length === CLD_CELLS && Array.isArray(saved?.log);

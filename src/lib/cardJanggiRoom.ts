// 카드 장기 match state, shared by the AI game (played in this browser, seat 1 = AI) and 1:1 rooms (host-authoritative).
//
// Secrets: each side's face-down cards. Guests never receive the other side's (`redact` hides every face-down card,
// `privateFor` sends each seat its own layout, encrypted to that seat), and a guest's layout travels to the host
// encrypted (`sealed`). Spectators see only face-up cards.
//
// Clocks (rule 9/13): 90 s to lay out the cards and 90 s per move. A move not made in time is made by the opponent,
// with the late player's face-up card (`proxy`; the opponent has CJ_PROXY_SEC, then a random legal move is played).
// A layout not made in time is dealt at random. CJ_IDLE_LOSS turns in a row on the clock lose the match.
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';
import {
  CJ_MAX_ROUNDS, CJ_WINS, type CjGame, type CjSeat, arrange, currentCard, legalMoves, newRound, other, playMove, randomLayout, redactGame,
} from './cardJanggi';

export const CJ_MOVE_SEC = 90;
export const CJ_LAYOUT_SEC = 90;
export const CJ_PROXY_SEC = 20;
export const CJ_IDLE_LOSS = 3;
/** Before round 1 a player picks 선 or 후: against the AI the human, in a room the seat a coin toss picks. */
export const CJ_CHOOSE_SEC = 30;
/** The round result stays up this long before the next round's layouts start. */
export const CJ_BETWEEN_MS = 4500;

/** A finished round. `history` and `layouts` (every layout each side made, in order) let the tips replay it. */
export type CjRoundResult = { first: CjSeat; winner: CjSeat | 'draw'; reason: CjGame['reason']; plies: number; history?: CjGame['history']; layouts?: number[][][] };

export type CjRoom = BaseRoom & {
  phase: 'lobby' | 'choose' | 'playing' | 'between' | 'finished';
  chooser: CjSeat | null; // phase 'choose': who picks 선/후
  ai: boolean[];
  game: CjGame;
  round: number; // 1-based
  wins: [number, number];
  results: CjRoundResult[];
  proxy: boolean; // the mover ran out of time: the other side picks this move
  idle: [number, number];
  holdUntil: number; // 'between': when the next round starts
  coinAt: number; // when round 1's coin was tossed (drives the toss animation)
  winner: CjSeat | 'draw' | null;
  reason: 'rounds' | 'resign' | 'idle' | null;
};

export type CjAction =
  | { t: 'start' }
  | { t: 'choose'; first: CjSeat }
  | { t: 'arrange'; order: number[] }
  | { t: 'move'; from: number; to: number }
  | { t: 'ai'; order?: number[]; from?: number; to?: number }
  | { t: 'next' }
  | { t: 'resign' }
  | { t: 'timeout' };

export const cjPlaying = (state: CjRoom) => state.phase === 'playing' || state.phase === 'choose';
/** Who picks 선/후 before round 1: the human against the AI, else a coin toss. */
export const cjFirstChooser = (state: Pick<CjRoom, 'ai'>): CjSeat => (state.ai[1] ? 0 : state.ai[0] ? 1 : Math.random() < 0.5 ? 0 : 1);

export function createCjRoom(host: Peer, opts: { ai?: boolean; aiName?: string } = {}): CjRoom {
  const seats: Seat[] = [{ id: host.id, name: host.name }, opts.ai ? { id: 'ai', name: opts.aiName ?? 'AI' } : null];
  return {
    sid: newSid(), v: 1, seats, phase: 'lobby', deadline: 0, ai: [false, !!opts.ai], game: newRound(0), round: 1, wins: [0, 0], results: [],
    proxy: false, idle: [0, 0], holdUntil: 0, coinAt: 0, winner: null, reason: null, chooser: null,
  };
}

export const syncCjSeats = (state: CjRoom, peers: Peer[]) => syncSeats(state, peers);

/** Puts a new game state in and sets the clock for whatever comes next. */
function withGame(state: CjRoom, game: CjGame, now: number, proxy = false): CjRoom {
  if (game.phase === 'over') return endRound({ ...state, game, proxy: false }, now);
  const seconds = proxy ? CJ_PROXY_SEC : game.phase === 'arrange' ? CJ_LAYOUT_SEC : CJ_MOVE_SEC;
  return { ...state, game, proxy, deadline: now + seconds * 1000 };
}

function endRound(state: CjRoom, now: number): CjRoom {
  const g = state.game;
  const layouts = [0, 1].map((s) => [...(g.past?.[s] ?? []), ...(g.seq[s]?.length ? [g.seq[s]] : [])]);
  const result: CjRoundResult = { first: g.first, winner: g.winner ?? 'draw', reason: g.reason, plies: g.ply, history: g.history, layouts };
  const wins: [number, number] = [state.wins[0] + (g.winner === 0 ? 1 : 0), state.wins[1] + (g.winner === 1 ? 1 : 0)];
  const results = [...state.results, result];
  const decided = wins[0] >= CJ_WINS || wins[1] >= CJ_WINS;
  if (decided || results.length >= CJ_MAX_ROUNDS) {
    const winner: CjSeat | 'draw' = wins[0] === wins[1] ? 'draw' : wins[0] > wins[1] ? 0 : 1;
    return { ...state, wins, results, phase: 'finished', winner, reason: 'rounds', deadline: 0 };
  }
  return { ...state, wins, results, phase: 'between', holdUntil: now + CJ_BETWEEN_MS, deadline: 0 };
}

function startRound(state: CjRoom, first: CjSeat, now: number, pause = 0): CjRoom {
  return { ...state, phase: 'playing', chooser: null, game: newRound(first), proxy: false, deadline: now + pause + CJ_LAYOUT_SEC * 1000 };
}

const setAt = (pair: [number, number], i: number, value: number): [number, number] => (i === 0 ? [value, pair[1]] : [pair[0], value]);
const acted = (state: CjRoom, seat: number): CjRoom => (state.idle[seat] ? { ...state, idle: setAt(state.idle, seat, 0) } : state);

/** A pause for the coin toss before round 1's layout clock starts. */
export const CJ_COIN_MS = 2600;

export function reduceCjRoom(state: CjRoom, action: CjAction, seat: number | null, isHost: boolean): CjRoom | null {
  const now = Date.now();
  const g = state.game;
  const mine = seat === 0 || seat === 1;
  let next: CjRoom | null = null;
  switch (action.t) {
    case 'start': {
      if (!isHost || state.phase === 'playing' || state.phase === 'choose' || state.phase === 'between' || state.seats.some((s) => !s)) break;
      next = {
        ...state, sid: state.phase === 'lobby' ? state.sid : newSid(), round: 1, wins: [0, 0], results: [], idle: [0, 0], winner: null, reason: null, coinAt: 0,
        phase: 'choose', chooser: cjFirstChooser(state), game: newRound(0), proxy: false, deadline: now + CJ_CHOOSE_SEC * 1000,
      };
      break;
    }
    case 'choose':
      if (!mine || state.phase !== 'choose' || seat !== state.chooser || state.ai[seat] || (action.first !== 0 && action.first !== 1)) break;
      next = startRound(state, action.first, now);
      break;
    case 'arrange': {
      if (!mine || state.phase !== 'playing' || state.ai[seat]) break;
      const game = arrange(g, seat as CjSeat, action.order);
      if (game) next = withGame(acted(state, seat), game, now);
      break;
    }
    case 'move': {
      if (!mine || state.phase !== 'playing' || g.phase !== 'move') break;
      // The mover plays its own card; after a timeout the opponent plays it for them.
      const actor = state.proxy ? other(g.turn) : g.turn;
      if (seat !== actor || state.ai[seat]) break;
      const game = playMove(g, action.from, action.to, state.proxy);
      if (game) next = withGame(acted(state, seat), game, now);
      break;
    }
    case 'ai': {
      if (!isHost || state.phase !== 'playing') break;
      const aiSeat = state.ai.findIndex(Boolean) as CjSeat;
      if (aiSeat < 0) break;
      if (action.order && g.phase === 'arrange' && g.arranging[aiSeat]) {
        const game = arrange(g, aiSeat, action.order);
        if (game) next = withGame(state, game, now);
      } else if (typeof action.from === 'number' && typeof action.to === 'number' && g.phase === 'move') {
        const actor = state.proxy ? other(g.turn) : g.turn;
        if (actor !== aiSeat) break;
        const game = playMove(g, action.from, action.to, state.proxy);
        if (game) next = withGame(state, game, now);
      }
      break;
    }
    case 'next':
      if (!isHost || state.phase !== 'between' || now < state.holdUntil) break;
      next = startRound({ ...state, round: state.round + 1 }, other(g.first), now);
      break;
    case 'resign':
      if (!mine || (state.phase !== 'playing' && state.phase !== 'choose' && state.phase !== 'between')) break;
      next = { ...state, phase: 'finished', winner: other(seat), reason: 'resign', deadline: 0 };
      break;
    case 'timeout': {
      if (!isHost || now < state.deadline) break;
      if (state.phase === 'choose') { next = startRound(state, state.chooser ?? 0, now); break; }
      if (state.phase !== 'playing') break;
      if (g.phase === 'arrange') {
        let game = g;
        let counted = state;
        for (const s of [0, 1] as CjSeat[]) {
          if (!game.arranging[s] || state.ai[s]) continue;
          game = arrange(game, s, randomLayout(game, s)) ?? game;
          counted = { ...counted, idle: setAt(counted.idle, s, counted.idle[s] + 1) };
        }
        next = idleLoss(counted) ?? withGame(counted, game, now);
      } else if (g.phase === 'move' && !state.proxy) {
        const late = g.turn;
        if (state.ai[late]) break;
        const counted = { ...state, idle: setAt(state.idle, late, state.idle[late] + 1) };
        next = idleLoss(counted) ?? { ...counted, proxy: true, deadline: now + CJ_PROXY_SEC * 1000 };
      } else if (g.phase === 'move') {
        // The opponent did not pick either: a random legal move with the late player's card.
        if (state.ai[other(g.turn)]) break;
        const moves = legalMoves(g.board, g.turn, currentCard(g, g.turn));
        const pick = moves[Math.floor(Math.random() * moves.length)];
        const game = pick ? playMove(g, pick[0], pick[1], true) : null;
        if (game) next = withGame(state, game, now);
      }
      break;
    }
  }
  return next ? bump(next) : null;
}

function idleLoss(state: CjRoom): CjRoom | null {
  const idler = ([0, 1] as CjSeat[]).find((s) => state.idle[s] >= CJ_IDLE_LOSS && !state.ai[s]);
  return idler === undefined ? null : { ...state, phase: 'finished', winner: other(idler), reason: 'idle', deadline: 0 };
}

/** Host-run step: the next round once the last one's result has been shown. */
export const cjAutoAction = (state: CjRoom): CjAction | null => (state.phase === 'between' && Date.now() >= state.holdUntil ? { t: 'next' } : null);

/** What guests receive: no face-down card of either side. */
export const redactCjRoom = (state: CjRoom): CjRoom => ({ ...state, game: redactGame(state.game, null) });

/** A seat's own layout, sent to that seat only. */
export const cjPrivateFor = (state: CjRoom, seat: number) => ({ round: state.round, cycle: state.game.cycle[seat], seq: state.game.seq[seat] });

export function cjWithPrivate(state: CjRoom, secret: unknown, seat: number): CjRoom {
  const s = secret as { round?: number; cycle?: number; seq?: number[] } | null;
  if (!s || s.round !== state.round || s.cycle !== state.game.cycle[seat] || !Array.isArray(s.seq)) return state;
  if (s.seq.length !== state.game.seq[seat]?.length) return state;
  return { ...state, game: { ...state.game, seq: state.game.seq.map((q, i) => (i === seat ? s.seq! : q)) } };
}

export const cjRestorable = (saved: CjRoom) => Array.isArray(saved?.seats) && !!saved?.game && Array.isArray(saved.game.board) && Array.isArray(saved.results);

/** Who has to act now (for the turn haptic and the clock label): layouts, the mover, or the proxy chooser. */
export function cjWaitingOn(state: CjRoom): number[] {
  if (state.phase !== 'playing') return [];
  const g = state.game;
  if (g.phase === 'arrange') return [0, 1].filter((s) => g.arranging[s]);
  if (g.phase === 'move') return [state.proxy ? other(g.turn) : g.turn];
  return [];
}

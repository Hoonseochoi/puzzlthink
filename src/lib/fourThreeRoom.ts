// Room for 4인 3목: three players against one Special Guest, all on the host's browser.
// Lobby seats hold the people (up to three). At the start, empty seats become ally AI players and the
// guest (always an AI) joins at a random colour. The same reducer runs the solo game (you + two ally AI).
// Four rounds: a round's sole winner takes three pieces. The players' mission is to win every round:
// a guest line (alone or shared) or a round with no line fails it. Afterwards the two players with
// the most pieces go through.
import { type FtState, type Move, type Seat as Colour, ROUNDS, WIN_REWARD, canMove, chooseMove, legalMoves, newRound, pass, play, toMove } from './fourThree';
import { type AwayFields, clearMiss, giveBack, humansBack, noteMiss, resetAway, seatDueForAway, takeOver, trackPresence } from './roomAway';
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';

export const FT_TURN_OPTIONS = [90, 60, 30] as const;
export type FtTurnSec = (typeof FT_TURN_OPTIONS)[number];
export const FT_HUMANS = 3;
export const ROUND_BREAK_MS = 5000;
const ALLY_NAMES = { ko: ['토끼', '여우'], en: ['Rabbit', 'Fox'] };
const GUEST_NAME = { ko: '스페셜 게스트', en: 'Special Guest' };

export type FtRoundResult = { winners: number[]; guest: number };

export type FtRoom = BaseRoom & AwayFields & {
  phase: 'lobby' | 'playing' | 'roundEnd' | 'finished';
  turnSec: FtTurnSec;
  /** Seat (= colour: 0 red, 1 yellow, 2 green, 3 blue) of the Special Guest; -1 in the lobby. */
  guest: number;
  round: number;
  game: FtState;
  pieces: number[];
  results: FtRoundResult[];
  breakEnd: number;
  solo?: boolean;
  lang?: 'ko' | 'en';
};

export type FtAction =
  | { t: 'config'; turnSec?: FtTurnSec }
  | { t: 'start' }
  | { t: 'move'; move: Move }
  | { t: 'auto' }
  | { t: 'timeout' }
  | { t: 'next' }
  | { t: 'away'; seat: number }
  | { t: 'rejoin' };

const isAiSeat = (seat: Seat) => !!seat && seat.id.startsWith('ai-');

export function createFtRoom(host: Peer, opts: { solo?: boolean; lang?: 'ko' | 'en' } = {}): FtRoom {
  const room: FtRoom = {
    sid: newSid(), v: 1, seats: [{ id: host.id, name: host.name }, null, null], phase: 'lobby', deadline: 0,
    turnSec: 90, guest: -1, round: 0, game: newRound(0), pieces: [0, 0, 0, 0], results: [], breakEnd: 0,
    ai: [false, false, false], solo: opts.solo, lang: opts.lang ?? 'ko',
  };
  return opts.solo ? start(room) : room;
}

export function syncFtSeats(state: FtRoom, peers: Peer[]): FtRoom {
  const synced = syncSeats(state, peers);
  return synced.phase === 'playing' ? trackPresence(synced, peers) : synced;
}

const withClock = (state: FtRoom): FtRoom => ({ ...state, deadline: Date.now() + state.turnSec * 1000 });

/** People keep their seats, empty seats get ally AI players, and the guest sits down at a random colour. */
function start(state: FtRoom): FtRoom {
  const lang = state.lang ?? 'ko';
  const people = state.seats.slice(0, FT_HUMANS);
  let n = 0;
  const players: Seat[] = people.map((s) => (s && !isAiSeat(s) ? s : { id: `ai-${n}`, name: ALLY_NAMES[lang][n++] ?? `AI ${n}` }));
  // Solo: you stay on seat 0 (red), which is the seat the local room acts for.
  const guest = state.solo ? 1 + Math.floor(Math.random() * 3) : Math.floor(Math.random() * 4);
  const seats = [...players];
  seats.splice(guest, 0, { id: 'ai-guest', name: GUEST_NAME[lang] });
  const ai = seats.map(isAiSeat);
  return withClock({
    ...state, sid: newSid(), phase: 'playing', seats, ai, guest, round: 0, game: newRound(0), pieces: [0, 0, 0, 0], results: [], breakEnd: 0,
    ...resetAway(4),
  });
}

/** Back to the lobby layout (three people's seats) for a rematch. */
function toLobbySeats(state: FtRoom): FtRoom {
  if (state.guest < 0) return state;
  const base = humansBack(state);
  const keep = base.seats.map((s, i) => (i === base.guest || base.ai[i] ? null : s));
  keep.splice(base.guest, 1);
  return { ...base, seats: keep, ai: keep.map(() => false), guest: -1 };
}

function afterAction(state: FtRoom, game: FtState): FtRoom {
  if (!game.winners) return withClock({ ...state, game });
  const pieces = [...state.pieces];
  if (game.winners.length === 1) pieces[game.winners[0]] += WIN_REWARD;
  const results = [...state.results, { winners: game.winners, guest: state.guest }];
  const over = results.length >= ROUNDS;
  return { ...state, game, pieces, results, phase: over ? 'finished' : 'roundEnd', deadline: 0, breakEnd: over ? 0 : Date.now() + ROUND_BREAK_MS };
}

export function reduceFtRoom(state: FtRoom, action: FtAction, seat: number | null, isHost: boolean): FtRoom | null {
  let next: FtRoom | null = null;
  const current = state.phase === 'playing' ? toMove(state.game) : -1;
  switch (action.t) {
    case 'config':
      if (!isHost || state.phase === 'playing' || state.phase === 'roundEnd') break;
      if (action.turnSec && (FT_TURN_OPTIONS as readonly number[]).includes(action.turnSec)) next = { ...state, turnSec: action.turnSec };
      break;
    case 'start':
      if (!isHost || state.phase === 'playing' || state.phase === 'roundEnd') break;
      next = start(state.phase === 'finished' ? toLobbySeats(state) : state);
      break;
    case 'move': {
      if (state.phase !== 'playing' || seat !== current || state.ai[seat] || !action.move) break;
      const legal = legalMoves(state.game.board, state.game.hand, current as Colour);
      const m = action.move;
      const ok = legal.find((l) => l.kind === m.kind && l.to === m.to && (l.kind === 'place' || (m.kind === 'move' && l.from === m.from)));
      if (!ok) break;
      next = afterAction(clearMiss(state, seat), play(state.game, ok));
      break;
    }
    case 'auto': {
      // An AI seat moves, or a player with nothing legal passes.
      if (!isHost || state.phase !== 'playing') break;
      if (!state.ai[current] && canMove(state.game)) break;
      const m = state.ai[current] ? chooseMove(state.game, state.guest as Colour) : null;
      next = afterAction(state, m ? play(state.game, m) : pass(state.game));
      break;
    }
    case 'timeout': {
      if (!isHost || state.phase !== 'playing' || Date.now() < state.deadline || state.ai[current]) break;
      next = afterAction(state.solo ? state : noteMiss(state, current), pass(state.game));
      break;
    }
    case 'next': {
      if (!isHost || state.phase !== 'roundEnd' || Date.now() < state.breakEnd) break;
      const round = state.round + 1;
      next = withClock({ ...state, phase: 'playing', round, game: newRound(round), breakEnd: 0 });
      break;
    }
    case 'away':
      if (!isHost || state.phase !== 'playing' || seatDueForAway(state) !== action.seat) break;
      next = takeOver(state, action.seat);
      break;
    case 'rejoin':
      if (seat === null) break;
      next = giveBack(state, seat);
      break;
  }
  return next ? bump(next) : null;
}

/** Host clock: round breaks, away seats, AI moves and forced passes (one step per tick). */
export function ftAutoAction(state: FtRoom): FtAction | null {
  if (state.phase === 'roundEnd') return Date.now() >= state.breakEnd ? { t: 'next' } : null;
  if (state.phase !== 'playing') return null;
  const gone = seatDueForAway(state);
  if (gone !== null) return { t: 'away', seat: gone };
  const current = toMove(state.game);
  return state.ai[current] || !canMove(state.game) ? { t: 'auto' } : null;
}

// ─── Reading the result ─────────────────────────────────────────────────────────

/** A round counts for the players when someone other than the guest made the only line(s). */
export const playersWonRound = (r: FtRoundResult) => r.winners.length > 0 && !r.winners.includes(r.guest);
export const missionFailed = (state: FtRoom) => state.results.some((r) => !playersWonRound(r));
export const missionSucceeded = (state: FtRoom) => state.phase === 'finished' && !missionFailed(state);

/** Player seats (not the guest), most pieces first. */
export const playerRanking = (state: FtRoom): number[] =>
  [0, 1, 2, 3].filter((s) => s !== state.guest).sort((a, b) => state.pieces[b] - state.pieces[a]);

/** The players who go through: the top two by pieces (everyone level with second place goes too), never with zero. */
export function finalists(state: FtRoom): number[] {
  const order = playerRanking(state);
  const line = state.pieces[order[1]];
  return order.filter((s) => state.pieces[s] >= line && state.pieces[s] > 0);
}

/** A person's result: a win means the mission held and they finished in the top two. */
export function outcomeFor(state: FtRoom, seat: number): 'win' | 'loss' {
  return missionSucceeded(state) && finalists(state).includes(seat) ? 'win' : 'loss';
}

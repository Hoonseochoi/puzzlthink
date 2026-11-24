import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';
import { type AwayFields, clearMiss, giveBack, humansBack, noteMiss, resetAway, seatDueForAway, takeOver, trackPresence } from './roomAway';
import {
  type HitStay, type HsAction, type HsStyle, HS_PERSONA, HS_PLAYERS, HS_STYLES,
  applyHsAction, chooseHsAction, hitStaySecret, hsPicking, hsTimeoutAction, newHitStay, redactHitStay, startRound, withHitStaySecret,
} from './hitStay';

export const HS_TURN_OPTIONS = [20, 30, 45] as const;
export type HsTurnSec = (typeof HS_TURN_OPTIONS)[number] | 0;
/** How long the showdown stays on screen before the next round is dealt. */
export const HS_SHOWDOWN_MS = 5200;
/** Pauses after a move so everyone can follow it (a HIT/STAY gets the longest look). */
const HOLD_MS = { hit: 1500, bet: 900, pick: 500, round: 2100 } as const;

export type HitStayRoom = BaseRoom & AwayFields & {
  phase: 'lobby' | 'playing' | 'finished';
  ai: boolean[];
  style: (HsStyle | null)[]; // persona of each AI seat (kept when the AI takes over an away player's seat)
  turnSec: HsTurnSec;
  game: HitStay;
  holdUntil: number; // no AI move or next round before this (host clock)
};

export type HitStayRoomAction =
  | { t: 'config'; turnSec?: HsTurnSec }
  | { t: 'start' }
  | { t: 'act'; action: HsAction }
  | { t: 'ai' }
  | { t: 'next' } // host: deal the next round after the showdown
  | { t: 'timeout' }
  | { t: 'away'; seat: number }
  | { t: 'rejoin' };

export function createHitStayRoom(host: Peer, opts: { solo?: boolean } = {}): HitStayRoom {
  const seats: Seat[] = Array(HS_PLAYERS).fill(null);
  seats[0] = { id: host.id, name: host.name };
  const room: HitStayRoom = {
    sid: newSid(), v: 1, seats, phase: 'lobby', deadline: 0, holdUntil: 0,
    ai: Array(HS_PLAYERS).fill(false), style: Array(HS_PLAYERS).fill(null), turnSec: opts.solo ? 0 : 30,
    game: newHitStay(),
  };
  return opts.solo ? startRoom(room, false) : room;
}

export const syncHitStaySeats = (state: HitStayRoom, peers: Peer[]) => trackPresence(syncSeats(state, peers), peers);

function startRoom(state: HitStayRoom, shuffleHumans = true): HitStayRoom {
  let entries = state.seats.map((seat, i) => ({ seat, ai: state.ai[i] })).filter((entry) => entry.seat && !entry.ai);
  if (shuffleHumans) entries = entries.sort(() => Math.random() - 0.5);
  // Empty seats get personas in a random order, so every table has a different mix.
  const styles = shuffleStyles();
  const filled: { seat: Seat; ai: boolean; style: HsStyle | null }[] = entries.map((e) => ({ ...e, style: null }));
  while (filled.length < HS_PLAYERS) {
    const style = styles.shift()!;
    filled.push({ seat: { id: `ai-${style}`, name: HS_PERSONA[style].name }, ai: true, style });
  }
  // Humans whose seat the AI may later play for still get a persona to play with.
  const spare = shuffleStyles();
  return withGame({
    ...state, seats: filled.map((entry) => entry.seat), ai: filled.map((entry) => entry.ai),
    style: filled.map((entry) => entry.style ?? spare.find((st) => !filled.some((f) => f.style === st)) ?? 'calc'),
    phase: 'playing', ...resetAway(HS_PLAYERS),
  }, newHitStay(), HOLD_MS.round);
}

const shuffleStyles = () => [...HS_STYLES].sort(() => Math.random() - 0.5);
const styleOf = (state: HitStayRoom, seat: number): HsStyle => state.style?.[seat] ?? 'calc';

/** Puts a new game state in and resets the clocks: the turn clock runs only while a human has to act. */
function withGame(state: HitStayRoom, game: HitStay, hold: number): HitStayRoom {
  const done = game.phase === 'finished';
  const timed = !!state.turnSec && !done && game.phase !== 'showdown';
  const now = Date.now();
  return {
    ...state, game, phase: done ? 'finished' : 'playing',
    holdUntil: now + (game.phase === 'showdown' || game.phase === 'finished' ? HS_SHOWDOWN_MS : hold),
    // A new round starts with the limit roll, so its clock starts after that.
    deadline: timed ? now + hold + state.turnSec * 1000 : Number.MAX_SAFE_INTEGER,
  };
}

const holdFor = (action: HsAction, before: HitStay, after: HitStay) =>
  after.round !== before.round ? HOLD_MS.round
    : action.kind === 'hit' || action.kind === 'stay' ? HOLD_MS.hit
      : action.kind === 'open' ? HOLD_MS.pick : HOLD_MS.bet;

/** Seats whose move it is: everyone still picking, or the one player to bet / hit. */
export function hsWaitingOn(game: HitStay): number[] {
  if (game.phase === 'pick') return hsPicking(game);
  if (game.phase === 'bet1' || game.phase === 'bet2' || game.phase === 'hit') return game.turn >= 0 ? [game.turn] : [];
  return [];
}

export function reduceHitStayRoom(state: HitStayRoom, action: HitStayRoomAction, seat: number | null, isHost: boolean): HitStayRoom | null {
  let next: HitStayRoom | null = null;
  const g = state.game;
  switch (action.t) {
    case 'config':
      if (isHost && state.phase === 'lobby') next = { ...state, turnSec: action.turnSec ?? state.turnSec };
      break;
    case 'start':
      if (!isHost || state.phase === 'playing') break;
      { const base = humansBack(state); next = startRoom(state.phase === 'finished' ? { ...base, seats: base.seats.map((value, i) => (base.ai[i] ? null : value)) } : state, !!state.turnSec); }
      break;
    case 'act': {
      if (seat === null || state.ai[seat] || state.phase !== 'playing') break;
      const game = applyHsAction(g, seat, action.action);
      if (game) {
        // Picking the face-up card happens all at once: the others' clocks keep running.
        const keepClock = action.action.kind === 'open' && game.phase === 'pick';
        next = withGame(clearMiss(state, seat), game, holdFor(action.action, g, game));
        if (keepClock) next = { ...next, deadline: state.deadline };
      }
      break;
    }
    case 'ai': {
      if (!isHost || state.phase !== 'playing' || Date.now() < state.holdUntil) break;
      const actor = hsWaitingOn(g).find((s) => state.ai[s]);
      if (actor === undefined) break;
      const move = chooseHsAction(g, actor, styleOf(state, actor));
      const game = applyHsAction(g, actor, move);
      if (game) {
        next = withGame(state, game, holdFor(move, g, game));
        if (move.kind === 'open' && game.phase === 'pick') next = { ...next, deadline: state.deadline };
      }
      break;
    }
    case 'next':
      if (!isHost || state.phase !== 'playing' || g.phase !== 'showdown' || Date.now() < state.holdUntil) break;
      next = withGame(state, startRound(g), HOLD_MS.round);
      break;
    case 'timeout': {
      if (!isHost || state.phase !== 'playing' || !state.turnSec || Date.now() < state.deadline) break;
      const late = hsWaitingOn(g).filter((s) => !state.ai[s]);
      if (!late.length) break;
      let counted = state;
      let game: HitStay | null = g;
      for (const s of late) {
        counted = noteMiss(counted, s);
        // A seat the AI just took over plays this move at the room's level; otherwise the safe default.
        const move: HsAction = counted.ai[s] ? chooseHsAction(game!, s, styleOf(state, s)) : hsTimeoutAction(game!, s);
        game = applyHsAction(game!, s, move) ?? game;
      }
      if (game && game !== g) next = withGame(counted, game, HOLD_MS.bet);
      break;
    }
    case 'away':
      if (!isHost || state.phase !== 'playing' || seatDueForAway(state) !== action.seat) break;
      next = takeOver(state, action.seat);
      break;
    case 'rejoin':
      if (seat === null || state.phase !== 'playing') break;
      next = giveBack(state, seat);
      break;
  }
  return next ? bump(next) : null;
}

/** Host-run steps: hand away seats to the AI, AI moves, and the next round after the showdown. */
export function hitStayAutoAction(state: HitStayRoom): HitStayRoomAction | null {
  if (state.phase !== 'playing') return null;
  const gone = seatDueForAway(state);
  if (gone !== null) return { t: 'away', seat: gone };
  if (Date.now() < state.holdUntil) return null;
  if (state.game.phase === 'showdown') return { t: 'next' };
  return hsWaitingOn(state.game).some((s) => state.ai[s]) ? { t: 'ai' } : null;
}

export const redactHitStayRoom = (state: HitStayRoom): HitStayRoom => ({ ...state, game: redactHitStay(state.game) });
export const hitStayRoomSecret = (state: HitStayRoom, seat: number) => hitStaySecret(state.game, seat);
export const withHitStayRoomSecret = (state: HitStayRoom, secret: unknown, seat: number): HitStayRoom => ({ ...state, game: withHitStaySecret(state.game, secret, seat) });

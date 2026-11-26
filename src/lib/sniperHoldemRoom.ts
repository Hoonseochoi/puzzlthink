import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';
import { type AwayFields, clearMiss, giveBack, humansBack, resetAway, seatDueForAway, takeOver, trackPresence } from './roomAway';
import {
  type ShAction, type ShAnteRule, type ShChips, type SniperHoldem, SH_CHIPS_SHOW, SH_SEATS,
  applyShAction, newSniperHoldem, redactSniperHoldem, shTimeoutAction, sniperHoldemSecret, startRound, withSniperHoldemSecret,
} from './sniperHoldem';
import { type ShLevel, type ShStyle, SH_PERSONA, SH_STYLES, chooseShAction } from './sniperHoldemAi';

/**
 * Seconds a player in a friend or open room has for a bet or a snipe. The last SH_WARN_SEC show a warning; when they
 * run out the AI takes the seat (and plays that move) until the player comes back. The AI match has no clock.
 */
export const SH_TURN_SEC = 30;
export const SH_WARN_SEC = 10;
export type ShTurnSec = typeof SH_TURN_SEC | 0;
/** How long the showdown (snipes, cards, chips moving) stays up before the next deal. */
export const SH_SHOWDOWN_MS = 6500;
/** Pauses after a move so everyone can follow it. */
const HOLD_MS = { bet: 900, board: 1500, snipe: 1400, round: 1400 } as const;

export type SniperHoldemRoom = BaseRoom & AwayFields & {
  phase: 'lobby' | 'playing' | 'finished';
  style: (ShStyle | null)[]; // persona of each AI seat (also used when the AI plays for an away player)
  level: ShLevel; // how strong the AI seats play
  chips: ShChips; // starting chips: 60 (the show) or 24 (quick table)
  turnSec: ShTurnSec;
  game: SniperHoldem;
  holdUntil: number; // no AI move or next round before this (host clock)
  /** Rooms: fill empty seats with AI up to five (default), or play with just the people there (2–5). */
  fillAi?: boolean;
  /** Rising ante (default) or the broadcast's fixed 1 chip; the host picks it in a room's lobby. */
  anteRule?: ShAnteRule;
  /** AI match: how many players at the table (2 = 1:1, 5 = the show). */
  size?: number;
};

export type SniperHoldemRoomAction =
  | { t: 'start' }
  | { t: 'fillAi'; on: boolean } // host, in the lobby
  | { t: 'chips'; chips: ShChips } // host, in the lobby
  | { t: 'level'; level: ShLevel } // host, in the lobby
  | { t: 'ante'; rule: ShAnteRule } // host, in the lobby
  | { t: 'act'; action: ShAction }
  | { t: 'ai' }
  | { t: 'next' } // host: deal the next round after the showdown
  | { t: 'timeout' }
  | { t: 'away'; seat: number }
  | { t: 'rejoin' };

export function createSniperHoldemRoom(host: Peer, opts: { solo?: boolean; level?: ShLevel; size?: number; chips?: ShChips } = {}): SniperHoldemRoom {
  const seats: Seat[] = Array(SH_SEATS).fill(null);
  seats[0] = { id: host.id, name: host.name };
  const room: SniperHoldemRoom = {
    sid: newSid(), v: 1, seats, phase: 'lobby', deadline: 0, holdUntil: 0,
    ai: Array(SH_SEATS).fill(false), style: Array(SH_SEATS).fill(null), level: opts.level ?? 'normal',
    chips: opts.chips ?? SH_CHIPS_SHOW, anteRule: 'rise', turnSec: opts.solo ? 0 : SH_TURN_SEC, size: opts.size,
    game: newSniperHoldem(),
  };
  return opts.solo ? startRoom(room, false) : room;
}

export const syncSniperHoldemSeats = (state: SniperHoldemRoom, peers: Peer[]) => trackPresence(syncSeats(state, peers), peers);
const shuffleStyles = () => [...SH_STYLES].sort(() => Math.random() - 0.5);
const styleOf = (state: SniperHoldemRoom, seat: number): ShStyle => state.style?.[seat] ?? 'ace';

function startRoom(state: SniperHoldemRoom, shuffleHumans = true): SniperHoldemRoom {
  let entries = state.seats.map((seat, i) => ({ seat, ai: state.ai[i] })).filter((entry) => entry.seat && !entry.ai);
  if (shuffleHumans) entries = entries.sort(() => Math.random() - 0.5);
  const styles = shuffleStyles();
  const filled: { seat: Seat; ai: boolean; style: ShStyle | null }[] = entries.map((e) => ({ ...e, style: null }));
  const people = filled.length;
  // The AI match seats `size` players; rooms fill up to five with AI, or leave the seats empty without AI.
  const want = state.size ?? SH_SEATS;
  while (filled.length < SH_SEATS) {
    const style = styles.shift()!;
    if (state.fillAi === false || filled.length >= want) { filled.push({ seat: null, ai: false, style }); continue; }
    filled.push({ seat: { id: `ai-${style}`, name: SH_PERSONA[style].name }, ai: true, style });
  }
  const spare = shuffleStyles();
  return withGame({
    ...state, seats: filled.map((entry) => entry.seat), ai: filled.map((entry) => entry.ai),
    style: filled.map((entry) => entry.style ?? spare.find((st) => !filled.some((f) => f.style === st)) ?? 'ace'),
    phase: 'playing', ...resetAway(SH_SEATS),
  }, newSniperHoldem(filled.map((entry, i) => i < people || entry.ai), state.chips, undefined, state.anteRule ?? 'rise'), HOLD_MS.round);
}

/** Puts a new game state in and resets the clocks (bets and snipes are timed in rooms only). */
function withGame(state: SniperHoldemRoom, game: SniperHoldem, hold: number): SniperHoldemRoom {
  const done = game.phase === 'finished';
  const between = done || game.phase === 'showdown';
  const now = Date.now();
  return {
    ...state, game, phase: done ? 'finished' : 'playing',
    holdUntil: now + (between ? SH_SHOWDOWN_MS : hold),
    deadline: !between && state.turnSec ? now + hold + state.turnSec * 1000 : Number.MAX_SAFE_INTEGER,
  };
}

const holdFor = (action: ShAction, before: SniperHoldem, after: SniperHoldem) =>
  after.round !== before.round ? HOLD_MS.round
    : after.shown !== before.shown ? HOLD_MS.board
      : action.kind === 'snipe' || action.kind === 'pass' || after.phase === 'snipe' && before.phase !== 'snipe' ? HOLD_MS.snipe : HOLD_MS.bet;

/** People in the room's seats (the AI seats of a finished game do not count). */
export const shPeople = (state: SniperHoldemRoom) => state.seats.filter((seat, i) => seat && !state.ai[i]).length;

/** Seat whose move it is (bet or snipe), if any. */
export function shWaitingOn(game: SniperHoldem): number[] {
  return (game.phase === 'bet1' || game.phase === 'bet2' || game.phase === 'snipe') && game.turn >= 0 ? [game.turn] : [];
}

export function reduceSniperHoldemRoom(state: SniperHoldemRoom, action: SniperHoldemRoomAction, seat: number | null, isHost: boolean): SniperHoldemRoom | null {
  let next: SniperHoldemRoom | null = null;
  const g = state.game;
  switch (action.t) {
    case 'fillAi':
      if (!isHost || state.phase === 'playing') break;
      next = { ...state, fillAi: action.on };
      break;
    case 'chips':
      if (!isHost || state.phase === 'playing' || (action.chips !== 60 && action.chips !== 24)) break;
      next = { ...state, chips: action.chips };
      break;
    case 'ante':
      if (!isHost || state.phase === 'playing' || (action.rule !== 'rise' && action.rule !== 'fixed')) break;
      next = { ...state, anteRule: action.rule };
      break;
    case 'level':
      if (!isHost || state.phase === 'playing' || !['easy', 'normal', 'hard'].includes(action.level)) break;
      next = { ...state, level: action.level };
      break;
    case 'start':
      if (!isHost || state.phase === 'playing') break;
      // Seats the AI only stood in for (away players) count as people again for a rematch.
      if (state.fillAi === false && shPeople(humansBack(state)) < 2) break;
      { const base = humansBack(state); next = startRoom(state.phase === 'finished' ? { ...base, seats: base.seats.map((value, i) => (base.ai[i] ? null : value)) } : state, !!state.turnSec); }
      break;
    case 'act': {
      if (seat === null || state.ai[seat] || state.phase !== 'playing') break;
      const game = applyShAction(g, seat, action.action);
      if (game) next = withGame(clearMiss(state, seat), game, holdFor(action.action, g, game));
      break;
    }
    case 'ai': {
      if (!isHost || state.phase !== 'playing' || Date.now() < state.holdUntil) break;
      const actor = shWaitingOn(g).find((s) => state.ai[s]);
      if (actor === undefined) break;
      const move = chooseShAction(g, actor, state.level, styleOf(state, actor));
      const game = applyShAction(g, actor, move) ?? applyShAction(g, actor, shTimeoutAction(g, actor));
      if (game) next = withGame(state, game, holdFor(move, g, game));
      break;
    }
    case 'next':
      if (!isHost || state.phase !== 'playing' || g.phase !== 'showdown' || Date.now() < state.holdUntil) break;
      next = withGame(state, startRound(g), HOLD_MS.round);
      break;
    case 'timeout': {
      if (!isHost || state.phase !== 'playing' || !state.turnSec || Date.now() < state.deadline) break;
      const late = shWaitingOn(g).filter((s) => !state.ai[s]);
      if (!late.length) break;
      // Sitting out a turn hands the seat to the AI (the player gets it back with "rejoin"), so one idle player
      // cannot stall the table.
      let counted = state;
      let game = g;
      for (const s of late) {
        counted = takeOver(counted, s);
        game = applyShAction(game, s, chooseShAction(game, s, state.level, styleOf(state, s))) ?? applyShAction(game, s, shTimeoutAction(game, s)) ?? game;
      }
      if (game !== g) next = withGame(counted, game, HOLD_MS.bet);
      else if (counted !== state) next = counted;
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
export function sniperHoldemAutoAction(state: SniperHoldemRoom): SniperHoldemRoomAction | null {
  if (state.phase !== 'playing') return null;
  const gone = seatDueForAway(state);
  if (gone !== null) return { t: 'away', seat: gone };
  if (Date.now() < state.holdUntil) return null;
  if (state.game.phase === 'showdown') return { t: 'next' };
  return shWaitingOn(state.game).some((s) => state.ai[s]) ? { t: 'ai' } : null;
}

/**
 * Host handoff: the old host took the hidden cards with it, so a hand in progress is dealt again (same round, bets
 * back to their owners). Between hands and at the end nothing is hidden, so the view carries on.
 */
export function resumeSniperHoldemRoom(view: SniperHoldemRoom): SniperHoldemRoom | null {
  const g = view.game;
  if (view.phase !== 'playing' || g.phase === 'showdown' || g.phase === 'finished') return view;
  const before: SniperHoldem = {
    ...g, round: g.round - 1, first: (g.first + SH_SEATS - 1) % SH_SEATS,
    chips: g.chips.map((c, i) => c + g.bets[i]), bets: Array(SH_SEATS).fill(0),
  };
  return withGame(view, startRound(before), HOLD_MS.round);
}

export const redactSniperHoldemRoom = (state: SniperHoldemRoom): SniperHoldemRoom => ({ ...state, game: redactSniperHoldem(state.game) });
export const sniperHoldemRoomSecret = (state: SniperHoldemRoom, seat: number) => sniperHoldemSecret(state.game, seat);
export const withSniperHoldemRoomSecret = (state: SniperHoldemRoom, secret: unknown, seat: number): SniperHoldemRoom => ({ ...state, game: withSniperHoldemSecret(state.game, secret, seat) });

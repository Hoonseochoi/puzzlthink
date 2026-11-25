// 그라데이션 room: the AI match (seat 1 is one of the four AI players, picked at random) and the 1:1 friend /
// open room. The host's browser runs the rules; guests get the public state plus their own row, sent end to end.
// Guest moves (the row, every cup handed in) are sealed to the host, so the other side never sees them early.
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';
import {
  type GrAction, type GrStyle, type Gradation, GR_CUPS, GR_PERSONA, GR_STYLES,
  applyGrAction, chooseGrAction, gradationSecret, grNext, grTimeoutRow, grUsed, grWaitingOn, newGradation, redactGradation, withGradationSecret,
} from './gradation';

/** Seconds to arrange the row (the show's 5 minutes), in every mode. */
export const GR_PLACE_SEC = 300;
/** Seconds to hand in a cup in a room (the AI match has no clock there). */
export const GR_TURN_SEC = 30;
export const GR_WARN_SEC = 10;
/** Missed cup turns in a row that lose a room match. */
export const GR_MAX_MISSES = 3;
/** How long both cubes stay on show before the next round. */
export const GR_REVEAL_MS = 3400;
/** The AI takes its time, like a player would. */
const AI_THINK_MS = [1300, 2300] as const;
const AI_PLACE_MS = [2600, 4200] as const;
const AFTER_LEAD_MS = 900;

export type GradationRoom = BaseRoom & {
  phase: 'lobby' | 'playing' | 'finished';
  solo: boolean;
  ai: boolean[];
  style: GrStyle | null; // the AI player's persona (solo)
  game: Gradation;
  holdUntil: number; // no AI move or next round before this
  misses: [number, number];
  resigned: number | null; // seat that gave up / timed out three times
  firstLeader: number; // who led round 1 (shown on the result)
};

export type GradationRoomAction =
  | { t: 'start' }
  | { t: 'act'; action: GrAction }
  | { t: 'ai' }
  | { t: 'next' }
  | { t: 'timeout' }
  | { t: 'resign' };

const between = ([a, b]: readonly [number, number]) => a + Math.random() * (b - a);

export function createGradationRoom(host: Peer, opts: { solo?: boolean } = {}): GradationRoom {
  const seats: Seat[] = [{ id: host.id, name: host.name }, null];
  const room: GradationRoom = {
    sid: newSid(), v: 1, seats, phase: 'lobby', deadline: 0, holdUntil: 0, solo: !!opts.solo,
    ai: [false, false], style: null, game: newGradation(), misses: [0, 0], resigned: null, firstLeader: 0,
  };
  return opts.solo ? startRoom(room) : room;
}

export const syncGradationSeats = (state: GradationRoom, peers: Peer[]) => syncSeats(state, peers);

function startRoom(state: GradationRoom): GradationRoom {
  let seats = state.seats;
  let ai = [false, false];
  let style: GrStyle | null = null;
  if (state.solo) {
    style = GR_STYLES[Math.floor(Math.random() * GR_STYLES.length)];
    seats = [state.seats[0], { id: `ai-${style}`, name: GR_PERSONA[style].name }];
    ai = [false, true];
  }
  const game = newGradation();
  return withGame({ ...state, sid: state.solo ? state.sid : newSid(), seats, ai, style, misses: [0, 0], resigned: null, firstLeader: game.leader, phase: 'playing' }, game, 0);
}

/** Puts a new game state in and sets the clocks for it. */
function withGame(state: GradationRoom, game: Gradation, hold: number): GradationRoom {
  const now = Date.now();
  const done = game.phase === 'finished';
  let deadline = Number.MAX_SAFE_INTEGER;
  if (game.phase === 'place') deadline = now + GR_PLACE_SEC * 1000;
  else if ((game.phase === 'lead' || game.phase === 'follow') && !state.solo) deadline = now + hold + GR_TURN_SEC * 1000;
  let holdUntil = now + hold;
  if (game.phase === 'reveal') holdUntil = now + GR_REVEAL_MS;
  // The AI "thinks" before its move: longer for its row, a little for a cup.
  const waiting = grWaitingOn(game);
  if (waiting.some((s) => state.ai[s])) holdUntil = Math.max(holdUntil, now + hold + between(game.phase === 'place' ? AI_PLACE_MS : AI_THINK_MS));
  return { ...state, game, phase: done ? 'finished' : 'playing', deadline: done ? 0 : deadline, holdUntil };
}

export function reduceGradationRoom(state: GradationRoom, action: GradationRoomAction, seat: number | null, isHost: boolean): GradationRoom | null {
  let next: GradationRoom | null = null;
  const g = state.game;
  switch (action.t) {
    case 'start':
      if (!isHost || state.phase === 'playing') break;
      if (!state.solo && state.seats.some((s) => !s)) break;
      next = startRoom(state);
      break;
    case 'act': {
      if (seat === null || state.ai[seat] || state.phase !== 'playing') break;
      const game = applyGrAction(g, seat, action.action);
      if (!game) break;
      const misses: [number, number] = [...state.misses];
      misses[seat] = 0;
      // Placing is simultaneous: the other side's clock keeps running.
      next = withGame({ ...state, misses }, game, game.phase === 'follow' ? AFTER_LEAD_MS : 0);
      if (game.phase === 'place') next = { ...next, deadline: state.deadline };
      break;
    }
    case 'ai': {
      if (!isHost || state.phase !== 'playing' || Date.now() < state.holdUntil) break;
      const actor = grWaitingOn(g).find((s) => state.ai[s]);
      if (actor === undefined || !state.style) break;
      const game = applyGrAction(g, actor, chooseGrAction(g, actor, state.style));
      if (!game) break;
      next = withGame(state, game, game.phase === 'follow' ? AFTER_LEAD_MS : 0);
      if (game.phase === 'place') next = { ...next, deadline: state.deadline };
      break;
    }
    case 'next':
      if (!isHost || state.phase !== 'playing' || g.phase !== 'reveal' || Date.now() < state.holdUntil) break;
      next = withGame(state, grNext(g), 0);
      break;
    case 'timeout': {
      if (!isHost || state.phase !== 'playing' || Date.now() < state.deadline) break;
      const late = grWaitingOn(g).filter((s) => !state.ai[s]);
      if (!late.length) break;
      let game = g;
      const misses: [number, number] = [...state.misses];
      for (const s of late) {
        if (g.phase === 'place') { game = applyGrAction(game, s, { kind: 'place', row: grTimeoutRow() }) ?? game; continue; }
        misses[s] += 1;
        if (misses[s] >= GR_MAX_MISSES) return bump(finishBy({ ...state, misses }, s));
        // A missed cup turn hands in a random free cup.
        const used = grUsed(game, s);
        const free = Array.from({ length: GR_CUPS }, (_, p) => p).filter((p) => !used[p]);
        game = applyGrAction(game, s, { kind: 'pick', pos: free[Math.floor(Math.random() * free.length)] }) ?? game;
      }
      if (game !== g) next = withGame({ ...state, misses }, game, game.phase === 'follow' ? AFTER_LEAD_MS : 0);
      break;
    }
    case 'resign':
      if (seat === null || state.phase !== 'playing' || state.ai[seat]) break;
      next = finishBy(state, seat);
      break;
  }
  return next ? bump(next) : null;
}

/** Ends the match with `loser` losing (resigned, or missed too many turns). */
function finishBy(state: GradationRoom, loser: number): GradationRoom {
  return { ...state, phase: 'finished', resigned: loser, deadline: 0, game: { ...state.game, phase: 'finished', winner: 1 - loser } };
}

/** Host-run steps: AI moves and the next round after a reveal. */
export function gradationAutoAction(state: GradationRoom): GradationRoomAction | null {
  if (state.phase !== 'playing' || Date.now() < state.holdUntil) return null;
  if (state.game.phase === 'reveal') return { t: 'next' };
  return grWaitingOn(state.game).some((s) => state.ai[s]) ? { t: 'ai' } : null;
}

export const redactGradationRoom = (state: GradationRoom): GradationRoom => ({ ...state, game: redactGradation(state.game) });
export const gradationRoomSecret = (state: GradationRoom, seat: number) => gradationSecret(state.game, seat);
export const withGradationRoomSecret = (state: GradationRoom, secret: unknown, seat: number): GradationRoom => ({ ...state, game: withGradationSecret(state.game, secret, seat) });
/** A guest's row and cups go to the host only. */
export const gradationSealed = (action: GradationRoomAction) => action.t === 'act';

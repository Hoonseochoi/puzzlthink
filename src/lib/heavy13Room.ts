// Room for 무거운 13: 7 seats, humans join by link, empty seats are filled with AI at start.
import {
  type AiLevel, type Color, type Heavy13, type Submission, PLAYERS,
  bestStand, planSubmissions, newHeavy13, options, pass, place, placementDecision, submit,
} from './heavy13';
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';

export const H13_TURN_OPTIONS = [180, 90, 60, 30] as const;
export type H13TurnSec = (typeof H13_TURN_OPTIONS)[number] | 0; // 0 = no clock (solo play)
export const PLACE_SEC = 20;
export const H13_PLAYER_OPTIONS = [4, 5, 6, 7] as const;
export type H13PlayerCount = (typeof H13_PLAYER_OPTIONS)[number];

export type H13Room = BaseRoom & {
  phase: 'lobby' | 'playing' | 'finished';
  ai: boolean[];
  aiLevel: AiLevel;
  turnSec: H13TurnSec;
  game: Heavy13;
  submitted: boolean[]; // public: who has submitted this round (submissions stay hidden)
  playerCount?: H13PlayerCount; // optional keeps pre-setting rooms restorable as 7-player rooms
  fillAi?: boolean;
};

export type H13Action =
  | { t: 'config'; turnSec?: H13TurnSec; aiLevel?: AiLevel; playerCount?: H13PlayerCount; fillAi?: boolean }
  | { t: 'start' }
  | { t: 'submit'; sub: Submission }
  | { t: 'place'; color?: Color }
  | { t: 'pass' }
  | { t: 'ai' }
  | { t: 'timeout' };


export function createH13Room(host: Peer, opts: { solo?: boolean; aiLevel?: AiLevel } = {}): H13Room {
  const seats: Seat[] = Array(PLAYERS).fill(null);
  seats[0] = { id: host.id, name: host.name };
  const room: H13Room = {
    sid: newSid(), v: 1, seats, phase: 'lobby', deadline: 0, ai: Array(PLAYERS).fill(false),
    aiLevel: opts.aiLevel ?? 'normal', turnSec: opts.solo ? 0 : 90, game: newHeavy13(0), submitted: Array(PLAYERS).fill(false),
    playerCount: PLAYERS, fillAi: true,
  };
  return opts.solo ? startRoom(room)! : room;
}

export function syncH13Seats(state: H13Room, peers: Peer[]) {
  const synced = syncSeats(state, peers);
  if (synced.phase !== 'lobby') return synced;
  const humans = synced.seats.filter(Boolean).length;
  const playerCount = Math.max(synced.playerCount ?? PLAYERS, Math.min(PLAYERS, humans)) as H13PlayerCount;
  return playerCount === synced.playerCount ? synced : bump({ ...synced, playerCount });
}

function clock(state: H13Room, game: Heavy13): number {
  if (!state.turnSec) return Number.MAX_SAFE_INTEGER;
  return Date.now() + (game.phase === 'submit' ? state.turnSec : PLACE_SEC) * 1000;
}

function withGame(state: H13Room, game: Heavy13): H13Room {
  const roundChanged = game.round !== state.game.round || game.phase !== state.game.phase || game.current !== state.game.current;
  return {
    ...state, game,
    phase: game.phase === 'finished' ? 'finished' : 'playing',
    submitted: game.subs.map(Boolean),
    deadline: roundChanged ? clock(state, game) : state.deadline,
  };
}

function startRoom(state: H13Room): H13Room | null {
  const playerCount = state.playerCount ?? PLAYERS;
  const fillAi = state.fillAi ?? true;
  const humans = state.seats.filter(Boolean).length;
  if (humans > playerCount || (!fillAi && humans !== playerCount)) return null;
  let n = 0;
  const activeSeats = state.seats.slice(0, playerCount).map((seat, i) => seat ?? { id: `ai-${i}`, name: `AI ${++n}` });
  const seats = [...activeSeats, ...Array(PLAYERS - playerCount).fill(null)];
  const ai = seats.map((seat, i) => i < playerCount && !!seat?.id.startsWith('ai-'));
  const game = newHeavy13(Math.floor(Math.random() * playerCount), playerCount);
  const next: H13Room = { ...state, seats, ai, phase: 'playing', game, submitted: Array(PLAYERS).fill(false) };
  return { ...next, deadline: clock(next, game) };
}

function decide(game: Heavy13, seat: number, level: AiLevel): Heavy13 | null {
  const d = placementDecision(game, seat, level);
  return d.t === 'pass' ? pass(game, seat) : place(game, seat, d.color);
}

export function reduceH13Room(state: H13Room, action: H13Action, seat: number | null, isHost: boolean): H13Room | null {
  const game = state.game;
  let next: H13Room | null = null;
  switch (action.t) {
    case 'config':
      if (!isHost || state.phase !== 'lobby') break;
      if (action.playerCount !== undefined && (action.playerCount < 4 || action.playerCount > 7 || action.playerCount < state.seats.filter(Boolean).length)) break;
      next = {
        ...state, turnSec: action.turnSec ?? state.turnSec, aiLevel: action.aiLevel ?? state.aiLevel,
        playerCount: action.playerCount ?? state.playerCount ?? PLAYERS,
        fillAi: action.fillAi ?? state.fillAi ?? true,
      };
      break;
    case 'start':
      if (!isHost || state.phase === 'playing') break;
      // A rematch keeps the same seats; AI seats stay AI.
      next = startRoom(state.phase === 'finished' ? { ...state, seats: state.seats.map((s, i) => (state.ai[i] ? null : s)) } : state);
      break;
    case 'submit': {
      if (seat === null || state.ai[seat] || state.phase !== 'playing') break;
      const g = submit(game, seat, action.sub);
      if (g) next = withGame(state, g);
      break;
    }
    case 'place': case 'pass': {
      if (seat === null || state.ai[seat] || game.current !== seat) break;
      const g = action.t === 'pass' ? pass(game, seat) : place(game, seat, action.color);
      if (g) next = withGame(state, g);
      break;
    }
    case 'ai': {
      if (!isHost || state.phase !== 'playing') break;
      let g: Heavy13 | null = game;
      if (game.phase === 'submit') {
        const seats = Array.from({ length: game.players.length }, (_, s) => s).filter((s) => state.ai[s] && !game.subs[s]);
        const subs = planSubmissions(game, seats, state.aiLevel);
        seats.forEach((s, k) => { g = submit(g!, s, subs[k]) ?? g; });
        if (g === game) g = null;
      } else if (game.phase === 'place' && game.current !== null && state.ai[game.current]) {
        g = decide(game, game.current, state.aiLevel);
      } else g = null;
      if (g) next = withGame(state, g);
      break;
    }
    case 'timeout': {
      if (!isHost || state.phase !== 'playing' || !state.turnSec || Date.now() < state.deadline) break;
      let g: Heavy13 = game;
      if (game.phase === 'submit') {
        for (let s = 0; s < game.players.length; s += 1) if (!g.subs[s]) { const opts = options(g, s); g = submit(g, s, opts[Math.floor(Math.random() * opts.length)]) ?? g; }
      } else if (game.phase === 'place' && game.current !== null) {
        const sub = game.subs[game.current]!;
        g = place(game, game.current, sub.chip === 'w' ? bestStand(game.stands, sub.card) : undefined) ?? game;
      }
      if (g !== game) next = withGame(state, g);
      break;
    }
  }
  return next ? bump(next) : null;
}

/** What guests receive: hidden submissions stay hidden until everyone has submitted. */
export function redactH13(state: H13Room): H13Room {
  if (state.game.phase !== 'submit') return state;
  return { ...state, game: { ...state.game, subs: state.game.subs.map(() => null) } };
}

/** The host's automatic step for AI seats (one per tick so placements are watchable). */
export function h13AutoAction(state: H13Room): H13Action | null {
  if (state.phase !== 'playing') return null;
  const g = state.game;
  if (g.phase === 'submit' && state.ai.some((ai, s) => ai && !g.subs[s])) return { t: 'ai' };
  if (g.phase === 'place' && g.current !== null && state.ai[g.current]) return { t: 'ai' };
  return null;
}

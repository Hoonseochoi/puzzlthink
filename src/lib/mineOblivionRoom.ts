/*
 * 망각의 지뢰 rooms: the AI match (in this browser) and 1:1 friend / open rooms.
 *
 * Secrets: the room is host-authoritative (src/hooks/useRealtimeRoom.ts). A guest's burial is sealed to the host
 * (end-to-end encrypted, engine.sealed) and never comes back: guests receive `buried: [[], []]` and no AI memory seed
 * until the game is finished (redactMoRoom). Every number and explosion is worked out by the host and broadcast as a
 * public step, so neither client can learn a mine before it is stepped on. As in the site's other hidden-information
 * rooms, the host's own browser holds the full state; if the host leaves mid-match the mines leave with it, so the
 * room goes back to the lobby (resume → null).
 */
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';
import { type AwayFields, clearMiss, giveBack, humansBack, resetAway, seatDueForAway, takeOver, trackPresence } from './roomAway';
import {
  type MineOblivion, type MoSeat, buryMines, legalMoves, moveTo, newMineOblivion, randomBurial, resign, respawnAt, respawnOptions,
} from './mineOblivion';
import { type MoLevel, type MoMind, chooseMoBurial, chooseMoMove, chooseMoRespawn, rollMoMind } from './mineOblivionAi';

/** Seconds to bury in a room, and per move (a respawn pick shares its move's clock). The AI match has no clock. */
export const MO_BURY_SEC = 120;
export const MO_TURN_SEC = 30;
export const MO_WARN_SEC = 10;
/** Once the walk starts, both players get this long to look at their own mines before they disappear. */
export const MO_MEMORIZE_MS = 4200;
/** After a move, the AI waits this long (so the announced number can be read) before its own move. */
export const MO_HOLD_MS = 1700;
/** After an explosion the hold is longer: the blast, then the walk back. */
export const MO_BLAST_HOLD_MS = 2400;

export type MoRoom = BaseRoom & AwayFields & {
  phase: 'lobby' | 'playing' | 'finished';
  level: MoLevel;
  solo?: boolean;
  game: MineOblivion;
  /** Host only (redacted): each seat's memory seed for the normal AI (also used if the AI stands in). */
  mind: (MoMind | null)[];
  /** Host clock: no AI move before this (the memorize moment, the announced number). */
  holdUntil: number;
  /** Host clock: when the walk started (the memorize moment runs from here). */
  walkAt: number;
};

export type MoRoomAction =
  | { t: 'start' }
  | { t: 'level'; level: MoLevel }
  | { t: 'bury'; cells: number[] }
  | { t: 'move'; to: number }
  | { t: 'respawn'; to: number }
  | { t: 'resign' }
  | { t: 'ai' }
  | { t: 'timeout' }
  | { t: 'away'; seat: number }
  | { t: 'rejoin' };

const SEATS = 2;

export function createMoRoom(host: Peer, opts: { solo?: boolean; level?: MoLevel } = {}): MoRoom {
  const seats: Seat[] = [{ id: host.id, name: host.name }, null];
  const room: MoRoom = {
    sid: newSid(), v: 1, seats, phase: 'lobby', deadline: 0, ai: [false, false], level: opts.level ?? 'normal', solo: !!opts.solo,
    game: newMineOblivion(0), mind: [null, null], holdUntil: 0, walkAt: 0,
  };
  if (!opts.solo) return room;
  const withAi: MoRoom = { ...room, seats: [seats[0], { id: `ai-${room.level}`, name: 'AI' }], ai: [false, true] };
  return startRoom(withAi, false);
}

export const syncMoSeats = (state: MoRoom, peers: Peer[]) => trackPresence(syncSeats(state, peers), peers);
export const moPeople = (state: MoRoom) => state.seats.filter((seat, i) => seat && !state.ai[i]).length;

function startRoom(state: MoRoom, shuffle = true): MoRoom {
  let seats = state.seats;
  let ai = state.ai;
  if (shuffle && Math.random() < 0.5) { seats = [seats[1], seats[0]]; ai = [ai[1], ai[0]]; }
  const first = (Math.random() < 0.5 ? 0 : 1) as MoSeat;
  let game = newMineOblivion(first, newSid());
  // AI seats bury at once.
  ai.forEach((isAi, s) => { if (isAi) game = buryMines(game, s as MoSeat, chooseMoBurial(s as MoSeat, state.level)) ?? game; });
  const now = Date.now();
  return {
    ...state, seats, ai, phase: 'playing', ...resetAway(SEATS), game, mind: [rollMoMind(), rollMoMind()],
    holdUntil: 0, walkAt: 0, deadline: state.solo ? Number.MAX_SAFE_INTEGER : now + MO_BURY_SEC * 1000,
  };
}

/** Puts a new game state in and sets the clocks. */
function withGame(state: MoRoom, game: MineOblivion, hold = MO_HOLD_MS): MoRoom {
  const now = Date.now();
  const before = state.game;
  let walkAt = state.walkAt;
  let holdUntil = now + hold;
  if (before.phase === 'bury' && game.phase === 'walk') { walkAt = now; holdUntil = now + MO_MEMORIZE_MS; }
  else if (game.phase === 'bury') holdUntil = 0;
  const done = game.phase === 'finished';
  const deadline = done || state.solo ? Number.MAX_SAFE_INTEGER
    : game.phase === 'bury' ? state.deadline
      : Math.max(holdUntil, now) + MO_TURN_SEC * 1000;
  return { ...state, game, phase: done ? 'finished' : 'playing', walkAt, holdUntil, deadline };
}

/** The seat whose decision the game waits on (a move or a respawn pick), or null while burying / after the end. */
export function moWaitingOn(g: MineOblivion): MoSeat | null {
  if (g.phase !== 'walk') return null;
  return g.respawn ?? g.turn;
}

/** The AI (or the AI standing in for a seat) plays that seat's pending decision. */
function aiPlay(state: MoRoom, seat: MoSeat): MineOblivion | null {
  const g = state.game;
  const mind = state.mind[seat];
  if (g.phase === 'bury') return g.ready[seat] ? null : buryMines(g, seat, chooseMoBurial(seat, state.level));
  if (g.respawn === seat) return respawnAt(g, seat, chooseMoRespawn(g, seat, state.level, mind)) ?? respawnAt(g, seat, respawnOptions(g, seat)[0]);
  if (g.turn === seat && g.respawn === null) return moveTo(g, seat, chooseMoMove(g, seat, state.level, mind)) ?? moveTo(g, seat, legalMoves(g, seat)[0]);
  return null;
}

const holdFor = (before: MineOblivion, after: MineOblivion) =>
  after.log.length > before.log.length && after.log[after.log.length - 1].kind === 'mine' ? MO_BLAST_HOLD_MS : MO_HOLD_MS;

export function reduceMoRoom(state: MoRoom, action: MoRoomAction, seat: number | null, isHost: boolean): MoRoom | null {
  let next: MoRoom | null = null;
  const g = state.game;
  const now = Date.now();
  switch (action.t) {
    case 'level':
      if (isHost && state.phase !== 'playing' && (action.level === 'normal' || action.level === 'hard')) next = { ...state, level: action.level };
      break;
    case 'start': {
      if (!isHost || state.phase === 'playing') break;
      const base = humansBack(state);
      // A room needs two people; the AI match keeps its AI seat.
      if (!state.solo && moPeople(base) < 2) break;
      next = startRoom(base, !state.solo);
      break;
    }
    case 'bury': {
      if (seat === null || state.ai[seat] || state.phase !== 'playing' || g.phase !== 'bury') break;
      const game = buryMines(g, seat as MoSeat, action.cells);
      if (game) next = withGame(clearMiss(state, seat), game);
      break;
    }
    case 'move': {
      if (seat === null || state.ai[seat] || state.phase !== 'playing' || g.phase !== 'walk' || now < state.walkAt + MO_MEMORIZE_MS - 400) break;
      const game = moveTo(g, seat as MoSeat, action.to);
      if (game) next = withGame(clearMiss(state, seat), game, holdFor(g, game));
      break;
    }
    case 'respawn': {
      if (seat === null || state.ai[seat] || state.phase !== 'playing') break;
      const game = respawnAt(g, seat as MoSeat, action.to);
      if (game) next = withGame(state, game);
      break;
    }
    case 'resign': {
      if (seat === null || state.ai[seat] || state.phase !== 'playing') break;
      const game = resign(g, seat as MoSeat);
      if (game) next = withGame(state, game);
      break;
    }
    case 'ai': {
      if (!isHost || state.phase !== 'playing') break;
      if (g.phase === 'bury') {
        const s = ([0, 1] as MoSeat[]).find((x) => state.ai[x] && !g.ready[x]);
        if (s === undefined) break;
        const game = aiPlay(state, s);
        if (game) next = withGame(state, game);
        break;
      }
      if (now < state.holdUntil) break;
      const s = moWaitingOn(g);
      if (s === null || !state.ai[s]) break;
      const game = aiPlay(state, s);
      if (game) next = withGame(state, game, holdFor(g, game));
      break;
    }
    case 'timeout': {
      if (!isHost || state.phase !== 'playing' || state.solo || now < state.deadline) break;
      if (g.phase === 'bury') {
        // Whoever has not finished burying gets a random burial; nobody is taken over for it.
        let game = g;
        ([0, 1] as MoSeat[]).forEach((s) => { if (!game.ready[s]) game = buryMines(game, s, randomBurial()) ?? game; });
        if (game !== g) next = withGame(state, game);
        break;
      }
      const s = moWaitingOn(g);
      if (s === null || state.ai[s]) break;
      // A missed move hands the seat to the AI until the player comes back ("rejoin").
      const taken = takeOver(state, s);
      const game = aiPlay(taken, s);
      next = game ? withGame(taken, game, holdFor(g, game)) : taken;
      break;
    }
    case 'away':
      if (isHost && state.phase === 'playing' && seatDueForAway(state) === action.seat) next = takeOver(state, action.seat);
      break;
    case 'rejoin':
      if (seat !== null && state.phase === 'playing') next = giveBack(state, seat);
      break;
  }
  return next ? bump(next) : null;
}

/** Host-run steps: away seats to the AI, AI burials and moves. */
export function moAutoAction(state: MoRoom): MoRoomAction | null {
  if (state.phase !== 'playing') return null;
  const gone = seatDueForAway(state);
  if (gone !== null) return { t: 'away', seat: gone };
  const g = state.game;
  if (g.phase === 'bury') return ([0, 1] as MoSeat[]).some((s) => state.ai[s] && !g.ready[s]) ? { t: 'ai' } : null;
  if (Date.now() < state.holdUntil) return null;
  const s = moWaitingOn(g);
  return s !== null && state.ai[s] ? { t: 'ai' } : null;
}

/** Everything a guest may see while the match runs: no mines, no AI memory. */
export function redactMoRoom(state: MoRoom): MoRoom {
  if (state.phase !== 'playing') return state;
  return { ...state, mind: [null, null], game: { ...state.game, buried: [[], []], log: state.game.log.map(({ removed: _r, ...s }) => { void _r; return s; }) } };
}

// Shared-room state for 1:1 blind gomoku with a friend. Seat 0 is the host.
// Whoever is black (`first`) picks each stone's colour; white must answer with the same colour,
// exactly as the AI does in the solo game, so a colour never tells you whose stone it is.
import { BOARD_SIZE, STONE_COLORS, findWinningLine, isOnBoard, type GomokuMove, type StoneColor, type StoneOwner, type WinningLine } from './blindGomoku';
import { type BaseRoom, type Peer, type Seat, bump, newSid, syncSeats } from './room';

export const BG_TURN_OPTIONS = [60, 30, 90] as const;
export type BgTurnSeconds = (typeof BG_TURN_OPTIONS)[number];
export const REVEALS = 2; // peeks per player per game
export const REVEAL_MS = 5000;

export type BlindGomokuRoom = BaseRoom & {
  phase: 'lobby' | 'playing' | 'finished';
  turnSec: BgTurnSeconds;
  first: 0 | 1; // seat playing black
  moves: GomokuMove[];
  winner: StoneOwner | 'draw' | null;
  line: WinningLine | null;
  reason: 'five' | 'full' | 'resign' | 'timeout' | null;
  reveals: [number, number]; // peeks left, by seat
  revealUntil: number; // the player to move is peeking until then (their clock keeps running)
  timeouts: number; // automatic moves in a row; three in a row loses on time
};

export type BlindGomokuRoomAction =
  | { t: 'start' }
  | { t: 'config'; turnSec: BgTurnSeconds }
  | { t: 'place'; row: number; col: number; color?: StoneColor }
  | { t: 'reveal' }
  | { t: 'resign' }
  | { t: 'timeout' };

export function createBlindGomokuRoom(host: Peer, turnSec: BgTurnSeconds = 60): BlindGomokuRoom {
  return {
    sid: newSid(), v: 1, seats: [{ id: host.id, name: host.name }, null] as Seat[], phase: 'lobby', deadline: 0,
    turnSec, first: 0, moves: [], winner: null, line: null, reason: null, reveals: [REVEALS, REVEALS], revealUntil: 0, timeouts: 0,
  };
}

export const syncBlindGomokuSeats = (state: BlindGomokuRoom, peers: Peer[]) => syncSeats(state, peers);

/** Seat whose turn it is: black moves on even move counts. */
export const seatToMove = (state: BlindGomokuRoom): 0 | 1 => (state.moves.length % 2 === 0 ? state.first : (1 - state.first) as 0 | 1);
export const ownerOf = (state: BlindGomokuRoom, seat: number): StoneOwner => (seat === state.first ? 'black' : 'white');

const isColor = (color: unknown): color is StoneColor => STONE_COLORS.some((c) => c.id === color);

function play(state: BlindGomokuRoom, row: number, col: number, color: StoneColor, timeouts: number): BlindGomokuRoom {
  const owner: StoneOwner = state.moves.length % 2 === 0 ? 'black' : 'white';
  const move: GomokuMove = { row, col, owner, color, turn: state.moves.length + 1 };
  const moves = [...state.moves, move];
  const line = findWinningLine(moves, move);
  const base = { ...state, moves, timeouts, revealUntil: 0, deadline: Date.now() + state.turnSec * 1000 };
  if (line) return { ...base, phase: 'finished', winner: owner, line, reason: 'five' };
  if (moves.length === BOARD_SIZE * BOARD_SIZE) return { ...base, phase: 'finished', winner: 'draw', reason: 'full' };
  return base;
}

/** Colour of the next stone: black chooses it, white copies the stone just played. */
function colorFor(state: BlindGomokuRoom, chosen?: StoneColor): StoneColor | null {
  if (state.moves.length % 2 === 1) return state.moves.at(-1)!.color;
  return isColor(chosen) ? chosen : null;
}

/** A free point next to the stones (or the centre), for a move made on time out. */
function fallbackPoint(moves: GomokuMove[]) {
  if (!moves.length) return { row: 7, col: 7 };
  const taken = new Set(moves.map((m) => `${m.row}:${m.col}`));
  const near: { row: number; col: number }[] = [];
  for (const m of moves) for (let dr = -1; dr <= 1; dr += 1) for (let dc = -1; dc <= 1; dc += 1) {
    const row = m.row + dr, col = m.col + dc;
    if (isOnBoard(row, col) && !taken.has(`${row}:${col}`)) near.push({ row, col });
  }
  if (near.length) return near[Math.floor(Math.random() * near.length)];
  for (let row = 0; row < BOARD_SIZE; row += 1) for (let col = 0; col < BOARD_SIZE; col += 1) if (!taken.has(`${row}:${col}`)) return { row, col };
  return null;
}

export function reduceBlindGomokuRoom(state: BlindGomokuRoom, action: BlindGomokuRoomAction, seat: number | null, isHost: boolean): BlindGomokuRoom | null {
  let next: BlindGomokuRoom | null = null;
  switch (action.t) {
    case 'config':
      if (isHost && state.phase === 'lobby' && (BG_TURN_OPTIONS as readonly number[]).includes(action.turnSec)) next = { ...state, turnSec: action.turnSec };
      break;
    case 'start': {
      if (!isHost || state.phase === 'playing' || state.seats.some((s) => !s)) break;
      const first = (Math.random() < 0.5 ? 0 : 1) as 0 | 1;
      next = { ...state, phase: 'playing', first, moves: [], winner: null, line: null, reason: null, reveals: [REVEALS, REVEALS], revealUntil: 0, timeouts: 0, deadline: Date.now() + state.turnSec * 1000 };
      break;
    }
    case 'place': {
      if (state.phase !== 'playing' || seat !== seatToMove(state) || !isOnBoard(action.row, action.col)) break;
      if (state.moves.some((m) => m.row === action.row && m.col === action.col)) break;
      const color = colorFor(state, action.color);
      if (color) next = play(state, action.row, action.col, color, 0);
      break;
    }
    case 'reveal':
      if (state.phase !== 'playing' || seat !== seatToMove(state) || !state.moves.length || state.reveals[seat] <= 0 || Date.now() < state.revealUntil) break;
      next = { ...state, reveals: state.reveals.map((n, i) => (i === seat ? n - 1 : n)) as [number, number], revealUntil: Date.now() + REVEAL_MS };
      break;
    case 'resign':
      if (state.phase !== 'playing' || (seat !== 0 && seat !== 1)) break;
      next = { ...state, phase: 'finished', winner: ownerOf(state, 1 - seat), reason: 'resign', revealUntil: 0 };
      break;
    case 'timeout': {
      if (!isHost || state.phase !== 'playing' || Date.now() < state.deadline) break;
      const loser = seatToMove(state);
      const point = fallbackPoint(state.moves);
      if (state.timeouts >= 2 || !point) { next = { ...state, phase: 'finished', winner: ownerOf(state, 1 - loser), reason: 'timeout', revealUntil: 0 }; break; }
      const color = colorFor(state, STONE_COLORS[Math.floor(Math.random() * STONE_COLORS.length)].id)!;
      next = play(state, point.row, point.col, color, state.timeouts + 1);
      break;
    }
  }
  return next ? bump(next) : null;
}

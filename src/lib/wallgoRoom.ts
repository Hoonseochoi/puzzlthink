// Shared-room state for "play with friends". The host's browser owns the state,
// applies every action through `reduceRoom`, and broadcasts the result.
import {
  BOARD_SIZE,
  MODES,
  type Direction,
  type ModeId,
  type Piece,
  type PlayerId,
  type Position,
  applyMove,
  getMoveOptions,
  getTerritory,
  getWallOptions,
  getWinner,
  isOccupied,
  nextPlayerOf,
} from './wallgo';
import { type Peer, type Seat, bump, seatOf as genericSeatOf, syncSeats as genericSyncSeats } from './room';

export type { Peer, Seat };

export const TURN_MS = 90_000;

export type LogEntry = { k: string; s?: PlayerId; cell?: string; dir?: Direction };
export type RoomPhase = 'lobby' | 'placement' | 'playing' | 'finished';

export type RoomState = {
  sid: string; // host session id; guests accept any state from a new session
  v: number;
  mode: ModeId;
  seats: Seat[];
  phase: RoomPhase;
  order: PlayerId[];
  placementIndex: number;
  pieces: Piece[];
  walls: string[];
  current: PlayerId;
  step: 'move' | 'wall';
  moved: string | null;
  breaks: boolean[];
  deadline: number;
  winner: PlayerId | null;
  turn: number;
  log: LogEntry[];
};

export type RoomAction =
  | { t: 'start' }
  | { t: 'place'; row: number; col: number }
  | { t: 'move'; pieceId: string; row: number; col: number }
  | { t: 'wall'; direction: Direction }
  | { t: 'timeout' };


const cellName = (p: Position) => `${String.fromCharCode(65 + p.col)}${p.row + 1}`;
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export function createRoom(mode: ModeId, host: Peer): RoomState {
  const players = MODES[mode].players;
  return {
    sid: Math.random().toString(36).slice(2, 10), v: 1, mode,
    seats: players.map((_, i) => (i === 0 ? { id: host.id, name: host.name } : null)),
    phase: 'lobby', order: [], placementIndex: 0, pieces: [], walls: [], current: 0, step: 'move', moved: null,
    breaks: players.map(() => true), deadline: 0, winner: null, turn: 1, log: [{ k: 'onLogWaiting' }],
  };
}

export function seatOf(state: RoomState, clientId: string): PlayerId | null {
  return genericSeatOf(state, clientId) as PlayerId | null;
}

export const syncSeats = (state: RoomState, peers: Peer[]) => genericSyncSeats(state, peers);

function withLog(state: RoomState, ...entries: LogEntry[]): RoomState {
  return { ...state, log: [...entries.reverse(), ...state.log].slice(0, 12) };
}

function startGame(state: RoomState): RoomState | null {
  if (state.seats.some((seat) => !seat)) return null;
  const mode = MODES[state.mode];
  let order: PlayerId[];
  if (mode.id === 'two') {
    const first: PlayerId = Math.random() < 0.5 ? 0 : 1;
    const second: PlayerId = first === 0 ? 1 : 0;
    order = [first, second, second, first];
  } else {
    const draw = [...mode.players].sort(() => Math.random() - 0.5);
    order = [...draw, ...[...draw].reverse()];
  }
  return withLog({
    ...state, phase: 'placement', order, placementIndex: 0, pieces: mode.fixedPieces, walls: [], current: order[0],
    step: 'move', moved: null, breaks: mode.players.map(() => true), deadline: Date.now() + TURN_MS, winner: null, turn: 1, log: [],
  }, { k: 'onLogDraw', s: order[0] });
}

function place(state: RoomState, player: PlayerId, position: Position): RoomState | null {
  if (isOccupied(state.pieces, position)) return null;
  const count = state.pieces.filter((piece) => piece.player === player).length;
  const pieces = [...state.pieces, { id: `${player}-${count}`, player, ...position }];
  const placementIndex = state.placementIndex + 1;
  const done = placementIndex >= state.order.length;
  let next: RoomState = { ...state, pieces, placementIndex, deadline: Date.now() + TURN_MS };
  next = withLog(next, { k: 'onLogPlaced', s: player, cell: cellName(position) });
  if (done) return giveTurn(withLog({ ...next, phase: 'playing' }, { k: 'onLogPlacementDone', s: state.order[0] }), state.order[0]);
  return { ...next, current: state.order[placementIndex] };
}

/** Gives the turn to `candidate`, skipping players who have no legal move. */
function giveTurn(state: RoomState, candidate: PlayerId): RoomState {
  const mode = MODES[state.mode];
  const walls = new Set(state.walls);
  const canMove = (player: PlayerId) => getMoveOptions(state.pieces, walls, player, mode.wallBreak && state.breaks[player]).length > 0;
  if (!mode.players.some(canMove)) {
    // Nobody can move but spaces are not fully separated: score the board as it stands.
    const winner = getWinner(getTerritory(state.pieces, walls, mode.totalPieces), mode.players);
    return withLog({ ...state, phase: 'finished', winner }, { k: 'onLogStalemate' }, { k: 'onLogWinner', s: winner });
  }
  let next = candidate;
  let result = state;
  while (!canMove(next)) {
    result = withLog(result, { k: 'onLogSkipped', s: next });
    next = nextPlayerOf(mode, next);
  }
  return { ...result, current: next };
}

function endTurn(state: RoomState, actor: PlayerId): RoomState {
  const mode = MODES[state.mode];
  const territory = getTerritory(state.pieces, new Set(state.walls), mode.totalPieces);
  const base = { ...state, step: 'move' as const, moved: null, deadline: Date.now() + TURN_MS };
  if (territory.separated) {
    const winner = getWinner(territory, mode.players);
    return withLog({ ...base, phase: 'finished', winner }, { k: 'onLogWinner', s: winner });
  }
  const result = giveTurn(base, nextPlayerOf(mode, actor));
  return { ...result, turn: result.current === state.order[0] ? state.turn + 1 : state.turn };
}

function move(state: RoomState, player: PlayerId, pieceId: string, to: Position): RoomState | null {
  const mode = MODES[state.mode];
  const walls = new Set(state.walls);
  const option = getMoveOptions(state.pieces, walls, player, mode.wallBreak && state.breaks[player])
    .find((item) => item.pieceId === pieceId && item.to.row === to.row && item.to.col === to.col);
  if (!option) return null;
  const moved = applyMove(state.pieces, walls, option);
  const breaks = option.brokenWall ? state.breaks.map((value, i) => (i === player ? false : value)) : state.breaks;
  return withLog(
    { ...state, pieces: moved.pieces, walls: [...moved.walls], breaks, step: 'wall', moved: pieceId },
    { k: option.brokenWall ? 'onLogBreak' : 'onLogMoved', s: player, cell: cellName(to) },
  );
}

function wall(state: RoomState, player: PlayerId, direction: Direction): RoomState | null {
  if (!state.moved) return null;
  const walls = new Set(state.walls);
  const option = getWallOptions(state.pieces, walls, state.moved).find((item) => item.direction === direction);
  if (!option) return null;
  const piece = state.pieces.find((item) => item.id === state.moved)!;
  walls.add(option.key);
  return endTurn(withLog({ ...state, walls: [...walls] }, { k: 'onLogWall', s: player, cell: cellName(piece), dir: direction }), player);
}

function timeout(state: RoomState): RoomState | null {
  const player = state.current;
  const mode = MODES[state.mode];
  if (state.phase === 'placement') {
    const empty: Position[] = [];
    for (let row = 0; row < BOARD_SIZE; row += 1) for (let col = 0; col < BOARD_SIZE; col += 1) if (!isOccupied(state.pieces, { row, col })) empty.push({ row, col });
    return place(withLog(state, { k: 'onLogTimeout', s: player }), player, pick(empty));
  }
  if (state.phase !== 'playing') return null;
  let next = withLog(state, { k: 'onLogTimeout', s: player });
  if (next.step === 'move') {
    const options = getMoveOptions(next.pieces, new Set(next.walls), player, mode.wallBreak && next.breaks[player]);
    if (!options.length) return endTurn(next, player);
    const option = pick(options);
    next = move(next, player, option.pieceId, option.to)!;
  }
  const wallOptions = getWallOptions(next.pieces, new Set(next.walls), next.moved!);
  return wall(next, player, pick(wallOptions).direction);
}

/** Applies an action from `player` (or the host, for start/timeout). Returns null when it is not allowed. */
export function reduceRoom(state: RoomState, action: RoomAction, player: PlayerId | null, isHost: boolean): RoomState | null {
  let next: RoomState | null = null;
  if (action.t === 'start') {
    if (!isHost || (state.phase !== 'lobby' && state.phase !== 'finished')) return null;
    next = startGame(state);
  } else if (action.t === 'timeout') {
    if (!isHost || Date.now() < state.deadline) return null;
    next = timeout(state);
  } else {
    if (player === null || player !== state.current) return null;
    if (action.t === 'place' && state.phase === 'placement') next = place(state, player, { row: action.row, col: action.col });
    if (action.t === 'move' && state.phase === 'playing' && state.step === 'move') next = move(state, player, action.pieceId, { row: action.row, col: action.col });
    if (action.t === 'wall' && state.phase === 'playing' && state.step === 'wall') next = wall(state, player, action.direction);
  }
  return next ? bump(next) : null;
}

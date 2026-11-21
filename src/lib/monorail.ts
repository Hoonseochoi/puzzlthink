// 모노레일 (Venice Connection): two station tiles and sixteen double-sided rail tiles.
// A turn places one to three tiles in one straight, contiguous row. Track ends may be left
// unmatched while playing; the game ends only when every tile on the table belongs to one loop.

export type Player = 0 | 1;
export type RailShape = 'h' | 'v' | 'ne' | 'se' | 'sw' | 'nw';
export type Point = { r: number; c: number };
export type RailTile = Point & { shape: RailShape; skin: number };
export type MonorailMove = { tiles: RailTile[] };
export type MonorailLevel = 'normal' | 'hard';

export const BOARD_SIZE = 9;
export const TILE_COUNT = 16;
export const STATIONS: readonly RailTile[] = [
  { r: 4, c: 4, shape: 'h', skin: 0 },
  { r: 4, c: 5, shape: 'h', skin: 1 },
];
export const SHAPES: readonly RailShape[] = ['h', 'v', 'ne', 'se', 'sw', 'nw'];

export type FinishReason = 'loop' | 'impossible-right' | 'impossible-wrong' | 'resign' | 'timeout';
export type MonorailState = {
  tiles: RailTile[];
  turn: Player;
  winner: Player | null;
  reason: FinishReason | null;
  last: MonorailMove | null;
  /** A completion displayed after a wrong Impossible declaration. */
  proof: RailTile[] | null;
  moveNo: number;
};

export const newMonorail = (): MonorailState => ({
  tiles: [], turn: 0, winner: null, reason: null, last: null, proof: null, moveNo: 0,
});
export const other = (p: Player): Player => (p === 0 ? 1 : 0);
export const keyOf = ({ r, c }: Point) => `${r},${c}`;
export const inside = ({ r, c }: Point) => r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;

type Direction = 'n' | 'e' | 's' | 'w';
const DELTA: Record<Direction, Point> = { n: { r: -1, c: 0 }, e: { r: 0, c: 1 }, s: { r: 1, c: 0 }, w: { r: 0, c: -1 } };
const OPP: Record<Direction, Direction> = { n: 's', e: 'w', s: 'n', w: 'e' };
const PORTS: Record<RailShape, readonly [Direction, Direction]> = {
  h: ['w', 'e'], v: ['n', 's'], ne: ['n', 'e'], se: ['s', 'e'], sw: ['s', 'w'], nw: ['n', 'w'],
};
const step = (p: Point, d: Direction): Point => ({ r: p.r + DELTA[d].r, c: p.c + DELTA[d].c });
const direction = (from: Point, to: Point): Direction | null => {
  const dr = to.r - from.r, dc = to.c - from.c;
  return dr === -1 && dc === 0 ? 'n' : dr === 1 && dc === 0 ? 's' : dr === 0 && dc === 1 ? 'e' : dr === 0 && dc === -1 ? 'w' : null;
};
const shapeFor = (a: Direction, b: Direction): RailShape | null => {
  if (a === b) return null;
  const pair = new Set([a, b]);
  if (pair.has('w') && pair.has('e')) return 'h';
  if (pair.has('n') && pair.has('s')) return 'v';
  if (pair.has('n') && pair.has('e')) return 'ne';
  if (pair.has('s') && pair.has('e')) return 'se';
  if (pair.has('s') && pair.has('w')) return 'sw';
  return 'nw';
};

export function occupied(state: MonorailState) {
  return new Map([...STATIONS, ...state.tiles].map((tile) => [keyOf(tile), tile]));
}

/** Placement geometry only. Rail ends deliberately do not have to match during play. */
export function legalMove(state: MonorailState, move: MonorailMove) {
  const list = move.tiles;
  if (state.winner !== null || list.length < 1 || list.length > 3 || list.length > TILE_COUNT - state.tiles.length) return false;
  if (list.some((tile) => !inside(tile) || !SHAPES.includes(tile.shape))) return false;
  const keys = new Set(list.map(keyOf));
  if (keys.size !== list.length) return false;
  const board = occupied(state);
  if (list.some((tile) => board.has(keyOf(tile)))) return false;
  const sameRow = list.every((tile) => tile.r === list[0].r);
  const sameCol = list.every((tile) => tile.c === list[0].c);
  if (!sameRow && !sameCol) return false;
  const axis = list.map((tile) => sameRow ? tile.c : tile.r).sort((a, b) => a - b);
  if (axis.some((n, i) => i > 0 && n !== axis[i - 1] + 1)) return false;
  // The group must touch the existing layout; the rest of the group touches through its own line.
  return list.some((tile) => (Object.keys(DELTA) as Direction[]).some((d) => board.has(keyOf(step(tile, d)))));
}

/** True only when all four conditions hold: reciprocal rails, degree two, connected, and includes every tile. */
export function isComplete(state: Pick<MonorailState, 'tiles'>) {
  const all = [...STATIONS, ...state.tiles];
  if (!state.tiles.length) return false;
  const board = new Map(all.map((tile) => [keyOf(tile), tile]));
  for (const tile of all) for (const d of PORTS[tile.shape]) {
    const next = board.get(keyOf(step(tile, d)));
    if (!next || !PORTS[next.shape].includes(OPP[d])) return false;
  }
  const seen = new Set<string>();
  const stack: RailTile[] = [all[0]];
  while (stack.length) {
    const tile = stack.pop()!;
    if (seen.has(keyOf(tile))) continue;
    seen.add(keyOf(tile));
    for (const d of PORTS[tile.shape]) { const next = board.get(keyOf(step(tile, d))); if (next) stack.push(next); }
  }
  return seen.size === all.length;
}

export function playMonorail(state: MonorailState, move: MonorailMove): MonorailState | null {
  if (!legalMove(state, move)) return null;
  const tiles = [...state.tiles, ...move.tiles.map((tile, i) => ({ ...tile, skin: Number.isInteger(tile.skin) ? tile.skin % 6 : (state.tiles.length + i) % 6 }))];
  const next: MonorailState = { ...state, tiles, last: move, moveNo: state.moveNo + 1, proof: null };
  if (isComplete(next)) return { ...next, winner: state.turn, reason: 'loop' };
  return { ...next, turn: other(state.turn) };
}

// A finished loop is a self-avoiding path from the left station's outer end to the right station's
// outer end. The two stations close that path along their touching inner ends. Enumerating such paths
// makes the Impossible button an actual rules check rather than a heuristic.
const START: Point = { r: 4, c: 3 };
const GOAL: Point = { r: 4, c: 6 };
const LEFT_STATION = STATIONS[0];
const RIGHT_STATION = STATIONS[1];
const STATION_KEYS = new Set(STATIONS.map(keyOf));

export type CompletionResult = { tiles: RailTile[]; visited: number } | null;

/** Finds one legal final loop containing every already placed tile, using at most sixteen rail tiles. */
export function findCompletion(state: Pick<MonorailState, 'tiles'>, orderSeed = 0): CompletionResult {
  if (state.tiles.length > TILE_COUNT) return null;
  if (isComplete(state)) return { tiles: state.tiles, visited: 1 };
  const fixed = new Map(state.tiles.map((tile) => [keyOf(tile), tile]));
  if (fixed.size !== state.tiles.length || state.tiles.some((tile) => !inside(tile) || STATION_KEYS.has(keyOf(tile)))) return null;
  const required = new Set(fixed.keys());
  const visited = new Set<string>();
  const path: Point[] = [];
  let nodes = 0;
  let answer: RailTile[] | null = null;
  const baseOrders: Direction[][] = [
    ['n', 's', 'w', 'e'], ['s', 'n', 'e', 'w'], ['w', 'n', 's', 'e'], ['e', 's', 'n', 'w'],
    ['n', 'w', 's', 'e'], ['s', 'e', 'n', 'w'], ['w', 's', 'n', 'e'], ['e', 'n', 's', 'w'],
  ];
  const dirs = baseOrders[Math.abs(orderSeed) % baseOrders.length];

  const walk = (current: Point, previous: Point): boolean => {
    nodes += 1;
    const k = keyOf(current);
    if (!inside(current) || visited.has(k) || STATION_KEYS.has(k) || path.length >= TILE_COUNT) return false;
    visited.add(k); path.push(current); required.delete(k);

    const back = direction(current, previous)!;
    const fixedTile = fixed.get(k);
    let nextDirs: readonly Direction[] = dirs;
    if (fixedTile) {
      const ports = PORTS[fixedTile.shape];
      if (!ports.includes(back)) nextDirs = [];
      else nextDirs = [ports[0] === back ? ports[1] : ports[0]];
    }

    for (const d of nextDirs) {
      if (d === back) continue;
      const shape = shapeFor(back, d);
      if (!shape || (fixedTile && fixedTile.shape !== shape)) continue;
      const next = step(current, d);
      if (keyOf(next) === keyOf(RIGHT_STATION)) {
        if (k === keyOf(GOAL) && required.size === 0) {
          answer = path.map((point, i) => {
            const prev = i === 0 ? LEFT_STATION : path[i - 1];
            const after = i === path.length - 1 ? RIGHT_STATION : path[i + 1];
            const a = direction(point, prev)!;
            const b = direction(point, after)!;
            return { ...point, shape: shapeFor(a, b)!, skin: fixed.get(keyOf(point))?.skin ?? ((point.r * 11 + point.c * 7 + i) % 6) };
          });
          return true;
        }
        continue;
      }
      if (!inside(next) || STATION_KEYS.has(keyOf(next)) || visited.has(keyOf(next))) continue;
      const usedAfterNext = path.length + 1;
      const slotsAfterNext = TILE_COUNT - usedAfterNext;
      if (required.size - (required.has(keyOf(next)) ? 1 : 0) > slotsAfterNext) continue;
      const distance = Math.abs(next.r - GOAL.r) + Math.abs(next.c - GOAL.c);
      if (distance > slotsAfterNext) continue;
      if (walk(next, current)) return true;
    }

    visited.delete(k); path.pop();
    if (fixed.has(k)) required.add(k);
    return false;
  };

  walk(START, LEFT_STATION);
  return answer ? { tiles: answer, visited: nodes } : null;
}

/** Declares Impossible at the beginning of a turn and resolves it with an exhaustive completion check. */
export function declareImpossible(state: MonorailState): MonorailState | null {
  if (state.winner !== null) return null;
  const completion = findCompletion(state);
  if (completion) return { ...state, winner: other(state.turn), reason: 'impossible-wrong', proof: completion.tiles };
  return { ...state, winner: state.turn, reason: 'impossible-right', proof: null };
}

function candidatesFromSolution(state: MonorailState, solution: RailTile[]) {
  const board = occupied(state);
  const missing = solution.filter((tile) => !board.has(keyOf(tile)));
  const out: MonorailMove[] = [];
  for (let i = 0; i < missing.length; i += 1) for (let n = 1; n <= 3; n += 1) {
    const group = missing.slice(i, i + n);
    if (group.length !== n) continue;
    const move = { tiles: group };
    if (legalMove(state, move)) out.push(move);
  }
  return out;
}

/** A deliberately broad fallback pool, including mistakes, used to keep Normal human-beatable. */
function frontierMoves(state: MonorailState) {
  const board = occupied(state), seen = new Set<string>(), moves: MonorailMove[] = [];
  for (const tile of board.values()) for (const d of Object.keys(DELTA) as Direction[]) {
    const p = step(tile, d), k = keyOf(p);
    if (!inside(p) || board.has(k) || seen.has(k)) continue;
    seen.add(k);
    for (const shape of SHAPES) moves.push({ tiles: [{ ...p, shape, skin: (p.r * 5 + p.c * 3 + state.moveNo) % 6 }] });
  }
  return moves;
}

export type MonorailAiAction = { t: 'move'; move: MonorailMove } | { t: 'impossible' };

/** Normal follows its best line about half the time; Hard does so four times in five. */
export function chooseMonorailAction(state: MonorailState, level: MonorailLevel, random = Math.random): MonorailAiAction {
  const completions = Array.from({ length: level === 'hard' ? 8 : 4 }, (_, i) => findCompletion(state, i)).filter((x): x is NonNullable<typeof x> => !!x);
  if (!completions.length) return { t: 'impossible' };
  const unique = new Map<string, MonorailMove>();
  for (const completion of completions) for (const move of candidatesFromSolution(state, completion.tiles)) {
    unique.set(move.tiles.map((tile) => `${keyOf(tile)}:${tile.shape}`).sort().join('|'), move);
  }
  const safe = [...unique.values()].map((move) => {
    const next = playMonorail(state, move)!;
    const remaining = TILE_COUNT - next.tiles.length;
    const immediate = next.winner === state.turn;
    // With a fixed route, leaving a multiple of four is the 1–3 tile take-away strategy.
    const score = (immediate ? 10000 : 0) + (remaining % 4 === 0 ? 900 : 0) + move.tiles.length * 8 + random();
    return { move, score };
  }).sort((a, b) => b.score - a.score);
  if (!safe.length) return { t: 'impossible' };
  const accuracy = level === 'hard' ? 0.9 : 0.52;
  if (random() < accuracy) return { t: 'move', move: safe[0].move };
  const broad = frontierMoves(state);
  return { t: 'move', move: broad[Math.floor(random() * broad.length)] ?? safe[Math.floor(random() * safe.length)].move };
}

export function moveText(move: MonorailMove) {
  return move.tiles.map((tile) => `${String.fromCharCode(65 + tile.c)}${BOARD_SIZE - tile.r}`).join(' · ');
}

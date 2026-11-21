// 모노레일 (Venice Connection): two station tiles and sixteen double-sided rail tiles.
// A turn places one to three tiles in one straight, contiguous row. Track ends may be left
// unmatched while playing; the game ends only when every tile on the table belongs to one loop.

export type Player = 0 | 1;
export type RailShape = 'h' | 'v' | 'ne' | 'se' | 'sw' | 'nw';
export type Point = { r: number; c: number };
export type RailTile = Point & { shape: RailShape; skin: number };
export type MonorailMove = { tiles: RailTile[] };
export type MonorailLevel = 'normal' | 'hard';

// The real table has no edge; only the sixteen tiles limit a loop. A loop of at most sixteen rail
// tiles reaches no further than 6 rows above or below the stations, 6 columns left of them and 7 to the
// right. A 15×15 grid with the stations at row 7, columns 6–7 holds every such loop, so the board edge
// can never decide an Impossible call. The camera in MonorailBoard only shows the part in play.
export const BOARD_SIZE = 15;
export const TILE_COUNT = 16;
export const STATIONS: readonly RailTile[] = [
  { r: 7, c: 6, shape: 'h', skin: 0 },
  { r: 7, c: 7, shape: 'h', skin: 1 },
];
export const SHAPES: readonly RailShape[] = ['h', 'v', 'ne', 'se', 'sw', 'nw'];

// 'proved' / 'gave-up' settle an Impossible call the broadcast way: the challenged player must finish the
// loop with the remaining tiles. 'impossible-right' / 'impossible-wrong' remain for older saved rooms.
export type FinishReason = 'loop' | 'proved' | 'gave-up' | 'impossible-right' | 'impossible-wrong' | 'resign' | 'timeout';
export type MonorailState = {
  tiles: RailTile[];
  turn: Player;
  winner: Player | null;
  reason: FinishReason | null;
  last: MonorailMove | null;
  /** After a give-up: a completion that existed after all (null when the call was truly right). */
  proof: RailTile[] | null;
  moveNo: number;
  /** The player who declared Impossible while the opponent is trying to finish the loop. */
  challenger?: Player | null;
};

export const newMonorail = (): MonorailState => ({
  tiles: [], turn: 0, winner: null, reason: null, last: null, proof: null, moveNo: 0, challenger: null,
});
export const inChallenge = (state: MonorailState) => state.winner === null && state.challenger != null;
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
  if (state.winner !== null || state.challenger != null || list.length < 1 || list.length > 3 || list.length > TILE_COUNT - state.tiles.length) return false;
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
const LEFT_STATION = STATIONS[0];
const RIGHT_STATION = STATIONS[1];
const START: Point = { r: LEFT_STATION.r, c: LEFT_STATION.c - 1 };
const GOAL: Point = { r: RIGHT_STATION.r, c: RIGHT_STATION.c + 1 };
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
  const seed = Math.abs(orderSeed);

  const walk = (current: Point, previous: Point): boolean => {
    nodes += 1;
    const k = keyOf(current);
    if (!inside(current) || visited.has(k) || STATION_KEYS.has(k) || path.length >= TILE_COUNT) return false;
    visited.add(k); path.push(current); required.delete(k);

    const back = direction(current, previous)!;
    const fixedTile = fixed.get(k);
    // Vary the branch order at every cell, not just once per search. The solver stays
    // exhaustive, while different seeds expose genuinely different completion routes
    // for the AI to compare.
    let nextDirs: readonly Direction[] = baseOrders[(seed + current.r * 11 + current.c * 7 + path.length * 5) % baseOrders.length];
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

/**
 * Declares Impossible at the beginning of a turn. As on the broadcast, the opponent now gets the turn to
 * finish the loop with the remaining tiles: finishing wins for them, giving up (or time) wins for the caller.
 */
export function declareImpossible(state: MonorailState): MonorailState | null {
  if (state.winner !== null || state.challenger != null) return null;
  return { ...state, challenger: state.turn, turn: other(state.turn), proof: null };
}

/** True when these tiles could legally be laid down as (part of) a completion attempt. */
export function validProofTiles(state: MonorailState, tiles: RailTile[]) {
  if (!inChallenge(state) || tiles.length > TILE_COUNT - state.tiles.length) return false;
  const board = occupied(state), keys = new Set(tiles.map(keyOf));
  return keys.size === tiles.length && tiles.every((tile) => inside(tile) && SHAPES.includes(tile.shape) && !board.has(keyOf(tile)));
}

/** The challenged player lays any number of the remaining tiles at once. Null unless they close the loop. */
export function proveCompletion(state: MonorailState, tiles: RailTile[]): MonorailState | null {
  if (!tiles.length || !validProofTiles(state, tiles)) return null;
  const placed = tiles.map((tile, i) => ({ ...tile, skin: Number.isInteger(tile.skin) ? Math.abs(tile.skin) % 6 : (state.tiles.length + i) % 6 }));
  const next: MonorailState = { ...state, tiles: [...state.tiles, ...placed], last: { tiles: placed }, moveNo: state.moveNo + 1 };
  return isComplete(next) ? { ...next, winner: state.turn, reason: 'proved' } : null;
}

/** The challenged player concedes. Shows a completion if one existed, so nobody is left wondering. */
export function giveUpChallenge(state: MonorailState): MonorailState | null {
  if (!inChallenge(state)) return null;
  return { ...state, winner: state.challenger!, reason: 'gave-up', proof: findCompletion(state)?.tiles ?? null };
}

/** How the AI answers an Impossible call: finish the loop when any completion exists, otherwise concede. */
export function answerChallenge(state: MonorailState): { t: 'prove'; tiles: RailTile[] } | { t: 'give-up' } {
  const completion = findCompletion(state);
  if (!completion) return { t: 'give-up' };
  const board = occupied(state);
  return { t: 'prove', tiles: completion.tiles.filter((tile) => !board.has(keyOf(tile))) };
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

export type MonorailAiAction = { t: 'move'; move: MonorailMove } | { t: 'impossible' };

const moveKey = (move: MonorailMove) => move.tiles.map((tile) => `${keyOf(tile)}:${tile.shape}`).sort().join('|');
const completionKey = (tiles: RailTile[]) => tiles.map((tile) => `${keyOf(tile)}:${tile.shape}`).sort().join('|');
const stateKey = (state: MonorailState) => `${state.turn};${state.tiles.map((tile) => `${keyOf(tile)}:${tile.shape}`).sort().join('|')}`;

type RankedMove = { move: MonorailMove; score: number };
type SearchConfig = { depth: number; nodes: number; rootSamples: number; innerSamples: number; rootMoves: number; innerMoves: number };
type SearchContext = SearchConfig & { used: number; cache: Map<string, number> };

/** Samples distinct, exact completion routes. A null first probe proves that Impossible is correct. */
function completionRoutes(state: MonorailState, count: number, first?: NonNullable<CompletionResult>) {
  const routes = new Map<string, NonNullable<CompletionResult>>();
  if (first) routes.set(completionKey(first.tiles), first);
  for (let seed = 0; seed < count * 2 && routes.size < count; seed += 1) {
    const completion = findCompletion(state, seed + state.moveNo * 17);
    if (!completion) break;
    routes.set(completionKey(completion.tiles), completion);
  }
  return [...routes.values()];
}

/**
 * Every returned move belongs to at least one exact full loop. Unlike the previous
 * random-frontier fallback, the AI can never hand the opponent a free Impossible win.
 */
function preservingMoves(state: MonorailState, first: NonNullable<CompletionResult>, samples: number, limit: number): RankedMove[] {
  const routes = completionRoutes(state, samples, first);
  const choices = new Map<string, { move: MonorailMove; votes: number; tempo: number; shortest: number }>();
  for (const route of routes) for (const move of candidatesFromSolution(state, route.tiles)) {
    const key = moveKey(move);
    const remaining = route.tiles.length - state.tiles.length - move.tiles.length;
    const current = choices.get(key) ?? { move, votes: 0, tempo: 0, shortest: TILE_COUNT };
    current.votes += 1;
    current.tempo += remaining % 4 === 0 ? 1 : 0;
    current.shortest = Math.min(current.shortest, remaining);
    choices.set(key, current);
  }

  return [...choices.values()].map(({ move, votes, tempo, shortest }) => {
    const next = playMonorail(state, move)!;
    const immediate = next.winner === state.turn;
    // Route consensus avoids brittle plans; leaving 4k tiles is strong in the 1–3 take-away endgame.
    const score = (immediate ? 1_000_000 : 0) + tempo * 900 + votes * 120 + move.tiles.length * 14 - shortest;
    return { move, score };
  }).sort((a, b) => b.score - a.score || moveKey(a.move).localeCompare(moveKey(b.move))).slice(0, limit);
}

function leafScore(state: MonorailState, first: NonNullable<CompletionResult>, samples: number) {
  const routes = completionRoutes(state, samples, first);
  const remainders = routes.map((route) => route.tiles.length - state.tiles.length);
  const favourable = remainders.filter((left) => left % 4 !== 0).length;
  const shortest = Math.min(...remainders);
  return (favourable * 2 - routes.length) * 90 + routes.length * 16 - shortest;
}

/** Negamax from the player-to-move's view, with an exact Impossible check at every node. */
function searchPosition(state: MonorailState, depth: number, context: SearchContext): number {
  context.used += 1;
  const probe = findCompletion(state, state.moveNo * 29 + depth);
  if (!probe) return 900_000 - state.moveNo; // Current player wins immediately by declaring Impossible.
  if (depth <= 0 || context.used >= context.nodes) return leafScore(state, probe, context.used >= context.nodes ? 1 : context.innerSamples);

  const cacheKey = `${stateKey(state)};${depth}`;
  const cached = context.cache.get(cacheKey);
  if (cached !== undefined) return cached;
  const moves = preservingMoves(state, probe, context.innerSamples, context.innerMoves);
  if (!moves.length) return leafScore(state, probe, context.innerSamples);

  let best = -1_000_000;
  for (const { move } of moves) {
    const next = playMonorail(state, move)!;
    const value = next.winner === state.turn
      ? 1_000_000 - next.moveNo
      : -searchPosition(next, depth - 1, context);
    if (value > best) best = value;
    if (best > 990_000 || context.used >= context.nodes) break;
  }
  context.cache.set(cacheKey, best);
  return best;
}

const SEARCH: Record<MonorailLevel, SearchConfig> = {
  // Medium still sees the opponent's reply, but may choose among several close safe plans.
  normal: { depth: 2, nodes: 60, rootSamples: 5, innerSamples: 1, rootMoves: 12, innerMoves: 6 },
  // Hard searches three plies with a wider set of alternative completion routes.
  hard: { depth: 3, nodes: 240, rootSamples: 10, innerSamples: 2, rootMoves: 20, innerMoves: 8 },
};

/** Exact Impossible detection plus bounded adversarial look-ahead. All played moves preserve a full loop. */
export function chooseMonorailAction(state: MonorailState, level: MonorailLevel, random = Math.random): MonorailAiAction {
  const probe = findCompletion(state, state.moveNo * 31);
  if (!probe) return { t: 'impossible' };
  const config = SEARCH[level];
  const candidates = preservingMoves(state, probe, config.rootSamples, config.rootMoves);
  if (!candidates.length) {
    const fallback = candidatesFromSolution(state, probe.tiles)[0];
    return fallback ? { t: 'move', move: fallback } : { t: 'impossible' };
  }

  const context: SearchContext = { ...config, used: 0, cache: new Map() };
  const scored = candidates.map(({ move, score }) => {
    const next = playMonorail(state, move)!;
    const lookAhead = next.winner === state.turn
      ? 1_000_000 - next.moveNo
      : -searchPosition(next, config.depth - 1, context);
    return { move, score: lookAhead * 10 + score };
  }).sort((a, b) => b.score - a.score || moveKey(a.move).localeCompare(moveKey(b.move)));

  if (level === 'hard' || scored.length === 1) return { t: 'move', move: scored[0].move };
  // Medium varies between the best few searched plans, but never chooses a route-breaking move.
  const close = scored.filter((item) => item.score >= scored[0].score - 1_200).slice(0, 3);
  return { t: 'move', move: close[Math.floor(random() * close.length)].move };
}

export function moveText(move: MonorailMove) {
  return move.tiles.map((tile) => `${String.fromCharCode(65 + tile.c)}${BOARD_SIZE - tile.r}`).join(' · ');
}

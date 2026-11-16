export const BOARD_SIZE = 7;

export type PlayerId = 0 | 1 | 2;
export type Direction = 'up' | 'right' | 'down' | 'left';
export type AiDifficulty = 'easy' | 'normal' | 'hard';
export type Position = { row: number; col: number };
export type Piece = Position & { id: string; player: PlayerId };
export type MoveOption = {
  pieceId: string;
  from: Position;
  to: Position;
  distance: 1 | 2;
  brokenWall?: string;
};
export type TerritoryResult = {
  scores: [number, number, number];
  largest: [number, number, number];
  separated: boolean;
  cellOwners: Record<string, PlayerId | null>;
};

export type ModeId = 'three' | 'two';
export type GameMode = {
  id: ModeId;
  players: PlayerId[];
  totalPieces: number;
  fixedPieces: Piece[];
  wallBreak: boolean;
};

// Round 1 (3 players, 2 pieces each, one wall break) and round 2 (1:1, 4 pieces each with 2 fixed, no wall break).
export const MODES: Record<ModeId, GameMode> = {
  three: { id: 'three', players: [0, 1, 2], totalPieces: 6, fixedPieces: [], wallBreak: true },
  two: {
    id: 'two',
    players: [0, 1],
    totalPieces: 8,
    fixedPieces: [
      { id: '0-f0', player: 0, row: 1, col: 1 },
      { id: '0-f1', player: 0, row: 5, col: 5 },
      { id: '1-f0', player: 1, row: 1, col: 5 },
      { id: '1-f1', player: 1, row: 5, col: 1 },
    ],
    wallBreak: false,
  },
};

export function placementOrder(mode: GameMode, first: PlayerId): PlayerId[] {
  if (mode.id === 'three') return [0, 1, 2, 2, 1, 0];
  const second: PlayerId = first === 0 ? 1 : 0;
  return [first, second, second, first];
}

export function nextPlayerOf(mode: GameMode, player: PlayerId): PlayerId {
  return mode.players[(mode.players.indexOf(player) + 1) % mode.players.length];
}

export const DIRECTIONS: Record<Direction, Position> = {
  up: { row: -1, col: 0 },
  right: { row: 0, col: 1 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
};

export function isInside(position: Position) {
  return position.row >= 0 && position.row < BOARD_SIZE && position.col >= 0 && position.col < BOARD_SIZE;
}

export function positionKey(position: Position) {
  return `${position.row},${position.col}`;
}

export function edgeKey(a: Position, b: Position) {
  const first = positionKey(a);
  const second = positionKey(b);
  return first < second ? `${first}|${second}` : `${second}|${first}`;
}

export function neighbor(position: Position, direction: Direction): Position {
  const delta = DIRECTIONS[direction];
  return { row: position.row + delta.row, col: position.col + delta.col };
}

export function hasWall(walls: Set<string>, a: Position, b: Position) {
  return !isInside(b) || walls.has(edgeKey(a, b));
}

export function isOccupied(pieces: Piece[], position: Position, ignorePieceId?: string) {
  return pieces.some((piece) => piece.id !== ignorePieceId && piece.row === position.row && piece.col === position.col);
}

export function getMoveOptions(pieces: Piece[], walls: Set<string>, player: PlayerId, canBreakWall: boolean): MoveOption[] {
  const options: MoveOption[] = [];
  for (const piece of pieces.filter((item) => item.player === player)) {
    for (const direction of Object.keys(DIRECTIONS) as Direction[]) {
      let cursor: Position = { row: piece.row, col: piece.col };
      const crossedWalls: string[] = [];
      for (let distance = 1; distance <= 2; distance += 1) {
        const next = neighbor(cursor, direction);
        if (!isInside(next) || isOccupied(pieces, next, piece.id)) break;
        if (hasWall(walls, cursor, next)) crossedWalls.push(edgeKey(cursor, next));
        if (crossedWalls.length > (canBreakWall ? 1 : 0)) break;

        const movedPieces = pieces.map((item) => item.id === piece.id ? { ...item, ...next } : item);
        const movedWalls = new Set(walls);
        if (crossedWalls[0]) movedWalls.delete(crossedWalls[0]);
        if (getWallOptions(movedPieces, movedWalls, piece.id).length > 0) {
          options.push({
            pieceId: piece.id,
            from: { row: piece.row, col: piece.col },
            to: next,
            distance: distance as 1 | 2,
            brokenWall: crossedWalls[0],
          });
        }
        cursor = next;
      }
    }
  }
  return options;
}

export function applyMove(pieces: Piece[], walls: Set<string>, move: MoveOption) {
  const nextPieces = pieces.map((piece) => piece.id === move.pieceId ? { ...piece, ...move.to } : piece);
  const nextWalls = new Set(walls);
  if (move.brokenWall) nextWalls.delete(move.brokenWall);
  return { pieces: nextPieces, walls: nextWalls };
}

export function getWallOptions(pieces: Piece[], walls: Set<string>, pieceId: string) {
  const piece = pieces.find((item) => item.id === pieceId);
  if (!piece) return [] as { direction: Direction; key: string; neighbor: Position }[];
  return (Object.keys(DIRECTIONS) as Direction[])
    .map((direction) => {
      const next = neighbor(piece, direction);
      return { direction, key: edgeKey(piece, next), neighbor: next };
    })
    .filter((option) => isInside(option.neighbor) && !walls.has(option.key));
}

export function getTerritory(pieces: Piece[], walls: Set<string>, totalPieces = 6): TerritoryResult {
  const visited = new Set<string>();
  const scores: [number, number, number] = [0, 0, 0];
  const largest: [number, number, number] = [0, 0, 0];
  const cellOwners: Record<string, PlayerId | null> = {};
  let separated = pieces.length === totalPieces;

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const start = { row, col };
      if (visited.has(positionKey(start))) continue;
      const queue = [start];
      const cells: Position[] = [];
      visited.add(positionKey(start));
      while (queue.length) {
        const current = queue.shift()!;
        cells.push(current);
        for (const direction of Object.keys(DIRECTIONS) as Direction[]) {
          const next = neighbor(current, direction);
          if (!isInside(next) || hasWall(walls, current, next) || visited.has(positionKey(next))) continue;
          visited.add(positionKey(next));
          queue.push(next);
        }
      }

      const cellKeys = new Set(cells.map(positionKey));
      const owners = new Set<PlayerId>();
      for (const piece of pieces) if (cellKeys.has(positionKey(piece))) owners.add(piece.player);
      if (owners.size > 1) {
        separated = false;
        for (const cell of cells) cellOwners[positionKey(cell)] = null;
      } else {
        for (const owner of owners) {
          scores[owner] += cells.length;
          largest[owner] = Math.max(largest[owner], cells.length);
          for (const cell of cells) cellOwners[positionKey(cell)] = owner;
        }
        if (owners.size === 0) for (const cell of cells) cellOwners[positionKey(cell)] = null;
      }
    }
  }
  return { scores, largest, separated, cellOwners };
}

/** True when no player in the mode has a legal move (the game cannot progress). */
export function noOneCanMove(pieces: Piece[], walls: Set<string>, mode: GameMode, breaks: boolean[]) {
  return mode.players.every((player) => getMoveOptions(pieces, walls, player, mode.wallBreak && breaks[player]).length === 0);
}

export function getWinner(territory: TerritoryResult, players: PlayerId[] = [0, 1, 2]): PlayerId {
  return [...players].sort((a, b) =>
    territory.scores[b] - territory.scores[a] || territory.largest[b] - territory.largest[a],
  )[0];
}

// ---------- AI ----------
//
// The AI estimates territory before it is closed: every empty square goes to the player whose
// pieces can reach it in the fewest steps (walls and pieces block the way); ties belong to nobody.
// Closed regions are scored exactly. "Hard" also reads the next player's best reply.

type Candidate = { move: MoveOption; wall: string; direction: Direction; pieces: Piece[]; walls: Set<string>; value: number };
const CELLS = BOARD_SIZE * BOARD_SIZE;
const cellIndex = (p: Position) => p.row * BOARD_SIZE + p.col;

/** Steps from each player's pieces to every square (multi-source BFS). */
function reachDistances(pieces: Piece[], walls: Set<string>, players: PlayerId[]): Int16Array[] {
  const blocked = new Uint8Array(CELLS);
  for (const piece of pieces) blocked[cellIndex(piece)] = 1;
  return players.map((player) => {
    const dist = new Int16Array(CELLS).fill(999);
    const queue: Position[] = [];
    for (const piece of pieces) if (piece.player === player) { dist[cellIndex(piece)] = 0; queue.push(piece); }
    for (let head = 0; head < queue.length; head += 1) {
      const current = queue[head];
      const d = dist[cellIndex(current)] + 1;
      for (const direction of Object.keys(DIRECTIONS) as Direction[]) {
        const next = neighbor(current, direction);
        if (!isInside(next) || hasWall(walls, current, next)) continue;
        const i = cellIndex(next);
        if (blocked[i] || dist[i] <= d) continue;
        dist[i] = d;
        queue.push(next);
      }
    }
    return dist;
  });
}

/** Expected territory per player: squares a player reaches strictly first (own pieces' squares count too). */
export function estimateTerritory(pieces: Piece[], walls: Set<string>, players: PlayerId[]): number[] {
  const dist = reachDistances(pieces, walls, players);
  const counts = [0, 0, 0];
  for (let i = 0; i < CELLS; i += 1) {
    let best = 999, owner = -1;
    for (let k = 0; k < players.length; k += 1) {
      const d = dist[k][i];
      if (d < best) { best = d; owner = k; } else if (d === best) owner = -1;
    }
    if (owner >= 0 && best < 999) counts[players[owner]] += 1;
  }
  return counts;
}

/** Open sides around a player's pieces; a piece with 0–1 open sides is close to being trapped. */
function trappedPenalty(pieces: Piece[], walls: Set<string>, player: PlayerId) {
  let penalty = 0;
  for (const piece of pieces) {
    if (piece.player !== player) continue;
    let open = 0;
    for (const direction of Object.keys(DIRECTIONS) as Direction[]) {
      const next = neighbor(piece, direction);
      if (isInside(next) && !hasWall(walls, piece, next) && !isOccupied(pieces, next)) open += 1;
    }
    if (open === 0) penalty += 4; else if (open === 1) penalty += 1.5;
  }
  return penalty;
}

/** Position value for `player`: exact when separated, otherwise expected territory against the strongest rival. */
export function evaluatePosition(pieces: Piece[], walls: Set<string>, player: PlayerId, mode: GameMode): number {
  const territory = getTerritory(pieces, walls, mode.totalPieces);
  if (territory.separated) {
    const winner = getWinner(territory, mode.players);
    const margin = territory.scores[player] - Math.max(...mode.players.filter((p) => p !== player).map((p) => territory.scores[p]));
    return (winner === player ? 10_000 : -10_000) + margin;
  }
  const est = estimateTerritory(pieces, walls, mode.players);
  const rivals = mode.players.filter((p) => p !== player).map((p) => est[p]);
  const strongest = Math.max(...rivals);
  const others = rivals.reduce((a, b) => a + b, 0) - strongest;
  return est[player] * 3 - strongest * 2 - others * 0.6 + territory.scores[player] * 0.5
    - trappedPenalty(pieces, walls, player) * 2 + trappedPenalty(pieces, walls, mode.players.find((p) => p !== player && est[p] === strongest) ?? player) * 0.5;
}

function candidates(pieces: Piece[], walls: Set<string>, player: PlayerId, canBreakWall: boolean, mode: GameMode): Candidate[] {
  const result: Candidate[] = [];
  for (const move of getMoveOptions(pieces, walls, player, canBreakWall)) {
    const moved = applyMove(pieces, walls, move);
    for (const option of getWallOptions(moved.pieces, moved.walls, move.pieceId)) {
      const nextWalls = new Set(moved.walls).add(option.key);
      // Breaking a wall is a one-time resource: only worth it for a clear gain.
      const value = evaluatePosition(moved.pieces, nextWalls, player, mode) - (move.brokenWall ? 6 : 0);
      result.push({ move, wall: option.key, direction: option.direction, pieces: moved.pieces, walls: nextWalls, value });
    }
  }
  return result.sort((a, b) => b.value - a.value);
}

export function chooseBotPlacement(pieces: Piece[], player: PlayerId, difficulty: AiDifficulty = 'normal', mode: GameMode = MODES.three): Position {
  const empty: Position[] = [];
  for (let row = 0; row < BOARD_SIZE; row += 1) for (let col = 0; col < BOARD_SIZE; col += 1) if (!isOccupied(pieces, { row, col })) empty.push({ row, col });
  if (difficulty === 'easy') return empty[Math.floor(Math.random() * empty.length)] ?? { row: 3, col: 3 };
  const walls = new Set<string>();
  const scored = empty.map((position) => {
    const next = [...pieces, { id: 'probe', player, ...position }];
    const est = estimateTerritory(next, walls, mode.players);
    const rivals = Math.max(0, ...mode.players.filter((p) => p !== player).map((p) => est[p]));
    const center = Math.abs(position.row - 3) + Math.abs(position.col - 3);
    return { position, value: est[player] * 2 - rivals - center * 0.3 + Math.random() * (difficulty === 'hard' ? 0.3 : 1.5) };
  });
  scored.sort((a, b) => b.value - a.value);
  return scored[0]?.position ?? { row: 3, col: 3 };
}

export function chooseBotAction(pieces: Piece[], walls: Set<string>, player: PlayerId, canBreakWall: boolean, difficulty: AiDifficulty = 'normal', mode: GameMode = MODES.three) {
  const list = candidates(pieces, walls, player, canBreakWall, mode);
  if (!list.length) return null;
  if (difficulty === 'easy') {
    // Mostly sensible, often sloppy: pick among the better half with plenty of noise.
    const pool = list.slice(0, Math.max(1, Math.ceil(list.length / 2)));
    return pool[Math.floor(Math.random() * pool.length)];
  }
  const immediateWin = list.find((c) => c.value >= 9_000);
  if (immediateWin) return immediateWin;
  if (difficulty === 'normal') {
    const top = list.slice(0, Math.min(3, list.length));
    return top[Math.floor(Math.random() * top.length)];
  }
  // Hard: for the most promising moves, assume the next player answers with their best move.
  const next = nextPlayerOf(mode, player);
  let best = list[0], bestValue = -Infinity;
  for (const candidate of list.slice(0, 14)) {
    const replies = candidates(candidate.pieces, candidate.walls, next, false, mode);
    const reply = replies[0];
    const value = reply ? evaluatePosition(reply.pieces, reply.walls, player, mode) : candidate.value + 2;
    const blended = value * 0.75 + candidate.value * 0.25;
    if (blended > bestValue) { bestValue = blended; best = candidate; }
  }
  return best;
}

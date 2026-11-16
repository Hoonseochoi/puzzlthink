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

export function chooseBotPlacement(pieces: Piece[], player: PlayerId): Position {
  const candidates: { position: Position; value: number }[] = [];
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const position = { row, col };
      if (isOccupied(pieces, position)) continue;
      const centerDistance = Math.abs(row - 3) + Math.abs(col - 3);
      const ownPieces = pieces.filter((piece) => piece.player === player);
      const ownDistance = ownPieces.length ? Math.min(...ownPieces.map((piece) => Math.abs(piece.row - row) + Math.abs(piece.col - col))) : 3;
      const nearest = pieces.length ? Math.min(...pieces.map((piece) => Math.abs(piece.row - row) + Math.abs(piece.col - col))) : 3;
      candidates.push({ position, value: ownDistance * 2.2 + nearest * 0.4 - centerDistance * 0.35 + Math.random() });
    }
  }
  candidates.sort((a, b) => b.value - a.value);
  return candidates[0]?.position ?? { row: 3, col: 3 };
}

export function chooseBotAction(pieces: Piece[], walls: Set<string>, player: PlayerId, canBreakWall: boolean, difficulty: AiDifficulty = 'normal', mode: GameMode = MODES.three) {
  const candidates: {
    move: MoveOption; wall: string; direction: Direction; pieces: Piece[]; walls: Set<string>; value: number;
  }[] = [];
  for (const move of getMoveOptions(pieces, walls, player, canBreakWall)) {
    const moved = applyMove(pieces, walls, move);
    for (const wallOption of getWallOptions(moved.pieces, moved.walls, move.pieceId)) {
      const nextWalls = new Set(moved.walls).add(wallOption.key);
      const territory = getTerritory(moved.pieces, nextWalls, mode.totalPieces);
      const opponentScore = Math.max(...territory.scores.filter((_, index) => index !== player));
      const mobility = getMoveOptions(moved.pieces, nextWalls, player, false).length;
      const opponentMobility = mode.players
        .filter((id) => id !== player)
        .reduce<number>((sum, id) => sum + getMoveOptions(moved.pieces, nextWalls, id, false).length, 0);
      const winBonus = territory.separated ? (getWinner(territory, mode.players) === player ? 10_000 : -10_000) : 0;
      const value = winBonus + territory.scores[player] * 7 + territory.largest[player] * 2
        - opponentScore * 3 + mobility * 0.45 - opponentMobility * 0.15
        - (move.brokenWall ? 5 : 0) + Math.random() * 1.8;
      candidates.push({ move, wall: wallOption.key, direction: wallOption.direction, pieces: moved.pieces, walls: nextWalls, value });
    }
  }
  candidates.sort((a, b) => b.value - a.value);
  if (!candidates.length) return null;
  if (difficulty === 'easy') return candidates[Math.floor(Math.random() * candidates.length)];
  if (difficulty === 'normal') return candidates[Math.floor(Math.random() * Math.min(4, candidates.length))];
  return candidates[0];
}

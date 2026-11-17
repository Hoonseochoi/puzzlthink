export const LASER_BOARD_SIZE = 8;

export type LaserOwner = 0 | 1;
export type LaserPieceType = 'laser' | 'splitter' | 'king' | 'triangle' | 'square';
export type LaserDifficulty = 'easy' | 'normal' | 'hard';
export type Direction = 0 | 1 | 2 | 3; // up, right, down, left

export interface LaserPiece {
  id: string;
  owner: LaserOwner;
  type: LaserPieceType;
  row: number;
  col: number;
  direction: Direction;
}

export type LaserAction =
  | { type: 'move'; pieceId: string; row: number; col: number }
  | { type: 'rotate'; pieceId: string; delta: -1 | 1 };

export interface LaserSegment {
  from: { row: number; col: number };
  to: { row: number; col: number };
  branch: number;
  outcome: 'exit' | 'reflect' | 'split' | 'capture' | 'block' | 'king';
  hitId?: string;
}

export interface LaserShot {
  owner: LaserOwner;
  segments: LaserSegment[];
  captured: string[];
  kingHits: LaserOwner[];
}

export interface LaserTurnResult {
  pieces: LaserPiece[];
  shot: LaserShot;
  winner: LaserOwner | null;
}

export const PIECE_COUNTS: Record<LaserPieceType, number> = {
  laser: 1,
  splitter: 1,
  king: 1,
  triangle: 5,
  square: 2,
};

export const PIECE_VALUES: Record<LaserPieceType, number> = {
  laser: 0,
  splitter: 7,
  king: 1000,
  triangle: 3,
  square: 5,
};

const DELTAS: Record<Direction, { row: number; col: number }> = {
  0: { row: -1, col: 0 },
  1: { row: 0, col: 1 },
  2: { row: 1, col: 0 },
  3: { row: 0, col: -1 },
};

const rotateDirection = (direction: Direction, delta: -1 | 1) => ((direction + delta + 4) % 4) as Direction;
const opposite = (direction: Direction) => ((direction + 2) % 4) as Direction;
export const isLaserCell = (row: number, col: number) => row >= 0 && row < LASER_BOARD_SIZE && col >= 0 && col < LASER_BOARD_SIZE;

function piece(id: string, owner: LaserOwner, type: LaserPieceType, row: number, col: number, direction: Direction): LaserPiece {
  return { id, owner, type, row, col, direction };
}

/** Symmetric broadcast-inspired setup. Each emitter is initially shielded by its own square knight. */
export function initialLaserPieces(): LaserPiece[] {
  const blue: LaserPiece[] = [
    piece('b-laser', 0, 'laser', 7, 0, 1),
    piece('b-king', 0, 'king', 7, 4, 0),
    piece('b-splitter', 0, 'splitter', 6, 4, 0),
    piece('b-square-0', 0, 'square', 7, 2, 3),
    piece('b-square-1', 0, 'square', 6, 6, 0),
    piece('b-triangle-0', 0, 'triangle', 6, 0, 0),
    piece('b-triangle-1', 0, 'triangle', 6, 2, 1),
    piece('b-triangle-2', 0, 'triangle', 6, 5, 0),
    piece('b-triangle-3', 0, 'triangle', 7, 6, 3),
    piece('b-triangle-4', 0, 'triangle', 5, 1, 1),
  ];
  const red = blue.map((item): LaserPiece => ({
    ...item,
    id: item.id.replace(/^b-/, 'r-'),
    owner: 1,
    row: LASER_BOARD_SIZE - 1 - item.row,
    col: LASER_BOARD_SIZE - 1 - item.col,
    direction: ((item.direction + 2) % 4) as Direction,
  }));
  return [...red, ...blue];
}

export const pieceAt = (pieces: LaserPiece[], row: number, col: number) => pieces.find((item) => item.row === row && item.col === col);

export function legalActions(pieces: LaserPiece[], owner: LaserOwner): LaserAction[] {
  const actions: LaserAction[] = [];
  for (const item of pieces) {
    if (item.owner !== owner) continue;
    if (item.type !== 'laser') {
      for (let dr = -1; dr <= 1; dr += 1) for (let dc = -1; dc <= 1; dc += 1) {
        if (dr === 0 && dc === 0) continue;
        const row = item.row + dr;
        const col = item.col + dc;
        if (isLaserCell(row, col) && !pieceAt(pieces, row, col)) actions.push({ type: 'move', pieceId: item.id, row, col });
      }
    }
    for (const delta of [-1, 1] as const) {
      const next = rotateDirection(item.direction, delta);
      if (item.type === 'laser') {
        const step = DELTAS[next];
        if (!isLaserCell(item.row + step.row, item.col + step.col)) continue;
      }
      actions.push({ type: 'rotate', pieceId: item.id, delta });
    }
  }
  return actions;
}

export function isLegalLaserAction(pieces: LaserPiece[], owner: LaserOwner, action: LaserAction) {
  return legalActions(pieces, owner).some((candidate) => JSON.stringify(candidate) === JSON.stringify(action));
}

/**
 * Triangle mirror (a right triangle, like a Khet pyramid). Its mirror is the long side, which faces two
 * directions: `direction` and the next one clockwise (0 = faces up and right). A beam coming in against
 * one of those faces turns out through the other; a beam hitting either short side destroys the piece.
 * Example (direction 0): a beam travelling down turns right, a beam travelling left turns up.
 */
function triangleReflection(item: LaserPiece, incoming: Direction): Direction | null {
  const faceA = item.direction;
  const faceB = ((item.direction + 1) % 4) as Direction;
  if (incoming === opposite(faceA)) return faceB;
  if (incoming === opposite(faceB)) return faceA;
  return null;
}

/** Splitter always transmits and creates one diagonal reflection. */
function splitterReflection(item: LaserPiece, incoming: Direction): Direction {
  const slash = item.direction % 2 === 0;
  const slashMap: Record<Direction, Direction> = { 0: 1, 1: 0, 2: 3, 3: 2 };
  const backslashMap: Record<Direction, Direction> = { 0: 3, 3: 0, 2: 1, 1: 2 };
  return (slash ? slashMap : backslashMap)[incoming];
}

export function traceLaser(pieces: LaserPiece[], owner: LaserOwner): LaserShot {
  const emitter = pieces.find((item) => item.owner === owner && item.type === 'laser');
  if (!emitter) return { owner, segments: [], captured: [], kingHits: [] };

  const segments: LaserSegment[] = [];
  const captured = new Set<string>();
  const kingHits = new Set<LaserOwner>();
  const queue: { row: number; col: number; direction: Direction; branch: number }[] = [{ row: emitter.row, col: emitter.col, direction: emitter.direction, branch: 0 }];
  const visited = new Set<string>();
  let nextBranch = 1;

  while (queue.length && segments.length < 96) {
    const ray = queue.shift()!;
    const visitKey = `${ray.row}:${ray.col}:${ray.direction}`;
    if (visited.has(visitKey)) continue;
    visited.add(visitKey);
    const from = { row: ray.row, col: ray.col };
    const step = DELTAS[ray.direction];
    let row = ray.row;
    let col = ray.col;

    while (true) {
      row += step.row;
      col += step.col;
      if (!isLaserCell(row, col)) {
        segments.push({ from, to: { row: Math.max(-0.5, Math.min(7.5, row)), col: Math.max(-0.5, Math.min(7.5, col)) }, branch: ray.branch, outcome: 'exit' });
        break;
      }
      const hit = pieceAt(pieces, row, col);
      if (!hit) continue;

      if (hit.type === 'king') {
        segments.push({ from, to: { row, col }, branch: ray.branch, outcome: 'king', hitId: hit.id });
        captured.add(hit.id);
        kingHits.add(hit.owner);
        break;
      }
      if (hit.type === 'laser') {
        segments.push({ from, to: { row, col }, branch: ray.branch, outcome: 'block', hitId: hit.id });
        break;
      }
      if (hit.type === 'splitter') {
        const reflected = splitterReflection(hit, ray.direction);
        segments.push({ from, to: { row, col }, branch: ray.branch, outcome: 'split', hitId: hit.id });
        queue.push({ row, col, direction: ray.direction, branch: ray.branch });
        queue.push({ row, col, direction: reflected, branch: nextBranch++ });
        break;
      }
      if (hit.type === 'triangle') {
        const reflected = triangleReflection(hit, ray.direction);
        if (reflected === null) {
          segments.push({ from, to: { row, col }, branch: ray.branch, outcome: 'capture', hitId: hit.id });
          captured.add(hit.id);
        } else {
          segments.push({ from, to: { row, col }, branch: ray.branch, outcome: 'reflect', hitId: hit.id });
          queue.push({ row, col, direction: reflected, branch: ray.branch });
        }
        break;
      }

      const incomingSide = opposite(ray.direction);
      if (incomingSide === hit.direction) {
        segments.push({ from, to: { row, col }, branch: ray.branch, outcome: 'reflect', hitId: hit.id });
        queue.push({ row, col, direction: opposite(ray.direction), branch: ray.branch });
      } else {
        segments.push({ from, to: { row, col }, branch: ray.branch, outcome: 'capture', hitId: hit.id });
        captured.add(hit.id);
      }
      break;
    }
  }

  return { owner, segments, captured: [...captured], kingHits: [...kingHits] };
}

export function applyLaserAction(pieces: LaserPiece[], owner: LaserOwner, action: LaserAction): LaserTurnResult | null {
  if (!isLegalLaserAction(pieces, owner, action)) return null;
  const moved = pieces.map((item): LaserPiece => {
    if (item.id !== action.pieceId) return item;
    if (action.type === 'move') return { ...item, row: action.row, col: action.col };
    return { ...item, direction: rotateDirection(item.direction, action.delta) };
  });
  const shot = traceLaser(moved, owner);
  const removed = new Set(shot.captured);
  const nextPieces = moved.filter((item) => !removed.has(item.id));
  const winner = shot.kingHits.length ? (shot.kingHits.includes(owner) ? (1 - owner) as LaserOwner : owner) : null;
  return { pieces: nextPieces, shot, winner };
}

export const actionLabel = (action: LaserAction) => action.type === 'move'
  ? `${action.pieceId}:${action.row},${action.col}`
  : `${action.pieceId}:${action.delta > 0 ? 'R' : 'L'}`;

function materialScore(pieces: LaserPiece[], owner: LaserOwner) {
  return pieces.reduce((score, item) => score + PIECE_VALUES[item.type] * (item.owner === owner ? 1 : -1), 0);
}

function scoreResult(before: LaserPiece[], result: LaserTurnResult, owner: LaserOwner) {
  if (result.winner === owner) return 1_000_000;
  if (result.winner !== null) return -1_000_000;
  const material = materialScore(result.pieces, owner) * 100;
  const enemyKing = result.pieces.find((item) => item.owner !== owner && item.type === 'king');
  const ownKing = result.pieces.find((item) => item.owner === owner && item.type === 'king');
  const pressure = enemyKing ? result.shot.segments.reduce((best, segment) => Math.min(best, Math.abs(segment.to.row - enemyKing.row) + Math.abs(segment.to.col - enemyKing.col)), 20) : 0;
  const ownSafety = ownKing ? Math.min(...before.filter((item) => item.owner !== owner).map((item) => Math.abs(item.row - ownKing.row) + Math.abs(item.col - ownKing.col)), 12) : 0;
  return material - pressure * 4 + ownSafety + Math.random() * 0.2;
}

function rankedActions(pieces: LaserPiece[], owner: LaserOwner) {
  return legalActions(pieces, owner).map((action) => {
    const result = applyLaserAction(pieces, owner, action)!;
    return { action, result, score: scoreResult(pieces, result, owner) };
  }).sort((a, b) => b.score - a.score);
}

export function chooseLaserAiAction(pieces: LaserPiece[], owner: LaserOwner, difficulty: LaserDifficulty): LaserAction | null {
  const ranked = rankedActions(pieces, owner);
  if (!ranked.length) return null;
  const win = ranked.find((item) => item.result.winner === owner);
  if (win) return win.action;
  if (difficulty === 'easy') {
    const pool = ranked.slice(0, Math.min(12, ranked.length));
    return pool[Math.floor(Math.random() * pool.length)].action;
  }
  if (difficulty === 'normal') {
    const pool = ranked.slice(0, Math.min(4, ranked.length));
    return (Math.random() < 0.78 ? pool[0] : pool[Math.floor(Math.random() * pool.length)]).action;
  }

  const candidates = ranked.slice(0, Math.min(24, ranked.length));
  let best = candidates[0];
  let bestMin = -Infinity;
  for (const candidate of candidates) {
    if (candidate.result.winner !== null) return candidate.action;
    const replies = rankedActions(candidate.result.pieces, (1 - owner) as LaserOwner).slice(0, 24);
    const worst = replies.length
      ? Math.min(...replies.map((reply) => reply.result.winner === (1 - owner) ? -1_000_000 : materialScore(reply.result.pieces, owner) * 100))
      : candidate.score;
    if (worst > bestMin) { bestMin = worst; best = candidate; }
  }
  return best.action;
}

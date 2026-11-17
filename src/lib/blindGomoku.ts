export const BOARD_SIZE = 15;

export type StoneOwner = 'black' | 'white';
export type StoneColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink';
export type GomokuDifficulty = 'easy' | 'normal' | 'hard';

export const DIFFICULTY_MEMORY: Record<GomokuDifficulty, number> = {
  easy: 5,
  normal: 15,
  hard: Number.POSITIVE_INFINITY,
};

export interface GomokuMove {
  row: number;
  col: number;
  owner: StoneOwner;
  color: StoneColor;
  turn: number;
}

export interface WinningLine {
  start: { row: number; col: number };
  end: { row: number; col: number };
  owner: StoneOwner;
}

export const STONE_COLORS: { id: StoneColor; hex: string }[] = [
  { id: 'red', hex: '#ef4957' },
  { id: 'orange', hex: '#f58a3c' },
  { id: 'yellow', hex: '#f4cf4b' },
  { id: 'green', hex: '#49bf83' },
  { id: 'blue', hex: '#4e87ed' },
  { id: 'purple', hex: '#9a69dc' },
  { id: 'pink', hex: '#ed72ad' },
];

export const MIN_COLORS = 2;

/** The outer colours in play when a game uses `count` of them (the first ones of STONE_COLORS). */
export const colorsInPlay = (count: number): StoneColor[] => STONE_COLORS.slice(0, Math.max(MIN_COLORS, Math.min(STONE_COLORS.length, count))).map((c) => c.id);

/**
 * Colours black may pick now. With `mustChange`, the colour of black's previous stone is not allowed,
 * so every turn brings a new colour (with two colours in play, they simply alternate).
 */
export function playableColors(count: number, mustChange: boolean, previous?: StoneColor): StoneColor[] {
  const all = colorsInPlay(count);
  return mustChange && previous ? all.filter((c) => c !== previous) : all;
}

const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
] as const;

const at = (moves: GomokuMove[], row: number, col: number) =>
  moves.find((move) => move.row === row && move.col === col);

export function isOnBoard(row: number, col: number) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

export function findWinningLine(moves: GomokuMove[], last?: GomokuMove): WinningLine | null {
  const candidates = last ? [last] : moves;
  for (const stone of candidates) {
    for (const [dr, dc] of DIRECTIONS) {
      let start = { row: stone.row, col: stone.col };
      let end = { row: stone.row, col: stone.col };
      let count = 1;

      for (let distance = 1; distance < BOARD_SIZE; distance += 1) {
        const row = stone.row - dr * distance;
        const col = stone.col - dc * distance;
        if (at(moves, row, col)?.owner !== stone.owner) break;
        start = { row, col };
        count += 1;
      }
      for (let distance = 1; distance < BOARD_SIZE; distance += 1) {
        const row = stone.row + dr * distance;
        const col = stone.col + dc * distance;
        if (at(moves, row, col)?.owner !== stone.owner) break;
        end = { row, col };
        count += 1;
      }
      // Free Gomoku: overlines also win.
      if (count >= 5) return { start, end, owner: stone.owner };
    }
  }
  return null;
}

function linePotential(moves: GomokuMove[], row: number, col: number, owner: StoneOwner, dr: number, dc: number) {
  let connected = 1;
  let openEnds = 0;

  for (const sign of [-1, 1] as const) {
    let distance = 1;
    while (distance < 5) {
      const nextRow = row + dr * distance * sign;
      const nextCol = col + dc * distance * sign;
      const stone = at(moves, nextRow, nextCol);
      if (stone?.owner === owner) {
        connected += 1;
        distance += 1;
        continue;
      }
      if (!stone && isOnBoard(nextRow, nextCol)) openEnds += 1;
      break;
    }
  }

  if (connected >= 5) return 1_000_000;
  if (connected === 4 && openEnds === 2) return 80_000;
  if (connected === 4 && openEnds === 1) return 20_000;
  if (connected === 3 && openEnds === 2) return 8_000;
  if (connected === 3 && openEnds === 1) return 1_400;
  if (connected === 2 && openEnds === 2) return 420;
  if (connected === 2 && openEnds === 1) return 100;
  return openEnds * 18;
}

function candidateScore(moves: GomokuMove[], row: number, col: number) {
  let attack = 0;
  let defense = 0;
  for (const [dr, dc] of DIRECTIONS) {
    attack += linePotential(moves, row, col, 'white', dr, dc);
    defense += linePotential(moves, row, col, 'black', dr, dc);
  }
  const center = (BOARD_SIZE - 1) / 2;
  const centerBias = 28 - (Math.abs(row - center) + Math.abs(col - center)) * 2;
  return attack * 1.08 + defense + centerBias + Math.random() * 6;
}

export function chooseAiMove(moves: GomokuMove[], difficulty: GomokuDifficulty = 'normal') {
  if (moves.length === 0) return { row: 7, col: 7 };

  const occupied = new Set(moves.map((move) => `${move.row}:${move.col}`));
  const memory = DIFFICULTY_MEMORY[difficulty];
  const rememberedMoves = Number.isFinite(memory) ? moves.slice(-memory) : moves;
  const candidates = new Map<string, { row: number; col: number }>();
  for (const move of moves) {
    for (let dr = -2; dr <= 2; dr += 1) {
      for (let dc = -2; dc <= 2; dc += 1) {
        const row = move.row + dr;
        const col = move.col + dc;
        const key = `${row}:${col}`;
        if (isOnBoard(row, col) && !occupied.has(key)) candidates.set(key, { row, col });
      }
    }
  }

  const ranked = [...candidates.values()]
    .map((position) => ({ ...position, score: candidateScore(rememberedMoves, position.row, position.col) }))
    .sort((a, b) => b.score - a.score);
  return ranked[0] ?? { row: 7, col: 7 };
}

export function coordinateLabel(row: number, col: number) {
  // The letter I is skipped, as on a Go board.
  const letters = 'ABCDEFGHJKLMNOP';
  return `${letters[col]}${BOARD_SIZE - row}`;
}

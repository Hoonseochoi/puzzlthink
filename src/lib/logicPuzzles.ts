// 마슈 · 노노그램: one interface over both engines, so the solo game, the challenge and the rooms share their code.
// A board is built from (size, seed); the player's work is a flat array of marks (edges for 마슈, cells for 노노그램).
import * as masyu from './masyu';
import * as nonogram from './nonogram';

export type LogicGameId = 'masyu' | 'nonogram';
export type MasyuBoard = { kind: 'masyu'; size: number; seed: number; pearls: masyu.Pearl[]; answer: number[] };
export type NonoBoard = { kind: 'nonogram'; size: number; seed: number; clues: nonogram.Clues; answer: number[] };
export type LogicBoard = MasyuBoard | NonoBoard;

export type LogicSpec = {
  id: LogicGameId;
  /** Catalog id, route and accent. */
  catalog: 'masyu' | 'nonogram';
  path: '/masyu' | '/nonogram';
  accent: string;
  ink: string;
  sizes: readonly number[];
  challengeSize: number;
  /** Rooms race on this size by default. */
  roomSizes: readonly number[];
};

export const LOGIC: Record<LogicGameId, LogicSpec> = {
  masyu: { id: 'masyu', catalog: 'masyu', path: '/masyu', accent: '#ff4d5e', ink: '#ffffff', sizes: masyu.MASYU_SIZES, challengeSize: masyu.MASYU_CHALLENGE_SIZE, roomSizes: [6, 8, 10] },
  nonogram: { id: 'nonogram', catalog: 'nonogram', path: '/nonogram', accent: '#3fcf6a', ink: '#06210f', sizes: nonogram.NONO_SIZES, challengeSize: nonogram.NONO_CHALLENGE_SIZE, roomSizes: [5, 10, 15] },
};

const cache = new Map<string, LogicBoard>();
/** The board for (game, size, seed): the same everywhere (browser, rooms, the server's pool script). */
export function buildBoard(game: LogicGameId, size: number, seed: number): LogicBoard {
  const key = `${game}-${size}-${seed}`;
  const hit = cache.get(key);
  if (hit) return hit;
  let board: LogicBoard;
  if (game === 'masyu') {
    const { pearls, lines } = masyu.generate(size, seed);
    board = { kind: 'masyu', size, seed, pearls, answer: lines };
  } else {
    const { grid, clues } = nonogram.generate(size, seed);
    board = { kind: 'nonogram', size, seed, clues, answer: grid };
  }
  if (cache.size > 24) cache.clear();
  cache.set(key, board);
  return board;
}

/** How many marks the player's work holds (edges or cells). */
export const markCount = (b: LogicBoard) => (b.kind === 'masyu' ? masyu.geometry(b.size).edgeCount : b.size * b.size);
export const emptyMarks = (b: LogicBoard) => new Array<number>(markCount(b)).fill(0);

export function solved(b: LogicBoard, marks: ArrayLike<number>): boolean {
  return b.kind === 'masyu'
    ? masyu.isSolved({ id: b.seed, size: b.size, pearls: b.pearls }, marks)
    : nonogram.isSolved({ id: b.seed, size: b.size, clues: b.clues }, marks);
}

/** The work as the "0/1" string the server compares with its stored answer. */
export const encodeMarks = (b: LogicBoard, marks: ArrayLike<number>) => Array.from({ length: markCount(b) }, (_, i) => (marks[i] === 1 ? '1' : '0')).join('');
export const decodeMarks = (s: string) => [...s].map((ch) => (ch === '1' ? 1 : 0));

/** Progress for the room's player list: lines drawn (마슈) or cells filled (노노그램). */
export const progressOf = (marks: ArrayLike<number>) => Array.prototype.filter.call(marks, (m: number) => m === 1).length;

export const newSeed = () => 1 + Math.floor(Math.random() * 2_000_000_000);

export const formatClock = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
};

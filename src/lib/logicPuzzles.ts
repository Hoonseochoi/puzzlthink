// 마슈 · 노노그램 · 스타배틀 · 비나이로 · 한붓길 · 컬러 잇기 · 마방진 스왑: one interface over the engines, so the solo game, the challenge and the rooms share their code.
// A board is built from (size, seed); the player's work is a flat array of marks
// (edges for 마슈 / 한붓길 / 컬러 잇기, cells for the others).
import * as masyu from './masyu';
import * as nonogram from './nonogram';
import * as starbattle from './starbattle';
import * as binairo from './binairo';
import * as onestroke from './onestroke';
import * as colorlink from './colorlink';
import * as magicswap from './magicswap';

export type LogicGameId = 'masyu' | 'nonogram' | 'starbattle' | 'binairo' | 'onestroke' | 'colorlink' | 'magicswap';
export type MasyuBoard = { kind: 'masyu'; size: number; seed: number; pearls: masyu.Pearl[]; answer: number[] };
export type NonoBoard = { kind: 'nonogram'; size: number; seed: number; clues: nonogram.Clues; answer: number[] };
export type StarBoard = { kind: 'starbattle'; size: number; seed: number; regions: number[]; answer: number[] };
export type BinairoBoard = { kind: 'binairo'; size: number; seed: number; givens: number[]; signs: binairo.Sign[]; answer: number[] };
export type OneStrokeBoard = { kind: 'onestroke'; size: number; seed: number; numbers: number[]; answer: number[] };
export type ColorLinkBoard = { kind: 'colorlink'; size: number; seed: number; ends: number[]; answer: number[] };
/** 마방진 스왑: marks are the numbers in the cells (1…n²), starting from `start`; `swaps` undo the scramble (for the replay). */
export type MagicSwapBoard = { kind: 'magicswap'; size: number; seed: number; start: number[]; answer: number[]; swaps: [number, number][]; fixed: number[] };
export type LogicBoard = MasyuBoard | NonoBoard | StarBoard | BinairoBoard | OneStrokeBoard | ColorLinkBoard | MagicSwapBoard;

export type LogicSpec = {
  id: LogicGameId;
  /** Catalog id, route and accent. */
  catalog: LogicGameId;
  path: '/masyu' | '/nonogram' | '/star-battle' | '/binairo' | '/one-stroke' | '/color-link' | '/magic-square';
  /** Header subtitle. */
  latin: string;
  accent: string;
  ink: string;
  /** Background fog ("r, g, b") and the shards' tint. */
  fog: string;
  shard: string;
  /** Room progress label: lines drawn, cells filled or stones placed. */
  progress: 'linesN' | 'cellsN' | 'stonesN' | 'sumsN';
  sizes: readonly number[];
  challengeSize: number;
  /** Rooms race on this size by default. */
  roomSizes: readonly number[];
  /** Most players in a friend / open room (4 unless set). */
  maxPlayers?: number;
};

export const LOGIC: Record<LogicGameId, LogicSpec> = {
  masyu: { id: 'masyu', catalog: 'masyu', path: '/masyu', latin: 'MASYU', accent: '#ff4d5e', ink: '#ffffff', fog: '255, 77, 94', shard: '#3a1d24', progress: 'linesN', sizes: masyu.MASYU_SIZES, challengeSize: masyu.MASYU_CHALLENGE_SIZE, roomSizes: [6, 8, 10] },
  nonogram: { id: 'nonogram', catalog: 'nonogram', path: '/nonogram', latin: 'NONOGRAM', accent: '#3fcf6a', ink: '#06210f', fog: '63, 207, 106', shard: '#16301f', progress: 'cellsN', sizes: nonogram.NONO_SIZES, challengeSize: nonogram.NONO_CHALLENGE_SIZE, roomSizes: [5, 10, 15] },
  binairo: { id: 'binairo', catalog: 'binairo', path: '/binairo', latin: 'BINAIRO', accent: '#3f8cff', ink: '#ffffff', fog: '63, 140, 255', shard: '#162540', progress: 'stonesN', sizes: binairo.BINAIRO_SIZES, challengeSize: binairo.BINAIRO_CHALLENGE_SIZE, roomSizes: [6, 8, 10] },
  onestroke: { id: 'onestroke', catalog: 'onestroke', path: '/one-stroke', latin: 'ONE STROKE', accent: '#ff8a2b', ink: '#2a1400', fog: '255, 138, 43', shard: '#3a2412', progress: 'linesN', sizes: onestroke.ONESTROKE_SIZES, challengeSize: onestroke.ONESTROKE_CHALLENGE_SIZE, roomSizes: [5, 6, 7] },
  colorlink: { id: 'colorlink', catalog: 'colorlink', path: '/color-link', latin: 'COLOR LINK', accent: '#21c2b5', ink: '#04211e', fog: '33, 194, 181', shard: '#12302d', progress: 'linesN', sizes: colorlink.COLORLINK_SIZES, challengeSize: colorlink.COLORLINK_CHALLENGE_SIZE, roomSizes: [5, 6, 7] },
  magicswap: { id: 'magicswap', catalog: 'magicswap', path: '/magic-square', latin: 'MAGIC SQUARE', accent: '#e45bd6', ink: '#ffffff', fog: '228, 91, 214', shard: '#341b33', progress: 'sumsN', sizes: magicswap.MAGIC_SIZES, challengeSize: magicswap.MAGIC_CHALLENGE_SIZE, roomSizes: [5, 6, 7], maxPlayers: 6 },
  starbattle: { id: 'starbattle', catalog: 'starbattle', path: '/star-battle', latin: 'STAR BATTLE', accent: '#ffc23d', ink: '#2a1d00', fog: '255, 194, 61', shard: '#33280f', progress: 'stonesN', sizes: starbattle.STAR_SIZES, challengeSize: starbattle.STAR_CHALLENGE_SIZE, roomSizes: [6, 8, 10] },
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
  } else if (game === 'nonogram') {
    const { grid, clues } = nonogram.generate(size, seed);
    board = { kind: 'nonogram', size, seed, clues, answer: grid };
  } else if (game === 'starbattle') {
    const { regions, answer } = starbattle.generate(size, seed);
    board = { kind: 'starbattle', size, seed, regions, answer };
  } else if (game === 'binairo') {
    const { givens, signs, answer } = binairo.generate(size, seed);
    board = { kind: 'binairo', size, seed, givens, signs, answer };
  } else if (game === 'onestroke') {
    const { numbers, answer } = onestroke.generate(size, seed);
    board = { kind: 'onestroke', size, seed, numbers, answer };
  } else if (game === 'magicswap') {
    const { start, answer, swaps, fixed } = magicswap.generate(size, seed);
    board = { kind: 'magicswap', size, seed, start, answer, swaps, fixed };
  } else {
    const { ends, answer } = colorlink.generate(size, seed);
    board = { kind: 'colorlink', size, seed, ends, answer };
  }
  if (cache.size > 24) cache.clear();
  cache.set(key, board);
  return board;
}

/** How many marks the player's work holds (edges or cells). */
export const markCount = (b: LogicBoard) =>
  b.kind === 'masyu' ? masyu.geometry(b.size).edgeCount
    : b.kind === 'onestroke' || b.kind === 'colorlink' ? onestroke.geometry(b.size).edgeCount
      : b.size * b.size;
/** A fresh board's marks: empty, except 비나이로's starting stones. */
export const emptyMarks = (b: LogicBoard) => (b.kind === 'binairo' ? b.givens.slice() : b.kind === 'magicswap' ? b.start.slice() : new Array<number>(markCount(b)).fill(0));
/** The starting stones as moves at 0 ms, so the server's replay (which starts from an empty board) sees them too. */
export const startSteps = (b: LogicBoard): [number, number, number][] => (b.kind === 'binairo' ? b.givens.flatMap((v, i) => (v ? [[i, v, 0] as [number, number, number]] : []))
  : b.kind === 'magicswap' ? b.start.map((v, i) => [i, v, 0] as [number, number, number]) : []);
/** Cells the player may not change (비나이로's starting stones, 마방진 스왑's three locked tiles). */
export const isFixed = (b: LogicBoard, i: number) => (b.kind === 'binairo' && b.givens[i] !== 0) || (b.kind === 'magicswap' && b.fixed.includes(i));

export function solved(b: LogicBoard, marks: ArrayLike<number>): boolean {
  if (b.kind === 'masyu') return masyu.isSolved({ id: b.seed, size: b.size, pearls: b.pearls }, marks);
  if (b.kind === 'nonogram') return nonogram.isSolved({ id: b.seed, size: b.size, clues: b.clues }, marks);
  if (b.kind === 'starbattle') return starbattle.isSolved({ id: b.seed, size: b.size, regions: b.regions }, marks);
  if (b.kind === 'binairo') return binairo.isSolved({ size: b.size, givens: b.givens, signs: b.signs }, marks);
  if (b.kind === 'onestroke') return onestroke.isSolved({ size: b.size, numbers: b.numbers }, marks);
  if (b.kind === 'magicswap') return magicswap.isSolvedWith(b.size, marks, b.start, b.fixed);
  return colorlink.isSolved({ size: b.size, ends: b.ends }, marks);
}

/** The work as the "0/1" string the server compares with its stored answer. */
// 비나이로 keeps both colours ('1' black, '2' white); elsewhere a ✕ (2) is not part of the answer.
// 마방진 스왑 sends its numbers, comma-separated.
export const encodeMarks = (b: LogicBoard, marks: ArrayLike<number>) => b.kind === 'magicswap' ? magicswap.encodeCells(marks) :
  Array.from({ length: markCount(b) }, (_, i) => (marks[i] === 1 ? '1' : marks[i] === 2 && b.kind === 'binairo' ? '2' : '0')).join('');
export const decodeMarks = (s: string) => (s.includes(',') ? magicswap.decodeCells(s) : [...s].map((ch) => (ch === '1' ? 1 : ch === '2' ? 2 : 0)));

/** Progress for the room's player list: lines drawn, cells filled or stones placed (비나이로 counts both colours). */
export const progressOf = (marks: ArrayLike<number>, b?: LogicBoard) => b?.kind === 'magicswap' ? magicswap.linesRight(b.size, marks)
  : Array.prototype.filter.call(marks, (m: number) => m === 1 || (m === 2 && b?.kind === 'binairo')).length;

export const newSeed = () => 1 + Math.floor(Math.random() * 2_000_000_000);

export const formatClock = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
};

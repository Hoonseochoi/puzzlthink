// 컬러 링크 boards. The show's 7×7 and twelve shaped boards (9×9 to 11×11 with cells cut out), drawn as rows of
// '#' (a cell) and '.' (no cell). A friend or open room plays the one the host picks (or a random one); the AI game
// deals a random board from the difficulty the player chose. The AI is the same everywhere: the board sets how hard
// the game is.
//
// Difficulty, from self-play (scripts/color-link-duel-boards.ts, color-link-duel-tiers.ts): a player who never places
// into an unjoinable board but plans nothing wins ~30% on the big open boards (네 방, 도넛) and ~10% on the tight
// ones (클래식, 하트). Easy: big, open, long games where lines are easy to see. Normal: mid-size shapes with a few
// narrow spots. Hard: small or pinched boards (and the show's 7×7) where one careless stone ends the game.
// 미로 and 소용돌이 were left out: their cells are almost all one-lane corridors, so games are short and forced.
import { type CldBoard, boardFromRows } from './colorLinkDuel';

export type CldTier = 'easy' | 'normal' | 'hard';
export const CLD_TIERS: readonly CldTier[] = ['easy', 'normal', 'hard'];
export type CldLayout = { id: string; ko: string; en: string; tier: CldTier; rows: string[] };

export const CLD_LAYOUTS: readonly CldLayout[] = [
  { id: 'classic', ko: '클래식', en: 'Classic', tier: 'hard', rows: Array(7).fill('#######') },
  { id: 'four_rooms', ko: '네 방', en: 'Four Rooms', tier: 'easy', rows: [
      '#####.#####',
      '#####.#####',
      '###########',
      '#####.#####',
      '###########',
      '.....#.....',
      '###########',
      '#####.#####',
      '###########',
      '#####.#####',
      '#####.#####',
    ] },
  { id: 'donut', ko: '도넛', en: 'Donut', tier: 'easy', rows: [
      '#########',
      '#########',
      '#########',
      '###...###',
      '###...###',
      '###...###',
      '#########',
      '#########',
      '#########',
    ] },
  { id: 'heart', ko: '하트', en: 'Heart', tier: 'hard', rows: [
      '..##...##..',
      '.####.####.',
      '###########',
      '###########',
      '###########',
      '###########',
      '.#########.',
      '..#######..',
      '...#####...',
      '....###....',
      '.....#.....',
    ] },
  { id: 'pillars', ko: '기둥 숲', en: 'Pillar Forest', tier: 'easy', rows: [
      '#########',
      '#.##.##.#',
      '#########',
      '#########',
      '#.##.##.#',
      '#########',
      '#########',
      '#.##.##.#',
      '#########',
    ] },
  { id: 'stairs', ko: '계단', en: 'Stairs', tier: 'normal', rows: [
      '###......',
      '####.....',
      '#####....',
      '######...',
      '#######..',
      '########.',
      '#########',
      '.########',
      '..#######',
    ] },
  { id: 'diamond', ko: '다이아몬드', en: 'Diamond', tier: 'hard', rows: [
      '.....#.....',
      '....###....',
      '...#####...',
      '..#######..',
      '.#########.',
      '###########',
      '.#########.',
      '..#######..',
      '...#####...',
      '....###....',
      '.....#.....',
    ] },
  { id: 'h', ko: 'H', en: 'H', tier: 'normal', rows: [
      '###...###',
      '###...###',
      '###...###',
      '#########',
      '#########',
      '#########',
      '###...###',
      '###...###',
      '###...###',
    ] },
  { id: 'frame', ko: '액자', en: 'Frame', tier: 'easy', rows: [
      '##########',
      '##########',
      '##......##',
      '##.####.##',
      '##.####.##',
      '##.####.##',
      '##.####.##',
      '##...#..##',
      '##########',
      '##########',
    ] },
  { id: 'zigzag', ko: '지그재그', en: 'Zigzag', tier: 'normal', rows: [
      '#########.',
      '#########.',
      '.......##.',
      '.########.',
      '.##.......',
      '.#########',
      '.#########',
      '.......##.',
      '#########.',
      '#########.',
    ] },
  { id: 'arrow', ko: '화살표', en: 'Arrow', tier: 'normal', rows: [
      '....#.....',
      '...##.....',
      '..###.....',
      '.#########',
      '##########',
      '##########',
      '.#########',
      '..###.....',
      '...##.....',
      '....#.....',
    ] },
  { id: 'cross', ko: '십자', en: 'Cross', tier: 'hard', rows: [
      '...###...',
      '...###...',
      '...###...',
      '#########',
      '#########',
      '#########',
      '...###...',
      '...###...',
      '...###...',
    ] },
  { id: 'hourglass', ko: '모래시계', en: 'Hourglass', tier: 'hard', rows: [
      '#########',
      '.#######.',
      '..#####..',
      '...###...',
      '...###...',
      '...###...',
      '..#####..',
      '.#######.',
      '#########',
    ] },
];

export const CLD_DEFAULT_LAYOUT = 'classic';
export const layoutById = (id: string | null | undefined) => CLD_LAYOUTS.find((l) => l.id === id) ?? CLD_LAYOUTS[0];
/** The empty board of a layout. */
export const layoutBoard = (id: string | null | undefined): CldBoard => boardFromRows(layoutById(id).rows);
export const layoutCells = (l: CldLayout) => l.rows.reduce((n, r) => n + [...r].filter((c) => c === '#').length, 0);
export const layoutSpan = (l: CldLayout) => Math.max(l.rows.length, ...l.rows.map((r) => r.length));
/** A random layout, from one difficulty or from all. */
export function randomLayout(tier?: CldTier | null, rand: () => number = Math.random): CldLayout {
  const pool = CLD_LAYOUTS.filter((l) => !tier || l.tier === tier);
  const list = pool.length ? pool : CLD_LAYOUTS;
  return list[Math.floor(rand() * list.length)];
}

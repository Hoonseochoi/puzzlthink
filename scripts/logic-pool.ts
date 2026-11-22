// Builds the logic-puzzle challenge pool: seeds with their one answer, as SQL for the logic_pool table.
// Usage: node scripts/logic-pool.ts batch=4 binairo=3000 onestroke=3000 colorlink=3000 > pool.sql
//        games: masyu, nonogram, starbattle, binairo, onestroke, colorlink (a new batch number = new seeds)
//        then apply pool.sql to the database (rows already there are kept: on conflict do nothing).
// The old positional form still works: [masyu] [nonogram] [batch] [starbattle].
// Uses the same engines the browser uses, so a seed builds the same board on both sides.
import * as masyu from '../src/lib/masyu.ts';
import * as nonogram from '../src/lib/nonogram.ts';
import * as starbattle from '../src/lib/starbattle.ts';
import * as binairo from '../src/lib/binairo.ts';
import * as onestroke from '../src/lib/onestroke.ts';
import * as colorlink from '../src/lib/colorlink.ts';

type Game = 'masyu' | 'nonogram' | 'starbattle' | 'binairo' | 'onestroke' | 'colorlink';
const args = process.argv.slice(2);
const counts: Partial<Record<Game, number>> = {};
let batch = 1;
if (args.some((a) => a.includes('='))) {
  for (const a of args) {
    const [k, v] = a.split('=');
    if (k === 'batch') batch = Number(v); else counts[k as Game] = Number(v);
  }
} else {
  const [m = 2000, n = 3000, b = 1, s = 0] = args.map(Number);
  Object.assign(counts, { masyu: m, nonogram: n, starbattle: s });
  batch = b;
}

const pick = masyu.rng(20270109 + (batch - 1) * 7777);
const seeds = (count: number) => {
  const set = new Set<number>();
  while (set.size < count) set.add(1 + Math.floor(pick() * 2_000_000_000));
  return [...set];
};

/** One pool row per seed: (game, seed, challenge size, answer string). */
const BUILD: Record<Game, { size: number; answer: (seed: number) => string }> = {
  masyu: { size: masyu.MASYU_CHALLENGE_SIZE, answer: (seed) => masyu.encodeLines(masyu.generate(masyu.MASYU_CHALLENGE_SIZE, seed).lines, masyu.geometry(masyu.MASYU_CHALLENGE_SIZE).edgeCount) },
  nonogram: { size: nonogram.NONO_CHALLENGE_SIZE, answer: (seed) => nonogram.encodeCells(nonogram.generate(nonogram.NONO_CHALLENGE_SIZE, seed).grid, nonogram.NONO_CHALLENGE_SIZE ** 2) },
  starbattle: { size: starbattle.STAR_CHALLENGE_SIZE, answer: (seed) => starbattle.encodeCells(starbattle.generate(starbattle.STAR_CHALLENGE_SIZE, seed).answer) },
  binairo: { size: binairo.BINAIRO_CHALLENGE_SIZE, answer: (seed) => binairo.encodeCells(binairo.generate(binairo.BINAIRO_CHALLENGE_SIZE, seed).answer) },
  onestroke: { size: onestroke.ONESTROKE_CHALLENGE_SIZE, answer: (seed) => onestroke.encodeEdges(onestroke.generate(onestroke.ONESTROKE_CHALLENGE_SIZE, seed).answer) },
  colorlink: { size: colorlink.COLORLINK_CHALLENGE_SIZE, answer: (seed) => colorlink.encodeEdges(colorlink.generate(colorlink.COLORLINK_CHALLENGE_SIZE, seed).answer) },
};

const out: string[] = ['begin;'];
for (const game of Object.keys(BUILD) as Game[]) {
  const count = counts[game] ?? 0;
  if (!count) continue;
  const { size, answer } = BUILD[game];
  const rows = seeds(count).map((seed, i) => {
    if ((i + 1) % 500 === 0) console.error(`${game} ${i + 1}/${count}`);
    return `('${game}', ${seed}, ${size}, '${answer(seed)}')`;
  });
  for (let i = 0; i < rows.length; i += 500) {
    out.push(`insert into public.logic_pool (game, seed, size, answer) values\n${rows.slice(i, i + 500).join(',\n')}\non conflict do nothing;`);
  }
}
out.push('commit;');
console.log(out.join('\n'));

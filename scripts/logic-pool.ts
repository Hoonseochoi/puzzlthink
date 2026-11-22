// Builds the 마슈 / 노노그램 / 스타배틀 challenge pool: seeds with their one answer, as SQL for the logic_pool table.
// Usage: node scripts/logic-pool.ts [masyuCount=2000] [nonogramCount=3000] [batch=1] [starBattleCount=0] > pool.sql
//        (a new batch number = new seeds)
//        then apply pool.sql to the database (rows already there are kept: on conflict do nothing).
// Uses the same engines the browser uses, so a seed builds the same board on both sides.
import * as masyu from '../src/lib/masyu.ts';
import * as nonogram from '../src/lib/nonogram.ts';
import * as starbattle from '../src/lib/starbattle.ts';

const [masyuCount = 2000, nonoCount = 3000, batch = 1, starCount = 0] = process.argv.slice(2).map(Number);
const pick = masyu.rng(20270109 + (batch - 1) * 7777);
const seeds = (count: number) => {
  const set = new Set<number>();
  while (set.size < count) set.add(1 + Math.floor(pick() * 2_000_000_000));
  return [...set];
};

const out: string[] = ['begin;'];
const flush = (rows: string[]) => {
  for (let i = 0; i < rows.length; i += 500) {
    out.push(`insert into public.logic_pool (game, seed, size, answer) values\n${rows.slice(i, i + 500).join(',\n')}\non conflict do nothing;`);
  }
};

const m = masyu.MASYU_CHALLENGE_SIZE, edges = masyu.geometry(m).edgeCount;
const masyuRows: string[] = [];
seeds(masyuCount).forEach((seed, i) => {
  const { lines } = masyu.generate(m, seed);
  masyuRows.push(`('masyu', ${seed}, ${m}, '${masyu.encodeLines(lines, edges)}')`);
  if ((i + 1) % 200 === 0) console.error(`masyu ${i + 1}/${masyuCount}`);
});
flush(masyuRows);

const k = nonogram.NONO_CHALLENGE_SIZE;
const nonoRows = seeds(nonoCount).map((seed) => `('nonogram', ${seed}, ${k}, '${nonogram.encodeCells(nonogram.generate(k, seed).grid, k * k)}')`);
flush(nonoRows);

const sb = starbattle.STAR_CHALLENGE_SIZE;
const starRows: string[] = [];
seeds(starCount).forEach((seed, i) => {
  starRows.push(`('starbattle', ${seed}, ${sb}, '${starbattle.encodeCells(starbattle.generate(sb, seed).answer)}')`);
  if ((i + 1) % 500 === 0) console.error(`starbattle ${i + 1}/${starCount}`);
});
flush(starRows);

out.push('commit;');
console.log(out.join('\n'));

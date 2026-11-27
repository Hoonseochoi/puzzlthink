// 명제 바둑: builds the daily pool (SQL for public.prop_pool) and the practice set (public/proposition-go/practice.json).
// Usage: node --import ./scripts/proposition-go/resolve-ts.mjs scripts/proposition-go/pool.ts [days=400] [batch=1] > pool.sql
//        then apply pool.sql to the database after 20271201100000_proposition_go.sql (rows already there are kept).
// Each day uses one puzzle of each tier, lowest id first, so `days` rows per tier last that many days. A new batch
// number gives new seeds (run it again before the pool runs out: select tier, count(*) from prop_pool where used_on is null group by 1).
// Practice puzzles come from a separate seed range, so practising never shows a daily puzzle.
// Verify the same seeds with: scripts/proposition-go/check.ts <days> <1_000_000 * batch + 1>
import { writeFileSync, mkdirSync } from 'node:fs';
import { type Tier, encodeCells, generate, publicPart } from '../../src/lib/propositionGo';

const DAYS = Number(process.argv[2] ?? 400);
const BATCH = Number(process.argv[3] ?? 1);
const PRACTICE = 60;
const first = 1_000_000 * BATCH + 1;

const q = (v: unknown) => `'${JSON.stringify(v).replace(/'/g, "''")}'`;
const out: string[] = ['begin;'];
for (const tier of [1, 2, 3] as Tier[]) {
  const rows: string[] = [];
  for (let k = 0; k < DAYS; k++) {
    const seed = first + k;
    const pz = generate(tier, seed);
    rows.push(`(${tier}, ${seed}, ${q(publicPart(pz))}::jsonb, ${q(pz.hint)}::jsonb, '${encodeCells(pz.answer)}')`);
    if ((k + 1) % 50 === 0) console.error(`tier ${tier} ${k + 1}/${DAYS}`);
  }
  for (let i = 0; i < rows.length; i += 200) {
    out.push(`insert into public.prop_pool (tier, seed, puzzle, hint, answer) values\n${rows.slice(i, i + 200).join(',\n')}\non conflict (tier, seed) do nothing;`);
  }
}
out.push('commit;');
process.stdout.write(out.join('\n') + '\n');

// Practice: public part + hint + answer (practice is free and untimed, nothing to protect).
if (BATCH === 1) {
  const practice: Record<Tier, unknown[]> = { 1: [], 2: [], 3: [] };
  for (const tier of [1, 2, 3] as Tier[]) {
    for (let k = 0; k < PRACTICE; k++) {
      const pz = generate(tier, 5_000_001 + k);
      practice[tier].push({ ...publicPart(pz), hint: pz.hint, answer: pz.answer, lie: pz.lie });
    }
    console.error(`practice tier ${tier} done`);
  }
  mkdirSync('public/proposition-go', { recursive: true });
  writeFileSync('public/proposition-go/practice.json', JSON.stringify(practice));
}

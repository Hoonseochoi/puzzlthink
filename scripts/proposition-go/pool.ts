// 명제 바둑: builds the daily pool (SQL for public.prop_pool) and the practice set (public/proposition-go/practice.json).
//
// One go:   node --import ./scripts/proposition-go/resolve-ts.mjs scripts/proposition-go/pool.ts [days=200] [batch=1] > pool.sql
// In parts (the 심화 / 거짓말 generators take seconds per puzzle, so run several at once and merge):
//   ... pool.ts part <daily|practice> <tier> <from> <to> [batch=1] > part.jsonl      one JSON row per puzzle, seeds from..to-1
//   ... pool.ts merge <batch> part1.jsonl part2.jsonl ... > pool.sql                 SQL in tier/seed order + practice.json
// Then apply pool.sql to the database after 20271202100000_proposition_go.sql (rows already there are kept).
// Each day takes the lowest unused id of each tier, so rows are written tier by tier in seed order. A new batch number
// gives new seeds (run it before the pool runs out: select tier, count(*) from prop_pool where used_on is null group by 1).
// Practice puzzles come from a separate seed range, so practising never shows a daily puzzle.
// Verify the same seeds with: scripts/proposition-go/check.ts <days> <1_000_000 * batch + 1>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { type Tier, encodeCells, generate, publicPart } from '../../src/lib/propositionGo';

const PRACTICE = 40;
const dailySeed = (batch: number, k: number) => 1_000_000 * batch + 1 + k;
const practiceSeed = (k: number) => 5_000_001 + k;
type Row = { kind: 'daily' | 'practice'; tier: Tier; seed: number; puzzle: unknown; hint: unknown; answer: number[]; lie: number | null };

const row = (kind: Row['kind'], tier: Tier, seed: number): Row => {
  const pz = generate(tier, seed);
  return { kind, tier, seed, puzzle: publicPart(pz), hint: pz.hint, answer: pz.answer, lie: pz.lie };
};
const q = (v: unknown) => `'${JSON.stringify(v).replace(/'/g, "''")}'`;

function emit(rows: Row[], batch: number) {
  const daily = rows.filter((r) => r.kind === 'daily').sort((a, b) => a.tier - b.tier || a.seed - b.seed);
  const out: string[] = ['begin;'];
  for (const tier of [1, 2, 3] as Tier[]) {
    const vals = daily.filter((r) => r.tier === tier).map((r) => `(${tier}, ${r.seed}, ${q(r.puzzle)}::jsonb, ${q(r.hint)}::jsonb, '${encodeCells(r.answer)}')`);
    for (let i = 0; i < vals.length; i += 200) out.push(`insert into public.prop_pool (tier, seed, puzzle, hint, answer) values\n${vals.slice(i, i + 200).join(',\n')}\non conflict (tier, seed) do nothing;`);
  }
  out.push('commit;');
  process.stdout.write(out.join('\n') + '\n');
  const practice = rows.filter((r) => r.kind === 'practice');
  if (batch === 1 && practice.length) {
    const set: Record<Tier, unknown[]> = { 1: [], 2: [], 3: [] };
    for (const r of practice.sort((a, b) => a.seed - b.seed)) set[r.tier].push({ ...(r.puzzle as object), hint: r.hint, answer: r.answer, lie: r.lie });
    mkdirSync('public/proposition-go', { recursive: true });
    writeFileSync('public/proposition-go/practice.json', JSON.stringify(set));
  }
}

const [mode, ...args] = process.argv.slice(2);
if (mode === 'part') {
  const [kind, tier, from, to, batch = '1'] = args;
  for (let k = Number(from); k < Number(to); k++) {
    const seed = kind === 'practice' ? practiceSeed(k) : dailySeed(Number(batch), k);
    process.stdout.write(JSON.stringify(row(kind as Row['kind'], Number(tier) as Tier, seed)) + '\n');
    console.error(`${kind} tier ${tier} ${k + 1}/${to}`);
  }
} else if (mode === 'merge') {
  const [batch, ...files] = args;
  const rows = files.flatMap((f) => readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l) as Row));
  emit(rows, Number(batch));
} else {
  const days = Number(mode ?? 200), batch = Number(args[0] ?? 1);
  const rows: Row[] = [];
  for (const tier of [1, 2, 3] as Tier[]) {
    for (let k = 0; k < days; k++) rows.push(row('daily', tier, dailySeed(batch, k)));
    if (batch === 1) for (let k = 0; k < PRACTICE; k++) rows.push(row('practice', tier, practiceSeed(k)));
    console.error(`tier ${tier} done`);
  }
  emit(rows, batch);
}

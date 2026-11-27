// 명제 바둑 generator check: builds many puzzles per tier and verifies them from scratch, independently of the
// generator's own shortcuts. For every puzzle:
//  - plain tiers: exactly one placement makes every proposition true, and it is the stored answer;
//  - 거짓말 tier: no placement makes all true, exactly one placement makes all but one true, it is the answer and
//    the one false card is the stored lie;
//  - every proposition is needed (drop any one and the answer is no longer unique) — 거짓말: the truths each matter;
//  - the 피스 hint is true for the answer and is not already on the table;
//  - the grade is in the tier's band, and every line fits the length budget in Korean and English.
// Prints the distribution (cards per puzzle, kinds used, grade, steps, ms per puzzle).
// Usage: node --import ./scripts/proposition-go/resolve-ts.mjs scripts/proposition-go/check.ts [count per tier=1000] [first seed=1]
//        ... check.ts parts/*.jsonl      the rows pool.ts wrote (daily ones): verify and grade them without generating again
import { readFileSync } from 'node:fs';
import { type Prop, type Puzzle, type Tier, TIER_SPEC, allPlacements, evalProp, generate, grade, openBits, unpack } from '../../src/lib/propositionGo';
import { propText } from '../../src/lib/propositionGoText';

const PARTS = process.argv.slice(2).filter((a) => a.endsWith('.jsonl'));
type PartRow = { kind: string; tier: Tier; seed: number; puzzle: { stones: number[]; props: Prop[] }; hint: Prop; answer: number[]; lie: number | null };
const partRows: PartRow[] = PARTS.flatMap((f) => readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l) as PartRow)).filter((r) => r.kind === 'daily');
/** A pool row as a Puzzle, graded the way the generator grades (거짓말: the truths with the lie known, +2 for finding it). */
function fromRow(r: PartRow): Puzzle {
  const n = r.puzzle.stones.length;
  const g = grade(r.puzzle.props.filter((_, i) => i !== r.lie), n) ?? { level: 3 as const, steps: 0, trials: 0 };
  return { tier: r.tier, seed: r.seed, stones: r.puzzle.stones, props: r.puzzle.props, answer: r.answer, lie: r.lie, hint: r.hint, grade: r.lie === null ? g : { ...g, steps: g.steps + 2 } };
}
const COUNT_ARG = Number(PARTS.length ? 0 : process.argv[2] ?? 1000);
/** Card readings a patient person manages without a what-if (the "no hint" step budget). */
const READ_BUDGET = 20;
const FIRST = Number(PARTS.length ? 0 : process.argv[3] ?? 1);
/**
 * Characters with stone names spelled out. A card on a 375 px phone is ~120 px of text in two columns: two lines hold
 * about 20 Hangul or 50 Latin characters with the chips, so 24 / 50 keeps every card within two lines, rarely three.
 */
const BUDGET = { ko: 24, en: 50 };

const hist = (xs: number[]) => {
  const m = new Map<number, number>();
  for (const x of xs) m.set(x, (m.get(x) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}:${v}`).join(' ');
};
const pct = (xs: number[], q: number) => { const s = [...xs].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };

function falsesOf(ps: Prop[], cells: number[]) { return ps.flatMap((p, i) => (evalProp(p, cells) ? [] : [i])); }

let failures = 0;
const fail = (msg: string) => { failures++; if (failures < 30) console.error('FAIL', msg); };
const longest = { ko: '', en: '' };
const textLens = { ko: [] as number[], en: [] as number[] };

for (const tier of [1, 2, 3] as Tier[]) {
  const spec = TIER_SPEC[tier];
  const n = spec.stones;
  const all = allPlacements(n);
  const cards: number[] = [], steps: number[] = [], levels: number[] = [], ms: number[] = [];
  const kinds = new Map<string, number>();
  // Without hints: does reading cards one at a time (no what-if) finish it within the budget? How many bits stay open?
  // With the 피스 hint: how many bits stay open then (the hint's real help).
  let byReading = 0, trials = 0;
  const bitsNoHint: number[] = [], bitsHint: number[] = [];
  const list = PARTS.length ? partRows.filter((r) => r.tier === tier).sort((a, b) => a.seed - b.seed) : null;
  const COUNT = list ? list.length : COUNT_ARG;
  for (let k = 0; k < COUNT; k++) {
    const t0 = performance.now();
    const pz = list ? fromRow(list[k]) : generate(tier, FIRST + k);
    const seed = pz.seed;
    if (!list) ms.push(performance.now() - t0);
    cards.push(pz.props.length); steps.push(pz.grade.steps); levels.push(pz.grade.level);
    for (const p of pz.props) kinds.set(p.t, (kinds.get(p.t) ?? 0) + 1);
    const truths = pz.props.filter((_, i) => i !== pz.lie);
    const before = openBits(truths, n), after = openBits([...truths, pz.hint], n);
    if (before && after) {
      bitsNoHint.push(before.bits); bitsHint.push(after.bits);
      if (before.bits === 0 && before.steps <= READ_BUDGET) byReading++;
    }
    trials += pz.grade.trials;
    const tag = `tier ${tier} seed ${seed}`;
    if (pz.stones.length !== n || new Set(pz.answer).size !== n) fail(`${tag}: bad stones/answer`);
    if (pz.props.length < spec.min || pz.props.length > spec.max) fail(`${tag}: ${pz.props.length} cards`);
    // Exhaustive: count false cards for every placement.
    let allTrue = 0, oneFalse = 0, oneFalseAt = '', oneFalseLie = -1;
    const byDrop = new Array<number>(pz.props.length).fill(0); // placements true for all but card k (any truth of k)
    for (let i = 0; i < all.length; i++) {
      const cells = unpack(all[i], n);
      const f = falsesOf(pz.props, cells);
      if (f.length === 0) allTrue++;
      if (f.length === 1) { oneFalse++; oneFalseAt = cells.join(','); oneFalseLie = f[0]; }
      if (f.length === 0) for (let k = 0; k < byDrop.length; k++) byDrop[k]++;
      else if (f.length === 1) byDrop[f[0]]++;
    }
    if (spec.lie) {
      if (allTrue !== 0) fail(`${tag}: ${allTrue} placements make every card true`);
      if (oneFalse !== 1) fail(`${tag}: ${oneFalse} placements with exactly one lie`);
      else if (oneFalseAt !== pz.answer.join(',') || oneFalseLie !== pz.lie) fail(`${tag}: the one-lie placement is not the stored answer/lie`);
    } else {
      if (allTrue !== 1) fail(`${tag}: ${allTrue} solutions`);
      else if (!pz.props.every((p) => evalProp(p, pz.answer))) fail(`${tag}: answer breaks a card`);
      // Every card needed: without card k, more than one placement fits the rest.
      byDrop.forEach((cnt, k) => { if (cnt <= 1) fail(`${tag}: card ${k} is redundant`); });
    }
    if (!evalProp(pz.hint, pz.answer)) fail(`${tag}: hint is false`);
    if (pz.props.some((p) => JSON.stringify(p) === JSON.stringify(pz.hint))) fail(`${tag}: hint already on the table`);
    if (tier === 1 && pz.grade.level !== 1) fail(`${tag}: tier 1 graded ${pz.grade.level}`);
    if (pz.grade.level > 2) fail(`${tag}: needs more than one what-if at a time`);
    for (const p of [...pz.props, pz.hint]) for (const loc of ['ko', 'en'] as const) {
      const s = propText(p, pz.stones, loc);
      textLens[loc].push(s.length);
      if (s.length > longest[loc].length) longest[loc] = s;
      if (s.length > BUDGET[loc]) fail(`${tag}: ${loc} too long (${s.length}): ${s}`);
    }
  }
  console.log(`\n== tier ${tier} (${spec.stones} stones${spec.lie ? ', one lie' : ''}) · ${COUNT} puzzles`);
  console.log(`cards     ${hist(cards)}`);
  console.log(`grade     level ${hist(levels)}`);
  console.log(`steps     ${hist(steps)}  (median ${pct(steps, 0.5)})`);
  console.log(`kinds     ${[...kinds.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${(100 * v / cards.reduce((a, b) => a + b, 0)).toFixed(0)}%`).join(' · ')}`);
  const avg = (xs: number[]) => (xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length)).toFixed(1);
  console.log(`no hint   ${(100 * byReading / COUNT).toFixed(0)}% solved by reading cards one at a time within ${READ_BUDGET} readings; the rest need a what-if (avg ${(trials / COUNT).toFixed(1)} what-ifs per puzzle)`);
  console.log(`open bits after one read-through: no hint ${avg(bitsNoHint)} · with the 피스 hint ${avg(bitsHint)} (median ${pct(bitsNoHint, 0.5).toFixed(1)} → ${pct(bitsHint, 0.5).toFixed(1)})${spec.lie ? ' [truths only: the solver is told which card lies]' : ''}`);
  if (ms.length) console.log(`gen ms    median ${pct(ms, 0.5).toFixed(0)} · p90 ${pct(ms, 0.9).toFixed(0)} · max ${Math.max(...ms).toFixed(0)}`);
}
console.log(`\ntext length ko median ${pct(textLens.ko, 0.5)} max ${Math.max(...textLens.ko)} (budget ${BUDGET.ko}) — "${longest.ko}"`);
console.log(`text length en median ${pct(textLens.en, 0.5)} max ${Math.max(...textLens.en)} (budget ${BUDGET.en}) — "${longest.en}"`);
console.log(failures ? `\n${failures} FAILURES` : '\nall puzzles OK');
process.exit(failures ? 1 : 0);

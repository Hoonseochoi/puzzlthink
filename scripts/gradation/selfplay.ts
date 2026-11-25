// Self-play for 그라데이션: AI strength checks and the strong-openings list (GR_OPENINGS in src/lib/gradation.ts).
// Run: npx tsx scripts/gradation/selfplay.ts strength | tune | openings | openings-full | roundrobin '<json>' | personas
import {
  type Gradation, GR_CUPS, applyGrAction, grAiPick, grAllRows, grBelief, grFollower, grNext, grSum, grUsed, newGradation,
} from '../../src/lib/gradation';

type Agent = (g: Gradation, seat: number) => number;

const randomAgent: Agent = (g, seat) => {
  const used = grUsed(g, seat);
  const free = [...Array(GR_CUPS).keys()].filter((p) => !used[p]);
  return free[Math.floor(Math.random() * free.length)];
};

/** Public-info heuristic: random lead; as follower, the cube with the best P(win) minus a rank cost. */
const heuristicAgent: Agent = (g, seat) => {
  if (g.phase === 'lead') return randomAgent(g, seat);
  const opp = 1 - seat;
  const t = g.pickTier[opp]!;
  const belief = grBelief(g.log.map((l) => ({ tier: l.tier[opp], value: l.value[opp] })));
  const dist = new Map<number, number>();
  let total = 0;
  for (const h of belief) {
    const opts = [t, GR_CUPS - 1 - t].filter((p, i, a) => a.indexOf(p) === i && !h.used[p]);
    for (const p of opts) { dist.set(h.row[p], (dist.get(h.row[p]) ?? 0) + h.w / opts.length); total += h.w / opts.length; }
  }
  const row = g.rows[seat]!;
  const used = grUsed(g, seat);
  const free = [...Array(GR_CUPS).keys()].filter((p) => !used[p]);
  let best = free[0], bestS = -Infinity;
  free.forEach((p, i) => {
    let pw = 0;
    for (const [v, w] of dist) pw += (row[p] > v ? 1 : row[p] === v ? 0.5 : 0) * w;
    pw /= total;
    const s = pw - 0.42 * (free.length > 1 ? i / (free.length - 1) : 0);
    if (s > bestS) { bestS = s; best = p; }
  });
  return best;
};

const mcAgent: Agent = (g, seat) => grAiPick(g, seat, 'calc');

const full = grAllRows().filter((r) => grSum(r) === 30);
const randRow = () => full[Math.floor(Math.random() * full.length)];

/** One match (no rematch): returns 1/0/0.5 for seat 0. */
function play(rows: [number[], number[]], agents: [Agent, Agent]): number {
  let g: Gradation = newGradation();
  g = applyGrAction(g, 0, { kind: 'place', row: rows[0] })!;
  g = applyGrAction(g, 1, { kind: 'place', row: rows[1] })!;
  while (g.phase !== 'finished' && g.set === 1) {
    const s = g.phase === 'lead' ? g.leader : grFollower(g);
    const next = applyGrAction(g, s, { kind: 'pick', pos: agents[s](g, s) });
    if (!next) throw new Error('bad move');
    g = next.phase === 'reveal' ? grNext(next) : next;
  }
  if (g.set > 1) return 0.5;
  return g.winner === 0 ? 1 : 0;
}

function match(name: string, a: Agent, b: Agent, n: number, rowA = randRow, rowB = randRow) {
  let s = 0;
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    // Same rows both ways round, so the rows themselves cancel out.
    const ra = rowA(), rb = rowB();
    s += play([ra, rb], [a, b]);
    s += 1 - play([rb, ra], [b, a]);
  }
  console.log(`${name}: ${(100 * s / (2 * n)).toFixed(1)}%  (${2 * n} games, ${((Date.now() - t0) / (2 * n)).toFixed(0)} ms/game)`);
}

const mode = process.argv[2] ?? 'strength';
if (mode === 'strength') {
  match('heuristic vs random', heuristicAgent, randomAgent, 300);
  match('mc vs random', mcAgent, randomAgent, 100);
  match('mc vs heuristic', mcAgent, heuristicAgent, 150);
}
if (mode === 'openings') {
  // Stage 1: every full row, heuristic play, against random full rows.
  const stage1 = full.map((row) => {
    let s = 0;
    const n = 160;
    for (let i = 0; i < n; i++) { const o = randRow(); s += play([row, o], [heuristicAgent, heuristicAgent]); s += 1 - play([o, row], [heuristicAgent, heuristicAgent]); }
    return { row, s: s / (2 * n) };
  }).sort((a, b) => b.s - a.s);
  console.log('stage1 top 12', stage1.slice(0, 12).map((x) => `${x.row.join('')} ${(x.s * 100).toFixed(1)}`).join(' | '));
  // Stage 2: the best 36 with the search AI, against the stage-1 top 36 and random full rows.
  const pool = stage1.slice(0, 36).map((x) => x.row);
  const stage2 = pool.map((row) => {
    let s = 0;
    const n = 24;
    for (let i = 0; i < n; i++) {
      const o = i % 2 ? pool[Math.floor(Math.random() * pool.length)] : randRow();
      s += play([row, o], [mcAgent, mcAgent]); s += 1 - play([o, row], [mcAgent, mcAgent]);
    }
    return { row, s: s / (2 * n) };
  }).sort((a, b) => b.s - a.s);
  console.log(JSON.stringify(stage2.map((x) => [x.row.join(''), +(x.s * 100).toFixed(1)])));
}
if (mode === 'tune') {
  const { grTune } = await import('../../src/lib/gradation');
  const base: Agent = (g, s) => grAiPick(g, s, 'calc', undefined, 420);
  const big: Agent = (g, s) => grAiPick(g, s, 'calc', undefined, 2000);
  match('mc2000 vs mc420', big, base, 300);
  for (const c of [0.2, 0.3, 0.55, 0.7]) {
    // Agent A uses cost c, B the default 0.42 (the knob is global, so switch it per call).
    const a: Agent = (g, s) => { grTune({ cost: c }); const r = grAiPick(g, s, 'calc', undefined, 800); grTune({ cost: 0.42 }); return r; };
    const b: Agent = (g, s) => grAiPick(g, s, 'calc', undefined, 800);
    match(`cost ${c} vs 0.42`, a, b, 300);
  }
}
if (mode === 'openings-full') {
  // Every full row with the search AI on both sides, against a field that is half random full rows, half flat strong ones.
  const flat = full.filter((r) => r[6] - r[0] <= 6);
  const out = full.map((row) => {
    let s = 0;
    const n = 60;
    for (let i = 0; i < n; i++) {
      const o = i % 2 ? flat[Math.floor(Math.random() * flat.length)] : randRow();
      s += play([row, o], [mcAgent, mcAgent]); s += 1 - play([o, row], [mcAgent, mcAgent]);
    }
    return { row, s: s / (2 * n) };
  }).sort((a, b) => b.s - a.s);
  console.log(JSON.stringify(out.slice(0, 60).map((x) => [x.row.join(''), +(x.s * 100).toFixed(1)])));
}
if (mode === 'roundrobin') {
  // The top rows of openings-full, each against each other with the search AI on both sides.
  const top = JSON.parse(process.argv[3]) as [string, number][];
  const rows = top.slice(0, 24).map(([r]) => r.split('').map(Number));
  const score = rows.map(() => 0);
  const n = 6;
  for (let i = 0; i < rows.length; i++) for (let j = i + 1; j < rows.length; j++) {
    for (let k = 0; k < n; k++) {
      const a = play([rows[i], rows[j]], [mcAgent, mcAgent]);
      const b = 1 - play([rows[j], rows[i]], [mcAgent, mcAgent]);
      score[i] += a + b; score[j] += 2 - a - b;
    }
  }
  const games = (rows.length - 1) * n * 2;
  console.log(JSON.stringify(rows.map((r, i) => [r.join(''), +(100 * score[i] / games).toFixed(1)]).sort((x, y) => (y[1] as number) - (x[1] as number))));
}
if (mode === 'personas') {
  const { grAiRow } = await import('../../src/lib/gradation');
  for (const style of ['calc', 'blitz', 'wall', 'trick'] as const) {
    const ag: Agent = (g, s) => grAiPick(g, s, style);
    match(`${style} (own rows) vs heuristic (random rows)`, ag, heuristicAgent, 120, () => grAiRow(style), randRow);
  }
  const calc: Agent = (g, s) => grAiPick(g, s, 'calc');
  match('calc vs calc-random-rows', calc, calc, 120, () => grAiRow('calc'), randRow);
  console.log('sample rows', ['calc', 'blitz', 'wall', 'trick'].map((s) => `${s}: ${[1, 2, 3, 4].map(() => grAiRow(s as 'calc').join('')).join(' ')}`).join(' | '));
}

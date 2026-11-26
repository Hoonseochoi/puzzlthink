// 흑과 백 personas: `npx tsx scripts/ai-personas/black-white.ts [games-per-pair]`
// Every persona at 어려움 against the previous 어려움 AI (no persona) and in a round robin against each other,
// sides and first player alternating. Also: levels still ordered, and how varied the matches are.
import { type BWDifficulty, type BWRound, type Side, BW_PERSONA_TUNING, chooseAiTile, colorOf, isOver, nextLeader, other, resolveRound, winnerOf } from '../../src/lib/blackWhite';
import { type PersonaId, PERSONA_IDS, personaMatch } from '../../src/lib/aiPersona';

type P = { level: BWDifficulty; persona: PersonaId | null };
const N = Number(process.argv[2] ?? 60);
if (process.env.SAMPLES) BW_PERSONA_TUNING.samples = Number(process.env.SAMPLES);
if (process.env.LEAN) BW_PERSONA_TUNING.lean = Number(process.env.LEAN);
const ONLY = process.env.ONLY; // 'legacy' = only the vs-legacy table and variety

function play(a: P, b: P, first: Side, seed: number) {
  const players = [a, b];
  const pm = players.map((p, i) => (p.persona ? personaMatch(p.persona, seed * 2 + i) : undefined));
  const rounds: BWRound[] = [];
  while (!isOver(rounds)) {
    const leader = nextLeader(rounds, first);
    const lead = chooseAiTile(rounds, leader, first, null, players[leader].level, Math.random, pm[leader]);
    const follower = other(leader);
    const follow = chooseAiTile(rounds, follower, first, colorOf(lead), players[follower].level, Math.random, pm[follower]);
    rounds.push(resolveRound(leader, lead, follow));
  }
  return { w: winnerOf(rounds), rounds };
}

/** score for `a` over n games (win 1, draw .5), sides alternating. */
function match(a: P, b: P, n: number, stats?: { len: number[]; early: number[] }) {
  let s = 0;
  for (let g = 0; g < n; g += 1) {
    const swap = g % 2 === 1;
    const first = (Math.floor(g / 2) % 2) as Side;
    const { w, rounds } = swap ? play(b, a, first, g) : play(a, b, first, g);
    const me: Side = swap ? 1 : 0;
    s += w === 'draw' ? 0.5 : w === me ? 1 : 0;
    if (stats) {
      stats.len.push(rounds.length);
      // Sum of tiles the persona spent in the first four rounds.
      stats.early.push(rounds.slice(0, 4).reduce((x, r) => x + r.tiles[me], 0));
    }
  }
  return s / n;
}

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const t0 = Date.now();
console.log(`## vs previous 어려움 AI (${N} games each; 50% = equal; ±${(100 / Math.sqrt(N)).toFixed(0)}pp ≈ 2σ)`);
const variety: Record<string, { len: number[]; early: number[] }> = {};
for (const id of PERSONA_IDS.filter((x) => !process.env.PERSONA || x === process.env.PERSONA)) {
  variety[id] = { len: [], early: [] };
  console.log(`${id.padEnd(8)} ${pct(match({ level: 'hard', persona: id }, { level: 'hard', persona: null }, N, variety[id]))}`);
}
console.log('\n## variety: avg rounds · avg tiles spent in rounds 1–4 (sum of 4 tiles; legacy ≈ 16)');
for (const id of Object.keys(variety)) {
  const v = variety[id];
  const avg = (l: number[]) => (l.reduce((a, b) => a + b, 0) / l.length).toFixed(1);
  console.log(`${id.padEnd(8)} ${avg(v.len)} · ${avg(v.early)}`);
}
if (ONLY === 'legacy') process.exit(0);
console.log(`\n## round robin (${Math.max(10, N / 3)} games per pair): each persona's average score`);
const rr = Object.fromEntries(PERSONA_IDS.map((id) => [id, [] as number[]]));
for (let i = 0; i < PERSONA_IDS.length; i += 1) for (let j = i + 1; j < PERSONA_IDS.length; j += 1) {
  const s = match({ level: 'hard', persona: PERSONA_IDS[i] }, { level: 'hard', persona: PERSONA_IDS[j] }, Math.max(10, Math.round(N / 3)));
  rr[PERSONA_IDS[i]].push(s); rr[PERSONA_IDS[j]].push(1 - s);
}
for (const id of PERSONA_IDS) console.log(`${id.padEnd(8)} ${pct(rr[id].reduce((a, b) => a + b, 0) / rr[id].length)}`);
console.log('\n## levels (persona drawn at random, vs the previous 어려움 AI)');
for (const level of ['easy', 'normal', 'hard'] as BWDifficulty[]) {
  let s = 0;
  for (const id of PERSONA_IDS) s += match({ level, persona: id }, { level: 'hard', persona: null }, Math.max(6, Math.round(N / 5)));
  console.log(`${level.padEnd(8)} ${pct(s / PERSONA_IDS.length)}`);
}
console.log(`\n(${((Date.now() - t0) / 1000).toFixed(0)}s)`);

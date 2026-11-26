// 흑과 백 II personas: `npx tsx scripts/ai-personas/black-white-2.ts [games]`
// Same game loop as BlackWhite2Game.tsx (banks, gauges, overtime). Previous AI = no persona at the same level.
import { type BW2Difficulty, type BW2Round, type BW2Side, type BW2Stage, BW2_MAIN_POINTS, BW2_OVERTIME_POINTS, BW2_PERSONA_TUNING, bw2ColorOf, bw2GaugeOf, bw2IsOver, bw2NextLeader, bw2Other, bw2ResolveRound, bw2ScoresOf, bw2StageRounds, bw2WinnerOf, chooseBw2AiBid } from '../../src/lib/blackWhite2';
import { type PersonaId, PERSONA_IDS, personaMatch } from '../../src/lib/aiPersona';

type P = { level: BW2Difficulty; persona: PersonaId | null };
const N = Number(process.argv[2] ?? 200);
if (process.env.LEAN) BW2_PERSONA_TUNING.lean = Number(process.env.LEAN);

function play(a: P, b: P, first: BW2Side, seed: number) {
  const ps = [a, b];
  const pm = ps.map((p, i) => (p.persona ? personaMatch(p.persona, seed * 2 + i) : undefined));
  let rounds: BW2Round[] = [];
  let stage: BW2Stage = 'main';
  let bank: [number, number] = [BW2_MAIN_POINTS, BW2_MAIN_POINTS];
  while (!bw2IsOver(rounds)) {
    const leader = bw2NextLeader(rounds, first), follower = bw2Other(leader);
    const bid = (side: BW2Side, lead: { color: 'black' | 'white'; gaugeAfter: number } | null) => Math.max(0, Math.min(bank[side], Math.floor(chooseBw2AiBid({
      rounds, me: side, first, stage, myBank: bank[side], opponentGauge: bw2GaugeOf(bank[bw2Other(side)]), lead, level: ps[side].level, persona: pm[side],
    }))));
    const l = bid(leader, null);
    const after: [number, number] = [...bank]; after[leader] -= l;
    bank = after;
    const f = bid(follower, { color: bw2ColorOf(l), gaugeAfter: bw2GaugeOf(after[leader]) });
    const next: [number, number] = [...bank]; next[follower] -= f;
    rounds = [...rounds, bw2ResolveRound(stage, leader, l, f, next)];
    bank = next;
    const score = bw2ScoresOf(rounds);
    if (stage === 'main' && bw2StageRounds(rounds, 'main').length >= 9 && score[0] === score[1] && !bw2IsOver(rounds)) { stage = 'overtime'; bank = [BW2_OVERTIME_POINTS, BW2_OVERTIME_POINTS]; }
  }
  return { w: bw2WinnerOf(rounds), rounds };
}
function match(a: P, b: P, n: number, st?: { early: number[]; ot: number }) {
  let sc = 0;
  for (let g = 0; g < n; g += 1) {
    const swap = g % 2 === 1, first = (Math.floor(g / 2) % 2) as BW2Side;
    const { w, rounds } = swap ? play(b, a, first, g) : play(a, b, first, g);
    const me: BW2Side = swap ? 1 : 0;
    sc += w === 'draw' ? 0.5 : w === me ? 1 : 0;
    if (st) { st.early.push(rounds.slice(0, 4).reduce((x, r) => x + r.bids[me], 0)); if (rounds.some((r) => r.stage === 'overtime')) st.ot += 1; }
  }
  return sc / n;
}
const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const only = process.env.PERSONA;
const level = (process.env.LEVEL ?? 'hard') as BW2Difficulty;
console.log(`## vs previous ${level} AI (${N} games each; ±${(100 / Math.sqrt(N)).toFixed(0)}pp ≈ 2σ) · points bid in rounds 1–4 · overtime share`);
for (const id of PERSONA_IDS.filter((x) => !only || x === only)) {
  const st = { early: [] as number[], ot: 0 };
  const s = match({ level, persona: id }, { level, persona: null }, N, st);
  console.log(`${id.padEnd(8)} ${pct(s)} · ${(st.early.reduce((x, y) => x + y, 0) / N).toFixed(1)} · ${pct(st.ot / N)}`);
}
if (process.env.ONLY === 'legacy') process.exit(0);
console.log(`\n## round robin (${Math.round(N / 3)} per pair)`);
const rr = Object.fromEntries(PERSONA_IDS.map((id) => [id, [] as number[]]));
for (let i = 0; i < 10; i += 1) for (let j = i + 1; j < 10; j += 1) {
  const sc = match({ level, persona: PERSONA_IDS[i] }, { level, persona: PERSONA_IDS[j] }, Math.round(N / 3));
  rr[PERSONA_IDS[i]].push(sc); rr[PERSONA_IDS[j]].push(1 - sc);
}
for (const id of PERSONA_IDS) console.log(`${id.padEnd(8)} ${pct(rr[id].reduce((x, y) => x + y, 0) / rr[id].length)}`);
console.log('\n## levels (random persona vs the previous 어려움 AI) · previous AI at that level');
for (const lv of ['easy', 'normal', 'hard'] as BW2Difficulty[]) {
  let sc = 0;
  for (const id of PERSONA_IDS) sc += match({ level: lv, persona: id }, { level: 'hard', persona: null }, Math.round(N / 5));
  console.log(`${lv.padEnd(8)} ${pct(sc / 10)} · ${lv === 'hard' ? '50%' : pct(match({ level: lv, persona: null }, { level: 'hard', persona: null }, Math.round(N / 2)))}`);
}

// 양면 포커 personas: `npx tsx scripts/ai-personas/two-sided-poker.ts [matches]`
// Whole matches with the real rules (applyTspAction). The previous AI = no persona at the same level.
import { type TspLevel, type TspSide, type TspState, applyTspAction, chooseTspAiAction, newTspGame, startTspHand, tspForcedAction } from '../../src/lib/twoSidedPoker';
import { type PersonaId, PERSONA_IDS, personaMatch } from '../../src/lib/aiPersona';

type P = { level: TspLevel; persona: PersonaId | null };
const N = Number(process.argv[2] ?? 400);

function play(a: P, b: P, seed: number) {
  const ps = [a, b];
  const pm = ps.map((p, i) => (p.persona ? personaMatch(p.persona, seed * 2 + i) : undefined));
  let s: TspState = startTspHand(newTspGame('hard'));
  for (let guard = 0; guard < 20000 && s.phase !== 'finished'; guard += 1) {
    if (s.phase === 'reveal') { s = startTspHand(s); continue; }
    const side = s.turn as TspSide;
    const forced = tspForcedAction(s);
    const move = forced ?? chooseTspAiAction({ ...s, level: ps[side].level }, side, Math.random, pm[side]);
    const next = applyTspAction(s, side, move);
    if (next === s) throw new Error(`illegal ${JSON.stringify(move)}`);
    s = next;
  }
  return s;
}
function match(a: P, b: P, n: number, st?: { hands: number[]; doubles: number; bets: number[] }) {
  let sc = 0;
  for (let g = 0; g < n; g += 1) {
    const swap = g % 2 === 1;
    const s = swap ? play(b, a, g) : play(a, b, g);
    const me = swap ? 1 : 0;
    sc += s.winner === me ? 1 : 0;
    if (st) {
      st.hands.push(s.hand);
      for (const r of s.rounds) { if (r.faces[me] === 'both') st.doubles += 1; st.bets.push(r.levels[me]); }
    }
  }
  return sc / n;
}
const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const avg = (l: number[]) => (l.reduce((x, y) => x + y, 0) / Math.max(1, l.length)).toFixed(2);
const only = process.env.PERSONA;
console.log(`## vs previous 어려움 AI (${N} matches each; ±${(100 / Math.sqrt(N)).toFixed(0)}pp ≈ 2σ) · avg hands · avg bet level · 양면 per match`);
for (const id of PERSONA_IDS.filter((x) => !only || x === only)) {
  const st = { hands: [] as number[], doubles: 0, bets: [] as number[] };
  console.log(`${id.padEnd(8)} ${pct(match({ level: 'hard', persona: id }, { level: 'hard', persona: null }, N, st))} · ${avg(st.hands)} · ${avg(st.bets)} · ${(st.doubles / N).toFixed(2)}`);
}
if (process.env.ONLY === 'legacy') process.exit(0);
console.log(`\n## round robin (${Math.round(N / 3)} per pair)`);
const rr = Object.fromEntries(PERSONA_IDS.map((id) => [id, [] as number[]]));
for (let i = 0; i < 10; i += 1) for (let j = i + 1; j < 10; j += 1) {
  const sc = match({ level: 'hard', persona: PERSONA_IDS[i] }, { level: 'hard', persona: PERSONA_IDS[j] }, Math.round(N / 3));
  rr[PERSONA_IDS[i]].push(sc); rr[PERSONA_IDS[j]].push(1 - sc);
}
for (const id of PERSONA_IDS) console.log(`${id.padEnd(8)} ${pct(rr[id].reduce((x, y) => x + y, 0) / rr[id].length)}`);
console.log('\n## levels (random persona vs the previous 어려움 AI) · previous AI at that level');
for (const level of ['easy', 'normal', 'hard'] as TspLevel[]) {
  let sc = 0;
  for (const id of PERSONA_IDS) sc += match({ level, persona: id }, { level: 'hard', persona: null }, Math.round(N / 5));
  console.log(`${level.padEnd(8)} ${pct(sc / 10)} · ${level === 'hard' ? '50%' : pct(match({ level, persona: null }, { level: 'hard', persona: null }, N))}`);
}

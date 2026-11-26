// 인디언 포커 personas: `npx tsx scripts/ai-personas/indian-poker.ts [matches]`
// Plays whole matches through the real room reducer. A persona seat is an AI seat with that persona; the previous
// AI (no persona) plays as a "human" seat whose moves this script computes with the old call.
import { type PokerDifficulty, type PokerSide, choosePokerAiAction, pokerOther } from '../../src/lib/indianPoker';
import { type IndianPokerRoom, createIndianPokerRoom, reduceIndianPokerRoom } from '../../src/lib/indianPokerRoom';
import { type PersonaId, PERSONA_IDS } from '../../src/lib/aiPersona';

let clock = 1e12;
Date.now = () => clock;
type P = { level: PokerDifficulty; persona: PersonaId | null };
const N = Number(process.argv[2] ?? 200);

function play(a: P, b: P) {
  let s: IndianPokerRoom = createIndianPokerRoom({ id: 'h', name: 'h' } as never, false);
  const players = [a, b];
  s = { ...s, ai: [!!a.persona, !!b.persona], aiLevel: a.persona ? a.level : b.level, seats: [{ id: 'a', name: 'a' }, { id: 'b', name: 'b' }] };
  s = reduceIndianPokerRoom(s, { t: 'start' }, 0, true)!;
  s = { ...s, persona: [a.persona, b.persona] };
  for (let guard = 0; guard < 5000 && s.phase !== 'finished'; guard += 1) {
    if (s.phase === 'reveal') { clock = s.deadline + 1; s = reduceIndianPokerRoom(s, { t: 'timeout' }, 0, true)!; continue; }
    const me = s.turn as PokerSide;
    const p = players[me];
    // Both AIs at the same level: the reducer reads aiLevel for AI seats.
    s = { ...s, aiLevel: p.level };
    if (p.persona) { s = reduceIndianPokerRoom(s, { t: 'ai' }, me, true) ?? s; continue; }
    const handsInDeck = Math.max(0, (s.deckPos - 2) / 2);
    const c = choosePokerAiAction({ opponentCard: s.cards[pokerOther(me)], usedCards: [...s.rounds.slice(-handsInDeck).flatMap((r) => r.cards), s.cards[pokerOther(me)]], chips: s.chips, bets: s.bets, carry: s.carry, me, level: p.level, canCheck: s.opened });
    const next = c.t === 'fold' ? reduceIndianPokerRoom(s, { t: 'fold' }, me, false) : reduceIndianPokerRoom(s, { t: 'bet', total: c.total }, me, false);
    if (!next) throw new Error(`illegal move ${JSON.stringify(c)}`);
    s = next;
  }
  return s;
}

function match(a: P, b: P, n: number, stats?: { hands: number[]; pot: number[] }) {
  let score = 0;
  for (let g = 0; g < n; g += 1) {
    const swap = g % 2 === 1;
    const s = swap ? play(b, a) : play(a, b);
    const me = swap ? 1 : 0;
    score += s.winner === 'draw' ? 0.5 : s.winner === me ? 1 : 0;
    if (stats) { stats.hands.push(s.rounds.length); for (const r of s.rounds) stats.pot.push(r.pot); }
  }
  return score / n;
}
const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const avg = (l: number[]) => (l.reduce((x, y) => x + y, 0) / Math.max(1, l.length)).toFixed(1);
const only = process.env.PERSONA;
console.log(`## vs previous 어려움 AI (${N} matches each; ±${(100 / Math.sqrt(N)).toFixed(0)}pp ≈ 2σ) · avg hands · avg pot`);
for (const id of PERSONA_IDS.filter((x) => !only || x === only)) {
  const st = { hands: [] as number[], pot: [] as number[] };
  console.log(`${id.padEnd(8)} ${pct(match({ level: 'hard', persona: id }, { level: 'hard', persona: null }, N, st))} · ${avg(st.hands)} · ${avg(st.pot)}`);
}
if (process.env.ONLY === 'legacy') process.exit(0);
console.log(`\n## round robin (${Math.round(N / 3)} per pair): average score`);
const rr = Object.fromEntries(PERSONA_IDS.map((id) => [id, [] as number[]]));
for (let i = 0; i < 10; i += 1) for (let j = i + 1; j < 10; j += 1) {
  const sc = match({ level: 'hard', persona: PERSONA_IDS[i] }, { level: 'hard', persona: PERSONA_IDS[j] }, Math.round(N / 3));
  rr[PERSONA_IDS[i]].push(sc); rr[PERSONA_IDS[j]].push(1 - sc);
}
for (const id of PERSONA_IDS) console.log(`${id.padEnd(8)} ${pct(rr[id].reduce((x, y) => x + y, 0) / rr[id].length)}`);
console.log('\n## levels (random persona at each level vs the previous 어려움 AI)');
for (const level of ['easy', 'normal', 'hard'] as PokerDifficulty[]) {
  let sc = 0;
  for (const id of PERSONA_IDS) sc += match({ level, persona: id }, { level: 'hard', persona: null }, Math.round(N / 5));
  console.log(`${level.padEnd(8)} ${pct(sc / 10)}`);
}
console.log('\n## previous AI, level vs level (for reference)');
for (const level of ['easy', 'normal'] as PokerDifficulty[]) console.log(`${level.padEnd(8)} ${pct(match({ level, persona: null }, { level: 'hard', persona: null }, N))}`);

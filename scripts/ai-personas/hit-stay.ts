// Hit,Stay personas: `npx tsx scripts/ai-personas/hit-stay.ts [tables] [sims]`
// (1) each persona in one seat against four seats of the previous AI (its five styles, no per-match tuning or reads);
// (2) tables of five distinct random personas. Reports 1st-place rate (20% = even), average place, match length.
import { type HitStay, type HsStyle, HS_PLAYERS, HS_SIMS, applyHsAction, chooseHsAction, hsPicking, newHitStay, startRound } from '../../src/lib/hitStay';
import { type PersonaMatch, PERSONA_IDS, drawPersonas, personaMatch } from '../../src/lib/aiPersona';

const T = Number(process.argv[2] ?? 60);
HS_SIMS.n = Number(process.argv[3] ?? 160);
const OLD: HsStyle[] = ['calc', 'aggro', 'careful', 'bluffer', 'trap'];
type Seat = { style: HsStyle; match?: PersonaMatch };

function play(seats: Seat[]) {
  let g: HitStay = newHitStay();
  for (let guard = 0; guard < 20000 && g.phase !== 'finished'; guard += 1) {
    if (g.phase === 'showdown') { g = startRound(g); continue; }
    const actors = g.phase === 'pick' ? hsPicking(g) : [g.turn];
    for (const s of actors) {
      const move = chooseHsAction(g, s, seats[s].style, seats[s].match);
      const next = applyHsAction(g, s, move);
      if (!next) throw new Error(`illegal ${JSON.stringify(move)} in ${g.phase}`);
      g = next;
    }
  }
  return g;
}
const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const only = process.env.PERSONA;
const RRT = Number(process.env.RRT ?? T * 4);
const t0 = performance.now();
console.log(`## one persona vs four previous AIs (${T} tables each; 20% = even, ±${(200 * Math.sqrt(0.16 / T)).toFixed(0)}pp ≈ 2σ) · avg place · avg rounds`);
for (const id of PERSONA_IDS.filter((x) => !only || x === only)) {
  let first = 0, place = 0, rounds = 0;
  for (let t = 0; t < T; t += 1) {
    const at = t % HS_PLAYERS;
    const seats: Seat[] = Array.from({ length: HS_PLAYERS }, (_, s) => (s === at ? { style: id, match: personaMatch(id, t * 31 + 7) } : { style: OLD[Math.floor(Math.random() * OLD.length)] }));
    const g = play(seats);
    if (g.place[at] === 1) first += 1;
    place += g.place[at] ?? 5; rounds += g.round;
  }
  console.log(`${id.padEnd(8)} ${pct(first / T)} · ${(place / T).toFixed(2)} · ${(rounds / T).toFixed(1)}`);
}
if (process.env.ONLY === 'legacy') process.exit(0);
console.log(`\n## tables of five random personas (${RRT} tables): 1st-place rate · avg place`);
const st = Object.fromEntries(PERSONA_IDS.map((id) => [id, { n: 0, first: 0, place: 0 }]));
const lens: number[] = [];
for (let t = 0; t < RRT; t += 1) {
  const ids = drawPersonas(HS_PLAYERS);
  const g = play(ids.map((id, s) => ({ style: id, match: personaMatch(id, t * 13 + s) })));
  lens.push(g.round);
  ids.forEach((id, s) => { st[id].n += 1; st[id].place += g.place[s] ?? 5; if (g.place[s] === 1) st[id].first += 1; });
}
for (const id of PERSONA_IDS) console.log(`${id.padEnd(8)} ${pct(st[id].first / st[id].n)} · ${(st[id].place / st[id].n).toFixed(2)} (${st[id].n})`);
lens.sort((a, b) => a - b);
console.log(`match length: median ${lens[lens.length >> 1]}, 10–90% ${lens[Math.floor(lens.length * 0.1)]}–${lens[Math.floor(lens.length * 0.9)]} rounds`);
console.log(`(${((performance.now() - t0) / 1000).toFixed(0)}s)`);

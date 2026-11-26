// Checks for the shared persona layer: `npx tsx scripts/ai-personas/persona-check.ts`
import assert from 'node:assert/strict';
import { PERSONAS, PERSONA_IDS, drawPersonas, habitStrength, isPersonaId, personaMatch, personaTalk, seededRand, softPick, smoothedShare } from '../../src/lib/aiPersona';

// Cast: ten, unique names and colours, every text in both languages.
assert.equal(PERSONA_IDS.length, 10);
assert.equal(new Set(PERSONA_IDS.map((id) => PERSONAS[id].name)).size, 10);
assert.equal(new Set(PERSONA_IDS.map((id) => PERSONAS[id].color)).size, 10);
for (const id of PERSONA_IDS) {
  const p = PERSONAS[id];
  for (const t of [p.style, p.blurb, p.plays]) assert.ok(t.ko && t.en, id);
  for (const ev of ['hello', 'winRound', 'loseRound', 'bold', 'fold', 'winGame', 'loseGame'] as const) assert.ok(personaTalk(id, ev, false) && personaTalk(id, ev, true));
}
assert.ok(isPersonaId('calc') && !isPersonaId('shark'));

// Draws: distinct, honour `avoid`, and every persona comes up.
const seen = new Map<string, number>();
for (let i = 0; i < 4000; i += 1) {
  const four = drawPersonas(4);
  assert.equal(new Set(four).size, 4);
  for (const id of four) seen.set(id, (seen.get(id) ?? 0) + 1);
  assert.ok(!drawPersonas(1, Math.random, ['calc']).includes('calc'));
}
assert.equal(seen.size, 10);
for (const n of seen.values()) assert.ok(n > 1300 && n < 1900, `uneven draws ${[...seen]}`);
assert.equal(drawPersonas(10, Math.random, PERSONA_IDS).length, 10); // avoiding everyone falls back to the whole cast

// Per-match variation: same seed → same knobs, different seeds → different knobs, all within the spread.
const a = personaMatch('aggro', 7), b = personaMatch('aggro', 7), c = personaMatch('aggro', 8);
assert.equal(a.vary('x'), b.vary('x'));
assert.equal(a.mood, b.mood);
assert.notEqual(a.vary('x'), c.vary('x'));
for (let s = 0; s < 500; s += 1) { const m = personaMatch('calc', s); assert.ok(Math.abs(m.mood) <= 1 && Math.abs(m.vary('k', 0.2) - 1) <= 0.2); }

// Habit helpers.
assert.equal(habitStrength(['a', 'b']), 0);
assert.ok(habitStrength(['a', 'a', 'a', 'a', 'a', 'a']) > 0.6);
assert.ok(habitStrength(['a', 'b', 'a', 'b', 'a', 'b']) < 0.25);
assert.equal(smoothedShare(0, 0), 0.5);
const r = seededRand(3);
let best = 0;
for (let i = 0; i < 1000; i += 1) if (softPick([{ v: 1, s: 1 }, { v: 2, s: 0.5 }], 0.05, r) === 1) best += 1;
assert.ok(best > 990);
console.log('persona layer: ok');

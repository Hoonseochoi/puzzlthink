// Whole 히든 워드 확장판 party matches (2–6 players, one turn each) with the real room reducer and the real server
// functions on a scratch database (hw_dev), all inside one transaction that is rolled back (pg_session.mjs), with the
// migrations under test applied first. Run from the repo root:
//   npx esbuild src/lib/hiddenWordParty.ts --bundle --platform=node --format=esm --outfile=/tmp/hwp/party.mjs --alias:@=./src
//   cp scripts/hidden-word/party_play.mjs scripts/hidden-word/pg_session.mjs /tmp/hwp/ && node /tmp/hwp/party_play.mjs
// Checks: one envelope per player, no foreign locks, no hidden word in the room state, lock ids cannot be used to probe
// (hw_room_score refuses them; hints need the setter's secret, answers another player's), only the word scores 100,
// every player sets exactly once, timeouts skip, gains add up to the scores. Never point it at the live database.
import assert from 'node:assert';
import { createHwpRoom, reduceHwpRoom, hwpGuessers, hwpAnswered, hwpHintsThisStage, hwpUsed, HWP_CFG, HWP_MAX } from './party.mjs';
import { pgSession } from './pg_session.mjs';
const UID = { sub: '00000000-0000-4000-8000-000000000001' };
const MIG = process.env.MIGRATIONS ?? 'supabase/migrations';
const db = pgSession('hw_dev');
await db.open([`${MIG}/20271201300000_hidden_word_open_app.sql`, `${MIG}/20271206000000_hidden_word_party_six.sql`]);
const sql = (q, signed = false) => db.query(q, signed ? UID : null);
const lit = (s) => `'${String(s).replace(/'/g, "''")}'`;
const arr = (ws) => `array[${ws.map(lit).join(',')}]::text[]`;
const json = (s) => JSON.parse(s || 'null');
const pgArr = (s) => (s ? s.replace(/^\{|\}$/g, '').split(',').filter(Boolean) : null);

const q = async (query, signed = false) => (await sql(query, signed)) ?? '';

async function play(n, seed) {
  let rnd = seed; const rand = () => (rnd = (rnd * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;
  const peers = Array.from({ length: n }, (_, i) => ({ id: `p${i}`, name: `P${i}` }));
  let s = createHwpRoom(peers[0]);
  s = { ...s, seats: s.seats.map((x, i) => (i < n ? { id: peers[i].id, name: peers[i].name } : null)) };
  const act = (a, seat, host = false) => { const nx = reduceHwpRoom(s, a, seat, host); if (nx) s = nx; return !!nx; };
  assert(act({ t: 'capacity', n }, 0, true));
  if (n === HWP_MAX) assert(!act({ t: 'capacity', n: HWP_MAX + 1 }, 0, true), 'no seventh seat');
  const deal = json(await q(`select hw_party_deal(${n})`, true));
  assert(deal.deal, 'deal');
  assert(act({ t: 'start', deal: deal.deal }, 0, true));
  const mine = s.players.map((seat) => ({ seat, secret: `secret-${seed}-${seat}-xxxxxxxxxxxx`, words: [], set: [], locks: {} }));
  for (const m of mine) {
    const free = [0, 1, 2, 3, 4, 5].filter((i) => !s.picks.includes(i));
    const i = free[Math.floor(rand() * free.length)];
    m.words = pgArr(await q(`select hw_party_claim(${lit(deal.deal)}, ${i}, ${lit(m.secret)})`));
    assert(m.words?.length === 5, 'claim');
    if (m.seat !== mine[0].seat) assert(!pgArr(await q(`select hw_party_claim(${lit(deal.deal)}, ${s.picks[mine[0].seat] ?? i}, ${lit(m.secret)})`)), 'second claim refused');
    assert(act({ t: 'envelope', i }, m.seat));
  }
  const allWords = mine.flatMap((m) => m.words);
  let guards = 0, probes = 0;
  while (s.phase !== 'finished' && guards++ < 800) {
    const t = s.t; const setter = mine.find((m) => m.seat === t.setter);
    { const legit = new Set([...s.history, t].flatMap((x) => [...x.hints.map((h) => h.w), ...x.answers.flatMap((a) => a.w), ...(x.word ? [x.word] : [])]));
      const leak = allWords.filter((w) => JSON.stringify(s).includes(`"${w}"`) && !legit.has(w));
      assert(!leak.length, 'a hidden word leaked into the room state: ' + leak.join(',')); }
    const others = mine.filter((m) => m.seat !== t.setter);
    if (s.phase === 'pick') {
      if (rand() < 0.08) { s = { ...s, deadline: 0 }; assert(act({ t: 'timeout' }, 0, true)); continue; }
      const left = setter.words.filter((w) => !setter.set.includes(w)); const w = left[Math.floor(rand() * left.length)];
      assert(!json(await q(`select to_json(hw_party_lock(${lit(s.deal)}, ${lit(w)}, ${lit(others[0].secret)}))`)), 'foreign lock refused');
      const lock = json(await q(`select to_json(hw_party_lock(${lit(s.deal)}, ${lit(w)}, ${lit(setter.secret)}))`));
      assert(lock, 'lock'); setter.set.push(w); setter.locks[lock] = w;
      const second = setter.words.find((x) => x !== w);
      assert(!json(await q(`select to_json(hw_party_lock(${lit(s.deal)}, ${lit(second)}, ${lit(setter.secret)}))`)), 'one lock per player');
      assert(act({ t: 'pick', lock }, setter.seat));
    } else if (s.phase === 'hint') {
      if (rand() < 0.05) { s = { ...s, deadline: 0 }; assert(act({ t: 'timeout' }, 0, true)); continue; }
      const word = setter.locks[t.lock];
      if (!probes++) {   // a lock id from the room state is no way to probe the word
        assert.equal(json(await q(`select hw_room_score(${lit(t.lock)}, array[${lit(word)}], 'hint')`)), null, 'hw_room_score refuses party locks');
        assert.equal(json(await q(`select hw_party_hint(${lit(t.lock)}, ${lit(others[0].secret)}, ${lit(word)})`)), null, 'a guesser cannot hint');
      }
      const cand = await q(`select h.word from hw_hints h where h.target = ${lit(word)} and not (h.word = any(${arr(hwpUsed(t).length ? hwpUsed(t) : [''])})) order by random() limit 1`);
      const sc = json(await q(`select hw_party_hint(${lit(t.lock)}, ${lit(setter.secret)}, ${lit(cand)})`))[0];
      const last = hwpHintsThisStage(t) === HWP_CFG.maxHints - 1 && sc < HWP_CFG.cut;
      const rev = last ? json(await q(`select hw_party_reveal(${lit(t.lock)}, ${lit(setter.secret)}, ${arr([...hwpUsed(t), cand])})`)) : null;
      assert(act({ t: 'hint', word: cand, s: sc, rev }, setter.seat));
    } else if (s.phase === 'reveal') {
      const rev = json(await q(`select hw_party_reveal(${lit(t.lock)}, ${lit(setter.secret)}, ${arr(hwpUsed(t))})`));
      assert(!act({ t: 'reveal', rev }, others[0].seat, true), 'only the setter reveals, not even the host');
      assert(act({ t: 'reveal', rev }, setter.seat));
    } else if (s.phase === 'answer') {
      const todo = hwpGuessers(s, t).filter((g) => !hwpAnswered(t).includes(g));
      if (rand() < 0.05 && todo.length) { s = { ...s, deadline: 0 }; assert(act({ t: 'timeout' }, 0, true)); continue; }
      const g = todo[0]; const gm = mine.find((m) => m.seat === g);
      const word = setter.locks[t.lock];
      const pool = (await q(`select string_agg(word, ',') from (select word from hw_targets where level='plus' and not (word = any(${arr(hwpUsed(t).length ? hwpUsed(t) : [''])})) order by random() limit 2) x`)).split(',');
      const guess = rand() < 0.3 ? [word] : rand() < 0.2 && !t.chance.includes(g) ? [pool[0], word === pool[1] ? pool[0] + '' : pool[1]].filter((v, i, a) => a.indexOf(v) === i) : [pool[0]];
      const words = guess.filter((w) => !t.hints.some((h) => h.w === w));
      if (!words.length) words.push(pool[1]);
      const res = json(await q(`select hw_party_answer(${lit(t.lock)}, ${lit(gm.secret)}, ${arr(words)})`));
      assert(res?.s, 'answer scored');
      assert.equal(res.ok, words.includes(word), 'the server says right exactly when the word is there');
      assert(act({ t: 'answer', words, s: res.s }, g));
      if (res.s.some((x) => x >= 100)) assert(words.includes(word), 'only the word itself scores 100');
    } else if (s.phase === 'turnEnd') {
      if (t.lock) assert(act({ t: 'word', word: setter.locks[t.lock] }, setter.seat));
      assert(act({ t: 'next' }, s.players[Math.floor(rand() * s.players.length)]));
    }
  }
  assert.equal(s.phase, 'finished'); assert.equal(s.history.length, n, 'every player sets exactly once');
  assert.deepEqual([...s.history.map((h) => h.setter)].sort(), [...s.players].sort(), 'each player one turn');
  const sum = Array(HWP_MAX).fill(0); for (const h of s.history) h.gained.forEach((g, i) => (sum[i] += g));
  assert.deepEqual(sum, s.scores);
  for (const h of s.history) {
    if (h.solved > 0) h.answers.filter((a) => a.ok && a.stage === h.solved).forEach((a) => assert(h.gained[a.seat] >= 1));
    if (h.solved === 0) assert.equal(h.gained[h.setter], 6, 'held to the end: 1+2+3, no doubling');
  }
  const outcome = s.history.map((h) => (h.solved === -1 ? 'skip' : h.solved ? `found@${h.solved}` : 'held')).join(' ');
  return `${n} players: ${s.history.length} turns (${outcome}); scores ${s.players.map((p) => s.scores[p]).join('/')}`;
}
try {
  for (const [n, seed] of [[6, 7], [6, 11], [3, 23], [5, 31], [2, 41], [6, 53]]) console.log(await play(n, seed));
  console.log('all party checks passed');
} finally { await db.close(); }

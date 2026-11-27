// Whole 히든 워드 확장판 party matches (2–5 players) with the real room reducer and the real server functions on a
// scratch database (hw_dev, through `docker exec psql`). Run from the repo root:
//   npx esbuild src/lib/hiddenWordParty.ts --bundle --platform=node --format=esm --outfile=/tmp/hwp/party.mjs --alias:@=./src
//   cp scripts/hidden-word/party_play.mjs /tmp/hwp/ && node /tmp/hwp/party_play.mjs
// Checks: one envelope per player, no foreign locks, no hidden word in the room state, only the word scores 100,
// every player sets once per round, timeouts skip, gains add up to the scores. Never point it at the live database.
import { execFileSync } from 'node:child_process';
import assert from 'node:assert';
import { createHwpRoom, reduceHwpRoom, hwpGuessers, hwpAnswered, hwpHintsThisStage, hwpUsed, HWP_CFG } from './party.mjs';
const UID = '00000000-0000-4000-8000-000000000001';
const sql = (q, signed = false) => execFileSync('docker', ['exec', '-i', 'supabase-db', 'psql', '-U', 'postgres', '-d', 'hw_dev', '-tAq'],
  { input: (signed ? `set request.jwt.claims='{"sub":"${UID}"}';` : '') + q }).toString().trim().split('\n').pop();
const lit = (s) => `'${String(s).replace(/'/g, "''")}'`;
const arr = (ws) => `array[${ws.map(lit).join(',')}]::text[]`;
const json = (s) => JSON.parse(s || 'null');
const pgArr = (s) => (s ? s.replace(/^\{|\}$/g, '').split(',').filter(Boolean) : null);

function play(n, seed) {
  let rnd = seed; const rand = () => (rnd = (rnd * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;
  const peers = Array.from({ length: n }, (_, i) => ({ id: `p${i}`, name: `P${i}` }));
  let s = createHwpRoom(peers[0]);
  s = { ...s, seats: s.seats.map((x, i) => (i < n ? { id: peers[i].id, name: peers[i].name } : null)) };
  const act = (a, seat, host = false) => { const nx = reduceHwpRoom(s, a, seat, host); if (nx) s = nx; return !!nx; };
  assert(act({ t: 'capacity', n }, 0, true));
  const deal = json(sql(`select hw_party_deal(${n})`, true));
  assert(deal.deal, 'deal');
  assert(act({ t: 'start', deal: deal.deal }, 0, true));
  const mine = s.players.map((seat) => ({ seat, secret: `secret-${seed}-${seat}-xxxxxxxxxxxx`, words: [], set: [], locks: {} }));
  // envelopes: each claims one on the server, then tells the room; a second claim of a taken envelope must fail
  for (const m of mine) {
    const free = [0, 1, 2, 3, 4, 5].filter((i) => !s.picks.includes(i));
    const i = free[Math.floor(rand() * free.length)];
    m.words = pgArr(sql(`select hw_party_claim(${lit(deal.deal)}, ${i}, ${lit(m.secret)})`));
    assert(m.words?.length === 5, 'claim');
    if (m.seat !== mine[0].seat) assert(!pgArr(sql(`select hw_party_claim(${lit(deal.deal)}, ${s.picks[mine[0].seat] ?? i}, ${lit(m.secret)})`)), 'second claim refused');
    assert(act({ t: 'envelope', i }, m.seat));
  }
  // no word of anyone's envelope ever appears in the room state
  const allWords = mine.flatMap((m) => m.words);
  let turns = 0, guards = 0;
  while (s.phase !== 'finished' && guards++ < 500) {
    const t = s.t; const setter = mine.find((m) => m.seat === t.setter);
    { const turnsAll = [...s.history, t]; const legit = new Set(turnsAll.flatMap((x) => [...x.hints.map((h) => h.w), ...x.answers.flatMap((a) => a.w), ...(x.word ? [x.word] : [])]));
      const leak = allWords.filter((w) => JSON.stringify(s).includes(`"${w}"`) && !legit.has(w));
      assert(!leak.length, 'a hidden word leaked into the room state: ' + leak.join(',')); }
    if (s.phase === 'pick') {
      if (rand() < 0.08) { s = { ...s, deadline: 0 }; assert(act({ t: 'timeout' }, 0, true)); continue; }   // the setter does not pick (left)
      const left = setter.words.filter((w) => !setter.set.includes(w)); const w = left[Math.floor(rand() * left.length)];
      // someone else cannot lock the setter's word
      const other = mine.find((m) => m.seat !== setter.seat);
      assert(!json(sql(`select to_json(hw_party_lock(${lit(s.deal)}, ${lit(w)}, ${lit(other.secret)}))`)), 'foreign lock refused');
      const lock = json(sql(`select to_json(hw_party_lock(${lit(s.deal)}, ${lit(w)}, ${lit(setter.secret)}))`));
      assert(lock, 'lock'); setter.set.push(w); setter.locks[lock] = w;
      assert(act({ t: 'pick', lock }, setter.seat));
    } else if (s.phase === 'hint') {
      if (rand() < 0.05) { s = { ...s, deadline: 0 }; assert(act({ t: 'timeout' }, 0, true)); continue; }    // time runs out
      const word = setter.locks[t.lock];
      const cand = sql(`select h.word from hw_hints h where h.target = ${lit(word)} and not (h.word = any(${arr(hwpUsed(t).length ? hwpUsed(t) : ['']) })) order by random() limit 1`);
      const sc = json(sql(`select hw_room_score(${lit(t.lock)}, array[${lit(cand)}], 'hint')`))[0];
      const last = hwpHintsThisStage(t) === HWP_CFG.maxHints - 1 && sc < HWP_CFG.cut;
      const rev = last ? json(sql(`select hw_room_reveal(${lit(t.lock)}, ${arr([...hwpUsed(t), cand])})`)) : null;
      assert(act({ t: 'hint', word: cand, s: sc, rev }, setter.seat));
    } else if (s.phase === 'reveal') {
      const rev = json(sql(`select hw_room_reveal(${lit(t.lock)}, ${arr(hwpUsed(t))})`));
      assert(act({ t: 'reveal', rev }, 0, true));
    } else if (s.phase === 'answer') {
      const todo = hwpGuessers(s, t).filter((g) => !hwpAnswered(t).includes(g));
      if (rand() < 0.05 && todo.length) { s = { ...s, deadline: 0 }; assert(act({ t: 'timeout' }, 0, true)); continue; }  // someone never answers
      const g = todo[0];
      // a guesser answers from the level's pool: the real word with some chance (as if they reasoned it out)
      const word = setter.locks[t.lock];
      const pool = sql(`select string_agg(word, ',') from (select word from hw_targets where level='plus' and not (word = any(${arr(hwpUsed(t).length ? hwpUsed(t) : [''])})) order by random() limit 2) x`).split(',');
      const guess = rand() < 0.35 ? [word] : rand() < 0.2 && !t.chance.includes(g) ? [pool[0], word === pool[1] ? pool[0] + '' : pool[1]].filter((v, i, a) => a.indexOf(v) === i) : [pool[0]];
      const words = guess.filter((w) => !t.hints.some((h) => h.w === w));
      if (!words.length) words.push(pool[1]);
      const sc = json(sql(`select hw_room_score(${lit(t.lock)}, ${arr(words)}, 'answer')`));
      assert(act({ t: 'answer', words, s: sc }, g));
      if (sc.some((x) => x >= 100)) assert(words.includes(word), 'only the word itself scores 100');
    } else if (s.phase === 'turnEnd') {
      if (t.lock) assert(act({ t: 'word', word: setter.locks[t.lock] }, setter.seat));
      turns++;
      assert(act({ t: 'next' }, s.players[Math.floor(rand() * s.players.length)]));
    }
  }
  assert.equal(s.phase, 'finished'); assert.equal(s.history.length, 2 * n, 'every player set once per round');
  // points add up: each turn's gains sum into the final scores
  const sum = Array(5).fill(0); for (const h of s.history) h.gained.forEach((g, i) => (sum[i] += g));
  assert.deepEqual(sum, s.scores);
  for (const h of s.history) {
    const found = h.answers.filter((a) => a.ok).map((a) => a.seat);
    if (h.solved > 0) found.forEach((seat) => assert.equal(h.gained[seat] >= h.round, true));
    if (h.solved === 0) assert.equal(h.gained[h.setter], [1, 2, 3].reduce((a, b) => a + b, 0) * h.round);
  }
  const outcome = s.history.map((h) => (h.solved === -1 ? 'skip' : h.solved ? `found@${h.solved}` : 'held')).join(' ');
  return `${n} players: ${s.history.length} turns (${outcome}); scores ${s.players.map((p) => s.scores[p]).join('/')}`;
}
for (const [n, seed] of [[3, 7], [5, 11], [3, 23], [5, 31], [2, 41]]) console.log(play(n, seed));
console.log('all party checks passed');

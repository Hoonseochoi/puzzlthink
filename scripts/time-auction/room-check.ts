// Room checks for 시간 경매 (host logic with a fake clock): `npx tsx scripts/time-auction/room-check.ts`
import assert from 'node:assert/strict';
import { TA_COUNTDOWN_MS } from '../../src/lib/timeAuction';
import {
  TA_BEAT_LOST_MS, TA_LAG_MAX, TA_READY_SEC, TA_REVEAL_MS, type TaRoom, type TaRoomAction, createTaRoom, redactTaRoom, reduceTaRoom, syncTaSeats, taAutoAction, taBeat, taQuiet, taRoomSecret, withTaRoomSecret, taNextEventAt,
} from '../../src/lib/timeAuctionRoom';

let clock = 1_000_000;
Date.now = () => clock;
let passed = 0;
const test = (name: string, fn: () => void) => { fn(); passed += 1; console.log(`ok  ${name}`); };
const act = (s: TaRoom, a: TaRoomAction, seat: number | null, host = false) => reduceTaRoom(s, a, seat, host) ?? s;
const peers = (ids: string[]) => ids.map((id, i) => ({ id, name: id, at: i }));

/** A started room: host 'h' plus guests, AI off unless asked. */
function room(guests: string[], fillAi = false): TaRoom {
  let s = createTaRoom({ id: 'h', name: 'h', at: 0 });
  s = syncTaSeats(s, peers(['h', ...guests]));
  s = act(s, { t: 'fillAi', on: fillAi }, 0, true);
  s = act(s, { t: 'start' }, 0, true);
  return s;
}
const seatOf = (s: TaRoom, id: string) => s.seats.findIndex((x) => x?.id === id);
/** Everyone still holding has just sent a heartbeat. */
const alive = (s: TaRoom): TaRoom => ({ ...s, hidden: { ...s.hidden, beat: s.hidden.beat.map(() => clock) } });
const pressAll = (s: TaRoom) => { for (let i = 0; i < 6; i += 1) if (s.game.inGame[i] && !s.ai[i]) s = act(s, { t: 'press', r: s.game.round, on: true }, i, i === seatOf(s, 'h')); return s; };

test('countdown starts when everyone has pressed; guests measure from their own countdown', () => {
  let s = room(['a', 'b']);
  assert.equal(s.game.phase, 'ready');
  s = pressAll(s);
  assert.equal(s.game.phase, 'live');
  assert.equal(s.liveAt, clock);
});

test('a late claim is charged at least host elapsed − lag; an early claim is capped', () => {
  let s = pressAll(room(['a', 'b']));
  const [a, b] = [seatOf(s, 'a'), seatOf(s, 'b')];
  clock += TA_COUNTDOWN_MS + 30_000; // host elapsed 30.0 s
  s = alive(s);
  s = act(s, { t: 'hb', r: 1, m: taBeat(1_000) }, a); // claims 1.0 s after keeping the board running 30 s
  assert.equal(s.game.bids[a], 30_000 - TA_LAG_MAX);
  s = act(s, { t: 'hb', r: 1, m: taBeat(45_000) }, b); // claims longer than possible
  assert.equal(s.game.bids[b], 30_100); // e + TA_EARLY_MS (120) → truncated to 30.1
});

test('an honest claim inside the lag window is taken as measured', () => {
  let s = pressAll(room(['a']));
  const a = seatOf(s, 'a');
  clock += TA_COUNTDOWN_MS + 12_000;
  s = alive(s);
  s = act(s, { t: 'hb', r: 1, m: taBeat(11_234) }, a);
  assert.equal(s.game.bids[a], 11_200);
});

test('releases are quiet; the board stops only when the last holder lets go', () => {
  let s = pressAll(room(['a', 'b']));
  const [h, a, b] = [seatOf(s, 'h'), seatOf(s, 'a'), seatOf(s, 'b')];
  clock += TA_COUNTDOWN_MS + 5_000;
  s = alive(s);
  const before = s;
  s = act(s, { t: 'hb', r: 1, m: taBeat(4_900) }, a);
  assert.equal(taQuiet(before, s), true);
  const beat = act(s, { t: 'hb', r: 1, m: taBeat(null) }, b);
  assert.equal(taQuiet(s, beat), true); // a plain heartbeat is quiet too
  s = act(beat, { t: 'hb', r: 1, m: taBeat(5_000) }, h, true);
  clock += 2_000;
  const last = s;
  s = act(s, { t: 'hb', r: 1, m: taBeat(7_050) }, b);
  assert.equal(s.game.phase, 'reveal');
  assert.equal(taQuiet(last, s), false);
  assert.equal(s.game.log[0].winner, b);
  assert.equal(s.game.log[0].price, 7_000);
});

test('a holder whose heartbeat stops pays up to the last heartbeat', () => {
  let s = pressAll(room(['a']));
  const [h, a] = [seatOf(s, 'h'), seatOf(s, 'a')];
  clock += TA_COUNTDOWN_MS + 3_000;
  s = act(s, { t: 'hb', r: 1, m: taBeat(null) }, a); // last sign of life at 3.0 s
  s = act(s, { t: 'hb', r: 1, m: taBeat(2_000) }, h, true);
  assert.equal(taNextEventAt(s), clock + TA_BEAT_LOST_MS);
  clock += TA_BEAT_LOST_MS;
  assert.deepEqual(taAutoAction(s), { t: 'tick' });
  s = act(s, { t: 'tick' }, h, true);
  assert.equal(s.game.phase, 'reveal');
  assert.equal(s.game.log[0].bids[a], 3_000);
  assert.equal(s.game.log[0].winner, a);
});

test('a reloaded page reports unknown and is charged elapsed − lag', () => {
  let s = pressAll(room(['a']));
  const a = seatOf(s, 'a');
  clock += TA_COUNTDOWN_MS + 9_000;
  s = alive(s);
  s = act(s, { t: 'hb', r: 1, m: taBeat('unknown') }, a);
  assert.equal(s.game.bids[a], 9_000 - TA_LAG_MAX);
});

test('time used up: the host pushes a silent holder out at exactly their time', () => {
  let s = pressAll(room(['a']));
  const [h, a] = [seatOf(s, 'h'), seatOf(s, 'a')];
  s = { ...s, game: { ...s.game, bank: s.game.bank.map((v, i) => (i === a ? 2_000 : v)) } };
  s = act(s, { t: 'hb', r: 1, m: taBeat(-500) }, h, true);
  clock += TA_COUNTDOWN_MS;
  for (let t = 0; t <= 2_000 + TA_LAG_MAX; t += 900) { clock += 900; s = act(s, { t: 'hb', r: 1, m: taBeat(null) }, a); s = act(s, { t: 'tick' }, h, true); }
  assert.equal(s.game.phase, 'reveal');
  assert.equal(s.game.log[0].bids[a], 2_000);
});

test('redaction hides every time and live bid; my secret restores only mine', () => {
  const s = pressAll(room(['a', 'b']));
  const a = seatOf(s, 'a');
  const pub = redactTaRoom(s);
  assert.ok(pub.game.bank.every((v) => v === -1));
  assert.ok(pub.game.joined.every((v) => !v));
  assert.equal(pub.hidden.plan.length, 0);
  const mine = withTaRoomSecret(pub, taRoomSecret(s, a), a);
  assert.equal(mine.game.bank[a], 300_000); // standard (5:00) is the default format
  assert.equal(mine.game.bank.filter((v) => v >= 0).length, 1);
  assert.equal(mine.game.joined[a], true);
});

test('ready clock: a player who does not press sits out; two misses hand the seat to the AI', () => {
  let s = room(['a', 'b']);
  const [h, a, b] = [seatOf(s, 'h'), seatOf(s, 'a'), seatOf(s, 'b')];
  for (let round = 1; round <= 2; round += 1) {
    s = act(s, { t: 'press', r: round, on: true }, h, true);
    s = act(s, { t: 'press', r: round, on: true, pass: true }, a);
    clock += TA_READY_SEC * 1000;
    s = act(s, { t: 'tick' }, h, true);
    assert.equal(s.game.phase, 'live');
    assert.equal(s.game.joined[b], false);
    clock += TA_COUNTDOWN_MS + 1_000;
    s = act(s, { t: 'hb', r: round, m: taBeat(500) }, h, true);
    s = act(s, { t: 'tick' }, h, true);
    clock += TA_REVEAL_MS; s = act(s, { t: 'tick' }, h, true);
  }
  assert.equal(s.ai[b], true);
  assert.equal(s.away?.[b], true);
});

test('AI match: a player with no time left is passed automatically (no stall)', () => {
  let s = createTaRoom({ id: 'me', name: 'me', at: 0 }, { solo: true });
  s = { ...s, game: { ...s.game, bank: s.game.bank.map((v, i) => (i === 0 ? 0 : v)) } };
  s = act(s, { t: 'press', r: 1, on: true, pass: true }, 0, true); // round 1 as usual
  let guard = 0;
  while (s.game.round === 1 && guard++ < 500) { clock = Math.max(clock + 50, Math.min(taNextEventAt(s), clock + 5_000)); const a = taAutoAction(s); if (a) s = act(s, a, 0, true); }
  assert.equal(s.game.round, 2);
  assert.equal(s.game.phase, 'live'); // round 2 started without the player pressing
  assert.equal(s.game.joined[0], false);
});

test('AI seats: distinct personalities from the roster, a rolled mind each, hidden from guests', () => {
  const s = createTaRoom({ id: 'me', name: 'me', at: 0 }, { solo: true });
  const ai = s.style.filter((st, i) => st && s.ai[i]);
  assert.equal(ai.length, 5);
  assert.equal(new Set(ai).size, 5);
  assert.ok(s.mind?.every((m, i) => !s.ai[i] || (m && m.style === s.style[i] && m.aggr >= 0.85 && m.chaos <= 0.12)));
  const r = room(['a'], true);
  assert.equal(redactTaRoom(r).mind, undefined);
});

test('own time: shown by default, a host can hide it (broadcast rule); others\' time never reaches a guest', () => {
  let s = createTaRoom({ id: 'h', name: 'h', at: 0 });
  assert.equal(s.hideOwn, undefined);
  s = syncTaSeats(s, peers(['h', 'a']));
  s = act(s, { t: 'hideOwn', on: true }, 0, true);
  assert.equal(s.hideOwn, true);
  assert.equal(reduceTaRoom(s, { t: 'hideOwn', on: false }, 1, false), null); // only the host
  s = act(s, { t: 'start' }, 0, true);
  assert.equal(reduceTaRoom(s, { t: 'hideOwn', on: false }, 0, true), null); // not during a match
  const a = seatOf(s, 'a');
  const view = withTaRoomSecret(redactTaRoom(s), taRoomSecret(s, a), a);
  assert.equal(view.game.bank.filter((b) => b >= 0).length, 1);
  assert.equal(view.game.bank[a], 300_000);
});

test('stale heartbeats from another round are ignored', () => {
  const s = pressAll(room(['a']));
  const a = seatOf(s, 'a');
  clock += TA_COUNTDOWN_MS + 2_000;
  assert.equal(reduceTaRoom(s, { t: 'hb', r: 5, m: taBeat(1_000) }, a, false), null);
});

test('full matches run to the end on ticks alone (solo vs 5 AI, room with AI fill)', () => {
  for (const make of [() => createTaRoom({ id: 'me', name: 'me', at: 0 }, { solo: true }), () => room(['a'], true)]) {
    let s = make();
    let steps = 0;
    while (s.phase === 'playing' && steps < 20_000) {
      steps += 1;
      if (s.game.phase === 'ready') for (let i = 0; i < 6; i += 1) if (!s.ai[i] && s.game.inGame[i]) s = act(s, { t: 'press', r: s.game.round, on: true, pass: true }, i, i === 0);
      clock = Math.max(clock + 50, Math.min(taNextEventAt(s), clock + 5_000));
      for (let i = 0; i < 6; i += 1) if (!s.ai[i] && s.game.inGame[i] && s.game.phase === 'live') s = act(s, { t: 'hb', r: s.game.round, m: taBeat(null) }, i, i === 0);
      const auto = taAutoAction(s); if (auto) s = act(s, auto, 0, true);
    }
    assert.equal(s.phase, 'finished');
    assert.equal(s.game.log.length, s.game.rounds);
    assert.ok(s.game.place.filter((p) => p !== null).length === s.game.inGame.filter(Boolean).length);
  }
});

console.log(`\n${passed} room checks passed`);

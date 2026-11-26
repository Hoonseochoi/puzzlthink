// Rules checks for 시간 경매: `npx tsx scripts/time-auction/check.ts`
import assert from 'node:assert/strict';
import {
  type TimeAuction, newTimeAuction, taBeginCountdown, taExhaust, taFloor, taHolding, taNextRound, taPress, taRelease, taSettle, taStandings, taClock, taSafeTokens, taScore, taLotValue,
} from '../../src/lib/timeAuction';

let passed = 0;
const test = (name: string, fn: () => void) => { fn(); passed += 1; console.log(`ok  ${name}`); };
const must = <T,>(x: T | null): T => { assert.ok(x !== null, 'step refused'); return x as T; };

/** Plays one auction: `holds[s]` = ms after the countdown at which seat s lets go (negative = in the countdown, null = never pressed). */
function auction(g: TimeAuction, holds: (number | null)[]): TimeAuction {
  let s = g;
  holds.forEach((h, i) => { if (h !== null) s = taPress(s, i, true) ?? s; });
  s = must(taBeginCountdown(s));
  const order = holds.map((h, i) => ({ h, i })).filter((x) => x.h !== null).sort((a, b) => a.h! - b.h!);
  for (const { h, i } of order) { s = taExhaust(s, h!); s = taRelease(s, i, h!) ?? s; }
  s = taExhaust(s, Number.MAX_SAFE_INTEGER);
  return must(taSettle(s));
}

test('floor to 0.1 s and the board clock', () => {
  assert.equal(taFloor(12_389), 12_300);
  assert.equal(taClock(83_400), '1:23.4');
  assert.equal(taClock(600_000), '10:00.0');
  assert.equal(taClock(99), '0:00.0');
});

test('tie to the tenth voids the token, both still pay', () => {
  const g = auction(newTimeAuction([true, true, true], 'quick'), [10_050, 10_099, 4_000]);
  const r = g.log[0];
  assert.equal(r.outcome, 'void');
  assert.equal(r.price, 10_000);
  assert.deepEqual(g.tokens, [0, 0, 0]);
  assert.deepEqual(g.bank, [110_000, 110_000, 116_000]);
});

test('a hundredth apart in a different tenth is not a tie', () => {
  const g = auction(newTimeAuction([true, true], 'quick'), [10_099, 10_100]);
  assert.equal(g.log[0].outcome, 'won');
  assert.equal(g.log[0].winner, 1);
});

test('losing tie below the top changes nothing', () => {
  const g = auction(newTimeAuction([true, true, true], 'quick'), [5_000, 5_000, 9_000]);
  assert.equal(g.log[0].winner, 2);
  assert.deepEqual(g.bank, [115_000, 115_000, 111_000]);
});

test('letting go in the countdown, or within the first 0.1 s, costs nothing', () => {
  const g = auction(newTimeAuction([true, true, true], 'quick'), [-2_000, 60, 300]);
  assert.deepEqual(g.log[0].bids, [0, 0, 300]);
  assert.equal(g.log[0].winner, 2);
  assert.deepEqual(g.bank, [120_000, 120_000, 119_700]);
});

test('nobody bids: no token', () => {
  const g = auction(newTimeAuction([true, true], 'quick'), [-100, -4_000]);
  assert.equal(g.log[0].outcome, 'empty');
  assert.deepEqual(g.tokens, [0, 0]);
});

test('a seat that never pressed is out', () => {
  let g = newTimeAuction([true, true], 'quick');
  g = must(taPress(g, 0, true));
  g = must(taBeginCountdown(g));
  assert.deepEqual(g.joined, [true, false]);
  assert.deepEqual(taHolding(g), [0]);
});

test('passing in the ready step is the same as letting go in the countdown', () => {
  let g = newTimeAuction([true, true], 'quick');
  g = must(taPress(g, 0, true, true));
  g = must(taPress(g, 1, true));
  g = must(taBeginCountdown(g));
  assert.deepEqual(g.joined, [false, true]);
});

test('bank runs out mid-round: pushed out at exactly the time left, cannot outbid it', () => {
  let g = newTimeAuction([true, true], 'quick');
  g = { ...g, bank: [14_000, 120_000] };
  g = auction(g, [90_000, 20_000]); // seat 0 wants 90 s but only has 14.0 s
  assert.deepEqual(g.log[0].bids, [14_000, 20_000]);
  assert.equal(g.log[0].winner, 1);
  assert.deepEqual(g.bank, [0, 100_000]);
});

test('two players running dry at the same time tie', () => {
  let g = newTimeAuction([true, true], 'quick');
  g = { ...g, bank: [30_000, 30_000] };
  g = auction(g, [60_000, 60_000]);
  assert.equal(g.log[0].outcome, 'void');
  assert.deepEqual(g.bank, [0, 0]);
});

test('a player with no time left cannot take part', () => {
  let g = newTimeAuction([true, true], 'quick');
  g = { ...g, bank: [0, 120_000] };
  g = must(taPress(g, 0, true));
  assert.equal(g.pass[0], true);
  g = must(taPress(g, 1, true));
  g = must(taBeginCountdown(g));
  assert.deepEqual(g.joined, [false, true]);
});

test('release is refused twice and outside the live phase', () => {
  let g = newTimeAuction([true, true], 'quick');
  assert.equal(taRelease(g, 0, 1_000), null);
  g = must(taPress(g, 0, true)); g = must(taPress(g, 1, true)); g = must(taBeginCountdown(g));
  g = must(taRelease(g, 0, 1_000));
  assert.equal(taRelease(g, 0, 2_000), null);
  assert.equal(taSettle(g), null); // seat 1 still holding
});

test('last round ends the match; standings and tie-breaks', () => {
  let g = newTimeAuction([true, true, true, true], 'quick');
  g = { ...g, round: g.rounds, tokens: [2, 2, 1, 1], points: [2, 2, 1, 1], bank: [5_000, 9_000, 3_000, 3_000] };
  g = auction(g, [-1, -1, -1, -1]);
  g = must(taNextRound(g));
  assert.equal(g.phase, 'finished');
  const st = taStandings(g);
  assert.deepEqual(st.order, [1, 0, 2, 3]);
  assert.equal(st.piece, 1);
  assert.deepEqual(st.eliminated, [2, 3]); // same tokens and same time: both last
  assert.deepEqual(g.place, [2, 1, 3, 3]);
});

test('tie for the most tokens and time: no piece', () => {
  const g = { ...newTimeAuction([true, true, true], 'quick'), tokens: [3, 3, 1], points: [3, 3, 1], bank: [0, 0, 7_000] };
  const st = taStandings(g);
  assert.equal(st.piece, null);
  assert.deepEqual(st.eliminated, [2]);
});

test('minus stone: the single shortest of two or more bids takes −1', () => {
  const g = auction(newTimeAuction([true, true, true, true], 'quick'), [4_000, 9_000, 6_000, -1_000]);
  assert.equal(g.log[0].winner, 1);
  assert.equal(g.log[0].minus, 0); // 4.0 s is the shortest real bid; the countdown drop-out (seat 3) is safe
  assert.deepEqual(g.minus, [1, 0, 0, 0]);
  assert.equal(taScore(g, 0), -1);
});

test('minus stone: a lone bidder only wins; a tie for shortest voids it', () => {
  let g = auction(newTimeAuction([true, true, true], 'quick'), [-1, 3_000, -1]);
  assert.equal(g.log[0].minus, null);
  g = auction(newTimeAuction([true, true, true], 'quick'), [2_050, 2_099, 8_000]);
  assert.equal(g.log[0].minus, null); // 2.0 s and 2.0 s tie to the tenth
  g = auction(newTimeAuction([true, true], 'quick'), [5_000, 5_000]);
  assert.equal(g.log[0].outcome, 'void');
  assert.equal(g.log[0].minus, null); // both bids equal: no winner and no minus stone
});

test('minus stone: a void at the top can still hand out −1 below it', () => {
  const g = auction(newTimeAuction([true, true, true], 'quick'), [7_000, 7_000, 1_000]);
  assert.equal(g.log[0].outcome, 'void');
  assert.equal(g.log[0].minus, 2);
});

test('ranking uses the score (stones − minus), then time', () => {
  const g = { ...newTimeAuction([true, true, true], 'quick'), tokens: [3, 2, 1], points: [3, 2, 1], minus: [2, 0, 0], bank: [9_000, 1_000, 5_000] };
  const st = taStandings(g); // scores 1, 2, 1 → seat 1; then seats 0 and 2 on score 1 by time
  assert.deepEqual(st.order, [1, 0, 2]);
  assert.deepEqual(st.eliminated, [2]);
});

test('stone values: 1, every third auction 2, the last 3; score = points − minus', () => {
  assert.deepEqual(Array.from({ length: 9 }, (_, i) => taLotValue(i + 1, 9)), [1, 1, 2, 1, 1, 2, 1, 1, 3]);
  let g = newTimeAuction([true, true], 'quick');
  for (let r = 1; r <= 9; r += 1) { g = auction(g, r % 3 === 0 || r === 9 ? [9_000, 1_000] : [1_000, 9_000]); g = must(taNextRound(g)); }
  assert.deepEqual(g.tokens, [3, 6]);
  assert.deepEqual(g.points, [2 + 2 + 3, 6]); // seat 0 won auctions 3, 6 and 9
  assert.deepEqual(g.minus, [6, 3]);
  assert.equal(taScore(g, 0), 1);
  assert.equal(taScore(g, 1), 3);
  assert.deepEqual(g.log.map((r) => r.value), [1, 1, 2, 1, 1, 2, 1, 1, 3]);
});

test('survival threshold', () => {
  assert.equal(taSafeTokens(19, 6), 4); // the broadcast: 4 tokens guarantee survival
  assert.equal(taSafeTokens(9, 6), 2);
});

test('replay of the broadcast (나무위키 round table): tokens 5/1/3/4/3/3, 박상연 out, 김하린 1st', () => {
  // Seats: 김하린, 박상연, 손은유, 이세돌, 저스틴민, 최현준. Unshown cells are 0 except the two footnoted estimates
  // (박상연 1:51.3 in 19R; 이세돌's unshown 2:16.2, placed in 16R where it does not change the winner).
  const s = (m: number, sec: number) => Math.round((m * 60 + sec) * 1000);
  const R: number[][] = [
    [0, s(1, 23.4), s(1, 49.8), 0, 0, 0], [s(2, 15.6), 0, 0, 0, 0, 100], [0, 0, 0, s(1, 26.6), 0, s(1, 3.1)],
    [0, s(2, 9.5), s(1, 47.4), 0, 0, 0], [s(2, 17.3), 0, 0, 0, 0, 0], [0, s(2, 34.8), 0, 0, 0, s(3, 1.3)],
    [0, 0, s(2, 20.3), 0, 0, 0], [s(0, 10.1), 0, 0, s(1, 56.4), 0, 0], [0, 0, 0, 0, 0, s(2, 30.4)],
    [0, 0, s(0, 58), 0, 0, s(0, 22.8)], [s(1, 44.8), 0, 0, 0, 0, 0], [0, 0, 0, s(2, 12.9), 0, s(1, 49.2)],
    [0, 0, s(1, 9.6), s(2, 7.9), 0, 0], [s(1, 29.2), 0, 0, 0, 0, 0], [0, s(2, 1), 0, 0, s(2, 21.9), 0],
    [0, 0, s(1, 40.9), s(2, 16.2), s(2, 23.4), 0], [s(2, 3), 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, s(1, 13.1)],
    [0, s(1, 51.3), 0, 0, s(4, 9.9), 0],
  ];
  let g = newTimeAuction(Array(6).fill(true), 'broadcast');
  for (const bids of R) { g = auction(g, bids.map((b) => (b ? b : -1))); g = must(taNextRound(g)); }
  assert.equal(g.phase, 'finished');
  assert.deepEqual(g.tokens, [5, 1, 3, 4, 3, 3]);
  // Under this site's minus stone (house rule) the same bids would also hand out these −1 stones:
  console.log('     broadcast bids under the minus-stone rule: minus', g.minus.join('/'), '· scores', g.tokens.map((_, s) => taScore(g, s)).join('/'));
  assert.equal(g.bank[0], 0); assert.equal(g.bank[1], 0); assert.equal(g.bank[2], 14_000); assert.equal(g.bank[3], 0); assert.equal(g.bank[5], 0);
  const st = taStandings({ ...g, minus: g.minus.map(() => 0), points: [...g.tokens] }); // the broadcast: no minus stone, every token worth 1
  assert.deepEqual(st.eliminated, [1]);
  assert.equal(st.piece, 0);
});

console.log(`\n${passed} checks passed`);

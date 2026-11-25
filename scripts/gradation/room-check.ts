// Plays whole 그라데이션 matches through the room reducer (AI match and a 1:1 room) with a fake clock.
// Run: npx tsx scripts/gradation/room-check.ts
import { GR_CUPS, grUsed, grValid, grWaitingOn, grRandomRow } from '../../src/lib/gradation';
import {
  type GradationRoom, createGradationRoom, gradationAutoAction, reduceGradationRoom, redactGradationRoom, gradationRoomSecret, withGradationRoomSecret,
} from '../../src/lib/gradationRoom';

let now = 1_000_000;
Date.now = () => now;
const fail = (msg: string) => { console.error('FAIL', msg); process.exit(1); };

function freeCup(room: GradationRoom, seat: number) {
  const used = grUsed(room.game, seat);
  const free = [...Array(GR_CUPS).keys()].filter((p) => !used[p]);
  return free[Math.floor(Math.random() * free.length)];
}

/** Steps a room until it finishes: humans move at once, the host's auto steps run when due. */
function run(room: GradationRoom, humans: number[], maxSteps = 4000) {
  let s = room;
  let sets = 1, rounds = 0;
  for (let i = 0; i < maxSteps && s.phase === 'playing'; i++) {
    const g = s.game;
    const waiting = grWaitingOn(g).filter((x) => humans.includes(x) && !s.ai[x]);
    if (waiting.length) {
      const seat = waiting[0];
      const action = g.phase === 'place' ? { kind: 'place' as const, row: grRandomRow() } : { kind: 'pick' as const, pos: freeCup(s, seat) };
      const next = reduceGradationRoom(s, { t: 'act', action }, seat, seat === 0);
      if (!next) fail(`human move refused in ${g.phase}`);
      s = next!;
      continue;
    }
    const auto = gradationAutoAction(s);
    if (auto) {
      const next = reduceGradationRoom(s, auto, null, true);
      if (next) { if (auto.t === 'next') rounds++; if (next.game.set > sets) sets = next.game.set; s = next; continue; }
    }
    now += 250;
  }
  return { s, sets, rounds };
}

// 1) AI matches: always end with a winner (or a draw after the rematch cap), never more than 7 rounds a set.
let wins = 0, losses = 0, draws = 0, rematches = 0, early = 0;
for (let k = 0; k < 120; k++) {
  const room = createGradationRoom({ id: 'me', name: 'me', at: 0 }, { solo: true });
  if (!room.ai[1] || !room.style) fail('solo room has no AI');
  const { s, sets } = run(room, [0]);
  if (s.phase !== 'finished') fail('solo match did not finish');
  const g = s.game;
  if (g.log.length > 7) fail('more than 7 rounds');
  const w = g.winner;
  if (w === null) { fail('no winner'); continue; }
  if (w !== -1 && g.score[w] <= g.score[1 - w]) fail('winner has the lower score');
  if (g.early) early++;
  rematches += sets - 1;
  if (g.winner === 0) wins++; else if (g.winner === 1) losses++; else draws++;
  for (const row of g.rows) if (!grValid(row)) fail('invalid row');
}
console.log(`solo: random human ${wins}W ${losses}L ${draws}D vs AI, ${rematches} rematches, ${early} early finishes`);

// 2) Redaction: guests see no rows/positions before the end, and get their own row back through the secret.
{
  let room = createGradationRoom({ id: 'h', name: 'host', at: 0 });
  room = { ...room, seats: [room.seats[0], { id: 'g', name: 'guest' }] };
  room = reduceGradationRoom(room, { t: 'start' }, 0, true)!;
  room = reduceGradationRoom(room, { t: 'act', action: { kind: 'place', row: [0, 0, 1, 3, 8, 9, 9] } }, 0, true)!;
  room = reduceGradationRoom(room, { t: 'act', action: { kind: 'place', row: [1, 1, 2, 2, 7, 8, 9] } }, 1, true)!;
  const leader = room.game.leader;
  room = reduceGradationRoom(room, { t: 'act', action: { kind: 'pick', pos: 6 } }, leader, leader === 0)!;
  const pub = redactGradationRoom(room);
  if (pub.game.rows.some(Boolean) || pub.game.pickPos.some((p) => p !== null)) fail('public state leaks rows or picks');
  if (pub.game.pickTier[leader] !== 0) fail('lead shade missing');
  const guestView = withGradationRoomSecret(pub, JSON.parse(JSON.stringify(gradationRoomSecret(room, 1))), 1);
  if (guestView.game.rows[1]?.join('') !== '1122789' || guestView.game.rows[0]) fail('guest secret wrong');
  console.log('redaction: ok');
}

// 3) Room timeouts: placing runs out → random rows; three missed cups in a row lose.
{
  let room = createGradationRoom({ id: 'h', name: 'host', at: 0 });
  room = { ...room, seats: [room.seats[0], { id: 'g', name: 'guest' }] };
  room = reduceGradationRoom(room, { t: 'start' }, 0, true)!;
  now = room.deadline + 1;
  room = reduceGradationRoom(room, { t: 'timeout' }, null, true)!;
  if (room.game.phase !== 'lead' || !room.game.rows.every((r) => grValid(r))) fail('place timeout did not fill rows');
  let misses = 0;
  while (room.phase === 'playing' && misses < 20) {
    if (room.game.phase === 'reveal') { now = room.holdUntil + 1; room = reduceGradationRoom(room, { t: 'next' }, null, true)!; continue; }
    now = room.deadline + 1;
    room = reduceGradationRoom(room, { t: 'timeout' }, null, true)!;
    misses++;
  }
  if (room.phase !== 'finished' || room.resigned === null) fail('missed turns did not end the match');
  console.log(`timeouts: ok (seat ${room.resigned} lost after missed turns)`);
}

// 4) A full friend room with two humans.
{
  let room = createGradationRoom({ id: 'h', name: 'host', at: 0 });
  if (reduceGradationRoom(room, { t: 'start' }, 0, true)) fail('started with one player');
  room = { ...room, seats: [room.seats[0], { id: 'g', name: 'guest' }] };
  room = reduceGradationRoom(room, { t: 'start' }, 0, true)!;
  const { s } = run(room, [0, 1]);
  if (s.phase !== 'finished' || s.game.winner === null) fail('friend match did not finish');
  console.log(`friend room: ok (${s.game.score.join(':')}, set ${s.game.set})`);
}
console.log('all checks passed');

// Room-level checks for 뒤집기 오목 (rules version 2): `npx tsx scripts/flip-omok/room-test.ts [matches=40]`
// Plays whole room matches through the host's reducer (two seats choosing moves, flips included; some turns left to
// time out) and checks: a flip spends exactly one charge and never more than three per game, a timed-out turn never
// flips, locked stones never change colour, a saved/restored state (JSON) keeps charges and locks, and old/new pages
// meet as designed (an old guest's move is played quietly and tagged; `ver` clears the tag; an old room is upgraded
// by a new host; a state left behind by an old host is spotted by `hostIsCurrent`).
import assert from 'node:assert/strict';
import { FLIP_CHARGES, FLIP_RULES_VERSION, chooseMove, isFlipped, owner, play, type Board } from '../../src/lib/flipOmok';
import {
  type FlipRoom, type FlipRoomAction, STALE_TAG, createFlipRoom, flipAutoAction, hostIsCurrent, reduceFlipRoom, roomCharges, seatToMove, syncFlipSeats,
} from '../../src/lib/flipOmokRoom';

const matches = Number(process.argv[2] ?? 40);
const host = { id: 'host', name: '방장', at: 1 }, guest = { id: 'guest', name: '손님', at: 2 };
const peers = [host, guest];
let rnd = 11;
const rand = () => { rnd = (rnd * 1103515245 + 12345) & 0x7fffffff; return rnd / 0x7fffffff; };
const red = (s: FlipRoom, a: FlipRoomAction, seat: number | null) => reduceFlipRoom(s, a, seat, true);
const expire = (s: FlipRoom): FlipRoom => ({ ...s, deadline: 0 });
const lockedOf = (b: Board) => b.map((c, i) => (isFlipped(c) ? `${i}:${c}` : '')).filter(Boolean);

function lobby(): FlipRoom {
  let s = createFlipRoom(host);
  s = syncFlipSeats(s, peers);
  assert.equal(s.seats[1]?.id, 'guest');
  return red(s, { t: 'start' }, 0)!;
}

let flipsTotal = 0, timeouts = 0, restores = 0, games = 0;
for (let m = 0; m < matches; m++) {
  let s = lobby();
  assert.equal(s.rules, FLIP_RULES_VERSION);
  assert.deepEqual(roomCharges(s), [0, FLIP_CHARGES, FLIP_CHARGES]);
  for (let k = 0; k < 120 && s.phase === 'playing'; k++) {
    const seat = seatToMove(s), p = s.turn, before = s.board, chargesBefore = roomCharges(s)[p];
    const locked = lockedOf(before);
    let next: FlipRoom | null;
    let flipped = false, timedOut = false;
    if (rand() < 0.08) {
      next = red(expire(s), { t: 'timeout' }, 0);
      timedOut = true; timeouts++;
    } else {
      const mv = chooseMove(s.board, p, roomCharges(s), rand() < 0.5 ? 'normal' : 'hard');
      // The seat dispatches its own move (as a current page would).
      next = red(s, { t: 'move', at: mv.at, flip: mv.flip, rv: FLIP_RULES_VERSION }, seat);
      flipped = mv.flip;
      assert.ok(next, 'a legal move was refused');
    }
    if (!next) break;
    // Charges: one per flip, none on a timeout.
    const spent = chargesBefore - roomCharges(next)[p];
    assert.equal(spent, flipped ? 1 : 0, `charges went ${chargesBefore} → ${roomCharges(next)[p]}`);
    if (timedOut) assert.equal(next.flipped.length, 0, 'a timed-out move flipped');
    if (flipped) { flipsTotal++; assert.ok(next.flipped.length > 0); }
    // Locked stones never change.
    for (const l of locked) { const [i, c] = l.split(':').map(Number); assert.equal(next.board[i], c, 'a locked stone changed'); }
    assert.ok(hostIsCurrent(next));
    // Every few moves the host "reloads": the saved JSON comes back as the room state.
    if (k % 7 === 3) {
      const restored = JSON.parse(JSON.stringify(next)) as FlipRoom;
      assert.deepEqual(roomCharges(restored), roomCharges(next));
      assert.deepEqual(lockedOf(restored.board), lockedOf(next.board));
      assert.equal(flipAutoAction(restored), null, 'a restored current room needs no upgrade');
      next = restored; restores++;
    }
    s = next;
  }
  games++;
  assert.ok(roomCharges(s)[1] >= 0 && roomCharges(s)[2] >= 0);
}

// Old guest (no rv) on a new host: played quietly, name tagged; `ver` from a current page clears the tag.
{
  let s = lobby();
  // Find a position where the guest's point would sandwich something.
  const seatG = 1;
  for (let k = 0; k < 60 && s.phase === 'playing'; k++) {
    const p = s.turn, seat = seatToMove(s);
    const mv = chooseMove(s.board, p, [0, 0, 0], 'normal');
    if (seat === seatG) {
      const before = s.board;
      const next = red(s, { t: 'move', at: mv.at }, seat)!; // an old page's action: no flip, no rv
      assert.ok(next, 'an old page\'s legal move was refused');
      assert.equal(next.flipped.length, 0, 'an old page\'s move flipped');
      assert.deepEqual(next.board.filter((c, i) => c !== before[i]).length, 1);
      assert.ok(next.seats[seatG]!.name.startsWith(STALE_TAG), 'the old page was not tagged');
      // Presence syncs keep the tag (and don't double it).
      const synced = syncFlipSeats(next, peers);
      assert.equal(synced.seats[seatG]!.name, `${STALE_TAG}${guest.name}`);
      // The player refreshes: their new page says `ver`.
      const fresh = red(synced, { t: 'ver', rv: FLIP_RULES_VERSION }, seatG)!;
      assert.equal(fresh.seats[seatG]!.name, guest.name);
      assert.deepEqual(fresh.stale, []);
      break;
    }
    s = red(s, { t: 'move', at: mv.at, flip: false, rv: FLIP_RULES_VERSION }, seat)!;
  }
}

// A room saved by an old page (no rules, no charges) is upgraded by a new host; a game an old host moved on is spotted.
{
  const s = lobby();
  const mv = chooseMove(s.board, 1, roomCharges(s), 'normal');
  const after = red(s, { t: 'move', at: mv.at, flip: false, rv: FLIP_RULES_VERSION }, seatToMove(s))!;
  // An old host plays the next move with the old reducer: board and moves change, our fields are carried untouched.
  const p = after.turn;
  const oldMove = chooseMove(after.board, p, [0, 0, 0], 'normal').at;
  const res = play(after.board, oldMove, p, true); // the old rules flipped every sandwich
  const byOldHost: FlipRoom = { ...after, board: res.board, last: oldMove, flipped: res.flipped, moves: after.moves + 1, turn: p === 1 ? 2 : 1 };
  assert.equal(hostIsCurrent(byOldHost), false, 'an old host\'s move went unnoticed');
  // A current page refuses to play on such a state until it is upgraded…
  assert.equal(red(byOldHost, { t: 'move', at: 0, flip: false, rv: FLIP_RULES_VERSION }, seatToMove(byOldHost)), null);
  // …which a new host does on its own (auto action), keeping the board (its flipped stones count as locked).
  const act = flipAutoAction(byOldHost);
  assert.deepEqual(act, { t: 'upgrade' });
  const up = red(byOldHost, act!, 0)!;
  assert.ok(hostIsCurrent(up));
  assert.deepEqual(up.board, byOldHost.board);
  // A state saved by an old page entirely (no rules field at all).
  const legacy = { ...after } as Partial<FlipRoom>;
  delete legacy.rules; delete legacy.charges; delete legacy.rulesMove; delete legacy.stale;
  const legacyRoom = legacy as FlipRoom;
  assert.equal(hostIsCurrent(legacyRoom), false);
  const up2 = red(legacyRoom, flipAutoAction(legacyRoom)!, 0)!;
  assert.ok(hostIsCurrent(up2));
  assert.deepEqual(roomCharges(up2), [0, FLIP_CHARGES, FLIP_CHARGES]);
  void owner;
}

assert.ok(flipsTotal > matches, `flips exercised: ${flipsTotal}`);
console.log(`flip-omok room checks: ok (${games} matches, ${flipsTotal} flips, ${timeouts} timeouts, ${restores} restores)`);

// Rules checks for 망각의 지뢰: `npx tsx scripts/mine-oblivion/check.ts [games=500]`
// 1) hand-computed cases (numbers, double cells, already-scored cells, mines and respawn, treasure order, the end);
// 2) random full matches (random burials, random legal moves) never reach an illegal state.
import assert from 'node:assert/strict';
import {
  MO_MOVE_LIMIT, type MineOblivion, moBreakdown, type MoSeat, buryMines, buryCells, canBury, idx, legalMoves, mineMap, moFrames, neighbours, moveTo, newMineOblivion,
  randomBurial, respawnAt, respawnOptions, startOf, validBurial,
} from '../../src/lib/mineOblivion';
import { moKnowledge } from '../../src/lib/mineOblivionAi';
import { MO_ITEMS, applyItem, itemBlock, itemsLeft, probeTargets, usedItems } from '../../src/lib/mineOblivionItems';
import { createMoRoom, reduceMoRoom } from '../../src/lib/mineOblivionRoom';
import { reduceMoSolo } from '../../src/lib/mineOblivionSolo';
import { playOne, rng } from './sim';

const at = (r: number, c: number) => idx(r, c);
let checks = 0;
const ok = (cond: unknown, msg: string) => { assert.ok(cond, msg); checks += 1; };
const eq = <T,>(a: T, b: T, msg: string) => { assert.deepEqual(a, b, msg); checks += 1; };

// ── Geometry ──
eq(buryCells().length, 121 - 9 - 9 - 3, '100 cells can hold a mine');
ok(!canBury(at(8, 2)) && canBury(at(7, 2)) && canBury(at(8, 3)), 'no-go zone is the 3×3 block at each start');
ok(!canBury(at(5, 5)) && !canBury(at(0, 0)) && !canBury(at(10, 10)), 'no mines on treasure');
eq(startOf(0), at(10, 0), 'seat 0 starts bottom-left'); eq(startOf(1), at(0, 10), 'seat 1 starts top-right');
ok(!validBurial([at(3, 3)]) && !validBurial(Array(15).fill(at(3, 3))), 'burial needs 15 distinct cells');

// ── A hand-built game ──
// Seat 0's mines: a column at c=3, rows 3..7 (5 mines) + 10 elsewhere; seat 1 shares (5,3) → a double cell.
const own0 = [at(3, 3), at(4, 3), at(5, 3), at(6, 3), at(7, 3), at(0, 4), at(0, 5), at(0, 6), at(1, 4), at(1, 5), at(1, 6), at(2, 4), at(2, 5), at(2, 6), at(3, 4)];
const own1 = [at(5, 3), at(7, 1), at(6, 1), at(9, 4), at(9, 5), at(9, 6), at(9, 7), at(10, 4), at(10, 5), at(10, 6), at(10, 7), at(8, 8), at(8, 9), at(8, 10), at(7, 10)];
ok(validBurial(own0) && validBurial(own1), 'test burials are legal');
let g: MineOblivion = newMineOblivion(0, 'check');
ok(moveTo(g, 0, at(9, 1)) === null, 'no moves before both have buried');
g = buryMines(g, 0, own0)!;
ok(g.phase === 'bury' && buryMines(g, 0, own1) === null, 'one burial per player');
g = buryMines(g, 1, own1)!;
eq(g.phase, 'walk', 'walk starts once both buried'); eq(g.minedCells, 29, 'public count: 29 distinct cells (one double)');
eq(mineMap(g)[at(5, 3)], 2, 'double cell holds two');
eq(legalMoves(g, 1), [], 'not your turn → no moves');
eq(legalMoves(g, 0).length, 3, 'corner start: three moves');
// 0: (10,0) → (9,1): neighbours (8,0)(8,1)(8,2)(9,0)(9,2)(10,0)(10,1)(10,2): no mines → 0
g = moveTo(g, 0, at(9, 1))!; eq(g.log.at(-1)!.number, 0, '(9,1) announces 0'); eq(g.score, [0, 0], 'score 0');
g = moveTo(g, 1, at(1, 9))!; eq(g.log.at(-1)!.number, 0, '(1,9) announces 0');
// 0: (9,1) → (8,2): neighbours include (7,1) [seat 1], (7,3) [seat 0] → 2
g = moveTo(g, 0, at(8, 2))!; eq(g.log.at(-1)!.number, 2, '(8,2) counts both players’ mines'); eq(g.score[0], 2, '+2');
g = moveTo(g, 1, at(2, 9))!;
// 0: (8,2) → (7,2): (6,1)(7,1)(6,3)(7,3) → 4 ... and (8,3)? not a mine → 4
g = moveTo(g, 0, at(7, 2))!; eq(g.log.at(-1)!.number, 4, '(7,2) = 4'); eq(g.score[0], 6, '6');
g = moveTo(g, 1, at(1, 9))!; eq(g.log.at(-1)!.kind, 'blank', 'already scored → blank'); eq(g.log.at(-1)!.number, null, 'nothing announced'); eq(g.score[1], 0, 'no points');
// 0: (7,2) → (6,2): (5,1)(6,1)(7,1)(5,3)x2(6,3)(7,3)(5,2)(7,2) → 1+1+2+1+1 = 6
g = moveTo(g, 0, at(6, 2))!; eq(g.log.at(-1)!.number, 6, 'a double cell counts 2'); eq(g.score[0], 12, '12');
g = moveTo(g, 1, at(2, 9))!;
// 0 steps on the double cell (5,3): −5, both mines removed, respawn pending
g = moveTo(g, 0, at(5, 3))!;
eq(g.log.at(-1)!.kind, 'mine', 'mine'); eq(g.score[0], 7, '−5'); eq(g.log.at(-1)!.removed, 2, 'both mines removed');
eq(g.respawn, 0, 'respawn pending'); eq(g.turn, 0, 'turn stays until respawn'); eq(g.minedCells, 28, 'one cell fewer');
eq(legalMoves(g, 0), [], 'no move while respawning');
eq(respawnOptions(g, 0).sort((a, b) => a - b), [at(9, 0), at(9, 1), at(10, 1)].sort((a, b) => a - b), 'three cells next to the start');
ok(respawnAt(g, 0, at(8, 2)) === null, 'respawn only next to the start');
g = respawnAt(g, 0, at(9, 1))!;
eq(g.pos[0], at(9, 1), 'back next to start'); eq(g.turn, 1, 'then the turn passes'); eq(g.score[0], 7, 'respawn scores nothing');
// Seat 1 can no longer be blocked by... check: cannot step onto the opponent.
ok(!legalMoves(g, 1).includes(g.pos[0]), 'never onto the opponent');
// The crater: (6,2) neighbours now count (5,3) as empty. Seat 1 walks; we check the number of (6,2)-like cell later via frames.
eq(mineMap(g)[at(5, 3)], 0, 'crater is empty');

// ── Treasure order and the end ──
{
  // A clean board: mines far from the paths. Walk seat 0 to (0,0) and the centre, seat 1 to (10,10).
  const quiet0 = [at(3, 6), at(3, 7), at(3, 8), at(4, 6), at(4, 7), at(4, 8), at(6, 6), at(6, 7), at(6, 8), at(7, 6), at(7, 7), at(7, 8), at(4, 9), at(6, 9), at(3, 9)];
  const quiet1 = [at(4, 0), at(5, 0), at(6, 0), at(4, 1), at(5, 1), at(6, 1), at(3, 0), at(3, 1), at(7, 0), at(6, 4), at(7, 4), at(8, 4), at(8, 5), at(8, 6), at(8, 7)];
  ok(validBurial(quiet0) && validBurial(quiet1), 'quiet burials legal');
  let h = buryMines(buryMines(newMineOblivion(0, 't'), 0, quiet0)!, 1, quiet1)!;
  const path0 = [at(9, 1), at(8, 2), at(7, 2), at(6, 2), at(5, 2), at(4, 2), at(3, 2), at(2, 2), at(1, 1), at(0, 0)];
  const path1 = [at(1, 9), at(2, 8), at(2, 7), at(3, 5), at(4, 5), at(5, 5)];
  // seat 1 walks (0,10)→(1,9)→(2,8)→(2,7)… but (2,7)→(3,5) is not adjacent: fix the walk
  path1.splice(3, 0, at(2, 6));
  for (let i = 0; i < Math.max(path0.length, path1.length + 4); i += 1) {
    if (h.phase === 'finished') break;
    const m0 = path0[i] ?? legalMoves(h, 0).find((c) => !h.scored.includes(c) && canBury(c) === false) ?? legalMoves(h, 0)[0];
    h = moveTo(h, 0, m0) ?? (() => { throw new Error(`seat 0 move ${i} illegal`); })();
    if (h.phase === 'finished') break;
    const m1 = path1[i] ?? legalMoves(h, 1)[0];
    h = moveTo(h, 1, m1) ?? (() => { throw new Error(`seat 1 move ${i} illegal`); })();
  }
  const centre = h.treasures.find((t) => t.cell === at(5, 5))!, corner = h.treasures.find((t) => t.cell === at(0, 0))!;
  eq(centre.by, 1, 'seat 1 found the centre'); eq(centre.value, 10, 'first treasure +10');
  eq(corner.by, 0, 'seat 0 found the corner'); eq(corner.value, 15, 'second treasure +15');
  const step = h.log.find((s) => s.to === at(5, 5))!;
  eq(step.gain, 10 + step.number!, 'a treasure cell also scores its number');
}

// ── Random full matches ──
const N = Number(process.argv[2] ?? 500);
const rand = rng(20261128);
const endings: Record<string, number> = {};
for (let game = 0; game < N; game += 1) {
  let h = newMineOblivion((game % 2) as MoSeat, `r${game}`);
  for (const s of [0, 1] as MoSeat[]) h = buryMines(h, s, randomBurial(rand))!;
  const total = mineMap(h).reduce((a, b) => a + b, 0);
  ok(total === 30, 'thirty mines');
  let guard = 0;
  while (h.phase !== 'finished') {
    if ((guard += 1) > 400) throw new Error('game did not end');
    if (h.respawn !== null) {
      const opts = respawnOptions(h, h.respawn);
      ok(opts.length >= 2, 'respawn always has a choice');
      h = respawnAt(h, h.respawn, opts[Math.floor(rand() * opts.length)])!;
      continue;
    }
    const s = h.turn;
    const moves = legalMoves(h, s);
    ok(moves.length >= 2, 'always at least two moves');
    ok(legalMoves(h, (1 - s) as MoSeat).length === 0, 'only the side to move can move');
    const before = h;
    const to = moves[Math.floor(rand() * moves.length)];
    const map = mineMap(before);
    h = moveTo(h, s, to)!;
    ok(h !== null, 'legal move applies');
    ok(h.pos[0] !== h.pos[1], 'pieces never share a cell');
    const st = h.log.at(-1)!;
    if (map[to] > 0) { ok(st.kind === 'mine' && st.gain === -5 && h.score[s] === before.score[s] - 5, 'mine: −5'); ok(mineMap(h)[to] === 0, 'mine removed'); }
    else if (before.scored.includes(to)) ok(st.kind === 'blank' || st.kind === 'treasure', 'scored cell: no number');
    else ok(st.number === neighbours()[to].reduce((a, n) => a + map[n], 0), 'number = live mines in the eight cells around');
    ok(h.treasures.filter((t) => t.by !== null).every((t, _, list) => [10, 15, 20].slice(0, list.length).includes(t.value)), 'treasure values in order');
    ok(h.minedCells === mineMap(h).filter((v) => v > 0).length, 'public count matches the board');
    const k = moKnowledge(h, s, 'hard');
    ok(!('removed' in (k.steps.at(-1) ?? {})), 'AI view never carries the secret removed count');
    ok(JSON.stringify(k).includes(JSON.stringify(h.buried[(1 - s) as MoSeat])) === false || h.buried[(1 - s) as MoSeat].length === 0, 'AI view never carries the opponent’s mines');
  }
  ok(h.ending === 'treasure' || h.ending === 'moves', 'ends by treasure or the move limit');
  if (h.ending === 'moves') ok(h.log.length >= MO_MOVE_LIMIT, 'move limit');
  ok(h.winner === null ? h.score[0] === h.score[1] : h.score[h.winner] > h.score[1 - h.winner], 'higher score wins, equal draws');
  const frames = moFrames(h);
  eq(frames.at(-1)!.score, h.score, 'replay rebuilds the final score');
  for (const seat of [0, 1] as MoSeat[]) {
    const b = moBreakdown(h, seat);
    eq(b.total, h.score[seat], 'breakdown adds up to the score');
    eq(b.treasure + b.minePoints + b.numbers, h.score[seat], 'treasure + mines + numbers = score');
    eq(b.minePoints, b.mines ? -5 * b.mines : 0, 'each mine costs 5');
  }
  eq(frames.at(-1)!.pos, h.pos, 'replay rebuilds the final position');
  endings[h.ending!] = (endings[h.ending!] ?? 0) + 1;
}

// ── Items (AI matches) ──
{
  let h: MineOblivion = buryMines(buryMines(newMineOblivion(0, 'items'), 0, own0)!, 1, own1)!;
  ok(itemBlock(h, 1, 'probe') === 'turn', 'items only on your own move');
  // Probe a cell next to the start: the number is what stepping there would score, and nothing moves.
  const cell = probeTargets(h, 0)[0];
  const p1 = applyItem(h, 0, 'probe', cell)!;
  eq(p1.items![0].number, neighbours()[cell].reduce((n, c) => n + mineMap(h)[c], 0), 'probe number = mines around the cell');
  eq([p1.pos, p1.turn, p1.log.length, p1.score], [h.pos, h.turn, h.log.length, h.score], 'probe uses no move');
  ok(applyItem(h, 0, 'probe', at(5, 5)) === null, 'probe only next to you');
  const p2 = applyItem(p1, 0, 'probe', cell)!;
  ok(itemsLeft(p2, 0, 'probe') === 0 && itemBlock(p2, 0, 'probe') === 'cap' && applyItem(p2, 0, 'probe', cell) === null, `probe cap ${MO_ITEMS.probe.cap}`);
  const r1 = applyItem(h, 0, 'recall')!;
  eq([r1.pos, r1.turn, r1.log.length], [h.pos, h.turn, h.log.length], 'recall uses no move');
  // Blast suit: walk seat 0 onto a mine with it armed.
  h = applyItem(h, 0, 'suit')!;
  ok(h.suit![0] && itemBlock(h, 0, 'suit') !== null, 'suit armed once');
  // Seat 0 at (10,0): (9,1) then (8,2) (no mines: inside the no-go zone), seat 1 moves around its corner.
  const walk = (x: MineOblivion, seat: MoSeat, to: number) => { const y = moveTo(x, seat, to); assert.ok(y, `move ${seat}→${to}`); return y!; };
  h = walk(h, 0, at(9, 1)); h = walk(h, 1, at(1, 9)); h = walk(h, 0, at(8, 2)); h = walk(h, 1, at(0, 10));
  ok(h.suit![0], 'suit still on before a mine');
  // (7,1) holds seat 1's mine.
  const before = h;
  h = walk(h, 0, at(7, 1));
  const st = h.log.at(-1)!;
  ok(st.kind === 'mine' && st.shielded && st.gain === 0, 'suit: mine goes off for 0');
  eq(h.score[0], before.score[0], 'suit: no −5');
  ok(h.respawn === null && h.pos[0] === at(7, 1) && h.turn === 1, 'suit: no walk back, turn passes');
  ok(h.craters.includes(at(7, 1)) && h.minedCells === before.minedCells - 1 && mineMap(h)[at(7, 1)] === 0, 'suit: crater and count as usual');
  ok(!h.suit![0], 'suit spent');
  const fr = moFrames(h);
  eq(fr.at(-1)!.pos, h.pos, 'replay keeps a shielded walker on the crater');
  ok(usedItems(h, 0) && !usedItems(h, 1), 'item game is marked for its user only');
  { const b = moBreakdown(h, 0); ok(b.shielded === 1 && b.mines === 0 && b.total === h.score[0], 'breakdown: a shielded mine costs nothing and adds up'); }
  // Rooms: the room reducer has no item action; the solo reducer refuses items outside the AI match.
  const solo = createMoRoom({ id: 'me', name: 'me', at: 0 }, { solo: true, level: 'hard' });
  const room = { ...createMoRoom({ id: 'me', name: 'me', at: 0 }), game: h, phase: 'playing' as const, walkAt: 0 };
  ok(reduceMoSolo(room, { t: 'item', item: 'recall' }, 0, true) === null, 'no items in a friend/open room');
  ok(reduceMoRoom(room, { t: 'item' } as never, 0, true) === null, 'room protocol has no item action');
  ok(reduceMoSolo(solo, { t: 'item', item: 'recall' }, 1, true) === null, 'the AI seat never uses items');
}
// ── Breakdown over AI games (treasure endings are common there), with items on one side ──
{
  const rand = rng(77);
  let treasures = 0;
  for (let i = 0; i < 40; i += 1) {
    const { g: h } = playOne(['normal', 'hard'], (i % 2) as MoSeat, rand, i % 3 === 0 ? 0 : null);
    for (const seat of [0, 1] as MoSeat[]) {
      const b = moBreakdown(h, seat);
      eq(b.total, h.score[seat], 'AI game: breakdown adds up');
      eq(b.treasures.map((x) => x.value), b.treasures.map((x) => [10, 15, 20][x.order - 1]), 'treasure values follow the order found');
      treasures += b.treasures.length;
    }
  }
  ok(treasures > 40, 'AI games found treasure to break down');
}
console.log(`ok: ${checks} checks, ${N} random games`, endings);

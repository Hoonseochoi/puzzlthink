// Rules checks for the 뒤집기 오목 variants: `npx tsx scripts/flip-omok/check.ts`
// Hand-built positions for charges, quiet placing, locks, one-line flips, the flip action, flip-made fives and the
// last-chance reply; then the `live` variant against the live engine on random games (they must agree move for move).
import assert from 'node:assert/strict';
import { play as livePlay, isForbidden as liveForbidden, type Cell } from '../../src/lib/flipOmok';
import { RULESETS, actionsAt, apply, legalActions, newState, postActions, type NState } from '../../src/lib/flipOmokNext';

const S = 15, at = (r: number, c: number) => r * S + c;
function setup(rulesId: string, stones: [number, number, Cell][], turn: 1 | 2 = 1): NState {
  const s = newState(RULESETS[rulesId]);
  for (const [r, c, v] of stones) s.board[at(r, c)] = v;
  return { ...s, turn };
}

// Charges: quiet by default, the flip costs one, none left = quiet only.
{
  const R = RULESETS.c3;
  const s = setup('c3', [[7, 5, 1], [7, 6, 2]]);
  const acts = actionsAt(R, s, at(7, 7));
  assert.equal(acts.length, 2);
  assert.deepEqual(acts[0].flips, []);
  assert.deepEqual(acts[1].flips, [at(7, 6)]);
  const res = apply(R, s, acts[1]);
  assert.equal(res.state.charges[1], 2);
  assert.equal(res.state.board[at(7, 6)], 3);
  const quiet = apply(R, s, acts[0]);
  assert.equal(quiet.state.board[at(7, 6)], 2);
  assert.equal(quiet.state.charges[1], 3);
  const empty = { ...s, charges: [0, 0, 3] as NState['charges'] };
  assert.equal(actionsAt(R, empty, at(7, 7)).length, 1);
}
// Locked: a stone flipped once can't be flipped back.
{
  const R = RULESETS.c3lock;
  const s = setup('c3lock', [[7, 5, 1], [7, 6, 2]]);
  const after = apply(R, s, actionsAt(R, s, at(7, 7))[1]).state; // red flips (7,6)
  after.board[at(7, 8)] = 2; // blue at both ends of the red run now
  const blue = { ...after, turn: 2 as const };
  after.board[at(7, 4)] = 0;
  const b2 = { ...blue, board: after.board.slice() };
  b2.board[at(7, 8)] = 2;
  const acts = actionsAt(R, b2, at(7, 4), 2);
  assert.ok(acts.every((a) => !a.flips.includes(at(7, 6))), 'a locked stone must not flip');
  // Without the lock the same run would flip.
  const open = { ...b2, locked: new Uint8Array(S * S) };
  assert.ok(actionsAt(RULESETS.c3, open, at(7, 4), 2).some((a) => a.flips.includes(at(7, 6))));
}
// One line: a stone that sandwiches two lines offers each line on its own.
{
  const R = RULESETS.line;
  const s = setup('line', [[7, 5, 1], [7, 6, 2], [5, 7, 1], [6, 7, 2]]);
  const acts = actionsAt(R, s, at(7, 7));
  assert.equal(acts.length, 3); // quiet, the row, the column
}
// The flip action: flips a sandwiched run without placing, spends a charge.
{
  const R = RULESETS.post;
  const s = setup('post', [[7, 5, 1], [7, 6, 2], [7, 7, 1]]);
  const posts = postActions(R, s);
  assert.equal(posts.length, 1);
  const res = apply(R, s, posts[0]);
  assert.equal(res.state.board[at(7, 6)], 3);
  assert.equal(res.state.charges[1], 2);
  assert.equal(res.state.placed[1], 0);
  assert.ok(actionsAt(R, s, at(8, 8)).every((a) => !a.flips.length), 'placing never flips under post');
}
// A five completed by the flip: void under the live rule, a win with flipFive.
{
  const stones: [number, number, Cell][] = [[7, 3, 1], [7, 4, 1], [7, 5, 1], [7, 6, 2], [7, 7, 0], [6, 6, 1], [8, 6, 0]];
  // Red at (8,6)? no: build a column sandwich so (7,6) flips by placing at (8,6) with red at (6,6), then row 7 reads R R R r .
  const s = setup('c3lock', stones);
  s.board[at(7, 7)] = 1; // R R R B R in row 7, red above the blue stone
  const flip = actionsAt(RULESETS.c3lock, s, at(8, 6)).find((a) => a.flips.length)!;
  assert.deepEqual(flip.flips, [at(7, 6)]);
  assert.equal(apply(RULESETS.c3lock, s, flip).win, null, 'live rule: a five that needs this move\'s flip is void');
  const s2 = { ...s };
  assert.ok(apply(RULESETS.c3lockfive, s2, flip).win, 'flipFive: it wins');
}
// Last chance: a five that the opponent can break with a flip waits for their reply; if they break it, play goes on.
{
  const R = RULESETS.c3last;
  // Red has R R R R . on row 7; blue (to break) has a stone above (6,5) and red at (7,5) sits between (6,5) and (8,5).
  const s = setup('c3last', [[7, 1, 1], [7, 2, 1], [7, 3, 1], [7, 4, 1], [6, 3, 2], [9, 9, 2]]);
  const five = actionsAt(R, s, at(7, 5))[0];
  const res = apply(R, s, five);
  assert.equal(res.win, null);
  assert.ok(res.state.threat, 'the five waits for the last chance');
  const replies = legalActions(R, res.state);
  assert.ok(replies.length && replies.every((a) => a.flips.length), 'only breaking flips are offered');
  const saved = apply(R, res.state, replies[0]);
  assert.equal(saved.win, null);
  assert.ok(saved.brokeThreat);
}
// `live` agrees with the live engine, on random games.
{
  let rnd = 7;
  const rand = () => { rnd = (rnd * 1103515245 + 12345) & 0x7fffffff; return rnd / 0x7fffffff; };
  for (let g = 0; g < 60; g++) {
    let s = newState(RULESETS.live);
    for (let k = 0; k < 60; k++) {
      const legal = legalActions(RULESETS.live, s);
      const a = legal[Math.floor(rand() * legal.length)];
      assert.equal(liveForbidden(s.board, a.at, s.turn), false);
      const live = livePlay(s.board, a.at, s.turn);
      const res = apply(RULESETS.live, s, a);
      assert.deepEqual(res.state.board, live.board);
      assert.equal(!!res.win, !!live.win);
      if (res.win) break;
      s = res.state;
    }
  }
}
console.log('flip-omok variant checks: ok');

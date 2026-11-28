// COCO tactics checks for 뒤집기 오목: `npx tsx scripts/flip-omok/ai-test.ts [trials=12] [attackerGames=40]`
// 1) Hand-built positions, each tried `trials` times at both levels (the AI has random noise): take the win, block a
//    four, answer an open three, never make six, flip to break an open four no placement can stop, never flip to extend
//    a dead line, and the owner's lost game (11/28) a move or two before the end.
// 2) A naive attacker that only builds one straight line toward five (no flips) plays both levels, moving first and
//    second: COCO must stop it (or win) essentially always.
// Also prints the slowest move seen (the worst case a phone would wait, on this machine).
import assert from 'node:assert/strict';
import { SIZE, chooseMove, emptyBoard, isForbidden, isFull, play, type Board, type Cell, type Charges, type FlipDifficulty, type FlipMove, type Player } from '../../src/lib/flipOmok';

const trials = Number(process.argv[2] ?? 12);
const attackerGames = Number(process.argv[3] ?? 40);
const at = (r: number, c: number) => r * SIZE + c;
const LEVELS: FlipDifficulty[] = ['normal', 'hard'];
let slowest = 0, failures = 0;

/** A board from row strings ('.' empty, R/B placed, r/b flipped = locked), placed with its top-left at (r0, c0). */
function boardOf(rows: string[], r0 = 0, c0 = 0): Board {
  const b = emptyBoard();
  rows.forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== '.' && ch !== ' ') b[at(r0 + r, c0 + c)] = ({ R: 1, B: 2, r: 3, b: 4 } as Record<string, Cell>)[ch]; }));
  return b;
}
function timed(board: Board, me: Player, charges: Charges, level: FlipDifficulty): FlipMove {
  const t = Date.now();
  const mv = chooseMove(board, me, charges, level);
  slowest = Math.max(slowest, Date.now() - t);
  return mv;
}
/** Exact five points of p (quiet placements that win). */
const winsAt = (board: Board, p: Player) => [...Array(SIZE * SIZE).keys()].filter((i) => !board[i] && play(board, i, p, false).win);
/** Whether p (to move) can leave two five points with one quiet move: an open three / double threat. */
function hasDouble(board: Board, p: Player): boolean {
  for (let i = 0; i < SIZE * SIZE; i++) {
    if (board[i] || isForbidden(board, i, p)) continue;
    const res = play(board, i, p, false);
    if (res.win || winsAt(res.board, p).length >= 2) return true;
  }
  return false;
}

function scenario(name: string, board: Board, me: Player, charges: Charges, ok: (mv: FlipMove, after: Board) => boolean) {
  for (const level of LEVELS) {
    let bad = 0, example = '';
    for (let k = 0; k < trials; k++) {
      const mv = timed(board, me, charges, level);
      const after = play(board, mv.at, me, mv.flip).board;
      if (!ok(mv, after)) { bad++; example = `${mv.at}${mv.flip ? '+flip' : ''}`; }
    }
    const line = `${bad ? 'FAIL' : 'PASS'} ${name} [${level}] ${trials - bad}/${trials}${bad ? ` (e.g. ${example})` : ''}`;
    console.log(line);
    if (bad) failures++;
  }
}

// 1. Take the win (red to move: four with an open end).
scenario('takes the win', boardOf(['.RRRR..', '.BBB...', '..B....'], 7, 3), 1, [0, 3, 3], (_, b) => isWon(b, 1));
// 2. Block a four (blue four closed by red on the left; red to move, blue would make five at the right end).
scenario('blocks a four', boardOf(['RBBBB..', '.R.....', '..R....'], 7, 3), 1, [0, 3, 3], (_, b) => winsAt(b, 2).length === 0);
// 3. Answer an open three (blue . B B B . with room).
scenario('answers an open three', boardOf(['..BBB...', '...R....', '..R.....'], 7, 3), 1, [0, 3, 3], (_, b) => !hasDouble(b, 2));
// 4. Never make six: red R R R R . R with a blue stone left; (7,8) would be six. Blue has nothing.
{
  const b = boardOf(['BRRRR.R', '.......', '..B....'], 7, 3);
  scenario('never makes six', b, 1, [0, 3, 3], (mv) => mv.at !== at(7, 8));
}
// 5. An open four no placement can stop: a flip on a stone of the four (red above and below one of them) breaks it.
{
  const b = boardOf(['..R....', '.BBBB..', '.......'], 6, 4); // blue (7,5)-(7,8), open both ends; red at (6,6)
  scenario('flips to break an open four', b, 1, [0, 1, 3], (mv, after) => mv.flip && winsAt(after, 2).length === 0);
}
// 6. Never flip to extend a dead line: red R R B R R R in a row with red below the B; flipping it makes six (dead).
{
  const b = boardOf(['.......', 'RRBRRR.', '..R....', '.......', '...B.B.', '....B..'], 3, 2);
  scenario('does not flip into a dead line', b, 1, [0, 3, 3], (mv) => !(mv.flip && mv.at === at(3, 4)));
}
// 7. The owner's game (11/28): COCO (blue) built a useless long line on one row, flipping red stones inside it, while
//    red made an open three and then a four on the row above. Blue to move, 1 flip left; red has all three.
{
  const longLine = ['BBBbbbBBB.B'];
  const openThree = boardOf(['...........', '....RRR....', ...longLine, '...........'], 5, 2);
  // fill in a few red stones around so the position is plausible (red 6 stones in all)
  openThree[at(8, 6)] = 1; openThree[at(9, 9)] = 1; openThree[at(4, 8)] = 1;
  scenario('owner game: answers the open three', openThree, 2, [0, 3, 1], (mv, after) => !hasDouble(after, 1) && !mv.flip);
  const four = openThree.slice();
  four[at(6, 5)] = 2; four[at(6, 9)] = 1; // blue took the left end late; red made the four R R R R at (6,6)-(6,9)
  scenario('owner game: blocks the four', four, 2, [0, 3, 1], (_, after) => winsAt(after, 1).length === 0);
}
function isWon(b: Board, p: Player) {
  for (let i = 0; i < SIZE * SIZE; i++) if ((b[i] === p || b[i] === p + 2)) {
    for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
      let n = 1, r = Math.floor(i / SIZE), c = i % SIZE;
      while (++n <= 6) { r += dr; c += dc; if (r < 0 || r >= SIZE || c < 0 || c >= SIZE || !(b[r * SIZE + c] === p || b[r * SIZE + c] === p + 2)) break; }
      if (n - 1 === 5) return true;
    }
  }
  return false;
}

// 2. The naive attacker: keeps extending its longest open straight line toward five, never flips.
function attackerMove(board: Board, p: Player): number {
  let best = -1, bestLen = -1;
  for (let i = 0; i < SIZE * SIZE; i++) {
    if (board[i] || isForbidden(board, i, p)) continue;
    const r0 = Math.floor(i / SIZE), c0 = i % SIZE;
    for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
      let n = 1;
      for (const d of [1, -1]) for (let k = 1; k < 5; k++) {
        const r = r0 + dr * k * d, c = c0 + dc * k * d;
        if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) break;
        const v = board[r * SIZE + c];
        if (v === p || v === p + 2) n++; else break;
      }
      if (n <= 5 && n > bestLen) { bestLen = n; best = i; }
    }
  }
  if (bestLen <= 1) { const free = [...Array(SIZE * SIZE).keys()].filter((i) => !board[i] && Math.abs(Math.floor(i / SIZE) - 7) <= 3 && Math.abs((i % SIZE) - 7) <= 3); return free[Math.floor(Math.random() * free.length)]; }
  return best;
}
for (const level of LEVELS) for (const attackerFirst of [true, false]) {
  let attackerWins = 0, cocoWins = 0, draws = 0, totalPlies = 0;
  for (let g = 0; g < attackerGames; g++) {
    let board = emptyBoard(), turn: Player = 1;
    const charges: Charges = [0, 3, 3];
    const atk: Player = attackerFirst ? 1 : 2, coco: Player = attackerFirst ? 2 : 1;
    let winner: Player | 0 = 0, plies = 0;
    for (; plies < 225; plies++) {
      const mv = turn === atk ? { at: attackerMove(board, atk), flip: false } : timed(board, coco, charges, level);
      const res = play(board, mv.at, turn, mv.flip);
      if (mv.flip) charges[turn]--;
      board = res.board;
      if (res.win) { winner = turn; break; }
      if (isFull(board)) break;
      turn = turn === 1 ? 2 : 1;
    }
    totalPlies += plies + 1;
    if (winner === atk) attackerWins++; else if (winner === coco) cocoWins++; else draws++;
  }
  const line = `${attackerWins === 0 ? 'PASS' : 'FAIL'} naive attacker vs ${level} (attacker ${attackerFirst ? 'first' : 'second'}): COCO wins ${cocoWins}/${attackerGames}, attacker ${attackerWins}, draws ${draws}, avg ${(totalPlies / attackerGames).toFixed(1)} plies`;
  console.log(line);
  if (attackerWins) failures++;
}
console.log(`slowest COCO move: ${slowest} ms`);
assert.equal(failures, 0, `${failures} check(s) failed`);
console.log('flip-omok AI checks: ok');

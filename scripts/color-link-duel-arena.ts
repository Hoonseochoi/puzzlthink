// AI vs AI rounds for 컬러 링크: `npx tsx scripts/color-link-duel-arena.ts [rounds] [thinkMs]`
// Reports how often the first placer wins a round, how long rounds run and the slowest AI move.
import { emptyBoard, legalPlacement, place, solve, stonesToPlace, checkProof, letterOf, type CldBoard } from '../src/lib/colorLinkDuel';
import { aiPlace, aiProof, aiShouldDeclare } from '../src/lib/colorLinkDuelAi';

const rounds = Number(process.argv[2] ?? 10), think = Number(process.argv[3] ?? 1500);
let firstWins = 0, slowest = 0, totalTurns = 0, declaredRight = 0, declaredWrong = 0, unsolvedPlaced = 0;
const show = (b: CldBoard) => Array.from({ length: 7 }, (_, r) => b.slice(r * 7, r * 7 + 7).map((v) => (v ? letterOf(v) : '.')).join(' ')).join('\n');
for (let r = 0; r < rounds; r++) {
  let board = emptyBoard();
  let turn = 0, opening = true, winner = -1, turns = 0;
  for (;;) {
    if (!opening) {
      const t0 = Date.now();
      const declare = aiShouldDeclare(board);
      slowest = Math.max(slowest, Date.now() - t0);
      if (declare) {
        const proof = aiProof(board);
        if (proof && checkProof(board, proof).ok) { winner = 1 - turn; declaredWrong++; } else { winner = turn; declaredRight++; }
        break;
      }
    }
    if (!stonesToPlace(board, opening)) { winner = 1 - turn; break; }
    const t0 = Date.now();
    const stones = aiPlace(board, opening, r * 1000 + turns, Date.now() + think);
    slowest = Math.max(slowest, Date.now() - t0);
    if (!legalPlacement(board, stones, opening)) throw new Error('illegal ' + JSON.stringify(stones));
    board = place(board, stones);
    if (solve(board, { cap: 4_000_000 }).status !== 'ok') unsolvedPlaced++;
    opening = false; turn = 1 - turn; turns++;
  }
  totalTurns += turns;
  if (winner === 0) firstWins++;
  if (r < 2) console.log(`round ${r}: winner ${winner === 0 ? 'first' : 'second'} after ${turns} placements\n${show(board)}\n`);
}
console.log({ rounds, firstWins, avgPlacements: totalTurns / rounds, slowestMs: slowest, declaredRight, declaredWrong, unsolvedPlaced });

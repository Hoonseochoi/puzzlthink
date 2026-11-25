// Self-play on every 컬러 링크 board: `npx tsx scripts/color-link-duel-boards.ts [games] [thinkMs] [ids,...]`
// Prints per board: cells, corridor share, first-player wins, placements per game, how games end (a correct
// 불가능 call vs. the stones running out), the slowest AI move, and how hard positions are to judge
// (solver nodes on the positions met). Used to set each board's difficulty.
import { CLD_CELLS, CLD_WALL, cldNeighbors, legalPlacement, place, solve, stonesToPlace } from '../src/lib/colorLinkDuel';
import { CLD_LAYOUTS, layoutBoard, layoutCells } from '../src/lib/colorLinkDuelBoards';
import { aiPlace, aiProof, aiShouldDeclare } from '../src/lib/colorLinkDuelAi';
import { checkProof } from '../src/lib/colorLinkDuel';

const games = Number(process.argv[2] ?? 4), think = Number(process.argv[3] ?? 400);
const only = process.argv[4]?.split(',');
for (const layout of CLD_LAYOUTS.filter((l) => !only || only.includes(l.id))) {
  const empty = layoutBoard(layout.id);
  let corridor = 0;
  for (let i = 0; i < CLD_CELLS; i++) if (empty[i] === 0 && cldNeighbors[i].filter((j) => empty[j] === 0).length <= 2) corridor++;
  let firstWins = 0, placements = 0, calls = 0, exhausted = 0, slowest = 0, nodes = 0, judged = 0, stuckPlaced = 0;
  for (let g = 0; g < games; g++) {
    let board = empty.slice(), turn = 0, opening = true, winner = -1, turns = 0;
    for (;;) {
      if (!opening) {
        const t0 = Date.now();
        const declare = aiShouldDeclare(board);
        slowest = Math.max(slowest, Date.now() - t0);
        if (declare) {
          const proof = aiProof(board);
          winner = proof && checkProof(board, proof).ok ? 1 - turn : turn;
          calls++;
          break;
        }
      }
      if (!stonesToPlace(board, opening)) { winner = 1 - turn; exhausted++; break; }
      const t0 = Date.now();
      const stones = aiPlace(board, opening, g * 1000 + turns, Date.now() + think);
      slowest = Math.max(slowest, Date.now() - t0);
      if (!legalPlacement(board, stones, opening)) throw new Error(`${layout.id}: illegal ${JSON.stringify(stones)}`);
      board = place(board, stones);
      const res = solve(board, { cap: 4_000_000 });
      nodes += res.nodes; judged++;
      if (res.status !== 'ok') stuckPlaced++;
      opening = false; turn = 1 - turn; turns++;
    }
    placements += turns;
    if (winner === 0) firstWins++;
  }
  console.log(JSON.stringify({
    id: layout.id, cells: layoutCells(layout), corridorPct: Math.round((corridor / layoutCells(layout)) * 100),
    firstWins: `${firstWins}/${games}`, placements: +(placements / games).toFixed(1), calls, exhausted, stuckPlaced,
    slowestMs: slowest, avgNodes: Math.round(nodes / Math.max(1, judged)),
  }));
}
void CLD_WALL;

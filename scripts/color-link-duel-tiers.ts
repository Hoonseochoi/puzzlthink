// How hard each 컬러 링크 board is for a person: a "shallow" player (never places into a board that cannot be
// joined, calls 불가능 correctly, but plans nothing) against the real AI, half the games first, half second.
// Its win rate per board is the difficulty reading: `npx tsx scripts/color-link-duel-tiers.ts [games] [thinkMs] [ids]`
import { checkProof, legalPlacement, place, solve, stonesToPlace, type CldBoard } from '../src/lib/colorLinkDuel';
import { CLD_LAYOUTS, layoutBoard } from '../src/lib/colorLinkDuelBoards';
import { aiPlace, aiProof, aiShouldDeclare } from '../src/lib/colorLinkDuelAi';
import { rng } from '../src/lib/colorlink';

const games = Number(process.argv[2] ?? 8), think = Number(process.argv[3] ?? 400);
const only = process.argv[4]?.split(',');

/** A random placement the solver can still join (or any, when none can). */
function shallow(board: CldBoard, opening: boolean, rand: () => number): [number, number][] {
  const need = stonesToPlace(board, opening);
  const empty: number[] = []; for (let i = 0; i < board.length; i++) if (board[i] === 0) empty.push(i);
  const lone: number[] = [], fresh: number[] = [];
  for (let k = 1; k <= 14; k++) { const n = board.filter((v) => v === k).length; if (n === 1) lone.push(k); else if (n === 0) fresh.push(k); }
  let fallback: [number, number][] | null = null;
  for (let tries = 0; tries < 160; tries++) {
    const colors: number[] = [];
    const pool = [...lone, ...(fresh.length ? [fresh[0]] : [])];
    while (colors.length < need) {
      const opts = pool.filter((k) => !colors.includes(k));
      const k = opts.length ? opts[Math.floor(rand() * opts.length)] : fresh.find((f) => !colors.includes(f))!;
      colors.push(k === fresh[0] && colors.includes(fresh[0]) ? fresh[1] : k);
      if (k === fresh[0] && !pool.includes(fresh[1] ?? -1) && fresh[1]) pool.push(fresh[1]);
    }
    const cells = [...empty].sort(() => rand() - 0.5).slice(0, need);
    const stones = cells.map((c, i) => [c, colors[i]] as [number, number]);
    if (!legalPlacement(board, stones, opening)) continue;
    fallback ??= stones;
    if (opening || solve(place(board, stones), { cap: 40_000 }).status === 'ok') return stones;
  }
  return fallback!;
}

for (const layout of CLD_LAYOUTS.filter((l) => !only || only.includes(l.id))) {
  let wins = 0, placements = 0;
  for (let g = 0; g < games; g++) {
    const rand = rng(g * 7919 + 13);
    const humanFirst = g % 2 === 0;
    let board = layoutBoard(layout.id), turn = 0, opening = true, winner = -1, turns = 0;
    for (;;) {
      const human = (turn === 0) === humanFirst;
      if (!opening && aiShouldDeclare(board)) {
        // Both sides call correctly; the caller wins unless the placer can prove it (it cannot: the solver proved none).
        const proof = aiProof(board);
        winner = proof && checkProof(board, proof).ok ? 1 - turn : turn;
        break;
      }
      if (!stonesToPlace(board, opening)) { winner = 1 - turn; break; }
      const stones = human ? shallow(board, opening, rand) : aiPlace(board, opening, g * 1000 + turns, Date.now() + think);
      board = place(board, stones);
      opening = false; turn = 1 - turn; turns++;
    }
    placements += turns;
    if ((winner === 0) === humanFirst) wins++;
  }
  console.log(JSON.stringify({ id: layout.id, shallowWins: `${wins}/${games}`, pct: Math.round((wins / games) * 100), placements: +(placements / games).toFixed(1) }));
}

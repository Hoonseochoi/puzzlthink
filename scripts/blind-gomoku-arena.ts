// AI-vs-AI games for Blind Gomoku: the hell engine against a lower level, colours swapped every game.
// Usage: node scripts/blind-gomoku-arena.ts games=240 ms=300 opp=hard threads=8
//        opp: easy | normal | hard (the memory-limited levels) or full (the same heuristic remembering every move)
//        ms: the hell engine's time per move (the site gives it 1500 on desktop, 1000 on phones)
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { cpus } from 'node:os';
import { chooseAiMove, findWinningLine, type GomokuDifficulty, type GomokuMove } from '../src/lib/blindGomoku.ts';
import { chooseHellMove } from '../src/lib/blindGomokuHell.ts';

type Job = { game: number; ms: number; opp: string };
type Outcome = { game: number; hellBlack: boolean; winner: 'hell' | 'opp' | 'draw'; moves: number; depth: number; hellMoves: number; slowest: number };

function play({ game, ms, opp }: Job): Outcome {
  const hellBlack = game % 2 === 0;
  const moves: GomokuMove[] = [];
  let depthSum = 0;
  let hellMoves = 0;
  let slowest = 0;
  while (moves.length < 225) {
    const black = moves.length % 2 === 0;
    const owner = black ? 'black' : 'white';
    let point: { row: number; col: number };
    if (black === hellBlack) {
      const r = chooseHellMove(moves, ms);
      point = r;
      if (r.kind === 'search') { depthSum += r.depth; hellMoves += 1; }
      slowest = Math.max(slowest, r.ms);
    } else {
      // chooseAiMove always plays white; for a black turn hand it the board with the owners swapped.
      const view = black ? moves.map((m) => ({ ...m, owner: m.owner === 'black' ? 'white' as const : 'black' as const })) : moves;
      const level = (opp === 'full' ? 'hell' : opp) as GomokuDifficulty; // 'hell' in chooseAiMove = full memory heuristic
      point = view.length === 0 ? { row: 7, col: 7 } : chooseAiMove(view, level);
    }
    const move: GomokuMove = { row: point.row, col: point.col, owner, color: 'red', turn: moves.length + 1 };
    if (moves.some((m) => m.row === move.row && m.col === move.col)) throw new Error(`occupied ${move.row},${move.col} in game ${game}`);
    moves.push(move);
    if (findWinningLine(moves, move)) {
      const winner = black === hellBlack ? 'hell' : 'opp';
      return { game, hellBlack, winner, moves: moves.length, depth: hellMoves ? depthSum / hellMoves : 0, hellMoves, slowest };
    }
  }
  return { game, hellBlack, winner: 'draw', moves: 225, depth: hellMoves ? depthSum / hellMoves : 0, hellMoves, slowest };
}

if (!isMainThread) {
  for (const job of workerData as Job[]) parentPort!.postMessage(play(job));
} else {
  const args = Object.fromEntries(process.argv.slice(2).map((a) => a.split('=')));
  const games = Number(args.games ?? 240);
  const ms = Number(args.ms ?? 300);
  const opp = String(args.opp ?? 'hard');
  const threads = Math.max(1, Math.min(Number(args.threads ?? cpus().length - 2), games));
  const jobs: Job[][] = Array.from({ length: threads }, () => []);
  for (let g = 0; g < games; g += 1) jobs[g % threads].push({ game: g, ms, opp });

  const results: Outcome[] = [];
  const started = Date.now();
  await Promise.all(jobs.map((list) => new Promise<void>((resolve, reject) => {
    const w = new Worker(new URL(import.meta.url), { workerData: list });
    w.on('message', (o: Outcome) => {
      results.push(o);
      if (results.length % 20 === 0) console.error(`${results.length}/${games} games, ${Math.round((Date.now() - started) / 1000)}s`);
    });
    w.on('error', reject);
    w.on('exit', () => resolve());
  })));

  const tally = (list: Outcome[]) => {
    const win = list.filter((o) => o.winner === 'hell').length;
    const loss = list.filter((o) => o.winner === 'opp').length;
    return `${win}W ${loss}L ${list.length - win - loss}D / ${list.length} = ${(100 * win / Math.max(1, list.length)).toFixed(1)}%`;
  };
  const asBlack = results.filter((o) => o.hellBlack);
  const asWhite = results.filter((o) => !o.hellBlack);
  const avg = (f: (o: Outcome) => number) => (results.reduce((s, o) => s + f(o), 0) / Math.max(1, results.length));
  console.log(`hell (${ms} ms/move) vs ${opp}`);
  console.log(`  all      ${tally(results)}`);
  console.log(`  as black ${tally(asBlack)}`);
  console.log(`  as white ${tally(asWhite)}`);
  console.log(`  avg game length ${avg((o) => o.moves).toFixed(1)} moves, avg search depth ${avg((o) => o.depth).toFixed(1)}, slowest move ${Math.max(...results.map((o) => o.slowest))} ms`);
  const lost = results.filter((o) => o.winner !== 'hell').map((o) => o.game);
  if (lost.length) console.log(`  not won: games ${lost.join(', ')}`);
}

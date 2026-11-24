// AI-vs-AI strength check for the '매우 어려움' (hell) engines of 십이장기 and 러시아장기.
// Plays hell against hard, swapping who moves first every game, across worker processes.
// Usage: node scripts/hell-janggi-selfplay.mjs game=janggi|russian games=200 budget=1500 procs=8
//   budget = hell's time per move in ms (the site uses 1500 on desktop, 1000 on phones).
import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as J from '../src/lib/janggi.ts';
import * as JH from '../src/lib/janggiHell.ts';
import * as R from '../src/lib/russianJanggi.ts';
import * as RH from '../src/lib/russianJanggiHell.ts';

const arg = (k, d) => process.argv.find((a) => a.startsWith(`${k}=`))?.slice(k.length + 1) ?? d;
const game = arg('game', 'janggi');
const total = Number(arg('games', '200'));
const budget = Number(arg('budget', '1500'));
const procs = Number(arg('procs', '8'));
const shard = arg('shard', '');

/** @typedef {{ hellFirst: boolean, winner: 'hell' | 'hard' | 'draw', reason: string, plies: number, depth: number }} Result */

function playJanggi(hellSide, first) {
  let s = J.initialState(first);
  let depthSum = 0, depthN = 0;
  while (s.winner === null && !s.reason) {
    let a;
    if (s.turn === hellSide) {
      const r = JH.chooseHellAction(s, J.playableActions(s), J.replayStates(s), { budgetMs: budget });
      a = r?.action ?? null;
      if (r) { depthSum += r.depth; depthN++; }
    } else a = J.chooseAiAction(s, 'hard');
    if (!a) { s = J.finish(s, s.turn ^ 1, 'resign'); break; }
    s = J.playAction(s, a);
  }
  return {
    hellFirst: first === hellSide, plies: s.ply, reason: s.reason ?? '', depth: depthN ? depthSum / depthN : 0,
    winner: s.winner === null ? 'draw' : s.winner === hellSide ? 'hell' : 'hard',
  };
}

function playRussian(hellSide, first) {
  let s = R.initialState(first);
  let depthSum = 0, depthN = 0;
  while (!R.isOver(s)) {
    let a;
    if (s.turn === hellSide) {
      const r = RH.chooseHellAction(s, { budgetMs: budget, history: R.replayStates(s) });
      a = r.action;
      depthSum += r.depth; depthN++;
    } else a = R.chooseAiAction(s, 'hard');
    s = R.applyAction(s, a);
  }
  return {
    hellFirst: first === hellSide, plies: s.ply, reason: s.reason ?? '', depth: depthN ? depthSum / depthN : 0,
    winner: s.winner === null ? 'draw' : s.winner === hellSide ? 'hell' : 'hard',
  };
}

if (shard) {
  const [i, n] = shard.split('/').map(Number);
  const out = [];
  for (let g = i; g < total; g += n) {
    const hellSide = g % 2; // alternate colour and who moves first
    const first = Math.floor(g / 2) % 2;
    out.push(game === 'janggi' ? playJanggi(hellSide, first) : playRussian(hellSide, first));
  }
  process.send(out);
} else {
  const started = Date.now();
  const self = fileURLToPath(import.meta.url);
  const parts = await Promise.all(Array.from({ length: procs }, (_, i) => new Promise((resolve, reject) => {
    const child = fork(self, [...process.argv.slice(2), `shard=${i}/${procs}`]);
    child.on('message', (m) => resolve(m));
    child.on('error', reject);
  })));
  const all = parts.flat();
  const line = (label, list) => {
    const w = list.filter((r) => r.winner === 'hell').length, d = list.filter((r) => r.winner === 'draw').length;
    const l = list.length - w - d;
    console.log(`${label.padEnd(14)} games ${String(list.length).padStart(4)}  hell ${w}  draw ${d}  hard ${l}  → hell win ${(100 * w / list.length).toFixed(1)}%`);
  };
  console.log(`${game}: hell (${budget} ms/move) vs hard, ${all.length} games, ${((Date.now() - started) / 1000).toFixed(0)} s`);
  line('all', all);
  line('hell first', all.filter((r) => r.hellFirst));
  line('hard first', all.filter((r) => !r.hellFirst));
  const avg = (f) => (all.reduce((a, r) => a + f(r), 0) / all.length).toFixed(1);
  console.log(`avg plies ${avg((r) => r.plies)}, avg hell depth ${avg((r) => r.depth)}`);
  const reasons = {};
  for (const r of all) reasons[`${r.winner}:${r.reason}`] = (reasons[`${r.winner}:${r.reason}`] ?? 0) + 1;
  console.log('reasons', JSON.stringify(reasons));
}

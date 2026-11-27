// AI vs AI for 망각의 지뢰: `npx tsx scripts/mine-oblivion/sim.ts [games=300] [a=hard] [b=normal] [seed=20261128]`
// NORMAL='{"tau":0.2}' overrides the normal level's knobs for tuning. Seats alternate who goes first and which level sits where. Reports a's win rate against b (draws count half),
// average moves, how games end, explosions per game (own mine vs opponent's), and treasure split.
import { type MineOblivion, type MoSeat, buryMines, moveTo, newMineOblivion, respawnAt } from '../../src/lib/mineOblivion';
import { NORMAL, type MoLevel, chooseMoBurial, chooseMoMove, chooseMoRespawn, rollMoMind } from '../../src/lib/mineOblivionAi';

export function rng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export function playOne(levels: [MoLevel, MoLevel], first: MoSeat, rand: () => number) {
  let g: MineOblivion = newMineOblivion(first, 'sim');
  const minds = [rollMoMind(rand), rollMoMind(rand)];
  for (const s of [0, 1] as MoSeat[]) g = buryMines(g, s, chooseMoBurial(s, levels[s], rand))!;
  const ownBlasts = [0, 0], oppBlasts = [0, 0];
  while (g.phase !== 'finished') {
    if (g.respawn !== null) { const s = g.respawn; g = respawnAt(g, s, chooseMoRespawn(g, s, levels[s], minds[s], rand))!; continue; }
    const s = g.turn;
    const to = chooseMoMove(g, s, levels[s], minds[s], rand);
    const own = g.buried[s].includes(to) && !g.craters.includes(to);
    const before = g.craters.length;
    const next = moveTo(g, s, to);
    if (!next) throw new Error(`illegal AI move ${to} by ${s}`);
    if (next.craters.length > before) { if (own) ownBlasts[s] += 1; else oppBlasts[s] += 1; }
    g = next;
  }
  return { g, ownBlasts, oppBlasts };
}

if (process.argv[1]?.endsWith('sim.ts')) {
  const [nArg = '300', a = 'hard', b = 'normal', seedArg = '20261128'] = process.argv.slice(2);
  const N = Number(nArg); const rand = rng(Number(seedArg));
  if (process.env.NORMAL) Object.assign(NORMAL, JSON.parse(process.env.NORMAL));
  let aPts = 0, draws = 0, moves = 0; const endings: Record<string, number> = {};
  const blasts = { aOwn: 0, aOpp: 0, bOwn: 0, bOpp: 0 }; const tre = { a: 0, b: 0 }; const scoreA: number[] = [], scoreB: number[] = [];
  const t0 = Date.now();
  for (let i = 0; i < N; i += 1) {
    const aSeat: MoSeat = (i % 2) as MoSeat; const first: MoSeat = (Math.floor(i / 2) % 2) as MoSeat;
    const levels = (aSeat === 0 ? [a, b] : [b, a]) as [MoLevel, MoLevel];
    const { g, ownBlasts, oppBlasts } = playOne(levels, first, rand);
    const bSeat = (1 - aSeat) as MoSeat;
    if (g.winner === aSeat) aPts += 1; else if (g.winner === null) { aPts += 0.5; draws += 1; }
    moves += g.log.length; endings[g.ending!] = (endings[g.ending!] ?? 0) + 1;
    blasts.aOwn += ownBlasts[aSeat]; blasts.aOpp += oppBlasts[aSeat]; blasts.bOwn += ownBlasts[bSeat]; blasts.bOpp += oppBlasts[bSeat];
    tre.a += g.treasures.filter((t) => t.by === aSeat).length; tre.b += g.treasures.filter((t) => t.by === bSeat).length;
    scoreA.push(g.score[aSeat]); scoreB.push(g.score[bSeat]);
  }
  const avg = (l: number[]) => (l.reduce((x, y) => x + y, 0) / l.length).toFixed(1);
  console.log(`${N} games, ${a} (A) vs ${b} (B), seed ${seedArg}, ${((Date.now() - t0) / N).toFixed(0)} ms/game`);
  console.log(`A win rate ${(100 * aPts / N).toFixed(1)}% (draws ${draws})`);
  console.log(`moves/game ${(moves / N).toFixed(1)} (turns each ${(moves / N / 2).toFixed(1)})`);
  console.log(`endings`, Object.fromEntries(Object.entries(endings).map(([k, v]) => [k, `${v} (${(100 * v / N).toFixed(0)}%)`])));
  console.log(`explosions/game A own ${(blasts.aOwn / N).toFixed(2)} opp ${(blasts.aOpp / N).toFixed(2)} · B own ${(blasts.bOwn / N).toFixed(2)} opp ${(blasts.bOpp / N).toFixed(2)}`);
  console.log(`treasures/game A ${(tre.a / N).toFixed(2)} B ${(tre.b / N).toFixed(2)} · mean score A ${avg(scoreA)} B ${avg(scoreB)}`);
}

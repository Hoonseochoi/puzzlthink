// AI vs AI for 망각의 지뢰: `npx tsx scripts/mine-oblivion/sim.ts [games=300] [a=hard] [b=normal] [seed=20261128]`
// ITEMS=1 lets side A use items (탐지기, 기억 되살리기, 방폭복) with the simple policy in itemTurn() and the caps of
// src/lib/mineOblivionItems.ts; ITEMS='{"probe":3,"recall":2,"suit":1}' overrides the caps for tuning.
// Tuning (11/28). The item user is the normal AI (a player who forgets some mines and numbers) against hard.
//   1000 games, seed 424242: no items 27.1 % · caps 2/2/0 (pieces only) 28.3 % · 2/2/1 47.6 % · 3/3/1 44.9 %
//   600 games, seed 20261128: none 27.7 · probe 2 only 28.4 · recall 2 only 27.4 · suit only 44.8 · 1/1/1 46.3 · 2/2/1 47.1
//   a more forgetful player (NORMAL='{"forgetMax":0.5,"forgetSlope":0.015,"forget0":0.1,"obsFade":0.08}'):
//     none 24.7 · recall 2 24.3 · probe 2 25.7 · 2/2/0 21.5 · 3/3/0 28.4 · 2/2/1 43.3
//   hard + items vs hard 72.8 % (hard vs hard 48.4 %). ±2 points is noise at these sizes.
//   → 방폭복 is worth ~+17 points on its own; the piece items are mild (within noise for this simple policy).
// NORMAL='{"tau":0.2}' overrides the normal level's knobs for tuning. Seats alternate who goes first and which level sits where. Reports a's win rate against b (draws count half),
// average moves, how games end, explosions per game (own mine vs opponent's), and treasure split.
import { type MineOblivion, type MoItem, type MoSeat, buryMines, mineMap, moveTo, newMineOblivion, numberAt, respawnAt } from '../../src/lib/mineOblivion';
import { NORMAL, type MoLevel, type MoMind, chooseMoBurial, chooseMoMove, chooseMoRespawn, moDanger, rollMoMind } from '../../src/lib/mineOblivionAi';
import { MO_ITEMS, applyItem, itemsLeft } from '../../src/lib/mineOblivionItems';

export type ItemCaps = Partial<Record<MoItem, number>>;
/** The item policy: memory back at own moves 14 and 30, 탐지기 on a planned step it is unsure of, 방폭복 before a risky one. */
export const POLICY = { recallAt: [14, 30], probeRisk: 0.1, suitRisk: 0.22, probeFrom: 4 };

function itemTurn(g: MineOblivion, s: MoSeat, level: MoLevel, mind: MoMind, rand: () => number, caps: ItemCaps, used: Record<MoItem, number>) {
  const left = (item: MoItem) => Math.min(itemsLeft(g, s, item), (caps[item] ?? MO_ITEMS[item].cap) - used[item]);
  const mine = g.log.filter((x) => x.seat === s).length;
  if (left('recall') > 0 && mine >= POLICY.recallAt[Math.min(used.recall, POLICY.recallAt.length - 1)]) {
    g = applyItem(g, s, 'recall')!; used.recall += 1; mind.recallAt = mine;
  }
  let to = chooseMoMove(g, s, level, mind, rand);
  if (left('probe') > 0 && mine >= POLICY.probeFrom && moDanger(g, s, level, mind, [to], rand)[0] >= POLICY.probeRisk) {
    g = applyItem(g, s, 'probe', to)!; used.probe += 1;
    (mind.probes ??= []).push({ cell: to, number: numberAt(g, to, mineMap(g)), n: g.log.length });
    to = chooseMoMove(g, s, level, mind, rand);
  }
  if (left('suit') > 0 && moDanger(g, s, level, mind, [to], rand)[0] >= POLICY.suitRisk) { g = applyItem(g, s, 'suit')!; used.suit += 1; }
  return { g, to };
}

export function rng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export function playOne(levels: [MoLevel, MoLevel], first: MoSeat, rand: () => number, itemSeat: MoSeat | null = null, caps: ItemCaps = {}) {
  const used: Record<MoItem, number> = { probe: 0, recall: 0, suit: 0 };
  let saves = 0;
  let g: MineOblivion = newMineOblivion(first, 'sim');
  const minds = [rollMoMind(rand), rollMoMind(rand)];
  for (const s of [0, 1] as MoSeat[]) g = buryMines(g, s, chooseMoBurial(s, levels[s], rand))!;
  const ownBlasts = [0, 0], oppBlasts = [0, 0];
  while (g.phase !== 'finished') {
    if (g.respawn !== null) { const s = g.respawn; g = respawnAt(g, s, chooseMoRespawn(g, s, levels[s], minds[s], rand))!; continue; }
    const s = g.turn;
    let to: number;
    if (s === itemSeat) ({ g, to } = itemTurn(g, s, levels[s], minds[s], rand, caps, used));
    else to = chooseMoMove(g, s, levels[s], minds[s], rand);
    const own = g.buried[s].includes(to) && !g.craters.includes(to);
    const before = g.craters.length;
    const next = moveTo(g, s, to);
    if (!next) throw new Error(`illegal AI move ${to} by ${s}`);
    if (next.craters.length > before) { if (own) ownBlasts[s] += 1; else oppBlasts[s] += 1; }
    if (next.log[next.log.length - 1]?.shielded) saves += 1;
    g = next;
  }
  return { g, ownBlasts, oppBlasts, used, saves };
}

if (process.argv[1]?.endsWith('sim.ts')) {
  const [nArg = '300', a = 'hard', b = 'normal', seedArg = '20261128'] = process.argv.slice(2);
  const N = Number(nArg); const rand = rng(Number(seedArg));
  if (process.env.NORMAL) Object.assign(NORMAL, JSON.parse(process.env.NORMAL));
  if (process.env.POLICY) Object.assign(POLICY, JSON.parse(process.env.POLICY));
  const items = process.env.ITEMS ? (process.env.ITEMS === '1' ? {} : JSON.parse(process.env.ITEMS) as ItemCaps) : null;
  if (items) (Object.keys(items) as MoItem[]).forEach((k) => { MO_ITEMS[k].cap = items[k]!; });
  const usedAll: Record<MoItem, number> = { probe: 0, recall: 0, suit: 0 }; let savesAll = 0;
  let aPts = 0, draws = 0, moves = 0; const endings: Record<string, number> = {};
  const blasts = { aOwn: 0, aOpp: 0, bOwn: 0, bOpp: 0 }; const tre = { a: 0, b: 0 }; const scoreA: number[] = [], scoreB: number[] = [];
  const t0 = Date.now();
  for (let i = 0; i < N; i += 1) {
    const aSeat: MoSeat = (i % 2) as MoSeat; const first: MoSeat = (Math.floor(i / 2) % 2) as MoSeat;
    const levels = (aSeat === 0 ? [a, b] : [b, a]) as [MoLevel, MoLevel];
    const { g, ownBlasts, oppBlasts, used, saves } = playOne(levels, first, rand, items ? aSeat : null, items ?? {});
    (Object.keys(used) as MoItem[]).forEach((k) => { usedAll[k] += used[k]; }); savesAll += saves;
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
  if (items) console.log(`A items/game probe ${(usedAll.probe / N).toFixed(2)} recall ${(usedAll.recall / N).toFixed(2)} suit ${(usedAll.suit / N).toFixed(2)} · suit saved ${(savesAll / N).toFixed(2)}/game`);
  console.log(`treasures/game A ${(tre.a / N).toFixed(2)} B ${(tre.b / N).toFixed(2)} · mean score A ${avg(scoreA)} B ${avg(scoreB)}`);
}

// AI vs AI matches for 포인트 오목: `npx tsx scripts/point-omok-arena.ts hard normal 40`
import { budgetOf, createPoRoom, reducePoRoom, type PoRoom } from '../src/lib/pointOmokRoom';
import { chooseBets, chooseTriple, type PoLevel } from '../src/lib/pointOmokAi';

const [a = 'hard', b = 'normal', n = '20'] = process.argv.slice(2) as [PoLevel, PoLevel, string];
const levels: PoLevel[] = [a as PoLevel, b as PoLevel];
const tally = { 0: 0, 1: 0, draw: 0 } as Record<string, number>;
let rounds = 0, slowest = 0;
for (let g = 0; g < Number(n); g += 1) {
  let s: PoRoom = createPoRoom({ id: 'x', name: 'x', at: 0 }, { ai: true });
  s = { ...s, ai: [true, true], seats: [{ id: 'x', name: 'A' }, { id: 'ai', name: 'B' }] };
  // alternate which level sits in seat 0
  const lv = g % 2 ? [levels[1], levels[0]] : levels;
  s = reducePoRoom(s, { t: 'start' }, 0, true)!;
  while (s.phase !== 'finished') {
    const view = (seat: 0 | 1) => ({ board: s.board, me: seat, chooser: s.chooser, triple: s.triple, rounds: s.rounds, myBets: s.secret!.bets[seat], budget: budgetOf(s, seat), level: lv[seat] });
    const t0 = performance.now();
    if (s.phase === 'choose') s = reducePoRoom(s, { t: 'ai', seat: s.chooser, triple: chooseTriple(view(s.chooser)) }, null, true)!;
    else if (s.phase === 'bid') { for (const seat of [0, 1] as const) s = reducePoRoom(s, { t: 'ai', seat, bets: chooseBets(view(seat)) }, null, true) ?? s; }
    else throw new Error('stuck ' + s.phase);
    slowest = Math.max(slowest, performance.now() - t0);
    if (s.rounds.length > 80) throw new Error('too long');
  }
  rounds += s.rounds.length;
  const w = s.winner === 'draw' ? 'draw' : String(g % 2 ? 1 - (s.winner as number) : s.winner);
  tally[w] += 1;
}
console.log(`${levels[0]} wins ${tally[0]}, ${levels[1]} wins ${tally[1]}, draws ${tally.draw}; avg rounds ${(rounds / Number(n)).toFixed(1)}; slowest step ${slowest.toFixed(0)}ms`);

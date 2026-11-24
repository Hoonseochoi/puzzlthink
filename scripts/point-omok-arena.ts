// AI vs AI matches for 포인트 오목: `npx tsx scripts/point-omok-arena.ts hard:saver normal:balanced 40`
// Each side is level[:style]; leave the style out for a random one per game.
import { budgetOf, createPoRoom, reducePoRoom, type PoRoom } from '../src/lib/pointOmokRoom';
import { chooseBets, chooseTriple, randomStyle, type PoLevel, type PoStyle } from '../src/lib/pointOmokAi';

const [a = 'hard', b = 'normal', n = '20'] = process.argv.slice(2);
const sides = [a, b].map((x) => { const [level, style] = x.split(':'); return { level: level as PoLevel, style: style as PoStyle | undefined }; });
const tally = { 0: 0, 1: 0, draw: 0 } as Record<string, number>;
let rounds = 0, slowest = 0;
for (let g = 0; g < Number(n); g += 1) {
  let s: PoRoom = createPoRoom({ id: 'x', name: 'x', at: 0 }, { ai: true });
  s = { ...s, ai: [true, true], seats: [{ id: 'x', name: 'A' }, { id: 'ai', name: 'B' }] };
  const seat = g % 2 ? [sides[1], sides[0]] : sides; // alternate who sits in seat 0
  const styles = seat.map((x) => x.style ?? randomStyle());
  s = reducePoRoom(s, { t: 'start' }, 0, true)!;
  while (s.phase !== 'finished') {
    const view = (me: 0 | 1) => ({ board: s.board, me, chooser: s.chooser, triple: s.triple, rounds: s.rounds, myBets: s.secret!.bets[me], budget: budgetOf(s, me), level: seat[me].level, style: styles[me] });
    const t0 = performance.now();
    if (s.phase === 'choose') s = reducePoRoom(s, { t: 'ai', seat: s.chooser, triple: chooseTriple(view(s.chooser)) }, null, true)!;
    else if (s.phase === 'bid') { for (const me of [0, 1] as const) s = reducePoRoom(s, { t: 'ai', seat: me, bets: chooseBets(view(me)) }, null, true) ?? s; }
    else throw new Error('stuck ' + s.phase);
    slowest = Math.max(slowest, performance.now() - t0);
    if (s.rounds.length > 80) throw new Error('too long');
  }
  rounds += s.rounds.length;
  tally[s.winner === 'draw' ? 'draw' : String(g % 2 ? 1 - (s.winner as number) : s.winner)] += 1;
}
console.log(`${a} ${tally[0]} : ${tally[1]} ${b} (draws ${tally.draw}); avg rounds ${(rounds / Number(n)).toFixed(1)}; slowest step ${slowest.toFixed(0)}ms`);

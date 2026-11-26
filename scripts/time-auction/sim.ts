// AI vs AI for 시간 경매: `npx tsx scripts/time-auction/sim.ts [games=2000] [format=quick] [mix=all-hard|all-normal|mixed]`
// Six AI per table, styles shuffled every game. Reports, per style and level: 1st place, eliminated, mean tokens and
// time left; plus how auctions ended and the usual winning price.
import { TA_FORMATS, type TaFormatId, newTimeAuction, taBeginCountdown, taExhaust, taNextRound, taPress, taRelease, taSettle, taStandings, taClock } from '../../src/lib/timeAuction';
import { TA_STYLES, type TaLevel, type TaStyle, chooseTaBid, taAiView, taRng } from '../../src/lib/timeAuctionAi';

const [nArg = '2000', fmt = 'quick', mix = 'mixed'] = process.argv.slice(2);
const N = Number(nArg); const format = fmt as TaFormatId;
const rand = taRng(20261126);
type Key = string;
const stat = new Map<Key, { n: number; first: number; out: number; tokens: number; minus: number; left: number }>();
const outcomes = { won: 0, void: 0, empty: 0 }; const prices: number[] = []; let lengthMs = 0;
for (let game = 0; game < N; game += 1) {
  // Six seats: the five styles plus one repeated at random.
  const styles: TaStyle[] = [...TA_STYLES, TA_STYLES[Math.floor(rand() * 5)]].sort(() => rand() - 0.5);
  const levels: TaLevel[] = styles.map((_, i) => (mix === 'all-hard' ? 'hard' : mix === 'all-normal' ? 'normal' : i % 2 ? 'hard' : 'normal'));
  if (mix === 'mixed' && rand() < 0.5) levels.reverse();
  let g = newTimeAuction(Array(6).fill(true), format);
  while (g.phase !== 'finished') {
    for (let s = 0; s < 6; s += 1) g = taPress(g, s, true) ?? g;
    g = taBeginCountdown(g)!;
    const plan = styles.map((st, s) => (g.joined[s] ? chooseTaBid(taAiView(g, s), st, levels[s], rand) : null));
    const order = plan.map((p, s) => ({ p: p ?? -1, s })).sort((a, b) => a.p - b.p);
    for (const { p, s } of order) { if (!g.joined[s]) continue; g = taExhaust(g, p); g = taRelease(g, s, p) ?? g; }
    g = taSettle(taExhaust(g, Number.MAX_SAFE_INTEGER))!;
    const last = g.log[g.log.length - 1];
    outcomes[last.outcome] += 1; if (last.outcome !== 'empty') { prices.push(last.price); lengthMs += last.price; }
    g = taNextRound(g)!;
  }
  const st = taStandings(g);
  styles.forEach((style, s) => {
    for (const key of [`${style}:${levels[s]}`, `level:${levels[s]}`]) {
      const row = stat.get(key) ?? { n: 0, first: 0, out: 0, tokens: 0, minus: 0, left: 0 };
      row.n += 1; row.first += st.place[s] === 1 ? 1 : 0; row.out += st.eliminated.includes(s) ? 1 : 0; row.tokens += g.tokens[s]; row.minus += g.minus[s]; row.left += g.bank[s];
      stat.set(key, row);
    }
  });
}
const pct = (a: number, b: number) => `${((100 * a) / b).toFixed(1)}%`.padStart(6);
console.log(`${N} games · format ${format} (${taClock(TA_FORMATS[format].bank)} × ${TA_FORMATS[format].rounds}) · levels ${mix}`);
console.log('seat'.padEnd(16), '   n', '   1st', '   out', ' stones', '  minus', ' time left');
for (const [key, r] of [...stat.entries()].sort()) console.log(key.padEnd(16), String(r.n).padStart(5), pct(r.first, r.n), pct(r.out, r.n), (r.tokens / r.n).toFixed(2).padStart(7), (r.minus / r.n).toFixed(2).padStart(7), taClock(r.left / r.n).padStart(10));
const total = outcomes.won + outcomes.void + outcomes.empty; const sorted = [...prices].sort((a, b) => a - b);
console.log(`auctions: won ${pct(outcomes.won, total)} · void (tie) ${pct(outcomes.void, total)} · nobody bid ${pct(outcomes.empty, total)}`);
console.log(`winning price: median ${taClock(sorted[sorted.length >> 1])} · p90 ${taClock(sorted[Math.floor(sorted.length * 0.9)])} · board time per match ${taClock(lengthMs / N)}`);

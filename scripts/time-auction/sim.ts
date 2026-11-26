// AI vs AI for 시간 경매: `npx tsx scripts/time-auction/sim.ts [games=2000] [format=quick] [levels=mixed|all-hard|all-normal]`
// Six AI per table: six distinct personalities drawn from the roster of twelve and a freshly rolled mind each (as
// the game does). Reports per personality and level (1st place, eliminated, mean points / minus / time left), and
// how varied matches are: who wins, when the winner took the lead for good, how much board time the winner spent.
import { TA_FORMATS, type TaFormatId, newTimeAuction, taBeginCountdown, taExhaust, taNextRound, taPress, taRelease, taSettle, taStandings, taClock, taScore } from '../../src/lib/timeAuction';
import { TA_STYLES, type TaLevel, chooseTaBid, pickTaStyles, rollTaMind, taAiView, taRng } from '../../src/lib/timeAuctionAi';

const [nArg = '2000', fmt = 'quick', mix = 'mixed'] = process.argv.slice(2);
const N = Number(nArg); const format = fmt as TaFormatId;
const rand = taRng(20261127);
type Row = { n: number; first: number; out: number; points: number; minus: number; left: number };
const stat = new Map<string, Row>();
const add = (key: string, f: (r: Row) => void) => { const row = stat.get(key) ?? { n: 0, first: 0, out: 0, points: 0, minus: 0, left: 0 }; f(row); stat.set(key, row); };
const outcomes = { won: 0, void: 0, empty: 0 }; const byValue: Record<number, number[]> = { 1: [], 2: [], 3: [] }; let board = 0;
const winnerStyle = new Map<string, number>(); const leadRound = new Map<number, number>(); const winnerSpent: number[] = []; const winScores: number[] = [];
for (let game = 0; game < N; game += 1) {
  const styles = pickTaStyles(6, rand);
  const minds = styles.map((st) => rollTaMind(st, rand));
  const levels: TaLevel[] = styles.map((_, i) => (mix === 'all-hard' ? 'hard' : mix === 'all-normal' ? 'normal' : (i + game) % 2 ? 'hard' : 'normal'));
  let g = newTimeAuction(Array(6).fill(true), format);
  const leaders: number[][] = [];
  while (g.phase !== 'finished') {
    for (let s = 0; s < 6; s += 1) g = taPress(g, s, true) ?? g;
    g = taBeginCountdown(g)!;
    const plan = minds.map((m, s) => (g.joined[s] ? chooseTaBid(taAiView(g, s), m, levels[s], rand) : null));
    const order = plan.map((p, s) => ({ p: p ?? -1, s })).sort((a, b) => a.p - b.p);
    for (const { p, s } of order) { if (!g.joined[s]) continue; g = taExhaust(g, p); g = taRelease(g, s, p) ?? g; }
    g = taSettle(taExhaust(g, Number.MAX_SAFE_INTEGER))!;
    const last = g.log[g.log.length - 1];
    outcomes[last.outcome] += 1; if (last.outcome !== 'empty') { byValue[last.value].push(last.price); board += last.price; }
    const best = Math.max(...[0, 1, 2, 3, 4, 5].map((s) => taScore(g, s)));
    leaders.push([0, 1, 2, 3, 4, 5].filter((s) => taScore(g, s) === best));
    g = taNextRound(g)!;
  }
  const st = taStandings(g);
  const champ = st.order[0];
  winnerStyle.set(styles[champ], (winnerStyle.get(styles[champ]) ?? 0) + 1);
  let since = leaders.length; while (since > 0 && leaders[since - 1].length === 1 && leaders[since - 1][0] === champ) since -= 1;
  leadRound.set(since + 1, (leadRound.get(since + 1) ?? 0) + 1);
  winnerSpent.push(g.startBank - g.bank[champ]); winScores.push(taScore(g, champ));
  styles.forEach((style, s) => {
    for (const key of [`${style}:${levels[s]}`, `${style}:all`, `level:${levels[s]}`]) add(key, (r) => {
      r.n += 1; r.first += st.place[s] === 1 ? 1 : 0; r.out += st.eliminated.includes(s) ? 1 : 0; r.points += g.points[s]; r.minus += g.minus[s]; r.left += g.bank[s];
    });
  });
}
const pct = (a: number, b: number) => `${((100 * a) / b).toFixed(1)}%`.padStart(6);
console.log(`${N} games · format ${format} (${taClock(TA_FORMATS[format].bank)} × ${TA_FORMATS[format].rounds}) · levels ${mix} · 6 of ${TA_STYLES.length} personalities each`);
console.log('personality'.padEnd(18), '    n', '   1st', '   out', ' points', '  minus', ' time left');
for (const [key, r] of [...stat.entries()].sort()) console.log(key.padEnd(18), String(r.n).padStart(5), pct(r.first, r.n), pct(r.out, r.n), (r.points / r.n).toFixed(2).padStart(7), (r.minus / r.n).toFixed(2).padStart(7), taClock(r.left / r.n).padStart(10));
const total = outcomes.won + outcomes.void + outcomes.empty;
const med = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[s.length >> 1] : 0; };
const q = (xs: number[], p: number) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor((s.length - 1) * p)]; };
console.log(`auctions: won ${pct(outcomes.won, total)} · void ${pct(outcomes.void, total)} · nobody bid ${pct(outcomes.empty, total)} · board time per match ${taClock(board / N)}`);
console.log(`median price by value: 1pt ${taClock(med(byValue[1]))} · 2pt ${taClock(med(byValue[2]))} · 3pt ${taClock(med(byValue[3]))}`);
// Variety.
const ent = [...winnerStyle.values()].reduce((h, c) => h - (c / N) * Math.log2(c / N), 0);
console.log(`variety · winner's personality: ${winnerStyle.size} different, entropy ${ent.toFixed(2)} bits (max ${Math.log2(TA_STYLES.length).toFixed(2)})`);
console.log(`variety · auction from which the winner led alone to the end: ${[...leadRound.entries()].sort((a, b) => a[0] - b[0]).map(([k, c]) => `${k}:${pct(c, N).trim()}`).join(' ')}`);
console.log(`variety · winner's time spent p10/p50/p90 ${taClock(q(winnerSpent, 0.1))} / ${taClock(q(winnerSpent, 0.5))} / ${taClock(q(winnerSpent, 0.9))} · winning score p10/p50/p90 ${q(winScores, 0.1)} / ${q(winScores, 0.5)} / ${q(winScores, 0.9)}`);

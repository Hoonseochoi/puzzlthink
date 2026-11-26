// AI vs AI for 스나이퍼 홀덤: `npx tsx scripts/sniper-holdem-arena.ts hard,normal,normal,easy,easy 40 [chips]`
// Seats get the listed levels (rotated every match so no level keeps a seat). Reports, per level, how often it was
// eliminated (the last one left) and its average place, plus match length and the slowest AI move.
import { type SniperHoldem, SH_SEATS, applyShAction, newSniperHoldem, startRound } from '../src/lib/sniperHoldem';
import { type ShLevel, SH_STYLES, SH_TUNING, chooseShAction, setShFoldScale } from '../src/lib/sniperHoldemAi';
if (process.env.SH_FOLD) setShFoldScale(Number(process.env.SH_FOLD));
import { shEvaluate } from '../src/lib/sniperHoldem';

// Variants for tuning: name=base:key=value;key=value (e.g. hardnm=hard:meta=false)
for (const spec of (process.env.SH_VARIANTS ?? '').split(' ').filter(Boolean)) {
  const [name, rest] = spec.split('=', 2).length === 2 ? [spec.slice(0, spec.indexOf('=')), spec.slice(spec.indexOf('=') + 1)] : [spec, ''];
  const [base, kv = ''] = rest.split(':');
  const t: Record<string, unknown> = { ...SH_TUNING[base] };
  for (const pair of kv.split(';').filter(Boolean)) { const [k, v] = pair.split('~'); t[k] = v === 'true' ? true : v === 'false' ? false : Number(v); }
  SH_TUNING[name] = t as never;
}

const [list = 'hard,normal,normal,easy,easy', n = '30', chips = '60'] = process.argv.slice(2);
const levels = list.split(',') as ShLevel[];
const players = levels.length;
const stats = new Map<ShLevel, { seats: number; out: number; place: number }>();
const act = new Map<string, { fold: number; call: number; raise: number; allin: number; snipe: number; hit: number; pass: number; sd: number; sdWin: number }>();
const A = (l: string) => { let x = act.get(l); if (!x) { x = { fold: 0, call: 0, raise: 0, allin: 0, snipe: 0, hit: 0, pass: 0, sd: 0, sdWin: 0 }; act.set(l, x); } return x; };
let rounds = 0, slowest = 0, moves = 0, time = 0, snipes = 0, snipeHits = 0;
for (let m = 0; m < Number(n); m += 1) {
  const order = levels.map((_, i) => levels[(i + m) % players]);
  const seated = Array.from({ length: SH_SEATS }, (_, i) => i < players);
  let g: SniperHoldem = newSniperHoldem(seated, Number(chips));
  for (let step = 0; step < 100000 && g.phase !== 'finished'; step += 1) {
    if (g.phase === 'showdown') { g = startRound(g); continue; }
    const s = g.turn;
    const t0 = performance.now();
    const a = chooseShAction(g, s, order[s], SH_STYLES[s]);
    const dt = performance.now() - t0;
    time += dt; moves += 1; slowest = Math.max(slowest, dt);
    const next = applyShAction(g, s, a);
    if (!next) throw new Error(`illegal AI move ${JSON.stringify(a)} in ${g.phase}`);
    if (a.kind === 'snipe') {
      snipes += 1;
      const hit = g.hands.some((h, o) => o !== s && !g.folded[o] && !g.safe[o] && !g.out[o] && h.length === 2 && (() => { const e = shEvaluate([...(g.board as number[]), ...(h as number[])]); return e.cat === a.target.cat && e.key[0] === a.target.n; })());
      A(order[s]).snipe += 1; if (hit) A(order[s]).hit += 1;
    } else if (a.kind === 'pass') A(order[s]).pass += 1;
    else if (a.kind === 'fold') A(order[s]).fold += 1;
    else if (a.kind === 'call') A(order[s]).call += 1;
    else { A(order[s]).raise += 1; if (a.to === g.cap) A(order[s]).allin += 1; }
    if (next.showdown && next.phase !== g.phase && !next.showdown.byFold) for (const e of next.showdown.entries) { A(order[e.seat]).sd += 1; if (next.showdown.winners.includes(e.seat)) A(order[e.seat]).sdWin += 1 / next.showdown.winners.length; }
    if (next.showdown && next.showdown !== g.showdown && !next.showdown.byFold) snipeHits += next.showdown.entries.filter((e) => e.sniped).length;
    g = next;
  }
  rounds += g.round;
  for (let s = 0; s < players; s += 1) {
    const st = stats.get(order[s]) ?? { seats: 0, out: 0, place: 0 };
    st.seats += 1; st.place += g.place[s] ?? players; if (g.place[s] === players) st.out += 1;
    stats.set(order[s], st);
  }
}
console.log(`${n} matches, ${players} players, ${chips} chips: ${(rounds / Number(n)).toFixed(1)} rounds/match, AI move avg ${(time / moves).toFixed(1)} ms, slowest ${slowest.toFixed(0)} ms, ${snipes} snipes / ${snipeHits} hands sniped`);
for (const [l, x] of act) { const b = x.fold + x.call + x.raise; console.log(`  ${l.padEnd(8)} fold ${(100 * x.fold / b).toFixed(0)}% call ${(100 * x.call / b).toFixed(0)}% raise ${(100 * x.raise / b).toFixed(0)}% (all-in ${x.allin}) · snipe ${x.snipe} hit ${(100 * x.hit / Math.max(1, x.snipe)).toFixed(0)}% pass ${x.pass} · showdowns ${x.sd} won ${(100 * x.sdWin / Math.max(1, x.sd)).toFixed(0)}%`); }
for (const [level, st] of stats) console.log(`  ${level.padEnd(6)} eliminated ${(100 * st.out / st.seats).toFixed(1)}% (fair ${(100 / players).toFixed(1)}%), avg place ${(st.place / st.seats).toFixed(2)} over ${st.seats} seats`);

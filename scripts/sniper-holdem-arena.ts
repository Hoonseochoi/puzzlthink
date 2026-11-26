// AI vs AI for 스나이퍼 홀덤: `npx tsx scripts/sniper-holdem-arena.ts hard,normal,normal,easy,easy 40 [chips] [rise|fixed]`
// Ante tuning: SH_STEPS='[[1,1],[5,2]]' SH_TAIL='2,3' override the rising schedule.
// Seats get the listed levels (rotated every match so no level keeps a seat). Reports, per level, how often it was
// eliminated (the last one left) and its average place, plus match length and the slowest AI move.
import { type ShAnteRule, type SniperHoldem, SH_ANTE_STEPS, SH_ANTE_TAIL, SH_SEATS, applyShAction, newSniperHoldem, startRound } from '../src/lib/sniperHoldem';
if (process.env.SH_STEPS) SH_ANTE_STEPS.splice(0, SH_ANTE_STEPS.length, ...JSON.parse(process.env.SH_STEPS));
if (process.env.SH_TAIL) { const [e, a, p] = process.env.SH_TAIL.split(',').map(Number); SH_ANTE_TAIL.every = e; SH_ANTE_TAIL.add = a; if (p) SH_ANTE_TAIL.scalePow = p; }
import { type ShLevel, type ShStyle, SH_STYLES, SH_TUNING, chooseShAction, setShFoldScale } from '../src/lib/sniperHoldemAi';
// SH_ONE_STYLE=ace seats every AI as that personality (a no-personality baseline for the variety measure).
const ONE = process.env.SH_ONE_STYLE as ShStyle | undefined;
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

const [list = 'hard,normal,normal,easy,easy', n = '30', chips = '60', rule = 'rise'] = process.argv.slice(2);
const lengths: number[] = [];
const levels = list.split(',') as ShLevel[];
const players = levels.length;
const stats = new Map<ShLevel, { seats: number; out: number; place: number }>();
type Per = { seats: number; out: number; place: number; fold: number; call: number; raise: number; raiseSize: number; snipe: number; pass: number };
const perStyle = new Map<string, Per>();
const per = (k: string) => { let x = perStyle.get(k); if (!x) { x = { seats: 0, out: 0, place: 0, fold: 0, call: 0, raise: 0, raiseSize: 0, snipe: 0, pass: 0 }; perStyle.set(k, x); } return x; };
const act = new Map<string, { fold: number; call: number; raise: number; allin: number; snipe: number; hit: number; pass: number; sd: number; sdWin: number }>();
const A = (l: string) => { let x = act.get(l); if (!x) { x = { fold: 0, call: 0, raise: 0, allin: 0, snipe: 0, hit: 0, pass: 0, sd: 0, sdWin: 0 }; act.set(l, x); } return x; };
let rounds = 0, slowest = 0, moves = 0, time = 0, snipes = 0, snipeHits = 0;
for (let m = 0; m < Number(n); m += 1) {
  const order = levels.map((_, i) => levels[(i + m) % players]);
  // Each match draws its own personalities from the roster, as the AI match does.
  const styles = ONE ? levels.map(() => ONE) : [...SH_STYLES].sort(() => Math.random() - 0.5).slice(0, players);
  // SH_PLAIN_SEAT=1: one seat (rotating) plays with no personality, to show no personality is weaker than it.
  if (process.env.SH_PLAIN_SEAT) styles[m % players] = 'plain' as ShStyle;
  const seated = Array.from({ length: SH_SEATS }, (_, i) => i < players);
  let g: SniperHoldem = newSniperHoldem(seated, Number(chips), undefined, rule as ShAnteRule);
  for (let step = 0; step < 100000 && g.phase !== 'finished'; step += 1) {
    if (g.phase === 'showdown') { g = startRound(g); continue; }
    const s = g.turn;
    const t0 = performance.now();
    const a = chooseShAction(g, s, order[s], styles[s]);
    const P = per(`${styles[s]}${ONE ? `#${s}` : ''}`); if (a.kind === 'snipe') P.snipe += 1; else if (a.kind === 'pass') P.pass += 1; else if (a.kind === 'fold') P.fold += 1; else if (a.kind === 'call') P.call += 1; else { P.raise += 1; P.raiseSize += (a.to - g.level) / Math.max(1, g.cap - g.level); }
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
  lengths.push(g.round);
  for (let s = 0; s < players; s += 1) {
    { const P = per(`${styles[s]}${ONE ? `#${s}` : ''}`); P.seats += 1; P.place += g.place[s] ?? players; if (g.place[s] === players) P.out += 1; }
    const st = stats.get(order[s]) ?? { seats: 0, out: 0, place: 0 };
    st.seats += 1; st.place += g.place[s] ?? players; if (g.place[s] === players) st.out += 1;
    stats.set(order[s], st);
  }
}
lengths.sort((a, b) => a - b);
const pct = (q: number) => lengths[Math.min(lengths.length - 1, Math.floor(q * lengths.length))];
console.log(`${rule} ante: rounds median ${pct(0.5)}, p90 ${pct(0.9)}, longest ${lengths[lengths.length - 1]}`);
console.log(`${n} matches, ${players} players, ${chips} chips: ${(rounds / Number(n)).toFixed(1)} rounds/match, AI move avg ${(time / moves).toFixed(1)} ms, slowest ${slowest.toFixed(0)} ms, ${snipes} snipes / ${snipeHits} hands sniped`);
for (const [l, x] of act) { const b = x.fold + x.call + x.raise; console.log(`  ${l.padEnd(8)} fold ${(100 * x.fold / b).toFixed(0)}% call ${(100 * x.call / b).toFixed(0)}% raise ${(100 * x.raise / b).toFixed(0)}% (all-in ${x.allin}) · snipe ${x.snipe} hit ${(100 * x.hit / Math.max(1, x.snipe)).toFixed(0)}% pass ${x.pass} · showdowns ${x.sd} won ${(100 * x.sdWin / Math.max(1, x.sd)).toFixed(0)}%`); }
for (const [level, st] of stats) console.log(`  ${level.padEnd(6)} eliminated ${(100 * st.out / st.seats).toFixed(1)}% (fair ${(100 / players).toFixed(1)}%), avg place ${(st.place / st.seats).toFixed(2)} over ${st.seats} seats`);

// Per personality: results and how it plays. Variety = mean distance between personalities' play profiles
// (fold, call, raise shares, raise size, snipe rate), to compare with SH_ONE_STYLE (same personality everywhere).
const profile = new Map<string, number[]>();
for (const [k, x] of [...perStyle].sort()) {
  const b = Math.max(1, x.fold + x.call + x.raise), sn = Math.max(1, x.snipe + x.pass);
  const v = [x.fold / b, x.call / b, x.raise / b, x.raiseSize / Math.max(1, x.raise), x.snipe / sn];
  profile.set(k, v);
  console.log(`  ${k.padEnd(7)} out ${(100 * x.out / Math.max(1, x.seats)).toFixed(0).padStart(3)}% place ${(x.place / Math.max(1, x.seats)).toFixed(2)} (${x.seats}) · fold ${(100 * v[0]).toFixed(0)}% call ${(100 * v[1]).toFixed(0)}% raise ${(100 * v[2]).toFixed(0)}% size ${v[3].toFixed(2)} · snipes ${(100 * v[4]).toFixed(0)}%`);
}
const keys = [...profile.keys()];
let dist = 0, pairs = 0;
for (let i = 0; i < keys.length; i += 1) for (let j = i + 1; j < keys.length; j += 1) { const a = profile.get(keys[i])!, b = profile.get(keys[j])!; dist += Math.hypot(...a.map((x, q) => x - b[q])); pairs += 1; }
console.log(`variety: mean profile distance ${(dist / Math.max(1, pairs)).toFixed(3)} over ${keys.length} ${ONE ? 'seats (one personality)' : 'personalities'}`);

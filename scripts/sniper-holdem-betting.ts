// Betting-shape check for the 스나이퍼 홀덤 AI (does it bet with conviction, or ping-pong 1-chip raises?).
//   npx tsx scripts/sniper-holdem-betting.ts [level=normal] [matches=200] [seed=1] [players=5] [chips=60]
// AI-only tables as the AI match plays them (every seat the same level, a random handful of personalities each match,
// rising ante). Math.random is replaced by a seeded generator, so a run is repeatable.
// Reports: raises per betting round, how many raises are the minimum (+1), the longest raise chain, how hands end
// (fold vs showdown), the pot, and per personality: how often it is eliminated, its average place, chips per round.
let seed = Number(process.argv[4] ?? 1) >>> 0 || 1;
Math.random = () => { // mulberry32
  seed = (seed + 0x6d2b79f5) >>> 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
import { type SniperHoldem, SH_SEATS, shEvaluate, applyShAction, newSniperHoldem, startRound } from '../src/lib/sniperHoldem';
import { type ShLevel, type ShStyle, SH_STYLES, chooseShAction as current } from '../src/lib/sniperHoldemAi';

// SH_AI=<path to another copy of sniperHoldemAi.ts> measures that copy instead (e.g. the version before a change).
const [level = 'normal', n = '200', , players = '5', chips = '60'] = process.argv.slice(2);
const P = Number(players);
let hands = 0, streets = 0, raises = 0, opens = 0, openMin = 0, reraises = 0, reraiseMin = 0, allins = 0;
let byFold = 0, showdowns = 0, potSd = 0, potAll = 0, potCapSd = 0, longChains = 0, maxChain = 0, streetsWith3 = 0;
let calls = 0, folds = 0, strongRaises = 0, strongMin = 0, strongBig = 0, strongCalls = 0;
const sizeHist = new Map<string, number>();
type Per = { seats: number; out: number; place: number; net: number; rounds: number; raises: number; big: number; allin: number; moves: number; folds: number };
const per = new Map<string, Per>();
const P_ = (k: string) => { let x = per.get(k); if (!x) { x = { seats: 0, out: 0, place: 0, net: 0, rounds: 0, raises: 0, big: 0, allin: 0, moves: 0, folds: 0 }; per.set(k, x); } return x; };

async function main() {
const chooseShAction: typeof current = process.env.SH_AI ? (await import(process.env.SH_AI)).chooseShAction : current;
for (let m = 0; m < Number(n); m += 1) {
  const styles = [...SH_STYLES].sort(() => Math.random() - 0.5).slice(0, P) as ShStyle[];
  const seated = Array.from({ length: SH_SEATS }, (_, i) => i < P);
  let g: SniperHoldem = newSniperHoldem(seated, Number(chips));
  let streetKey = '';
  let streetRaises = 0;
  let chain = new Map<number, number>();
  const endStreet = () => { if (streetKey) { streets += 1; if (streetRaises >= 3) streetsWith3 += 1; } streetRaises = 0; chain = new Map(); };
  for (let step = 0; step < 100000 && g.phase !== 'finished'; step += 1) {
    if (g.phase === 'showdown') { endStreet(); streetKey = ''; g = startRound(g); continue; }
    if (g.phase === 'bet1' || g.phase === 'bet2') {
      const key = `${g.round}-${g.phase}`;
      if (key !== streetKey) { endStreet(); streetKey = key; }
    } else if (streetKey) { endStreet(); streetKey = ''; }
    const s = g.turn;
    const a = chooseShAction(g, s, level as ShLevel, styles[s]);
    // A clearly strong made hand: three of a kind or better that uses the private cards (beats the board alone).
    const shown = (g.board.slice(0, g.shown) as number[]);
    const made = shEvaluate([...shown, ...(g.hands[s] as number[])]);
    const strongHand = made.cat >= 3 && made.cat > shEvaluate(shown).cat;
    if (strongHand && a.kind === 'call') strongCalls += 1;
    if (strongHand && a.kind === 'raise') {
      strongRaises += 1;
      const extra = a.to - g.level, pot = g.bets.reduce((x, y) => x + y, 0);
      if (extra === 1) strongMin += 1; if (a.to === g.cap || extra >= pot / 2) strongBig += 1;
    }
    if (a.kind === 'raise') {
      raises += 1; streetRaises += 1; P_(styles[s]).raises += 1;
      const extra = a.to - g.level;
      const open = g.level === g.base;
      if (open) { opens += 1; if (extra === 1) openMin += 1; } else { reraises += 1; if (extra === 1) reraiseMin += 1; }
      if (a.to === g.cap) { allins += 1; P_(styles[s]).allin += 1; }
      const pot = g.bets.reduce((x, y) => x + y, 0);
      const rel = extra / Math.max(1, pot);
      if (rel >= 0.5) P_(styles[s]).big += 1;
      const bucket = a.to === g.cap ? 'all-in' : extra === 1 ? '+1' : rel < 0.5 ? '<½ pot' : rel < 1 ? '½–1 pot' : '≥1 pot';
      sizeHist.set(bucket, (sizeHist.get(bucket) ?? 0) + 1);
      const c = (chain.get(s) ?? 0) + 1; chain.set(s, c);
      maxChain = Math.max(maxChain, c); if (c === 3) longChains += 1;
    } else if (a.kind === 'call') calls += 1;
    else if (a.kind === 'fold') { folds += 1; P_(styles[s]).folds += 1; }
    if (a.kind === 'raise' || a.kind === 'call' || a.kind === 'fold') P_(styles[s]).moves += 1;
    const before = g.chips.slice();
    const next = applyShAction(g, s, a);
    if (!next) throw new Error(`illegal AI move ${JSON.stringify(a)} in ${g.phase}`);
    if (next.showdown && next.showdown !== g.showdown) {
      hands += 1;
      const sd = next.showdown;
      potAll += sd.pot;
      if (sd.byFold) byFold += 1; else { showdowns += 1; potSd += sd.pot; potCapSd += sd.pot / (next.cap * (sd.entries.length || 1)); }
      // Net chips this round (before safety pay-outs/gifts): payouts minus what was put in.
      for (let q = 0; q < P; q += 1) if (next.bets[q] || sd.payouts[q]) { const x = P_(styles[q]); x.net += sd.payouts[q] - next.bets[q]; x.rounds += 1; }
      void before;
    }
    g = next;
  }
  for (let q = 0; q < P; q += 1) { const x = P_(styles[q]); x.seats += 1; x.place += g.place[q] ?? P; if (g.place[q] === P) x.out += 1; }
}
}
void main().then(() => {
const pc = (a: number, b: number) => `${(100 * a / Math.max(1, b)).toFixed(1)}%`;
console.log(`${level}, ${n} matches × ${P} players, ${chips} chips: ${hands} hands, ${streets} betting rounds`);
console.log(`  raises per betting round ${(raises / streets).toFixed(2)} · rounds with 3+ raises ${pc(streetsWith3, streets)} · same AI raising 3+ times in one betting round ${longChains} (max ${maxChain})`);
console.log(`  minimum (+1) raises: ${pc(openMin + reraiseMin, raises)} of all · opening bets ${pc(openMin, opens)} · re-raises ${pc(reraiseMin, reraises)} (${reraises} re-raises) · all-ins ${pc(allins, raises)}`);
console.log(`  raise sizes: ${['+1', '<½ pot', '½–1 pot', '≥1 pot', 'all-in'].map((k) => `${k} ${pc(sizeHist.get(k) ?? 0, raises)}`).join(' · ')}`);
console.log(`  strong made hands (triple+ beyond the board): ${strongRaises} raises, +1 ${pc(strongMin, strongRaises)}, ≥½ pot or all-in ${pc(strongBig, strongRaises)}; ${strongCalls} calls`);
console.log(`  moves: raise ${pc(raises, raises + calls + folds)} call ${pc(calls, raises + calls + folds)} fold ${pc(folds, raises + calls + folds)}`);
console.log(`  hands end by fold ${pc(byFold, hands)} · showdown ${pc(showdowns, hands)} · avg pot ${(potAll / hands).toFixed(1)}, at showdown ${(potSd / Math.max(1, showdowns)).toFixed(1)} (${(100 * potCapSd / Math.max(1, showdowns)).toFixed(0)}% of cap per player)`);
for (const [k, x] of [...per].sort()) console.log(`  ${k.padEnd(6)} out ${pc(x.out, x.seats).padStart(6)} (fair ${(100 / P).toFixed(0)}%) place ${(x.place / x.seats).toFixed(2)} · net ${(x.net / Math.max(1, x.rounds)).toFixed(2)}/round · raise ${pc(x.raises, x.moves)} call ${pc(x.moves - x.raises - x.folds, x.moves)} fold ${pc(x.folds, x.moves)} · of raises ≥½ pot ${pc(x.big, x.raises)} all-in ${pc(x.allin, x.raises)} (${x.seats} seats)`);
});

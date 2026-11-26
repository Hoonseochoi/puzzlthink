// Rules checks for 스나이퍼 홀덤: `npx tsx scripts/sniper-holdem-test.ts [randomMatches]`
// Hand evaluation, the tie rules, snipes (a sniped winner, both players sniping, self-snipe, identical hands),
// the cap / all-in flow, the safety line and gifts, and random whole matches that check the chip arithmetic.
import {
  type ShAction, type ShTarget, type SniperHoldem, SH_FOUR, SH_FULL, SH_HIGH, SH_PAIR, SH_SEATS, SH_STRAIGHT, SH_TRIPLE, SH_TWO_PAIR,
  applyShAction, newSniperHoldem, shAnte, shNextAnte, redactSniperHoldem, shActiveSeats, shCanAct, shEvaluate, shGifts, shLiveSeats, shPossibleTargets,
  shResolve, shSplit, shTarget, startRound,
} from '../src/lib/sniperHoldem';

let failures = 0;
const check = (ok: boolean, msg: string, extra?: unknown) => {
  if (!ok) { failures += 1; console.error('FAIL', msg, extra === undefined ? '' : JSON.stringify(extra)); }
};
const eq = (a: unknown, b: unknown, msg: string) => check(JSON.stringify(a) === JSON.stringify(b), `${msg}: got ${JSON.stringify(a)} want ${JSON.stringify(b)}`);

// ── Hand evaluation (the rule card's examples) ─────────────────────────────────────────────────────────────────
eq(shEvaluate([7, 7, 7, 7, 2, 1]), { cat: SH_FOUR, key: [7] }, 'four');
eq(shEvaluate([7, 7, 7, 2, 2, 1]), { cat: SH_FULL, key: [7, 2] }, 'full house');
eq(shEvaluate([10, 9, 8, 7, 6, 1]), { cat: SH_STRAIGHT, key: [10] }, 'straight');
eq(shEvaluate([7, 7, 7, 4, 2, 1]), { cat: SH_TRIPLE, key: [7] }, 'triple');
eq(shEvaluate([7, 7, 2, 2, 9, 1]), { cat: SH_TWO_PAIR, key: [7, 2] }, 'two pair');
eq(shEvaluate([7, 7, 2, 4, 9, 1]), { cat: SH_PAIR, key: [7] }, 'pair');
eq(shEvaluate([9, 7, 6, 4, 2, 1]), { cat: SH_HIGH, key: [9] }, 'high card');
eq(shEvaluate([7, 7, 7, 3, 3, 3]), { cat: SH_FULL, key: [7, 3] }, 'two triples = full house of the higher');
eq(shEvaluate([9, 9, 1, 1, 10, 10]), { cat: SH_TWO_PAIR, key: [10, 9] }, 'three pairs: best two (8R 손은유 "10 투페어")');
eq(shEvaluate([1, 2, 3, 4, 5, 9]), { cat: SH_STRAIGHT, key: [5] }, 'low straight 1–5');
eq(shEvaluate([10, 1, 2, 3, 4, 8]), { cat: SH_HIGH, key: [10] }, 'no wrap 10-1-2-3-4');
eq(shEvaluate([4, 5, 6, 7, 8, 9]), { cat: SH_STRAIGHT, key: [9] }, 'six in a row → top 9');
eq(shEvaluate([5, 5, 5, 5, 6, 6]), { cat: SH_FOUR, key: [5] }, 'four beats full house');
eq(shEvaluate([3, 4, 5, 6, 7, 7]), { cat: SH_STRAIGHT, key: [7] }, 'straight beats a pair');
eq(shEvaluate([3, 3, 3, 4, 5, 6, 7].slice(0, 6)), { cat: SH_TRIPLE, key: [3] }, 'triple 3 + 4 5 6 (no straight)');

// ── Show rounds replayed through shResolve ─────────────────────────────────────────────────────────────────────
const hands5 = (list: Record<number, number[]>) => Array.from({ length: SH_SEATS }, (_, s) => list[s] ?? []);
const T = (cat: number, n: number) => ({ cat, n } as ShTarget);
{
  // 3R: board 9·6·5·7; 손은유 7·8 (9 straight) sniped by 강지영 (9·3, 9 pair) → 강지영 wins.
  const r = shResolve([9, 6, 5, 7], hands5({ 0: [7, 8], 1: [9, 3] }), [0, 1], [T(SH_STRAIGHT, 7), T(SH_STRAIGHT, 9), null, null, null]);
  eq(r.winners, [1], '3R sniped straight loses to a pair');
}
{
  // 8R: board 9·9·1·1. 손은유 10·10, 세븐하이 10·4, 김하린 8·9. Snipes 9 풀하우스, 9 투페어, 1 풀하우스 → 손은유.
  const r = shResolve([9, 9, 1, 1], hands5({ 0: [10, 10], 1: [10, 4], 2: [8, 9] }), [0, 1, 2], [T(SH_FULL, 9), T(SH_TWO_PAIR, 9), T(SH_FULL, 1), null, null]);
  eq(r.winners, [0], '8R 10 투페어 wins after the self-snipe');
  check(r.entries.find((e) => e.seat === 1)!.sniped && r.entries.find((e) => e.seat === 2)!.sniped, '8R both sniped');
}
{
  // 40R: board 6·7·3·1, 저스틴민 10·5 vs 세븐하이 10·8, both "10 하이카드" → the other private card decides.
  const r = shResolve([6, 7, 3, 1], hands5({ 0: [10, 5], 1: [10, 8] }), [0, 1], [T(SH_PAIR, 6), T(SH_PAIR, 3), null, null, null]);
  eq(r.winners, [1], '40R second private card');
}
{
  // 60R: board 6·1·1·1, 김하린 6·2 vs 저스틴민 6·8, both "1 풀하우스" (1-1-1-6-6), no snipes → higher private card 8.
  const r = shResolve([6, 1, 1, 1], hands5({ 0: [6, 2], 1: [6, 8] }), [0, 1], ['pass', 'pass', null, null, null]);
  eq(r.winners, [1], '60R higher private card');
}
{
  // 51R: both sniped → draw, split.
  const r = shResolve([5, 8, 3, 3], hands5({ 0: [9, 6], 1: [6, 8] }), [0, 1], [T(SH_TWO_PAIR, 8), T(SH_PAIR, 3), null, null, null]);
  check(r.allSniped && r.winners.length === 2, '51R everyone sniped = draw', r);
}
{
  // 15R: two of three sniped → the unsniped 10 high card wins.
  const r = shResolve([4, 5, 7, 2], hands5({ 0: [7, 3], 1: [8, 5], 2: [10, 9] }), [0, 1, 2], [T(SH_PAIR, 5), T(SH_PAIR, 4), T(SH_PAIR, 7), null, null]);
  eq(r.winners, [2], '15R high card wins');
}
{
  // Identical private cards → draw between them only.
  const r = shResolve([2, 4, 6, 9], hands5({ 0: [10, 3], 1: [3, 10], 2: [1, 5] }), [0, 1, 2], [null, null, null, null, null]);
  eq(r.winners, [0, 1], 'identical hands split');
  // Two pair compared by the lower pair after the higher one.
  const r2 = shResolve([9, 9, 1, 1], hands5({ 0: [2, 2], 1: [10, 4] }), [0, 1], [null, null, null, null, null]);
  eq(r2.winners, [0], '9-9-2-2 beats 9-9-1-1');
  // A snipe hits everyone with that hand.
  const r3 = shResolve([9, 9, 5, 4], hands5({ 0: [5, 1], 1: [4, 2], 2: [10, 7] }), [0, 1, 2], [T(SH_TWO_PAIR, 9), null, null, null, null]);
  eq(r3.winners, [2], 'one snipe hits two "9 투페어"');
}
eq(shSplit(7, [1, 3], 3), [0, 3, 0, 4, 0], 'odd chip to the earlier seat in betting order');
eq(shSplit(10, [0, 2, 4], 2), [3, 0, 4, 0, 3], 'leftover from the 선 on');
eq(shGifts(10, [0, 30, 20, 0, 5], [1, 2, 3, 4]), [0, 2, 2, 4, 2], 'gifts: 1 to the 0-chip player, then evenly, poorest first');
eq(shGifts(1, [0, 0, 20, 0, 0], [0, 1, 2]), [1, 0, 0, 0, 0], 'gifts: not enough for everyone');
eq([2, 3, 4, 5].map((n) => shTarget(60, n)), [120, 90, 80, 75], 'safety lines at 60');
eq([2, 3, 4, 5].map((n) => shTarget(24, n)), [48, 36, 32, 30], 'safety lines at 24');
{
  const t = shPossibleTargets([9, 9, 1, 1], [10, 4]);
  check(t.some((x) => x.cat === SH_FOUR && x.n === 9) && !t.some((x) => x.cat === SH_HIGH), 'possible snipes on 9-9-1-1', t);
  check(t.some((x) => x.cat === SH_TWO_PAIR && x.n === 9), 'own 9 투페어 listed');
}

// ── Ante: fixed (the show) and rising (the site) ──────────────────────────────────────────────────────────────
eq([1, 5, 30, 80].map((r) => shAnte('fixed', r)), [1, 1, 1, 1], 'fixed ante is always 1');
eq([1, 2, 3, 4].map((r) => shAnte('rise', r)), [1, 1, 1, 1], 'rising ante starts at 1 for four rounds');
{
  const seq = Array.from({ length: 40 }, (_, i) => shAnte('rise', i + 1));
  check(seq.every((a, i) => i === 0 || a >= seq[i - 1]), 'rising ante never falls', seq);
  check(seq[39] > seq[9], 'rising ante keeps rising', seq);
  const quick = Array.from({ length: 40 }, (_, i) => shAnte('rise', i + 1, 24));
  check(quick.every((a, i) => a >= 1 && a <= seq[i]), '24-chip table scales the ante down', quick);
  eq(shNextAnte('fixed', 3), null, 'no next step on a fixed ante');
  const nx = shNextAnte('rise', 1)!;
  check(nx.round === 5 && nx.ante === shAnte('rise', 5), 'next step from round 1', nx);
}
{
  // A game saved before the rule existed (no anteRule) keeps the fixed ante; the ante never exceeds the smallest stack.
  const legacy: SniperHoldem = { ...newSniperHoldem([true, true, true, false, false], 60, 0), anteRule: undefined };
  let g = legacy;
  for (let k = 0; k < 20; k += 1) g = startRound({ ...g, round: 20 + k, chips: g.chips.map((c, i) => (i < 3 ? 60 : 0)) });
  eq(g.ante, 1, 'legacy state keeps ante 1');
  const rising = newSniperHoldem([true, true, true, false, false], 60, 0);
  const late = startRound({ ...rising, round: 29, chips: [60, 3, 60, 0, 0] });
  eq([late.cap, late.ante], [3, 3], 'ante capped at the smallest stack');
  check(late.phase === 'snipe' || late.turn >= 0, 'capped ante round still plays');
}

// ── Betting flow on a fixed deck ───────────────────────────────────────────────────────────────────────────────
/** A deck that deals seat 0..4 the given private cards and then the board (cards are popped from the end). */
function rigged(first: number, priv: Record<number, number[]>, board: number[], players: number[]): number[] {
  const pops: number[] = [];
  for (let k = 0; k < 2; k += 1) for (let i = 0; i < SH_SEATS; i += 1) { const s = (first + i) % SH_SEATS; if (players.includes(s)) pops.push(priv[s][k]); }
  pops.push(...board);
  return [...pops].reverse();
}
/** A fresh match with the first deal undone (bets back), so a rigged startRound deals round 1. */
const fresh = (seated: boolean[], chips: number): SniperHoldem => { const g = newSniperHoldem(seated, chips, 0); return { ...g, round: 0, first: 4, chips: g.chips.map((c, i) => c + g.bets[i]) }; };
function act(g: SniperHoldem, seat: number, a: ShAction): SniperHoldem {
  const n = applyShAction(g, seat, a);
  if (!n) { failures += 1; console.error('FAIL illegal', seat, a, g.phase, g.turn); return g; }
  return n;
}
{
  // Two players, seat 0 first. No checking: seat 0 cannot call to open.
  let g = fresh([true, true, false, false, false], 60);
  g = startRound(g, rigged(0, { 0: [10, 10], 1: [3, 4] }, [9, 9, 1, 1], [0, 1]));
  check(g.turn === 0 && g.phase === 'bet1', 'seat 0 opens');
  check(!shCanAct(g, 0, { kind: 'call' }), 'no check to open');
  g = act(g, 0, { kind: 'raise', to: 3 });
  check(!shCanAct(g, 1, { kind: 'raise', to: 61 }), 'raise above the cap refused');
  g = act(g, 1, { kind: 'call' });
  check(g.phase === 'bet2' && g.shown === 4 && g.turn === 0, 'bet 2 after the call');
  g = act(g, 0, { kind: 'raise', to: 60 }); // all in = the smaller stack's 60
  g = act(g, 1, { kind: 'call' });
  check(g.phase === 'snipe' && g.turn === 0, 'snipes from the 선');
  g = act(g, 0, { kind: 'pass' });
  g = act(g, 1, { kind: 'snipe', target: { cat: SH_TWO_PAIR, n: 10 } }); // 3·4 snipes 10 투페어: correct
  check(g.phase === 'finished', 'heads-up all-in ends the match', g.phase);
  eq(g.chips[1], 0, 'winner left with the whole table (paid 120)');
  eq(g.place, [2, 1, null, null, null], 'seat 1 safe, seat 0 eliminated');
}
{
  // All-in in bet 1 skips bet 2 (51R).
  let g = fresh([true, true, false, false, false], 24);
  g = startRound({ ...g, chips: [11, 37, 0, 0, 0] }, rigged(0, { 0: [9, 6], 1: [6, 8] }, [5, 8, 3, 3], [0, 1]));
  eq(g.cap, 11, 'cap is the smaller stack');
  g = act(g, 0, { kind: 'raise', to: 11 });
  g = act(g, 1, { kind: 'call' });
  check(g.phase === 'snipe' && g.shown === 4, 'bet 2 skipped after an all-in call', g.phase);
  g = act(g, 0, { kind: 'snipe', target: { cat: SH_TWO_PAIR, n: 8 } });
  g = act(g, 1, { kind: 'snipe', target: { cat: SH_PAIR, n: 3 } });
  check(!!g.showdown?.allSniped, 'both sniped');
  eq([g.chips[0], g.chips[1]], [11, 37], 'draw returns the pot');
  eq(g.board, [5, 8, 3, 3], 'rigged board');
}
{
  // Fold to a bet: winner takes the pot with no snipes.
  let g = fresh([true, true, true, false, false], 60);
  g = startRound(g);
  g = act(g, g.turn, { kind: 'raise', to: 4 });
  g = act(g, g.turn, { kind: 'fold' });
  g = act(g, g.turn, { kind: 'fold' });
  check(g.phase === 'showdown' && !!g.showdown?.byFold, 'win by fold');
  const total = g.chips.reduce((a, b) => a + b, 0);
  eq(total, 180, 'no chips lost');
}

// ── Random whole matches ───────────────────────────────────────────────────────────────────────────────────────
const runs = Number(process.argv[2] ?? 400);
let roundsTotal = 0;
for (let m = 0; m < runs; m += 1) {
  const players = 2 + (m % 4);
  const seated = Array.from({ length: SH_SEATS }, (_, i) => i < players);
  let g = newSniperHoldem(seated, m % 3 ? 24 : 60, undefined, m % 2 ? 'rise' : 'fixed');
  for (let step = 0; step < 200000 && g.phase !== 'finished'; step += 1) {
    if (g.phase === 'showdown') {
      // The table's chips: target·(players left − 1).
      const left = shActiveSeats(g);
      const sum = left.reduce((a, s) => a + g.chips[s], 0);
      check(sum === g.target * (left.length - 1), 'chip arithmetic', { sum, target: g.target, left: left.length });
      check(left.every((s) => g.chips[s] >= 1), 'nobody starts a round on 0', g.chips);
      g = startRound(g);
      continue;
    }
    const s = g.turn;
    // Guest view never shows another player's cards or the hidden shared cards.
    const pub = redactSniperHoldem(g);
    if (g.phase !== 'snipe') check(pub.board.slice(g.shown).every((c) => c === null), 'hidden board leaked');
    check(pub.hands.every((h) => h.every((c) => c === null)), 'private card leaked');
    let a: ShAction;
    const r = Math.random();
    if (g.phase === 'snipe') {
      const opts = shPossibleTargets(g.board as number[], g.hands[s] as number[]);
      a = r < 0.25 ? { kind: 'pass' } : { kind: 'snipe', target: opts[Math.floor(Math.random() * opts.length)] };
    } else if (r < 0.2) a = { kind: 'fold' };
    else if (r < 0.65 && shCanAct(g, s, { kind: 'call' })) a = { kind: 'call' };
    else if (g.level < g.cap) a = { kind: 'raise', to: g.level + 1 + Math.floor(Math.random() * Math.min(6, g.cap - g.level)) };
    else a = shCanAct(g, s, { kind: 'call' }) ? { kind: 'call' } : { kind: 'fold' };
    const n = applyShAction(g, s, a);
    if (!n) { check(false, 'random move refused', { a, phase: g.phase, level: g.level, cap: g.cap }); break; }
    check(n.bets.every((b) => b <= n.cap), 'bet over the cap');
    check(n.chips.every((c) => c >= 0), 'negative chips', n.chips);
    g = n;
  }
  check(g.phase === 'finished', 'match did not finish');
  const places = g.place.filter((p) => p !== null).sort((a, b) => a! - b!);
  eq(places, Array.from({ length: players }, (_, i) => i + 1), `places 1..${players}`);
  check(shLiveSeats(g).length >= 0, '');
  roundsTotal += g.round;
}
console.log(`${runs} random matches, ${(roundsTotal / runs).toFixed(1)} rounds on average`);
if (failures) { console.error(`${failures} failure(s)`); process.exit(1); }
console.log('all sniper hold\'em rule checks passed');

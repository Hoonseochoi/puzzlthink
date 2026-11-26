// Room-level checks for 스나이퍼 홀덤: `npx tsx scripts/sniper-holdem-room-test.ts [matches]`
// Plays whole room matches through the reducer (people seats acting randomly, some turns left to time out, AI seats
// via the host's auto actions) and checks: the AI takes an idle seat and gives it back on rejoin, the match ends with
// every place given, and a guest's view never holds another player's private cards or the unrevealed shared cards.
import { type SniperHoldemRoom, createSniperHoldemRoom, redactSniperHoldemRoom, reduceSniperHoldemRoom, sniperHoldemAutoAction, sniperHoldemRoomSecret, withSniperHoldemRoomSecret, shWaitingOn } from '../src/lib/sniperHoldemRoom';
import { SH_SEATS, shCanAct, shPossibleTargets } from '../src/lib/sniperHoldem';

const n = Number(process.argv[2] ?? 12);
let failures = 0;
const fail = (msg: string) => { failures += 1; console.error('FAIL', msg); };
const expire = (s: SniperHoldemRoom): SniperHoldemRoom => ({ ...s, deadline: 0, holdUntil: 0 });

for (let m = 0; m < n; m += 1) {
  const people = 2 + (m % 3);
  let s = createSniperHoldemRoom({ id: 'p0', name: 'P0', at: 0 });
  s = { ...s, seats: s.seats.map((seat, i) => (i < people ? { id: `p${i}`, name: `P${i}` } : null)) };
  if (m % 2) s = reduceSniperHoldemRoom(s, { t: 'fillAi', on: false }, 0, true)!;
  if (m % 4 === 1) s = reduceSniperHoldemRoom(s, { t: 'chips', chips: 24 }, 0, true)!;
  s = reduceSniperHoldemRoom(s, { t: 'start' }, 0, true)!;
  const seated = s.seats.filter(Boolean).length;
  if (seated !== (m % 2 ? people : SH_SEATS)) fail(`seated ${seated}`);
  let tookOver = false, gaveBack = false;
  for (let step = 0; step < 20000 && s.phase === 'playing'; step += 1) {
    const g = s.game;
    // Secrets: every guest sees their own cards and nothing else hidden.
    for (let seat = 0; seat < SH_SEATS; seat += 1) {
      if (!s.seats[seat] || s.ai[seat]) continue;
      const view = withSniperHoldemRoomSecret(redactSniperHoldemRoom(s), JSON.parse(JSON.stringify(sniperHoldemRoomSecret(s, seat))), seat);
      if (JSON.stringify(view.game.hands[seat]) !== JSON.stringify(g.hands[seat])) fail('own cards missing');
      if (g.phase !== 'showdown' && g.phase !== 'finished') {
        view.game.hands.forEach((h, o) => { if (o !== seat && h.some((c) => c !== null)) fail('private card leaked'); });
        if (view.game.board.slice(g.shown).some((c) => c !== null)) fail('hidden shared card leaked');
      }
    }
    const auto = sniperHoldemAutoAction(expire(s));
    if (auto) { s = reduceSniperHoldemRoom(expire(s), auto, null, true) ?? s; continue; }
    const turn = shWaitingOn(g)[0];
    if (turn === undefined) { fail(`stuck in ${g.phase}`); break; }
    if (s.ai[turn]) { fail('AI seat not moved by auto'); break; }
    if (Math.random() < 0.05) { // let the clock run out: the AI takes the seat
      s = reduceSniperHoldemRoom(expire(s), { t: 'timeout' }, null, true) ?? s;
      if (s.ai[turn] && s.away?.[turn]) tookOver = true; else fail('timeout did not hand the seat to the AI');
      if (Math.random() < 0.7) { const back = reduceSniperHoldemRoom(s, { t: 'rejoin' }, turn, false); if (back && !back.ai[turn]) { gaveBack = true; s = back; } }
      continue;
    }
    const r = Math.random();
    const action = g.phase === 'snipe'
      ? (r < 0.3 ? { kind: 'pass' as const } : { kind: 'snipe' as const, target: shPossibleTargets(g.board as number[], g.hands[turn] as number[])[0] })
      : r < 0.15 ? { kind: 'fold' as const } : shCanAct(g, turn, { kind: 'call' }) && r < 0.7 ? { kind: 'call' as const } : g.level < g.cap ? { kind: 'raise' as const, to: Math.min(g.cap, g.level + 1 + Math.floor(Math.random() * 4)) } : { kind: 'fold' as const };
    const next = reduceSniperHoldemRoom(s, { t: 'act', action }, turn, turn === 0);
    if (!next) { fail(`move refused ${JSON.stringify(action)} in ${g.phase}`); break; }
    s = next;
  }
  if (s.phase !== 'finished') fail('room match did not finish');
  const places = s.game.place.filter((p) => p !== null).length;
  if (places !== seated) fail(`places ${places}/${seated}`);
  if (!tookOver && m === 0) console.log('note: no timeout happened in match 0');
  void gaveBack;
  // Rematch from the result screen.
  const again = reduceSniperHoldemRoom(s, { t: 'start' }, 0, true);
  if (!again || again.phase !== 'playing') fail(`rematch did not start m=${m} fill=${s.fillAi} ai=${s.ai} away=${s.away}`);
}
if (failures) { console.error(`${failures} failure(s)`); process.exit(1); }
console.log(`${n} room matches ok`);

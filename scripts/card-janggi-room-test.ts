// Room-level checks for 카드 장기: `npx tsx scripts/card-janggi-room-test.ts [matches]`
// Plays whole matches through the room reducer (random players, with timeouts thrown in) and checks round flow,
// match end, the timeout rule (the opponent moves the late player's piece), idle loss, and what a guest's view holds.
import { type CjSeat, currentCard, legalMoves, layoutSize, randomLayout } from '../src/lib/cardJanggi';
import { type CjRoom, CJ_IDLE_LOSS, cjPrivateFor, cjWaitingOn, cjWithPrivate, createCjRoom, redactCjRoom, reduceCjRoom } from '../src/lib/cardJanggiRoom';

const n = Number(process.argv[2] ?? 200);
const fail = (msg: string, s?: CjRoom) => { console.error('FAIL', msg, s ? JSON.stringify({ phase: s.phase, g: s.game }) : ''); process.exit(1); };
const expire = (s: CjRoom): CjRoom => ({ ...s, deadline: 0, holdUntil: 0 });

function guestView(s: CjRoom, seat: number): CjRoom {
  const pub = redactCjRoom(s);
  return cjWithPrivate(pub, JSON.parse(JSON.stringify(cjPrivateFor(s, seat))), seat);
}

function checkSecrets(s: CjRoom) {
  for (const seat of [0, 1]) {
    const view = guestView(s, seat);
    const o = 1 - seat;
    const g = s.game;
    if (g.phase === 'over') continue;
    // My own layout is all there; of the other side only used cards and (once play has begun) the face-up one.
    if (JSON.stringify(view.game.seq[seat]) !== JSON.stringify(g.seq[seat])) fail('own layout missing from guest view', s);
    view.game.seq[o].forEach((c, i) => {
      const open = i < g.pos[o] || (i === g.pos[o] && !(g.phase === 'arrange' && g.ply === 0));
      if (open && c !== g.seq[o][i]) fail('public card missing', s);
      if (!open && c !== -1) fail('hidden card leaked', s);
    });
  }
}

let proxies = 0, idleLosses = 0, rounds = 0, matches = 0, layoutsTimed = 0;
const winsBy = { 0: 0, 1: 0, draw: 0 } as Record<string, number>;
for (let m = 0; m < n; m += 1) {
  let s = createCjRoom({ id: 'a', name: 'A', at: 0 });
  s = { ...s, seats: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }] };
  s = reduceCjRoom(s, { t: 'start' }, 0, true) ?? fail('start') as never;
  const lazy = m % 10 === 0 ? (m % 20 === 0 ? 0 : 1) : -1; // some matches have one player who never acts
  let steps = 0;
  while (s.phase !== 'finished') {
    if ((steps += 1) > 2000) fail('match does not end', s);
    checkSecrets(s);
    if (s.phase === 'between') { s = reduceCjRoom(expire(s), { t: 'next' }, null, true) ?? fail('next', s) as never; rounds += 1; continue; }
    const g = s.game;
    const waiting = cjWaitingOn(s);
    if (!waiting.length) fail('nobody to act', s);
    // Now and then (and always for the lazy player) the clock runs out instead.
    const timeout = waiting.includes(lazy) || Math.random() < 0.04;
    if (timeout) {
      const before = s;
      s = reduceCjRoom(expire(s), { t: 'timeout' }, null, true) ?? fail('timeout ignored', s) as never;
      if (before.game.phase === 'arrange') layoutsTimed += 1;
      if (before.game.phase === 'move' && !before.proxy && s.phase === 'playing') {
        if (!s.proxy) fail('timeout did not hand the move to the opponent', s);
        proxies += 1;
        // The opponent now moves the late player's piece with the late player's card.
        const late = s.game.turn;
        if (cjWaitingOn(s)[0] !== 1 - late) fail('proxy chooser wrong', s);
        if (waiting.includes(lazy) && 1 - late === lazy) continue; // the lazy one will not pick either
        const moves = legalMoves(s.game.board, late, currentCard(s.game, late));
        const [from, to] = moves[Math.floor(Math.random() * moves.length)];
        if (reduceCjRoom(s, { t: 'move', from, to }, late, true)) fail('late player moved during proxy', s);
        const next = reduceCjRoom(s, { t: 'move', from, to }, 1 - late, true) ?? fail('proxy move rejected', s) as never;
        const last = next.game.history[next.game.history.length - 1];
        if (!last?.proxy || last.seat !== late) fail('proxy move not recorded', next);
        s = next;
      }
      if (s.phase === 'finished' && s.reason === 'idle') idleLosses += 1;
      continue;
    }
    if (g.phase === 'arrange') {
      for (const seat of waiting as CjSeat[]) {
        const order = randomLayout(g, seat);
        if (order.length !== layoutSize(g, seat)) fail('layout size');
        if (reduceCjRoom(s, { t: 'arrange', order: [...order, 9] }, seat, true)) fail('bad layout accepted');
        s = reduceCjRoom(s, { t: 'arrange', order }, seat, true) ?? fail('layout rejected', s) as never;
      }
    } else {
      const seat = waiting[0];
      const moves = legalMoves(g.board, g.turn, currentCard(g, g.turn));
      const [from, to] = moves[Math.floor(Math.random() * moves.length)];
      if (reduceCjRoom(s, { t: 'move', from, to }, 1 - seat, true)) fail('out-of-turn move accepted', s);
      s = reduceCjRoom(s, { t: 'move', from, to }, seat, true) ?? fail('legal move rejected', s) as never;
    }
  }
  rounds += 1; matches += 1;
  if (s.reason === 'rounds' && s.winner !== 'draw' && s.wins[s.winner as number] < 2 && s.results.length < 5) fail('match ended early', s);
  if (lazy >= 0 && s.winner !== 1 - lazy) fail(`lazy player ${lazy} did not lose (${s.reason})`, s);
  if (s.idle.some((v, i) => v > CJ_IDLE_LOSS && i !== lazy)) fail('idle count past the limit', s);
  winsBy[String(s.winner)] += 1;
}
console.log(`ok · ${matches} matches, ${rounds} rounds · proxy moves ${proxies} · timed-out layouts ${layoutsTimed} · idle losses ${idleLosses} · winners ${JSON.stringify(winsBy)}`);

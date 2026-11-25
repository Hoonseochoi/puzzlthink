// Room rules for 컬러 링크, scripted: `npx tsx scripts/color-link-duel-room-check.ts`
// Plays full AI-vs-AI matches through the room reducer (coin toss, opener choice, placements, calls, proofs,
// one-round matches) and checks the clocks: a missed placement loses the round, a missed proof loses it for the placer.
import { CLD_TARGET, checkProof } from '../src/lib/colorLinkDuel';
import { aiGoesFirst, aiPlace, aiProof, aiShouldDeclare } from '../src/lib/colorLinkDuelAi';
import { type CldRoom, createCldRoom, reduceCldRoom } from '../src/lib/colorLinkDuelRoom';

const assert = (ok: unknown, msg: string) => { if (!ok) { console.error('FAIL', msg); process.exit(1); } };
const host = { id: 'h', name: 'H', at: 0 };
const fresh = () => {
  let s: CldRoom = createCldRoom(host);
  s = { ...s, seats: [{ id: 'h', name: 'H' }, { id: 'g', name: 'G' }] };
  s = reduceCldRoom(s, { t: 'start' }, 0, true)!;
  // A player picks who goes first: in a room the coin-picked chooser.
  const first = (Math.random() < 0.5 ? 0 : 1) as 0 | 1;
  return reduceCldRoom(s, { t: 'choose', first }, s.chooser, false)!;
};
// The opening choice.
{
  let c: CldRoom = createCldRoom(host);
  c = reduceCldRoom({ ...c, seats: [{ id: 'h', name: 'H' }, { id: 'g', name: 'G' }] }, { t: 'start' }, 0, true)!;
  assert(c.phase === 'choose' && (c.chooser === 0 || c.chooser === 1), 'a room starts with a player choosing');
  assert(reduceCldRoom(c, { t: 'choose', first: 0 }, 1 - c.chooser!, false) === null, 'only the chooser picks');
  const second = reduceCldRoom(c, { t: 'choose', first: (1 - c.chooser!) as 0 | 1 }, c.chooser, false)!;
  assert(second.phase === 'place' && second.turn === 1 - c.chooser!, 'the chooser can go second');
  const lapsed = reduceCldRoom({ ...c, deadline: Date.now() - 1 }, { t: 'timeout' }, null, true)!;
  assert(lapsed.phase === 'place' && lapsed.turn === c.chooser, 'no choice in time: the chooser goes first');
  let vsAi: CldRoom = createCldRoom(host, { ai: true });
  vsAi = reduceCldRoom(vsAi, { t: 'start' }, 0, true)!;
  assert(vsAi.phase === 'choose' && vsAi.chooser === 0, 'against the AI the player chooses');
}
const expire = (s: CldRoom) => reduceCldRoom({ ...s, deadline: Date.now() - 1 }, { t: 'timeout' }, null, true)!;

// Clocks.
let s = fresh();
assert(s.phase === 'place' && !s.coin && s.placements === 0, 'the chosen opener starts');
assert(reduceCldRoom(s, { t: 'place', stones: [[0, 1]] }, 1 - s.turn, false) === null, 'out-of-turn placement refused');
assert(reduceCldRoom(s, { t: 'declare' }, s.turn, false) === null, 'no call on an empty board');
assert(reduceCldRoom(s, { t: 'place', stones: [[0, 1], [1, 2]] }, s.turn, false) === null, 'the opener places exactly one stone');
const opener = s.turn;
s = expire(s);
assert(s.phase === 'finished' && s.winner !== opener && s.log[0].reason === 'timeout', 'a missed placement loses the (one-round) match');
// A fresh match for the call and proof rules: A opens, B places two, A calls, B must prove.
s = fresh();
const A = s.turn as 0 | 1, B = (1 - A) as 0 | 1;
s = reduceCldRoom(s, { t: 'place', stones: [[24, 1]] }, A, false)!;
assert(reduceCldRoom(s, { t: 'place', stones: [[0, 2], [1, 2]] }, B, false) === null, 'two stones must differ in colour');
s = reduceCldRoom(s, { t: 'place', stones: [[0, 1], [48, 2]] }, B, false)!;
s = reduceCldRoom(s, { t: 'declare' }, A, false)!;
assert(s.phase === 'proof' && s.proof?.prover === B, 'a call makes the last placer prove');
assert(reduceCldRoom(s, { t: 'prove', paths: [] }, B, false) === null, 'a wrong proof is refused');
const proof = aiProof(s.board)!;
assert(checkProof(s.board, proof).ok, 'solver proof checks out');
const proved = reduceCldRoom(s, { t: 'prove', paths: proof }, B, false)!;
assert(proved.phase === 'finished' && proved.winner === B && proved.log.at(-1)!.reason === 'proved', 'a valid proof wins the match for the placer');
const late = expire(s);
assert(late.phase === 'finished' && late.winner === A && late.log.at(-1)!.reason === 'proofTimeout', 'a missed proof wins for the caller');
const conceded = reduceCldRoom(s, { t: 'concede' }, B, false)!;
assert(conceded.winner === A && conceded.log.at(-1)!.reason === 'failed', 'giving up wins for the caller');
const resigned = reduceCldRoom(s, { t: 'resign' }, A, false)!;
assert(resigned.phase === 'finished' && resigned.winner === B, 'resigning ends the match');

// Whole matches between two AIs through the reducer.
let matches = 0, rounds = 0;
for (let m = 0; m < 4; m++) {
  s = fresh();
  for (let step = 0; step < 500 && s.phase !== 'finished'; step++) {
    let next: CldRoom | null = null;
    if (s.phase === 'choose') next = reduceCldRoom(s, { t: 'choose', first: aiGoesFirst() ? s.chooser! : (1 - s.chooser!) as 0 | 1 }, s.chooser, false);
    else if (s.phase === 'break') next = reduceCldRoom(reduceCldRoom(s, { t: 'ready' }, 0, false)!, { t: 'ready' }, 1, false);
    else if (s.phase === 'proof') { const p = aiProof(s.board); next = p ? reduceCldRoom(s, { t: 'prove', paths: p }, s.proof!.prover, false) : reduceCldRoom(s, { t: 'concede' }, s.proof!.prover, false); }
    else if (s.placements > 0 && aiShouldDeclare(s.board)) next = reduceCldRoom(s, { t: 'declare' }, s.turn, false);
    else next = reduceCldRoom(s, { t: 'place', stones: aiPlace(s.board, s.placements === 0, m * 1000 + step, Date.now() + 600) }, s.turn, false);
    assert(next, `step ${step} in ${s.phase} was refused`);
    s = next!;
  }
  assert(s.phase === 'finished' && Math.max(...s.score) === CLD_TARGET && s.log.length === 1, 'match ends after one round');
  matches++; rounds += s.log.length;
}
console.log({ ok: true, matches, avgRounds: rounds / matches });

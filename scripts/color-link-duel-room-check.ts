// Room rules for 컬러 링크, scripted: `npx tsx scripts/color-link-duel-room-check.ts`
// Plays full AI-vs-AI matches through the room reducer (coin toss, opener choice, placements, calls, proofs,
// breaks) and checks the clocks: a missed placement loses the round, a missed proof loses it for the placer.
import { checkProof } from '../src/lib/colorLinkDuel';
import { aiGoesFirst, aiPlace, aiProof, aiShouldDeclare } from '../src/lib/colorLinkDuelAi';
import { type CldRoom, createCldRoom, reduceCldRoom } from '../src/lib/colorLinkDuelRoom';

const assert = (ok: unknown, msg: string) => { if (!ok) { console.error('FAIL', msg); process.exit(1); } };
const host = { id: 'h', name: 'H', at: 0 };
const fresh = () => {
  let s: CldRoom = createCldRoom(host);
  s = { ...s, seats: [{ id: 'h', name: 'H' }, { id: 'g', name: 'G' }] };
  return reduceCldRoom(s, { t: 'start' }, 0, true)!;
};
const expire = (s: CldRoom) => reduceCldRoom({ ...s, deadline: Date.now() - 1 }, { t: 'timeout' }, null, true)!;

// Clocks.
let s = fresh();
assert(s.phase === 'place' && s.coin, 'starts with a coin-toss round');
assert(reduceCldRoom(s, { t: 'place', stones: [[0, 1]] }, 1 - s.turn, false) === null, 'out-of-turn placement refused');
assert(reduceCldRoom(s, { t: 'declare' }, s.turn, false) === null, 'no call on an empty board');
assert(reduceCldRoom(s, { t: 'place', stones: [[0, 1], [1, 2]] }, s.turn, false) === null, 'the opener places exactly one stone');
const opener = s.turn;
s = expire(s);
assert(s.phase === 'break' && s.log[0].winner !== opener && s.log[0].reason === 'timeout', 'missed placement loses the round');
s = reduceCldRoom(s, { t: 'ready' }, 0, false)!; s = reduceCldRoom(s, { t: 'ready' }, 1, false)!;
assert(s.phase === 'choose' && s.chooser === opener, 'the loser chooses the opener');
s = reduceCldRoom(s, { t: 'choose', first: 1 }, opener, false)!;
assert(s.phase === 'place' && s.turn === 1 && !s.coin, 'chosen opener moves');
s = reduceCldRoom(s, { t: 'place', stones: [[24, 1]] }, 1, false)!;
assert(reduceCldRoom(s, { t: 'place', stones: [[0, 2], [1, 2]] }, 0, false) === null, 'two stones must differ in colour');
s = reduceCldRoom(s, { t: 'place', stones: [[0, 1], [48, 2]] }, 0, false)!;
s = reduceCldRoom(s, { t: 'declare' }, 1, false)!;
assert(s.phase === 'proof' && s.proof?.prover === 0, 'a call makes the last placer prove');
assert(reduceCldRoom(s, { t: 'prove', paths: [] }, 0, false) === null, 'a wrong proof is refused');
const proof = aiProof(s.board)!;
assert(checkProof(s.board, proof).ok, 'solver proof checks out');
const proved = reduceCldRoom(s, { t: 'prove', paths: proof }, 0, false)!;
assert(proved.log.at(-1)!.winner === 0 && proved.log.at(-1)!.reason === 'proved', 'a valid proof wins for the placer');
const late = expire(s);
assert(late.log.at(-1)!.winner === 1 && late.log.at(-1)!.reason === 'proofTimeout', 'a missed proof wins for the caller');
const conceded = reduceCldRoom(s, { t: 'concede' }, 0, false)!;
assert(conceded.log.at(-1)!.winner === 1 && conceded.log.at(-1)!.reason === 'failed', 'giving up wins for the caller');
const resigned = reduceCldRoom(s, { t: 'resign' }, 1, false)!;
assert(resigned.phase === 'finished' && resigned.winner === 0, 'resigning ends the match');

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
  assert(s.phase === 'finished' && Math.max(...s.score) === 3, 'match ends at 3 points');
  matches++; rounds += s.log.length;
}
console.log({ ok: true, matches, avgRounds: rounds / matches });

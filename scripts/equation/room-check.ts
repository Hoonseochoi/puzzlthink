// Plays whole 수식 신호등 and 수식의 탑 rooms through their reducers with a fake clock, and checks the
// equation generator, the colour marks and the tower solver.
// Run: npx tsx scripts/equation/room-check.ts
import { evaluate, generateEquation, isEquation, markGuess } from '../../src/lib/equationSignal';
import { type EqsRoom, EQS_MAX_GUESSES, createEqsRoom, eqsAutoAction, eqsRanking, redactEqsRoom, reduceEqsRoom } from '../../src/lib/equationSignalRoom';
import { applyMove, createBlocks, dealStacks, generateRound, solve, solvedStack } from '../../src/lib/equationTower';
import { type EqtRoom, createEqtRoom, eqtAutoAction, lowestBid, redactEqtRoom, reduceEqtRoom } from '../../src/lib/equationTowerRoom';

let now = 1_000_000;
Date.now = () => now;
const fail = (msg: string) => { console.error('FAIL', msg); process.exit(1); };
const eq = (a: unknown, b: unknown, msg: string) => { if (JSON.stringify(a) !== JSON.stringify(b)) fail(`${msg}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`); };

// ---------- Equations ----------
eq(evaluate('2+3*4'), 14, 'precedence');
eq(evaluate('2^3^2'), 512, 'power is right to left');
eq(evaluate('91^1*0'), 0, 'power before times');
eq(evaluate('0^0'), 1, 'zero power');
eq([evaluate('07+1'), evaluate('3++1'), evaluate('8/0'), evaluate('+3')], [null, null, null, null], 'malformed');
eq([isEquation('6*7-12=30'), isEquation('1*2=2=2*1'), isEquation('91^1*0=91'), isEquation('2^3+1=09'), isEquation('1+1=2')], [true, true, false, false, false], 'isEquation');
eq(markGuess('6*7-12=30', '666666666').join(''), 'grrrrrrrr', 'extra copies are red');
eq(markGuess('6*7-12=30', '7*6-21=30').join(''), 'ygygyyggg', 'yellows');
for (let i = 0; i < 3000; i++) { const e = generateEquation(); if (!isEquation(e)) fail(`bad equation ${e}`); }

// ---------- 수식 신호등 room ----------
const seat = (id: string) => ({ id, name: id, at: 0 });
function signalGame(players: number, solveBy: (seat: number, round: number) => number | null) {
  let s: EqsRoom = createEqsRoom(seat('p0'));
  s = { ...s, seats: s.seats.map((x, i) => (i < players ? { id: `p${i}`, name: `p${i}` } : null)) };
  s = reduceEqsRoom(s, { t: 'config', rounds: 3, roundSec: 120 }, 0, true) ?? fail('config') as never;
  if (reduceEqsRoom(s, { t: 'start' }, 1, false)) fail('guest started');
  s = reduceEqsRoom(s, { t: 'start' }, 0, true) ?? fail('start') as never;
  for (let guard = 0; guard < 5000 && s.phase !== 'finished'; guard++) {
    if (s.phase === 'play') {
      const red = redactEqsRoom(s);
      if (red.answer !== '' || red.rows.some((r) => r.some((row) => row.g !== ''))) fail('redact leaks');
      let moved = false;
      for (const p of s.players) {
        const turn = s.rows[p].length;
        const at = solveBy(p, s.index);
        if (s.places.includes(p) || turn >= EQS_MAX_GUESSES || at === null && turn >= 2) continue;
        const text = at !== null && turn >= at ? s.answer : '123456789';
        const next = reduceEqsRoom(s, { t: 'guess', text }, p, p === 0);
        if (!next) fail('guess refused');
        s = next!; moved = true;
        if (s.phase !== 'play') break;
      }
      if (!moved) { now = s.deadline + 1; s = reduceEqsRoom(s, { t: 'timeout' }, null, true) ?? fail('timeout') as never; }
      continue;
    }
    const auto = eqsAutoAction(s);
    if (auto) s = reduceEqsRoom(s, auto, null, true) ?? fail('auto') as never; else now += 500;
  }
  return s;
}
{
  // Seat 0 always first, seat 1 second, seat 2 never: 3 rounds of 3-2-0.
  const s = signalGame(3, (p) => (p === 0 ? 0 : p === 1 ? 1 : null));
  eq(s.phase, 'finished', 'signal finished');
  eq(s.scores.slice(0, 3), [9, 6, 0], 'signal scores');
  eq(eqsRanking(s), [0, 1, 2], 'signal ranking');
  eq(s.history.length, 3, 'signal history');
  if (reduceEqsRoom(s, { t: 'guess', text: '123456789' }, 0, true)) fail('guess after finish');
  const two = signalGame(2, (p, r) => (p === r % 2 ? 0 : 3));
  eq(two.scores.slice(0, 2), [5, 4], 'two players');
  const bad = createEqsRoom(seat('p0'));
  if (reduceEqsRoom({ ...bad, seats: [bad.seats[0], null, null, null] }, { t: 'start' }, 0, true)) fail('started alone');
}

// ---------- Tower ----------
for (let g = 0; g < 40; g++) {
  const blocks = createBlocks();
  let stacks = dealStacks(blocks);
  for (let i = 0; i < 15; i++) {
    const r = generateRound(stacks, blocks);
    const path = solve(stacks, blocks, r.target, r.floors, 3);
    if (!path || path.length !== r.par || r.par < 1) fail(`par ${JSON.stringify(r)}`);
    if (solve(stacks, blocks, r.target, r.floors, r.par - 1)) fail('par is not the fewest');
    for (const m of path!) stacks = applyMove(stacks, m);
    if (solvedStack(stacks, blocks, r.target, r.floors) < 0) fail('path does not solve');
    if (stacks.flat().length !== 9 || new Set(stacks.flat()).size !== 9) fail('blocks lost');
  }
}

// ---------- 수식의 탑 room ----------
{
  let s: EqtRoom = createEqtRoom(seat('p0'));
  s = { ...s, seats: s.seats.map((x, i) => (i < 3 ? { id: `p${i}`, name: `p${i}` } : null)) };
  s = reduceEqtRoom(s, { t: 'config', goal: 3 }, 0, true) ?? fail('config') as never;
  s = reduceEqtRoom(s, { t: 'start' }, 0, true) ?? fail('start') as never;
  let rounds = 0, sawFail = false, sawOutbid = false, sawSkip = false;
  for (let guard = 0; guard < 20000 && s.phase !== 'finished'; guard++) {
    if (s.phase === 'think') {
      if (redactEqtRoom(s).round!.par !== 0) fail('par leaks');
      const par = s.round!.par;
      rounds++;
      if (rounds === 2) { now = s.deadline + 1; s = reduceEqtRoom(s, { t: 'timeout' }, null, true) ?? fail('think timeout') as never; sawSkip = s.last?.seat === null; continue; }
      // Seat 1 buzzes one move too many; seat 0 undercuts with par; seat 2 passes.
      s = reduceEqtRoom(s, { t: 'bid', n: par + 1 }, 1, false) ?? fail('bid') as never;
      if (reduceEqtRoom(s, { t: 'bid', n: par }, 1, false)) fail('second offer accepted');
      if (reduceEqtRoom(s, { t: 'bid', n: par + 1 }, 0, true)) fail('equal offer accepted');
      if (rounds % 3 === 0) { s = reduceEqtRoom(s, { t: 'pass' }, 0, true)!; s = reduceEqtRoom(s, { t: 'pass' }, 2, false) ?? fail('pass') as never; }
      else { s = reduceEqtRoom(s, { t: 'bid', n: par }, 0, true) ?? fail('outbid') as never; sawOutbid = true; if (s.phase === 'outbid') s = reduceEqtRoom(s, { t: 'pass' }, 2, false) ?? fail('pass2') as never; }
      eq(s.phase, 'act', 'acting');
      eq(s.movesLeft, lowestBid(s), 'moves left');
      continue;
    }
    if (s.phase === 'act') {
      const actor = s.actor!;
      const path = solve(s.stacks, s.blocks, s.round!.target, s.round!.floors, 3)!;
      if (reduceEqtRoom(s, { t: 'move', move: path[0] }, (actor + 1) % 3, false)) fail('someone else moved');
      const before = s.scores[actor];
      if (rounds % 4 === 1 && actor === 0) { now = s.deadline + 1; s = reduceEqtRoom(s, { t: 'timeout' }, null, true) ?? fail('act timeout') as never; eq(s.scores[actor], before - 2, 'undercut miss'); sawFail = true; continue; }
      for (const m of path) { s = reduceEqtRoom(s, { t: 'move', move: m }, actor, actor === 0) ?? fail('move') as never; if (s.phase !== 'act') break; }
      eq(s.phase, 'reveal', 'settled');
      eq(s.scores[actor], before + (actor === s.first ? 1 : 2), 'tower points');
      continue;
    }
    const auto = eqtAutoAction(s);
    if (auto) s = reduceEqtRoom(s, auto, null, true) ?? fail('auto') as never; else now += 500;
  }
  eq(s.phase, 'finished', 'tower finished');
  if (!s.players.some((p) => s.scores[p] >= 3)) fail('nobody reached the goal');
  if (!sawFail || !sawOutbid || !sawSkip) fail(`coverage ${sawFail} ${sawOutbid} ${sawSkip}`);
}
console.log('OK equation rooms');

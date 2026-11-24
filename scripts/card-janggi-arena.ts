// Self-play for 카드 장기: `npx tsx scripts/card-janggi-arena.ts hard:600:1200 greedy 20`
// Sides: hard[:moveMs[:layoutMs]] (the site AI), greedy (wins / takes when it can, else random), random. Plays single rounds, alternating
// who goes first, and checks every state on the way (one 왕 each while the round is on, no piece appears from nowhere,
// layouts valid, the face-down cards never handed to the other side, every round ends).
import {
  CJ_MAX_PLY, type CjGame, type CjSeat, arrange, currentCard, isKing, kingOf, layoutSize, legalMoves, newRound, playMove, randomLayout, redactGame, seatOfPiece, goalOf,
} from '../src/lib/cardJanggi';
import { chooseLayout, chooseMove } from '../src/lib/cardJanggiAi';

type Kind = 'hard' | 'greedy' | 'random';
const [a = 'hard', b = 'greedy', n = '10'] = process.argv.slice(2);
const sides = [a, b].map((x) => { const [kind, move = '600', layout = '1200'] = x.split(':'); return { kind: kind as Kind, move: Number(move), layout: Number(layout) }; });
const kinds = sides.map((x) => x.kind);
const firstWins = [0, 0];

function check(g: CjGame) {
  const kings = [0, 1].map((s) => g.board.filter((p) => p === kingOf(s)).length);
  const pieces = [0, 1].map((s) => g.board.filter((p) => p && seatOfPiece(p) === s).length);
  if (g.phase !== 'over' && (kings[0] !== 1 || kings[1] !== 1)) throw new Error('king count');
  if (pieces.some((c) => c > 4)) throw new Error('piece count');
  if (g.ply > CJ_MAX_PLY) throw new Error('past the limit');
  for (const s of [0, 1]) {
    const view = redactGame(g, 1 - s);
    view.seq[s].forEach((c, i) => { if (c >= 0 && i > g.pos[s] && g.phase !== 'over') throw new Error('hidden card leaked'); });
  }
}

function pickMove(kind: Kind, g: CjGame, me: CjSeat) {
  const card = currentCard(g, me);
  const moves = legalMoves(g.board, me, card);
  if (kind === 'hard') return chooseMove(redactGame(g, me), me, sides[me].move)!;
  if (kind === 'greedy') {
    const win = moves.find(([f, t]) => g.board[t] === kingOf(1 - me) || (isKing(g.board[f]) && t === goalOf(me)));
    if (win) return { from: win[0], to: win[1] };
    const take = moves.filter(([, t]) => g.board[t]);
    const pool = take.length ? take : moves;
    const m = pool[Math.floor(Math.random() * pool.length)];
    return { from: m[0], to: m[1] };
  }
  const m = moves[Math.floor(Math.random() * moves.length)];
  return { from: m[0], to: m[1] };
}

const tally = [0, 0, 0];
const reasons: Record<string, number> = {};
let plies = 0, slowMove = 0, slowLayout = 0;
for (let r = 0; r < Number(n); r += 1) {
  const first = (r % 2) as CjSeat;
  let g = newRound(first);
  while (g.phase !== 'over') {
    check(g);
    if (g.phase === 'arrange') {
      for (const s of [0, 1] as CjSeat[]) {
        if (!g.arranging[s]) continue;
        const t0 = performance.now();
        const order = kinds[s] === 'hard' ? chooseLayout(redactGame(g, s), s, sides[s].layout) : randomLayout(g, s);
        slowLayout = Math.max(slowLayout, performance.now() - t0);
        if (order.length !== layoutSize(g, s)) throw new Error('layout size');
        const next = arrange(g, s, order);
        if (!next) throw new Error('bad layout ' + order);
        g = next;
      }
    } else {
      const me = g.turn;
      const t0 = performance.now();
      const m = pickMove(kinds[me], g, me);
      slowMove = Math.max(slowMove, performance.now() - t0);
      const next = playMove(g, m.from, m.to);
      if (!next) throw new Error('illegal move');
      g = next;
    }
  }
  check(g);
  plies += g.ply;
  tally[g.winner === 'draw' ? 2 : (g.winner as number)] += 1;
  if (g.winner !== 'draw') firstWins[g.winner === first ? 0 : 1] += 1;
  reasons[g.reason!] = (reasons[g.reason!] ?? 0) + 1;
  process.stdout.write(`${g.winner === 'draw' ? 'D' : g.winner === 0 ? 'A' : 'B'}`);
}
console.log(`\n${a} ${tally[0]} : ${tally[1]} ${b} (draws ${tally[2]}) · ${JSON.stringify(reasons)} · avg ${(plies / Number(n)).toFixed(1)} plies · 선 ${firstWins[0]} / 후 ${firstWins[1]} · slowest move ${slowMove.toFixed(0)}ms, layout ${slowLayout.toFixed(0)}ms`);

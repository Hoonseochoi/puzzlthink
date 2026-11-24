// "필승 꿀팁" for 카드 장기: rebuild a player's past positions from the finished rounds (as that player saw them),
// and check the match against the general tips.
import { type CjGame, type CjMove, isKing, kingOf, legalMoves, other, redactGame, startBoard, goalOf } from './cardJanggi';
import type { CjRoundResult } from './cardJanggiRoom';

export type CjSpot = { round: number; index: number; before: CjGame; played: [number, number]; card: number };

/** The position before move `k` of a finished round, as the mover saw it (the other side's face-down cards hidden). */
export function positionBefore(result: CjRoundResult, k: number): CjGame | null {
  const history = result.history ?? [];
  const layouts = result.layouts ?? [[], []];
  const move = history[k];
  if (!move) return null;
  const board = startBoard();
  const used = [0, 0];
  for (let i = 0; i < k; i += 1) {
    const m = history[i];
    used[m.seat] += 1;
    if (m.pass) continue;
    board[m.to] = board[m.from]; board[m.from] = 0;
  }
  const seq: number[][] = [[], []], past: number[][][] = [[], []];
  const pos: [number, number] = [0, 0], cycle: [number, number] = [0, 0];
  for (const s of [0, 1]) {
    const cycles = layouts[s] ?? [];
    let c = 0, p = used[s];
    while (c < cycles.length - 1 && p >= cycles[c].length) { p -= cycles[c].length; c += 1; }
    if (!cycles[c] || p >= cycles[c].length) return null;
    seq[s] = cycles[c]; pos[s] = p; cycle[s] = c + 1; past[s] = cycles.slice(0, c);
  }
  const g: CjGame = {
    board, first: result.first, phase: 'move', turn: move.seat, arranging: [false, false], seq, past, pos, cycle,
    ply: k, history: history.slice(0, k), winner: null, reason: null,
  };
  return redactGame(g, move.seat);
}

/** `seat`'s real choices (more than one legal move), latest round first and latest move first. */
export function spotsFor(results: CjRoundResult[], seat: number, limit = 10): CjSpot[] {
  const out: CjSpot[] = [];
  for (let r = results.length - 1; r >= 0 && out.length < limit; r -= 1) {
    const history = results[r].history ?? [];
    for (let k = history.length - 1; k >= 0 && out.length < limit; k -= 1) {
      const m = history[k];
      if (m.seat !== seat || m.pass || m.proxy) continue;
      const before = positionBefore(results[r], k);
      if (!before || legalMoves(before.board, seat, m.card).length < 2) continue;
      out.push({ round: r, index: k, before, played: [m.from, m.to], card: m.card });
    }
  }
  return out;
}

/** Which general tips this match bears out, for `seat`. */
export type CjTipChecks = {
  takenKing: boolean; // lost a round to a 왕 capture (the face-up card had it in reach)
  reached: boolean; // lost a round to the enemy 왕 reaching the home square
  droppedCard: number | null; // as 후 in a lost round: the card left out of the first layout
  missedWin: boolean; // had a winning move (take the 왕 / reach the goal) and played something else
  lastCardBlow: boolean; // the opponent's winning move was the last card of its layout
};

export function checkTips(results: CjRoundResult[], seat: number): CjTipChecks {
  const out: CjTipChecks = { takenKing: false, reached: false, droppedCard: null, missedWin: false, lastCardBlow: false };
  const opp = other(seat);
  results.forEach((r) => {
    const history = r.history ?? [];
    const lost = r.winner === opp;
    if (lost && r.reason === 'capture') out.takenKing = true;
    if (lost && r.reason === 'goal') out.reached = true;
    if (lost && r.first !== seat) {
      const firstLayout = r.layouts?.[seat]?.[0];
      if (firstLayout?.length === 4) out.droppedCard = [0, 1, 2, 3, 4].find((c) => !firstLayout.includes(c)) ?? null;
    }
    if (lost && history.length) {
      // The deciding move was the opponent's n-th card this round: was it the last one of a layout?
      const usedBefore = history.filter((m, i) => i < history.length - 1 && m.seat === opp).length + 1;
      let left = usedBefore;
      for (const cycle of r.layouts?.[opp] ?? []) { if (left === cycle.length) { out.lastCardBlow = true; break; } if (left < cycle.length) break; left -= cycle.length; }
    }
    // Replay to find a winning move that was there and not played.
    const board = startBoard();
    history.forEach((m: CjMove) => {
      if (m.seat === seat && !m.pass) {
        const moves = legalMoves(board, seat, m.card);
        const wins = (f: number, t: number) => board[t] === kingOf(opp) || (isKing(board[f]) && t === goalOf(seat));
        if (moves.some(([f, t]) => wins(f, t)) && !wins(m.from, m.to)) out.missedWin = true;
      }
      if (!m.pass) { board[m.to] = board[m.from]; board[m.from] = 0; }
    });
  });
  return out;
}


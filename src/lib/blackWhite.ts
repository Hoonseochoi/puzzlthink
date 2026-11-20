// 흑과 백 (Black & White): two players each hold tiles 0–8. Even tiles are black, odd tiles are white.
// Each round the leader lays a tile face down; everyone sees only its colour. The other player answers
// with a tile of their own. The higher number takes the round's point (equal numbers: no point).
// Nobody learns the other's numbers during the game: only colours and who won each round.
// The round winner leads the next round (after a draw the same leader leads again).
// The game ends after 9 rounds, or as soon as one player's lead can no longer be caught.

export const TILES: readonly number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];
export const ROUNDS = TILES.length;
export type Side = 0 | 1;
export type BWColor = 'black' | 'white';
export type BWRound = { leader: Side; tiles: [number, number]; colors: [BWColor, BWColor]; winner: Side | null };
export type BWDifficulty = 'easy' | 'normal' | 'hard';

export const colorOf = (n: number): BWColor => (n % 2 === 0 ? 'black' : 'white');
export const other = (side: Side): Side => (side === 0 ? 1 : 0);

export const scoresOf = (rounds: BWRound[]): [number, number] => {
  const s: [number, number] = [0, 0];
  for (const r of rounds) if (r.winner !== null) s[r.winner] += 1;
  return s;
};

/** Tiles a side has not played yet. `extra` is a tile laid this round but not yet resolved. */
export const handOf = (rounds: BWRound[], side: Side, extra: number | null = null) =>
  TILES.filter((n) => n !== extra && !rounds.some((r) => r.tiles[side] === n));

/** Leader of the next round: the last winner, or the same leader after a draw. */
export const nextLeader = (rounds: BWRound[], first: Side): Side => {
  const last = rounds.at(-1);
  return !last ? first : last.winner ?? last.leader;
};

/** Over when 9 rounds are played or a lead is bigger than the rounds left. */
export function isOver(rounds: BWRound[]) {
  const [a, b] = scoresOf(rounds);
  return rounds.length >= ROUNDS || Math.abs(a - b) > ROUNDS - rounds.length;
}

export function winnerOf(rounds: BWRound[]): Side | 'draw' | null {
  if (!isOver(rounds)) return null;
  const [a, b] = scoresOf(rounds);
  return a === b ? 'draw' : a > b ? 0 : 1;
}

export function resolveRound(leader: Side, leadTile: number, followTile: number): BWRound {
  const tiles = (leader === 0 ? [leadTile, followTile] : [followTile, leadTile]) as [number, number];
  const winner: Side | null = tiles[0] === tiles[1] ? null : tiles[0] > tiles[1] ? 0 : 1;
  return { leader, tiles, colors: [colorOf(tiles[0]), colorOf(tiles[1])], winner };
}

/** Colours a side still holds, as counts. Both players can work this out from the colours shown. */
export const colorsLeft = (rounds: BWRound[], side: Side, extra: BWColor | null = null) => {
  let black = 5, white = 4;
  for (const r of rounds) if (r.colors[side] === 'black') black -= 1; else white -= 1;
  if (extra === 'black') black -= 1; else if (extra === 'white') white -= 1;
  return { black, white };
};

// ---------------------------------------------------------------------------------------------
// AI. It sees exactly what a player sees: its own tiles, the other side's colours and each result.
// From those it lists every sequence of tiles the other side could have played, then plays out the
// rest of the game many times from sampled hidden states and picks the tile that wins most often.

type Rand = () => number;

/** Every tile sequence the other side may have played so far, consistent with colours and results. */
export function possibleHistories(rounds: BWRound[], me: Side, limit = 6000): number[][] {
  const opp = other(me);
  const out: number[][] = [];
  const seq: number[] = [];
  const used = new Set<number>();
  const walk = (i: number) => {
    if (out.length >= limit) return;
    if (i === rounds.length) { out.push([...seq]); return; }
    const r = rounds[i];
    const mine = r.tiles[me];
    for (const o of TILES) {
      if (used.has(o) || colorOf(o) !== r.colors[opp]) continue;
      const winner: Side | null = o === mine ? null : (o > mine ? opp : me);
      if (winner !== r.winner) continue;
      used.add(o); seq.push(o);
      walk(i + 1);
      seq.pop(); used.delete(o);
    }
  };
  walk(0);
  return out;
}

/** For each tile, how likely it is that the other side still holds it (0–1), from the possible histories. */
export function holdChances(rounds: BWRound[], me: Side): number[] {
  const histories = possibleHistories(rounds, me);
  const counts = TILES.map(() => 0);
  if (!histories.length) return TILES.map(() => 1);
  for (const h of histories) for (const n of TILES) if (!h.includes(n)) counts[n] += 1;
  return counts.map((c) => c / histories.length);
}

const pick = <T,>(list: T[], rand: Rand) => list[Math.floor(rand() * list.length)];

/** Quick answer used inside play-outs: knows the leader's colour and roughly what they hold. */
function quickFollow(hand: number[], candidates: number[], rand: Rand): number {
  if (!candidates.length) return pick(hand, rand);
  let best = hand[0], bestScore = -Infinity;
  for (const t of hand) {
    const win = candidates.filter((c) => c < t).length / candidates.length;
    const lose = candidates.filter((c) => c > t).length / candidates.length;
    // Winning is worth a point; spending a big tile costs future rounds.
    const score = win - lose * 0.15 - t * 0.07 + rand() * 0.12;
    if (score > bestScore) { bestScore = score; best = t; }
  }
  // When winning is unlikely, throw away the smallest tile instead.
  const bestWin = candidates.filter((c) => c < best).length / candidates.length;
  return bestWin < 0.3 ? Math.min(...hand) : best;
}

function quickLead(hand: number[], rand: Rand): number {
  // Mostly mid and low tiles, sometimes a big one.
  const sorted = [...hand].sort((a, b) => a - b);
  const r = rand();
  return sorted[Math.min(sorted.length - 1, Math.floor(r * r * sorted.length * 1.3))];
}

/** Plays the game out from here with quick choices; returns 1 / 0.5 / 0 for `me`. */
function playOut(rounds: BWRound[], first: Side, me: Side, hands: [number[], number[]], rand: Rand): number {
  const rs = [...rounds];
  const h: [number[], number[]] = [[...hands[0]], [...hands[1]]];
  while (!isOver(rs)) {
    const leader = nextLeader(rs, first);
    const follower = other(leader);
    const lead = quickLead(h[leader], rand);
    const follow = quickFollow(h[follower], h[leader].filter((n) => colorOf(n) === colorOf(lead)), rand);
    h[leader] = h[leader].filter((n) => n !== lead);
    h[follower] = h[follower].filter((n) => n !== follow);
    rs.push(resolveRound(leader, lead, follow));
  }
  const w = winnerOf(rs);
  return w === 'draw' ? 0.5 : w === me ? 1 : 0;
}

/**
 * The AI's tile for this round. `leadColor` is the colour the other side just laid when they lead;
 * null when the AI leads. `first` is who led round 1 (needed to play the game out).
 */
export function chooseAiTile(rounds: BWRound[], me: Side, first: Side, leadColor: BWColor | null, level: BWDifficulty, rand: Rand = Math.random): number {
  const myHand = handOf(rounds, me);
  if (myHand.length === 1) return myHand[0];
  const opp = other(me);

  if (level === 'easy') {
    // Plays by feel: a random tile half the time, otherwise a simple colour-aware choice.
    if (rand() < 0.5) return pick(myHand, rand);
    if (!leadColor) return quickLead(myHand, rand);
    return quickFollow(myHand, handOf(rounds, opp).filter((n) => colorOf(n) === leadColor), rand);
  }

  const histories = possibleHistories(rounds, me);
  const samples = level === 'hard' ? 700 : 60;
  const scores = new Map<number, number>(myHand.map((t) => [t, 0]));
  for (let s = 0; s < samples; s += 1) {
    const history = histories.length ? pick(histories, rand) : [];
    let oppHand = TILES.filter((n) => !history.includes(n));
    if (!histories.length) oppHand = handOf(rounds, opp); // should not happen; fall back to "anything left"
    let lead: number | null = null;
    if (leadColor) {
      const options = oppHand.filter((n) => colorOf(n) === leadColor);
      if (!options.length) continue;
      lead = pick(options, rand);
    }
    for (const t of myHand) {
      let round: BWRound;
      let oh = oppHand;
      if (lead !== null) { round = resolveRound(opp, lead, t); oh = oppHand.filter((n) => n !== lead); }
      else {
        const reply = quickFollow(oppHand, myHand.filter((n) => colorOf(n) === colorOf(t)), rand);
        round = resolveRound(me, t, reply);
        oh = oppHand.filter((n) => n !== reply);
      }
      const rs = [...rounds, round];
      const hands: [number[], number[]] = me === 0 ? [myHand.filter((n) => n !== t), oh] : [oh, myHand.filter((n) => n !== t)];
      scores.set(t, scores.get(t)! + playOut(rs, first, me, hands, rand));
    }
  }
  // Softmax over win rates, so the AI is hard to read. Play data showed people beat the old, sharper hard
  // more often than normal (66% vs 51% for the same players): a near-fixed choice gets learned and exploited.
  // Hard now mixes more on top of a more accurate estimate; normal estimates more roughly.
  const temp = level === 'hard' ? 0.08 : 0.11;
  const entries = [...scores.entries()].map(([t, v]) => [t, v / samples] as const);
  const top = Math.max(...entries.map(([, v]) => v));
  const weights = entries.map(([t, v]) => [t, Math.exp((v - top) / temp)] as const);
  const sum = weights.reduce((a, [, w]) => a + w, 0);
  let r = rand() * sum;
  for (const [t, w] of weights) { r -= w; if (r <= 0) return t; }
  return entries[0][0];
}

// ---------------------------------------------------------------------------------------------
// Post-game reading: what each round looked like once the numbers are revealed.

export type RoundRead = 'draw' | 'edge' | 'bait' | 'overkill' | 'solid';

/** How a round went, seen from the winner's side. */
export function readRound(r: BWRound): RoundRead {
  if (r.winner === null) return 'draw';
  const win = r.tiles[r.winner], lose = r.tiles[other(r.winner)];
  if (win - lose === 1) return 'edge'; // by the smallest possible margin
  if (lose <= 1 && win >= 6) return 'bait'; // the loser threw away a tiny tile and drew out a big one
  if (win - lose >= 5) return 'overkill';
  return 'solid';
}

export type GameRead = {
  scores: [number, number];
  diff: number; // my score minus theirs
  waste: [number, number]; // margin spent above what was needed, on rounds each side won
  baits: [number, number]; // rounds each side lost on purpose cheaply (≤1 against ≥6)
  edges: [number, number]; // rounds each side won by exactly one
  decisive: number | null; // round index that settled the game
  verdict: 'perfect' | 'power' | 'close' | 'outread' | 'even';
};

export function readGame(rounds: BWRound[], me: Side): GameRead {
  const scores = scoresOf(rounds);
  const waste: [number, number] = [0, 0], baits: [number, number] = [0, 0], edges: [number, number] = [0, 0];
  for (const r of rounds) {
    if (r.winner === null) continue;
    const w = r.winner, l = other(w);
    waste[w] += r.tiles[w] - r.tiles[l] - 1;
    if (readRound(r) === 'bait') baits[l] += 1;
    if (readRound(r) === 'edge') edges[w] += 1;
  }
  let decisive: number | null = null;
  for (let i = 1; i <= rounds.length; i += 1) if (isOver(rounds.slice(0, i))) { decisive = i - 1; break; }
  const diff = scores[me] - scores[other(me)];
  const opp = other(me);
  const verdict = diff === 0 ? 'even'
    : diff > 0 ? (waste[me] <= waste[opp] || baits[me] + edges[me] >= 2 ? 'perfect' : 'power')
      : (diff >= -1 ? 'close' : 'outread');
  return { scores, diff, waste, baits, edges, decisive, verdict };
}

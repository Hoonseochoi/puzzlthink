// 흑과 백 (Black & White): two players each hold tiles 0–8. Even tiles are black, odd tiles are white.
// Each round the leader lays a tile face down; everyone sees only its colour. The other player answers
// with a tile of their own. The higher number takes the round's point (equal numbers: no point).
// Nobody learns the other's numbers during the game: only colours and who won each round.
// The round winner leads the next round (after a draw the same leader leads again).
// The game ends after 9 rounds, or as soon as one player's lead can no longer be caught.

import { type PersonaId, type PersonaMatch } from './aiPersona';

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
function quickFollow(hand: number[], candidates: number[], rand: Rand, eager = 0): number {
  if (!candidates.length) return pick(hand, rand);
  let best = hand[0], bestScore = -Infinity;
  for (const t of hand) {
    const win = candidates.filter((c) => c < t).length / candidates.length;
    const lose = candidates.filter((c) => c > t).length / candidates.length;
    // Winning is worth a point; spending a big tile costs future rounds. `eager` (−1..1): this player has been
    // shown to answer harder (or softer) than that.
    const score = win * (1 + 0.6 * eager) - lose * 0.15 - t * 0.07 + rand() * 0.12;
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
export function chooseAiTile(rounds: BWRound[], me: Side, first: Side, leadColor: BWColor | null, level: BWDifficulty, rand: Rand = Math.random, persona?: PersonaMatch): number {
  const myHand = handOf(rounds, me);
  if (myHand.length === 1) return myHand[0];
  const opp = other(me);

  // 보통 plays one tile in four by feel (the simple colour-aware choice below), the rest like 어려움.
  if (level === 'easy' || (level === 'normal' && rand() < 0.25)) {
    // Plays by feel: a random tile half the time (easy only), otherwise a simple colour-aware choice.
    if (level === 'easy' && rand() < 0.5) return pick(myHand, rand);
    if (!leadColor) return quickLead(myHand, rand);
    return quickFollow(myHand, handOf(rounds, opp).filter((n) => colorOf(n) === leadColor), rand);
  }

  const histories = possibleHistories(rounds, me);
  // Play data, twice over: the sharper the estimate, the more people won (700 samples: 47% wins and 24% draws for
  // people; 60 samples: 41% and 20%; for people who played both, 51% vs 46%). A precise estimate repeats itself and
  // gets read; a rough one mixes its tiles. So every level now uses the rough estimate.
  // A persona plays from a sharper estimate (its style, not a fixed choice, is what keeps it from being read).
  const samples = persona ? BW_PERSONA_TUNING.samples : 60;
  // What this player has shown this match (colours and results only): leads that keep winning are high leads,
  // answers that keep winning are hard answers. Without a persona the AI plays as before (no read).
  const habit = persona ? readBwHabits(rounds, me) : { leadTilt: 0, eager: 0 };
  const scores = new Map<number, number>(myHand.map((t) => [t, 0]));
  for (let s = 0; s < samples; s += 1) {
    const history = histories.length ? pick(histories, rand) : [];
    let oppHand = TILES.filter((n) => !history.includes(n));
    if (!histories.length) oppHand = handOf(rounds, opp); // should not happen; fall back to "anything left"
    let lead: number | null = null;
    if (leadColor) {
      const options = oppHand.filter((n) => colorOf(n) === leadColor);
      if (!options.length) continue;
      lead = habit.leadTilt ? pickTilted(options, habit.leadTilt, rand) : pick(options, rand);
    }
    for (const t of myHand) {
      let round: BWRound;
      let oh = oppHand;
      if (lead !== null) { round = resolveRound(opp, lead, t); oh = oppHand.filter((n) => n !== lead); }
      else {
        const reply = quickFollow(oppHand, myHand.filter((n) => colorOf(n) === colorOf(t)), rand, habit.eager);
        round = resolveRound(me, t, reply);
        oh = oppHand.filter((n) => n !== reply);
      }
      const rs = [...rounds, round];
      const hands: [number[], number[]] = me === 0 ? [myHand.filter((n) => n !== t), oh] : [oh, myHand.filter((n) => n !== t)];
      scores.set(t, scores.get(t)! + playOut(rs, first, me, hands, rand));
    }
  }
  // Softmax over win rates, so the AI is hard to read: a near-fixed choice gets learned and exploited.
  // A persona adds its small style preference (a few points of win rate at most) and its own temperature.
  const style = persona ? bwStyle(persona, rounds, me, myHand, !leadColor, rand) : null;
  const temp = style?.temp ?? 0.11;
  const entries = [...scores.entries()].map(([t, v]) => [t, v / samples + (style?.bonus(t, v / samples) ?? 0)] as const);
  const top = Math.max(...entries.map(([, v]) => v));
  const weights = entries.map(([t, v]) => [t, Math.exp((v - top) / temp)] as const);
  const sum = weights.reduce((a, [, w]) => a + w, 0);
  let r = rand() * sum;
  for (const [t, w] of weights) { r -= w; if (r <= 0) return t; }
  return entries[0][0];
}

// ---------------------------------------------------------------------------------------------
// Personas. Same estimate as above for all of them; a persona only leans between tiles the estimate rates close.

/** A tile from `options`, leaning toward high ones (tilt > 0) or low ones (tilt < 0). */
function pickTilted(options: number[], tilt: number, rand: Rand) {
  const w = options.map((n) => Math.exp(tilt * (n - 4) / 4));
  let r = rand() * w.reduce((a, x) => a + x, 0);
  for (let i = 0; i < options.length; i += 1) { r -= w[i]; if (r <= 0) return options[i]; }
  return options[options.length - 1];
}

/**
 * The other side's habits from visible information: how often its leads win (high leads) and how often its answers
 * win (hard answers), each against the evens a tile-blind player would get. Smoothed, so a few rounds say little.
 */
export function readBwHabits(rounds: BWRound[], me: Side) {
  const opp = other(me);
  let leads = 0, leadWins = 0, answers = 0, answerWins = 0;
  for (const r of rounds) {
    if (r.winner === null) continue;
    if (r.leader === opp) { leads += 1; if (r.winner === opp) leadWins += 1; } else { answers += 1; if (r.winner === opp) answerWins += 1; }
  }
  const lean = (hits: number, n: number) => ((hits + 1.5) / (n + 3) - 0.5) * 2; // −1..1, 0 with no data
  return { leadTilt: Math.max(-1.2, Math.min(1.2, lean(leadWins, leads) * 1.6)), eager: Math.max(-1, Math.min(1, lean(answerWins, answers))) };
}

/**
 * How each persona leans, as a bonus in win-rate units (at most ~0.05) on a tile's rank in the hand (0 = lowest,
 * 1 = highest), plus its softmax temperature. Now and then (8%) it drops the lean altogether, so a style is a
 * tendency to read, never a certainty.
 */
/** Tuning knobs (exported for the arena script). */
export const BW_PERSONA_TUNING = { samples: 160, lean: 0.11 };

function bwStyle(p: PersonaMatch, rounds: BWRound[], me: Side, hand: number[], leading: boolean, rand: Rand) {
  const sorted = [...hand].sort((a, b) => a - b);
  const q = (t: number) => (sorted.length > 1 ? sorted.indexOf(t) / (sorted.length - 1) : 0.5);
  const round = rounds.length;
  const [a, b] = scoresOf(rounds);
  const diff = me === 0 ? a - b : b - a;
  const size = BW_PERSONA_TUNING.lean * p.vary('bwLean', 0.3) * (1 + 0.25 * p.mood);
  const base = 0.11 * (1 + 0.1 * p.mood);
  if (rand() < 0.08) return { temp: 0.13, bonus: () => 0 };
  const noise = new Map(hand.map((t) => [t, rand() * 2 - 1]));
  const lean: Record<PersonaId, { temp: number; f: (x: number, t: number, v: number) => number }> = {
    calc: { temp: 0.08, f: () => 0 },
    aggro: { temp: base, f: (x, _t, v) => (leading ? 0.7 * x : v > 0.5 ? 0.75 * x : -0.25 * x) },
    careful: { temp: base, f: (x) => -0.8 * x },
    bluffer: { temp: base * 1.1, f: (x) => (leading ? 0.8 * Math.abs(2 * x - 1) : 0) },
    trap: { temp: base, f: (x) => (leading ? 1 - x : 0) },
    // Behind, it takes its risk as variance (any close tile may come), not as overspending; ahead, it saves.
    chaser: { temp: diff < 0 ? base * 1.5 : base, f: (x) => (diff < 0 ? 0 : diff > 0 ? -0.8 * x : -0.2 * x) },
    whim: { temp: base * 1.3, f: (_x, t) => noise.get(t)! },
    grinder: { temp: base, f: (x) => 0.8 * (1 - Math.abs(2 * x - 1)) },
    opener: { temp: base, f: (x) => (round < 4 ? 0.75 * x : -0.5 * x) },
    closer: { temp: base, f: (x) => (round < 5 ? -x : x) },
  };
  const l = lean[p.id];
  return { temp: l.temp, bonus: (t: number, v: number) => size * l.f(q(t), t, v) };
}

/** How to read each persona in 흑과 백 (for the result screen and the guide). */
export const BW_TELLS: Record<PersonaId, { ko: string; en: string }> = {
  calc: { ko: '가장 승률 높은 타일만 냅니다. 흔들림이 적은 대신 교과서적인 수가 많아요.', en: 'Plays the best-rated tile; few surprises, many textbook moves.' },
  aggro: { ko: '이길 수 있는 판이면 큰 숫자로 확실히 가져갑니다. 초반에 큰 수가 빠지면 후반이 비어요.', en: 'Takes winnable rounds with big tiles; after an early spree its late hand is thin.' },
  careful: { ko: '큰 숫자를 끝까지 아낍니다. 작은 수로 진 판이 많다면 아직 큰 수가 남아 있다는 뜻이에요.', en: 'Hoards big tiles; many cheap losses mean the big ones are still there.' },
  bluffer: { ko: '선공에서 아주 크거나 아주 작은 숫자를 섞습니다. 색만 보고는 크기를 짐작하기 어려워요.', en: 'Leads either very high or very low; the colour says little about size.' },
  trap: { ko: '선공에서 작은 숫자로 큰 수를 끌어냅니다. 선공 판을 쉽게 내준다면 함정을 의심하세요.', en: 'Leads low to draw out your big tiles; cheap lead losses are bait.' },
  chaser: { ko: '앞서면 큰 숫자를 꽁꽁 아끼고, 뒤처지면 수가 갑자기 예측하기 어려워집니다.', en: 'Hoards big tiles when ahead; when behind its play suddenly gets hard to predict.' },
  whim: { ko: '비슷한 수 사이에서 매번 다르게 고릅니다. 패턴 대신 남은 타일 수를 세는 게 답이에요.', en: 'Picks differently each time between close tiles; count tiles, not patterns.' },
  grinder: { ko: '중간 숫자로 작은 차이를 노립니다. 무승부와 1점 차 판이 많아요.', en: 'Plays middle tiles for small edges: many draws and one-point rounds.' },
  opener: { ko: '첫 네 판에 큰 숫자를 씁니다. 초반을 버티면 후반엔 작은 수만 남아요.', en: 'Spends big in the first four rounds; survive them and its late hand is small.' },
  closer: { ko: '초반엔 작은 숫자로 흘려보내고 5라운드부터 큰 수를 꺼냅니다.', en: 'Lets early rounds go cheaply and brings the big tiles from round 5.' },
};

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

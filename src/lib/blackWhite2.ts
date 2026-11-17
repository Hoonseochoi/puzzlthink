// 흑과 백 II: both players start with 99 points and secretly split them across nine rounds.
// A one-digit bid is shown as black, a two-digit bid as white. Exact bids stay hidden until the
// game ends, while each player's remaining-point gauge (five 20-point bands) is always public.

export type BW2Side = 0 | 1;
export type BW2Color = 'black' | 'white';
export type BW2Stage = 'main' | 'overtime';
export type BW2Difficulty = 'easy' | 'normal' | 'hard';

export const BW2_MAIN_POINTS = 99;
export const BW2_OVERTIME_POINTS = 33;
export const BW2_MAIN_ROUNDS = 9;
export const BW2_OVERTIME_ROUNDS = 3;
export const BW2_WIN_SCORE = 5;

export type BW2Round = {
  stage: BW2Stage;
  leader: BW2Side;
  bids: [number, number];
  colors: [BW2Color, BW2Color];
  winner: BW2Side | null;
  remainingAfter: [number, number];
  gaugesAfter: [number, number];
};

export const bw2Other = (side: BW2Side): BW2Side => (side === 0 ? 1 : 0);
export const bw2ColorOf = (points: number): BW2Color => (points < 10 ? 'black' : 'white');

/** Five public bands: 0–19 / 20–39 / 40–59 / 60–79 / 80–99. */
export const bw2GaugeOf = (points: number) => Math.max(1, Math.min(5, Math.floor(Math.max(0, points) / 20) + 1));

export const bw2ScoresOf = (rounds: BW2Round[]): [number, number] => {
  const score: [number, number] = [0, 0];
  for (const round of rounds) if (round.winner !== null) score[round.winner] += 1;
  return score;
};

export const bw2StageRounds = (rounds: BW2Round[], stage: BW2Stage) => rounds.filter((round) => round.stage === stage);

export function bw2StageOf(rounds: BW2Round[]): BW2Stage {
  const main = bw2StageRounds(rounds, 'main');
  const score = bw2ScoresOf(main);
  return main.length >= BW2_MAIN_ROUNDS && score[0] === score[1] ? 'overtime' : 'main';
}

export function bw2BanksOf(rounds: BW2Round[], stage = bw2StageOf(rounds)): [number, number] {
  const stageRounds = bw2StageRounds(rounds, stage);
  if (stageRounds.length) return [...stageRounds.at(-1)!.remainingAfter] as [number, number];
  const start = stage === 'main' ? BW2_MAIN_POINTS : BW2_OVERTIME_POINTS;
  return [start, start];
}

export function bw2NextLeader(rounds: BW2Round[], first: BW2Side): BW2Side {
  const last = rounds.at(-1);
  return !last ? first : last.winner ?? last.leader;
}

export function bw2ResolveRound(stage: BW2Stage, leader: BW2Side, leadBid: number, followBid: number, remainingAfter: [number, number]): BW2Round {
  const bids = (leader === 0 ? [leadBid, followBid] : [followBid, leadBid]) as [number, number];
  const winner: BW2Side | null = bids[0] === bids[1] ? null : bids[0] > bids[1] ? 0 : 1;
  return {
    stage,
    leader,
    bids,
    colors: [bw2ColorOf(bids[0]), bw2ColorOf(bids[1])],
    winner,
    remainingAfter,
    gaugesAfter: [bw2GaugeOf(remainingAfter[0]), bw2GaugeOf(remainingAfter[1])],
  };
}

export function bw2IsOver(rounds: BW2Round[]) {
  const score = bw2ScoresOf(rounds);
  if (score[0] >= BW2_WIN_SCORE || score[1] >= BW2_WIN_SCORE) return true;
  const main = bw2StageRounds(rounds, 'main');
  if (main.length < BW2_MAIN_ROUNDS) return false;
  if (score[0] !== score[1]) return true;
  return bw2StageRounds(rounds, 'overtime').length >= BW2_OVERTIME_ROUNDS;
}

export function bw2WinnerOf(rounds: BW2Round[]): BW2Side | 'draw' | null {
  if (!bw2IsOver(rounds)) return null;
  const score = bw2ScoresOf(rounds);
  return score[0] === score[1] ? 'draw' : score[0] > score[1] ? 0 : 1;
}

export const bw2RoundsLeft = (rounds: BW2Round[], stage = bw2StageOf(rounds)) => {
  const cap = stage === 'main' ? BW2_MAIN_ROUNDS : BW2_OVERTIME_ROUNDS;
  return Math.max(1, cap - bw2StageRounds(rounds, stage).length);
};

// -------------------------------------------------------------------------------------------------
// AI. It is deliberately fed public information only: its exact bank, the rival's public gauge,
// shown colours/results and (when replying) the colour and updated gauge of the leading bid.

type Rand = () => number;
type AiInput = {
  rounds: BW2Round[];
  me: BW2Side;
  first: BW2Side;
  stage: BW2Stage;
  myBank: number;
  opponentGauge: number;
  lead: { color: BW2Color; gaugeAfter: number } | null;
  level: BW2Difficulty;
  rand?: Rand;
};

const clampBid = (n: number, bank: number) => Math.max(0, Math.min(bank, Math.round(n)));
const randomInt = (max: number, rand: Rand) => Math.floor(rand() * (max + 1));
const jitter = (n: number, spread: number, bank: number, rand: Rand) => clampBid(n + (rand() * 2 - 1) * spread, bank);

const gaugeRange = (level: number, cap: number): [number, number] => {
  const low = level <= 1 ? 0 : (level - 1) * 20;
  const high = Math.min(cap, level * 20 - 1);
  return [Math.min(low, high), Math.max(low, high)];
};

function chooseLead(input: AiInput, rand: Rand) {
  const { rounds, me, stage, myBank, opponentGauge, level } = input;
  const left = bw2RoundsLeft(rounds, stage);
  const score = bw2ScoresOf(rounds);
  const diff = score[me] - score[bw2Other(me)];

  if (level === 'easy') {
    const cap = Math.min(myBank, Math.max(12, Math.ceil(myBank / left) * 2));
    return randomInt(cap, rand);
  }

  let target = myBank / Math.max(1, left);
  if (diff < 0) target += Math.min(8, -diff * 3);
  if (diff > 1) target -= 3;
  if (score[bw2Other(me)] === 4) target += 8;

  // Mix black probes, boundary bluffs and honest white pressure so patterns are not deterministic.
  const roll = rand();
  if (roll < (level === 'hard' ? 0.28 : 0.18) && myBank >= 9) return jitter(8, 1.4, myBank, rand);
  if (roll < (level === 'hard' ? 0.48 : 0.34) && myBank >= 10) return jitter(10, 1.2, myBank, rand);
  if (level === 'hard' && opponentGauge < bw2GaugeOf(myBank) && rand() < 0.3) target += 5;
  return jitter(target, level === 'hard' ? 4 : 7, myBank, rand);
}

function chooseFollow(input: AiInput, rand: Rand) {
  const { rounds, me, stage, myBank, opponentGauge, lead, level } = input;
  if (!lead) return chooseLead(input, rand);
  const left = bw2RoundsLeft(rounds, stage);
  const score = bw2ScoresOf(rounds);
  const myScore = score[me], theirScore = score[bw2Other(me)];
  const mustFight = theirScore === 4 || (stage === 'overtime' && left === 1 && myScore <= theirScore);

  if (level === 'easy') {
    if (lead.color === 'black' && myBank >= 10 && rand() < 0.55) return 10;
    return randomInt(Math.min(myBank, Math.max(12, Math.ceil(myBank / left) * 2)), rand);
  }

  if (lead.color === 'black') {
    if (myBank >= 10 && (mustFight || rand() < (level === 'hard' ? 0.66 : 0.52))) return jitter(10, 0.7, myBank, rand);
    return jitter(level === 'hard' ? 8 : 7, 1.8, myBank, rand);
  }

  const cap = stage === 'main' ? BW2_MAIN_POINTS : BW2_OVERTIME_POINTS;
  const [low, high] = gaugeRange(opponentGauge, cap);
  const estimatedRemaining = (low + high) / 2;
  const estimatedBid = Math.max(10, (cap - estimatedRemaining) / Math.max(1, bw2StageRounds(rounds, stage).length + 1));
  const affordable = myBank / Math.max(1, left);
  const chase = Math.max(11, estimatedBid + 1, affordable * (mustFight ? 1.7 : 1.05));

  // Sometimes concede cheaply to make a large white lead expensive; hard AI does this more selectively.
  const concedeChance = mustFight ? 0 : level === 'hard' ? 0.38 : 0.28;
  if (rand() < concedeChance || (chase > myBank * 0.72 && !mustFight)) return jitter(rand() < 0.55 ? 0 : 7, 2, myBank, rand);
  return jitter(chase, level === 'hard' ? 3 : 6, myBank, rand);
}

export function chooseBw2AiBid(input: AiInput): number {
  const rand = input.rand ?? Math.random;
  if (input.myBank <= 0) return 0;
  return input.lead ? chooseFollow(input, rand) : chooseLead(input, rand);
}

// -------------------------------------------------------------------------------------------------
// Post-game reading. Every exact bid is revealed and translated into a concise strategic story.

export type BW2RoundRead = 'draw' | 'allIn' | 'edge' | 'bait' | 'overkill' | 'sameColor' | 'pressure' | 'solid';

export function readBw2Round(round: BW2Round): BW2RoundRead {
  const before: [number, number] = [round.remainingAfter[0] + round.bids[0], round.remainingAfter[1] + round.bids[1]];
  if (round.winner === null) return 'draw';
  // A zero bid from an already-empty bank is not a meaningful "all in" in the replay.
  if ((round.bids[0] > 0 && round.bids[0] === before[0]) || (round.bids[1] > 0 && round.bids[1] === before[1])) return 'allIn';
  const winner = round.winner;
  const loser = bw2Other(winner);
  const margin = round.bids[winner] - round.bids[loser];
  if (margin <= 2) return 'edge';
  if (round.bids[loser] <= 9 && round.bids[winner] >= 10) return 'bait';
  if (margin >= 12) return 'overkill';
  if (round.colors[0] === round.colors[1]) return 'sameColor';
  const leaderBefore = before[round.leader];
  if (bw2GaugeOf(leaderBefore) > round.gaugesAfter[round.leader]) return 'pressure';
  return 'solid';
}

export type BW2GameRead = {
  scores: [number, number];
  spent: [number, number];
  efficientWins: [number, number];
  cheapLosses: [number, number];
  overkills: [number, number];
  gaugeDrops: [number, number];
  decisive: number | null;
  verdict: 'clinical' | 'bluffer' | 'pressure' | 'close' | 'outspent' | 'even';
};

export function readBw2Game(rounds: BW2Round[], me: BW2Side): BW2GameRead {
  const scores = bw2ScoresOf(rounds);
  const spent: [number, number] = [0, 0];
  const efficientWins: [number, number] = [0, 0];
  const cheapLosses: [number, number] = [0, 0];
  const overkills: [number, number] = [0, 0];
  const gaugeDrops: [number, number] = [0, 0];
  for (const round of rounds) {
    for (const side of [0, 1] as BW2Side[]) {
      spent[side] += round.bids[side];
      const before = round.remainingAfter[side] + round.bids[side];
      if (bw2GaugeOf(before) > round.gaugesAfter[side]) gaugeDrops[side] += 1;
    }
    if (round.winner === null) continue;
    const winner = round.winner, loser = bw2Other(winner);
    const margin = round.bids[winner] - round.bids[loser];
    if (margin <= 2) efficientWins[winner] += 1;
    if (round.bids[loser] <= 9 && round.bids[winner] >= 10) cheapLosses[loser] += 1;
    if (margin >= 12) overkills[winner] += 1;
  }
  let decisive: number | null = null;
  for (let i = 1; i <= rounds.length; i += 1) if (bw2IsOver(rounds.slice(0, i))) { decisive = i - 1; break; }
  const opp = bw2Other(me);
  const diff = scores[me] - scores[opp];
  const verdict: BW2GameRead['verdict'] = diff === 0 ? 'even'
    : diff > 0
      ? efficientWins[me] >= 2 ? 'clinical' : cheapLosses[me] >= 2 ? 'bluffer' : 'pressure'
      : diff === -1 ? 'close' : spent[me] > spent[opp] ? 'outspent' : 'pressure';
  return { scores, spent, efficientWins, cheapLosses, overkills, gaugeDrops, decisive, verdict };
}

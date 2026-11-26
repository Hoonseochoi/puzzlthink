// 흑과 백 II: both players start with 99 points and secretly split them across nine rounds.
// A one-digit bid is shown as black, a two-digit bid as white. Exact bids stay hidden until the
// game ends, while each player's remaining-point gauge (five 20-point bands) is always public.

import { type PersonaId, type PersonaMatch } from './aiPersona';

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

/**
 * Over when: someone reaches 5 wins within the nine main rounds; or the main rounds end with
 * a different score; or, after a tie, the overtime (33 points, best of three) is decided or played out.
 */
export function bw2IsOver(rounds: BW2Round[]) {
  const main = bw2StageRounds(rounds, 'main');
  const mainScore = bw2ScoresOf(main);
  if (main.length < BW2_MAIN_ROUNDS) return mainScore[0] >= BW2_WIN_SCORE || mainScore[1] >= BW2_WIN_SCORE;
  if (mainScore[0] !== mainScore[1]) return true;
  const overtime = bw2StageRounds(rounds, 'overtime');
  const ot = bw2ScoresOf(overtime);
  return overtime.length >= BW2_OVERTIME_ROUNDS || Math.abs(ot[0] - ot[1]) > BW2_OVERTIME_ROUNDS - overtime.length;
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
// AI. It is fed public information only: its own bids and bank, the rival's colours, results and
// gauges, and (when replying) the colour and new gauge of the leading bid. Easy plays by feel.
// Normal and hard narrow down the rival's bank from that information, then try a set of bids and
// play each one out many times against sampled rival banks, keeping the bid that wins most often.

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
  /** This match's persona; without one the AI plays exactly as before personas. */
  persona?: PersonaMatch;
};

/** Small seeded generator, so every candidate bid is played out against the same luck. */
const seeded = (seed: number): Rand => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const randomInt = (max: number, rand: Rand) => Math.floor(rand() * (Math.max(0, max) + 1));
const clampBid = (n: number, bank: number) => Math.max(0, Math.min(bank, Math.round(n)));

/** Points range a gauge level stands for. */
export const bw2GaugeRange = (level: number): [number, number] => [level <= 1 ? 0 : (level - 1) * 20, level * 20 - 1];

/** Compact game state for play-outs. */
type Sim = { stage: BW2Stage; main: [number, number]; mainCount: number; ot: [number, number]; otCount: number; banks: [number, number]; leader: BW2Side };

const simOver = (g: Sim) => {
  if (g.stage === 'main') return g.mainCount < BW2_MAIN_ROUNDS ? Math.max(...g.main) >= BW2_WIN_SCORE : g.main[0] !== g.main[1];
  return g.otCount >= BW2_OVERTIME_ROUNDS || Math.abs(g.ot[0] - g.ot[1]) > BW2_OVERTIME_ROUNDS - g.otCount;
};
const simNeed = (g: Sim, side: BW2Side) => g.stage === 'main' ? BW2_WIN_SCORE - g.main[side] : 2 - g.ot[side];
const simLeft = (g: Sim) => g.stage === 'main' ? BW2_MAIN_ROUNDS - g.mainCount : BW2_OVERTIME_ROUNDS - g.otCount;

function simPlay(g: Sim, leadBid: number, followBid: number) {
  const leader = g.leader, follower = bw2Other(leader);
  g.banks[leader] -= leadBid; g.banks[follower] -= followBid;
  const winner: BW2Side | null = leadBid === followBid ? null : leadBid > followBid ? leader : follower;
  if (g.stage === 'main') {
    g.mainCount += 1;
    if (winner !== null) g.main[winner] += 1;
    if (g.mainCount >= BW2_MAIN_ROUNDS && g.main[0] === g.main[1]) { g.stage = 'overtime'; g.banks = [BW2_OVERTIME_POINTS, BW2_OVERTIME_POINTS]; }
  } else {
    g.otCount += 1;
    if (winner !== null) g.ot[winner] += 1;
  }
  if (winner !== null) g.leader = winner;
}

/** Quick lead used inside play-outs: roughly the price of one needed win, sometimes a cheap black. */
function quickLead(g: Sim, side: BW2Side, rand: Rand) {
  const bank = g.banks[side];
  if (bank <= 0) return 0;
  const need = Math.max(1, simNeed(g, side));
  if (simLeft(g) > need && rand() < 0.3) return randomInt(Math.min(9, bank), rand);
  return clampBid((bank / need) * (0.6 + 0.7 * rand()), bank);
}

/** Quick reply inside play-outs: knows only the lead colour. */
function quickFollow(g: Sim, side: BW2Side, color: BW2Color, rand: Rand) {
  const bank = g.banks[side];
  if (bank <= 0) return 0;
  const need = Math.max(1, simNeed(g, side));
  const left = simLeft(g);
  if (color === 'black') return bank >= 10 && rand() < 0.85 ? 10 : randomInt(Math.min(9, bank), rand);
  const price = bank / need;
  const must = need >= left;
  if (must || (price >= 13 && rand() < 0.55)) return clampBid(price * (0.85 + 0.6 * rand()), bank);
  return rand() < 0.75 ? 0 : randomInt(Math.min(9, bank), rand);
}

function playOutSim(g: Sim, me: BW2Side, rand: Rand) {
  let guard = 0;
  while (!simOver(g) && guard++ < 16) {
    const lead = quickLead(g, g.leader, rand);
    const follow = quickFollow(g, bw2Other(g.leader), bw2ColorOf(lead), rand);
    simPlay(g, Math.min(lead, g.banks[g.leader]), Math.min(follow, g.banks[bw2Other(g.leader)]));
  }
  const total: [number, number] = [g.main[0] + g.ot[0], g.main[1] + g.ot[1]];
  return total[me] === total[bw2Other(me)] ? 0.5 : total[me] > total[bw2Other(me)] ? 1 : 0;
}

/** What the rival's bids could have been, from colours, results and our own bids. Bank range now (before any lead this round). */
function rivalBankRange(rounds: BW2Round[], me: BW2Side, stage: BW2Stage): [number, number] {
  const opp = bw2Other(me);
  const start = stage === 'main' ? BW2_MAIN_POINTS : BW2_OVERTIME_POINTS;
  let lo = 0, hi = 0; // total spent so far in this stage
  for (const r of bw2StageRounds(rounds, stage)) {
    const mine = r.bids[me];
    let a = r.colors[opp] === 'black' ? 0 : 10, b = r.colors[opp] === 'black' ? 9 : start;
    if (r.winner === null) { a = mine; b = mine; } else if (r.winner === opp) a = Math.max(a, mine + 1); else b = Math.min(b, mine - 1);
    lo += a; hi += Math.max(a, b);
  }
  let low = Math.max(0, start - hi), high = Math.max(0, start - lo);
  const last = bw2StageRounds(rounds, stage).at(-1);
  if (last) {
    const [gl, gh] = bw2GaugeRange(last.gaugesAfter[opp]);
    low = Math.max(low, gl); high = Math.min(high, gh);
  }
  return low <= high ? [low, high] : [Math.max(0, start - hi), Math.max(0, start - lo)];
}

function candidateBids(bank: number) {
  const list = [0, 1, 3, 5, 7, 9, 10, 11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30, 34, 38, 43, 49, 56, 64, 73, 83, bank];
  return [...new Set(list.filter((n) => n <= bank))];
}

export function chooseBw2AiBid(input: AiInput): number {
  const rand = input.rand ?? Math.random;
  const { rounds, me, stage, myBank, lead, level } = input;
  if (myBank <= 0) return 0;
  const opp = bw2Other(me);
  const main = bw2StageRounds(rounds, 'main');
  const ot = bw2StageRounds(rounds, 'overtime');
  const base: Sim = {
    stage, main: bw2ScoresOf(main), mainCount: main.length, ot: bw2ScoresOf(ot), otCount: ot.length,
    banks: [0, 0], leader: lead ? opp : me,
  };

  if (level === 'easy') {
    const g = { ...base, banks: [myBank, myBank] as [number, number] };
    return lead ? quickFollow(g, me, lead.color, rand) : quickLead(g, me, rand);
  }

  const [bankLo, bankHi] = rivalBankRange(rounds, me, stage);
  // The player's habits from colours and results only (bids stay hidden until the end): leads that keep winning are
  // big leads, answers that keep winning are hard answers.
  const habit = input.persona ? readBw2Habits(rounds, me) : null;
  const samples = level === 'hard' ? 500 : 120;
  const candidates = candidateBids(myBank);
  const totals = new Map<number, number>(candidates.map((c) => [c, 0]));
  let used = 0;
  for (let s = 0; s < samples * 3 && used < samples; s += 1) {
    const rivalBank = bankLo + randomInt(bankHi - bankLo, rand);
    let leadBid: number | null = null;
    if (lead) {
      // A lead bid that fits its colour and the gauge it left behind.
      const [cLo, cHi] = lead.color === 'black' ? [0, Math.min(9, rivalBank)] : [10, rivalBank];
      if (cLo > cHi) continue;
      const [gLo, gHi] = bw2GaugeRange(lead.gaugeAfter);
      const lo = Math.max(cLo, rivalBank - gHi), hi = Math.min(cHi, rivalBank - gLo);
      if (lo > hi) continue;
      leadBid = habit?.leadTilt ? lo + Math.min(hi - lo, Math.floor((hi - lo + 1) * Math.pow(rand(), Math.exp(-habit.leadTilt)))) : lo + randomInt(hi - lo, rand);
    }
    used += 1;
    const seed = Math.floor(rand() * 2 ** 31);
    for (const c of candidates) {
      const luck = seeded(seed);
      const g: Sim = { ...base, main: [...base.main] as [number, number], ot: [...base.ot] as [number, number], banks: (me === 0 ? [myBank, rivalBank] : [rivalBank, myBank]) as [number, number] };
      if (leadBid !== null) simPlay(g, leadBid, c);
      else simPlay(g, c, Math.min(g.banks[opp], habit?.eager ? clampBid(quickFollow(g, opp, bw2ColorOf(c), luck) * (1 + 0.3 * habit.eager), g.banks[opp]) : quickFollow(g, opp, bw2ColorOf(c), luck)));
      totals.set(c, totals.get(c)! + playOutSim(g, me, luck));
    }
  }
  if (!used) return clampBid(myBank / Math.max(1, bw2RoundsLeft(rounds, stage)), myBank);
  // Softmax over win rates so the AI is not predictable: sharper on hard. A persona adds its small lean.
  const style = input.persona ? bw2Style(input.persona, { rounds, me, stage, myBank, leading: !lead, rand }) : null;
  const temp = (level === 'hard' ? 0.025 : 0.06) * (style?.temp ?? 1);
  const entries = [...totals.entries()].map(([c, v]) => [c, v / used + (style?.bonus(c) ?? 0)] as const);
  const top = Math.max(...entries.map(([, v]) => v));
  const weights = entries.map(([c, v]) => [c, Math.exp((v - top) / temp)] as const);
  let r = rand() * weights.reduce((a, [, w]) => a + w, 0);
  for (const [c, w] of weights) { r -= w; if (r <= 0) return c; }
  return entries[0][0];
}

// -------------------------------------------------------------------------------------------------
// Personas: the same estimate for all of them; a persona leans between bids the estimate rates close.

/** Lead/answer win shares of the other side, as −1..1 leans (0 with no data), from colours and results. */
export function readBw2Habits(rounds: BW2Round[], me: BW2Side) {
  const opp = bw2Other(me);
  let leads = 0, leadWins = 0, answers = 0, answerWins = 0;
  for (const r of rounds) {
    if (r.winner === null) continue;
    if (r.leader === opp) { leads += 1; if (r.winner === opp) leadWins += 1; } else { answers += 1; if (r.winner === opp) answerWins += 1; }
  }
  const lean = (hits: number, n: number) => ((hits + 1.5) / (n + 3) - 0.5) * 2;
  return { leadTilt: Math.max(-1, Math.min(1, lean(leadWins, leads) * 1.4)), eager: Math.max(-1, Math.min(1, lean(answerWins, answers))) };
}

/** Tuning knob (exported for the arena script): the largest lean, in win-rate units. */
export const BW2_PERSONA_TUNING = { lean: 0.02 };

function bw2Style(p: PersonaMatch, ctx: { rounds: BW2Round[]; me: BW2Side; stage: BW2Stage; myBank: number; leading: boolean; rand: Rand }) {
  if (ctx.rand() < 0.08) return { temp: 1.3, bonus: () => 0 }; // now and then without the style
  const size = BW2_PERSONA_TUNING.lean * p.vary('bw2Lean', 0.3) * (1 + 0.25 * p.mood);
  const left = bw2RoundsLeft(ctx.rounds, ctx.stage);
  const fair = ctx.myBank / Math.max(1, left);
  const x = (c: number) => Math.min(1, c / Math.max(1, 2 * fair)); // 0 = nothing, 0.5 = a fair share, 1 = twice that
  const played = bw2StageRounds(ctx.rounds, ctx.stage).length;
  const score = bw2ScoresOf(bw2StageRounds(ctx.rounds, ctx.stage));
  const diff = score[ctx.me] - score[bw2Other(ctx.me)];
  const noise = new Map<number, number>();
  const n = (c: number) => { if (!noise.has(c)) noise.set(c, ctx.rand() * 2 - 1); return noise.get(c)!; };
  const lean: Record<PersonaId, { temp: number; f: (c: number) => number }> = {
    calc: { temp: 0.8, f: () => 0 },
    aggro: { temp: 1, f: (c) => x(c) },
    careful: { temp: 1, f: (c) => -x(c) },
    // A cheap white (10–13) looks expensive and a top black (7–9) looks cheap: the colour says the least.
    bluffer: { temp: 1.1, f: (c) => (c >= 10 && c <= 13) || (c >= 7 && c <= 9) ? 1 : 0 },
    trap: { temp: 1, f: (c) => (ctx.leading ? (c <= 9 ? 1 : -0.3) : 0) },
    chaser: { temp: diff < 0 ? 1.5 : 1, f: (c) => (diff > 0 ? -x(c) : 0) },
    whim: { temp: 1.4, f: n },
    grinder: { temp: 1, f: (c) => 1 - Math.min(1, Math.abs(c - fair) / Math.max(4, fair)) },
    opener: { temp: 1, f: (c) => (ctx.stage === 'main' && played < 4 ? x(c) : -0.5 * x(c)) },
    closer: { temp: 1, f: (c) => (ctx.stage === 'main' && played < 5 ? -x(c) : x(c)) },
  };
  const l = lean[p.id];
  return { temp: l.temp, bonus: (c: number) => size * l.f(c) };
}

/** How to read each persona in 흑과 백 II. */
export const BW2_TELLS: Record<PersonaId, { ko: string; en: string }> = {
  calc: { ko: '승률이 가장 높은 금액만 걸어요. 게이지가 고르게 줄어요.', en: 'Bids the best-rated amount; its gauge drops evenly.' },
  aggro: { ko: '이길 판에 넉넉하게 걸어요. 게이지가 빨리 줄면 후반이 가벼워요.', en: 'Bids generously to win; when its gauge drops fast, its late game is light.' },
  careful: { ko: '포인트를 끝까지 아껴요. 게이지가 오래 높게 남아 있으면 마지막 판들이 무거워요.', en: 'Saves points to the end; a gauge that stays high means heavy final rounds.' },
  bluffer: { ko: '10~13 같은 싼 흰색과 7~9 같은 비싼 검은색을 즐겨 내요. 색만으로 크기를 판단하기 어려워요.', en: 'Likes cheap whites (10–13) and dear blacks (7–9); colour alone says little.' },
  trap: { ko: '선일 때 검은색(0~9)으로 미끼를 던져요. 선 판을 쉽게 내준다면 내 포인트를 빼려는 거예요.', en: 'Leads with blacks (0–9) as bait; cheap lead losses are there to drain your points.' },
  chaser: { ko: '앞서면 아끼고, 뒤처지면 수가 갑자기 읽기 어려워져요.', en: 'Saves when ahead; when behind its bids suddenly get hard to read.' },
  whim: { ko: '비슷한 금액 사이에서 매번 다르게 골라요. 게이지와 남은 판 수로만 판단하세요.', en: 'Picks differently each time between close bids; judge by gauge and rounds left.' },
  grinder: { ko: '남은 포인트를 남은 판 수로 나눈 만큼씩 고르게 걸어요.', en: 'Bids close to its points divided by the rounds left, round after round.' },
  opener: { ko: '처음 네 판에 크게 걸어 점수를 먼저 벌려요. 그 뒤로는 게이지가 낮아요.', en: 'Bids big in the first four rounds to get ahead; its gauge is low afterwards.' },
  closer: { ko: '처음 다섯 판은 작게, 그 뒤로 남겨 둔 포인트를 몰아 써요.', en: 'Small for the first five rounds, then spends what it saved.' },
};

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

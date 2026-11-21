// 양면포커 (Two-Sided Poker): every hand is one card with two numbers.
// The front is public, the back is seen only by its owner, and the two faces always differ in parity.
// Both players secretly choose the face they fight with (front, back, or both), the choices are revealed,
// then a short betting round decides how much the higher face takes.

export type TspSide = 0 | 1;
export type TspFace = 'front' | 'back' | 'both';
export type TspLevel = 'easy' | 'normal' | 'hard';
export type TspCard = { front: number; back: number };
export type TspPhase = 'pick' | 'bet' | 'reveal' | 'finished';
export type TspRound = {
  cards: [TspCard, TspCard];
  faces: [TspFace, TspFace];
  bets: [number, number];
  pot: number;
  winner: TspSide | 'draw';
  reason: 'showdown' | 'fold';
  /** Extra chips moved by a two-sided (양면) declaration, from the loser to the winner. */
  bonus: number;
  /** Net chip change for each side this round (carry-over not counted until it is won). */
  delta: [number, number];
};
export type TspLog = { side: TspSide; kind: 'check' | 'raise' | 'call' | 'fold'; total: number };
export type TspState = {
  sid: string;
  level: TspLevel;
  round: number;
  chips: [number, number];
  bets: [number, number];
  carry: number;
  cards: [TspCard, TspCard];
  faces: [TspFace | null, TspFace | null];
  first: TspSide;
  turn: TspSide;
  acted: [boolean, boolean];
  raises: number;
  log: TspLog[];
  phase: TspPhase;
  rounds: TspRound[];
  winner: TspSide | 'draw' | null;
};

export const TSP_START_CHIPS = 20;
export const TSP_ROUNDS = 10;
export const TSP_ANTE = 1;
export const TSP_BONUS = 3;
export const TSP_MAX_RAISES = 4;
export const TSP_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
export const tspOther = (side: TspSide): TspSide => (side === 0 ? 1 : 0);

const pick = <T,>(list: readonly T[], rand: () => number) => list[Math.floor(rand() * list.length)];

/** Four different numbers from 1–10: each card gets one odd and one even, in random order. */
export function dealTsp(rand: () => number = Math.random): [TspCard, TspCard] {
  const pool = [...TSP_NUMBERS] as number[];
  const take = (parity: number) => {
    const n = pick(pool.filter((v) => v % 2 === parity), rand);
    pool.splice(pool.indexOf(n), 1);
    return n;
  };
  const card = (): TspCard => {
    const frontParity = rand() < 0.5 ? 0 : 1;
    const front = take(frontParity);
    return { front, back: take(1 - frontParity) };
  };
  return [card(), card()];
}

/** The number a face fights with. A two-sided play fights with its weaker face: both must win. */
export const tspPower = (card: TspCard, face: TspFace) => (face === 'front' ? card.front : face === 'back' ? card.back : Math.min(card.front, card.back));

/** Values the hidden back of `theirs` can still be, from what `mine` can see. */
export function tspBackCandidates(theirFront: number, myCard: TspCard) {
  return TSP_NUMBERS.filter((n) => n % 2 !== theirFront % 2 && n !== myCard.front && n !== myCard.back);
}

export const tspMaxBet = (chips: [number, number], bets: [number, number]) => Math.min(chips[0] + bets[0], chips[1] + bets[1]);

export function newTspGame(level: TspLevel = 'normal', rand: () => number = Math.random): TspState {
  const base: TspState = {
    sid: Math.floor(rand() * 1e9).toString(36), level, round: 0, chips: [TSP_START_CHIPS, TSP_START_CHIPS], bets: [0, 0], carry: 0,
    cards: dealTsp(rand), faces: [null, null], first: rand() < 0.5 ? 0 : 1, turn: 0, acted: [false, false], raises: 0, log: [],
    phase: 'pick', rounds: [], winner: null,
  };
  return startTspRound({ ...base, first: tspOther(base.first) }, rand);
}

function finishGame(state: TspState): TspState {
  const [a, b] = state.chips;
  return { ...state, phase: 'finished', winner: a === b ? 'draw' : a > b ? 0 : 1 };
}

export function startTspRound(state: TspState, rand: () => number = Math.random): TspState {
  if (state.round >= TSP_ROUNDS || state.chips.some((c) => c < TSP_ANTE)) return finishGame(state);
  const first = tspOther(state.first);
  return {
    ...state, round: state.round + 1, cards: dealTsp(rand), faces: [null, null], first, turn: first, acted: [false, false], raises: 0, log: [],
    chips: [state.chips[0] - TSP_ANTE, state.chips[1] - TSP_ANTE], bets: [TSP_ANTE, TSP_ANTE], phase: 'pick',
  };
}

export function chooseTspFaces(state: TspState, faces: [TspFace, TspFace]): TspState {
  if (state.phase !== 'pick') return state;
  return { ...state, faces, phase: 'bet', turn: state.first };
}

export type TspAction = { t: 'check' } | { t: 'call' } | { t: 'raise'; total: number } | { t: 'fold' };

export function tspActions(state: TspState, side: TspSide) {
  const them = tspOther(side);
  const toCall = state.bets[them] - state.bets[side];
  const max = tspMaxBet(state.chips, state.bets);
  const minRaise = state.bets[them] + 1;
  return { toCall, max, minRaise, canCheck: toCall === 0, canRaise: state.raises < TSP_MAX_RAISES && minRaise <= max };
}

export function applyTspAction(state: TspState, side: TspSide, action: TspAction): TspState {
  if (state.phase !== 'bet' || state.turn !== side) return state;
  const them = tspOther(side);
  const { toCall, max, minRaise, canCheck, canRaise } = tspActions(state, side);
  const log = (kind: TspLog['kind'], total: number) => [...state.log, { side, kind, total }];
  if (action.t === 'fold') return settle({ ...state, log: log('fold', state.bets[side]) }, them, 'fold');
  if (action.t === 'check') {
    if (!canCheck) return state;
    const acted: [boolean, boolean] = [...state.acted];
    acted[side] = true;
    const next = { ...state, acted, log: log('check', state.bets[side]) };
    return acted[them] ? showdown(next) : { ...next, turn: them };
  }
  if (action.t === 'call') {
    if (toCall <= 0) return state;
    const pay = Math.min(toCall, state.chips[side]);
    const chips: [number, number] = [...state.chips];
    const bets: [number, number] = [...state.bets];
    chips[side] -= pay; bets[side] += pay;
    return showdown({ ...state, chips, bets, log: log('call', bets[side]) });
  }
  if (!canRaise) return state;
  const total = Math.max(minRaise, Math.min(max, Math.round(action.total)));
  const pay = total - state.bets[side];
  const chips: [number, number] = [...state.chips];
  const bets: [number, number] = [...state.bets];
  chips[side] -= pay; bets[side] = total;
  const acted: [boolean, boolean] = [false, false];
  acted[side] = true;
  return { ...state, chips, bets, acted, raises: state.raises + 1, turn: them, log: log('raise', total) };
}

function showdown(state: TspState): TspState {
  const faces = state.faces as [TspFace, TspFace];
  const p0 = tspPower(state.cards[0], faces[0]);
  const p1 = tspPower(state.cards[1], faces[1]);
  return settle(state, p0 === p1 ? 'draw' : p0 > p1 ? 0 : 1, 'showdown');
}

function settle(state: TspState, winner: TspSide | 'draw', reason: TspRound['reason']): TspState {
  const faces = state.faces as [TspFace, TspFace];
  const pot = state.bets[0] + state.bets[1] + state.carry;
  const chips: [number, number] = [...state.chips];
  let bonus = 0;
  let carry = 0;
  if (winner === 'draw') carry = pot;
  else {
    chips[winner] += pot;
    const loser = tspOther(winner);
    // 양면 is a declaration of strength: it pays out when it wins and costs when it loses — showdown only.
    if (reason === 'showdown') {
      const declared = (faces[winner] === 'both' ? 1 : 0) + (faces[loser] === 'both' ? 1 : 0);
      bonus = Math.min(chips[loser], declared * TSP_BONUS);
      chips[loser] -= bonus; chips[winner] += bonus;
    }
  }
  const before: [number, number] = [state.chips[0] + state.bets[0], state.chips[1] + state.bets[1]];
  const delta: [number, number] = [chips[0] - before[0], chips[1] - before[1]];
  const round: TspRound = { cards: state.cards, faces, bets: state.bets, pot, winner, reason, bonus, delta };
  return { ...state, chips, carry, phase: 'reveal', rounds: [...state.rounds, round] };
}

// ---------------------------------------------------------------- AI

/**
 * Difficulty knobs. `sound`: share of moves made on purpose (the rest are plausible mistakes).
 * `read`: how much the AI infers from the player's face choice (a revealed "back" usually means a high back).
 * `margin`: extra equity it wants before calling. `value`: bet size as a share of the pot when ahead.
 */
/** AI win rate against a casual-player model, like the other games' ~80/50/25% human wins (10k simulated matches per level: 20/50/74). */
export const TSP_AI_TARGET = { easy: 20, normal: 50, hard: 75 } satisfies Record<TspLevel, number>;

const PROFILE = {
  easy: { sound: 0.15, noise: 0.35, bluff: 0.2, read: 0, margin: 0.12, value: 0.4, both: 0.9 },
  normal: { sound: 0.54, noise: 0.14, bluff: 0.1, read: 0.5, margin: 0.06, value: 0.7, both: 0.82 },
  hard: { sound: 0.76, noise: 0.06, bluff: 0.05, read: 1, margin: 0.03, value: 1, both: 0.78 },
} satisfies Record<TspLevel, Record<string, number>>;

/** Win share of `power` against weighted opponent powers (ties count half). */
function shareVs(power: number, theirs: { power: number; w: number }[]) {
  const total = theirs.reduce((s, x) => s + x.w, 0);
  return total ? theirs.reduce((s, x) => s + x.w * (power > x.power ? 1 : power === x.power ? 0.5 : 0), 0) / total : 0.5;
}

/**
 * What the opponent's chosen face can be worth, seen from `me`. With `read` > 0 the choice itself is evidence:
 * people fight with a hidden back mostly when it beats their front, and declare both mostly when both are high.
 */
function opponentPowers(state: TspState, me: TspSide, read: number) {
  const them = tspOther(me);
  const front = state.cards[them].front;
  const face = state.faces[them];
  const backs = tspBackCandidates(front, state.cards[me]);
  if (!face) return backs.map((b) => ({ power: Math.max(front, b), w: 1 }));
  if (face === 'front') return [{ power: front, w: 1 }];
  return backs.map((b) => {
    const likely = face === 'back' ? b > front : Math.min(front, b) >= 6;
    return { power: tspPower({ front, back: b }, face), w: likely ? 1 : 1 - 0.75 * read };
  });
}

/** The AI's face, chosen before it knows the player's. It sees its own card and the player's front only. */
export function chooseTspAiFace(state: TspState, me: TspSide, rand: () => number = Math.random): TspFace {
  const profile = PROFILE[state.level];
  const mine = state.cards[me];
  const theirs = opponentPowers({ ...state, faces: [null, null] }, me, 0);
  const score = {
    front: shareVs(mine.front, theirs),
    back: shareVs(mine.back, theirs) + 0.04, // a hidden face is worth a little on its own
    both: shareVs(Math.min(mine.front, mine.back), theirs),
  };
  if (rand() > profile.sound) return pick(['front', 'back', 'back', 'both'] as TspFace[], rand);
  if (score.both >= profile.both) return 'both';
  return score.front > score.back + (rand() - 0.5) * profile.noise ? 'front' : 'back';
}

/** The AI's betting move. It never looks at the player's back. */
export function chooseTspAiAction(state: TspState, me: TspSide, rand: () => number = Math.random): TspAction {
  const profile = PROFILE[state.level];
  const them = tspOther(me);
  const faces = state.faces as [TspFace, TspFace];
  const myPower = tspPower(state.cards[me], faces[me]);
  const equity = Math.max(0, Math.min(1, shareVs(myPower, opponentPowers(state, me, profile.read)) + (rand() - 0.5) * profile.noise));
  const { toCall, max, minRaise, canCheck, canRaise } = tspActions(state, me);
  const pot = state.bets[0] + state.bets[1] + state.carry;
  const bonusAtStake = (faces[0] === 'both' ? TSP_BONUS : 0) + (faces[1] === 'both' ? TSP_BONUS : 0);
  const potOdds = toCall / Math.max(1, pot + toCall + bonusAtStake);
  // A bluff only makes sense from a face the player cannot check.
  const bluff = rand() < profile.bluff && faces[me] !== 'front' && equity < 0.5;
  const raiseTo = (fraction: number) => Math.min(max, Math.max(minRaise, state.bets[them] + Math.max(1, Math.round(Math.max(2, pot) * fraction))));

  if (rand() > profile.sound) {
    if (toCall > 0) return rand() < 0.5 ? { t: 'fold' } : { t: 'call' };
    return canRaise && rand() < 0.4 ? { t: 'raise', total: raiseTo(0.5) } : { t: 'check' };
  }
  if (equity >= 0.999) return canRaise ? { t: 'raise', total: raiseTo(profile.value * 2) } : toCall > 0 ? { t: 'call' } : { t: 'check' };
  if (toCall > 0) {
    if (equity < potOdds + profile.margin && !bluff) return { t: 'fold' };
    if ((equity > 0.8 || bluff) && canRaise) return { t: 'raise', total: raiseTo(bluff ? 0.5 : profile.value) };
    return { t: 'call' };
  }
  if ((equity > 0.62 || bluff) && canRaise) return { t: 'raise', total: raiseTo(bluff ? 0.5 : equity > 0.85 ? profile.value * 1.5 : profile.value * 0.6) };
  return canCheck ? { t: 'check' } : { t: 'call' };
}

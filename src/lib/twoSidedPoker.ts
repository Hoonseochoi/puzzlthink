// 양면포커 (Two-Sided Poker), after the 더 지니어스 death match (그랜드 파이널 rules):
// 50 two-sided cards — every front/back pair of 1–10 with opposite parity — ×4 sets make a 200-card shoe.
// Fronts are public, backs only their owner sees. Each hand both players ante 1; the first player picks a face
// and bets, the other picks a face and calls, raises or folds. A call goes straight to the showdown.
// 양면베팅 (both faces) pays every bet twice and wins only if both numbers beat the other side's face;
// it takes 10 extra chips on a win, and folding against it also pays 10. Ties carry the pot to the next winner.
// The game ends when a player has no chips left.

export type TspSide = 0 | 1;
export type TspFace = 'front' | 'back' | 'both';
export type TspLevel = 'easy' | 'normal' | 'hard';
export type TspCard = { front: number; back: number };
export type TspPhase = 'bet' | 'reveal' | 'finished';
export type TspLog = { side: TspSide; kind: 'bet' | 'call' | 'raise' | 'fold'; face: TspFace | null; level: number };
export type TspRound = {
  cards: [TspCard, TspCard];
  faces: [TspFace | null, TspFace | null];
  levels: [number, number];
  pot: number; // chips that went to the winner, carry included (0 on a tie)
  winner: TspSide | 'draw';
  reason: 'showdown' | 'fold';
  bonus: number; // 양면베팅 chips moved on top of the pot
  delta: [number, number]; // net chip change this hand, ante included
  log?: TspLog[]; // the betting, for the replay (older saved rooms have none)
};
export type TspState = {
  sid: string;
  level: TspLevel;
  hand: number;
  chips: [number, number];
  carry: number;
  shoe: TspCard[];
  cards: [TspCard, TspCard];
  faces: [TspFace | null, TspFace | null];
  /** Chips bet per face. A 양면 bettor has twice this in the pot. */
  levels: [number, number];
  first: TspSide;
  turn: TspSide;
  phase: TspPhase;
  log: TspLog[];
  rounds: TspRound[];
  winner: TspSide | null;
};

export const TSP_START_CHIPS = 40;
export const TSP_ANTE = 1;
export const TSP_DOUBLE_BONUS = 10;
export const TSP_SETS = 4;
export const tspOther = (side: TspSide): TspSide => (side === 0 ? 1 : 0);

/** The 50 card kinds: each front 1–10 with each back of the other parity. */
export const TSP_KINDS: readonly TspCard[] = Array.from({ length: 10 }, (_, i) => i + 1)
  .flatMap((front) => Array.from({ length: 10 }, (_, j) => j + 1).filter((back) => back % 2 !== front % 2).map((back) => ({ front, back })));
export const TSP_SHOE_SIZE = TSP_SETS * TSP_KINDS.length;

export function newTspShoe(rand: () => number = Math.random): TspCard[] {
  const shoe = Array.from({ length: TSP_SETS }, () => TSP_KINDS.map((c) => ({ ...c }))).flat();
  for (let i = shoe.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
  }
  return shoe;
}

export const tspMult = (face: TspFace | null) => (face === 'both' ? 2 : 1);
export const tspCommitted = (s: Pick<TspState, 'levels' | 'faces'>, side: TspSide) => s.levels[side] * tspMult(s.faces[side]);
/** Chips in the middle this hand: antes and bets (the carry from a tie is separate). */
export const tspPot = (s: Pick<TspState, 'levels' | 'faces'>) => 2 * TSP_ANTE + tspCommitted(s, 0) + tspCommitted(s, 1);

export function newTspGame(level: TspLevel = 'normal', rand: () => number = Math.random): TspState {
  const base: TspState = {
    sid: Math.floor(rand() * 1e9).toString(36), level, hand: 0, chips: [TSP_START_CHIPS, TSP_START_CHIPS], carry: 0,
    shoe: newTspShoe(rand), cards: [{ front: 1, back: 2 }, { front: 1, back: 2 }],
    faces: [null, null], levels: [0, 0], first: rand() < 0.5 ? 0 : 1, turn: 0, phase: 'reveal', log: [], rounds: [], winner: null,
  };
  return startTspHand({ ...base, first: tspOther(base.first) }, rand);
}

export function startTspHand(state: TspState, rand: () => number = Math.random): TspState {
  if (state.chips[0] <= 0 || state.chips[1] <= 0) return { ...state, phase: 'finished', winner: state.chips[0] > 0 ? 0 : 1 };
  const shoe = state.shoe.length >= 2 ? state.shoe : newTspShoe(rand);
  const first = tspOther(state.first);
  return {
    ...state, hand: state.hand + 1, shoe: shoe.slice(2), cards: [shoe[0], shoe[1]], faces: [null, null], levels: [0, 0], first, turn: first, phase: 'bet', log: [],
    chips: [state.chips[0] - TSP_ANTE, state.chips[1] - TSP_ANTE],
  };
}

/** What `side` may do now. Levels are chips per face; a 양면 level costs twice. */
export function tspOptions(state: TspState, side: TspSide) {
  const them = tspOther(side);
  const callLevel = state.levels[them];
  const own = (face: TspFace) => Math.floor((state.chips[side] + tspCommitted(state, side)) / tspMult(face));
  // The other side must be able to answer: with its locked face, or a single face if it has none yet.
  const theirs = Math.floor((state.chips[them] + tspCommitted(state, them)) / tspMult(state.faces[them]));
  const maxLevel = (face: TspFace) => Math.min(own(face), Math.max(theirs, callLevel));
  const choices: TspFace[] = state.faces[side] ? [state.faces[side]!] : ['front', 'back', 'both'];
  const faces = choices.filter((f) => (f !== 'both' || state.faces[them] !== 'both') && own(f) >= callLevel);
  return {
    callLevel,
    canCall: callLevel > 0,
    faces,
    maxLevel,
    minRaise: callLevel + 1,
    cost: (face: TspFace, level: number) => (level - state.levels[side]) * tspMult(face),
  };
}

export type TspAction = { t: 'bet'; face?: TspFace; level: number } | { t: 'fold' };

export function applyTspAction(state: TspState, side: TspSide, action: TspAction): TspState {
  if (state.phase !== 'bet' || state.turn !== side) return state;
  const them = tspOther(side);
  if (action.t === 'fold') {
    return settle({ ...state, log: [...state.log, { side, kind: 'fold', face: state.faces[side], level: state.levels[side] }] }, them, 'fold');
  }
  const face = state.faces[side] ?? action.face;
  const opts = tspOptions(state, side);
  if (!face || !opts.faces.includes(face)) return state;
  const max = opts.maxLevel(face);
  // When nobody can add chips (someone is all in from the ante) the bet is 0 and the answer goes to the showdown.
  const floor = opts.canCall ? opts.callLevel : max > 0 ? 1 : 0;
  const level = Math.max(floor, Math.min(max, Math.round(action.level)));
  const pay = opts.cost(face, level);
  if (pay > state.chips[side]) return state;
  const chips: [number, number] = [...state.chips];
  const levels: [number, number] = [...state.levels];
  const faces: [TspFace | null, TspFace | null] = [...state.faces];
  chips[side] -= pay; levels[side] = level; faces[side] = face;
  const answered = state.log.some((l) => l.side === them);
  const call = (opts.canCall && level === opts.callLevel) || (!opts.canCall && level === 0 && answered);
  const kind: TspLog['kind'] = call ? 'call' : opts.canCall ? 'raise' : 'bet';
  const next: TspState = { ...state, chips, levels, faces, log: [...state.log, { side, kind, face, level }] };
  return call ? showdown(next) : { ...next, turn: them };
}

/** Who wins a showdown. A 양면 bettor needs both numbers above the other face; a tie there goes to the other side. */
export function tspShowdownWinner(cards: [TspCard, TspCard], faces: [TspFace, TspFace]): TspSide | 'draw' {
  for (const d of [0, 1] as TspSide[]) {
    if (faces[d] !== 'both') continue;
    const o = tspOther(d);
    const theirs = cards[o][faces[o] as 'front' | 'back'];
    return cards[d].front > theirs && cards[d].back > theirs ? d : o;
  }
  const a = cards[0][faces[0] as 'front' | 'back'];
  const b = cards[1][faces[1] as 'front' | 'back'];
  return a === b ? 'draw' : a > b ? 0 : 1;
}

function showdown(state: TspState): TspState {
  return settle(state, tspShowdownWinner(state.cards, state.faces as [TspFace, TspFace]), 'showdown');
}

function settle(state: TspState, winner: TspSide | 'draw', reason: TspRound['reason']): TspState {
  const pot = tspPot(state);
  const chips: [number, number] = [...state.chips];
  const before: [number, number] = [state.chips[0] + tspCommitted(state, 0) + TSP_ANTE, state.chips[1] + tspCommitted(state, 1) + TSP_ANTE];
  let carry = 0;
  let bonus = 0;
  let won = 0;
  if (winner === 'draw') carry = state.carry + pot;
  else {
    const loser = tspOther(winner);
    won = pot + state.carry;
    chips[winner] += won;
    // 양면베팅 takes 10 when it wins — at a showdown or when the other side folds. Losing it costs nothing extra.
    if (state.faces[winner] === 'both') {
      bonus = Math.min(chips[loser], TSP_DOUBLE_BONUS);
      chips[loser] -= bonus; chips[winner] += bonus;
    }
  }
  const delta: [number, number] = [chips[0] - before[0], chips[1] - before[1]];
  const round: TspRound = { cards: state.cards, faces: state.faces, levels: state.levels, pot: won, winner, reason, bonus, delta, log: state.log };
  const next: TspState = { ...state, chips, carry, phase: 'reveal', rounds: [...state.rounds, round] };
  return next.chips[0] <= 0 || next.chips[1] <= 0 ? { ...next, phase: 'finished', winner: next.chips[0] > 0 ? 0 : 1 } : next;
}

// ---------------------------------------------------------------- counting

/**
 * Copies of each back still possible under a front, from what `me` has seen in this shoe: my own cards,
 * the other card whenever it was shown at a showdown, and my current card. A folded hand hides the other back.
 * `counting` 0..1 blends from "forgot everything" (4 copies each) to exact memory.
 */
export function tspBackOdds(state: TspState, me: TspSide, front: number, counting = 1): { back: number; copies: number }[] {
  const seen = new Map<string, number>();
  const note = (c: TspCard) => { const k = `${c.front}/${c.back}`; seen.set(k, (seen.get(k) ?? 0) + 1); };
  const hands = Math.floor((TSP_SHOE_SIZE - state.shoe.length - 2) / 2); // hands dealt from this shoe before this one
  for (const r of hands > 0 ? state.rounds.slice(-hands) : []) {
    note(r.cards[me]);
    if (r.reason === 'showdown') note(r.cards[tspOther(me)]);
  }
  note(state.cards[me]);
  return TSP_KINDS.filter((c) => c.front === front).map(({ back }) => {
    const left = Math.max(0, TSP_SETS - (seen.get(`${front}/${back}`) ?? 0));
    return { back, copies: TSP_SETS + (left - TSP_SETS) * counting };
  });
}

// ---------------------------------------------------------------- AI

/**
 * Every level counts the shoe and never pays off a hand that cannot win; the levels differ in skill, not in random blunders.
 * `count`: share of the shoe it remembers. `read`: how much it reads the player's face choice and bet size.
 * `noise`: error in its win estimate when the player's back is hidden. `loose`: extra calling beyond the pot odds (easy calls too much).
 * `openFold`: win chance below which it gives up its ante instead of opening. `value`: value-bet size as a share of the pot.
 * `double`: win chance it wants for a 양면베팅. `bluff`: chance to bluff with a hidden back. `raise`: chance to raise a strong hand.
 */
const PROFILE = {
  easy: { count: 0, read: 0, noise: 0.4, loose: 0.8, openFold: 0, value: 0.2, double: 0.97, bluff: 0.25, raise: 0.08 },
  normal: { count: 0.3, read: 0.1, noise: 0.3, loose: 0.5, openFold: 0.03, value: 0.35, double: 0.93, bluff: 0.16, raise: 0.2 },
  hard: { count: 1, read: 1, noise: 0, loose: 0, openFold: 0.28, value: 1, double: 0.74, bluff: 0.12, raise: 0.85 },
} satisfies Record<TspLevel, Record<string, number>>;

/**
 * AI win rate shown on the difficulty buttons. Measured from play data (11/26: the AI won 40% of 296 normal matches
 * and 50% of 117 hard ones). The simulated 42 / 71 / 93% against a scripted casual player did not hold against people:
 * every level plays disciplined poker, but the cards decide a large share of every match.
 */
export const TSP_AI_TARGET = { easy: 30, normal: 40, hard: 50 } satisfies Record<TspLevel, number>;

type Dist = { v: number; w: number }[];

/**
 * The other side's number for the face it chose (or the face it will likely choose), weighted by the copies left
 * in the shoe and — with `read` — by what its play says: betting the hidden back usually means a back above the front,
 * a 양면베팅 means two high faces, and a big bet means a strong number.
 */
function rivalDist(state: TspState, me: TspSide, read: number, counting: number): Dist {
  const them = tspOther(me);
  const front = state.cards[them].front;
  const face = state.faces[them];
  if (face === 'front') return [{ v: front, w: 1 }];
  const backs = tspBackOdds(state, me, front, counting).filter((b) => b.copies > 0);
  const potBefore = 2 * TSP_ANTE + tspCommitted(state, me) + Math.max(0, tspCommitted(state, them) - state.levels[them] * tspMult(face));
  const pressure = face ? Math.min(2, state.levels[them] / Math.max(2, potBefore)) : 0; // their bet against the pot
  const sized = (v: number) => Math.max(0.15, 1 + read * pressure * (v - 5.5) / 4.5);
  if (face === 'back') return backs.map((b) => ({ v: b.back, w: b.copies * (b.back > front ? 1 : 1 - 0.75 * read) * sized(b.back) }));
  if (face === 'both') return backs.map((b) => { const v = Math.min(front, b.back); return { v, w: b.copies * (v >= 7 ? 1 : 1 - 0.75 * read) * sized(v) }; });
  return backs.map((b) => ({ v: Math.max(front, b.back), w: b.copies })); // not chosen yet: assume their better face
}

function winChance(state: TspState, me: TspSide, myFace: TspFace, dist: Dist) {
  const mine = state.cards[me];
  const theirFace = state.faces[tspOther(me)];
  const total = dist.reduce((s, d) => s + d.w, 0) || 1;
  return dist.reduce((s, d) => {
    let p: number;
    if (myFace === 'both') p = mine.front > d.v && mine.back > d.v ? 1 : 0;
    else if (theirFace === 'both') p = mine[myFace] >= d.v ? 1 : 0; // their 양면 loses a tie
    else p = mine[myFace] > d.v ? 1 : mine[myFace] === d.v ? 0.45 : 0; // a tie only carries the pot over
    return s + d.w * p;
  }, 0) / total;
}

/** The AI's move. It sees its own card, the player's front, the shoe it remembers — never the player's back. */
export function chooseTspAiAction(state: TspState, me: TspSide, rand: () => number = Math.random): TspAction {
  const profile = PROFILE[state.level];
  const them = tspOther(me);
  const opts = tspOptions(state, me);
  if (!opts.faces.length) return { t: 'fold' };
  const dist = rivalDist(state, me, profile.read, profile.count);
  // Misjudging only happens where something is hidden: a sure win or sure loss is always seen as one.
  const hidden = state.faces[them] !== 'front';
  const scored = opts.faces.map((face) => {
    const exact = winChance(state, me, face, dist);
    const p = hidden && exact > 0 && exact < 1 ? Math.max(0.01, Math.min(0.99, exact + (rand() - 0.5) * 2 * profile.noise)) : exact;
    return { face, p };
  });
  const single = scored.filter((x) => x.face !== 'both').sort((a, b) => b.p - a.p)[0] ?? scored[0];
  const both = scored.find((x) => x.face === 'both');
  const pick = both && both.p >= profile.double && both.p >= single.p - 0.03 ? both : single;
  const { face, p } = pick;
  const max = opts.maxLevel(face);
  const pot = tspPot(state) + state.carry;
  const toCall = opts.canCall ? opts.cost(face, opts.callLevel) : 0;
  const foldPenalty = state.faces[them] === 'both' ? TSP_DOUBLE_BONUS : 0;
  const myBonus = face === 'both' ? TSP_DOUBLE_BONUS : 0;
  const floor = opts.canCall ? opts.minRaise : 1;
  const sized = (fraction: number) => Math.min(max, Math.max(floor, (opts.canCall ? opts.callLevel : 0) + Math.max(1, Math.round(pot * fraction))));
  // A bluff only from a face the player cannot see, and only when its front does not already give the game away.
  const bluff = face === 'back' && p < 0.4 && state.cards[me].front >= 6 && rand() < profile.bluff;
  const call: TspAction = { t: 'bet', face, level: opts.callLevel };

  if (max === 0) return opts.canCall ? call : { t: 'bet', face, level: 0 }; // all in from the ante: straight to the showdown

  if (!opts.canCall) {
    // Opening. Trash gives up the single ante chip; a 양면 opener stays small so it gets called (a fold still pays 10).
    if (p < profile.openFold && !bluff) return { t: 'fold' };
    if (face === 'both') return { t: 'bet', face, level: Math.max(1, Math.min(max, 1 + Math.floor(rand() * 3))) };
    if (bluff) return { t: 'bet', face, level: sized(0.7 + rand() * 0.4) };
    if (p >= 0.999) return { t: 'bet', face, level: sized(profile.value * (0.8 + rand() * 0.6)) };
    if (p > 0.75) return { t: 'bet', face, level: sized(profile.value * (0.6 + rand() * 0.5)) };
    if (p > 0.5) return { t: 'bet', face, level: sized(profile.value * 0.35) };
    return { t: 'bet', face, level: 1 };
  }

  // Facing a bet: call when the win chance beats the price (folding against 양면 costs 10 on top of the pot).
  const need = Math.max(0, (toCall - foldPenalty) / Math.max(1, pot + myBonus + toCall));
  if (p <= 0) return { t: 'fold' }; // never pay off a hand that cannot win
  if (p < need - profile.loose && !bluff) return { t: 'fold' };
  const canRaise = max > opts.callLevel;
  if (canRaise && p >= 0.999) return { t: 'bet', face, level: sized(profile.value * (0.8 + rand() * 0.6)) };
  if (canRaise && p > 0.8 && rand() < profile.raise) return { t: 'bet', face, level: sized(profile.value * 0.8) };
  if (canRaise && bluff && state.log.filter((l) => l.kind === 'raise').length < 2) return { t: 'bet', face, level: sized(0.8) };
  return call;
}

// ---------------------------------------------------------------- views

const swap = <T,>(pair: [T, T]): [T, T] => [pair[1], pair[0]];
const flip = <T extends TspSide | 'draw' | null>(side: T): T => (side === 0 ? 1 : side === 1 ? 0 : side) as T;

/** The same game seen from `me`: the viewer always sits at side 0 (rooms reuse the AI table this way). */
export function tspView(state: TspState, me: TspSide): TspState {
  if (me === 0) return state;
  return {
    ...state,
    chips: swap(state.chips), cards: swap(state.cards), faces: swap(state.faces), levels: swap(state.levels),
    first: flip(state.first), turn: flip(state.turn), winner: flip(state.winner),
    log: state.log.map((l) => ({ ...l, side: flip(l.side) })),
    rounds: state.rounds.map((r) => ({ ...r, cards: swap(r.cards), faces: swap(r.faces), levels: swap(r.levels), delta: swap(r.delta), winner: flip(r.winner), log: r.log?.map((l) => ({ ...l, side: flip(l.side) })) })),
  };
}

/**
 * When nobody can add a chip (a player is all in from the ante), the move is forced: show down with the better face.
 * Games apply it automatically so an all-in hand plays itself out.
 */
export function tspForcedAction(state: TspState): TspAction | null {
  if (state.phase !== 'bet') return null;
  const side = state.turn;
  const o = tspOptions(state, side);
  if (o.canCall || o.faces.some((f) => o.maxLevel(f) > 0)) return null;
  const card = state.cards[side];
  const face: TspFace = state.faces[side] ?? (card.front >= card.back ? 'front' : 'back');
  return { t: 'bet', face, level: 0 };
}

/** How long a settled hand stays on the table before the next deal (a showdown gets a moment to read). */
export const tspRevealMs = (state: TspState) => (state.rounds.at(-1)?.reason === 'showdown' ? 2800 : 1700);

// The Genius-style Indian Poker: two copies of 1–10, one visible card per player,
// no player may see their own card, and a folded 10 pays an extra ten-chip penalty.

export type PokerSide = 0 | 1;
export type PokerDifficulty = 'easy' | 'normal' | 'hard';
export type PokerRound = {
  cards: [number, number];
  first: PokerSide;
  bets: [number, number];
  winner: PokerSide | 'draw';
  reason: 'showdown' | 'fold';
  tenPenalty: boolean;
  /** Chips the folded 10 actually paid (less than ten when the stack ran short). Absent in older saves. */
  penalty?: number;
  pot: number;
};

export const POKER_START_CHIPS = 20;
/** Both players put this many chips in before every hand, so a fold always costs something. */
export const POKER_ANTE = 1;
export const POKER_DECK = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
export const pokerOther = (side: PokerSide): PokerSide => (side === 0 ? 1 : 0);
/** Design targets, not guaranteed match results: cards and opponent choices still add variance. */
export const POKER_AI_TARGET = { easy: 20, normal: 50, hard: 75 } satisfies Record<PokerDifficulty, number>;

export function shufflePokerDeck(rand: () => number = Math.random) {
  const deck = [...POKER_DECK];
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/** Highest equal total both players can still reach this hand. */
export function maxMatchableBet(chips: [number, number], bets: [number, number]) {
  return Math.min(chips[0] + bets[0], chips[1] + bets[1]);
}

export function pokerWinner(cards: [number, number]): PokerSide | 'draw' {
  return cards[0] === cards[1] ? 'draw' : cards[0] > cards[1] ? 0 : 1;
}

export type PokerAiAction = { t: 'bet'; total: number } | { t: 'fold' };

/**
 * Chooses from information visible to the AI: the opponent card, used cards, bets and stacks.
 * `myCard` is intentionally absent.
 */
export function choosePokerAiAction(args: {
  opponentCard: number;
  usedCards: readonly number[];
  chips: [number, number];
  bets: [number, number];
  carry?: number;
  me: PokerSide;
  level: PokerDifficulty;
  canCheck: boolean;
  rand?: () => number;
}): PokerAiAction {
  const { opponentCard, usedCards, chips, bets, me, level, canCheck, carry = 0 } = args;
  const rand = args.rand ?? Math.random;
  const them = pokerOther(me);
  const counted = [...POKER_DECK];
  for (const used of usedCards) {
    const index = counted.indexOf(used as (typeof POKER_DECK)[number]);
    if (index >= 0) counted.splice(index, 1);
  }
  const profile = {
    // read: how much the opponent's betting moves the AI's guess about its own (unseen) card.
    // Tuned from play data: hard was beaten about half the time (65% on a first try), so it now reads bets.
    easy: { quality: .30, count: .15, noise: .28, bluff: .24, aggression: .25, read: 0 },
    normal: { quality: .66, count: .75, noise: .12, bluff: .14, aggression: .45, read: .25 },
    hard: { quality: .96, count: 1, noise: .03, bluff: .11, aggression: .65, read: .6 },
  }[level];
  const rawEquity = (deck: readonly number[]) => deck.length
    ? (deck.filter((n) => n > opponentCard).length + deck.filter((n) => n === opponentCard).length * .5) / deck.length
    : .5;
  const chanceOf = (deck: readonly number[], value: number) => deck.length ? deck.filter((n) => n === value).length / deck.length : .1;
  // Easier bots only partially remember exposed cards. Hard uses the exact remaining distribution.
  const equity = rawEquity(POKER_DECK) * (1 - profile.count) + rawEquity(counted) * profile.count;
  const tenChance = chanceOf(POKER_DECK, 10) * (1 - profile.count) + chanceOf(counted, 10) * profile.count;
  const toCall = Math.max(0, bets[them] - bets[me]);
  const max = maxMatchableBet(chips, bets);
  const callTotal = Math.max(bets[0], bets[1]);
  const pot = bets[0] + bets[1] + carry;
  const potOdds = toCall / Math.max(1, pot + toCall);
  const stackPressure = chips[me] ? toCall / chips[me] : 1;
  const rivalPressure = chips[them] <= 6 ? .06 : 0;
  // The opponent sees the AI's card: a big raise hints that card is low, a meek check that it is high.
  // People bluff too, so the hint only nudges the estimate (capped), and only as far as the level reads.
  const pressure = toCall / Math.max(2, pot - toCall);
  const hint = toCall > 0 ? -Math.min(.22, pressure * .18) : canCheck && bets[them] === bets[me] && pot > 2 ? .04 : 0;
  const estimate = equity + hint * profile.read + (rand() - .5) * profile.noise;
  const bluff = rand() < profile.bluff * (opponentCard <= 4 ? 1.35 : .55);
  const sound = rand() < profile.quality;

  // A missed-quality decision is deliberately plausible, not pure random: weak levels
  // overfold good odds or push too many chips into a bad visible card.
  if (!sound) {
    if (toCall > 0 && rand() < .55) return rand() < .55 ? { t: 'fold' } : { t: 'bet', total: Math.min(max, callTotal) };
    const reckless = Math.min(max, Math.max(1, callTotal + Math.max(1, Math.round((max - callTotal) * .65))));
    return { t: 'bet', total: reckless };
  }

  // Folding a hidden 10 costs up to ten extra chips, so its remaining-deck probability
  // lowers the fold line. Strong bots become noticeably more reluctant to make a costly fold.
  const tenPenaltyRisk = tenChance * Math.min(10, chips[me]) / Math.max(10, pot + toCall);
  const foldLine = potOdds + stackPressure * .17 - rivalPressure - tenPenaltyRisk;
  if (toCall > 0 && !bluff && estimate < foldLine) return { t: 'fold' };
  if (!canCheck && estimate < .58 && !bluff) return { t: 'bet', total: Math.min(max, callTotal + 1) };
  if (toCall > 0 && (estimate < .62 || callTotal >= max) && !bluff) return { t: 'bet', total: Math.min(max, callTotal) };

  const room = max - callTotal;
  if (room <= 0) return { t: 'bet', total: callTotal };
  // Size raises from estimated equity, current pot and stack leverage. A low visible card
  // earns larger value bets; selected bluffs use a credible medium size instead of all-in spam.
  const fraction = bluff ? .35 : estimate > .82 ? .78 : estimate > .67 ? .48 : profile.aggression;
  const potSized = Math.max(1, Math.round(Math.max(1, pot) * fraction));
  const raise = Math.min(room, Math.max(1, Math.min(potSized, Math.round(room * fraction))));
  return { t: 'bet', total: Math.min(max, callTotal + raise) };
}

// The Genius-style Indian Poker: two copies of 1–10, one visible card per player,
// no player may see their own card, and a folded 10 pays an extra ten-chip penalty.

import { type PersonaId, type PersonaMatch } from './aiPersona';

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
/**
 * AI win rate shown on the difficulty buttons. Measured from play data (11/26: the AI won 41% of 338 normal matches
 * and 55% of 478 hard ones), not the 50 / 75 it was designed for: the cards decide a large share of every match.
 */
export const POKER_AI_TARGET = { easy: 25, normal: 40, hard: 55 } satisfies Record<PokerDifficulty, number>;

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
  /** This match's persona. Without one the AI plays exactly as it did before personas. */
  persona?: PersonaMatch;
  /** Hands already shown down this match (both cards public), for reading the other player's habits. */
  history?: readonly PokerRound[];
}): PokerAiAction {
  const { opponentCard, usedCards, chips, bets, me, level, canCheck, carry = 0, persona, history = [] } = args;
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
  // A persona keeps its level's handicap below 어려움; at 어려움 it plays without the deliberate slips (quality, noise).
  const style = persona ? pokerStyle(persona, { me, chips, hand: history.length, rand }) : null;
  if (style) {
    if (level === 'hard') { profile.quality = 1; profile.noise = 0; }
    profile.bluff *= style.bluff;
    profile.read *= readFactor(history, me);
  }
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
  // With a persona the read is scaled by how honest this player's bets have been (readFactor, possibly negative).
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
  const foldLine = potOdds + stackPressure * .17 - rivalPressure - tenPenaltyRisk + (style?.fold ?? 0);
  if (toCall > 0 && !bluff && estimate < foldLine) return { t: 'fold' };
  // Slow play: a strong hand only calls (or opens for the minimum) to keep the other side betting.
  if (style && estimate > .8 && rand() < style.slow) return { t: 'bet', total: Math.min(max, callTotal + (canCheck ? 0 : 1)) };
  if (!canCheck && estimate < .58 && !bluff) return { t: 'bet', total: Math.min(max, callTotal + 1) };
  if (toCall > 0 && (estimate < .62 || callTotal >= max) && !bluff) return { t: 'bet', total: Math.min(max, callTotal) };

  const room = max - callTotal;
  if (room <= 0) return { t: 'bet', total: callTotal };
  // Size raises from estimated equity, current pot and stack leverage. A low visible card
  // earns larger value bets; selected bluffs use a credible medium size instead of all-in spam.
  const fraction = Math.min(1, (bluff ? .35 : estimate > .82 ? .78 : estimate > .67 ? .48 : profile.aggression) * (style?.size ?? 1));
  const potSized = Math.max(1, Math.round(Math.max(1, pot) * fraction));
  const raise = Math.min(room, Math.max(1, Math.min(potSized, Math.round(room * fraction))));
  return { t: 'bet', total: Math.min(max, callTotal + raise) };
}

// ---------------------------------------------------------------------------------------------
// Personas. Every persona sees the same exact equity (the remaining deck); a persona only changes how often it
// bluffs, how big it bets, how readily it folds near the line and how often it slow-plays — all around that estimate.

/**
 * How far to trust "a big bet means my card is low": the other player sees the AI's card, so their bets track it.
 * From the hands shown down this match: the correlation between the AI's card they saw and how much they put in.
 * Honest bettors (more chips against a low card) earn a stronger read, bettors who do the opposite flip it, and
 * with few hands it stays near the usual weight.
 */
export function readFactor(history: readonly PokerRound[], me: PokerSide): number {
  const them = pokerOther(me);
  const pts = history.map((r) => ({ x: r.cards[me], y: Math.log(1 + r.bets[them]) }));
  if (pts.length < 3) return 1;
  const mx = pts.reduce((a, p) => a + p.x, 0) / pts.length, my = pts.reduce((a, p) => a + p.y, 0) / pts.length;
  let sxy = 0, sxx = 0, syy = 0;
  for (const p of pts) { sxy += (p.x - mx) * (p.y - my); sxx += (p.x - mx) ** 2; syy += (p.y - my) ** 2; }
  if (sxx === 0 || syy === 0) return 1;
  const honesty = (-sxy / Math.sqrt(sxx * syy)) * (pts.length / (pts.length + 4)); // −1..1
  return Math.max(-0.6, Math.min(1.8, 0.6 + honesty * 1.4));
}

type PokerStyle = { bluff: number; size: number; fold: number; slow: number };

function pokerStyle(p: PersonaMatch, ctx: { me: PokerSide; chips: [number, number]; hand: number; rand: () => number }): PokerStyle {
  const lead = ctx.chips[ctx.me] - ctx.chips[pokerOther(ctx.me)];
  const v = (k: string) => p.vary(k, 0.2) * (1 + 0.15 * p.mood);
  // Now and then a hand without the style, so a tell is useful but never certain.
  if (ctx.rand() < 0.08) return { bluff: 1, size: 1, fold: 0, slow: 0.1 };
  const early = ctx.hand < 6;
  const table: Record<PersonaId, PokerStyle> = {
    calc: { bluff: 1, size: 1, fold: 0, slow: 0.08 },
    aggro: { bluff: 1.3 * v('b'), size: 1.35 * v('s'), fold: -0.03, slow: 0 },
    careful: { bluff: 0.5 * v('b'), size: 0.85, fold: 0.04, slow: 0.1 },
    bluffer: { bluff: 1.7 * v('b'), size: 1, fold: 0, slow: 0.15 },
    trap: { bluff: 0.8, size: 1.15 * v('s'), fold: 0, slow: 0.3 * v('t') },
    chaser: lead < 0 ? { bluff: 1.6 * v('b'), size: 1.3, fold: -0.04, slow: 0 } : lead > 0 ? { bluff: 0.6, size: 0.9, fold: 0.03, slow: 0.1 } : { bluff: 1, size: 1, fold: 0, slow: 0.1 },
    whim: { bluff: 0.6 + ctx.rand() * 1, size: 0.8 + ctx.rand() * 0.5, fold: (ctx.rand() - 0.5) * 0.04, slow: ctx.rand() * 0.2 },
    grinder: { bluff: 0.7, size: 0.7 * v('s'), fold: -0.02, slow: 0.15 },
    opener: early ? { bluff: 1.5 * v('b'), size: 1.3, fold: -0.03, slow: 0 } : { bluff: 0.7, size: 0.9, fold: 0.02, slow: 0.1 },
    closer: early ? { bluff: 0.6, size: 0.85, fold: 0.03, slow: 0.15 } : { bluff: 1.5 * v('b'), size: 1.3, fold: -0.03, slow: 0.05 },
  };
  return table[p.id];
}

/** How to read each persona in 인디언 포커. */
export const POKER_TELLS: Record<PersonaId, { ko: string; en: string }> = {
  calc: { ko: '정확한 확률대로만 베팅해요. 레이즈 크기가 곧 내 카드가 낮다는 신호인 경우가 많아요.', en: 'Bets by the exact odds; its raise size usually says your card is low.' },
  aggro: { ko: '레이즈가 크고 잘 접지 않아요. 큰 레이즈 하나만 보고 겁먹지 마세요.', en: 'Raises big and rarely folds; one big raise alone means little.' },
  careful: { ko: '블러프가 적고 애매하면 접어요. 이 성향의 큰 레이즈는 진짜인 경우가 많아요.', en: 'Bluffs little and folds close spots; its big raises are usually real.' },
  bluffer: { ko: '블러프가 가장 잦아요. 끝까지 따라가면 빈손이 드러나는 판이 많아요.', en: 'Bluffs the most; calling it down often finds nothing.' },
  trap: { ko: '강할 때 콜만 하고 작게 열어요. 조용한 판에서 갑자기 커지면 조심하세요.', en: 'Calls and opens small when strong; beware a quiet hand that suddenly grows.' },
  chaser: { ko: '칩이 뒤처지면 블러프와 레이즈가 늘고, 앞서면 조여요. 칩 차이를 보세요.', en: 'Bluffs and raises more when behind, tightens when ahead: watch the chip gap.' },
  whim: { ko: '판마다 베팅 습관이 바뀌어요. 습관 대신 남은 카드와 팟 크기로 판단하세요.', en: 'Changes its betting habits every hand; judge by the deck and pot instead.' },
  grinder: { ko: '작게 베팅하고 잘 따라와요. 큰 판보다 작은 판을 많이 가져가요.', en: 'Bets small and calls a lot; wins many small pots rather than big ones.' },
  opener: { ko: '처음 여섯 판에 몰아치고 그 뒤로 조용해져요. 초반 큰 베팅은 반쯤 압박이에요.', en: 'Storms the first six hands, then quietens; early big bets are half pressure.' },
  closer: { ko: '초반엔 조용히 정보를 모으고, 일곱 번째 판부터 베팅이 커져요.', en: 'Quiet early while it watches, then bets grow from the seventh hand.' },
};

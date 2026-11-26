// 스나이퍼 홀덤 / 저격 홀덤 (Sniper Hold'em) — the day-3 prison match of 데블스 플랜: 데스룸 (The Devil's Plan 2).
//
// ─── The broadcast rules, as reproduced here ───────────────────────────────────────────────────────────────────
// Sources: [N] 나무위키 「데블스 플랜: 데스룸/3일차」 (rule card transcribed + a 68-round play-by-play with footnotes),
//          [S] scriptedmurder.com fan rules summary, [M] Yoshiki O's Medium analysis, [P] the play-by-play in [N]
//          read as evidence of how rulings were applied on the show.
// Status: ✔✔ = two or more sources agree · ✔ = one source · ◇ = our own gap-filling (the most defensible reading).
//
// Players, deck, chips
//   ✔✔ Five players (everyone in the prison block that day) [N][M].
//   ✔✔ Four sets of number cards 1–10 = 40 cards, no suits [N][S][M]. 1 is the lowest number (straights cannot wrap
//      10→1; the examples rank "1 풀하우스" lowest) ✔ [N][P].
//   ✔✔ 60 chips each [N][S][M]; survival at 75 [N][S][M].
//   ✔  Order is drawn at the start; play goes clockwise from the first player (선) [N]. The 선 moves one seat every
//      round ✔ [P] (each round's table starts one player later).
// One round
//   ✔✔ Ante (기본 베팅) of 1 chip from everyone [N]; it never rises — 68 rounds on the show, always 1 [P] ✔.
//      (The site raises it by default — ◇ its own rule, see SH_ANTE_STEPS and "How the site's version differs".)
//   ✔✔ Two private cards each, seen only by their owner [N][S][M].
//   ✔✔ Two shared cards face up → betting round 1 → two more shared cards → betting round 2 [N][S][M].
//   ✔✔ No single bet may exceed the chips of the player with the fewest chips [N][S]. ◇ Read as: what one player
//      puts in over a whole round (ante included) is capped at the smallest stack, among the players still in the
//      match, at the start of the round. This is what makes "All in" in the 1:1 phase mean "the smaller stack" [P],
//      and it means nobody is ever short of chips: there are no side pots.
//   ✔  A betting round ends when everyone still in has put in the same amount [N]. Folding (포기) forfeits what you
//      have put in [N][P].
//   ◇  No checking: every betting round opens with a bet of at least 1 and everyone else calls, raises or folds.
//      [S] says "check" is allowed, but in 68 rounds of [P] every betting round opens with +1 or more and nobody
//      ever checks; we follow the broadcast. When the cap was already reached (an all-in in round 1), the rest of
//      the betting is skipped ✔ [P] (51R: all-in and call in bet 1, then straight to the snipes).
// Hands (족보), from best to worst ✔✔ [N][S][M] — the best combination of 4 shared + 2 private cards; no flush:
//      포카드 four of a kind · 풀하우스 full house · 스트레이트 straight (five in a row) · 트리플 three of a kind
//      · 투페어 two pair · 원페어 one pair · 하이카드 high card
// Sniping (저격)
//   ✔✔ After betting round 2 and before private cards are shown, each player still in may snipe one hand, in turn
//      from the 선 [N][S][M]. ✔ Optional: players passed ("X" in [P] 57R, 60R; [N] strategy notes).
//   ✔✔ A snipe names a hand type and the highest number of the cards that make it [N][S][M]: 4-5-6-7-8 = "8
//      스트레이트", 7-7-5-5 = "7 투페어"; a full house is named by its triple (7-7-7-3-3 = "7 풀하우스") ✔✔ [N][S].
//   ✔✔ Every hand that matches a snipe drops to last place [N][S][M]. ✔ Sniped hands tie for last without being
//      compared to each other [N fn.76]. ✔ A player may snipe their own hand, e.g. to force a draw [P] (8R).
//      ◇ A snipe hits every player whose hand matches it (two players with "9 투페어" are both sniped) [P] 8R
//      supports it: one snipe of "9 풀하우스" sank exactly the 9 full house.
//   ◇  Snipes are said out loud, so later snipers know the earlier ones [P]. A snipe of a hand that cannot exist on
//      this board is allowed but pointless; the site's picker lists only possible hands (plus your own).
// Showdown and ties ✔ [N] (+ [S] in other words, [P] 40R and 60R applying them)
//   1. The best hand that was not sniped takes the pot.
//   2. Same hand type: the higher numbers used in the hand win (9 투페어 beats 8 투페어; ◇ then the second pair /
//      the full house's pair — [N fn.90] reasons that 9-9-2-2 beats 9-9-1-1).
//   3. Still equal: the higher private card wins; 4. then the other private card. (Private cards count even when
//      they are not part of the hand [P] 40R: 10·8 beat 10·5 with both on "10 하이카드".)
//   5. Identical private cards, or every hand sniped: a draw — the pot is split equally among the players in the
//      showdown and leftover chips go one each in betting order from the 선 ✔ [N] ([S]: "shared equally").
//   ◇  The same split applies when two unsniped hands tie exactly on steps 1–4.
// Survival and elimination
//   ✔✔ Whoever has 75+ chips after a round pays 75 to the dealer and is safe [N][S][M]. ✔ They hand the rest to the
//      other players as they like, but a player on 0 chips must get at least 1 [N].
//   ✔✔ The last player left who has not reached safety is eliminated [N][M]. ([S] says "0 chips = out"; [N] keeps
//      such a player in by the 1-chip rule — the arithmetic below shows why both are consistent.)
//   ◇  Several players reaching 75 in the same round are settled in betting order from the 선.
// Arithmetic that holds the format together (◇ our observation, implied by [M]): with N players and threshold T,
//   S·N = T·(N−1) (60·5 = 75·4), so with n players left the table always holds exactly T·(n−1) chips. Whenever
//   one player is on 0, someone else must have ≥ T and leaves, and their surplus is enough to give the 0-chip player
//   1 — unless nobody else is left, and then the 0-chip player is the one eliminated. The 1:1 at the end is won only
//   by taking every chip.
//
// ─── How the site's version differs (shown on the game page) ──────────────────────────────────────────────────────
//   • 2–5 players (the show had 5). To keep the arithmetic above, the safety line is T = 60·N/(N−1):
//     5 → 75 (the broadcast), 4 → 80, 3 → 90, 2 → 120 (1:1 = take every chip).
//   • A "quick table" option starts with 24 chips (safety 30 / 32 / 36 / 48) for shorter matches.
//   • Surplus chips are not handed out by choice: they go 1 to every 0-chip player first, then evenly to the others,
//     the smaller stacks first (the show's survivors mostly asked for an even split).
//   • ◇ Rising ante (default since 11/27; the show kept 1 chip): 1 for rounds 1–4, then 2 / 3 / 4 / 6 / 8 from rounds
//     5 / 7 / 9 / 11 / 13 and +3 every 2 rounds after, ×0.4 at 24 chips, never above the smallest stack. AI self-play
//     (hard,normal,normal,easy,easy, 40 matches at 60 chips): fixed ante median 33 rounds, p90 98, longest 165;
//     rising median 14, p90 20, longest 23. Room hosts can pick 'fixed' (show rules); the AI match always rises.
//     A game saved before 11/27 has no anteRule and keeps the fixed ante.
//   • Turn clocks in friend/open rooms (the show had none), and the AI plays empty seats.
//
// Pure functions only. src/lib/sniperHoldemAi.ts decides AI moves; src/lib/sniperHoldemRoom.ts adds seats and clocks.

export const SH_SEATS = 5;
export const SH_DECK: readonly number[] = Array.from({ length: 40 }, (_, i) => (i % 10) + 1);
export const SH_CHIPS_SHOW = 60;
export const SH_CHIPS_QUICK = 24;
export type ShChips = typeof SH_CHIPS_SHOW | typeof SH_CHIPS_QUICK;
export const SH_ANTE = 1;
/**
 * The ante. 'fixed' = the broadcast's 1 chip every round. 'rise' (◇ the site's own rule, the default since 11/27) =
 * 1 chip for the first rounds as on the show, then rising so a match does not drag (the show's 1:1 ran 27 rounds).
 * A match keeps the rule it started with: a game saved before the rule existed has no `anteRule` and stays fixed.
 */
export type ShAnteRule = 'rise' | 'fixed';
/**
 * Rising schedule at 60 starting chips: [from round, ante]. After the last step it goes up by SH_ANTE_TAIL every
 * 2 rounds. Other starting stacks scale it (24 chips → 0.4×, never below 1). Never above the smallest stack.
 * Tuned by AI self-play (scripts/sniper-holdem-arena.ts): see the numbers in the header.
 */
export const SH_ANTE_STEPS: [number, number][] = [[1, 1], [5, 2], [7, 3], [9, 4], [11, 6], [13, 8]];
/** After the last step: +add every `every` rounds. Other stacks scale the ante by (start ÷ 60)^scalePow. */
export const SH_ANTE_TAIL = { every: 2, add: 3, scalePow: 1 };
export function shAnte(rule: ShAnteRule | undefined, round: number, startChips: number = SH_CHIPS_SHOW): number {
  if (rule !== 'rise') return SH_ANTE;
  let [from, ante] = SH_ANTE_STEPS[0];
  for (const step of SH_ANTE_STEPS) if (round >= step[0]) [from, ante] = step;
  const last = SH_ANTE_STEPS[SH_ANTE_STEPS.length - 1];
  if (from === last[0]) ante += Math.floor((round - last[0]) / SH_ANTE_TAIL.every) * SH_ANTE_TAIL.add;
  return Math.max(1, Math.round(ante * Math.pow(startChips / SH_CHIPS_SHOW, SH_ANTE_TAIL.scalePow)));
}
/** The next round at which the ante goes up, and to what (null for the fixed ante). */
export function shNextAnte(rule: ShAnteRule | undefined, round: number, startChips: number = SH_CHIPS_SHOW): { round: number; ante: number } | null {
  if (rule !== 'rise') return null;
  const now = shAnte(rule, round, startChips);
  for (let r = round + 1; r < round + 40; r += 1) { const a = shAnte(rule, r, startChips); if (a > now) return { round: r, ante: a }; }
  return null;
}
/** Safety line for a table of `players`: S·N/(N−1), so the table always holds T·(n−1) chips (75 for five at 60). */
export const shTarget = (start: number, players: number) => (players <= 1 ? start : Math.round((start * players) / (players - 1)));

/** Hand types, worst to best: 0 하이카드 … 6 포카드. */
export const SH_HIGH = 0, SH_PAIR = 1, SH_TWO_PAIR = 2, SH_TRIPLE = 3, SH_STRAIGHT = 4, SH_FULL = 5, SH_FOUR = 6;
export type ShCat = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export const SH_CATS: readonly ShCat[] = [6, 5, 4, 3, 2, 1, 0];
/** A hand: its type and the numbers it is compared by (key[0] is the number a snipe names). */
export type ShHand = { cat: ShCat; key: number[] };
/** What a snipe names: a hand type and its top number. */
export type ShTarget = { cat: ShCat; n: number };
export const shSameTarget = (a: ShTarget | null | undefined, b: ShTarget | null | undefined) => !!a && !!b && a.cat === b.cat && a.n === b.n;
export const shTargetOf = (h: ShHand): ShTarget => ({ cat: h.cat, n: h.key[0] });
/** Lowest top number a hand type can have (a straight tops at 5 or more, a two pair's higher pair is 2 or more). */
export const shMinTop = (cat: ShCat) => (cat === SH_STRAIGHT ? 5 : cat === SH_TWO_PAIR ? 2 : 1);

/** The best hand in a set of cards (any count; the showdown always has six). */
export function shEvaluate(cards: readonly number[]): ShHand {
  const count = Array(11).fill(0);
  for (const c of cards) count[c] += 1;
  const desc = (min: number) => { const out: number[] = []; for (let n = 10; n >= 1; n -= 1) if (count[n] >= min) out.push(n); return out; };
  const fours = desc(4);
  if (fours.length) return { cat: SH_FOUR, key: [fours[0]] };
  const triples = desc(3);
  if (triples.length) {
    const pair = desc(2).find((n) => n !== triples[0]);
    if (pair !== undefined) return { cat: SH_FULL, key: [triples[0], pair] };
  }
  for (let top = 10; top >= 5; top -= 1) {
    if ([0, 1, 2, 3, 4].every((d) => count[top - d] > 0)) return { cat: SH_STRAIGHT, key: [top] };
  }
  if (triples.length) return { cat: SH_TRIPLE, key: [triples[0]] };
  const pairs = desc(2);
  if (pairs.length >= 2) return { cat: SH_TWO_PAIR, key: [pairs[0], pairs[1]] };
  if (pairs.length === 1) return { cat: SH_PAIR, key: [pairs[0]] };
  return { cat: SH_HIGH, key: [desc(1)[0] ?? 0] };
}

/** Compares two hands by type, then the hand's numbers (positive = a is better). */
export function shCompareHands(a: ShHand, b: ShHand): number {
  if (a.cat !== b.cat) return a.cat - b.cat;
  for (let i = 0; i < Math.max(a.key.length, b.key.length); i += 1) {
    const d = (a.key[i] ?? 0) - (b.key[i] ?? 0);
    if (d) return d;
  }
  return 0;
}
/** Tie-break on private cards: higher one first, then the other (positive = a is better). */
export function shComparePrivate(a: readonly number[], b: readonly number[]): number {
  const x = [...a].sort((p, q) => q - p);
  const y = [...b].sort((p, q) => q - p);
  return (x[0] - y[0]) || (x[1] - y[1]);
}

export type ShPhase = 'bet1' | 'bet2' | 'snipe' | 'showdown' | 'finished';

export type ShAction =
  | { kind: 'call' } // match the bet (not allowed to open a betting round: there is no checking)
  | { kind: 'raise'; to: number } // total put in this round, ante included
  | { kind: 'fold' }
  | { kind: 'snipe'; target: ShTarget }
  | { kind: 'pass' }; // no snipe

export type ShEvent =
  | { k: 'round'; round: number; first: number; ante: number; cap: number }
  | { k: 'board'; cards: number[] } // the third and fourth shared cards
  | { k: 'call'; seat: number; to: number }
  | { k: 'raise'; seat: number; to: number; open: boolean } // open = the first bet of a betting round
  | { k: 'fold'; seat: number }
  | { k: 'snipe'; seat: number; target: ShTarget }
  | { k: 'pass'; seat: number }
  | { k: 'win'; seats: number[]; pot: number; split: boolean; byFold: boolean; allSniped: boolean }
  | { k: 'safe'; seat: number; place: number; paid: number; gifts: number[] }
  | { k: 'out'; seat: number; place: number };

export type ShEntry = { seat: number; hand: ShHand; cards: number[]; sniped: boolean };
export type ShShowdown = {
  entries: ShEntry[]; // players in the showdown: unsniped best first, sniped last
  winners: number[];
  payouts: number[]; // chips won this round, by seat
  pot: number;
  byFold: boolean; // everyone else folded: no snipes, the winner's cards stay hidden
  allSniped: boolean;
  safe: number[]; // seats that reached the safety line this round, in settlement order
  gifts: number[]; // chips each seat received from this round's survivors
  out: number[]; // seat eliminated this round (the match is over)
};
/** One finished round, for the hands sheet and the result screen. */
export type ShRoundLog = {
  round: number; first: number; board: number[]; winners: number[]; pot: number; chips: number[];
  hands: (number[] | null)[]; // private cards shown at the showdown (null = folded / hidden)
  hand: (ShHand | null)[];
  snipes: (ShTarget | null | 'pass')[];
  sniped: boolean[];
  payouts: number[];
};

export type SniperHoldem = {
  gid: string;
  round: number;
  first: number; // 선: opens every betting round and snipes first
  startChips: number;
  target: number; // the safety line
  players: number; // seated at the start (2–5)
  ante: number;
  /** 'rise' or 'fixed'; missing (a game saved before 11/27) = fixed. */
  anteRule?: ShAnteRule;
  cap: number; // most one player may put in this round: the smallest stack among players still in the match
  phase: ShPhase;
  turn: number; // seat to act, -1 between rounds
  chips: number[];
  safe: boolean[]; // reached the safety line and left the table
  out: boolean[]; // eliminated (or never seated)
  place: (number | null)[]; // 1 = first to safety … players = eliminated
  hands: (number | null)[][]; // two private cards each (null = hidden from this viewer)
  board: (number | null)[]; // four shared cards; [2], [3] stay hidden until betting round 2 (null for guests)
  shown: number; // shared cards face up (2 or 4)
  folded: boolean[];
  bets: number[]; // put in this round (ante included)
  level: number; // the amount to match
  base: number; // the level when this betting round began (the opener must go above it)
  acted: boolean[]; // acted since the last raise in this betting round
  snipes: (ShTarget | null | 'pass')[]; // this round: null = not yet decided
  deck: number[]; // undealt cards (zeros for guests)
  showdown: ShShowdown | null;
  log: ShEvent[]; // newest first
  rounds: ShRoundLog[];
  seq: number;
  absent?: boolean[]; // seats nobody sits in (a room without AI): out from the start and hidden
};

const shuffle = <T,>(list: readonly T[]): T[] => {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const LOG_MAX = 80;
const push = (g: SniperHoldem, ...events: ShEvent[]): ShEvent[] => [...events.reverse(), ...g.log].slice(0, LOG_MAX);
const ring = (from: number) => Array.from({ length: SH_SEATS }, (_, i) => (((from + i) % SH_SEATS) + SH_SEATS) % SH_SEATS);

/** Still in the match: seated, not safe, not eliminated. */
export const shActive = (g: Pick<SniperHoldem, 'safe' | 'out'>, s: number) => !g.safe[s] && !g.out[s];
export const shActiveSeats = (g: Pick<SniperHoldem, 'safe' | 'out'>) => Array.from({ length: SH_SEATS }, (_, s) => s).filter((s) => shActive(g, s));
/** In this hand: active and not folded. */
export const shLive = (g: SniperHoldem, s: number) => shActive(g, s) && !g.folded[s];
export const shLiveSeats = (g: SniperHoldem) => ring(g.first).filter((s) => shLive(g, s));
export const shPot = (g: SniperHoldem) => g.bets.reduce((a, b) => a + b, 0);
const nextActive = (g: Pick<SniperHoldem, 'safe' | 'out'>, after: number) => ring(after + 1).find((s) => shActive(g, s)) ?? after;

/** `seated`: which of the five seats play (default all). `startChips`: 60 (the show) or 24 (quick). */
export function newSniperHoldem(seated: readonly boolean[] = Array(SH_SEATS).fill(true), startChips: number = SH_CHIPS_SHOW, firstSeat?: number, anteRule: ShAnteRule = 'rise'): SniperHoldem {
  const absent = Array.from({ length: SH_SEATS }, (_, i) => !seated[i]);
  const filled = Array.from({ length: SH_SEATS }, (_, i) => i).filter((i) => seated[i]);
  const players = filled.length;
  // The draw for the first player; startRound moves it one seat on, so start one seat before.
  const first = firstSeat ?? filled[Math.floor(Math.random() * filled.length)] ?? 0;
  const base: SniperHoldem = {
    gid: Math.random().toString(36).slice(2, 10), round: 0, first: (first + SH_SEATS - 1) % SH_SEATS,
    startChips, target: shTarget(startChips, players), players, ante: SH_ANTE, anteRule, cap: startChips,
    phase: 'bet1', turn: -1, chips: absent.map((a) => (a ? 0 : startChips)),
    safe: Array(SH_SEATS).fill(false), out: absent.slice(), place: Array(SH_SEATS).fill(null),
    hands: Array.from({ length: SH_SEATS }, () => []), board: [], shown: 0,
    folded: Array(SH_SEATS).fill(false), bets: Array(SH_SEATS).fill(0), level: 0, base: 0,
    acted: Array(SH_SEATS).fill(false), snipes: Array(SH_SEATS).fill(null), deck: [], showdown: null,
    log: [], rounds: [], seq: 0, ...(absent.some(Boolean) ? { absent } : {}),
  };
  return startRound(base);
}

/** Next round: the 선 moves one seat on, everyone antes (shAnte), two private cards each, two shared cards face up. */
export function startRound(prev: SniperHoldem, deckOrder?: readonly number[]): SniperHoldem {
  const round = prev.round + 1;
  const first = nextActive(prev, prev.first);
  const active = shActiveSeats(prev);
  const cap = Math.min(...active.map((s) => prev.chips[s]));
  const ante = Math.min(shAnte(prev.anteRule, round, prev.startChips), cap);
  const deck = deckOrder ? [...deckOrder] : shuffle(SH_DECK);
  const hands: number[][] = Array.from({ length: SH_SEATS }, () => []);
  for (let k = 0; k < 2; k += 1) for (const s of ring(first)) if (active.includes(s)) hands[s].push(deck.pop()!);
  const board = [deck.pop()!, deck.pop()!, deck.pop()!, deck.pop()!];
  const isActive = (s: number) => active.includes(s);
  const g: SniperHoldem = {
    ...prev, round, first, ante, cap, phase: 'bet1', turn: -1,
    chips: prev.chips.map((c, s) => (isActive(s) ? c - ante : c)),
    hands, board, shown: 2, folded: Array.from({ length: SH_SEATS }, (_, s) => !isActive(s)),
    bets: Array.from({ length: SH_SEATS }, (_, s) => (isActive(s) ? ante : 0)), level: ante, base: ante,
    acted: Array(SH_SEATS).fill(false), snipes: Array(SH_SEATS).fill(null), deck, showdown: null, seq: prev.seq + 1,
  };
  return beginBetting({ ...g, log: push(g, { k: 'round', round, first, ante, cap }) }, 'bet1');
}

/** Next seat to bet after `after`, or null when the betting round is over. */
function nextBettor(g: SniperHoldem, after: number): number | null {
  return ring(after + 1).find((s) => shLive(g, s) && (!g.acted[s] || g.bets[s] < g.level)) ?? null;
}

function beginBetting(g: SniperHoldem, phase: 'bet1' | 'bet2'): SniperHoldem {
  const ready: SniperHoldem = { ...g, phase, acted: Array(SH_SEATS).fill(false), base: g.level };
  // Everyone already put in the cap: nobody can bet more, so this betting round is skipped.
  if (g.level >= g.cap) return phase === 'bet1' ? toBet2(ready) : beginSnipes(ready);
  const turn = nextBettor(ready, g.first - 1);
  return turn === null ? (phase === 'bet1' ? toBet2(ready) : beginSnipes(ready)) : { ...ready, turn };
}

function toBet2(g: SniperHoldem): SniperHoldem {
  const next: SniperHoldem = { ...g, shown: 4 };
  return beginBetting({ ...next, log: push(next, { k: 'board', cards: [g.board[2] ?? 0, g.board[3] ?? 0] }) }, 'bet2');
}

function beginSnipes(g: SniperHoldem): SniperHoldem {
  const ready: SniperHoldem = { ...g, phase: 'snipe', shown: 4 };
  const turn = shLiveSeats(ready).find((s) => ready.snipes[s] === null);
  return turn === undefined ? showdown(ready) : { ...ready, turn };
}

/** The hand a seat holds now (shown shared cards + its private cards), or null if its cards are hidden. */
export function shHandOf(g: SniperHoldem, seat: number, allBoard = false): ShHand | null {
  const priv = g.hands[seat];
  if (priv.length < 2 || priv.some((c) => c === null)) return null;
  const board = g.board.slice(0, allBoard ? 4 : g.shown).filter((c): c is number => c !== null);
  return shEvaluate([...board, ...(priv as number[])]);
}

const isSniped = (hand: ShHand, snipes: SniperHoldem['snipes']) => snipes.some((t) => t !== null && t !== 'pass' && shSameTarget(t, shTargetOf(hand)));

/**
 * Who wins among `live` seats (betting order). Pure so the AI can use it on imagined cards.
 * Returns the ordered entries and the winners (all of them on a draw).
 */
export function shResolve(board: readonly number[], hands: readonly (readonly number[])[], live: readonly number[], snipes: readonly (ShTarget | null | 'pass')[]): { entries: ShEntry[]; winners: number[]; allSniped: boolean } {
  const entries: ShEntry[] = live.map((s) => {
    const hand = shEvaluate([...board, ...hands[s]]);
    return { seat: s, hand, cards: [...hands[s]], sniped: isSniped(hand, snipes as SniperHoldem['snipes']) };
  });
  const order = (a: ShEntry, b: ShEntry) => {
    if (a.sniped !== b.sniped) return a.sniped ? 1 : -1;
    if (a.sniped) return 0; // sniped hands tie for last, never compared
    return -(shCompareHands(a.hand, b.hand) || shComparePrivate(a.cards, b.cards));
  };
  const sorted = [...entries].sort(order);
  const best = sorted[0];
  const allSniped = !!best && best.sniped;
  const winners = allSniped ? [...live] : sorted.filter((e) => !e.sniped && order(e, best) === 0).map((e) => e.seat);
  return { entries: sorted, winners, allSniped };
}

/** Even shares; leftover chips one each in betting order from the 선. */
export function shSplit(pot: number, winners: readonly number[], first: number): number[] {
  const payouts = Array(SH_SEATS).fill(0);
  const share = Math.floor(pot / winners.length);
  let rest = pot - share * winners.length;
  for (const s of winners) payouts[s] = share;
  for (const s of ring(first)) if (rest > 0 && winners.includes(s)) { payouts[s] += 1; rest -= 1; }
  return payouts;
}

/**
 * A survivor's surplus: one chip to every 0-chip player first (the rule), then as evenly as possible,
 * smaller stacks first. Returns the chips each seat receives.
 */
export function shGifts(surplus: number, chips: readonly number[], recipients: readonly number[]): number[] {
  const gifts = Array(SH_SEATS).fill(0);
  let left = surplus;
  for (const s of recipients) if (left > 0 && chips[s] <= 0) { gifts[s] += 1; left -= 1; }
  if (left > 0 && recipients.length) {
    const share = Math.floor(left / recipients.length);
    for (const s of recipients) gifts[s] += share;
    left -= share * recipients.length;
    const poorest = [...recipients].sort((a, b) => (chips[a] + gifts[a]) - (chips[b] + gifts[b]));
    for (const s of poorest) if (left > 0) { gifts[s] += 1; left -= 1; }
  }
  return gifts;
}

function showdown(g: SniperHoldem): SniperHoldem {
  const live = shLiveSeats(g);
  const pot = shPot(g);
  const byFold = live.length === 1;
  const board = g.board as number[];
  const res = byFold
    ? { entries: [] as ShEntry[], winners: live, allSniped: false }
    : shResolve(board, g.hands as number[][], live, g.snipes);
  const payouts = shSplit(pot, res.winners, g.first);
  let chips = g.chips.map((c, s) => c + payouts[s]);

  // Safety: everyone at the line pays it and leaves; their surplus goes to the players still in.
  const safe = g.safe.slice();
  const place = g.place.slice();
  const gifts = Array(SH_SEATS).fill(0);
  const events: ShEvent[] = [{ k: 'win', seats: res.winners, pot, split: res.winners.length > 1, byFold, allSniped: res.allSniped }];
  let placed = place.filter((p) => p !== null).length;
  const leaving = ring(g.first).filter((s) => shActive(g, s) && chips[s] >= g.target);
  for (const s of leaving) safe[s] = true;
  for (const s of leaving) {
    const surplus = chips[s] - g.target;
    chips[s] = 0;
    const recipients = ring(s + 1).filter((r) => !safe[r] && !g.out[r]);
    const given = shGifts(surplus, chips, recipients);
    chips = chips.map((c, r) => c + given[r]);
    given.forEach((n, r) => { gifts[r] += n; });
    placed += 1;
    place[s] = placed;
    events.push({ k: 'safe', seat: s, place: placed, paid: g.target, gifts: given });
  }
  // The last player not safe is eliminated. (A 0-chip player always receives a chip when anyone else is left.)
  const out = g.out.slice();
  const left = Array.from({ length: SH_SEATS }, (_, s) => s).filter((s) => !safe[s] && !out[s]);
  const eliminated: number[] = [];
  if (left.length === 1 || (left.length > 1 && left.some((s) => chips[s] <= 0))) {
    // The second case cannot happen by the arithmetic in the header; if it ever did, the broke player is out.
    const s = left.length === 1 ? left[0] : left.find((x) => chips[x] <= 0)!;
    out[s] = true;
    place[s] = g.players;
    eliminated.push(s);
    events.push({ k: 'out', seat: s, place: g.players });
  }
  const stillIn = Array.from({ length: SH_SEATS }, (_, s) => s).filter((s) => !safe[s] && !out[s]);
  // When the broke-player guard fired with others still in, the rest are placed by chips (never in normal play).
  if (eliminated.length && stillIn.length) {
    for (const s of [...stillIn].sort((a, b) => chips[b] - chips[a])) { placed += 1; place[s] = placed; safe[s] = true; }
  }
  const finished = Array.from({ length: SH_SEATS }, (_, s) => s).filter((s) => !safe[s] && !out[s]).length === 0;

  const next: SniperHoldem = {
    ...g, phase: finished ? 'finished' : 'showdown', turn: -1, chips, safe, out, place, shown: 4,
    showdown: { entries: res.entries, winners: res.winners, payouts, pot, byFold, allSniped: res.allSniped, safe: leaving, gifts, out: eliminated },
    rounds: [...g.rounds, {
      round: g.round, first: g.first, board: [...board], winners: res.winners, pot, chips, payouts,
      hands: g.hands.map((h, s) => (!byFold && live.includes(s) ? [...(h as number[])] : null)),
      hand: g.hands.map((_, s) => res.entries.find((e) => e.seat === s)?.hand ?? null),
      snipes: g.snipes.slice(), sniped: Array.from({ length: SH_SEATS }, (_, s) => !!res.entries.find((e) => e.seat === s)?.sniped),
    }].slice(-40),
  };
  return { ...next, log: push(next, ...events) };
}

const validTarget = (t: ShTarget) => Number.isInteger(t?.cat) && t.cat >= 0 && t.cat <= 6 && Number.isInteger(t.n) && t.n >= shMinTop(t.cat as ShCat) && t.n <= 10;

/** Whether `seat` may take `action` now. */
export function shCanAct(g: SniperHoldem, seat: number, action: ShAction): boolean {
  if (seat < 0 || seat >= SH_SEATS || !shLive(g, seat) || g.turn !== seat) return false;
  const betting = g.phase === 'bet1' || g.phase === 'bet2';
  switch (action.kind) {
    case 'fold': return betting;
    // No checking: calling needs a bet to match (the opener has to bet at least 1).
    case 'call': return betting && g.level > g.base && g.bets[seat] < g.level;
    case 'raise': return betting && Number.isInteger(action.to) && action.to > g.level && action.to <= g.cap;
    case 'snipe': return g.phase === 'snipe' && validTarget(action.target);
    case 'pass': return g.phase === 'snipe';
  }
}

/** The smallest bet that opens / raises now. */
export const shMinRaise = (g: SniperHoldem) => g.level + 1;

export function applyShAction(g: SniperHoldem, seat: number, action: ShAction): SniperHoldem | null {
  if (!shCanAct(g, seat, action)) return null;
  const set = <T,>(list: readonly T[], value: T) => list.map((v, i) => (i === seat ? value : v));
  let next: SniperHoldem = { ...g, seq: g.seq + 1 };
  switch (action.kind) {
    case 'call': case 'raise': {
      const to = action.kind === 'raise' ? action.to : g.level;
      const pay = to - g.bets[seat];
      const acted = action.kind === 'raise' ? g.acted.map((_, i) => i === seat) : set(g.acted, true);
      next = { ...next, chips: set(g.chips, g.chips[seat] - pay), bets: set(g.bets, to), level: to, acted };
      next.log = push(next, action.kind === 'raise' ? { k: 'raise', seat, to, open: g.level === g.base } : { k: 'call', seat, to });
      break;
    }
    case 'fold': {
      next = { ...next, folded: set(g.folded, true), acted: set(g.acted, true) };
      next.log = push(next, { k: 'fold', seat });
      if (shLiveSeats(next).length === 1) return showdown(next);
      break;
    }
    case 'snipe': case 'pass': {
      const value = action.kind === 'snipe' ? { cat: action.target.cat, n: action.target.n } : 'pass' as const;
      next = { ...next, snipes: set(g.snipes, value) };
      next.log = push(next, action.kind === 'snipe' ? { k: 'snipe', seat, target: value as ShTarget } : { k: 'pass', seat });
      const turn = ring(seat + 1).find((s) => shLive(next, s) && next.snipes[s] === null);
      return turn === undefined ? showdown(next) : { ...next, turn };
    }
  }
  const turn = nextBettor(next, seat);
  if (turn !== null) return { ...next, turn };
  return next.phase === 'bet1' ? toBet2(next) : beginSnipes(next);
}

/** A timed-out turn: call if there is a bet to match, else fold (no checking); no snipe. */
export function shTimeoutAction(g: SniperHoldem, seat: number): ShAction {
  if (g.phase === 'snipe') return { kind: 'pass' };
  return shCanAct(g, seat, { kind: 'call' }) ? { kind: 'call' } : { kind: 'fold' };
}

/**
 * Every hand a snipe could name on this board: hands some unseen pair of private cards could make, plus the
 * viewer's own. `mine`: the viewer's private cards (they are not in anyone else's hand), or [] for a spectator.
 */
export function shPossibleTargets(board: readonly number[], mine: readonly number[]): ShTarget[] {
  const left = Array(11).fill(4);
  for (const c of [...board, ...mine]) left[c] -= 1;
  const seen = new Set<string>();
  const out: ShTarget[] = [];
  const add = (h: ShHand) => { const k = `${h.cat}-${h.key[0]}`; if (!seen.has(k)) { seen.add(k); out.push(shTargetOf(h)); } };
  for (let a = 1; a <= 10; a += 1) {
    for (let b = a; b <= 10; b += 1) {
      if (a === b ? left[a] < 2 : left[a] < 1 || left[b] < 1) continue;
      add(shEvaluate([...board, a, b]));
    }
  }
  if (mine.length === 2) add(shEvaluate([...board, ...mine]));
  return out.sort((x, y) => (y.cat - x.cat) || (y.n - x.n));
}

// ---------------------------------------------------------------------------------------------
// Secrets: private cards stay with their owner until the showdown; the last two shared cards stay with the host
// until betting round 2.

export function shVisible(g: SniperHoldem, viewer: number | null, seat: number): boolean {
  if (seat === viewer) return true;
  if (g.phase !== 'showdown' && g.phase !== 'finished') return false;
  return !!g.showdown && !g.showdown.byFold && g.showdown.entries.some((e) => e.seat === seat);
}

/** What guests receive: hidden private cards, unrevealed shared cards and the deck blanked. */
export function redactSniperHoldem(g: SniperHoldem): SniperHoldem {
  return {
    ...g,
    hands: g.hands.map((hand, s) => (shVisible(g, null, s) ? hand : hand.map(() => null))),
    board: g.board.map((c, i) => (i < g.shown ? c : null)),
    deck: g.deck.map(() => 0),
  };
}

export const sniperHoldemSecret = (g: SniperHoldem, seat: number) => g.hands[seat].slice(0, 2);

export function withSniperHoldemSecret(g: SniperHoldem, secret: unknown, seat: number): SniperHoldem {
  if (!Array.isArray(secret) || seat < 0 || seat >= SH_SEATS) return g;
  const mine = secret as (number | null)[];
  return { ...g, hands: g.hands.map((hand, s) => (s === seat ? hand.map((c, i) => mine[i] ?? c) : hand)) };
}

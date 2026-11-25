// HIT, STAY (힛, 스테이): five players bring the sum of their number cards as close to the round's
// limit (an eight-sided die, 5–12) as they dare, betting chips twice around it.
//
// One round:
//   ante → limit roll → 3 cards each, everyone shows one → bet 1 (from the first player: call / raise / fold)
//   → HIT or STAY in turn until all stay or the deck runs out (extra cards are public) → bet 2 → showdown.
// Closest to the limit without going over wins the pot; equal sums go to more cards; over the limit is last.
// Any other tie splits the pot, the odd chips going to the tied player nearest the first player.
// A player at 0 chips is out; the last one standing wins.
//
// Pure functions only. The room (src/lib/hitStayRoom.ts) adds seats, clocks and AI turns.

export const HS_PLAYERS = 5;
export const HS_START_CHIPS = 30;
/** 7×1, 6×2, 5×3, 4×4, 3×5, 2×6, 1×7 and -1×7: 35 cards. */
export const HS_DECK: readonly number[] = [7, 6, 6, 5, 5, 5, 4, 4, 4, 4, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1];
export const HS_DIE: readonly number[] = [5, 6, 7, 8, 9, 10, 11, 12];
/** Base bet: 1, and one more every 10 rounds. */
export const hsAnte = (round: number) => 1 + Math.floor((round - 1) / 10);

/**
 * Every AI plays at full strength (a Monte Carlo look at every decision) and picks the best move for its own
 * situation; each has its own betting temperament, which is never shown to players.
 */
export type HsStyle = 'calc' | 'shark' | 'rock' | 'gambler' | 'fox';
export const HS_STYLES: readonly HsStyle[] = ['calc', 'shark', 'rock', 'gambler', 'fox'];
export const HS_PERSONA: Record<HsStyle, { name: string; nameEn: string; color: string }> = {
  calc: { name: '제로', nameEn: 'ZERO', color: '#7fb4ff' },
  shark: { name: '레오', nameEn: 'LEO', color: '#ff6b6b' },
  rock: { name: '모아', nameEn: 'MOA', color: '#9aa4b8' },
  gambler: { name: '루나', nameEn: 'LUNA', color: '#ffc04d' },
  fox: { name: '카이', nameEn: 'KAI', color: '#c08bff' },
};
export type HsPhase = 'pick' | 'bet1' | 'hit' | 'bet2' | 'showdown' | 'finished';

export type HsAction =
  | { kind: 'open'; index: number } // pick which of the first three cards everyone sees
  | { kind: 'call' } // match the current bet (or check when nothing is owed)
  | { kind: 'raise'; to: number } // total contribution this round
  | { kind: 'fold' }
  | { kind: 'hit' }
  | { kind: 'stay' };

export type HsEvent =
  | { k: 'round'; round: number; first: number; limit: number; ante: number }
  | { k: 'open'; seat: number; card: number }
  | { k: 'check'; seat: number }
  | { k: 'call'; seat: number; to: number }
  | { k: 'raise'; seat: number; to: number }
  | { k: 'fold'; seat: number }
  | { k: 'hit'; seat: number; card: number }
  | { k: 'stay'; seat: number }
  | { k: 'win'; seats: number[]; pot: number; split: boolean; byFold: boolean }
  | { k: 'out'; seat: number; place: number };

export type HsEntry = { seat: number; total: number; count: number; bust: boolean };
export type HsShowdown = {
  entries: HsEntry[]; // players still in, best first
  winners: number[];
  payouts: number[]; // chips won this round, by seat
  pot: number;
  byFold: boolean; // everyone else folded: the winner's hand stays hidden
  out: number[]; // seats knocked out this round
};
/** One finished round, for the result screen. */
export type HsRoundLog = {
  round: number; limit: number; first: number; winners: number[]; pot: number; chips: number[];
  hands?: (number | null)[][]; // what everyone could see at the end (hidden cards of folded hands stay null)
  folded?: boolean[]; // out of this round (folded, or already knocked out)
  payouts?: number[];
};

export type HitStay = {
  gid: string; // one match (a rematch in the same room gets a new one)
  round: number;
  first: number; // 선: acts first in every betting and HIT/STAY turn
  limit: number;
  ante: number;
  cap: number; // most one player may put in this round: the smallest stack at the start of the round
  phase: HsPhase;
  turn: number; // seat to act (bet / hit), -1 while everyone picks at once or between rounds
  chips: number[];
  out: boolean[];
  place: (number | null)[]; // final placing, 1 = winner
  hands: (number | null)[][]; // [0..2] dealt, [3..] hits (public). null = hidden from this viewer
  openIdx: (number | null)[]; // which dealt card is face up
  folded: boolean[];
  stayed: boolean[];
  bets: number[]; // put in this round (ante included)
  level: number; // the bet to match
  acted: boolean[]; // acted since the last raise in this betting round
  deck: number[]; // undealt cards (zeros for guests: only the count is public)
  showdown: HsShowdown | null;
  log: HsEvent[]; // newest first
  rounds: HsRoundLog[];
  seq: number; // counts every change, so the table can animate the latest one
  /** Seats nobody sits in (a room started without AI and fewer than five players): out from the start and hidden. */
  absent?: boolean[];
};

const shuffle = <T,>(list: readonly T[]): T[] => {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const LOG_MAX = 60;
const push = (g: HitStay, ...events: HsEvent[]): HsEvent[] => [...events.reverse(), ...g.log].slice(0, LOG_MAX);

export const hsAlive = (g: HitStay) => g.out.map((o, i) => (o ? -1 : i)).filter((i) => i >= 0);
/** In the hand: not out and not folded. */
export const hsLive = (g: HitStay, seat: number) => !g.out[seat] && !g.folded[seat];
export const hsPot = (g: HitStay) => g.bets.reduce((a, b) => a + b, 0);
export const hsTotal = (cards: (number | null)[]) => cards.reduce<number>((sum, c) => sum + (c ?? 0), 0);
/** Seats clockwise starting with `from`. */
const ring = (from: number) => Array.from({ length: HS_PLAYERS }, (_, i) => (from + i) % HS_PLAYERS);
const nextAlive = (g: { out: boolean[] }, after: number) => ring(after + 1).find((s) => !g.out[s]) ?? after;

/** `seated`: which of the five seats are played (default all); the others stay empty for the whole game. */
export function newHitStay(seated: readonly boolean[] = Array(HS_PLAYERS).fill(true)): HitStay {
  const filled = Array.from({ length: HS_PLAYERS }, (_, i) => i).filter((i) => seated[i]);
  const absent = Array.from({ length: HS_PLAYERS }, (_, i) => !seated[i]);
  const base: HitStay = {
    gid: Math.random().toString(36).slice(2, 10), round: 0, first: filled[Math.floor(Math.random() * filled.length)] ?? 0, limit: 0, ante: 1, cap: HS_START_CHIPS, phase: 'pick', turn: -1,
    chips: absent.map((a) => (a ? 0 : HS_START_CHIPS)), out: absent.slice(), place: Array(HS_PLAYERS).fill(null), ...(absent.some(Boolean) ? { absent } : {}),
    hands: Array.from({ length: HS_PLAYERS }, () => []), openIdx: Array(HS_PLAYERS).fill(null),
    folded: Array(HS_PLAYERS).fill(false), stayed: Array(HS_PLAYERS).fill(false), bets: Array(HS_PLAYERS).fill(0),
    level: 0, acted: Array(HS_PLAYERS).fill(false), deck: [], showdown: null, log: [], rounds: [], seq: 0,
  };
  // The draw ball picks the first player of round 1; startRound moves it one seat left every round after.
  return startRound({ ...base, first: (base.first + HS_PLAYERS - 1) % HS_PLAYERS });
}

/** Next round: the first player moves one seat to the left, ante in, roll the limit, deal three each. */
export function startRound(prev: HitStay): HitStay {
  const round = prev.round + 1;
  const first = nextAlive(prev, prev.first);
  const alive = prev.out.map((o) => !o);
  const cap = Math.min(...prev.chips.filter((_, i) => alive[i]));
  const ante = Math.min(hsAnte(round), cap);
  const deck = shuffle(HS_DECK);
  const hands: number[][] = Array.from({ length: HS_PLAYERS }, () => []);
  for (let k = 0; k < 3; k += 1) for (const s of ring(first)) if (alive[s]) hands[s].push(deck.pop()!);
  const limit = HS_DIE[Math.floor(Math.random() * HS_DIE.length)];
  const g: HitStay = {
    ...prev, round, first, limit, ante, cap, phase: 'pick', turn: -1,
    chips: prev.chips.map((c, i) => (alive[i] ? c - ante : c)),
    hands, openIdx: Array(HS_PLAYERS).fill(null),
    folded: prev.out.slice(), stayed: Array(HS_PLAYERS).fill(false),
    bets: alive.map((a) => (a ? ante : 0)), level: ante, acted: Array(HS_PLAYERS).fill(false),
    deck, showdown: null, seq: prev.seq + 1,
  };
  return { ...g, log: push(g, { k: 'round', round, first, limit, ante }) };
}

/** Seats that still have to pick their face-up card. */
export const hsPicking = (g: HitStay) => (g.phase === 'pick' ? hsAlive(g).filter((s) => g.openIdx[s] === null) : []);

/** Whose move it is to bet/hit next after `seat`, or null when the step is over. */
function nextBettor(g: HitStay, after: number): number | null {
  return ring(after + 1).find((s) => hsLive(g, s) && (!g.acted[s] || g.bets[s] < g.level)) ?? null;
}
function nextHitter(g: HitStay, after: number): number | null {
  if (!g.deck.length) return null;
  return ring(after + 1).find((s) => hsLive(g, s) && !g.stayed[s]) ?? null;
}

function beginBetting(g: HitStay, phase: 'bet1' | 'bet2'): HitStay {
  const acted = Array(HS_PLAYERS).fill(false);
  const ready = { ...g, phase, acted };
  const turn = nextBettor(ready, g.first - 1 + HS_PLAYERS);
  // Nobody can raise when the ante already reached the cap: betting is skipped.
  if (turn === null || g.level >= g.cap) return phase === 'bet1' ? beginHits(ready) : showdown(ready);
  return { ...ready, turn };
}

function beginHits(g: HitStay): HitStay {
  const ready = { ...g, phase: 'hit' as const };
  const turn = nextHitter(ready, g.first - 1 + HS_PLAYERS);
  return turn === null ? beginBetting(ready, 'bet2') : { ...ready, turn };
}

/** Ranking key: within the limit beats over it; then closer to the limit; then more cards. */
function better(a: HsEntry, b: HsEntry, limit: number) {
  if (a.bust !== b.bust) return a.bust ? 1 : -1;
  const da = Math.abs(limit - a.total);
  const db = Math.abs(limit - b.total);
  if (da !== db) return da - db;
  return b.count - a.count;
}

export function hsEntry(g: HitStay, seat: number): HsEntry {
  const cards = g.hands[seat];
  const total = hsTotal(cards);
  return { seat, total, count: cards.length, bust: total > g.limit };
}

function showdown(g: HitStay): HitStay {
  const live = ring(g.first).filter((s) => hsLive(g, s));
  const pot = hsPot(g);
  const byFold = live.length === 1;
  const entries = live.map((s) => hsEntry(g, s)).sort((a, b) => better(a, b, g.limit));
  const best = entries[0];
  const winners = byFold ? live : entries.filter((e) => better(e, best, g.limit) === 0).map((e) => e.seat);
  // Equal shares; the odd chips go to the tied winner nearest the first player (clockwise from them).
  const share = Math.floor(pot / winners.length);
  const rest = pot - share * winners.length;
  const nearest = ring(g.first).find((s) => winners.includes(s))!;
  const payouts = Array(HS_PLAYERS).fill(0).map((_, s) => (winners.includes(s) ? share + (s === nearest ? rest : 0) : 0));
  const chips = g.chips.map((c, s) => c + payouts[s]);

  // Knock-outs: everyone at 0 chips. Several at once share the worst place left.
  const aliveBefore = hsAlive(g).length;
  const busted = hsAlive(g).filter((s) => chips[s] <= 0);
  const place = g.place.slice();
  const out = g.out.slice();
  for (const s of busted) { out[s] = true; place[s] = aliveBefore - busted.length + 1; }
  const left = out.map((o, i) => (o ? -1 : i)).filter((i) => i >= 0);
  if (left.length === 1) place[left[0]] = 1;

  const events: HsEvent[] = [{ k: 'win', seats: winners, pot, split: winners.length > 1, byFold }, ...busted.map((s) => ({ k: 'out' as const, seat: s, place: place[s]! }))];
  const next: HitStay = {
    ...g, phase: left.length <= 1 ? 'finished' : 'showdown', turn: -1, chips, out, place,
    showdown: { entries, winners, payouts, pot, byFold, out: busted },
    rounds: [...g.rounds, {
      round: g.round, limit: g.limit, first: g.first, winners, pot, chips, payouts, folded: g.folded.slice(),
      hands: g.hands.map((hand, s) => hand.map((c, i) => (i >= 3 || g.openIdx[s] === i || (!byFold && live.includes(s)) ? c : null))),
    }],
  };
  return { ...next, log: push(next, ...events) };
}

/** Whether `seat` may take `action` now. */
export function hsCanAct(g: HitStay, seat: number, action: HsAction): boolean {
  if (seat < 0 || seat >= HS_PLAYERS || g.out[seat]) return false;
  switch (action.kind) {
    case 'open': return g.phase === 'pick' && g.openIdx[seat] === null && Number.isInteger(action.index) && action.index >= 0 && action.index < 3;
    case 'call': case 'fold': return (g.phase === 'bet1' || g.phase === 'bet2') && g.turn === seat;
    case 'raise': return (g.phase === 'bet1' || g.phase === 'bet2') && g.turn === seat && Number.isInteger(action.to) && action.to > g.level && action.to <= g.cap;
    case 'hit': case 'stay': return g.phase === 'hit' && g.turn === seat;
  }
}

export function applyHsAction(g: HitStay, seat: number, action: HsAction): HitStay | null {
  if (!hsCanAct(g, seat, action)) return null;
  const set = <T,>(list: T[], value: T) => list.map((v, i) => (i === seat ? value : v));
  let next: HitStay = { ...g, seq: g.seq + 1 };
  switch (action.kind) {
    case 'open': {
      next = { ...next, openIdx: set(g.openIdx, action.index) };
      next.log = push(next, { k: 'open', seat, card: g.hands[seat][action.index] ?? 0 });
      return hsPicking(next).length ? next : beginBetting(next, 'bet1');
    }
    case 'call': case 'raise': {
      const to = action.kind === 'raise' ? action.to : g.level;
      const pay = to - g.bets[seat];
      const acted = action.kind === 'raise' ? g.acted.map((_, i) => i === seat) : set(g.acted, true);
      next = { ...next, chips: set(g.chips, g.chips[seat] - pay), bets: set(g.bets, to), level: to, acted };
      next.log = push(next, action.kind === 'raise' ? { k: 'raise', seat, to } : pay === 0 ? { k: 'check', seat } : { k: 'call', seat, to });
      break;
    }
    case 'fold': {
      next = { ...next, folded: set(g.folded, true), acted: set(g.acted, true) };
      next.log = push(next, { k: 'fold', seat });
      if (hsAlive(next).filter((s) => !next.folded[s]).length === 1) return showdown(next);
      break;
    }
    case 'hit': {
      const deck = g.deck.slice();
      const card = deck.pop()!;
      next = { ...next, deck, hands: g.hands.map((h, i) => (i === seat ? [...h, card] : h)) };
      next.log = push(next, { k: 'hit', seat, card });
      const turn = nextHitter(next, seat);
      return turn === null ? beginBetting(next, 'bet2') : { ...next, turn };
    }
    case 'stay': {
      next = { ...next, stayed: set(g.stayed, true) };
      next.log = push(next, { k: 'stay', seat });
      const turn = nextHitter(next, seat);
      return turn === null ? beginBetting(next, 'bet2') : { ...next, turn };
    }
  }
  // After a bet: next bettor, or on to the next step.
  const turn = nextBettor(next, seat);
  if (turn !== null) return { ...next, turn };
  return next.phase === 'bet1' ? beginHits(next) : showdown(next);
}

/** What a timed-out turn does: show a random card, check if free (else fold), stay. */
export function hsTimeoutAction(g: HitStay, seat: number): HsAction {
  if (g.phase === 'pick') return { kind: 'open', index: Math.floor(Math.random() * 3) };
  if (g.phase === 'hit') return { kind: 'stay' };
  return g.bets[seat] >= g.level ? { kind: 'call' } : { kind: 'fold' };
}

// ---------------------------------------------------------------------------------------------
// AI. It only uses what that seat can see: its own cards, everyone's face-up cards and the count.

/** Cards this seat cannot see (other players' hidden cards and the deck). */
function unseen(g: HitStay, seat: number): number[] {
  const pool = [...HS_DECK];
  const take = (c: number) => { const i = pool.indexOf(c); if (i >= 0) pool.splice(i, 1); };
  g.hands.forEach((hand, s) => hand.forEach((c, i) => {
    const visible = s === seat || i >= 3 || g.openIdx[s] === i;
    if (visible && c !== null) take(c);
  }));
  return pool;
}

/** Hidden cards still to come for `s` from this seat's point of view. */
const hiddenCount = (g: HitStay, viewer: number, s: number) => (s === viewer ? 0 : g.hands[s].slice(0, 3).filter((_, i) => g.openIdx[s] !== i).length);
const knownSum = (g: HitStay, viewer: number, s: number) => g.hands[s].reduce<number>((sum, c, i) => sum + (s === viewer || i >= 3 || g.openIdx[s] === i ? (c ?? 0) : 0), 0);

/** How much a final total is worth when deciding to draw (over the limit is bad, -1s can still save it). */
const worth = (total: number, limit: number) => (total <= limit ? total : limit - 7 - (total - limit) * 1.5);

/** One more card, or stop? Simple expectation over the cards it cannot see. */
function wantsHit(total: number, limit: number, pool: number[], margin: number) {
  if (!pool.length) return false;
  const after = pool.reduce((sum, c) => sum + worth(total + c, limit), 0) / pool.length;
  return after > worth(total, limit) + margin;
}

/** Monte Carlo: chance this seat wins the showdown from here, with the others playing a plain policy. */
function winChance(g: HitStay, seat: number, sims: number, forceFirst?: 'hit' | 'stay'): number {
  const pool = unseen(g, seat);
  const live = ring(g.first).filter((s) => hsLive(g, s));
  let wins = 0;
  for (let n = 0; n < sims; n += 1) {
    const cards = shuffle(pool);
    const totals = new Map<number, number>();
    const counts = new Map<number, number>();
    for (const s of live) {
      let total = knownSum(g, seat, s);
      for (let k = hiddenCount(g, seat, s); k > 0; k -= 1) total += cards.pop() ?? 0;
      totals.set(s, total);
      counts.set(s, g.hands[s].length);
    }
    // The rest of the HIT/STAY step, if it is still to come.
    if (g.phase === 'bet1' || g.phase === 'hit') {
      const stayed = new Set(live.filter((s) => g.stayed[s]));
      let turnOrder = g.phase === 'hit' ? ring(g.turn) : ring(g.first);
      let forced = forceFirst;
      for (let guard = 0; guard < 40 && cards.length && stayed.size < live.length; guard += 1) {
        for (const s of turnOrder) {
          if (!live.includes(s) || stayed.has(s) || !cards.length) continue;
          const total = totals.get(s)!;
          const hit = s === seat && forced ? forced === 'hit' : wantsHit(total, g.limit, pool, s === seat ? 0.15 : 0.35);
          forced = undefined;
          if (hit) { totals.set(s, total + cards.pop()!); counts.set(s, counts.get(s)! + 1); } else stayed.add(s);
        }
        turnOrder = ring(g.first);
      }
    }
    const entries = live.map((s) => ({ seat: s, total: totals.get(s)!, count: counts.get(s)!, bust: totals.get(s)! > g.limit }));
    entries.sort((a, b) => better(a, b, g.limit));
    const top = entries.filter((e) => better(e, entries[0], g.limit) === 0);
    if (top.some((e) => e.seat === seat)) wins += 1 / top.length;
  }
  return wins / sims;
}

const SIMS = 360;
/** How much a bet near the cap is read as strength (0 = ignored, 1 = a cap bet means a sure win). */
const READ = 0.4;

/**
 * How each persona turns the same win estimate into a move. Every bet is chosen by expected utility of the
 * stack, u(c) = c^risk: below 1 makes losing chips hurt more than winning them helps, because a player at
 * 0 chips is out of the match (lower = more careful).
 * raise: weight on the win chance when weighing a raise · bluff: chance of a small raise without the hand
 * slow: chance a strong hand only calls · hitBias: added to the HIT side of the HIT/STAY comparison.
 */
const STYLE: Record<HsStyle, { risk: number; raise: number; bluff: number; slow: number; hitBias: number }> = {
  calc: { risk: 0.64, raise: 1, bluff: 0.03, slow: 0.1, hitBias: 0 },
  shark: { risk: 0.68, raise: 1.06, bluff: 0.1, slow: 0, hitBias: 0 },
  rock: { risk: 0.56, raise: 0.94, bluff: 0, slow: 0.05, hitBias: -0.03 },
  gambler: { risk: 0.7, raise: 1.03, bluff: 0.07, slow: 0, hitBias: 0.04 },
  fox: { risk: 0.64, raise: 1, bluff: 0.09, slow: 0.4, hitBias: 0 },
};

export function chooseHsAction(g: HitStay, seat: number, style: HsStyle): HsAction {
  const st = STYLE[style];
  const hand = g.hands[seat] as number[];

  if (g.phase === 'pick') {
    const sorted = hand.slice(0, 3).map((c, i) => ({ c, i })).sort((a, b) => a.c - b.c);
    // The trickster shows its highest card to look heavy (or its lowest to look light); the rest show a middling one.
    if (style === 'fox') return { kind: 'open', index: Math.random() < 0.5 ? sorted[2].i : sorted[0].i };
    if (style === 'shark') return { kind: 'open', index: sorted[2].i };
    return { kind: 'open', index: sorted[1].i };
  }

  if (g.phase === 'hit') {
    const hit = winChance(g, seat, SIMS, 'hit');
    const stay = winChance(g, seat, SIMS, 'stay');
    // The lean only tips a close call: it shrinks to nothing when the round is already lost (both ~0) or won
    // (STAY ~1), so a hopeless hand stays instead of drawing until the deck runs out.
    const lean = st.hitBias * 2 * Math.min(hit, stay, 1 - stay);
    return hit + lean > stay + 0.005 ? { kind: 'hit' } : { kind: 'stay' };
  }

  // Betting: expected utility of each move with the estimated chance to win the pot.
  // The estimate treats the others' hidden cards as random; a bet already raised high says otherwise,
  // so the chance is marked down by how far the bet has climbed toward the cap.
  const raw = winChance(g, seat, SIMS);
  const climbed = g.cap > g.ante ? (g.level - g.ante) / (g.cap - g.ante) : 0;
  const p = raw * (1 - READ * climbed);
  const stack = g.chips[seat]; // what is left after this round's bets so far
  const owe = g.level - g.bets[seat];
  const pot = hsPot(g);
  const u = (c: number) => Math.pow(Math.max(0, c), st.risk);
  const fold = { action: { kind: 'fold' } as HsAction, value: u(stack) };
  // Call: win the pot as it stands, or lose what I add.
  const call = { action: { kind: 'call' } as HsAction, value: p * u(stack + pot) + (1 - p) * u(stack - owe) };
  // Raise: assume one player calls the extra.
  const raises = [];
  for (let to = g.level + 1; to <= g.cap; to += 1) {
    const extra = to - g.level;
    // Whoever calls a big raise is likely strong: the bigger the raise, the worse my chance against the caller.
    const pr = Math.min(1, raw * st.raise * (1 - READ * ((to - g.ante) / Math.max(1, g.cap - g.ante))));
    raises.push({ action: { kind: 'raise', to } as HsAction, value: pr * u(stack + pot + extra) + (1 - pr) * u(stack - (to - g.bets[seat])) });
  }
  const best = raises.reduce<{ action: HsAction; value: number } | null>((a, b) => (!a || b.value > a.value ? b : a), null);

  if (best && best.value > call.value && !(Math.random() < st.slow)) return best.action;
  // A small bluff now and then keeps the table from reading every raise as strength.
  if (g.level < g.cap && Math.random() < st.bluff && call.value >= fold.value * 0.97) return { kind: 'raise', to: Math.min(g.cap, g.level + Math.max(1, g.ante)) };
  if (owe === 0 || call.value >= fold.value) return call.action;
  return fold.action;
}

// ---------------------------------------------------------------------------------------------
// Secrets: dealt cards stay private until the showdown (folded hands are never shown).

export function hsVisible(g: HitStay, viewer: number | null, seat: number, index: number): boolean {
  if (index >= 3 || g.openIdx[seat] === index || seat === viewer) return true;
  const shown = g.phase === 'showdown' || g.phase === 'finished';
  return shown && !g.folded[seat] && !g.showdown?.byFold && (g.showdown?.entries.some((e) => e.seat === seat) ?? false);
}

/** What guests receive: hidden cards blanked and the deck order gone. */
export function redactHitStay(g: HitStay): HitStay {
  return {
    ...g,
    hands: g.hands.map((hand, s) => hand.map((c, i) => (hsVisible(g, null, s, i) ? c : null))),
    deck: g.deck.map(() => 0),
  };
}

export const hitStaySecret = (g: HitStay, seat: number) => g.hands[seat].slice(0, 3);

export function withHitStaySecret(g: HitStay, secret: unknown, seat: number): HitStay {
  if (!Array.isArray(secret) || seat < 0 || seat >= HS_PLAYERS) return g;
  const mine = secret as (number | null)[];
  return { ...g, hands: g.hands.map((hand, s) => (s === seat ? hand.map((c, i) => (i < 3 ? mine[i] ?? c : c)) : hand)) };
}

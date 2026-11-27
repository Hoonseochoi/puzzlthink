// AI for 스나이퍼 홀덤. It plays from a redacted copy of the game (what that seat could see at the table: its own
// two cards, the face-up shared cards, everyone's bets, folds and snipes) — it never reads hidden cards.
//
// The model, by level:
//   easy   — bets on its raw hand strength; snipes the hand the board most suggests above its own.
//   normal — reads every opponent's bets into a weighted guess of their two cards; estimates its share of the pot
//            by Monte Carlo over those guesses with everyone sniping; picks the snipe that wins it the most.
//   hard   — as normal, plus: other players are modelled as reading *its* bets and snipes too, so it weighs how a
//            raise makes its hand easier to snipe, and it will snipe a lower hand (or pass) to hide what it holds.
// Survival matters more than chips: chips above the safety line are given away, and reaching it ends the match.
// Bet sizes follow the hand (since 11/27): a raise is priced by how many opponents it folds and how strong the
// callers are, a clearly strong hand prefers half the pot, the pot or all in, a re-raise is never +1, and a seat
// raises again in the same betting round only with a strong hand and a big size (so no 1-chip raise chains).
// scripts/sniper-holdem-betting.ts measures it.
// On top of the level, every seat has a personality (SH_TRAITS, 10 of them, nudged by a per-match mood) and reads
// each opponent's history from public information: hands shown down with what was bet on them, and snipes made.
import {
  type ShAction, type ShCat, type ShEvent, type ShTarget, type SniperHoldem, SH_SEATS,
  redactSniperHoldem, shCanAct, shEvaluate, shLiveSeats, shPot, shPossibleTargets, shTimeoutAction, withSniperHoldemSecret,
} from './sniperHoldem';

export type ShLevel = 'easy' | 'normal' | 'hard';
export const SH_LEVELS: readonly ShLevel[] = ['easy', 'normal', 'hard'];

/**
 * Personalities. Each AI match draws a random handful of these (more than fit at a table), so the same faces and
 * habits do not come back every game. The level (easy / normal / hard) sets how well a seat calculates; the
 * personality sets what it likes to do with that calculation, in both halves of the game: betting and sniping.
 * Traits (0–1 unless noted), all applied on top of the expected-value choice:
 *   tight   folds more marginal hands (−1 = plays loose)      station  calls where it should fold
 *   aggro   prefers raising to calling                       big      prefers big raise sizes / all-ins
 *   bully   pushes harder when it has the biggest stack       slow     a strong hand only calls
 *   bluff   raises without the hand                           bait     bets the scary board hand it does not hold
 *   eager   snipes even for a small gain (−1 = saves snipes)  bigPot   only bothers sniping in big pots
 *   obvious snipes the hand the board shouts                 self     snipes its own exposed hand for a draw
 *   feint   snipes below its own hand to hide it              adapt    how much it reads each opponent's history
 *   ooc     chance of an out-of-character move (so tells help but are never certain)
 */
export type ShStyle = 'ace' | 'viper' | 'owl' | 'jinx' | 'mono' | 'rex' | 'luna' | 'echo' | 'mint' | 'bolt';
export const SH_STYLES: readonly ShStyle[] = ['ace', 'viper', 'owl', 'jinx', 'mono', 'rex', 'luna', 'echo', 'mint', 'bolt'];
export const SH_PERSONA: Record<ShStyle, { name: string; nameEn: string; color: string }> = {
  ace: { name: '에이스', nameEn: 'ACE', color: '#ff7a59' },
  viper: { name: '바이퍼', nameEn: 'VIPER', color: '#4fd18b' },
  owl: { name: '아울', nameEn: 'OWL', color: '#9aa4b8' },
  jinx: { name: '징크스', nameEn: 'JINX', color: '#c08bff' },
  mono: { name: '모노', nameEn: 'MONO', color: '#5fb8ff' },
  rex: { name: '렉스', nameEn: 'REX', color: '#e8b730' },
  luna: { name: '루나', nameEn: 'LUNA', color: '#f05aa8' },
  echo: { name: '에코', nameEn: 'ECHO', color: '#21c2b5' },
  mint: { name: '민트', nameEn: 'MINT', color: '#a8f0b4' },
  bolt: { name: '볼트', nameEn: 'BOLT', color: '#ff5b45' },
};
/**
 * How much a personality may give up for its taste: a bet within BET_SLACK (relative) of the best one's survival
 * value, a snipe within SNIPE_SLACK of the best one's share of the pot. Small enough that no style is measurably
 * weaker (see the arena numbers in the guide), large enough that styles look different.
 */
const BET_SLACK = 0.02;
const SNIPE_SLACK = 0.025;
export type ShTraits = {
  tight: number; station: number; aggro: number; big: number; bully: number; slow: number; bluff: number; bait: number;
  eager: number; bigPot: number; obvious: number; self: number; feint: number; adapt: number; ooc: number;
};
const T = (t: Partial<ShTraits>): ShTraits => ({
  tight: 0, station: 0, aggro: 0, big: 0, bully: 0, slow: 0.05, bluff: 0.05, bait: 0,
  eager: 0, bigPot: 0, obvious: 0, self: 0, feint: 0, adapt: 0.5, ooc: 0.06, ...t,
});
export const SH_TRAITS: Record<ShStyle, ShTraits> = {
  // 계산형: plays the numbers, snipes by value, reads the table.
  ace: T({ adapt: 0.8, ooc: 0.04 }),
  // 독사: slow-plays strong hands and keeps its snipe for the big pots.
  viper: T({ slow: 0.45, bigPot: 0.9, eager: -0.4, adapt: 0.6, feint: 0.2 }),
  // 바위: tight, rarely snipes, folds the marginal stuff.
  owl: T({ tight: 0.8, eager: -0.8, bluff: 0.01, aggro: -0.3, adapt: 0.4 }),
  // 사기꾼: bluff-raises, bets the hand the board suggests, feints and self-snipes to cover it.
  jinx: T({ bluff: 0.3, bait: 0.6, feint: 0.5, self: 0.6, aggro: 0.4, ooc: 0.1 }),
  // 콜링 스테이션: calls almost anything, snipes the obvious board hand.
  mono: T({ station: 0.9, tight: -0.5, aggro: -0.5, obvious: 0.8, eager: 0.3, adapt: 0.2 }),
  // 불도저: bullies with the big stack, big sizes.
  rex: T({ bully: 1, aggro: 0.5, big: 0.6, bluff: 0.12, eager: 0.2 }),
  // 난사꾼: loose, snipes every time it can.
  luna: T({ tight: -0.6, eager: 1, obvious: 0.3, bluff: 0.1, aggro: 0.2, ooc: 0.1 }),
  // 거울: adapts hardest to what each opponent has shown; quiet otherwise.
  echo: T({ adapt: 1, feint: 0.3, self: 0.3, ooc: 0.05 }),
  // 겁쟁이: tight-passive bettor, but a sharp sniper of the board's hand.
  mint: T({ tight: 0.5, aggro: -0.6, obvious: 0.6, eager: 0.5, slow: 0.2, adapt: 0.4 }),
  // 올인러: all-in or nothing.
  bolt: T({ aggro: 0.7, big: 1, tight: 0.2, bluff: 0.15, eager: -0.2, ooc: 0.08 }),
};

/** No personality at all: the plain best-value player the personalities are measured against (arena only). */
export const SH_PLAIN: ShTraits = T({ slow: 0, bluff: 0, adapt: 0.5, ooc: 0 });

/** A per-match mood in [-1, 1] for a seat, from the match id: the same seat plays a little differently each match. */
export function shMood(gid: string, seat: number): number {
  let h = 2166136261;
  for (const ch of `${gid}:${seat}`) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 2001) / 1000 - 1;
}
/** The traits a seat plays with this match: the personality, nudged by its mood (bolder or more careful). */
export function shTraitsFor(style: ShStyle, gid: string, seat: number): ShTraits {
  const base = SH_TRAITS[style] ?? SH_PLAIN;
  const m = shMood(gid, seat);
  const k = 1 + 0.3 * m;
  return { ...base, aggro: base.aggro + 0.25 * m, bluff: Math.max(0, base.bluff * k), tight: base.tight - 0.25 * m, eager: base.eager + 0.2 * m, bait: base.bait * k };
}

/**
 * What a seat has learned about each opponent from earlier rounds (public: cards shown down, what they put in,
 * what they sniped). bluffy: how often a big bet came with a weak hand · feints: how often their snipe was below
 * their own hand · n: showdowns seen.
 */
type Profile = { bluffy: number; feints: number; n: number };
function profiles(g: SniperHoldem): Map<number, Profile> {
  const out = new Map<number, Profile>();
  for (let s = 0; s < SH_SEATS; s += 1) {
    let big = 0, weakBig = 0, snipes = 0, low = 0, n = 0;
    for (const r of g.rounds) {
      const hand = r.hand[s];
      if (!hand || !r.hands[s]) continue;
      n += 1;
      const ante = r.ante ?? 1;
      if (r.bets && r.bets[s] >= ante + 3) { big += 1; if (hand.cat <= 1 && !r.winners.includes(s)) weakBig += 1; }
      const t = r.snipes[s];
      if (t && t !== 'pass') { snipes += 1; if (label(t.cat, t.n) < label(hand.cat, hand.key[0])) low += 1; }
    }
    // Priors: one bluff in four big bets, one feint in five snipes.
    out.set(s, { bluffy: (weakBig + 0.5) / (big + 2), feints: (low + 0.4) / (snipes + 2), n });
  }
  return out;
}
type Tuning = { read: number; sims: number; snipeSims: number; meta: boolean; noise: number; perceive?: boolean };
/** Level settings (exported so the arena script can try variants). */
export const SH_TUNING: Record<string, Tuning> = {
  easy: { read: 0, sims: 0, snipeSims: 0, meta: false, noise: 0.12 },
  normal: { read: 0.7, sims: 140, snipeSims: 180, meta: false, noise: 0.03 },
  hard: { read: 1.4, sims: 220, snipeSims: 300, meta: true, noise: 0, perceive: true },
};
const LEVEL = SH_TUNING as Record<ShLevel, Tuning>;

// ── Hands as small numbers ─────────────────────────────────────────────────────────────────────────────────────
/** A snipe label: hand type and top number in one integer; a higher label is a better hand type/top. */
const label = (cat: number, n: number) => cat * 16 + n;
const labelTarget = (l: number): ShTarget => ({ cat: Math.floor(l / 16) as ShCat, n: l % 16 });
const NLABEL = 7 * 16;
/** Full comparison score of a hand (type, then its numbers). */
function scoreOf(cards: number[]): { l: number; s: number } {
  const h = shEvaluate(cards);
  return { l: label(h.cat, h.key[0]), s: h.cat * 10000 + h.key[0] * 100 + (h.key[1] ?? 0) };
}

/** Every unordered pair of private cards. */
const PAIRS: [number, number][] = [];
for (let a = 1; a <= 10; a += 1) for (let b = a; b <= 10; b += 1) PAIRS.push([a, b]);

function countsWithout(cards: readonly number[]) {
  const left = Array(11).fill(4);
  for (const c of cards) left[c] -= 1;
  return left;
}
const combos = (left: number[], [a, b]: [number, number]) => (a === b ? (left[a] * (left[a] - 1)) / 2 : left[a] * left[b]);

// ── What happened this round ───────────────────────────────────────────────────────────────────────────────────
type Move = { seat: number; kind: 'call' | 'raise'; to: number; level: number; pot: number; street: 1 | 2; open: boolean };
/** Bets this round, oldest first, with the level and pot before each. */
function roundMoves(g: SniperHoldem): Move[] {
  const events: ShEvent[] = [];
  for (const e of g.log) { if (e.k === 'round') break; events.push(e); }
  events.reverse();
  const moves: Move[] = [];
  let street: 1 | 2 = 1;
  let level = g.ante;
  let pot = g.ante * (shLiveSeats(g).length + g.folded.filter((f, s) => f && !g.safe[s] && !g.out[s]).length);
  const put = Array(SH_SEATS).fill(g.ante);
  for (const e of events) {
    if (e.k === 'board') { street = 2; continue; }
    if (e.k === 'call' || e.k === 'raise') {
      moves.push({ seat: e.seat, kind: e.k, to: e.to, level, pot, street, open: e.k === 'raise' && e.open });
      pot += e.to - put[e.seat];
      put[e.seat] = e.to;
      level = e.to;
    }
  }
  return moves;
}

/** How likely a holding of strength x (0–1) is to make this move. */
function moveLikelihood(m: Move, x: number): number {
  if (m.kind === 'call') return 0.3 + 0.7 * x;
  const extra = m.to - m.level;
  // Opening for the minimum is close to forced (there is no checking).
  if (m.open && extra === 1) return 0.55 + 0.45 * x;
  const size = Math.min(2, extra / Math.max(2, m.pot));
  return 0.06 + Math.pow(x, 1.2 + size);
}

/**
 * Strength of every holding on a board: the chance it beats one random holding (ties half). With two shared cards,
 * averaged over a few random turns.
 */
function strengths(board: number[], left: number[]): number[] {
  const runs = board.length >= 4 ? [[] as number[]] : sampleRunouts(left, 4 - board.length, 10);
  const total = PAIRS.map(() => 0);
  for (const extra of runs) {
    const b = [...board, ...extra];
    const l2 = countsWithout(b);
    const score = PAIRS.map((p) => scoreOf([...b, ...p]).s);
    const w = PAIRS.map((p) => Math.max(0, combos(l2, p)));
    const sumW = w.reduce((a, x) => a + x, 0) || 1;
    // Rank holdings by score; strength = share of weight below + half the weight tied.
    const order = PAIRS.map((_, i) => i).sort((i, j) => score[i] - score[j]);
    let below = 0;
    for (let k = 0; k < order.length;) {
      let j = k; let tied = 0;
      while (j < order.length && score[order[j]] === score[order[k]]) { tied += w[order[j]]; j += 1; }
      for (let q = k; q < j; q += 1) total[order[q]] += (below + tied / 2) / sumW;
      below += tied; k = j;
    }
  }
  return total.map((x) => x / runs.length);
}

function sampleRunouts(left: number[], n: number, count: number): number[][] {
  const pool: number[] = [];
  for (let c = 1; c <= 10; c += 1) for (let k = 0; k < left[c]; k += 1) pool.push(c);
  const out: number[][] = [];
  for (let r = 0; r < count; r += 1) {
    const pick: number[] = [];
    const used = new Set<number>();
    while (pick.length < n && used.size < pool.length) {
      const i = Math.floor(Math.random() * pool.length);
      if (!used.has(i)) { used.add(i); pick.push(pool[i]); }
    }
    out.push(pick);
  }
  return out;
}

/**
 * Weights over a player's possible holdings, from their bets this round (and, at `read` = 0, from nothing).
 * `left`: cards the viewer has not seen. A snipe already said suggests a hand just below it (hard only).
 */
function posterior(g: SniperHoldem, seat: number, left: number[], read: number, moves: Move[], str: { s1: number[]; s2: number[] }, meta: boolean, feintDiscount = 0.35): number[] {
  const w = PAIRS.map((p) => Math.max(0, combos(left, p)));
  if (read > 0) {
    for (const m of moves) {
      if (m.seat !== seat) continue;
      const x = m.street === 1 ? str.s1 : str.s2;
      for (let i = 0; i < w.length; i += 1) if (w[i]) w[i] *= Math.pow(moveLikelihood(m, x[i]), read);
    }
  }
  const said = g.snipes[seat];
  if (meta && said && said !== 'pass' && g.shown === 4) {
    const t = label(said.cat, said.n);
    const board = g.board.slice(0, 4) as number[];
    for (let i = 0; i < w.length; i += 1) if (w[i] && scoreOf([...board, ...PAIRS[i]]).l >= t) w[i] *= feintDiscount;
  }
  return w;
}

/** Public guess at each label for a player: their holding weights pushed through the board. */
function labelDist(w: number[], labelsByPair: number[]): Float64Array {
  const d = new Float64Array(NLABEL);
  let sum = 0;
  for (let i = 0; i < w.length; i += 1) { d[labelsByPair[i]] += w[i]; sum += w[i]; }
  if (sum > 0) for (let l = 0; l < NLABEL; l += 1) d[l] /= sum;
  return d;
}

/** What a plain sniper does: the label most likely held by the others, among those above its own hand. */
function naiveSnipe(threat: Float64Array, own: number, taken: Set<number>, threshold = 0.1): number | null {
  let best = -1; let bestV = threshold;
  for (let l = own + 1; l < NLABEL; l += 1) if (!taken.has(l) && threat[l] > bestV) { bestV = threat[l]; best = l; }
  return best >= 0 ? best : null;
}

function pickWeighted(w: number[], left: number[]): number {
  let sum = 0;
  const ok = w.map((x, i) => { const v = combos(left, PAIRS[i]) > 0 ? x : 0; sum += v; return v; });
  if (sum <= 0) {
    const any = PAIRS.findIndex((p) => combos(left, p) > 0);
    return any < 0 ? 0 : any;
  }
  let r = Math.random() * sum;
  for (let i = 0; i < ok.length; i += 1) { r -= ok[i]; if (r <= 0) return i; }
  return ok.length - 1;
}

type View = {
  g: SniperHoldem; me: number; mine: number[]; board: number[]; live: number[]; others: number[];
  moves: Move[]; leftMine: number[]; leftPublic: number[]; lv: Tuning; str: { s1: number[]; s2: number[] };
  post: Map<number, number[]>; pub: Map<number, number[]>; // my guess at each opponent; the table's guess at everyone
  traits: ShTraits; prof: Map<number, Profile>;
};

function makeView(full: SniperHoldem, me: number, level: ShLevel, traits: ShTraits = SH_TRAITS.ace): View {
  // Only what this seat could see.
  const g = withSniperHoldemSecret(redactSniperHoldem(full), full.hands[me], me);
  const mine = g.hands[me] as number[];
  const board = g.board.slice(0, g.shown) as number[];
  const live = shLiveSeats(g);
  const lv = LEVEL[level] ?? LEVEL.normal;
  const moves = roundMoves(g);
  const leftPublic = countsWithout(board);
  const leftMine = countsWithout([...board, ...mine]);
  const b2 = board.slice(0, 2);
  const str = { s1: lv.read > 0 ? strengths(b2, countsWithout(b2)) : [], s2: lv.read > 0 && board.length === 4 ? strengths(board, leftPublic) : [] };
  if (lv.read <= 0) str.s1 = [];
  const post = new Map<number, number[]>();
  const pub = new Map<number, number[]>();
  // Mind games: what each opponent has shown before. A player whose big bets came with weak hands is read less
  // literally; one who snipes below their own hand is not assumed to hold something under their snipe.
  const prof = profiles(g);
  for (const s of live) {
    if (s !== me) {
      const pr = prof.get(s)!;
      const k = Math.min(1, pr.n / 4) * traits.adapt;
      const read = lv.read * Math.max(0.25, Math.min(1.6, 1 + 2.4 * k * (0.25 - pr.bluffy)));
      const feint = 0.35 + 0.65 * Math.min(1, k * Math.max(0, pr.feints - 0.2) * 2.5);
      post.set(s, posterior(g, s, leftMine, read, moves, str, lv.meta, feint));
    }
    // The table reads everyone (me included) from public information only.
    pub.set(s, posterior(g, s, leftPublic, lv.meta ? 1 : lv.read, moves, str, lv.meta));
  }
  return { g, me, mine, board, live, others: live.filter((s) => s !== me), moves, leftMine, leftPublic, lv, post, pub, str, traits, prof };
}

/** One imagined deal: everyone's private cards and the full board. */
type Deal = { hands: Map<number, number[]>; board: number[] };
function sampleDeal(v: View, post: Map<number, number[]>): Deal {
  const left = v.leftMine.slice();
  const hands = new Map<number, number[]>([[v.me, v.mine]]);
  for (const s of v.others) {
    const i = pickWeighted(post.get(s)!, left);
    const [a, b] = PAIRS[i];
    left[a] -= 1; left[b] -= 1;
    hands.set(s, [a, b]);
  }
  const board = [...v.board];
  if (board.length < 4) {
    const pool: number[] = [];
    for (let c = 1; c <= 10; c += 1) for (let k = 0; k < left[c]; k += 1) pool.push(c);
    while (board.length < 4 && pool.length) board.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return { hands, board };
}

/** My share of the pot in one imagined deal, after a snipe round. `mySnipe` undefined = I snipe like the others. */
function shareInDeal(v: View, deal: Deal, pubW: Map<number, number[]>, mySnipe?: number | null): number {
  const labelsByPair = PAIRS.map((p) => scoreOf([...deal.board, ...p]).l);
  const dist = new Map<number, Float64Array>();
  for (const s of v.live) dist.set(s, labelDist(pubW.get(s)!, labelsByPair));
  const sc = new Map<number, { l: number; s: number; p: number }>();
  for (const s of v.live) {
    const h = deal.hands.get(s)!;
    const x = scoreOf([...deal.board, ...h]);
    const hi = Math.max(h[0], h[1]); const lo = Math.min(h[0], h[1]);
    sc.set(s, { ...x, p: hi * 11 + lo });
  }
  // Snipes already said stay; the rest are imagined in turn.
  const taken = new Set<number>();
  for (const s of v.live) { const t = v.g.snipes[s]; if (t && t !== 'pass') taken.add(label(t.cat, t.n)); }
  for (const s of v.live) {
    if (v.g.snipes[s] !== null) continue;
    let pick: number | null;
    if (s === v.me && mySnipe !== undefined) pick = mySnipe;
    else {
      const threat = new Float64Array(NLABEL);
      for (const r of v.live) if (r !== s) { const d = dist.get(r)!; for (let l = 0; l < NLABEL; l += 1) threat[l] += d[l]; }
      pick = naiveSnipe(threat, sc.get(s)!.l, taken);
    }
    if (pick !== null) taken.add(pick);
  }
  return shareOf(v.me, v.live, sc, taken);
}

function shareOf(me: number, live: number[], sc: Map<number, { l: number; s: number; p: number }>, taken: Set<number>): number {
  let best: { s: number; p: number } | null = null;
  for (const s of live) {
    const x = sc.get(s)!;
    if (taken.has(x.l)) continue;
    if (!best || x.s > best.s || (x.s === best.s && x.p > best.p)) best = x;
  }
  if (!best) return 1 / live.length; // everyone sniped: a draw
  const winners = live.filter((s) => { const x = sc.get(s)!; return !taken.has(x.l) && x.s === best!.s && x.p === best!.p; });
  return winners.includes(me) ? 1 / winners.length : 0;
}

/** Expected share of the pot from here (Monte Carlo over my guesses at the others' cards). */
function equity(v: View, pubW: Map<number, number[]>, sims: number): number {
  let sum = 0;
  for (let k = 0; k < sims; k += 1) sum += shareInDeal(v, sampleDeal(v, v.post), pubW);
  return sum / sims;
}

/** Raw strength without snipes or reads: share against random holdings. */
function rawEquity(v: View, sims: number): number {
  let sum = 0;
  const flat = new Map<number, number[]>();
  for (const s of v.others) flat.set(s, PAIRS.map((p) => Math.max(0, combos(v.leftMine, p))));
  const vv = { ...v, post: flat };
  for (let k = 0; k < sims; k += 1) {
    const deal = sampleDeal(vv, flat);
    const sc = new Map<number, { l: number; s: number; p: number }>();
    for (const s of v.live) { const h = deal.hands.get(s)!; sc.set(s, { ...scoreOf([...deal.board, ...h]), p: Math.max(...h) * 11 + Math.min(...h) }); }
    sum += shareOf(v.me, v.live, sc, new Set());
  }
  return sum / sims;
}

// ── Snipe ──────────────────────────────────────────────────────────────────────────────────────────────────────
function chooseSnipe(v: View, level: ShLevel): ShAction {
  const tr = v.traits;
  const options = shPossibleTargets(v.board, v.mine).map((t) => label(t.cat, t.n));
  const own = scoreOf([...v.board, ...v.mine]).l;
  const said = new Set<number>();
  for (const s of v.live) { const t = v.g.snipes[s]; if (t && t !== 'pass') said.add(label(t.cat, t.n)); }
  const pot = shPot(v.g);
  const ooc = Math.random() < tr.ooc;
  const snipe = (l: number | null | undefined): ShAction => (l === null || l === undefined ? { kind: 'pass' } : { kind: 'snipe', target: labelTarget(l) });
  // The hand the board shouts: the likeliest label above mine on the public picture (what a plain sniper calls).
  const obviousPick = () => {
    const labelsByPair = PAIRS.map((p) => scoreOf([...v.board, ...p]).l);
    const threat = new Float64Array(NLABEL);
    const d = labelDist(PAIRS.map((p) => Math.max(0, combos(v.leftMine, p))), labelsByPair);
    for (let l = 0; l < NLABEL; l += 1) threat[l] = d[l] * v.others.length;
    return naiveSnipe(threat, own, said, 0.08);
  };
  // "Saves snipes for big pots": a small pot is not worth giving information away.
  const smallPot = pot < 4 * Math.max(1, v.g.ante) * v.live.length;

  if (level === 'easy' || v.lv.snipeSims === 0) {
    if (tr.eager < -0.5 && Math.random() < 0.5) return snipe(null);
    if (tr.bigPot > 0.5 && smallPot && Math.random() < tr.bigPot) return snipe(null);
    const pick = Math.random() < v.lv.noise || ooc ? options[Math.floor(Math.random() * options.length)] : obviousPick();
    return snipe(pick);
  }

  // Try every snipe (and passing) against the same imagined deals.
  const candidates: (number | null)[] = [null, ...options.filter((l) => !said.has(l))];
  const deals = Array.from({ length: v.lv.snipeSims }, () => sampleDeal(v, v.post));
  const value = candidates.map(() => 0);
  candidates.forEach((c, i) => {
    // Hard: the others read my snipe — a hand at or above it is less likely mine.
    let pubW = v.pub;
    if (v.lv.meta && c !== null) {
      const mine = v.pub.get(v.me)!.slice();
      for (let k = 0; k < mine.length; k += 1) if (mine[k] && scoreOf([...v.board, ...PAIRS[k]]).l >= c) mine[k] *= 0.35;
      pubW = new Map(v.pub); pubW.set(v.me, mine);
    }
    for (const deal of deals) value[i] += shareInDeal(v, deal, pubW, c);
  });
  for (let i = 0; i < value.length; i += 1) value[i] /= deals.length;
  let best = 0;
  for (let i = 1; i < candidates.length; i += 1) if (value[i] > value[best] + 1e-9) best = i;

  // Personality chooses among snipes worth (almost) as much as the best: cover its own exposed hand, feint below
  // it, call the board's obvious hand, fire freely or keep the snipe (more so in small pots).
  const nearSet = candidates.map((c, i) => ({ c, i })).filter((x) => value[x.i] >= value[best] - SNIPE_SLACK);
  if (ooc) return snipe(nearSet[Math.floor(Math.random() * nearSet.length)].c);
  const obvious = obviousPick();
  const taste = (c: number | null) => {
    if (c === null) return -tr.eager + (smallPot ? tr.bigPot : 0);
    let t = 0.3 * tr.eager;
    if (c === own) t += 1.5 * tr.self;
    if (c < own) t += 1.2 * tr.feint;
    if (c === obvious) t += 1.2 * tr.obvious;
    return t;
  };
  const chosen = nearSet.map((x) => ({ ...x, t: taste(x.c) + (Math.random() - 0.5) * 0.3 })).sort((a, b) => b.t - a.t)[0];
  return snipe(chosen ? chosen.c : candidates[best]);
  return snipe(candidates[best]);
}

/**
 * Chance `me` is the one eliminated, from the stacks of everyone still in: players leave (reach safety) one at a
 * time with odds in proportion to their chips, and the last one left is out. A stack at the line is already safe.
 */
function pLast(stacks: Map<number, number>, me: number, target: number): number {
  if ((stacks.get(me) ?? 0) >= target) return 0;
  const seats = [...stacks.keys()].filter((s) => s === me || stacks.get(s)! < target);
  if (seats.length <= 1) return seats[0] === me ? 1 : 0;
  const memo = new Map<number, number>();
  const all = (1 << seats.length) - 1;
  const mi = seats.indexOf(me);
  const go = (mask: number): number => {
    if (mask === 1 << mi) return 1;
    const hit = memo.get(mask);
    if (hit !== undefined) return hit;
    let sum = 0;
    for (let i = 0; i < seats.length; i += 1) if (mask & (1 << i)) sum += Math.max(0, stacks.get(seats[i])!);
    let p = 0;
    for (let i = 0; i < seats.length; i += 1) {
      if (!(mask & (1 << i)) || i === mi) continue;
      const w = sum > 0 ? Math.max(0, stacks.get(seats[i])!) / sum : 1 / (seats.length - 1);
      if (w > 0) p += w * go(mask & ~(1 << i));
    }
    memo.set(mask, p);
    return p;
  };
  return go(all);
}

/** Fold-equity discount: AI and people at this table call more than a plain read suggests. */
let FOLD_SCALE = 0.6;
export const setShFoldScale = (x: number) => { FOLD_SCALE = x; };

/** How likely opponent `s` folds to a raise that needs `need` strength, by my guess at their cards. */
function foldChance(v: View, s: number, need: number, level: ShLevel): number {
  const x = v.g.shown === 4 ? v.str.s2 : v.str.s1;
  if (level === 'easy' || !x.length) return Math.min(0.7, Math.max(0.05, need));
  const w = v.post.get(s)!;
  let weak = 0; let sum = 0;
  for (let i = 0; i < w.length; i += 1) { sum += w[i]; if (x[i] < need) weak += w[i]; }
  return sum > 0 ? Math.min(0.9, weak / sum) : 0.3;
}

// ── Bets ───────────────────────────────────────────────────────────────────────────────────────────────────────
function chooseBet(v: View, level: ShLevel): ShAction {
  const g = v.g;
  const tr = v.traits;
  const ooc = Math.random() < tr.ooc;
  const me = v.me;
  const canCall = shCanAct(g, me, { kind: 'call' });
  const canRaise = g.level < g.cap;
  if (!canCall && !canRaise) return { kind: 'fold' };
  const pot = shPot(g);
  const owe = g.level - g.bets[me];
  const stack = g.chips[me];
  const opp = v.others.length;

  let p: number;
  let pRaise: number;
  if (level === 'easy' || v.lv.sims === 0) {
    const raw = rawEquity(v, 90);
    const climbed = g.cap > g.ante ? (g.level - g.ante) / (g.cap - g.ante) : 0;
    p = raw * (1 - 0.45 * climbed);
    pRaise = p;
  } else {
    p = equity(v, v.pub, v.lv.sims);
    if (v.lv.perceive) {
      // If I raise, the table thinks my hand is stronger: strong labels of mine become likelier snipe targets.
      const str = strengths(v.board, v.leftPublic);
      const mine = v.pub.get(me)!.map((w, i) => w * moveLikelihood({ seat: me, kind: 'raise', to: g.level + Math.max(2, Math.ceil(pot / 2)), level: g.level, pot, street: g.shown === 4 ? 2 : 1, open: false }, str[i]));
      const pubW = new Map(v.pub); pubW.set(me, mine);
      pRaise = equity(v, pubW, Math.round(v.lv.sims * 0.6));
    } else pRaise = p;
  }
  p = Math.min(1, Math.max(0, p + (Math.random() - 0.5) * v.lv.noise));

  // Utility = chance of not being the one eliminated, from everyone's stacks (chips above the line are given away).
  const others = v.others;
  const activeOthers = Array.from({ length: SH_SEATS }, (_, s) => s).filter((s) => s !== me && !g.safe[s] && !g.out[s]);
  const u = (mine: number, lost: number) => {
    const stacks = new Map<number, number>([[me, mine]]);
    for (const s of activeOthers) stacks.set(s, g.chips[s]);
    // What I lose goes to the opponents still in the hand, evenly.
    if (lost > 0 && others.length) for (const s of others) stacks.set(s, stacks.get(s)! + lost / others.length);
    return 1 - pLast(stacks, me, g.target);
  };
  const options: { action: ShAction; value: number }[] = [{ action: { kind: 'fold' }, value: u(stack, pot) }];
  if (canCall) options.push({ action: { kind: 'call' }, value: p * u(stack + pot, 0) + (1 - p) * u(stack - owe, pot + owe) });

  // How strong my hand is against each opponent (p is my share against all of them; q is the chance I beat one,
  // so 0.5 = average at any table size), and how many times this betting round I and the table have raised
  // already: an AI that has been re-raised calls, folds or makes one decisive raise, it does not answer every
  // raise with another +1.
  const q = Math.min(0.99, Math.pow(Math.max(1e-3, p), 1 / Math.max(1, opp)));
  const street = g.shown === 4 ? 2 : 1;
  const myRaises = v.moves.filter((m) => m.seat === me && m.kind === 'raise' && m.street === street).length;
  const tableRaises = v.moves.filter((m) => m.kind === 'raise' && m.street === street).length;
  const open = g.level === g.base;
  // Personality moves the bar for "my hand is clearly strong": tight seats want more, loose and aggressive less.
  const strongBar = 0.75 + 0.06 * tr.tight - 0.05 * tr.aggro;
  const nutsBar = Math.max(strongBar + 0.08, 0.88 + 0.04 * tr.tight - 0.05 * tr.big);
  const raiseAllowed = (to: number) => {
    if (myRaises === 0 && tableRaises < 3) return true;
    // Raising again (or into a third raise): only with a clearly strong hand, and only big.
    const big = to === g.cap || to - g.level >= Math.max(3, pot);
    if (myRaises >= 2 || tableRaises >= 4) return to === g.cap && q >= nutsBar;
    return big && q >= strongBar;
  };
  if (canRaise) {
    // Sizes: an opening bet may be the minimum (there is no checking); a re-raise is at least half the pot.
    const half = Math.max(2, Math.ceil(pot / 2));
    const sizes = new Set<number>([...(open ? [g.level + 1] : []), g.level + half, g.level + Math.max(3, pot), g.level + Math.max(4, 2 * pot), g.cap]);
    for (const raw of sizes) {
      const to = Math.min(g.cap, raw);
      if (to <= g.level || !raiseAllowed(to)) continue;
      const pay = to - g.bets[me];
      const extra = to - g.level;
      // Each opponent folds the part of my guess at their cards too weak for the price; an opponent calls when their
      // own share beats it. Shares bunch near 1/players because strong hands get sniped, so only clearly weak
      // holdings fold. Whoever calls is stronger than my reads say, but fewer of them are left to beat.
      const price = extra / (pot + 2 * extra);
      const need = Math.min(0.95, Math.max(0, 0.5 + (price - 1 / (others.length + 1)) / 0.6));
      const folds = others.map((s) => Math.min(0.95, FOLD_SCALE * foldChance(v, s, need, level)));
      const fe = folds.reduce((acc, f) => acc * f, 1);
      const callers = Math.max(1, folds.reduce((acc, f) => acc + (1 - f), 0) / Math.max(0.05, 1 - fe));
      const bar = 0.6 * need;
      const qc = Math.min(1, Math.max(0.02, (q * (pRaise / Math.max(1e-3, p)) - bar) / (1 - bar)));
      const pc = Math.pow(qc, callers);
      const value = fe * u(stack + pot, 0) + (1 - fe) * (pc * u(stack + pot + extra * callers, 0) + (1 - pc) * u(stack - pay, pot + pay));
      options.push({ action: { kind: 'raise', to }, value });
    }
  }
  // Personality chooses only among moves worth (almost) as much as the best one, so every style plays well and
  // differs in how: raise or call, big or small, fold the close ones or hang on. A strong hand's slow-play, a bluff
  // or a bait (betting the scary board hand it does not hold) happens only where it is close to free.
  options.sort((a, b) => b.value - a.value);
  const bestValue = options[0].value;
  // A seat that likes big sizes gives up a little more for one when its hand is clearly strong (the all-in lover
  // shoves it), so the size habit shows; everything else stays within BET_SLACK.
  const slackOf = (o: { action: ShAction }) => BET_SLACK * (o.action.kind === 'raise' && q >= strongBar ? 1 + 2 * Math.max(0, tr.big) : 1);
  const near = options.filter((o) => o.value >= bestValue - slackOf(o) * (bestValue + 0.05));
  const otherStacks = activeOthers.map((s) => g.chips[s]);
  const bullying = otherStacks.length > 0 && stack >= Math.max(...otherStacks) && stack >= 1.4 * Math.min(...otherStacks) ? tr.bully : 0;
  const boardScary = v.board.length >= 2 && (() => { const b = shEvaluate(v.board); const mine = shEvaluate([...v.board, ...v.mine]); return b.cat >= 1 && mine.cat <= b.cat; })();
  const strong = q >= strongBar;
  // Conviction: the stronger the hand, the more a raise should be sized like it (a clear hand bets big, sometimes
  // all in); a bluff, when it comes, is sized like a real bet rather than a 1-chip poke.
  const conviction = Math.max(0, Math.min(2, (q - 0.5) / Math.max(0.1, strongBar - 0.5)));
  const taste = (a: ShAction) => {
    if (a.kind === 'fold') return 0.6 * tr.tight - 0.8 * tr.station;
    if (a.kind === 'call') return 0.8 * tr.station - 0.5 * tr.aggro + (strong ? tr.slow * 2 : 0) + (myRaises > 0 ? 0.4 : 0);
    if (a.kind !== 'raise') return 0;
    const size = (a.to - g.level) / Math.max(1, g.cap - g.level);
    const potSize = Math.min(2, (a.to - g.level) / Math.max(1, pot));
    return tr.aggro + bullying + tr.big * (2 * size - 1) + (!strong ? tr.bluff * (1.5 + potSize) : 0) + (boardScary && !strong ? tr.bait * 1.5 : 0)
      - (strong ? tr.slow * 2 : 0) + conviction * (0.6 * potSize + 0.5 * size) * (1 - tr.slow);
  };
  let pick: ShAction;
  if (ooc) pick = near[Math.floor(Math.random() * near.length)].action;
  else pick = near.map((o) => ({ ...o, t: taste(o.action) + (Math.random() - 0.5) * 0.4 })).sort((a, b) => b.t - a.t)[0].action;
  // Never fold when nothing more is owed... except there is always something owed to open (no checking).
  if (pick.kind === 'fold' && !canCall && canRaise && p > 1 / (opp + 1) * 0.8) pick = { kind: 'raise', to: g.level + 1 };
  return shCanAct(g, me, pick) ? pick : shTimeoutAction(g, me);
}

/** The AI's move for `seat` at `level` with persona `style`. */
export function chooseShAction(g: SniperHoldem, seat: number, level: ShLevel = 'normal', style: ShStyle = 'ace'): ShAction {
  if (g.turn !== seat) return shTimeoutAction(g, seat);
  const v = makeView(g, seat, level, shTraitsFor(style, g.gid, seat));
  if (g.phase === 'snipe') return chooseSnipe(v, level);
  return chooseBet(v, level);
}

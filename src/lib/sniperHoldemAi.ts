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
import {
  type ShAction, type ShCat, type ShEvent, type ShTarget, type SniperHoldem, SH_SEATS,
  redactSniperHoldem, shCanAct, shEvaluate, shLiveSeats, shPot, shPossibleTargets, shTimeoutAction, withSniperHoldemSecret,
} from './sniperHoldem';

export type ShLevel = 'easy' | 'normal' | 'hard';
export const SH_LEVELS: readonly ShLevel[] = ['easy', 'normal', 'hard'];

/** Personas: names and colors for the table, and a betting temperament (never shown to players). */
export type ShStyle = 'ace' | 'viper' | 'owl' | 'jinx' | 'mono';
export const SH_STYLES: readonly ShStyle[] = ['ace', 'viper', 'owl', 'jinx', 'mono'];
export const SH_PERSONA: Record<ShStyle, { name: string; nameEn: string; color: string }> = {
  ace: { name: '에이스', nameEn: 'ACE', color: '#ff7a59' },
  viper: { name: '바이퍼', nameEn: 'VIPER', color: '#4fd18b' },
  owl: { name: '아울', nameEn: 'OWL', color: '#9aa4b8' },
  jinx: { name: '징크스', nameEn: 'JINX', color: '#c08bff' },
  mono: { name: '모노', nameEn: 'MONO', color: '#5fb8ff' },
};
/** bluff: chance of a raise without the hand · slow: chance a strong hand only calls. */
const STYLE: Record<ShStyle, { bluff: number; slow: number }> = {
  ace: { bluff: 0.08, slow: 0.05 },
  viper: { bluff: 0.12, slow: 0.15 },
  owl: { bluff: 0.02, slow: 0.05 },
  jinx: { bluff: 0.16, slow: 0.1 },
  mono: { bluff: 0.05, slow: 0.25 },
};
type Tuning = { read: number; sims: number; snipeSims: number; meta: boolean; noise: number; perceive?: boolean };
/** Level settings (exported so the arena script can try variants). */
export const SH_TUNING: Record<string, Tuning> = {
  easy: { read: 0, sims: 0, snipeSims: 0, meta: false, noise: 0.12 },
  normal: { read: 0.7, sims: 140, snipeSims: 180, meta: false, noise: 0.03 },
  hard: { read: 1, sims: 220, snipeSims: 300, meta: true, noise: 0, perceive: true },
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
function posterior(g: SniperHoldem, seat: number, left: number[], read: number, moves: Move[], str: { s1: number[]; s2: number[] }, meta: boolean): number[] {
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
    for (let i = 0; i < w.length; i += 1) if (w[i] && scoreOf([...board, ...PAIRS[i]]).l >= t) w[i] *= 0.35;
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
};

function makeView(full: SniperHoldem, me: number, level: ShLevel): View {
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
  for (const s of live) {
    if (s !== me) post.set(s, posterior(g, s, leftMine, lv.read, moves, str, lv.meta));
    // The table reads everyone (me included) from public information only.
    pub.set(s, posterior(g, s, leftPublic, lv.meta ? 1 : lv.read, moves, str, lv.meta));
  }
  return { g, me, mine, board, live, others: live.filter((s) => s !== me), moves, leftMine, leftPublic, lv, post, pub, str };
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
  const options = shPossibleTargets(v.board, v.mine).map((t) => label(t.cat, t.n));
  const own = scoreOf([...v.board, ...v.mine]).l;
  const said = new Set<number>();
  for (const s of v.live) { const t = v.g.snipes[s]; if (t && t !== 'pass') said.add(label(t.cat, t.n)); }

  if (level === 'easy' || v.lv.snipeSims === 0) {
    // The likeliest hand above mine on the table's public picture; now and then a random one or none.
    const labelsByPair = PAIRS.map((p) => scoreOf([...v.board, ...p]).l);
    const threat = new Float64Array(NLABEL);
    for (const s of v.others) { const d = labelDist(PAIRS.map((p) => Math.max(0, combos(v.leftMine, p))), labelsByPair); for (let l = 0; l < NLABEL; l += 1) threat[l] += d[l]; void s; }
    const pick = Math.random() < v.lv.noise ? options[Math.floor(Math.random() * options.length)] : naiveSnipe(threat, own, said, 0.08);
    return pick === null || pick === undefined ? { kind: 'pass' } : { kind: 'snipe', target: labelTarget(pick) };
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
  let best = 0;
  for (let i = 1; i < candidates.length; i += 1) if (value[i] > value[best] + 1e-9) best = i;
  const c = candidates[best];
  return c === null ? { kind: 'pass' } : { kind: 'snipe', target: labelTarget(c) };
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
function chooseBet(v: View, level: ShLevel, style: ShStyle): ShAction {
  const g = v.g;
  const st = STYLE[style];
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
  if (canRaise) {
    const sizes = new Set<number>([g.level + 1, g.level + Math.max(2, Math.ceil(pot / 2)), g.level + Math.max(3, pot), g.cap]);
    for (const raw of sizes) {
      const to = Math.min(g.cap, raw);
      if (to <= g.level) continue;
      const pay = to - g.bets[me];
      const extra = to - g.level;
      // Chance everyone folds to it (each opponent folds the part of my guess at their cards too weak for the price);
      // whoever calls a big raise is stronger than my reads say.
      // An opponent calls when their own share beats the price; shares bunch near 1/players because strong hands
      // get sniped, so only clearly weak holdings fold.
      const price = extra / (pot + 2 * extra);
      const need = 0.5 + (price - 1 / (others.length + 1)) / 0.6;
      const fe = others.reduce((acc, s) => acc * FOLD_SCALE * foldChance(v, s, need, level), 1);
      const pc = Math.max(0, pRaise * (1 - 0.3 * Math.min(1, extra / Math.max(4, pot))));
      const value = fe * u(stack + pot, 0) + (1 - fe) * (pc * u(stack + pot + extra, 0) + (1 - pc) * u(stack - pay, pot + pay));
      options.push({ action: { kind: 'raise', to }, value });
    }
  }
  options.sort((a, b) => b.value - a.value);
  let pick = options[0].action;
  // Temperament: a strong hand sometimes just calls; a weak one sometimes raises a little.
  if (pick.kind === 'raise' && canCall && Math.random() < st.slow) pick = { kind: 'call' };
  else if (pick.kind !== 'raise' && canRaise && Math.random() < st.bluff * (level === 'easy' ? 0.5 : 1) && p > 0.12) pick = { kind: 'raise', to: Math.min(g.cap, g.level + Math.max(2, Math.ceil(pot / 3))) };
  // Never fold when nothing more is owed... except there is always something owed to open (no checking).
  if (pick.kind === 'fold' && !canCall && canRaise && p > 1 / (opp + 1) * 0.8) pick = { kind: 'raise', to: g.level + 1 };
  return shCanAct(g, me, pick) ? pick : shTimeoutAction(g, me);
}

/** The AI's move for `seat` at `level` with persona `style`. */
export function chooseShAction(g: SniperHoldem, seat: number, level: ShLevel = 'normal', style: ShStyle = 'ace'): ShAction {
  if (g.turn !== seat) return shTimeoutAction(g, seat);
  const v = makeView(g, seat, level);
  if (g.phase === 'snipe') return chooseSnipe(v, level);
  return chooseBet(v, level, style);
}

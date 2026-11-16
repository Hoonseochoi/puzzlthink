// 무거운 13 (Heavy 13): 7 players, 3 porter stands (red/green/blue), 14 rounds.
// Seat order 0..6 is clockwise.
export const PLAYERS = 7;
export const ROUNDS = 14;
export const LIMIT = 13;
export const COLORS = ['r', 'g', 'b'] as const;
export type Color = (typeof COLORS)[number];
export type Chip = Color | 'w'; // w = rainbow
export const CHIPS: Chip[] = ['r', 'g', 'b', 'w'];
export const FULL_CHIPS: Record<Chip, number> = { r: 2, g: 2, b: 2, w: 1 };
export const FULL_CARDS = [0, 1, 2, 3, 4, 5, 6];

export type Hand = { cards: number[]; chips: Record<Chip, number> };
export type Player = Hand & { penalty: number; lastPenaltyAt: number };
export type Submission = { card: number; chip: Chip };
export type LogEntry =
  | { k: 'place'; seat: number; card: number; color: Color }
  | { k: 'collapse'; seat: number; card: number; color: Color; count: number }
  | { k: 'pass'; seat: number }
  | { k: 'round'; round: number; start: number }
  | { k: 'refill' };

export type Heavy13 = {
  round: number;
  phase: 'submit' | 'place' | 'finished';
  start: number;
  players: Player[];
  stands: Record<Color, number[]>;
  subs: (Submission | null)[];
  queue: number[]; // seats still to place in the main order
  passed: number[]; // seats that passed, in pass order
  resolvingPasses: boolean; // main order done; passers now place in reverse
  current: number | null;
  placedOrder: number[]; // revealed placement order for display
  seq: number; // event counter, for "most recent penalty" ties
  roundPenalized: number | null;
  log: LogEntry[];
};

const freshHand = (): Hand => ({ cards: [...FULL_CARDS], chips: { ...FULL_CHIPS } });

export function newHeavy13(start = 0): Heavy13 {
  return {
    round: 1, phase: 'submit', start,
    players: Array.from({ length: PLAYERS }, () => ({ ...freshHand(), penalty: 0, lastPenaltyAt: -1 })),
    stands: { r: [], g: [], b: [] }, subs: Array(PLAYERS).fill(null), queue: [], passed: [], resolvingPasses: false, current: null, placedOrder: [],
    seq: 0, roundPenalized: null, log: [{ k: 'round', round: 1, start }],
  };
}

export const sum = (cubes: number[]) => cubes.reduce((a, b) => a + b, 0);
const push = (state: Heavy13, entry: LogEntry): LogEntry[] => [entry, ...state.log].slice(0, 30);

export function canSubmit(state: Heavy13, seat: number, sub: Submission) {
  const p = state.players[seat];
  return state.phase === 'submit' && !state.subs[seat] && p.cards.includes(sub.card) && p.chips[sub.chip] > 0;
}

/** Placement order: rainbow first, then higher card, ties clockwise from the start player. */
export function placementOrder(state: Heavy13, subs: Submission[]): number[] {
  return Array.from({ length: PLAYERS }, (_, s) => s).sort((a, b) =>
    (subs[a].chip === 'w' ? 0 : 1) - (subs[b].chip === 'w' ? 0 : 1)
    || subs[b].card - subs[a].card
    || ((a - state.start + PLAYERS) % PLAYERS) - ((b - state.start + PLAYERS) % PLAYERS));
}

/** Records a secret submission. Cards and chips leave the hand only at the reveal, so nothing leaks early. */
export function submit(state: Heavy13, seat: number, sub: Submission): Heavy13 | null {
  if (!canSubmit(state, seat, sub)) return null;
  const subs = state.subs.map((s, i) => (i === seat ? sub : s));
  if (subs.some((s) => !s)) return { ...state, subs };
  const all = subs as Submission[];
  const players = state.players.map((p, i) => ({
    ...p, cards: p.cards.filter((_, k) => k !== p.cards.indexOf(all[i].card)), chips: { ...p.chips, [all[i].chip]: p.chips[all[i].chip] - 1 },
  }));
  const order = placementOrder(state, all);
  return { ...state, players, subs, phase: 'place', queue: order.slice(1), passed: [], resolvingPasses: false, current: order[0], placedOrder: order, roundPenalized: null };
}

/** Whether the current placer may still pass (once per round, not while passers are being resolved). */
export function canPass(state: Heavy13) {
  return state.phase === 'place' && state.current !== null && !state.passed.includes(state.current) && !state.resolvingPasses;
}

export function place(state: Heavy13, seat: number, chosen?: Color): Heavy13 | null {
  if (state.phase !== 'place' || state.current !== seat) return null;
  const sub = state.subs[seat]!;
  const color = sub.chip === 'w' ? chosen : sub.chip;
  if (!color || !COLORS.includes(color)) return null;
  const before = state.stands[color];
  const seq = state.seq + 1;
  let players = state.players;
  let stands = state.stands;
  let log: LogEntry[];
  let roundPenalized = state.roundPenalized;
  if (sum(before) + sub.card >= LIMIT) {
    // Collapse: the cubes already there are collected as penalty; the new cube stays.
    const count = before.length;
    players = players.map((p, i) => (i === seat ? { ...p, penalty: p.penalty + count, lastPenaltyAt: count > 0 ? seq : p.lastPenaltyAt } : p));
    stands = { ...stands, [color]: [sub.card] };
    if (count > 0) roundPenalized = seat;
    log = push(state, { k: 'collapse', seat, card: sub.card, color, count });
  } else {
    stands = { ...stands, [color]: [...before, sub.card] };
    log = push(state, { k: 'place', seat, card: sub.card, color });
  }
  return advance({ ...state, players, stands, log, seq, roundPenalized });
}

export function pass(state: Heavy13, seat: number): Heavy13 | null {
  if (state.current !== seat || !canPass(state)) return null;
  return advance({ ...state, passed: [...state.passed, seat], log: push(state, { k: 'pass', seat }) });
}

function advance(state: Heavy13): Heavy13 {
  if (state.queue.length) return { ...state, current: state.queue[0], queue: state.queue.slice(1) };
  // Main order done: passers place in reverse pass order (the first to pass goes last).
  if (state.passed.length) {
    const nextSeat = state.passed[state.passed.length - 1];
    return { ...state, resolvingPasses: true, passed: state.passed.slice(0, -1), current: nextSeat };
  }
  return endRound(state);
}

function endRound(state: Heavy13): Heavy13 {
  const start = state.roundPenalized ?? lastPenalized(state) ?? state.start;
  const round = state.round + 1;
  const base = { ...state, current: null, queue: [], passed: [], resolvingPasses: false, subs: Array(PLAYERS).fill(null), start };
  if (round > ROUNDS) return { ...base, phase: 'finished' };
  let players = state.players;
  let log = push(state, { k: 'round', round, start });
  if (round === ROUNDS / 2 + 1) {
    players = players.map((p) => ({ ...p, ...freshHand() }));
    log = [{ k: 'refill' }, ...log];
  }
  return { ...base, round, phase: 'submit', players, log };
}

function lastPenalized(state: Heavy13): number | null {
  let best: number | null = null;
  state.players.forEach((p, i) => { if (p.lastPenaltyAt >= 0 && (best === null || p.lastPenaltyAt > state.players[best].lastPenaltyAt)) best = i; });
  return best;
}

/** Final ranking, best first: fewer penalties; on a tie the more recent penalty ranks lower. */
export function ranking(state: Heavy13): number[] {
  return state.players.map((_, i) => i).sort((a, b) =>
    state.players[a].penalty - state.players[b].penalty || state.players[a].lastPenaltyAt - state.players[b].lastPenaltyAt);
}

export function options(state: Heavy13, seat: number): Submission[] {
  const p = state.players[seat];
  const result: Submission[] = [];
  for (const card of new Set(p.cards)) for (const chip of CHIPS) if (p.chips[chip] > 0) result.push({ card, chip });
  return result;
}

// ---------- AI ----------

export type AiLevel = 'easy' | 'normal' | 'hard';
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

/** Best stand for a rainbow cube: avoid collapsing; among safe stands, fill the fullest (tightens it for others). */
export function bestStand(stands: Record<Color, number[]>, card: number): Color {
  const scored = COLORS.map((c) => {
    const s = sum(stands[c]);
    const collapse = s + card >= LIMIT;
    return { c, value: collapse ? -10 * stands[c].length - 1 : s + card };
  });
  return scored.sort((a, b) => b.value - a.value)[0].c;
}

/** Decide at your placement turn: pass if placing now would cost you and a pass is still available. */
export function placementDecision(state: Heavy13, seat: number, level: AiLevel = 'normal'): { t: 'pass' } | { t: 'place'; color?: Color } {
  const sub = state.subs[seat]!;
  const color = sub.chip === 'w' ? (level === 'easy' ? pick([...COLORS]) : bestStand(state.stands, sub.card)) : sub.chip;
  const penalty = sum(state.stands[color]) + sub.card >= LIMIT ? state.stands[color].length : 0;
  const passable = canPass(state);
  if (penalty > 0 && passable && level !== 'easy') {
    // Others still to place may collapse it first; but if nobody else will touch it, passing only delays.
    const othersOnStand = state.queue.some((s) => state.subs[s] && (state.subs[s]!.chip === color || state.subs[s]!.chip === 'w'));
    if (othersOnStand || penalty >= 2) return { t: 'pass' };
  }
  return sub.chip === 'w' ? { t: 'place', color } : { t: 'place' };
}

function simulateRound(state: Heavy13, subs: Submission[], level: AiLevel): Heavy13 {
  const order = placementOrder(state, subs);
  let s: Heavy13 = { ...state, subs, phase: 'place', queue: order.slice(1), passed: [], current: order[0], roundPenalized: null, resolvingPasses: false };
  for (let guard = 0; s.phase === 'place' && s.current !== null && guard < 30; guard += 1) {
    const seat: number = s.current;
    const d = placementDecision(s, seat, level);
    const next: Heavy13 | null = d.t === 'pass' ? pass(s, seat) : place(s, seat, d.t === 'place' ? d.color : undefined);
    if (!next) break;
    s = next;
    if (s.round !== state.round) break;
  }
  return s;
}

/** Choose a card and chip by sampling what the others might play from their (public) remaining hands. */
export function chooseSubmission(state: Heavy13, seat: number, level: AiLevel = 'normal'): Submission {
  const mine = options(state, seat);
  if (level === 'easy') return pick(mine);
  const sims = level === 'hard' ? 90 : 35;
  const half = state.round <= ROUNDS / 2 ? state.round : state.round - ROUNDS / 2; // 1..7 within the current hand
  const scored = mine.map((option) => {
    let total = 0;
    for (let i = 0; i < sims; i += 1) {
      const subs = state.players.map((_, s) => (s === seat ? option : state.subs[s] ?? pick(options(state, s))));
      const after = simulateRound(state, subs, 'normal');
      total += after.players[seat].penalty - state.players[seat].penalty;
    }
    // Keep the flexible resources (0 card, rainbow chip) unless they are needed or it is the end of a hand.
    const keepValue = half >= 6 ? 0 : (option.card === 0 ? 0.35 : 0) + (option.chip === 'w' ? 0.45 : 0);
    return { option, value: total / sims + keepValue + Math.random() * 0.05 };
  });
  return scored.sort((a, b) => a.value - b.value)[0].option;
}

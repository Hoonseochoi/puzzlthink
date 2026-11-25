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

export function newHeavy13(start = 0, playerCount = PLAYERS): Heavy13 {
  const count = Math.max(4, Math.min(PLAYERS, playerCount));
  return {
    round: 1, phase: 'submit', start: start % count,
    players: Array.from({ length: count }, () => ({ ...freshHand(), penalty: 0, lastPenaltyAt: -1 })),
    stands: { r: [], g: [], b: [] }, subs: Array(count).fill(null), queue: [], passed: [], resolvingPasses: false, current: null, placedOrder: [],
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
  const count = state.players.length;
  return Array.from({ length: count }, (_, s) => s).sort((a, b) =>
    (subs[a].chip === 'w' ? 0 : 1) - (subs[b].chip === 'w' ? 0 : 1)
    || subs[b].card - subs[a].card
    || ((a - state.start + count) % count) - ((b - state.start + count) % count));
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
  const base = { ...state, current: null, queue: [], passed: [], resolvingPasses: false, subs: Array(state.players.length).fill(null), start };
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

const standOf = (state: Heavy13, seat: number): Color => {
  const sub = state.subs[seat]!;
  return sub.chip === 'w' ? bestStand(state.stands, sub.card) : sub.chip;
};

/** Plays the rest of the round with nobody passing (rainbows on their best stand). */
function placeOut(state: Heavy13): Heavy13 {
  let s = state;
  for (let guard = 0; s.phase === 'place' && s.round === state.round && s.current !== null && guard < 20; guard += 1) {
    const next = place(s, s.current, standOf(s, s.current));
    if (!next) break;
    s = next;
  }
  return s;
}

/**
 * Cheap placement rule, used inside simulations: place, unless passing is strictly cheaper when everyone
 * after you simply places. Passing is only worth it when someone behind you collapses that stand first.
 */
function quickDecision(state: Heavy13, seat: number): { t: 'pass' } | { t: 'place'; color: Color } {
  const color = standOf(state, seat);
  const card = state.subs[seat]!.card;
  const cost = sum(state.stands[color]) + card >= LIMIT ? state.stands[color].length : 0;
  if (cost === 0 || !canPass(state)) return { t: 'place', color };
  const before = state.players[seat].penalty;
  const placed = placeOut(place(state, seat, color)!).players[seat].penalty - before;
  const passed = placeOut(pass(state, seat)!).players[seat].penalty - before;
  return passed < placed ? { t: 'pass' } : { t: 'place', color };
}

/** Plays the rest of the round with every placer using the cheap rule. */
function playOut(state: Heavy13): Heavy13 {
  let s = state;
  for (let guard = 0; s.phase === 'place' && s.round === state.round && s.current !== null && guard < 30; guard += 1) {
    const seat = s.current;
    const d = quickDecision(s, seat);
    const next = d.t === 'pass' ? pass(s, seat) : place(s, seat, d.color);
    if (!next) break;
    s = next;
  }
  return s;
}

/**
 * Decide at your placement turn. Every submission is public by now, so try each choice (each stand for a
 * rainbow, and passing if allowed), play the round out, and keep the cheapest. Ties keep placing, since a
 * pass that saves nothing only gives up the option.
 */
export function placementDecision(state: Heavy13, seat: number, level: AiLevel = 'normal'): { t: 'pass' } | { t: 'place'; color?: Color } {
  const sub = state.subs[seat]!;
  if (level === 'easy') return sub.chip === 'w' ? { t: 'place', color: pick([...COLORS]) } : { t: 'place' };
  // Normal skips the look-ahead now and then: places on the stand that looks best, never passes.
  if (level === 'normal' && Math.random() < NORMAL_SLIP) return sub.chip === 'w' ? { t: 'place', color: bestStand(state.stands, sub.card) } : { t: 'place' };
  const before = state.players[seat].penalty;
  const preferred = bestStand(state.stands, sub.card);
  const colors = sub.chip === 'w' ? [preferred, ...COLORS.filter((c) => c !== preferred)] : [sub.chip];
  const choices: { d: { t: 'pass' } | { t: 'place'; color?: Color }; next: Heavy13 }[] = colors.map((color) => ({
    d: sub.chip === 'w' ? { t: 'place', color } : { t: 'place' }, next: place(state, seat, color)!,
  }));
  if (canPass(state)) choices.push({ d: { t: 'pass' }, next: pass(state, seat)! });
  let best = choices[0];
  let bestCost = Infinity;
  for (const c of choices) {
    const end = playOut(c.next);
    // Own penalty first; a little credit for penalty that lands on the others instead.
    const others = end.players.reduce((t, p, i) => (i === seat ? t : t + p.penalty - state.players[i].penalty), 0);
    const cost = end.players[seat].penalty - before - 0.02 * others;
    if (cost < bestCost - 1e-9) { best = c; bestCost = cost; }
  }
  return best.d;
}

function simulateRound(state: Heavy13, subs: Submission[]): Heavy13 {
  const order = placementOrder(state, subs);
  return playOut({ ...state, subs, phase: 'place', queue: order.slice(1), passed: [], current: order[0], roundPenalized: null, resolvingPasses: false });
}

/** Cost of spending a flexible resource (0 card, rainbow chip) early in a hand. */
function keepValue(state: Heavy13, option: Submission) {
  const half = state.round <= ROUNDS / 2 ? state.round : state.round - ROUNDS / 2; // 1..7 within the current hand
  return half >= 6 ? 0 : (option.card === 0 ? 0.35 : 0) + (option.chip === 'w' ? 0.45 : 0);
}

type Mixed = { options: Submission[]; weights: number[] };

function sample(m: Mixed): Submission {
  let r = Math.random();
  for (let i = 0; i < m.options.length; i += 1) { r -= m.weights[i]; if (r <= 0) return m.options[i]; }
  return m.options[m.options.length - 1];
}

function softmax(values: number[], temp: number): number[] {
  const lo = Math.min(...values);
  const w = values.map((v) => Math.exp(-(v - lo) / temp));
  const total = w.reduce((a, b) => a + b, 0);
  return w.map((x) => x / total);
}

/** Expected round penalty (plus resource cost) of each of a seat's options, against the others' mixed play. */
function optionValues(state: Heavy13, seat: number, model: Mixed[], sims: number): number[] {
  return model[seat].options.map((option) => {
    let total = 0;
    for (let i = 0; i < sims; i += 1) {
      const subs = model.map((m, s) => (s === seat ? option : sample(m)));
      total += simulateRound(state, subs).players[seat].penalty - state.players[seat].penalty;
    }
    return total / sims + keepValue(state, option);
  });
}

// sims: samples per option for the opponent forecast; finalSims: for the AI's own choice;
// temp: how spread the forecast is; finalTemp: how sharply the AI takes its best option.
/**
 * How often the normal AI skips its look-ahead. At 0.3 people took first place 19% of the time against normal and 25%
 * against hard (normal was no easier: average rank 3.48 vs 3.41 of 6), so normal now slips on half its turns.
 */
const NORMAL_SLIP = 0.5;
const LEVELS = {
  normal: { sims: 10, finalSims: 16, temp: 0.3, finalTemp: 0.12 },
  hard: { sims: 24, finalSims: 70, temp: 0.25, finalTemp: 0.03 },
};

/**
 * Choose cards and chips for several seats at once, from public information only (remaining hands are
 * public; secret submissions are never read). Thinking one step ahead: first forecast what each player
 * is likely to play (their good answers against random play, as a spread of chances), then pick the
 * best answer against that forecast. The old AI answered random play directly, so every AI reached the
 * same "safe" stand and they all piled onto it; answering the forecast steers away from the crowd.
 */
export function planSubmissions(state: Heavy13, seats: number[], level: AiLevel = 'normal'): Submission[] {
  if (level === 'easy') return seats.map((s) => pick(options(state, s)));
  const cfg = LEVELS[level];
  const uniform: Mixed[] = state.players.map((_, s) => {
    const opts = options(state, s);
    return { options: opts, weights: opts.map(() => 1 / opts.length) };
  });
  const forecast: Mixed[] = uniform.map((m, s) => ({ options: m.options, weights: softmax(optionValues(state, s, uniform, cfg.sims), cfg.temp) }));
  return seats.map((seat) => {
    // Normal plays a random card and chip some of the time, so it is clearly easier than hard.
    if (level === 'normal' && Math.random() < NORMAL_SLIP) return pick(forecast[seat].options);
    const values = optionValues(state, seat, forecast, cfg.finalSims);
    return sample({ options: forecast[seat].options, weights: softmax(values, cfg.finalTemp) });
  });
}

/** One seat's card and chip (see planSubmissions). */
export function chooseSubmission(state: Heavy13, seat: number, level: AiLevel = 'normal'): Submission {
  return planSubmissions(state, [seat], level)[0];
}

export const RR_PLAYERS = 6;
export const RR_CHAMBERS = 6;
export const RR_START_CREDITS = 16;

export type RRKnowledge = boolean | null;
export type RRActionKind = 'publicInspect' | 'privateInspect' | 'rotate1' | 'rotate2' | 'manipulate';
export type RRShot = { chamber: number; target: number; fired: boolean };
export const RR_MANIPULATE_AT = 6;
/** Hidden from everyone until the shots are fired, then shown in the result's manipulation reveal. */
export type RRManipEntry =
  | { k: 'fund'; round: number; seat: number; amount: number; pool: number; lost?: number } // lost: overflow past 6, discarded
  | { k: 'swap'; round: number; seat: number; pair: number };
export type RRLog =
  | { k: 'round'; round: number; start: number }
  | { k: 'publicInspect'; seat: number; pair: number }
  | { k: 'privateInspect'; seat: number; pair?: number } // pair: kept secret until the shots
  | { k: 'rotate'; seat: number; steps: 1 | 2 }
  | { k: 'manipulateFund'; seat: number }
  | { k: 'manipulate'; seat: number; pair: number }
  | { k: 'pass'; seat: number }
  | { k: 'fire'; seat: number; fired: boolean; chamber: number };

export type RussianRoulette = {
  phase: 'playing' | 'finished';
  round: number;
  roundStart: number;
  turn: number;
  remaining: number[];
  chambers: boolean[];
  muzzle: number;
  baseMuzzle?: number; // initial public direction, retained to animate continuous clockwise turns
  rotations?: number[]; // public rotation steps by player
  credits: number[];
  manipulation: number[]; // each player's own total contribution (private to that player)
  pool?: number; // shared manipulation pool, hidden from everyone
  manipHistory?: RRManipEntry[]; // revealed after the shots
  publicIntel: RRKnowledge[];
  privateIntel: RRKnowledge[][];
  hits: number[];
  shots: RRShot[];
  log: RRLog[];
};

export type RRAction =
  | { kind: 'publicInspect'; pair: number }
  | { kind: 'privateInspect'; pair: number }
  | { kind: 'rotate1' }
  | { kind: 'rotate2' }
  | { kind: 'manipulate'; amount: 1 | 2 | 3; pair: number }; // pair is swapped only if this contribution fills the pool

export const RR_COST: Record<RRActionKind, number> = {
  publicInspect: 1,
  privateInspect: 2,
  rotate1: 3,
  rotate2: 4,
  manipulate: 1,
};

const orderFrom = (start: number) => Array.from({ length: RR_PLAYERS }, (_, i) => (start + i) % RR_PLAYERS);
const pairCells = (pair: number) => [pair, (pair + 1) % RR_CHAMBERS] as const;
const validPair = (pair: number | undefined): pair is number => Number.isInteger(pair) && pair! >= 0 && pair! < RR_CHAMBERS;
const LOG_MAX = 300; // the whole game, for the replay after the shots
const pushLog = (log: RRLog[], entry: RRLog) => [entry, ...log].slice(0, LOG_MAX);

function loadChambers(random: () => number) {
  const first = Math.floor(random() * RR_CHAMBERS);
  const candidates = Array.from({ length: RR_CHAMBERS }, (_, chamber) => chamber)
    .filter((chamber) => chamber !== first);
  const second = candidates[Math.floor(random() * candidates.length)];
  const chambers = Array<boolean>(RR_CHAMBERS).fill(false);
  chambers[first] = true;
  chambers[second] = true;
  return chambers;
}

export function newRussianRoulette(random: () => number = Math.random): RussianRoulette {
  const start = 0;
  const muzzle = Math.floor(random() * RR_PLAYERS);
  return {
    phase: 'playing', round: 1, roundStart: start, turn: start, remaining: orderFrom(start),
    chambers: loadChambers(random), muzzle, baseMuzzle: muzzle, rotations: Array(RR_PLAYERS).fill(0),
    credits: Array(RR_PLAYERS).fill(RR_START_CREDITS), manipulation: Array(RR_PLAYERS).fill(0), pool: 0, manipHistory: [],
    publicIntel: Array(RR_CHAMBERS).fill(null),
    privateIntel: Array.from({ length: RR_PLAYERS }, () => Array<RRKnowledge>(RR_CHAMBERS).fill(null)),
    hits: [], shots: [], log: [{ k: 'round', round: 1, start }],
  };
}

/** Muzzle rotation is a public action, so every player sees the true direction. */
export function knownMuzzle(game: RussianRoulette) {
  return game.muzzle;
}

export function actionCost(action: RRAction) {
  return action.kind === 'manipulate' ? action.amount : RR_COST[action.kind];
}

export function canAct(game: RussianRoulette, seat: number, action: RRAction) {
  if (game.phase !== 'playing' || game.turn !== seat || seat < 0 || seat >= RR_PLAYERS) return false;
  const cost = actionCost(action);
  if (cost < 1 || game.credits[seat] < cost) return false;
  if ((action.kind === 'publicInspect' || action.kind === 'privateInspect' || action.kind === 'manipulate') && !validPair(action.pair)) return false;
  if (action.kind === 'manipulate' && ![1, 2, 3].includes(action.amount)) return false;
  return true;
}

function resolveShots(game: RussianRoulette): RussianRoulette {
  const hits: number[] = [];
  const shots: RRShot[] = [];
  const spent = new Set<number>();
  let target = game.muzzle;
  let chamber = 0;
  for (let guard = 0; hits.length < 2 && guard < 18; guard += 1) {
    const fired = game.chambers[chamber] && !spent.has(chamber);
    if (fired) {
      spent.add(chamber);
      if (!hits.includes(target)) hits.push(target);
    }
    shots.push({ chamber, target, fired });
    target = (target + 1) % RR_PLAYERS;
    chamber = (chamber + 1) % RR_CHAMBERS;
  }
  const fireLogs: RRLog[] = shots.map((shot) => ({ k: 'fire', seat: shot.target, fired: shot.fired, chamber: shot.chamber }));
  return { ...game, phase: 'finished', hits, shots, log: [...fireLogs.reverse(), ...game.log].slice(0, LOG_MAX) };
}

function advance(game: RussianRoulette): RussianRoulette {
  if (game.credits.filter((credit) => credit === 0).length >= 3) return resolveShots(game);
  let remaining = game.remaining.slice(1).filter((seat) => game.credits[seat] > 0);
  let round = game.round;
  let roundStart = game.roundStart;
  let log = game.log;
  if (!remaining.length) {
    round += 1;
    roundStart = (roundStart + 1) % RR_PLAYERS;
    remaining = orderFrom(roundStart).filter((seat) => game.credits[seat] > 0);
    log = pushLog(log, { k: 'round', round, start: roundStart });
  }
  return { ...game, round, roundStart, remaining, turn: remaining[0], log };
}

export function applyRRAction(game: RussianRoulette, seat: number, action: RRAction): RussianRoulette | null {
  if (!canAct(game, seat, action)) return null;
  const credits = game.credits.map((value, i) => i === seat ? value - actionCost(action) : value);
  let next: RussianRoulette = { ...game, credits };

  if (action.kind === 'publicInspect') {
    const publicIntel = [...game.publicIntel];
    for (const cell of pairCells(action.pair)) publicIntel[cell] = game.chambers[cell];
    next = { ...next, publicIntel, log: pushLog(game.log, { k: 'publicInspect', seat, pair: action.pair }) };
  } else if (action.kind === 'privateInspect') {
    const privateIntel = game.privateIntel.map((intel) => [...intel]);
    for (const cell of pairCells(action.pair)) privateIntel[seat][cell] = game.chambers[cell];
    next = { ...next, privateIntel, log: pushLog(game.log, { k: 'privateInspect', seat, pair: action.pair }) };
  } else if (action.kind === 'rotate1' || action.kind === 'rotate2') {
    const steps = action.kind === 'rotate1' ? 1 : 2;
    const rotations = (game.rotations ?? Array(RR_PLAYERS).fill(0)).map((value, i) => i === seat ? value + steps : value);
    next = { ...next, muzzle: (game.muzzle + steps) % RR_PLAYERS, rotations, log: pushLog(game.log, { k: 'rotate', seat, steps }) };
  } else {
    // Everyone pays into one hidden pool. Whoever brings it to 6 swaps their chosen pair, the pool
    // empties and any excess is lost. Nobody else learns about it, so their intel silently goes stale.
    const pool = (game.pool ?? 0) + action.amount;
    const manipulation = game.manipulation.map((value, i) => i === seat ? value + action.amount : value);
    let history = [...(game.manipHistory ?? []), { k: 'fund' as const, round: game.round, seat, amount: action.amount, pool: Math.min(pool, RR_MANIPULATE_AT), ...(pool > RR_MANIPULATE_AT ? { lost: pool - RR_MANIPULATE_AT } : {}) }];
    next = { ...next, manipulation, pool, log: pushLog(game.log, { k: 'manipulateFund', seat }) };
    if (pool >= RR_MANIPULATE_AT) {
      const [a, b] = pairCells(action.pair);
      const chambers = [...game.chambers];
      [chambers[a], chambers[b]] = [chambers[b], chambers[a]];
      const privateIntel = game.privateIntel.map((intel) => [...intel]);
      privateIntel[seat][a] = chambers[a]; privateIntel[seat][b] = chambers[b];
      history = [...history, { k: 'swap', round: game.round, seat, pair: action.pair }];
      next = { ...next, chambers, privateIntel, pool: 0 };
    }
    next = { ...next, manipHistory: history };
  }
  if (credits[seat] === 0) next = { ...next, log: pushLog(next.log, { k: 'pass', seat }) };
  return advance(next);
}

export function passEmptyPlayers(game: RussianRoulette) {
  let next = game;
  let guard = 0;
  while (next.phase === 'playing' && next.credits[next.turn] === 0 && guard < RR_PLAYERS) {
    next = advance({ ...next, log: pushLog(next.log, { k: 'pass', seat: next.turn }) });
    guard += 1;
  }
  return next;
}

/**
 * The move of an AI that reads what it knows. Exactly two chambers are loaded and chamber c fires at seat
 * muzzle + c, so the seat's own danger is the chance that chamber (seat − muzzle) is loaded: 1 or 0 when it has seen
 * that chamber (publicly or privately), otherwise the share of unseen bullets among the unseen chambers.
 * Seen loaded → turn the muzzle to the safest chamber it can afford (or pay toward a swap of its chamber).
 * Not seen → look at it (privately when it can). Seen empty → spend as little as possible, on something that cannot hurt it.
 * (A hidden swap can make what it saw stale; like a player, it trusts what it saw.) Null when it has no such move.
 */
function informedRRAction(game: RussianRoulette, seat: number): RRAction | null {
  const credit = game.credits[seat];
  const intel = game.publicIntel.map((value, i) => value ?? game.privateIntel[seat][i]);
  const unseen = intel.filter((v) => v === null).length;
  const bulletsLeft = Math.max(0, 2 - intel.filter((v) => v === true).length);
  const danger = (chamber: number) => { const v = intel[(chamber + RR_CHAMBERS * 2) % RR_CHAMBERS]; return v === null ? (unseen ? bulletsLeft / unseen : 0) : v ? 1 : 0; };
  const mine = (seat - game.muzzle + RR_CHAMBERS) % RR_CHAMBERS;
  const now = danger(mine);
  if (intel[mine] === null) {
    // The pair with its own chamber that shows the most new chambers.
    const pairs = [mine, (mine + RR_CHAMBERS - 1) % RR_CHAMBERS].sort((a, b) => pairCells(b).filter((i) => intel[i] === null).length - pairCells(a).filter((i) => intel[i] === null).length);
    return credit >= 2 ? { kind: 'privateInspect', pair: pairs[0] } : { kind: 'publicInspect', pair: pairs[0] };
  }
  if (now === 1) {
    const turns = ([[1, 'rotate1', 3], [2, 'rotate2', 4]] as const).filter(([, , cost]) => credit >= cost)
      .map(([steps, kind]) => ({ kind, risk: danger(mine - steps) })).sort((a, b) => a.risk - b.risk);
    if (turns.length && turns[0].risk < 1) return { kind: turns[0].kind };
    // Cannot turn away: pay toward a swap of its own chamber with whichever neighbour looks safer.
    const pair = danger(mine + 1) <= danger(mine - 1) ? mine : (mine + RR_CHAMBERS - 1) % RR_CHAMBERS;
    return { kind: 'manipulate', amount: Math.min(3, credit) as 1 | 2 | 3, pair };
  }
  // Safe as far as it knows: one credit, on a pair that leaves its own chamber alone.
  const away = Array.from({ length: RR_CHAMBERS }, (_, pair) => pair).filter((pair) => !(pairCells(pair) as readonly number[]).includes(mine));
  const fresh = away.filter((pair) => pairCells(pair).some((i) => intel[i] === null));
  if (fresh.length && Math.random() < 0.5) return { kind: 'publicInspect', pair: fresh[Math.floor(Math.random() * fresh.length)] };
  return { kind: 'manipulate', amount: 1, pair: away[Math.floor(Math.random() * away.length)] };
}

/** How often a level plays the informed move above instead of the loose habits below. */
const RR_INFORMED = { easy: 0, normal: 0.5, hard: 0.9 } as const;

export function chooseRRAction(game: RussianRoulette, seat: number, level: 'easy' | 'normal' | 'hard' = 'normal'): RRAction {
  // Play data: people survived 70% of games at any level, the same as chance (4 of 6 seats survive): the habits below
  // never looked at whether the AI's own chamber was loaded. Normal and hard now mostly play the informed move.
  if (Math.random() < RR_INFORMED[level]) {
    const informed = informedRRAction(game, seat);
    if (informed && canAct(game, seat, informed)) return informed;
  }
  const credit = game.credits[seat];
  const intel = game.publicIntel.map((value, i) => value ?? game.privateIntel[seat][i]);
  const unknownPairs = Array.from({ length: RR_CHAMBERS }, (_, pair) => ({ pair, unknown: pairCells(pair).filter((i) => intel[i] === null).length }));
  unknownPairs.sort((a, b) => b.unknown - a.unknown || Math.random() - 0.5);
  const pair = unknownPairs[0].pair;
  const fund = game.manipulation[seat];
  const muzzle = knownMuzzle(game);
  // The AI can't see the shared pool either. If its contribution happens to fill it, it swaps the
  // chamber that would fire at itself first with the next one.
  const swapPair = (seat - muzzle + RR_CHAMBERS) % RR_CHAMBERS;

  if (fund > 0 && credit > 0 && Math.random() < (level === 'hard' ? 0.55 : 0.3)) {
    return { kind: 'manipulate', amount: Math.min(3, credit) as 1 | 2 | 3, pair: swapPair };
  }
  if (credit >= 3 && level !== 'easy' && Math.random() < (level === 'hard' ? 0.28 : 0.14)) {
    return { kind: 'manipulate', amount: Math.min(3, credit) as 1 | 2 | 3, pair: swapPair };
  }
  if (credit >= 4 && muzzle === seat && Math.random() < 0.72) return { kind: 'rotate2' };
  if (credit >= 3 && muzzle === seat && Math.random() < 0.82) return { kind: 'rotate1' };
  if (credit >= 2 && unknownPairs[0].unknown > 0 && level !== 'easy' && Math.random() < 0.58) return { kind: 'privateInspect', pair };
  if (unknownPairs[0].unknown > 0 || credit < 3) return { kind: 'publicInspect', pair };
  if (credit >= 4 && Math.random() < 0.45) return { kind: 'rotate2' };
  if (credit >= 3) return { kind: 'rotate1' };
  return credit >= 2 ? { kind: 'privateInspect', pair } : { kind: 'publicInspect', pair };
}

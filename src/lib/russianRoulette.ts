export const RR_PLAYERS = 6;
export const RR_CHAMBERS = 6;
export const RR_START_CREDITS = 16;

export type RRKnowledge = boolean | null;
export type RRActionKind = 'publicInspect' | 'privateInspect' | 'rotate1' | 'rotate2' | 'manipulate';
export type RRShot = { chamber: number; target: number; fired: boolean };
export type RRLog =
  | { k: 'round'; round: number; start: number }
  | { k: 'publicInspect'; seat: number; pair: number }
  | { k: 'privateInspect'; seat: number }
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
  muzzle: number; // true muzzle (host only)
  baseMuzzle?: number; // where everyone saw the muzzle at the start
  rotations?: number[]; // steps each player turned it; rotation is a private action
  credits: number[];
  manipulation: number[];
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
  | { kind: 'manipulate'; amount: 1 | 2 | 3; pair?: number };

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
const pushLog = (log: RRLog[], entry: RRLog) => [entry, ...log].slice(0, 60);

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
    credits: Array(RR_PLAYERS).fill(RR_START_CREDITS), manipulation: Array(RR_PLAYERS).fill(0),
    publicIntel: Array(RR_CHAMBERS).fill(null),
    privateIntel: Array.from({ length: RR_PLAYERS }, () => Array<RRKnowledge>(RR_CHAMBERS).fill(null)),
    hits: [], shots: [], log: [{ k: 'round', round: 1, start }],
  };
}

/** Where `seat` believes the muzzle points: the starting position plus only their own turns. */
export function knownMuzzle(game: RussianRoulette, seat: number | null) {
  if (game.phase === 'finished' || seat === null || game.baseMuzzle === undefined || !game.rotations) return game.muzzle;
  return (game.baseMuzzle + (game.rotations[seat] ?? 0)) % RR_PLAYERS;
}

export function actionCost(action: RRAction) {
  return action.kind === 'manipulate' ? action.amount : RR_COST[action.kind];
}

export function canAct(game: RussianRoulette, seat: number, action: RRAction) {
  if (game.phase !== 'playing' || game.turn !== seat || seat < 0 || seat >= RR_PLAYERS) return false;
  const cost = actionCost(action);
  if (cost < 1 || game.credits[seat] < cost) return false;
  if ((action.kind === 'publicInspect' || action.kind === 'privateInspect') && !validPair(action.pair)) return false;
  if (action.kind === 'manipulate') {
    if (![1, 2, 3].includes(action.amount)) return false;
    if (game.manipulation[seat] + action.amount >= 6 && !validPair(action.pair)) return false;
  }
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
  return { ...game, phase: 'finished', hits, shots, log: [...fireLogs.reverse(), ...game.log].slice(0, 60) };
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
    next = { ...next, privateIntel, log: pushLog(game.log, { k: 'privateInspect', seat }) };
  } else if (action.kind === 'rotate1' || action.kind === 'rotate2') {
    const steps = action.kind === 'rotate1' ? 1 : 2;
    const rotations = (game.rotations ?? Array(RR_PLAYERS).fill(0)).map((value, i) => i === seat ? value + steps : value);
    next = { ...next, muzzle: (game.muzzle + steps) % RR_PLAYERS, rotations, log: pushLog(game.log, { k: 'rotate', seat, steps }) };
  } else {
    const total = game.manipulation[seat] + action.amount;
    if (total < 6) {
      const manipulation = game.manipulation.map((value, i) => i === seat ? total : value);
      next = { ...next, manipulation, log: pushLog(game.log, { k: 'manipulateFund', seat }) };
    } else {
      const pair = action.pair!;
      const [a, b] = pairCells(pair);
      const chambers = [...game.chambers];
      [chambers[a], chambers[b]] = [chambers[b], chambers[a]];
      const publicIntel = [...game.publicIntel];
      publicIntel[a] = null; publicIntel[b] = null;
      const privateIntel = game.privateIntel.map((intel) => {
        const copy = [...intel]; copy[a] = null; copy[b] = null; return copy;
      });
      privateIntel[seat][a] = chambers[a]; privateIntel[seat][b] = chambers[b];
      const manipulation = game.manipulation.map((value, i) => i === seat ? 0 : value);
      next = { ...next, chambers, publicIntel, privateIntel, manipulation, log: pushLog(game.log, { k: 'manipulate', seat, pair }) };
    }
  }
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

export function chooseRRAction(game: RussianRoulette, seat: number, level: 'easy' | 'normal' | 'hard' = 'normal'): RRAction {
  const credit = game.credits[seat];
  const intel = game.publicIntel.map((value, i) => value ?? game.privateIntel[seat][i]);
  const unknownPairs = Array.from({ length: RR_CHAMBERS }, (_, pair) => ({ pair, unknown: pairCells(pair).filter((i) => intel[i] === null).length }));
  unknownPairs.sort((a, b) => b.unknown - a.unknown || Math.random() - 0.5);
  const pair = unknownPairs[0].pair;
  const fund = game.manipulation[seat];
  const muzzle = knownMuzzle(game, seat); // AI only knows its own turns too

  if (fund > 0 && credit > 0 && (fund >= 3 || level === 'hard')) {
    const amount = Math.min(3, credit) as 1 | 2 | 3;
    return fund + amount >= 6 ? { kind: 'manipulate', amount, pair } : { kind: 'manipulate', amount };
  }
  if (credit >= 3 && level !== 'easy' && Math.random() < (level === 'hard' ? 0.28 : 0.14)) {
    return { kind: 'manipulate', amount: Math.min(3, credit) as 1 | 2 | 3 };
  }
  if (credit >= 4 && muzzle === seat && Math.random() < 0.72) return { kind: 'rotate2' };
  if (credit >= 3 && muzzle === seat && Math.random() < 0.82) return { kind: 'rotate1' };
  if (credit >= 2 && unknownPairs[0].unknown > 0 && level !== 'easy' && Math.random() < 0.58) return { kind: 'privateInspect', pair };
  if (unknownPairs[0].unknown > 0 || credit < 3) return { kind: 'publicInspect', pair };
  if (credit >= 4 && Math.random() < 0.45) return { kind: 'rotate2' };
  if (credit >= 3) return { kind: 'rotate1' };
  return credit >= 2 ? { kind: 'privateInspect', pair } : { kind: 'publicInspect', pair };
}

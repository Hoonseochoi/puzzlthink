/*
 * 망각의 지뢰 (Mine of Oblivion) — the 1:1 memory-and-deduction duel from Netflix's 데스게임 (season 1, match 6).
 * Rules source: src/content/shows/dg1/games-b.ts (mineOfOblivion) and src/content/shows/dg2/mine-of-oblivion-2.ts.
 * [show] = the broadcast rule as those pages record it; [site] = filled in here where the show leaves a gap for a
 * digital 1:1 game (or where the pages mark a fact as unverified).
 *
 * Board
 *  1. [show] 11×11. Treasure in the centre and two diagonally opposite corners; the other two corners are the starts.
 *     [site] Seat 0 starts bottom-left, seat 1 top-right; treasure top-left, bottom-right and centre. Each player
 *     sees the board turned so their own start is bottom-left.
 *  2. [show] Each player buries 15 mines in secret. Not on treasure, not within two cells of either start
 *     ([site] read as the 3×3 block in each start corner: Chebyshev distance ≤ 2). The two players do not know each
 *     other's mines, so both may bury on one cell (a "double" cell). [site] One mine per player per cell.
 *  3. [show] Only the number of mined cells is public; nothing is marked on the board and notes are not allowed.
 *     [site] The count shown is the number of distinct cells holding a mine (so a double cell shows up as a count
 *     below 30). After the walk starts the board no longer shows even your own mines: you must remember them.
 *
 * Turns
 *  4. [show] A draw decides who moves first ([site] random). Each turn you move to one of the eight cells around
 *     you; never onto the opponent. [site] Moving is compulsory (there is always a legal move).
 *  5. [show] On a cell with no mine you score the mines in the eight cells around it (yours and the opponent's; a
 *     double cell counts 2). A cell someone has already scored scores nothing again. [site] The number is announced
 *     to both players and shown for a moment only (memory is the game); the board keeps a faint footprint on every
 *     scored cell, because the "already scored" rule must be playable. A start cell counts as scored.
 *  6. [show] A mine — anyone's — costs 5 points, and you go back to one of the three cells next to your start; every
 *     mine on that cell is removed. [site] You pick which of the three (not the opponent's cell); landing there scores
 *     nothing and ends your turn. A double cell costs 5 once. Nobody is told whose mine it was. The crater stays
 *     marked (everyone saw it, and the cell is now empty); it can be scored later like any cell.
 *  7. [show] Treasure scores +10, +15, +20 in the order the three are found. [site] A treasure cell is mine-free, so
 *     its first visitor also scores its number, like any cell.
 *
 * End
 *  8. [show] The game ends the moment all three treasures are found; the higher score wins. [site] Equal scores are a
 *     draw. [site, from season 2's 70-turn limit] It also ends after 70 moves in all (35 each).
 *  9. [site] Resigning loses. In rooms a player has 120 s to bury and 30 s per move; a missed move is played by the
 *     AI for that seat (as in the site's other rooms) until the player comes back.
 *
 * Items (AI matches only; src/lib/mineOblivionItems.ts): 탐지기 shows the number of a cell next to you without moving,
 * 기억 되살리기 shows your own mines again for a moment, 방폭복 makes the next mine you step on cost nothing and not
 * send you back (the mine still goes off: crater, count down by one, the turn passes). Rooms never use them.
 *
 * Left out on purpose: season 2's time bombs (one tight mode instead of two half-explained ones) and the 9×9 practice
 * game. See siteDiff on the two show pages.
 */

export const MO_SIZE = 11;
export const MO_MINES = 15;
export const MO_PENALTY = 5;
export const MO_TREASURE_VALUES = [10, 15, 20] as const;
export const MO_MOVE_LIMIT = 70;

export type MoSeat = 0 | 1;
export type Rng = () => number;
export type MoPhase = 'bury' | 'walk' | 'finished';
export type MoEnding = 'treasure' | 'moves' | 'resign';
export type MoStepKind = 'score' | 'blank' | 'mine' | 'treasure';

/** One move, as announced: everything here is public. */
export type MoStep = {
  n: number; // move number, 1-based
  seat: MoSeat;
  from: number;
  to: number;
  kind: MoStepKind;
  /** The number announced (mines around `to`), or null when nothing was announced (already scored, or a mine). */
  number: number | null;
  /** Points this move (number + treasure, or −5). */
  gain: number;
  treasure?: number; // treasure points, when one was found
  /** After a mine: where the player went back to (their pick). */
  respawn?: number;
  /** Mines removed by the explosion (1 or 2 on a double cell); not shown to players before the end. */
  removed?: number;
  /** A mine stepped on while wearing 방폭복 (AI matches only): no −5, no walk back; the player stays on the crater. */
  shielded?: true;
};

export type MoItem = 'probe' | 'recall' | 'suit';
/** One item used (AI matches only). `n` = moves played when it was used (it came before move n + 1). */
export type MoItemUse = { item: MoItem; seat: MoSeat; n: number; cell?: number; number?: number };

export type MoTreasure = { cell: number; by: MoSeat | null; value: number; n: number };

export type MineOblivion = {
  gid: string;
  size: number;
  mines: number;
  first: MoSeat;
  phase: MoPhase;
  turn: MoSeat;
  /** The seat that must pick a respawn cell before the turn passes, or null. */
  respawn: MoSeat | null;
  /** Secret until the end: each player's buried cells. Guests receive [[], []] (src/lib/mineOblivionRoom.ts). */
  buried: [number[], number[]];
  ready: [boolean, boolean];
  pos: [number, number];
  score: [number, number];
  /** Cells someone has scored (public, footprints). */
  scored: number[];
  /** Cells that exploded (public, craters); their mines are gone. */
  craters: number[];
  treasures: MoTreasure[];
  /** Public: how many distinct cells hold a live mine. */
  minedCells: number;
  log: MoStep[];
  ending: MoEnding | null;
  winner: MoSeat | null; // null with an ending = draw
  resigned?: MoSeat;
  /** AI matches only (never set in rooms): items used, oldest first, and whose 방폭복 is on now. */
  items?: MoItemUse[];
  suit?: [boolean, boolean];
};

// ── Geometry ─────────────────────────────────────────────────────────────────────────────────────────────────────
export const rc = (cell: number, size = MO_SIZE) => [Math.floor(cell / size), cell % size] as const;
export const idx = (r: number, c: number, size = MO_SIZE) => r * size + c;
export const dist = (a: number, b: number, size = MO_SIZE) => {
  const [ar, ac] = rc(a, size), [br, bc] = rc(b, size);
  return Math.max(Math.abs(ar - br), Math.abs(ac - bc));
};
const NB_CACHE = new Map<number, number[][]>();
/** The (up to) eight cells around each cell. */
export function neighbours(size = MO_SIZE): number[][] {
  let list = NB_CACHE.get(size);
  if (list) return list;
  list = [];
  for (let cell = 0; cell < size * size; cell += 1) {
    const [r, c] = rc(cell, size);
    const out: number[] = [];
    for (let dr = -1; dr <= 1; dr += 1) for (let dc = -1; dc <= 1; dc += 1) {
      if (!dr && !dc) continue;
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nc >= 0 && nr < size && nc < size) out.push(idx(nr, nc, size));
    }
    list.push(out);
  }
  NB_CACHE.set(size, list);
  return list;
}
export const startOf = (seat: MoSeat, size = MO_SIZE) => (seat === 0 ? idx(size - 1, 0, size) : idx(0, size - 1, size));
export const treasureCells = (size = MO_SIZE) => [idx(0, 0, size), idx(size >> 1, size >> 1, size), idx(size - 1, size - 1, size)];
/** Where a mine may go: not a treasure, not within two cells of either start. */
export function canBury(cell: number, size = MO_SIZE) {
  if (cell < 0 || cell >= size * size) return false;
  if (treasureCells(size).includes(cell)) return false;
  return dist(cell, startOf(0, size), size) > 2 && dist(cell, startOf(1, size), size) > 2;
}
export const buryCells = (size = MO_SIZE) => Array.from({ length: size * size }, (_, i) => i).filter((c) => canBury(c, size));
/** The three cells next to a start (where a player goes back to after a mine). */
export const respawnCells = (seat: MoSeat, size = MO_SIZE) => neighbours(size)[startOf(seat, size)];

export const other = (seat: MoSeat): MoSeat => (seat === 0 ? 1 : 0);

// ── State ────────────────────────────────────────────────────────────────────────────────────────────────────────
export const newGid = () => Math.random().toString(36).slice(2, 10);

export function newMineOblivion(first: MoSeat, gid = newGid(), size = MO_SIZE, mines = MO_MINES): MineOblivion {
  return {
    gid, size, mines, first, phase: 'bury', turn: first, respawn: null,
    buried: [[], []], ready: [false, false],
    pos: [startOf(0, size), startOf(1, size)], score: [0, 0],
    scored: [startOf(0, size), startOf(1, size)], craters: [],
    treasures: treasureCells(size).map((cell) => ({ cell, by: null, value: 0, n: 0 })),
    minedCells: 0, log: [], ending: null, winner: null,
  };
}

/** Whether a list of cells is a legal burial: the right count, distinct, all allowed. */
export function validBurial(cells: unknown, size = MO_SIZE, mines = MO_MINES): cells is number[] {
  if (!Array.isArray(cells) || cells.length !== mines) return false;
  const set = new Set(cells);
  return set.size === mines && cells.every((c) => Number.isInteger(c) && canBury(c, size));
}

/** Live mines (not exploded) at each cell: 0, 1 or 2. Needs the secret `buried`. */
export function mineMap(g: MineOblivion): number[] {
  const map = Array<number>(g.size * g.size).fill(0);
  const gone = new Set(g.craters);
  for (const list of g.buried) for (const c of list) if (!gone.has(c)) map[c] += 1;
  return map;
}
/** The number announced on `cell`: live mines in the eight cells around it. */
export const numberAt = (g: MineOblivion, cell: number, map = mineMap(g)) => neighbours(g.size)[cell].reduce((s, n) => s + map[n], 0);
const distinctMined = (g: MineOblivion) => mineMap(g).filter((v) => v > 0).length;

export function buryMines(g: MineOblivion, seat: MoSeat, cells: number[]): MineOblivion | null {
  if (g.phase !== 'bury' || g.ready[seat] || !validBurial(cells, g.size, g.mines)) return null;
  const buried = (seat === 0 ? [[...cells], g.buried[1]] : [g.buried[0], [...cells]]) as [number[], number[]];
  const ready = (seat === 0 ? [true, g.ready[1]] : [g.ready[0], true]) as [boolean, boolean];
  let next: MineOblivion = { ...g, buried, ready };
  if (ready[0] && ready[1]) next = { ...next, phase: 'walk', turn: g.first, minedCells: distinctMined(next) };
  return next;
}

/** Cells `seat` may move to now. */
export function legalMoves(g: MineOblivion, seat: MoSeat): number[] {
  if (g.phase !== 'walk' || g.turn !== seat || g.respawn !== null) return [];
  const opp = g.pos[other(seat)];
  return neighbours(g.size)[g.pos[seat]].filter((c) => c !== opp);
}
export function respawnOptions(g: MineOblivion, seat: MoSeat): number[] {
  if (g.phase !== 'walk' || g.respawn !== seat) return [];
  const opp = g.pos[other(seat)];
  return respawnCells(seat, g.size).filter((c) => c !== opp);
}

function settle(g: MineOblivion): MineOblivion {
  const found = g.treasures.filter((t) => t.by !== null).length;
  const ending: MoEnding | null = found === g.treasures.length ? 'treasure' : g.log.length >= MO_MOVE_LIMIT ? 'moves' : null;
  if (!ending) return g;
  const winner: MoSeat | null = g.score[0] === g.score[1] ? null : g.score[0] > g.score[1] ? 0 : 1;
  return { ...g, phase: 'finished', ending, winner, respawn: null };
}

/** `seat` moves to `to`. Returns null for an illegal move. */
export function moveTo(g: MineOblivion, seat: MoSeat, to: number): MineOblivion | null {
  if (!legalMoves(g, seat).includes(to)) return null;
  const map = mineMap(g);
  const from = g.pos[seat];
  const pos = [...g.pos] as [number, number];
  pos[seat] = to;
  const score = [...g.score] as [number, number];
  const n = g.log.length + 1;
  if (map[to] > 0 && g.suit?.[seat]) {
    // 방폭복: the mine goes off (crater, one mined cell fewer) but costs nothing and nobody walks back.
    const step: MoStep = { n, seat, from, to, kind: 'mine', number: null, gain: 0, removed: map[to], shielded: true };
    const suit = [...g.suit] as [boolean, boolean];
    suit[seat] = false;
    return settle({ ...g, pos, craters: [...g.craters, to], log: [...g.log, step], suit, turn: other(seat), minedCells: g.minedCells - 1 });
  }
  if (map[to] > 0) {
    score[seat] -= MO_PENALTY;
    const step: MoStep = { n, seat, from, to, kind: 'mine', number: null, gain: -MO_PENALTY, removed: map[to] };
    const craters = [...g.craters, to];
    // The player stands on the crater until they pick where to go back to.
    return { ...g, pos, score, craters, log: [...g.log, step], respawn: seat, minedCells: g.minedCells - 1 };
  }
  const already = g.scored.includes(to);
  const number = already ? null : numberAt(g, to, map);
  const ti = g.treasures.findIndex((t) => t.cell === to && t.by === null);
  let treasures = g.treasures;
  let treasure: number | undefined;
  if (ti >= 0) {
    const order = g.treasures.filter((t) => t.by !== null).length;
    treasure = MO_TREASURE_VALUES[order];
    treasures = g.treasures.map((t, i) => (i === ti ? { ...t, by: seat, value: treasure!, n } : t));
  }
  const gain = (number ?? 0) + (treasure ?? 0);
  score[seat] += gain;
  const step: MoStep = { n, seat, from, to, kind: treasure ? 'treasure' : already ? 'blank' : 'score', number, gain, ...(treasure ? { treasure } : {}) };
  return settle({ ...g, pos, score, treasures, scored: already ? g.scored : [...g.scored, to], log: [...g.log, step], turn: other(seat) });
}

/** After a mine: `seat` goes back to one of the cells next to their start. */
export function respawnAt(g: MineOblivion, seat: MoSeat, to: number): MineOblivion | null {
  if (!respawnOptions(g, seat).includes(to)) return null;
  const pos = [...g.pos] as [number, number];
  pos[seat] = to;
  const log = g.log.map((s, i) => (i === g.log.length - 1 ? { ...s, respawn: to } : s));
  return settle({ ...g, pos, log, respawn: null, turn: other(seat) });
}

export function resign(g: MineOblivion, seat: MoSeat): MineOblivion | null {
  if (g.phase === 'finished') return null;
  return { ...g, phase: 'finished', ending: 'resign', winner: other(seat), resigned: seat, respawn: null };
}

/** A random legal burial (for a timed-out player, the tutorial and tests). */
export function randomBurial(rng: Rng = Math.random, size = MO_SIZE, mines = MO_MINES, keep: number[] = []): number[] {
  const pool = buryCells(size).filter((c) => !keep.includes(c));
  const out = keep.filter((c) => canBury(c, size)).slice(0, mines);
  while (out.length < mines && pool.length) out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  return out;
}

/** Moves made by each seat. */
export const movesBy = (g: MineOblivion, seat: MoSeat) => g.log.filter((s) => s.seat === seat).length;
export const treasuresBy = (g: MineOblivion, seat: MoSeat) => g.treasures.filter((t) => t.by === seat).length;
export const treasuresLeft = (g: MineOblivion) => g.treasures.filter((t) => t.by === null).length;

// ── Replay ───────────────────────────────────────────────────────────────────────────────────────────────────────
export type MoFrame = {
  step: MoStep | null; // the move that led here (null = the start of the walk)
  pos: [number, number];
  score: [number, number];
  scored: number[];
  craters: number[];
  found: (MoSeat | null)[]; // per treasure index
  trail: [number[], number[]]; // each seat's path so far
};

/** Every position of a finished game, from the start of the walk, rebuilt from the public log. */
export function moFrames(g: MineOblivion): MoFrame[] {
  const size = g.size;
  let pos: [number, number] = [startOf(0, size), startOf(1, size)];
  let score: [number, number] = [0, 0];
  let scored = [startOf(0, size), startOf(1, size)];
  let craters: number[] = [];
  let found: (MoSeat | null)[] = g.treasures.map(() => null);
  let trail: [number[], number[]] = [[pos[0]], [pos[1]]];
  const frames: MoFrame[] = [{ step: null, pos, score, scored, craters, found, trail }];
  for (const s of g.log) {
    pos = [...pos] as [number, number];
    score = [...score] as [number, number];
    pos[s.seat] = s.kind === 'mine' ? s.respawn ?? s.to : s.to;
    score[s.seat] += s.gain;
    if (s.kind === 'mine') craters = [...craters, s.to];
    else if (s.number !== null) scored = [...scored, s.to];
    if (s.kind === 'treasure') found = g.treasures.map((t, i) => (t.cell === s.to ? s.seat : found[i]));
    const t2: [number[], number[]] = [[...trail[0]], [...trail[1]]];
    t2[s.seat].push(s.to);
    if (s.kind === 'mine' && s.respawn !== undefined) t2[s.seat].push(s.respawn);
    trail = t2;
    frames.push({ step: s, pos, score, scored, craters, found, trail });
  }
  return frames;
}

// ── Score breakdown (result screen, 복기) ───────────────────────────────────────────────────────────────────────
export type MoBreakdown = {
  /** Treasure points, one entry per treasure found, in the order the game found them (1st +10, 2nd +15, 3rd +20). */
  treasures: { value: number; order: number }[];
  treasure: number;
  /** Mines that cost points (−5 each); mines a 방폭복 took are counted apart and cost nothing. */
  mines: number;
  minePoints: number;
  shielded: number;
  /** Numbers scored on cells (treasure cells included: their first visitor scores the number too). */
  numbers: number;
  /** Cells that scored a number. */
  numberCells: number;
  total: number;
};

/** Where a seat's score came from, rebuilt from the step log: always adds up to the score (scripts/mine-oblivion/check.ts). */
export function moBreakdown(g: MineOblivion, seat: MoSeat, upTo = g.log.length): MoBreakdown {
  const out: MoBreakdown = { treasures: [], treasure: 0, mines: 0, minePoints: 0, shielded: 0, numbers: 0, numberCells: 0, total: 0 };
  let found = 0;
  for (const s of g.log.slice(0, upTo)) {
    if (s.kind === 'treasure') found += 1;
    if (s.seat !== seat) continue;
    if (s.kind === 'mine') { if (s.shielded) out.shielded += 1; else { out.mines += 1; out.minePoints += s.gain; } continue; }
    if (s.number !== null) { out.numbers += s.number; out.numberCells += 1; }
    if (s.kind === 'treasure' && s.treasure) { out.treasures.push({ value: s.treasure, order: found }); out.treasure += s.treasure; }
  }
  out.total = out.treasure + out.minePoints + out.numbers;
  return out;
}

export type MoBreakdownLine = 'treasure' | 'mines' | 'numbers';
/** The line that decided the game: the biggest gap between the two seats (ties go numbers → treasure → mines). */
export function decidingLine(a: MoBreakdown, b: MoBreakdown): MoBreakdownLine {
  const gaps: [MoBreakdownLine, number][] = [['numbers', a.numbers - b.numbers], ['treasure', a.treasure - b.treasure], ['mines', a.minePoints - b.minePoints]];
  return gaps.reduce((best, x) => (Math.abs(x[1]) > Math.abs(best[1]) ? x : best))[0];
}

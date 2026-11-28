// 뒤집기 오목, rule variants (research + the `?rules=next` prototype). The live game is `flipOmok.ts` and is not
// touched by anything here: this module only reuses its board types.
//
// A variant says when stones flip:
// - 'auto'   : every move flips every sandwich it closes (the live rule);
// - 'charge' : a move flips only if its player spends one of their limited 뒤집기 charges (else it is placed quietly);
// - 'free'   : the player may flip (one line at most, when `oneLine`) on any move, unlimited.
// plus modifiers: one line only, flipped stones locked, a cap on run length, a separate "flip instead of placing"
// action, whether a five completed by a flip counts, and a "last chance" reply that may break a five with a flip.
import { SIZE, other, owner, type Board, type Cell, type Line, type Player } from './flipOmok';

export interface FlipRules {
  id: string;
  mode: 'auto' | 'charge' | 'free';
  charges: number; // starting charges per player ('charge' mode)
  earnEvery: number; // +1 charge per this many own stones placed (0: none)
  maxCharges: number;
  oneLine: boolean; // a flip turns one chosen line, not every sandwich
  lock: 'none' | 'permanent'; // flipped stones can never be flipped again
  maxRun: number; // longest run a flip can turn
  postFlip: boolean; // spend a charge to flip a sandwiched run on the board instead of placing
  placeFlip: boolean; // a placement can flip at all
  flipFive: boolean; // a five that uses stones flipped by this very move counts (live: it doesn't)
  lastChance: boolean; // a five may be answered once by a flip that breaks it
}

const BASE: FlipRules = { id: 'live', mode: 'auto', charges: 0, earnEvery: 0, maxCharges: 0, oneLine: false, lock: 'none', maxRun: 99, postFlip: false, placeFlip: true, flipFive: false, lastChance: false };

/** The rule sets studied in reports/flip-omok-rules. `next` is the recommended one the prototype plays. */
export const RULESETS: Record<string, FlipRules> = {
  live: BASE,
  c2: { ...BASE, id: 'c2', mode: 'charge', charges: 2 },
  c3: { ...BASE, id: 'c3', mode: 'charge', charges: 3 },
  c5: { ...BASE, id: 'c5', mode: 'charge', charges: 5 },
  c3lock: { ...BASE, id: 'c3lock', mode: 'charge', charges: 3, lock: 'permanent' },
  c3lockfive: { ...BASE, id: 'c3lockfive', mode: 'charge', charges: 3, lock: 'permanent', flipFive: true },
  c3last: { ...BASE, id: 'c3last', mode: 'charge', charges: 3, lock: 'permanent', lastChance: true },
  c3fivelast: { ...BASE, id: 'c3fivelast', mode: 'charge', charges: 3, lock: 'permanent', flipFive: true, lastChance: true },
  c2lockfive: { ...BASE, id: 'c2lockfive', mode: 'charge', charges: 2, lock: 'permanent', flipFive: true },
  earn: { ...BASE, id: 'earn', mode: 'charge', charges: 1, earnEvery: 6, maxCharges: 3, lock: 'permanent' },
  line: { ...BASE, id: 'line', mode: 'free', oneLine: true },
  lock: { ...BASE, id: 'lock', lock: 'permanent' },
  short: { ...BASE, id: 'short', maxRun: 2 },
  post: { ...BASE, id: 'post', mode: 'charge', charges: 3, placeFlip: false, postFlip: true, lock: 'permanent' },
  c3line: { ...BASE, id: 'c3line', mode: 'charge', charges: 3, oneLine: true, lock: 'permanent' },
};
/** The recommended rule set ("전략적 뒤집기"). */
export const NEXT_RULES: FlipRules = { ...RULESETS.c3lock, id: 'next' };

export interface NState {
  board: Board;
  locked: Uint8Array; // 1: this stone can never flip again
  charges: [number, number, number]; // by player (index 0 unused)
  placed: [number, number, number];
  turn: Player;
  ply: number;
  threat: Line | null; // a five the player to move must break with a flip (last chance), else it wins
}

export interface NAction { at: number; flips: number[]; spend: boolean; post: boolean }
export interface NResult { state: NState; win: Line | null; brokeThreat: boolean }

const idx = (r: number, c: number) => r * SIZE + c;
const inside = (r: number, c: number) => r >= 0 && r < SIZE && c >= 0 && c < SIZE;
const ALL_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1], [0, -1], [-1, 0], [-1, -1], [-1, 1]] as const;
const LINE_DIRS = ALL_DIRS.slice(0, 4);

export function newState(rules: FlipRules): NState {
  const n = rules.mode === 'charge' ? rules.charges : 0;
  return { board: Array<Cell>(SIZE * SIZE).fill(0), locked: new Uint8Array(SIZE * SIZE), charges: [0, n, n], placed: [0, 0, 0], turn: 1, ply: 0, threat: null };
}

/** The runs (one per direction) a stone of `p` at `at` would sandwich, under the rules' length and lock limits. */
export function runsFor(rules: FlipRules, s: NState, at: number, p: Player): number[][] {
  const r0 = Math.floor(at / SIZE), c0 = at % SIZE, foe = other(p), out: number[][] = [];
  for (const [dr, dc] of ALL_DIRS) {
    const run: number[] = [];
    let r = r0 + dr, c = c0 + dc, ok = true;
    while (inside(r, c) && owner(s.board[idx(r, c)]) === foe) { const i = idx(r, c); if (s.locked[i]) ok = false; run.push(i); r += dr; c += dc; }
    if (ok && run.length && run.length <= rules.maxRun && inside(r, c) && owner(s.board[idx(r, c)]) === p) out.push(run);
  }
  return out;
}

/** Runs of the opponent already sandwiched between two of `p`'s stones (for the separate flip action). */
function boardRuns(rules: FlipRules, s: NState, p: Player): number[][] {
  const foe = other(p), out: number[][] = [];
  for (let a = 0; a < SIZE * SIZE; a++) {
    if (owner(s.board[a]) !== p) continue;
    const r0 = Math.floor(a / SIZE), c0 = a % SIZE;
    for (const [dr, dc] of LINE_DIRS) {
      const run: number[] = [];
      let r = r0 + dr, c = c0 + dc, ok = true;
      while (inside(r, c) && owner(s.board[idx(r, c)]) === foe) { const i = idx(r, c); if (s.locked[i]) ok = false; run.push(i); r += dr; c += dc; }
      if (ok && run.length && run.length <= rules.maxRun && inside(r, c) && owner(s.board[idx(r, c)]) === p) out.push(run);
    }
  }
  return out;
}

/** Every way to play at `at`: quiet, flipping (all lines, or each line), as the rules allow. */
export function actionsAt(rules: FlipRules, s: NState, at: number, p: Player = s.turn): NAction[] {
  if (s.board[at]) return [];
  const quiet: NAction = { at, flips: [], spend: false, post: false };
  if (!rules.placeFlip) return [quiet];
  const runs = runsFor(rules, s, at, p);
  if (!runs.length) return [quiet];
  if (rules.mode === 'auto') return rules.oneLine ? runs.map((run) => ({ at, flips: run, spend: false, post: false })) : [{ at, flips: runs.flat(), spend: false, post: false }];
  const spend = rules.mode === 'charge';
  if (spend && s.charges[p] <= 0) return [quiet];
  const flipping = rules.oneLine ? runs.map((run) => ({ at, flips: run, spend, post: false })) : [{ at, flips: runs.flat(), spend, post: false }];
  return [quiet, ...flipping];
}

export function postActions(rules: FlipRules, s: NState, p: Player = s.turn): NAction[] {
  if (!rules.postFlip || s.charges[p] <= 0) return [];
  return boardRuns(rules, s, p).map((run) => ({ at: -1, flips: run, spend: true, post: true }));
}

function runLen(board: Board, at: number, p: Player, dr: number, dc: number) {
  const r0 = Math.floor(at / SIZE), c0 = at % SIZE;
  let s = 0, e = 0;
  while (inside(r0 - dr * (s + 1), c0 - dc * (s + 1)) && owner(board[idx(r0 - dr * (s + 1), c0 - dc * (s + 1))]) === p) s++;
  while (inside(r0 + dr * (e + 1), c0 + dc * (e + 1)) && owner(board[idx(r0 + dr * (e + 1), c0 + dc * (e + 1))]) === p) e++;
  return { len: s + e + 1, start: idx(r0 - dr * s, c0 - dc * s), end: idx(r0 + dr * e, c0 + dc * e) };
}

/** An exact five of `p` through `at`, optionally with none of `fresh` in it. */
function fiveThrough(board: Board, at: number, p: Player, fresh: ReadonlySet<number> | null): Line | null {
  for (const [dr, dc] of LINE_DIRS) {
    const run = runLen(board, at, p, dr, dc);
    if (run.len !== 5) continue;
    let clean = true;
    if (fresh) for (let k = 0, i = run.start; k < 5; k++, i += dr * SIZE + dc) if (fresh.has(i)) { clean = false; break; }
    if (clean) return { start: run.start, end: run.end, owner: p };
  }
  return null;
}

export function lineCells(line: Line): number[] {
  const r0 = Math.floor(line.start / SIZE), c0 = line.start % SIZE, r1 = Math.floor(line.end / SIZE), c1 = line.end % SIZE;
  const dr = Math.sign(r1 - r0), dc = Math.sign(c1 - c0), n = Math.max(Math.abs(r1 - r0), Math.abs(c1 - c0));
  return Array.from({ length: n + 1 }, (_, i) => (r0 + dr * i) * SIZE + c0 + dc * i);
}

/** The five `act` makes for the mover (before the last-chance question), or null. */
function fiveMade(rules: FlipRules, board: Board, act: NAction, p: Player): Line | null {
  const fresh = rules.flipFive ? null : new Set(act.flips);
  if (!act.post) { const f = fiveThrough(board, act.at, p, fresh); if (f) return f; }
  if (rules.flipFive) for (const f of act.flips) { const l = fiveThrough(board, f, p, null); if (l) return l; }
  return null;
}

/** Whether a five `line` of its owner still stands on `board`. */
function stillFive(board: Board, line: Line) {
  const cells = lineCells(line);
  if (!cells.every((i) => owner(board[i]) === line.owner)) return false;
  return fiveThrough(board, cells[0], line.owner, null) !== null;
}

/** Apply an action (no legality check beyond the board itself). */
export function apply(rules: FlipRules, s: NState, act: NAction): NResult {
  const p = s.turn;
  const board = s.board.slice();
  const locked = rules.lock === 'none' ? s.locked : s.locked.slice();
  const charges = [...s.charges] as NState['charges'];
  const placed = [...s.placed] as NState['placed'];
  if (!act.post) { board[act.at] = p; placed[p]++; }
  for (const f of act.flips) { board[f] = (p === 1 ? 3 : 4); if (rules.lock === 'permanent') locked[f] = 1; }
  if (act.spend) charges[p]--;
  if (rules.earnEvery && !act.post && placed[p] % rules.earnEvery === 0) charges[p] = Math.min(rules.maxCharges, charges[p] + 1);
  let brokeThreat = false;
  const next: NState = { board, locked, charges, placed, turn: other(p), ply: s.ply + 1, threat: null };
  if (s.threat) {
    if (stillFive(board, s.threat)) return { state: next, win: s.threat, brokeThreat: false };
    brokeThreat = true;
  }
  const five = fiveMade(rules, board, act, p);
  if (five) {
    if (rules.lastChance && canBreak(rules, next, five)) return { state: { ...next, threat: five }, win: null, brokeThreat };
    return { state: next, win: five, brokeThreat };
  }
  return { state: next, win: null, brokeThreat };
}

/** Whether the player to move in `s` has a flip that turns a stone of `five`. */
function canBreak(rules: FlipRules, s: NState, five: Line): boolean {
  return breakingActions(rules, s, five).length > 0;
}

function breakingActions(rules: FlipRules, s: NState, five: Line): NAction[] {
  const cells = new Set(lineCells(five));
  const out: NAction[] = [];
  for (const m of candidates(s.board)) for (const a of actionsAt(rules, s, m)) if (a.flips.some((f) => cells.has(f))) out.push(a);
  for (const a of postActions(rules, s)) if (a.flips.some((f) => cells.has(f))) out.push(a);
  return out;
}

// ---- 쌍삼 (judged through the placed stone, after the action's flips) ----

function makesOpenFour(b: Board, e: number, p: Player, dr: number, dc: number) {
  const prev = b[e];
  b[e] = p;
  const run = runLen(b, e, p, dr, dc);
  let ok = false;
  if (run.len === 4) {
    const br = Math.floor(run.start / SIZE) - dr, bc = (run.start % SIZE) - dc;
    const ar = Math.floor(run.end / SIZE) + dr, ac = (run.end % SIZE) + dc;
    if (inside(br, bc) && inside(ar, ac) && !b[idx(br, bc)] && !b[idx(ar, ac)]) {
      const six1 = inside(br - dr, bc - dc) && owner(b[idx(br - dr, bc - dc)]) === p;
      const six2 = inside(ar + dr, ac + dc) && owner(b[idx(ar + dr, ac + dc)]) === p;
      ok = !(six1 && six2);
    }
  }
  b[e] = prev;
  return ok;
}

function openThreeAt(b: Board, at: number, p: Player, dr: number, dc: number) {
  const r0 = Math.floor(at / SIZE), c0 = at % SIZE;
  for (let k = -4; k <= 4; k++) {
    if (!k) continue;
    const r = r0 + dr * k, c = c0 + dc * k;
    if (!inside(r, c) || b[idx(r, c)]) continue;
    const e = idx(r, c);
    if (makesOpenFour(b, e, p, dr, dc)) {
      b[e] = p;
      const run = runLen(b, at, p, dr, dc);
      b[e] = 0;
      if (run.len === 4) return true;
    }
  }
  return false;
}

/** Open threes of `p` the stone at `at` takes part in, on `board` (for the 쌍삼 rule and the stats). */
export function openThreeDirs(board: Board, at: number, p: Player): number {
  const b = board.slice();
  let n = 0;
  for (const [dr, dc] of LINE_DIRS) if (openThreeAt(b, at, p, dr, dc)) n++;
  return n;
}

/** Whether `act` breaks the 쌍삼 rule (a move that makes five is always allowed; the flip action never is checked). */
export function isForbiddenAction(rules: FlipRules, s: NState, act: NAction): boolean {
  if (act.post) return false;
  if (s.board[act.at]) return true;
  const res = apply(rules, s, act);
  if (res.win || res.state.threat) return false;
  const b = res.state.board;
  let threes = 0;
  for (const [dr, dc] of LINE_DIRS) if (openThreeAt(b, act.at, s.turn, dr, dc) && ++threes >= 2) return true;
  return false;
}

export const isFullBoard = (board: Board) => board.every((c) => c !== 0);

/** Every legal action for the player to move. While a last-chance threat stands, only actions that break it. */
export function legalActions(rules: FlipRules, s: NState): NAction[] {
  if (s.threat) {
    const br = breakingActions(rules, s, s.threat).filter((a) => !isForbiddenAction(rules, s, a));
    if (br.length) return br;
  }
  const out: NAction[] = [];
  for (const m of candidates(s.board)) for (const a of actionsAt(rules, s, m)) if (!isForbiddenAction(rules, s, a)) out.push(a);
  out.push(...postActions(rules, s));
  if (!out.length) { const i = s.board.findIndex((v) => !v); if (i >= 0) out.push({ at: i, flips: [], spend: false, post: false }); }
  return out;
}

// ---- AI ----

const WINDOWS: number[][] = [];
for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) for (const [dr, dc] of LINE_DIRS) {
  if (!inside(r + dr * 4, c + dc * 4)) continue;
  WINDOWS.push([0, 1, 2, 3, 4].map((k) => idx(r + dr * k, c + dc * k)));
}
const WINDOW_SCORE = [0, 1, 12, 120, 2600, 1_000_000];
const SYM_SCORE = [0, 2, 24, 260, 6000, 6000]; // a five window counts as a four here (fives that do not win would swamp the stats)

/** The AI's position value for `p` (same as the live AI). */
function windowsValue(board: Board, p: Player, deadFive = false): number {
  let score = 0;
  for (const w of WINDOWS) {
    let mine = 0, theirs = 0;
    for (const i of w) { const o = owner(board[i]); if (o === p) mine++; else if (o) theirs++; }
    if (mine && !theirs) score += deadFive && mine === 5 ? 0 : WINDOW_SCORE[mine];
    else if (theirs && !mine) score -= deadFive && theirs === 5 ? 0 : WINDOW_SCORE[theirs] * 1.15;
  }
  return score;
}

/** Neutral value from red's side (for the stats: swings and who is ahead). */
export function neutralValue(board: Board): number {
  let v = 0;
  for (const w of WINDOWS) {
    let red = 0, blue = 0;
    for (const i of w) { const o = owner(board[i]); if (o === 1) red++; else if (o === 2) blue++; }
    if (red && !blue) v += SYM_SCORE[red]; else if (blue && !red) v -= SYM_SCORE[blue];
  }
  return v;
}

/** What one unused charge is worth to the AI, in window points. */
export let CHARGE_VALUE = 420;
export function setChargeValue(v: number) { CHARGE_VALUE = v; }

// A five on the board that did not win (it needed this move's flips) is dead: the live AI still prizes it, which made
// it chase such fives; the variants' AI doesn't (only the `live` set keeps the old habit, to check it against the live AI).
let deadFives = true;
function stateValue(s: NState, p: Player): number {
  return windowsValue(s.board, p, deadFives) + CHARGE_VALUE * (s.charges[p] - s.charges[other(p)]);
}

export function candidates(board: Board): number[] {
  const out = new Set<number>();
  board.forEach((v, i) => {
    if (!v) return;
    const r = Math.floor(i / SIZE), c = i % SIZE;
    for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) {
      if (inside(r + dr, c + dc) && !board[idx(r + dr, c + dc)]) out.add(idx(r + dr, c + dc));
    }
  });
  return out.size ? [...out] : [idx(7, 7)];
}

/** Whether `p` (to move in `s`) has an action that wins at once (a five, even one a last chance could answer). */
function winningAction(rules: FlipRules, s: NState): NAction | null {
  const p = s.turn;
  for (const m of candidates(s.board)) for (const a of actionsAt(rules, s, m, p)) {
    const res = apply(rules, s, a);
    if (res.win?.owner === p || res.state.threat) return a;
  }
  for (const a of postActions(rules, s, p)) { const res = apply(rules, s, a); if (res.win?.owner === p || res.state.threat) return a; }
  return null;
}

/** The state with the other player to move (to ask what they could do here). */
const passTo = (s: NState, p: Player): NState => (s.turn === p ? s : { ...s, turn: p, threat: null });

function foeWins(rules: FlipRules, s: NState): boolean { return winningAction(rules, s) !== null; }

/** Whether `p` can make two winning points at once (an open four or a double four). */
function hasOpenFourMove(rules: FlipRules, s0: NState, p: Player): boolean {
  const s = passTo(s0, p);
  for (const m of candidates(s.board)) for (const a of actionsAt(rules, s, m, p)) {
    if (isForbiddenAction(rules, s, a)) continue;
    const next = apply(rules, s, a).state.board;
    let wins = 0;
    for (const r of candidates(next)) {
      const prev = next[r]; next[r] = p;
      const f = fiveThrough(next, r, p, null);
      next[r] = prev;
      if (f && ++wins >= 2) return true;
    }
  }
  return false;
}

export type NextLevel = 'normal' | 'hard';
interface Scored { a: NAction; res: NResult; score: number }

const flipBonus = (rules: FlipRules, a: NAction) => (rules.mode === 'auto' ? a.flips.length * 40 : 0);

function score(rules: FlipRules, s: NState, a: NAction, noise: number): Scored {
  const res = apply(rules, s, a);
  return { a, res, score: stateValue(res.state, s.turn) + flipBonus(rules, a) + Math.random() * noise };
}

/** 보통: its own move only, loose judgement (as the live 보통), now also weighing the cost of a charge. */
function casual(rules: FlipRules, s: NState, acts: NAction[]): NAction {
  const me = s.turn, foe = other(me);
  const foeState = passTo(s, foe);
  const threat = winningAction(rules, foeState);
  if (threat && !threat.post) {
    const block = acts.filter((a) => a.at === threat.at).map((a) => score(rules, s, a, 0)).sort((x, y) => y.score - x.score);
    for (const b of block) if (!foeWins(rules, b.res.state)) return b.a;
  }
  const ranked = acts.map((a) => score(rules, s, a, 350)).sort((x, y) => y.score - x.score);
  const careful = Math.random() < 0.9;
  const lookAt = threat ? ranked : ranked.slice(0, 10); // a standing threat: look for any answer (a flip may break it)
  for (const r of lookAt) if (!careful || !foeWins(rules, r.res.state)) return r.a;
  return ranked[0].a;
}

/** 어려움: its move and the opponent's best-looking reply (as the live 어려움), charges counted on both sides. */
function reader(rules: FlipRules, s: NState, acts: NAction[]): NAction {
  const me = s.turn, foe = other(me);
  if (hasOpenFourMove(rules, s, foe)) {
    const safe = acts.map((a) => score(rules, s, a, 60))
      .filter((x) => !foeWins(rules, x.res.state) && !hasOpenFourMove(rules, x.res.state, foe))
      .sort((x, y) => y.score - x.score);
    if (safe.length) return safe[0].a;
  }
  const ranked = acts.map((a) => score(rules, s, a, 60)).sort((x, y) => y.score - x.score);
  let best = ranked[0].a, bestScore = -Infinity, checked = 0;
  for (const { a, res } of ranked) {
    if (checked >= 8 && bestScore > -Infinity) break;
    checked++;
    if (foeWins(rules, res.state)) continue;
    let worst = Infinity;
    const after = res.state;
    for (const r of candidates(after.board)) for (const ra of actionsAt(rules, after, r, foe)) {
      const reply = apply(rules, after, ra);
      const v = stateValue(reply.state, me) - flipBonus(rules, ra);
      if (v < worst) worst = v;
    }
    for (const ra of postActions(rules, after, foe)) { const v = stateValue(apply(rules, after, ra).state, me); if (v < worst) worst = v; }
    if (worst > bestScore) { bestScore = worst; best = a; }
  }
  return best;
}

export function chooseAction(rules: FlipRules, s: NState, level: NextLevel = 'normal'): NAction {
  deadFives = rules.id !== 'live';
  const acts = legalActions(rules, s);
  if (s.threat) return acts.map((a) => score(rules, s, a, 0)).sort((x, y) => y.score - x.score)[0].a;
  for (const a of acts) { const res = apply(rules, s, a); if (res.win?.owner === s.turn) return a; }
  // A five the opponent can still answer is the next best thing.
  const pending = acts.find((a) => apply(rules, s, a).state.threat);
  if (pending && level === 'normal') return pending;
  return level === 'hard' ? reader(rules, s, acts) : casual(rules, s, acts);
}

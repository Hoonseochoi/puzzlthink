// AI vs AI for 뒤집기 오목 rule variants:
//   npx tsx scripts/flip-omok/sim.ts <rules> <red> <blue> <games> [seed=20261128] [workers=6]
// <rules>: an id from RULESETS in src/lib/flipOmokNext.ts, or `liveai` (the live engine and the live AI, untouched).
// <red>/<blue>: normal | hard. Game g uses seed+g, so a run is repeatable. Prints one JSON summary line.
// CHARGE_VALUE=<n> sets what the AI thinks an unused charge is worth (default 420).
import { fork } from 'node:child_process';
import { chooseMove, play as livePlay, type Board, type Player } from '../../src/lib/flipOmok';
import {
  RULESETS, apply, chooseAction, isFullBoard, legalActions, lineCells, neutralValue, newState, openThreeDirs, setChargeValue,
  type FlipRules, type NAction, type NState, type NextLevel,
} from '../../src/lib/flipOmokNext';

const SIZE = 15;
const own = (v: number) => (v === 0 ? 0 : v === 1 || v === 3 ? 1 : 2);

function mulberry32(a: number) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** Whether the stone at `i` is part of a four of `p` (four in a five-window whose fifth point is empty). */
function inFour(board: Board, i: number, p: Player): boolean {
  const r0 = Math.floor(i / SIZE), c0 = i % SIZE;
  for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    for (let s = -4; s <= 0; s++) {
      let mine = 0, empty = 0, ok = true;
      for (let k = 0; k < 5; k++) {
        const r = r0 + dr * (s + k), c = c0 + dc * (s + k);
        if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) { ok = false; break; }
        const o = own(board[r * SIZE + c]);
        if (o === p) mine++; else if (o === 0) empty++; else { ok = false; break; }
      }
      if (ok && mine === 4 && empty === 1) return true;
    }
  }
  return false;
}

export interface GameStat {
  plies: number; winner: 0 | 1 | 2; flipMoves: number; flipped: number; placed: number;
  changes: number[]; // per stone on the final board: how many times it changed colour
  everFlipped: number; // distinct points flipped at least once
  stonesEnd: number;
  fourBroken: number; threeBroken: number; // moves whose flips broke an enemy four / open three
  winUsesFlipped: boolean; winByFlipMove: boolean; voidFives: number;
  chargesLeft: [number, number] | null; spent: [number, number];
  swings: number[]; quietGains: number[]; // mover-side value change from the flip itself; and from quiet moves
  flipLast3: boolean; winnerFlipLast3: boolean;
  lead15: number; // neutral value from red's side after 15 plies
  leadMid: number; // red-side value averaged over plies 12–18, fours counted as threes (steadier than one ply)
  lastChances: number; lastChanceSaved: number;
}

function playGame(rulesId: string, levels: [NextLevel, NextLevel], seed: number): GameStat {
  Math.random = mulberry32(seed);
  const live = rulesId === 'liveai';
  const rules: FlipRules = live ? RULESETS.live : RULESETS[rulesId];
  let s: NState = newState(rules);
  const changes = new Array(SIZE * SIZE).fill(0), ever = new Set<number>();
  const flipPlies: { ply: number; p: Player }[] = [];
  const st: GameStat = {
    plies: 0, winner: 0, flipMoves: 0, flipped: 0, placed: 0, changes: [], everFlipped: 0, stonesEnd: 0, fourBroken: 0, threeBroken: 0,
    winUsesFlipped: false, winByFlipMove: false, voidFives: 0, chargesLeft: null, spent: [0, 0], swings: [], quietGains: [], flipLast3: false, winnerFlipLast3: false, lead15: 0, leadMid: 0,
    lastChances: 0, lastChanceSaved: 0,
  };
  for (;;) {
    const p = s.turn, foe = (3 - p) as Player;
    let act: NAction;
    if (live) {
      const at = chooseMove(s.board, p, levels[p - 1]);
      act = { at, flips: livePlay(s.board, at, p).flipped, spend: false, post: false };
    } else act = chooseAction(rules, s, levels[p - 1]);
    // Stats before the move.
    if (act.flips.length) {
      if (act.flips.some((f) => inFour(s.board, f, foe))) st.fourBroken++;
      else if (act.flips.some((f) => openThreeDirs(s.board, f, foe) > 0)) st.threeBroken++;
      const quiet = act.post ? s.board : (() => { const b = s.board.slice(); b[act.at] = p; return b; })();
      const sign = p === 1 ? 1 : -1;
      const after = quiet.slice(); for (const f of act.flips) after[f] = p === 1 ? 3 : 4;
      st.swings.push(sign * (neutralValue(after) - neutralValue(quiet)));
      st.flipMoves++; st.flipped += act.flips.length; flipPlies.push({ ply: s.ply + 1, p });
      for (const f of act.flips) { changes[f]++; ever.add(f); }
      if (act.spend) st.spent[p - 1]++;
    } else if (st.quietGains.length < 60) {
      const b = s.board.slice(); b[act.at] = p;
      st.quietGains.push((p === 1 ? 1 : -1) * (neutralValue(b) - neutralValue(s.board)));
    }
    if (!act.post) st.placed++;
    const hadThreat = !!s.threat;
    const res = apply(rules, s, act);
    if (hadThreat && res.brokeThreat) st.lastChanceSaved++;
    if (res.state.threat) st.lastChances++;
    // The live rule: a five made only thanks to this move's flips doesn't count.
    if (!res.win && act.flips.length && !act.post) {
      const b = res.state.board, lines = [[0, 1], [1, 0], [1, 1], [1, -1]];
      for (const [dr, dc] of lines) {
        let n = 1; const r0 = Math.floor(act.at / SIZE), c0 = act.at % SIZE;
        for (let k = 1; k < 6; k++) { const r = r0 + dr * k, c = c0 + dc * k; if (r < 0 || r >= SIZE || c < 0 || c >= SIZE || own(b[r * SIZE + c]) !== p) break; n++; }
        for (let k = 1; k < 6; k++) { const r = r0 - dr * k, c = c0 - dc * k; if (r < 0 || r >= SIZE || c < 0 || c >= SIZE || own(b[r * SIZE + c]) !== p) break; n++; }
        if (n === 5) { st.voidFives++; break; }
      }
    }
    s = res.state;
    st.plies = s.ply;
    if (s.ply === 15) st.lead15 = neutralValue(s.board);
    if (s.ply >= 12 && s.ply <= 18) st.leadMid += calmValue(s.board) / 7;
    if (res.win) {
      st.winner = res.win.owner;
      const cells = lineCells(res.win), flippedMark = res.win.owner === 1 ? 3 : 4;
      st.winUsesFlipped = cells.some((i) => s.board[i] === flippedMark);
      st.winByFlipMove = act.flips.some((f) => cells.includes(f));
      break;
    }
    if (isFullBoard(s.board) || s.ply >= 225 || !legalActions(rules, s).length) break;
  }
  st.changes = s.board.map((v, i) => (v ? changes[i] : -1)).filter((x) => x >= 0);
  st.everFlipped = ever.size;
  st.stonesEnd = s.board.filter((v) => v).length;
  if (rules.mode === 'charge') st.chargesLeft = [s.charges[1], s.charges[2]];
  const lastFlips = flipPlies.filter((f) => f.ply > st.plies - 3);
  st.flipLast3 = lastFlips.length > 0;
  st.winnerFlipLast3 = st.winner !== 0 && lastFlips.some((f) => f.p === st.winner);
  return st;
}

/** Red-side window value with fours and fives counted as threes, so one tactical shot doesn't decide who is "ahead". */
const CALM = [0, 2, 24, 260, 260, 260];
function calmValue(board: Board): number {
  let v = 0;
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    if (r + dr * 4 >= SIZE || c + dc * 4 < 0 || c + dc * 4 >= SIZE) continue;
    let red = 0, blue = 0;
    for (let k = 0; k < 5; k++) { const o = own(board[(r + dr * k) * SIZE + c + dc * k]); if (o === 1) red++; else if (o === 2) blue++; }
    if (red && !blue) v += CALM[red]; else if (blue && !red) v -= CALM[blue];
  }
  return v;
}

const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const pct = (a: number[], q: number) => { if (!a.length) return 0; const b = [...a].sort((x, y) => x - y); return b[Math.min(b.length - 1, Math.floor(q * b.length))]; };

export function summarize(rulesId: string, red: string, blue: string, games: GameStat[]) {
  const n = games.length, decisive = games.filter((g) => g.winner);
  const allChanges = games.flatMap((g) => g.changes);
  const boardShare = games.map((g) => g.everFlipped / Math.max(1, g.stonesEnd));
  const swings = games.flatMap((g) => g.swings), quiet = games.flatMap((g) => g.quietGains);
  const led = decisive.filter((g) => Math.abs(g.lead15) >= 200);
  const comebacks = led.filter((g) => (g.lead15 > 0 ? 2 : 1) === g.winner).length;
  const ledMid = decisive.filter((g) => g.plies >= 19 && Math.abs(g.leadMid) >= 150);
  const comebacksMid = ledMid.filter((g) => (g.leadMid > 0 ? 2 : 1) === g.winner).length;
  const charged = games.filter((g) => g.chargesLeft);
  const r = (x: number, d = 2) => Number(x.toFixed(d));
  return {
    rules: rulesId, red, blue, games: n,
    plies: r(mean(games.map((g) => g.plies)), 1), pliesP90: pct(games.map((g) => g.plies), 0.9),
    redWin: r(games.filter((g) => g.winner === 1).length / n, 3), blueWin: r(games.filter((g) => g.winner === 2).length / n, 3), draw: r(games.filter((g) => !g.winner).length / n, 3),
    flipsPerMove: r(mean(games.map((g) => g.flipped / Math.max(1, g.plies)))), flipMovesPerGame: r(mean(games.map((g) => g.flipMoves))), flipsPerGame: r(mean(games.map((g) => g.flipped)), 1),
    changesPerStone: r(mean(allChanges), 3), stonesChanged2plus: r(allChanges.filter((c) => c >= 2).length / Math.max(1, allChanges.length), 4), maxChanges: Math.max(0, ...allChanges),
    boardFlippedShareMean: r(mean(boardShare), 3), boardFlippedShareP95: r(pct(boardShare, 0.95), 3), boardFlippedShareMax: r(Math.max(0, ...boardShare), 3),
    fourBrokenPerGame: r(mean(games.map((g) => g.fourBroken))), threeBrokenPerGame: r(mean(games.map((g) => g.threeBroken))),
    gamesWithFourBroken: r(games.filter((g) => g.fourBroken).length / n, 3),
    winUsesFlipped: r(decisive.filter((g) => g.winUsesFlipped).length / Math.max(1, decisive.length), 3),
    winByFlipMove: r(decisive.filter((g) => g.winByFlipMove).length / Math.max(1, decisive.length), 3),
    voidFivesPerGame: r(mean(games.map((g) => g.voidFives)), 3),
    unusedChargesShare: charged.length ? r(charged.flatMap((g) => g.chargesLeft!).filter((c) => c > 0).length / (charged.length * 2), 3) : null,
    chargesLeftMean: charged.length ? r(mean(charged.flatMap((g) => g.chargesLeft!))) : null,
    swingMean: r(mean(swings), 0), swingMedian: pct(swings, 0.5), quietGainMean: r(mean(quiet), 0),
    flipInLast3: r(decisive.filter((g) => g.flipLast3).length / Math.max(1, decisive.length), 3),
    winnerFlipInLast3: r(decisive.filter((g) => g.winnerFlipLast3).length / Math.max(1, decisive.length), 3),
    comeback: r(comebacks / Math.max(1, led.length), 3), comebackBase: led.length,
    comebackMid: r(comebacksMid / Math.max(1, ledMid.length), 3), comebackMidBase: ledMid.length,
    lastChancesPerGame: r(mean(games.map((g) => g.lastChances)), 3), lastChanceSavedPerGame: r(mean(games.map((g) => g.lastChanceSaved)), 3),
  };
}

// ---- entry: a parent forks workers, each plays a slice of the seeds and sends back its games ----
const [rulesId = 'liveai', red = 'normal', blue = 'normal', gamesArg = '200', seedArg = '20261128', workersArg = '6'] = process.argv.slice(2);
if (process.env.CHARGE_VALUE) setChargeValue(Number(process.env.CHARGE_VALUE));
if (!(rulesId === 'liveai' || RULESETS[rulesId])) throw new Error(`unknown rules ${rulesId}`);
const total = Number(gamesArg), seed = Number(seedArg);
if (process.env.FLIP_SIM_SLICE) {
  const [k, of] = process.env.FLIP_SIM_SLICE.split('/').map(Number);
  const out: GameStat[] = [];
  for (let g = k; g < total; g += of) out.push(playGame(rulesId, [red as NextLevel, blue as NextLevel], seed + g));
  process.send!(out);
} else {
  const workers = Math.max(1, Math.min(Number(workersArg), total));
  const parts: GameStat[][] = [];
  const t0 = Date.now();
  await Promise.all(Array.from({ length: workers }, (_, k) => new Promise<void>((done, fail) => {
    const child = fork(process.argv[1], process.argv.slice(2), { env: { ...process.env, FLIP_SIM_SLICE: `${k}/${workers}` } });
    child.on('message', (m) => { parts.push(m as GameStat[]); });
    child.on('exit', (code) => (code ? fail(new Error(`worker ${k} exited ${code}`)) : done()));
  })));
  console.log(JSON.stringify({ ...summarize(rulesId, red, blue, parts.flat()), seconds: Math.round((Date.now() - t0) / 1000) }));
}

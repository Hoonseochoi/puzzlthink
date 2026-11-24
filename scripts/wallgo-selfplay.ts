// AI-vs-AI matches for 벽바둑 / 벽바둑 II 1:1: "hell" (매우 어려움) against another level, sides alternating.
//
//   node scripts/wallgo-selfplay.ts --games 200 --variant 1 --ms 1500 --opponent hard --jobs 8
//
// Each game uses the same rules as the AI game screen (src/lib/wallgo.ts): random first player via the
// placement order, placements, then turns until the board is separated or nobody can move.
// Every hell move is checked against the rule engine's legal moves.
import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  type AiDifficulty, type Piece, type PlayerId, type Variant,
  MODES, MODES2, applyMove, chooseBotAction, chooseBotKind, chooseBotPlacement, getMoveOptions, getTerritory,
  getWallOptions, modeWinners, noOneCanMove, placementOrder, sameMove,
} from '../src/lib/wallgo.ts';
import { hellSearch } from '../src/lib/wallgoHell.ts';

type Level = AiDifficulty | 'hell';
type GameResult = { hellSeat: PlayerId; first: PlayerId; winners: PlayerId[]; scores: number[]; turns: number; hellDepth: number[] };

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i].replace(/^--/, ''), process.argv[i + 1]);
const games = Number(args.get('games') ?? 20);
const variant = Number(args.get('variant') ?? 1) as Variant;
const ms = Number(args.get('ms') ?? 1500);
const opponent = (args.get('opponent') ?? 'hard') as Level;
const jobs = Number(args.get('jobs') ?? 1);
const offset = Number(args.get('offset') ?? 0);

function choose(level: Level, pieces: Piece[], walls: Set<string>, player: PlayerId, queue: PlayerId[], first: PlayerId, depths: number[]) {
  const mode = (variant === 2 ? MODES2 : MODES).two;
  if (level === 'hell') {
    const result = hellSearch({ variant, pieces, walls: [...walls], toMove: player, placeQueue: queue, firstMover: first, timeMs: ms });
    if (result) depths.push(result.depth);
    return result;
  }
  if (queue.length) {
    const position = chooseBotPlacement(pieces, player, level, mode);
    return { type: 'place' as const, position, kind: chooseBotKind(mode, pieces, player) };
  }
  const action = chooseBotAction(pieces, walls, player, false, level, mode);
  return action ? { type: 'move' as const, move: action.move, wall: action.wall } : null;
}

function playGame(index: number): GameResult {
  const mode = (variant === 2 ? MODES2 : MODES).two;
  const hellSeat = (index % 2) as PlayerId; // alternate seats
  const first = (Math.floor(index / 2) % 2) as PlayerId; // and who goes first
  const levels: Level[] = hellSeat === 0 ? ['hell', opponent] : [opponent, 'hell'];
  const order = placementOrder(mode, first);
  let pieces: Piece[] = mode.fixedPieces.map((piece) => ({ ...piece }));
  let walls = new Set<string>();
  const depths: number[] = [];
  for (let k = 0; k < order.length; k += 1) {
    const player = order[k];
    const choice = choose(levels[player], pieces, walls, player, order.slice(k), first, depths);
    if (!choice || choice.type !== 'place') throw new Error('placement expected');
    const count = pieces.filter((piece) => piece.player === player).length;
    if (pieces.some((piece) => piece.row === choice.position.row && piece.col === choice.position.col)) throw new Error('occupied placement');
    pieces = [...pieces, { id: `${player}-${count}`, player, ...choice.position, ...(choice.kind ? { kind: choice.kind } : {}) }];
  }
  let player: PlayerId = first, turns = 0;
  for (;;) {
    const choice = choose(levels[player], pieces, walls, player, [], first, depths);
    if (choice) {
      if (choice.type !== 'move') throw new Error('move expected');
      const legal = getMoveOptions(pieces, walls, player, false, variant).find((m) => sameMove(m, choice.move.pieceId, choice.move.to));
      if (!legal) throw new Error(`illegal move by ${levels[player]}: ${JSON.stringify(choice.move)}`);
      const moved = applyMove(pieces, walls, legal);
      if (!getWallOptions(moved.pieces, moved.walls, legal.pieceId).some((w) => w.key === choice.wall)) throw new Error(`illegal wall ${choice.wall}`);
      pieces = moved.pieces; walls = new Set(moved.walls).add(choice.wall);
    } else if (getMoveOptions(pieces, walls, player, false, variant).length) throw new Error(`${levels[player]} passed with moves left`);
    turns += 1;
    const territory = getTerritory(pieces, walls, mode.totalPieces);
    if (territory.separated || noOneCanMove(pieces, walls, mode, [false, false, false])) {
      return { hellSeat, first, winners: modeWinners(territory, mode), scores: territory.scores.slice(0, 2), turns, hellDepth: depths };
    }
    player = player === 0 ? 1 : 0;
    if (turns > 200) throw new Error('game did not end');
  }
}

function summarize(results: GameResult[]) {
  let win = 0, draw = 0, loss = 0, margin = 0;
  const bySeat = { first: [0, 0], second: [0, 0] };
  const depths: number[] = [];
  for (const r of results) {
    const won = r.winners.includes(r.hellSeat);
    const outcome = !won ? 'loss' : r.winners.length > 1 ? 'draw' : 'win';
    if (outcome === 'win') win += 1; else if (outcome === 'draw') draw += 1; else loss += 1;
    margin += r.scores[r.hellSeat] - r.scores[r.hellSeat ^ 1];
    const seat = r.first === r.hellSeat ? bySeat.first : bySeat.second;
    seat[1] += 1; if (outcome === 'win') seat[0] += 1;
    depths.push(...r.hellDepth);
  }
  const n = results.length;
  const avgDepth = depths.reduce((a, b) => a + b, 0) / Math.max(1, depths.length);
  console.log(JSON.stringify({
    variant, opponent, ms, games: n, win, draw, loss, winRate: +(win / n * 100).toFixed(1),
    hellFirst: `${bySeat.first[0]}/${bySeat.first[1]}`, hellSecond: `${bySeat.second[0]}/${bySeat.second[1]}`,
    avgMargin: +(margin / n).toFixed(2), avgDepth: +avgDepth.toFixed(2), avgTurns: +(results.reduce((a, r) => a + r.turns, 0) / n).toFixed(1),
  }));
}

if (process.env.WALLGO_CHILD) {
  const out: GameResult[] = [];
  for (let i = 0; i < games; i += 1) out.push(playGame(offset + i));
  process.send!(out);
} else if (jobs <= 1) {
  const results: GameResult[] = [];
  for (let i = 0; i < games; i += 1) results.push(playGame(offset + i));
  summarize(results);
} else {
  const per = Math.ceil(games / jobs);
  const tasks = Array.from({ length: jobs }, (_, j) => ({ start: j * per, count: Math.max(0, Math.min(per, games - j * per)) })).filter((t) => t.count);
  const all = await Promise.all(tasks.map((t) => new Promise<GameResult[]>((resolve, reject) => {
    const child = fork(fileURLToPath(import.meta.url), ['--games', `${t.count}`, '--variant', `${variant}`, '--ms', `${ms}`, '--opponent', opponent, '--offset', `${t.start}`], { env: { ...process.env, WALLGO_CHILD: '1' } });
    child.on('message', (m) => resolve(m as GameResult[]));
    child.on('exit', (code) => { if (code) reject(new Error(`job exited ${code}`)); });
  })));
  summarize(all.flat());
}

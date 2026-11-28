// Rule checks and AI-vs-AI games for 레이저 장기: `npx tsx scripts/laser-janggi/check.ts [games]`
// Hand-made positions cover every hit rule from the show; then AI games must finish without errors.
import { kingShots } from '../../src/lib/laserJanggiAi';
import {
  applyLaserAction, chooseLaserAiAction, initialLaserPieces, legalActions, traceLaser,
  type Direction, type LaserDifficulty, type LaserOwner, type LaserPiece, type LaserPieceType,
} from '../../src/lib/laserJanggi';

let failed = 0;
function check(name: string, ok: boolean, detail = '') {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok || !detail ? '' : ` — ${detail}`}`);
  if (!ok) failed += 1;
}
const p = (id: string, owner: LaserOwner, type: LaserPieceType, row: number, col: number, direction: Direction): LaserPiece => ({ id, owner, type, row, col, direction });
const outcomes = (pieces: LaserPiece[], owner: LaserOwner = 0) => traceLaser(pieces, owner).segments.map((s) => `${s.outcome}${s.hitId ? `:${s.hitId}` : ''}`);

// 1. Starting board: the show's layout, 10 pieces a side, 180° symmetric, opening beams hit nothing.
const start = initialLaserPieces();
const counts = (owner: LaserOwner) => start.filter((x) => x.owner === owner).reduce((m, x) => ({ ...m, [x.type]: (m[x.type] ?? 0) + 1 }), {} as Record<string, number>);
check('start: 10 pieces each', start.filter((x) => x.owner === 0).length === 10 && start.filter((x) => x.owner === 1).length === 10);
check('start: laser, king, splitter, 2 squares, 5 triangles', JSON.stringify(counts(0)) === JSON.stringify({ laser: 1, splitter: 1, king: 1, square: 2, triangle: 5 }), JSON.stringify(counts(0)));
check('start: 180° symmetric', start.every((x) => start.some((y) => y.owner !== x.owner && y.type === x.type && y.row === 7 - x.row && y.col === 7 - x.col && y.direction === (x.direction + 2) % 4)));
check('start: no two pieces share a square', new Set(start.map((x) => `${x.row},${x.col}`)).size === start.length);
for (const owner of [0, 1] as const) {
  const shot = traceLaser(start, owner);
  check(`start: ${owner ? 'red' : 'blue'} opening beam hits nothing`, shot.captured.length === 0 && shot.segments.at(-1)?.outcome === 'exit', outcomes(start, owner).join(' '));
}
// Print the board as text so it can be compared with the screenshot.
const glyph: Record<LaserPieceType, string> = { laser: 'L', splitter: 'S', king: 'K', triangle: 'T', square: 'Q' };
console.log('\n    A  B  C  D  E  F  G  H');
for (let r = 0; r < 8; r += 1) {
  console.log(`${8 - r}  ${Array.from({ length: 8 }, (_, c) => { const x = start.find((y) => y.row === r && y.col === c); return x ? `${x.owner ? glyph[x.type].toLowerCase() : glyph[x.type]}${x.direction}` : ' .'; }).join(' ')}`);
}
console.log('(upper case = blue/dark, lower case = red/cream, digit = direction 0↑ 1→ 2↓ 3←)\n');

// 2. Laser hit: the beam stops, the laser stays.
{
  const pieces = [p('L0', 0, 'laser', 4, 0, 1), p('L1', 1, 'laser', 4, 7, 3), p('K0', 0, 'king', 0, 0, 0)];
  const r = applyLaserAction(pieces, 0, { type: 'move', pieceId: 'K0', row: 0, col: 1 });
  check('laser hit: not removed', !!r && r.pieces.some((x) => x.id === 'L1') && r.shot.segments.some((s) => s.outcome === 'block' && s.hitId === 'L1'), outcomes(pieces).join(' '));
}
// 3. Splitter hit: stays, the beam goes straight on and also reflects ("\" diagonal, beam going up → also left).
{
  const pieces = [p('L0', 0, 'laser', 7, 3, 0), p('S1', 1, 'splitter', 3, 3, 1), p('A', 1, 'square', 0, 3, 1), p('B', 1, 'square', 3, 0, 3), p('K0', 0, 'king', 7, 7, 0)];
  const r = applyLaserAction(pieces, 0, { type: 'move', pieceId: 'K0', row: 7, col: 6 })!;
  check('splitter hit: not removed', r.pieces.some((x) => x.id === 'S1'));
  check('splitter hit: straight branch reaches A (D8)', r.shot.captured.includes('A'), outcomes(pieces).join(' '));
  check('splitter hit: reflected branch turns left to B (A5)', r.shot.captured.includes('B'));
  check('splitter hit: two branches', new Set(r.shot.segments.map((s) => s.branch)).size === 2);
  // "/" splitter (direction 0): beam going up also turns right.
  const slash = [p('L0', 0, 'laser', 7, 3, 0), p('S1', 1, 'splitter', 3, 3, 0), p('C', 1, 'square', 3, 7, 1)];
  check('splitter "/": beam going up also turns right', traceLaser(slash, 0).captured.includes('C'));
}
// 4. Triangle: the mirrored face reflects, a short side removes it.
{
  // Direction 3 = mirror faces left and up (the show's "\" piece with its body in the lower right).
  const mirror = [p('L0', 0, 'laser', 4, 0, 1), p('T', 1, 'triangle', 4, 4, 3), p('X', 1, 'square', 0, 4, 1)];
  const r1 = traceLaser(mirror, 0);
  check('triangle mirror face: reflects, stays', !r1.captured.includes('T') && r1.segments.some((s) => s.outcome === 'reflect' && s.hitId === 'T'));
  check('triangle mirror face: beam going right turns up', r1.captured.includes('X'), outcomes(mirror).join(' '));
  for (const [dir, side] of [[1, 'right/down mirror, hit on the left side'], [0, 'up/right mirror, hit on the left side']] as const) {
    const back = [p('L0', 0, 'laser', 4, 0, 1), p('T', 1, 'triangle', 4, 4, dir)];
    check(`triangle ${side}: removed`, traceLaser(back, 0).captured.includes('T'), outcomes(back).join(' '));
  }
  // The show's example: body upper-right, mirror faces down and left (direction 2); a beam from the left turns down.
  const show = [p('L0', 0, 'laser', 4, 0, 1), p('T', 1, 'triangle', 4, 4, 2), p('Y', 1, 'square', 7, 4, 1)];
  check('triangle (show example): beam going right turns down', traceLaser(show, 0).captured.includes('Y'));
  // The show's removal example: the same piece hit from above.
  const top = [p('L0', 0, 'laser', 0, 4, 2), p('T', 1, 'triangle', 4, 4, 2)];
  check('triangle (show example): hit from above is removed', traceLaser(top, 0).captured.includes('T'));
}
// 5. Square: the mirror face bounces the beam back, any other face removes it.
{
  const face = [p('L0', 0, 'laser', 4, 0, 1), p('Q', 1, 'square', 4, 4, 3)];
  const r = traceLaser(face, 0);
  check('square mirror face: reflects back, stays', !r.captured.includes('Q') && r.segments.some((s) => s.outcome === 'reflect' && s.hitId === 'Q'));
  for (const dir of [0, 1, 2] as const) {
    const side = [p('L0', 0, 'laser', 4, 0, 1), p('Q', 1, 'square', 4, 4, dir)];
    check(`square hit off the mirror (mirror ${['up', 'right', 'down'][dir]}): removed`, traceLaser(side, 0).captured.includes('Q'));
  }
  // The show's removal example: mirror on the right, beam from above.
  check('square (show example): hit from above is removed', traceLaser([p('L0', 0, 'laser', 0, 4, 2), p('Q', 1, 'square', 4, 4, 1)], 0).captured.includes('Q'));
}
// 6. Own pieces are hit the same way.
check('own triangle on a short side: removed', traceLaser([p('L0', 0, 'laser', 4, 0, 1), p('T', 0, 'triangle', 4, 4, 0)], 0).captured.includes('T'));
// 7. King hit ends the game: enemy king → win, own king → loss.
{
  const pieces = [p('L0', 0, 'laser', 4, 0, 1), p('K1', 1, 'king', 4, 6, 0), p('Q', 0, 'square', 4, 3, 0), p('K0', 0, 'king', 0, 0, 0)];
  const r = applyLaserAction(pieces, 0, { type: 'move', pieceId: 'Q', row: 3, col: 3 })!;
  check('king hit: game over, shooter wins', r.winner === 0 && !r.pieces.some((x) => x.id === 'K1'));
  const self = [p('L0', 0, 'laser', 4, 0, 1), p('K0', 0, 'king', 4, 6, 0), p('Q', 0, 'square', 4, 3, 0)];
  check('own king hit: shooter loses', applyLaserAction(self, 0, { type: 'move', pieceId: 'Q', row: 3, col: 3 })!.winner === 1);
}
// 8. Hand positions for the AI (every level, several tries since the lower levels are partly random).
{
  // Take the win: blue's square on D1 turns the beam back; stepping it off rank 1 lets the beam reach red's king on F1.
  const win = [p('L0', 0, 'laser', 7, 0, 1), p('Q0', 0, 'square', 7, 3, 3), p('K1', 1, 'king', 7, 5, 0), p('K0', 0, 'king', 3, 0, 0),
    p('T1', 1, 'triangle', 2, 5, 2), p('L1', 1, 'laser', 0, 7, 2)];
  // Must block: red's square on E8 turns red's beam back; if it steps away the beam runs along rank 8 into blue's king on C8.
  const block = [p('L1', 1, 'laser', 0, 7, 3), p('Q1', 1, 'square', 0, 4, 1), p('K0', 0, 'king', 0, 2, 0), p('L0', 0, 'laser', 7, 0, 0),
    p('T0', 0, 'triangle', 4, 4, 0), p('K1', 1, 'king', 5, 7, 0), p('T1', 1, 'triangle', 3, 6, 1)];
  check('setup: red really threatens the king in the block position', kingShots(block, 1).length > 0);
  check('setup: blue really has a winning shot in the win position', kingShots(win, 0).length > 0);
  check('setup: blue has no winning shot in the block position', kingShots(block, 0).length === 0);
  for (const level of ['easy', 'normal', 'hard'] as LaserDifficulty[]) {
    let tookWin = 0, blocked = 0;
    for (let i = 0; i < 6; i += 1) {
      const w = applyLaserAction(win, 0, chooseLaserAiAction(win, 0, level)!)!;
      if (w.winner === 0) tookWin += 1;
      const bl = applyLaserAction(block, 0, chooseLaserAiAction(block, 0, level)!)!;
      if (bl.winner === null && kingShots(bl.pieces, 1).length === 0) blocked += 1;
    }
    check(`AI ${level}: takes the win`, tookWin === 6, `${tookWin}/6`);
    check(`AI ${level}: blocks the king shot`, blocked === 6, `${blocked}/6`);
  }
  // A two-way threat the hard AI must see coming: in the start position it never hands red a king shot.
  let safe = 0;
  for (let i = 0; i < 4; i += 1) { const r = applyLaserAction(start, 0, chooseLaserAiAction(start, 0, 'hard')!)!; if (kingShots(r.pieces, 1).length === 0) safe += 1; }
  check('AI hard: opening move leaves no king shot', safe === 4);
}

// 9. AI vs AI games run to the end without errors.
const games = Number(process.argv[2] ?? 18);
const levels: LaserDifficulty[] = ['easy', 'normal', 'hard'];
const tally: Record<string, number> = {};
let selfHarm = 0, moves = 0, errors = 0;
const t0 = Date.now();
for (let g = 0; g < games; g += 1) {
  const level = [levels[g % 3], levels[Math.floor(g / 3) % 3]];
  let pieces = initialLaserPieces();
  let current: LaserOwner = (g % 2) as LaserOwner;
  let end = 'turn-limit';
  try {
    for (let turn = 1; turn <= 200; turn += 1) {
      const action = chooseLaserAiAction(pieces, current, level[current]);
      if (!action) { end = 'no-move'; break; }
      const r = applyLaserAction(pieces, current, action);
      if (!r) throw new Error(`illegal AI action ${JSON.stringify(action)}`);
      moves += 1;
      // Shooting your own king when another move exists is the one blunder no level may make. (Giving up an own
      // knight can be a fair price in the search, so that is no longer counted.)
      const hurts = (res: NonNullable<ReturnType<typeof applyLaserAction>>) => res.winner !== null && res.winner !== current;
      if (hurts(r) && legalActions(pieces, current).some((a) => !hurts(applyLaserAction(pieces, current, a)!))) selfHarm += 1;
      for (const keep of ['laser', 'splitter'] as const) {
        if (pieces.filter((x) => x.type === keep).length !== r.pieces.filter((x) => x.type === keep).length) throw new Error(`${keep} removed`);
      }
      pieces = r.pieces;
      if (r.winner !== null) { end = `${level[r.winner]}(${r.winner}) wins on turn ${turn}`; break; }
      current = (1 - current) as LaserOwner;
    }
  } catch (error) { errors += 1; end = `ERROR ${(error as Error).message}`; }
  tally[end.replace(/ on turn \d+/, '')] = (tally[end.replace(/ on turn \d+/, '')] ?? 0) + 1;
  console.log(`game ${g + 1}: ${level[0]} vs ${level[1]} → ${end}`);
}
console.log(tally, `${moves} moves, ${selfHarm} avoidable own-king shots, ${((Date.now() - t0) / Math.max(1, moves)).toFixed(1)} ms/move`);
check('AI games: no errors', errors === 0);
check('AI games: never shoots its own king when another move exists', selfHarm === 0, `${selfHarm}`);

console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exit(failed ? 1 : 0);

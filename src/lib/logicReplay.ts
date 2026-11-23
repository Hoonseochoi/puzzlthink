// 풀이 복기: one demo board per logic puzzle, solved step by step the way a person would, with a speech bubble on
// the moves worth explaining. Built in the browser from a fixed seed, so every visitor sees the same replay.
import { type LogicBoard, type LogicGameId, buildBoard } from './logicPuzzles';
import { solveLine } from './nonogram';
import { geometry as masyuGeometry } from './masyu';
import { lineSums, linesRight, magicSum } from './magicswap';
import { type Puzzle as SlitherPuzzle, generatePuzzle as slitherPuzzle, geometry as slitherGeometry } from './slitherlink';

export type ReplayNote = { ko: string; en: string; at?: number };
/** One move: the marks it changes (cell or edge index → value) and, sometimes, a note pinned to a cell. */
export type ReplayFrame = { changes: [number, number][]; note?: ReplayNote };
/** 슬리더링크 lives outside the logic-puzzle interface; its replay carries the puzzle itself. */
export type SlitherReplayBoard = { kind: 'slitherlink'; size: number; puzzle: SlitherPuzzle };
export type ReplayGame = LogicGameId | 'slitherlink';
export type Replay = { board: LogicBoard | SlitherReplayBoard; frames: ReplayFrame[] };

/** Demo boards: small enough to watch in a minute, picked so the step solver finishes them. */
const DEMO: Record<LogicGameId, { size: number; seed: number }> = {
  binairo: { size: 6, seed: 20270111 },
  nonogram: { size: 10, seed: 20270111 },
  starbattle: { size: 8, seed: 0 }, // filled in by findStarSeed
  masyu: { size: 6, seed: 20270109 },
  onestroke: { size: 6, seed: 20270111 },
  colorlink: { size: 6, seed: 20270111 },
  magicswap: { size: 5, seed: 20271124 },
};

const rc = (n: number, i: number) => [Math.floor(i / n) + 1, (i % n) + 1] as const;

// ── 비나이로: rule by rule, one stone per move ──
function binairoReplay(b: Extract<LogicBoard, { kind: 'binairo' }>): ReplayFrame[] {
  const n = b.size, half = n / 2;
  const g = b.givens.slice();
  const frames: ReplayFrame[] = [{ changes: [], note: { ko: '파란 점 돌은 처음부터 놓인 돌이에요. 붙은 두 개, 한 칸 띈 두 개부터 찾아볼게요.', en: 'Blue-dot stones were there from the start. First, look for pairs and stones one cell apart.' } }];
  const lines: number[][] = [];
  for (let r = 0; r < n; r++) lines.push(Array.from({ length: n }, (_, c) => r * n + c));
  for (let c = 0; c < n; c++) lines.push(Array.from({ length: n }, (_, r) => r * n + c));
  const seen: Record<string, number> = {};
  const say = (kind: string, cell: number, v: number): ReplayNote | undefined => {
    seen[kind] = (seen[kind] ?? 0) + 1;
    if (seen[kind] > 2) return undefined;
    const colour = v === 1 ? ['흑', 'black'] : ['백', 'white'];
    const other = v === 1 ? ['백', 'white'] : ['흑', 'black'];
    const t: Record<string, [string, string]> = {
      pair: [`${other[0]}돌 두 개가 붙어 있으니 옆 칸은 ${colour[0]}이에요. 셋이 이어지면 안 되니까요.`, `Two ${other[1]} stones side by side, so the next cell is ${colour[1]}: never three in a row.`],
      gap: [`${other[0]}·빈칸·${other[0]}이면 가운데는 ${colour[0]}이에요.`, `${other[1]}, gap, ${other[1]}: the middle is ${colour[1]}.`],
      count: [`이 줄은 ${other[0]}돌이 벌써 반을 채웠어요. 남은 칸은 모두 ${colour[0]}!`, `This line already has half ${other[1]}. The rest is ${colour[1]}.`],
      sign: ['= 는 같은 색, × 는 다른 색. 옆 돌을 보면 바로 정해져요.', '= means same colour, × different. The neighbour decides it.'],
    };
    return { ko: t[kind][0], en: t[kind][1], at: cell };
  };
  const find = (): [number, number, string] | null => {
    const other = (v: number) => (v === 1 ? 2 : 1);
    for (const idx of lines) for (let k = 0; k + 2 < n; k++) {
      const [x, y, z] = [g[idx[k]], g[idx[k + 1]], g[idx[k + 2]]];
      if (x && x === y && !z) return [idx[k + 2], other(x), 'pair'];
      if (y && y === z && !x) return [idx[k], other(y), 'pair'];
      if (x && x === z && !y) return [idx[k + 1], other(x), 'gap'];
    }
    for (const s of b.signs) {
      if (g[s.a] && !g[s.b]) return [s.b, s.same ? g[s.a] : other(g[s.a]), 'sign'];
      if (g[s.b] && !g[s.a]) return [s.a, s.same ? g[s.b] : other(g[s.b]), 'sign'];
    }
    for (const idx of lines) {
      const bl = idx.filter((i) => g[i] === 1).length, wh = idx.filter((i) => g[i] === 2).length;
      const empty = idx.find((i) => !g[i]);
      if (empty === undefined) continue;
      if (bl === half) return [empty, 2, 'count'];
      if (wh === half) return [empty, 1, 'count'];
    }
    return null;
  };
  for (let guard = 0; guard < n * n * 2; guard++) {
    const step = find();
    if (!step) break;
    const [cell, v, kind] = step;
    g[cell] = v;
    frames.push({ changes: [[cell, v]], note: say(kind, cell, v) });
  }
  // Anything logic left open (should not happen) is filled from the answer.
  const rest = b.answer.flatMap((v, i) => (g[i] ? [] : [[i, v] as [number, number]]));
  if (rest.length) frames.push({ changes: rest });
  frames.push({ changes: [], note: { ko: '완성! 셋 연속 없이, 줄마다 반반이에요.', en: 'Done! No three in a row, every line half and half.' } });
  return frames;
}

// ── 노노그램: line by line, fills and ✕ together ──
function nonogramReplay(b: Extract<LogicBoard, { kind: 'nonogram' }>): ReplayFrame[] {
  const n = b.size;
  const g = new Int8Array(n * n).fill(-1);
  const frames: ReplayFrame[] = [{ changes: [], note: { ko: '큰 숫자가 있는 줄부터 볼게요. 확실한 칸만 칠하고, 비는 칸은 ✕로 지워요.', en: 'Start with lines that have big numbers. Fill only certain cells, cross out the empty ones.' } }];
  const seen: Record<string, number> = {};
  let changed = true;
  while (changed) {
    changed = false;
    for (let L = 0; L < n * 2; L++) {
      const row = L < n, idx = row ? L : L - n;
      const at = (i: number) => (row ? idx * n + i : i * n + idx);
      const line = Int8Array.from({ length: n }, (_, i) => g[at(i)]);
      const clue = row ? b.clues.rows[idx] : b.clues.cols[idx];
      const next = solveLine(line, clue);
      if (!next) continue;
      const changes: [number, number][] = [];
      for (let i = 0; i < n; i++) if (next[i] !== line[i] && next[i] !== -1) { g[at(i)] = next[i]; changes.push([at(i), next[i] === 1 ? 1 : 2]); }
      if (!changes.length) continue;
      changed = true;
      const fresh = line.every((v) => v === -1);
      const sum = clue.reduce((a, x) => a + x, 0);
      const kind = !fresh ? 'cross' : sum === 0 ? 'zero' : next.every((v) => v !== -1) ? 'full' : 'overlap';
      seen[kind] = (seen[kind] ?? 0) + 1;
      const name = row ? [`${idx + 1}행`, `Row ${idx + 1}`] : [`${idx + 1}열`, `Column ${idx + 1}`];
      const nums = clue.length ? clue.join(' ') : '0';
      const T: Record<string, [string, string]> = {
        overlap: [`${name[0]} [${nums}]: 덩어리를 왼쪽 끝, 오른쪽 끝으로 몰아도 겹치는 칸은 확실히 칠해요.`, `${name[1]} [${nums}]: push the runs to either end; cells covered both times are filled.`],
        full: [`${name[0]} [${nums}]: 숫자와 빈칸을 더하면 줄이 꽉 차요. 한 가지로만 놓여요.`, `${name[1]} [${nums}]: the runs plus gaps fill the line exactly. Only one way.`],
        zero: [`${name[0]}은 0이라 전부 비어요. 모두 ✕!`, `${name[1]} is 0: all empty, cross it out.`],
        cross: [`${name[0]} [${nums}]: 다른 방향 줄에서 정해진 칸 덕분에 새로 확정되는 칸이 생겼어요.`, `${name[1]} [${nums}]: cells found by the crossing lines settle new cells here.`],
      };
      const note = seen[kind] <= (kind === 'cross' ? 2 : 1) ? { ko: T[kind][0], en: T[kind][1], at: changes[0][0] } : undefined;
      frames.push({ changes, note });
    }
  }
  frames.push({ changes: [], note: { ko: '완성! 숫자만으로 숨은 그림이 나타났어요.', en: 'Done! The hidden picture appears from numbers alone.' } });
  return frames;
}

// ── 스타배틀: candidates, forced stones, ✕ by rule ──
type StarStep = { changes: [number, number][]; note?: ReplayNote };
function starSolve(b: Extract<LogicBoard, { kind: 'starbattle' }>): { steps: StarStep[]; solved: boolean } {
  const n = b.size, reg = b.regions;
  const m = new Array<number>(n * n).fill(0); // 0 open, 1 stone, 2 ✕
  const groups: { kind: 'row' | 'col' | 'reg'; cells: number[] }[] = [];
  for (let r = 0; r < n; r++) groups.push({ kind: 'row', cells: Array.from({ length: n }, (_, c) => r * n + c) });
  for (let c = 0; c < n; c++) groups.push({ kind: 'col', cells: Array.from({ length: n }, (_, r) => r * n + c) });
  for (let g = 0; g < n; g++) groups.push({ kind: 'reg', cells: reg.flatMap((x, i) => (x === g ? [i] : [])) });
  const steps: StarStep[] = [];
  const seen: Record<string, number> = {};
  const once = (kind: string, ko: string, en: string, at: number, times = 1): ReplayNote | undefined => {
    seen[kind] = (seen[kind] ?? 0) + 1;
    return seen[kind] <= times ? { ko, en, at } : undefined;
  };
  const killedBy = (s: number) => {
    const r = Math.floor(s / n), c = s % n, out: number[] = [];
    for (let i = 0; i < n * n; i++) {
      if (i === s) continue;
      const ri = Math.floor(i / n), ci = i % n;
      if (ri === r || ci === c || reg[i] === reg[s] || (Math.abs(ri - r) <= 1 && Math.abs(ci - c) <= 1)) out.push(i);
    }
    return out;
  };
  const cross = (cells: number[], note?: ReplayNote) => {
    const ch = cells.filter((i) => m[i] === 0).map((i) => [i, 2] as [number, number]);
    if (!ch.length) return false;
    ch.forEach(([i]) => { m[i] = 2; });
    steps.push({ changes: ch, note });
    return true;
  };
  const place = (s: number, note?: ReplayNote) => {
    m[s] = 1;
    steps.push({ changes: [[s, 1]], note });
    cross(killedBy(s), once('clear', '돌을 놓았으면 같은 줄·세로줄·구역과 둘러싼 8칸은 모두 ✕예요.', 'A stone rules out its row, column, region and the 8 cells around it.', s));
  };
  const open = (cells: number[]) => cells.filter((i) => m[i] === 0);
  const hasStone = (cells: number[]) => cells.some((i) => m[i] === 1);
  for (let guard = 0; guard < 400; guard++) {
    if (groups.every((g) => hasStone(g.cells))) return { steps, solved: true };
    let moved = false;
    // 1. A group with one open cell left.
    for (const g of groups) {
      if (hasStone(g.cells)) continue;
      const o = open(g.cells);
      if (o.length === 0) return { steps, solved: false };
      if (o.length === 1) {
        const word = g.kind === 'reg' ? ['구역', 'region'] : g.kind === 'row' ? ['가로줄', 'row'] : ['세로줄', 'column'];
        place(o[0], once(`single-${g.kind}`, `이 ${word[0]}에 남은 칸이 하나뿐이에요. 여기에 돌!`, `Only one cell left in this ${word[1]}: the stone goes here.`, o[0]));
        moved = true; break;
      }
    }
    if (moved) continue;
    // 2. A region inside one row / column, or a row / column inside one region.
    for (const g of groups) {
      if (hasStone(g.cells)) continue;
      const o = open(g.cells);
      if (g.kind === 'reg') {
        const rows = new Set(o.map((i) => Math.floor(i / n))), cols = new Set(o.map((i) => i % n));
        if (rows.size === 1) {
          const r = [...rows][0];
          if (cross(Array.from({ length: n }, (_, c) => r * n + c).filter((i) => reg[i] !== reg[o[0]]), once('confined', '이 구역은 한 가로줄 안에만 있어요. 그 줄의 돌은 이 구역 몫이니 나머지는 ✕.', 'This region sits inside one row, so the row\'s stone is its. The rest of the row is ✕.', o[0], 2))) { moved = true; break; }
        }
        if (cols.size === 1) {
          const c = [...cols][0];
          if (cross(Array.from({ length: n }, (_, r) => r * n + c).filter((i) => reg[i] !== reg[o[0]]), once('confined', '이 구역은 한 세로줄 안에만 있어요. 그 줄의 나머지는 ✕.', 'This region sits inside one column. The rest of the column is ✕.', o[0], 2))) { moved = true; break; }
        }
      } else {
        const regs = new Set(o.map((i) => reg[i]));
        if (regs.size === 1) {
          const rg = [...regs][0];
          if (cross(reg.flatMap((x, i) => (x === rg && !g.cells.includes(i) ? [i] : [])), once('owns', '이 줄에 남은 칸은 모두 한 구역이에요. 그 구역의 돌은 이 줄에 있으니 구역의 다른 칸은 ✕.', 'Every open cell of this line is in one region, so that region\'s stone is here. Its other cells are ✕.', o[0], 2))) { moved = true; break; }
        }
      }
    }
    if (moved) continue;
    // 3. A cell that would block a whole group.
    for (let s = 0; s < n * n && !moved; s++) {
      if (m[s] !== 0) continue;
      const k = new Set(killedBy(s));
      for (const g of groups) {
        if (hasStone(g.cells) || g.cells.includes(s)) continue;
        if (open(g.cells).every((i) => k.has(i))) {
          cross([s], once('block', '여기에 돌을 놓으면 다른 구역(줄)의 칸이 하나도 안 남아요. 그러니 이 칸은 ✕.', 'A stone here would leave another region or line with no cell. So this cell is ✕.', s, 2));
          moved = true; break;
        }
      }
    }
    if (moved) continue;
    // 4. Two regions inside two rows (or columns).
    const regionsLeft = groups.filter((g) => g.kind === 'reg' && !hasStone(g.cells));
    for (const axis of ['row', 'col'] as const) {
      const lineOf = (i: number) => (axis === 'row' ? Math.floor(i / n) : i % n);
      for (let a = 0; a < regionsLeft.length && !moved; a++) for (let bb = a + 1; bb < regionsLeft.length && !moved; bb++) {
        const cells = [...open(regionsLeft[a].cells), ...open(regionsLeft[bb].cells)];
        const lines = new Set(cells.map(lineOf));
        if (lines.size !== 2) continue;
        const pair = new Set([reg[regionsLeft[a].cells[0]], reg[regionsLeft[bb].cells[0]]]);
        const others = Array.from({ length: n * n }, (_, i) => i).filter((i) => lines.has(lineOf(i)) && !pair.has(reg[i]));
        if (cross(others, once('two', '이 두 구역은 두 줄 안에 다 들어가요. 두 줄의 돌 두 개가 이 구역들 몫이니 나머지는 ✕.', 'These two regions fit inside two lines, so both stones there are theirs. The rest is ✕.', cells[0]))) moved = true;
      }
    }
    if (!moved) return { steps, solved: false };
  }
  return { steps, solved: false };
}

let starSeed: number | null = null;
/** The first seed whose 8×8 board the step solver finishes (searched once, then cached). */
function findStarSeed(): number {
  if (starSeed !== null) return starSeed;
  for (let s = 20270111; ; s++) {
    const b = buildBoard('starbattle', 8, s);
    if (b.kind === 'starbattle' && starSolve(b).solved) { starSeed = s; return s; }
  }
}

function starReplay(b: Extract<LogicBoard, { kind: 'starbattle' }>): ReplayFrame[] {
  return [
    { changes: [], note: { ko: '줄마다, 구역마다 돌 하나. 놓을 곳보다 못 놓을 곳을 먼저 찾을게요.', en: 'One stone per row, column and region. Find where stones can\'t go first.' } },
    ...starSolve(b).steps,
    { changes: [], note: { ko: '완성! 모든 줄과 구역에 돌이 하나씩, 서로 닿지 않아요.', en: 'Done! One stone in every row, column and region, none touching.' } },
  ];
}

// ── Line games: trace the answer like a hand drawing it ──
function walkEdges(n: number, answer: number[], ends: [number, number][], start: number): number[] {
  const adj: [number, number][][] = Array.from({ length: n * n }, () => []);
  answer.forEach((v, e) => { if (v) { const [a, b] = ends[e]; adj[a].push([b, e]); adj[b].push([a, e]); } });
  const order: number[] = [];
  const used = new Set<number>();
  let cur = start;
  for (;;) {
    const next = adj[cur].find(([, e]) => !used.has(e));
    if (!next) break;
    used.add(next[1]); order.push(next[1]); cur = next[0];
  }
  return order;
}

function masyuReplay(b: Extract<LogicBoard, { kind: 'masyu' }>): ReplayFrame[] {
  const n = b.size, g = masyuGeometry(n);
  const frames: ReplayFrame[] = [{ changes: [], note: { ko: '검은 돌부터 볼게요. 검은 돌은 그 자리에서 꺾이고, 양쪽으로 두 칸씩 뻗어요.', en: 'Black stones first: the loop turns on them and runs two cells each way.' } }];
  const drawn = new Set<number>();
  const draw = (edges: number[], note?: ReplayNote) => {
    const ch = edges.filter((e) => b.answer[e] && !drawn.has(e)).map((e) => [e, 1] as [number, number]);
    ch.forEach(([e]) => drawn.add(e));
    if (ch.length || note) frames.push({ changes: ch, note });
  };
  const straightFrom = (cell: number, e: number) => {
    const [a, c] = g.ends[e];
    const next = a === cell ? c : a;
    const dir = next - cell;
    const beyond = next + dir;
    if (beyond < 0 || beyond >= n * n) return -1;
    if (Math.abs(dir) === 1 && Math.floor(beyond / n) !== Math.floor(next / n)) return -1;
    return g.cellEdges[next].find((x) => x >= 0 && g.ends[x].includes(beyond)) ?? -1;
  };
  let blacks = 0;
  b.pearls.forEach((p, cell) => {
    if (p !== 2) return;
    const legs = g.cellEdges[cell].filter((e) => e >= 0 && b.answer[e]);
    const edges = legs.flatMap((e) => [e, straightFrom(cell, e)]).filter((e) => e >= 0);
    blacks++;
    draw(edges, blacks <= 2 ? { ko: blacks === 1 ? '여기서 꺾이고, 두 다리 모두 한 칸 더 곧게 뻗어요.' : '다른 검은 돌도 똑같이: 꺾고, 두 칸씩.', en: blacks === 1 ? 'Turn here, and both legs go straight one more cell.' : 'Same for the next black stone: turn, two cells each way.', at: cell } : undefined);
  });
  let whites = 0;
  b.pearls.forEach((p, cell) => {
    if (p !== 1) return;
    whites++;
    draw(g.cellEdges[cell].filter((e) => e >= 0 && b.answer[e]), whites <= 2 ? { ko: whites === 1 ? '흰 돌은 곧게 지나가고, 바로 앞이나 뒤 칸에서 꺾여요.' : '이 흰 돌도 곧게 지나가요.', en: whites === 1 ? 'White stones are passed straight, turning just before or after.' : 'Straight through this white stone too.', at: cell } : undefined);
  });
  const start = b.pearls.findIndex((p) => p) ;
  const rest = walkEdges(n, b.answer, g.ends, start).filter((e) => !drawn.has(e));
  if (rest.length) frames.push({ changes: [], note: { ko: '이제 끊긴 선들을 이어 고리 하나로 닫아요. 작은 고리가 생기지 않게!', en: 'Now join the pieces into one loop, without closing a small loop early.' } });
  rest.forEach((e, i) => { drawn.add(e); frames.push({ changes: [[e, 1]], note: i === rest.length - 1 ? undefined : undefined }); });
  frames.push({ changes: [], note: { ko: '완성! 모든 돌을 지나는 고리 하나예요.', en: 'Done! One loop through every stone.' } });
  return frames;
}

function oneStrokeReplay(b: Extract<LogicBoard, { kind: 'onestroke' }>): ReplayFrame[] {
  const n = b.size, ends = masyuGeometry(n).ends;
  const start = b.numbers.indexOf(1), last = Math.max(...b.numbers);
  const frames: ReplayFrame[] = [{ changes: [], note: { ko: '1에서 출발해요. 구석과 벽 쪽 칸을 남기지 않는 게 핵심이에요.', en: 'Start on 1. The key is never to leave corners and wall cells behind.', at: start } }];
  const order = walkEdges(n, b.answer, ends, start);
  let cur = start, corner = false;
  const isCorner = (i: number) => (i === 0 || i === n - 1 || i === n * n - n || i === n * n - 1);
  order.forEach((e) => {
    const [a, c] = ends[e];
    const next = a === cur ? c : a;
    cur = next;
    const k = b.numbers[next];
    let note: ReplayNote | undefined;
    if (k && k !== last) note = k === 2 ? { ko: '2에 도착! 다음은 3이에요. 큰 숫자를 먼저 밟으면 안 돼요.', en: 'Reached 2. Next is 3; never step on a later number first.', at: next } : { ko: `${k} 통과, 다음은 ${k + 1}.`, en: `${k} passed, next ${k + 1}.`, at: next };
    else if (!k && !corner && isCorner(next)) { corner = true; note = { ko: '구석은 이웃이 둘뿐이라 들어오면 바로 꺾어 나가요.', en: 'A corner has two neighbours: in, then straight out the other side.', at: next }; }
    frames.push({ changes: [[e, 1]], note });
  });
  frames.push({ changes: [], note: { ko: `${last}에서 끝! 모든 칸을 한 번씩 지났어요.`, en: `Ends on ${last}, every cell visited once.`, at: cur } });
  return frames;
}

function colorLinkReplay(b: Extract<LogicBoard, { kind: 'colorlink' }>): ReplayFrame[] {
  const n = b.size, ends = masyuGeometry(n).ends;
  const K = Math.max(...b.ends);
  const isCorner = (i: number) => (i === 0 || i === n - 1 || i === n * n - n || i === n * n - 1);
  const paths = Array.from({ length: K }, (_, k) => {
    const s = b.ends.indexOf(k + 1);
    const edges = walkEdges(n, b.answer, ends, s);
    const cells = [s];
    edges.forEach((e) => { const [x, y] = ends[e]; cells.push(x === cells[cells.length - 1] ? y : x); });
    const t = cells[cells.length - 1];
    const dist = Math.abs(Math.floor(s / n) - Math.floor(t / n)) + Math.abs((s % n) - (t % n));
    return { k: k + 1, s, edges, cells, detour: edges.length - dist, corner: cells.find((c, i) => i > 0 && i < cells.length - 1 && isCorner(c)) };
  });
  // Easy pairs first (shortest detour), the long ways last, the way a person settles the board.
  paths.sort((a, c) => a.detour - c.detour || a.edges.length - c.edges.length);
  const frames: ReplayFrame[] = [{ changes: [], note: { ko: '바로 이을 수 있는 짝부터 잇고, 남는 칸은 나중에 돌아가는 선으로 채울게요.', en: 'Join the easy pairs first; the long ways fill what is left.' } }];
  let cornerSaid = false, aroundSaid = false;
  paths.forEach((p, idx) => {
    let note: ReplayNote | undefined;
    if (idx === 0) note = { ko: '이 짝은 거의 곧게 이어져요.', en: 'This pair joins almost straight.', at: p.s };
    else if (p.corner !== undefined && !cornerSaid) { cornerSaid = true; note = { ko: '구석 칸은 이웃이 둘뿐이라, 구석을 지나는 선은 이렇게 꺾여야 해요.', en: 'A corner has two neighbours, so a line through it must turn like this.', at: p.corner }; }
    else if (p.detour >= 4 && !aroundSaid) { aroundSaid = true; note = { ko: '바로 이으면 빈칸이 남아요. 빙 돌아가며 칸을 채워요.', en: 'Joining directly would leave gaps, so this one goes the long way round.', at: p.s }; }
    p.edges.forEach((e, i) => frames.push({ changes: [[e, 1]], note: i === 0 ? note : undefined }));
  });
  frames.push({ changes: [], note: { ko: '완성! 모든 짝을 잇고 판을 빈칸 없이 채웠어요.', en: 'Done! Every pair joined, every cell filled.' } });
  return frames;
}

// ── 슬리더링크: classic patterns, number counts, two lines per dot, no small loops ──
function slitherSolve(p: SlitherPuzzle): { frames: ReplayFrame[]; solved: boolean } {
  const g = slitherGeometry(p.rows, p.cols), { rows, cols } = p;
  const e = new Int8Array(g.edgeCount).fill(-1); // -1 open, 1 line, 0 ✕
  const frames: ReplayFrame[] = [];
  const seen: Record<string, number> = {};
  const note = (kind: string, ko: string, en: string, at: number, times = 1): ReplayNote | undefined => {
    seen[kind] = (seen[kind] ?? 0) + 1;
    return seen[kind] <= times ? { ko, en, at } : undefined;
  };
  const apply = (edges: number[], v: 0 | 1, n?: ReplayNote) => {
    const ch = edges.filter((x) => e[x] === -1);
    if (!ch.length) return false;
    ch.forEach((x) => { e[x] = v; });
    frames.push({ changes: ch.map((x) => [x, v === 1 ? 1 : 2] as [number, number]), note: n });
    return true;
  };
  const cell = (r: number, c: number) => r * cols + c;
  // Opening patterns.
  p.clues.forEach((k, i) => { if (k === 0) apply(g.cellEdges[i], 0, note('zero', '0은 주변에 선이 하나도 없어요. 네 변 모두 ✕.', 'A 0 has no line around it: all four sides are ✕.', i)); });
  const corners = [[0, 0, 0, 2], [0, cols - 1, 0, 3], [rows - 1, 0, 1, 2], [rows - 1, cols - 1, 1, 3]];
  for (const [r, c, a, b] of corners) {
    const i = cell(r, c), ed = [g.cellEdges[i][a], g.cellEdges[i][b]];
    if (p.clues[i] === 3) apply(ed, 1, note('c3', '구석의 3: 모서리 점에서 선이 꺾여야 하니 바깥 두 변은 선이에요.', 'A 3 in a corner: the loop must turn at the corner, so both outer sides are lines.', i));
    if (p.clues[i] === 1) apply(ed, 0, note('c1', '구석의 1: 모서리 두 변을 쓰면 2가 되니 둘 다 ✕.', 'A 1 in a corner: using both corner sides would make 2, so both are ✕.', i));
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const i = cell(r, c);
    if (p.clues[i] !== 3) continue;
    if (c + 1 < cols && p.clues[i + 1] === 3) apply([g.cellEdges[i][2], g.cellEdges[i][3], g.cellEdges[i + 1][3]], 1, note('33', '나란한 3 두 개: 가운데 변과 양쪽 바깥 변은 반드시 선이에요.', 'Two 3s side by side: the middle side and both outer sides are lines.', i));
    if (r + 1 < rows && p.clues[i + cols] === 3) apply([g.cellEdges[i][0], g.cellEdges[i][1], g.cellEdges[i + cols][1]], 1, note('33', '위아래로 붙은 3 두 개: 가운데 변과 위·아래 변은 선이에요.', 'Two 3s stacked: the middle side and the top and bottom sides are lines.', i));
  }
  frames.unshift({ changes: [], note: { ko: '0, 구석의 숫자, 붙어 있는 3처럼 바로 정해지는 곳부터 볼게요.', en: 'Start where things are certain: 0s, numbers in corners, 3s side by side.' } });
  // Union-find over dots for the "no small loop" rule.
  const parentOf = () => {
    const par = Array.from({ length: g.dotEdges.length }, (_, i) => i);
    const f = (x: number): number => (par[x] === x ? x : (par[x] = f(par[x])));
    for (let x = 0; x < g.edgeCount; x++) if (e[x] === 1) par[f(g.ends[x][0])] = f(g.ends[x][1]);
    return f;
  };
  for (let guard = 0; guard < 2000; guard++) {
    if (p.solution.every((v, x) => (v === 1) === (e[x] === 1))) return { frames, solved: true };
    let moved = false;
    // Numbers: full → rest ✕; just enough room → rest are lines.
    for (let i = 0; i < rows * cols && !moved; i++) {
      const k = p.clues[i];
      if (k < 0) continue;
      const ed = g.cellEdges[i], on = ed.filter((x) => e[x] === 1).length, open = ed.filter((x) => e[x] === -1);
      if (!open.length) continue;
      if (on === k) moved = apply(open, 0, note('full', `${k} 주변에 선이 ${k}개 다 찼어요. 나머지 변은 ✕.`, `The ${k} already has ${k} lines. Its other sides are ✕.`, i, 2));
      else if (on + open.length === k) moved = apply(open, 1, note('room', `${k}을 채우려면 남은 변을 모두 써야 해요.`, `To reach ${k}, every remaining side must be a line.`, i, 2));
    }
    if (moved) continue;
    // Dots: two lines → rest ✕; one line and one way out → line; no line and one way → ✕.
    for (let d = 0; d < g.dotEdges.length && !moved; d++) {
      const ed = g.dotEdges[d], on = ed.filter((x) => e[x] === 1).length, open = ed.filter((x) => e[x] === -1);
      if (!open.length) continue;
      const r = Math.floor(d / (cols + 1)), c = d % (cols + 1), near = cell(Math.min(rows - 1, r), Math.min(cols - 1, c));
      if (on === 2) moved = apply(open, 0, note('dot2', '한 점에는 선이 두 개까지만 와요. 이 점의 나머지 길은 ✕.', 'A dot takes at most two lines. Its other ways are ✕.', near, 2));
      else if (on === 1 && open.length === 1) moved = apply(open, 1, note('dot1', '선은 끊기면 안 돼요. 이 점에서 나갈 길이 하나뿐이라 이어 그려요.', 'The line can\'t stop here, and there is only one way on.', near, 2));
      else if (on === 0 && open.length === 1) moved = apply(open, 0, note('dead', '들어오면 나갈 길이 없는 막다른 변이에요. ✕.', 'A dead end: a line here could never get out. ✕.', near, 1));
    }
    if (moved) continue;
    // No small loop: an open side joining both ends of one piece, while numbers are still unmet, is ✕.
    const f = parentOf();
    const unmet = p.clues.some((k, i) => k >= 0 && g.cellEdges[i].filter((x) => e[x] === 1).length !== k);
    for (let x = 0; x < g.edgeCount && !moved; x++) {
      if (e[x] !== -1) continue;
      const [a, b] = g.ends[x];
      if (f(a) === f(b) && g.dotEdges[a].some((y) => e[y] === 1) && unmet) {
        const r = Math.floor(a / (cols + 1)), c = a % (cols + 1);
        moved = apply([x], 0, note('loop', '여기를 이으면 작은 고리가 닫혀요. 아직 못 채운 숫자가 있으니 ✕.', 'Joining here would close a small loop while numbers are still unmet. ✕.', cell(Math.min(rows - 1, r), Math.min(cols - 1, c)), 2));
      }
    }
    if (!moved) return { frames, solved: false };
  }
  return { frames, solved: false };
}

// ── 마방진 스왑: undo the scramble one pair at a time, the pair that fixes the most lines first ──
function magicReplay(b: Extract<LogicBoard, { kind: 'magicswap' }>): ReplayFrame[] {
  const n = b.size, M = magicSum(n), g = b.start.slice();
  const frames: ReplayFrame[] = [{ changes: [], note: { ko: `줄마다 합이 ${M}이어야 해요. 끝의 +, − 숫자는 목표보다 얼마나 크거나 작은지예요.`, en: `Every line must add up to ${M}. The + and − at the edge say how far each line is off.` } }];
  const left = b.swaps.slice();
  while (left.length) {
    let best = 0, bestScore = -1;
    left.forEach(([i, j], k) => { const t = g.slice(); [t[i], t[j]] = [t[j], t[i]]; const sc = linesRight(n, t); if (sc > bestScore) { bestScore = sc; best = k; } });
    const [i, j] = left.splice(best, 1)[0];
    const [ri] = rc(n, i), [rj, cj] = rc(n, j);
    const s = lineSums(n, g), d = Math.abs(g[i] - g[j]);
    const rowOff = s.rows[ri - 1] - M, sign = (v: number) => (v > 0 ? `+${v}` : `${v}`);
    const changes: [number, number][] = [[i, g[j]], [j, g[i]]];
    [g[i], g[j]] = [g[j], g[i]];
    frames.push({
      changes, note: frames.length <= 2 ? {
        ko: `${ri}행(${sign(rowOff)})의 ${g[j]}와 ${rj}행 ${cj}열의 ${g[i]}를 바꿔요. 차이가 ${d}라서 두 줄이 함께 맞춰져요.`,
        en: `Row ${ri} is ${sign(rowOff)}: swap its ${g[j]} with the ${g[i]} at row ${rj}, column ${cj}. They differ by ${d}, so both lines line up.`,
        at: i,
      } : undefined,
    });
  }
  frames.push({ changes: [], note: { ko: `완성! 가로·세로·대각선 ${2 * n + 2}줄이 모두 ${M}이에요.`, en: `Done! All ${2 * n + 2} lines add up to ${M}.` } });
  return frames;
}

let slitherSeed: number | null = null;
/** The first 9×9-dot board the step solver finishes (searched once, then cached). */
function findSlitherSeed(): number {
  if (slitherSeed !== null) return slitherSeed;
  // 20270187 is the first one today; the search only moves on if the engine ever changes.
  for (let s = 20270187; ; s++) if (slitherSolve(slitherPuzzle(9, s)).solved) { slitherSeed = s; return s; }
}

const cache = new Map<ReplayGame, Replay>();
/** The replay of one game (built once per page). */
export function buildReplay(game: ReplayGame): Replay {
  const hit = cache.get(game);
  if (hit) return hit;
  if (game === 'slitherlink') {
    const puzzle = slitherPuzzle(9, findSlitherSeed());
    const replay: Replay = { board: { kind: 'slitherlink', size: puzzle.cols, puzzle }, frames: [...slitherSolve(puzzle).frames, { changes: [], note: { ko: '완성! 모든 숫자를 맞추는 고리 하나예요.', en: 'Done! One loop that meets every number.' } }] };
    cache.set(game, replay);
    return replay;
  }
  const d = DEMO[game];
  const board = buildBoard(game, d.size, game === 'starbattle' ? findStarSeed() : d.seed);
  const frames = board.kind === 'binairo' ? binairoReplay(board)
    : board.kind === 'nonogram' ? nonogramReplay(board)
      : board.kind === 'starbattle' ? starReplay(board)
        : board.kind === 'masyu' ? masyuReplay(board)
          : board.kind === 'onestroke' ? oneStrokeReplay(board)
            : board.kind === 'magicswap' ? magicReplay(board)
              : colorLinkReplay(board);
  const replay = { board, frames };
  cache.set(game, replay);
  return replay;
}

export const noteCell = (n: number, at: number) => rc(n, at);

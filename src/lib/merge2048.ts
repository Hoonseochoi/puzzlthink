// 2048 on a 4×4 board. Slide every block one way; two equal blocks that meet merge into their sum.
// After every move that changes the board one new block (2 at 90 %, 4 at 10 %) appears in an empty cell.
// Spawns come from a seeded generator kept in the state, so a friend match can hand everyone the same seed.

export const SIZE = 4;
export type Dir = 'up' | 'down' | 'left' | 'right';
export type Tile = { id: number; v: number; r: number; c: number };
export type M2State = {
  tiles: Tile[];
  score: number;
  nextId: number;
  rng: number; // generator state (mulberry32)
  moves: number;
  over: boolean;
};
export type MoveResult = {
  state: M2State;
  /** Blocks swallowed by a merge, at the cell they slid into (shown for one beat, then removed). */
  ghosts: Tile[];
  /** Ids of the blocks that grew this move. */
  merged: number[];
  /** Id of the block that appeared after the move. */
  spawned: number | null;
  gained: number;
};

function rand(seed: number): [number, number] {
  const s = (seed + 0x6d2b79f5) | 0;
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, s];
}

export const randomSeed = () => (crypto.getRandomValues(new Uint32Array(1))[0] | 0);

function spawn(state: M2State): { state: M2State; id: number | null } {
  const taken = new Set(state.tiles.map((t) => t.r * SIZE + t.c));
  const empty = Array.from({ length: SIZE * SIZE }, (_, i) => i).filter((i) => !taken.has(i));
  if (!empty.length) return { state, id: null };
  const [a, s1] = rand(state.rng);
  const [b, s2] = rand(s1);
  const cell = empty[Math.floor(a * empty.length)];
  const tile = { id: state.nextId, v: b < 0.9 ? 2 : 4, r: Math.floor(cell / SIZE), c: cell % SIZE };
  return { state: { ...state, rng: s2, nextId: state.nextId + 1, tiles: [...state.tiles, tile] }, id: tile.id };
}

export function newGame(seed: number): M2State {
  let state: M2State = { tiles: [], score: 0, nextId: 1, rng: seed | 0, moves: 0, over: false };
  state = spawn(state).state;
  return spawn(state).state;
}

/** The cells of one line, starting from the edge the blocks move towards. */
function line(dir: Dir, i: number): [number, number][] {
  const k = [0, 1, 2, 3];
  switch (dir) {
    case 'left': return k.map((j) => [i, j]);
    case 'right': return k.map((j) => [i, SIZE - 1 - j]);
    case 'up': return k.map((j) => [j, i]);
    case 'down': return k.map((j) => [SIZE - 1 - j, i]);
  }
}

export function move(state: M2State, dir: Dir): MoveResult | null {
  if (state.over) return null;
  const at = new Map(state.tiles.map((t) => [t.r * SIZE + t.c, t]));
  const out: Tile[] = [];
  const ghosts: Tile[] = [];
  const merged: number[] = [];
  let gained = 0;
  let changed = false;
  for (let i = 0; i < SIZE; i++) {
    const cells = line(dir, i);
    const seq = cells.map(([r, c]) => at.get(r * SIZE + c)).filter((t): t is Tile => !!t);
    const placed: { tile: Tile; grown: boolean }[] = [];
    for (const tile of seq) {
      const last = placed[placed.length - 1];
      if (last && !last.grown && last.tile.v === tile.v) {
        const [r, c] = cells[placed.length - 1];
        last.tile = { ...last.tile, v: last.tile.v * 2 };
        last.grown = true;
        ghosts.push({ ...tile, r, c });
        merged.push(last.tile.id);
        gained += last.tile.v;
        changed = true;
      } else {
        const [r, c] = cells[placed.length];
        if (tile.r !== r || tile.c !== c) changed = true;
        placed.push({ tile: { ...tile, r, c }, grown: false });
      }
    }
    out.push(...placed.map((p) => p.tile));
  }
  if (!changed) return null;
  const moved: M2State = { ...state, tiles: out, score: state.score + gained, moves: state.moves + 1 };
  const { state: next, id } = spawn(moved);
  return { state: { ...next, over: !canMove(next) }, ghosts, merged, spawned: id, gained };
}

export function canMove(state: Pick<M2State, 'tiles'>): boolean {
  if (state.tiles.length < SIZE * SIZE) return true;
  const grid = cells(state);
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    const v = grid[r * SIZE + c];
    if (c + 1 < SIZE && grid[r * SIZE + c + 1] === v) return true;
    if (r + 1 < SIZE && grid[(r + 1) * SIZE + c] === v) return true;
  }
  return false;
}

/** The board as 16 numbers, row by row (0 = empty). */
export function cells(state: Pick<M2State, 'tiles'>): number[] {
  const grid = Array(SIZE * SIZE).fill(0);
  for (const t of state.tiles) grid[t.r * SIZE + t.c] = t.v;
  return grid;
}

export const maxTile = (state: Pick<M2State, 'tiles'>) => state.tiles.reduce((m, t) => Math.max(m, t.v), 0);

/** Whether a saved game still has the shape this engine writes. */
export function isState(value: unknown): value is M2State {
  const s = value as M2State;
  return !!s && Array.isArray(s.tiles) && typeof s.score === 'number' && typeof s.rng === 'number' && typeof s.nextId === 'number'
    && s.tiles.every((t) => Number.isInteger(t.r) && Number.isInteger(t.c) && Number.isInteger(t.v) && t.v >= 2);
}

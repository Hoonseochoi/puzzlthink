// 복기 for 러시안 룰렛: every turn of a finished game, rebuilt from its log with the real bullets.
import { RR_CHAMBERS, RR_COST, RR_PLAYERS, RR_START_CREDITS, type RRManipEntry, type RussianRoulette } from './russianRoulette';

export type RRStep =
  | { k: 'public'; seat: number; pair: number }
  | { k: 'private'; seat: number; pair?: number }
  | { k: 'rotate'; seat: number; steps: number }
  | { k: 'fund'; seat: number; amount: number; pool: number; swap: number | null }
  | { k: 'fire'; seat: number; chamber: number; fired: boolean };

export type RRFrame = {
  step: RRStep | null; round: number; credits: number[]; muzzle: number; chambers: boolean[];
  checked: boolean[]; // publicly inspected chambers
  focus: number[]; // chambers this step touched
  hits: number[];
};

/** Rebuilds every turn of a finished game from its log, with the real bullet positions at each moment. */
export function rouletteFrames(game: RussianRoulette): RRFrame[] {
  const entries = [...game.log].reverse();
  const funds = (game.manipHistory ?? []).reduce<{ fund: Extract<RRManipEntry, { k: 'fund' }>; swap: number | null }[]>((list, e) => {
    if (e.k === 'fund') list.push({ fund: e, swap: null });
    else if (list.length) list[list.length - 1].swap = e.pair;
    return list;
  }, []);
  // Undo every swap from the final cylinder to get the one the game started with.
  const chambers = [...game.chambers];
  for (const f of [...funds].reverse()) if (f.swap !== null) { const a = f.swap, b = (f.swap + 1) % RR_CHAMBERS; [chambers[a], chambers[b]] = [chambers[b], chambers[a]]; }

  let frame: RRFrame = {
    step: null, round: 1, credits: Array(RR_PLAYERS).fill(RR_START_CREDITS), muzzle: game.baseMuzzle ?? game.muzzle,
    chambers, checked: Array(RR_CHAMBERS).fill(false), focus: [], hits: [],
  };
  const frames = [frame];
  let fundAt = 0;
  const pay = (credits: number[], seat: number, n: number) => credits.map((c, i) => (i === seat ? Math.max(0, c - n) : c));
  for (const e of entries) {
    if (e.k === 'round') { frame = { ...frame, round: e.round }; continue; }
    if (e.k === 'pass' || e.k === 'manipulate') continue;
    let next: RRFrame;
    if (e.k === 'publicInspect') {
      const cells = [e.pair, (e.pair + 1) % RR_CHAMBERS];
      next = { ...frame, step: { k: 'public', seat: e.seat, pair: e.pair }, credits: pay(frame.credits, e.seat, RR_COST.publicInspect), checked: frame.checked.map((c, i) => c || cells.includes(i)), focus: cells };
    } else if (e.k === 'privateInspect') {
      next = { ...frame, step: { k: 'private', seat: e.seat, pair: e.pair }, credits: pay(frame.credits, e.seat, RR_COST.privateInspect), focus: e.pair === undefined ? [] : [e.pair, (e.pair + 1) % RR_CHAMBERS] };
    } else if (e.k === 'rotate') {
      next = { ...frame, step: { k: 'rotate', seat: e.seat, steps: e.steps }, credits: pay(frame.credits, e.seat, e.steps === 1 ? RR_COST.rotate1 : RR_COST.rotate2), muzzle: (frame.muzzle + e.steps) % RR_PLAYERS, focus: [] };
    } else if (e.k === 'manipulateFund') {
      const f = funds[fundAt++];
      const amount = f?.fund.amount ?? 1;
      let cyl = frame.chambers;
      if (f?.swap != null) { const a = f.swap, b = (f.swap + 1) % RR_CHAMBERS; cyl = [...cyl]; [cyl[a], cyl[b]] = [cyl[b], cyl[a]]; }
      next = { ...frame, step: { k: 'fund', seat: e.seat, amount, pool: f?.fund.pool ?? 0, swap: f?.swap ?? null }, credits: pay(frame.credits, e.seat, amount), chambers: cyl, focus: f?.swap != null ? [f.swap, (f.swap + 1) % RR_CHAMBERS] : [] };
    } else {
      next = { ...frame, step: { k: 'fire', seat: e.seat, chamber: e.chamber, fired: e.fired }, focus: [e.chamber], hits: e.fired && !frame.hits.includes(e.seat) ? [...frame.hits, e.seat] : frame.hits };
    }
    frames.push(next);
    frame = next;
  }
  return frames;
}

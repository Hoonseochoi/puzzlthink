// Timing of one turn on the board: the moved piece slides or turns, the laser charges, then the beam draws out
// segment by segment (branches start where they split), and every hit lands when the beam reaches it.
// LaserBoard draws from this; the game and the room wait `total` ms before handing over the turn.
import type { LaserShot } from '@/lib/laserJanggi';

export const FX = {
  slide: 220, // the moved piece slides / turns
  charge: 280, // the laser charges before it fires
  cell: 46, // beam speed, ms per cell
  kingCell: 92, // slow motion when the shot ends a game
  hit: 560, // flash, shards and the piece breaking apart
  king: 1500, // the bigger finish on a king hit
};

export type SegTime = { start: number; end: number; len: number };
export type ShotTimeline = { segs: SegTime[]; hits: { id: string; at: number; row: number; col: number; king: boolean }[]; fire: number; total: number };

const reducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** When each beam segment starts and ends, when each piece is hit, and how long the whole turn plays. */
export function shotTimeline(shot: LaserShot | null, opts: { instant?: boolean } = {}): ShotTimeline {
  if (!shot) return { segs: [], hits: [], fire: 0, total: 0 };
  const instant = opts.instant ?? reducedMotion();
  const king = shot.kingHits.length > 0;
  const perCell = instant ? 0 : king ? FX.kingCell : FX.cell;
  const fire = instant ? 0 : (shot.action?.type === 'move' || shot.action?.type === 'rotate' ? FX.slide : 0) + FX.charge;
  const segs: SegTime[] = [];
  // A segment starts where an earlier segment ended (a mirror or splitter); the first one starts at the laser.
  const reached = new Map<string, number>();
  shot.segments.forEach((seg, i) => {
    const key = `${seg.from.row}:${seg.from.col}`;
    const start = i === 0 ? fire : reached.get(key) ?? fire;
    const len = Math.abs(seg.to.row - seg.from.row) + Math.abs(seg.to.col - seg.from.col);
    const end = start + len * perCell;
    segs.push({ start, end, len });
    if (seg.outcome === 'reflect' || seg.outcome === 'split') {
      const to = `${seg.to.row}:${seg.to.col}`;
      if (!reached.has(to)) reached.set(to, end);
    }
  });
  const hits = shot.segments.flatMap((seg, i) => (seg.outcome === 'capture' || seg.outcome === 'king') && seg.hitId
    ? [{ id: seg.hitId, at: segs[i].end, row: seg.to.row, col: seg.to.col, king: seg.outcome === 'king' }] : []);
  const beamEnd = segs.reduce((m, s) => Math.max(m, s.end), fire);
  const total = instant ? 350 : beamEnd + (king ? FX.king : hits.length ? FX.hit : 260);
  return { segs, hits, fire, total };
}

// Asks the hell engine (in a Web Worker) for a move. Falls back to running it on the page, with less time,
// when workers are unavailable.
import type { HellPoint } from '@/lib/blindGomokuHell';

let worker: Worker | null = null;
let seq = 0;

/** About 1.5 s of thinking on a desktop, 1 s on a phone. */
export const hellThinkMs = () =>
  typeof window !== 'undefined' && (window.matchMedia?.('(pointer: coarse)').matches || window.innerWidth < 768) ? 1000 : 1500;

export function askHellMove(moves: HellPoint[], timeMs: number): Promise<HellPoint> {
  // Only positions in order of play: the engine works out whose stone is whose from that, as a player would.
  const points = moves.map(({ row, col }) => ({ row, col }));
  const fallback = () => import('@/lib/blindGomokuHell').then((m) => m.chooseHellMove(points, Math.min(timeMs, 600)));
  if (typeof Worker === 'undefined') return fallback();
  try {
    worker ??= new Worker(new URL('../../lib/blindGomokuHell.worker.ts', import.meta.url), { type: 'module' });
  } catch {
    return fallback();
  }
  const w = worker;
  const id = ++seq;
  return new Promise((resolve) => {
    const done = () => { w.removeEventListener('message', onMessage); w.removeEventListener('error', onError); };
    const onMessage = (event: MessageEvent<HellPoint & { id: number }>) => {
      if (event.data.id !== id) return;
      done();
      resolve({ row: event.data.row, col: event.data.col });
    };
    const onError = () => {
      done();
      w.terminate();
      if (worker === w) worker = null;
      resolve(fallback());
    };
    w.addEventListener('message', onMessage);
    w.addEventListener('error', onError);
    w.postMessage({ id, moves: points, timeMs });
  });
}

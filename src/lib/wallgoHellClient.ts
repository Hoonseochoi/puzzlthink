// Runs the 벽바둑 "매우 어려움" search in a Web Worker (falls back to the main thread if workers are unavailable).
import type { HellRequest, HellResult } from './wallgoHell';

let worker: Worker | null = null;
let seq = 0;
const pending = new Map<number, (result: HellResult | 'failed') => void>();

/** About 1.5 s of thinking on desktop, 1 s on phones and tablets. */
export const hellTimeMs = () => (typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches ? 1000 : 1500);

function dropWorker() {
  worker?.terminate();
  worker = null;
  for (const resolve of pending.values()) resolve('failed');
  pending.clear();
}

function getWorker(): Worker | null {
  if (worker) return worker;
  if (typeof Worker === 'undefined') return null;
  try {
    worker = new Worker(new URL('./wallgoHell.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event: MessageEvent<{ id: number; result: HellResult }>) => {
      const resolve = pending.get(event.data.id);
      pending.delete(event.data.id);
      resolve?.(event.data.result);
    };
    worker.onerror = () => dropWorker();
    return worker;
  } catch {
    worker = null;
    return null;
  }
}

async function onMainThread(request: HellRequest) {
  const { hellSearch } = await import('./wallgoHell');
  return hellSearch(request);
}

export async function askHell(request: Omit<HellRequest, 'timeMs'>): Promise<HellResult> {
  const full: HellRequest = { ...request, timeMs: hellTimeMs() };
  const target = getWorker();
  if (!target) return onMainThread(full);
  const id = ++seq;
  const result = await new Promise<HellResult | 'failed'>((resolve) => { pending.set(id, resolve); target.postMessage({ id, request: full }); });
  return result === 'failed' ? onMainThread(full) : result;
}

/** Stops a search nobody is waiting for any more (new game, left the page). */
export function cancelHell() {
  if (!pending.size) return;
  const waiting = [...pending.values()];
  pending.clear();
  worker?.terminate();
  worker = null;
  for (const resolve of waiting) resolve(null);
}

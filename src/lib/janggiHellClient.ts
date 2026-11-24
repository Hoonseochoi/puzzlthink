// Asks the 십이장기 hell AI for a move: in a Web Worker when the browser allows, else on the main thread.
import { playableActions, replayStates, type Action, type JanggiState } from './janggi';
import { chooseHellAction, hellBudgetMs } from './janggiHell';

let worker: Worker | null = null;
let failed = false;
let nextId = 0;
const waiting = new Map<number, (action: Action | null | undefined) => void>();

function getWorker(): Worker | null {
  if (worker || failed || typeof Worker === 'undefined') return worker;
  try {
    worker = new Worker(new URL('./janggiHell.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event: MessageEvent<{ id: number; action: Action | null }>) => {
      waiting.get(event.data.id)?.(event.data.action);
      waiting.delete(event.data.id);
    };
    worker.onerror = () => { failed = true; worker?.terminate(); worker = null; for (const [, done] of waiting) done(undefined); waiting.clear(); };
  } catch { failed = true; worker = null; }
  return worker;
}

const onMainThread = (state: JanggiState) => chooseHellAction(state, playableActions(state), replayStates(state), { budgetMs: hellBudgetMs() })?.action ?? null;

export function requestHellAction(state: JanggiState): Promise<Action | null> {
  const w = getWorker();
  if (!w) return Promise.resolve(onMainThread(state));
  return new Promise((resolve) => {
    const id = ++nextId;
    // A worker that died mid-search answers `undefined`: fall back to thinking here.
    waiting.set(id, (action) => resolve(action === undefined ? onMainThread(state) : action));
    w.postMessage({ id, state, budgetMs: hellBudgetMs() });
  });
}

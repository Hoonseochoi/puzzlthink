// Web Worker for the 러시아장기 hell AI: the search runs here so the board never freezes.
import { replayStates, type RJState } from './russianJanggi';
import { chooseHellAction } from './russianJanggiHell';

type Request = { id: number; state: RJState; budgetMs: number };

self.onmessage = (event: MessageEvent<Request>) => {
  const { id, state, budgetMs } = event.data;
  self.postMessage({ id, action: chooseHellAction(state, { budgetMs, history: replayStates(state) }).action });
};

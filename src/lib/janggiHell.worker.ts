// Web Worker for the 십이장기 hell AI: the search runs here so the board never freezes.
import { playableActions, replayStates, type JanggiState } from './janggi';
import { chooseHellAction } from './janggiHell';

type Request = { id: number; state: JanggiState; budgetMs: number };

self.onmessage = (event: MessageEvent<Request>) => {
  const { id, state, budgetMs } = event.data;
  const result = chooseHellAction(state, playableActions(state), replayStates(state), { budgetMs });
  self.postMessage({ id, action: result?.action ?? null });
};

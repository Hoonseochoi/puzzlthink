// Web Worker for the Blind Gomoku hell engine: the search runs here so the page never freezes.
// It is sent only the stone positions in the order they were played (no owners, no colours).
import { chooseHellMove, type HellPoint } from './blindGomokuHell';

type Request = { id: number; moves: HellPoint[]; timeMs: number };
const ctx = self as unknown as { onmessage: ((event: MessageEvent<Request>) => void) | null; postMessage: (message: unknown) => void };

ctx.onmessage = (event) => {
  const { id, moves, timeMs } = event.data;
  ctx.postMessage({ id, ...chooseHellMove(moves, timeMs) });
};

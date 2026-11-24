// Web Worker for the 컬러 링크 AI: its placement search runs the solver a few thousand times.
// It is sent only the board (nothing in this game is hidden).
import { type CldAiRequest, cldAiAnswer } from './colorLinkDuelAi';

const ctx = self as unknown as { onmessage: ((event: MessageEvent<CldAiRequest & { id: number }>) => void) | null; postMessage: (message: unknown) => void };

ctx.onmessage = (event) => {
  const { id, ...request } = event.data;
  ctx.postMessage({ id, result: cldAiAnswer(request) });
};

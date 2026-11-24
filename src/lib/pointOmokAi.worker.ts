// Web Worker for the 포인트 오목 어려움 AI (the bid search samples hundreds of bids per option).
// It is sent only the public table and the AI's own bids.
import { chooseBets, chooseTriple, type PoAiView } from './pointOmokAi';

type Request = { id: number; kind: 'triple' | 'bets'; view: PoAiView };
const ctx = self as unknown as { onmessage: ((event: MessageEvent<Request>) => void) | null; postMessage: (message: unknown) => void };

ctx.onmessage = (event) => {
  const { id, kind, view } = event.data;
  ctx.postMessage({ id, result: kind === 'triple' ? chooseTriple(view) : chooseBets(view) });
};

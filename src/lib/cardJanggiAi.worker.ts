// Web Worker for the 카드 장기 AI: the search takes a second or two, so it runs off the page's thread.
// It is sent only the game as the AI's seat sees it (the player's face-down cards are not in it).
import type { CjGame, CjSeat } from './cardJanggi';
import { chooseLayout, chooseMove } from './cardJanggiAi';

type Request = { id: number; kind: 'layout' | 'move'; game: CjGame; me: CjSeat; budget?: number };
const ctx = self as unknown as { onmessage: ((event: MessageEvent<Request>) => void) | null; postMessage: (message: unknown) => void };

ctx.onmessage = (event) => {
  const { id, kind, game, me, budget } = event.data;
  ctx.postMessage({ id, result: kind === 'layout' ? chooseLayout(game, me, budget) : chooseMove(game, me, budget) });
};

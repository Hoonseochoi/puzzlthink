import type { GameId } from '@/lib/gameCatalog';
import { prepareHostedRoom } from '@/hooks/useWallGoRoom';
import { prepareHeavy13Room } from '@/hooks/useHeavy13Room';
import { prepareJanggiRoom } from '@/hooks/useJanggiRoom';
import { prepareRussianRouletteRoom } from '@/hooks/useRussianRouletteRoom';
import { prepareRussianJanggiRoom } from '@/hooks/useRussianJanggiRoom';

/** One way to start against the AI (or alone). `label` is a GameGate message key; `query` goes on the URL. */
export type PlayOption = { label: string; query?: string };
/** One kind of friend room. `create` picks a free invite code and makes this browser the host. */
export type RoomOption = { label: string; create: () => Promise<string> };

/** What each game's entry screen offers. Rooms live at `${path}/room/${code}`. */
export const GAME_MODES: Record<GameId, { path: string; solo?: boolean; ai: PlayOption[]; rooms: RoomOption[] }> = {
  wallgo: {
    path: '/wallgo',
    ai: [{ label: 'aiThree', query: 'mode=three' }, { label: 'aiTwo', query: 'mode=two' }],
    rooms: [{ label: 'roomTwo', create: () => prepareHostedRoom('two') }, { label: 'roomThree', create: () => prepareHostedRoom('three') }],
  },
  heavy13: { path: '/heavy13', ai: [{ label: 'aiPlay' }], rooms: [{ label: 'roomCreate', create: prepareHeavy13Room }] },
  janggi: { path: '/janggi', ai: [{ label: 'aiPlay' }], rooms: [{ label: 'roomCreate', create: prepareJanggiRoom }] },
  russianRoulette: { path: '/russian-roulette', ai: [{ label: 'aiPlay' }], rooms: [{ label: 'roomCreate', create: prepareRussianRouletteRoom }] },
  russianJanggi: { path: '/russian-janggi', ai: [{ label: 'aiPlay' }], rooms: [{ label: 'roomCreate', create: prepareRussianJanggiRoom }] },
  sudoku: { path: '/play', solo: true, ai: [{ label: 'soloPlay' }], rooms: [] },
};

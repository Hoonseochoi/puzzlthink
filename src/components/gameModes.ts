import type { GameId } from '@/lib/gameCatalog';
import type { BaseRoom, Peer } from '@/lib/room';
import type { RoomStatus } from '@/hooks/useRealtimeRoom';
import { useWallGoRoom } from '@/hooks/useWallGoRoom';
import { useHeavy13Room } from '@/hooks/useHeavy13Room';
import { useJanggiRoom } from '@/hooks/useJanggiRoom';
import { useRussianRouletteRoom } from '@/hooks/useRussianRouletteRoom';
import { useRussianJanggiRoom } from '@/hooks/useRussianJanggiRoom';
import { useBlindGomokuRoom } from '@/hooks/useBlindGomokuRoom';
import { useNemoRoom } from '@/hooks/useNemoRoom';
import { useLaserJanggiRoom } from '@/hooks/useLaserJanggiRoom';
import { useBlackWhiteRoom } from '@/hooks/useBlackWhiteRoom';
import { useBlackWhite2Room } from '@/hooks/useBlackWhite2Room';
import { preparePiggyRoom, usePiggyRoom } from '@/hooks/usePiggyRoom';
import { prepareHostedRoom } from '@/hooks/useWallGoRoom';
import { prepareHeavy13Room } from '@/hooks/useHeavy13Room';
import { prepareJanggiRoom } from '@/hooks/useJanggiRoom';
import { prepareRussianRouletteRoom } from '@/hooks/useRussianRouletteRoom';
import { prepareRussianJanggiRoom } from '@/hooks/useRussianJanggiRoom';
import { prepareBlindGomokuRoom } from '@/hooks/useBlindGomokuRoom';
import { prepareNemoRoom } from '@/hooks/useNemoRoom';
import { prepareLaserJanggiRoom } from '@/hooks/useLaserJanggiRoom';
import { prepareBlackWhiteRoom } from '@/hooks/useBlackWhiteRoom';
import { prepareBlackWhite2Room } from '@/hooks/useBlackWhite2Room';

/** One way to start against the AI (or alone). `label` is a GameGate message key; `query` goes on the URL. */
export type PlayOption = { label: string; query?: string };
/**
 * One kind of friend room. `create` picks a free invite code and makes this browser the host.
 * `play`: the solo game to play while an open room waits (an `ai` query). `openMin`: people needed to start it as an open room (empty seats go to the AI); left out = every seat.
 */
export type RoomOption = { label: string; create: () => Promise<string>; openMin?: number; play?: string };

/** What the open-room panel needs from any game's room hook. */
export type RoomView = {
  status: RoomStatus; state: (BaseRoom & { playerCount?: number; ai?: boolean[] }) | null; peers: Peer[]; hostOnline: boolean;
  me: { id: string; name: string; isHost: boolean } | null;
  dispatch(action: { t: 'start' }): void;
  emote(text: string): void;
};
export type RoomHook = (code: string, defaultName: string) => RoomView;

/** What each game's entry screen offers. Rooms live at `${path}/room/${code}`. */
export const GAME_MODES: Record<GameId, { path: string; solo?: boolean; ai: PlayOption[]; rooms: RoomOption[]; useRoom?: RoomHook }> = {
  piggyBank: { path: '/piggy-bank', ai: [{ label: 'aiFour' }], rooms: [{ label: 'roomFour', create: preparePiggyRoom, openMin: 1 }], useRoom: usePiggyRoom },
  nemoCount: {
    path: '/nemo-count', solo: true,
    ai: [{ label: 'nemoChallenge', query: 'mode=challenge' }, { label: 'nemoPractice', query: 'mode=practice' }, { label: 'nemoTutorial', query: 'mode=tutorial' }],
    rooms: [{ label: 'nemoRoom', create: prepareNemoRoom, openMin: 2, play: 'mode=practice' }], useRoom: useNemoRoom,
  },
  blackWhite: { path: '/black-white', ai: [{ label: 'aiTwo' }], rooms: [{ label: 'roomTwo', create: prepareBlackWhiteRoom }], useRoom: useBlackWhiteRoom },
  blackWhite2: { path: '/black-white-2', ai: [{ label: 'aiTwo' }], rooms: [{ label: 'roomTwo', create: prepareBlackWhite2Room }], useRoom: useBlackWhite2Room },
  laserJanggi: { path: '/laser-janggi', ai: [{ label: 'aiPlay' }], rooms: [{ label: 'roomCreate', create: prepareLaserJanggiRoom }], useRoom: useLaserJanggiRoom },
  blindGomoku: { path: '/blind-gomoku', ai: [{ label: 'aiTwo' }], rooms: [{ label: 'roomTwo', create: prepareBlindGomokuRoom }], useRoom: useBlindGomokuRoom },
  wallgo: {
    path: '/wallgo',
    ai: [{ label: 'aiThree', query: 'mode=three' }, { label: 'aiTwo', query: 'mode=two' }],
    rooms: [{ label: 'roomTwo', create: () => prepareHostedRoom('two'), play: 'mode=two' }, { label: 'roomThree', create: () => prepareHostedRoom('three'), play: 'mode=three' }],
    useRoom: useWallGoRoom,
  },
  heavy13: { path: '/heavy13', ai: [{ label: 'aiPlay' }], rooms: [{ label: 'roomCreate', create: prepareHeavy13Room, openMin: 1 }], useRoom: useHeavy13Room },
  janggi: { path: '/janggi', ai: [{ label: 'aiPlay' }], rooms: [{ label: 'roomCreate', create: prepareJanggiRoom }], useRoom: useJanggiRoom },
  russianRoulette: { path: '/russian-roulette', ai: [{ label: 'aiPlay' }], rooms: [{ label: 'roomCreate', create: prepareRussianRouletteRoom, openMin: 1 }], useRoom: useRussianRouletteRoom },
  russianJanggi: { path: '/russian-janggi', ai: [{ label: 'aiPlay' }], rooms: [{ label: 'roomCreate', create: prepareRussianJanggiRoom }], useRoom: useRussianJanggiRoom },
  sudoku: { path: '/play', solo: true, ai: [{ label: 'soloPlay' }], rooms: [] },
};

/** Where an open room is played from: the game page in solo play with the waiting room open. */
export function openRoomHref(game: GameId, code: string, variant: number) {
  const modes = GAME_MODES[game];
  const play = modes.rooms[variant]?.play ?? modes.ai[0]?.query;
  return `${modes.path}?${play ? `${play}&` : ''}open=${code}&v=${variant}#play`;
}

import type { GameId } from '@/lib/gameCatalog';
import type { BaseRoom, Peer } from '@/lib/room';
import type { RoomStatus } from '@/hooks/useRealtimeRoom';
import { useWallGoRoom } from '@/hooks/useWallGoRoom';
import { useHeavy13Room } from '@/hooks/useHeavy13Room';
import { useJanggiRoom } from '@/hooks/useJanggiRoom';
import { useRussianRouletteRoom } from '@/hooks/useRussianRouletteRoom';
import { useRussianJanggiRoom } from '@/hooks/useRussianJanggiRoom';
import { useBlindGomokuRoom } from '@/hooks/useBlindGomokuRoom';
import { prepareMorrisRoom, useMorrisRoom } from '@/hooks/useMorrisRoom';
import { prepareFlipOmokRoom, useFlipOmokRoom } from '@/hooks/useFlipOmokRoom';
import { useNemoRoom } from '@/hooks/useNemoRoom';
import { prepareHexagonRoom, useHexagonRoom } from '@/hooks/useHexagonRoom';
import { useLaserJanggiRoom } from '@/hooks/useLaserJanggiRoom';
import { useBlackWhiteRoom } from '@/hooks/useBlackWhiteRoom';
import { useBlackWhite2Room } from '@/hooks/useBlackWhite2Room';
import { preparePiggyRoom, usePiggyRoom } from '@/hooks/usePiggyRoom';
import { prepareGyulhapRoom, useGyulhapRoom } from '@/hooks/useGyulhapRoom';
import { prepareIndianPokerRoom, useIndianPokerRoom } from '@/hooks/useIndianPokerRoom';
import { prepareSlitherRoom, useSlitherRoom } from '@/hooks/useSlitherRoom';
import { prepareHostedRoom, prepareWallGo2Room, useWallGo2Room } from '@/hooks/useWallGoRoom';
import { prepareHeavy13Room } from '@/hooks/useHeavy13Room';
import { prepareJanggiRoom } from '@/hooks/useJanggiRoom';
import { prepareRussianRouletteRoom } from '@/hooks/useRussianRouletteRoom';
import { prepareRussianJanggiRoom } from '@/hooks/useRussianJanggiRoom';
import { prepareBlindGomokuRoom } from '@/hooks/useBlindGomokuRoom';
import { prepareNemoRoom } from '@/hooks/useNemoRoom';
import { prepareLaserJanggiRoom } from '@/hooks/useLaserJanggiRoom';
import { prepareBlackWhiteRoom } from '@/hooks/useBlackWhiteRoom';
import { prepareBlackWhite2Room } from '@/hooks/useBlackWhite2Room';
import { prepareMonorailRoom, useMonorailRoom } from '@/hooks/useMonorailRoom';
import { prepareLogicRoom, prepareMasyuRoom, prepareNonogramRoom, prepareStarBattleRoom, useBinairoRoom, useColorLinkRoom, useMagicSwapRoom, useMasyuRoom, useOneStrokeRoom, useNonogramRoom, useStarBattleRoom } from '@/hooks/useLogicRoom';
import { prepareFourThreeRoom, useFourThreeRoom } from '@/hooks/useFourThreeRoom';
import { prepareMerge2048Room, useMerge2048Room } from '@/hooks/useMerge2048Room';
import { preparePointOmokRoom, usePointOmokRoom } from '@/hooks/usePointOmokRoom';
import { prepareTwoSidedPokerRoom, useTwoSidedPokerRoom } from '@/hooks/useTwoSidedPokerRoom';
import { prepareHitStayRoom, useHitStayRoom } from '@/hooks/useHitStayRoom';
import { prepareSniperHoldemRoom, useSniperHoldemRoom } from '@/hooks/useSniperHoldemRoom';
import { prepareCardJanggiRoom, useCardJanggiRoom } from '@/hooks/useCardJanggiRoom';
import { prepareGradationRoom, useGradationRoom } from '@/hooks/useGradationRoom';
import { prepareColorLinkDuelRoom, useColorLinkDuelRoom } from '@/hooks/useColorLinkDuelRoom';
import { prepareEquationSignalRoom, useEquationSignalRoom } from '@/hooks/useEquationSignalRoom';
import { prepareEquationTowerRoom, useEquationTowerRoom } from '@/hooks/useEquationTowerRoom';
import { prepareHiddenWordRoom } from '@/hooks/useHiddenWordRoom';

/** One way to start against the AI (or alone). `label` is a GameGate message key; `query` goes on the URL. */
export type PlayOption = { label: string; query?: string };
/**
 * One kind of friend room. `create` picks a free invite code and makes this browser the host.
 * `play`: the solo game to play while an open room waits. `openMin`: people needed to start it as an open room; left out = every seat.
 * `fillAi`: whether the start button should describe empty seats as AI seats.
 */
export type RoomOption = { label: string; create: () => Promise<string>; openMin?: number; play?: string; fillAi?: boolean };

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
  // The AI match runs on the server (hw_* functions). Friend rooms only (no useRoom, so no open rooms): the host's
  // browser holds the hidden words, which is fine between friends.
  hiddenWord: { path: '/hidden-word', ai: [{ label: 'hwAi' }], rooms: [{ label: 'roomTwo', create: prepareHiddenWordRoom }] },
  pointOmok: {
    path: '/point-omok', ai: [{ label: 'poNormal', query: 'difficulty=normal' }, { label: 'poHard', query: 'difficulty=hard' }],
    rooms: [{ label: 'roomTwo', create: preparePointOmokRoom }], useRoom: usePointOmokRoom,
  },
  equationSignal: {
    path: '/equation-signal', solo: true,
    ai: [{ label: 'eqsChallenge', query: 'mode=challenge' }, { label: 'eqsPractice', query: 'mode=practice' }],
    rooms: [{ label: 'eqRoom', create: prepareEquationSignalRoom, openMin: 2, play: 'mode=practice', fillAi: false }], useRoom: useEquationSignalRoom,
  },
  equationTower: {
    path: '/equation-tower', solo: true,
    ai: [{ label: 'eqtChallenge', query: 'mode=challenge' }, { label: 'eqtPractice', query: 'mode=practice' }],
    rooms: [{ label: 'eqRoom', create: prepareEquationTowerRoom, openMin: 2, play: 'mode=practice', fillAi: false }], useRoom: useEquationTowerRoom,
  },
  gradation: { path: '/gradation', ai: [{ label: 'grAi' }], rooms: [{ label: 'roomTwo', create: prepareGradationRoom }], useRoom: useGradationRoom },
  cardJanggi: { path: '/card-janggi', ai: [{ label: 'cjAi' }], rooms: [{ label: 'roomTwo', create: prepareCardJanggiRoom }], useRoom: useCardJanggiRoom },
  colorLinkDuel: { path: '/color-link-duel', ai: [{ label: 'cldNormal', query: 'difficulty=normal' }, { label: 'cldHard', query: 'difficulty=hard' }, { label: 'cldHell', query: 'difficulty=hell' }], rooms: [{ label: 'roomTwo', create: prepareColorLinkDuelRoom }], useRoom: useColorLinkDuelRoom },
  sniperHoldem: {
    path: '/sniper-holdem',
    ai: [{ label: 'shNormal', query: 'difficulty=normal' }, { label: 'shHard', query: 'difficulty=hard' }, { label: 'shDuel', query: 'difficulty=hard&players=2' }],
    rooms: [{ label: 'shRoom', create: prepareSniperHoldemRoom, openMin: 2 }], useRoom: useSniperHoldemRoom,
  },
  hitStay: { path: '/hit-stay', ai: [{ label: 'hsAi' }], rooms: [{ label: 'hsRoom', create: prepareHitStayRoom, openMin: 2 }], useRoom: useHitStayRoom },
  merge2048: {
    path: '/2048', solo: true, ai: [{ label: 'm2Free', query: 'mode=free' }, { label: 'm2Endless', query: 'mode=endless' }],
    rooms: [{ label: 'm2Room', create: prepareMerge2048Room, openMin: 2, play: 'mode=free', fillAi: false }], useRoom: useMerge2048Room,
  },
  fourThree: {
    path: '/four-three', ai: [{ label: 'ftAi' }],
    rooms: [{ label: 'ftRoom', create: () => prepareFourThreeRoom(window.location.pathname.startsWith('/en') ? 'en' : 'ko'), openMin: 2 }], useRoom: useFourThreeRoom,
  },
  binairo: {
    path: '/binairo', solo: true, ai: [{ label: 'logicNew', query: 'mode=challenge' }, { label: 'logicBeat', query: 'mode=beat' }, { label: 'binairoPractice', query: 'mode=practice' }],
    rooms: [{ label: 'logicRoom', create: () => prepareLogicRoom('binairo'), openMin: 2, play: 'mode=practice', fillAi: false }], useRoom: useBinairoRoom,
  },
  onestroke: {
    path: '/one-stroke', solo: true, ai: [{ label: 'logicNew', query: 'mode=challenge' }, { label: 'logicBeat', query: 'mode=beat' }, { label: 'onestrokePractice', query: 'mode=practice' }],
    rooms: [{ label: 'logicRoom', create: () => prepareLogicRoom('onestroke'), openMin: 2, play: 'mode=practice', fillAi: false }], useRoom: useOneStrokeRoom,
  },
  magicswap: {
    path: '/magic-square', solo: true, ai: [{ label: 'logicNew', query: 'mode=challenge' }, { label: 'logicBeat', query: 'mode=beat' }, { label: 'magicswapPractice', query: 'mode=practice' }],
    rooms: [{ label: 'logicRoom', create: () => prepareLogicRoom('magicswap'), openMin: 2, play: 'mode=practice', fillAi: false }], useRoom: useMagicSwapRoom,
  },
  colorlink: {
    path: '/color-link', solo: true, ai: [{ label: 'logicNew', query: 'mode=challenge' }, { label: 'logicBeat', query: 'mode=beat' }, { label: 'colorlinkPractice', query: 'mode=practice' }],
    rooms: [{ label: 'logicRoom', create: () => prepareLogicRoom('colorlink'), openMin: 2, play: 'mode=practice', fillAi: false }], useRoom: useColorLinkRoom,
  },
  starbattle: {
    path: '/star-battle', solo: true, ai: [{ label: 'logicNew', query: 'mode=challenge' }, { label: 'logicBeat', query: 'mode=beat' }, { label: 'starbattlePractice', query: 'mode=practice' }],
    rooms: [{ label: 'logicRoom', create: prepareStarBattleRoom, openMin: 2, play: 'mode=practice', fillAi: false }], useRoom: useStarBattleRoom,
  },
  masyu: {
    path: '/masyu', solo: true, ai: [{ label: 'logicNew', query: 'mode=challenge' }, { label: 'logicBeat', query: 'mode=beat' }, { label: 'masyuPractice', query: 'mode=practice' }],
    rooms: [{ label: 'logicRoom', create: prepareMasyuRoom, openMin: 2, play: 'mode=practice', fillAi: false }], useRoom: useMasyuRoom,
  },
  nonogram: {
    path: '/nonogram', solo: true, ai: [{ label: 'logicNew', query: 'mode=challenge' }, { label: 'logicBeat', query: 'mode=beat' }, { label: 'nonogramPractice', query: 'mode=practice' }],
    rooms: [{ label: 'logicRoom', create: prepareNonogramRoom, openMin: 2, play: 'mode=practice', fillAi: false }], useRoom: useNonogramRoom,
  },
  twoSidedPoker: { path: '/two-sided-poker', ai: [{ label: 'aiPlay' }], rooms: [{ label: 'roomTwo', create: prepareTwoSidedPokerRoom }], useRoom: useTwoSidedPokerRoom },
  monorail: { path: '/monorail', ai: [{ label: 'aiNormal', query: 'difficulty=normal' }, { label: 'aiHard', query: 'difficulty=hard' }], rooms: [{ label: 'roomTwo', create: prepareMonorailRoom }], useRoom: useMonorailRoom },
  flipOmok: { path: '/flip-omok', ai: [{ label: 'aiTwo' }], rooms: [{ label: 'roomTwo', create: prepareFlipOmokRoom }], useRoom: useFlipOmokRoom },
  nineMensMorris: { path: '/nine-mens-morris', ai: [{ label: 'aiTwo' }], rooms: [{ label: 'roomTwo', create: prepareMorrisRoom }], useRoom: useMorrisRoom },
  wallgo2: {
    path: '/wallgo-2',
    ai: [{ label: 'aiThree', query: 'mode=three' }, { label: 'aiTwo', query: 'mode=two' }],
    rooms: [{ label: 'roomTwo', create: () => prepareWallGo2Room('two'), play: 'mode=two' }, { label: 'roomThree', create: () => prepareWallGo2Room('three'), play: 'mode=three' }],
    useRoom: useWallGo2Room,
  },
  slitherlink: {
    path: '/slitherlink', solo: true, ai: [{ label: 'slitherNew', query: 'mode=challenge' }, { label: 'slitherBeat', query: 'mode=beat' }, { label: 'slitherPractice', query: 'mode=practice' }],
    rooms: [{ label: 'slitherRoom', create: prepareSlitherRoom, openMin: 2, play: 'mode=practice', fillAi: false }], useRoom: useSlitherRoom,
  },
  gyulhap: {
    path: '/gyulhap', solo: true,
    ai: [{ label: 'gyulChallenge10', query: 'mode=challenge10' }, { label: 'gyulChallenge5', query: 'mode=challenge5' }, { label: 'gyulPractice', query: 'mode=practice' }],
    rooms: [{ label: 'gyulRoom', create: prepareGyulhapRoom, openMin: 2, play: 'mode=practice', fillAi: false }], useRoom: useGyulhapRoom,
  },
  indianPoker: { path: '/indian-poker', ai: [{ label: 'aiTwo' }], rooms: [{ label: 'roomTwo', create: prepareIndianPokerRoom }], useRoom: useIndianPokerRoom },
  hexagon: {
    path: '/hexagon', solo: true,
    ai: [{ label: 'hexSolo', query: 'mode=solo' }, { label: 'hexChallenge', query: 'mode=challenge' }],
    rooms: [{ label: 'hexRoom', create: prepareHexagonRoom, openMin: 2, play: 'mode=solo' }], useRoom: useHexagonRoom,
  },
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

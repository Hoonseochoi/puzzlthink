"use client";

import type { LogicGameId } from '@/lib/logicPuzzles';
import { type LogicAction, type LogicRoom, createLogicRoom, reduceLogicRoom, syncLogicSeats } from '@/lib/logicRoom';
import { type RoomEngine, prepareRoom, useRealtimeRoom } from './useRealtimeRoom';

const engine = (game: LogicGameId): RoomEngine<LogicRoom, LogicAction> => ({
  channel: `${game}-room`, storage: `puzzlthink_${game}`,
  create: (value, host) => (value === game ? createLogicRoom(game, host) : null),
  restorable: (saved) => saved?.game === game && Array.isArray(saved?.seats) && Array.isArray(saved.solvedMs) && typeof saved.seed === 'number',
  reduce: reduceLogicRoom, syncSeats: syncLogicSeats,
  running: () => false, timeoutAction: { t: 'noop' },
});

export const MASYU_ROOM = engine('masyu');
export const NONOGRAM_ROOM = engine('nonogram');
const ENGINES = { masyu: MASYU_ROOM, nonogram: NONOGRAM_ROOM };

export const prepareMasyuRoom = () => prepareRoom(MASYU_ROOM.channel, MASYU_ROOM.storage, 'masyu');
export const prepareNonogramRoom = () => prepareRoom(NONOGRAM_ROOM.channel, NONOGRAM_ROOM.storage, 'nonogram');
export const useMasyuRoom = (code: string, defaultName: string) => useRealtimeRoom(MASYU_ROOM, code, defaultName);
export const useNonogramRoom = (code: string, defaultName: string) => useRealtimeRoom(NONOGRAM_ROOM, code, defaultName);
/** For the shared room view: the room hook of one game (the game never changes while the view is mounted). */
export const useLogicRoom = (game: LogicGameId, code: string, defaultName: string) => useRealtimeRoom(ENGINES[game], code, defaultName);

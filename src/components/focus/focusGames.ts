import type { GameId } from '@/lib/gameCatalog';
import type { StakeKind } from './focusStore';

/** Solo logic puzzles: leaving loses the board being solved ('puzzle'); their 기록 도전 runs count as failed ('challenge'). */
const PUZZLES = new Set<GameId>(['slitherlink', 'binairo', 'onestroke', 'magicswap', 'colorlink', 'starbattle', 'masyu', 'nonogram', 'sudoku']);
/** Games played with the on-screen keyboard: no real fullscreen on Android (the keyboard and the resize fight it). */
const TYPING = new Set<GameId>(['hiddenWord', 'hiddenWordPlus', 'hiddenWordLiar', 'equationSignal', 'equationTower', 'propositionGo']);

/** What leaving a game GameGate opened would cost, from how it was started (the URL's mode). */
export function focusKindFor(game: GameId, search: string): StakeKind | false {
  const mode = new URLSearchParams(search).get('mode');
  if (mode === 'practice') return false; // 연습: nothing to lose
  if (mode === 'challenge' || mode === 'beat') return 'challenge';
  return PUZZLES.has(game) ? 'puzzle' : 'game';
}

export const focusFullscreen = (game: GameId) => !TYPING.has(game);

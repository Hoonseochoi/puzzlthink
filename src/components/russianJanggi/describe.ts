import type { Action, RJState } from '@/lib/russianJanggi';

export const cellName = (i: number) => `${'ABC'[i % 3]}${3 - Math.floor(i / 3)}`;

export function describeAction(t: (key: string, values?: Record<string, string | number>) => string, before: RJState, action: Action, player: string) {
  if (action.kind === 'pass') return t('logTimeout', { player });
  const covered = before.board[action.to][before.board[action.to].length - 1];
  const cup = action.kind === 'move' ? before.board[action.from][before.board[action.from].length - 1] : { size: action.size };
  const size = t(`size_${cup.size}`);
  if (action.kind === 'move') {
    return covered
      ? t('logMoveCover', { player, size, from: cellName(action.from), cell: cellName(action.to), target: t(`size_${covered.size}`) })
      : t('logMove', { player, size, from: cellName(action.from), cell: cellName(action.to) });
  }
  return covered
    ? t('logCover', { player, size, cell: cellName(action.to), target: t(`size_${covered.size}`) })
    : t('logPlace', { player, size, cell: cellName(action.to) });
}

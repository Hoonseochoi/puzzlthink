import type { GameId } from '@/lib/gameCatalog';

// Games whose card says what just changed, in place of NEW (home tiles, the web home and the originals row).
// The value is the Common message key: 뒤집기 오목 「전략적 뒤집기」 (11/28) → 룰 변경; 레이저 장기's show board (11/28) → 패치;
// 수식 신호등's 1:1 출제 대결 (11/28) → 1:1 모드 추가.
export const CHANGED_TAG: Partial<Record<GameId, 'ruleChangeTag' | 'patchTag' | 'duelModeTag'>> = {
  flipOmok: 'ruleChangeTag',
  laserJanggi: 'patchTag',
  equationSignal: 'duelModeTag',
};

// Single source for the game list used by the header dropdown, the games page and the footer.
// Order: by plays on 2026-11-23 (KST), most played first; 카드 장기 (new) is pinned 2nd, 컬러 링크 (new) 3rd, 수식 신호등 (new) 4th, 수식의 탑 (new) 5th, Hit,Stay 6th, 그라데이션 7th, 포인트 오목 8th, 마방진 스왑 9th and 2048 10th.
export type GameId = 'sniperHoldem' | 'hiddenWord' | 'hiddenWordPlus' | 'equationSignal' | 'equationTower' | 'gradation' | 'cardJanggi' | 'colorLinkDuel' | 'hitStay' | 'timeAuction' | 'mineOblivion' | 'pointOmok' | 'merge2048' | 'magicswap' | 'fourThree' | 'binairo' | 'onestroke' | 'colorlink' | 'starbattle' | 'masyu' | 'nonogram' | 'twoSidedPoker' | 'monorail' | 'flipOmok' | 'nineMensMorris' | 'wallgo2' | 'slitherlink' | 'gyulhap' | 'indianPoker' | 'hexagon' | 'piggyBank' | 'nemoCount' | 'blackWhite' | 'blackWhite2' | 'laserJanggi' | 'blindGomoku' | 'wallgo' | 'russianRoulette' | 'heavy13' | 'janggi' | 'russianJanggi' | 'sudoku';
// Order: by plays on 2026-11-23 (KST), most played first; 컬러 링크 (new) is pinned 2nd, Hit,Stay (new) 3rd, 포인트 오목 (new) 3rd, 마방진 스왑 5th and 2048 (new) 7th.

export interface CatalogGame {
  id: GameId;
  /** Route of the playable page. */
  href: '/sniper-holdem' | '/hidden-word' | '/hidden-word-plus' | '/equation-signal' | '/equation-tower' | '/gradation' | '/card-janggi' | '/color-link-duel' | '/hit-stay' | '/time-auction' | '/mine-of-oblivion' | '/point-omok' | '/2048' | '/magic-square' | '/four-three' | '/binairo' | '/one-stroke' | '/color-link' | '/star-battle' | '/masyu' | '/nonogram' | '/two-sided-poker' | '/monorail' | '/flip-omok' | '/nine-mens-morris' | '/wallgo-2' | '/slitherlink' | '/gyulhap' | '/indian-poker' | '/hexagon' | '/piggy-bank' | '/nemo-count' | '/black-white' | '/black-white-2' | '/laser-janggi' | '/blind-gomoku' | '/wallgo' | '/russian-roulette' | '/heavy13' | '/janggi' | '/russian-janggi' | '/play';
  /** Accent color, matching the home page cards. */
  color: string;
  /** Whether the game page renders a long-form guide below the board (anchored at #guide). */
  hasGuide: boolean;
  /**
   * AI 헬모드 ('매우 어려움', difficulty id 'hell'). `query` is put before `difficulty=hell` on the start link
   * (벽바둑 counts 1:1 only). `live` = the hell AI is on main (all five since #173–#175); while false the game shows as 준비 중 and no link points at it.
   */
  hell?: { query?: string; live: boolean };
}

export const GAMES: readonly CatalogGame[] = [
  // 망각의 지뢰 (new, 11/28): pinned first while it is the newest release.
  { id: 'mineOblivion', href: '/mine-of-oblivion', color: '#ffb020', hasGuide: true },
  // 히든 워드 확장판 (new, 11/27).
  { id: 'hiddenWordPlus', href: '/hidden-word-plus', color: '#b79cff', hasGuide: true },
  { id: 'slitherlink', href: '/slitherlink', color: '#8f7cff', hasGuide: true },
  { id: 'hiddenWord', href: '/hidden-word', color: '#a8ef70', hasGuide: true },
  { id: 'sniperHoldem', href: '/sniper-holdem', color: '#ff4f5e', hasGuide: true },
  { id: 'cardJanggi', href: '/card-janggi', color: '#b07cff', hasGuide: true },
  { id: 'colorLinkDuel', href: '/color-link-duel', color: '#7c6cff', hasGuide: true, hell: { live: true } },
  { id: 'equationSignal', href: '/equation-signal', color: '#b6e33a', hasGuide: true },
  { id: 'equationTower', href: '/equation-tower', color: '#f08c5a', hasGuide: true },
  { id: 'hitStay', href: '/hit-stay', color: '#6f7dff', hasGuide: true },
  { id: 'timeAuction', href: '/time-auction', color: '#ff3b30', hasGuide: true },
  { id: 'gradation', href: '/gradation', color: '#3fd67a', hasGuide: true },
  { id: 'pointOmok', href: '/point-omok', color: '#ff5d8f', hasGuide: true },
  { id: 'wallgo2', href: '/wallgo-2', color: '#e0283a', hasGuide: true, hell: { query: 'mode=two', live: true } },
  { id: 'magicswap', href: '/magic-square', color: '#e45bd6', hasGuide: true },
  { id: 'colorlink', href: '/color-link', color: '#21c2b5', hasGuide: true },
  { id: 'merge2048', href: '/2048', color: '#ff8fa3', hasGuide: true },
  { id: 'wallgo', href: '/wallgo', color: '#ff6b4a', hasGuide: true, hell: { query: 'mode=two', live: true } },
  { id: 'onestroke', href: '/one-stroke', color: '#ff8a2b', hasGuide: true },
  { id: 'starbattle', href: '/star-battle', color: '#ffc23d', hasGuide: true },
  { id: 'janggi', href: '/janggi', color: '#e8a33c', hasGuide: true, hell: { live: true } },
  { id: 'heavy13', href: '/heavy13', color: '#c9a061', hasGuide: true },
  { id: 'russianJanggi', href: '/russian-janggi', color: '#e2283c', hasGuide: true, hell: { live: true } },
  { id: 'twoSidedPoker', href: '/two-sided-poker', color: '#9b87ff', hasGuide: false },
  { id: 'monorail', href: '/monorail', color: '#f3b64a', hasGuide: true },
  { id: 'indianPoker', href: '/indian-poker', color: '#e6b94f', hasGuide: true },
  { id: 'blackWhite', href: '/black-white', color: '#2b2b31', hasGuide: true },
  { id: 'nonogram', href: '/nonogram', color: '#3fcf6a', hasGuide: true },
  { id: 'flipOmok', href: '/flip-omok', color: '#3fb8ff', hasGuide: true },
  { id: 'binairo', href: '/binairo', color: '#3f8cff', hasGuide: true },
  { id: 'blackWhite2', href: '/black-white-2', color: '#ef3340', hasGuide: true },
  { id: 'blindGomoku', href: '/blind-gomoku', color: '#d39b2f', hasGuide: true, hell: { live: true } },
  { id: 'nineMensMorris', href: '/nine-mens-morris', color: '#3ec9d6', hasGuide: true },
  { id: 'masyu', href: '/masyu', color: '#ff4d5e', hasGuide: true },
  { id: 'russianRoulette', href: '/russian-roulette', color: '#238ca8', hasGuide: true },
  { id: 'nemoCount', href: '/nemo-count', color: '#7d86a8', hasGuide: true },
  { id: 'fourThree', href: '/four-three', color: '#ffb52e', hasGuide: true },
  { id: 'sudoku', href: '/play', color: '#4b7bff', hasGuide: true },
  { id: 'gyulhap', href: '/gyulhap', color: '#ffcf3f', hasGuide: true },
  { id: 'laserJanggi', href: '/laser-janggi', color: '#28b9d7', hasGuide: true },
  { id: 'piggyBank', href: '/piggy-bank', color: '#e0a91c', hasGuide: true },
  { id: 'hexagon', href: '/hexagon', color: '#e8b04a', hasGuide: true },
];

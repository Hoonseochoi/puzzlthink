// Single source for the game list used by the header dropdown, the games page and the footer.
export type GameId = 'slitherlink' | 'gyulhap' | 'indianPoker' | 'hexagon' | 'piggyBank' | 'nemoCount' | 'blackWhite' | 'blackWhite2' | 'laserJanggi' | 'blindGomoku' | 'wallgo' | 'russianRoulette' | 'heavy13' | 'janggi' | 'russianJanggi' | 'sudoku';

export interface CatalogGame {
  id: GameId;
  /** Route of the playable page. */
  href: '/slitherlink' | '/gyulhap' | '/indian-poker' | '/hexagon' | '/piggy-bank' | '/nemo-count' | '/black-white' | '/black-white-2' | '/laser-janggi' | '/blind-gomoku' | '/wallgo' | '/russian-roulette' | '/heavy13' | '/janggi' | '/russian-janggi' | '/play';
  /** Accent color, matching the home page cards. */
  color: string;
  /** Whether the game page renders a long-form guide below the board (anchored at #guide). */
  hasGuide: boolean;
}

export const GAMES: readonly CatalogGame[] = [
  { id: 'slitherlink', href: '/slitherlink', color: '#8f7cff', hasGuide: true },
  { id: 'piggyBank', href: '/piggy-bank', color: '#e0a91c', hasGuide: true },
  { id: 'nemoCount', href: '/nemo-count', color: '#7d86a8', hasGuide: true },
  { id: 'heavy13', href: '/heavy13', color: '#c9a061', hasGuide: true },
  { id: 'russianRoulette', href: '/russian-roulette', color: '#238ca8', hasGuide: true },
  { id: 'wallgo', href: '/wallgo', color: '#ff6b4a', hasGuide: true },
  { id: 'gyulhap', href: '/gyulhap', color: '#ffcf3f', hasGuide: true },
  { id: 'indianPoker', href: '/indian-poker', color: '#e6b94f', hasGuide: true },
  { id: 'hexagon', href: '/hexagon', color: '#e8b04a', hasGuide: true },
  { id: 'blackWhite', href: '/black-white', color: '#2b2b31', hasGuide: true },
  { id: 'blackWhite2', href: '/black-white-2', color: '#ef3340', hasGuide: true },
  { id: 'laserJanggi', href: '/laser-janggi', color: '#28b9d7', hasGuide: true },
  { id: 'blindGomoku', href: '/blind-gomoku', color: '#d39b2f', hasGuide: true },
  { id: 'janggi', href: '/janggi', color: '#e8a33c', hasGuide: true },
  { id: 'russianJanggi', href: '/russian-janggi', color: '#e2283c', hasGuide: true },
  { id: 'sudoku', href: '/play', color: '#4b7bff', hasGuide: true },
];

// Single source for the game list used by the header dropdown, the games page and the footer.
export type GameId = 'blindGomoku' | 'wallgo' | 'russianRoulette' | 'heavy13' | 'janggi' | 'russianJanggi' | 'sudoku';

export interface CatalogGame {
  id: GameId;
  /** Route of the playable page. */
  href: '/blind-gomoku' | '/wallgo' | '/russian-roulette' | '/heavy13' | '/janggi' | '/russian-janggi' | '/play';
  /** Accent color, matching the home page cards. */
  color: string;
  /** Whether the game page renders a long-form guide below the board (anchored at #guide). */
  hasGuide: boolean;
}

export const GAMES: readonly CatalogGame[] = [
  { id: 'blindGomoku', href: '/blind-gomoku', color: '#d39b2f', hasGuide: true },
  { id: 'wallgo', href: '/wallgo', color: '#ff6b4a', hasGuide: true },
  { id: 'russianRoulette', href: '/russian-roulette', color: '#238ca8', hasGuide: true },
  { id: 'heavy13', href: '/heavy13', color: '#c9a061', hasGuide: true },
  { id: 'janggi', href: '/janggi', color: '#e8a33c', hasGuide: true },
  { id: 'russianJanggi', href: '/russian-janggi', color: '#e2283c', hasGuide: true },
  { id: 'sudoku', href: '/play', color: '#4b7bff', hasGuide: true },
];

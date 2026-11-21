// Single source for the game list used by the header dropdown, the games page and the footer.
// Order: by how often each is played (벽바둑 II right after 벽바둑), matching the home cards. 뒤집기 오목 stays last while its rules settle.
export type GameId = 'monorail' | 'flipOmok' | 'nineMensMorris' | 'wallgo2' | 'slitherlink' | 'gyulhap' | 'indianPoker' | 'hexagon' | 'piggyBank' | 'nemoCount' | 'blackWhite' | 'blackWhite2' | 'laserJanggi' | 'blindGomoku' | 'wallgo' | 'russianRoulette' | 'heavy13' | 'janggi' | 'russianJanggi' | 'sudoku';

export interface CatalogGame {
  id: GameId;
  /** Route of the playable page. */
  href: '/monorail' | '/flip-omok' | '/nine-mens-morris' | '/wallgo-2' | '/slitherlink' | '/gyulhap' | '/indian-poker' | '/hexagon' | '/piggy-bank' | '/nemo-count' | '/black-white' | '/black-white-2' | '/laser-janggi' | '/blind-gomoku' | '/wallgo' | '/russian-roulette' | '/heavy13' | '/janggi' | '/russian-janggi' | '/play';
  /** Accent color, matching the home page cards. */
  color: string;
  /** Whether the game page renders a long-form guide below the board (anchored at #guide). */
  hasGuide: boolean;
}

export const GAMES: readonly CatalogGame[] = [
  { id: 'monorail', href: '/monorail', color: '#f3b64a', hasGuide: true },
  { id: 'slitherlink', href: '/slitherlink', color: '#8f7cff', hasGuide: true },
  { id: 'wallgo', href: '/wallgo', color: '#ff6b4a', hasGuide: true },
  { id: 'wallgo2', href: '/wallgo-2', color: '#e0283a', hasGuide: true },
  { id: 'russianJanggi', href: '/russian-janggi', color: '#e2283c', hasGuide: true },
  { id: 'janggi', href: '/janggi', color: '#e8a33c', hasGuide: true },
  { id: 'heavy13', href: '/heavy13', color: '#c9a061', hasGuide: true },
  { id: 'indianPoker', href: '/indian-poker', color: '#e6b94f', hasGuide: true },
  { id: 'blackWhite', href: '/black-white', color: '#2b2b31', hasGuide: true },
  { id: 'blindGomoku', href: '/blind-gomoku', color: '#d39b2f', hasGuide: true },
  { id: 'blackWhite2', href: '/black-white-2', color: '#ef3340', hasGuide: true },
  { id: 'russianRoulette', href: '/russian-roulette', color: '#238ca8', hasGuide: true },
  { id: 'sudoku', href: '/play', color: '#4b7bff', hasGuide: true },
  { id: 'nineMensMorris', href: '/nine-mens-morris', color: '#3ec9d6', hasGuide: true },
  { id: 'nemoCount', href: '/nemo-count', color: '#7d86a8', hasGuide: true },
  { id: 'laserJanggi', href: '/laser-janggi', color: '#28b9d7', hasGuide: true },
  { id: 'gyulhap', href: '/gyulhap', color: '#ffcf3f', hasGuide: true },
  { id: 'hexagon', href: '/hexagon', color: '#e8b04a', hasGuide: true },
  { id: 'piggyBank', href: '/piggy-bank', color: '#e0a91c', hasGuide: true },
  { id: 'flipOmok', href: '/flip-omok', color: '#3fb8ff', hasGuide: true },
];

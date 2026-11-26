import type { MetadataRoute } from 'next';
import { GAMES } from '@/lib/gameCatalog';
import { gameFromSlug } from '@/lib/rankings';
import { HELL_LIVE } from '@/lib/hell';
import { GUIDES, guidePath } from '@/content/guides';
import { LEGACY_GUIDES } from '@/content/guides/legacy';

const BASE_URL = 'https://www.puzzlthink.com';
const locales = ['ko', 'en'] as const;
// Game pages come from the catalog, so a new game is listed automatically.
const GAME_PATHS: string[] = GAMES.map((game) => game.href);
const PAGES: { path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' }[] = [
  { path: '', priority: 1, changeFrequency: 'daily' },
  ...GAME_PATHS.map((path) => ({ path, priority: 0.9, changeFrequency: 'weekly' as const })),
  { path: '/games', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/game-list', priority: 0.7, changeFrequency: 'weekly' },
  // AI 헬모드: listed once a hell AI is live.
  ...(HELL_LIVE.length ? [{ path: '/hell', priority: 0.8, changeFrequency: 'daily' as const }] : []),
  { path: '/logic-puzzles', priority: 0.8, changeFrequency: 'weekly' },
  // Guide pages: the hub, then every guide (the 8 logic-puzzle pages and each one registered in src/content/guides).
  { path: '/guides', priority: 0.8, changeFrequency: 'weekly' },
  ...[...LEGACY_GUIDES.map((g) => g.path), ...GUIDES.map((g) => guidePath(g.game))].map((path) => ({ path, priority: 0.7, changeFrequency: 'monthly' as const })),
  { path: '/records', priority: 0.5, changeFrequency: 'daily' },
  { path: '/icons', priority: 0.4, changeFrequency: 'daily' },
  ...GAME_PATHS.map((path) => (path === '/play' ? 'sudoku' : path.slice(1))).filter((slug) => gameFromSlug(slug)).map((slug) => ({ path: `/ranking/${slug}`, priority: 0.6, changeFrequency: 'daily' as const })),
  { path: '/about', priority: 0.3, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/privacy-policy', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.2, changeFrequency: 'yearly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(); // the site is rebuilt on every deploy
  return PAGES.flatMap(({ path, priority, changeFrequency }) => locales.map((locale) => ({
    url: `${BASE_URL}/${locale}${path}`,
    lastModified,
    changeFrequency,
    priority: locale === 'ko' ? priority : Math.round(priority * 0.9 * 10) / 10,
    alternates: { languages: { ko: `${BASE_URL}/ko${path}`, en: `${BASE_URL}/en${path}`, 'x-default': `${BASE_URL}/ko${path}` } },
  })));
}

import type { MetadataRoute } from 'next';
import { GAMES } from '@/lib/gameCatalog';
import { gameFromSlug } from '@/lib/rankings';

const BASE_URL = 'https://www.puzzlthink.com';
const locales = ['ko', 'en'] as const;
// Game pages come from the catalog, so a new game is listed automatically.
const GAME_PATHS: string[] = GAMES.map((game) => game.href);
const PAGES: { path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' }[] = [
  { path: '', priority: 1, changeFrequency: 'daily' },
  ...GAME_PATHS.map((path) => ({ path, priority: 0.9, changeFrequency: 'weekly' as const })),
  { path: '/games', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/slitherlink/guide', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/masyu/guide', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/nonogram/guide', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/records', priority: 0.5, changeFrequency: 'daily' },
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

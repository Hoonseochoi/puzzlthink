import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.puzzlthink.com';
const locales = ['ko', 'en'] as const;
const paths = ['', '/laser-janggi', '/blind-gomoku', '/wallgo', '/russian-roulette', '/heavy13', '/janggi', '/russian-janggi', '/play', '/games', '/records', '/about', '/contact', '/privacy-policy', '/terms'];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.flatMap((path) => locales.map((locale) => ({
    url: `${BASE_URL}/${locale}${path}`,
    changeFrequency: path === '' || path === '/laser-janggi' || path === '/blind-gomoku' || path === '/wallgo' || path === '/russian-roulette' || path === '/heavy13' || path === '/janggi' || path === '/russian-janggi' || path === '/play' || path === '/games' ? 'weekly' as const : 'yearly' as const,
    priority: path === '' ? 1 : path === '/laser-janggi' || path === '/blind-gomoku' || path === '/wallgo' || path === '/russian-roulette' || path === '/heavy13' || path === '/janggi' || path === '/russian-janggi' || path === '/play' ? 0.9 : path === '/games' ? 0.7 : 0.3,
    alternates: {
      languages: {
        ko: `${BASE_URL}/ko${path}`,
        en: `${BASE_URL}/en${path}`,
      },
    },
  })));
}

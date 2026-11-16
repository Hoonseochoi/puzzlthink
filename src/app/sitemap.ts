import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.puzzlthink.com';
const locales = ['ko', 'en'] as const;
const paths = ['', '/wallgo', '/heavy13', '/janggi', '/play', '/records', '/about', '/contact', '/privacy-policy', '/terms'];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.flatMap((path) => locales.map((locale) => ({
    url: `${BASE_URL}/${locale}${path}`,
    changeFrequency: path === '' || path === '/wallgo' || path === '/heavy13' || path === '/janggi' || path === '/play' ? 'weekly' as const : 'yearly' as const,
    priority: path === '' ? 1 : path === '/wallgo' || path === '/heavy13' || path === '/janggi' || path === '/play' ? 0.9 : 0.3,
    alternates: {
      languages: {
        ko: `${BASE_URL}/ko${path}`,
        en: `${BASE_URL}/en${path}`,
      },
    },
  })));
}

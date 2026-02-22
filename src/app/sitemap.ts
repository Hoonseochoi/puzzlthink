import { MetadataRoute } from 'next';

const BASE_URL = 'https://puzzlthink.com';
const locales = ['en', 'ko'];

export default function sitemap(): MetadataRoute.Sitemap {
    const paths = [
        '',
        '/play',
        '/sudoku-tip',
        '/sudoku-print',
        '/about',
        '/contact',
        '/privacy-policy',
        '/terms',
    ];

    const sitemapEntries: MetadataRoute.Sitemap = [];

    locales.forEach((locale) => {
        paths.forEach((path) => {
            const isDefault = locale === 'ko';
            const url = isDefault && path === ''
                ? BASE_URL
                : `${BASE_URL}/${locale}${path}`;

            sitemapEntries.push({
                url,
                lastModified: new Date(),
                changeFrequency: path === '' || path === '/play' ? 'daily' : 'monthly',
                priority: path === '' ? 1 : path === '/play' ? 0.9 : 0.5,
            });
        });
    });

    return sitemapEntries;
}

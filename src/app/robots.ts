import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Friend-room pages are private, per-game links (they also carry noindex).
      { userAgent: '*', allow: '/', disallow: ['/api/', '/*/room/'] },
    ],
    sitemap: 'https://www.puzzlthink.com/sitemap.xml',
    host: 'https://www.puzzlthink.com',
  };
}

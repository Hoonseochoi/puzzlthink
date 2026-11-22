import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Friend-room pages are private, per-game links (they also carry noindex).
      // Ranking share images under /api/ranking/ stay open so previews and image search can use them.
      { userAgent: '*', allow: ['/', '/api/ranking/'], disallow: ['/api/', '/*/room/'] },
    ],
    sitemap: 'https://www.puzzlthink.com/sitemap.xml',
    host: 'https://www.puzzlthink.com',
  };
}

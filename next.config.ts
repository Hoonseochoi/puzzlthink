import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin();

// Icons and the manifest were served with max-age=0, so browsers re-requested them on every page load.
// Icon links carry a content hash (?icon.<hash>.png), so a long browser cache is safe.
const LONG = [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }];
const DAY = [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: '/favicon.ico', headers: LONG },
      { source: '/icon.png', headers: LONG },
      { source: '/apple-icon.png', headers: LONG },
      { source: '/icons/:path*', headers: DAY },
      { source: '/manifest.webmanifest', headers: DAY },
    ];
  },
};

export default withNextIntl(nextConfig);

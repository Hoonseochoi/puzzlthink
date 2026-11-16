import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'PUZZLTHINK — 두뇌 게임',
    short_name: 'PUZZLTHINK',
    description: '벽바둑, 장기, 무거운 13, 러시안 룰렛, 스도쿠를 AI·친구와 바로 플레이',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f3f0e8',
    theme_color: '#f3f0e8',
    lang: 'ko',
    categories: ['games', 'puzzle', 'entertainment'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}

// One place for page metadata: canonical URL, hreflang (ko/en + x-default), Open Graph, Twitter card
// and keywords, so every page is described to search engines and link previews the same way.
// Link-preview images come from each route's opengraph-image file (Next adds them automatically).
import type { Metadata } from 'next';

export const SITE_URL = 'https://www.puzzlthink.com';
export const SITE_NAME = 'PUZZLTHINK';

export function pageMetadata({ locale, path = '', title, description, keywords, noIndex = false }: {
  locale: string; path?: string; title: string; description: string; keywords?: string[]; noIndex?: boolean;
}): Metadata {
  const url = `${SITE_URL}/${locale}${path}`;
  const ogTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
      languages: { ko: `${SITE_URL}/ko${path}`, en: `${SITE_URL}/en${path}`, 'x-default': `${SITE_URL}/ko${path}` },
    },
    openGraph: {
      type: 'website', url, siteName: SITE_NAME, title: ogTitle, description,
      locale: locale === 'en' ? 'en_US' : 'ko_KR', alternateLocale: locale === 'en' ? ['ko_KR'] : ['en_US'],
    },
    twitter: { card: 'summary_large_image', title: ogTitle, description },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  };
}

/** The TV programme a game is from, for structured data (`isBasedOn`). */
export const SHOWS = {
  dp1: { ko: '데블스 플랜', en: "The Devil's Plan" },
  dp3: { ko: '데블스 플랜: 데드 어게인', en: "The Devil's Plan: Dead Again" },
  genius2: { ko: '더 지니어스: 룰 브레이커', en: 'The Genius: Rule Breaker' },
  genius34: { ko: '더 지니어스', en: 'The Genius' },
  society2: { ko: '소사이어티 게임 2', en: 'The Society Game 2' },
} as const;
export type ShowId = keyof typeof SHOWS;

/** VideoGame structured data shared by every game page. */
export function gameJsonLd({ locale, path, name, alternateName, description, genre, players, show }: {
  locale: string; path: string; name: string; alternateName: string[]; description: string; genre: string[];
  players: { min: number; max: number }; show?: ShowId;
}) {
  return {
    '@type': 'VideoGame', name, alternateName, description, url: `${SITE_URL}/${locale}${path}`, inLanguage: locale,
    genre, gamePlatform: ['Web browser', 'PC', 'Mobile'], applicationCategory: 'GameApplication', operatingSystem: 'Any',
    playMode: players.max > 1 ? ['SinglePlayer', 'MultiPlayer'] : ['SinglePlayer'],
    numberOfPlayers: { '@type': 'QuantitativeValue', minValue: players.min, maxValue: players.max },
    isAccessibleForFree: true, offers: { '@type': 'Offer', price: 0, priceCurrency: 'KRW' },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    ...(show ? { isBasedOn: { '@type': 'TVSeries', name: SHOWS[show][locale === 'en' ? 'en' : 'ko'] } } : {}),
  };
}

export const faqJsonLd = (faq: { q: string; a: string }[]) => ({
  '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

export const breadcrumbJsonLd = (locale: string, items: { name: string; path: string }[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: `${SITE_URL}/${locale}${item.path}` })),
});

import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import CardJanggiGame from '@/components/cardJanggi/CardJanggiGame';
import CjPreview from '@/components/cardJanggi/CjPreview';
import { CJ_ACCENT, CJ_INK } from '@/components/cardJanggi/copy';
import { breadcrumbJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

const COPY = {
  ko: {
    title: '카드 장기 — 데블스 플랜: 데드 어게인 결승전 1회차 매치',
    description: '「데블스 플랜: 데드 어게인」(시즌 3) 결승전 1회차 매치 카드 장기. 쥐·말·원숭이·코끼리·기린 행마 카드 5장의 순서를 몰래 정해 상대 큰 말을 잡거나 진영에 먼저 들어가세요. 어려움 AI, 친구 1:1, 오픈 1:1.',
    keywords: ['카드 장기', '카드장기', '데블스 플랜 결승', '데블스 플랜 3 결승전', '데드 어게인 결승', '행마 카드', '데블스 플랜 게임'],
  },
  en: {
    title: "Card Janggi — The Devil's Plan: Dead Again final, match 1",
    description: "Card Janggi, the first match of the final in The Devil's Plan: Dead Again (season 3). Lay out five movement cards in secret — rat, horse, monkey, elephant, giraffe — and take the enemy king or reach its square first. Hard AI, friend 1:1, open 1:1.",
    keywords: ['Card Janggi', "The Devil's Plan final", 'Dead Again final', 'movement card game'],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = COPY[locale === 'en' ? 'en' : 'ko'];
  return pageMetadata({ locale, path: '/card-janggi', title: c.title, description: c.description, keywords: c.keywords });
}

export default async function CardJanggiPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = COPY[locale === 'en' ? 'en' : 'ko'];
  const hero = (
    <div className="grid items-center gap-8 md:grid-cols-[1fr_260px]">
      <GameIntroHero locale={locale} id="cardJanggi" />
      <CjPreview />
    </div>
  );
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
      gameJsonLd({ locale, path: '/card-janggi', name: c.title, alternateName: ['카드 장기', '카드장기', 'Card Janggi'], description: c.description, genre: ['Strategy', 'Board game'], players: { min: 1, max: 2 }, show: 'dp3' }),
      breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: c.title.split(' — ')[0], path: '/card-janggi' }]),
    ] }} />
    <GameGate game="cardJanggi" accent={CJ_ACCENT} ink={CJ_INK} hero={hero}>
      <CardJanggiGame />
    </GameGate>
  </>;
}

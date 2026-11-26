import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';
import GameArticle, { guideFaq } from '@/components/guide/GameArticle';
import HexagonGame from '@/components/hexagon/HexagonGame';
import { HexagonTutorialSteps } from '@/components/hexagon/HexagonTutorial';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Hexagon' });
  return pageMetadata({ locale, path: '/hexagon', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
}

export default async function HexagonPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Hexagon' });
  const faq = guideFaq('hexagon', locale)!; // the FAQ GameArticle shows below the board
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
      gameJsonLd({ locale, path: '/hexagon', name: t('metaTitle'), alternateName: ['헥사곤', '헥사곤 게임', 'Hexagon'], description: t('metaDescription'), genre: ['Puzzle', 'Memory'], players: { min: 1, max: 4 }, show: 'dp1' }),
      faqJsonLd(faq),
      breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: t('metaTitle').split(' — ')[0], path: '/hexagon' }]),
    ] }} />
    <GameGate game="hexagon" accent="#e8b04a" ink="#1c1406" hero={<GameIntroHero locale={locale} id="hexagon" />} tutorial={<HexagonTutorialSteps />} guide={<GameArticle locale={locale} game="hexagon" />}>
      <HexagonGame />
    </GameGate>
  </>;
}

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';
import GameArticle, { guideFaq } from '@/components/guide/GameArticle';
import LaserJanggiGame from '@/components/laserJanggi/LaserJanggiGame';
import { LaserJanggiTutorialSteps } from '@/components/laserJanggi/LaserJanggiTutorial';


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'LaserJanggi' });
  return pageMetadata({ locale, path: '/laser-janggi', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
}

export default async function LaserJanggiPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'LaserJanggi' });
  const faq = guideFaq('laserJanggi', locale)!; // the FAQ GameArticle shows below the board
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
      gameJsonLd({ locale, path: '/laser-janggi', name: t('metaTitle'), alternateName: ['레이저 장기', '레이저장기', 'Laser Janggi', 'Laser chess'], description: t('metaDescription'), genre: ['Strategy', 'Board game'], players: { min: 1, max: 2 }, show: 'genius2' }),
      faqJsonLd(faq),
      breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: t('metaTitle').split(' — ')[0], path: '/laser-janggi' }]),
    ] }} />
    <GameGate game="laserJanggi" accent="#59e6ff" ink="#041015" hero={<GameIntroHero locale={locale} id="laserJanggi" />} tutorial={<LaserJanggiTutorialSteps />} guide={<GameArticle locale={locale} game="laserJanggi" />}>
      <LaserJanggiGame />
    </GameGate>
  </>;
}

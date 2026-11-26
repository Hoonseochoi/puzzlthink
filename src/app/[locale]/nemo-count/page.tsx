import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';
import GameArticle, { guideFaq } from '@/components/guide/GameArticle';
import NemoGame from '@/components/nemoCount/NemoGame';
import { NemoTutorialSteps } from '@/components/nemoCount/NemoTutorial';


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'NemoCount' });
  return pageMetadata({ locale, path: '/nemo-count', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
}

export default async function NemoCountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'NemoCount' });
  const faq = guideFaq('nemoCount', locale)!; // the FAQ GameArticle shows below the board
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
      gameJsonLd({ locale, path: '/nemo-count', name: t('metaTitle'), alternateName: ['네모 세기', '네모세기', 'Nemo Count'], description: t('metaDescription'), genre: ['Puzzle', 'Brain teaser'], players: { min: 1, max: 6 }, show: 'dp3' }),
      faqJsonLd(faq),
      breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: t('metaTitle').split(' — ')[0], path: '/nemo-count' }]),
    ] }} />
    <GameGate game="nemoCount" accent="#c8d1e6" ink="#151b2c" hero={<GameIntroHero locale={locale} id="nemoCount" />} tutorial={<NemoTutorialSteps />} guide={<GameArticle locale={locale} game="nemoCount" />}>
      <NemoGame />
    </GameGate>
  </>;
}

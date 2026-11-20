import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import MorrisGame from '@/components/morris/MorrisGame';
import { MorrisTutorialSteps } from '@/components/morris/MorrisTutorial';
import TextGuide from '@/components/TextGuide';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Morris' });
  return pageMetadata({ locale, path: '/nine-mens-morris', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
}

export default async function MorrisPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Morris' });
  const g = await getTranslations({ locale, namespace: 'MorrisGuide' });
  const faq = g.raw('faq') as { q: string; a: string }[];
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
      gameJsonLd({ locale, path: '/nine-mens-morris', name: t('metaTitle'), alternateName: ['나인 멘스 모리스', '나인멘스모리스', "Nine Men's Morris", 'Mill', '밀 게임'], description: t('metaDescription'), genre: ['Strategy', 'Board game'], players: { min: 1, max: 2 }, show: 'dp1' }),
      faqJsonLd(faq),
      breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: t('metaTitle').split(' — ')[0], path: '/nine-mens-morris' }]),
    ] }} />
    <GameGate game="nineMensMorris" accent="#3ec9d6" ink="#06191c" hero={<GameIntroHero locale={locale} id="nineMensMorris" />} tutorial={<MorrisTutorialSteps />} guide={<TextGuide locale={locale} namespace="MorrisGuide" />}>
      <MorrisGame />
    </GameGate>
  </>;
}

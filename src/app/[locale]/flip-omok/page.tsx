import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import FlipOmokGame from '@/components/flipOmok/FlipOmokGame';
import { FlipOmokTutorialSteps } from '@/components/flipOmok/FlipOmokTutorial';
import TextGuide from '@/components/TextGuide';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'FlipOmok' });
  return pageMetadata({ locale, path: '/flip-omok', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
}

export default async function FlipOmokPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'FlipOmok' });
  const g = await getTranslations({ locale, namespace: 'FlipOmokGuide' });
  const faq = g.raw('faq') as { q: string; a: string }[];
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
      gameJsonLd({ locale, path: '/flip-omok', name: t('metaTitle'), alternateName: ['뒤집기 오목', '뒤집기오목', 'Flip Omok', '오셀로 오목'], description: t('metaDescription'), genre: ['Strategy', 'Board game'], players: { min: 1, max: 2 } }),
      faqJsonLd(faq),
      breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: t('metaTitle').split(' — ')[0], path: '/flip-omok' }]),
    ] }} />
    <GameGate game="flipOmok" accent="#67e8ff" ink="#06202a" hero={<GameIntroHero locale={locale} id="flipOmok" />} tutorial={<FlipOmokTutorialSteps />} guide={<TextGuide locale={locale} namespace="FlipOmokGuide" />}>
      <FlipOmokGame />
    </GameGate>
  </>;
}

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import TextGuide from '@/components/TextGuide';
import OneStrokeGame from '@/components/oneStroke/OneStrokeGame';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'OneStroke' });
  return pageMetadata({ locale, path: '/one-stroke', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
}

export default async function OneStrokePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'OneStroke' });
  const g = await getTranslations({ locale, namespace: 'OneStrokeGuide' });
  const faq = g.raw('faq') as { q: string; a: string }[];
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
      gameJsonLd({ locale, path: '/one-stroke', name: t('metaTitle'), alternateName: ['규칙 한붓그리기', '한붓그리기 퍼즐', '슬리더링크', 'Slitherlink'], description: t('metaDescription'), genre: ['Puzzle', 'Logic'], players: { min: 1, max: 1 } }),
      faqJsonLd(faq),
      breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: t('title'), path: '/one-stroke' }]),
    ] }} />
    <GameGate game="oneStroke" accent="#8f7cff" ink="#ffffff" hero={<GameIntroHero locale={locale} id="oneStroke" />} guide={<TextGuide locale={locale} namespace="OneStrokeGuide" />}>
      <OneStrokeGame />
    </GameGate>
  </>;
}

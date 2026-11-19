import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import TextGuide from '@/components/TextGuide';
import SlitherGame from '@/components/slitherlink/SlitherGame';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Slitherlink' });
  return pageMetadata({ locale, path: '/slitherlink', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
}

export default async function SlitherlinkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Slitherlink' });
  const g = await getTranslations({ locale, namespace: 'SlitherlinkGuide' });
  const faq = g.raw('faq') as { q: string; a: string }[];
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
      gameJsonLd({ locale, path: '/slitherlink', name: t('metaTitle'), alternateName: ['슬리더링크', 'Slitherlink', '슬리더 링크'], description: t('metaDescription'), genre: ['Puzzle', 'Logic'], players: { min: 1, max: 1 } }),
      faqJsonLd(faq),
      breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: t('title'), path: '/slitherlink' }]),
    ] }} />
    <GameGate game="slitherlink" accent="#8f7cff" ink="#ffffff" hero={<GameIntroHero locale={locale} id="slitherlink" />} guide={<TextGuide locale={locale} namespace="SlitherlinkGuide" />}>
      <SlitherGame />
    </GameGate>
  </>;
}

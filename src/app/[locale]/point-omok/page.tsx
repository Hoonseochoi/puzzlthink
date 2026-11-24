import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import PointOmokGame from '@/components/pointOmok/PointOmokGame';
import { PO_ACCENT, PO_INK } from '@/components/pointOmok/PoParts';
import { PointOmokTutorialSteps } from '@/components/pointOmok/PointOmokTutorial';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import TextGuide from '@/components/TextGuide';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'PointOmok' });
  return pageMetadata({ locale, path: '/point-omok', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
}

export default async function PointOmokPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'PointOmok' });
  const g = await getTranslations({ locale, namespace: 'PointOmokGuide' });
  const faq = g.raw('faq') as { q: string; a: string }[];
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
      gameJsonLd({ locale, path: '/point-omok', name: t('metaTitle'), alternateName: ['포인트 오목', '포인트오목', '배팅 오목', 'Point Omok', 'Point Gomoku'], description: t('metaDescription'), genre: ['Strategy', 'Board game'], players: { min: 1, max: 2 }, show: 'dp4' }),
      faqJsonLd(faq),
      breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: t('metaTitle').split(' — ')[0], path: '/point-omok' }]),
    ] }} />
    <GameGate game="pointOmok" accent={PO_ACCENT} ink={PO_INK} hero={<GameIntroHero locale={locale} id="pointOmok" />} tutorial={<PointOmokTutorialSteps />} guide={<TextGuide locale={locale} namespace="PointOmokGuide" />}>
      <PointOmokGame />
    </GameGate>
  </>;
}

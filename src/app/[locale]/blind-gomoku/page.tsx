import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import BlindGomokuGame from '@/components/blindGomoku/BlindGomokuGame';
import { BlindGomokuTutorialSteps } from '@/components/blindGomoku/BlindGomokuTutorial';
import GameArticle, { guideFaq } from '@/components/guide/GameArticle';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'BlindGomoku' });
  return pageMetadata({ locale, path: '/blind-gomoku', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
}

export default async function BlindGomokuPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'BlindGomoku' });
  const faq = guideFaq('blindGomoku', locale)!; // the FAQ GameArticle shows below the board
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
      gameJsonLd({ locale, path: '/blind-gomoku', name: t('metaTitle'), alternateName: ['블라인드 오목', '블라인드오목', 'Blind Gomoku'], description: t('metaDescription'), genre: ['Strategy', 'Board game'], players: { min: 1, max: 2 }, show: 'dp1' }),
      faqJsonLd(faq),
      breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: t('metaTitle').split(' — ')[0], path: '/blind-gomoku' }]),
    ] }} />
    <GameGate game="blindGomoku" accent="#ffd166" ink="#17120a" hero={<GameIntroHero locale={locale} id="blindGomoku" />} tutorial={<BlindGomokuTutorialSteps />} guide={<GameArticle locale={locale} game="blindGomoku" />}>
      <BlindGomokuGame />
    </GameGate>
  </>;
}

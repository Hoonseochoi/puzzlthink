import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import FourThreeGame from '@/components/fourThree/FourThreeGame';
import { FT_ACCENT, FT_INK } from '@/components/fourThree/FourThreeParts';
import { FourThreeTutorialSteps } from '@/components/fourThree/FourThreeTutorial';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import GameArticle, { guideFaq } from '@/components/guide/GameArticle';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'FourThree' });
  return pageMetadata({ locale, path: '/four-three', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
}

export default async function FourThreePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'FourThree' });
  const faq = guideFaq('fourThree', locale)!; // the FAQ GameArticle shows below the board
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
      gameJsonLd({ locale, path: '/four-three', name: t('metaTitle'), alternateName: ['4인 3목', '4인3목', '사인 삼목', '4 Player 3 In a Row', 'Four Player Tic-Tac-Toe'], description: t('metaDescription'), genre: ['Strategy', 'Board game'], players: { min: 1, max: 3 }, show: 'dp1' }),
      faqJsonLd(faq),
      breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: t('metaTitle').split(' — ')[0], path: '/four-three' }]),
    ] }} />
    <GameGate game="fourThree" accent={FT_ACCENT} ink={FT_INK} hero={<GameIntroHero locale={locale} id="fourThree" />} tutorial={<FourThreeTutorialSteps />} guide={<GameArticle locale={locale} game="fourThree" />}>
      <FourThreeGame />
    </GameGate>
  </>;
}

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import PiggyBankGame from '@/components/piggyBank/PiggyBankGame';
import { PiggyBankTutorialSteps } from '@/components/piggyBank/PiggyBankTutorial';
import GameArticle, { guideFaq } from '@/components/guide/GameArticle';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'PiggyBank' });
  return pageMetadata({ locale, path: '/piggy-bank', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
}

export default async function PiggyBankPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'PiggyBank' });
  const faq = guideFaq('piggyBank', locale)!; // the FAQ GameArticle shows below the board
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
      gameJsonLd({ locale, path: '/piggy-bank', name: t('metaTitle'), alternateName: ['돼지 저금통', '돼지저금통', '데블스 플랜 돼지 저금통', 'Piggy Bank'], description: t('metaDescription'), genre: ['Memory', 'Party game', 'Bluffing'], players: { min: 1, max: 4 }, show: 'dp3' }),
      faqJsonLd(faq),
      breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: t('metaTitle').split(' — ')[0], path: '/piggy-bank' }]),
    ] }} />
    <GameGate game="piggyBank" accent="#ffd84a" ink="#2a1d00" hero={<GameIntroHero locale={locale} id="piggyBank" />} tutorial={<PiggyBankTutorialSteps />} guide={<GameArticle locale={locale} game="piggyBank" />}>
      <PiggyBankGame />
    </GameGate>
  </>;
}

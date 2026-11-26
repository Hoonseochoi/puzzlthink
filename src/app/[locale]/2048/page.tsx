import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import GameArticle, { guideFaq } from '@/components/guide/GameArticle';
import Merge2048Game from '@/components/merge2048/Merge2048Game';
import { M2_ACCENT, M2_INK } from '@/components/merge2048/M2Parts';
import { Merge2048TutorialSteps } from '@/components/merge2048/Merge2048Tutorial';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Merge2048' });
  return pageMetadata({ locale, path: '/2048', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
}

export default async function Merge2048Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Merge2048' });
  const faq = guideFaq('merge2048', locale)!; // the FAQ GameArticle shows below the board
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
      gameJsonLd({ locale, path: '/2048', name: t('metaTitle'), alternateName: ['2048', '2048 게임', '이공사팔', '2048 온라인', '2048 친구', '2048 game', '2048 multiplayer'], description: t('metaDescription'), genre: ['Puzzle', 'Casual'], players: { min: 1, max: 4 } }),
      faqJsonLd(faq),
      breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: '2048', path: '/2048' }]),
    ] }} />
    <GameGate game="merge2048" accent={M2_ACCENT} ink={M2_INK} hero={<GameIntroHero locale={locale} id="merge2048" />} tutorial={<Merge2048TutorialSteps />} guide={<GameArticle locale={locale} game="merge2048" />}>
      <Merge2048Game />
    </GameGate>
  </>;
}

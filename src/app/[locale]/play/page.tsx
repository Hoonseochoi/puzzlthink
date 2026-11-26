import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import { SudokuTutorialSteps } from '@/components/TutorialOverlay';
import PlayClient from '@/components/PlayClient';
import GameArticle, { guideFaq } from '@/components/guide/GameArticle';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Sudoku' });
  return pageMetadata({ locale, path: '/play', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
}

export default async function PlayPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Sudoku' });
  const faq = guideFaq('sudoku', locale)!; // the FAQ GameArticle shows below the board
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
      gameJsonLd({ locale, path: '/play', name: t('metaTitle'), alternateName: ['스도쿠', '온라인 스도쿠', 'Sudoku'], description: t('metaDescription'), genre: ['Puzzle'], players: { min: 1, max: 1 } }),
      faqJsonLd(faq),
      breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: t('metaTitle').split(' — ')[0], path: '/play' }]),
    ] }} />
      <GameGate game="sudoku" accent="#4b7bff" tone="light" tutorialKey="puzzlthink_sudoku_tutorial_seen" hero={<GameIntroHero locale={locale} id="sudoku" tone="light" />} tutorial={<SudokuTutorialSteps />} guide={<GameArticle locale={locale} game="sudoku" />}>
        <Suspense fallback={<div className="min-h-screen bg-[#f3f0e8]" />}><PlayClient /></Suspense>
      </GameGate>
    </>
  );
}

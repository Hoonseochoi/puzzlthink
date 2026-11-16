import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import { SudokuTutorialSteps } from '@/components/TutorialOverlay';
import PlayClient from '@/components/PlayClient';
import SudokuGuide from '@/components/SudokuGuide';
import JsonLd from '@/components/JsonLd';

const BASE_URL = 'https://www.puzzlthink.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Sudoku' });
  const canonical = `${BASE_URL}/${locale}/play`;
  return { title: t('metaTitle'), description: t('description'), alternates: { canonical, languages: { ko: `${BASE_URL}/ko/play`, en: `${BASE_URL}/en/play` } }, openGraph: { title: `${t('metaTitle')} | PUZZLTHINK`, description: t('description'), url: canonical, type: 'website' } };
}

export default async function PlayPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const g = await getTranslations({ locale, namespace: 'SudokuGuide' });
  const faq = g.raw('faq') as { q: string; a: string }[];
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) }} />
      <GameGate game="sudoku" accent="#4b7bff" tone="light" tutorialKey="puzzlthink_sudoku_tutorial_seen" hero={<GameIntroHero locale={locale} id="sudoku" tone="light" />} tutorial={<SudokuTutorialSteps />} guide={<SudokuGuide locale={locale} />}>
        <Suspense fallback={<div className="min-h-screen bg-[#f3f0e8]" />}><PlayClient /></Suspense>
      </GameGate>
    </>
  );
}

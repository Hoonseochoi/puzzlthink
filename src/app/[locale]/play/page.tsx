import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import PlayClient from '@/components/PlayClient';

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
  return <Suspense fallback={<div className="min-h-screen bg-[#f3f0e8]" />}><PlayClient /></Suspense>;
}

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import BlindGomokuGame from '@/components/blindGomoku/BlindGomokuGame';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';

const BASE_URL = 'https://www.puzzlthink.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'BlindGomoku' });
  const canonical = `${BASE_URL}/${locale}/blind-gomoku`;
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical, languages: { ko: `${BASE_URL}/ko/blind-gomoku`, en: `${BASE_URL}/en/blind-gomoku` } },
    openGraph: { title: `${t('metaTitle')} | PUZZLTHINK`, description: t('metaDescription'), url: canonical, siteName: 'PUZZLTHINK', type: 'website' },
  };
}

export default async function BlindGomokuPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'BlindGomoku' });
  const url = `${BASE_URL}/${locale}/blind-gomoku`;
  return <>
    <JsonLd data={{
      '@context': 'https://schema.org',
      '@type': 'VideoGame',
      name: t('metaTitle'),
      alternateName: ['블라인드 오목', 'Blind Gomoku'],
      description: t('metaDescription'),
      url,
      inLanguage: locale,
      genre: ['Strategy', 'Board game', 'Hidden information'],
      gamePlatform: 'Web browser',
      playMode: 'SinglePlayer',
      applicationCategory: 'Game',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
    }} />
    <GameGate game="blindGomoku" accent="#ffd166" ink="#17120a" hero={<GameIntroHero locale={locale} id="blindGomoku" />}>
      <BlindGomokuGame />
    </GameGate>
  </>;
}

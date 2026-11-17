import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import TextGuide from '@/components/TextGuide';
import NemoGame from '@/components/nemoCount/NemoGame';
import { NemoTutorialSteps } from '@/components/nemoCount/NemoTutorial';

const BASE_URL = 'https://www.puzzlthink.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'NemoCount' });
  const canonical = `${BASE_URL}/${locale}/nemo-count`;
  return {
    title: t('metaTitle'), description: t('metaDescription'),
    alternates: { canonical, languages: { ko: `${BASE_URL}/ko/nemo-count`, en: `${BASE_URL}/en/nemo-count` } },
    openGraph: { title: `${t('metaTitle')} | PUZZLTHINK`, description: t('metaDescription'), url: canonical, siteName: 'PUZZLTHINK', type: 'website' },
  };
}

export default async function NemoCountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'NemoCount' });
  const g = await getTranslations({ locale, namespace: 'NemoCountGuide' });
  const faq = g.raw('faq') as { q: string; a: string }[];
  const url = `${BASE_URL}/${locale}/nemo-count`;
  return <>
    <JsonLd data={{
      '@context': 'https://schema.org', '@type': 'VideoGame', name: t('metaTitle'), alternateName: ['네모 세기', 'Nemo Count'],
      description: t('metaDescription'), url, inLanguage: locale, genre: ['Puzzle', 'Brain teaser'], gamePlatform: 'Web browser',
      playMode: ['SinglePlayer', 'MultiPlayer'], numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 6 },
      applicationCategory: 'Game', operatingSystem: 'Any', offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
    }} />
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }} />
    <GameGate game="nemoCount" accent="#c8d1e6" ink="#151b2c" hero={<GameIntroHero locale={locale} id="nemoCount" />} tutorial={<NemoTutorialSteps />} guide={<TextGuide locale={locale} namespace="NemoCountGuide" />}>
      <NemoGame />
    </GameGate>
  </>;
}

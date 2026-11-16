import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import { RussianRouletteTutorialSteps } from '@/components/russianRoulette/RussianRouletteTutorial';
import { RR_ACCENT } from '@/components/russianRoulette/theme';
import JsonLd from '@/components/JsonLd';
import RussianRouletteGame from '@/components/russianRoulette/RussianRouletteGame';

const BASE_URL = 'https://www.puzzlthink.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'RussianRoulette' });
  const canonical = `${BASE_URL}/${locale}/russian-roulette`;
  return {
    title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[],
    alternates: { canonical, languages: { ko: `${BASE_URL}/ko/russian-roulette`, en: `${BASE_URL}/en/russian-roulette` } },
    openGraph: { title: `${t('metaTitle')} | PUZZLTHINK`, description: t('metaDescription'), url: canonical, siteName: 'PUZZLTHINK', type: 'website' },
  };
}

export default async function RussianRoulettePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'RussianRoulette' });
  return <><JsonLd data={{ '@context': 'https://schema.org', '@type': 'VideoGame', name: t('metaTitle'), description: t('metaDescription'), url: `${BASE_URL}/${locale}/russian-roulette`, inLanguage: locale, genre: ['Strategy', 'Deduction', 'Party game'], gamePlatform: 'Web browser', playMode: ['SinglePlayer', 'MultiPlayer'], numberOfPlayers: 5, offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' }, publisher: { '@type': 'Organization', name: 'PUZZLTHINK', url: BASE_URL } }} /><GameGate accent={RR_ACCENT} ink="#04161c" tutorialKey="puzzlthink_russian_roulette_tutorial_seen" hero={<GameIntroHero locale={locale} id="russianRoulette" />} tutorial={<RussianRouletteTutorialSteps />}><RussianRouletteGame /></GameGate></>;
}

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import { ACCENT } from '@/components/russianJanggi/theme';
import RJGame from '@/components/russianJanggi/RJGame';
import { RJTutorialSteps } from '@/components/russianJanggi/RJTutorial';
import TextGuide from '@/components/TextGuide';
import JsonLd from '@/components/JsonLd';

const BASE_URL = 'https://www.puzzlthink.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'RussianJanggi' });
  const canonical = `${BASE_URL}/${locale}/russian-janggi`;
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    keywords: t.raw('keywords') as string[],
    alternates: { canonical, languages: { ko: `${BASE_URL}/ko/russian-janggi`, en: `${BASE_URL}/en/russian-janggi` } },
    openGraph: { title: `${t('metaTitle')} | PUZZLTHINK`, description: t('metaDescription'), url: canonical, siteName: 'PUZZLTHINK', type: 'website' },
  };
}

export default async function RussianJanggiPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'RussianJanggi' });
  const g = await getTranslations({ locale, namespace: 'RussianJanggiGuide' });
  const faq = g.raw('faq') as { q: string; a: string }[];
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        { '@type': 'VideoGame', name: t('metaTitle'), description: t('metaDescription'), url: `${BASE_URL}/${locale}/russian-janggi`, inLanguage: locale, genre: ['Strategy', 'Board game'], gamePlatform: 'Web browser', playMode: ['SinglePlayer', 'MultiPlayer'], numberOfPlayers: 2, offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' }, publisher: { '@type': 'Organization', name: 'PUZZLTHINK', url: BASE_URL } },
        { '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
      ] }} />
      <GameGate accent={ACCENT} ink="#1a1204" hero={<GameIntroHero locale={locale} id="russianJanggi" />} tutorial={<RJTutorialSteps />} guide={<TextGuide locale={locale} namespace="RussianJanggiGuide" />}>
        <RJGame />
      </GameGate>
    </>
  );
}

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import { WallGoTutorialSteps } from '@/components/WallGoTutorial';
import WallGoGame from '@/components/WallGoGame';
import WallGoGuide from '@/components/WallGoGuide';
import JsonLd from '@/components/JsonLd';

const BASE_URL = 'https://www.puzzlthink.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'WallGo' });
  const canonical = `${BASE_URL}/${locale}/wallgo`;
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    keywords: t.raw('keywords') as string[],
    alternates: { canonical, languages: { ko: `${BASE_URL}/ko/wallgo`, en: `${BASE_URL}/en/wallgo` } },
    openGraph: { title: `${t('metaTitle')} | PUZZLTHINK`, description: t('metaDescription'), url: canonical, siteName: 'PUZZLTHINK', type: 'website' },
  };
}

export default async function WallGoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'WallGo' });
  const g = await getTranslations({ locale, namespace: 'WallGoGuide' });
  const url = `${BASE_URL}/${locale}/wallgo`;
  const faq = g.raw('faq') as { q: string; a: string }[];
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'VideoGame', name: t('metaTitle'), alternateName: ['벽바둑', 'Wallgo', 'Wall Go'], description: t('metaDescription'), url, inLanguage: locale, genre: ['Strategy', 'Board game'], gamePlatform: 'Web browser', playMode: 'SinglePlayer', applicationCategory: 'Game', operatingSystem: 'Any', offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' }, publisher: { '@type': 'Organization', name: 'PUZZLTHINK', url: BASE_URL } },
          { '@type': 'FAQPage', mainEntity: faq.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) },
        ],
      }} />
      <GameGate game="wallgo" accent="#e0283a" tutorialKey="puzzlthink_wallgo_tutorial_seen" hero={<GameIntroHero locale={locale} id="wallgo" />} tutorial={<WallGoTutorialSteps />} guide={<WallGoGuide locale={locale} />}>
        <WallGoGame />
      </GameGate>
    </>
  );
}

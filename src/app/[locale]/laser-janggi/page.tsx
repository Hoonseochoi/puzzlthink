import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import TextGuide from '@/components/TextGuide';
import LaserJanggiGame from '@/components/laserJanggi/LaserJanggiGame';
import { LaserJanggiTutorialSteps } from '@/components/laserJanggi/LaserJanggiTutorial';

const BASE_URL = 'https://www.puzzlthink.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'LaserJanggi' });
  const canonical = `${BASE_URL}/${locale}/laser-janggi`;
  return { title: t('metaTitle'), description: t('metaDescription'), alternates: { canonical, languages: { ko: `${BASE_URL}/ko/laser-janggi`, en: `${BASE_URL}/en/laser-janggi` } }, openGraph: { title: `${t('metaTitle')} | PUZZLTHINK`, description: t('metaDescription'), url: canonical, siteName: 'PUZZLTHINK', type: 'website' } };
}

export default async function LaserJanggiPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'LaserJanggi' });
  const g = await getTranslations({ locale, namespace: 'LaserJanggiGuide' });
  const faq = g.raw('faq') as { q: string; a: string }[];
  const url = `${BASE_URL}/${locale}/laser-janggi`;
  return <>
    <JsonLd data={{ '@context':'https://schema.org','@type':'VideoGame',name:t('metaTitle'),alternateName:['레이저 장기','Laser Janggi'],description:t('metaDescription'),url,inLanguage:locale,genre:['Strategy','Board game'],gamePlatform:'Web browser',playMode:['SinglePlayer','MultiPlayer'],numberOfPlayers:2,applicationCategory:'Game',operatingSystem:'Any',offers:{'@type':'Offer',price:0,priceCurrency:'USD'} }} />
    <JsonLd data={{ '@context':'https://schema.org','@type':'FAQPage',mainEntity:faq.map((f)=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}})) }} />
    <GameGate game="laserJanggi" accent="#59e6ff" ink="#041015" hero={<GameIntroHero locale={locale} id="laserJanggi" />} tutorial={<LaserJanggiTutorialSteps />} guide={<TextGuide locale={locale} namespace="LaserJanggiGuide" />}>
      <LaserJanggiGame />
    </GameGate>
  </>;
}

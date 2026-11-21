import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import TextGuide from '@/components/TextGuide';
import MonorailGame from '@/components/monorail/MonorailGame';
import { MonorailTutorialSteps } from '@/components/monorail/MonorailTutorial';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Monorail' });
  return pageMetadata({ locale, path: '/monorail', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
}

export default async function MonorailPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Monorail' });
  const g = await getTranslations({ locale, namespace: 'MonorailGuide' });
  const faq = g.raw('faq') as { q: string; a: string }[];
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
      gameJsonLd({ locale, path: '/monorail', name: t('metaTitle'), alternateName: ['모노레일', 'Monorail', 'Venice Connection'], description: t('metaDescription'), genre: ['Strategy', 'Tile game'], players: { min: 1, max: 2 }, show: 'genius2' }),
      faqJsonLd(faq), breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: t('title'), path: '/monorail' }]),
    ] }} />
    <GameGate game="monorail" accent="#f3b64a" ink="#241607" tutorialKey="puzzlthink_monorail_tutorial" hero={<GameIntroHero locale={locale} id="monorail" />} tutorial={<MonorailTutorialSteps />} guide={<TextGuide locale={locale} namespace="MonorailGuide" />}>
      <MonorailGame />
    </GameGate>
  </>;
}

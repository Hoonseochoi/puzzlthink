import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import { WallGoTutorialSteps } from '@/components/WallGoTutorial';
import WallGoGame from '@/components/WallGoGame';
import TextGuide from '@/components/TextGuide';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'WallGo' });
  return pageMetadata({ locale, path: '/wallgo-2', title: t('v2MetaTitle'), description: t('v2MetaDescription'), keywords: t.raw('v2Keywords') as string[] });
}

/** 벽바둑 II — 데블스플랜3 감옥매치 10화. Same screens and rooms as 벽바둑, with square/round pieces. */
export default async function WallGo2Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'WallGo' });
  const g = await getTranslations({ locale, namespace: 'WallGo2Guide' });
  const faq = g.raw('faq') as { q: string; a: string }[];
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        gameJsonLd({ locale, path: '/wallgo-2', name: t('v2MetaTitle'), alternateName: ['벽바둑 2', '벽바둑2', '벽바둑 II', 'Wall Go 2', 'Wallgo II'], description: t('v2MetaDescription'), genre: ['Strategy', 'Board game'], players: { min: 1, max: 3 }, show: 'dp3' }),
        faqJsonLd(faq),
        breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: t('v2MetaTitle').split(' — ')[0], path: '/wallgo-2' }]),
      ] }} />
      <GameGate game="wallgo2" accent="#e0283a" tutorialKey="puzzlthink_wallgo2_tutorial_seen" hero={<GameIntroHero locale={locale} id="wallgo2" />} tutorial={<WallGoTutorialSteps variant={2} />} guide={<TextGuide locale={locale} namespace="WallGo2Guide" />}>
        <WallGoGame variant={2} />
      </GameGate>
    </>
  );
}

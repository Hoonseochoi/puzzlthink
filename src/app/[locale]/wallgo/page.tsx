import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import { WallGoTutorialSteps } from '@/components/WallGoTutorial';
import WallGoGame from '@/components/WallGoGame';
import GameArticle, { guideFaq } from '@/components/guide/GameArticle';
import WallGoSeriesLink from '@/components/WallGoSeriesLink';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'WallGo' });
  return pageMetadata({ locale, path: '/wallgo', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
}

export default async function WallGoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'WallGo' });
  const faq = guideFaq('wallgo', locale)!; // the FAQ GameArticle shows below the board
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
      gameJsonLd({ locale, path: '/wallgo', name: t('metaTitle'), alternateName: ['벽바둑', '벽바둑 온라인', 'Wall Go', 'Wallgo'], description: t('metaDescription'), genre: ['Strategy', 'Board game'], players: { min: 1, max: 3 }, show: 'dp3' }),
      faqJsonLd(faq),
      breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: t('metaTitle').split(' — ')[0], path: '/wallgo' }]),
    ] }} />
      <GameGate game="wallgo" accent="#e0283a" tutorialKey="puzzlthink_wallgo_tutorial_seen" hero={<GameIntroHero locale={locale} id="wallgo" />} tutorial={<WallGoTutorialSteps />} guide={<GameArticle locale={locale} game="wallgo" extra={<WallGoSeriesLink locale={locale} to="wallgo2" />} />}>
        <WallGoGame />
      </GameGate>
    </>
  );
}

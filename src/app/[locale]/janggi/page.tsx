import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import { JanggiTutorialSteps } from '@/components/janggi/JanggiTutorial';
import { GOLD } from '@/components/janggi/theme';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';
import JanggiGame from '@/components/janggi/JanggiGame';
import GameArticle, { guideFaq } from '@/components/guide/GameArticle';


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Janggi' });
  return pageMetadata({ locale, path: '/janggi', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
}

export default async function JanggiPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Janggi' });
  const faq = guideFaq('janggi', locale)!; // the FAQ GameArticle shows below the board
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
      gameJsonLd({ locale, path: '/janggi', name: t('metaTitle'), alternateName: ['십이장기', '12장기', '십이 장기', 'Sibi Janggi', '12 Janggi'], description: t('metaDescription'), genre: ['Strategy', 'Board game'], players: { min: 1, max: 2 }, show: 'genius34' }),
      faqJsonLd(faq),
      breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: t('metaTitle').split(' — ')[0], path: '/janggi' }]),
    ] }} />
      <GameGate game="janggi" accent={GOLD} ink="#1a1408" tutorialKey="puzzlthink_janggi_tutorial_seen" hero={<GameIntroHero locale={locale} id="janggi" />} tutorial={<JanggiTutorialSteps />} guide={<GameArticle locale={locale} game="janggi" />}>
        <JanggiGame />
      </GameGate>
    </>
  );
}

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import { ACCENT } from '@/components/russianJanggi/theme';
import RJGame from '@/components/russianJanggi/RJGame';
import { RJTutorialSteps } from '@/components/russianJanggi/RJTutorial';
import TextGuide from '@/components/TextGuide';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'RussianJanggi' });
  return pageMetadata({ locale, path: '/russian-janggi', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
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
      gameJsonLd({ locale, path: '/russian-janggi', name: t('metaTitle'), alternateName: ['러시아장기', '러시아 장기', 'Russian Janggi'], description: t('metaDescription'), genre: ['Strategy', 'Board game'], players: { min: 1, max: 2 }, show: 'society2' }),
      faqJsonLd(faq),
      breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: t('metaTitle').split(' — ')[0], path: '/russian-janggi' }]),
    ] }} />
      <GameGate game="russianJanggi" accent={ACCENT} ink="#1a1204" hero={<GameIntroHero locale={locale} id="russianJanggi" />} tutorial={<RJTutorialSteps />} guide={<TextGuide locale={locale} namespace="RussianJanggiGuide" />}>
        <RJGame />
      </GameGate>
    </>
  );
}

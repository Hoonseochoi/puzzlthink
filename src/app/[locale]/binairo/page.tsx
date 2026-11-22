import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import TextGuide from '@/components/TextGuide';
import LogicGame from '@/components/logic/LogicGame';
import { LOGIC } from '@/lib/logicPuzzles';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'BinairoGuide' });
  return pageMetadata({ locale, path: '/binairo', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
}

export default async function BinairoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'BinairoGuide' });
  const tc = await getTranslations({ locale, namespace: 'Common' });
  const faq = t.raw('faq') as { q: string; a: string }[];
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
      gameJsonLd({ locale, path: '/binairo', name: t('metaTitle'), alternateName: t.raw('alternateNames') as string[], description: t('metaDescription'), genre: ['Puzzle', 'Logic'], players: { min: 1, max: 4 } }),
      faqJsonLd(faq),
      breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: tc('binairo'), path: '/binairo' }]),
    ] }} />
    <GameGate game="binairo" accent={LOGIC.binairo.accent} ink={LOGIC.binairo.ink} hero={<GameIntroHero locale={locale} id="binairo" />} guide={<TextGuide locale={locale} namespace="BinairoGuide" />}>
      <LogicGame game="binairo" />
    </GameGate>
  </>;
}

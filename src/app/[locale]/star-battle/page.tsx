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
  const t = await getTranslations({ locale, namespace: 'StarBattleGuide' });
  return pageMetadata({ locale, path: '/star-battle', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
}

export default async function StarBattlePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'StarBattleGuide' });
  const tc = await getTranslations({ locale, namespace: 'Common' });
  const faq = t.raw('faq') as { q: string; a: string }[];
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
      gameJsonLd({ locale, path: '/star-battle', name: t('metaTitle'), alternateName: t.raw('alternateNames') as string[], description: t('metaDescription'), genre: ['Puzzle', 'Logic'], players: { min: 1, max: 4 } }),
      faqJsonLd(faq),
      breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: tc('starbattle'), path: '/star-battle' }]),
    ] }} />
    <GameGate game="starbattle" accent={LOGIC.starbattle.accent} ink={LOGIC.starbattle.ink} hero={<GameIntroHero locale={locale} id="starbattle" />} guide={<TextGuide locale={locale} namespace="StarBattleGuide" />}>
      <LogicGame game="starbattle" />
    </GameGate>
  </>;
}

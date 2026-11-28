import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import TextGuide from '@/components/TextGuide';
import LogicGame from '@/components/logic/LogicGame';
import SiblingGameLink from '@/components/SiblingGameLink';
import { LOGIC } from '@/lib/logicPuzzles';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ColorLinkGuide' });
  return pageMetadata({ locale, path: '/color-link', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
}

export default async function ColorLinkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'ColorLinkGuide' });
  const tc = await getTranslations({ locale, namespace: 'Common' });
  const faq = t.raw('faq') as { q: string; a: string }[];
  const korean = locale !== 'en';
  // 「컬러 잇기」 (this solo puzzle) and 「컬러 링크」 (the Devil's Plan 3 final duel) share a name: link the other one.
  const hero = (
    <div>
      <GameIntroHero locale={locale} id="colorlink" />
      <div className="mt-3"><SiblingGameLink href="/color-link-duel" accent="#7c6cff" name={korean ? '컬러 링크' : 'Color Link Duel'} note={korean ? '데블스플랜3 결승의 1:1 대결은 여기' : "the 1:1 duel from The Devil's Plan 3 final"} /></div>
    </div>
  );
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
      gameJsonLd({ locale, path: '/color-link', name: tc('colorlink'), alternateName: t.raw('alternateNames') as string[], description: t('metaDescription'), genre: ['Puzzle', 'Logic'], players: { min: 1, max: 4 } }),
      faqJsonLd(faq),
      breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: tc('colorlink'), path: '/color-link' }]),
    ] }} />
    <GameGate game="colorlink" accent={LOGIC.colorlink.accent} ink={LOGIC.colorlink.ink} hero={hero} guide={<TextGuide locale={locale} namespace="ColorLinkGuide" />}>
      <LogicGame game="colorlink" />
    </GameGate>
  </>;
}

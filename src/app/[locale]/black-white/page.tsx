import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import BlackWhiteGame from '@/components/blackWhite/BlackWhiteGame';
import { BlackWhiteTutorialSteps } from '@/components/blackWhite/BlackWhiteTutorial';
import GameArticle, { guideFaq } from '@/components/guide/GameArticle';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'BlackWhite' });
  return pageMetadata({ locale, path: '/black-white', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
}

export default async function BlackWhitePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'BlackWhite' });
  const faq = guideFaq('blackWhite', locale)!; // the FAQ GameArticle shows below the board
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
      gameJsonLd({ locale, path: '/black-white', name: t('metaTitle'), alternateName: ['흑과 백', '흑과백', '흑백 게임', 'Black and White'], description: t('metaDescription'), genre: ['Strategy', 'Card game', 'Bluffing'], players: { min: 1, max: 2 }, show: 'genius2' }),
      faqJsonLd(faq),
      breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: t('metaTitle').split(' — ')[0], path: '/black-white' }]),
    ] }} />
    <GameGate game="blackWhite" accent="#e9c46a" ink="#17120a" hero={<GameIntroHero locale={locale} id="blackWhite" />} tutorial={<BlackWhiteTutorialSteps />} guide={<GameArticle locale={locale} game="blackWhite" />}>
      <BlackWhiteGame />
    </GameGate>
  </>;
}

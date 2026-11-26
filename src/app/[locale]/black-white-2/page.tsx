import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import BlackWhite2Game from '@/components/blackWhite2/BlackWhite2Game';
import { BlackWhite2TutorialSteps } from '@/components/blackWhite2/BlackWhite2Tutorial';
import GameArticle, { guideFaq } from '@/components/guide/GameArticle';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'BlackWhite2' });
  return pageMetadata({ locale, path: '/black-white-2', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
}

export default async function BlackWhite2Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'BlackWhite2' });
  const faq = guideFaq('blackWhite2', locale)!; // the FAQ GameArticle shows below the board
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
      gameJsonLd({ locale, path: '/black-white-2', name: t('metaTitle'), alternateName: ['흑과 백 II', '흑과백 2', 'Black and White II'], description: t('metaDescription'), genre: ['Strategy', 'Bluffing', 'Game theory'], players: { min: 1, max: 2 }, show: 'genius3' }),
      faqJsonLd(faq),
      breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: t('metaTitle').split(' — ')[0], path: '/black-white-2' }]),
    ] }} />
    <GameGate game="blackWhite2" accent="#ef3340" ink="#ffffff" hero={<GameIntroHero locale={locale} id="blackWhite2" />} tutorial={<BlackWhite2TutorialSteps />} guide={<GameArticle locale={locale} game="blackWhite2" />}>
      <BlackWhite2Game />
    </GameGate>
  </>;
}

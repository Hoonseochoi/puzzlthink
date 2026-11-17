import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import { RussianRouletteTutorialSteps } from '@/components/russianRoulette/RussianRouletteTutorial';
import { RR_ACCENT } from '@/components/russianRoulette/theme';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';
import TextGuide from '@/components/TextGuide';
import RussianRouletteGame from '@/components/russianRoulette/RussianRouletteGame';


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'RussianRoulette' });
  return pageMetadata({ locale, path: '/russian-roulette', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
}

export default async function RussianRoulettePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'RussianRoulette' });
  const g = await getTranslations({ locale, namespace: 'RussianRouletteGuide' });
  const faq = g.raw('faq') as { q: string; a: string }[];
  return <><JsonLd data={{ '@context': 'https://schema.org', '@graph': [
      gameJsonLd({ locale, path: '/russian-roulette', name: t('metaTitle'), alternateName: ['러시안 룰렛', '러시안룰렛', 'Russian Roulette'], description: t('metaDescription'), genre: ['Strategy', 'Deduction', 'Party game'], players: { min: 1, max: 6 }, show: 'dp3' }),
      faqJsonLd(faq),
      breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: t('metaTitle').split(' — ')[0], path: '/russian-roulette' }]),
    ] }} /><GameGate game="russianRoulette" accent={RR_ACCENT} ink="#04161c" tutorialKey="puzzlthink_russian_roulette_tutorial_seen" hero={<GameIntroHero locale={locale} id="russianRoulette" />} tutorial={<RussianRouletteTutorialSteps />} guide={<TextGuide locale={locale} namespace="RussianRouletteGuide" />}><RussianRouletteGame /></GameGate></>;
}

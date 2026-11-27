import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameArticle, { guideFaq } from '@/components/guide/GameArticle';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import PropositionGoGame from '@/components/propositionGo/PropositionGoGame';
import { PropTutorialSteps } from '@/components/propositionGo/PropTutorialSteps';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'PropositionGo' });
  return pageMetadata({ locale, path: '/proposition-go', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
}

export default async function PropositionGoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'PropositionGo' });
  const faq = guideFaq('propositionGo', locale)!; // the FAQ GameArticle shows below the board
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
      gameJsonLd({ locale, path: '/proposition-go', name: t('metaTitle'), alternateName: ['명제 바둑', '명제바둑', 'Proposition Go', 'PUZZLTHINK ORIGINAL'], description: t('metaDescription'), genre: ['Puzzle', 'Logic puzzle', 'Brain teaser'], players: { min: 1, max: 1 } }),
      faqJsonLd(faq),
      breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: t('metaTitle').split(' — ')[0], path: '/proposition-go' }]),
    ] }} />
    <GameGate game="propositionGo" accent="#b49cff" ink="#12062e" hero={<GameIntroHero locale={locale} id="propositionGo" />} tutorial={<PropTutorialSteps />} guide={<GameArticle locale={locale} game="propositionGo" />}>
      <PropositionGoGame />
    </GameGate>
  </>;
}

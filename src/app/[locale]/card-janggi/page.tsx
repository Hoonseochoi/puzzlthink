import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import { CjTutorialSteps } from '@/components/cardJanggi/CjTutorial';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import GameArticle, { guideFaq } from '@/components/guide/GameArticle';
import CardJanggiGame from '@/components/cardJanggi/CardJanggiGame';
import CjPreview from '@/components/cardJanggi/CjPreview';
import { CJ_ACCENT, CJ_INK } from '@/components/cardJanggi/copy';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'CardJanggi' });
  return pageMetadata({ locale, path: '/card-janggi', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
}

export default async function CardJanggiPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'CardJanggi' });
  const faq = guideFaq('cardJanggi', locale)!; // the FAQ GameArticle shows below the board
  const hero = (
    <div className="grid items-center gap-8 md:grid-cols-[1fr_260px]">
      <GameIntroHero locale={locale} id="cardJanggi" />
      <CjPreview />
    </div>
  );
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
      gameJsonLd({
        locale, path: '/card-janggi', name: t('metaTitle'), description: t('metaDescription'), genre: ['Strategy', 'Board game'], players: { min: 1, max: 2 }, show: 'dp3',
        alternateName: ['카드 장기', '카드장기', '데블스 플랜 3 결승전 카드 장기', '데블스플랜3 결승 1라운드', 'Card Janggi'],
      }),
      faqJsonLd(faq),
      breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: t('metaTitle').split(' — ')[0], path: '/card-janggi' }]),
    ] }} />
    <GameGate game="cardJanggi" accent={CJ_ACCENT} ink={CJ_INK} tutorial={<CjTutorialSteps locale={locale} />} hero={hero} guide={<GameArticle locale={locale} game="cardJanggi" />}>
      <CardJanggiGame />
    </GameGate>
  </>;
}

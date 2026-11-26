import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import GameArticle, { guideFaq } from '@/components/guide/GameArticle';
import TimeAuctionGame from '@/components/timeAuction/TimeAuctionGame';
import TimeAuctionPreview from '@/components/timeAuction/TimeAuctionPreview';
import { TimeAuctionTutorialSteps } from '@/components/timeAuction/TimeAuctionTutorial';
import { TA_ACCENT, TA_INK } from '@/components/timeAuction/copy';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'TimeAuctionPage' });
  return pageMetadata({ locale, path: '/time-auction', title: t('metaTitle'), description: t('metaDescription'), keywords: t.raw('keywords') as string[] });
}

export default async function TimeAuctionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'TimeAuctionPage' });
  const korean = locale !== 'en';
  const hero = (
    <div className="grid items-center gap-8 md:grid-cols-[1fr_260px]">
      <GameIntroHero locale={locale} id="timeAuction" />
      <TimeAuctionPreview />
    </div>
  );
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        gameJsonLd({ locale, path: '/time-auction', name: korean ? '시간 경매' : 'Time Auction', alternateName: ['시간 경매', '시간경매', 'Time Auction', '데블스플랜2 시간 경매'], description: t('metaDescription'), genre: ['Auction', 'Party game', 'Mind game'], players: { min: 1, max: 6 }, show: 'dp2' }),
        faqJsonLd(guideFaq('timeAuction', locale)!), // the FAQ GameArticle shows below the board
        breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: korean ? '시간 경매' : 'Time Auction', path: '/time-auction' }]),
      ] }} />
      <GameGate game="timeAuction" accent={TA_ACCENT} ink={TA_INK} tutorial={<TimeAuctionTutorialSteps locale={locale} />} hero={hero} guide={<GameArticle locale={locale} game="timeAuction" />}>
        <TimeAuctionGame />
      </GameGate>
    </>
  );
}

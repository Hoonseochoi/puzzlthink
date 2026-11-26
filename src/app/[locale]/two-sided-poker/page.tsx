import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import GameArticle, { guideFaq } from '@/components/guide/GameArticle';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import { TSP_ACCENT, TSP_INK } from '@/components/twoSidedPoker/copy';
import TwoSidedPokerGame from '@/components/twoSidedPoker/TwoSidedPokerGame';
import TwoSidedPokerPreview from '@/components/twoSidedPoker/TwoSidedPokerPreview';
import { TwoSidedPokerTutorialSteps } from '@/components/twoSidedPoker/TwoSidedPokerTutorial';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const korean = locale !== 'en';
  return pageMetadata({
    locale, path: '/two-sided-poker',
    title: korean ? '양면포커 — 더 지니어스 데스매치, AI와 칩 40개 심리전' : 'Two-Sided Poker — The Genius death match vs AI',
    description: korean
      ? '더 지니어스 양면포커 규칙 그대로. 공개된 앞면과 나만 아는 뒷면 중 어느 면에 칩을 걸지, 언제 양면베팅(+10)으로 승부할지 정하세요. 200장 카드 카운팅까지.'
      : 'The Genius two-sided poker rules: bet your public front or secret back, or both for +10. 40 chips each, 200-card shoe, card counting.',
    keywords: korean ? ['양면포커', '더 지니어스 양면포커', '양면베팅', '더 지니어스 데스매치', '포커 심리전', 'AI 포커'] : ['two-sided poker', 'The Genius', 'death match game', 'bluffing game', 'AI poker'],
  });
}

export default async function TwoSidedPokerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const hero = (
    <div className="grid items-center gap-8 md:grid-cols-[1fr_280px]">
      <GameIntroHero locale={locale} id="twoSidedPoker" />
      <div className="mx-auto w-[220px] md:w-full [&>div]:w-full! [&>div]:rounded-2xl! [&>div]:border-white/10!"><TwoSidedPokerPreview /></div>
    </div>
  );
  const g = await getTranslations({ locale, namespace: 'TwoSidedPokerGuide' });
  const tc = await getTranslations({ locale, namespace: 'Common' });
  const korean = locale !== 'en';
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        gameJsonLd({ locale, path: '/two-sided-poker', name: tc('twoSidedPoker'), alternateName: ['양면포커', '양면 포커', 'Two-Sided Poker'], description: g('intro'), genre: ['Poker', 'Bluffing', 'Card game'], players: { min: 1, max: 2 }, show: 'genius3' }),
        faqJsonLd(guideFaq('twoSidedPoker', locale)!), // the FAQ GameArticle shows below the board
        breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: korean ? '양면포커' : 'Two-Sided Poker', path: '/two-sided-poker' }]),
      ] }} />
      <GameGate game="twoSidedPoker" accent={TSP_ACCENT} ink={TSP_INK} hero={hero} tutorial={<TwoSidedPokerTutorialSteps locale={locale} />} guide={<GameArticle locale={locale} game="twoSidedPoker" />}>
        <TwoSidedPokerGame locale={locale} />
      </GameGate>
    </>
  );
}

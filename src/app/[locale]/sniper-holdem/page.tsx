import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import GameArticle, { guideFaq } from '@/components/guide/GameArticle';
import SniperHoldemGame from '@/components/sniperHoldem/SniperHoldemGame';
import SniperHoldemPreview from '@/components/sniperHoldem/SniperHoldemPreview';
import { SniperHoldemTutorialSteps } from '@/components/sniperHoldem/SniperHoldemTutorial';
import { SH_ACCENT, SH_INK } from '@/components/sniperHoldem/copy';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const korean = locale !== 'en';
  return pageMetadata({
    locale, path: '/sniper-holdem',
    title: korean ? '스나이퍼 홀덤 (저격 홀덤) — 데블스플랜2 감옥매치, 룰 정리·온라인 무료' : "Sniper Hold'em — The Devil's Plan 2 (Death Room) prison match, play free online",
    description: korean
      ? '데블스 플랜: 데스룸(데블스플랜2) 3일차 감옥매치 스나이퍼 홀덤(저격 홀덤)을 방송 룰 그대로 무료로. 공유 카드 4장과 개인 카드 2장, 체크 없는 두 번의 베팅, 상대 족보를 "8 스트레이트"처럼 저격하면 꼴찌. 75칩이면 생존. AI·친구·공개방 2~5인.'
      : "Play Sniper Hold'em from The Devil's Plan: Death Room (season 2) free, with the broadcast rules: four shared cards, two private, two bets with no checking, and snipe an opponent's hand by name to sink it. 75 chips to be safe. AI, friends or open rooms, 2–5 players.",
    keywords: korean
      ? ['스나이퍼 홀덤', '저격 홀덤', '저격홀덤', '스나이퍼홀덤', '데블스플랜2', '데블스 플랜 2', '데블스플랜2 저격 홀덤', '데블스플랜 저격홀덤', '데블스 플랜 데스룸', '데블스플랜 데스룸', '데블스플랜2 감옥매치', '데블스 플랜 감옥 매치', '저격 홀덤 룰', '저격 홀덤 족보', '데블스플랜 게임', '홀덤 온라인 무료']
      : ["Sniper Hold'em", 'Sniper Holdem', "The Devil's Plan 2", "Devil's Plan Death Room", "Devil's Plan prison match", 'snipe poker game', 'hold em variant online'],
  });
}

export default async function SniperHoldemPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const h = await getTranslations({ locale, namespace: 'Home' });
  const korean = locale !== 'en';
  const hero = (
    <div className="grid items-center gap-8 md:grid-cols-[1fr_260px]">
      <GameIntroHero locale={locale} id="sniperHoldem" />
      <SniperHoldemPreview />
    </div>
  );
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        gameJsonLd({ locale, path: '/sniper-holdem', name: korean ? '스나이퍼 홀덤' : "Sniper Hold'em", alternateName: ['스나이퍼 홀덤', '저격 홀덤', '저격홀덤', "Sniper Hold'em", 'Sniper Holdem'], description: h('sniperHoldemDescription'), genre: ['Card game', 'Poker', 'Betting', 'Bluffing'], players: { min: 1, max: 5 }, show: 'dp2' }),
        faqJsonLd(guideFaq('sniperHoldem', locale)!), // the FAQ GameArticle shows below the board
        breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: korean ? '스나이퍼 홀덤' : "Sniper Hold'em", path: '/sniper-holdem' }]),
      ] }} />
      <GameGate game="sniperHoldem" accent={SH_ACCENT} ink={SH_INK} tutorial={<SniperHoldemTutorialSteps locale={locale} />} hero={hero} guide={<GameArticle locale={locale} game="sniperHoldem" />}>
        <SniperHoldemGame />
      </GameGate>
    </>
  );
}

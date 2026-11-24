import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import TextGuide from '@/components/TextGuide';
import HitStayGame from '@/components/hitStay/HitStayGame';
import HitStayPreview from '@/components/hitStay/HitStayPreview';
import { HS_ACCENT, HS_INK } from '@/components/hitStay/copy';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const korean = locale !== 'en';
  return pageMetadata({
    locale, path: '/hit-stay',
    title: korean ? 'Hit,Stay (힛스테이) — 데블스 플랜 3 준결승 메인매치, 5인 베팅 카드 게임' : 'Hit,Stay — The Devil\'s Plan 3 semifinal main match, a five-player betting card game',
    description: korean
      ? '데블스 플랜: 데드 어게인(시즌 3) 준결승 메인매치 힛스테이를 무료로. 8면체 주사위가 정한 한계 숫자에 카드 합을 가장 가깝게, HIT 할지 STAY 할지 정하고 칩을 걸어 살아남으세요. AI 4명·친구·공개방 5인전.'
      : 'Play Hit,Stay from the semifinal of The Devil\'s Plan: Dead Again (season 3) free. Get your card total closest to the die\'s limit, HIT or STAY, and bet to survive. Five players: four AI, friends or open rooms.',
    keywords: korean
      ? ['힛스테이', '힛 스테이', 'Hit Stay', 'Hit,Stay', 'HIT STAY 게임', '데블스 플랜 3', '데블스플랜3', '데블스 플랜 데드 어게인', '데블스 플랜 3 준결승', '데블스플랜3 준결승', '데블스 플랜 메인매치', '데블스 플랜 게임', '한계 숫자 게임', '베팅 카드 게임', '5인 카드 게임']
      : ['Hit Stay', 'Hit,Stay game', "The Devil's Plan 3", "The Devil's Plan Dead Again", "Devil's Plan semifinal", 'betting card game', 'five-player card game'],
  });
}

export default async function HitStayPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const g = await getTranslations({ locale, namespace: 'HitStayGuide' });
  const korean = locale !== 'en';
  const hero = (
    <div className="grid items-center gap-8 md:grid-cols-[1fr_260px]">
      <GameIntroHero locale={locale} id="hitStay" />
      <HitStayPreview />
    </div>
  );
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        gameJsonLd({ locale, path: '/hit-stay', name: 'Hit,Stay', alternateName: ['힛스테이', '힛 스테이', 'Hit Stay', 'HIT, STAY'], description: g('intro'), genre: ['Card game', 'Betting', 'Party game'], players: { min: 1, max: 5 }, show: 'dp3' }),
        faqJsonLd(g.raw('faq') as { q: string; a: string }[]),
        breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: korean ? 'Hit,Stay (힛스테이)' : 'Hit,Stay', path: '/hit-stay' }]),
      ] }} />
      <GameGate game="hitStay" accent={HS_ACCENT} ink={HS_INK} hero={hero} guide={<TextGuide locale={locale} namespace="HitStayGuide" />}>
        <HitStayGame />
      </GameGate>
    </>
  );
}

import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import HitStayGame from '@/components/hitStay/HitStayGame';
import HitStayPreview from '@/components/hitStay/HitStayPreview';
import { HS_ACCENT, HS_INK } from '@/components/hitStay/copy';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const korean = locale !== 'en';
  return pageMetadata({
    locale, path: '/hit-stay',
    title: korean ? 'Hit,Stay (힛스테이) — 한계 숫자에 가장 가깝게, 5인 베팅 카드 게임' : 'Hit,Stay — get closest to the limit, a five-player betting card game',
    description: korean
      ? '8면체 주사위가 정한 한계 숫자에 카드 합을 가장 가깝게. HIT 할지 STAY 할지, 칩을 얼마나 걸지 정하는 5인 생존 게임. AI 4명 또는 친구와.'
      : 'Bring your card total closest to the limit an eight-sided die sets. HIT or STAY, and bet to survive. Five players: four AI or friends.',
    keywords: korean ? ['힛스테이', 'HIT STAY', '힛 스테이 게임', '메인매치', '베팅 카드 게임'] : ['HIT STAY', 'betting card game', 'main match'],
  });
}

export default async function HitStayPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const hero = (
    <div className="grid items-center gap-8 md:grid-cols-[1fr_260px]">
      <GameIntroHero locale={locale} id="hitStay" />
      <HitStayPreview />
    </div>
  );
  return (
    <GameGate game="hitStay" accent={HS_ACCENT} ink={HS_INK} hero={hero}>
      <HitStayGame />
    </GameGate>
  );
}

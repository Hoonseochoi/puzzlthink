import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import TextGuide from '@/components/TextGuide';
import EquationTowerGame from '@/components/equationTower/EquationTowerGame';
import { TowerPreview } from '@/components/equationTower/TowerParts';
import { EQT_ACCENT, EQT_INK } from '@/components/equationTower/copy';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const korean = locale !== 'en';
  return pageMetadata({
    locale, path: '/equation-tower',
    title: korean ? '수식의 탑 — 데블스 플랜 3 감옥 매치, 숫자 블록 쌓기 퍼즐' : 'Tower of Equations — the Devil\'s Plan 3 prison match, a number block puzzle',
    description: korean
      ? '데블스 플랜: 데드 어게인(시즌 3) 5일차 감옥 매치 수식의 탑을 무료로. 숫자 블록을 옮기고 뒤집어 타깃 넘버의 탑을 쌓으세요. 혼자 연습, 10분 챌린지 랭킹, 친구·공개방 2~4명 버저 대결.'
      : 'Play Tower of Equations, the day-5 prison match of The Devil\'s Plan: Dead Again (season 3), free. Move and flip number blocks into a tower worth the target. Practice, a ranked 10-minute challenge, and a 2–4 player buzzer game in friend or open rooms.',
    keywords: korean
      ? ['수식의 탑', '수식의 탑 게임', '수식의탑', '데블스 플랜 3', '데블스플랜3', '데블스 플랜 데드 어게인', '데블스 플랜 감옥 매치', '데블스플랜 감옥', '데블스 플랜 3 5일차', '숫자 블록 퍼즐', '타깃 넘버', '암산 게임']
      : ['Tower of Equations', "The Devil's Plan 3", "The Devil's Plan Dead Again", "Devil's Plan prison match", 'number block puzzle', 'mental maths game'],
  });
}

export default async function EquationTowerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const g = await getTranslations({ locale, namespace: 'EquationTowerGuide' });
  const korean = locale !== 'en';
  const name = korean ? '수식의 탑' : 'Tower of Equations';
  const hero = (
    <div className="grid items-center gap-8 md:grid-cols-[1fr_280px]">
      <GameIntroHero locale={locale} id="equationTower" />
      <TowerPreview />
    </div>
  );
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        gameJsonLd({ locale, path: '/equation-tower', name, alternateName: ['수식의 탑', 'Tower of Equations', '수식의 탑 게임', '데블스 플랜 수식의 탑'], description: g('intro'), genre: ['Puzzle', 'Number game', 'Strategy'], players: { min: 1, max: 4 }, show: 'dp3' }),
        faqJsonLd(g.raw('faq') as { q: string; a: string }[]),
        breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name, path: '/equation-tower' }]),
      ] }} />
      <GameGate game="equationTower" accent={EQT_ACCENT} ink={EQT_INK} hero={hero} guide={<TextGuide locale={locale} namespace="EquationTowerGuide" />}>
        <EquationTowerGame />
      </GameGate>
    </>
  );
}

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import { GradationTutorialSteps } from '@/components/gradation/GradationTutorial';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import TextGuide from '@/components/TextGuide';
import GradationGame from '@/components/gradation/GradationGame';
import GradationPreview from '@/components/gradation/GradationPreview';
import { GR_ACCENT, GR_INK } from '@/components/gradation/copy';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const korean = locale !== 'en';
  return pageMetadata({
    locale, path: '/gradation',
    title: korean ? '그라데이션 — 데블스 플랜 3 감옥 매치, 1:1 숫자 큐브 심리전' : 'Gradation — The Devil\'s Plan 3 prison match, a 1:1 number cube mind game',
    description: korean
      ? '데블스 플랜: 데드 어게인(시즌 3) 6일차 감옥 매치 그라데이션을 무료로. 숫자 큐브 7개를 오름차순·합 30 이하로 그라데이션 통에 숨기고, 통의 색만 보고 한 통씩 맞대결하세요. AI 4명(어려움)·친구·공개방 1:1.'
      : 'Play Gradation, the day-6 prison match of The Devil\'s Plan: Dead Again (season 3), free. Hide seven number cubes in shaded cups, rising and summing to 30 or less, and duel cup by cup seeing only shades. Four hard AI, friends or open 1:1 rooms.',
    keywords: korean
      ? ['그라데이션', '그라데이션 게임', '데블스 플랜 3', '데블스플랜3', '데블스 플랜 데드 어게인', '데블스 플랜 감옥 매치', '데블스플랜 감옥', '데블스 플랜 3 6일차', '데블스 플랜 결승 진출전', '숫자 큐브 게임', '큐브 통 게임', '1:1 심리전 게임']
      : ['Gradation game', "The Devil's Plan 3", "The Devil's Plan Dead Again", "Devil's Plan prison match", 'number cube game', '1:1 mind game'],
  });
}

export default async function GradationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const g = await getTranslations({ locale, namespace: 'GradationGuide' });
  const korean = locale !== 'en';
  const hero = (
    <div className="grid items-center gap-8 md:grid-cols-[1fr_280px]">
      <GameIntroHero locale={locale} id="gradation" />
      <GradationPreview />
    </div>
  );
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        gameJsonLd({ locale, path: '/gradation', name: korean ? '그라데이션' : 'Gradation', alternateName: ['그라데이션', 'Gradation', '그라데이션 게임', '데블스 플랜 그라데이션'], description: g('intro'), genre: ['Strategy', 'Mind game', 'Number game'], players: { min: 1, max: 2 }, show: 'dp3' }),
        faqJsonLd(g.raw('faq') as { q: string; a: string }[]),
        breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: korean ? '그라데이션' : 'Gradation', path: '/gradation' }]),
      ] }} />
      <GameGate game="gradation" accent={GR_ACCENT} ink={GR_INK} tutorial={<GradationTutorialSteps locale={locale} />} hero={hero} guide={<TextGuide locale={locale} namespace="GradationGuide" />}>
        <GradationGame />
      </GameGate>
    </>
  );
}

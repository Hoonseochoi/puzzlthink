import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import { SignalTutorialSteps } from '@/components/equationSignal/SignalTutorial';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import TextGuide from '@/components/TextGuide';
import EquationSignalGame from '@/components/equationSignal/EquationSignalGame';
import { SignalPreview } from '@/components/equationSignal/SignalParts';
import { EQS_ACCENT, EQS_INK } from '@/components/equationSignal/copy';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const korean = locale !== 'en';
  return pageMetadata({
    locale, path: '/equation-signal',
    title: korean ? '수식 신호등 — 데블스 플랜 3 결승 게임, 9칸 수식 맞히기' : 'Equation Signal — the Devil\'s Plan 3 final game, find the 9-cell equation',
    description: korean
      ? '데블스 플랜: 데드 어게인(시즌 3) 결승 3회전 수식 신호등을 무료로. 숨은 9칸 수식을 초록·노랑·빨강 신호만 보고 맞히세요. 혼자 연습, 10분 챌린지 랭킹, 친구·공개방 2~4명 대결.'
      : 'Play Equation Signal, the third game of the final of The Devil\'s Plan: Dead Again (season 3), free. Find a hidden 9-cell equation from green, yellow and red signals. Practice, a ranked 10-minute challenge, and 2–4 player friend or open rooms.',
    keywords: korean
      ? ['수식 신호등', '수식 신호등 게임', '데블스 플랜 3', '데블스플랜3', '데블스 플랜 데드 어게인', '데블스 플랜 결승', '데블스플랜 결승 게임', '데블스 플랜 3 결승 3회전', '수식 맞히기', '너들', 'Nerdle', '수식 워들']
      : ['Equation Signal', "The Devil's Plan 3", "The Devil's Plan Dead Again", "Devil's Plan final game", 'equation guessing game', 'Nerdle with powers'],
  });
}

export default async function EquationSignalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const g = await getTranslations({ locale, namespace: 'EquationSignalGuide' });
  const korean = locale !== 'en';
  const name = korean ? '수식 신호등' : 'Equation Signal';
  const hero = (
    <div className="grid items-center gap-8 md:grid-cols-[1fr_280px]">
      <GameIntroHero locale={locale} id="equationSignal" />
      <SignalPreview />
    </div>
  );
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        gameJsonLd({ locale, path: '/equation-signal', name, alternateName: ['수식 신호등', 'Equation Signal', '수식 신호등 게임', '데블스 플랜 수식 신호등'], description: g('intro'), genre: ['Puzzle', 'Deduction', 'Number game'], players: { min: 1, max: 4 }, show: 'dp3' }),
        faqJsonLd(g.raw('faq') as { q: string; a: string }[]),
        breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name, path: '/equation-signal' }]),
      ] }} />
      <GameGate game="equationSignal" accent={EQS_ACCENT} ink={EQS_INK} tutorial={<SignalTutorialSteps locale={locale} />} hero={hero} guide={<TextGuide locale={locale} namespace="EquationSignalGuide" />}>
        <EquationSignalGame />
      </GameGate>
    </>
  );
}

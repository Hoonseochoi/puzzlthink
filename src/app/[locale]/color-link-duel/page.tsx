import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import { CldTutorialSteps } from '@/components/colorLinkDuel/CldTutorial';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import GameArticle, { guideFaq } from '@/components/guide/GameArticle';
import CldGame from '@/components/colorLinkDuel/CldGame';
import CldPreview from '@/components/colorLinkDuel/CldPreview';
import SiblingGameLink from '@/components/SiblingGameLink';
import { CLD_ACCENT, CLD_INK } from '@/components/colorLinkDuel/copy';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

const meta = (korean: boolean) => ({
  // Searchers write "컬러링크" unspaced; the solo puzzle /color-link is 「컬러 잇기」 and owns the Numberlink intent.
  title: korean ? '컬러링크 — 데블스플랜3 결승 컬러 링크, 룰 정리·온라인 무료 대결' : "Color Link Duel — The Devil's Plan 3 final game, rules + play free",
  description: korean
    ? '데블스플랜3 결승 2회차 매치 컬러링크를 1:1로. 13가지 판(7×7 클래식·하트·도넛·네 방…)에 14가지 색 말을 번갈아 놓고, 같은 색끼리 이을 수 없는 판이 되면 불가능 선언 — 2분 안에 증명하지 못하면 패배. AI 어려움·친구·공개방.'
    : "Play Color Link, the final game of The Devil's Plan 3, as a 1:1 duel: take turns placing stones of 14 colors on 13 boards. Leave a board the colors cannot be joined on and get called out; prove it in 2 minutes or lose. Hard AI, friends or open rooms.",
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const korean = locale !== 'en';
  const m = meta(korean);
  return pageMetadata({
    locale, path: '/color-link-duel', title: m.title, description: m.description,
    keywords: korean ? ['컬러 링크', '컬러링크', '컬러 링크 게임', '컬러링크 게임', '데블스 플랜 컬러 링크', '데블스플랜3 컬러링크', '데블스 플랜 3 결승 게임', '데블스 플랜 결승', '데블스 플랜 3', '불가능 선언', '두뇌 게임'] : ['Color Link Duel', "Devil's Plan final", 'brain game', 'two-player puzzle'],
  });
}

export default async function ColorLinkDuelPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const korean = locale !== 'en';
  const m = meta(korean);
  const faq = guideFaq('colorLinkDuel', locale)!; // the FAQ GameArticle shows below the board
  const hero = (
    <div className="grid items-center gap-8 md:grid-cols-[1fr_260px]">
      <div>
        <GameIntroHero locale={locale} id="colorLinkDuel" />
        <div className="mt-3"><SiblingGameLink href="/color-link" accent="#21c2b5" name={korean ? '컬러 잇기' : 'Color Link'} note={korean ? '혼자 푸는 같은 색 잇기 퍼즐(넘버링크)' : 'the solo connect-the-pairs puzzle (Numberlink)'} /></div>
      </div>
      <div className="mx-auto w-[230px] rounded-[20px] border border-white/10 bg-[radial-gradient(ellipse_at_50%_30%,rgba(124,108,255,.35),rgba(18,18,23,.95)_70%)] p-4 md:w-full"><CldPreview /></div>
    </div>
  );
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
      gameJsonLd({ locale, path: '/color-link-duel', name: korean ? '컬러 링크' : 'Color Link Duel', alternateName: ['컬러 링크', '컬러링크', 'Color Link Duel'], description: m.description, genre: ['Strategy', 'Puzzle'], players: { min: 1, max: 2 }, show: 'dp3' }),
      faqJsonLd(faq),
      breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: korean ? '컬러 링크' : 'Color Link Duel', path: '/color-link-duel' }]),
    ] }} />
    <GameGate game="colorLinkDuel" accent={CLD_ACCENT} ink={CLD_INK} tutorial={<CldTutorialSteps locale={locale} />} hero={hero} guide={<GameArticle locale={locale} game="colorLinkDuel" />}>
      <CldGame />
    </GameGate>
  </>;
}

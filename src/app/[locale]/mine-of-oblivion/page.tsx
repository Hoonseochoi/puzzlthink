import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import GameArticle, { guideFaq } from '@/components/guide/GameArticle';
import MineOblivionGame from '@/components/mineOblivion/MineOblivionGame';
import MineOblivionPreview from '@/components/mineOblivion/MineOblivionPreview';
import { MineOblivionTutorialSteps } from '@/components/mineOblivion/MineOblivionTutorial';
import { MO_ACCENT, MO_INK } from '@/components/mineOblivion/copy';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const korean = locale !== 'en';
  return pageMetadata({
    locale, path: '/mine-of-oblivion',
    title: korean ? '망각의 지뢰 — 데스게임 6회차, 룰 정리·온라인 무료 1:1' : 'Mine of Oblivion — Death Game (The Risk Takers) match 6, play free online',
    description: korean
      ? '넷플릭스 데스게임 6회차 망각의 지뢰를 방송 규칙대로 무료로. 11×11 판에 지뢰 15개를 몰래 묻고, 내 지뢰마저 사라진 판을 걸으며 둘레 지뢰 수만큼 점수, 지뢰 −5점, 보물 +10·+15·+20. AI 보통·어려움, 친구·공개방 1:1.'
      : "Play Mine of Oblivion from Netflix's Death Game (The Risk Takers) free, with the broadcast rules: bury fifteen secret mines on an 11×11 board, then walk it with even your own mines hidden, scoring the mines around you, −5 for a mine, treasure 10, 15, 20. Normal and hard AI, friends or open rooms.",
    keywords: korean
      ? ['망각의 지뢰', '망각의지뢰', '데스게임 망각의 지뢰', '데스게임', '넷플릭스 데스게임', '데스게임 6회차', '데스게임 게임', '망각의 지뢰 룰', '망각의 지뢰 규칙', '지뢰 찾기 게임', '지뢰 게임 온라인', '기억력 게임', '1:1 두뇌 게임']
      : ['Mine of Oblivion', 'Death Game', 'The Risk Takers', 'Death Game Netflix', 'minesweeper duel', 'memory board game online', 'two player minesweeper'],
  });
}

export default async function MineOblivionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const h = await getTranslations({ locale, namespace: 'Home' });
  const korean = locale !== 'en';
  const hero = (
    <div className="grid items-center gap-8 md:grid-cols-[1fr_260px]">
      <GameIntroHero locale={locale} id="mineOblivion" />
      <MineOblivionPreview />
    </div>
  );
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        gameJsonLd({ locale, path: '/mine-of-oblivion', name: korean ? '망각의 지뢰' : 'Mine of Oblivion', alternateName: ['망각의 지뢰', '망각의지뢰', 'Mine of Oblivion'], description: h('mineOblivionDescription'), genre: ['Board game', 'Memory', 'Deduction', 'Minesweeper'], players: { min: 1, max: 2 }, show: 'dg1' }),
        faqJsonLd(guideFaq('mineOblivion', locale)!),
        breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: korean ? '망각의 지뢰' : 'Mine of Oblivion', path: '/mine-of-oblivion' }]),
      ] }} />
      <GameGate game="mineOblivion" accent={MO_ACCENT} ink={MO_INK} tutorial={<MineOblivionTutorialSteps locale={locale} />} hero={hero} guide={<GameArticle locale={locale} game="mineOblivion" />}>
        <MineOblivionGame />
      </GameGate>
    </>
  );
}

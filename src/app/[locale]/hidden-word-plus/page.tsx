import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import GameArticle, { guideFaq } from '@/components/guide/GameArticle';
import HiddenWordGame from '@/components/hiddenWord/HiddenWordGame';
import HiddenWordPlusPreview, { HiddenWordCrossLink } from '@/components/hiddenWord/HiddenWordPlusArt';
import { HiddenWordTutorialSteps } from '@/components/hiddenWord/HiddenWordTutorial';
import { HWP_ACCENT, HWP_INK } from '@/components/hiddenWord/copy';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const korean = locale !== 'en';
  return pageMetadata({
    locale, path: '/hidden-word-plus',
    // Owns "히든워드 확장판", not the bare "히든워드" (that is /hidden-word), so the title no longer leads with "데블스플랜3 히든워드".
    title: korean ? '히든 워드 확장판 — 닮은 단어 186개, 더 어려운 유사도 단어 게임 무료' : 'Hidden Word: Expansion — 186 look-alike words, the harder similarity word game',
    description: korean
      ? '히든워드 확장판: 감정·직업·장소·음식·문화까지 서로 닮은 186단어, 30개 묶음 속에서 힌트의 유사도로 AI 모라의 단어를 맞히고 내 단어는 지키세요. 6인 파티·공개방, 확장판 전용 랭킹과 1위 아이콘.'
      : "The Expansion of Hidden Word from The Devil's Plan 3: 186 look-alike Korean words in 30 groups (feelings, jobs, places, food, culture). Find MORA's word from each hint's similarity and hide yours. Its own ranking and #1 icon.",
    keywords: korean
      ? ['히든 워드 확장판', '히든워드 확장판', '히든 워드 확장판 하는 곳', '데블스플랜3 히든워드 확장판', '유사도 단어 게임', '단어 유사도 게임', '단어 추리 게임', '꼬맨틀', '단어 게임']
      : ['Hidden Word Expansion', 'Hidden Word', "The Devil's Plan 3 Hidden Word", 'word similarity game', 'Korean word game'],
  });
}

export default async function HiddenWordPlusPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const games = await getTranslations({ locale, namespace: 'Games' });
  const faq = guideFaq('hiddenWordPlus', locale)!; // the FAQ GameArticle shows below the board
  const korean = locale !== 'en';
  const name = korean ? '히든 워드 확장판' : 'Hidden Word: Expansion';
  const hero = (
    <div className="grid items-center gap-8 md:grid-cols-[1fr_280px]">
      <div>
        <GameIntroHero locale={locale} id="hiddenWordPlus" />
        <div className="mt-3"><HiddenWordCrossLink to="basic" en={!korean} /></div>
      </div>
      <HiddenWordPlusPreview en={!korean} />
    </div>
  );
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        gameJsonLd({ locale, path: '/hidden-word-plus', name, alternateName: ['히든 워드 확장판', '히든워드 확장판', 'Hidden Word: Expansion', 'Hidden Word Expansion'], description: games('games.hiddenWordPlus.tagline'), genre: ['Word game', 'Deduction', 'Party game'], players: { min: 1, max: 6 }, show: 'dp3' }),
        faqJsonLd(faq),
        breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: korean ? '히든 워드' : 'Hidden Word', path: '/hidden-word' }, { name, path: '/hidden-word-plus' }]),
      ] }} />
      <GameGate game="hiddenWordPlus" accent={HWP_ACCENT} ink={HWP_INK} tutorial={<HiddenWordTutorialSteps locale={locale} level="plus" />} hero={hero} guide={<GameArticle locale={locale} game="hiddenWordPlus" />}>
        <HiddenWordGame level="plus" />
      </GameGate>
    </>
  );
}

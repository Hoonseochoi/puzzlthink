import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameGate from '@/components/GameGate';
import { HiddenWordTutorialSteps } from '@/components/hiddenWord/HiddenWordTutorial';
import GameIntroHero from '@/components/GameIntroHero';
import JsonLd from '@/components/JsonLd';
import GameArticle, { guideFaq } from '@/components/guide/GameArticle';
import HiddenWordGame from '@/components/hiddenWord/HiddenWordGame';
import HiddenWordPreview from '@/components/hiddenWord/HiddenWordPreview';
import { HiddenWordCrossLink } from '@/components/hiddenWord/HiddenWordPlusArt';
import SiblingGameLink from '@/components/SiblingGameLink';
import { HW_ACCENT, HW_INK } from '@/components/hiddenWord/copy';
import { breadcrumbJsonLd, faqJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const korean = locale !== 'en';
  return pageMetadata({
    locale, path: '/hidden-word',
    // The page that owns the bare "히든워드" query: the unspaced spelling first (most searches), the brand spelling right after.
    title: korean ? '히든워드(히든 워드) — 데블스플랜3 5화 메인매치, 룰·온라인 무료' : "Hidden Word — The Devil's Plan 3 word game, play free online",
    description: korean
      ? '데블스플랜3 히든워드를 온라인에서 무료로. 내 단어는 숨기고, 힌트의 유사도 숫자로 상대의 단어를 맞히는 5화 메인매치 룰 그대로 AI와 1:1 승점전. 승점 랭킹, 더 어려운 확장판과 4~10인 라이어까지.'
      : "Play Hidden Word, the episode 5 main match of The Devil's Plan: Dead Again (season 3), free online. Hide your word and find the AI's from each hint's similarity score, with a points ranking. Korean words; Expansion and Liar modes too.",
    keywords: korean
      ? ['히든 워드', '히든워드', '히든 워드 게임', '히든워드 게임', '데블스 플랜 히든 워드', '데블스플랜 히든워드', '데블스 플랜 3 히든 워드', '데블스플랜3 히든워드', '데블스 플랜 3 5화', '데블스 플랜 3 5화 메인매치', '데블스 플랜 데드 어게인 히든 워드', '데블스 플랜 3 게임', '히든 워드 유사도', '유사도 단어 맞히기', '단어 유사도 게임', '유사도 게임', '단어 유사도', '단어 추리 게임', '데블스 플랜 게임', '꼬맨틀', '단어 게임']
      : ['Hidden Word', 'Hidden Word game', "The Devil's Plan", "The Devil's Plan 3 Hidden Word", "Devil's Plan Dead Again episode 5", "Devil's Plan season 3 main match", 'word similarity game', 'Korean word game'],
  });
}

export default async function HiddenWordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const g = await getTranslations({ locale, namespace: 'HiddenWordGuide' });
  const faq = guideFaq('hiddenWord', locale)!; // the FAQ GameArticle shows below the board
  const korean = locale !== 'en';
  const hero = (
    <div className="grid items-center gap-8 md:grid-cols-[1fr_260px]">
      <div>
        <GameIntroHero locale={locale} id="hiddenWord" />
        <div className="mt-3"><HiddenWordCrossLink to="plus" en={!korean} /></div>
        <div className="mt-2"><SiblingGameLink href="/hidden-word-liar" accent="#a98bff" name={korean ? '히든 워드: 라이어' : 'Hidden Word: Liar'} note={korean ? '4~10명이 하는 라이어 게임' : 'the liar game for 4–10 players'} /></div>
      </div>
      <HiddenWordPreview />
    </div>
  );
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        gameJsonLd({ locale, path: '/hidden-word', name: korean ? '히든 워드' : 'Hidden Word', alternateName: ['히든 워드', '히든워드', 'Hidden Word'], description: g('intro'), genre: ['Word game', 'Deduction', 'Party game'], players: { min: 1, max: 1 }, show: 'dp3' }),
        faqJsonLd(faq),
        breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name: korean ? '히든 워드' : 'Hidden Word', path: '/hidden-word' }]),
      ] }} />
      <GameGate game="hiddenWord" accent={HW_ACCENT} ink={HW_INK} tutorial={<HiddenWordTutorialSteps locale={locale} />} hero={hero} guide={<GameArticle locale={locale} game="hiddenWord" />}>
        <HiddenWordGame />
      </GameGate>
    </>
  );
}

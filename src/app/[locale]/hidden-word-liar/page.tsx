import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import JsonLd from '@/components/JsonLd';
import LiarHome from '@/components/hiddenWordLiar/LiarHome';
import { breadcrumbJsonLd, gameJsonLd, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const korean = locale !== 'en';
  return pageMetadata({
    locale, path: '/hidden-word-liar',
    title: korean ? '히든 워드: 라이어 — 라이어 게임 온라인, 4~10명 친구·공개방 무료' : 'Hidden Word: Liar — an online liar game for 4–10 players',
    description: korean
      ? '같은 제시어로 한 마디씩, 그런데 한 명만 다른 단어를 받았어요. 단서마다 정답과의 유사도가 뜨는 히든 워드 라이어 게임. 카카오톡으로 친구를 불러 4~10명이 무료로.'
      : 'Everyone says one word about the same secret word, but one player got a different one. Every clue shows its similarity to the answer. Free, 4–10 players, friends or matchmaking.',
    keywords: korean
      ? ['라이어 게임', '라이어게임', '라이어 게임 온라인', '히든 워드', '히든워드 라이어', '파티 게임', '단어 게임', '마피아 게임', '친구랑 할 게임', '카톡 게임', '단체 게임']
      : ['liar game', 'online liar game', 'Hidden Word', 'party word game', 'spyfall-like', 'word game with friends'],
  });
}

export default async function HiddenWordLiarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const korean = locale !== 'en';
  const name = korean ? '히든 워드: 라이어' : 'Hidden Word: Liar';
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': [
        gameJsonLd({ locale, path: '/hidden-word-liar', name, alternateName: ['히든워드 라이어', '라이어 게임', 'Hidden Word Liar'], description: korean ? '같은 제시어로 한 마디씩 말하고, 정답과의 유사도로 단 한 명의 라이어를 찾는 4~10인 파티 게임.' : 'A 4–10 player party game: find the one player with a different word from each clue\'s similarity.', genre: ['Party game', 'Word game', 'Social deduction'], players: { min: 4, max: 10 } }),
        breadcrumbJsonLd(locale, [{ name: 'PUZZLTHINK', path: '' }, { name, path: '/hidden-word-liar' }]),
      ] }} />
      <LiarHome />
    </>
  );
}

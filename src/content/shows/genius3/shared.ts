// Shared bits of the 더 지니어스: 블랙가넷 pages (The Genius season 3; tvN, 2014-10-01 – 2014-12-17, 12 episodes,
// Wednesdays 23:00). References, source notes and the page builder.
import type { Bi, MatchKind, ShowGame, Source } from '../types';
import type { GameId } from '@/lib/gameCatalog';
import type { GuideBlock } from '@/content/guides/types';
import { makeGame } from '../make';

const NAMU = 'https://namu.wiki/w/';
const S = '더 지니어스:블랙가넷';

/** The fan wiki's episode page (rules only were taken from it, as facts; no wording, tables or play-by-play). */
export const namuEp = (ep: number): Source => ({
  label: { ko: `나무위키 「${S}/${ep}화」 (규칙 확인용)`, en: `Namuwiki, "The Genius: Black Garnet/episode ${ep}" (Korean fan wiki; checked for the rules)` },
  url: `${NAMU}${encodeURIComponent(`${S}/${ep}화`)}`,
});
/** The fan wiki's page for a game used in several seasons. */
export const namuGame = (page: string, en: string): Source => ({
  label: { ko: `나무위키 「${page}」 (규칙·사용 기록 확인용)`, en: `Namuwiki, "${en}" (Korean fan wiki; rules and where the game was used)` },
  url: `${NAMU}${encodeURIComponent(page)}`,
});
export const namuMain: Source = {
  label: { ko: `나무위키 「${S}」 (방영 정보·시즌 규칙)`, en: 'Namuwiki, "The Genius: Black Garnet" (air dates, season rules)' },
  url: `${NAMU}${encodeURIComponent(S)}`,
};
export const namuAll: Source = {
  label: { ko: '나무위키 「더 지니어스/역대 게임」 (시즌별 게임 목록·원작 게임)', en: 'Namuwiki, "The Genius/games" (games by season, the board games they were based on)' },
  url: `${NAMU}${encodeURIComponent('더 지니어스/역대 게임')}`,
};
export const enWiki: Source = {
  label: { ko: '영어 위키백과 「The Genius: Black Garnet」 (게임 목록·규칙 요약)', en: 'English Wikipedia, "The Genius: Black Garnet" (game list, rule summaries)' },
  url: 'https://en.wikipedia.org/wiki/The_Genius:_Black_Garnet',
};
export const tenasiaStart: Source = {
  label: { ko: '텐아시아 — tvN 「더 지니어스: 블랙 가넷」 10월 1일부터 매주 수요일 밤 11시 방송 (2014년 9월)', en: 'TenAsia — tvN\'s The Genius: Black Garnet airs Wednesdays at 11 p.m. from 1 October (September 2014)' },
  url: 'https://www.tenasia.co.kr/article/2014090594514',
};
export const tenasiaFinal: Source = {
  label: { ko: '텐아시아 — 「더 지니어스3」 12월 17일 최종회 결승 보도 (2014년 12월)', en: 'TenAsia — report on the 17 December final episode of The Genius 3 (December 2014)' },
  url: 'https://www.tenasia.co.kr/article/2014121847824',
};
export const broadcast: Source = {
  label: { ko: 'tvN 「더 지니어스: 블랙가넷」 방송 본편 (2014년 10–12월, 12부작)', en: 'tvN, The Genius: Black Garnet, the episodes (October–December 2014, 12 episodes)' },
};
const siteEngine = (name: Bi, file: string): Source => ({
  label: { ko: `PUZZLTHINK ${name.ko} 규칙 구현 (${file})`, en: `PUZZLTHINK's ${name.en} rules engine (${file})` },
});

const NOTE: Record<'two' | 'one' | 'site', Bi> = {
  two: {
    ko: '규칙은 방송 화면의 규칙 설명을 옮긴 정리(나무위키)와 영어 위키백과의 규칙 요약, 두 곳을 맞춰 확인했어요. 위키백과는 요약이라 세부 수치는 나무위키 쪽에만 있는 것이 많고, 두 곳이 다른 곳은 예외 규칙에 적었어요.',
    en: 'The rules were checked against two written sources: the fan wiki\'s transcription of the on-screen rules and the English Wikipedia summary. Wikipedia only summarises, so many exact numbers appear in the fan wiki alone; where the two disagree, the exceptions say so.',
  },
  one: {
    ko: '이 게임의 자세한 규칙은 방송 화면의 규칙 설명을 옮긴 정리(나무위키) 한 곳에서만 확인할 수 있었어요. 확인되지 않는 세부 사항은 뺐어요.',
    en: 'The detailed rules of this game could be found in only one written source (the fan wiki, which transcribes the on-screen rules). Details that could not be checked were left out.',
  },
  site: {
    ko: '규칙은 방송 화면의 규칙 설명을 옮긴 정리(나무위키), 영어 위키백과의 규칙 요약, 방송을 보고 만든 PUZZLTHINK 구현을 서로 맞춰 확인했어요. 사이트 버전과 다른 곳은 "PUZZLTHINK 버전과 방송 규칙의 차이"에 적었어요.',
    en: 'The rules were checked against the fan wiki\'s transcription of the on-screen rules, the English Wikipedia summary and PUZZLTHINK\'s own implementation, built from the episodes. Differences from the site\'s version are listed under "How the PUZZLTHINK version differs".',
  },
};

export const DISCLAIMER = {
  ko: 'PUZZLTHINK는 더 지니어스 및 tvN, 제작사와 무관한 비공식 팬 제작 프로젝트예요. 프로그램 이름은 게임을 소개하기 위해서만 사용했고, 방송 화면·로고·출연자 사진은 쓰지 않았어요.',
  en: 'PUZZLTHINK is an unofficial fan project and is not affiliated with The Genius, tvN or the production company. Show names are used only to describe the games; no broadcast images, logos or cast photos are used.',
};

type Copy = Parameters<typeof makeGame>[1] & { siteDiff?: GuideBlock[] };
type Base = {
  slug: string; kind: MatchKind; when: Bi; episode: Bi; related: GameId[];
  /** Episode pages of the fan wiki the rules were read from. */
  eps: number[];
  /** Extra references (the fan wiki's own page for a recurring game). */
  extra?: Source[];
  note: 'two' | 'one';
  /** A playable PUZZLTHINK game: adds `site`, its rules engine as a source and the "checked against the site" note. */
  site?: { id: GameId; name: Bi; file: string };
};

export function g3Game(b: Base, ko: Copy, en: Copy): ShowGame {
  const sources = [...b.eps.map(namuEp), ...(b.extra ?? []), enWiki, ...(b.site ? [siteEngine(b.site.name, b.site.file)] : []), broadcast];
  const game = makeGame(
    { slug: b.slug, kind: b.kind, when: b.when, episode: b.episode, related: b.related, sources, oneSource: NOTE[b.site ? 'site' : b.note] },
    ko, en,
  );
  return b.site ? { ...game, site: b.site.id } : game;
}

export const round = (n: number): Bi => ({ ko: `${n}회전`, en: `Round ${n}` });
export const ep = (n: number): Bi => ({ ko: `${n}화`, en: `Episode ${n}` });

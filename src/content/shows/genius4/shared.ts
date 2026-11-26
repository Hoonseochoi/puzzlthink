// Shared bits of the 더 지니어스: 그랜드 파이널 pages (tvN, 2015-06-27 – 2015-09-12, 12 episodes, season 4).
import type { Bi, MatchKind, ShowGame, ShowGameCopy, Source } from '../types';
import type { GameId } from '@/lib/gameCatalog';

const S = '더 지니어스:그랜드 파이널';
export const namuEp = (n: number): Source => ({
  label: { ko: `나무위키 「${S}/${n}화」 (규칙 확인용)`, en: `Namuwiki, "The Genius: Grand Final/episode ${n}" (Korean fan wiki; checked for the rules)` },
  url: `https://namu.wiki/w/${encodeURIComponent(`${S}/${n}화`)}`,
});
export const namuMain: Source = {
  label: { ko: `나무위키 「${S}」 (방영일·회차·전체 규칙)`, en: 'Namuwiki, "The Genius: Grand Final" (air dates, episodes, overall rules)' },
  url: `https://namu.wiki/w/${encodeURIComponent(S)}`,
};
export const namuGame = (title: string, en: string): Source => ({
  label: { ko: `나무위키 「${title}」 (역대 시즌 공통 규칙)`, en: `Namuwiki, "${en}" (rules shared across seasons)` },
  url: `https://namu.wiki/w/${encodeURIComponent(title)}`,
});
export const wiki4: Source = {
  label: { ko: '영문 위키백과 「The Genius: Grand Final」 (게임 목록·형식 대조용)', en: 'Wikipedia, "The Genius: Grand Final" (game list and format, for cross-checking)' },
  url: 'https://en.wikipedia.org/wiki/The_Genius:_Grand_Final',
};
export const wikiSeason = (title: string): Source => ({
  label: { ko: `영문 위키백과 「${title.replace(/_/g, ' ')}」 (같은 게임의 이전 시즌 규칙 대조용)`, en: `Wikipedia, "${title.replace(/_/g, ' ')}" (the same game in an earlier season, for cross-checking)` },
  url: `https://en.wikipedia.org/wiki/${title}`,
});
export const broadcast: Source = {
  label: { ko: 'tvN 「더 지니어스: 그랜드 파이널」 방송 본편 (2015년 6–9월, 12부작)', en: 'tvN, The Genius: Grand Final, the episodes (June–September 2015, 12 episodes)' },
};
const siteEngine = (name: Bi, file: string): Source => ({
  label: { ko: `PUZZLTHINK ${name.ko} 규칙 구현 (${file})`, en: `PUZZLTHINK’s ${name.en} rules engine (${file})` },
});

export const DISCLAIMER = {
  ko: 'PUZZLTHINK는 더 지니어스 및 tvN, 제작사와 무관한 비공식 팬 제작 프로젝트예요. 프로그램 이름은 게임을 소개하기 위해서만 사용했고, 방송 화면·로고·출연자 사진은 쓰지 않았어요.',
  en: 'PUZZLTHINK is an unofficial fan project and is not affiliated with The Genius, tvN or the production company. Show names are used only to describe the games; no broadcast images, logos or cast photos are used.',
};

/** How the rules were checked; becomes the page's source note. */
type Check = 'one' | 'wiki' | 'site';
const NOTE: Record<Check, Bi> = {
  one: {
    ko: '이 게임의 규칙은 방송 화면의 규칙 설명을 옮긴 정리(나무위키) 한 곳에서만 자세히 확인할 수 있었어요. 확인되지 않는 세부 사항은 뺐어요.',
    en: 'The detailed rules of this game could be found in only one written source (the fan wiki, which transcribes the on-screen rule explanation). Details that could not be checked were left out.',
  },
  wiki: {
    ko: '게임의 큰 틀은 방송 규칙 설명을 옮긴 정리(나무위키)와 영문 위키백과의 정리를 맞춰 확인했어요. 점수표나 제한 시간 같은 세부 숫자는 대부분 나무위키 한 곳에만 있어서, 확인되지 않는 부분은 뺐어요.',
    en: 'The outline of the game was checked against two written summaries (the Korean fan wiki and English Wikipedia). Most detailed numbers, such as score tables and time limits, appear only in the fan wiki; anything that could not be checked was left out.',
  },
  site: {
    ko: '규칙은 방송 규칙 설명을 옮긴 정리(나무위키), 영문 위키백과의 이전 시즌 정리, 그리고 방송을 보고 만든 PUZZLTHINK 구현을 서로 맞춰 확인했어요. 이 시즌에서 바뀐 점은 나무위키에만 적혀 있어요. 사이트 버전과 다른 곳은 "PUZZLTHINK 버전과 방송 규칙의 차이"에 적었어요.',
    en: 'The rules were checked by comparing the fan wiki’s transcription, English Wikipedia’s summary of an earlier season and PUZZLTHINK’s own implementation, built from the episodes. This season’s changes appear only in the fan wiki. Differences from the site version are listed under "How the PUZZLTHINK version differs".',
  },
};

type Copy = Omit<ShowGameCopy, 'sourceNote'> & { note?: string };

export function g4Game(
  base: {
    slug: string; kind: MatchKind; ep: number; when?: Bi; related: GameId[]; check: Check; extra?: Source[];
    site?: { id: GameId; name: Bi; file: string };
  },
  ko: Copy,
  en: Copy,
): ShowGame {
  const { note: koNote, ...koRest } = ko;
  const { note: enNote, ...enRest } = en;
  const round = base.when ?? (base.ep === 12 ? { ko: '결승', en: 'Final' } : { ko: `${base.ep}회전`, en: `Round ${base.ep}` });
  const sources: Source[] = [
    namuEp(base.ep),
    ...(base.extra ?? []),
    ...(base.check === 'wiki' ? [wiki4] : []),
    ...(base.site ? [siteEngine(base.site.name, base.site.file)] : []),
    broadcast,
  ];
  return {
    slug: base.slug,
    kind: base.kind,
    when: round,
    episode: { ko: `${base.ep}화`, en: `Episode ${base.ep}` },
    ...(base.site ? { site: base.site.id } : {}),
    related: base.related,
    updated: '2026-11-26',
    sources,
    ko: { ...koRest, sourceNote: NOTE[base.check].ko + (koNote ? ` ${koNote}` : '') },
    en: { ...enRest, sourceNote: NOTE[base.check].en + (enNote ? ` ${enNote}` : '') },
  };
}

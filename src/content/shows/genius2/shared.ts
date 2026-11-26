// Shared bits of the 더 지니어스: 룰 브레이커 (The Genius season 2) pages: tvN, 2013-12-07 – 2014-02-22, 12 episodes,
// one round (회전) per episode. Rules were taken as facts from the fan wiki's episode pages and checked against the
// English Wikipedia summary; no wording, tables or play-by-play were copied.
import type { Bi, MatchKind, ShowGame, ShowGameCopy, Source } from '../types';
import type { GameId } from '@/lib/gameCatalog';

const NAMU = 'https://namu.wiki/w/';
const S2 = '더 지니어스:룰 브레이커';

export const namuEp = (n: number): Source => ({
  label: { ko: `나무위키 「${S2}/${n}화」 (규칙 확인용)`, en: `Namuwiki, "The Genius: Rule Breaker/episode ${n}" (Korean fan wiki; checked for the rules)` },
  url: `${NAMU}${encodeURIComponent(`${S2}/${n}화`)}`,
});
/** The fan wiki's page for a game used in several seasons. */
export const namuGame = (title: string, en: string): Source => ({
  label: { ko: `나무위키 「${title}」 (규칙 확인용)`, en: `Namuwiki, "${en}" (Korean fan wiki; checked for the rules)` },
  url: `${NAMU}${encodeURIComponent(title)}`,
});
export const namuMain: Source = {
  label: { ko: `나무위키 「${S2}」 (방영 목록·기본 규칙)`, en: 'Namuwiki, "The Genius: Rule Breaker" (episode list, basic rules)' },
  url: `${NAMU}${encodeURIComponent(S2)}`,
};
export const enwiki: Source = {
  label: { ko: '영어 위키백과 「The Genius: Rule Breaker」 (게임 규칙 교차 확인)', en: 'English Wikipedia, "The Genius: Rule Breaker" (rules cross-check)' },
  url: 'https://en.wikipedia.org/wiki/The_Genius:_Rule_Breaker',
};
export const tenasia: Source = {
  label: { ko: '텐아시아 「더 지니어스 시즌2: 룰 브레이커」 제작발표회 기사 (2013년 12월, 첫 방송일 확인)', en: 'TenAsia, report on The Genius: Rule Breaker press event (December 2013; premiere date)' },
  url: 'https://www.tenasia.co.kr/article/2013120345524',
};
export const tenasiaFinal: Source = {
  label: { ko: '텐아시아 「더 지니어스2」 결승 기사 (2014년 2월 23일, 마지막 방송·결승 종목 확인)', en: 'TenAsia, report on the Rule Breaker final (23 February 2014; last episode and final games)' },
  url: 'https://www.tenasia.co.kr/article/2014022325914',
};
export const broadcast: Source = {
  label: { ko: 'tvN 「더 지니어스: 룰 브레이커」 방송 본편 (2013년 12월 – 2014년 2월, 12부작)', en: 'tvN, The Genius: Rule Breaker, the episodes (December 2013 – February 2014, 12 episodes)' },
};
const siteEngine = (name: Bi, file: string): Source => ({
  label: { ko: `PUZZLTHINK ${name.ko} 규칙 구현 (${file})`, en: `PUZZLTHINK's ${name.en} rules engine (${file})` },
});

const TWO: Bi = {
  ko: '규칙은 방송 화면의 규칙 설명을 옮긴 두 정리(나무위키 회차 문서, 영어 위키백과)를 서로 맞춰 확인했어요. 둘이 다르거나 한 곳에만 있는 세부 사항은 본문에 따로 적었어요.',
  en: 'The rules were checked by comparing two written summaries of the on-screen rule explanations (the Korean fan wiki’s episode page and English Wikipedia). Where they differ, or a detail appears in only one, the page says so.',
};
const ONE: Bi = {
  ko: '이 게임의 자세한 규칙은 방송 화면의 규칙 설명을 옮긴 정리(나무위키) 한 곳에서만 확인할 수 있었어요. 영어 위키백과에는 대략적인 진행만 있어요. 확인되지 않는 세부 사항은 뺐어요.',
  en: 'The detailed rules of this game could be found in only one written source (the Korean fan wiki, which transcribes the on-screen explanation); English Wikipedia gives only an outline. Details that could not be checked were left out.',
};
const SITE_CHECKED: Bi = {
  ko: '규칙은 두 정리(나무위키, 영어 위키백과)와, 방송을 보고 만든 PUZZLTHINK 구현을 서로 맞춰 확인했어요. 다른 곳은 "PUZZLTHINK 버전과 방송 규칙의 차이"에 적었어요.',
  en: 'The rules were checked against two written summaries (the Korean fan wiki and English Wikipedia) and PUZZLTHINK’s own implementation, built from the episodes. Differences are listed under "How the PUZZLTHINK version differs".',
};

export const DISCLAIMER = {
  ko: 'PUZZLTHINK는 더 지니어스 및 tvN, 제작사와 무관한 비공식 팬 제작 프로젝트예요. 프로그램 이름은 게임을 소개하기 위해서만 사용했고, 방송 화면·로고·출연자 사진은 쓰지 않았어요.',
  en: 'PUZZLTHINK is an unofficial fan project and is not affiliated with The Genius, tvN or the production company. Show names are used only to describe the games; no broadcast images, logos or cast photos are used.',
};

type Copy = Omit<ShowGameCopy, 'sourceNote'> & { note?: string };
type Base = {
  slug: string; kind: MatchKind; rounds: number[]; label?: Bi;
  related: GameId[]; check: 'two' | 'one'; extra?: Source[];
  site?: { id: GameId; name: Bi; file: string };
};

function whenOf(eps: number[]): Bi {
  const r = eps.filter((n) => n < 12);
  const fin = eps.includes(12);
  const ko = [r.length ? `${r.join('·')}회전` : '', fin ? '결승' : ''].filter(Boolean).join(' · ');
  const enR = r.length === 1 ? `Round ${r[0]}` : r.length ? `Rounds ${r.join(', ')}` : '';
  const en = [enR, fin ? (enR ? 'the final' : 'Final') : ''].filter(Boolean).join(' and ');
  return { ko, en };
}

/** One game page. `rounds` lists every round (= episode) it was played in, 12 meaning the final. */
export function g2Game(base: Base, ko: Copy, en: Copy): ShowGame {
  const eps = [...new Set(base.rounds)];
  const note: Bi = base.site ? SITE_CHECKED : base.check === 'two' ? TWO : ONE;
  const { note: koNote, ...koRest } = ko;
  const { note: enNote, ...enRest } = en;
  const when: Bi = base.label ?? whenOf(eps);
  return {
    slug: base.slug,
    kind: base.kind,
    when,
    episode: { ko: `${eps.join('·')}화`, en: eps.length === 1 ? `Episode ${eps[0]}` : `Episodes ${eps.join(', ')}` },
    ...(base.site ? { site: base.site.id } : {}),
    related: base.related,
    updated: '2026-11-26',
    sources: [...eps.map(namuEp), ...(base.extra ?? []), enwiki, ...(base.site ? [siteEngine(base.site.name, base.site.file)] : []), broadcast],
    ko: { ...koRest, sourceNote: note.ko + (koNote ? ` ${koNote}` : '') },
    en: { ...enRest, sourceNote: note.en + (enNote ? ` ${enNote}` : '') },
  };
}

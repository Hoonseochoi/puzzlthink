// Shared bits of the 더 타임 호텔 pages (TVING, 2023-04-12 – 2023-05-17, 10 episodes, 8 days in the hotel).
import type { Bi, MatchKind, ShowGame, Source } from '../types';
import { makeGame } from '../make';

const S = '더 타임 호텔';
export const namuDay = (d: string): Source => ({
  label: { ko: `나무위키 「${S}/${d}일차」 (규칙 확인용)`, en: `Namuwiki, "The Time Hotel/day ${d}" (Korean fan wiki; checked for the rules)` },
  url: `https://namu.wiki/w/${encodeURIComponent(`${S}/${d}일차`)}`,
});
export const namuMain: Source = {
  label: { ko: `나무위키 「${S}」 (공개일·회차·전체 규칙)`, en: 'Namuwiki, "The Time Hotel" (release dates, episodes, overall rules)' },
  url: `https://namu.wiki/w/${encodeURIComponent(S)}`,
};
export const osen: Source = {
  label: { ko: 'OSEN 제작발표회 기사 (2023년 4월, 형식·게임 이름 확인)', en: 'OSEN, report on the press conference (April 2023; format and game names)' },
  url: 'https://www.osen.co.kr/article/G1112081195',
};
export const broadcast: Source = {
  label: { ko: '티빙 「더 타임 호텔」 방송 본편 (2023년 4–5월 공개, 10부작)', en: 'TVING, The Time Hotel, the episodes (released April–May 2023, 10 episodes)' },
};
const ONE: Bi = {
  ko: '이 게임의 자세한 규칙은 방송 화면의 규칙 설명을 옮긴 정리(나무위키) 한 곳에서만 확인할 수 있었어요. 기사로는 게임 이름과 큰 틀만 확인돼요. 확인되지 않는 세부 사항은 뺐어요.',
  en: 'The detailed rules of this game could be found in only one written source (the fan wiki, which transcribes the on-screen rules); news reports confirm only the name and outline. Details that could not be checked were left out.',
};
export const DISCLAIMER = {
  ko: 'PUZZLTHINK는 더 타임 호텔 및 티빙, 제작사와 무관한 비공식 팬 제작 프로젝트예요. 프로그램 이름은 게임을 소개하기 위해서만 사용했고, 방송 화면·로고·출연자 사진은 쓰지 않았어요.',
  en: 'PUZZLTHINK is an unofficial fan project and is not affiliated with The Time Hotel, TVING or the production company. Show names are used only to describe the games; no broadcast images, logos or cast photos are used.',
};

type Args = Parameters<typeof makeGame>;
/** `days` are the wiki day pages the rules come from; `when` is the label in lists. */
export const thGame = (slug: string, kind: MatchKind, when: Bi, days: string[], related: ShowGame['related'], ko: Args[1], en: Args[2]) =>
  makeGame({ slug, kind, when, related, sources: [...days.map(namuDay), osen, broadcast], oneSource: ONE }, ko, en);

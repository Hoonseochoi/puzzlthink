// Shared bits of the 데블스 플랜: 데드 어게인 pages: references and the spoiler-free source note.
import type { Bi, Source } from '../types';

const NAMU = 'https://namu.wiki/w/';
const DP3 = '데블스 플랜: 데드 어게인';

/** The fan wiki's day page (rules only were taken from it, as facts; no wording, tables or play-by-play). */
export const namuDay = (day: number): Source => ({
  label: { ko: `나무위키 「${DP3}/${day}일차」 (규칙 확인용)`, en: `Namuwiki, "${DP3}/day ${day}" (Korean fan wiki; checked for the rules)` },
  url: `${NAMU}${encodeURIComponent(`${DP3}/${day}일차`)}`,
});
export const namuRules: Source = {
  label: { ko: `나무위키 「${DP3}/게임 규칙」 (전체 형식)`, en: `Namuwiki, "${DP3}/game rules" (overall format)` },
  url: `${NAMU}${encodeURIComponent(`${DP3}/게임 규칙`)}`,
};
export const namuExile: Source = {
  label: { ko: `나무위키 「${DP3}/유배지」 (유배지 형식)`, en: `Namuwiki, "${DP3}/exile zone" (exile format)` },
  url: `${NAMU}${encodeURIComponent(`${DP3}/유배지`)}`,
};
export const netflixTeaser: Source = {
  label: { ko: '넷플릭스 공식 뉴스룸 — 「데블스 플랜: 데드 어게인」 공개일·티저 발표', en: "Netflix newsroom — The Devil's Plan: Dead Again release date and teaser" },
  url: 'https://about.netflix.com/ko/news/the-devils-plan-dead-again-teaser',
};
export const broadcast: Source = {
  label: { ko: '넷플릭스 「데블스 플랜: 데드 어게인」 방송 본편 (2026년 11월 공개, 14부작)', en: "Netflix, The Devil's Plan: Dead Again, the episodes (released November 2026, 14 episodes)" },
};
/** The site's own rules engine for a game it has built from the broadcast. */
export const siteEngine = (name: Bi, file: string): Source => ({
  label: { ko: `PUZZLTHINK ${name.ko} 규칙 구현 (${file})`, en: `PUZZLTHINK's ${name.en} rules engine (${file})` },
});

export const ONE_SOURCE_KO = '이 게임의 규칙은 방송 화면에 나온 규칙서를 옮긴 정리(나무위키) 한 곳에서만 자세히 확인할 수 있었어요. 방송 본편과 맞춰 보며 확인되지 않는 세부 사항은 뺐어요.';
export const ONE_SOURCE_EN = 'The detailed rules of this game could be found in only one written source (the fan wiki, which transcribes the on-screen rulebook). Details that could not be checked against the episode were left out.';
export const SITE_CHECKED_KO = '규칙은 방송 화면의 규칙서를 옮긴 정리(나무위키)와, 방송을 보고 만든 PUZZLTHINK 구현을 서로 맞춰 확인했어요. 둘이 다른 곳은 아래 "PUZZLTHINK 버전과 방송 규칙의 차이"에 적었어요.';
export const SITE_CHECKED_EN = "The rules were checked by comparing the fan wiki's transcription of the on-screen rulebook with PUZZLTHINK's own implementation, which was built from the episodes. Where the two differ, the difference is listed under \"How the PUZZLTHINK version differs\".";

export const DISCLAIMER = {
  ko: 'PUZZLTHINK는 데블스 플랜 및 넷플릭스, 제작사와 무관한 비공식 팬 제작 프로젝트예요. 프로그램 이름은 게임을 소개하기 위해서만 사용했고, 방송 화면·로고·출연자 사진은 쓰지 않았어요.',
  en: "PUZZLTHINK is an unofficial fan project and is not affiliated with The Devil's Plan, Netflix or the production company. Show names are used only to describe the games; no broadcast images, logos or cast photos are used.",
};

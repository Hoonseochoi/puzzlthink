// Shared bits of the 데블스 플랜: 데스룸 (season 2) pages.
import type { Source } from '../types';

const NAMU = 'https://namu.wiki/w/';
const DP2 = '데블스 플랜: 데스룸';

/** The fan wiki's day page (only the rules were taken from it, as facts; no wording, tables or play-by-play). */
export const namuDay = (day: number): Source => ({
  label: { ko: `나무위키 「${DP2}/${day}일차」 (규칙 확인용)`, en: `Namuwiki, "${DP2}/day ${day}" (Korean fan wiki; checked for the rules)` },
  url: `${NAMU}${encodeURIComponent(`${DP2}/${day}일차`)}`,
});
export const namuRules: Source = {
  label: { ko: `나무위키 「${DP2}/게임 규칙」 (전체 형식)`, en: `Namuwiki, "${DP2}/game rules" (overall format)` },
  url: `${NAMU}${encodeURIComponent(`${DP2}/게임 규칙`)}`,
};
export const broadcast: Source = {
  label: { ko: '넷플릭스 「데블스 플랜: 데스룸」 방송 본편 (2025년 5월 공개, 12부작)', en: "Netflix, The Devil's Plan: Death Room, the episodes (released May 2025, 12 episodes)" },
};

export const ONE_SOURCE_KO = '이 게임의 규칙은 방송 화면에 나온 규칙서를 옮긴 정리(나무위키) 한 곳에서만 자세히 확인할 수 있었어요. 확인되지 않는 세부 사항은 뺐어요.';
export const ONE_SOURCE_EN = 'The detailed rules of this game could be found in only one written source (the fan wiki, which transcribes the on-screen rulebook). Details that could not be checked were left out.';

export const DISCLAIMER = {
  ko: 'PUZZLTHINK는 데블스 플랜 및 넷플릭스, 제작사와 무관한 비공식 팬 제작 프로젝트예요. 프로그램 이름은 게임을 소개하기 위해서만 사용했고, 방송 화면·로고·출연자 사진은 쓰지 않았어요.',
  en: "PUZZLTHINK is an unofficial fan project and is not affiliated with The Devil's Plan, Netflix or the production company. Show names are used only to describe the games; no broadcast images, logos or cast photos are used.",
};

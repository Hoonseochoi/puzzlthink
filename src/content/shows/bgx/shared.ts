// Shared bits of the 피의 게임X pages (Wavve, 2026-07-03 – 2026-08-28, 10 episodes, 20 players in five teams).
import type { Source } from '../types';

const NAMU = 'https://namu.wiki/w/';
const BGX = '피의 게임X';

/** The fan wiki's day page (only the rules were taken from it, as facts; no wording, tables or play-by-play). */
export const namuDay = (day: string): Source => ({
  label: { ko: `나무위키 「${BGX}/${day}일차」 (규칙 확인용)`, en: `Namuwiki, "${BGX}/day ${day}" (Korean fan wiki; checked for the rules)` },
  url: `${NAMU}${encodeURIComponent(`${BGX}/${day}일차`)}`,
});
export const namuRules: Source = {
  label: { ko: `나무위키 「${BGX}/게임 규칙」 (전체 형식·등장 게임)`, en: `Namuwiki, "${BGX}/game rules" (format and list of games)` },
  url: `${NAMU}${encodeURIComponent(`${BGX}/게임 규칙`)}`,
};
export const broadcast: Source = {
  label: { ko: '웨이브 「피의 게임X」 방송 본편 (2026년 7–8월 공개, 10부작)', en: 'Wavve, The Bloody Game X, the episodes (released July–August 2026, 10 episodes)' },
};

export const ONE_SOURCE_KO = '이 게임의 규칙은 방송 화면의 규칙서를 옮긴 정리(나무위키) 한 곳에서만 자세히 확인할 수 있었어요. 확인되지 않는 세부 사항은 뺐어요.';
export const ONE_SOURCE_EN = 'The detailed rules of this game could be found in only one written source (the fan wiki, which transcribes the on-screen rulebook). Details that could not be checked were left out.';

export const DISCLAIMER = {
  ko: 'PUZZLTHINK는 피의 게임 및 웨이브, 제작사와 무관한 비공식 팬 제작 프로젝트예요. 프로그램 이름은 게임을 소개하기 위해서만 사용했고, 방송 화면·로고·출연자 사진은 쓰지 않았어요.',
  en: 'PUZZLTHINK is an unofficial fan project and is not affiliated with The Bloody Game, Wavve or the production companies. Show names are used only to describe the games; no broadcast images, logos or cast photos are used.',
};

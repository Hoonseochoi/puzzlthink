// Shared bits of the 데스게임 pages (Netflix, 2026; season 1 1:1 weekly matches, season 2 a tournament).
import type { Source } from '../types';

const PAGE = '데스게임(넷플릭스 예능)';
export const namuResults: Source = {
  label: { ko: `나무위키 「${PAGE}/진행 결과」 (게임 규칙 확인용)`, en: `Namuwiki, "${PAGE}/results" (Korean fan wiki; checked for the rules)` },
  url: `https://namu.wiki/w/${encodeURIComponent(`${PAGE}/진행 결과`)}`,
};
export const namuMain: Source = {
  label: { ko: `나무위키 「${PAGE}」 (공개일·회차)`, en: `Namuwiki, "${PAGE}" (release dates, episodes)` },
  url: `https://namu.wiki/w/${encodeURIComponent(PAGE)}`,
};
export const broadcast2: Source = {
  label: { ko: '넷플릭스 「데스게임2: 최후의 승자」 방송 본편 (2026년 4–6월 공개, 9부작)', en: 'Netflix, The Risk Takers season 2 (Death Game 2), the episodes (released April–June 2026, 9 episodes)' },
};
export const broadcast1: Source = {
  label: { ko: '넷플릭스 「데스게임: 천만원을 걸어라」 방송 본편 (2026년 1–4월 공개, 11부작)', en: 'Netflix, The Risk Takers season 1 (Death Game), the episodes (released January–April 2026, 11 episodes)' },
};

export const ONE_SOURCE_KO = '이 게임의 규칙은 방송 화면의 규칙 설명을 옮긴 정리(나무위키) 한 곳에서만 자세히 확인할 수 있었어요. 확인되지 않는 세부 사항은 뺐어요.';
export const ONE_SOURCE_EN = 'The detailed rules of this game could be found in only one written source (the fan wiki, which transcribes the on-screen rules). Details that could not be checked were left out.';

export const DISCLAIMER = {
  ko: 'PUZZLTHINK는 데스게임 및 넷플릭스, 제작사와 무관한 비공식 팬 제작 프로젝트예요. 프로그램 이름은 게임을 소개하기 위해서만 사용했고, 방송 화면·로고·출연자 사진은 쓰지 않았어요.',
  en: 'PUZZLTHINK is an unofficial fan project and is not affiliated with The Risk Takers (데스게임), Netflix or the production company. Show names are used only to describe the games; no broadcast images, logos or cast photos are used.',
};

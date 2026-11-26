// Shared bits of the 피의 게임3 pages (Wavve, 2024-11-15 – 2025-01-24, 14 episodes + a behind-the-scenes episode).
import type { Bi, MatchKind, ShowGame, Source } from '../types';
import { makeGame } from '../make';

const S3 = '피의 게임3';
// Days 5 and 6 share one wiki page ("5-6일차"), as do 11 and 12.
const PAGE: Record<string, string> = { '5': '5-6', '6': '5-6', '11': '11-12', '12': '11-12' };
export const namuDay = (d: string): Source => { const day = PAGE[d] ?? d; return {
  label: { ko: `나무위키 「${S3}/${day}일차」 (규칙 확인용)`, en: `Namuwiki, "${S3}/day ${day}" (Korean fan wiki; checked for the rules)` },
  url: `https://namu.wiki/w/${encodeURIComponent(`${S3}/${day}일차`)}`,
}; };
export const namuRules: Source = {
  label: { ko: `나무위키 「${S3}/게임 규칙」 (전체 형식·등장 게임)`, en: `Namuwiki, "${S3}/game rules" (format and list of games)` },
  url: `https://namu.wiki/w/${encodeURIComponent(`${S3}/게임 규칙`)}`,
};
export const broadcast: Source = {
  label: { ko: '웨이브 「피의 게임3」 방송 본편 (2024년 11월–2025년 1월 공개)', en: 'Wavve, The Bloody Game 3, the episodes (released November 2024 – January 2025)' },
};
const ONE: Bi = {
  ko: '이 게임의 규칙은 방송 화면의 규칙서를 옮긴 정리(나무위키) 한 곳에서만 자세히 확인할 수 있었어요. 확인되지 않는 세부 사항은 뺐어요.',
  en: 'The detailed rules of this game could be found in only one written source (the fan wiki, which transcribes the on-screen rulebook). Details that could not be checked were left out.',
};
export const DISCLAIMER = {
  ko: 'PUZZLTHINK는 피의 게임 및 웨이브, 제작사와 무관한 비공식 팬 제작 프로젝트예요. 프로그램 이름은 게임을 소개하기 위해서만 사용했고, 방송 화면·로고·출연자 사진은 쓰지 않았어요.',
  en: 'PUZZLTHINK is an unofficial fan project and is not affiliated with The Bloody Game, Wavve or the production companies. Show names are used only to describe the games; no broadcast images, logos or cast photos are used.',
};

type Args = Parameters<typeof makeGame>;
export const bg3Game = (slug: string, kind: MatchKind, day: string, related: ShowGame['related'], ko: Args[1], en: Args[2]) =>
  makeGame({ slug, kind, when: { ko: `${day}일차`, en: `Day ${day}` }, related, sources: [namuDay(day), broadcast], oneSource: ONE }, ko, en);

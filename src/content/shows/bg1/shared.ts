// Shared bits of the 피의 게임 (season 1) pages (MBC and Wavve, 2021-11-01 – 2022-01-24, 12 episodes plus a special).
import type { Bi, MatchKind, ShowGame, Source } from '../types';
import { makeGame } from '../make';

const S = '피의 게임(시즌 1)';
export const namuDay = (d: string): Source => ({
  label: { ko: `나무위키 「${S}/${d}일차」 (규칙 확인용)`, en: `Namuwiki, "The Bloody Game (season 1)/day ${d}" (Korean fan wiki; checked for the rules)` },
  url: `https://namu.wiki/w/${encodeURIComponent(`${S}/${d}일차`)}`,
});
export const namuRules: Source = {
  label: { ko: `나무위키 「${S}/게임 규칙」 (전체 규칙·게임 규칙)`, en: 'Namuwiki, "The Bloody Game (season 1)/game rules" (overall and per-game rules)' },
  url: `https://namu.wiki/w/${encodeURIComponent(`${S}/게임 규칙`)}`,
};
export const namuMain: Source = {
  label: { ko: `나무위키 「${S}」 (방영일·회차)`, en: 'Namuwiki, "The Bloody Game (season 1)" (air dates, episodes)' },
  url: `https://namu.wiki/w/${encodeURIComponent(S)}`,
};
export const broadcast: Source = {
  label: { ko: 'MBC·웨이브 「피의 게임」 방송 본편 (2021년 11월–2022년 1월)', en: 'MBC and Wavve, The Bloody Game, the episodes (November 2021 – January 2022)' },
};
const ONE: Bi = {
  ko: '이 게임의 규칙은 방송 화면의 규칙 설명을 옮긴 정리(나무위키) 한 곳에서만 자세히 확인할 수 있었어요. 같은 정리 안의 일차 문서와 게임 규칙 문서를 맞대어 봤지만, 독립된 두 번째 출처는 아니에요. 확인되지 않는 세부 사항은 뺐어요.',
  en: 'The detailed rules of this game could be found in only one written source (the fan wiki, which transcribes the on-screen rules). Its day page and rules page were compared, but they are not an independent second source. Details that could not be checked were left out.',
};
export const DISCLAIMER = {
  ko: 'PUZZLTHINK는 피의 게임 및 MBC·웨이브, 제작사와 무관한 비공식 팬 제작 프로젝트예요. 프로그램 이름은 게임을 소개하기 위해서만 사용했고, 방송 화면·로고·출연자 사진은 쓰지 않았어요.',
  en: 'PUZZLTHINK is an unofficial fan project and is not affiliated with The Bloody Game, MBC, Wavve or the production companies. Show names are used only to describe the games; no broadcast images, logos or cast photos are used.',
};

type Args = Parameters<typeof makeGame>;
export const bg1Game = (slug: string, kind: MatchKind, d: string, related: ShowGame['related'], ko: Args[1], en: Args[2], when?: Bi) =>
  makeGame({ slug, kind, when: when ?? { ko: `${d}일차`, en: `Day ${d}` }, related, sources: [namuDay(d), namuRules, broadcast], oneSource: ONE }, ko, en);

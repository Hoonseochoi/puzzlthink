// Shared bits of the 데블스 플랜 (season 1) pages (Netflix, 2023-09-26 – 2023-10-10, 12 episodes, seven days).
import type { Bi, MatchKind, ShowGame, Source } from '../types';
import type { GameId } from '@/lib/gameCatalog';
import type { GuideBlock } from '@/content/guides/types';
import { makeGame } from '../make';

const S = '데블스 플랜(시즌 1)';
export const namuDay = (d: number): Source => ({
  label: { ko: `나무위키 「${S}/${d}일차」 (규칙 확인용)`, en: `Namuwiki, "The Devil's Plan (season 1)/day ${d}" (Korean fan wiki; checked for the rules)` },
  url: `https://namu.wiki/w/${encodeURIComponent(`${S}/${d}일차`)}`,
});
export const namuRules: Source = {
  label: { ko: `나무위키 「${S}/게임 규칙」 (전체 형식·히든 스테이지)`, en: 'Namuwiki, "The Devil\'s Plan (season 1)/game rules" (format, hidden stage)' },
  url: `https://namu.wiki/w/${encodeURIComponent(`${S}/게임 규칙`)}`,
};
export const namuMain: Source = {
  label: { ko: `나무위키 「${S}」 (공개일·회차)`, en: 'Namuwiki, "The Devil\'s Plan (season 1)" (release dates, episodes)' },
  url: `https://namu.wiki/w/${encodeURIComponent(S)}`,
};
export const broadcast: Source = {
  label: { ko: '넷플릭스 「데블스 플랜」 방송 본편 (2023년 9–10월 공개, 12부작)', en: "Netflix, The Devil's Plan, the episodes (released September–October 2023, 12 episodes)" },
};
const siteEngine = (name: Bi, file: string): Source => ({
  label: { ko: `PUZZLTHINK ${name.ko} 규칙 구현 (${file})`, en: `PUZZLTHINK's ${name.en} rules engine (${file})` },
});
const ONE: Bi = {
  ko: '이 게임의 규칙은 방송 화면의 규칙서를 옮긴 정리(나무위키) 한 곳에서만 자세히 확인할 수 있었어요. 확인되지 않는 세부 사항은 뺐어요.',
  en: 'The detailed rules of this game could be found in only one written source (the fan wiki, which transcribes the on-screen rulebook). Details that could not be checked were left out.',
};
const SITE_CHECKED: Bi = {
  ko: '규칙은 방송 화면의 규칙서를 옮긴 정리(나무위키)와, 방송을 보고 만든 PUZZLTHINK 구현을 서로 맞춰 확인했어요. 둘이 다른 곳은 "PUZZLTHINK 버전과 방송 규칙의 차이"에 적었어요.',
  en: 'The rules were checked by comparing the fan wiki\'s transcription of the on-screen rulebook with PUZZLTHINK\'s own implementation, built from the episodes. Differences are listed under "How the PUZZLTHINK version differs".',
};
export const DISCLAIMER = {
  ko: 'PUZZLTHINK는 데블스 플랜 및 넷플릭스, 제작사와 무관한 비공식 팬 제작 프로젝트예요. 프로그램 이름은 게임을 소개하기 위해서만 사용했고, 방송 화면·로고·출연자 사진은 쓰지 않았어요.',
  en: "PUZZLTHINK is an unofficial fan project and is not affiliated with The Devil's Plan, Netflix or the production company. Show names are used only to describe the games; no broadcast images, logos or cast photos are used.",
};

type Args = Parameters<typeof makeGame>;
type Copy = Args[1] & { siteDiff?: GuideBlock[] };
/** `site` links a playable PUZZLTHINK game; then `file` names its rules engine and the source note says both were compared. */
export function dp1Game(slug: string, kind: MatchKind, when: Bi, days: number[], related: ShowGame['related'], ko: Copy, en: Copy,
  site?: { id: GameId; name: Bi; file: string }): ShowGame {
  const sources = [...days.map(namuDay), ...(kind === 'hidden' ? [namuRules] : []), ...(site ? [siteEngine(site.name, site.file)] : []), broadcast];
  const game = makeGame({ slug, kind, when, related, sources, oneSource: site ? SITE_CHECKED : ONE }, ko, en);
  return site ? { ...game, site: site.id } : game;
}
export const day = (d: number): Bi => ({ ko: `${d}일차`, en: `Day ${d}` });

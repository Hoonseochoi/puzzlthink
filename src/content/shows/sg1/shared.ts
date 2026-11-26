// Shared bits of the 소사이어티 게임 (season 1) pages (tvN, 2016-10-16 – 2017-01-01, 12 episodes, fourteen days).
// Rules come from the fan wiki's episode pages, cross-checked against tvN's episode synopses as listed on TheTVDB.
import type { Bi, MatchKind, ShowGame, Source } from '../types';
import { makeGame } from '../make';

const S = '소사이어티 게임(시즌 1)';
export const namuEp = (n: number): Source => ({
  label: { ko: `나무위키 「${S}/${n}화」 (규칙 확인용)`, en: `Namuwiki, "The Society Game (season 1)/episode ${n}" (Korean fan wiki; checked for the rules)` },
  url: `https://namu.wiki/w/${encodeURIComponent(`${S}/${n}화`)}`,
});
export const namuMain: Source = {
  label: { ko: `나무위키 「${S}」 (방영일·전체 규칙)`, en: 'Namuwiki, "The Society Game (season 1)" (air dates, overall rules)' },
  url: `https://namu.wiki/w/${encodeURIComponent(S)}`,
};
/** TheTVDB episode ids for episodes 1–12 (the pages carry tvN's own Korean synopsis with the challenge rules). */
const TVDB = [5806867, 5808653, 5817116, 5826180, 5835635, 5847427, 5857866, 5868181, 5876489, 5885979, 5894240, 5904305];
export const tvdbEp = (n: number): Source => ({
  label: { ko: `TheTVDB 「소사이어티 게임」 ${n}화 회차 정보 (tvN 회차 소개, 규칙 대조용)`, en: `TheTVDB, The Society Game episode ${n} (tvN’s episode synopsis; rules cross-check)` },
  url: `https://www.thetvdb.com/series/society-game/episodes/${TVDB[n - 1]}`,
});
export const tvdbSeason: Source = {
  label: { ko: 'TheTVDB 「소사이어티 게임」 시즌 1 회차 목록 (방영일)', en: 'TheTVDB, The Society Game season 1 episode list (air dates)' },
  url: 'https://thetvdb.com/series/society-game/seasons/official/1',
};
export const broadcast: Source = {
  label: { ko: 'tvN 「소사이어티 게임」 방송 본편 (2016년 10월–2017년 1월, 12부작)', en: 'tvN, The Society Game, the episodes (October 2016 – January 2017, 12 episodes)' },
};
const TWO: Bi = {
  ko: '규칙은 방송 화면의 규칙 설명을 옮긴 정리(나무위키)와, tvN이 회차 소개로 낸 규칙 요약(TheTVDB에 실린 회차 정보)을 서로 맞춰 확인했어요. 둘 다에서 확인되지 않는 세부 사항은 그렇다고 적거나 뺐어요.',
  en: 'The rules were checked by comparing the fan wiki’s transcription of the on-screen rules with tvN’s own episode synopsis (as listed on TheTVDB). Details neither confirms are flagged or left out.',
};
const ONE: Bi = {
  ko: '이 게임의 세부 규칙은 방송 화면의 규칙 설명을 옮긴 정리(나무위키) 한 곳에서만 확인할 수 있었어요. tvN 회차 소개에는 파이널이 3라운드, 2선승제이고 라운드마다 신체·두뇌·감각을 한 명씩 맡는다는 것까지만 나와요. 확인되지 않는 세부 사항은 뺐어요.',
  en: 'The detailed rules of this game could be found in only one written source (the fan wiki, transcribing the on-screen rules). tvN’s episode synopsis confirms only that the final is three rounds, first to two, with one player each on body, brain and sense. Details that could not be checked were left out.',
};
export const DISCLAIMER = {
  ko: 'PUZZLTHINK는 소사이어티 게임 및 tvN, 제작사와 무관한 비공식 팬 제작 프로젝트예요. 프로그램 이름은 게임을 소개하기 위해서만 사용했고, 방송 화면·로고·출연자 사진은 쓰지 않았어요.',
  en: 'PUZZLTHINK is an unofficial fan project and is not affiliated with The Society Game, tvN or the production companies. Show names are used only to describe the games; no broadcast images, logos or cast photos are used.',
};

type Args = Parameters<typeof makeGame>;
/** One page per challenge; `ep` is the episode it aired in (also picks the wiki and TheTVDB pages). */
export function sg1Game(slug: string, kind: MatchKind, when: Bi, ep: number, related: ShowGame['related'], ko: Args[1], en: Args[2]): ShowGame {
  const sources = [namuEp(ep), tvdbEp(ep), broadcast];
  return makeGame({ slug, kind, when, episode: { ko: `${ep}화`, en: `Episode ${ep}` }, related, sources, oneSource: kind === 'final' ? ONE : TWO }, ko, en);
}
export const day = (d: number): Bi => ({ ko: `${d}일차 챌린지`, en: `Day ${d} challenge` });
export const finalRound = (r: number): Bi => ({ ko: `파이널 ${r}라운드 (14일차)`, en: `Final, round ${r} (day 14)` });

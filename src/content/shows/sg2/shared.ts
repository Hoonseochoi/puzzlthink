// Shared bits of the 소사이어티 게임 2 pages (tvN, 2017-08-25 – 2017-11-10, 12 episodes, 13 days in the round village).
// Rules of challenges 1–11 rest on two sources: tvN's own episode notes (kept on TheTVDB) and the fan wiki's episode pages.
// The final's three rounds are spelled out only on the wiki.
import type { Bi, MatchKind, ShowGame, ShowGameCopy, Source } from '../types';
import type { GameId } from '@/lib/gameCatalog';

const S = '소사이어티 게임 2';
export const namuEp = (n: number): Source => ({
  label: { ko: `나무위키 「${S}/${n}화」 (규칙 확인용)`, en: `Namuwiki, "The Society Game 2/episode ${n}" (Korean fan wiki; checked for the rules)` },
  url: `https://namu.wiki/w/${encodeURIComponent(`${S}/${n}화`)}`,
});
export const namuMain: Source = {
  label: { ko: `나무위키 「${S}」 (방영일·회차·새 규칙)`, en: 'Namuwiki, "The Society Game 2" (air dates, episodes, rule changes)' },
  url: `https://namu.wiki/w/${encodeURIComponent(S)}`,
};
export const namuSeries: Source = {
  label: { ko: '나무위키 「소사이어티 게임」 (시리즈 공통 규칙)', en: 'Namuwiki, "The Society Game" (rules shared by both seasons)' },
  url: `https://namu.wiki/w/${encodeURIComponent('소사이어티 게임')}`,
};
/** tvN's episode notes for each episode, as kept on TheTVDB (they list the challenge rules). */
const TVDB: Record<number, string> = {
  1: '6241148', 2: '6289320', 3: '6305310', 4: '6316541', 5: '6325870', 6: '6325871',
  7: '6343329', 8: '6343330', 9: '6343331', 10: '6343332', 11: '6382254', 12: '6382255',
};
export const tvdbEp = (n: number): Source => ({
  label: { ko: `TheTVDB 「소사이어티 게임」 시즌 2 ${n}화 회차 정보 (tvN 회차 소개, 챌린지 규칙)`, en: `TheTVDB, The Society Game season 2 episode ${n} (tvN's episode notes, with the challenge rules)` },
  url: `https://thetvdb.com/series/society-game/episodes/${TVDB[n]}`,
});
export const tvdbSeason: Source = {
  label: { ko: 'TheTVDB 「소사이어티 게임」 시즌 2 회차 목록 (방영일·챌린지 이름)', en: 'TheTVDB, The Society Game season 2 episode list (air dates, challenge names)' },
  url: 'https://thetvdb.com/series/society-game/seasons/official/2',
};
export const xports: Source = {
  label: { ko: '엑스포츠뉴스 「소사이어티 게임2」 최종회 기사 (2017년 11월, 종영일·파이널 방식 확인)', en: 'Xports News, report on the last episode of The Society Game 2 (November 2017; end date and final format)' },
  url: 'https://www.xportsnews.com/article_nview/913172',
};
export const broadcast: Source = {
  label: { ko: 'tvN 「소사이어티 게임 2」 방송 본편 (2017년 8–11월, 12부작)', en: 'tvN, The Society Game 2, the episodes (August–November 2017, 12 episodes)' },
};
const siteEngine = (name: Bi, file: string): Source => ({
  label: { ko: `PUZZLTHINK ${name.ko} 규칙 구현 (${file})`, en: `PUZZLTHINK's ${name.en} rules engine (${file})` },
});

const TWO: Bi = {
  ko: '규칙은 tvN이 회차 소개에 공개한 챌린지 규칙(TheTVDB에 남아 있어요)과 나무위키의 회차 정리를 서로 맞춰 확인했어요. 두 곳 모두에 없는 세부 사항은 뺐어요.',
  en: "The rules were checked by comparing tvN's own episode notes (kept on TheTVDB), which list the challenge rules, with the fan wiki's episode page. Details found in neither were left out.",
};
const ONE: Bi = {
  ko: '파이널의 큰 틀(3라운드, 먼저 2승)은 tvN 회차 소개와 기사로 확인되지만, 이 라운드의 자세한 규칙은 방송 화면의 규칙 설명을 옮긴 정리(나무위키) 한 곳에서만 확인할 수 있었어요. 확인되지 않는 세부 사항은 뺐어요.',
  en: "The final's outline (three rounds, first to two wins) is confirmed by tvN's episode notes and news reports, but the detailed rules of this round could be found in only one written source (the fan wiki, which transcribes the on-screen rules). Details that could not be checked were left out.",
};
const SITE_CHECKED: Bi = {
  ko: '규칙은 tvN 회차 소개의 챌린지 규칙, 나무위키의 회차 정리, 그리고 방송을 보고 만든 PUZZLTHINK 구현을 서로 맞춰 확인했어요. 사이트 버전과 다른 곳은 "PUZZLTHINK 버전과 방송 규칙의 차이"에 적었어요.',
  en: "The rules were checked against tvN's episode notes, the fan wiki's episode page and PUZZLTHINK's own implementation, built from the episodes. Differences are listed under \"How the PUZZLTHINK version differs\".",
};
export const DISCLAIMER = {
  ko: 'PUZZLTHINK는 소사이어티 게임 및 tvN, 제작사와 무관한 비공식 팬 제작 프로젝트예요. 프로그램 이름은 게임을 소개하기 위해서만 사용했고, 방송 화면·로고·출연자 사진은 쓰지 않았어요.',
  en: 'PUZZLTHINK is an unofficial fan project and is not affiliated with The Society Game, tvN or the production company. Show names are used only to describe the games; no broadcast images, logos or cast photos are used.',
};

type Copy = Omit<ShowGameCopy, 'sourceNote'> & { note?: string };

/**
 * One challenge page. `ep` is the episode the challenge aired in (challenge N is day N+1, episode N; the final is day 13,
 * episode 12). Final rounds rest on the wiki alone; `site` links a playable PUZZLTHINK game and names its rules engine.
 */
export function sg2Game(slug: string, kind: MatchKind, when: Bi, ep: number, related: GameId[], ko: Copy, en: Copy,
  site?: { id: GameId; name: Bi; file: string }): ShowGame {
  const final = kind === 'final';
  const sources = [namuEp(ep), tvdbEp(ep), ...(final ? [xports] : []), ...(site ? [siteEngine(site.name, site.file)] : []), broadcast];
  const base = site ? SITE_CHECKED : final ? ONE : TWO;
  const { note: koNote, ...koRest } = ko;
  const { note: enNote, ...enRest } = en;
  return {
    slug,
    kind,
    when,
    episode: { ko: `${ep}화`, en: `Episode ${ep}` },
    ...(site ? { site: site.id } : {}),
    related,
    updated: '2026-11-26',
    sources,
    ko: { ...koRest, sourceNote: base.ko + (koNote ? ` ${koNote}` : '') },
    en: { ...enRest, sourceNote: base.en + (enNote ? ` ${enNote}` : '') },
  };
}
export const day = (d: number): Bi => ({ ko: `${d}일차`, en: `Day ${d}` });

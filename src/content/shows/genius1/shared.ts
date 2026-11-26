// Shared bits of the 더 지니어스: 게임의 법칙 pages (tvN, 2013-04-26 – 2013-07-12, 12 episodes, one round per episode).
// Rules were checked against two written sources: the fan wiki's episode pages and English Wikipedia's season page.
import type { Bi, MatchKind, ShowGame, Source } from '../types';
import type { GameId } from '@/lib/gameCatalog';
import type { GuideBlock } from '@/content/guides/types';
import { makeGame } from '../make';

const S = '더 지니어스:게임의 법칙';
export const namuEp = (n: number): Source => ({
  label: { ko: `나무위키 「${S}/${n}화」 (규칙 확인용)`, en: `Namuwiki, "The Genius: Rules of the Game/episode ${n}" (Korean fan wiki; checked for the rules)` },
  url: `https://namu.wiki/w/${encodeURIComponent(`${S}/${n}화`)}`,
});
export const namuPage = (title: string, en: string): Source => ({
  label: { ko: `나무위키 「${title}」 (규칙·이후 시즌 사용 기록)`, en: `Namuwiki, "${title}" (${en})` },
  url: `https://namu.wiki/w/${encodeURIComponent(title)}`,
});
export const namuMain: Source = {
  label: { ko: `나무위키 「${S}」 (방영일·회차)`, en: 'Namuwiki, "The Genius: Rules of the Game" (air dates, episodes)' },
  url: `https://namu.wiki/w/${encodeURIComponent(S)}`,
};
export const namuSeries: Source = {
  label: { ko: '나무위키 「더 지니어스」 (시리즈 공통 규칙)', en: 'Namuwiki, "The Genius" (rules shared by every season)' },
  url: `https://namu.wiki/w/${encodeURIComponent('더 지니어스')}`,
};
export const wikipedia: Source = {
  label: { ko: '영문 위키백과 「The Genius: Rules of the Game」 (규칙 대조용)', en: 'English Wikipedia, "The Genius: Rules of the Game" (rules cross-check)' },
  url: 'https://en.wikipedia.org/wiki/The_Genius:_Rules_of_the_Game',
};
export const broadcast: Source = {
  label: { ko: 'tvN 「더 지니어스: 게임의 법칙」 방송 본편 (2013년 4–7월, 12부작)', en: 'tvN, The Genius: Rules of the Game, the episodes (April–July 2013, 12 episodes)' },
};
const siteEngine = (name: Bi, file: string): Source => ({
  label: { ko: `PUZZLTHINK ${name.ko} 규칙 구현 (${file})`, en: `PUZZLTHINK's ${name.en} rules engine (${file})` },
});
const TWO: Bi = {
  ko: '규칙은 방송 화면의 규칙 설명을 옮긴 정리(나무위키)와 영문 위키백과의 시즌 문서를 서로 맞대어 확인했어요. 두 곳이 다르거나 한 곳에만 있는 세부 사항은 그렇다고 밝혔고, 확인되지 않는 것은 뺐어요.',
  en: 'The rules were checked by comparing the fan wiki’s transcription of the on-screen rules with English Wikipedia’s season article. Where the two differ, or only one gives a detail, the page says so; anything unconfirmed was left out.',
};
const SITE_CHECKED: Bi = {
  ko: '규칙은 방송 화면의 규칙 설명을 옮긴 정리(나무위키), 영문 위키백과의 시즌 문서, 그리고 방송을 보고 만든 PUZZLTHINK 구현을 서로 맞대어 확인했어요. 사이트 버전과 다른 곳은 "PUZZLTHINK 버전과 방송 규칙의 차이"에 적었어요.',
  en: 'The rules were checked against the fan wiki’s transcription of the on-screen rules, English Wikipedia’s season article and PUZZLTHINK’s own implementation, built from the episodes. Differences are listed under "How the PUZZLTHINK version differs".',
};
export const DISCLAIMER = {
  ko: 'PUZZLTHINK는 더 지니어스 및 tvN, 제작사와 무관한 비공식 팬 제작 프로젝트예요. 프로그램 이름은 게임을 소개하기 위해서만 사용했고, 방송 화면·로고·출연자 사진은 쓰지 않았어요.',
  en: 'PUZZLTHINK is an unofficial fan project and is not affiliated with The Genius, tvN or the production companies. Show names are used only to describe the games; no broadcast images, logos or cast photos are used.',
};

/** "3회전" / "Round 3", with the episode (one round per episode in this season). */
export const round = (n: number | number[]): { when: Bi; episode: Bi } => {
  const list = Array.isArray(n) ? n : [n];
  const ko = list.map((x) => `${x}`).join('·');
  return {
    when: { ko: `${ko}회전`, en: `Round${list.length > 1 ? 's' : ''} ${list.join(', ')}` },
    episode: { ko: `${ko}화`, en: `Episode${list.length > 1 ? 's' : ''} ${list.join(', ')}` },
  };
};

type Args = Parameters<typeof makeGame>;
type Copy = Args[1] & { siteDiff?: GuideBlock[] };
/** `eps` are the namu episode pages the rules came from; `extra` adds standalone namu pages (recurring death matches). */
export function g1Game(slug: string, kind: MatchKind, at: { when: Bi; episode: Bi }, eps: number[], related: ShowGame['related'], ko: Copy, en: Copy,
  opts: { extra?: Source[]; site?: { id: GameId; name: Bi; file: string } } = {}): ShowGame {
  const { extra = [], site } = opts;
  const sources = [...eps.map(namuEp), ...extra, wikipedia, ...(site ? [siteEngine(site.name, site.file)] : []), broadcast];
  const game = makeGame({ slug, kind, when: at.when, episode: at.episode, related, sources, oneSource: site ? SITE_CHECKED : TWO }, ko, en);
  return site ? { ...game, site: site.id } : game;
}

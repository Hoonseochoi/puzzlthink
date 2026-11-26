// Registry of the 두뇌 서바이벌 게임 정리 section: every written show, newest first by release date.
// Adding a show = one folder under src/content/shows/ exporting a `Show`, plus one line in SHOW_LIST.
// Server-only: never import this from a client component.
import type { MatchKind, Show, ShowGame, ShowLocale } from './types';
import devilsPlan3 from './dp3';

const SHOW_LIST: Show[] = [devilsPlan3];

/** Written shows, most recently released first. */
export const SHOWS_WRITTEN: Show[] = [...SHOW_LIST].sort((a, b) => b.aired.start.localeCompare(a.aired.start));

export const SECTION_PATH = '/survival-games';
export const showPath = (show: Show) => `${SECTION_PATH}/${show.slug}`;
export const gamePath = (show: Show, game: ShowGame) => `${SECTION_PATH}/${show.slug}/${game.slug}`;
export const showLocale = (locale: string): ShowLocale => (locale === 'en' ? 'en' : 'ko');

export const showBySlug = (slug: string) => SHOWS_WRITTEN.find((s) => s.slug === slug) ?? null;
export const gameBySlugs = (showSlug: string, gameSlug: string) => {
  const show = showBySlug(showSlug);
  const game = show?.games.find((g) => g.slug === gameSlug);
  return show && game ? { show, game } : null;
};

/** Every page of the section, without the locale, for the sitemap and llms.txt. */
export const SECTION_PATHS: string[] = [
  SECTION_PATH,
  ...SHOWS_WRITTEN.flatMap((show) => [showPath(show), ...show.games.map((game) => gamePath(show, game))]),
];

export const KIND_LABEL: Record<MatchKind, { ko: string; en: string }> = {
  main: { ko: '메인 매치', en: 'Main match' },
  prison: { ko: '감옥 매치', en: 'Prison match' },
  final: { ko: '결승', en: 'Final' },
  exile: { ko: '유배지 매치', en: 'Exile match' },
  mini: { ko: '미니게임', en: 'Mini-game' },
  death: { ko: '데스매치', en: 'Death match' },
  hidden: { ko: '히든 스테이지', en: 'Hidden stage' },
};

/**
 * Shows this section will cover next, for the hub. Release dates checked against news reports (2026-11-26);
 * a show moves to SHOW_LIST once its pages are written.
 */
export const SHOWS_PLANNED: { name: { ko: string; en: string }; released: string; network: { ko: string; en: string } }[] = [
  { name: { ko: '피의 게임X', en: 'The Bloody Game X' }, released: '2026-07', network: { ko: '웨이브', en: 'Wavve' } },
  { name: { ko: '데블스 플랜: 데스룸 (시즌 2)', en: "The Devil's Plan: Death Room (season 2)" }, released: '2025-05', network: { ko: '넷플릭스', en: 'Netflix' } },
  { name: { ko: '데블스 플랜 (시즌 1)', en: "The Devil's Plan (season 1)" }, released: '2023-09', network: { ko: '넷플릭스', en: 'Netflix' } },
  { name: { ko: '더 타임 호텔', en: 'The Time Hotel' }, released: '2023-04', network: { ko: '티빙', en: 'TVING' } },
  { name: { ko: '소사이어티 게임 1·2', en: 'The Society Game 1–2' }, released: '2016-10', network: { ko: 'tvN', en: 'tvN' } },
  { name: { ko: '더 지니어스 1–4', en: 'The Genius 1–4' }, released: '2013-04', network: { ko: 'tvN', en: 'tvN' } },
];

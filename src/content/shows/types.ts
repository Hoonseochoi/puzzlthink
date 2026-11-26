// Schema for the 두뇌 서바이벌 게임 정리 section (/[locale]/survival-games). One file per show and one per game
// under src/content/shows/<show>/; src/content/shows/index.ts is the registry. Server-only (long copy).
//
// Text fields are plain strings; **double asterisks** mark bold, as in the guide pages (GuideBlocks renders both).
// Rules are written fresh from the facts of each game. Never paste or closely paraphrase a source's wording.
import type { GuideBlock } from '@/content/guides/types';
import type { GameId } from '@/lib/gameCatalog';
import type { ShowId } from '@/lib/seo';

export type ShowLocale = 'ko' | 'en';
export type Bi = { ko: string; en: string };

/** What part of a show a game was: main match, death/prison match, final, a side stage… */
export type MatchKind = 'main' | 'prison' | 'final' | 'exile' | 'mini' | 'death' | 'hidden' | 'money' | 'opening' | 'casino' | 'semi' | 'revival' | 'tournament' | 'duel';

/** A reference at the bottom of a page. */
export type Source = { label: Bi; url?: string };

/** A real board game that shares the mechanic. */
export type SimilarGame = { name: string; players: string; alike: string; differs: string };

export type ShowGameCopy = {
  meta: { title: string; description: string; keywords: string[] };
  /** The page's <h1>. */
  title: string;
  /** The game's own name, as on air ("미스터리 거래소"). */
  name: string;
  /** One line under the h1. */
  lead: string;
  /** One line for the show page's game list. */
  summary: string;
  /** 인원·준비물 */
  setup: GuideBlock[];
  /** 진행 순서 */
  flow: GuideBlock[];
  /** 승리 조건 (and what the result meant on the show) */
  win: GuideBlock[];
  /** 예외 규칙 */
  exceptions: GuideBlock[];
  /** 승부를 가르는 지점: what the game tests, whether a dominant strategy exists. Our own reasoning. */
  analysis: GuideBlock[];
  /** How the PUZZLTHINK version differs from the broadcast rules (only for games the site has). */
  siteDiff?: GuideBlock[];
  similar: SimilarGame[];
  /** Shown above the references when the rules rest on one source, or when something could not be verified. */
  sourceNote?: string;
};

export type ShowGame = {
  /** URL slug inside the show ('mystery-stock-market'). */
  slug: string;
  kind: MatchKind;
  /** Day / round label shown in lists ("1일차", "결승 1회전"). */
  when: Bi;
  /** Episode numbers, when known ("1–2화"). */
  episode?: Bi;
  /** Playable PUZZLTHINK game, if the site has it. */
  site?: GameId;
  /** Similar games on this site (catalog ids). */
  related: GameId[];
  updated: string;
  sources: Source[];
  ko: ShowGameCopy;
  en: ShowGameCopy;
};

export type ShowCopy = {
  meta: { title: string; description: string; keywords: string[] };
  title: string;
  name: string;
  lead: string;
  intro: string[];
  /** One line for the hub card. */
  summary: string;
  /** Format: how a day runs, how players are eliminated, the final. Rendered as one section. */
  format: GuideBlock[];
  /** Optional extra sections after the game list (side stages, notes). */
  extra?: { id: string; title: string; blocks: GuideBlock[] }[];
  disclaimer: string;
};

export type Show = {
  /** URL slug ('devils-plan-3'). */
  slug: string;
  /** The SHOWS entry in src/lib/seo.ts, when the site already attributes games to this show. */
  seo?: ShowId;
  /** Series key, to group seasons on the hub ('devils-plan'). */
  series: string;
  /** Short name for the hub's title and lists ('데블스플랜3'). */
  short: Bi;
  /** First and last release dates, 'YYYY-MM-DD'. The hub sorts by `start`, newest first. */
  aired: { start: string; end: string };
  network: Bi;
  episodes: number;
  color: string;
  /** Recent season: the pages carry a spoiler notice (results are never stated anyway). */
  spoiler: boolean;
  updated: string;
  /** Games in the order they were played on air. */
  games: ShowGame[];
  sources: Source[];
  ko: ShowCopy;
  en: ShowCopy;
};

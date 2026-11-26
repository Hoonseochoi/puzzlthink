// Schema for 보드게임 백과 (the board-game encyclopedia, /[locale]/board-games/<slug>).
// One file per article in this folder exports a `WikiArticle` with both locales; ./index.ts lists them.
// Sections reuse the guide block types, so the shared GuideBlocks renderer draws them (**bold** works in text).
import type { GameId } from '@/lib/gameCatalog';
import type { GuideSection } from '@/content/guides/types';

export type WikiLocale = 'ko' | 'en';

/** Hub grouping: genres & mechanics, lineages & history, concepts & glossary, picks for a situation. */
export type WikiCategory = 'genre' | 'lineage' | 'concept' | 'pick';

/** A source consulted for the facts in an article (listed at the bottom as 참고 자료). */
export type WikiSource = { title: string; site: string; url?: string };

/** A PUZZLTHINK game that belongs to the article's topic, with one line on why. Linked to the game and its guide. */
export type WikiGame = { game: GameId; ko: string; en: string };

export type WikiCopy = {
  meta: { title: string; description: string; keywords: string[] };
  /** The page's <h1>. */
  title: string;
  /** One line under the h1. */
  lead: string;
  /** Opening paragraphs, before the table of contents. */
  intro: string[];
  /** One or two lines for the hub card. */
  summary: string;
  sections: GuideSection[];
};

export type WikiArticle = {
  /** URL slug under /board-games. Must not start with a game's URL slug (the footer hides on paths containing one). */
  slug: string;
  category: WikiCategory;
  /** Last substantive revision, 'YYYY-MM-DD'. */
  updated: string;
  /** PUZZLTHINK games in this topic, shown as a "해 볼 수 있는 게임" panel. */
  games: WikiGame[];
  /** Slugs of related articles, linked at the bottom. */
  related: string[];
  sources: WikiSource[];
  ko: WikiCopy;
  en: WikiCopy;
};

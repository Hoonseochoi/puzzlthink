// Schema for a 개발 노트 (developer notes) article: /[locale]/devlog/<slug>. One file per article in this folder
// exports a `DevlogArticle`; ./index.ts lists them. Sections reuse the guide block types (and their renderer,
// src/components/guide/GuideBlocks.tsx), so `**bold**` works in every text field.
//
// Truth rule: everything in these articles comes from the code, the git history or aggregate numbers from the
// database (always with the date they were taken). No invented anecdotes, dates, people or numbers.
import type { GameId } from '@/lib/gameCatalog';
import type { GuideSection } from '@/content/guides/types';

export type DevlogLocale = 'ko' | 'en';

/** Hub grouping: game AIs, site systems, or the site's story (timeline). */
export type DevlogCategory = 'ai' | 'systems' | 'story';

export type DevlogCopy = {
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
  /** "Where this comes from": files, commits and queries the article is built on. Rendered as the last section. */
  sources: string[];
};

export type DevlogArticle = {
  /** URL segment under /devlog. Must not contain a game route like "/wallgo" (the footer hides on those). */
  slug: string;
  category: DevlogCategory;
  /** Games the article is about; the first one sets the accent colour and the "play" link. */
  games: GameId[];
  /** First published, 'YYYY-MM-DD'. */
  published: string;
  /** Last substantive revision, 'YYYY-MM-DD'. */
  updated: string;
  ko: DevlogCopy;
  en: DevlogCopy;
};

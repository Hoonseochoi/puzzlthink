// Schema for a game's long-form guide page (/[locale]/<game>/guide). One file per game in this folder exports a
// `GameGuide`; src/content/guides/index.ts maps catalog ids to those files. See docs/guide-authoring.md.
//
// Text fields are plain strings. Inside any `text`/`body`/item string, **double asterisks** mark bold.
// Figures are React nodes (server components only — no 'use client'), so a guide file that draws boards is a .tsx.
import type { ReactNode } from 'react';
import type { GameId } from '@/lib/gameCatalog';
import type { ShowId } from '@/lib/seo';

export type GuideLocale = 'ko' | 'en';

/** Where the game comes from, shown as a small chip in the header and used for structured data. */
export type GuideOrigin =
  | { kind: 'show'; show: ShowId } // a TV programme (see SHOWS in src/lib/seo.ts)
  | { kind: 'classic' } // a traditional or long-established puzzle/board game
  | { kind: 'original' }; // made for PUZZLTHINK

/** Strategy depth, shown as a badge on a section: 입문 / 중급 / 고급. */
export type GuideLevel = 'beginner' | 'intermediate' | 'advanced';

export type GuideCard = { title: string; body: string; tag?: string; figure?: ReactNode };

/** The building blocks of a section, rendered in order. Use whichever fit; none are required. */
export type GuideBlock =
  | { type: 'p'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  /** A grid of titled cards (patterns, pieces, tips), each with an optional small figure. */
  | { type: 'cards'; items: GuideCard[]; columns?: 1 | 2 }
  /** A numbered walkthrough: one step per item, figure beside the text. */
  | { type: 'steps'; items: GuideCard[] }
  | { type: 'table'; head: string[]; rows: string[][]; caption?: string }
  | { type: 'figure'; node: ReactNode; caption?: string; wide?: boolean }
  | { type: 'callout'; tone?: 'tip' | 'warn' | 'note'; title?: string; text: string }
  | { type: 'glossary'; items: { term: string; def: string }[] };

export type GuideSection = {
  /** Anchor id, unique within the page, e.g. 'rules', 'opening'. Lowercase, a–z/0–9/-. */
  id: string;
  title: string;
  /** Adds a 입문/중급/고급 badge (strategy sections). */
  level?: GuideLevel;
  /** One short paragraph under the heading. */
  lead?: string;
  /** Also shown in the condensed article on the game page (GameArticle). See docs/guide-authoring.md. */
  onGamePage?: boolean;
  blocks: GuideBlock[];
};

export type GuideFaq = { q: string; a: string };

/** Everything one locale of a guide says. */
export type GuideCopy = {
  meta: { title: string; description: string; keywords: string[] };
  /** The page's <h1>. */
  title: string;
  /** One line under the h1. */
  lead: string;
  /** Opening paragraphs, before the table of contents. */
  intro: string[];
  /** One line for the /guides hub card. */
  summary: string;
  sections: GuideSection[];
  faq: GuideFaq[];
  /** The play button panel. */
  cta: { title: string; body: string; button: string };
  /** The <h1> of the condensed article on the game page; defaults to `title`. Keep the game page's search-tuned heading here. */
  gamePageTitle?: string;
  /** Fan-project notice for show games; omit for classic/original games. */
  disclaimer?: string;
};

export type GameGuide = {
  /** Catalog id; the URL is the catalog href + '/guide' (e.g. 'wallgo' → /wallgo/guide). */
  game: GameId;
  origin: GuideOrigin;
  /** Last substantive revision, 'YYYY-MM-DD' (shown on the page and in Article JSON-LD). */
  updated: string;
  /** Catalog ids of related games, linked at the bottom (to their guide when they have one). */
  related: GameId[];
  /** The message namespace of the game's short inline guide, if it uses TextGuide (adds the "자세한 공략" link there). */
  inlineNamespace?: string;
  ko: GuideCopy;
  en: GuideCopy;
};

// Schema for the 게임 이론 (game theory) articles: /[locale]/game-theory/<slug>. One file per article in
// ./articles exports a `GTArticle` with both locales; ./index.ts is the registry.
//
// Inside any text string: **double asterisks** mark bold and [label](/path) is a link (an internal path
// without the locale, e.g. /black-white or /game-theory/nash-equilibrium; or a full https:// URL).
import type { ReactNode } from 'react';
import type { GameId } from '@/lib/gameCatalog';

export type GTLocale = 'ko' | 'en';

export type GTCategory = 'basics' | 'cooperation' | 'information' | 'allocation' | 'coalitions' | 'sequence';

/** A payoff cell: [row player's payoff, column player's payoff]. Strings allow '−1', 'x', '3/2' etc. */
export type GTPayoff = [number | string, number | string];

export type GTBlock =
  | { type: 'p'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'table'; head: string[]; rows: string[][]; caption?: string }
  /**
   * A two-player payoff matrix. `cells[r][c]` is the payoff pair when the row player picks rows[r] and the
   * column player picks cols[c]. `mark` highlights cells (the pure Nash equilibria, when stated in the caption).
   */
  | { type: 'matrix'; rowPlayer: string; colPlayer: string; rows: string[]; cols: string[]; cells: GTPayoff[][]; mark?: [number, number][]; caption?: string }
  | { type: 'callout'; tone?: 'tip' | 'warn' | 'note'; title?: string; text: string }
  | { type: 'figure'; node: ReactNode; caption?: string }
  | { type: 'glossary'; items: { term: string; def: string }[] };

export type GTSection = {
  /** Anchor id, unique within the article: a–z/0–9/-. */
  id: string;
  title: string;
  lead?: string;
  blocks: GTBlock[];
};

export type GTReference = { title: string; url?: string; note?: string };

export type GTCopy = {
  meta: { title: string; description: string; keywords: string[] };
  /** The page's <h1>. */
  title: string;
  /** One line under the h1. */
  lead: string;
  intro: string[];
  /** One line for the hub card. */
  summary: string;
  sections: GTSection[];
  /** 참고 자료 / References, shown last. */
  refs: GTReference[];
};

export type GTArticle = {
  slug: string;
  category: GTCategory;
  /** 'YYYY-MM-DD' (shown on the page and in Article JSON-LD). */
  updated: string;
  /** Site games the article discusses, linked at the bottom. */
  games: GameId[];
  /** Slugs of related articles. */
  related: string[];
  ko: GTCopy;
  en: GTCopy;
};

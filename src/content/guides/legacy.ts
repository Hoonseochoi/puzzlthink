// The 8 logic-puzzle guides written before src/content/guides existed. Each has its own static route
// (src/app/[locale]/<game>/guide/page.tsx) and its copy in src/lib/logicGuide.ts / slitherGuide.ts.
// Listed here so the /guides hub, the sitemap and the "자세한 공략" links include them.
import type { GameId } from '@/lib/gameCatalog';
import { GUIDE_COPY as LOGIC_COPY } from '@/lib/logicGuide';
import type { LogicGameId } from '@/lib/logicPuzzles';
import { GUIDE_COPY as SLITHER_COPY } from '@/lib/slitherGuide';
import type { GuideLocale } from './types';

export type LegacyGuide = {
  game: GameId;
  path: string;
  inlineNamespace: string;
  copy: (locale: GuideLocale) => { title: string; summary: string };
};

const logic = (game: LogicGameId, path: string, inlineNamespace: string): LegacyGuide => ({
  game, path, inlineNamespace,
  copy: (locale) => ({ title: LOGIC_COPY[game][locale].title, summary: LOGIC_COPY[game][locale].lead }),
});

export const LEGACY_GUIDES: LegacyGuide[] = [
  { game: 'slitherlink', path: '/slitherlink/guide', inlineNamespace: 'SlitherlinkGuide', copy: (locale) => ({ title: SLITHER_COPY[locale].title, summary: SLITHER_COPY[locale].lead }) },
  logic('masyu', '/masyu/guide', 'MasyuGuide'),
  logic('nonogram', '/nonogram/guide', 'NonogramGuide'),
  logic('starbattle', '/star-battle/guide', 'StarBattleGuide'),
  logic('binairo', '/binairo/guide', 'BinairoGuide'),
  logic('onestroke', '/one-stroke/guide', 'OneStrokeGuide'),
  logic('colorlink', '/color-link/guide', 'ColorLinkGuide'),
  logic('magicswap', '/magic-square/guide', 'MagicSwapGuide'),
];

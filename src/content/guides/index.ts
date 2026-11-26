// Registry of dedicated guide pages, keyed by catalog id. Every catalog game has a line and a file here already;
// a game without a guide yet points at a stub that exports null. Writing a guide = replacing that one file
// (src/content/guides/<url-slug>.ts or .tsx), so parallel authors never touch this registry.
// The 8 logic-puzzle guides predate this folder and live in their own routes (see ./legacy.ts).
// Server-only: guide files hold React figures and long copy; never import this from a client component.
import { GAMES, type GameId } from '@/lib/gameCatalog';
import type { GameGuide, GuideLocale } from './types';
import { LEGACY_GUIDES } from './legacy';
import g2048 from './2048';
import blackWhite from './black-white';
import blackWhite2 from './black-white-2';
import blindGomoku from './blind-gomoku';
import cardJanggi from './card-janggi';
import colorLinkDuel from './color-link-duel';
import equationSignal from './equation-signal';
import equationTower from './equation-tower';
import flipOmok from './flip-omok';
import fourThree from './four-three';
import gradation from './gradation';
import gyulhap from './gyulhap';
import heavy13 from './heavy13';
import hexagon from './hexagon';
import hiddenWord from './hidden-word';
import hiddenWordPlus from './hidden-word-plus';
import hitStay from './hit-stay';
import timeAuction from './time-auction';
import indianPoker from './indian-poker';
import janggi from './janggi';
import laserJanggi from './laser-janggi';
import monorail from './monorail';
import nemoCount from './nemo-count';
import nineMensMorris from './nine-mens-morris';
import piggyBank from './piggy-bank';
import play from './play';
import pointOmok from './point-omok';
import russianJanggi from './russian-janggi';
import russianRoulette from './russian-roulette';
import sniperHoldem from './sniper-holdem';
import twoSidedPoker from './two-sided-poker';
import wallgo from './wallgo';
import wallgo2 from './wallgo-2';

const REGISTRY: Partial<Record<GameId, GameGuide | null>> = {
  merge2048: g2048,
  blackWhite,
  blackWhite2,
  blindGomoku,
  cardJanggi,
  colorLinkDuel,
  equationSignal,
  equationTower,
  flipOmok,
  fourThree,
  gradation,
  gyulhap,
  heavy13,
  hexagon,
  hiddenWord,
  hiddenWordPlus,
  hitStay,
  sniperHoldem,
  indianPoker,
  janggi,
  laserJanggi,
  monorail,
  nemoCount,
  nineMensMorris,
  piggyBank,
  sudoku: play,
  pointOmok,
  russianJanggi,
  russianRoulette,
  twoSidedPoker,
  wallgo,
  wallgo2,
  timeAuction,
};

/** Catalog href of a game ('/wallgo'). */
export const gameHref = (game: GameId) => GAMES.find((g) => g.id === game)!.href;
/** URL path of a game's guide page, without the locale ('/wallgo/guide'). */
export const guidePath = (game: GameId) => `${gameHref(game)}/guide`;
export const guideLocale = (locale: string): GuideLocale => (locale === 'en' ? 'en' : 'ko');

/** Every written guide served by the shared route, in catalog order. */
export const GUIDES: GameGuide[] = GAMES.flatMap((g) => {
  const guide = REGISTRY[g.id];
  if (!guide) return [];
  if (guide.game !== g.id) throw new Error(`guide registered under ${g.id} says game: ${guide.game}`);
  return [guide];
});

/** The guide whose URL slug is `slug` ('wallgo', 'wallgo-2', 'play' …), for the /[locale]/[game]/guide route. */
export const guideBySlug = (slug: string) => GUIDES.find((guide) => gameHref(guide.game) === `/${slug}`) ?? null;
export const guideByGame = (game: GameId) => GUIDES.find((guide) => guide.game === game) ?? null;

/** A card on the /guides hub or in "related guides": every game with any guide page, old or new. */
export type GuideListing = { game: GameId; path: string; title: string; summary: string };

export function guideListings(locale: string): GuideListing[] {
  const loc = guideLocale(locale);
  return GAMES.flatMap((g) => {
    const guide = REGISTRY[g.id];
    if (guide) return [{ game: g.id, path: guidePath(g.id), title: guide[loc].title, summary: guide[loc].summary }];
    const legacy = LEGACY_GUIDES.find((l) => l.game === g.id);
    return legacy ? [{ game: g.id, path: legacy.path, ...legacy.copy(loc) }] : [];
  });
}

/** Path of any guide page for `game` (new or legacy), or null. */
export const anyGuidePath = (game: GameId) => (REGISTRY[game] ? guidePath(game) : LEGACY_GUIDES.find((l) => l.game === game)?.path ?? null);

/** The guide that extends the inline guide in message namespace `namespace` (TextGuide), if any. */
export function guidePathForNamespace(namespace: string) {
  const guide = GUIDES.find((g) => g.inlineNamespace === namespace);
  if (guide) return guidePath(guide.game);
  return LEGACY_GUIDES.find((l) => l.inlineNamespace === namespace)?.path ?? null;
}

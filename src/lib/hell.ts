// AI 헬모드 ('매우 어려움', difficulty id 'hell'): which games have it, how to start one, and the hell certificate.
import { GAMES, type CatalogGame, type GameId as CatalogId } from './gameCatalog';
import { CERT_GAMES } from './hardClear';
import type { GameId } from './stats';

export const HELL_CLEAR_EVENT = 'puzzlthink:hell-clear';
/** id/no are missing when the player is signed out (they get a number after signing in). */
export type HellClearDetail = { game: GameId; id?: string; no?: number; delayMs: number };

/** Records id (game_results.game) of each catalog game that has a hell AI. */
const STAT_ID: Partial<Record<CatalogId, GameId>> = { wallgo2: 'wallgo2', wallgo: 'wallgo', janggi: 'janggi', russianJanggi: 'russian_janggi', blindGomoku: 'blind_gomoku' };
/** Page order: 벽바둑 II, 벽바둑, 십이장기, 러시아장기, 블라인드 오목. */
const ORDER: CatalogId[] = ['wallgo2', 'wallgo', 'janggi', 'russianJanggi', 'blindGomoku'];

export type HellGame = CatalogGame & { hell: NonNullable<CatalogGame['hell']>; stat: GameId };
export const HELL_GAMES: HellGame[] = ORDER
  .map((id) => GAMES.find((g) => g.id === id))
  .filter((g): g is CatalogGame & { hell: NonNullable<CatalogGame['hell']> } => !!g?.hell)
  .map((g) => ({ ...g, stat: STAT_ID[g.id]! }));
/** Games whose hell AI is on main (the only ones any link may point at). */
export const HELL_LIVE = HELL_GAMES.filter((g) => g.hell.live);

/**
 * Start link for a hell game: `?difficulty=hell` (after the game's own query, e.g. `mode=two`) plus `#play`,
 * which makes the game page skip its start screen. Each game reads `difficulty=hell` on load.
 */
export const hellHref = (g: HellGame) => `${g.href}?${g.hell.query ? `${g.hell.query}&` : ''}difficulty=hell#play`;

/** "벽바둑 AI 매우 어려움" / "Wallgo · Very Hard AI". */
export function hellLabel(game: GameId, locale: string) {
  const g = CERT_GAMES[game];
  return locale === 'en' ? `${g.en} · Very Hard AI` : `${g.ko} AI 매우 어려움`;
}

/** A win that earns black pieces and the hell certificate (same rule as the SQL function is_hell_clear). */
export function isHellClear(game: GameId, mode: string, result: string, detail: Record<string, unknown>) {
  if (result !== 'win' || mode !== 'ai') return false;
  if ((detail.difficulty ?? detail.level) !== 'hell') return false;
  if (!HELL_GAMES.some((g) => g.stat === game)) return false;
  return (game !== 'wallgo' && game !== 'wallgo2') || Number(detail.players) === 2;
}

/** Hell certificate ids start with 'h' (hard ones are 12 hex digits). */
export const isHellCertId = (id: string) => /^h[0-9a-f]{12}$/.test(id);

export type BlackPieceRow = { rank: number; nickname: string; avatar_url: string | null; pieces: number; per_game: Partial<Record<GameId, number>>; last_win: string; is_me: boolean | null; prev_rank: number | null };

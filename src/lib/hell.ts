// AI 헬모드 ('매우 어려움', difficulty id 'hell'): which games have it, how to start one, and the hell certificate.
import { GAMES, type CatalogGame, type GameId as CatalogId } from './gameCatalog';
import { CERT_GAMES } from './hardClear';
import type { GameId } from './stats';

export const HELL_CLEAR_EVENT = 'puzzlthink:hell-clear';
/** id/no are missing when the player is signed out (they get a number after signing in). */
export type HellClearDetail = { game: GameId; id?: string; no?: number; delayMs: number };

/** Records id (game_results.game) of each catalog game that has a hell AI. */
const STAT_ID: Partial<Record<CatalogId, GameId>> = { wallgo2: 'wallgo2', wallgo: 'wallgo', janggi: 'janggi', russianJanggi: 'russian_janggi', blindGomoku: 'blind_gomoku', colorLinkDuel: 'color_link_duel' };
/** Page order: 벽바둑 II, 벽바둑, 십이장기, 러시아장기, 블라인드 오목, 컬러 링크 (added 11/26: its former only AI). */
const ORDER: CatalogId[] = ['wallgo2', 'wallgo', 'janggi', 'russianJanggi', 'blindGomoku', 'colorLinkDuel'];

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

/**
 * 블랙피스 경쟁전 runs in 7-day weeks (same as the SQL hell_week_of): 1W = launch → 2026-12-02 00:00 KST,
 * then a new week every 7 days. A finished week's top three get the hell-mode icons (h{week}-{place}).
 */
const HELL_WEEK2_START = Date.parse('2026-12-02T00:00:00+09:00');
const DAY = 86_400_000;
export const hellWeekOf = (at = Date.now()) => (at < HELL_WEEK2_START ? 1 : 2 + Math.floor((at - HELL_WEEK2_START) / (7 * DAY)));
/** First and last day (KST, ms at that day's 00:00) of a hell week; week 1's first day is launch day, 11/24. */
export const hellWeekDays = (week: number) => ({
  first: week <= 1 ? Date.parse('2026-11-24T00:00:00+09:00') : HELL_WEEK2_START + (week - 2) * 7 * DAY,
  last: HELL_WEEK2_START + (week - 1) * 7 * DAY - DAY,
});
/** "12/1(화)" / "Tue 12/1", in KST. */
export function kstDay(ms: number, locale: string) {
  const d = new Date(ms + 9 * 3_600_000);
  const md = `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
  const wd = d.getUTCDay();
  return locale === 'en' ? `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][wd]} ${md}` : `${md}(${'일월화수목금토'[wd]})`;
}

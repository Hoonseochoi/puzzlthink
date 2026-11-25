// Public per-game ranking pages: Hall of Fame (AI), open-match ranking and, for 네모 세기, the 30-minute challenge.
import { CERT_GAMES } from './hardClear';
import type { GameId } from './stats';
import type { GameId as CatalogId } from './gameCatalog';
import { STATS_ID } from './openRooms';

export type HallRow = { game: GameId; rank: number; nickname: string; avatar_url: string | null; wins: number; games: number; prev_rank?: number | null };
export type OpenRow = { rank: number; nickname: string | null; wins: number; losses: number; draws: number; prev_rank?: number | null };
export type NemoRow = { rank: number; nickname: string; correct: number; avg_ms: number | null };
export type MapRow = { rank: number; nickname: string; score: number; sub?: number | null; prev_rank?: number | null };
export type GameRanking = { game: GameId; hall: HallRow[]; open: OpenRow[]; nemo: Record<'hard' | 'normal' | 'easy', NemoRow[]> | null; maps: MapRow[] | null; scores: MapRow[] | null };
/** Logic puzzles ranked by maps owned (새로운 맵 · 맵 뺏기); the value is their challenge board. */
/** Games ranked by their best solo score (2048 챌린지 도전, 결합 10분 챌린지, 헥사곤 챌린지, 수식 신호등·수식의 탑 10분 챌린지); the value is their challenge board. */
export const SCORE_BOARD: Partial<Record<GameId, string>> = { hidden_word: 'hidden_word', merge2048: 'merge2048', gyulhap: 'gyulhap10', hexagon: 'hexagon', equation_signal: 'eqsignal', equation_tower: 'eqtower' };
export const MAP_BOARD: Partial<Record<GameId, string>> = { slitherlink: 'slither', binairo: 'binairo', onestroke: 'onestroke', colorlink: 'colorlink', magicswap: 'magicswap', starbattle: 'starbattle', masyu: 'masyu', nonogram: 'nonogram' };

/** URL slug of a game (same as its page path; Sudoku lives at /play). */
export const rankSlug = (game: GameId) => (CERT_GAMES[game].href === '/play' ? 'sudoku' : CERT_GAMES[game].href.slice(1));
export const gameFromSlug = (slug: string): GameId | null =>
  (Object.keys(CERT_GAMES) as GameId[]).find((g) => rankSlug(g) === slug && (hasHall(g) || hasOpen(g) || !!SCORE_BOARD[g])) ?? null;
export const rankPath = (locale: string, game: GameId) => `/${locale}/ranking/${rankSlug(game)}`;
export const rankImagePath = (game: GameId, locale: string) => `/api/ranking/${rankSlug(game)}?l=${locale === 'en' ? 'en' : 'ko'}`;
/** Games ranked by wins against AI (네모 세기 and 결합 use solo challenges instead). */
export const hasHall = (game: GameId) => game !== 'hidden_word' && game !== 'nemo_count' && game !== 'gyulhap' && game !== 'slitherlink' && game !== 'masyu' && game !== 'nonogram' && game !== 'starbattle' && game !== 'binairo' && game !== 'onestroke' && game !== 'colorlink' && game !== 'magicswap' && game !== 'merge2048' && game !== 'equation_signal' && game !== 'equation_tower';
/** Open-match ranking (every game but Sudoku). */
export const hasOpen = (game: GameId) => game !== 'hidden_word' && game !== 'sudoku';

async function rpc<T>(name: string, body: Record<string, unknown>): Promise<T | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(`${url}/rest/v1/rpc/${name}`, {
      method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body), next: { revalidate: 120 },
    });
    return res.ok ? ((await res.json()) as T) : null;
  } catch { return null; }
}

export async function fetchGameRanking(game: GameId): Promise<GameRanking> {
  const board = MAP_BOARD[game];
  const scoreBoard = SCORE_BOARD[game];
  const [hall, open, nemo, maps, scores] = await Promise.all([
    hasHall(game) ? rpc<HallRow[]>('hall_of_fame', { p_limit: 10 }) : Promise.resolve([]),
    hasOpen(game) ? rpc<OpenRow[]>('open_ranking_top', { p_game: game, p_limit: 10 }) : Promise.resolve([]),
    game === 'nemo_count'
      ? Promise.all((['hard', 'normal', 'easy'] as const).map((d) => rpc<NemoRow[]>('nemo_challenge_top', { p_difficulty: d, p_limit: 10 })))
      : Promise.resolve(null),
    board ? rpc<MapRow[]>('challenge_top', { p_board: board, p_limit: 10 }) : Promise.resolve(null),
    scoreBoard ? rpc<MapRow[]>('challenge_top', { p_board: scoreBoard, p_limit: 20 }) : Promise.resolve(null),
  ]);
  return {
    game,
    hall: (hall ?? []).filter((row) => row.game === game),
    open: open ?? [],
    nemo: nemo ? { hard: nemo[0] ?? [], normal: nemo[1] ?? [], easy: nemo[2] ?? [] } : null,
    // Ties share a rank: list order places them on the podium.
    maps: board ? (maps ?? []).map((x, i) => ({ ...x, rank: i + 1 })) : null,
    scores: scoreBoard ? (scores ?? []).map((x, i) => ({ ...x, rank: i + 1 })) : null,
  };
}

/** The top three for the share image: Hall of Fame first, else the challenge, else open matches. */
export function podium(r: GameRanking): { name: string; stat: string }[] {
  if (r.maps) return r.maps.slice(0, 3).map((x) => ({ name: x.nickname, stat: `${x.score}` }));
  if (r.scores?.length) return r.scores.slice(0, 3).map((x) => ({ name: x.nickname, stat: x.score.toLocaleString() }));
  if (r.hall.length) return r.hall.slice(0, 3).map((x) => ({ name: x.nickname, stat: `${x.wins}W` }));
  if (r.nemo) {
    const list = r.nemo.hard.length ? r.nemo.hard : r.nemo.normal.length ? r.nemo.normal : r.nemo.easy;
    return list.slice(0, 3).map((x) => ({ name: x.nickname, stat: `${x.correct}` }));
  }
  return r.open.slice(0, 3).map((x) => ({ name: x.nickname ?? 'Player', stat: `${x.wins}W` }));
}

/** Whether a game (catalog id) has a ranking page, so its entry screen shows the ranking card. */
export const hasRankCard = (game: CatalogId) => { const id = STATS_ID[game]; return !!id && gameFromSlug(rankSlug(id)) === id; };

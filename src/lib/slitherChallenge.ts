// 슬리더링크 challenge: the server hands out the board (seed) and times the run, so records can't be typed in.
import { getSupabase } from './supabase';

export type SlitherRun = { run: string; challenge: string; seed: number; dots: number; limit_ms?: number; holder?: string };
/** `rank`/`total`/`maps`: my place by boards owned after a clear. */
export type FinishResult = { ok: boolean; ms: number; rank: number | null; total: number | null; maps?: number | null };
/** Ranked by boards owned (맵 수집). `board`: one of their boards to try. */
export type RankRow = { rank: number; nickname: string; maps: number; is_me: boolean; board: string | null; board_ms: number | null; tried: boolean };
export type BoardRow = { id: string; holder: string; holder_ms: number; first_name: string; attempts: number; takeovers: number; published_at: string; tried: boolean; mine?: boolean };

async function call<T>(name: string, args: Record<string, unknown> = {}): Promise<{ data: T | null; error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: 'offline' };
  const { data, error } = await supabase.rpc(name, args);
  return { data: error ? null : (data as T), error: error ? error.message : null };
}

export const startNew = () => call<SlitherRun>('slither_start_new');
export const startBeat = (id: string) => call<SlitherRun>('slither_start_beat', { p_challenge: id });
export const finishRun = (run: string, cleared: boolean, hints: number) => call<FinishResult>('slither_finish', { p_run: run, p_cleared: cleared, p_hints: hints });
export const fetchRanking = (limit = 10) => call<RankRow[]>('slither_ranking', { p_limit: limit });
export const fetchMe = () => call<{ rank: number; maps: number; total: number }[]>('slither_me');
export const fetchBoard = (id: string) => call<BoardRow[]>('slither_board', { p_id: id });
/** Link that opens one board ready to play ("○○님의 맵 해보기"). */
export const boardPath = (locale: string, id: string) => `/${locale}/slitherlink?mode=beat&board=${id}#play`;
export const fetchBoards = (limit = 30) => call<BoardRow[]>('slither_challenges_list', { p_limit: limit });

/** Counts a finished practice board (no record). */
export function countPractice() {
  getSupabase()?.rpc('count_play', { p_game: 'slitherlink', p_mode: 'solo' }).then(() => {});
}

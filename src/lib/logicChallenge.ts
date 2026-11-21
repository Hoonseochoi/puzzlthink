// 마슈 · 노노그램 challenge, the 슬리더링크 way: 새로운 맵 (clear a fresh board to own it) and 맵 뺏기 (beat its holder's
// time to take it over). The server hands out the board, times the run and replays the move log before a clear counts.
import type { LogicGameId } from './logicPuzzles';
import { getSupabase } from './supabase';

export type LogicRun = { run: string; board: string; seed: number; size: number; limit_ms?: number; holder?: string };
export type LogicFinish = { ok: boolean; ms: number; rank: number | null; total: number | null; maps: number | null; flagged?: boolean; flag?: string | null; rival?: string | null; board?: string };
export type LogicRankRow = { rank: number; nickname: string; maps: number; best_ms: number; is_me: boolean; board: string | null; board_ms: number | null; tried: boolean; prev_rank: number | null };
export type LogicBoardRow = { id: string; holder: string; holder_ms: number; first_name: string; attempts: number; takeovers: number; published_at: string; tried: boolean; mine: boolean };
/** One change: [cell or edge index, value, ms since the run started]. */
export type LogicStep = [number, number, number];

async function call<T>(name: string, args: Record<string, unknown>): Promise<{ data: T | null; error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: 'offline' };
  const { data, error } = await supabase.rpc(name, args);
  return { data: error ? null : (data as T), error: error ? error.message : null };
}

export const startNewMap = (game: LogicGameId) => call<LogicRun>('logic_start_new', { p_game: game });
export const startBeatMap = (board: string) => call<LogicRun>('logic_start_beat', { p_board: board });
/** `steps` null = gave up, time up or left. `away`: [from, to] ms for each time the player left the board. */
export const finishMap = (run: string, steps: LogicStep[] | null, away: [number, number][] = []) => call<LogicFinish>('logic_finish', { p_run: run, p_steps: steps, p_away: away });
export const fetchLogicRanking = (game: LogicGameId, limit = 10) => call<LogicRankRow[]>('logic_ranking', { p_game: game, p_limit: limit });
export const fetchLogicMe = async (game: LogicGameId) => {
  const res = await call<{ rank: number; maps: number; total: number }[]>('logic_me', { p_game: game });
  return { data: res.data?.[0] ?? null, error: res.error };
};
export const fetchLogicBoards = (game: LogicGameId, limit = 40) => call<LogicBoardRow[]>('logic_boards_list', { p_game: game, p_limit: limit });
export const fetchLogicBoard = async (game: LogicGameId, id: string) => {
  const res = await call<LogicBoardRow[]>('logic_boards_list', { p_game: game, p_limit: 1, p_board: id });
  return { data: res.data?.[0] ?? null, error: res.error };
};

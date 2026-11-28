// 슬리더링크 challenge: the server hands out the board (seed) and times the run, so records can't be typed in.
import { getSupabase } from './supabase';

export type SlitherRun = { run: string; challenge: string; seed: number; dots: number; limit_ms?: number; holder?: string };
/** `rank`/`total`/`maps`: my place by boards owned after a clear. */
export type FinishResult = { ok: boolean; ms: number; rank: number | null; total: number | null; maps?: number | null; flagged?: boolean; flag?: string | null; rival?: string | null; took_n?: number | null; lost_n?: number | null };
/** A player I have traded boards with: how often I took theirs, and they took mine. */
export type RivalRow = { nickname: string; took: number; lost: number; last_at: string };
/** One move for the server replay: edge changes, or a hint taken at (r, c). */
/** One move (`c`) or hint (`h`), with `t` = ms since the run started. */
export type ReplayStep = ({ c: [number, number][] } | { h: [number, number] }) & { t?: number };
/** Ranked by boards owned (맵 수집). `board`: one of their boards to try. */
export type RankRow = { rank: number; nickname: string; maps: number; is_me: boolean; board: string | null; board_ms: number | null; tried: boolean; prev_rank?: number | null };
export type BoardRow = { id: string; holder: string; holder_ms: number; first_name: string; attempts: number; takeovers: number; published_at: string; tried: boolean; mine?: boolean };

async function call<T>(name: string, args: Record<string, unknown> = {}): Promise<{ data: T | null; error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: 'offline' };
  const { data, error } = await supabase.rpc(name, args);
  return { data: error ? null : (data as T), error: error ? error.message : null };
}

export const startNew = () => call<SlitherRun>('slither_start_new');
export const startBeat = (id: string) => call<SlitherRun>('slither_start_beat', { p_challenge: id });
/** A challenge hint costs one 경쟁전 piece, once per run: the server takes it before the hint is drawn. */
export const payHint = (run: string) => call<{ ok: boolean; error?: 'nopiece' | 'used'; pieces: number }>('slither_hint', { p_run: run });
/** My 피스 left in the running 경쟁전 week. */
export const fetchPieces = () => call<number>('my_pieces');
/** Spendable pieces (tokens + this week's pieces) and how many of them are tokens (spent first). */
export const fetchWallet = () => call<{ pieces: number; tokens: number }>('my_wallet');
/** Ends a run without a clear (give up, time up, leaving). */
export const finishRun = (run: string, cleared: boolean, hints: number) => call<FinishResult>('slither_finish', { p_run: run, p_cleared: cleared, p_hints: hints });
/** A clear: the server replays every move on its own copy of the board before it counts. */
/** `away`: [from, to] ms since the start for each time the player left the board (another tab or app). */
export async function finishCleared(run: string, steps: ReplayStep[], away: [number, number][] = []): Promise<{ data: FinishResult | null; error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: 'offline' };
  const { data, error } = await supabase.functions.invoke('slither-finish', { body: { run, steps, away } });
  return { data: error ? null : (data as FinishResult), error: error ? error.message : null };
}
export const fetchRanking = (limit = 10) => call<RankRow[]>('slither_ranking', { p_limit: limit });
export const fetchRivals = (limit = 5) => call<RivalRow[]>('slither_rivals', { p_limit: limit });
export const fetchMe = () => call<{ rank: number; maps: number; total: number }[]>('slither_me');
export const fetchBoard = (id: string) => call<BoardRow[]>('slither_board', { p_id: id });
/** Link that opens one board ready to play ("○○님의 맵 해보기"). */
export const boardPath = (locale: string, id: string) => `/${locale}/slitherlink?mode=beat&board=${id}#play`;
/** One clear in a board's life: the first (NEW) and every takeover after, oldest first. */
export type HistoryRow = { nth: number; kind: 'new' | 'beat'; nickname: string; ms: number; at: string; is_me: boolean };
export const fetchHistory = (id: string) => call<HistoryRow[]>('slither_history', { p_id: id });
export const fetchBoards = (limit = 30) => call<BoardRow[]>('slither_challenges_list', { p_limit: limit });

/** Counts a finished practice board (no record). */
export function countPractice() {
  getSupabase()?.rpc('count_play', { p_game: 'slitherlink', p_mode: 'solo' }).then(() => {});
}

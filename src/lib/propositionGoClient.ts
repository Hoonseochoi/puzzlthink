// 명제 바둑: the daily challenge's server calls (supabase/migrations/20271201100000_proposition_go.sql) and the practice set.
import { getSupabase } from './supabase';
import type { Prop, PublicPuzzle, Tier } from './propositionGo';

export type PgResult = {
  done: true; run: string; day: string; result: 'clear' | 'giveup' | 'timeout'; ms: number | null; penalty: number; total: number | null;
  splits: number[]; hints: number[]; solved: number; flag: string | null; rank: number | null; players: number; streak: number; crown: boolean;
};
export type PgView = {
  done: false; run: string; day: string; stage: number; elapsed: number; limit: number; splits: number[]; hints: number[];
  puzzle: PublicPuzzle; hint: Prop | null; pieces: number; wrong?: boolean; error?: string;
};
export type PgToday = {
  day: string; players: number; ready: boolean; top: { nickname: string; total: number } | null;
  status: 'guest' | 'none' | 'running' | 'done'; streak?: number; pieces?: number; result?: PgResult | null;
};
export type PgRankRow = { rank: number; nickname: string; avatar_url: string | null; total: number; hints: number; is_me: boolean };

async function call<T>(name: string, args: Record<string, unknown> = {}): Promise<{ data: T | null; error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: 'offline' };
  const { data, error } = await supabase.rpc(name, args);
  return { data: error ? null : (data as T), error: error ? error.message : null };
}

export const fetchToday = () => call<PgToday>('prop_today');
export const startRun = () => call<PgView | PgResult>('prop_start');
export const solveStage = (run: string, stage: number, cells: string, trace?: { steps: unknown; signals: unknown } | null) =>
  call<PgView | PgResult>('prop_solve', { p_run: run, p_stage: stage, p_cells: cells, p_trace: trace?.steps ?? null, p_signals: trace?.signals ?? null });
export const buyHint = (run: string) => call<PgView | PgResult>('prop_hint', { p_run: run });
export const giveUp = (run: string) => call<PgResult>('prop_giveup', { p_run: run });
export const fetchRanking = (limit = 20) => call<PgRankRow[]>('prop_ranking', { p_limit: limit });

export type PracticePuzzle = PublicPuzzle & { hint: Prop; answer: number[]; lie: number | null };
let practice: Promise<Record<Tier, PracticePuzzle[]>> | null = null;
/** The practice set (built with the pool script, from seeds the daily pool never uses). */
export function loadPractice() {
  practice ??= fetch('/proposition-go/practice.json').then((r) => r.json() as Promise<Record<Tier, PracticePuzzle[]>>).catch((e) => { practice = null; throw e; });
  return practice;
}

/** "1:05.3" for a run time. */
export const clock = (ms: number, tenths = false) => {
  const s = Math.max(0, ms) / 1000;
  const m = Math.floor(s / 60), sec = s - m * 60;
  return tenths ? `${m}:${sec.toFixed(1).padStart(4, '0')}` : `${m}:${String(Math.floor(sec)).padStart(2, '0')}`;
};

/** ms until the next KST midnight (a new set). */
export const msToNextDay = () => {
  const now = Date.now();
  const kst = now + 9 * 3600_000;
  return 86_400_000 - (kst % 86_400_000);
};

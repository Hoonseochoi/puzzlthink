// 네모 세기 도전장: the same boards (seeded) for everyone who opens the link, on one leaderboard.
import type { NemoDifficulty } from './nemoCount';
import { getSupabase } from './supabase';

export type DuelRun = { name: string; correct: number; ms: number };
export type Duel = {
  id: string; seed: number; difficulty: NemoDifficulty; count: number; creator: string; created_at: string;
  creator_run: { correct: number; ms: number } | null; total: number; runs: DuelRun[];
};

export const QUICK_DUEL_COUNT = 5;
export const duelPath = (locale: string, id: string) => `/${locale}/nemo-count/duel/${id}`;
export const duelImagePath = (id: string, locale: string) => `/api/nemo-duel/${id}?l=${locale === 'en' ? 'en' : 'ko'}`;
export const newSeed = () => Math.floor(Math.random() * 2_000_000_000);
const validId = (id: string) => /^[0-9a-f]{10}$/.test(id);

/** Better run first: more correct, then faster. */
export const beats = (a: { correct: number; ms: number }, b: { correct: number; ms: number }) => a.correct > b.correct || (a.correct === b.correct && a.ms < b.ms);

export async function createDuel(seed: number, difficulty: NemoDifficulty, count: number, name: string, correct: number, ms: number): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('nemo_duel_create', { p_seed: seed, p_difficulty: difficulty, p_count: count, p_name: name, p_correct: correct, p_ms: Math.round(ms) });
  return error || typeof data !== 'string' ? null : data;
}

export async function getDuel(id: string): Promise<Duel | null> {
  const supabase = getSupabase();
  if (!supabase || !validId(id)) return null;
  const { data, error } = await supabase.rpc('nemo_duel_get', { p_id: id });
  return error || !data ? null : (data as Duel);
}

/** Records my run; returns my place on the challenge's board. */
export async function submitDuel(id: string, name: string, correct: number, ms: number): Promise<number | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('nemo_duel_submit', { p_id: id, p_name: name, p_correct: correct, p_ms: Math.round(ms) });
  return error || typeof data !== 'number' ? null : data;
}

/** Server-side lookup (page metadata and the share image). */
export async function fetchDuel(id: string): Promise<Duel | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !validId(id)) return null;
  try {
    const res = await fetch(`${url}/rest/v1/rpc/nemo_duel_get`, {
      method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_id: id }), next: { revalidate: 30 },
    });
    return res.ok ? ((await res.json()) as Duel | null) : null;
  } catch { return null; }
}

/** "1:32.4" style total time. */
export const duelTime = (ms: number) => {
  const s = ms / 1000;
  return s >= 60 ? `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}` : `${s.toFixed(1)}s`;
};

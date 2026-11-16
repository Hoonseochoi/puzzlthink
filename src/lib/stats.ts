// Player records stored in Supabase (only for signed-in players). All calls fail quietly.
import { getSupabase } from './supabase';

export type GameId = 'wallgo' | 'janggi' | 'heavy13' | 'sudoku';
export type GameMode = 'ai' | 'friend' | 'solo';
export type GameResult = 'win' | 'loss' | 'draw';
export type ResultRow = { game: GameId; mode: GameMode; result: GameResult; detail: Record<string, unknown>; played_at: string };
export type Profile = { nickname: string | null; full_name: string | null; avatar_url: string | null; show_in_hall: boolean; created_at: string; last_seen_at: string | null; total_seconds: number };
export type HallEntry = { game: GameId; rank: number; nickname: string; avatar_url: string | null; wins: number; games: number };

const reported = new Set<string>();

/** Records one finished game. `key` prevents double reports of the same game in this tab. */
export async function reportGame(key: string, game: GameId, mode: GameMode, result: GameResult, detail: Record<string, unknown> = {}) {
  if (reported.has(key)) return;
  reported.add(key);
  const supabase = getSupabase();
  if (!supabase) return;
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return;
  await supabase.from('game_results').insert({ id: crypto.randomUUID(), user_id: user.id, game, mode, result, detail });
}

export async function fetchMyRecords(): Promise<{ profile: Profile | null; results: ResultRow[]; error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { profile: null, results: [], error: 'unconfigured' };
  const [{ data: profile, error: e1 }, { data: results, error: e2 }] = await Promise.all([
    supabase.from('profiles').select('nickname, full_name, avatar_url, show_in_hall, created_at, last_seen_at, total_seconds').maybeSingle(),
    supabase.from('game_results').select('game, mode, result, detail, played_at').order('played_at', { ascending: false }).limit(1000),
  ]);
  return { profile: (profile as Profile) ?? null, results: (results as ResultRow[]) ?? [], error: e1?.message || e2?.message || null };
}

export async function fetchHallOfFame(): Promise<{ entries: HallEntry[]; error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { entries: [], error: 'unconfigured' };
  const { data, error } = await supabase.rpc('hall_of_fame', { p_limit: 3 });
  return { entries: (data as HallEntry[]) ?? [], error: error?.message ?? null };
}

export async function saveProfile(nickname: string, showInHall: boolean) {
  const { error } = await getSupabase()!.rpc('update_profile', { p_nickname: nickname, p_show_in_hall: showInHall });
  return error?.message ?? null;
}

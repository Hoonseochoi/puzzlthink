// Player records stored in Supabase (only for signed-in players) plus an anonymous play counter. All calls fail quietly.
import { getSupabase } from './supabase';

export type GameId = 'wallgo' | 'janggi' | 'heavy13' | 'sudoku' | 'russian_roulette' | 'russian_janggi' | 'blind_gomoku' | 'laser_janggi' | 'nemo_count';
/** Wins needed before a player can appear in the Hall of Fame (same number as the SQL function). */
export const HALL_MIN_WINS = 5;
export const HALL_RANK_EVENT = 'puzzlthink:hall-rank';
export type HallRankDetail = { game: GameId; rank: number; delayMs: number };
export type GameMode = 'ai' | 'friend' | 'solo';
export type GameResult = 'win' | 'loss' | 'draw';
export type ResultRow = { game: GameId; mode: GameMode; result: GameResult; detail: Record<string, unknown>; played_at: string };
export type Profile = { nickname: string | null; full_name: string | null; avatar_url: string | null; show_in_hall: boolean; created_at: string; last_seen_at: string | null; total_seconds: number };
export type HallEntry = { game: GameId; rank: number; nickname: string; avatar_url: string | null; wins: number; games: number };

const reported = new Set<string>();
const PENDING_KEY = 'puzzlthink_pending_game';
type Pending = { key: string; game: GameId; mode: GameMode; result: GameResult; detail: Record<string, unknown> };
type Supabase = NonNullable<ReturnType<typeof getSupabase>>;

/** This player's Hall of Fame rank (1–3) in one game, or null. Null too if the server function is missing. */
async function myHallRank(supabase: Supabase, game: GameId): Promise<number | null> {
  const { data, error } = await supabase.rpc('my_hall_rank', { p_game: game });
  return error || typeof data !== 'number' ? null : data;
}

/** Saves one result. A win that counts for the Hall of Fame and lifts the player into (or up) the top 3 fires HALL_RANK_EVENT. */
async function insertResult(supabase: Supabase, userId: string, game: GameId, mode: GameMode, result: GameResult, detail: Record<string, unknown>, delayMs = 900) {
  const counts = result === 'win' && (mode === 'ai' || (game === 'sudoku' && mode === 'solo'));
  const before = counts ? await myHallRank(supabase, game) : null;
  const { error } = await supabase.from('game_results').insert({ id: crypto.randomUUID(), user_id: userId, game, mode, result, detail });
  if (error) return false;
  if (counts) {
    const after = await myHallRank(supabase, game);
    if (after !== null && (before === null || after < before)) {
      window.dispatchEvent(new CustomEvent<HallRankDetail>(HALL_RANK_EVENT, { detail: { game, rank: after, delayMs } }));
    }
  }
  return true;
}

/**
 * Records one finished game. `key` prevents double reports of the same game in this tab.
 * Signed out: the game is kept as "pending" (latest one only) so signing in from the result screen still saves it.
 */
export async function reportGame(key: string, game: GameId, mode: GameMode, result: GameResult, detail: Record<string, unknown> = {}, opts: { revealDelayMs?: number } = {}) {
  if (reported.has(key)) return;
  reported.add(key);
  const supabase = getSupabase();
  if (!supabase) return;
  // Play counter for every finished game, signed in or not (no personal data).
  supabase.rpc('count_play', { p_game: game, p_mode: mode }).then(() => {});
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) {
    try { sessionStorage.setItem(PENDING_KEY, JSON.stringify({ key, game, mode, result, detail } satisfies Pending)); } catch { /* storage optional */ }
    return;
  }
  await insertResult(supabase, user.id, game, mode, result, detail, opts.revealDelayMs);
}

/** Saves the game finished while signed out, once the player signs in. Returns true if one was saved. */
export async function flushPendingGame(): Promise<boolean> {
  let pending: Pending | null = null;
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    sessionStorage.removeItem(PENDING_KEY);
    pending = raw ? JSON.parse(raw) : null;
  } catch { return false; }
  if (!pending) return false;
  const supabase = getSupabase();
  const { data } = (await supabase?.auth.getSession()) ?? { data: null };
  const user = data?.session?.user;
  if (!supabase || !user) return false;
  return insertResult(supabase, user.id, pending.game, pending.mode, pending.result, pending.detail, 300);
}

/** Forgets the signed-out game (e.g. the player starts another one instead of signing in). */
export function clearPendingGame() {
  try { sessionStorage.removeItem(PENDING_KEY); } catch { /* storage optional */ }
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

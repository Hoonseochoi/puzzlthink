// Player records stored in Supabase (only for signed-in players) plus an anonymous play counter. All calls fail quietly.
import { getSupabase } from './supabase';
import { HARD_CLEAR_EVENT, type HardClearDetail, isHardClear } from './hardClear';
import { HELL_CLEAR_EVENT, type HellClearDetail, isHellClear } from './hell';

export type GameId = 'card_janggi' | 'color_link_duel' | 'hit_stay' | 'point_omok' | 'merge2048' | 'magicswap' | 'four_three' | 'binairo' | 'onestroke' | 'colorlink' | 'starbattle' | 'masyu' | 'nonogram' | 'two_sided_poker' | 'monorail' | 'flip_omok' | 'nine_mens_morris' | 'wallgo2' | 'slitherlink' | 'gyulhap' | 'indian_poker' | 'wallgo' | 'janggi' | 'heavy13' | 'sudoku' | 'russian_roulette' | 'russian_janggi' | 'blind_gomoku' | 'laser_janggi' | 'nemo_count' | 'black_white' | 'black_white_2' | 'piggy_bank' | 'hexagon';
/** Wins needed before a player can appear in the Hall of Fame (same number as the SQL function). */
export const HALL_MIN_WINS = 1;
export const HALL_RANK_EVENT = 'puzzlthink:hall-rank';
export type HallRankDetail = { game: GameId; rank: number; delayMs: number };
export type GameMode = 'ai' | 'friend' | 'solo';
export type GameResult = 'win' | 'loss' | 'draw';
export type ResultRow = { game: GameId; mode: GameMode; result: GameResult; detail: Record<string, unknown>; played_at: string };
export type Profile = { nickname: string | null; full_name: string | null; avatar_url: string | null; show_in_hall: boolean; created_at: string; last_seen_at: string | null; total_seconds: number };
export type HallEntry = { game: GameId; rank: number; nickname: string; avatar_url: string | null; wins: number; games: number; prev_rank?: number | null };

const reported = new Set<string>();

/** AI/solo games opened beside a public waiting room are practice only, never part of records. */
function isOpenRoomPractice() {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).has('open') && window.location.hash === '#play';
}

// Signed-in players met in the current friend/open room (their account ids). Friend results carry them
// as `detail.vs`, so a player can later see their record against each opponent.
let roomOpponents: { uid: string; name: string }[] = [];
export function setRoomOpponents(list: { uid: string; name: string }[]) {
  roomOpponents = [...new Map(list.map((o) => [o.uid, o])).values()].slice(0, 8);
}
// Whether the current room was opened publicly (open match): its results count for the open ranking.
let roomOpen = false;
export function setRoomOpen(open: boolean) { roomOpen = open; }

export const OPEN_RESULT_EVENT = 'puzzlthink:open-result';
export type RankRow = { rank: number | null; nickname?: string | null; wins: number; losses: number; draws: number; is_me: boolean };
export type OpenResultDetail = {
  game: GameId; result: GameResult; open: boolean;
  revenge: { status: 'success' | 'fail'; names: string[] } | null;
  before: number | null; after: number | null; near: RankRow[];
};
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
  // First hard clear in this game: a numbered certificate ("N번째 클리어").
  if (isHardClear(game, mode, result, detail)) {
    supabase.rpc('claim_hard_clear', { p_game: game }).then(({ data }) => {
      const row = Array.isArray(data) ? (data[0] as { id: string; clear_no: number; is_new: boolean } | undefined) : undefined;
      if (row?.is_new) window.dispatchEvent(new CustomEvent<HardClearDetail>(HARD_CLEAR_EVENT, { detail: { game, id: row.id, no: row.clear_no, delayMs: delayMs + 300 } }));
    });
  }
  // First hell clear in this game: a numbered 매우 어려움 certificate (its own numbering).
  if (isHellClear(game, mode, result, detail)) {
    supabase.rpc('claim_hell_clear', { p_game: game }).then(({ data }) => {
      const row = Array.isArray(data) ? (data[0] as { id: string; clear_no: number; is_new: boolean } | undefined) : undefined;
      if (row?.is_new) window.dispatchEvent(new CustomEvent<HellClearDetail>(HELL_CLEAR_EVENT, { detail: { game, id: row.id, no: row.clear_no, delayMs: delayMs + 300 } }));
    });
  }
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
  if (isOpenRoomPractice()) return;
  if (reported.has(key)) return;
  // 복기 (`detail.replay`) is kept only for a human win against the 매우 어려움 AI; every other result drops it.
  if ('replay' in detail && !isHellClear(game, mode, result, detail)) { const { replay: _drop, ...rest } = detail; void _drop; detail = rest; }
  reported.add(key);
  window.dispatchEvent(new Event('puzzlthink:game-finished')); // e.g. the one-time "install as app" card
  const opponents = mode === 'friend' ? roomOpponents : [];
  const open = mode === 'friend' && roomOpen;
  if (opponents.length) detail = { ...detail, vs: opponents.map((o) => o.uid) };
  if (open) detail = { ...detail, open: true };
  const supabase = getSupabase();
  if (!supabase) return;
  // Play counter for every finished game, signed in or not (no personal data).
  supabase.rpc('count_play', { p_game: game, p_mode: mode }).then(() => {});
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) {
    // Signed out: show the certificate teaser now; signing in from it saves this game and gives the number.
    if (isHardClear(game, mode, result, detail)) window.dispatchEvent(new CustomEvent<HardClearDetail>(HARD_CLEAR_EVENT, { detail: { game, delayMs: (opts.revealDelayMs ?? 900) + 300 } }));
    if (isHellClear(game, mode, result, detail)) window.dispatchEvent(new CustomEvent<HellClearDetail>(HELL_CLEAR_EVENT, { detail: { game, delayMs: (opts.revealDelayMs ?? 900) + 300 } }));
    try { sessionStorage.setItem(PENDING_KEY, JSON.stringify({ key, game, mode, result, detail } satisfies Pending)); } catch { /* storage optional */ }
    return;
  }
  if (!opponents.length && !open) { await insertResult(supabase, user.id, game, mode, result, detail, opts.revealDelayMs); return; }

  // Versus games: note revenge matches and the open-ranking place before saving, then compare after.
  const [lastResults, before] = await Promise.all([
    Promise.all(opponents.map((o) => lastResultAgainst(o.uid))),
    open ? myOpenPlace(game) : Promise.resolve(null),
  ]);
  const owed = opponents.filter((_, i) => lastResults[i] === 'loss'); // the last game against them was a loss
  const saved = await insertResult(supabase, user.id, game, mode, result, detail, opts.revealDelayMs);
  if (!saved) return;
  const after = open ? await myOpenPlace(game) : null;
  const revenge = owed.length && result !== 'draw' ? { status: result === 'win' ? 'success' as const : 'fail' as const, names: owed.map((o) => o.name) } : null;
  if (!revenge && !open) return;
  window.dispatchEvent(new CustomEvent<OpenResultDetail>(OPEN_RESULT_EVENT, { detail: {
    game, result, open, revenge, before: before?.rank ?? null, after: after?.rank ?? null, near: after?.near ?? [],
  } }));
}

/** My last result against one player (from my own results that list them in `vs`). */
export async function lastResultAgainst(uid: string): Promise<GameResult | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.from('game_results').select('result').eq('mode', 'friend').contains('detail', { vs: [uid] }).order('played_at', { ascending: false }).limit(1);
  return (data?.[0] as { result: GameResult } | undefined)?.result ?? null;
}

/** My open-ranking place in one game and the players around me (names hidden). */
export async function myOpenPlace(game: GameId): Promise<{ rank: number | null; near: RankRow[] } | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('open_ranking_me', { p_game: game });
  if (error || !Array.isArray(data)) return null;
  const near = data as RankRow[];
  return { rank: near.find((row) => row.is_me)?.rank ?? null, near };
}

export type TopRow = { rank: number; nickname: string | null; avatar_url: string | null; wins: number; losses: number; draws: number; prev_rank?: number | null };
export async function fetchOpenTop(game: GameId, limit = 5): Promise<TopRow[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('open_ranking_top', { p_game: game, p_limit: limit });
  return error || !Array.isArray(data) ? null : (data as TopRow[]);
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

/** Whether a nickname is free (true/false), or null if it could not be checked. */
export async function nicknameAvailable(name: string): Promise<boolean | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('nickname_available', { p_nickname: name.trim() });
  return error || typeof data !== 'boolean' ? null : data;
}
export const isNicknameTaken = (message: string | null | undefined) => !!message && message.includes('nickname_taken');

export async function saveProfile(nickname: string, showInHall: boolean) {
  const { error } = await getSupabase()!.rpc('update_profile', { p_nickname: nickname, p_show_in_hall: showInHall });
  return error?.message ?? null;
}

export type Tally = { win: number; loss: number; draw: number };
const tally = (rows: { result: GameResult }[]): Tally => ({
  win: rows.filter((r) => r.result === 'win').length, loss: rows.filter((r) => r.result === 'loss').length, draw: rows.filter((r) => r.result === 'draw').length,
});

/** My record in one game against one signed-in player (from my own results that list them in `vs`). */
export async function fetchHeadToHead(game: GameId, opponentId: string): Promise<Tally | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from('game_results').select('result').eq('game', game).eq('mode', 'friend').contains('detail', { vs: [opponentId] }).limit(1000);
  return error ? null : tally((data as { result: GameResult }[]) ?? []);
}

/** A signed-in player's overall record in one game (counts only; needs the player_record function). */
export async function fetchPlayerRecord(game: GameId, userId: string): Promise<Tally | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('player_record', { p_user: userId, p_game: game });
  const row = Array.isArray(data) ? data[0] : data;
  return error || !row ? null : { win: Number(row.wins) || 0, loss: Number(row.losses) || 0, draw: Number(row.draws) || 0 };
}

/** A player's record against other people across every game (friend and open rooms). */
export async function fetchVersusRecord(userId: string): Promise<Tally | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('versus_record', { p_user: userId });
  const row = Array.isArray(data) ? data[0] : data;
  return error || !row ? null : { win: Number(row.wins) || 0, loss: Number(row.losses) || 0, draw: Number(row.draws) || 0 };
}

/** My record against one player in any game (from my own results that list them in `vs`). */
export async function fetchHeadToHeadAll(opponentId: string): Promise<Tally | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from('game_results').select('result').eq('mode', 'friend').contains('detail', { vs: [opponentId] }).limit(1000);
  return error ? null : tally((data as { result: GameResult }[]) ?? []);
}

// Public ("open") rooms: a small Supabase table lists rooms that are waiting for players.
// The room itself is an ordinary Realtime room; only the host's browser writes its row.
import { getSupabase } from './supabase';
import type { GameId as CatalogId } from './gameCatalog';
import type { GameId as StatsId } from './stats';

/** Records name each game differently from the catalog. */
export const STATS_ID: Record<CatalogId, StatsId> = {
  nemoCount: 'nemo_count', blackWhite: 'black_white', blackWhite2: 'black_white_2', laserJanggi: 'laser_janggi', blindGomoku: 'blind_gomoku',
  wallgo: 'wallgo', russianRoulette: 'russian_roulette', heavy13: 'heavy13', janggi: 'janggi', russianJanggi: 'russian_janggi', sudoku: 'sudoku',
};

export type OpenRoomRow = { code: string; variant: number; host: string; players: number; capacity: number };

const tokenKey = (game: string, code: string) => `puzzlthink_open_${game}_${code}`;

/** The host's secret for its row (kept in this browser only). */
export function hostToken(game: string, code: string, create = false) {
  try {
    let token = localStorage.getItem(tokenKey(game, code));
    if (!token && create) { token = crypto.randomUUID(); localStorage.setItem(tokenKey(game, code), token); }
    return token;
  } catch { return null; }
}

export async function listOpenRooms(game: string): Promise<OpenRoomRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc('open_room_list', { p_game: game });
  return error || !Array.isArray(data) ? [] : (data as OpenRoomRow[]);
}

export async function putOpenRoom(game: string, code: string, row: { variant: number; host: string; players: number; capacity: number }) {
  const supabase = getSupabase();
  const token = hostToken(game, code, true);
  if (!supabase || !token) return;
  await supabase.rpc('open_room_put', { p_game: game, p_code: code, p_token: token, p_variant: row.variant, p_host: row.host, p_players: row.players, p_capacity: row.capacity });
}

export async function closeOpenRoom(game: string, code: string) {
  const supabase = getSupabase();
  const token = hostToken(game, code);
  if (!supabase || !token) return;
  await supabase.rpc('open_room_close', { p_game: game, p_code: code, p_token: token });
}

export const EMOTES = ['ㅎㅇ', 'ㄱㄷ', 'ㅇㅋ', 'ㅈㅈ', 'ㅂㅂ'] as const;
export const EMOTE_MS = 4000;

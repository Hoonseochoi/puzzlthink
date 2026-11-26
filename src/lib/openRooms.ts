// Public ("open") rooms: a small Supabase table lists rooms that are waiting for players.
// The room itself is an ordinary Realtime room; only the host's browser writes its row.
import { getSupabase } from './supabase';
import type { GameId as CatalogId } from './gameCatalog';
import type { GameId as StatsId } from './stats';

/** Records name each game differently from the catalog. */
export const STATS_ID: Record<CatalogId, StatsId> = {
  hiddenWord: 'hidden_word', hiddenWordPlus: 'hidden_word_plus', equationSignal: 'equation_signal', equationTower: 'equation_tower', gradation: 'gradation', cardJanggi: 'card_janggi', colorLinkDuel: 'color_link_duel', hitStay: 'hit_stay', pointOmok: 'point_omok', merge2048: 'merge2048', magicswap: 'magicswap', binairo: 'binairo', onestroke: 'onestroke', colorlink: 'colorlink', starbattle: 'starbattle', masyu: 'masyu', nonogram: 'nonogram', twoSidedPoker: 'two_sided_poker', monorail: 'monorail',
  fourThree: 'four_three', flipOmok: 'flip_omok', nineMensMorris: 'nine_mens_morris', wallgo2: 'wallgo2', slitherlink: 'slitherlink', gyulhap: 'gyulhap', indianPoker: 'indian_poker',
  hexagon: 'hexagon', piggyBank: 'piggy_bank', nemoCount: 'nemo_count', blackWhite: 'black_white', blackWhite2: 'black_white_2', laserJanggi: 'laser_janggi', blindGomoku: 'blind_gomoku',
  wallgo: 'wallgo', russianRoulette: 'russian_roulette', heavy13: 'heavy13', janggi: 'janggi', russianJanggi: 'russian_janggi', sudoku: 'sudoku',
  timeAuction: 'time_auction',
};

export type OpenRoomRow = { code: string; variant: number; host: string; players: number; capacity: number; title?: string };

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

export type OpenRoomAnyRow = OpenRoomRow & { game: string };

/** Room channel prefix → game. */
export const CHANNEL_GAME: Record<string, CatalogId> = {
  'time-auction-room': 'timeAuction',
  'binairo-room': 'binairo', 'onestroke-room': 'onestroke', 'colorlink-room': 'colorlink', 'magicswap-room': 'magicswap', 'merge2048-room': 'merge2048', 'starbattle-room': 'starbattle', 'masyu-room': 'masyu', 'nonogram-room': 'nonogram', 'two-sided-poker-room': 'twoSidedPoker', 'monorail-room': 'monorail',
  'wallgo-room': 'wallgo', 'wallgo2-room': 'wallgo2', 'slither-room': 'slitherlink', 'gyulhap-room': 'gyulhap', 'indian-poker-room': 'indianPoker',
  'hexagon-room': 'hexagon', 'piggy-bank-room': 'piggyBank', 'nemo-count-room': 'nemoCount', 'black-white-room': 'blackWhite', 'black-white-2-room': 'blackWhite2',
  'laser-janggi-room': 'laserJanggi', 'blind-gomoku-room': 'blindGomoku', 'morris-room': 'nineMensMorris', 'flip-omok-room': 'flipOmok', 'four-three-room': 'fourThree', 'point-omok-room': 'pointOmok', 'russian-roulette-room': 'russianRoulette', 'heavy13-room': 'heavy13',
  'janggi-room': 'janggi', 'russian-janggi-room': 'russianJanggi', 'hit-stay-room': 'hitStay', 'card-janggi-room': 'cardJanggi', 'color-link-duel-room': 'colorLinkDuel', 'gradation-room': 'gradation', 'equation-signal-room': 'equationSignal', 'equation-tower-room': 'equationTower', 'hidden-word-room': 'hiddenWord', 'hidden-word-plus-room': 'hiddenWordPlus',
};
export type LiveRoomRow = { game: CatalogId; open: number; friend: number };

/** Matches in progress right now, per game (open and friend). Null when it could not be read. */
export async function listLiveRooms(): Promise<LiveRoomRow[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('live_rooms');
  if (error || !Array.isArray(data)) return null;
  return (data as { channel: string; open_n: number; friend_n: number }[])
    .flatMap((row) => (CHANNEL_GAME[row.channel] ? [{ game: CHANNEL_GAME[row.channel], open: row.open_n, friend: row.friend_n }] : []));
}

/** Host side: a match is going on in this room (counted on the home card for 2½ minutes). */
export function pingLiveRoom(room: string, open: boolean) {
  getSupabase()?.rpc('friend_room_ping', { p_room: room, p_open: open }).then(() => {});
}

/** Open rooms of every game (home page card). Null when the list could not be read. */
export async function listAllOpenRooms(): Promise<OpenRoomAnyRow[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('open_room_list_all');
  return error || !Array.isArray(data) ? null : (data as OpenRoomAnyRow[]);
}

export async function putOpenRoom(game: string, code: string, row: { variant: number; host: string; players: number; capacity: number; title: string }) {
  const supabase = getSupabase();
  const token = hostToken(game, code, true);
  if (!supabase || !token) return;
  const args = { p_game: game, p_code: code, p_token: token, p_variant: row.variant, p_host: row.host, p_players: row.players, p_capacity: row.capacity };
  const { error } = await supabase.rpc('open_room_put', { ...args, p_title: row.title.slice(0, 30) });
  // Before the titles migration the function takes no title: list the room without one.
  if (error?.code === 'PGRST202') await supabase.rpc('open_room_put', args);
}

export async function closeOpenRoom(game: string, code: string) {
  const supabase = getSupabase();
  const token = hostToken(game, code);
  if (!supabase || !token) return;
  await supabase.rpc('open_room_close', { p_game: game, p_code: code, p_token: token });
}

export const EMOTES = ['ㅎㅇ', 'ㄱㄷ', 'ㅇㅋ', 'ㅈㅈ', 'ㅂㅂ'] as const;
export const EMOTE_MS = 4000;

const titleKey = (code: string) => `puzzlthink_open_title_${code}`;
/** The host's room title (kept in this browser). */
export function savedTitle(code: string) { try { return localStorage.getItem(titleKey(code)) ?? ''; } catch { return ''; } }
export function saveTitle(code: string, title: string) { try { localStorage.setItem(titleKey(code), title.slice(0, 30)); } catch { /* optional */ } }

// Rooms this browser entered as open rooms (their games count for the open ranking).
const OPEN_KEY = 'puzzlthink_open_rooms';
export function markOpenRoom(code: string) {
  try { const list = JSON.parse(sessionStorage.getItem(OPEN_KEY) || '[]') as string[]; if (!list.includes(code)) sessionStorage.setItem(OPEN_KEY, JSON.stringify([...list, code].slice(-20))); } catch { /* optional */ }
}
export function isOpenRoom(code: string) {
  try { return (JSON.parse(sessionStorage.getItem(OPEN_KEY) || '[]') as string[]).includes(code); } catch { return false; }
}

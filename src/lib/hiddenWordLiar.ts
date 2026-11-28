// 히든 워드: 라이어 — the browser side. The game itself runs in Postgres (supabase/migrations/20271205100000_hidden_word_liar.sql):
// this file only calls its RPCs, keeps this browser's secret seat key, and listens for the database's "changed" pushes
// on topic `hwl-<code>`. Chat, 👁 의심 표시 and quick reactions travel between browsers on the same channel (broadcast,
// nothing stored).
import { getSupabase } from './supabase';

export const LIAR_PATH = '/hidden-word-liar';
export const LIAR_ACCENT = '#a98bff';
export const isLiarCode = (code: string) => /^[a-z0-9]{5}$/.test(code);

export type LiarPhase = 'lobby' | 'cards' | 'clue' | 'talk' | 'vote' | 'runoff' | 'guess' | 'done' | 'closed';
export type LiarMember = {
  seat: number; name: string; playing: boolean; gone: boolean; ready: boolean; here: boolean; member: boolean;
  talked: boolean; mask: boolean; voted: boolean; pieces: number | null;
};
export type LiarClue = { n: number; seat: number; round: number; word: string | null; hot: boolean; masked: boolean; score: number | null; decoyScore: number | null };
export type LiarView = {
  code: string; kind: 'friend' | 'house'; v: number; phase: LiarPhase; now: number; deadline: number | null;
  game: number; round: number; roundsMax: number; order: number[]; turn: number | null; host: number | null;
  runoff: number[] | null; accused: number | null; liar: number | null;
  cfg: { hot: number; min: number; max: number; liarWin: number; citizenWin: number; dailyCap: number };
  me: { seat: number; playing: boolean; maskUsed: boolean; talk: 'accuse' | 'more' | null; ready: boolean; word: string | null; voted: number | null; piecesToday: number | null } | null;
  members: LiarMember[];
  talk: { accuse: number; more: number };
  clues: LiarClue[];
  votes: { stage: 'vote' | 'runoff'; seat: number; target: number }[] | null;
  result: { outcome: 'liar' | 'citizens' | 'void'; reason: string; answer: string; decoy: string; liar: number; guess: string | null; valid: boolean } | null;
};

const rpc = async <T,>(fn: string, args: Record<string, unknown>): Promise<T | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc(fn, args);
  if (error) { console.warn(fn, error.message); return null; }
  return data as T;
};

// ── this browser's seat key (a secret only this browser knows; the server keeps its hash) ──
const keyName = (code: string) => `hwl_key_${code}`;
export function seatKey(code: string) {
  try {
    let k = localStorage.getItem(keyName(code));
    if (!k) { k = crypto.randomUUID() + crypto.randomUUID(); localStorage.setItem(keyName(code), k); }
    return k;
  } catch { return `${code}-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`; }
}
export const myName = (fallback = '') => { try { return localStorage.getItem('puzzlthink_nickname') || fallback; } catch { return fallback; } };

type Err = { error?: string };
export const createLiarRoom = async (name: string) => {
  const key = crypto.randomUUID() + crypto.randomUUID();
  const res = await rpc<{ code?: string } & Err>('hwl_create', { p_key: key, p_name: name });
  if (res?.code) try { localStorage.setItem(keyName(res.code), key); } catch { /* the seat is then lost on reload */ }
  return res;
};
export const joinLiar = (code: string, name: string) => rpc<{ seat?: number } & Err>('hwl_join', { p_code: code, p_key: seatKey(code), p_name: name });
export const viewLiar = (code: string) => rpc<LiarView & Err>('hwl_view', { p_code: code, p_key: seatKey(code) });
export const leaveLiar = (code: string) => rpc('hwl_leave', { p_code: code, p_key: seatKey(code) });
export const startLiar = (code: string) => rpc<Err>('hwl_start', { p_code: code, p_key: seatKey(code) });
export const kickLiar = (code: string, seat: number) => rpc('hwl_kick', { p_code: code, p_key: seatKey(code), p_seat: seat });
export const sayClue = (code: string, word: string, mask: boolean) => rpc<{ ok?: boolean } & Err>('hwl_clue', { p_code: code, p_key: seatKey(code), p_word: word, p_mask: mask });
export const talkLiar = (code: string, choice: 'accuse' | 'more') => rpc('hwl_talk', { p_code: code, p_key: seatKey(code), p_choice: choice });
export const voteLiar = (code: string, target: number) => rpc('hwl_vote', { p_code: code, p_key: seatKey(code), p_target: target });
export const guessLiar = (code: string, word: string) => rpc<{ ok?: boolean } & Err>('hwl_guess', { p_code: code, p_key: seatKey(code), p_word: word });
export const readyLiar = (code: string, ready: boolean) => rpc('hwl_ready', { p_code: code, p_key: seatKey(code), p_ready: ready });
export const tickLiar = (code: string) => rpc('hwl_tick', { p_code: code });

export type LiarRankRow = { rank: number; nickname: string; avatar_url: string | null; liar_wins: number; citizen_wins: number; games: number; points: number; is_me: boolean };
export const liarRanking = (limit = 20) => rpc<LiarRankRow[]>('hwl_ranking', { p_limit: limit });
export const liarMyStats = () => rpc<{ liarWins: number; citizenWins: number; games: number; friendGames: number; piecesToday: number; dailyCap: number }>('hwl_my_stats', {});

// ── matchmaking queue ──
export type QueueState = { queued: boolean; ticket: string | null; now: number; waiting: number; offer: { id: string; deadline: number; accept: boolean | null } | null; room: string | null } & Err;
export const queueJoin = (name: string) => rpc<QueueState>('hwl_q_join', { p_name: name });
export const queuePing = () => rpc<QueueState>('hwl_q_ping', {});
export const queueState = () => rpc<QueueState>('hwl_q_state', {});
export const queueLeave = () => rpc('hwl_q_leave', {});
export const queueAnswer = (offer: string, accept: boolean) => rpc<QueueState>('hwl_q_answer', { p_offer: offer, p_accept: accept });

/** Similarity colour, cold blue → hot orange (the 히든 워드 scale). */
export function scoreColor(score: number | null | undefined) {
  if (score == null) return '#8a8f99';
  if (score >= 85) return '#ff5a3d';
  if (score >= 70) return '#ff9a3d';
  if (score >= 50) return '#ffd35a';
  if (score >= 30) return '#7fd0ff';
  return '#6c8cff';
}

/** Seconds left on the server's clock, corrected for this browser's clock skew. */
export const secondsLeft = (view: LiarView | null, skew: number, now: number) =>
  view?.deadline ? Math.max(0, Math.ceil((view.deadline - (now + skew)) / 1000)) : null;

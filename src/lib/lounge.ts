// Lounge chat (라운지): one site-wide room on the home page and every game page, mostly to find people for open rooms.
// Every rule (sign-in, 3 s gap, spam ban, words, personal info) is enforced by the database function
// lounge_send (supabase/migrations/20271123020000_lounge_chat.sql). The client only shows the reason.
// Messages fan out as a Realtime broadcast on the public topic 'lounge'; the last 50 come from lounge_state.
import { getSupabase } from './supabase';

export const LOUNGE_MAX_LEN = 200;
export const LOUNGE_KEEP = 50;

export type LoungeMessage = { id: number; sender: string; name: string; game: string | null; text: string; at: number };
export type LoungeBan = { until: number; reason: string };
export type LoungeState = { messages: LoungeMessage[]; me: string | null; ban: LoungeBan | null };
export type LoungeReason =
  | 'login' | 'empty' | 'long' | 'fast' | 'quota' | 'repeat' | 'banned' | 'spam'
  | 'profanity' | 'sexual' | 'phone' | 'rrn' | 'email' | 'contact' | 'link' | 'error';
export type LoungeSendResult = { ok: true; id: number } | { ok: false; reason: LoungeReason; ban: LoungeBan | null; waitMs: number | null };

const toMs = (v: unknown) => (typeof v === 'string' ? Date.parse(v) || null : null);

export const isLoungeMessage = (m: unknown): m is LoungeMessage => {
  const x = m as LoungeMessage | null;
  return !!x && typeof x.id === 'number' && typeof x.text === 'string' && typeof x.name === 'string' && typeof x.sender === 'string';
};

export async function loadLounge(): Promise<LoungeState | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('lounge_state');
  if (error || !data) return null;
  const messages = Array.isArray(data.messages) ? (data.messages as unknown[]).filter(isLoungeMessage) : [];
  const until = toMs(data.banned_until);
  return { messages, me: typeof data.me === 'string' ? data.me : null, ban: until ? { until, reason: String(data.ban_reason ?? '') } : null };
}

export async function sendLounge(text: string, game: string | null): Promise<LoungeSendResult> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, reason: 'error', ban: null, waitMs: null };
  const { data, error } = await supabase.rpc('lounge_send', { p_body: text, p_game: game });
  if (error || !data) return { ok: false, reason: error?.code === '42501' ? 'login' : 'error', ban: null, waitMs: null };
  if (data.ok) return { ok: true, id: Number(data.id) };
  const until = toMs(data.until);
  const ban = until ? { until, reason: data.reason === 'spam' ? 'repeat' : String(data.ban_reason ?? '') } : null;
  return { ok: false, reason: (data.reason as LoungeReason) ?? 'error', ban, waitMs: typeof data.wait_ms === 'number' ? data.wait_ms : null };
}

export async function reportLounge(id: number): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { data, error } = await supabase.rpc('lounge_report', { p_id: id });
  return !error && !!data?.ok;
}

// The lounge can be turned off on its own (room chat keeps its own setting). Off means no Realtime join.
const OFF_KEY = 'puzzlthink_lounge_off';
const offListeners = new Set<() => void>();
export const subscribeLoungeOff = (fn: () => void) => { offListeners.add(fn); return () => { offListeners.delete(fn); }; };
export const loungeOff = () => { try { return localStorage.getItem(OFF_KEY) === '1'; } catch { return false; } };
export const loungeOffServer = () => true; // nothing joins before the page is in the browser
export const setLoungeOff = (value: boolean) => {
  try { localStorage.setItem(OFF_KEY, value ? '1' : '0'); } catch { /* optional */ }
  offListeners.forEach((fn) => fn());
};

const subscribeVisibility = (fn: () => void) => { document.addEventListener('visibilitychange', fn); return () => document.removeEventListener('visibilitychange', fn); };
export const visibilityStore = [subscribeVisibility, () => document.visibilityState === 'visible', () => false] as const;

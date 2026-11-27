// 망각의 지뢰 items: the member's wallet and the charge for one item (supabase/migrations/20271202000000_item_spends.sql).
import type { MoItem } from './mineOblivion';
import type { MoLevel } from './mineOblivionAi';
import { getSupabase } from './supabase';

export type MoWallet = { pieces: number; black_pieces: number };
export type MoBuyError = 'signin' | 'item' | 'level' | 'match' | 'cap' | 'funds' | 'network';
export type MoBuy = { ok: boolean; error?: MoBuyError; wallet?: MoWallet };

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const wallet = (d: Record<string, unknown>): MoWallet => ({ pieces: num(d.pieces), black_pieces: num(d.black_pieces) });

export async function fetchMoWallet(): Promise<MoWallet | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('my_wallet');
  if (error || !data || typeof data !== 'object') return null;
  return wallet(data as Record<string, unknown>);
}

/** Charges one item. `nonce` is made once per tap: sending it again never charges twice. */
export async function buyMoItem(match: string, item: MoItem, level: MoLevel, move: number, nonce: string): Promise<MoBuy> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'network' };
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const { data, error } = await supabase.rpc('mo_use_item', { p_match: match, p_item: item, p_level: level, p_move: move, p_nonce: nonce });
    if (!error && data && typeof data === 'object') {
      const d = data as Record<string, unknown>;
      return { ok: d.ok === true, error: d.ok === true ? undefined : ((d.error as MoBuyError) ?? 'network'), wallet: 'pieces' in d ? wallet(d) : undefined };
    }
  }
  return { ok: false, error: 'network' };
}

export const newNonce = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID()
  : 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, () => Math.floor(Math.random() * 16).toString(16)));

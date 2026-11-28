"use client";

import { useEffect, useState } from 'react';
import { getSupabase } from './supabase';

/**
 * 피스 경쟁전 periods, as the SQL counts them (piece_period_of / piece_period_bounds / piece_period_cap):
 * 1W = every hard-AI win before 2026-11-25 00:00 KST (30 per game); from then on one week per period, starting
 * Wednesday 00:00 KST (2W = 11/25, 3W = 12/02, …), 5 per game. When a period ends its board is frozen and every
 * member's unspent pieces of it become 현자의 징표 (Sage's Tokens), 1:1, kept for good. Spending takes tokens first.
 */
const ZERO = Date.parse('2026-11-25T00:00:00+09:00');
const WEEK = 7 * 86_400_000;
export const piecePeriodOf = (t = Date.now()) => (t < ZERO ? 1 : 2 + Math.floor((t - ZERO) / WEEK));
export const piecePeriodBounds = (n: number) => ({ starts: n <= 1 ? -Infinity : ZERO + (n - 2) * WEEK, ends: ZERO + (Math.max(n, 1) - 1) * WEEK });
export const piecePeriodCap = (n: number) => (n <= 1 ? 30 : 5);
/** 현자의 징표 begin with this period (3W, 12/02): from then on every finished week's leftover pieces are tokens (piece_tokens_from_period). */
export const TOKENS_FROM_PERIOD = 3;
export const tokensBegun = (t = Date.now()) => piecePeriodOf(t) >= TOKENS_FROM_PERIOD;
/** 'M/D' in KST of a moment (the last day of a period: pass ends − 1). */
export const kstMonthDay = (t: number) => { const d = new Date(t + 9 * 3_600_000); return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`; };

/** What the server reports wherever 피스 can be spent: `pieces` is spendable (tokens + this period's pieces). */
export type Wallet = { pieces: number; tokens: number; black_pieces: number };
/** This period's pieces (what the race board ranks). */
export const periodPieces = (w: { pieces?: number | null; tokens?: number | null }) => Math.max(0, (w.pieces ?? 0) - (w.tokens ?? 0));
/** Which currency the next 피스 spend is paid in: tokens go first. */
export const payWith = (w: { tokens?: number | null }): 'token' | 'piece' => ((w.tokens ?? 0) > 0 ? 'token' : 'piece');

/** Ask every wallet on the page to reload (after a spend, or after an exchange popup). */
export const WALLET_EVENT = 'puzzlthink:wallet-changed';
export const walletChanged = () => window.dispatchEvent(new Event(WALLET_EVENT));

const toWallet = (d: unknown): Wallet | null => {
  if (!d || typeof d !== 'object') return null;
  const o = d as Record<string, unknown>;
  const n = (v: unknown) => (typeof v === 'number' ? v : Number(v) || 0);
  return { pieces: n(o.pieces), tokens: n(o.tokens), black_pieces: n(o.black_pieces) };
};

/** The signed-in member's wallet (my_wallet), reloaded on WALLET_EVENT; null until loaded or when signed out. */
export function useWallet(enabled = true) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    window.addEventListener(WALLET_EVENT, bump);
    return () => window.removeEventListener(WALLET_EVENT, bump);
  }, []);
  useEffect(() => {
    const supabase = getSupabase();
    if (!enabled || !supabase) return;
    let alive = true;
    supabase.rpc('my_wallet').then(({ data }) => { if (alive) setWallet(toWallet(data)); });
    return () => { alive = false; };
  }, [enabled, version]);
  return enabled ? wallet : null;
}
